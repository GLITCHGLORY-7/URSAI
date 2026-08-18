import React from 'react';
import { SituationReport, AIDecisionConfidence } from '../../types/ursai';
import { FileText, Shield, AlertTriangle, Activity, Zap, Radio } from 'lucide-react';

interface Props {
  report: SituationReport;
  aiConfidence?: AIDecisionConfidence;
}

export const SituationReportCard: React.FC<Props> = ({ report, aiConfidence = 'HIGH' }) => {
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'LOW':
      default:
        return 'bg-red-950 text-red-400 border-red-800';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold tracking-wider text-slate-100 uppercase">Situation Report</h3>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-mono">AI Confidence:</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getConfidenceBadge(aiConfidence)}`}>
            {aiConfidence}
          </span>
        </div>
      </div>

      {/* Grid of Key Statuses */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase block">Incident</span>
          <span className="font-bold text-emerald-400 uppercase">{report.incidentSeverity}</span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase block">Response</span>
          <span className="font-bold text-slate-200 uppercase">{report.responseStatus}</span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase block">Traffic Impact</span>
          <span className="font-bold text-amber-400 uppercase truncate block">{report.trafficImpact}</span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase block">Ambulance</span>
          <span className="font-bold text-sky-400 uppercase truncate block">{report.ambulanceStatus}</span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase block">Police</span>
          <span className="font-bold text-blue-400 uppercase truncate block">{report.policeStatus}</span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase block">Hospital</span>
          <span className="font-bold text-purple-400 uppercase truncate block">{report.hospitalStatus}</span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 col-span-2">
          <span className="text-[10px] text-slate-400 uppercase block">Mission Adaptive State</span>
          <span className="font-bold text-emerald-400 uppercase">{report.missionState}</span>
        </div>
      </div>

      {/* Operational Intelligence Summary */}
      <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 text-xs font-mono text-slate-300 leading-relaxed">
        <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">Operational Intelligence:</span>
        {report.summary}
      </div>
    </div>
  );
};
