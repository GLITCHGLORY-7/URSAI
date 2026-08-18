import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { Cpu, CheckCircle2, AlertTriangle, Activity, ShieldCheck, Siren, Navigation, Building2, Zap } from 'lucide-react';

export const AIDecisionEngine: React.FC = () => {
  const { state } = useUrsai();
  const { aiDecision, aiStatus, ambulance, police, traffic, hospital } = state;

  if (aiStatus === 'IDLE' && !aiDecision) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-400 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Cpu className="w-4 h-4 text-slate-500 animate-pulse" />
            <span className="uppercase tracking-wider">AI DECISION ENGINE</span>
          </div>
          <span className="px-2 py-0.5 bg-slate-950 text-slate-500 border border-slate-800 rounded text-[10px] font-bold">
            ENGINE IDLE
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-2 h-2 rounded-full bg-slate-600 animate-ping shrink-0"></div>
          <div>
            <div className="font-semibold text-slate-300">NVIDIA NIM Standby</div>
            <div className="text-[11px] text-slate-500">Awaiting emergency incident trigger to compute swarm routing.</div>
          </div>
        </div>
      </div>
    );
  }

  if (aiStatus === 'ANALYZING' && !aiDecision) {
    return (
      <div className="bg-slate-900 border border-cyan-800/80 rounded-lg p-4 font-mono text-xs space-y-3 shadow-xl shadow-cyan-950/20 animate-pulse">
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Activity className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="uppercase tracking-wider">AI DECISION ENGINE</span>
          </div>
          <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[10px] font-bold">
            COMPUTING DECISION
          </span>
        </div>
        <div className="text-slate-300 text-[11px] space-y-1">
          <p className="font-semibold text-cyan-300">NVIDIA NIM Llama-3.3-70B Processing...</p>
          <p className="text-slate-400">Evaluating spatial distance, traffic green corridors, hospital bed availability & swarm allocation.</p>
        </div>
      </div>
    );
  }

  if (!aiDecision) return null;

  const isFallback = aiDecision.engine === 'FALLBACK RULE ENGINE';

  // Helper to resolve agent current operational status
  const getAgentStatus = (agentName: string) => {
    switch (agentName) {
      case 'AMBULANCE':
        return ambulance.status;
      case 'POLICE':
        return police.status;
      case 'TRAFFIC':
        return traffic.status;
      case 'HOSPITAL':
        return hospital.status;
      default:
        return 'ACTIVE';
    }
  };

  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'AMBULANCE':
        return <Siren className="w-3.5 h-3.5 text-blue-400" />;
      case 'POLICE':
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'TRAFFIC':
        return <Navigation className="w-3.5 h-3.5 text-emerald-400" />;
      case 'HOSPITAL':
        return <Building2 className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`bg-slate-900 border ${
        isFallback ? 'border-amber-800/80 shadow-amber-950/30' : 'border-cyan-800/80 shadow-cyan-950/30'
      } rounded-lg p-4 shadow-xl font-mono text-xs space-y-3.5`}
    >
      {/* Header with Engine Status & Engine Identifier */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 ${isFallback ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span className="font-bold text-slate-100 uppercase tracking-wider">
            AI DECISION ENGINE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              isFallback
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
            }`}
          >
            {isFallback ? 'FALLBACK ENGINE' : 'NVIDIA NIM'}
          </span>
          {isFallback ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          )}
        </div>
      </div>

      {/* Primary Metrics: Severity & Priority */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Severity */}
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Incident Severity</div>
          <div className="font-bold text-red-400 text-sm mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
            <span>{aiDecision.severity}</span>
          </div>
        </div>

        {/* Priority */}
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Dispatch Priority</div>
          <div className="font-bold text-amber-400 text-sm mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            <span>{aiDecision.priority}</span>
          </div>
        </div>
      </div>

      {/* Active Agents List */}
      <div>
        <div className="text-slate-400 text-[10px] uppercase font-bold mb-1.5 flex items-center justify-between">
          <span>Active Swarm Agents</span>
          <span className="text-cyan-400">{aiDecision.requiredAgents.length} DEPLOYED</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {aiDecision.requiredAgents.map((agent) => {
            const currentStatus = getAgentStatus(agent);
            return (
              <div
                key={agent}
                className="bg-slate-950 border border-slate-800/90 p-2 rounded flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {getAgentIcon(agent)}
                  <span className="font-bold text-slate-200 text-[11px] truncate">{agent}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded uppercase font-semibold shrink-0">
                  {currentStatus.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traffic & Hospital Directives */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded flex items-center justify-between">
          <span className="text-slate-400">Green Corridor:</span>
          <span className={`font-bold ${aiDecision.greenCorridor ? 'text-emerald-400' : 'text-slate-500'}`}>
            {aiDecision.greenCorridor ? 'ENGAGED' : 'INACTIVE'}
          </span>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded flex items-center justify-between">
          <span className="text-slate-400">Hospital Center:</span>
          <span className={`font-bold ${aiDecision.hospitalRequired ? 'text-teal-400' : 'text-slate-500'}`}>
            {aiDecision.hospitalRequired ? 'REQUIRED' : 'NOT NEEDED'}
          </span>
        </div>
      </div>

      {/* Strategic Explanation */}
      <div className="bg-slate-950 border border-slate-800/80 p-2.5 rounded text-[11px] text-slate-300 leading-relaxed">
        <span className="font-bold text-slate-400">AI Strategic Reason: </span>
        <span className="italic text-slate-300">"{aiDecision.reason}"</span>
      </div>
    </div>
  );
};

export default AIDecisionEngine;
