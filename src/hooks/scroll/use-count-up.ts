import { useEffect, useRef, type RefObject } from "react";

/** Counts the span's text up to `target` when it first enters the viewport. */
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  target: number | null,
  options?: { duration?: number; suffix?: string },
): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || target === null) return;
    const { duration = 900, suffix = "" } = optionsRef.current ?? {};
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    el.textContent = `0${suffix}`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, target]);
}
