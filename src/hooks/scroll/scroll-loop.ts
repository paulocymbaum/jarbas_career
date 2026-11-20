type FrameCallback = (viewportHeight: number, rect: DOMRect) => void;

const subscriptions = new Map<HTMLElement, FrameCallback>();
let rafId = 0;

function tick(): void {
  const viewportHeight = window.innerHeight;
  subscriptions.forEach((callback, el) => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < -240 || rect.top > viewportHeight + 240) return;
    callback(viewportHeight, rect);
  });
  rafId = requestAnimationFrame(tick);
}

/** Subscribe an element to the shared scroll rAF loop (runs while the element is near the viewport). */
export function addScrollFrame(el: HTMLElement, callback: FrameCallback): () => void {
  const wasEmpty = subscriptions.size === 0;
  subscriptions.set(el, callback);
  if (wasEmpty) rafId = requestAnimationFrame(tick);
  return () => {
    subscriptions.delete(el);
    if (subscriptions.size === 0) cancelAnimationFrame(rafId);
  };
}
