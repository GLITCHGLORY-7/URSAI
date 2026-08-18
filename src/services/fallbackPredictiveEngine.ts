import { SituationSnapshot } from './situationAnalyzer';
import { PredictionData, PredictionLevel } from '../types/ursai';

/**
 * Deterministic Fallback Predictive Engine
 * Used when NVIDIA NIM prediction service is unreachable or encounters errors.
 * Strictly rule-based for simulation reliability.
 */
export function computeFallbackPrediction(snapshot: SituationSnapshot): PredictionData {
  const incident = snapshot.incident;
  const traffic = snapshot.traffic;
  const ambulance = snapshot.agents.ambulance;
  const hospital = snapshot.agents.hospital;

  // 1. Response Risk Prediction
  let responseRiskLevel: PredictionLevel = 'LOW';
  let responseRiskDesc = 'Low incident operational risk. Standard response procedures active.';

  if (incident?.severity === 'CRITICAL') {
    responseRiskLevel = 'CRITICAL';
    responseRiskDesc = 'Critical severity incident requiring continuous multi-agent coordination and high transit priority.';
  } else if (incident?.severity === 'HIGH') {
    responseRiskLevel = 'HIGH';
    responseRiskDesc = 'High-severity incident with potential for road congestion or medical escalation.';
  } else if (incident?.severity === 'MEDIUM') {
    responseRiskLevel = 'MEDIUM';
    responseRiskDesc = 'Moderate incident risk. Standard emergency protocols deployed.';
  }

  // 2. Traffic Impact & Route Difficulty Prediction
  let trafficImpactLevel: PredictionLevel = 'LOW';
  let trafficImpactDesc = 'Normal traffic flow anticipated along emergency transit path.';
  let routeDifficultyLevel: PredictionLevel = 'LOW';
  let routeDifficultyDesc = 'Clear route geometry with standard transit speeds.';

  const cityTraffic = snapshot.city;
  if (cityTraffic?.congestionIndex > 0.75) {
    trafficImpactLevel = 'CRITICAL';
    trafficImpactDesc = `Critical city congestion index (${cityTraffic.congestionIndex.toFixed(2)}). Severe traffic delays around emergency corridor.`;
    routeDifficultyLevel = 'CRITICAL';
    routeDifficultyDesc = 'Corridor heavily congested. High probability of rerouting required.';
  } else if (cityTraffic?.congestionIndex > 0.50 || cityTraffic?.weatherCondition === 'HEAVY_RAIN') {
    trafficImpactLevel = 'HIGH';
    trafficImpactDesc = `High traffic congestion or weather impact (${cityTraffic?.weatherCondition}). Reduced corridor speeds.`;
    routeDifficultyLevel = 'HIGH';
    routeDifficultyDesc = 'Increased transit friction due to weather and traffic backpressure.';
  } else if (traffic.greenCorridorActive) {
    trafficImpactLevel = 'MEDIUM';
    trafficImpactDesc = 'Green Corridor signal override active. Priority transit path cleared.';
    routeDifficultyLevel = 'LOW';
    routeDifficultyDesc = 'Green Corridor active. Transit friction minimized.';
  }

  // 3. Hospital Demand Prediction
  let hospitalDemandLevel: PredictionLevel = 'LOW';
  let hospitalDemandDesc = 'Simulated hospital capacity sufficient for emergency intake.';

  if (snapshot.city?.hospitalPressure === 'CRITICAL') {
    hospitalDemandLevel = 'CRITICAL';
    hospitalDemandDesc = 'Critical hospital intake pressure across emergency centers.';
  } else if (snapshot.city?.hospitalPressure === 'HIGH' || (hospital.icuBedsAvailable ?? 10) < 5) {
    hospitalDemandLevel = 'HIGH';
    hospitalDemandDesc = `High hospital pressure or low ICU availability (${hospital.icuBedsAvailable ?? 'N/A'} ICU beds remaining).`;
  } else if (hospital.selectedName) {
    hospitalDemandLevel = 'MEDIUM';
    hospitalDemandDesc = `Moderate ICU bed availability at ${hospital.selectedName}.`;
  }

  // 4. Predicted Response Time (Minutes)
  let predictedResponseTimeMinutes = 8;
  if (ambulance.etaSeconds && ambulance.etaSeconds > 0) {
    predictedResponseTimeMinutes = Math.max(1, Math.round(ambulance.etaSeconds / 60));
  } else if (ambulance.routeDurationSeconds && ambulance.routeDurationSeconds > 0) {
    predictedResponseTimeMinutes = Math.max(1, Math.round(ambulance.routeDurationSeconds / 60));
  } else if (incident?.severity === 'CRITICAL' || incident?.severity === 'HIGH') {
    predictedResponseTimeMinutes = 10;
  }

  // 5. Recommended Monitoring Items
  const recommendedMonitoring: string[] = [
    'Monitor Ambulance transit progress and live ETA',
    'Track Green Corridor traffic signal override status',
    'Observe emergency medical center ICU capacity & readiness',
    'Monitor city traffic congestion index & weather alerts',
  ];

  const situationSummary = `Rule-Based Analysis: Active ${incident?.severity || 'STANDARD'} ${incident?.type || 'INCIDENT'} under ${cityTraffic?.weatherCondition || 'CLEAR'} weather. City Congestion Index: ${cityTraffic?.congestionIndex?.toFixed(2) || '0.25'}. Hospital Pressure: ${snapshot.city?.hospitalPressure || 'LOW'}.`;

  return {
    trafficImpact: {
      level: trafficImpactLevel,
      description: trafficImpactDesc,
    },
    responseRisk: {
      level: responseRiskLevel,
      description: responseRiskDesc,
    },
    hospitalDemand: {
      level: hospitalDemandLevel,
      description: hospitalDemandDesc,
    },
    routeDifficulty: {
      level: routeDifficultyLevel,
      description: routeDifficultyDesc,
    },
    predictedResponseTimeMinutes,
    recommendedMonitoring,
    situationSummary,
  };
}
