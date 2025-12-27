import { Card } from "./Card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card variant="default" className={cn("py-12 text-center", className)}>
      {icon && (
        <div className="mb-4 flex justify-center opacity-50">{icon}</div>
      )}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground mx-auto mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      )}
    </Card>
  );
}
