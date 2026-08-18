import { DataQualityReport, DataSourceStatusMap } from '../types/ursai';

/**
 * Computes transparent Data Quality Report for URSAI data sources.
 */
export function computeDataQuality(statusMap: DataSourceStatusMap): DataQualityReport {
  let score = 100;
  const factors: string[] = [];

  let realSourceCount = 0;
  let simulatedSourceCount = 0;
  let fallbackSourceCount = 0;

  // Evaluate Traffic
  if (statusMap.traffic.source === 'REAL' && statusMap.traffic.freshness === 'FRESH') {
    realSourceCount++;
    factors.push('Traffic: Live real-time feed active');
  } else if (statusMap.traffic.freshness === 'STALE') {
    score -= 20;
    factors.push('Traffic: Stale data detected');
  } else {
    simulatedSourceCount++;
    factors.push('Traffic: Simulated congestion model active');
  }

  // Evaluate Weather
  if (statusMap.weather.source === 'REAL' && statusMap.weather.freshness === 'FRESH') {
    realSourceCount++;
    factors.push('Weather: Real-time meteorological sensor connected');
  } else if (statusMap.weather.freshness === 'STALE') {
    score -= 15;
    factors.push('Weather: Stale weather feed');
  } else {
    simulatedSourceCount++;
    factors.push('Weather: Simulated climate model active');
  }

  // Evaluate Hospital
  if (statusMap.hospital.source === 'REAL' && statusMap.hospital.freshness === 'FRESH') {
    realSourceCount++;
    factors.push('Hospital: Direct bed capacity API linked');
  } else {
    simulatedSourceCount++;
    factors.push('Hospital: Simulated bed capacity registry active');
  }

  // Evaluate Resources
  if (statusMap.resources.source === 'REAL') {
    realSourceCount++;
    factors.push('Resources: Real fleet telemetry active');
  } else {
    simulatedSourceCount++;
    factors.push('Resources: Simulated emergency fleet dispatcher active');
  }

  // Evaluate Routing
  if (statusMap.routing.source === 'OSRM') {
    realSourceCount++;
    factors.push('Routing: OSRM road network spatial engine online');
  } else {
    fallbackSourceCount++;
    score -= 25;
    factors.push('Routing: Geometric fallback routing active');
  }

  // Evaluate AI
  if (statusMap.ai.source === 'NVIDIA_NIM') {
    factors.push('AI: NVIDIA NIM reasoning core online');
  } else {
    fallbackSourceCount++;
    score -= 15;
    factors.push('AI: Rule-based fallback decision engine active');
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let status: 'GOOD' | 'FAIR' | 'POOR' = 'GOOD';
  if (score < 50) status = 'POOR';
  else if (score < 80) status = 'FAIR';

  const label = realSourceCount > 0 ? 'DATA QUALITY' : 'SIMULATED DATA QUALITY';

  return {
    score,
    status,
    factors,
    label,
  };
}
