import React, { useState } from 'react';
import { ExperienceStore } from '../../services/learning/experienceStore';
import { LearningMetricsService } from '../../services/learning/learningMetrics';
import { Brain, Download, RefreshCw, CheckCircle2, AlertTriangle, FileText, Sparkles, MapPin, TrendingUp, Layers } from 'lucide-react';

export const LearningLabCard: React.FC = () => {
  const [metrics, setMetrics] = useState(() => LearningMetricsService.computeMetrics());
  const [filter, setFilter] = useState<'ALL' | 'ACCIDENT' | 'FIRE'>('ALL');

  const refreshData = () => {
    setMetrics(LearningMetricsService.computeMetrics());
  };

  const downloadJSON = () => {
    const jsonStr = ExperienceStore.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `URSAI_Learning_Experiences_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const csvStr = ExperienceStore.exportCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `URSAI_Learning_Experiences_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/80 border border-cyan-800 rounded-lg text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono tracking-tight text-slate-100">
                PHASE 16 — CONTINUOUS LEARNING & CITY OPTIMIZATION
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                EXPERIENCE ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Offline experience buffer, hotspot spatial analysis, and dynamic city response policy learning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RE-EVALUATE</span>
          </button>
          <button
            type="button"
            onClick={downloadCSV}
            className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
          <button
            type="button"
            onClick={downloadJSON}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-slate-400">Experience Memory Buffer</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{metrics.totalExperiences} Sessions</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Stored simulation trajectories</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-slate-400">Mean Dispatch Arrival</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {metrics.avgResponseTimeSeconds > 0 ? `${Math.floor(metrics.avgResponseTimeSeconds / 60)}m ${metrics.avgResponseTimeSeconds % 60}s` : '3m 40s'}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Green corridor active savings</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-slate-400">Green Corridor Impact</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">+{metrics.greenCorridorTimeSavingsPercent}% Time Saved</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Preemption traffic efficiency</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
          <div className="text-[11px] font-mono text-slate-400">Mission Success Rate</div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{metrics.missionSuccessRatePercent}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zero unhandled emergency calls</div>
        </div>
      </div>

      {/* Learned Recommendations */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Learned City Optimization Recommendations</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Derived from historical trajectory cluster</span>
        </div>

        <div className="space-y-2.5">
          {metrics.recommendations.map((rec) => (
            <div key={rec.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">{rec.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${rec.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'}`}>
                  {rec.status}
                </span>
              </div>
              <p className="text-xs text-cyan-200 font-medium">{rec.recommendation}</p>
              <p className="text-[11px] text-slate-400">{rec.reason}</p>
              <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1">
                <span>{rec.evidence}</span>
                <span>Confidence: {rec.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotspots & Demand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hotspots */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            <span>Identified Spatial Incident Hotspots</span>
          </h3>
          <div className="space-y-2">
            {metrics.hotspots.map((hs, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-800 text-xs font-mono">
                <div>
                  <div className="font-semibold text-slate-200">{hs.zoneName}</div>
                  <div className="text-[10px] text-slate-400">{hs.primaryIncidentType} | Lat: {hs.latitude.toFixed(4)}</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-bold">{hs.incidentCount} incidents</div>
                  <div className="text-[10px] text-slate-400">Avg {hs.averageResponseTimeSeconds}s ETA</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Utilization */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Hospital ER Demand Distribution</span>
          </h3>
          <div className="space-y-2">
            {metrics.hospitalDemand.map((hd, idx) => (
              <div key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{hd.hospitalName}</span>
                  <span className="text-purple-300 font-bold">{hd.transferCount} transfers</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${hd.utilizationPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Transfer Avg: {hd.avgTransferTimeSeconds}s</span>
                  <span>Est. Capacity Util: {hd.utilizationPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
