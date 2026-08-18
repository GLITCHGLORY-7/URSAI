import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { BarChart3, Shield, Cpu, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

export const AuditPanel: React.FC = () => {
  const { state } = useUrsai();

  const planVersion = state.mission?.planVersion || 1;
  const replanCount = state.mission?.replanningCount || 0;
  const isNim = state.aiDecision?.engine === 'NVIDIA NIM';

  const aiDecisionsCount = isNim ? 1 : 0;
  const fallbackDecisionsCount = isNim ? 0 : 1;
  const activeRoutesCount = (state.ambulance.route.length > 0 ? 1 : 0) + (state.police.route.length > 0 ? 1 : 0);
  const systemWarningsCount = state.logs.filter((l) => l.type === 'warning' || l.type === 'danger').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Mission Operational Telemetry</h3>
            <p className="text-[11px] text-slate-400">System Execution & Audit Metrics</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-950 text-slate-400">
          SIMULATED TELEMETRY
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
        <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Plan Ver.</div>
          <div className="text-sm font-bold text-indigo-400 mt-0.5">v{planVersion}</div>
        </div>

        <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Replans</div>
          <div className="text-sm font-bold text-amber-400 mt-0.5">{replanCount}</div>
        </div>

        <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">NIM Calls</div>
          <div className="text-sm font-bold text-cyan-400 mt-0.5">{aiDecisionsCount}</div>
        </div>

        <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Fallbacks</div>
          <div className="text-sm font-bold text-slate-300 mt-0.5">{fallbackDecisionsCount}</div>
        </div>

        <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Active Routes</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{activeRoutesCount}</div>
        </div>

        <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Warnings</div>
          <div className={`text-sm font-bold mt-0.5 ${systemWarningsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {systemWarningsCount}
          </div>
        </div>
      </div>
    </div>
  );
};
