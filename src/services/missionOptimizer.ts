import { UrsaiState, MissionOptimization } from '../types/ursai';

export function computeMissionOptimization(state: UrsaiState): MissionOptimization {
  if (!state.activeIncident || state.activeIncident.status === 'RESOLVED') {
    return {
      score: 100,
      factors: {
        responseTime: 100,
        route: 100,
        hospital: 100,
        resources: 100,
      },
      recommendation: 'CURRENT_PLAN',
    };
  }

  // 1. Response Time factor (100 is fast, lower is delayed)
  const etaMins = state.ambulance.eta ? state.ambulance.eta / 60 : 8;
  const responseTimeScore = Math.max(30, Math.min(100, Math.round(100 - (etaMins - 5) * 8)));

  // 2. Route factor
  const congestionIndex = state.cityState.traffic.congestionIndex || 0.3;
  const greenCorridorBonus = state.traffic.greenCorridorActive ? 15 : 0;
  const routeScore = Math.max(30, Math.min(100, Math.round(100 - congestionIndex * 50 + greenCorridorBonus)));

  // 3. Hospital suitability factor
  const selected = state.hospital.selectedHospital;
  let hospitalScore = 85;
  if (selected) {
    const icu = selected.icuBedsAvailable ?? 10;
    if (icu < 3) hospitalScore = 40;
    else if (icu < 8) hospitalScore = 65;
    else hospitalScore = 92;
  }

  // 4. Resource availability factor
  const ambAvail = state.cityState.resources.ambulancesAvailable;
  const polAvail = state.cityState.resources.policeUnitsAvailable;
  const resourceScore = Math.max(40, Math.min(100, Math.round(((ambAvail + polAvail) / 10) * 100)));

  const totalScore = Math.round(
    responseTimeScore * 0.35 + routeScore * 0.25 + hospitalScore * 0.25 + resourceScore * 0.15
  );

  return {
    score: totalScore,
    factors: {
      responseTime: responseTimeScore,
      route: routeScore,
      hospital: hospitalScore,
      resources: resourceScore,
    },
    recommendation: totalScore < 70 ? 'OPTIMIZE_RECOMMENDED' : 'CURRENT_PLAN',
  };
}
