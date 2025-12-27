import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

const Modal = ({
  open = false,
  onOpenChange,
  children,
  title,
  description,
  footer,
  className,
}: ModalProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={cn(
          "glass-card animate-slide-up relative z-10 mx-4 w-full max-w-lg p-6",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="icon"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => onOpenChange?.(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        {(title || description) && (
          <div className="mb-4 pr-8">
            {title && <h2 className="mb-2 text-2xl font-semibold">{title}</h2>}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="mb-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
Modal.displayName = "Modal";

export { Modal };
