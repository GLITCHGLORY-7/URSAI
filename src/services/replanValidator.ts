import { ReplanRecommendation } from '../types/ursai';

const VALID_RECOMMENDATIONS = ['KEEP_PLAN', 'REPLAN'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_TARGETS = ['AMBULANCE', 'POLICE', 'TRAFFIC', 'HOSPITAL'];

export function validateReplanRecommendation(data: any): {
  valid: boolean;
  recommendation: ReplanRecommendation | null;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, recommendation: null, error: 'Replan recommendation is not an object' };
  }

  const rec = String(data.recommendation || '').toUpperCase();
  if (!VALID_RECOMMENDATIONS.includes(rec)) {
    return { valid: false, recommendation: null, error: `Invalid recommendation: ${rec}` };
  }

  const prio = String(data.priority || 'MEDIUM').toUpperCase();
  const priority = VALID_PRIORITIES.includes(prio) ? (prio as any) : 'MEDIUM';

  const reason = typeof data.reason === 'string' && data.reason.trim().length > 0
    ? data.reason.trim()
    : 'System plan evaluation complete.';

  const rawChanges = Array.isArray(data.changes) ? data.changes : [];
  const validatedChanges = rawChanges
    .filter((ch: any) => ch && typeof ch === 'object' && VALID_TARGETS.includes(String(ch.target || '').toUpperCase()))
    .map((ch: any) => ({
      target: String(ch.target).toUpperCase() as any,
      action: typeof ch.action === 'string' ? ch.action : 'REASSESS_ASSIGNMENT',
      reason: typeof ch.reason === 'string' ? ch.reason : 'Condition modification detected.',
    }));

  return {
    valid: true,
    recommendation: {
      recommendation: rec as 'KEEP_PLAN' | 'REPLAN',
      priority,
      reason,
      changes: validatedChanges,
    },
  };
}
