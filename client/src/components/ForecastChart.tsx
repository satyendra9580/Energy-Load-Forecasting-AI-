import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ForecastPoint } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface ForecastChartProps {
  /** Array of forecast points containing actual and predicted values */
  data: ForecastPoint[];
  /** Title of the chart */
  title: string;
  /** ISO timestamp string of when the data was last updated */
  lastUpdated?: string;
}

/**
 * A line chart component for visualizing forecast data.
 * Displays actual load, predicted load, and confidence intervals (if available).
 * Uses Recharts for rendering.
 */
export function ForecastChart({ data, title, lastUpdated }: ForecastChartProps) {
  const chartData = data.map(point => ({
    timestamp: format(parseISO(point.timestamp), 'MM/dd HH:mm'),
    actual: point.actual_load,
    predicted: point.predicted_load,
    lowerBound: point.lower_bound,
    upperBound: point.upper_bound,
  }));

  return (
    <Card className="w-full" data-testid="card-forecast-chart">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Updated {format(parseISO(lastUpdated), 'MMM dd, yyyy HH:mm')}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="w-full aspect-video">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{ value: 'Load (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
              />
              {chartData.some(d => d.actual !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  name="Actual Load"
                />
              )}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                name="Predicted Load"
              />
              {chartData.some(d => d.lowerBound !== undefined) && (
                <>
                  <Line
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="upperBound"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Upper Bound"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
