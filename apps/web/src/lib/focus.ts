const HEADER_HEIGHT = 110;
const FOOTER_HEIGHT = 60;
const MARGIN = 16;

export function focusStep(step: number): void {
  const targets = document.querySelectorAll<HTMLElement>(`[data-focus-step~="${step}"]`);
  const target = targets[targets.length - 1];
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const visibleHeight = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
  const absoluteTop = rect.top + window.scrollY;
  const top =
    rect.height > visibleHeight - MARGIN * 2
      ? absoluteTop - HEADER_HEIGHT - MARGIN
      : absoluteTop - HEADER_HEIGHT - (visibleHeight - rect.height) / 2;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
