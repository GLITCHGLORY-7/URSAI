import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { SwarmCoordinator } from '../../services/swarm/swarmCoordinator';
import { Network, ShieldAlert, Cpu, CheckCircle2, Zap, ArrowRight, Activity, Users } from 'lucide-react';

export const SwarmIntelligenceCard: React.FC = () => {
  const { state } = useUrsai();
  const coordinator = SwarmCoordinator.getInstance();

  const activeIncidents = state.activeIncident ? [state.activeIncident] : [];
  const plan = coordinator.evaluateSwarmState(
    activeIncidents,
    state.ambulance,
    state.police,
    state.traffic,
    state.hospital,
    state.aiDecision
  );

  const swarmEvents = coordinator.getEvents();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-950/80 border border-purple-800 rounded-lg text-purple-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono tracking-tight text-slate-100">
                PHASE 17 — ADVANCED SWARM INTELLIGENCE & AUTONOMOUS COORDINATION
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold uppercase">
                PEER-TO-PEER SWARM ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Shared state peer synchronization, autonomous resource conflict resolution, and multi-incident dynamic reassignment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-right font-mono">
            <div className="text-[10px] text-slate-400">SWARM EFFICIENCY SCORE</div>
            <div className="text-xl font-bold text-purple-400">{plan.swarmEfficiencyScore}/100</div>
          </div>
        </div>
      </div>

      {/* Agents Status Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400">AMB-01 (Ambulance)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded">
              {state.ambulance.status}
            </span>
          </div>
          <div className="text-xs text-slate-300 font-mono truncate">{state.ambulance.currentTask}</div>
          <div className="text-[10px] text-slate-500 font-mono">Shared World Sync: ONLINE</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-blue-400">POL-01 (Police)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded">
              {state.police.status}
            </span>
          </div>
          <div className="text-xs text-slate-300 font-mono truncate">{state.police.currentTask || 'Perimeter Control'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Shared World Sync: ONLINE</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400">TRF-01 (Traffic)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
              {state.traffic.status}
            </span>
          </div>
          <div className="text-xs text-slate-300 font-mono truncate">
            {state.traffic.greenCorridorActive ? 'Preemption Active' : 'Normal Cycle'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Shared World Sync: ONLINE</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-400">HOSP-01 (ER Intake)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded">
              {state.hospital.status}
            </span>
          </div>
          <div className="text-xs text-slate-300 font-mono truncate">
            {state.hospital.selectedHospital?.name || 'Selected Hospital'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Shared World Sync: ONLINE</div>
        </div>
      </div>

      {/* Current Swarm Coordination Rationale Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Swarm Consensus Reasoning & Resource Alignment</span>
        </h3>
        <p className="text-xs text-purple-200 font-mono bg-slate-900 p-3 rounded border border-slate-800">
          {plan.reasoning}
        </p>
      </div>

      {/* Autonomous Negotiation Timeline */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Autonomous Peer-to-Peer Agent Negotiation Stream</span>
        </h3>

        <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
          {swarmEvents.length > 0 ? (
            swarmEvents.map((evt) => (
              <div key={evt.id} className="flex items-start gap-2 bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 shrink-0 mt-0.5">[{evt.timestamp.split('T')[1]?.substring(0, 8)}]</div>
                <div className="shrink-0 font-bold text-cyan-400">[{evt.sourceAgentId}]</div>
                <div className="text-slate-300">{evt.description}</div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-xs italic bg-slate-900 p-3 rounded border border-slate-800">
              Swarm sync initialized. Agents continuously broadcasting location, status, and route telemetry over shared bus.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
