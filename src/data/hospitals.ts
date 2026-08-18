export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  bedsAvailable: number;
  icuBedsAvailable: number;
  emergencyReady: boolean;
  status: 'AVAILABLE' | 'PREPARING' | 'READY' | 'UNAVAILABLE';
  dataNotice: string;
}

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'Apollo Hospitals (Greams Road)',
    latitude: 13.0607,
    longitude: 80.2512,
    bedsAvailable: 18,
    icuBedsAvailable: 5,
    emergencyReady: true,
    status: 'AVAILABLE',
    dataNotice: 'SIMULATED CAPACITY DATA',
  },
  {
    id: 'HOSP-02',
    name: 'Rajiv Gandhi Government General Hospital',
    latitude: 13.0818,
    longitude: 80.2778,
    bedsAvailable: 32,
    icuBedsAvailable: 8,
    emergencyReady: true,
    status: 'AVAILABLE',
    dataNotice: 'SIMULATED CAPACITY DATA',
  },
  {
    id: 'HOSP-03',
    name: 'MIOT International (Manapakkam)',
    latitude: 13.0189,
    longitude: 80.1872,
    bedsAvailable: 14,
    icuBedsAvailable: 3,
    emergencyReady: true,
    status: 'AVAILABLE',
    dataNotice: 'SIMULATED CAPACITY DATA',
  },
  {
    id: 'HOSP-04',
    name: 'Fortis Malar Hospital (Adyar)',
    latitude: 13.0063,
    longitude: 80.2575,
    bedsAvailable: 9,
    icuBedsAvailable: 2,
    emergencyReady: true,
    status: 'AVAILABLE',
    dataNotice: 'SIMULATED CAPACITY DATA',
  },
  {
    id: 'HOSP-05',
    name: 'SIMS Hospital (Vadapalani)',
    latitude: 13.0518,
    longitude: 80.2120,
    bedsAvailable: 22,
    icuBedsAvailable: 6,
    emergencyReady: true,
    status: 'AVAILABLE',
    dataNotice: 'SIMULATED CAPACITY DATA',
  },
  {
    id: 'HOSP-06',
    name: 'Gleneagles Global Health City (Perumbakkam)',
    latitude: 12.8992,
    longitude: 80.2078,
    bedsAvailable: 12,
    icuBedsAvailable: 4,
    emergencyReady: true,
    status: 'AVAILABLE',
    dataNotice: 'SIMULATED CAPACITY DATA',
  },
];
