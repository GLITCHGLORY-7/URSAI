import React, { useState, useEffect } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { SystemStatus } from './SystemStatus';
import { UrsaiLogo } from '../common/UrsaiLogo';
import { MapPin, Clock, Monitor } from 'lucide-react';

export const Header: React.FC = () => {
  const { state, setActiveTab, togglePresentationMode } = useUrsai();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const isNimActive = state.aiDecision?.engine === 'NVIDIA NIM';
  const activeTab = state.activeTab || 'COMMAND_CENTER';
  const isPresMode = state.isPresentationMode || false;

  return (
    <header className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 text-slate-100 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md shadow-slate-950/80">
      {/* Title & Brand with Official URSAI Logo */}
      <div className="flex items-center gap-3">
        <UrsaiLogo size={42} variant="horizontal" showSubtitle={true} glow={true} />
      </div>

      {/* Right Status, Presentation Toggle & Clock */}
      <div className="flex items-center gap-3 text-xs font-mono">
        {/* Presentation Mode Toggle Button */}
        <button
          type="button"
          onClick={togglePresentationMode}
          className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
            isPresMode
              ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{isPresMode ? 'PRESENTATION MODE ON' : 'PRESENTATION MODE'}</span>
        </button>

        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>CHENNAI</span>
        </div>

        <SystemStatus status={state.systemStatus} message={state.statusMessage} />

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime || '00:00:00'} IST</span>
        </div>
      </div>
    </header>
  );
};
