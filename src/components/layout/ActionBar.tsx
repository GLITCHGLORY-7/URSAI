import React, { useState } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { Play, Pause, RotateCcw, Gauge, ChevronUp } from 'lucide-react';

export const ActionBar: React.FC = () => {
  const {
    state,
    simulateAccident,
    resetSystem,
    startDemo,
    pauseDemo,
    resumeDemo,
    setDemoSpeed,
    setDemoScenario,
  } = useUrsai();

  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const demoState = state.demoState || 'IDLE';
  const demoSpeed = state.demoSpeed || 'NORMAL';
  const demoScenario = state.demoScenario || 'STANDARD';

  return (
    <>
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs z-20">
        {/* Left Status & Demo Controls Info */}
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                demoState === 'RUNNING' || state.activeIncident
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="text-emerald-400 font-semibold uppercase">
              {demoState === 'RUNNING'
                ? 'DEMO ACTIVE'
                : state.activeIncident
                ? 'MISSION ACTIVE'
                : 'COMMAND READY'}
            </span>
          </div>

          <div className="hidden sm:inline border-l border-slate-800 pl-3 text-slate-500">
            Chennai Command Sector • Smart Swarm AI
          </div>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Demo Scenario Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowScenarioMenu(!showScenarioMenu)}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="text-[10px] text-slate-500">SCENARIO:</span>
              <span className="font-bold text-slate-200">
                {demoScenario === 'HIGH_PRIORITY' ? 'HIGH PRIORITY' : 'STANDARD'}
              </span>
              <ChevronUp className="w-3 h-3 text-slate-400" />
            </button>

            {showScenarioMenu && (
              <div className="absolute right-0 bottom-10 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[10px] uppercase text-slate-400 font-bold px-2 py-1 border-b border-slate-800">
                  Select Demo Scenario
                </div>
                <button
                  onClick={() => {
                    setDemoScenario('STANDARD');
                    setShowScenarioMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                    demoScenario === 'STANDARD' ? 'bg-amber-950/60 text-amber-300 border border-amber-800' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  STANDARD ACCIDENT
                  <div className="text-[9px] text-slate-500 font-normal">Anna Salai • High Severity</div>
                </button>
                <button
                  onClick={() => {
                    setDemoScenario('HIGH_PRIORITY');
                    setShowScenarioMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                    demoScenario === 'HIGH_PRIORITY' ? 'bg-red-950/60 text-red-300 border border-red-800' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  HIGH PRIORITY ACCIDENT
                  <div className="text-[9px] text-slate-500 font-normal">Central Station • Critical Severity</div>
                </button>
              </div>
            )}
          </div>

          {/* Demo Speed Toggle Button */}
          <button
            type="button"
            onClick={() => setDemoSpeed(demoSpeed === 'NORMAL' ? 'DEMO_SPEED' : 'NORMAL')}
            className={`px-2.5 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              demoSpeed === 'DEMO_SPEED'
                ? 'bg-purple-950/90 text-purple-300 border-purple-700 shadow-md shadow-purple-950/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{demoSpeed === 'DEMO_SPEED' ? 'DEMO SIMULATION SPEED (3x)' : 'NORMAL SPEED (1x)'}</span>
          </button>

          {/* START DEMO / PAUSE / RESUME Control Buttons */}
          {demoState === 'RUNNING' ? (
            <button
              type="button"
              onClick={pauseDemo}
              className="px-3 py-1.5 rounded font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/60 border border-amber-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE DEMO</span>
            </button>
          ) : demoState === 'PAUSED' ? (
            <button
              type="button"
              onClick={resumeDemo}
              className="px-3 py-1.5 rounded font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/60 border border-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME DEMO</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startDemo}
              className="px-3 py-1.5 rounded font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60 border border-red-500 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START DEMO</span>
            </button>
          )}

          {/* SIMULATE ACCIDENT Button */}
          <button
            type="button"
            onClick={simulateAccident}
            className="px-3 py-1.5 rounded font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-700/80 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Simulate Incident</span>
          </button>

          {/* RESET SIMULATION Button */}
          <button
            type="button"
            onClick={resetSystem}
            className="px-3 py-1.5 rounded font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </>
  );
};
