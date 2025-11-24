import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HorizonSelectorProps {
  /** Currently selected horizon in days */
  value: 1 | 7;
  /** Callback when horizon changes */
  onChange: (value: 1 | 7) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * A toggle component for selecting the forecast horizon (1 day or 7 days).
 */
export function HorizonSelector({ value, onChange, disabled }: HorizonSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg" data-testid="selector-horizon">
      <Button
        variant={value === 1 ? "default" : "ghost"}
        className={cn(
          "transition-all duration-200",
          value === 1 && "shadow-sm"
        )}
        onClick={() => onChange(1)}
        disabled={disabled}
        data-testid="button-horizon-1day"
      >
        1 Day (24h)
      </Button>
      <Button
        variant={value === 7 ? "default" : "ghost"}
        className={cn(
          "transition-all duration-200",
          value === 7 && "shadow-sm"
        )}
        onClick={() => onChange(7)}
        disabled={disabled}
        data-testid="button-horizon-7days"
      >
        7 Days (168h)
      </Button>
    </div>
  );
}
