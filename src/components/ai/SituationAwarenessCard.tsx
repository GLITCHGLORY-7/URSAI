import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { PredictionLevel } from '../../types/ursai';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  Car,
  Activity,
  Clock,
  CheckCircle2,
  Cpu,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export const SituationAwarenessCard: React.FC = () => {
  const { state } = useUrsai();
  const { prediction, activeIncident } = state;

  if (!activeIncident) {
    return (
      <div className="bg-slate-900/90 border border-purple-500/20 rounded-lg p-4 text-slate-400 text-xs shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold tracking-wider text-xs uppercase">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span>Situation Awareness & Predictive Intelligence</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded border border-slate-800">
          <span className="text-slate-500 italic">No active incident. Predictive Engine in standby monitoring mode.</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            STANDBY
          </span>
        </div>
      </div>
    );
  }

  const getLevelBadge = (level: PredictionLevel | null) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">N/A</span>;
    }
  };

  const isAnalyzing = prediction.status === 'ANALYZING';
  const isNim = prediction.source === 'NVIDIA_NIM';
  const isFallback = prediction.source === 'RULE_BASED_FALLBACK';

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-lg p-4 text-slate-100 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 border-b border-purple-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <BrainCircuit className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-200">
              Situation Awareness & Predictive Intelligence
            </h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Eye className="w-3 h-3 text-purple-400" />
              <span>Real-Time Advisory Layer • Observation Mode</span>
            </p>
          </div>
        </div>

        {/* Source Badge */}
        <div>
          {isAnalyzing ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
              <Sparkles className="w-3 h-3 animate-spin" />
              ANALYZING SNAPSHOT...
            </span>
          ) : isNim ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-sm">
              <Cpu className="w-3 h-3 text-purple-400" />
              NVIDIA NIM AI
            </span>
          ) : isFallback ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              RULE-BASED FALLBACK
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
              STANDBY
            </span>
          )}
        </div>
      </div>

      {/* Main Predictive Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3">
        {/* Traffic Impact Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              Traffic Impact
            </span>
            {getLevelBadge(prediction.trafficImpact?.level || null)}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
            {prediction.trafficImpact?.description || 'Evaluating traffic parameters across emergency route...'}
          </p>
        </div>

        {/* Response Risk Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Response Risk
            </span>
            {getLevelBadge(prediction.responseRisk?.level || null)}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
            {prediction.responseRisk?.description || 'Evaluating emergency operational risk factors...'}
          </p>
        </div>

        {/* Hospital Demand Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Hospital Demand
            </span>
            {getLevelBadge(prediction.hospitalDemand?.level || null)}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
            {prediction.hospitalDemand?.description || 'Evaluating hospital emergency room intake capacity...'}
          </p>
        </div>
      </div>

      {/* Response Time Estimate & Recommended Monitoring Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 mb-2.5">
        {/* Estimated Response Time Metric */}
        <div className="md:col-span-5 bg-purple-950/30 border border-purple-500/20 rounded p-2.5 flex flex-col justify-center">
          <div className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" />
            Predicted Response Time
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono font-bold text-purple-200">
              {prediction.predictedResponseTimeMinutes ? `~${prediction.predictedResponseTimeMinutes} MINS` : '--'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">(Strategic Estimate)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">
            AI estimate based on state snapshot. Live ETA tracked separately in agent panel.
          </p>
        </div>

        {/* Recommended Monitoring Bullet List */}
        <div className="md:col-span-7 bg-slate-950/70 border border-slate-800 rounded p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Recommended Monitoring Protocols
          </div>
          <ul className="space-y-1">
            {(prediction.recommendedMonitoring.length > 0
              ? prediction.recommendedMonitoring
              : [
                  'Monitor Ambulance ETA to scene and destination hospital',
                  'Track Green Corridor traffic signal override status',
                  'Observe medical center ICU capacity & bed availability',
                ]
            ).map((item, idx) => (
              <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advisory Footer Notice */}
      <div className="text-[10px] text-slate-400 bg-slate-950/40 rounded p-1.5 border border-slate-800/60 flex items-center justify-between">
        <span className="italic">
          * Advisory intelligence only. All agent actions are strictly governed by the Central Coordinator.
        </span>
        {prediction.lastUpdated && (
          <span className="font-mono text-[9px] text-slate-400">
            Updated: {new Date(prediction.lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
