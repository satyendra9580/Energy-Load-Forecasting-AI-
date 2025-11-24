import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadZone } from "@/components/UploadZone";
import { DataPreviewTable } from "@/components/DataPreviewTable";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, CheckCircle, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResponse } from "@shared/schema";
import Papa from "papaparse";

/**
 * Page component for uploading and processing CSV data.
 * Handles file selection, upload to server, and displays data preview.
 */
export default function Upload() {
  const [uploadedData, setUploadedData] = useState<UploadResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json() as Promise<UploadResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        setUploadedData(data);
        toast({
          title: "Upload Successful",
          description: `Loaded ${data.datasetInfo?.rowCount.toLocaleString()} data points`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/dataset/info'] });
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Failed to process CSV file",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleProcessData = () => {
    toast({
      title: "Data Ready",
      description: "Your data has been preprocessed and is ready for modeling",
    });
    setTimeout(() => {
      window.location.href = '/models';
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" data-testid="page-upload">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Upload Data</h1>
        <p className="text-muted-foreground">
          Upload your time series energy load data in CSV format
        </p>
      </div>

      {uploadMutation.isPending && (
        <LoadingSpinner message="Processing CSV file..." />
      )}

      {!uploadMutation.isPending && !uploadedData && (
        <UploadZone onFileSelect={handleFileSelect} />
      )}

      {uploadedData?.success && uploadedData.datasetInfo && uploadedData.preview && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                File uploaded successfully
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {uploadedData.datasetInfo.filename} • {uploadedData.datasetInfo.rowCount.toLocaleString()} rows • {uploadedData.datasetInfo.frequency}
              </p>
            </div>
            <Button
              onClick={() => {
                setUploadedData(null);
                uploadMutation.reset();
              }}
              variant="ghost"
              size="sm"
              data-testid="button-upload-another"
            >
              Upload Another
            </Button>
          </div>

          <DataPreviewTable
            data={uploadedData.preview}
            datasetInfo={uploadedData.datasetInfo}
          />

          <div className="flex items-center justify-between p-6 bg-card rounded-lg border">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to Continue?</h3>
              <p className="text-sm text-muted-foreground">
                Your data has been validated and preprocessed. You can now proceed to model training.
              </p>
            </div>
            <Button
              onClick={handleProcessData}
              size="lg"
              className="gap-2"
              data-testid="button-proceed-models"
            >
              Proceed to Models
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
