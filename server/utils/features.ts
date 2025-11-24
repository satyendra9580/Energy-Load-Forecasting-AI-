import type { TimeSeriesDataPoint, ProcessedDataPoint } from "@shared/schema";

/**
 * Generates features for machine learning models.
 * Adds time-based features (hour, day, month), cyclical encodings (sin/cos),
 * lag features, and rolling averages.
 */
export function engineerFeatures(data: TimeSeriesDataPoint[]): ProcessedDataPoint[] {
  const processed: ProcessedDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const date = new Date(point.timestamp);

    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const hourRadians = (2 * Math.PI * hour) / 24;
    const dayRadians = (2 * Math.PI * dayOfWeek) / 7;
    const monthRadians = (2 * Math.PI * month) / 12;

    const processedPoint: ProcessedDataPoint = {
      ...point,
      hour,
      day_of_week: dayOfWeek,
      month,
      is_weekend: isWeekend,
      hour_sin: Math.sin(hourRadians),
      hour_cos: Math.cos(hourRadians),
      day_sin: Math.sin(dayRadians),
      day_cos: Math.cos(dayRadians),
      month_sin: Math.sin(monthRadians),
      month_cos: Math.cos(monthRadians),
    };

    if (i >= 1) {
      processedPoint.lag_1 = data[i - 1].load;
    }

    if (i >= 24) {
      processedPoint.lag_24 = data[i - 24].load;
    }

    if (i >= 168) {
      processedPoint.lag_168 = data[i - 168].load;
    }

    if (i >= 2) {
      const window3 = data.slice(Math.max(0, i - 2), i + 1);
      processedPoint.rolling_3h = window3.reduce((sum, d) => sum + d.load, 0) / window3.length;
    }

    if (i >= 23) {
      const window24 = data.slice(Math.max(0, i - 23), i + 1);
      processedPoint.rolling_24h = window24.reduce((sum, d) => sum + d.load, 0) / window24.length;
    }

    if (i >= 167) {
      const window168 = data.slice(Math.max(0, i - 167), i + 1);
      processedPoint.rolling_168h = window168.reduce((sum, d) => sum + d.load, 0) / window168.length;
    }

    processed.push(processedPoint);
  }

  return processed;
}
