import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./use-reduced-motion";

type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  duration?: number;
  translateY?: number;
};

export function useScrollReveal<T extends HTMLElement>({
  threshold = 0,
  rootMargin = "0px",
  delay = 0,
  duration = 600,
  translateY = 28,
}: RevealOptions = {}) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      node.style.opacity = "1";
      node.style.transform = "none";
      return;
    }

    node.style.opacity = "0";
    node.style.transform = `translateY(${translateY}px)`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        animate(node, {
          opacity: [0, 1],
          translateY: [translateY, 0],
          duration,
          delay,
          ease: "outCubic",
        });

        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, duration, reducedMotion, rootMargin, threshold, translateY]);

  return ref;
}

export function useAnimeEnter<T extends HTMLElement>(
  deps: unknown[] = [],
  {
    translateY = 8,
    scale = 0.98,
    duration = 380,
  }: {
    translateY?: number;
    scale?: number;
    duration?: number;
  } = {},
) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      node.style.opacity = "1";
      node.style.transform = "none";
      return;
    }

    node.style.opacity = "0";
    node.style.transform = `translateY(${translateY}px) scale(${scale})`;

    animate(node, {
      opacity: [0, 1],
      translateY: [translateY, 0],
      scale: [scale, 1],
      duration,
      ease: "outCubic",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, reducedMotion, scale, translateY, ...deps]);

  return ref;
}

export function useStaggerReveal(
  selector: string,
  deps: unknown[] = [],
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(selector);
    if (!items.length) return;

    if (reducedMotion) {
      items.forEach((item) => {
        (item as HTMLElement).style.opacity = "1";
        (item as HTMLElement).style.transform = "none";
      });
      return;
    }

    items.forEach((item) => {
      (item as HTMLElement).style.opacity = "0";
      (item as HTMLElement).style.transform = "translateY(20px)";
    });

    animate(items, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(80, { start: 100 }),
      duration: 500,
      ease: "outCubic",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, selector, ...deps]);

  return containerRef;
}
