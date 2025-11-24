import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { parseCSV, detectColumns, standardizeData, fillMissingValues, getDatasetInfo } from "./utils/preprocessing";
import { engineerFeatures } from "./utils/features";
import { forecast } from "./utils/forecasting";
import type { UploadResponse, PredictRequest, PredictResponse, DatasetInfo, ModelResult } from "@shared/schema";
import { randomUUID } from "crypto";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        } as UploadResponse);
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const { data: rawData, columns } = parseCSV(csvContent);

      if (rawData.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'CSV file is empty' 
        } as UploadResponse);
      }

      const detectedColumns = detectColumns(columns);
      
      if (!detectedColumns.timestampCol || !detectedColumns.loadCol) {
        return res.status(400).json({ 
          success: false, 
          error: 'Could not detect required timestamp and load columns' 
        } as UploadResponse);
      }

      const standardizedData = standardizeData(rawData, detectedColumns);
      
      if (standardizedData.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No valid data points found after preprocessing' 
        } as UploadResponse);
      }

      const filledData = fillMissingValues(standardizedData);
      await storage.storeTimeSeriesData(filledData);

      const processedData = engineerFeatures(filledData);
      await storage.storeProcessedData(processedData);

      const datasetInfo = getDatasetInfo(filledData, req.file.originalname);

      res.json({
        success: true,
        datasetInfo,
        preview: filledData.slice(0, 100),
      } as UploadResponse);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      } as UploadResponse);
    }
  });

  app.get('/api/dataset/info', async (req, res) => {
    try {
      const data = await storage.getTimeSeriesData();
      
      if (data.length === 0) {
        return res.status(404).json({ error: 'No dataset available' });
      }

      const datasetInfo = getDatasetInfo(data, 'current_dataset.csv');
      res.json(datasetInfo);
    } catch (error) {
      console.error('Dataset info error:', error);
      res.status(500).json({ error: 'Failed to get dataset info' });
    }
  });

  app.post('/api/predict', async (req, res) => {
    try {
      const { modelType, horizon } = req.body as PredictRequest;

      if (!modelType || !horizon) {
        return res.status(400).json({ 
          success: false, 
          error: 'Model type and horizon are required' 
        } as PredictResponse);
      }

      const processedData = await storage.getProcessedData();
      
      if (processedData.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No data available. Please upload data first.' 
        } as PredictResponse);
      }

      const startTime = Date.now();
      const { forecast: forecastPoints, metrics } = forecast(processedData, modelType, horizon);
      const endTime = Date.now();

      const result: ModelResult = {
        metadata: {
          id: randomUUID(),
          type: modelType,
          horizon,
          trainedAt: new Date().toISOString(),
          trainingDuration: endTime - startTime,
          dataPoints: processedData.length,
          features: ['hour', 'day_of_week', 'month', 'lag_1', 'lag_24', 'lag_168', 'rolling_24h'],
        },
        metrics,
        forecast: forecastPoints,
      };

      await storage.storeModelResult(result);

      res.json({
        success: true,
        result,
      } as PredictResponse);
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Prediction failed' 
      } as PredictResponse);
    }
  });

  app.post('/api/predict/all', async (req, res) => {
    try {
      const { horizon } = req.body as { horizon: 1 | 7 };

      if (!horizon) {
        return res.status(400).json({ 
          success: false, 
          error: 'Horizon is required' 
        });
      }

      const processedData = await storage.getProcessedData();
      
      if (processedData.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No data available. Please upload data first.' 
        });
      }

      const modelTypes: ('naive' | 'arima' | 'prophet' | 'lstm' | 'hybrid')[] = ['naive', 'arima', 'prophet', 'lstm', 'hybrid'];
      const results = [];

      for (const modelType of modelTypes) {
        const startTime = Date.now();
        const { forecast: forecastPoints, metrics } = forecast(processedData, modelType, horizon);
        const endTime = Date.now();

        const result: ModelResult = {
          metadata: {
            id: randomUUID(),
            type: modelType,
            horizon,
            trainedAt: new Date().toISOString(),
            trainingDuration: endTime - startTime,
            dataPoints: processedData.length,
            features: ['hour', 'day_of_week', 'month', 'lag_1', 'lag_24', 'lag_168', 'rolling_24h'],
          },
          metrics,
          forecast: forecastPoints,
        };
        
        // We don't necessarily need to store every single one in the DB for this comparison view, 
        // but we could if we wanted to persist them. For now, let's just return them.
        // await storage.storeModelResult(result); 
        
        results.push(result);
      }

      res.json({
        success: true,
        results,
      });
    } catch (error) {
      console.error('Prediction all error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Prediction failed' 
      });
    }
  });

  app.get('/api/forecast/latest', async (req, res) => {
    try {
      const result = await storage.getLatestModelResult();
      
      if (!result) {
        return res.status(404).json({ error: 'No forecast available' });
      }

      res.json(result);
    } catch (error) {
      console.error('Latest forecast error:', error);
      res.status(500).json({ error: 'Failed to get latest forecast' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
