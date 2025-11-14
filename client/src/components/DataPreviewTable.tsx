import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { TimeSeriesDataPoint, DatasetInfo } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface DataPreviewTableProps {
  data: TimeSeriesDataPoint[];
  datasetInfo: DatasetInfo;
}

export function DataPreviewTable({ data, datasetInfo }: DataPreviewTableProps) {
  const previewData = data.slice(0, 100);
  
  return (
    <Card className="w-full" data-testid="card-data-preview">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Data Preview</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="font-mono text-xs">
            {datasetInfo.rowCount.toLocaleString()} rows
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {datasetInfo.frequency}
          </Badge>
          {datasetInfo.missingValues > 0 && (
            <Badge variant="destructive" className="font-mono text-xs">
              {datasetInfo.missingValues} missing
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          <div className="min-w-full">
            <table className="w-full">
              <thead className="sticky top-0 bg-card border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Load (MW)
                  </th>
                  {previewData.some(d => d.temperature !== undefined) && (
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Temperature (°C)
                    </th>
                  )}
                  {previewData.some(d => d.humidity !== undefined) && (
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Humidity (%)
                    </th>
                  )}
                  {previewData.some(d => d.solar_power !== undefined) && (
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Solar (MW)
                    </th>
                  )}
                  {previewData.some(d => d.wind_power !== undefined) && (
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Wind (MW)
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b last:border-0 hover-elevate transition-colors"
                    data-testid={`row-data-${idx}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono">
                      {format(parseISO(row.timestamp), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right">
                      {row.load.toFixed(2)}
                    </td>
                    {previewData.some(d => d.temperature !== undefined) && (
                      <td className="px-4 py-3 text-sm font-mono text-right">
                        {row.temperature?.toFixed(1) ?? '-'}
                      </td>
                    )}
                    {previewData.some(d => d.humidity !== undefined) && (
                      <td className="px-4 py-3 text-sm font-mono text-right">
                        {row.humidity?.toFixed(1) ?? '-'}
                      </td>
                    )}
                    {previewData.some(d => d.solar_power !== undefined) && (
                      <td className="px-4 py-3 text-sm font-mono text-right">
                        {row.solar_power?.toFixed(2) ?? '-'}
                      </td>
                    )}
                    {previewData.some(d => d.wind_power !== undefined) && (
                      <td className="px-4 py-3 text-sm font-mono text-right">
                        {row.wind_power?.toFixed(2) ?? '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
        {data.length > 100 && (
          <div className="px-4 py-3 border-t bg-muted/50 text-center text-sm text-muted-foreground">
            Showing first 100 of {datasetInfo.rowCount.toLocaleString()} rows
          </div>
        )}
      </CardContent>
    </Card>
  );
}
