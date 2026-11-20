import { useEffect, useRef, type RefObject } from "react";
import { addScrollFrame } from "./scroll-loop";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Progress 0→1 as the element transits the viewport (0 = top enters, 1 = bottom leaves). */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  options?: { mode?: "transit" | "exit" },
): void {
  const reduced = useReducedMotion();
  const callbackRef = useRef(onProgress);
  callbackRef.current = onProgress;
  const mode = options?.mode ?? "transit";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      callbackRef.current(1);
      return;
    }
    return addScrollFrame(el, (viewportHeight, rect) => {
      let progress: number;
      if (mode === "exit") {
        // 0 while the section top is at/above the viewport top, 1 once fully scrolled past.
        const distance = Math.max(1, rect.height - viewportHeight);
        progress = Math.min(1, Math.max(0, -rect.top / distance));
      } else {
        const total = rect.height + viewportHeight;
        progress =
          total > 0 ? Math.min(1, Math.max(0, (viewportHeight - rect.top) / total)) : 0;
      }
      callbackRef.current(progress);
    });
  }, [ref, reduced, mode]);
}
