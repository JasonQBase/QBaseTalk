import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: "linear" | "circular";
  size?: "sm" | "md" | "lg";
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      className,
      showLabel = false,
      variant = "linear",
      size = "md",
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    if (variant === "circular") {
      const circleSize = size === "sm" ? 80 : size === "lg" ? 140 : 110;
      const strokeWidth = size === "sm" ? 6 : size === "lg" ? 10 : 8;
      const radius = (circleSize - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;
      const strokeDashoffset =
        circumference - (percentage / 100) * circumference;

      return (
        <div
          ref={ref}
          className={cn(
            "relative inline-flex items-center justify-center",
            className
          )}
          style={{ width: circleSize, height: circleSize }}
        >
          <svg
            width={circleSize}
            height={circleSize}
            className="-rotate-90 transform"
          >
            {/* Background circle */}
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          {showLabel && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
      );
    }

    // Linear variant
    const heightClass = size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3";

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div
          className={cn(
            "glass-card w-full overflow-hidden rounded-full",
            heightClass
          )}
        >
          <div
            className={cn(
              "gradient-primary h-full rounded-full transition-all duration-500 ease-out",
              "shadow-glow"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <p className="text-muted-foreground mt-1 text-right text-xs">
            {Math.round(percentage)}%
          </p>
        )}
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
