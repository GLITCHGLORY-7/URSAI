import { IncidentType, Severity } from '../types/ursai';
import { CHENNAI_BOUNDS } from '../data/depots';

export interface ValidationResult {
  isValid: boolean;
  errors: {
    type?: string;
    severity?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
    description?: string;
  };
  warningMessage?: string;
}

export function validateIncidentInput(input: {
  type: IncidentType | '';
  severity: Severity | '';
  latitude: number | null;
  longitude: number | null;
  description?: string;
}): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // Check Incident Type
  if (!input.type) {
    errors.type = 'Select an incident type.';
  }

  // Check Severity
  if (!input.severity) {
    errors.severity = 'Select severity.';
  }

  // Check Location selection
  if (input.latitude === null || input.longitude === null) {
    errors.location = 'Select a location on the map.';
  } else {
    // Validate Latitude Range (-90 to 90)
    if (isNaN(input.latitude) || input.latitude < -90 || input.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90.';
    }

    // Validate Longitude Range (-180 to 180)
    if (isNaN(input.longitude) || input.longitude < -180 || input.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180.';
    }
  }

  const isValid = Object.keys(errors).length === 0;

  // Check Chennai region boundary warning if location is valid
  let warningMessage: string | undefined;
  if (isValid && input.latitude !== null && input.longitude !== null) {
    const isOutsideChennai =
      input.latitude < CHENNAI_BOUNDS.minLat ||
      input.latitude > CHENNAI_BOUNDS.maxLat ||
      input.longitude < CHENNAI_BOUNDS.minLng ||
      input.longitude > CHENNAI_BOUNDS.maxLng;

    if (isOutsideChennai) {
      warningMessage =
        'Notice: Selected coordinates are outside the core Chennai operating region. Incident coordinates will be accepted, but resource dispatch routes may be extended.';
    }
  }

  return {
    isValid,
    errors,
    warningMessage,
  };
}
