import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ModelResult } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface ModelComparisonChartProps {
    results: ModelResult[];
    title: string;
}

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function ModelComparisonChart({ results, title }: ModelComparisonChartProps) {
    if (!results.length) return null;

    // Use the first result to get timestamps and actual load (assuming all models predict for the same timestamps)
    // Ideally, we should merge based on timestamps, but for this specific app, they are aligned.
    const baseForecast = results[0].forecast;

    const chartData = baseForecast.map((point, index) => {
        const dataPoint: any = {
            timestamp: format(parseISO(point.timestamp), 'MM/dd HH:mm'),
            actual: point.actual_load,
        };

        results.forEach((result) => {
            // Find the corresponding point in this model's forecast
            // Assuming aligned indices for simplicity as they are generated from same test set
            const modelPoint = result.forecast[index];
            if (modelPoint) {
                dataPoint[result.metadata.type] = modelPoint.predicted_load;
            }
        });

        return dataPoint;
    });

    return (
        <Card className="w-full" data-testid="card-comparison-chart">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
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

                            {/* Actual Load */}
                            {chartData.some(d => d.actual !== undefined) && (
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="hsl(var(--foreground))"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Actual Load"
                                />
                            )}

                            {/* Model Predictions */}
                            {results.map((result, index) => (
                                <Line
                                    key={result.metadata.type}
                                    type="monotone"
                                    dataKey={result.metadata.type}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    name={`${result.metadata.type.toUpperCase()} Prediction`}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
