import {
  TEXT_SIZE_DEFAULT_STEP,
  TEXT_SIZE_SCALE_STEPS,
  applyTextSizeStep,
  formatTextSizeLabel,
  readStoredTextSizeStep,
} from "@/utils/textSize";

type TextSizeAction = "decrease" | "reset" | "increase";

class TextSizeControl extends HTMLElement {
  private decreaseButton: HTMLButtonElement | null = null;
  private resetButton: HTMLButtonElement | null = null;
  private increaseButton: HTMLButtonElement | null = null;
  private statusEl: HTMLElement | null = null;
  private currentStep = TEXT_SIZE_DEFAULT_STEP;
  private boundHandleClick = (event: Event) => this.handleClick(event);

  connectedCallback() {
    this.decreaseButton = this.querySelector('[data-action="decrease"]');
    this.resetButton = this.querySelector('[data-action="reset"]');
    this.increaseButton = this.querySelector('[data-action="increase"]');
    this.statusEl = this.querySelector("[data-status]");

    for (const button of [
      this.decreaseButton,
      this.resetButton,
      this.increaseButton,
    ]) {
      button?.addEventListener("click", this.boundHandleClick);
    }

    this.currentStep = applyTextSizeStep(readStoredTextSizeStep());
    this.syncUi();
  }

  disconnectedCallback() {
    for (const button of [
      this.decreaseButton,
      this.resetButton,
      this.increaseButton,
    ]) {
      button?.removeEventListener("click", this.boundHandleClick);
    }
  }

  private handleClick(event: Event) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLButtonElement) || target.disabled) return;

    const action = target.dataset.action as TextSizeAction | undefined;
    if (!action) return;

    if (action === "decrease") {
      this.currentStep = applyTextSizeStep(this.currentStep - 1);
    } else if (action === "increase") {
      this.currentStep = applyTextSizeStep(this.currentStep + 1);
    } else {
      this.currentStep = applyTextSizeStep(TEXT_SIZE_DEFAULT_STEP);
    }

    this.syncUi();
  }

  private syncUi() {
    const maxStep = TEXT_SIZE_SCALE_STEPS.length - 1;
    const atDefault = this.currentStep === TEXT_SIZE_DEFAULT_STEP;

    this.setButtonState(this.decreaseButton, atDefault);
    this.setButtonState(this.resetButton, atDefault);
    this.setButtonState(this.increaseButton, this.currentStep >= maxStep);

    if (this.statusEl) {
      this.statusEl.textContent = `Text size ${formatTextSizeLabel(this.currentStep)}`;
    }
  }

  private setButtonState(button: HTMLButtonElement | null, disabled: boolean) {
    if (!button) return;

    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
  }
}

export function registerTextSizeControlElement() {
  if (!customElements.get("text-size-control")) {
    customElements.define("text-size-control", TextSizeControl);
  }
}
