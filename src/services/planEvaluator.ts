import { evaluateActiveMission, PlanEvaluationResult } from './missionMonitor';
import { UrsaiState, ResponsePlan } from '../types/ursai';

export function evaluatePlan(state: UrsaiState, plan: ResponsePlan | null): PlanEvaluationResult {
  return evaluateActiveMission(state, plan);
}
