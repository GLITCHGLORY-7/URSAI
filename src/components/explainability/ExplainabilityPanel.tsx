import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { HelpCircle, Cpu, ShieldCheck, Navigation, Building2, Compass } from 'lucide-react';

export const ExplainabilityPanel: React.FC = () => {
  const { state } = useUrsai();

  const decision = state.aiDecision;
  const hospital = state.hospital;
  const traffic = state.traffic;
  const mission = state.mission;

  if (!state.activeIncident) {
    return null;
  }

  const isNimAI = decision?.engine === 'NVIDIA NIM';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-800/60 rounded-lg text-cyan-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">AI Decision Explainability</h3>
            <p className="text-[11px] text-slate-400">System Action Rationale & Decision Source Trace</p>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
            isNimAI ? 'text-cyan-400 border-cyan-800 bg-cyan-950/60' : 'text-amber-400 border-amber-800 bg-amber-950/60'
          }`}
        >
          {isNimAI ? 'AI RECOMMENDATION (NVIDIA NIM)' : 'RULE-BASED FALLBACK'}
        </span>
      </div>

      {/* Explanations Grid */}
      <div className="space-y-2.5 text-xs">
        {/* Why Green Corridor */}
        {traffic.greenCorridorActive && (
          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold mb-1 flex items-center gap-1.5">
              <Navigation className="w-3 h-3" /> WHY GREEN CORRIDOR?
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              High-priority ambulance emergency transit requires reduced simulated traffic delay along key corridor segments.
            </p>
          </div>
        )}

        {/* Why Hospital Selected */}
        {hospital.selectedHospital && (
          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-blue-400 uppercase font-semibold mb-1 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> WHY {hospital.selectedHospital.name.toUpperCase()}?
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Selected using optimal simulated route distance ({hospital.selectionFactors?.distanceKm.toFixed(1)} km), ICU beds ({hospital.selectionFactors?.icu} free), and active emergency intake readiness score ({hospital.selectionFactors?.totalScore.toFixed(0)}/100).
            </p>
          </div>
        )}

        {/* Why Replan */}
        {mission && mission.currentPlan && (
          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-indigo-400 uppercase font-semibold mb-1 flex items-center gap-1.5">
              <Compass className="w-3 h-3" /> WHY PLAN v{mission.planVersion}?
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {mission.currentPlan.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
