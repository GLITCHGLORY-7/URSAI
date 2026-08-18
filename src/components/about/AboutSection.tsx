import React from 'react';
import { UrsaiLogo } from '../common/UrsaiLogo';
import { Shield, Cpu, Activity, Map, ArrowRight, Layers, CheckCircle2, Server, Database } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto custom-scrollbar font-sans text-slate-200">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Official Brand Showcase Hero */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-radial-gradient from-cyan-950/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <UrsaiLogo size={130} variant="full" showSubtitle={true} glow={true} />
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold tracking-wider uppercase">
                Autonomous Smart City Emergency Swarm Intelligence
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mt-5">
              URSAI (<strong>U</strong>rban <strong>R</strong>esource <strong>S</strong>warm <strong>A</strong>I <strong>I</strong>ntelligence) is a next-generation distributed multi-agent command system engineered to synchronize emergency dispatch across <strong>Ambulances</strong>, <strong>Police Perimeters</strong>, <strong>Dynamic Traffic Green Corridors</strong>, and <strong>Hospital Intake</strong> in real-time.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/30 border border-amber-800/50 px-4 py-2.5 rounded-xl max-w-2xl mx-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>DISCLAIMER: This system is an active smart city research and tactical simulation prototype.</span>
          </div>
        </div>

        {/* Problem & Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-sm uppercase">
              <Activity className="w-4 h-4" />
              <span>The Problem</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional urban emergency responses suffer from fragmented communication between dispatch units, police traffic management, and hospital emergency rooms. Traffic congestion, delayed signal clearing, and uncoordinated hospital selection lead to severe response delays during critical Golden Hour windows.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>The URSAI Solution</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              URSAI deploys an authoritative swarm coordinator backed by NVIDIA NIM AI reasoning and deterministic fallback logic. It automatically selects optimal hospitals, clears Green Corridor signal routes, dispatches perimeter police, and continuously re-evaluates mission metrics against dynamic city state changes.
            </p>
          </div>
        </div>

        {/* Visual Architecture Flow */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>URSAI SYSTEM ARCHITECTURE</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase">End-to-End Pipeline</span>
          </div>

          {/* Architecture Box Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs pt-2">
            <div className="flex-1 w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-center space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Layer 1</div>
              <div className="font-bold text-slate-200">DATA SOURCES</div>
              <div className="text-[10px] text-slate-500">OpenStreetMap • Weather • City Sim</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block shrink-0" />

            <div className="flex-1 w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-center space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Layer 2</div>
              <div className="font-bold text-cyan-300">CITY DATA ENGINE</div>
              <div className="text-[10px] text-slate-500">Congestion • Weather • Hospital ICU</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block shrink-0" />

            <div className="flex-1 w-full bg-slate-950 border border-cyan-800/80 bg-cyan-950/20 p-3 rounded-lg text-center space-y-1">
              <div className="text-cyan-400 text-[10px] uppercase font-semibold">Layer 3</div>
              <div className="font-bold text-cyan-200">AI DECISION ENGINE</div>
              <div className="text-[10px] text-cyan-400/80">NVIDIA NIM • Llama 3.3 70B</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block shrink-0" />

            <div className="flex-1 w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-center space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Layer 4</div>
              <div className="font-bold text-amber-300">SWARM COORDINATOR</div>
              <div className="text-[10px] text-slate-500">Dispatch & State Machine</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg">
              <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1 text-center">Layer 5: Swarm Agents</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-bold">
                <span className="p-1.5 bg-red-950/40 border border-red-800/60 text-red-300 rounded">Ambulance</span>
                <span className="p-1.5 bg-blue-950/40 border border-blue-800/60 text-blue-300 rounded">Police</span>
                <span className="p-1.5 bg-amber-950/40 border border-amber-800/60 text-amber-300 rounded">Traffic Corridor</span>
                <span className="p-1.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded">Hospital</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block shrink-0" />

            <div className="w-full md:w-64 bg-slate-950 border border-slate-800 p-3 rounded-lg text-center space-y-1 shrink-0">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Layer 6</div>
              <div className="font-bold text-purple-300">MISSION MONITOR & EVAL</div>
              <div className="text-[10px] text-slate-500">Adaptive Replan & Benchmarks</div>
            </div>
          </div>
        </div>

        {/* Technology Stack Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-100 font-mono font-bold text-sm uppercase border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Technology Stack</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <div className="text-slate-400 text-[10px]">FRONTEND UI</div>
              <div className="font-bold text-slate-200">React 19 & TypeScript</div>
              <div className="text-[10px] text-slate-500">Tailwind CSS • Lucide</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <div className="text-slate-400 text-[10px]">SPATIAL & MAPS</div>
              <div className="font-bold text-slate-200">Leaflet & OpenStreetMap</div>
              <div className="text-[10px] text-slate-500">CartoDB Dark Tiles</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <div className="text-slate-400 text-[10px]">ROUTING SERVICE</div>
              <div className="font-bold text-slate-200">OSRM Engine</div>
              <div className="text-[10px] text-slate-500">Direct Haversine Fallback</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <div className="text-cyan-400 text-[10px]">AI REASONING</div>
              <div className="font-bold text-cyan-300">NVIDIA NIM</div>
              <div className="text-[10px] text-slate-500">Llama-3.3-70B-Instruct</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
