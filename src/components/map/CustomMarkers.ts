import L from 'leaflet';

/**
 * Creates custom HTML L.divIcon objects with embedded SVG assets.
 * Guarantees zero reliance on external icon PNG assets and retina sharpness.
 */

// 1. Active Incident Marker (Red pulsing)
export const createIncidentIcon = (severity: string = 'HIGH') => {
  const isCritical = severity === 'CRITICAL';
  const color = isCritical ? '#dc2626' : '#ef4444';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full animate-ping bg-red-500/40 opacity-75"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-red-600 border-2 border-white rounded-full shadow-lg shadow-red-900/50 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 22 22 22 12 2"></polygon>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 2. Ambulance Marker (Blue or Green when Green Corridor is active)
export const createAmbulanceIcon = (isGreenCorridor: boolean = false) => {
  const bgClass = isGreenCorridor
    ? 'bg-emerald-500 shadow-emerald-900/60'
    : 'bg-blue-600 shadow-blue-900/60';
  const pulseClass = isGreenCorridor ? 'bg-emerald-400/40' : 'bg-blue-400/40';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full animate-pulse ${pulseClass}"></span>
        <div class="relative flex items-center justify-center w-8 h-8 ${bgClass} border-2 border-white rounded-lg shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
            <line x1="8" y1="8" x2="8" y2="12"></line>
            <line x1="6" y1="10" x2="10" y2="10"></line>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 3. Police Marker (Navy/Indigo)
export const createPoliceIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full animate-pulse bg-indigo-400/40"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-indigo-600 border-2 border-white rounded-lg shadow-lg shadow-indigo-900/60 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 4. Depot Marker (Fixed resource location)
export const createDepotIcon = (type: 'AMBULANCE' | 'POLICE') => {
  const isAmb = type === 'AMBULANCE';
  const bgClass = isAmb ? 'bg-sky-900 border-sky-400 text-sky-200' : 'bg-indigo-900 border-indigo-400 text-indigo-200';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="flex items-center gap-1.5 px-2 py-1 bg-slate-900/90 border ${bgClass} rounded-md shadow-md text-xs font-semibold whitespace-nowrap">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="9" y1="6" x2="15" y2="6"></line>
          <line x1="9" y1="10" x2="15" y2="10"></line>
          <line x1="9" y1="14" x2="15" y2="14"></line>
        </svg>
        <span>${isAmb ? 'AMB DEPOT' : 'POLICE DEPOT'}</span>
      </div>
    `,
    iconSize: [100, 28],
    iconAnchor: [50, 14],
  });
};

// 5. Hospital Marker (Teal icon, highlighted when selected)
export const createHospitalIcon = (isSelected: boolean = false) => {
  const bgClass = isSelected
    ? 'bg-emerald-500 shadow-emerald-900/80 ring-4 ring-emerald-400/50'
    : 'bg-teal-600 shadow-teal-900/60';
  const pulseClass = isSelected ? 'bg-emerald-400/60 animate-ping' : 'bg-teal-400/30';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full ${pulseClass}"></span>
        <div class="relative flex items-center justify-center w-8 h-8 ${bgClass} border-2 border-white rounded-lg shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v12"></path>
            <path d="M6 12h12"></path>
            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 6. Selected Location Preview Icon (Amber crosshair pin)
export const createSelectedLocationIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-9 h-9">
        <span class="absolute w-9 h-9 rounded-full animate-ping bg-amber-400/50"></span>
        <div class="relative flex items-center justify-center w-7 h-7 bg-amber-500 border-2 border-white rounded-full shadow-lg text-slate-950 font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// 7. Fire & Rescue Engine Marker (Orange)
export const createFireIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full animate-pulse bg-orange-400/40"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-orange-600 border-2 border-white rounded-lg shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 8. Public Works Unit Marker (Cyan)
export const createPublicWorksIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full animate-pulse bg-cyan-400/40"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-cyan-600 border-2 border-white rounded-lg shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 9. Electricity Power Utility Marker (Sky Blue)
export const createElectricityIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full animate-pulse bg-sky-400/40"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-sky-600 border-2 border-white rounded-lg shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 10. Water Drainage Unit Marker (Blue)
export const createWaterIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <span class="absolute w-10 h-10 rounded-full animate-pulse bg-blue-400/40"></span>
        <div class="relative flex items-center justify-center w-8 h-8 bg-blue-700 border-2 border-white rounded-lg shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// 11. Tactical Incident Badge (Compact, non-obstructive tactical beacon)
export const createTacticalIncidentBadge = (
  id: string = 'INC-001',
  type: string = 'TRAFFIC',
  title: string = 'Traffic Incident',
  locationName: string = 'Chennai Sector',
  timestamp: string = '14:18',
  severity: string = 'HIGH'
) => {
  return L.divIcon({
    className: 'tactical-incident-marker',
    html: `
      <div class="relative flex items-center gap-1.5 cursor-pointer select-none group" style="transform: translate(-16px, -16px);">
        <!-- Pulsing Red Beacon Pin -->
        <div class="relative flex items-center justify-center w-8 h-8 shrink-0">
          <span class="absolute w-8 h-8 rounded-full animate-ping bg-red-500/60"></span>
          <div class="relative flex items-center justify-center w-7 h-7 bg-red-600 border-2 border-white rounded-full shadow-lg shadow-red-950 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 22 22 22 12 2"></polygon>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        </div>

        <!-- Sleek Mini Tag (Non-covering) -->
        <div class="px-2 py-0.5 bg-slate-950/90 backdrop-blur-md border border-red-500/80 rounded-md shadow-lg shadow-red-950/80 text-[10px] font-mono font-bold text-red-300 whitespace-nowrap flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>${id}</span>
          <span class="text-slate-400">•</span>
          <span class="text-slate-200">${severity}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// 12. Tactical Unit Callout Badge (Compact sleek vehicle pill)
export const createTacticalUnitBadge = (
  unitCode: string,
  roleLabel: string,
  status: string,
  unitType: 'AMBULANCE' | 'POLICE' | 'FIRE' | 'TRAFFIC' | 'RESCUE' | 'UTILITY'
) => {
  let theme = {
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-600',
    pulse: 'bg-emerald-400/40',
  };

  if (unitType === 'POLICE') {
    theme = {
      border: 'border-blue-500',
      text: 'text-blue-400',
      iconBg: 'bg-blue-600',
      pulse: 'bg-blue-400/40',
    };
  } else if (unitType === 'TRAFFIC') {
    theme = {
      border: 'border-amber-500',
      text: 'text-amber-400',
      iconBg: 'bg-amber-600',
      pulse: 'bg-amber-400/40',
    };
  }

  return L.divIcon({
    className: 'tactical-unit-marker',
    html: `
      <div class="relative flex items-center gap-1.5 cursor-pointer select-none" style="transform: translate(-14px, -14px);">
        <div class="relative flex items-center justify-center w-7 h-7 shrink-0">
          <span class="absolute w-7 h-7 rounded-full animate-ping ${theme.pulse}"></span>
          <div class="relative flex items-center justify-center w-6 h-6 ${theme.iconBg} border border-white rounded-md shadow-md text-white font-mono text-[10px] font-bold">
            ${unitCode.slice(0, 2)}
          </div>
        </div>
        <div class="px-1.5 py-0.5 bg-slate-950/90 backdrop-blur-md border ${theme.border} rounded text-[9px] font-mono font-bold ${theme.text} whitespace-nowrap shadow-md">
          ${unitCode}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// 13. Tactical Hospital Badge
export const createTacticalHospitalBadge = (
  name: string = 'Apollo Hospitals',
  bedsAvailable: number = 12,
  isSelected: boolean = false
) => {
  return L.divIcon({
    className: 'tactical-hospital-marker',
    html: `
      <div class="relative flex items-center group cursor-pointer" style="min-width: 150px;">
        <div class="relative flex items-center justify-center w-8 h-8 shrink-0 z-10">
          <span class="absolute w-8 h-8 rounded-full ${isSelected ? 'animate-ping bg-blue-400/50' : 'animate-pulse bg-blue-500/30'}"></span>
          <div class="relative flex items-center justify-center w-7 h-7 bg-blue-600 border-2 border-white rounded-full shadow-lg text-white font-black text-xs">
            H
          </div>
        </div>

        <div class="-ml-2 pl-4 pr-2.5 py-1 bg-slate-950/95 backdrop-blur-md border ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-blue-600'} rounded-lg shadow-xl font-sans text-left">
          <div class="font-bold text-[10px] text-slate-100 whitespace-nowrap">${name}</div>
          <div class="text-[9px] text-emerald-400 font-mono font-semibold">${bedsAvailable} beds available</div>
        </div>
      </div>
    `,
    iconSize: [170, 38],
    iconAnchor: [16, 19],
  });
};

// 14. Tactical Facility Badge (FIRE STN, TRAFFIC HQ)
export const createTacticalFacilityBadge = (name: string, type: 'FIRE_STN' | 'TRAFFIC_HQ') => {
  const isFire = type === 'FIRE_STN';
  const color = isFire ? 'bg-red-950/90 border-red-600 text-red-400' : 'bg-amber-950/90 border-amber-600 text-amber-400';

  return L.divIcon({
    className: 'tactical-facility-marker',
    html: `
      <div class="flex items-center gap-1.5 px-2 py-1 ${color} border rounded-md shadow-lg font-mono text-[9px] font-extrabold whitespace-nowrap backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M3 21h18"></path>
          <path d="M5 21V7l8-4v18"></path>
          <path d="M19 21V11l-6-4"></path>
        </svg>
        <span>${name}</span>
      </div>
    `,
    iconSize: [110, 26],
    iconAnchor: [55, 13],
  });
};

// 15. Chennai Neighborhood Area Label
export const createNeighborhoodLabel = (name: string) => {
  return L.divIcon({
    className: 'neighborhood-label-marker',
    html: `
      <div class="font-sans text-[11px] font-semibold text-slate-400/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide pointer-events-none select-none">
        ${name}
      </div>
    `,
    iconSize: [100, 20],
    iconAnchor: [50, 10],
  });
};


