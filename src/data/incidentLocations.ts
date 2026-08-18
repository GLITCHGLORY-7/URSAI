import { IncidentType, Severity } from '../types/ursai';

export interface IncidentHotspot {
  id: string;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  type: IncidentType;
  severity: Severity;
  description: string;
  expectedNearestHospital: string;
  district: string;
}

export const CHENNAI_INCIDENT_HOTSPOTS: IncidentHotspot[] = [
  {
    id: 'INC-ANNASALAI',
    name: 'Anna Salai / Teynampet DMS Junction Corridor',
    shortName: 'Anna Salai DMS',
    latitude: 13.0475,
    longitude: 80.2425,
    type: 'ROAD ACCIDENT',
    severity: 'CRITICAL',
    description: 'Multi-vehicle collision on Anna Salai arterial corridor with trapped passengers and blocked lanes.',
    expectedNearestHospital: 'Apollo Hospitals (Greams Road)',
    district: 'Central Chennai',
  },
  {
    id: 'INC-CENTRAL',
    name: 'Periamet / EVR Periyar Salai Intersection',
    shortName: 'Periamet Junction',
    latitude: 13.0915,
    longitude: 80.2660,
    type: 'ROAD ACCIDENT',
    severity: 'HIGH',
    description: 'Heavy commercial carrier and commuter bus collision at Periamet major intersection.',
    expectedNearestHospital: 'Rajiv Gandhi Government General Hospital',
    district: 'North Chennai',
  },
  {
    id: 'INC-KATHIPARA',
    name: 'Kathipara Cloverleaf Junction (Guindy)',
    shortName: 'Kathipara / Guindy',
    latitude: 13.0075,
    longitude: 80.2030,
    type: 'ROAD ACCIDENT',
    severity: 'CRITICAL',
    description: 'High-speed rollover crash on Kathipara interchange arterial flyover ramp.',
    expectedNearestHospital: 'MIOT International (Manapakkam)',
    district: 'South-West Chennai',
  },
  {
    id: 'INC-ADYAR',
    name: 'Sardar Patel Road / IIT Gate Junction',
    shortName: 'Sardar Patel Rd',
    latitude: 12.9920,
    longitude: 80.2460,
    type: 'ROAD ACCIDENT',
    severity: 'HIGH',
    description: 'Vehicular collision along Sardar Patel Road arterial connector causing heavy bottleneck.',
    expectedNearestHospital: 'Fortis Malar Hospital (Adyar)',
    district: 'South Chennai',
  },
  {
    id: 'INC-VADAPALANI',
    name: 'Ashok Pillar / 100 Feet Road Junction',
    shortName: 'Ashok Pillar Rd',
    latitude: 13.0380,
    longitude: 80.2050,
    type: 'ROAD ACCIDENT',
    severity: 'MEDIUM',
    description: 'Two-car collision blocking inner ring road intersection near Ashok Pillar.',
    expectedNearestHospital: 'SIMS Hospital (Vadapalani)',
    district: 'West Chennai',
  },
  {
    id: 'INC-OMR',
    name: 'OMR IT Expressway / Sholinganallur Junction',
    shortName: 'OMR Expressway',
    latitude: 12.9350,
    longitude: 80.2310,
    type: 'ROAD ACCIDENT',
    severity: 'HIGH',
    description: 'Multiple vehicle pileup on OMR IT expressway express lane.',
    expectedNearestHospital: 'Gleneagles Global Health City (Perumbakkam)',
    district: 'OMR Tech Corridor',
  },
];
