import type { EvaluationMetrics } from "@shared/schema";

export function calculateMetrics(actual: number[], predicted: number[]): EvaluationMetrics {
  if (actual.length !== predicted.length || actual.length === 0) {
    return { mae: 0, rmse: 0, mape: 0 };
  }

  let sumAbsError = 0;
  let sumSquaredError = 0;
  let sumPercentError = 0;
  let validCount = 0;

  for (let i = 0; i < actual.length; i++) {
    const absError = Math.abs(actual[i] - predicted[i]);
    const squaredError = Math.pow(actual[i] - predicted[i], 2);
    
    sumAbsError += absError;
    sumSquaredError += squaredError;
    
    if (actual[i] !== 0) {
      sumPercentError += Math.abs((actual[i] - predicted[i]) / actual[i]) * 100;
      validCount++;
    }
  }

  const mae = sumAbsError / actual.length;
  const rmse = Math.sqrt(sumSquaredError / actual.length);
  const mape = validCount > 0 ? sumPercentError / validCount : 0;

  return { mae, rmse, mape };
}
