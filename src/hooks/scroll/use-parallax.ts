import { useEffect, type RefObject } from "react";
import { addScrollFrame } from "./scroll-loop";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Drifts the element vertically against scroll at the given depth (0.35 / 0.6 / 1.2). */
export function useParallax(ref: RefObject<HTMLElement | null>, depth = 0.5): void {
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const factor = window.innerWidth < 1024 ? 0.5 : 1;
    return addScrollFrame(el, (viewportHeight, rect) => {
      const centerDelta = rect.top + rect.height / 2 - viewportHeight / 2;
      const y = -centerDelta * depth * factor * 0.04;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  }, [ref, depth, reduced]);
}
