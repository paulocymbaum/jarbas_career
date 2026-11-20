import { useEffect, type RefObject } from "react";
import { addScrollFrame } from "./scroll-loop";

/**
 * Pins the section and scrubs the track horizontally with scroll (desktop, motion-safe).
 * Expected markup: section (height > viewport) → sticky viewport frame → horizontal track.
 * Also drives the `.fx-pin-readout` text, `.fx-pin-bar` fill and per-card rotateY entries.
 */
export function useHorizontalPin(
  sectionRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  panelCount = 5,
): void {
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || !enabled) return;
    return addScrollFrame(section, (viewportHeight, rect) => {
      const distance = Math.max(1, rect.height - viewportHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const overflow = Math.max(0, track.scrollWidth - window.innerWidth + 48);
      track.style.transform = `translate3d(${(-progress * overflow).toFixed(1)}px, 0, 0)`;

      const readout = section.querySelector<HTMLElement>(".fx-pin-readout");
      if (readout) {
        const current = Math.min(panelCount, Math.floor(progress * panelCount) + 1);
        readout.textContent = `${String(current).padStart(2, "0")} — ${String(panelCount).padStart(2, "0")}`;
      }
      const bar = section.querySelector<HTMLElement>(".fx-pin-bar");
      if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;

      for (const card of Array.from(track.children) as HTMLElement[]) {
        const cardRect = card.getBoundingClientRect();
        const enter = Math.min(
          1,
          Math.max(0, (window.innerWidth - cardRect.left) / (window.innerWidth * 0.3)),
        );
        card.style.transform = `perspective(1200px) rotateY(${((1 - enter) * 8).toFixed(2)}deg) scale(${(0.96 + enter * 0.04).toFixed(3)})`;
      }
    });
  }, [sectionRef, trackRef, enabled, panelCount]);
}
