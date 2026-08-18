import { AIDecision, AISeverity, AIPriority, RequiredAgent } from '../types/ursai';

const VALID_SEVERITIES: AISeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_PRIORITIES: AIPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_AGENTS: RequiredAgent[] = ['AMBULANCE', 'POLICE', 'TRAFFIC', 'HOSPITAL'];

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

export function validateAIDecision(raw: any): ValidationResult<AIDecision> {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, error: 'AI decision payload is missing or not an object.' };
  }

  // Handle potential nested JSON string or wrapped response
  let payload = raw;
  if (typeof raw.decision === 'object') {
    payload = raw.decision;
  }

  const severity = String(payload.severity || '').toUpperCase() as AISeverity;
  const priority = String(payload.priority || '').toUpperCase() as AIPriority;
  const reason = String(payload.reason || '').trim();

  if (!VALID_SEVERITIES.includes(severity)) {
    return { isValid: false, error: `Invalid AI severity value: ${payload.severity}` };
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return { isValid: false, error: `Invalid AI priority value: ${payload.priority}` };
  }

  if (typeof payload.hospitalRequired !== 'boolean') {
    return { isValid: false, error: 'hospitalRequired must be a boolean.' };
  }

  if (typeof payload.greenCorridor !== 'boolean') {
    return { isValid: false, error: 'greenCorridor must be a boolean.' };
  }

  if (!reason) {
    return { isValid: false, error: 'Reason string is empty.' };
  }

  if (!Array.isArray(payload.requiredAgents)) {
    return { isValid: false, error: 'requiredAgents must be an array.' };
  }

  const requiredAgents: RequiredAgent[] = [];
  for (const agent of payload.requiredAgents) {
    const formatted = String(agent).toUpperCase() as RequiredAgent;
    if (VALID_AGENTS.includes(formatted)) {
      if (!requiredAgents.includes(formatted)) {
        requiredAgents.push(formatted);
      }
    }
  }

  if (requiredAgents.length === 0) {
    return { isValid: false, error: 'No valid requiredAgents specified.' };
  }

  const decision: AIDecision = {
    severity,
    priority,
    requiredAgents,
    hospitalRequired: payload.hospitalRequired,
    greenCorridor: payload.greenCorridor,
    reason,
    engine: payload.engine === 'FALLBACK RULE ENGINE' ? 'FALLBACK RULE ENGINE' : 'NVIDIA NIM',
    status: 'ACTIVE',
    timestamp: new Date().toISOString(),
  };

  return { isValid: true, data: decision };
}
