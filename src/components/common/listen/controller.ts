const LISTEN_LABEL = "Listen to article";
const STOP_LABEL = "Stop";
const LISTEN_LANG = "en";

// speechSynthesis works in Chrome, Safari, and Edge; Firefox support is limited.
class ArticleListen extends HTMLElement {
  private button: HTMLButtonElement | null = null;
  private isSpeaking = false;
  private boundHandleClick = () => this.handleClick();

  connectedCallback() {
    if (!("speechSynthesis" in window)) {
      this.hidden = true;
      return;
    }

    this.button = this.querySelector(".article-listen__button");
    if (this.button) {
      this.button.addEventListener("click", this.boundHandleClick);
    }
  }

  disconnectedCallback() {
    window.speechSynthesis.cancel();
    if (this.button) {
      this.button.removeEventListener("click", this.boundHandleClick);
    }
  }

  private handleClick() {
    if (this.isSpeaking) {
      this.stop();
      return;
    }

    const text = document
      .querySelector("[data-listen-content]")
      ?.textContent?.trim();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LISTEN_LANG;
    utterance.onend = () => this.setSpeaking(false);
    utterance.onerror = () => this.setSpeaking(false);

    this.setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  private stop() {
    window.speechSynthesis.cancel();
    this.setSpeaking(false);
  }

  private setSpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
    if (!this.button) return;

    this.button.textContent = speaking ? STOP_LABEL : LISTEN_LABEL;
    this.button.setAttribute("aria-pressed", String(speaking));
  }
}

export function registerArticleListenElement() {
  if (!customElements.get("article-listen")) {
    customElements.define("article-listen", ArticleListen);
  }
}
