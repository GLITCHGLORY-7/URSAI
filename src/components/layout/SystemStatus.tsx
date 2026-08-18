import React from 'react';
import { SystemStatusType } from '../../types/ursai';

interface SystemStatusProps {
  status: SystemStatusType;
  message?: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ status, message }) => {
  const isOperational = status === 'SYSTEM_OPERATIONAL';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs font-medium tracking-wide transition-colors ${
        isOperational
          ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
          : 'bg-amber-950/70 border-amber-800/80 text-amber-300'
      }`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isOperational ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            isOperational ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        ></span>
      </span>
      <span>{isOperational ? 'SYSTEM OPERATIONAL' : 'SYSTEM DEGRADED'}</span>
      {message && <span className="hidden lg:inline text-slate-400 font-sans border-l border-slate-700 pl-2 ml-1">{message}</span>}
    </div>
  );
};
