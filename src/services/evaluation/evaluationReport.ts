import { ExperimentReport } from '../../types/ursai';

export function exportReportToJSON(report: ExperimentReport): string {
  return JSON.stringify(report, null, 2);
}

export function exportReportToCSV(report: ExperimentReport): string {
  const headers = [
    'RunNumber',
    'IncidentID',
    'Timestamp',
    'TotalResponseTimeSec',
    'PoliceResponseTimeSec',
    'HospitalTransferTimeSec',
    'RouteDistanceMeters',
    'FallbackRouting',
    'GreenCorridor',
    'ReplanCount',
    'AIEngine',
    'AILatencyMs',
    'Success',
    'Recovered',
    'Degraded',
  ];

  const rows = report.runs.map((r) => [
    r.runNumber,
    r.incidentId,
    r.timestamp,
    r.totalResponseTimeSeconds,
    r.policeResponseTimeSeconds,
    r.hospitalTransferTimeSeconds,
    r.routeDistanceMeters,
    r.fallbackRoutingUsed ? 'YES' : 'NO',
    r.greenCorridorUsed ? 'YES' : 'NO',
    r.replanCount,
    r.aiEngineUsed,
    r.aiLatencyMs,
    r.success ? 'PASS' : 'FAIL',
    r.recovered ? 'YES' : 'NO',
    r.degraded ? 'YES' : 'NO',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
