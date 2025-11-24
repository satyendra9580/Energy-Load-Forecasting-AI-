import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Main title text */
  title: string;
  /** Description text */
  description: string;
  /** Label for the action button (optional) */
  actionLabel?: string;
  /** Callback for the action button (optional) */
  onAction?: () => void;
}

/**
 * A placeholder component displayed when there is no data or content.
 * Can include an optional action button.
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="rounded-full bg-muted p-6">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="default">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
