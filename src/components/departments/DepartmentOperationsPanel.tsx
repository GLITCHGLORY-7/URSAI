import React, { useState } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { DEPARTMENT_LIST, DepartmentId, DepartmentInfo } from '../../data/departments';
import { evaluateDepartmentSelection, EvaluatedDepartmentPlan } from '../../data/departmentMatrix';
import {
  Shield,
  Ambulance,
  Flame,
  Activity,
  Building2,
  AlertTriangle,
  Wrench,
  Zap,
  Droplets,
  CloudRain,
  Radio,
  Landmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Ambulance: Ambulance,
  Shield: Shield,
  Flame: Flame,
  Activity: Activity,
  Building2: Building2,
  AlertTriangle: AlertTriangle,
  Wrench: Wrench,
  Zap: Zap,
  Droplets: Droplets,
  CloudRain: CloudRain,
  Radio: Radio,
  Landmark: Landmark,
};

export const DepartmentOperationsPanel: React.FC = () => {
  const { state, submitIncident, resetSystem } = useUrsai();
  const { activeIncident, aiDecision, logs } = state;
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId | null>(null);
  const [humanApproved, setHumanApproved] = useState<boolean | null>(null);

  // Derive department plan either from active incident or default matrix rule
  const currentIncident = activeIncident || {
    id: 'INC-DEMO-20',
    type: 'ROAD ACCIDENT' as const,
    severity: 'HIGH' as const,
    latitude: 13.0604,
    longitude: 80.2496,
    description: 'Multi-department urban crisis demonstration scenario',
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const deptPlan: EvaluatedDepartmentPlan = evaluateDepartmentSelection(
    currentIncident.id,
    currentIncident.type,
    currentIncident.severity
  );

  const handleLaunchScenario = (type: 'ROAD ACCIDENT' | 'FIRE' | 'FLOOD') => {
    resetSystem();
    setTimeout(() => {
      let desc = '';
      let lat = 13.0604;
      let lng = 80.2496;

      if (type === 'ROAD ACCIDENT') {
        desc = 'Major 3-vehicle multi-car collision blocking central arterial corridor near Anna Salai.';
        lat = 13.0604;
        lng = 80.2496;
      } else if (type === 'FIRE') {
        desc = 'High-rise commercial structure fire with hazardous electrical line risk near T. Nagar.';
        lat = 13.0418;
        lng = 80.2341;
      } else if (type === 'FLOOD') {
        desc = 'Monsoon cloudburst flooding subway underpass and disrupting stormwater drainage near Velachery.';
        lat = 13.0067;
        lng = 80.2206;
      }

      submitIncident({
        type,
        severity: 'CRITICAL',
        latitude: lat,
        longitude: lng,
        description: desc,
      });
    }, 200);
  };

  const selectedDeptInfo = selectedDeptId
    ? DEPARTMENT_LIST.find((d) => d.id === selectedDeptId)
    : null;

  return (
    <div className="space-y-4">
      {/* Top Banner: Multi-Department Unified Swarm Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-base font-bold text-slate-100 tracking-wide uppercase">
              URSAI Unified Multi-Department City Swarm
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold uppercase">
              Phase 20 Integrated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic, context-aware emergency department activation engine. Only required departments are dispatched per incident parameters.
          </p>
        </div>

        {/* Showcase Scenario Quick Launch Bar */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px] font-bold">SHOWCASE SCENARIOS:</span>
          <button
            type="button"
            onClick={() => handleLaunchScenario('ROAD ACCIDENT')}
            className="px-2.5 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3" /> ACCIDENT
          </button>
          <button
            type="button"
            onClick={() => handleLaunchScenario('FIRE')}
            className="px-2.5 py-1.5 rounded bg-orange-950/80 hover:bg-orange-900 border border-orange-800 text-orange-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3" /> BUILDING FIRE
          </button>
          <button
            type="button"
            onClick={() => handleLaunchScenario('FLOOD')}
            className="px-2.5 py-1.5 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3" /> URBAN FLOOD
          </button>
        </div>
      </div>

      {/* Grid of 12 City Departments */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {DEPARTMENT_LIST.map((dept) => {
          const IconComp = ICON_MAP[dept.iconName] || Shield;
          const isRequired = deptPlan.requiredDepartments.includes(dept.id);
          const isOptional = deptPlan.optionalDepartments.includes(dept.id);
          const isUnnecessary = deptPlan.departmentsNotRequired.includes(dept.id);

          let statusBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
          let statusText = 'INACTIVE / STANDBY';

          if (isRequired) {
            statusBadgeClass = 'bg-emerald-950 border-emerald-700 text-emerald-300';
            statusText = activeIncident ? 'DISPATCHED / ACTIVE' : 'REQUIRED';
          } else if (isOptional) {
            statusBadgeClass = 'bg-amber-950 border-amber-800 text-amber-300';
            statusText = 'ON STANDBY / SUPPORT';
          } else {
            statusBadgeClass = 'bg-slate-900/60 border-slate-800 text-slate-500';
            statusText = 'UNNECESSARY';
          }

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`p-3 rounded-lg border bg-slate-900/90 transition-all cursor-pointer hover:border-slate-600 relative overflow-hidden flex flex-col justify-between ${
                dept.id === selectedDeptId ? 'ring-2 ring-cyan-500 border-cyan-400' : 'border-slate-800'
              }`}
            >
              {/* Category indicator line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isRequired ? 'bg-emerald-500' : isOptional ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              />

              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`p-1.5 rounded ${dept.bgClass} ${dept.borderClass} border ${dept.textClass}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                    {dept.category}
                  </span>
                </div>

                <h3 className="font-mono text-xs font-bold text-slate-200 truncate">{dept.shortName}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">{dept.name}</p>
              </div>

              <div className="mt-3 space-y-1.5 font-mono text-[10px]">
                <div className={`px-2 py-0.5 rounded border text-center font-bold uppercase ${statusBadgeClass}`}>
                  {statusText}
                </div>

                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>UNITS:</span>
                  <span className="font-bold text-slate-200">
                    {isRequired ? '1 ACTIVE' : `0/${dept.defaultUnitsAvailable}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Details & Inter-Department Comms Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: AI Department Selection Reasoning & Selected Dept Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-sm font-bold text-slate-200 uppercase">
                AI Swarm Coordinator Decision Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold">
              ESCALATION: {deptPlan.escalationLevel}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded border border-slate-800 leading-relaxed">
            {deptPlan.reasoning}
          </p>

          {/* Department Tasks & Dependencies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-slate-950/80 p-3 rounded border border-slate-800">
              <h4 className="text-[11px] font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> REQUIRED DEPARTMENTS ({deptPlan.requiredDepartments.length})
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {deptPlan.requiredDepartments.map((dep) => (
                  <li key={dep} className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded">
                    <span className="font-bold text-slate-200">{dep}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">ACTIVATED</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/80 p-3 rounded border border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-slate-500" /> UNNECESSARY DEPARTMENTS ({deptPlan.departmentsNotRequired.length})
              </h4>
              <p className="text-[10px] text-slate-400">
                Kept inactive on stand-by to prevent city resource overload:
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {deptPlan.departmentsNotRequired.map((dep) => (
                  <span key={dep} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Human Oversight Section */}
          <div className="p-3 rounded-lg bg-slate-950 border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div>
              <span className="font-bold text-cyan-300">HUMAN OVERSIGHT CONTROL:</span>
              <p className="text-[11px] text-slate-400">
                Review AI department allocation plan before executing full city dispatch.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHumanApproved(true)}
                className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer border ${
                  humanApproved === true
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                }`}
              >
                ACCEPT PLAN
              </button>
              <button
                type="button"
                onClick={() => setHumanApproved(false)}
                className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer border ${
                  humanApproved === false
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900'
                }`}
              >
                REJECT PLAN
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Inter-Department Communication Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <Radio className="w-4 h-4 text-teal-400" />
              <h3 className="font-mono text-sm font-bold text-slate-200 uppercase">
                Emergency Comms Stream
              </h3>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 font-mono text-xs">
              {logs && logs.length > 0 ? (
                logs.slice(0, 8).map((log) => (
                  <div key={log.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-teal-400">{log.source}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px]">{log.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs italic">No communication logs recorded yet.</p>
              )}
            </div>
          </div>

          {selectedDeptInfo && (
            <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-xs space-y-1">
              <span className="text-[11px] text-cyan-400 font-bold uppercase">INSPECTED DEPARTMENT:</span>
              <div className="text-slate-200 font-bold">{selectedDeptInfo.name}</div>
              <ul className="text-[10px] text-slate-400 list-disc list-inside">
                {selectedDeptInfo.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
