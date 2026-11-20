import { useEffect, useRef, type MutableRefObject } from "react";

/** Adds `fx-in-view` to the element (and its `.fx-reveal` children) on first view. */
export function useReveal<T extends HTMLElement>(): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("fx-in-view");
      el.querySelectorAll(".fx-reveal").forEach((child) => child.classList.add("fx-in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("fx-in-view");
        }
        if (entries.some((entry) => entry.isIntersecting)) io.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    el.querySelectorAll(".fx-reveal").forEach((child) => io.observe(child));
    return () => io.disconnect();
  }, []);
  return ref;
}
