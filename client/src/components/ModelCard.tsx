import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, TrendingUp, Sparkles, Zap, GitMerge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelType } from "@shared/schema";

interface ModelCardProps {
  type: ModelType;
  title: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}

const modelIcons = {
  naive: TrendingUp,
  arima: Cpu,
  prophet: Sparkles,
  lstm: Zap,
  hybrid: GitMerge,
};

const complexityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function ModelCard({ type, title, description, complexity, isSelected, onSelect, isDisabled }: ModelCardProps) {
  const Icon = modelIcons[type];
  
  return (
    <Card 
      className={cn(
        "hover-elevate active-elevate-2 transition-all duration-200 cursor-pointer",
        isSelected && "border-2 border-primary",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !isDisabled && onSelect()}
      data-testid={`card-model-${type}`}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <Badge className={cn("text-xs font-medium", complexityColors[complexity])}>
            {complexity}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm mt-2 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          disabled={isDisabled}
          data-testid={`button-select-${type}`}
        >
          {isSelected ? "Selected" : "Select Model"}
        </Button>
      </CardContent>
    </Card>
  );
}
