import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Real-time status pill — stitch design system "Component: status pills".
 * Variants map to the reference palette:
 *  - flagship: operational emerald (featured / verified)
 *  - open:     hyper cyan (open source / live demo)
 *  - primary:  electric indigo (highlighted state)
 *  - neutral:  quiet surface (dates, metadata)
 */
export type StatusPillVariant = "flagship" | "open" | "primary" | "neutral";

const STATUS_PILL_VARIANTS: Record<StatusPillVariant, string> = {
  flagship: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  open: "border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  primary: "border-primary/40 bg-primary/10 text-primary",
  neutral: "border-border/80 bg-muted/50 text-muted-foreground",
};

export function StatusPill({
  children,
  variant = "neutral",
  beacon = false,
  className,
}: {
  children: ReactNode;
  variant?: StatusPillVariant;
  beacon?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]",
        STATUS_PILL_VARIANTS[variant],
        className,
      )}
    >
      {beacon ? <span className="status-dot !h-1.5 !w-1.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
