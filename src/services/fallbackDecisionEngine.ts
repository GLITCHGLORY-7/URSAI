import { Incident, AIDecision } from '../types/ursai';

/**
 * Deterministic fallback decision engine used when NVIDIA NIM is unavailable,
 * times out, returns malformed JSON, or encounters API errors.
 */
export function getFallbackDecision(incident: Incident): AIDecision {
  const isHighOrCritical =
    incident.severity === 'HIGH' ||
    incident.severity === 'CRITICAL' ||
    incident.type === 'ROAD ACCIDENT' ||
    incident.type === 'FIRE';

  if (isHighOrCritical) {
    return {
      severity: incident.severity,
      priority: incident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      requiredAgents: ['AMBULANCE', 'POLICE', 'TRAFFIC', 'HOSPITAL'],
      hospitalRequired: true,
      greenCorridor: true,
      reason: `Fallback Rule Engine: ${incident.type} [${incident.severity}] requires complete multi-agent emergency swarm response with hospital dispatch and traffic override.`,
      engine: 'FALLBACK RULE ENGINE',
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    severity: incident.severity,
    priority: incident.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
    requiredAgents: ['AMBULANCE', 'POLICE'],
    hospitalRequired: false,
    greenCorridor: false,
    reason: `Fallback Rule Engine: Standard severity incident assigned local ambulance and police response.`,
    engine: 'FALLBACK RULE ENGINE',
    status: 'DEGRADED',
    timestamp: new Date().toISOString(),
  };
}
