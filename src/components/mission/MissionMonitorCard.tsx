import React, { useState } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { fetchReplanRecommendation } from '../../services/nimService';
import { evaluateActiveMission } from '../../services/missionMonitor';
import { computeMissionOptimization } from '../../services/missionOptimizer';
import {
  Compass,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';

export const MissionMonitorCard: React.FC = () => {
  const { state, dispatch } = useUrsai();
  const [isReevaluating, setIsReevaluating] = useState(false);

  const mission = state.mission;
  const optimization = state.optimization;

  if (!state.activeIncident || !mission) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400">
            <Compass className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold">Adaptive Mission Monitor</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800 bg-slate-950 text-slate-500">
            STANDBY
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          No active mission. Baseline emergency response plan will instantiate upon incident creation.
        </p>
      </div>
    );
  }

  const handleManualReplanCheck = async () => {
    setIsReevaluating(true);
    const evalResult = evaluateActiveMission(state, mission.currentPlan);
    const triggers = evalResult.triggers.length > 0 ? evalResult.triggers : ['USER_MANUAL_REPLAN_REQUEST'];

    dispatch({
      type: 'SET_MISSION_STATUS',
      payload: { status: 'EXECUTING', planStatus: 'REVIEW_REQUIRED' },
    });

    const replanRec = await fetchReplanRecommendation(state, triggers);

    if (replanRec.recommendation === 'REPLAN') {
      const nextVersion = mission.planVersion + 1;
      const newPlan = {
        version: nextVersion,
        timestamp: new Date().toISOString(),
        status: 'ADAPTED' as const,
        reason: replanRec.reason,
        actions: replanRec.changes.map((c) => ({
          agent: c.target,
          action: c.action,
          status: 'EXECUTING' as const,
        })),
      };

      const updatedOpt = computeMissionOptimization(state);
      dispatch({
        type: 'UPDATE_MISSION_PLAN',
        payload: { plan: newPlan, reason: replanRec.reason, optimization: updatedOpt },
      });
    } else {
      dispatch({
        type: 'SET_MISSION_STATUS',
        payload: { status: 'EXECUTING', planStatus: 'VALID' },
      });
      dispatch({
        type: 'ADD_SYSTEM_LOG',
        payload: {
          message: `REPLAN EVALUATION: NVIDIA NIM confirmed current Plan v${mission.planVersion} remains optimal.`,
          type: 'info',
          source: 'NIM_ENGINE',
        },
      });
    }

    setIsReevaluating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ADAPTED':
        return 'text-amber-400 border-amber-800 bg-amber-950/60';
      case 'REVIEW_REQUIRED':
      case 'REPLANNING':
        return 'text-orange-400 border-orange-800 bg-orange-950/60';
      case 'VALID':
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-950/80 border border-indigo-800/60 rounded-lg text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-100">Adaptive Mission Monitor</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {mission.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Real-Time Plan Evaluator & Replanning Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getStatusBadge(mission.planStatus)}`}>
            Plan v{mission.planVersion} • {mission.planStatus}
          </span>
          <button
            onClick={handleManualReplanCheck}
            disabled={isReevaluating}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors disabled:opacity-50"
            title="Force Adaptive Replan Evaluation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReevaluating ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Plan Details & Actions */}
      <div className="space-y-2.5 mb-3">
        <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
          <div className="text-slate-400 font-mono text-[10px] mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" /> Current Plan Version {mission.planVersion} Reasoning
            </span>
            <span>{new Date(mission.currentPlan.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">{mission.currentPlan.reason}</p>
        </div>

        {/* Action targets */}
        {mission.currentPlan.actions.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400">Target Agent Actions:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {mission.currentPlan.actions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-950/60 rounded border border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-300"
                >
                  <span className="text-cyan-400 font-semibold">{act.agent}</span>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-slate-500" /> {act.action.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mission Optimization Score */}
      {optimization && (
        <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Mission Efficiency Score
            </span>
            <span className="font-bold text-slate-100">{optimization.score}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full transition-all duration-500 ${
                optimization.score >= 80
                  ? 'bg-emerald-500'
                  : optimization.score >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${optimization.score}%` }}
            />
          </div>

          {/* Sub-factor breakdowns */}
          <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-slate-400">Response</div>
              <div className="font-semibold text-slate-200 mt-0.5">{optimization.factors.responseTime}%</div>
            </div>
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-slate-400">Route</div>
              <div className="font-semibold text-slate-200 mt-0.5">{optimization.factors.route}%</div>
            </div>
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-slate-400">Hospital</div>
              <div className="font-semibold text-slate-200 mt-0.5">{optimization.factors.hospital}%</div>
            </div>
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
              <div className="text-slate-400">Resources</div>
              <div className="font-semibold text-slate-200 mt-0.5">{optimization.factors.resources}%</div>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-right font-mono text-slate-400">
            SIMULATED OPTIMIZATION SCORE
          </div>
        </div>
      )}
    </div>
  );
};
