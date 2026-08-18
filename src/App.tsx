/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UrsaiProvider, useUrsai } from './context/UrsaiContext';
import { Header } from './components/layout/Header';
import { MapView } from './components/map/MapView';
import { IncidentPanel } from './components/incidents/IncidentPanel';
import { ActionBar } from './components/layout/ActionBar';
import { ScenarioLabCard } from './components/scenario/ScenarioLabCard';
import { PerformanceLabCard } from './components/evaluation/PerformanceLabCard';
import { LearningLabCard } from './components/learning/LearningLabCard';
import { SwarmIntelligenceCard } from './components/swarm/SwarmIntelligenceCard';
import { StressTestLabCard } from './components/stress/StressTestLabCard';
import { AboutSection } from './components/about/AboutSection';
import { DepartmentOperationsPanel } from './components/departments/DepartmentOperationsPanel';
import { AgentStatusSidebar } from './components/agents/AgentStatusSidebar';
import { MissionAgentsSidebar } from './components/mission/MissionAgentsSidebar';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

function MainLayout() {
  const { state } = useUrsai();
  const activeTab = state.activeTab || 'COMMAND_CENTER';

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Workspace View Switcher */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {activeTab === 'COMMAND_CENTER' && (
          <>
            {/* Central / Main Map Area */}
            <main className="flex-1 relative flex flex-col p-2 bg-slate-950 min-w-0 min-h-[400px] h-full overflow-hidden">
              <ErrorBoundary fallbackName="Map View">
                <MapView />
              </ErrorBoundary>
            </main>

            {/* Right Live Mission & Agent Activity Sidebar */}
            <ErrorBoundary fallbackName="Mission & Agents Sidebar">
              <MissionAgentsSidebar />
            </ErrorBoundary>
          </>
        )}

        {(activeTab as string) === 'DEPARTMENTS' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="max-w-6xl mx-auto space-y-4">
              <ErrorBoundary fallbackName="Department Operations Panel">
                <DepartmentOperationsPanel />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {activeTab === 'SCENARIO_LAB' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="font-mono text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Phase 12 / 19 — Scenario Intelligence & Digital Twin Simulation Lab
              </div>
              <ErrorBoundary fallbackName="Scenario Intelligence Lab">
                <ScenarioLabCard />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {activeTab === 'SWARM_LAB' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-6">
              <ErrorBoundary fallbackName="Swarm Intelligence Card">
                <SwarmIntelligenceCard />
              </ErrorBoundary>
              <ErrorBoundary fallbackName="Learning Lab Card">
                <LearningLabCard />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {activeTab === 'STRESS_LAB' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-4">
              <ErrorBoundary fallbackName="Stress Test Lab">
                <StressTestLabCard />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {activeTab === 'PERFORMANCE' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="font-mono text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Phase 13 — Performance Evaluation & AI Benchmarking Suite
              </div>
              <ErrorBoundary fallbackName="Performance Evaluation Lab">
                <PerformanceLabCard />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {activeTab === 'ABOUT' && (
          <ErrorBoundary fallbackName="About URSAI">
            <AboutSection />
          </ErrorBoundary>
        )}
      </div>

      {/* Bottom Action Bar */}
      <ActionBar />
    </div>
  );
}

export default function App() {
  return (
    <UrsaiProvider>
      <MainLayout />
    </UrsaiProvider>
  );
}
