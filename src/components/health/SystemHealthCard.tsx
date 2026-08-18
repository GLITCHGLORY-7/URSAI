import React, { useState } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { evaluateSystemHealth, ServiceHealthStatus } from '../../services/systemHealthService';
import { verifyGlobalSystemState, SystemVerificationReport } from '../../services/systemVerifier';
import { ShieldCheck, Activity, AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

export const SystemHealthCard: React.FC = () => {
  const { state } = useUrsai();
  const [report, setReport] = useState<SystemVerificationReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const health = evaluateSystemHealth(state);

  const handleRunVerification = () => {
    const res = verifyGlobalSystemState(state);
    setReport(res);
    setShowDetails(true);
  };

  const getStatusBadge = (status: ServiceHealthStatus | string) => {
    switch (status) {
      case 'OPERATIONAL':
      case 'HEALTHY':
      case 'PASS':
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
      case 'DEGRADED':
      case 'WARN':
        return 'text-amber-400 border-amber-800 bg-amber-950/60';
      default:
        return 'text-red-400 border-red-800 bg-red-950/60';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-950/80 border border-emerald-800/60 rounded-lg text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              System Health & Verification
            </h3>
            <p className="text-[11px] text-slate-400">Subsystem Invariant & Readiness Monitor</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getStatusBadge(health.overallStatus)}`}>
            {health.overallStatus}
          </span>
          <button
            onClick={handleRunVerification}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Run Comprehensive Invariants Verification"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subsystem Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-xs font-mono">
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">COORDINATOR</span>
          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getStatusBadge(health.subsystems.coordinator)}`}>
            {health.subsystems.coordinator}
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">ROUTING</span>
          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getStatusBadge(health.subsystems.routing)}`}>
            {health.subsystems.routing}
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">NIM ENGINE</span>
          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getStatusBadge(health.subsystems.nim)}`}>
            {health.subsystems.nim}
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">CITY DATA</span>
          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getStatusBadge(health.subsystems.cityData)}`}>
            {health.subsystems.cityData}
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">PREDICTION</span>
          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getStatusBadge(health.subsystems.prediction)}`}>
            {health.subsystems.prediction}
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">MISSION</span>
          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getStatusBadge(health.subsystems.mission)}`}>
            {health.subsystems.mission}
          </span>
        </div>
      </div>

      {/* Verification Detailed Report Drawer */}
      {showDetails && report && (
        <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> System Verification Audit
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusBadge(report.status)}`}>
              {report.status}
            </span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {report.checks.map((chk, i) => (
              <div key={i} className="flex items-start justify-between text-[11px] font-mono border-b border-slate-900/80 pb-1">
                <div className="flex items-center space-x-1.5">
                  {chk.status === 'PASS' && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />}
                  {chk.status === 'WARN' && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />}
                  {chk.status === 'FAIL' && <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />}
                  <span className="text-slate-200 font-medium">{chk.name}</span>
                </div>
                <span className="text-slate-400 text-[10px] text-right pl-2">{chk.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
