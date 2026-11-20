import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Code & Architecture badge tag — stitch design system "Component 4".
 * Tones map to the reference variants:
 *  - ai:   AI/ML spec (hyper cyan border + label)
 *  - core: core systems (electric indigo border + label)
 *  - prod: production verified (emerald dot prefix on a quiet chip)
 *  - default: quiet surface chip
 */
export type TechChipTone = "default" | "ai" | "core" | "prod";

export function TechChip({
  children,
  tone = "default",
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: TechChipTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant={tone === "prod" ? "default" : tone}
      className={cn(tone === "prod" && "text-foreground", className)}
    >
      {dot || tone === "prod" ? (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </Badge>
  );
}
