import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, accept = ".csv", disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    onFileSelect(file);
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-all duration-200",
        isDragging && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover-elevate cursor-pointer"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="zone-upload"
    >
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Upload Time Series Data
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <FileText className="h-3 w-3" />
              CSV files only
            </p>
          </div>

          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            id="file-upload"
            data-testid="input-file"
          />
          <label htmlFor="file-upload">
            <Button
              variant="default"
              disabled={disabled}
              className="cursor-pointer"
              asChild
              data-testid="button-upload"
            >
              <span>Choose File</span>
            </Button>
          </label>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
