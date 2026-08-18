import {
  Scenario,
  ScenarioMetrics,
  ScenarioEvaluationResult,
  ScenarioImpactCategory,
  UrsaiState,
} from '../../types/ursai';
import { DigitalTwinState } from './digitalTwinState';

export class ScenarioEvaluator {
  public extractMetrics(state: UrsaiState): ScenarioMetrics {
    const etaSeconds = state.ambulance.eta || 480;
    const distanceMeters = state.ambulance.routeDistance || 4500;
    const responseTimeMinutes = Math.round((etaSeconds / 60) * 10) / 10;
    const hospital = state.hospital.selectedHospital;
    const hospitalSuitabilityScore = hospital
      ? Math.min(100, hospital.icuBedsAvailable * 10 + (hospital.emergencyReady ? 40 : 10))
      : 30;

    const trafficImpactIndex = state.cityState.traffic.congestionIndex || 0.4;

    const routeRiskLevel =
      trafficImpactIndex > 0.75 || state.cityState.weather.condition === 'HEAVY_RAIN'
        ? 'HIGH'
        : trafficImpactIndex > 0.5
        ? 'MEDIUM'
        : 'LOW';

    const missionRiskLevel =
      etaSeconds > 900
        ? 'CRITICAL'
        : etaSeconds > 600
        ? 'HIGH'
        : etaSeconds > 420
        ? 'MEDIUM'
        : 'LOW';

    return {
      etaSeconds,
      distanceMeters,
      responseTimeMinutes,
      hospitalSuitabilityScore,
      trafficImpactIndex,
      routeRiskLevel,
      missionRiskLevel,
      resourceImpact: `Ambulance: ${state.ambulance.status}, Police: ${state.police.status}`,
    };
  }

  public evaluate(
    scenario: Scenario,
    baselineState: UrsaiState,
    simulatedTwinState: DigitalTwinState,
    simulatedRoute: [number, number][],
    simulatedHospitalName?: string
  ): Omit<ScenarioEvaluationResult, 'aiAnalysis'> {
    const baseline = this.extractMetrics(baselineState);
    const simulated = this.extractMetrics(simulatedTwinState);

    const etaDeltaSeconds = simulated.etaSeconds - baseline.etaSeconds;
    const distanceDeltaMeters = simulated.distanceMeters - baseline.distanceMeters;

    const hospitalChanged =
      !!simulatedHospitalName &&
      simulatedHospitalName !== baselineState.hospital.selectedHospital?.name;

    // Calculate Scenario Impact Score (0 - 100)
    let impactScore = 0;
    // ETA impact: 10 points per minute of delay
    impactScore += Math.min(50, Math.max(0, Math.round((etaDeltaSeconds / 60) * 10)));
    // Hospital suitability impact
    const hDiff = baseline.hospitalSuitabilityScore - simulated.hospitalSuitabilityScore;
    if (hDiff > 0) impactScore += Math.min(30, hDiff);
    // Hospital reassignment penalty
    if (hospitalChanged) impactScore += 20;
    // Cap at 100
    impactScore = Math.min(100, Math.max(5, Math.round(impactScore)));

    let impactCategory: ScenarioImpactCategory = 'LOW IMPACT';
    if (impactScore >= 75) impactCategory = 'CRITICAL IMPACT';
    else if (impactScore >= 50) impactCategory = 'HIGH IMPACT';
    else if (impactScore >= 25) impactCategory = 'MEDIUM IMPACT';

    const whyItMatters = this.generateWhyItMatters(scenario, etaDeltaSeconds, hospitalChanged, simulatedHospitalName);

    return {
      scenario: { ...scenario, status: 'COMPLETED' },
      baseline,
      simulated,
      delta: {
        etaDeltaSeconds,
        distanceDeltaMeters,
        riskDelta:
          simulated.missionRiskLevel !== baseline.missionRiskLevel
            ? `Risk changed from ${baseline.missionRiskLevel} to ${simulated.missionRiskLevel}`
            : 'Risk level stable',
        hospitalChanged,
        alternativeHospitalName: hospitalChanged ? simulatedHospitalName : undefined,
      },
      impactScore,
      impactCategory,
      route: simulatedRoute.length > 0 ? simulatedRoute : baselineState.ambulance.route,
      provenance: {
        traffic: scenario.type === 'TRAFFIC_INCREASE' ? 'SIMULATED' : 'REAL / HYBRID',
        routing: simulatedRoute.length > 0 ? 'REAL / OSRM' : 'FALLBACK HAVERSINE',
        hospital: hospitalChanged ? 'SIMULATED / EVALUATED' : 'REAL / REGISTRY',
        ai: 'NVIDIA NIM / RULE ENGINE',
      },
      whyItMatters,
      completedAt: new Date().toISOString(),
    };
  }

  private generateWhyItMatters(
    scenario: Scenario,
    etaDeltaSeconds: number,
    hospitalChanged: boolean,
    altHospital?: string
  ): string {
    const mins = Math.abs(Math.round(etaDeltaSeconds / 60));
    const secs = Math.abs(etaDeltaSeconds % 60);
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    if (etaDeltaSeconds > 0) {
      let base = `Simulated ${scenario.name.toLowerCase()} increases emergency response ETA by +${timeStr}.`;
      if (hospitalChanged && altHospital) {
        base += ` Primary hospital overloaded; rerouting to ${altHospital}.`;
      }
      return base;
    } else {
      return `Simulated ${scenario.name.toLowerCase()} maintains response stability with negligible ETA variation (${timeStr}).`;
    }
  }
}

export const scenarioEvaluator = new ScenarioEvaluator();
