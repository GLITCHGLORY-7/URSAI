import React, { useState } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { whatIfEngine } from '../../services/digitalTwin/whatIfEngine';
import {
  ScenarioType,
  ScenarioEvaluationResult,
  ScenarioParameters,
} from '../../types/ursai';
import {
  FlaskConical,
  Play,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  Clock,
  Navigation,
  Building2,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const ScenarioLabCard: React.FC = () => {
  const { state } = useUrsai();
  const [selectedType, setSelectedType] = useState<ScenarioType>('TRAFFIC_INCREASE');
  const [trafficIncrease, setTrafficIncrease] = useState<number>(30);
  const [blockedRoad, setBlockedRoad] = useState<string>('Anna Salai Main Corridor');
  const [hospitalReduction, setHospitalReduction] = useState<number>(50);
  const [rainSeverity, setRainSeverity] = useState<'LIGHT' | 'HEAVY' | 'TORRENTIAL'>('HEAVY');
  const [ambulanceDelay, setAmbulanceDelay] = useState<number>(5);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<ScenarioEvaluationResult | null>(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setResult(null);

    const params: ScenarioParameters = {};
    if (selectedType === 'TRAFFIC_INCREASE') params.trafficIncreasePercent = trafficIncrease;
    if (selectedType === 'ROAD_BLOCKAGE') params.blockedRoadName = blockedRoad;
    if (selectedType === 'HOSPITAL_CAPACITY_REDUCTION') params.hospitalCapacityReductionPercent = hospitalReduction;
    if (selectedType === 'WEATHER_DETERIORATION') params.rainSeverity = rainSeverity;
    if (selectedType === 'AMBULANCE_DELAY') params.ambulanceDelayMinutes = ambulanceDelay;
    if (selectedType === 'GREEN_CORRIDOR_UNAVAILABLE') params.greenCorridorEnabled = false;

    try {
      const simResult = await whatIfEngine.runScenarioSimulation(state, selectedType, params);
      setResult(simResult);
    } catch (err) {
      console.error('Scenario simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-5 text-slate-100 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800 rounded-lg text-indigo-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              SCENARIO INTELLIGENCE & DIGITAL TWIN
            </h2>
            <p className="text-xs text-slate-400">
              Isolated "What-If" Sandbox • Predict Future Road & Hospital Bottlenecks
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded uppercase font-semibold">
          Phase 12 Digital Twin
        </span>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-lg">
        {/* Scenario Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-300 block">
            SELECT WHAT-IF SCENARIO:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ScenarioType)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="TRAFFIC_INCREASE">1. Traffic Congestion Spike (+10% to +50%)</option>
            <option value="ROAD_BLOCKAGE">2. Complete Road Blockage / Obstruction</option>
            <option value="HOSPITAL_CAPACITY_REDUCTION">3. Hospital ICU & Bed Capacity Drop</option>
            <option value="WEATHER_DETERIORATION">4. Severe Weather & Visibility Reduction</option>
            <option value="AMBULANCE_DELAY">5. Ambulance Unit Dispatch Delay</option>
            <option value="GREEN_CORRIDOR_UNAVAILABLE">6. Green Corridor Preemption Off</option>
          </select>
        </div>

        {/* Dynamic Parameter Adjustment */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-300 block">
            SCENARIO PARAMETERS:
          </label>
          {selectedType === 'TRAFFIC_INCREASE' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Traffic Surge:</span>
                <span className="text-indigo-400 font-bold">+{trafficIncrease}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={trafficIncrease}
                onChange={(e) => setTrafficIncrease(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          )}

          {selectedType === 'ROAD_BLOCKAGE' && (
            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-400 block">Blocked Corridor Name:</span>
              <input
                type="text"
                value={blockedRoad}
                onChange={(e) => setBlockedRoad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {selectedType === 'HOSPITAL_CAPACITY_REDUCTION' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>ICU / Bed Reduction:</span>
                <span className="text-amber-400 font-bold">-{hospitalReduction}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={10}
                value={hospitalReduction}
                onChange={(e) => setHospitalReduction(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          )}

          {selectedType === 'WEATHER_DETERIORATION' && (
            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-400 block">Rain Severity Level:</span>
              <select
                value={rainSeverity}
                onChange={(e) => setRainSeverity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="LIGHT">Light Rainfall (Minor visibility impact)</option>
                <option value="HEAVY">Heavy Downpour (25% friction delay)</option>
                <option value="TORRENTIAL">Torrential Rain (50% friction delay + low visibility)</option>
              </select>
            </div>
          )}

          {selectedType === 'AMBULANCE_DELAY' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Dispatch / En-Route Delay:</span>
                <span className="text-red-400 font-bold">+{ambulanceDelay} Minutes</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={ambulanceDelay}
                onChange={(e) => setAmbulanceDelay(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          )}

          {selectedType === 'GREEN_CORRIDOR_UNAVAILABLE' && (
            <div className="text-xs font-mono text-slate-400 pt-1">
              Traffic lights set to normal automated sequence. Emergency preemption disabled (+35% delay penalty).
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
          {result && (
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>
          )}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-mono text-xs font-bold rounded flex items-center gap-2 shadow-lg transition"
          >
            {isSimulating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                SIMULATING DIGITAL TWIN...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                EXECUTE WHAT-IF ANALYSIS
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulation Results View */}
      {result && (
        <div className="space-y-4 bg-slate-950 p-4 border border-indigo-900/60 rounded-lg">
          {/* Header Badge & Impact Score */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono text-indigo-400 font-bold">
                SIMULATION RESULT: {result.scenario.name}
              </div>
              <div className="text-[11px] text-slate-400">{result.whyItMatters}</div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                  result.impactCategory === 'CRITICAL IMPACT'
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : result.impactCategory === 'HIGH IMPACT'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {result.impactCategory} ({result.impactScore}/100)
              </span>
            </div>
          </div>

          {/* Metric Comparison Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                BASE vs SIMULATED ETA
              </div>
              <div className="text-sm font-mono font-bold text-slate-100">
                {Math.floor(result.baseline.etaSeconds / 60)}m {result.baseline.etaSeconds % 60}s →{' '}
                <span className="text-amber-400">
                  {Math.floor(result.simulated.etaSeconds / 60)}m {result.simulated.etaSeconds % 60}s
                </span>
              </div>
              <div className="text-[10px] font-mono text-indigo-400 font-semibold">
                Delta: +{Math.round(result.delta.etaDeltaSeconds / 60)}m ({result.delta.etaDeltaSeconds}s)
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                ROUTE DISTANCE
              </div>
              <div className="text-sm font-mono font-bold text-slate-100">
                {(result.simulated.distanceMeters / 1000).toFixed(1)} km
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Baseline: {(result.baseline.distanceMeters / 1000).toFixed(1)} km
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                HOSPITAL TARGET
              </div>
              <div className="text-xs font-mono font-bold text-teal-300 truncate">
                {result.delta.hospitalChanged
                  ? result.delta.alternativeHospitalName
                  : state.hospital.selectedHospital?.name || 'Selected'}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {result.delta.hospitalChanged ? 'REROUTED DUE TO CAPACITY' : 'STABLE CAPACITY'}
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                MISSION RISK LEVEL
              </div>
              <div className="text-xs font-mono font-bold text-slate-200">
                {result.simulated.missionRiskLevel}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {result.delta.riskDelta}
              </div>
            </div>
          </div>

          {/* AI Intelligence Analysis */}
          <div className="bg-slate-900/90 p-4 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                NVIDIA NIM WHAT-IF AI ADVISORY:
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  result.aiAnalysis.recommendation === 'KEEP_CURRENT_PLAN'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : result.aiAnalysis.recommendation === 'REVIEW_PLAN'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}
              >
                RECOMMENDATION: {result.aiAnalysis.recommendation}
              </span>
            </div>

            <p className="text-xs font-mono text-slate-300">{result.aiAnalysis.reason}</p>

            {/* Key Risks */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-mono text-slate-400">IDENTIFIED SCENARIO RISKS:</div>
              <div className="flex flex-wrap gap-1.5">
                {result.aiAnalysis.keyRisks.map((risk, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {risk}
                  </span>
                ))}
              </div>
            </div>

            {/* Data Source Provenance */}
            <div className="text-[10px] font-mono text-slate-500 pt-2 flex flex-wrap gap-4 border-t border-slate-800/80">
              <span>Traffic Source: {result.provenance.traffic}</span>
              <span>Routing Engine: {result.provenance.routing}</span>
              <span>Hospital Engine: {result.provenance.hospital}</span>
              <span>AI Engine: {result.provenance.ai}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
