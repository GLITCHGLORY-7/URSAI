import React, { useState, useEffect } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { formatEta, formatDistance } from '../../incidents/incidentManager';
import { CHENNAI_INCIDENT_HOTSPOTS } from '../../data/incidentLocations';
import {
  Ambulance,
  Shield,
  Radio,
  Building2,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  Navigation,
  Sparkles,
  Zap,
  ArrowRight,
  Car,
  ChevronRight,
  Wifi,
  Siren,
  Hospital,
  HeartPulse,
  Route,
  Volume2,
  Info,
  MapPin,
} from 'lucide-react';

export const MissionAgentsSidebar: React.FC = () => {
  const { state, simulateAccident, submitIncident, resetSystem } = useUrsai();
  const { activeIncident, ambulance, police, traffic, hospital } = state;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AGENTS' | 'COMMS'>('OVERVIEW');
  const [commsLog, setCommsLog] = useState<Array<{ id: string; time: string; sender: string; role: string; text: string; color: string }>>([]);

  // Generate dynamic, realistic agent communication logs as mission unfolds
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    if (!activeIncident) {
      setCommsLog([
        {
          id: '1',
          time: timeStr,
          sender: 'SWARM SUPERVISOR',
          role: 'URSA-I Core',
          text: 'All sector telemetry active. Emergency vehicles standing by at Chennai Central depots.',
          color: 'text-cyan-400 border-cyan-500',
        },
      ]);
      return;
    }

    const logs: Array<{ id: string; time: string; sender: string; role: string; text: string; color: string }> = [];

    // Phase 1: Incident Detected
    logs.push({
      id: '1',
      time: '14:20:01',
      sender: 'URSA-I DISPATCH AI',
      role: 'Swarm Orchestrator',
      text: `Incident ${activeIncident.id} detected: ${activeIncident.type} at ${activeIncident.description || 'Anna Salai'}. Severity: ${activeIncident.severity}. Dispatched closest ALS ambulance & police interceptor.`,
      color: 'text-red-400 border-red-500',
    });

    // Phase 2: Route & Traffic Optimization
    if (ambulance.status === 'EN_ROUTE' || police.status === 'EN_ROUTE') {
      logs.push({
        id: '2',
        time: '14:20:04',
        sender: 'TRAFFIC AGENT TR-07',
        role: 'V2X SCATS Control',
        text: 'Preemption engaged: 4 intersections on Anna Salai overridden to green wave. Cross-street signals locked red.',
        color: 'text-amber-400 border-amber-500',
      });
      logs.push({
        id: '3',
        time: '14:20:07',
        sender: 'POLICE AGENT PD-28',
        role: 'Perimeter & Escort',
        text: 'Advance cruiser clearing front lane. Setting up 150m cordon to isolate hazard area from civilian traffic.',
        color: 'text-blue-400 border-blue-500',
      });
      logs.push({
        id: '4',
        time: '14:20:10',
        sender: 'AMBULANCE AGENT AM-15',
        role: 'ALS Paramedic Unit',
        text: `Navigating corridor at 58 km/h. ETA: ${formatEta(ambulance.eta)}. Paramedics prepping spinal board & oxygen.`,
        color: 'text-emerald-400 border-emerald-500',
      });
    }

    // Phase 3: At Scene Triage
    if (ambulance.status === 'AT_SCENE' || police.status === 'ON_SCENE') {
      logs.push({
        id: '5',
        time: '14:23:45',
        sender: 'AMBULANCE AGENT AM-15',
        role: 'On-Scene Triage',
        text: 'On scene. Initial patient triage complete (GCS 13, BP 118/76). Loading patient into trauma compartment.',
        color: 'text-emerald-400 border-emerald-500',
      });
      logs.push({
        id: '6',
        time: '14:24:02',
        sender: 'POLICE AGENT PD-28',
        role: 'Perimeter Security',
        text: 'Crash site perimeter secured. Civilian diversion established via Mount Road bypass.',
        color: 'text-blue-400 border-blue-500',
      });
    }

    // Phase 4: Hospital Transport
    if (ambulance.status === 'TRANSPORTING') {
      logs.push({
        id: '7',
        time: '14:25:30',
        sender: 'HOSPITAL AGENT ER-01',
        role: `${hospital.selectedHospital?.name || 'Apollo Main'} ER`,
        text: `Trauma Bay 2 cleared. Orthopedic surgeon alerted. Bed reserved. Real-time patient telemetry linked.`,
        color: 'text-purple-400 border-purple-500',
      });
      logs.push({
        id: '8',
        time: '14:25:48',
        sender: 'TRAFFIC AGENT TR-07',
        role: 'V2X SCATS Control',
        text: `Corridor extension activated towards ${hospital.selectedHospital?.name || 'Apollo Main'}. Zero red signal stops.`,
        color: 'text-amber-400 border-amber-500',
      });
    }

    // Phase 5: Arrived
    if (ambulance.status === 'ARRIVED_AT_HOSPITAL') {
      logs.push({
        id: '9',
        time: '14:28:15',
        sender: 'HOSPITAL AGENT ER-01',
        role: 'Trauma Resuscitation',
        text: 'Patient successfully received in ER Trauma Bay 2. Vitals stable. Swarm mission accomplished.',
        color: 'text-emerald-400 border-emerald-500',
      });
    }

    setCommsLog(logs);
  }, [activeIncident?.id, ambulance.status, police.status, traffic.greenCorridorActive]);

  // Compute Current Mission Phase & Clear Human-Readable Narrative
  const getMissionPhase = () => {
    if (!activeIncident) {
      return {
        step: 0,
        title: 'STANDBY & SECTOR MONITORING',
        badge: 'ALL NORMAL',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
        description: 'URSA-I autonomous multi-agent swarm is continuously analyzing city sensors, traffic cameras, and hospital ER capacity across Chennai.',
        currentAgentActions: [
          'Ambulance AM-15 on rapid-standby at Central Depot',
          'Police Unit PD-28 on active patrol in Sector 4',
          'Traffic Controller TR-07 running SCATS dynamic signal optimization',
          'Hospital Agents streaming live bed availability',
        ],
        actionPrompt: 'Click "Road Crash" or "Major Fire" to simulate an emergency and watch the swarm coordinate in real time.',
      };
    }

    if (ambulance.status === 'ARRIVED_AT_HOSPITAL') {
      return {
        step: 5,
        title: 'PATIENT TRANSFERRED TO HOSPITAL ER',
        badge: 'MISSION COMPLETE',
        badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        description: `Ambulance AM-15 has arrived at ${hospital.selectedHospital?.name || 'Apollo Main'}. Patient successfully transferred into the trauma resuscitation bay.`,
        currentAgentActions: [
          'Ambulance crew handing over real-time telemetry to trauma surgeons',
          'Police unit clearing scene wreckage and reopening traffic lanes',
          'Traffic agent releasing green corridor lock back to adaptive flow',
          'Hospital agent updating ICU capacity counter',
        ],
        actionPrompt: 'Mission accomplished with 0 signal delays and record response speed.',
      };
    }

    if (ambulance.status === 'TRANSPORTING') {
      return {
        step: 4,
        title: 'HOSPITAL TRANSPORT VIA GREEN WAVE',
        badge: 'TRANSPORTING',
        badgeColor: 'bg-teal-950 text-teal-300 border-teal-700',
        description: `Ambulance AM-15 is speeding towards ${hospital.selectedHospital?.name || 'Apollo Main Hospital'} with patient under paramedic care.`,
        currentAgentActions: [
          `Ambulance AM-15: Priority transport at 60 km/h (ETA: ${formatEta(ambulance.eta)})`,
          'Traffic Agent TR-07: Holding green corridor along hospital approach route',
          'Hospital ER: Trauma bay pre-warmed, surgical team awaiting arrival',
          'Police Agent PD-28: Escorting rear flank and keeping intersection clear',
        ],
        actionPrompt: 'Green corridor is synchronized to ambulance speed to prevent braking.',
      };
    }

    if (ambulance.status === 'AT_SCENE' || police.status === 'ON_SCENE') {
      return {
        step: 3,
        title: 'ON-SCENE TRIAGE & PERIMETER CORDON',
        badge: 'ON SCENE',
        badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
        description: `First responders have arrived at the scene (${activeIncident.description || 'Anna Salai'}). Paramedics are treating victims while police secure the area.`,
        currentAgentActions: [
          'Ambulance AM-15: Stabilizing victim and preparing spinal immobilization',
          'Police PD-28: Securing 150m perimeter to prevent secondary collisions',
          'Traffic Agent TR-07: Holding holding green phase for upcoming hospital departure',
          'Hospital Agent: Reserving Trauma Bay and notifying surgical team',
        ],
        actionPrompt: 'Patient loading in progress. Preparing immediate high-priority hospital transport.',
      };
    }

    if (ambulance.status === 'EN_ROUTE' || police.status === 'EN_ROUTE') {
      return {
        step: 2,
        title: 'AUTONOMOUS SWARM RAPID DISPATCH',
        badge: 'EN ROUTE',
        badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700',
        description: `Emergency vehicles are en route to ${activeIncident.description || 'the incident site'} along the Anna Salai expressway.`,
        currentAgentActions: [
          `Ambulance AM-15: Speeding via optimal lane (ETA: ${formatEta(ambulance.eta)}, ${formatDistance(ambulance.routeDistance)})`,
          'Police PD-28: Advance cruiser clearing traffic 300m ahead of ambulance',
          'Traffic Agent TR-07: 4 SCATS intersections locked to 100% green wave',
          `Hospital Agent: Selected ${hospital.selectedHospital?.name || 'Apollo'} (14 ICU beds available)`,
        ],
        actionPrompt: 'Swarm agents are synchronized over V2X mesh radio for zero-delay transit.',
      };
    }

    return {
      step: 1,
      title: 'INCIDENT DETECTED & AI ROUTE OPTIMIZATION',
      badge: 'ANALYZING',
      badgeColor: 'bg-red-950 text-red-300 border-red-700',
      description: `URSA-I AI detected a ${activeIncident.severity} ${activeIncident.type} at ${activeIncident.description || 'Chennai Sector'}. Swarm agents calculating fastest non-congested route.`,
      currentAgentActions: [
        'Calculating shortest impedance path factoring current road congestion',
        'Assigning nearest Type-IV ALS ambulance and police patrol unit',
        'Requesting SCATS signal preemption authorization',
        'Querying regional hospital ER bed availability',
      ],
      actionPrompt: 'Dispatching emergency response units.',
    };
  };

  const phase = getMissionPhase();

  return (
    <aside className="w-full lg:w-[420px] xl:w-[450px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 flex flex-col h-full overflow-hidden shrink-0 shadow-2xl">
      {/* 1. Header with Tab Switcher */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <h2 className="font-mono text-xs font-extrabold text-slate-100 tracking-wider uppercase">
              Mission & Agent Activity
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            AUTONOMOUS SWARM
          </span>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            WHAT'S HAPPENING
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AGENTS')}
            className={`py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'AGENTS'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>AGENT ROLES</span>
            <span className="text-[9px] bg-slate-900 px-1 rounded-full border border-slate-700">4</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMMS')}
            className={`py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === 'COMMS'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            AI COMMS LOG
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-3.5">
        {/* ========================================================================= */}
        {/* TAB 1: WHAT'S HAPPENING (CLEAR NARRATIVE & CURRENT STATE) */}
        {/* ========================================================================= */}
        {activeTab === 'OVERVIEW' && (
          <>
            {/* Live Situation Narrative Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  CURRENT SITUATION SUMMARY
                </span>
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${phase.badgeColor}`}>
                  {phase.badge}
                </span>
              </div>

              <div>
                <h3 className="font-sans text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  {phase.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  {phase.description}
                </p>
              </div>

              {/* Real-time What Agents Are Doing Checklist */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  ACTIVE AGENT WORK RIGHT NOW:
                </span>
                <div className="space-y-1 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 font-sans text-xs">
                  {phase.currentAgentActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>MISSION COMPLETION PROGRESS</span>
                  <span className="text-cyan-400 font-bold">{Math.min(100, phase.step * 20)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(8, phase.step * 20)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Active Incident Details */}
            {activeIncident ? (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-mono text-xs font-bold text-red-400">{activeIncident.id} • {activeIncident.type}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    SEVERITY: {activeIncident.severity}
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-semibold">{activeIncident.description}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[9px]">LOCATION:</span>
                    <span className="text-slate-200 font-semibold">{activeIncident.latitude.toFixed(4)}, {activeIncident.longitude.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">DESTINATION HOSPITAL:</span>
                    <span className="text-emerald-400 font-bold truncate block">{hospital.selectedHospital?.name || 'Apollo Main'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center mx-auto">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200">Chennai Emergency Sector Standing By</div>
                <div className="text-[11px] text-slate-400">Select an emergency below to trigger autonomous multi-agent dispatch and green wave routing.</div>
              </div>
            )}

            {/* Dynamic Emergency Hotspots Across Chennai */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  SIMULATE ROAD ACCIDENT LOCATION:
                </span>
                <span className="text-[9px] font-mono text-cyan-400 font-semibold">
                  Select to test nearest hospital
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {CHENNAI_INCIDENT_HOTSPOTS.map((hotspot, idx) => (
                  <button
                    key={hotspot.id}
                    type="button"
                    onClick={() => simulateAccident(idx)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/80 border border-slate-800 hover:border-red-600/80 text-left transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 group-hover:text-red-300">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{hotspot.shortName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                      <span className="text-emerald-400 font-mono font-semibold">→ {hotspot.expectedNearestHospital.split('(')[0].trim()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DETAILED AGENT ROLES & EXACT WORK BREAKDOWN */}
        {/* ========================================================================= */}
        {activeTab === 'AGENTS' && (
          <div className="space-y-3.5">
            {/* 1. AMBULANCE AGENT (AM-15) */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-900/60 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Ambulance className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-emerald-400">AMBULANCE AGENT (AM-15)</h4>
                    <span className="text-[10px] font-mono text-slate-400">Type-IV Advanced Life Support (ALS)</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {ambulance.status}
                </span>
              </div>

              {/* Exact Work In Progress */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>CURRENT TASK & ACTION:</span>
                </div>
                <p className="text-xs font-sans text-slate-200 leading-snug">
                  {ambulance.status === 'EN_ROUTE'
                    ? 'Navigating Anna Salai green wave corridor at 58 km/h. Paramedic crew prepping defibrillator, IV line, and emergency airway kit.'
                    : ambulance.status === 'AT_SCENE'
                    ? 'On-scene medical triage in progress. Paramedics conducting vitals check (BP: 118/76, SpO2: 98%) and performing patient spinal immobilization.'
                    : ambulance.status === 'TRANSPORTING'
                    ? `Transporting trauma patient to ${hospital.selectedHospital?.name || 'Apollo Hospital'}. Continuous ECG data streaming directly to ER team.`
                    : ambulance.status === 'ARRIVED_AT_HOSPITAL'
                    ? 'Handing patient over to Trauma Resuscitation Bay 2. Preparing ambulance for return to depot.'
                    : 'Standing by at Chennai Central Ambulance Depot on high-alert status.'}
                </p>

                {/* Why this decision */}
                <div className="text-[11px] font-sans text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-300">Strategy:</strong> Utilizing synchronized V2X green corridor to maintain continuous momentum and prevent abrupt deceleration.
                  </span>
                </div>
              </div>

              {/* Live Telemetry */}
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[9px]">ETA:</span>
                  <span className="text-slate-100 font-bold">{formatEta(ambulance.eta)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">DISTANCE:</span>
                  <span className="text-slate-100 font-bold">{formatDistance(ambulance.routeDistance)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">CRITICAL GEAR:</span>
                  <span className="text-emerald-400 font-bold">ALS Ready</span>
                </div>
              </div>
            </div>

            {/* 2. POLICE AGENT (PD-28) */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-900/60 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-blue-400">POLICE AGENT (PD-28)</h4>
                    <span className="text-[10px] font-mono text-slate-400">Rapid Interceptor & Crowd Security</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">
                  {police.status}
                </span>
              </div>

              {/* Exact Work In Progress */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>CURRENT TASK & ACTION:</span>
                </div>
                <p className="text-xs font-sans text-slate-200 leading-snug">
                  {police.status === 'EN_ROUTE'
                    ? 'Deploying emergency cruiser to establish perimeter cordon around the crash site. Diverting civilian vehicles onto Mount Road bypass.'
                    : police.status === 'ON_SCENE'
                    ? 'Securing 150m crash perimeter. Managing crowd control and maintaining a clear, unobstructed entry/exit lane for the ambulance.'
                    : 'Conducting routine patrol and readiness check in Chennai Sector 4.'}
                </p>

                {/* Why this decision */}
                <div className="text-[11px] font-sans text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-300">Strategy:</strong> Pre-clearing intersections 300m in advance of the ambulance to eliminate civilian obstruction.
                  </span>
                </div>
              </div>

              {/* Live Telemetry */}
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[9px]">CORDON:</span>
                  <span className="text-slate-100 font-bold">150m Locked</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">CIVILIAN DIVERSION:</span>
                  <span className="text-blue-400 font-bold">Active</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">ESCORT FORMATION:</span>
                  <span className="text-slate-100 font-bold">Front Convoy</span>
                </div>
              </div>
            </div>

            {/* 3. TRAFFIC CONTROLLER AGENT (TR-07) */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-900/60 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-amber-400">TRAFFIC AGENT (TR-07)</h4>
                    <span className="text-[10px] font-mono text-slate-400">SCATS V2X Signal Orchestrator</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                  {traffic.greenCorridorActive ? 'GREEN WAVE ACTIVE' : 'MONITORING'}
                </span>
              </div>

              {/* Exact Work In Progress */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>CURRENT TASK & ACTION:</span>
                </div>
                <p className="text-xs font-sans text-slate-200 leading-snug">
                  {traffic.greenCorridorActive
                    ? 'Holding 100% green wave along 4 SCATS intersections (Gemini Flyover, Spencer Plaza, Thousand Lights, Mount Rd). Cross-street traffic held on red.'
                    : 'SCATS adaptive traffic signal controller optimizing normal vehicle flow across central arteries.'}
                </p>

                {/* Why this decision */}
                <div className="text-[11px] font-sans text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-300">Strategy:</strong> Dynamic phase extension based on real-time ambulance velocity to eliminate red-light stops.
                  </span>
                </div>
              </div>

              {/* Live Telemetry */}
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[9px]">GREEN WAVE:</span>
                  <span className="text-emerald-400 font-bold">{traffic.greenCorridorActive ? 'LOCKED' : 'READY'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">JUNCTIONS:</span>
                  <span className="text-slate-100 font-bold">4 Overridden</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">TIME SAVED:</span>
                  <span className="text-emerald-400 font-bold">~4.8 Mins</span>
                </div>
              </div>
            </div>

            {/* 4. HOSPITAL & ER AGENT */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-900/60 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
                    <Hospital className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-purple-400">HOSPITAL ER AGENT</h4>
                    <span className="text-[10px] font-mono text-slate-400">{hospital.selectedHospital?.name || 'Apollo Hospitals Main'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                  TRAUMA READY
                </span>
              </div>

              {/* Exact Work In Progress */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-purple-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>CURRENT TASK & ACTION:</span>
                </div>
                <p className="text-xs font-sans text-slate-200 leading-snug">
                  {ambulance.status === 'TRANSPORTING'
                    ? 'Trauma Bay 2 prepped with blood transfusion unit and ventilator. Orthopedic trauma team pre-briefed on incoming patient vitals.'
                    : ambulance.status === 'ARRIVED_AT_HOSPITAL'
                    ? 'Emergency surgery team has taken direct handover from paramedics. Patient in active resuscitation.'
                    : 'Monitoring live regional bed telemetry and ready for emergency patient intake.'}
                </p>

                {/* Why this decision */}
                <div className="text-[11px] font-sans text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-300">Strategy:</strong> Pre-allocation of trauma bay before ambulance arrives eliminates emergency room wait times.
                  </span>
                </div>
              </div>

              {/* Live Telemetry */}
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[9px]">FREE ICU BEDS:</span>
                  <span className="text-emerald-400 font-bold">{hospital.selectedHospital?.bedsAvailable || 14} Available</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">TRAUMA BAY:</span>
                  <span className="text-purple-400 font-bold">Bay #2 Prepped</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">SURGEON STATUS:</span>
                  <span className="text-slate-100 font-bold">On Standby</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LIVE V2X AGENT COMMS LOG */}
        {/* ========================================================================= */}
        {activeTab === 'COMMS' && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              AUTONOMOUS INTER-AGENT V2X COMMS STREAM:
            </span>

            <div className="space-y-2 font-mono text-xs">
              {commsLog.map((log) => (
                <div key={log.id} className={`p-3 rounded-lg bg-slate-900/90 border-l-2 ${log.color} space-y-1 shadow-md`}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold">{log.sender}</span>
                    <span className="text-slate-500">{log.time}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold">{log.role}</div>
                  <p className="text-[11px] text-slate-200 font-sans leading-snug pt-0.5">"{log.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Reset / Quick Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <button
          type="button"
          onClick={() => resetSystem()}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold transition-colors cursor-pointer"
        >
          Reset Simulation
        </button>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>URSA-I V2X MESH ACTIVE</span>
        </div>
      </div>
    </aside>
  );
};
