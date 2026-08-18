import { IncidentType, Severity } from '../types/ursai';

export const INCIDENT_TYPES: { type: IncidentType; label: string; icon: string; description: string }[] = [
  {
    type: 'ROAD ACCIDENT',
    label: 'Road Accident',
    icon: 'Car',
    description: 'Vehicular collision or pedestrian emergency on roadway',
  },
  {
    type: 'FIRE',
    label: 'Fire Emergency',
    icon: 'Flame',
    description: 'Structural, electrical, or commercial fire incident',
  },
  {
    type: 'FLOOD',
    label: 'Urban Flood / Waterlogging',
    icon: 'Waves',
    description: 'Severe street flooding or monsoon drainage overflow',
  },
  {
    type: 'ROAD BLOCKAGE',
    label: 'Road Blockage',
    icon: 'OctagonAlert',
    description: 'Tree fall, debris, or severe infrastructural obstruction',
  },
];

export const SEVERITY_LEVELS: { severity: Severity; label: string; color: string; bgClass: string; textClass: string }[] = [
  {
    severity: 'LOW',
    label: 'Low Severity',
    color: '#3b82f6',
    bgClass: 'bg-blue-950/60 border-blue-800 text-blue-300',
    textClass: 'text-blue-400',
  },
  {
    severity: 'MEDIUM',
    label: 'Medium Severity',
    color: '#f59e0b',
    bgClass: 'bg-amber-950/60 border-amber-800 text-amber-300',
    textClass: 'text-amber-400',
  },
  {
    severity: 'HIGH',
    label: 'High Severity',
    color: '#f97316',
    bgClass: 'bg-orange-950/60 border-orange-800 text-orange-300',
    textClass: 'text-orange-400',
  },
  {
    severity: 'CRITICAL',
    label: 'Critical / Life-Threatening',
    color: '#ef4444',
    bgClass: 'bg-red-950/60 border-red-800 text-red-300',
    textClass: 'text-red-400',
  },
];
