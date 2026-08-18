import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { Zap, Radio } from 'lucide-react';

export const TrafficStatusCard: React.FC = () => {
  const { state } = useUrsai();
  const { traffic } = state;

  const isActive = traffic.greenCorridorActive;

  return (
    <div
      className={`border rounded-lg p-3.5 font-mono text-xs space-y-2.5 transition-all ${
        isActive
          ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
          : 'bg-slate-900/80 border-slate-800 text-slate-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Zap
            className={`w-4 h-4 ${
              isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span className="font-bold text-slate-100 tracking-wide">TRAFFIC AGENT</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isActive
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {traffic.status}
        </span>
      </div>

      {/* Corridor Display */}
      <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 uppercase text-[10px]">Green Corridor Override:</span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              isActive ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <Radio className={`w-3 h-3 ${isActive ? 'animate-ping' : ''}`} />
            {isActive ? 'ACTIVE (PRIORITY OVERRIDE)' : 'INACTIVE'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 font-sans italic">
          {isActive
            ? 'Emergency green wave activated along calculated ambulance geometry. Signal phase hold engaged.'
            : 'Standing by for active emergency vector routing.'}
        </p>
      </div>
    </div>
  );
};
