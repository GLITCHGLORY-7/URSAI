import React from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import { MissionSummaryCard } from '../mission/MissionSummaryCard';
import { IncidentCard } from './IncidentCard';
import { AmbulanceStatusCard } from '../ambulance/AmbulanceStatusCard';
import { PoliceStatusCard } from '../police/PoliceStatusCard';
import { TrafficStatusCard } from '../traffic/TrafficStatusCard';
import { HospitalStatusCard } from '../hospital/HospitalStatusCard';
import { AIDecisionEngine } from '../ai/AIDecisionEngine';
import { SystemLogs } from '../logs/SystemLogs';
import { SystemHealthCard } from '../health/SystemHealthCard';
import { SituationReportCard } from '../intelligence/SituationReportCard';
import { DataSourcesCard } from '../datasources/DataSourcesCard';
import { SituationAwarenessCard } from '../ai/SituationAwarenessCard';
import { CityDataEngineCard } from '../city/CityDataEngineCard';
import { MissionMonitorCard } from '../mission/MissionMonitorCard';
import { ExplainabilityPanel } from '../explainability/ExplainabilityPanel';
import { AuditPanel } from '../explainability/AuditPanel';
import { dataSourceManager } from '../../services/dataSources/dataSourceManager';
import { computeDataQuality } from '../../services/dataQualityService';
import { generateOperationalIntelligence } from '../../services/operationalIntelligence';
import { DepartmentOperationsPanel } from '../departments/DepartmentOperationsPanel';
import { DataSourceMode } from '../../types/ursai';

export const IncidentPanel: React.FC = () => {
  const { state, dispatch } = useUrsai();
  const isPresMode = state.isPresentationMode || false;

  const mode = state.dataSourceMode || 'HYBRID';
  const statusMap = dataSourceManager.getStatusMap(state, mode);
  const dataQuality = computeDataQuality(statusMap);
  const { report } = generateOperationalIntelligence(state);

  const handleModeChange = (newMode: DataSourceMode) => {
    dataSourceManager.setMode(newMode);
    dispatch({ type: 'SET_DATA_SOURCE_MODE', payload: newMode });
  };

  return (
    <aside className="w-full lg:w-96 bg-slate-950 border-l border-slate-800 p-4 space-y-4 flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
      <div className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
        <span>{isPresMode ? 'COMMAND OPERATIONS' : 'INCIDENT & SWARM OPERATIONS'}</span>
        <span className="text-[10px] text-cyan-400 font-mono">
          {isPresMode ? 'PRESENTATION MODE' : 'CHENNAI SECTOR'}
        </span>
      </div>

      {/* Primary Mission Summary Card */}
      <ErrorBoundary fallbackName="Mission Summary">
        <MissionSummaryCard />
      </ErrorBoundary>

      {/* Active Incident Overview */}
      <ErrorBoundary fallbackName="Active Incident">
        <IncidentCard />
      </ErrorBoundary>

      {/* Multi-Department Operations Swarm */}
      <ErrorBoundary fallbackName="Department Operations">
        <DepartmentOperationsPanel />
      </ErrorBoundary>

      {/* Swarm Agents Status Grid Cards */}
      <ErrorBoundary fallbackName="Ambulance Agent">
        <AmbulanceStatusCard />
      </ErrorBoundary>

      <ErrorBoundary fallbackName="Police Agent">
        <PoliceStatusCard />
      </ErrorBoundary>

      <ErrorBoundary fallbackName="Traffic Agent">
        <TrafficStatusCard />
      </ErrorBoundary>

      <ErrorBoundary fallbackName="Hospital Agent">
        <HospitalStatusCard />
      </ErrorBoundary>

      {/* AI Decision Engine */}
      <ErrorBoundary fallbackName="AI Decision Engine">
        <AIDecisionEngine />
      </ErrorBoundary>

      {/* System Event Stream Logs */}
      <ErrorBoundary fallbackName="System Logs Stream">
        <SystemLogs />
      </ErrorBoundary>

      {/* Advanced Diagnostics - Rendered in Standard Mode */}
      {!isPresMode && (
        <>
          <div className="border-t border-slate-800 pt-3 font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            System Diagnostics & Intelligence
          </div>

          <ErrorBoundary fallbackName="Situation Report">
            <SituationReportCard report={report} aiConfidence="HIGH" />
          </ErrorBoundary>

          <ErrorBoundary fallbackName="Data Sources & Provenance">
            <DataSourcesCard
              statusMap={statusMap}
              dataQuality={dataQuality}
              onModeChange={handleModeChange}
            />
          </ErrorBoundary>

          <ErrorBoundary fallbackName="System Health Monitor">
            <SystemHealthCard />
          </ErrorBoundary>

          <ErrorBoundary fallbackName="Predictive Intelligence">
            <SituationAwarenessCard />
          </ErrorBoundary>

          <ErrorBoundary fallbackName="City Simulation Engine">
            <CityDataEngineCard />
          </ErrorBoundary>

          <ErrorBoundary fallbackName="Adaptive Mission Monitor">
            <MissionMonitorCard />
          </ErrorBoundary>

          <ErrorBoundary fallbackName="Decision Explainability">
            <ExplainabilityPanel />
          </ErrorBoundary>

          <ErrorBoundary fallbackName="Mission Audit Telemetry">
            <AuditPanel />
          </ErrorBoundary>
        </>
      )}
    </aside>
  );
};
