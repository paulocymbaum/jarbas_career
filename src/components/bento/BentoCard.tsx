import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * High-Density Bento Card — stitch design system "Component 6".
 *
 * Structure:
 *  - header: monospace breadcrumb (path/to/module.ts) + real-time status pills
 *  - body:   free canvas (descriptions, chips, demos)
 *  - footer: crisp border-top separator for verifiable impact links
 *
 * The card itself is a level-1 bento surface (`.bento-panel`).
 */
export type BentoCardProps = {
  id?: string;
  /** Monospace metadata line above the title (repo path, company, module path). */
  breadcrumb?: ReactNode;
  /** Small icon rendered before the breadcrumb. */
  icon?: ReactNode;
  /** Right-aligned status pill stack. */
  pills?: ReactNode;
  /** Card headline. */
  title?: ReactNode;
  /** Heading tag for the title slot (default h3). */
  headingLevel?: "h2" | "h3" | "h4";
  /** Body canvas. */
  children?: ReactNode;
  /** Bottom row rendered under a border-top separator. */
  footer?: ReactNode;
  /** Enable the cursor-proximity spotlight hover state. */
  hover?: boolean;
  /** Control padding: "default" (p-5 sm:p-6), "compact" (p-4 sm:p-5) or "none" (caller decides). */
  padding?: "default" | "compact" | "none";
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

const HEADING_TAGS = {
  h2: "h2",
  h3: "h3",
  h4: "h4",
} as const;

export function BentoCard({
  id,
  breadcrumb,
  icon,
  pills,
  title,
  headingLevel = "h3",
  children,
  footer,
  hover = false,
  padding = "default",
  className,
  titleClassName,
  bodyClassName,
  footerClassName,
}: BentoCardProps) {
  const Heading = HEADING_TAGS[headingLevel];
  const hasHeader = Boolean(breadcrumb || icon || title || pills);

  return (
    <div
      id={id}
      className={cn(
        "bento-panel flex min-w-0 flex-col",
        padding === "default" && "p-5 sm:p-6",
        padding === "compact" && "p-4 sm:p-5",
        hover && "bento-panel-hover",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {breadcrumb || icon ? (
              <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/80">
                {icon}
                <span className="truncate">{breadcrumb}</span>
              </p>
            ) : null}
            {title ? (
              <Heading
                className={cn(
                  "text-lg font-semibold leading-6 tracking-[-0.02em]",
                  titleClassName,
                )}
              >
                {title}
              </Heading>
            ) : null}
          </div>
          {pills ? (
            <div className="flex shrink-0 flex-col items-end gap-1">{pills}</div>
          ) : null}
        </div>
      ) : null}

      {children ? (
        <div className={cn("mt-3 min-w-0 flex-1", bodyClassName)}>{children}</div>
      ) : null}

      {footer ? (
        <div
          className={cn(
            "mt-3 shrink-0 border-t border-border/60 pt-3",
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
