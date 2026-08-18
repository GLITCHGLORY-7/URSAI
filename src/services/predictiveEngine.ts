import { SituationSnapshot } from './situationAnalyzer';
import { validatePrediction } from './predictionValidator';
import { computeFallbackPrediction } from './fallbackPredictiveEngine';
import { PredictionData, PredictionSource } from '../types/ursai';

export interface PredictiveEngineResult {
  prediction: PredictionData;
  source: PredictionSource;
  simulationGeneration: number;
}

/**
 * Main Predictive Intelligence Engine
 * Passes snapshot to NIM Proxy (`/api/predict`) and validates response.
 * Automatically engages deterministic fallback engine if NIM fails or outputs invalid schema.
 */
export async function runPredictiveEngine(
  snapshot: SituationSnapshot
): Promise<PredictiveEngineResult> {
  // If no active incident, return fallback baseline
  if (!snapshot.incident) {
    return {
      prediction: computeFallbackPrediction(snapshot),
      source: 'RULE_BASED_FALLBACK',
      simulationGeneration: snapshot.simulationGeneration,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.prediction) {
        const validation = validatePrediction(data.prediction);
        if (validation.isValid && validation.prediction) {
          return {
            prediction: validation.prediction,
            source: 'NVIDIA_NIM',
            simulationGeneration: snapshot.simulationGeneration,
          };
        } else {
          console.warn('[Predictive Engine] Validation failed for NIM prediction output:', validation.reason);
        }
      } else {
        console.warn('[Predictive Engine] NIM endpoint returned fallback status:', data.reason);
      }
    }
  } catch (err: any) {
    const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
    if (isAbort) {
      console.info('[Predictive Engine] NIM prediction request timed out or aborted. Engaging fallback predictive engine.');
    } else {
      console.warn('[Predictive Engine] Fetch or network error:', err.message || err);
    }
  }

  // Engage deterministic rule-based fallback if NIM unavailable or output invalid
  const fallbackPrediction = computeFallbackPrediction(snapshot);
  return {
    prediction: fallbackPrediction,
    source: 'RULE_BASED_FALLBACK',
    simulationGeneration: snapshot.simulationGeneration,
  };
}
