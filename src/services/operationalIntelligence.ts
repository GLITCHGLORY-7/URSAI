import { UrsaiState, SituationReport } from '../types/ursai';

/**
 * Generates structured Operational Intelligence and Situation Report summaries from UrsaiState.
 */
export function generateOperationalIntelligence(state: UrsaiState): {
  summary: string;
  report: SituationReport;
} {
  const incident = state.activeIncident;
  const amb = state.ambulance;
  const pol = state.police;
  const traffic = state.traffic;
  const hosp = state.hospital;
  const mission = state.mission;

  if (!incident || incident.status === 'RESOLVED') {
    const report: SituationReport = {
      incidentSeverity: 'NONE',
      responseStatus: 'STANDBY',
      trafficImpact: 'NORMAL',
      ambulanceStatus: 'AVAILABLE',
      policeStatus: 'AVAILABLE',
      hospitalStatus: 'STANDBY',
      missionState: 'IDLE',
      summary: 'URSAI Command Core is in Standby Mode. All agents ready for dispatch.',
      timestamp: new Date().toISOString(),
    };
    return { summary: report.summary, report };
  }

  const severityText = `${incident.severity} PRIORITY`;
  const responseStatus = incident.status;
  const trafficImpact = traffic.greenCorridorActive
    ? 'GREEN CORRIDOR ACTIVE'
    : `${state.cityState.traffic.overallLevel} CONGESTION`;

  const ambulanceText = amb.status;
  const policeText = pol.status;
  const hospitalText = hosp.selectedHospital
    ? `${hosp.selectedHospital.name.split(' ')[0]} (${hosp.status})`
    : 'PENDING SELECTION';

  const missionState = mission ? `PLAN v${mission.planVersion} (${mission.status})` : 'INITIALIZING';

  // Build concise human-readable summary
  const summaryParts: string[] = [
    `${incident.severity}-priority ${incident.type.toLowerCase()} response is ${incident.status.toLowerCase().replace(/_/g, ' ')}.`,
  ];

  if (amb.status !== 'AVAILABLE') {
    summaryParts.push(`Ambulance is ${amb.status.toLowerCase().replace(/_/g, ' ')} (${amb.eta ? Math.ceil(amb.eta / 60) + 'm ETA' : 'routing'}).`);
  }

  if (pol.status !== 'AVAILABLE') {
    summaryParts.push(`Police unit is ${pol.status.toLowerCase().replace(/_/g, ' ')}.`);
  }

  if (traffic.greenCorridorActive) {
    summaryParts.push('Green Corridor signal clearing active along transit path.');
  }

  if (hosp.selectedHospital) {
    summaryParts.push(`${hosp.selectedHospital.name} intake is ${hosp.status.toLowerCase().replace(/_/g, ' ')}.`);
  }

  if (mission && mission.replanningCount > 0) {
    summaryParts.push(`Mission adapted ${mission.replanningCount} time(s).`);
  }

  const summary = summaryParts.join(' ');

  const report: SituationReport = {
    incidentSeverity: incident.severity,
    responseStatus,
    trafficImpact,
    ambulanceStatus: ambulanceText,
    policeStatus: policeText,
    hospitalStatus: hospitalText,
    missionState,
    summary,
    timestamp: new Date().toISOString(),
  };

  return { summary, report };
}
