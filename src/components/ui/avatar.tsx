/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { cn } from "@/lib/utils";

const AvatarContext = React.createContext<{
  loaded: boolean;
  setLoaded: (v: boolean) => void;
} | null>(null);

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <AvatarContext.Provider value={{ loaded, setLoaded }}>
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext);

  // If no context, just render img
  if (!ctx)
    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full", className)}
        alt={alt || "Avatar"}
        {...props}
      />
    );

  return (
    <img
      ref={ref}
      className={cn(
        "aspect-square h-full w-full",
        className,
        !ctx.loaded && "hidden"
      )}
      onLoad={() => ctx.setLoaded(true)}
      onError={() => ctx.setLoaded(false)}
      alt={alt || "Avatar"}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext);

  if (ctx?.loaded) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "bg-muted flex h-full w-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
