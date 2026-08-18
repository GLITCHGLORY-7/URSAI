import { Hospital } from '../data/hospitals';
import { HospitalSelectionFactors } from '../types/ursai';

/**
 * Calculates straight-line geographic distance between two lat/lng points using Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export interface HospitalSelectionResult {
  hospital: Hospital;
  factors: HospitalSelectionFactors;
}

/**
 * Deterministic, transparent hospital scoring model prioritizing emergency transit time & trauma capacity.
 * 
 * Scoring Weights:
 * - Proximity Distance Score: Max 150 pts (Deducts 15 pts per km - critical for Golden Hour survival)
 * - Bed Availability Score: Max 30 pts (1.5 pts per bed, capped at 30)
 * - ICU Availability Score: Max 30 pts (5 pts per ICU bed, capped at 30)
 * - Emergency Readiness Score: 40 pts if trauma bay ready, 0 otherwise
 * 
 * Total Score = Distance + Beds + ICU + Readiness
 */
export function selectBestHospital(
  incidentLat: number,
  incidentLng: number,
  hospitals: Hospital[]
): HospitalSelectionResult | null {
  const eligible = hospitals.filter(
    (h) => h.status !== 'UNAVAILABLE' && h.bedsAvailable > 0 && h.emergencyReady
  );

  if (eligible.length === 0) {
    return null;
  }

  let bestHospital: Hospital | null = null;
  let bestFactors: HospitalSelectionFactors | null = null;
  let highestScore = -1;

  for (const hospital of eligible) {
    const distKm = calculateHaversineDistanceKm(
      incidentLat,
      incidentLng,
      hospital.latitude,
      hospital.longitude
    );

    // Proximity heavily weighted for emergency response
    const distanceScore = Math.max(0, 150 - distKm * 15);
    const bedScore = Math.min(30, hospital.bedsAvailable * 1.5);
    const icuScore = Math.min(30, hospital.icuBedsAvailable * 5);
    const readinessScore = hospital.emergencyReady ? 40 : 0;

    const totalScore = Number((distanceScore + bedScore + icuScore + readinessScore).toFixed(1));

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestHospital = hospital;
      bestFactors = {
        distanceKm: distKm,
        beds: hospital.bedsAvailable,
        icu: hospital.icuBedsAvailable,
        emergencyReady: hospital.emergencyReady,
        totalScore,
      };
    }
  }

  if (!bestHospital || !bestFactors) return null;

  return { hospital: bestHospital, factors: bestFactors };
}
