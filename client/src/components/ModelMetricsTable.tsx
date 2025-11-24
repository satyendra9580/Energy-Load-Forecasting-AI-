import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelResult } from "@shared/schema";

interface ModelMetricsTableProps {
    results: ModelResult[];
}

export function ModelMetricsTable({ results }: ModelMetricsTableProps) {
    if (!results.length) return null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Model Type</TableHead>
                            <TableHead className="text-right">MAE (MW)</TableHead>
                            <TableHead className="text-right">RMSE (MW)</TableHead>
                            <TableHead className="text-right">MAPE (%)</TableHead>
                            <TableHead className="text-right">Training Time (s)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((result) => (
                            <TableRow key={result.metadata.type}>
                                <TableCell className="font-medium capitalize">
                                    {result.metadata.type}
                                </TableCell>
                                <TableCell className="text-right">
                                    {result.metrics.mae.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {result.metrics.rmse.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {result.metrics.mape.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {(result.metadata.trainingDuration / 1000).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
