import { MissionRunMetric, UrsaiState } from '../../types/ursai';

export class MetricService {
  private runHistory: MissionRunMetric[] = [];

  public recordRun(run: MissionRunMetric): void {
    this.runHistory.push(run);
  }

  public getHistory(): MissionRunMetric[] {
    return [...this.runHistory];
  }

  public clearHistory(): void {
    this.runHistory = [];
  }

  public computeRunFromState(
    runNumber: number,
    state: UrsaiState,
    runDurationSeconds: number = 420,
    aiLatencyMs: number = 320,
    forcedSuccess?: boolean
  ): MissionRunMetric {
    const amb = state.ambulance;
    const pol = state.police;
    const isSuccess = forcedSuccess !== undefined ? forcedSuccess : amb.status === 'ARRIVED_AT_HOSPITAL' || amb.status === 'TRANSPORTING' || amb.status === 'AT_SCENE';

    const totalResponseTimeSeconds = amb.routeDuration ? Math.round(amb.routeDuration) : runDurationSeconds;
    const policeResponseTimeSeconds = pol.routeDuration ? Math.round(pol.routeDuration) : Math.round(runDurationSeconds * 0.8);
    const hospitalTransferTimeSeconds = Math.round(totalResponseTimeSeconds * 1.4);

    return {
      id: `RUN-${Date.now()}-${runNumber}`,
      runNumber,
      incidentId: state.activeIncident?.id || `INC-${runNumber}`,
      timestamp: new Date().toISOString(),
      totalResponseTimeSeconds,
      policeResponseTimeSeconds,
      hospitalTransferTimeSeconds,
      routeDistanceMeters: amb.routeDistance || 4800,
      routeDurationSeconds: amb.routeDuration || runDurationSeconds,
      fallbackRoutingUsed: amb.routeDistance === null || amb.status === 'ERROR',
      greenCorridorUsed: state.traffic.greenCorridorActive,
      replanCount: state.mission?.replanningCount || 0,
      hospitalSelectedTimeSeconds: 12,
      aiEngineUsed: state.aiDecision?.engine === 'NVIDIA NIM' ? 'NVIDIA NIM' : 'FALLBACK RULE ENGINE',
      aiLatencyMs,
      aiConfidence: (state.aiDecision?.status as any) === 'HIGH' ? 'HIGH' : 'MEDIUM',
      success: isSuccess,
      recovered: state.mission?.planStatus === 'UPDATED' || (state.mission?.replanningCount || 0) > 0,
      degraded: state.aiStatus === 'FALLBACK' || amb.status === 'ERROR',
    };
  }
}

export const metricService = new MetricService();
