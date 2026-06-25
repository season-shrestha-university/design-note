import { MAX_RESULTS, MIN_QUERY_LENGTH, SEARCH_DEBOUNCE_MS } from "./constants";
import { searchLocalMetadata } from "./fuzzy";
import { renderResultsHtml } from "./render";
import type { AiSearchResult, PagefindResult, SearchMetadata } from "./types";

class AstroSearch extends HTMLElement {
  private input: HTMLInputElement | null = null;
  private status: HTMLDivElement | null = null;
  private results: HTMLUListElement | null = null;
  private debounceTimer: number | undefined;
  private pagefind: any = null;
  private isPagefindUnavailable = false;
  private metadata: SearchMetadata[] = [];
  private searchGeneration = 0;
  private abortController: AbortController | null = null;
  private boundHandleInput = () => this.handleInput();

  async connectedCallback() {
    this.input = this.querySelector(".search-input");
    this.status = this.querySelector(".search-status");
    this.results = this.querySelector(".search-results");

    const metadataAttr = this.getAttribute("data-metadata");
    if (metadataAttr) {
      try {
        this.metadata = JSON.parse(metadataAttr);
      } catch (error) {
        console.error("Failed to parse search metadata", error);
      }
    }

    if (this.input) {
      this.input.addEventListener("input", this.boundHandleInput);
    }
  }

  disconnectedCallback() {
    clearTimeout(this.debounceTimer);
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.input) {
      this.input.removeEventListener("input", this.boundHandleInput);
    }
  }

  private async initPagefind() {
    if (!this.pagefind && !this.isPagefindUnavailable) {
      try {
        // @ts-ignore
        const pagefindPath = "/pagefind/pagefind.js";
        this.pagefind = await import(/* @vite-ignore */ pagefindPath);
        await this.pagefind.init();
      } catch (error) {
        console.warn(
          "Pagefind index is not available. Falling back to semantic search API.",
        );
        this.isPagefindUnavailable = true;
      }
    }
  }

  private handleInput() {
    clearTimeout(this.debounceTimer);
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    const query = this.input?.value.trim() || "";

    if (query.length < MIN_QUERY_LENGTH) {
      this.clearAll();
      return;
    }

    this.debounceTimer = window.setTimeout(
      () => this.runSearch(query),
      SEARCH_DEBOUNCE_MS,
    );
  }

  private async runSearch(query: string) {
    const generation = ++this.searchGeneration;
    const isStale = () => generation !== this.searchGeneration;

    this.updateStatus("Searching...");

    await this.initPagefind();
    if (isStale()) return;

    if (this.pagefind) {
      const search = await this.pagefind.search(query);
      if (isStale()) return;

      if (search.results.length > 0) {
        this.updateStatus(`Found ${search.results.length} matches`);
        const topResults = search.results.slice(0, MAX_RESULTS);
        const loadedResults = await Promise.all(
          topResults.map((result: any) => result.data()),
        );
        if (isStale()) return;
        this.renderResults(loadedResults, false);
        return;
      }
    }

    const localResults = searchLocalMetadata(this.metadata, query);
    if (isStale()) return;
    if (localResults.length > 0) {
      this.updateStatus(`Found ${localResults.length} matches`);
      this.renderResults(localResults, false);
      return;
    }

    this.updateStatus("No exact matches. Asking AI to find recommendations...");

    this.abortController = new AbortController();
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: this.abortController.signal,
      });
      if (isStale()) return;

      const data = await res.json();

      if (!res.ok) {
        this.updateStatus(
          res.status === 429
            ? "Too many searches. Please try again later."
            : "Search request failed.",
        );
        this.clearResults();
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        this.updateStatus("No articles found matching your query.");
        this.clearResults();
        return;
      }

      this.updateStatus("AI Recommendations:");
      this.renderResults(data as AiSearchResult[], true);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (isStale()) return;
      this.updateStatus("Search request failed.");
      console.error(error);
    } finally {
      this.abortController = null;
    }
  }

  private updateStatus(text: string) {
    if (this.status) this.status.innerText = text;
  }

  private clearResults() {
    if (this.results) this.results.replaceChildren();
  }

  private clearAll() {
    this.clearResults();
    if (this.status) this.status.innerText = "";
  }

  private renderResults(
    articles: PagefindResult[] | AiSearchResult[],
    isAI: boolean,
  ) {
    if (!this.results) return;
    this.results.innerHTML = renderResultsHtml(articles, isAI);
  }
}

export function registerSearchElement() {
  if (!customElements.get("astro-search")) {
    customElements.define("astro-search", AstroSearch);
  }
}
