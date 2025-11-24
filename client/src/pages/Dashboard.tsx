import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MetricsCard } from "@/components/MetricsCard";
import { ForecastChart } from "@/components/ForecastChart";
import { ModelComparisonChart } from "@/components/ModelComparisonChart";
import { ModelMetricsTable } from "@/components/ModelMetricsTable";
import { HorizonSelector } from "@/components/HorizonSelector";
import { EmptyState } from "@/components/EmptyState";
import { MetricsLoadingSkeleton, ChartLoadingSkeleton } from "@/components/LoadingState";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import type { ModelResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  // State for the forecast horizon (1 or 7 days)
  const [horizon, setHorizon] = useState<1 | 7>(1);

  // Fetch the latest single model forecast result
  const { data: latestResult, isLoading: isLatestLoading } = useQuery<ModelResult>({
    queryKey: ['/api/forecast/latest'],
  });

  // Fetch comparison data for all models based on the selected horizon
  const { data: comparisonData, isLoading: isComparisonLoading } = useQuery<{ success: boolean; results: ModelResult[] }>({
    queryKey: ['/api/predict/all', { horizon }],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/predict/all', { horizon });
      return response.json();
    },
    // Only fetch if we have a latest result (implying data exists)
    enabled: !!latestResult,
  });

  const isLoading = isLatestLoading || isComparisonLoading;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Energy load forecasting analytics and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsLoadingSkeleton />
        </div>

        <ChartLoadingSkeleton />
      </div>
    );
  }

  if (!latestResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Energy load forecasting analytics and metrics</p>
        </div>

        <EmptyState
          icon={BarChart3}
          title="No Forecasts Available"
          description="Upload data and train a model to see forecasting results and analytics on your dashboard."
          actionLabel="Get Started"
          onAction={() => window.location.href = '/upload'}
        />
      </div>
    );
  }

  const { metadata, metrics, forecast } = latestResult;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" data-testid="page-dashboard">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Energy load forecasting analytics and metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          label="MAE"
          value={metrics.mae}
          unit="MW"
        />
        <MetricsCard
          label="RMSE"
          value={metrics.rmse}
          unit="MW"
        />
        <MetricsCard
          label="MAPE"
          value={metrics.mape}
          unit="%"
        />
        <MetricsCard
          label="Data Points"
          value={metadata.dataPoints.toLocaleString()}
        />
      </div>

      {/* Latest Forecast Chart */}
      <ForecastChart
        data={forecast}
        title={`Latest Forecast (${metadata.type.toUpperCase()}) - ${metadata.horizon} Day${metadata.horizon > 1 ? 's' : ''}`}
        lastUpdated={metadata.trainedAt}
      />

      {/* Model Comparison Section */}
      {comparisonData?.results && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Model Comparison ({horizon} Day Horizon)</h2>
            <div className="w-full sm:w-auto">
              <HorizonSelector value={horizon} onChange={setHorizon} />
            </div>
          </div>
          <ModelComparisonChart
            results={comparisonData.results}
            title={`All Models Comparison - ${horizon} Day${horizon > 1 ? 's' : ''}`}
          />
          <ModelMetricsTable results={comparisonData.results} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-lg border space-y-4">
          <h3 className="text-lg font-semibold">Latest Model Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Model Type</span>
              <span className="text-sm font-medium font-mono uppercase">{metadata.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Forecast Horizon</span>
              <span className="text-sm font-medium">{metadata.horizon} Day{metadata.horizon > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Training Duration</span>
              <span className="text-sm font-medium">{(metadata.trainingDuration / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Features Used</span>
              <span className="text-sm font-medium">{metadata.features.length}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border space-y-4">
          <h3 className="text-lg font-semibold">Latest Performance Metrics</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Mean Absolute Error</span>
                <span className="text-sm font-medium font-mono">{metrics.mae.toFixed(2)} MW</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min((metrics.mae / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Root Mean Square Error</span>
                <span className="text-sm font-medium font-mono">{metrics.rmse.toFixed(2)} MW</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min((metrics.rmse / 150) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Mean Absolute % Error</span>
                <span className="text-sm font-medium font-mono">{metrics.mape.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min(metrics.mape, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
