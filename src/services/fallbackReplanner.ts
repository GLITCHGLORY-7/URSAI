import { UrsaiState, ReplanRecommendation, ReplanChange } from '../types/ursai';

export function generateFallbackReplan(
  state: UrsaiState,
  triggers: string[]
): ReplanRecommendation {
  const changes: ReplanChange[] = [];

  if (triggers.includes('ROUTE_DURATION_EXCEEDED_30_PERCENT') || triggers.includes('EXTREME_WEATHER_TRAFFIC_CONGESTION')) {
    changes.push({
      target: 'AMBULANCE',
      action: 'REROUTE_OPTIMAL_PATH',
      reason: 'Ambulance travel time degraded beyond 30% baseline due to route congestion.',
    });
    changes.push({
      target: 'TRAFFIC',
      action: 'REASSESS_GREEN_CORRIDOR',
      reason: 'Optimize signal overrides along new primary emergency corridor.',
    });
  }

  if (triggers.includes('HOSPITAL_ICU_CRITICAL_DEPLETION') || triggers.includes('CRITICAL_HOSPITAL_PRESSURE')) {
    changes.push({
      target: 'HOSPITAL',
      action: 'REASSESS_HOSPITAL_SELECTION',
      reason: 'Primary hospital ICU capacity depleted below emergency reserve threshold.',
    });
  }

  if (changes.length === 0) {
    return {
      recommendation: 'KEEP_PLAN',
      priority: 'LOW',
      reason: 'Rule engine verified current response plan parameters remain acceptable.',
      changes: [],
    };
  }

  return {
    recommendation: 'REPLAN',
    priority: triggers.some((t) => t.includes('CRITICAL') || t.includes('EXTREME')) ? 'CRITICAL' : 'HIGH',
    reason: `Rule-based fallback replanner identified ${changes.length} adaptive optimization target(s).`,
    changes,
  };
}
