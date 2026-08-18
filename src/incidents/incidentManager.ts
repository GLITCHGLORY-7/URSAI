import { Incident, IncidentType, Severity } from '../types/ursai';
import { validateIncidentInput, ValidationResult } from './incidentValidation';

let incidentCounter = 1;

/**
 * Generates a unique incident ID in format: INC-YYYYMMDD-XXXX
 */
export function generateIncidentId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const sequence = String(incidentCounter++).padStart(3, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digit random

  return `INC-${year}${month}${day}-${sequence}${randomSuffix}`;
}

/**
 * Creates and initializes a new Incident object
 */
export function createIncident(input: {
  type: IncidentType;
  severity: Severity;
  latitude: number;
  longitude: number;
  description: string;
}): { incident: Incident | null; validation: ValidationResult } {
  const validation = validateIncidentInput(input);

  if (!validation.isValid) {
    return { incident: null, validation };
  }

  const nowIso = new Date().toISOString();

  const incident: Incident = {
    id: generateIncidentId(),
    type: input.type,
    severity: input.severity,
    latitude: input.latitude,
    longitude: input.longitude,
    description: input.description.trim() || `${input.type} reported in Chennai sector`,
    status: 'ACTIVE',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return { incident, validation };
}

/**
 * Formats ISO timestamp to readable local time string
 */
export function formatTime(isoString: string | null): string {
  if (!isoString) return '--:--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '--:--:--';
  }
}

/**
 * Formats duration in seconds to readable ETA text (e.g. "3 min 20 sec" or "45 sec")
 */
export function formatEta(seconds: number | null): string {
  if (seconds === null || isNaN(seconds)) return 'N/A';
  if (seconds <= 0) return 'Arrived at scene';

  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);

  if (mins === 0) {
    return `${secs} sec`;
  }
  return `${mins} min ${secs} sec`;
}

/**
 * Formats distance in meters to readable km text
 */
export function formatDistance(meters: number | null): string {
  if (meters === null || isNaN(meters)) return '—';
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
