import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useUrsai } from '../../context/UrsaiContext';
import { CHENNAI_CENTER, DEFAULT_MAP_ZOOM, AMBULANCE_DEPOT, POLICE_DEPOT } from '../../data/depots';
import {
  createTacticalIncidentBadge,
  createTacticalUnitBadge,
  createTacticalHospitalBadge,
  createDepotIcon,
  createNeighborhoodLabel,
} from './CustomMarkers';
import { formatEta, formatDistance } from '../../incidents/incidentManager';
import { eventBus } from '../../coordination/eventBus';
import { Tactical3DView } from './Tactical3DView';
import {
  Compass,
  Plus,
  Minus,
  Navigation,
  Search,
  MapPin,
  X,
} from 'lucide-react';

export type MapMode = '2D_STREETS' | '3D_TILT' | 'SATELLITE';

const CHENNAI_LANDMARKS = [
  { name: 'Egmore', lat: 13.0784, lng: 80.2608 },
  { name: 'Kilpauk', lat: 13.0820, lng: 80.2425 },
  { name: 'Chintadripet', lat: 13.0760, lng: 80.2740 },
  { name: 'Island Grounds', lat: 13.0750, lng: 80.2880 },
  { name: 'Anna Nagar', lat: 13.0850, lng: 80.2100 },
  { name: 'Nungambakkam', lat: 13.0600, lng: 80.2400 },
  { name: 'Kodambakkam', lat: 13.0515, lng: 80.2240 },
  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
  { name: 'Gopalapuram', lat: 13.0490, lng: 80.2580 },
  { name: 'Royapettah', lat: 13.0550, lng: 80.2680 },
  { name: 'Triplicane', lat: 13.0590, lng: 80.2780 },
  { name: 'Mylapore', lat: 13.0368, lng: 80.2676 },
  { name: 'Marina Beach', lat: 13.0500, lng: 80.2830 },
  { name: 'Light House', lat: 13.0390, lng: 80.2790 },
  { name: 'Guindy', lat: 13.0067, lng: 80.2025 },
  { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
];

// Tactical Default Incident Data (Used if active incident is initializing or in demo)
const DEFAULT_TACTICAL_INCIDENT = {
  id: 'INC-001',
  type: 'TRAFFIC',
  title: 'Major Traffic Collision',
  locationName: 'Anna Salai, T. Nagar',
  timeStr: '14:18',
  severity: 'HIGH',
  lat: 13.0440,
  lng: 80.2435,
};

// Sub-component to handle map click events for coordinate selection
const MapClickHandler: React.FC = () => {
  const { state, setSelectedLocation } = useUrsai();

  useMapEvents({
    click(e) {
      if (state.mapSelection.isSelectingLocation) {
        setSelectedLocation({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
        });
      }
    },
  });

  return null;
};

// Sub-component to bind external actions (flyTo, zoom, reset)
const MapController: React.FC<{
  targetLocation: [number, number] | null;
  targetZoom: number | null;
  resetTrigger: number;
  zoomInTrigger: number;
  zoomOutTrigger: number;
}> = ({ targetLocation, targetZoom, resetTrigger, zoomInTrigger, zoomOutTrigger }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, targetZoom || 14, {
        duration: 1.2,
      });
    }
  }, [targetLocation, targetZoom, map]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo(CHENNAI_CENTER, DEFAULT_MAP_ZOOM, {
        duration: 1.0,
      });
    }
  }, [resetTrigger, map]);

  useEffect(() => {
    if (zoomInTrigger > 0) {
      map.zoomIn();
    }
  }, [zoomInTrigger, map]);

  useEffect(() => {
    if (zoomOutTrigger > 0) {
      map.zoomOut();
    }
  }, [zoomOutTrigger, map]);

  return null;
};

export const MapView: React.FC = () => {
  const { state } = useUrsai();
  const { activeIncident, ambulance, police, traffic, hospital } = state;
  const [, setTick] = useState(0);

  // Map state
  const [mapMode, setMapMode] = useState<MapMode>('2D_STREETS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [targetLocation, setTargetLocation] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [zoomInTrigger, setZoomInTrigger] = useState<number>(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState<number>(0);

  // Subscribe to EventBus to re-render when department agents activate, dispatch, or update routes
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const isGreenCorridor = traffic.greenCorridorActive;
  const selectedHospitalId = hospital.selectedHospital?.id;

  // Search filtered landmarks
  const filteredLandmarks = searchQuery.trim() === ''
    ? []
    : CHENNAI_LANDMARKS.filter((l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectLandmark = (landmark: { name: string; lat: number; lng: number }) => {
    setTargetLocation([landmark.lat, landmark.lng]);
    setTargetZoom(15);
    setSearchQuery(landmark.name);
    setIsSearchOpen(false);
  };

  const handleResetView = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const handleLocateMe = () => {
    if (activeIncident) {
      setTargetLocation([activeIncident.latitude, activeIncident.longitude]);
      setTargetZoom(14);
    } else {
      setTargetLocation(CHENNAI_CENTER);
      setTargetZoom(DEFAULT_MAP_ZOOM);
    }
  };

  // Tactical incident coordinates
  const incidentLat = activeIncident ? activeIncident.latitude : DEFAULT_TACTICAL_INCIDENT.lat;
  const incidentLng = activeIncident ? activeIncident.longitude : DEFAULT_TACTICAL_INCIDENT.lng;
  const incidentId = activeIncident ? activeIncident.id : DEFAULT_TACTICAL_INCIDENT.id;
  const incidentType = activeIncident ? activeIncident.type : DEFAULT_TACTICAL_INCIDENT.type;
  const incidentTitle = activeIncident ? activeIncident.description : DEFAULT_TACTICAL_INCIDENT.title;
  const incidentLocation = activeIncident ? `Lat ${activeIncident.latitude.toFixed(3)}, Lng ${activeIncident.longitude.toFixed(3)}` : DEFAULT_TACTICAL_INCIDENT.locationName;
  const incidentSeverity = activeIncident ? activeIncident.severity : DEFAULT_TACTICAL_INCIDENT.severity;

  // Dynamic traffic agent placement along corridor
  const trafficLat = traffic.latitude ?? (activeIncident ? (incidentLat + AMBULANCE_DEPOT.latitude) / 2 : 13.0680);
  const trafficLng = traffic.longitude ?? (activeIncident ? (incidentLng + AMBULANCE_DEPOT.longitude) / 2 : 80.2580);

  if (mapMode === '3D_TILT') {
    return (
      <Tactical3DView onSwitchTo2D={() => setMapMode('2D_STREETS')} />
    );
  }

  return (
    <div
      id="ursai-tactical-map-container"
      className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden flex-1 border border-slate-800 rounded-xl shadow-2xl flex flex-col select-none"
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP FLOATING TOOLBAR: MODE SWITCHER & CHENNAI SEARCH */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: 2D Streets / 3D Tilt / Satellite Toggle */}
        <div className="flex items-center bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapMode('2D_STREETS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              mapMode === '2D_STREETS'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            2D Streets
          </button>
          <button
            type="button"
            onClick={() => setMapMode('3D_TILT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              mapMode === '3D_TILT'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            3D Tilt
          </button>
          <button
            type="button"
            onClick={() => setMapMode('SATELLITE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              mapMode === 'SATELLITE'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Center/Search: Search Chennai location... */}
        <div className="relative w-72 md:w-80 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-2xl focus-within:border-cyan-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search Chennai location..."
              className="bg-transparent text-xs text-slate-100 placeholder-slate-400 font-sans focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && filteredLandmarks.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[1050] max-h-60 overflow-y-auto custom-scrollbar font-sans text-xs">
              {filteredLandmarks.map((landmark) => (
                <div
                  key={landmark.name}
                  onClick={() => handleSelectLandmark(landmark)}
                  className="px-3.5 py-2 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-200 border-b border-slate-800/50 last:border-none"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {landmark.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {landmark.lat.toFixed(3)}, {landmark.lng.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT COMPASS & NAVIGATION CONTROLS */}
      {/* ========================================================================= */}
      <div className="absolute top-20 right-4 z-[1000] flex flex-col items-center gap-2 pointer-events-auto">
        {/* Realistic Compass North Indicator */}
        <button
          type="button"
          onClick={handleResetView}
          className="relative w-12 h-12 rounded-full bg-slate-950/90 backdrop-blur-md border-2 border-slate-700/80 shadow-2xl flex items-center justify-center text-slate-200 hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer group"
          title="Reset North & Alignment"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Red North Needle */}
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[14px] border-b-red-500 absolute top-0" />
            {/* White South Needle */}
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[14px] border-t-slate-300 absolute bottom-0" />
            {/* Center Pivot */}
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-400 z-10" />
          </div>
          <span className="absolute -top-1 font-mono text-[9px] font-extrabold text-red-400">N</span>
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden mt-1">
          <button
            type="button"
            onClick={() => setZoomInTrigger((prev) => prev + 1)}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors border-b border-slate-800 cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomOutTrigger((prev) => prev + 1)}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          className="p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Center on Incident / Target"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. LEAFLET MAP CONTAINER WITH POLICE, AMBULANCE & TRAFFIC AGENTS ONLY */}
      {/* ========================================================================= */}
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        className="w-full h-full z-0 flex-1"
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        zoomControl={false}
      >
        <MapController
          targetLocation={targetLocation}
          targetZoom={targetZoom}
          resetTrigger={resetTrigger}
          zoomInTrigger={zoomInTrigger}
          zoomOutTrigger={zoomOutTrigger}
        />
        <MapClickHandler />

        {/* Tile Layer Switching: 2D Streets (OSM), 3D Tilt (CartoDB Dark), Satellite (ESRI HD) */}
        {mapMode === '2D_STREETS' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {mapMode === '3D_TILT' && (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
            maxZoom={19}
          />
        )}

        {mapMode === 'SATELLITE' && (
          <TileLayer
            attribution='&copy; Esri &mdash; World Imagery'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}

        {/* Chennai Neighborhood Sector Labels */}
        {CHENNAI_LANDMARKS.map((landmark) => (
          <Marker
            key={landmark.name}
            position={[landmark.lat, landmark.lng]}
            icon={createNeighborhoodLabel(landmark.name)}
            interactive={false}
          />
        ))}

        {/* 1. Ambulance Depot Marker */}
        <Marker
          position={[AMBULANCE_DEPOT.latitude, AMBULANCE_DEPOT.longitude]}
          icon={createDepotIcon('AMBULANCE')}
        >
          <Popup className="dark-popup">
            <div className="text-xs font-mono p-1 text-slate-100">
              <div className="font-bold text-sky-400">{AMBULANCE_DEPOT.name}</div>
              <div>Type: CENTRAL AMBULANCE DEPOT</div>
              <div>Coords: {AMBULANCE_DEPOT.latitude}, {AMBULANCE_DEPOT.longitude}</div>
            </div>
          </Popup>
        </Marker>

        {/* 2. Police Depot Marker */}
        <Marker
          position={[POLICE_DEPOT.latitude, POLICE_DEPOT.longitude]}
          icon={createDepotIcon('POLICE')}
        >
          <Popup className="dark-popup">
            <div className="text-xs font-mono p-1 text-slate-100">
              <div className="font-bold text-indigo-400">{POLICE_DEPOT.name}</div>
              <div>Type: POLICE HEADQUARTERS</div>
              <div>Coords: {POLICE_DEPOT.latitude}, {POLICE_DEPOT.longitude}</div>
            </div>
          </Popup>
        </Marker>

        {/* 3. Destination Hospital */}
        {hospital.allHospitals.map((h) => {
          const isSelected = h.id === selectedHospitalId;
          return (
            <Marker
              key={h.id}
              position={[h.latitude, h.longitude]}
              icon={createTacticalHospitalBadge(h.name, h.bedsAvailable, isSelected)}
            >
              <Popup className="dark-popup">
                <div className="text-xs font-mono p-1 text-slate-100 space-y-1 max-w-xs">
                  <div className="font-bold text-teal-400 flex items-center justify-between border-b border-slate-700 pb-1">
                    <span>{h.name}</span>
                    {isSelected && (
                      <span className="text-[10px] px-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div>Beds Available: <span className="font-bold text-emerald-400">{h.bedsAvailable}</span></div>
                  <div>ICU Beds Available: <span className="font-bold text-amber-400">{h.icuBedsAvailable}</span></div>
                  <div>Emergency Status: <span className="font-bold text-sky-400">{h.emergencyReady ? 'READY' : 'OFFLINE'}</span></div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Active Tactical Incident Marker */}
        {activeIncident && (
          <Marker
            position={[incidentLat, incidentLng]}
            icon={createTacticalIncidentBadge(
              incidentId,
              incidentType,
              incidentTitle,
              incidentLocation,
              '14:18',
              incidentSeverity
            )}
          >
            <Popup className="dark-popup">
              <div className="text-xs font-mono p-1 text-slate-100 space-y-1">
                <div className="font-bold text-red-400 flex items-center justify-between border-b border-slate-700 pb-1">
                  <span>{incidentId}</span>
                  <span className="text-[10px] px-1 bg-red-950 text-red-300 border border-red-800 rounded font-bold">
                    {incidentSeverity}
                  </span>
                </div>
                <div>Type: {incidentType}</div>
                <div>Location: {incidentLat.toFixed(4)}, {incidentLng.toFixed(4)}</div>
                <div className="text-slate-300 italic">"{incidentTitle}"</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 5. Live Moving AMBULANCE AGENT (AM-15 / AMB-01) */}
        <Marker
          position={[ambulance.latitude, ambulance.longitude]}
          icon={createTacticalUnitBadge(
            'AM-15',
            'Ambulance Agent',
            ambulance.status === 'EN_ROUTE' ? 'EN ROUTE' : ambulance.status === 'AT_SCENE' ? 'AT SCENE' : ambulance.status === 'TRANSPORTING' ? 'TRANSPORTING' : 'STANDBY',
            'AMBULANCE'
          )}
        >
          <Popup className="dark-popup">
            <div className="text-xs font-mono p-1 text-slate-100 space-y-1">
              <div className="font-bold text-emerald-400">AMBULANCE AGENT (AM-15)</div>
              <div>Status: <span className="text-emerald-300 font-bold">{ambulance.status}</span></div>
              <div>Task: {ambulance.currentTask || 'STANDBY'}</div>
              <div>ETA: {formatEta(ambulance.eta)}</div>
              <div>Distance: {formatDistance(ambulance.routeDistance)}</div>
              <div>Position: {ambulance.latitude.toFixed(4)}, {ambulance.longitude.toFixed(4)}</div>
            </div>
          </Popup>
        </Marker>

        {/* 6. Live Moving POLICE AGENT (PD-28 / POL-01) */}
        <Marker
          position={[police.latitude, police.longitude]}
          icon={createTacticalUnitBadge(
            'PD-28',
            'Police Agent',
            police.status === 'ON_SCENE' ? 'ON SCENE' : police.status === 'EN_ROUTE' ? 'EN ROUTE' : 'PATROL',
            'POLICE'
          )}
        >
          <Popup className="dark-popup">
            <div className="text-xs font-mono p-1 text-slate-100 space-y-1">
              <div className="font-bold text-blue-400">POLICE AGENT (PD-28)</div>
              <div>Status: <span className="text-blue-300 font-bold">{police.status}</span></div>
              <div>Task: {police.currentTask || 'PATROL'}</div>
              <div>Distance: {formatDistance(police.routeDistance)}</div>
              <div>Position: {police.latitude.toFixed(4)}, {police.longitude.toFixed(4)}</div>
            </div>
          </Popup>
        </Marker>

        {/* 7. TRAFFIC AGENT (TR-07 / TRF-01) */}
        <Marker
          position={[trafficLat, trafficLng]}
          icon={createTacticalUnitBadge(
            'TR-07',
            'Traffic Agent',
            traffic.greenCorridorActive ? 'GREEN CORRIDOR ACTIVE' : traffic.status === 'RESPONDING' ? 'EN ROUTE' : 'SCATS MONITORING',
            'TRAFFIC'
          )}
        >
          <Popup className="dark-popup">
            <div className="text-xs font-mono p-1 text-slate-100 space-y-1">
              <div className="font-bold text-amber-400">TRAFFIC AGENT (TR-07)</div>
              <div>Status: {traffic.status}</div>
              <div>Green Corridor: {traffic.greenCorridorActive ? 'HOLDING GREEN WAVE' : 'STANDBY'}</div>
              <div>SCATS Signals: Adaptive Priority Active</div>
            </div>
          </Popup>
        </Marker>

        {/* 8. Polyline Routes & Green Wave Corridor */}
        {ambulance.route && ambulance.route.length > 0 && (
          <Polyline
            positions={ambulance.route}
            pathOptions={{
              color: isGreenCorridor ? '#10b981' : '#00f5ff',
              weight: isGreenCorridor ? 7 : 5,
              opacity: 1,
              dashArray: isGreenCorridor ? undefined : '10, 10',
              lineCap: 'round',
              lineJoin: 'round',
              className: isGreenCorridor ? 'route-glow-green-corridor' : 'route-glow-ambulance',
            }}
          />
        )}

        {police.route && police.route.length > 0 && (
          <Polyline
            positions={police.route}
            pathOptions={{
              color: '#8b5cf6',
              weight: 4,
              opacity: 1,
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round',
              className: 'route-glow-police',
            }}
          />
        )}

        {traffic.route && traffic.route.length > 0 && (
          <Polyline
            positions={traffic.route}
            pathOptions={{
              color: '#f59e0b',
              weight: 4,
              opacity: 1,
              dashArray: '6, 6',
              lineCap: 'round',
              lineJoin: 'round',
              className: 'route-glow-traffic',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
