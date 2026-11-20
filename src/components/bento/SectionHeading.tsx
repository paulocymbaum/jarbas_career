import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { copySubtitleClass } from "@/lib/panel";

/**
 * Section heading — stitch design system header pattern:
 * label-caps eyebrow over a bold display headline, with an optional
 * trailing action (mono link, switcher, button) aligned to the baseline.
 */
export type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Trailing content (link / control) aligned to the headline row. */
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="label-caps">{eyebrow}</p> : null}
        <h2
          id={id}
          className={cn(
            "text-[1.75rem] font-semibold leading-[2.125rem] tracking-[-0.02em]",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={cn("mt-2 text-base leading-7 text-muted-foreground", copySubtitleClass)}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
