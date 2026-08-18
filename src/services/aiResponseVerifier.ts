import { AIDecision, PredictionData, ReplanRecommendation, Severity, RequiredAgent } from '../types/ursai';
import { logger } from './logger';

export interface AIVerificationResult<T> {
  isValid: boolean;
  data: T | null;
  error?: string;
  source: 'VERIFIED_AI' | 'REJECTED_AI';
}

const VALID_SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_AGENTS: RequiredAgent[] = ['AMBULANCE', 'POLICE', 'TRAFFIC', 'HOSPITAL'];
const VALID_PRED_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function verifyAIDecisionResponse(raw: any): AIVerificationResult<AIDecision> {
  if (!raw || typeof raw !== 'object') {
    logger.warn('AI Decision validation failed: payload is not an object');
    return { isValid: false, data: null, error: 'Payload is not an object', source: 'REJECTED_AI' };
  }

  const severity = String(raw.severity || '').toUpperCase() as Severity;
  const priority = String(raw.priority || severity || 'MEDIUM').toUpperCase() as Severity;

  if (!VALID_SEVERITIES.includes(severity)) {
    return { isValid: false, data: null, error: `Invalid severity: ${raw.severity}`, source: 'REJECTED_AI' };
  }

  const rawAgents = Array.isArray(raw.requiredAgents) ? raw.requiredAgents : ['AMBULANCE'];
  const requiredAgents: RequiredAgent[] = rawAgents
    .map((a: any) => String(a).toUpperCase())
    .filter((a: any) => VALID_AGENTS.includes(a as RequiredAgent));

  if (requiredAgents.length === 0) {
    requiredAgents.push('AMBULANCE');
  }

  const reason = typeof raw.reason === 'string' && raw.reason.trim().length > 0
    ? raw.reason.trim()
    : 'Emergency dispatch protocol active.';

  const verified: AIDecision = {
    severity,
    priority,
    requiredAgents,
    hospitalRequired: Boolean(raw.hospitalRequired ?? true),
    greenCorridor: Boolean(raw.greenCorridor ?? (severity === 'CRITICAL' || severity === 'HIGH')),
    reason,
    engine: 'NVIDIA NIM',
    status: 'ACTIVE',
    timestamp: new Date().toISOString(),
  };

  logger.info('AI Decision response verified successfully', { engine: verified.engine, severity: verified.severity });
  return { isValid: true, data: verified, source: 'VERIFIED_AI' };
}

export function verifyAIPredictionResponse(raw: any): AIVerificationResult<PredictionData> {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, data: null, error: 'Prediction payload is not an object', source: 'REJECTED_AI' };
  }

  const checkInsight = (obj: any, fallbackDesc: string) => {
    if (!obj || typeof obj !== 'object') {
      return { level: 'MEDIUM' as const, description: fallbackDesc };
    }
    const level = String(obj.level || 'MEDIUM').toUpperCase();
    const validLevel = VALID_PRED_LEVELS.includes(level) ? (level as any) : 'MEDIUM';
    const description = typeof obj.description === 'string' && obj.description.trim() ? obj.description.trim() : fallbackDesc;
    return { level: validLevel, description };
  };

  const trafficImpact = checkInsight(raw.trafficImpact, 'Evaluating corridor traffic congestion.');
  const responseRisk = checkInsight(raw.responseRisk, 'Evaluating emergency transit risk.');
  const hospitalDemand = checkInsight(raw.hospitalDemand, 'Evaluating hospital intake capacity.');
  const routeDifficulty = checkInsight(raw.routeDifficulty, 'Evaluating route difficulty index.');

  const minutes = Number(raw.predictedResponseTimeMinutes);
  if (isNaN(minutes) || minutes <= 0 || minutes > 180) {
    return { isValid: false, data: null, error: 'Invalid response time range', source: 'REJECTED_AI' };
  }

  const monitoring = Array.isArray(raw.recommendedMonitoring)
    ? raw.recommendedMonitoring.map((m: any) => String(m).trim()).filter(Boolean)
    : ['Monitor emergency transit progress'];

  const verified: PredictionData = {
    trafficImpact,
    responseRisk,
    hospitalDemand,
    routeDifficulty,
    predictedResponseTimeMinutes: Math.round(minutes),
    recommendedMonitoring: monitoring.length > 0 ? monitoring : ['Monitor ambulance transit'],
    situationSummary: typeof raw.situationSummary === 'string' && raw.situationSummary.trim()
      ? raw.situationSummary.trim()
      : 'Simulated city condition analysis complete.',
  };

  logger.info('AI Prediction response verified successfully');
  return { isValid: true, data: verified, source: 'VERIFIED_AI' };
}

export function verifyAIReplanResponse(raw: any): AIVerificationResult<ReplanRecommendation> {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, data: null, error: 'Replan payload is not an object', source: 'REJECTED_AI' };
  }

  const rec = String(raw.recommendation || '').toUpperCase();
  if (rec !== 'KEEP_PLAN' && rec !== 'REPLAN') {
    return { isValid: false, data: null, error: `Invalid recommendation: ${rec}`, source: 'REJECTED_AI' };
  }

  const prio = String(raw.priority || 'MEDIUM').toUpperCase();
  const priority = VALID_PRED_LEVELS.includes(prio) ? (prio as any) : 'MEDIUM';

  const reason = typeof raw.reason === 'string' && raw.reason.trim()
    ? raw.reason.trim()
    : 'Mission baseline review complete.';

  const rawChanges = Array.isArray(raw.changes) ? raw.changes : [];
  const changes = rawChanges
    .filter((ch: any) => ch && typeof ch === 'object' && VALID_AGENTS.includes(String(ch.target || '').toUpperCase() as any))
    .map((ch: any) => ({
      target: String(ch.target).toUpperCase() as any,
      action: typeof ch.action === 'string' ? ch.action : 'REASSESS_ASSIGNMENT',
      reason: typeof ch.reason === 'string' ? ch.reason : 'Condition update detected.',
    }));

  const verified: ReplanRecommendation = {
    recommendation: rec as any,
    priority,
    reason,
    changes,
  };

  logger.info('AI Replan response verified successfully', { recommendation: verified.recommendation });
  return { isValid: true, data: verified, source: 'VERIFIED_AI' };
}
