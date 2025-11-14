import type { TimeSeriesDataPoint, DatasetInfo } from "@shared/schema";
import Papa from "papaparse";

export function parseCSV(csvContent: string): { data: any[], columns: string[] } {
  const result = Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  return {
    data: result.data,
    columns: result.meta.fields || [],
  };
}

export function detectColumns(columns: string[]): {
  timestampCol: string | null;
  loadCol: string | null;
  temperatureCol: string | null;
  humidityCol: string | null;
} {
  const timestampCol = columns.find(col => 
    col.toLowerCase().includes('timestamp') || 
    col.toLowerCase().includes('time') ||
    col.toLowerCase().includes('date')
  ) || null;

  const loadCol = columns.find(col => 
    col.toLowerCase().includes('load') || 
    col.toLowerCase().includes('power') ||
    col.toLowerCase().includes('demand')
  ) || null;

  const temperatureCol = columns.find(col => 
    col.toLowerCase().includes('temp')
  ) || null;

  const humidityCol = columns.find(col => 
    col.toLowerCase().includes('humidity') ||
    col.toLowerCase().includes('humid')
  ) || null;

  return { timestampCol, loadCol, temperatureCol, humidityCol };
}

export function standardizeData(
  rawData: any[],
  columns: { timestampCol: string | null; loadCol: string | null; temperatureCol: string | null; humidityCol: string | null }
): TimeSeriesDataPoint[] {
  const standardized: TimeSeriesDataPoint[] = [];

  for (const row of rawData) {
    if (!columns.timestampCol || !columns.loadCol) continue;
    
    const timestamp = row[columns.timestampCol];
    const load = row[columns.loadCol];

    if (!timestamp || load === null || load === undefined) continue;

    const dataPoint: TimeSeriesDataPoint = {
      timestamp: new Date(timestamp).toISOString(),
      load: Number(load),
    };

    if (columns.temperatureCol && row[columns.temperatureCol] !== null) {
      dataPoint.temperature = Number(row[columns.temperatureCol]);
    }

    if (columns.humidityCol && row[columns.humidityCol] !== null) {
      dataPoint.humidity = Number(row[columns.humidityCol]);
    }

    standardized.push(dataPoint);
  }

  return standardized.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function fillMissingValues(data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  if (data.length === 0) return data;

  const filled = [...data];

  for (let i = 0; i < filled.length; i++) {
    if (filled[i].load === null || filled[i].load === undefined || isNaN(filled[i].load)) {
      let prevValue = null;
      let nextValue = null;

      for (let j = i - 1; j >= 0; j--) {
        if (filled[j].load !== null && !isNaN(filled[j].load)) {
          prevValue = filled[j].load;
          break;
        }
      }

      for (let j = i + 1; j < filled.length; j++) {
        if (filled[j].load !== null && !isNaN(filled[j].load)) {
          nextValue = filled[j].load;
          break;
        }
      }

      if (prevValue !== null && nextValue !== null) {
        filled[i].load = (prevValue + nextValue) / 2;
      } else if (prevValue !== null) {
        filled[i].load = prevValue;
      } else if (nextValue !== null) {
        filled[i].load = nextValue;
      }
    }
  }

  return filled;
}

export function getDatasetInfo(data: TimeSeriesDataPoint[], filename: string): DatasetInfo {
  const timestamps = data.map(d => new Date(d.timestamp).getTime());
  const diffs = [];
  for (let i = 1; i < timestamps.length; i++) {
    diffs.push(timestamps[i] - timestamps[i - 1]);
  }
  
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const frequency = avgDiff < 120000 ? '1min' : avgDiff < 3600000 ? '1hour' : 'daily';

  const columns = ['timestamp', 'load'];
  if (data.some(d => d.temperature !== undefined)) columns.push('temperature');
  if (data.some(d => d.humidity !== undefined)) columns.push('humidity');
  if (data.some(d => d.solar_power !== undefined)) columns.push('solar_power');
  if (data.some(d => d.wind_power !== undefined)) columns.push('wind_power');

  const missingValues = data.filter(d => 
    d.load === null || d.load === undefined || isNaN(d.load)
  ).length;

  return {
    filename,
    rowCount: data.length,
    startDate: data[0]?.timestamp || '',
    endDate: data[data.length - 1]?.timestamp || '',
    frequency,
    columns,
    missingValues,
    hasLoad: true,
    hasTemperature: data.some(d => d.temperature !== undefined),
    hasHumidity: data.some(d => d.humidity !== undefined),
  };
}
