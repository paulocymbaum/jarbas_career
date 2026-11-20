import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { trackFilterChange } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Interactive Role-Switcher Pill Bar — stitch design system "Component 1".
 *
 * Floating horizontal capsule with a glowing sliding indicator.
 * Selected state: electric indigo pill (bg #2563eb) with
 * `0 0 16px rgba(37,99,235,0.5)` glow, monospaced labels.
 *
 * Accessibility: `role="radiogroup"` with roving tabindex and
 * ArrowLeft/ArrowRight navigation.
 */
export type RoleSwitcherItem = {
  id: string;
  label: string;
};

export type RoleSwitcherProps = {
  items: RoleSwitcherItem[];
  value: string;
  onChange: (id: string) => void;
  /** Visible micro-label rendered before the capsule (e.g. "FOCUS AREAS"). */
  prefix?: string;
  ariaLabel: string;
  /** Prefix for data-analytics-id on each segment: `${analyticsPrefix}-${item.id}`. */
  analyticsPrefix?: string;
  className?: string;
};

export function RoleSwitcher({
  items,
  value,
  onChange,
  prefix,
  ariaLabel,
  analyticsPrefix,
  className,
}: RoleSwitcherProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const active = itemRefs.current.get(value);
    if (!active) return;
    const left = active.offsetLeft;
    const width = active.offsetWidth;
    setIndicator((prev) =>
      prev.ready && prev.left === left && prev.width === width
        ? prev
        : { left, width, ready: true },
    );
  }, [value]);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure, items]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const currentIndex = items.findIndex((item) => item.id === value);
    if (currentIndex === -1) return;
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    const next = items[nextIndex];
    onChange(next.id);
    itemRefs.current.get(next.id)?.focus();
  };

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2", className)}>
      {prefix ? <span className="label-caps">{prefix}</span> : null}
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="relative inline-flex min-w-0 max-w-full items-center overflow-x-auto rounded-full border border-border/70 bg-muted/40 p-1 [scrollbar-width:thin] backdrop-blur-md"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-1 left-0 rounded-full bg-primary shadow-[0_0_16px_rgba(37,99,235,0.5)] transition-[transform,width] duration-300 ease-out",
            indicator.ready ? "opacity-100" : "opacity-0",
          )}
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
          }}
        />
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(item.id, el);
                } else {
                  itemRefs.current.delete(item.id);
                }
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              data-analytics-id={analyticsPrefix ? `${analyticsPrefix}-${item.id}` : undefined}
              onClick={(event) => {
                onChange(item.id);
                trackFilterChange(
                  analyticsPrefix ?? ariaLabel,
                  item.id,
                  { nativeEvent: event.nativeEvent, currentTarget: event.currentTarget },
                );
              }}
              className={cn(
                "relative z-10 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
                selected
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
