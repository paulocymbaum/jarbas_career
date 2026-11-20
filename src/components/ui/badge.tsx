import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium leading-4 transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-border/80 bg-muted/60 text-muted-foreground hover:border-foreground/25 hover:text-foreground",
        outline: "border-border text-foreground",
        /* AI/ML spec chip — hyper cyan. */
        ai: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        /* Core systems chip — electric indigo. */
        core: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        /* Production verified chip — operational emerald. */
        prod: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
