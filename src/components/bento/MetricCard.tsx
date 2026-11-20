import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Bento Proof Metrics Counter — stitch design system "Component 2".
 *
 * Structure:
 *  - top row: micro-label (label-caps) paired with a live tertiary status beacon
 *  - metric core: prominent metric-display number
 *  - subtitle: delta tag (emerald) + body-sm description
 */
export type MetricCardProps = {
  label: string;
  value: ReactNode;
  /** Small unit rendered after the value (e.g. "yrs", "systems"). */
  suffix?: string;
  /** Delta/verification tag line. */
  delta?: ReactNode;
  /** Delta tone: "up" = operational emerald, "info" = electric indigo. */
  deltaTone?: "up" | "info";
  /** Long-form description under the delta tag. */
  description?: ReactNode;
  /** Show the live status beacon next to the label. */
  beacon?: boolean;
  /** Optional wrap link (makes the whole card clickable). */
  href?: string;
  /** Analytics id forwarded to the wrap link. */
  analyticsId?: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  suffix,
  delta,
  deltaTone = "up",
  description,
  beacon = false,
  href,
  analyticsId,
  className,
}: MetricCardProps) {
  const card = (
    <div className={cn("bento-panel h-full p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="label-caps">{label}</p>
        {beacon ? <span className="status-dot" aria-hidden="true" /> : null}
      </div>
      <p className="metric-display mt-3 text-foreground">
        {value}
        {suffix ? (
          <span className="ml-1.5 align-baseline font-sans text-base font-medium tracking-normal text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </p>
      {delta ? (
        <p
          className={cn(
            "mt-2 font-mono text-[11px] font-semibold",
            deltaTone === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-primary",
          )}
        >
          {delta}
        </p>
      ) : null}
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        data-analytics-id={analyticsId}
      >
        {card}
      </a>
    );
  }

  return card;
}
