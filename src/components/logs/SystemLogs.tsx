import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { Terminal, Info, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { formatTime } from '../../incidents/incidentManager';

export const SystemLogs: React.FC = () => {
  const { state } = useUrsai();
  const { logs } = state;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs space-y-2 flex flex-col h-48 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>SWARM EVENT STREAM</span>
        </div>
        <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
          LIVE LOGS ({logs.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar text-[11px]">
        {logs.map((log) => {
          let Icon = Info;
          let textColor = 'text-slate-300';

          if (log.type === 'danger') {
            Icon = AlertOctagon;
            textColor = 'text-red-400';
          } else if (log.type === 'warning') {
            Icon = AlertTriangle;
            textColor = 'text-amber-400';
          } else if (log.type === 'success') {
            Icon = CheckCircle2;
            textColor = 'text-emerald-400';
          }

          return (
            <div
              key={log.id}
              className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-slate-900/60 transition-colors border-b border-slate-900/50"
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${textColor}`} />
              <div className="flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] font-mono">{formatTime(log.timestamp)}</span>
                  <span className="text-[9px] px-1 bg-slate-900 border border-slate-800 text-slate-400 rounded">
                    {log.source}
                  </span>
                </div>
                <p className={`${textColor} font-sans text-xs mt-0.5`}>{log.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
