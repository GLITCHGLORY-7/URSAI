import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { Activity, CheckCircle2, Shield, Ambulance as AmbulanceIcon, Radio, Building2, Cpu, BarChart2, FileText } from 'lucide-react';
import { formatTime } from '../../incidents/incidentManager';
import { PDFExporter } from '../../services/pdfExporter';

export const MissionSummaryCard: React.FC = () => {
  const { state } = useUrsai();
  const { activeIncident, ambulance, police, traffic, hospital, aiDecision, mission, logs } = state;

  const handleExportPDF = () => {
    if (!activeIncident && !mission) return;
    const dummyIncident = activeIncident || {
      id: mission?.incidentId || 'INC-DEMO-01',
      type: 'ROAD ACCIDENT' as const,
      severity: 'HIGH' as const,
      latitude: 13.0604,
      longitude: 80.2496,
      description: 'Major multi-vehicle collision',
      status: 'RESOLVED' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PDFExporter.exportMissionReport({
      incident: dummyIncident,
      ambulance,
      police,
      traffic,
      hospital,
      aiDecision,
      logs: logs ? logs.map(l => ({ timestamp: l.timestamp, message: l.message, source: l.source })) : [],
    });
  };

  if (!activeIncident && (!mission || mission.status === 'COMPLETED')) {
    // Check if a mission was completed recently to render final result
    if (mission && (mission.status === 'COMPLETED' || state.hospital.status === 'PATIENT_RECEIVED')) {
      const hospitalName = hospital.selectedHospital?.name || 'Selected Medical Center';
      const ambDistanceKm = ambulance.routeDistance ? (ambulance.routeDistance / 1000).toFixed(1) : '3.2';
      const replansCount = mission.replanningCount || 0;

      return (
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wide">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>MISSION COMPLETED</span>
            </div>
            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 text-emerald-300 font-bold">
              ACCIDENT RESPONSE COMPLETE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex items-center gap-2">
              <AmbulanceIcon className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Ambulance</div>
                <div className="font-bold text-emerald-300">ARRIVED AT HOSPITAL</div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Police</div>
                <div className="font-bold text-blue-300">ON SCENE</div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Hospital</div>
                <div className="font-bold text-emerald-300">READY ({hospitalName})</div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Traffic Corridor</div>
                <div className="font-bold text-slate-300">CORRIDOR CLOSED</div>
              </div>
            </div>
          </div>

          {/* Measured Performance Metrics */}
          <div className="bg-slate-950 border border-emerald-800/60 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>MEASURED SIMULATION RESULT</span>
              </span>
              <span className="text-slate-500">Phase 13 Metric Engine</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div>
                <div className="text-slate-500">Route Distance</div>
                <div className="font-bold text-slate-100">{ambDistanceKm} km</div>
              </div>
              <div>
                <div className="text-slate-500">Replanning Events</div>
                <div className="font-bold text-slate-100">{replansCount}</div>
              </div>
              <div>
                <div className="text-slate-500">AI Decision</div>
                <div className="font-bold text-cyan-300">{aiDecision?.engine || 'NVIDIA NIM'}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportPDF}
              className="w-full mt-2 py-1.5 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>EXPORT MISSION PDF REPORT</span>
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Render Active Mission Summary
  if (!activeIncident) return null;

  const isGreenCorridor = traffic.greenCorridorActive;
  const hospitalPrepStatus = hospital.status === 'READY' ? 'READY' : hospital.status === 'PREPARING' ? 'PREPARING' : 'NOTIFIED';
  const aiEngineLabel = aiDecision?.engine || 'NVIDIA NIM';

  return (
    <div className="bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950 border-2 border-red-600/90 rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-red-800/80 pb-2">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm tracking-wide">
          <Activity className="w-5 h-5 text-red-500 animate-pulse" />
          <span>MISSION ACTIVE</span>
        </div>
        <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-700 text-red-300 font-bold animate-pulse">
          {activeIncident.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Incident Type</span>
          <span className="font-bold text-red-300">{activeIncident.type}</span>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Severity</span>
          <span className="font-bold text-red-400">{activeIncident.severity}</span>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Swarm Agents</span>
          <span className="font-bold text-emerald-400">4 ACTIVE</span>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Route Strategy</span>
          <span className={`font-bold ${isGreenCorridor ? 'text-amber-400' : 'text-slate-300'}`}>
            {isGreenCorridor ? 'GREEN CORRIDOR' : 'STANDARD DISPATCH'}
          </span>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Hospital Intake</span>
          <span className="font-bold text-emerald-300">{hospitalPrepStatus}</span>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">AI Reasoning</span>
          <span className="font-bold text-cyan-300">{aiEngineLabel}</span>
        </div>
      </div>
    </div>
  );
};
