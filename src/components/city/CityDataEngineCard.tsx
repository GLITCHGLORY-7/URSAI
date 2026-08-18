import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import {
  Activity,
  CloudRain,
  Sun,
  Cloud,
  Navigation,
  Shield,
  Truck,
  Building2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const CityDataEngineCard: React.FC = () => {
  const { state } = useUrsai();
  const city = state.cityState;

  if (!city) return null;

  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case 'HEAVY_RAIN':
      case 'LIGHT_RAIN':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'CLOUDY':
        return <Cloud className="w-4 h-4 text-slate-400" />;
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/50 border-red-800';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/50 border-orange-800';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/50 border-yellow-800';
      default:
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
    }
  };

  const getHospitalPressureColor = (pressure: string) => {
    switch (pressure) {
      case 'CRITICAL':
        return 'text-red-400 border-red-800 bg-red-950/40';
      case 'HIGH':
        return 'text-amber-400 border-amber-800 bg-amber-950/40';
      case 'MEDIUM':
        return 'text-blue-400 border-blue-800 bg-blue-950/40';
      default:
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-800/60 rounded-lg text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              City Data Simulation Engine
            </h3>
            <p className="text-[11px] text-slate-400">Real-Time City Environment Observation</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800/80 text-slate-300">
          SIMULATED CITY DATA
        </span>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {/* Traffic Level */}
        <div className={`p-2.5 rounded-lg border ${getTrafficColor(city.traffic.overallLevel)}`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-300 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-current" /> Traffic
            </span>
            <span className="font-bold">{city.traffic.overallLevel}</span>
          </div>
          <div className="text-sm font-semibold">
            {(city.traffic.congestionIndex * 100).toFixed(0)}% <span className="text-[10px] font-normal text-slate-400">congestion</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Avg Speed: {city.traffic.averageSpeedKmh} km/h
          </div>
        </div>

        {/* Weather */}
        <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-200">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              {getWeatherIcon(city.weather.condition)} Weather
            </span>
            <span className="font-semibold text-slate-300">{city.weather.condition.replace('_', ' ')}</span>
          </div>
          <div className="text-sm font-semibold text-slate-100">
            {city.weather.temperatureC}°C
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Visibility: {city.weather.visibilityKm} km
          </div>
        </div>

        {/* Available Resources */}
        <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-200">
          <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Swarm Fleet</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <Truck className="w-3.5 h-3.5" /> {city.resources.ambulancesAvailable}/5 Amb
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <Shield className="w-3.5 h-3.5" /> {city.resources.policeUnitsAvailable}/5 Pol
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Standby Ready Units
          </div>
        </div>

        {/* Hospital Pressure */}
        <div className={`p-2.5 rounded-lg border ${getHospitalPressureColor(city.hospitalPressure)}`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-300 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> ICU Pressure
            </span>
            <span className="font-bold">{city.hospitalPressure}</span>
          </div>
          <div className="text-xs font-mono mt-1 text-slate-300">
            {city.hospitalPressure === 'CRITICAL' ? 'ICU Beds Near Depletion' : 'Intake Capacities Monitored'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Affected Roads: {city.affectedRoadsCount}
          </div>
        </div>
      </div>

      {/* Incident Corridor Impact Zone Info */}
      {state.activeIncident && (
        <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Active Impact Corridor: Sector {state.activeIncident.id}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Green Corridor: {state.traffic.greenCorridorActive ? 'ACTIVE (PRIORITY CLEAR)' : 'INACTIVE'}
          </span>
        </div>
      )}
    </div>
  );
};
