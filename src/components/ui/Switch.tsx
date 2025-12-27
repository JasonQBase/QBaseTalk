"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked = false,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onCheckedChange?.(e.target.checked);
  };

  return (
    <label
      className={cn(
        "focus-within:ring-primary focus-within:ring-offset-background relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-offset-2",
        checked ? "bg-primary" : "bg-muted-foreground/30",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </label>
  );
}
