import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono text-slate-300 space-y-2 pointer-events-auto max-w-sm">
      <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
        <span>Command Map Legend</span>
        <span className="text-[10px] text-teal-400 font-normal">SIMULATED DATA</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
        {/* Incident */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-sm inline-block"></span>
          <span>RED: Incident</span>
        </div>

        {/* Ambulance Route */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-blue-500 rounded inline-block"></span>
          <span>BLUE: Ambulance Route</span>
        </div>

        {/* Police Route */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-indigo-600 rounded inline-block"></span>
          <span>DARK BLUE: Police Route</span>
        </div>

        {/* Green Corridor */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-emerald-400 rounded inline-block"></span>
          <span>GREEN: Green Corridor</span>
        </div>

        {/* Hospital */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-teal-600 border border-white inline-block"></span>
          <span>TEAL: Hospital</span>
        </div>

        {/* Fire Rescue */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-orange-600 border border-white inline-block"></span>
          <span>ORANGE: Fire Engine</span>
        </div>

        {/* Public Works */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-cyan-600 border border-white inline-block"></span>
          <span>CYAN: Public Works</span>
        </div>

        {/* Electricity Utility */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-sky-600 border border-white inline-block"></span>
          <span>SKY: Power Crew</span>
        </div>

        {/* Target */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block"></span>
          <span>AMBER: Selection Target</span>
        </div>
      </div>
    </div>
  );
};
