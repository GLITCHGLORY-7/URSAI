export interface DecisionTraceEntry {
  id: string;
  simulationId: number;
  timestamp: string;
  type: 'DECISION' | 'PREDICTION' | 'REPLAN' | 'FALLBACK';
  source: 'NVIDIA NIM' | 'RULE-BASED FALLBACK';
  inputSummary: string;
  outputSummary: string;
  validationStatus: 'PASSED' | 'REJECTED' | 'FALLBACK_USED';
  actionTaken: string;
}

const MAX_TRACE_ENTRIES = 50;
let traceStore: DecisionTraceEntry[] = [];

export function recordDecisionTrace(entry: Omit<DecisionTraceEntry, 'id' | 'timestamp'>): DecisionTraceEntry {
  const fullEntry: DecisionTraceEntry = {
    ...entry,
    id: `trc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toISOString(),
  };

  traceStore = [fullEntry, ...traceStore].slice(0, MAX_TRACE_ENTRIES);
  return fullEntry;
}

export function getDecisionTraces(): DecisionTraceEntry[] {
  return [...traceStore];
}

export function clearDecisionTraces(): void {
  traceStore = [];
}
