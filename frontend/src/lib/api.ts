/**
 * API Client for Guardian AI UPI Fraud Detection
 * Handles all communication with the FastAPI backend
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// Feature names - must be in exact order for API mapping
const FEATURE_NAMES = [
  'time', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9',
  'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v18', 'v19',
  'v20', 'v21', 'v22', 'v23', 'v24', 'v25', 'v26', 'v27', 'v28', 'amount'
];

export interface PredictionResult {
  is_fraud: boolean;
  confidence: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  probability: number;
  message: string;
  isDemoMode?: boolean;
}

export interface ModelInfo {
  version: string;
  threshold: number;
  models: string[];
  features: string[];
  performance: {
    roc_auc: number;
    pr_auc: number;
    f1_score: number;
  };
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  timestamp: string;
}

/**
 * Generate demo prediction when backend is unavailable
 * Uses V1 feature value to determine fraud likelihood
 */
function generateDemoPrediction(features: number[]): PredictionResult {
  const v1Value = features[1] ?? 0;
  const isFraud = v1Value < -1.5;

  if (isFraud) {
    const confidence = 0.89 + Math.random() * 0.08;
    return {
      is_fraud: true,
      confidence: parseFloat(confidence.toFixed(4)),
      risk_level: 'HIGH',
      probability: parseFloat(confidence.toFixed(4)),
      message: 'Transaction flagged as potential fraud (Demo Mode)',
      isDemoMode: true,
    };
  }

  const confidence = 0.91 + Math.random() * 0.08;
  return {
    is_fraud: false,
    confidence: parseFloat(confidence.toFixed(4)),
    risk_level: 'LOW',
    probability: 1 - parseFloat(confidence.toFixed(4)),
    message: 'Transaction appears legitimate (Demo Mode)',
    isDemoMode: true,
  };
}

/**
 * Map feature array to named feature object
 */
function mapFeaturesToObject(features: number[]): Record<string, number> {
  const featureObject: Record<string, number> = {};
  FEATURE_NAMES.forEach((name, index) => {
    featureObject[name] = features[index] ?? 0;
  });
  return featureObject;
}

/**
 * Make a request to the API with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Predict fraud for a single transaction
 * @param features Array of 30 feature values
 * @returns Fraud prediction result
 */
export async function predictTransaction(features: number[]): Promise<PredictionResult> {
  if (features.length !== 30) {
    throw new Error(`Invalid feature count: expected 30, got ${features.length}`);
  }

  const featureObject = mapFeaturesToObject(features);
  const result = await fetchAPI<PredictionResult>('/predict', {
    method: 'POST',
    body: JSON.stringify(featureObject),
  });
  return result;
}

/**
 * Predict fraud for multiple transactions
 * @param rows Array of transaction feature arrays
 * @returns Array of fraud prediction results
 */
export async function predictBatch(rows: number[][]): Promise<PredictionResult[]> {
  try {
    const mappedRows = rows.map(row => {
      if (row.length !== 30) {
        throw new Error(`Invalid feature count: expected 30, got ${row.length}`);
      }
      return mapFeaturesToObject(row);
    });

    const result = await fetchAPI<PredictionResult[]>('/predict/batch', {
      method: 'POST',
      body: JSON.stringify({ rows: mappedRows }),
    });
    return result;
  } catch (error) {
    console.warn('Batch prediction failed, falling back to individual predictions:', error);
    return Promise.all(rows.map(row => predictTransaction(row)));
  }
}

/**
 * Get model information and performance metrics
 * @returns Model info including version, threshold, and performance
 */
export async function getModelInfo(): Promise<ModelInfo> {
  try {
    const result = await fetchAPI<ModelInfo>('/model/info', {
      method: 'GET',
    });
    return result;
  } catch (error) {
    console.error('Failed to fetch model info:', error);
    throw error;
  }
}

/**
 * Check API health status
 * @returns Health status including model load status
 */
export async function checkHealth(): Promise<HealthStatus> {
  try {
    const result = await fetchAPI<HealthStatus>('/health', {
      method: 'GET',
    });
    return result;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Check if backend is available (non-throwing version)
 * @returns true if backend is reachable and healthy, false otherwise
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}

/**
 * Get the base URL for the API
 */
export function getAPIBaseURL(): string {
  return BASE_URL;
}

/**
 * Get the feature names in order
 */
export function getFeatureNames(): string[] {
  return [...FEATURE_NAMES];
}
