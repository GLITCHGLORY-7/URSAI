import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { formatTime } from '../../incidents/incidentManager';
import { SEVERITY_LEVELS } from '../../incidents/incidentTypes';
import { AlertTriangle, MapPin, Clock, ShieldAlert, Building2 } from 'lucide-react';

export const IncidentCard: React.FC = () => {
  const { state } = useUrsai();
  const { activeIncident, hospital } = state;

  if (!activeIncident) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 text-slate-400 font-mono text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800 pb-2">
          <ShieldAlert className="w-4 h-4 text-slate-500" />
          <span>INCIDENT COMMAND MATRIX</span>
        </div>
        <div className="py-6 text-center text-slate-500 space-y-1">
          <p className="font-semibold text-slate-400">NO ACTIVE INCIDENT</p>
          <p className="text-[11px] font-sans text-slate-500">
            Click <span className="text-red-400 font-semibold">REPORT INCIDENT</span> to simulate a real emergency dispatch.
          </p>
        </div>
      </div>
    );
  }

  const severityConfig = SEVERITY_LEVELS.find((s) => s.severity === activeIncident.severity);
  const selectedHospital = hospital.selectedHospital;

  return (
    <div className="bg-slate-900/90 border border-red-900/60 rounded-lg p-4 font-mono text-xs text-slate-200 space-y-3 shadow-lg shadow-red-950/20">
      {/* Header with Incident ID and Severity Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-bold text-red-400 text-sm tracking-wide">{activeIncident.id}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider ${
            severityConfig?.bgClass || 'bg-red-950 text-red-300 border-red-800'
          }`}
        >
          {activeIncident.severity}
        </span>
      </div>

      {/* Grid of Key Properties */}
      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Incident Type</span>
          <span className="font-semibold text-slate-100">{activeIncident.type}</span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Current Lifecycle</span>
          <span className={`font-semibold ${activeIncident.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {activeIncident.status}
          </span>
        </div>

        <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>
              {activeIncident.latitude.toFixed(4)}, {activeIncident.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Clock className="w-3 h-3" />
            <span>Created: {formatTime(activeIncident.createdAt)}</span>
          </div>
        </div>

        {selectedHospital && (
          <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-slate-800/60 text-teal-300 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">Destination: <strong className="text-slate-100">{selectedHospital.name}</strong></span>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <span className="text-slate-500 block text-[10px] uppercase">Operator Dispatch Notes</span>
        <p className="text-slate-300 italic font-sans text-xs bg-slate-950/40 p-2 rounded border border-slate-800/50 mt-1">
          "{activeIncident.description}"
        </p>
      </div>
    </div>
  );
};
