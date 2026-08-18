import { UrsaiState, ResponsePlan, PlanStatus } from '../types/ursai';

export interface PlanEvaluationResult {
  valid: boolean;
  status: PlanStatus;
  reason: string;
  triggers: string[];
}

/**
 * Monitors the active mission and evaluates whether conditions require a plan review.
 */
export function evaluateActiveMission(
  state: UrsaiState,
  currentPlan: ResponsePlan | null
): PlanEvaluationResult {
  if (!state.activeIncident || state.activeIncident.status === 'RESOLVED' || !currentPlan) {
    return {
      valid: true,
      status: 'VALID',
      reason: 'No active incident or mission baseline.',
      triggers: [],
    };
  }

  const triggers: string[] = [];

  // 1. Check Route Degradation or ETA spike
  const currentEta = state.ambulance.eta;
  const initialDuration = state.ambulance.routeDuration;
  if (currentEta && initialDuration && currentEta > initialDuration * 1.3) {
    triggers.push('ROUTE_DURATION_EXCEEDED_30_PERCENT');
  }

  // 2. Check Hospital Suitability / ICU Pressure
  const hospital = state.hospital.selectedHospital;
  if (hospital) {
    if ((hospital.icuBedsAvailable ?? 10) < 3) {
      triggers.push('HOSPITAL_ICU_CRITICAL_DEPLETION');
    }
  }

  // 3. Check Weather / City Traffic Escalation
  if (state.cityState.weather.condition === 'HEAVY_RAIN' && state.cityState.traffic.congestionIndex > 0.70) {
    triggers.push('EXTREME_WEATHER_TRAFFIC_CONGESTION');
  }

  // 4. Check Hospital Pressure
  if (state.cityState.hospitalPressure === 'CRITICAL') {
    triggers.push('CRITICAL_HOSPITAL_PRESSURE');
  }

  if (triggers.length > 0) {
    return {
      valid: false,
      status: 'REVIEW_REQUIRED',
      reason: `Plan review triggered by: ${triggers.join(', ')}`,
      triggers,
    };
  }

  return {
    valid: true,
    status: 'VALID',
    reason: 'Current response plan is operating within optimal parameters.',
    triggers: [],
  };
}
