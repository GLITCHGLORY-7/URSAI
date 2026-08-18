import { Incident, AIDecision, ReplanRecommendation, UrsaiState } from '../types/ursai';
import { validateAIDecision } from './decisionValidator';
import { getFallbackDecision } from './fallbackDecisionEngine';
import { validateReplanRecommendation } from './replanValidator';
import { generateFallbackReplan } from './fallbackReplanner';
import { buildSituationSnapshot } from './situationAnalyzer';

export async function fetchAIDecision(
  incident: Incident,
  availableHospitalsCount: number = 6
): Promise<AIDecision> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/api/decision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        incident: {
          id: incident.id,
          type: incident.type,
          severity: incident.severity,
          latitude: incident.latitude,
          longitude: incident.longitude,
          description: incident.description,
        },
        availableResources: {
          ambulanceAvailable: true,
          policeAvailable: true,
          trafficOverrideReady: true,
          hospitalCount: availableHospitalsCount,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[NIM Service] Backend decision route returned HTTP ${response.status}`);
      return getFallbackDecision(incident);
    }

    const data = await response.json();

    if (!data.ok || data.fallback) {
      console.info(`[NIM Service] Using Fallback Engine: ${data.reason || 'NIM unavailable'}`);
      return getFallbackDecision(incident);
    }

    const validation = validateAIDecision(data.decision);
    if (!validation.isValid || !validation.data) {
      console.warn(`[NIM Service] AI decision schema validation failed: ${validation.error}`);
      return getFallbackDecision(incident);
    }

    return validation.data;
  } catch (error: any) {
    clearTimeout(timeout);
    const isAbort = error.name === 'AbortError' || error.message?.includes('aborted');
    if (isAbort) {
      console.info('[NIM Service] Decision request timed out or aborted. Engaging fallback engine.');
    } else {
      console.warn(`[NIM Service] Network error fetching AI decision: ${error.message}`);
    }
    return getFallbackDecision(incident);
  }
}

export async function fetchReplanRecommendation(
  state: UrsaiState,
  triggers: string[]
): Promise<ReplanRecommendation> {
  const snapshot = buildSituationSnapshot(state);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/api/replan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshot,
        currentPlan: state.mission?.currentPlan,
        triggers,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return generateFallbackReplan(state, triggers);
    }

    const data = await response.json();
    if (!data.ok || data.fallback) {
      return generateFallbackReplan(state, triggers);
    }

    const val = validateReplanRecommendation(data.recommendation);
    if (!val.valid || !val.recommendation) {
      return generateFallbackReplan(state, triggers);
    }

    return val.recommendation;
  } catch (err: any) {
    clearTimeout(timeout);
    return generateFallbackReplan(state, triggers);
  }
}

