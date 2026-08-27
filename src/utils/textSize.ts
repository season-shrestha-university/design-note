export const TEXT_SIZE_STORAGE_KEY = "design-note:text-size-step";

export const TEXT_SIZE_SCALE_STEPS = [1, 1.125, 1.25] as const;

export const TEXT_SIZE_DEFAULT_STEP = 0;

export function formatTextSizeLabel(step: number): string {
  const scale = TEXT_SIZE_SCALE_STEPS[step] ?? TEXT_SIZE_SCALE_STEPS[0];
  return `${Math.round(scale * 100)}%`;
}

export function readStoredTextSizeStep(): number {
  try {
    const raw = localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    if (raw === null) return TEXT_SIZE_DEFAULT_STEP;

    const step = Number(raw);
    if (
      Number.isInteger(step) &&
      step >= 0 &&
      step < TEXT_SIZE_SCALE_STEPS.length
    ) {
      return step;
    }
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }

  return TEXT_SIZE_DEFAULT_STEP;
}

export function applyTextSizeStep(step: number): number {
  const clamped = Math.max(
    0,
    Math.min(step, TEXT_SIZE_SCALE_STEPS.length - 1),
  );

  document.documentElement.style.setProperty(
    "--font-scale",
    String(TEXT_SIZE_SCALE_STEPS[clamped]),
  );

  try {
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(clamped));
  } catch {
    // ignore persistence failures
  }

  return clamped;
}
