import {
  UrsaiState,
  Scenario,
  ScenarioType,
  ScenarioParameters,
  ScenarioEvaluationResult,
  ScenarioAIRecommendation,
} from '../../types/ursai';
import { createDigitalTwinState } from './digitalTwinState';
import { digitalTwinEngine } from './digitalTwinEngine';
import { scenarioEngine } from './scenarioEngine';
import { scenarioEvaluator } from './scenarioEvaluator';
import { fetchRoute } from '../routingService';
import { selectBestHospital } from '../hospitalService';
import { eventBus } from '../eventBus';

export class WhatIfEngine {
  public async runScenarioSimulation(
    liveState: UrsaiState,
    scenarioType: ScenarioType,
    params: ScenarioParameters = {}
  ): Promise<ScenarioEvaluationResult> {
    const baseMissionId = liveState.mission?.id || null;
    const scenario = scenarioEngine.createScenario(scenarioType, params, baseMissionId);

    eventBus.publish('SCENARIO_CREATED', { scenario }, 'WHAT_IF_ENGINE');
    eventBus.publish('SCENARIO_STARTED', { scenarioId: scenario.id, type: scenarioType }, 'WHAT_IF_ENGINE');

    // 1. Clone state into isolated Digital Twin copy (IMMUTABLE)
    const digitalTwin = createDigitalTwinState(liveState);

    // 2. Apply scenario transformations to Digital Twin
    const simulatedTwin = digitalTwinEngine.applyScenario(digitalTwin, scenario);
    eventBus.publish('SCENARIO_DATA_APPLIED', { scenarioId: scenario.id, type: scenarioType }, 'WHAT_IF_ENGINE');

    // 3. Re-evaluate routing for scenario
    let simulatedRoute: [number, number][] = liveState.ambulance.route;
    try {
      const amb = simulatedTwin.ambulance;
      if (amb.latitude && amb.destinationLatitude) {
        const routeRes = await fetchRoute(
          amb.latitude,
          amb.longitude,
          amb.destinationLatitude,
          amb.destinationLongitude
        );
        simulatedRoute = routeRes.coordinates;
        simulatedTwin.ambulance.route = simulatedRoute;
        simulatedTwin.ambulance.routeDistance = routeRes.distanceMeters;
        if (scenarioType === 'GREEN_CORRIDOR_UNAVAILABLE') {
          simulatedTwin.ambulance.routeDuration = Math.round(routeRes.durationSeconds * 1.35);
          simulatedTwin.ambulance.eta = Math.round(routeRes.durationSeconds * 1.35);
        } else if (scenarioType === 'TRAFFIC_INCREASE') {
          const factor = 1 + (params.trafficIncreasePercent || 30) / 100;
          simulatedTwin.ambulance.routeDuration = Math.round(routeRes.durationSeconds * factor);
          simulatedTwin.ambulance.eta = Math.round(routeRes.durationSeconds * factor);
        } else {
          simulatedTwin.ambulance.routeDuration = routeRes.durationSeconds;
          simulatedTwin.ambulance.eta = routeRes.durationSeconds;
        }
      }
    } catch (err) {
      console.warn('[WhatIfEngine] Scenario route calculation fallback engaged:', err);
    }
    eventBus.publish('SCENARIO_ROUTE_CALCULATED', { scenarioId: scenario.id, routeLength: simulatedRoute.length }, 'WHAT_IF_ENGINE');

    // 4. Re-evaluate hospital selection for scenario
    let simulatedHospitalName: string | undefined = liveState.hospital.selectedHospital?.name;
    try {
      if (liveState.activeIncident) {
        const best = selectBestHospital(
          liveState.activeIncident.latitude,
          liveState.activeIncident.longitude,
          simulatedTwin.hospital.allHospitals
        );
        if (best) {
          simulatedHospitalName = best.hospital.name;
          simulatedTwin.hospital.selectedHospital = best.hospital;
        }
      }
    } catch (err) {
      console.warn('[WhatIfEngine] Scenario hospital selection fallback engaged:', err);
    }

    // 5. Compute scenario evaluation metrics & impact
    const baseEvaluation = scenarioEvaluator.evaluate(
      scenario,
      liveState,
      simulatedTwin,
      simulatedRoute,
      simulatedHospitalName
    );
    eventBus.publish('SCENARIO_EVALUATED', { scenarioId: scenario.id, impactScore: baseEvaluation.impactScore }, 'WHAT_IF_ENGINE');

    // 6. AI Analysis (NIM or Rule-Based Fallback)
    const aiAnalysis = await this.evaluateAIAnalysis(baseEvaluation, scenario);
    eventBus.publish('SCENARIO_AI_ANALYZED', { scenarioId: scenario.id, recommendation: aiAnalysis.recommendation }, 'WHAT_IF_ENGINE');

    const result: ScenarioEvaluationResult = {
      ...baseEvaluation,
      aiAnalysis,
    };

    eventBus.publish('SCENARIO_COMPLETED', { scenarioId: scenario.id, result }, 'WHAT_IF_ENGINE');

    return result;
  }

  private async evaluateAIAnalysis(
    baseEval: Omit<ScenarioEvaluationResult, 'aiAnalysis'>,
    scenario: Scenario
  ): Promise<{
    recommendation: ScenarioAIRecommendation;
    reason: string;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    keyRisks: string[];
  }> {
    const { impactScore, delta, baseline, simulated } = baseEval;

    // Try NIM API if available, else deterministic fallback
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: {
            id: scenario.id,
            type: 'WHAT_IF_SIMULATION',
            severity: impactScore > 60 ? 'CRITICAL' : 'HIGH',
            description: `What-If Analysis: ${scenario.name} - ${scenario.description}`,
          },
          scenarioContext: {
            impactScore,
            etaDeltaSeconds: delta.etaDeltaSeconds,
            hospitalChanged: delta.hospitalChanged,
            baselineEta: baseline.etaSeconds,
            simulatedEta: simulated.etaSeconds,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data && data.recommendation) {
          const rawRec = data.recommendation as string;
          let recommendation: ScenarioAIRecommendation = 'KEEP_CURRENT_PLAN';
          if (rawRec === 'REVIEW_PLAN' || impactScore >= 40) recommendation = 'REVIEW_PLAN';
          if (rawRec === 'RECOMMEND_ALTERNATIVE' || impactScore >= 70) recommendation = 'RECOMMEND_ALTERNATIVE';

          return {
            recommendation,
            reason: data.reason || `NIM AI evaluation identifies ${impactScore} impact score under ${scenario.name}.`,
            confidence: (data.confidence as 'LOW' | 'MEDIUM' | 'HIGH') || (impactScore > 50 ? 'HIGH' : 'MEDIUM'),
            keyRisks: data.keyRisks || [
              `Response time delayed by +${Math.round(delta.etaDeltaSeconds / 60)} minutes`,
              delta.hospitalChanged ? 'Primary hospital capacity depleted' : 'Congestion along primary corridors',
            ],
          };
        }
      }
    } catch (err) {
      // NIM API offline or timed out; execute transparent rule-based fallback
    }

    // Deterministic Rule-Based Fallback Analysis
    let recommendation: ScenarioAIRecommendation = 'KEEP_CURRENT_PLAN';
    if (impactScore >= 70 || delta.hospitalChanged) {
      recommendation = 'RECOMMEND_ALTERNATIVE';
    } else if (impactScore >= 35) {
      recommendation = 'REVIEW_PLAN';
    }

    const keyRisks: string[] = [];
    if (delta.etaDeltaSeconds > 120) {
      keyRisks.push(`ETA increased by +${Math.round(delta.etaDeltaSeconds / 60)} minutes due to ${scenario.name.toLowerCase()}`);
    }
    if (delta.hospitalChanged) {
      keyRisks.push(`Primary destination hospital requires reassignment to ${delta.alternativeHospitalName}`);
    }
    if (simulated.trafficImpactIndex > 0.7) {
      keyRisks.push('High traffic congestion index threatens response velocity');
    }
    if (keyRisks.length === 0) {
      keyRisks.push('Minor operational variance detected; current plan remains within safety margin');
    }

    return {
      recommendation,
      reason: `Rule-based evaluation model determined ${recommendation} based on impact score ${impactScore}/100 and ETA delta +${Math.round(delta.etaDeltaSeconds / 60)}m.`,
      confidence: impactScore > 60 ? 'HIGH' : 'MEDIUM',
      keyRisks,
    };
  }
}

export const whatIfEngine = new WhatIfEngine();
