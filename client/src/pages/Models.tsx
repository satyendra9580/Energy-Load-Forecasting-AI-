import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ModelCard } from "@/components/ModelCard";
import { HorizonSelector } from "@/components/HorizonSelector";
import { ForecastChart } from "@/components/ForecastChart";
import { ModelComparisonChart } from "@/components/ModelComparisonChart";
import { ModelMetricsTable } from "@/components/ModelMetricsTable";
import { MetricsCard } from "@/components/MetricsCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner, ModelCardsLoadingSkeleton, ChartLoadingSkeleton } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Download, AlertCircle, BarChart2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ModelType, PredictRequest, PredictResponse, ModelResult } from "@shared/schema";

const models = [
  {
    type: 'naive' as ModelType,
    title: 'Naive Baseline',
    description: 'Simple baseline using last known value. Fast and efficient for establishing performance benchmarks.',
    complexity: 'low' as const,
  },
  {
    type: 'arima' as ModelType,
    title: 'ARIMA',
    description: 'Statistical time series model with autoregressive and moving average components. Good for seasonal patterns.',
    complexity: 'medium' as const,
  },
  {
    type: 'prophet' as ModelType,
    title: 'Prophet',
    description: 'Robust forecasting with trend and seasonality decomposition. Handles missing data and holidays well.',
    complexity: 'medium' as const,
  },
  {
    type: 'lstm' as ModelType,
    title: 'LSTM Neural Network',
    description: 'Deep learning model that learns complex temporal patterns. Best for non-linear relationships.',
    complexity: 'high' as const,
  },
  {
    type: 'hybrid' as ModelType,
    title: 'Hybrid Model',
    description: 'Combines Prophet and LSTM for enhanced accuracy. Leverages strengths of both statistical and deep learning.',
    complexity: 'high' as const,
  },
];

export default function Models() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('naive');
  const [horizon, setHorizon] = useState<1 | 7>(1);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if dataset is available
  const { data: hasData } = useQuery({
    queryKey: ['/api/dataset/info'],
  });

  // Mutation for training a single model
  const predictMutation = useMutation({
    mutationFn: async (request: PredictRequest) => {
      setTrainingProgress(0);
      const interval = setInterval(() => {
        setTrainingProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      try {
        const response = await apiRequest(
          'POST',
          '/api/predict',
          request
        );
        clearInterval(interval);
        setTrainingProgress(100);
        return await response.json() as PredictResponse;
      } catch (error) {
        clearInterval(interval);
        setTrainingProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success && data.result) {
        toast({
          title: "Forecast Generated",
          description: `${selectedModel.toUpperCase()} model trained successfully with MAE: ${data.result.metrics.mae.toFixed(2)} MW`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/forecast/latest'] });
        setTimeout(() => setTrainingProgress(0), 2000);
      } else {
        toast({
          title: "Forecast Failed",
          description: data.error || "Failed to generate forecast",
          variant: "destructive",
        });
        setTrainingProgress(0);
      }
    },
    onError: (error) => {
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setTrainingProgress(0);
    },
  });

  // Mutation for comparing all models
  const compareMutation = useMutation({
    mutationFn: async (horizon: 1 | 7) => {
      const response = await apiRequest(
        'POST',
        '/api/predict/all',
        { horizon }
      );
      return await response.json() as { success: boolean; results: ModelResult[] };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Comparison Generated",
          description: `Generated forecasts for all models (${horizon} day horizon)`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleTrain = () => {
    if (!hasData) {
      toast({
        title: "No Data Available",
        description: "Please upload data before training a model",
        variant: "destructive",
      });
      return;
    }

    predictMutation.mutate({ modelType: selectedModel, horizon });
  };

  const handleCompare = () => {
    if (!hasData) {
      toast({
        title: "No Data Available",
        description: "Please upload data before comparing models",
        variant: "destructive",
      });
      return;
    }

    compareMutation.mutate(horizon);
  };

  const handleDownloadForecast = () => {
    if (predictMutation.data?.result) {
      const result = predictMutation.data.result;
      const csv = [
        ['Timestamp', 'Predicted Load', 'Actual Load', 'Lower Bound', 'Upper Bound'],
        ...result.forecast.map(point => [
          point.timestamp,
          point.predicted_load,
          point.actual_load ?? '',
          point.lower_bound ?? '',
          point.upper_bound ?? '',
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast_${result.metadata.type}_${result.metadata.horizon}day.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Forecast data exported to CSV",
      });
    }
  };

  if (!hasData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Model Training</h1>
          <p className="text-muted-foreground">
            Select and train forecasting models
          </p>
        </div>

        <EmptyState
          icon={AlertCircle}
          title="No Data Uploaded"
          description="You need to upload time series data before you can train forecasting models."
          actionLabel="Upload Data"
          onAction={() => window.location.href = '/upload'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" data-testid="page-models">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Model Training</h1>
        <p className="text-muted-foreground">
          Select a forecasting model and configure prediction horizon
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Forecast Horizon</label>
            <HorizonSelector
              value={horizon}
              onChange={setHorizon}
              disabled={predictMutation.isPending}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Select Model</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map(model => (
                <ModelCard
                  key={model.type}
                  {...model}
                  isSelected={selectedModel === model.type}
                  onSelect={() => setSelectedModel(model.type)}
                  isDisabled={predictMutation.isPending}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={handleTrain}
              disabled={predictMutation.isPending}
              size="lg"
              className="gap-2"
              data-testid="button-train-model"
            >
              <Zap className="h-4 w-4" />
              {predictMutation.isPending ? 'Training...' : 'Train & Predict'}
            </Button>
            {predictMutation.data?.result && (
              <Button
                onClick={handleDownloadForecast}
                variant="outline"
                size="lg"
                className="gap-2"
                data-testid="button-download-forecast"
              >
                <Download className="h-4 w-4" />
                Download Forecast
              </Button>
            )}
            <Button
              onClick={handleCompare}
              variant="secondary"
              size="lg"
              className="gap-2"
              disabled={compareMutation.isPending || predictMutation.isPending}
            >
              <BarChart2 className="h-4 w-4" />
              {compareMutation.isPending ? 'Comparing...' : 'Compare All Models'}
            </Button>
          </div>

          {predictMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Training progress</span>
                <span className="font-medium">{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {predictMutation.isPending && (
        <LoadingSpinner message="Training model and generating forecast..." />
      )}

      {predictMutation.data?.result && !predictMutation.isPending && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              label="MAE"
              value={predictMutation.data.result.metrics.mae}
              unit="MW"
            />
            <MetricsCard
              label="RMSE"
              value={predictMutation.data.result.metrics.rmse}
              unit="MW"
            />
            <MetricsCard
              label="MAPE"
              value={predictMutation.data.result.metrics.mape}
              unit="%"
            />
            <MetricsCard
              label="Training Time"
              value={(predictMutation.data.result.metadata.trainingDuration / 1000).toFixed(2)}
              unit="seconds"
            />
          </div>

          <ForecastChart
            data={predictMutation.data.result.forecast}
            title={`${selectedModel.toUpperCase()} Forecast - ${horizon} Day${horizon > 1 ? 's' : ''}`}
            lastUpdated={predictMutation.data.result.metadata.trainedAt}
          />
        </div>
      )}

      {compareMutation.data?.results && !compareMutation.isPending && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Model Comparison</h2>
          <ModelComparisonChart
            results={compareMutation.data.results}
            title={`All Models Comparison - ${horizon} Day${horizon > 1 ? 's' : ''}`}
          />

          <ModelMetricsTable results={compareMutation.data.results} />
        </div>
      )}
    </div>
  );
}
