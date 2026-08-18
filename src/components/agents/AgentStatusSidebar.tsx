import React, { useState, useEffect } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { formatEta, formatDistance } from '../../incidents/incidentManager';
import {
  Shield,
  Ambulance,
  Zap,
  Wifi,
  WifiOff,
  Activity,
  Radio,
  Cpu,
  Signal,
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Server,
  Sliders,
  Sparkles,
  Info,
  Terminal,
  HeartPulse,
} from 'lucide-react';

interface AgentTelemetry {
  latency: number;
  packetLoss: number;
  signalStrength: number;
  batteryLevel: number;
  cpuLoad: number;
  lastHeartbeat: Date;
  protocol: string;
  channel: string;
  ipAddress: string;
  uptime: string;
}

export const AgentStatusSidebar: React.FC = () => {
  const { state } = useUrsai();
  const { ambulance, police, traffic, hospital, activeIncident, systemStatus, aiStatus } = state;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<'AMBULANCE' | 'POLICE' | 'TRAFFIC' | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingSuccessMsg, setPingSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DIAGNOSTICS'>('OVERVIEW');

  // Dynamic telemetry states with live heartbeat simulation
  const [telemetry, setTelemetry] = useState<{
    ambulance: AgentTelemetry;
    police: AgentTelemetry;
    traffic: AgentTelemetry;
  }>({
    ambulance: {
      latency: 12,
      packetLoss: 0,
      signalStrength: 98,
      batteryLevel: 94,
      cpuLoad: 24,
      lastHeartbeat: new Date(),
      protocol: 'HL7 FastSync / V2X-eNodeB',
      channel: 'CH-108-EMERGENCY',
      ipAddress: '10.240.12.44',
      uptime: '14h 22m',
    },
    police: {
      latency: 15,
      packetLoss: 0,
      signalStrength: 96,
      batteryLevel: 91,
      cpuLoad: 28,
      lastHeartbeat: new Date(),
      protocol: 'APCO P25 Encrypted Mesh',
      channel: 'CH-100-TACTICAL',
      ipAddress: '10.240.14.88',
      uptime: '18h 05m',
    },
    traffic: {
      latency: 8,
      packetLoss: 0,
      signalStrength: 100,
      batteryLevel: 100, // Grid Powered
      cpuLoad: 31,
      lastHeartbeat: new Date(),
      protocol: 'SCATS Adaptive Urban Wave',
      channel: 'CH-SCATS-GRID-01',
      ipAddress: '10.240.20.10',
      uptime: '42d 11h',
    },
  });

  // Jitter and heartbeat loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ambulance: {
          ...prev.ambulance,
          latency: Math.max(8, Math.min(28, prev.ambulance.latency + (Math.random() > 0.5 ? 1 : -1))),
          cpuLoad: Math.max(15, Math.min(65, prev.ambulance.cpuLoad + (ambulance.status === 'EN_ROUTE' ? 4 : -1))),
          lastHeartbeat: new Date(),
        },
        police: {
          ...prev.police,
          latency: Math.max(10, Math.min(32, prev.police.latency + (Math.random() > 0.5 ? 1 : -1))),
          cpuLoad: Math.max(18, Math.min(60, prev.police.cpuLoad + (police.status === 'EN_ROUTE' ? 3 : -1))),
          lastHeartbeat: new Date(),
        },
        traffic: {
          ...prev.traffic,
          latency: Math.max(5, Math.min(18, prev.traffic.latency + (Math.random() > 0.5 ? 1 : -1))),
          cpuLoad: Math.max(20, Math.min(75, prev.traffic.cpuLoad + (traffic.greenCorridorActive ? 8 : -2))),
          lastHeartbeat: new Date(),
        },
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [ambulance.status, police.status, traffic.greenCorridorActive]);

  const handlePingAll = () => {
    setIsPinging(true);
    setPingSuccessMsg(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccessMsg('All 3 AI Agent nodes responded • Avg RTT: 11.6ms • 0% Packet Loss');
      setTimeout(() => setPingSuccessMsg(null), 4000);
    }, 800);
  };

  // Derive operational health per agent
  const getAmbulanceHealth = () => {
    if (ambulance.status === 'ERROR') return { status: 'DEGRADED', label: 'DEGRADED', color: 'text-amber-400 border-amber-800 bg-amber-950/60', score: '72%' };
    if (ambulance.status === 'EN_ROUTE' || ambulance.status === 'TRANSPORTING') return { status: 'ACTIVE', label: 'RESPONDING', color: 'text-blue-400 border-blue-800 bg-blue-950/60', score: '99.8%' };
    if (ambulance.status === 'AT_SCENE' || ambulance.status === 'ARRIVED_AT_HOSPITAL') return { status: 'OPTIMAL', label: 'ENGAGED', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60', score: '100%' };
    return { status: 'OPTIMAL', label: 'STANDBY', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60', score: '99.4%' };
  };

  const getPoliceHealth = () => {
    if (police.status === 'ERROR') return { status: 'DEGRADED', label: 'DEGRADED', color: 'text-amber-400 border-amber-800 bg-amber-950/60', score: '68%' };
    if (police.status === 'EN_ROUTE') return { status: 'ACTIVE', label: 'INTERCEPTING', color: 'text-indigo-400 border-indigo-800 bg-indigo-950/60', score: '99.6%' };
    if (police.status === 'ON_SCENE') return { status: 'OPTIMAL', label: 'CORDON ACTIVE', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60', score: '100%' };
    return { status: 'OPTIMAL', label: 'STANDBY', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60', score: '99.1%' };
  };

  const getTrafficHealth = () => {
    if (traffic.greenCorridorActive) return { status: 'OPTIMAL', label: 'GREEN WAVE OVERRIDE', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60', score: '100%' };
    if (traffic.status === 'RESPONDING') return { status: 'ACTIVE', label: 'PREEMPTION SYNC', color: 'text-amber-400 border-amber-800 bg-amber-950/60', score: '99.2%' };
    return { status: 'OPTIMAL', label: 'NORMAL CYCLE', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60', score: '100%' };
  };

  const ambHealth = getAmbulanceHealth();
  const polHealth = getPoliceHealth();
  const trfHealth = getTrafficHealth();

  const totalConnected = 3;
  const overallSwarmHealth = '99.8%';

  // Collapsed Sidebar View
  if (isCollapsed) {
    return (
      <aside
        id="agent-status-sidebar-collapsed"
        className="w-14 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 px-1.5 space-y-4 shrink-0 select-none z-10"
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
          title="Expand Agent Status Sidebar"
        >
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </button>

        <div className="w-full border-t border-slate-800/80 my-1" />

        {/* Mini Agent Badges */}
        <div
          onClick={() => {
            setIsCollapsed(false);
            setSelectedAgent('AMBULANCE');
          }}
          className="relative p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400 hover:bg-blue-900/60 transition-all cursor-pointer group"
          title="Ambulance Agent (AMB-01) - Online"
        >
          <Ambulance className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
        </div>

        <div
          onClick={() => {
            setIsCollapsed(false);
            setSelectedAgent('POLICE');
          }}
          className="relative p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 hover:bg-indigo-900/60 transition-all cursor-pointer group"
          title="Police Agent (POL-01) - Online"
        >
          <Shield className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
        </div>

        <div
          onClick={() => {
            setIsCollapsed(false);
            setSelectedAgent('TRAFFIC');
          }}
          className="relative p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60 transition-all cursor-pointer group"
          title="Traffic Agent (TRF-01) - Online"
        >
          <Zap className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
        </div>

        <div className="flex-1" />

        <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-tighter [writing-mode:vertical-rl] rotate-180">
          SWARM 3/3 OK
        </div>
      </aside>
    );
  }

  return (
    <aside
      id="agent-status-sidebar"
      className="w-72 lg:w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-hidden shrink-0 select-none z-10"
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              AGENT STATUS
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Real-time Swarm Health & V2X Mesh</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePingAll}
            disabled={isPinging}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Ping all AI Agents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Swarm Connectivity KPI Bar */}
      <div className="p-3 bg-slate-900/40 border-b border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>CONNECTED FLEET:</span>
          </span>
          <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
            {totalConnected}/3 ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-500">SWARM HEALTH:</span>
            <span className="font-bold text-emerald-400">{overallSwarmHealth}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-500">AVG LATENCY:</span>
            <span className="font-bold text-cyan-400">11.6 ms</span>
          </div>
        </div>

        {pingSuccessMsg && (
          <div className="p-1.5 rounded bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-[10px] font-mono animate-fadeIn">
            {pingSuccessMsg}
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-md bg-slate-950 p-0.5 border border-slate-800 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 py-1 text-center rounded transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LIVE OVERVIEW
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DIAGNOSTICS')}
            className={`flex-1 py-1 text-center rounded transition-all cursor-pointer ${
              activeTab === 'DIAGNOSTICS'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            V2X DIAGNOSTICS
          </button>
        </div>
      </div>

      {/* Main Agent List / Telemetry View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {/* ==================================================================== */}
        {/* 1. AMBULANCE AGENT CARD (AMB-01) */}
        {/* ==================================================================== */}
        <div
          id="sidebar-ambulance-agent"
          onClick={() => setSelectedAgent(selectedAgent === 'AMBULANCE' ? null : 'AMBULANCE')}
          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedAgent === 'AMBULANCE'
              ? 'bg-blue-950/40 border-blue-600 ring-1 ring-blue-500 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Top Status Banner */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800/80 text-blue-400">
                <Ambulance className="w-4 h-4" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  AMBULANCE (AMB-01)
                </div>
                <span className="text-[10px] text-slate-400 font-mono">T. Nagar Emergency Hub</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${ambHealth.color}`}>
                {ambHealth.label}
              </span>
              <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                <Signal className="w-2.5 h-2.5 text-emerald-400" />
                {telemetry.ambulance.latency}ms
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-2">
            <div>
              <span className="text-slate-500 text-[9px] block">LINK</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <Wifi className="w-2.5 h-2.5" /> 98%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">CPU</span>
              <span className="text-slate-200 font-bold">{telemetry.ambulance.cpuLoad}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">HEALTH</span>
              <span className="text-emerald-400 font-bold">{ambHealth.score}</span>
            </div>
          </div>

          {/* Live Task / Mission Vector */}
          <div className="text-[10px] font-mono text-slate-300 flex items-center justify-between border-t border-slate-800/60 pt-2">
            <span className="text-slate-500">TASK:</span>
            <span className="font-semibold text-blue-300 truncate max-w-[170px]">
              {ambulance.currentTask || 'STANDBY AT DEPOT'}
            </span>
          </div>

          {/* Expanded Diagnostics Drawer when Selected */}
          {selectedAgent === 'AMBULANCE' && (
            <div className="mt-3 pt-2.5 border-t border-slate-800 font-mono text-[10px] space-y-1.5 bg-slate-950 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span>Protocol:</span>
                <span className="text-slate-200">{telemetry.ambulance.protocol}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Radio Channel:</span>
                <span className="text-cyan-400">{telemetry.ambulance.channel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>IP Node:</span>
                <span className="text-slate-300">{telemetry.ambulance.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Route ETA:</span>
                <span className="text-amber-300 font-bold">{formatEta(ambulance.eta)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Distance:</span>
                <span className="text-slate-200">{formatDistance(ambulance.routeDistance)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Transit Leg:</span>
                <span className="text-emerald-300 uppercase font-bold">
                  {ambulance.leg === 'HOSPITAL' ? 'Hospital ER Leg' : 'Scene Response'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 2. POLICE AGENT CARD (POL-01) */}
        {/* ==================================================================== */}
        <div
          id="sidebar-police-agent"
          onClick={() => setSelectedAgent(selectedAgent === 'POLICE' ? null : 'POLICE')}
          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedAgent === 'POLICE'
              ? 'bg-indigo-950/40 border-indigo-600 ring-1 ring-indigo-500 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Top Status Banner */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-800/80 text-indigo-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  POLICE (POL-01)
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Egmore Police HQ</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${polHealth.color}`}>
                {polHealth.label}
              </span>
              <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                <Signal className="w-2.5 h-2.5 text-emerald-400" />
                {telemetry.police.latency}ms
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-2">
            <div>
              <span className="text-slate-500 text-[9px] block">LINK</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <Wifi className="w-2.5 h-2.5" /> 96%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">CPU</span>
              <span className="text-slate-200 font-bold">{telemetry.police.cpuLoad}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">HEALTH</span>
              <span className="text-emerald-400 font-bold">{polHealth.score}</span>
            </div>
          </div>

          {/* Live Task / Mission Vector */}
          <div className="text-[10px] font-mono text-slate-300 flex items-center justify-between border-t border-slate-800/60 pt-2">
            <span className="text-slate-500">TASK:</span>
            <span className="font-semibold text-indigo-300 truncate max-w-[170px]">
              {police.currentTask || 'PATROL STANDBY'}
            </span>
          </div>

          {/* Expanded Diagnostics Drawer when Selected */}
          {selectedAgent === 'POLICE' && (
            <div className="mt-3 pt-2.5 border-t border-slate-800 font-mono text-[10px] space-y-1.5 bg-slate-950 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span>Protocol:</span>
                <span className="text-slate-200">{telemetry.police.protocol}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Radio Channel:</span>
                <span className="text-indigo-400">{telemetry.police.channel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>IP Node:</span>
                <span className="text-slate-300">{telemetry.police.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Perimeter Lockdown:</span>
                <span className="text-emerald-300 font-bold">
                  {police.status === 'ON_SCENE' ? 'ACTIVE (CORDONED)' : 'ARMED & READY'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Distance to Target:</span>
                <span className="text-slate-200">{formatDistance(police.routeDistance)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 3. TRAFFIC AGENT CARD (TRF-01) */}
        {/* ==================================================================== */}
        <div
          id="sidebar-traffic-agent"
          onClick={() => setSelectedAgent(selectedAgent === 'TRAFFIC' ? null : 'TRAFFIC')}
          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedAgent === 'TRAFFIC'
              ? 'bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-500 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Top Status Banner */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  TRAFFIC (TRF-01)
                </div>
                <span className="text-[10px] text-slate-400 font-mono">SCATS Central Grid Control</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${trfHealth.color}`}>
                {trfHealth.label}
              </span>
              <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                <Signal className="w-2.5 h-2.5 text-emerald-400" />
                {telemetry.traffic.latency}ms
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-2">
            <div>
              <span className="text-slate-500 text-[9px] block">LINK</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <Wifi className="w-2.5 h-2.5" /> 100%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">CPU</span>
              <span className="text-slate-200 font-bold">{telemetry.traffic.cpuLoad}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">HEALTH</span>
              <span className="text-emerald-400 font-bold">{trfHealth.score}</span>
            </div>
          </div>

          {/* Live Corridor Status */}
          <div className="text-[10px] font-mono text-slate-300 flex items-center justify-between border-t border-slate-800/60 pt-2">
            <span className="text-slate-500">CORRIDOR:</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                traffic.greenCorridorActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              {traffic.greenCorridorActive ? 'GREEN CORRIDOR ACTIVE' : 'ADAPTIVE CYCLE'}
            </span>
          </div>

          {/* Expanded Diagnostics Drawer when Selected */}
          {selectedAgent === 'TRAFFIC' && (
            <div className="mt-3 pt-2.5 border-t border-slate-800 font-mono text-[10px] space-y-1.5 bg-slate-950 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span>Protocol:</span>
                <span className="text-slate-200">{telemetry.traffic.protocol}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Network Node:</span>
                <span className="text-emerald-400">{telemetry.traffic.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Signal Preemption:</span>
                <span className="text-emerald-300 font-bold">
                  {traffic.greenCorridorActive ? 'LOCKED (EMERGENCY PHASE HOLD)' : 'READY'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Grid Node Power:</span>
                <span className="text-slate-200">100% (Municipal Mains)</span>
              </div>
            </div>
          )}
        </div>

        {/* Diagnostics & Protocol Summary Tab Details */}
        {activeTab === 'DIAGNOSTICS' && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[10px] space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3" /> MESH PROTOCOL METRICS
              </span>
              <span className="text-emerald-400 font-bold">ZERO PACKET LOSS</span>
            </div>

            <div className="space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Total Telemetry Packets:</span>
                <span className="text-slate-200">184,920 pkts</span>
              </div>
              <div className="flex justify-between">
                <span>Encryption Standard:</span>
                <span className="text-slate-200">AES-256-GCM / TLS 1.3</span>
              </div>
              <div className="flex justify-between">
                <span>Heartbeat Interval:</span>
                <span className="text-slate-200">3,000 ms</span>
              </div>
              <div className="flex justify-between">
                <span>NVIDIA NIM AI Hook:</span>
                <span className="text-purple-400 font-bold">{aiStatus !== 'DEGRADED' && aiStatus !== 'FAILED' && aiStatus !== 'FALLBACK' ? 'SYNCED' : 'FALLBACK'}</span>
              </div>
              <div className="flex justify-between">
                <span>Orchestration Layer:</span>
                <span className="text-emerald-400 font-bold">Authoritative State Machine</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>V2X Swarm Telemetry Sync</span>
        </div>
        <span className="text-slate-500">v2.4 Active</span>
      </div>
    </aside>
  );
};
