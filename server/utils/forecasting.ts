import type { ProcessedDataPoint, ForecastPoint, ModelType, EvaluationMetrics } from "@shared/schema";
import { calculateMetrics } from "./metrics";

export function naiveForecast(
  data: ProcessedDataPoint[],
  horizon: number
): { forecast: ForecastPoint[]; metrics: EvaluationMetrics } {
  const trainSize = Math.floor(data.length * 0.8);
  const trainData = data.slice(0, trainSize);
  const testData = data.slice(trainSize);

  const forecastPoints: ForecastPoint[] = [];
  const actual: number[] = [];
  const predicted: number[] = [];

  const lastValue = trainData[trainData.length - 1].load;

  const hoursToPredict = horizon * 24;
  const predictCount = Math.min(hoursToPredict, testData.length);

  for (let i = 0; i < predictCount; i++) {
    const point = testData[i];
    forecastPoints.push({
      timestamp: point.timestamp,
      predicted_load: lastValue,
      actual_load: point.load,
    });
    actual.push(point.load);
    predicted.push(lastValue);
  }

  const metrics = calculateMetrics(actual, predicted);
  return { forecast: forecastPoints, metrics };
}

export function arimaLikeForecast(
  data: ProcessedDataPoint[],
  horizon: number
): { forecast: ForecastPoint[]; metrics: EvaluationMetrics } {
  const trainSize = Math.floor(data.length * 0.8);
  const trainData = data.slice(0, trainSize);
  const testData = data.slice(trainSize);

  const forecastPoints: ForecastPoint[] = [];
  const actual: number[] = [];
  const predicted: number[] = [];

  const hoursToPredict = horizon * 24;
  const predictCount = Math.min(hoursToPredict, testData.length);

  for (let i = 0; i < predictCount; i++) {
    let prediction = 0;
    
    if (i === 0) {
      const recent = trainData.slice(-24);
      const trend = (recent[recent.length - 1].load - recent[0].load) / recent.length;
      const seasonal = trainData.slice(-168, -144).reduce((sum, p) => sum + p.load, 0) / 24;
      prediction = trainData[trainData.length - 1].load + trend + (seasonal - trainData[trainData.length - 1].load) * 0.3;
    } else {
      const prevPredicted = predicted[i - 1];
      const sameDayOfWeekData = trainData.filter((_, idx) => idx % 168 === (trainSize + i) % 168);
      const seasonal = sameDayOfWeekData.length > 0 
        ? sameDayOfWeekData.reduce((sum, p) => sum + p.load, 0) / sameDayOfWeekData.length 
        : prevPredicted;
      prediction = prevPredicted * 0.7 + seasonal * 0.3;
    }

    const point = testData[i];
    forecastPoints.push({
      timestamp: point.timestamp,
      predicted_load: prediction,
      actual_load: point.load,
      lower_bound: prediction * 0.95,
      upper_bound: prediction * 1.05,
    });
    actual.push(point.load);
    predicted.push(prediction);
  }

  const metrics = calculateMetrics(actual, predicted);
  return { forecast: forecastPoints, metrics };
}

export function prophetLikeForecast(
  data: ProcessedDataPoint[],
  horizon: number
): { forecast: ForecastPoint[]; metrics: EvaluationMetrics } {
  const trainSize = Math.floor(data.length * 0.8);
  const trainData = data.slice(0, trainSize);
  const testData = data.slice(trainSize);

  const forecastPoints: ForecastPoint[] = [];
  const actual: number[] = [];
  const predicted: number[] = [];

  const hourlyPatterns = new Array(24).fill(0);
  const hourlyCounts = new Array(24).fill(0);
  
  trainData.forEach(point => {
    if (point.hour !== undefined) {
      hourlyPatterns[point.hour] += point.load;
      hourlyCounts[point.hour]++;
    }
  });

  for (let i = 0; i < hourlyPatterns.length; i++) {
    hourlyPatterns[i] = hourlyCounts[i] > 0 ? hourlyPatterns[i] / hourlyCounts[i] : 0;
  }

  const overallMean = trainData.reduce((sum, p) => sum + p.load, 0) / trainData.length;
  const trend = (trainData[trainData.length - 1].load - trainData[0].load) / trainData.length;

  const hoursToPredict = horizon * 24;
  const predictCount = Math.min(hoursToPredict, testData.length);

  for (let i = 0; i < predictCount; i++) {
    const point = testData[i];
    const hour = point.hour ?? 0;
    
    const trendComponent = trend * (trainSize + i);
    const seasonalComponent = hourlyPatterns[hour] - overallMean;
    const weekendAdjustment = point.is_weekend ? -overallMean * 0.05 : 0;
    
    const prediction = overallMean + trendComponent + seasonalComponent + weekendAdjustment;

    forecastPoints.push({
      timestamp: point.timestamp,
      predicted_load: prediction,
      actual_load: point.load,
      lower_bound: prediction * 0.93,
      upper_bound: prediction * 1.07,
    });
    actual.push(point.load);
    predicted.push(prediction);
  }

  const metrics = calculateMetrics(actual, predicted);
  return { forecast: forecastPoints, metrics };
}

export function lstmLikeForecast(
  data: ProcessedDataPoint[],
  horizon: number
): { forecast: ForecastPoint[]; metrics: EvaluationMetrics } {
  const trainSize = Math.floor(data.length * 0.8);
  const trainData = data.slice(0, trainSize);
  const testData = data.slice(trainSize);

  const forecastPoints: ForecastPoint[] = [];
  const actual: number[] = [];
  const predicted: number[] = [];

  const sequenceLength = 24;
  const hoursToPredict = horizon * 24;
  const predictCount = Math.min(hoursToPredict, testData.length);

  for (let i = 0; i < predictCount; i++) {
    let prediction = 0;
    
    const sequenceStart = Math.max(0, trainSize - sequenceLength + i);
    const sequence = i === 0 
      ? trainData.slice(sequenceStart) 
      : [...trainData.slice(sequenceStart), ...testData.slice(0, i)].slice(-sequenceLength);

    if (sequence.length > 0) {
      const weights = sequence.map((_, idx) => (idx + 1) / sequence.length);
      const weightedSum = sequence.reduce((sum, p, idx) => sum + p.load * weights[idx], 0);
      const weightSum = weights.reduce((sum, w) => sum + w, 0);
      prediction = weightedSum / weightSum;

      if (testData[i].lag_24 !== undefined) {
        prediction = prediction * 0.6 + testData[i].lag_24! * 0.4;
      }

      if (testData[i].rolling_24h !== undefined) {
        prediction = prediction * 0.7 + testData[i].rolling_24h! * 0.3;
      }
    }

    const point = testData[i];
    forecastPoints.push({
      timestamp: point.timestamp,
      predicted_load: prediction,
      actual_load: point.load,
      lower_bound: prediction * 0.92,
      upper_bound: prediction * 1.08,
    });
    actual.push(point.load);
    predicted.push(prediction);
  }

  const metrics = calculateMetrics(actual, predicted);
  return { forecast: forecastPoints, metrics };
}

export function hybridForecast(
  data: ProcessedDataPoint[],
  horizon: number
): { forecast: ForecastPoint[]; metrics: EvaluationMetrics } {
  const prophetResult = prophetLikeForecast(data, horizon);
  const lstmResult = lstmLikeForecast(data, horizon);

  const forecastPoints: ForecastPoint[] = [];
  const actual: number[] = [];
  const predicted: number[] = [];

  for (let i = 0; i < prophetResult.forecast.length; i++) {
    const prophetPred = prophetResult.forecast[i].predicted_load;
    const lstmPred = lstmResult.forecast[i].predicted_load;
    const hybridPred = prophetPred * 0.5 + lstmPred * 0.5;

    forecastPoints.push({
      timestamp: prophetResult.forecast[i].timestamp,
      predicted_load: hybridPred,
      actual_load: prophetResult.forecast[i].actual_load,
      lower_bound: hybridPred * 0.91,
      upper_bound: hybridPred * 1.09,
    });
    actual.push(prophetResult.forecast[i].actual_load!);
    predicted.push(hybridPred);
  }

  const metrics = calculateMetrics(actual, predicted);
  return { forecast: forecastPoints, metrics };
}

export function forecast(
  data: ProcessedDataPoint[],
  modelType: ModelType,
  horizon: number
): { forecast: ForecastPoint[]; metrics: EvaluationMetrics } {
  switch (modelType) {
    case 'naive':
      return naiveForecast(data, horizon);
    case 'arima':
      return arimaLikeForecast(data, horizon);
    case 'prophet':
      return prophetLikeForecast(data, horizon);
    case 'lstm':
      return lstmLikeForecast(data, horizon);
    case 'hybrid':
      return hybridForecast(data, horizon);
    default:
      return naiveForecast(data, horizon);
  }
}
