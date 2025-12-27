import * as React from "react";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue>({
  open: false,
  setOpen: () => {},
});

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = React.useContext(TooltipContext);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="inline-block"
    >
      {children}
    </div>
  );
}

export function TooltipContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = React.useContext(TooltipContext);

  if (!open) return null;

  return (
    <div
      className={`absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg dark:bg-gray-100 dark:text-gray-900 ${className}`}
      role="tooltip"
    >
      {children}
      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900 dark:bg-gray-100" />
    </div>
  );
}
