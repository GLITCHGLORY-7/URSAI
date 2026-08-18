import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { formatEta, formatDistance } from '../../incidents/incidentManager';
import { Shield, Navigation, Clock } from 'lucide-react';

export const PoliceStatusCard: React.FC = () => {
  const { state } = useUrsai();
  const { police } = state;

  const isEnRoute = police.status === 'EN_ROUTE' || police.status === 'DISPATCHED';
  const isOnScene = police.status === 'ON_SCENE';

  return (
    <div
      className={`border rounded-lg p-3.5 font-mono text-xs space-y-2.5 transition-all ${
        isOnScene
          ? 'bg-indigo-950/30 border-indigo-800/80 text-indigo-200'
          : isEnRoute
          ? 'bg-indigo-950/20 border-indigo-800/60 text-indigo-200'
          : 'bg-slate-900/80 border-slate-800 text-slate-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Shield
            className={`w-4 h-4 ${
              isOnScene ? 'text-indigo-400' : isEnRoute ? 'text-indigo-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span className="font-bold text-slate-100 tracking-wide">POLICE AGENT (POL-01)</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isOnScene
              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
              : isEnRoute
              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {police.status}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2 rounded border border-slate-800/80">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">ETA to Scene</span>
          <div className="flex items-center gap-1 font-semibold text-slate-200 mt-0.5">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{formatEta(police.eta)}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Route Distance</span>
          <div className="flex items-center gap-1 font-semibold text-slate-200 mt-0.5">
            <Navigation className="w-3 h-3 text-indigo-400" />
            <span>{formatDistance(police.routeDistance)}</span>
          </div>
        </div>

        <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-slate-500 text-[10px]">CURRENT TASK:</span>
          <span className="font-medium text-slate-200 text-[11px]">
            {police.currentTask || 'STANDBY AT DEPOT'}
          </span>
        </div>
      </div>

      {/* Resource Disclaimer */}
      <div className="text-[10px] text-slate-500 italic">
        Depot: Egmore Police HQ (Simulated Resource)
      </div>
    </div>
  );
};
