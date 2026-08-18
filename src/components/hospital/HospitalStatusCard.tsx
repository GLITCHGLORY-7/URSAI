import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { Building2, Bed, Activity, CheckCircle, Clock } from 'lucide-react';

export const HospitalStatusCard: React.FC = () => {
  const { state } = useUrsai();
  const { hospital } = state;
  const selectedHospital = hospital.selectedHospital;

  if (!selectedHospital) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <Building2 className="w-4 h-4" />
            <span>HOSPITAL AGENT</span>
          </div>
          <span className="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded text-[10px]">
            STANDBY
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          No emergency medical center assigned. Awaiting AI decision dispatch.
        </div>
      </div>
    );
  }

  const factors = hospital.selectionFactors;

  return (
    <div className="bg-slate-900 border border-teal-800/80 rounded-lg p-4 shadow-xl font-mono text-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-teal-400 font-bold">
          <Building2 className="w-4 h-4 text-teal-400" />
          <span className="uppercase tracking-wider">HOSPITAL AGENT</span>
        </div>
        <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded text-[10px] font-bold uppercase">
          {hospital.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Selected Center Info */}
      <div className="bg-slate-950 border border-slate-800 p-3 rounded space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold text-slate-100 text-sm">{selectedHospital.name}</div>
            <div className="text-[10px] text-teal-400 font-semibold uppercase mt-0.5">
              {selectedHospital.dataNotice}
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] rounded font-bold">
            READY
          </span>
        </div>

        {/* Capacity Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center gap-1">
              <Bed className="w-3 h-3 text-emerald-400" />
              <span>Beds</span>
            </div>
            <div className="font-bold text-emerald-400 text-sm mt-0.5">
              {selectedHospital.bedsAvailable} Available
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>ICU Beds</span>
            </div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">
              {selectedHospital.icuBedsAvailable} ICU
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-sky-400" />
              <span>Emergency</span>
            </div>
            <div className="font-bold text-sky-400 text-sm mt-0.5">
              {selectedHospital.emergencyReady ? 'STANDBY' : 'OFFLINE'}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Score Breakdown */}
      {factors && (
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded space-y-1 text-[11px]">
          <div className="text-slate-400 font-bold text-[10px] uppercase border-b border-slate-800 pb-1 flex justify-between">
            <span>DETERMINISTIC SELECTION SCORE</span>
            <span className="text-teal-400 font-bold">{factors.totalScore} / 250 PTS</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 text-slate-300 text-[10px] pt-1">
            <div>Distance: <span className="text-slate-100 font-semibold">{factors.distanceKm} km</span></div>
            <div>Bed Score: <span className="text-slate-100 font-semibold">+{factors.beds * 2} pts</span></div>
            <div>ICU Score: <span className="text-slate-100 font-semibold">+{factors.icu * 5} pts</span></div>
            <div>Readiness: <span className="text-slate-100 font-semibold">+{factors.emergencyReady ? 50 : 0} pts</span></div>
          </div>
        </div>
      )}

      {/* Progression Timeline */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-teal-400" />
          <span>Lifecycle Stage:</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-teal-300">
          <span className={hospital.status === 'SELECTED' ? 'text-teal-400 underline' : ''}>Selected</span> &rarr;
          <span className={hospital.status === 'NOTIFIED' ? 'text-teal-400 underline' : ''}>Notified</span> &rarr;
          <span className={hospital.status === 'PREPARING' ? 'text-teal-400 underline' : ''}>Preparing</span> &rarr;
          <span className={hospital.status === 'READY' ? 'text-emerald-400 underline' : ''}>Ready</span> &rarr;
          <span className={hospital.status === 'PATIENT_RECEIVED' ? 'text-emerald-400 underline' : ''}>Received</span>
        </div>
      </div>
    </div>
  );
};
