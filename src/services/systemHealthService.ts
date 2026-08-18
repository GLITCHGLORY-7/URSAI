import { UrsaiState } from '../types/ursai';

export type ServiceHealthStatus = 'OPERATIONAL' | 'DEGRADED' | 'FAILED';

export interface SystemHealthSummary {
  overallStatus: ServiceHealthStatus;
  subsystems: {
    coordinator: ServiceHealthStatus;
    routing: ServiceHealthStatus;
    nim: ServiceHealthStatus;
    cityData: ServiceHealthStatus;
    prediction: ServiceHealthStatus;
    mission: ServiceHealthStatus;
    map: ServiceHealthStatus;
    eventBus: ServiceHealthStatus;
  };
  summary: string;
  timestamp: string;
}

export function evaluateSystemHealth(state: UrsaiState): SystemHealthSummary {
  let coordinator: ServiceHealthStatus = 'OPERATIONAL';
  let routing: ServiceHealthStatus = 'OPERATIONAL';
  let nim: ServiceHealthStatus = 'OPERATIONAL';
  let cityData: ServiceHealthStatus = 'OPERATIONAL';
  let prediction: ServiceHealthStatus = 'OPERATIONAL';
  let mission: ServiceHealthStatus = 'OPERATIONAL';
  let map: ServiceHealthStatus = 'OPERATIONAL';
  let eventBus: ServiceHealthStatus = 'OPERATIONAL';

  // Check NIM Status
  if (state.aiStatus === 'DEGRADED' || state.aiDecision?.engine === 'FALLBACK RULE ENGINE') {
    nim = 'DEGRADED';
  } else if (state.aiStatus === 'FAILED') {
    nim = 'FAILED';
  }

  // Check Routing Status
  if (state.ambulance.currentTask === 'ROUTING FAILURE' || state.police.status === 'ERROR') {
    routing = 'DEGRADED'; // Fallback routing activated
  }

  // Check Prediction Status
  if (state.prediction.status === 'DEGRADED' || state.prediction.source === 'RULE_BASED_FALLBACK') {
    prediction = 'DEGRADED';
  } else if (state.prediction.status === 'FAILED') {
    prediction = 'FAILED';
  }

  // Check Mission Status
  if (state.mission?.planStatus === 'DEGRADED' || state.mission?.planStatus === 'REVIEW_REQUIRED') {
    mission = 'DEGRADED';
  }

  // Check Coordinator Status
  if ((state.systemStatus as string) === 'ERROR') {
    coordinator = 'FAILED';
  }

  // Determine overall status
  let overallStatus: ServiceHealthStatus = 'OPERATIONAL';

  if ((coordinator as ServiceHealthStatus) === 'FAILED' || (map as ServiceHealthStatus) === 'FAILED') {
    overallStatus = 'FAILED';
  } else if (
    nim === 'DEGRADED' ||
    routing === 'DEGRADED' ||
    prediction === 'DEGRADED' ||
    mission === 'DEGRADED' ||
    nim === 'FAILED'
  ) {
    overallStatus = 'DEGRADED';
  }

  const summary =
    overallStatus === 'OPERATIONAL'
      ? 'All smart city coordination core modules operating under optimal parameters.'
      : overallStatus === 'DEGRADED'
      ? 'System operational with fallback/degraded sub-services (NIM/Routing fallback active).'
      : 'Critical system coordination error detected.';

  return {
    overallStatus,
    subsystems: {
      coordinator,
      routing,
      nim,
      cityData,
      prediction,
      mission,
      map,
      eventBus,
    },
    summary,
    timestamp: new Date().toISOString(),
  };
}
