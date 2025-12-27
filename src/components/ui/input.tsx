import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
              {icon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "glass-card flex h-12 w-full rounded-xl px-4 py-2 text-sm transition-all",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              icon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-destructive animate-slide-up mt-1 text-xs">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
