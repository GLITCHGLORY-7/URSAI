import React, { useState } from 'react';
import { StressTestEngine, StressTestConfig, StressTestResult } from '../../services/stress/stressTestEngine';
import { TrafficLevel, WeatherCondition } from '../../types/ursai';
import { Gauge, Flame, Play, ShieldAlert, Cpu, CheckCircle2, AlertOctagon, Download } from 'lucide-react';

export const StressTestLabCard: React.FC = () => {
  const [config, setConfig] = useState<StressTestConfig>({
    incidentCount: 25,
    ambulanceCount: 5,
    policeCount: 5,
    hospitalCount: 3,
    trafficLevel: 'HIGH',
    weatherCondition: 'LIGHT_RAIN',
    enableChaosMode: false,
    failNIM: false,
    failOSRM: false,
    hospitalOverload: false,
    seed: 'URSAI-SEEDED-RUN',
  });

  const [result, setResult] = useState<StressTestResult | null>(() => StressTestEngine.runStressTest(config));

  const handleRunTest = () => {
    const res = StressTestEngine.runStressTest(config);
    setResult(res);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/80 border border-amber-800 rounded-lg text-amber-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono tracking-tight text-slate-100">
                PHASE 18 — LARGE-SCALE CITY SIMULATION & STRESS LAB
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold uppercase">
                CHAOS & CAPACITY SUITE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-incident stress testing, resource pressure simulation, failure injection, and system resilience evaluation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunTest}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>EXECUTE STRESS TEST</span>
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs">
        {/* Workload Size */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold block">Simulated Emergency Calls</label>
          <div className="grid grid-cols-4 gap-1">
            {[5, 25, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setConfig({ ...config, incidentCount: num })}
                className={`py-1.5 rounded text-center font-bold border cursor-pointer ${
                  config.incidentCount === num
                    ? 'bg-amber-950 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {num} Calls
              </button>
            ))}
          </div>
        </div>

        {/* Traffic Level */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold block">Simulated Traffic Congestion</label>
          <select
            value={config.trafficLevel}
            onChange={(e) => setConfig({ ...config, trafficLevel: e.target.value as TrafficLevel })}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="LOW">LOW CONGESTION</option>
            <option value="MEDIUM">MEDIUM CONGESTION</option>
            <option value="HIGH">HIGH CONGESTION</option>
            <option value="CRITICAL">CRITICAL CONGESTION</option>
          </select>
        </div>

        {/* Failure Injection Toggles */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold block">Failure Injection & Chaos Controls</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfig({ ...config, enableChaosMode: !config.enableChaosMode })}
              className={`py-1 px-2 rounded font-bold border text-[11px] flex items-center justify-center gap-1 cursor-pointer ${
                config.enableChaosMode
                  ? 'bg-red-950 border-red-500 text-red-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>CHAOS MODE</span>
            </button>

            <button
              type="button"
              onClick={() => setConfig({ ...config, hospitalOverload: !config.hospitalOverload })}
              className={`py-1 px-2 rounded font-bold border text-[11px] flex items-center justify-center gap-1 cursor-pointer ${
                config.hospitalOverload
                  ? 'bg-purple-950 border-purple-500 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <AlertOctagon className="w-3 h-3" />
              <span>ICU OVERLOAD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Results Dashboard */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-400">RESILIENCE SCORE</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{result.metrics.systemResilienceScore}/100</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">100% Graceful Recovery</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-400">AVERAGE RESPONSE TIME</div>
              <div className="text-xl font-bold text-slate-200 mt-1">
                {Math.floor(result.metrics.averageResponseTimeSeconds / 60)}m {result.metrics.averageResponseTimeSeconds % 60}s
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across {result.metrics.totalIncidents} calls</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-400">THROUGHPUT RATE</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{result.metrics.simulationThroughputPerMin} calls/min</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Simulated processing speed</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-400">RESOURCE UTILIZATION</div>
              <div className="text-xl font-bold text-purple-400 mt-1">{result.metrics.resourceUtilizationPercent}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fleet capacity workload</div>
            </div>
          </div>

          {/* Bottlenecks Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 font-mono">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Detected City Capacity Bottlenecks & Failure Recovery Log</span>
            </h3>
            <div className="space-y-1.5 text-xs text-amber-200/90">
              {result.metrics.bottlenecksDetected.map((b, idx) => (
                <div key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
