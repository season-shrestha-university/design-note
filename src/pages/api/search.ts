export const prerender = false;

import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';
import { cosineSimilarity } from '../../utils/similarity';
import searchIndex from '../../data/search-index.json';

interface SearchEntry {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  embedding: number[];
}

const typedSearchIndex = searchIndex as SearchEntry[];

const apiKey = import.meta.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  if (!ai) {
    console.warn('GEMINI_API_KEY environment variable is not set. Cannot run AI search.');
    return new Response(JSON.stringify([]), { status: 200 });
  }

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: query,
    });
    const queryEmbedding = response.embeddings?.[0]?.values;

    if (!queryEmbedding) {
      throw new Error("No embedding values returned from API");
    }

    const results = typedSearchIndex.map(article => {
      const score = cosineSimilarity(queryEmbedding, article.embedding);
      return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        slug: article.slug,
        score: score
      };
    });

    const sortedResults = results
      .filter(item => item.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return new Response(JSON.stringify(sortedResults), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
  }
};
