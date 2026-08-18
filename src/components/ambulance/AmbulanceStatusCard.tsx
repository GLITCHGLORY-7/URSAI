import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { formatEta, formatDistance } from '../../incidents/incidentManager';
import { Ambulance, Navigation, Clock, ShieldCheck } from 'lucide-react';

export const AmbulanceStatusCard: React.FC = () => {
  const { state } = useUrsai();
  const { ambulance, traffic } = state;

  const isEnRoute = ambulance.status === 'EN_ROUTE' || ambulance.status === 'DISPATCHED';
  const isAtScene = ambulance.status === 'AT_SCENE';
  const isGreen = traffic.greenCorridorActive;

  return (
    <div
      className={`border rounded-lg p-3.5 font-mono text-xs space-y-2.5 transition-all ${
        isAtScene
          ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
          : isEnRoute
          ? 'bg-blue-950/30 border-blue-800/80 text-blue-200'
          : 'bg-slate-900/80 border-slate-800 text-slate-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Ambulance
            className={`w-4 h-4 ${
              isAtScene ? 'text-emerald-400' : isEnRoute ? 'text-blue-400 animate-bounce' : 'text-slate-500'
            }`}
          />
          <span className="font-bold text-slate-100 tracking-wide">AMBULANCE AGENT (AMB-01)</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isAtScene
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : isEnRoute
              ? 'bg-blue-950 text-blue-300 border-blue-700'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {ambulance.status}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2 rounded border border-slate-800/80">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">ETA to Scene</span>
          <div className="flex items-center gap-1 font-semibold text-slate-200 mt-0.5">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>{formatEta(ambulance.eta)}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Route Distance</span>
          <div className="flex items-center gap-1 font-semibold text-slate-200 mt-0.5">
            <Navigation className="w-3 h-3 text-blue-400" />
            <span>{formatDistance(ambulance.routeDistance)}</span>
          </div>
        </div>

        <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-slate-500 text-[10px]">CURRENT TASK:</span>
          <span className="font-medium text-slate-200 text-[11px]">
            {ambulance.currentTask || 'STANDBY AT DEPOT'}
          </span>
        </div>
      </div>

      {/* Corridor Status Flag */}
      {isGreen && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>GREEN CORRIDOR PRIORITY ENGAGED</span>
        </div>
      )}

      {/* Resource Disclaimer */}
      <div className="text-[10px] text-slate-500 italic">
        Depot: T. Nagar Emergency Hub (Simulated Resource)
      </div>
    </div>
  );
};
