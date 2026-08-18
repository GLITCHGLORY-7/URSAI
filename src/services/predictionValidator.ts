import { PredictionData, PredictionLevel } from '../types/ursai';

const VALID_LEVELS: PredictionLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export interface PredictionValidationResult {
  isValid: boolean;
  prediction: PredictionData | null;
  reason?: string;
}

/**
 * Strictly validates the schema of prediction outputs before allowing them into UI/state.
 */
export function validatePrediction(data: any): PredictionValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, prediction: null, reason: 'Prediction output is not an object' };
  }

  // 1. Validate trafficImpact
  if (
    !data.trafficImpact ||
    !VALID_LEVELS.includes(data.trafficImpact.level) ||
    typeof data.trafficImpact.description !== 'string' ||
    !data.trafficImpact.description.trim()
  ) {
    return { isValid: false, prediction: null, reason: 'Invalid trafficImpact schema or empty description' };
  }

  // 2. Validate responseRisk
  if (
    !data.responseRisk ||
    !VALID_LEVELS.includes(data.responseRisk.level) ||
    typeof data.responseRisk.description !== 'string' ||
    !data.responseRisk.description.trim()
  ) {
    return { isValid: false, prediction: null, reason: 'Invalid responseRisk schema or empty description' };
  }

  // 3. Validate hospitalDemand
  if (
    !data.hospitalDemand ||
    !VALID_LEVELS.includes(data.hospitalDemand.level) ||
    typeof data.hospitalDemand.description !== 'string' ||
    !data.hospitalDemand.description.trim()
  ) {
    return { isValid: false, prediction: null, reason: 'Invalid hospitalDemand schema or empty description' };
  }

  // 4. Validate routeDifficulty (or fallback)
  const routeDifficulty =
    data.routeDifficulty && VALID_LEVELS.includes(data.routeDifficulty.level)
      ? {
          level: data.routeDifficulty.level as PredictionLevel,
          description: String(data.routeDifficulty.description || 'Evaluating corridor traffic geometry...').trim(),
        }
      : {
          level: (data.trafficImpact?.level || 'MEDIUM') as PredictionLevel,
          description: 'Route difficulty synchronized with corridor congestion index.',
        };

  // 5. Validate predictedResponseTimeMinutes
  const respTime = Number(data.predictedResponseTimeMinutes);
  if (isNaN(respTime) || respTime <= 0 || respTime > 180) {
    return { isValid: false, prediction: null, reason: 'Invalid predictedResponseTimeMinutes (must be 1-180)' };
  }

  // 6. Validate recommendedMonitoring
  if (
    !Array.isArray(data.recommendedMonitoring) ||
    data.recommendedMonitoring.length === 0 ||
    data.recommendedMonitoring.some((item) => typeof item !== 'string' || !item.trim())
  ) {
    return { isValid: false, prediction: null, reason: 'Invalid recommendedMonitoring array' };
  }

  const situationSummary =
    typeof data.situationSummary === 'string' && data.situationSummary.trim()
      ? data.situationSummary.trim()
      : `Simulated city snapshot analysis complete for active incident.`;

  const prediction: PredictionData = {
    trafficImpact: {
      level: data.trafficImpact.level,
      description: data.trafficImpact.description.trim(),
    },
    responseRisk: {
      level: data.responseRisk.level,
      description: data.responseRisk.description.trim(),
    },
    hospitalDemand: {
      level: data.hospitalDemand.level,
      description: data.hospitalDemand.description.trim(),
    },
    routeDifficulty,
    predictedResponseTimeMinutes: Math.round(respTime),
    recommendedMonitoring: data.recommendedMonitoring.map((item: string) => item.trim()),
    situationSummary,
  };

  return { isValid: true, prediction };
}
