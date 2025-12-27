import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        beginner: "bg-green-500/20 text-green-400 border border-green-500/30",
        intermediate:
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        advanced: "bg-red-500/20 text-red-400 border border-red-500/30",
        primary: "bg-primary/20 text-primary border border-primary/30",
        secondary:
          "bg-secondary/20 text-secondary-foreground border border-secondary/30",
        accent: "bg-accent/20 text-accent border border-accent/30",
        default: "glass border border-white/20",
        outline: "text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
