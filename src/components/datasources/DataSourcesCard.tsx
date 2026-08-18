import React from 'react';
import { DataSourceStatusMap, DataQualityReport, DataSourceMode } from '../../types/ursai';
import { Database, Server, RefreshCw, Activity, Cpu, ShieldCheck } from 'lucide-react';

interface Props {
  statusMap: DataSourceStatusMap;
  dataQuality: DataQualityReport;
  onModeChange?: (mode: DataSourceMode) => void;
}

export const DataSourcesCard: React.FC<Props> = ({ statusMap, dataQuality, onModeChange }) => {
  const getBadgeClass = (source: string, freshness?: string) => {
    if (freshness === 'STALE') {
      return 'bg-amber-950/80 text-amber-400 border-amber-700/60';
    }
    switch (source) {
      case 'REAL':
      case 'OSRM':
      case 'NVIDIA_NIM':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60';
      case 'SIMULATED':
        return 'bg-blue-950/80 text-blue-400 border-blue-700/60';
      case 'FALLBACK':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getQualityBadge = (status: string) => {
    switch (status) {
      case 'GOOD':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'FAIR':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'POOR':
      default:
        return 'bg-red-950 text-red-400 border-red-800';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold tracking-wider text-slate-100 uppercase">Data Sources & Provenance</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Mode:</span>
          <select
            value={statusMap.mode}
            onChange={(e) => onModeChange && onModeChange(e.target.value as DataSourceMode)}
            className="bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-400 rounded px-2 py-0.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="HYBRID">HYBRID</option>
            <option value="SIMULATED">SIMULATED</option>
            <option value="REAL">REAL</option>
            <option value="FALLBACK">FALLBACK</option>
          </select>
        </div>
      </div>

      {/* Data Quality Overview */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">{dataQuality.label}</span>
            <span className="text-xs font-bold text-slate-200">{dataQuality.score} / 100</span>
          </div>
        </div>
        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${getQualityBadge(dataQuality.status)}`}>
          {dataQuality.status}
        </span>
      </div>

      {/* Data Source Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
        {/* Map */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
          <span className="text-slate-400">Map Canvas</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase bg-emerald-950/80 text-emerald-400 border-emerald-700/60">
            OpenStreetMap
          </span>
        </div>

        {/* Routing */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
          <span className="text-slate-400">Routing Engine</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getBadgeClass(statusMap.routing.source)}`}>
            {statusMap.routing.source}
          </span>
        </div>

        {/* AI */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
          <span className="text-slate-400">AI Reasoning</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getBadgeClass(statusMap.ai.source)}`}>
            {statusMap.ai.source === 'NVIDIA_NIM' ? 'NVIDIA NIM' : 'FALLBACK'}
          </span>
        </div>

        {/* Weather */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
          <span className="text-slate-400">Weather Feed</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getBadgeClass(statusMap.weather.source, statusMap.weather.freshness)}`}>
            {statusMap.weather.freshness === 'STALE' ? 'STALE' : statusMap.weather.source}
          </span>
        </div>

        {/* Traffic */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
          <span className="text-slate-400">Traffic Data</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getBadgeClass(statusMap.traffic.source, statusMap.traffic.freshness)}`}>
            {statusMap.traffic.source}
          </span>
        </div>

        {/* Hospital */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
          <span className="text-slate-400">Hospital Capacity</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getBadgeClass(statusMap.hospital.source, statusMap.hospital.freshness)}`}>
            {statusMap.hospital.source}
          </span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="text-[10px] text-slate-500 text-center font-mono pt-1">
        Advisory Model • Read-Only External Data Integration
      </div>
    </div>
  );
};
