// Linear Regression Forecast
export function linearRegressionForecast(history: number[], forecastDays: number): number[] {
  const n = history.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = history;

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
  const denominator = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  return Array.from({ length: forecastDays }, (_, i) => {
    const day = n + i + 1;
    return Math.round(slope * day + intercept);
  });
}

// Moving Average Forecast
export function movingAverageForecast(history: number[], forecastDays: number, window = 7): number[] {
  const avg = history.slice(-window).reduce((a, b) => a + b, 0) / window;
  return Array(forecastDays).fill(Math.round(avg));
}

// Seasonal Naive Forecast (repeat last week)
export function seasonalNaiveForecast(history: number[], forecastDays: number, seasonLength = 7): number[] {
  const season = history.slice(-seasonLength);
  return Array.from({ length: forecastDays }, (_, i) => season[i % seasonLength]);
} 