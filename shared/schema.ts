import { pgTable, text, varchar, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Time series data point
/**
 * Represents a single raw data point from the uploaded CSV.
 * Contains the timestamp and load value, plus optional weather/holiday data.
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  load: number;
  temperature?: number;
  humidity?: number;
  solar_power?: number;
  wind_power?: number;
  is_holiday?: boolean;
}

// Processed time series with features
/**
 * Represents a data point after preprocessing and feature engineering.
 * Includes derived features like hour, day of week, lags, and rolling averages.
 */
export interface ProcessedDataPoint extends TimeSeriesDataPoint {
  hour?: number;
  day_of_week?: number;
  month?: number;
  is_weekend?: boolean;
  hour_sin?: number;
  hour_cos?: number;
  day_sin?: number;
  day_cos?: number;
  month_sin?: number;
  month_cos?: number;
  lag_1?: number;
  lag_24?: number;
  lag_168?: number;
  rolling_3h?: number;
  rolling_24h?: number;
  rolling_168h?: number;
}

// Forecast data point
/**
 * Represents a single predicted data point.
 * Includes the predicted load and optional confidence intervals.
 */
export interface ForecastPoint {
  timestamp: string;
  predicted_load: number;
  actual_load?: number;
  lower_bound?: number;
  upper_bound?: number;
}

// Model types
export type ModelType = 'naive' | 'arima' | 'prophet' | 'lstm' | 'hybrid';

// Model configuration
/**
 * Configuration for a model training/prediction run.
 */
export interface ModelConfig {
  type: ModelType;
  horizon: 1 | 7; // days
  parameters?: Record<string, any>;
}

// Model metadata
/**
 * Metadata about a trained model and its execution.
 */
export interface ModelMetadata {
  id: string;
  type: ModelType;
  horizon: number;
  trainedAt: string;
  trainingDuration: number; // milliseconds
  dataPoints: number;
  features: string[];
}

// Evaluation metrics
/**
 * Performance metrics for model evaluation.
 */
export interface EvaluationMetrics {
  mae: number;
  rmse: number;
  mape: number;
  r2?: number;
}

// Model result
/**
 * Complete result of a model prediction run.
 * Includes metadata, metrics, and the forecast data itself.
 */
export interface ModelResult {
  metadata: ModelMetadata;
  metrics: EvaluationMetrics;
  forecast: ForecastPoint[];
  residuals?: number[];
}

// Training status
export interface TrainingStatus {
  status: 'idle' | 'preprocessing' | 'training' | 'evaluating' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}

// Dataset info
export interface DatasetInfo {
  filename: string;
  rowCount: number;
  startDate: string;
  endDate: string;
  frequency: string;
  columns: string[];
  missingValues: number;
  hasLoad: boolean;
  hasTemperature: boolean;
  hasHumidity: boolean;
}

// Upload response
export interface UploadResponse {
  success: boolean;
  datasetInfo?: DatasetInfo;
  preview?: TimeSeriesDataPoint[];
  error?: string;
}

// Predict request
export interface PredictRequest {
  modelType: ModelType;
  horizon: 1 | 7;
}

// Predict response
export interface PredictResponse {
  success: boolean;
  result?: ModelResult;
  error?: string;
}

// Available models response
export interface AvailableModelsResponse {
  models: ModelMetadata[];
}
