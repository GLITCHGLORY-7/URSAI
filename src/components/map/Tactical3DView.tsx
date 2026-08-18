import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useUrsai } from '../../context/UrsaiContext';
import { AMBULANCE_DEPOT, POLICE_DEPOT } from '../../data/depots';
import { INITIAL_HOSPITALS } from '../../data/hospitals';
import { formatEta, formatDistance } from '../../incidents/incidentManager';
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Shield,
  Ambulance as AmbulanceIcon,
  AlertTriangle,
  Building,
  Navigation,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Zap,
  MapPin,
  Flame,
} from 'lucide-react';
import {
  buildHighFidelityAmbulance,
  buildHighFidelityPolice,
  buildHighFidelityTrafficInterceptor,
  buildRealisticAutoRickshaw,
  buildRealisticMTCBus,
  buildRealisticCivilianCar,
  buildRealisticHospitalComplex,
  buildHighTechSCATSGantry,
  buildModernStreetlight,
  buildBoulevardPalm,
  buildRiponBuildingCentralClockTower,
  buildLICBuilding,
  buildMarinaLighthouse,
  buildTidelParkTechTower,
  buildChepaukStadium,
  buildValluvarKottam,
  buildElevatedMetroViaduct,
  buildChennaiMetroTrain,
  buildGlassCorporateTower,
  buildUrbanResidentialBlock,
  buildExpressAvenueMall,
  buildBusStopShelter,
  buildGulmoharTree,
} from './tactical3dModels';

interface Tactical3DViewProps {
  onSwitchTo2D?: () => void;
}

// ---------------------------------------------------------------------------
// COORDINATE TRANSFORM (GPS Lat,Lng to 3D World Units X,Z)
// Center point: Anna Salai / Thousand Lights / Greams Road Corridor
// ---------------------------------------------------------------------------
const CHENNAI_3D_CENTER = [13.0600, 80.2500];
const LAT_SCALE = 6800;
const LNG_SCALE = 6800;

function gpsTo3D(lat: number, lng: number): [number, number] {
  const x = (lng - CHENNAI_3D_CENTER[1]) * LNG_SCALE;
  const z = -(lat - CHENNAI_3D_CENTER[0]) * LAT_SCALE;
  return [x, z];
}

// Build realistic Incident Crash Site (Damaged vehicles, flashing hazards, safety cones & holographic pulse)
function buildRealisticIncidentScene(): {
  group: THREE.Group;
  beaconBeam: THREE.Mesh;
  pulseReticle: THREE.Mesh;
  amberLights: THREE.PointLight[];
} {
  const sceneGroup = new THREE.Group();
  const amberLights: THREE.PointLight[] = [];

  // Crashed Sedan 1 (Silver Metallic, skid marks)
  const car1 = buildRealisticCivilianCar(0x94a3b8);
  car1.position.set(-2.2, 0, -1.5);
  car1.rotation.y = 0.52;
  sceneGroup.add(car1);

  // Crashed SUV 2 (Navy Blue, angled t-bone collision)
  const car2 = buildRealisticCivilianCar(0x1e3a8a);
  car2.position.set(2.4, 0, 1.6);
  car2.rotation.y = -0.85;
  car2.rotation.z = 0.12; // tilted on wheels
  sceneGroup.add(car2);

  // Reflective Orange Traffic Hazard Cones
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const conePositions = [
    [-6, 0, -6],
    [-6, 0, 6],
    [6, 0, -6],
    [6, 0, 6],
    [-8, 0, 0],
    [8, 0, 0],
    [0, 0, -7],
    [0, 0, 7],
  ];

  conePositions.forEach(([cx, cy, cz]) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 14), coneMat);
    cone.position.set(cx, 0.6, cz);
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.3, 14), stripeMat);
    stripe.position.set(cx, 0.55, cz);
    sceneGroup.add(cone, stripe);
  });

  // Flashing Amber Warning Flares
  const flare1 = new THREE.PointLight(0xf59e0b, 3.5, 22);
  flare1.position.set(-5, 0.8, -5);
  const flare2 = new THREE.PointLight(0xf59e0b, 3.5, 22);
  flare2.position.set(5, 0.8, 5);
  sceneGroup.add(flare1, flare2);
  amberLights.push(flare1, flare2);

  // Pinpoint Holographic Beacon Beam
  const beaconBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 65, 16),
    new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75 })
  );
  beaconBeam.position.y = 32.5;
  sceneGroup.add(beaconBeam);

  // Ground Hazard Shockwave Ring
  const pulseReticle = new THREE.Mesh(
    new THREE.RingGeometry(2.0, 3.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  pulseReticle.rotation.x = -Math.PI / 2;
  pulseReticle.position.y = 0.1;
  sceneGroup.add(pulseReticle);

  return { group: sceneGroup, beaconBeam, pulseReticle, amberLights };
}

export const Tactical3DView: React.FC<Tactical3DViewProps> = ({ onSwitchTo2D }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { state } = useUrsai();
  const { activeIncident, ambulance, police, traffic, hospital } = state;

  const [cameraMode, setCameraModeState] = useState<
    'FREE' | 'AMBULANCE' | 'POLICE' | 'INCIDENT' | 'APOLLO' | 'CENTRAL' | 'LIC' | 'MARINA' | 'CHEPAUK' | 'VALLUVAR' | 'EXPRESS_MALL' | 'METRO'
  >('FREE');
  const cameraModeRef = useRef<string>('FREE');

  const setCameraMode = (mode: any) => {
    cameraModeRef.current = mode;
    setCameraModeState(mode);
  };

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const ambulanceMeshRef = useRef<THREE.Group | null>(null);
  const policeMeshRef = useRef<THREE.Group | null>(null);
  const trafficMeshRef = useRef<THREE.Group | null>(null);
  const incidentGroupRef = useRef<THREE.Group | null>(null);
  const pulseReticleRef = useRef<THREE.Mesh | null>(null);
  const incidentAmberLightsRef = useRef<THREE.PointLight[]>([]);
  const ambSirenLightRef = useRef<THREE.PointLight | null>(null);
  const polStrobeLightRef = useRef<THREE.PointLight | null>(null);
  const trfStrobeLightRef = useRef<THREE.PointLight | null>(null);
  const lighthouseBeaconRef = useRef<THREE.SpotLight | null>(null);
  const metroTrainRef = useRef<THREE.Group | null>(null);
  const trafficSignalsRef = useRef<THREE.Mesh[]>([]);
  const vmsBoardsRef = useRef<THREE.Mesh[]>([]);
  const civilianVehiclesRef = useRef<Array<{ mesh: THREE.Group; speed: number; laneZ: number; dir: number }>>([]);

  const ambulanceRouteLineRef = useRef<THREE.Line | null>(null);
  const policeRouteLineRef = useRef<THREE.Line | null>(null);
  const trafficRouteLineRef = useRef<THREE.Line | null>(null);

  const prevAmbPos = useRef<[number, number]>([0, 0]);
  const prevPolPos = useRef<[number, number]>([0, 0]);
  const prevTrfPos = useRef<[number, number]>([0, 0]);

  // 1. INITIALIZE THREE.JS SCENE ON MOUNT
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // SCENE & FOG
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.0018);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 4000);
    camera.position.set(0, 160, 180);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.outline = 'none';
    rendererRef.current = renderer;

    // ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.minDistance = 8;
    controls.maxDistance = 1200;
    controls.target.set(0, 0, 0);
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true;

    controls.addEventListener('start', () => {
      cameraModeRef.current = 'FREE';
      setCameraModeState('FREE');
    });

    controlsRef.current = controls;

    // LIGHTING SETUP
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(120, 240, 90);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 700;
    dirLight.shadow.camera.left = -300;
    dirLight.shadow.camera.right = 300;
    dirLight.shadow.camera.top = 300;
    dirLight.shadow.camera.bottom = -300;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    // GROUND TERRAIN
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x060c18,
      roughness: 0.92,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cyan Holographic City Grid
    const gridHelper = new THREE.GridHelper(1600, 160, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // -----------------------------------------------------------------------
    // BAY OF BENGAL / MARINA BEACH COASTAL WATER PLANE (EAST)
    // -----------------------------------------------------------------------
    const oceanGeo = new THREE.PlaneGeometry(600, 1600);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0c4a6e,
      roughness: 0.1,
      metalness: 0.8,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(450, 0.02, 0);
    scene.add(ocean);

    // Beach Sand Strip
    const sandGeo = new THREE.PlaneGeometry(60, 1600);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(190, 0.03, 0);
    scene.add(sand);

    // -----------------------------------------------------------------------
    // REALISTIC CHENNAI ARTERIAL ROAD NETWORK
    // -----------------------------------------------------------------------
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const medianConcreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    // 1. ANNA SALAI (MOUNT ROAD) - Main 6-Lane Spine
    const annaSalaiWidth = 36;
    const annaSalaiLength = 900;
    const annaSalaiAngle = -0.52;

    const annaSalai = new THREE.Mesh(new THREE.PlaneGeometry(annaSalaiWidth, annaSalaiLength), asphaltMat);
    annaSalai.rotation.x = -Math.PI / 2;
    annaSalai.rotation.z = annaSalaiAngle;
    annaSalai.position.set(-15, 0.04, 0);
    annaSalai.receiveShadow = true;
    scene.add(annaSalai);

    // Center Jersey Crash Barrier
    const medianBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, annaSalaiLength), medianConcreteMat);
    medianBarrier.rotation.y = annaSalaiAngle;
    medianBarrier.position.set(-15, 0.45, 0);
    medianBarrier.castShadow = true;
    scene.add(medianBarrier);

    // Thermoplastic White Dashed Lanes (3 lanes each side)
    const laneOffsets = [-12, -6, 6, 12];
    laneOffsets.forEach((off) => {
      for (let s = -annaSalaiLength / 2 + 10; s <= annaSalaiLength / 2 - 10; s += 14) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 7), whiteLineMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.rotation.z = annaSalaiAngle;
        const sx = -15 + off * Math.cos(annaSalaiAngle) + s * Math.sin(annaSalaiAngle);
        const sz = 0 - off * Math.sin(annaSalaiAngle) + s * Math.cos(annaSalaiAngle);
        stripe.position.set(sx, 0.06, sz);
        scene.add(stripe);
      }
    });

    // Solid Yellow Safety Lines
    [-1.4, 1.4].forEach((off) => {
      const edgeLine = new THREE.Mesh(new THREE.PlaneGeometry(0.4, annaSalaiLength), yellowLineMat);
      edgeLine.rotation.x = -Math.PI / 2;
      edgeLine.rotation.z = annaSalaiAngle;
      const ex = -15 + off * Math.cos(annaSalaiAngle);
      const ez = 0 - off * Math.sin(annaSalaiAngle);
      edgeLine.position.set(ex, 0.06, ez);
      scene.add(edgeLine);
    });

    // 2. POONAMALLEE HIGH ROAD / EVR PERIYAR SALAI (Connecting Central / Ripon)
    const evrRoad = new THREE.Mesh(new THREE.PlaneGeometry(28, 700), asphaltMat);
    evrRoad.rotation.x = -Math.PI / 2;
    evrRoad.rotation.z = Math.PI / 2;
    evrRoad.position.set(50, 0.03, -155);
    evrRoad.receiveShadow = true;
    scene.add(evrRoad);

    // 3. CATHEDRAL ROAD / DR. RADHAKRISHNAN SALAI (Gemini to Beach)
    const cathedralRoad = new THREE.Mesh(new THREE.PlaneGeometry(26, 500), asphaltMat);
    cathedralRoad.rotation.x = -Math.PI / 2;
    cathedralRoad.rotation.z = Math.PI / 2;
    cathedralRoad.position.set(60, 0.03, 55);
    cathedralRoad.receiveShadow = true;
    scene.add(cathedralRoad);

    // 4. KAMARAJAR PROMENADE (BEACH ROAD ALONG MARINA)
    const beachRoad = new THREE.Mesh(new THREE.PlaneGeometry(28, 800), asphaltMat);
    beachRoad.rotation.x = -Math.PI / 2;
    beachRoad.position.set(160, 0.04, 0);
    beachRoad.receiveShadow = true;
    scene.add(beachRoad);

    // -----------------------------------------------------------------------
    // ELEVATED GEMINI FLYOVER / KATHIPARA INTERCHANGE RAMP
    // -----------------------------------------------------------------------
    const flyoverMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.3 });
    const flyover = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 260), flyoverMat);
    flyover.rotation.y = annaSalaiAngle;
    flyover.position.set(-35, 14, 55);
    flyover.castShadow = true;
    scene.add(flyover);

    // Flyover Road Surface
    const flyAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 258), asphaltMat);
    flyAsphalt.rotation.x = -Math.PI / 2;
    flyAsphalt.rotation.z = annaSalaiAngle;
    flyAsphalt.position.set(-35, 14.72, 55);
    scene.add(flyAsphalt);

    // Flyover Support Pillars
    for (let p = -100; p <= 100; p += 40) {
      const px = -35 + p * Math.sin(annaSalaiAngle);
      const pz = 55 + p * Math.cos(annaSalaiAngle);
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 14, 16), medianConcreteMat);
      pillar.position.set(px, 7, pz);
      pillar.castShadow = true;
      scene.add(pillar);
    }

    // -----------------------------------------------------------------------
    // STREETLIGHTS & BOULEVARD PALMS
    // -----------------------------------------------------------------------
    for (let i = -280; i <= 280; i += 36) {
      const lx = -15 + i * Math.sin(annaSalaiAngle) - 20 * Math.cos(annaSalaiAngle);
      const lz = 0 + i * Math.cos(annaSalaiAngle) + 20 * Math.sin(annaSalaiAngle);

      const sl = buildModernStreetlight(lx, lz);
      scene.add(sl.group);

      const palm = buildBoulevardPalm(lx - 4, lz);
      scene.add(palm);
    }

    // -----------------------------------------------------------------------
    // SCATS INTELLIGENT TRAFFIC SIGNAL GANTRIES
    // -----------------------------------------------------------------------
    const gantryConfigs = [
      { x: -50, z: -100, rot: annaSalaiAngle },
      { x: -15, z: 0, rot: annaSalaiAngle },
      { x: 30, z: 120, rot: annaSalaiAngle },
    ];

    const signalBulbs: THREE.Mesh[] = [];
    const vmsBoards: THREE.Mesh[] = [];

    gantryConfigs.forEach((gc) => {
      const g = buildHighTechSCATSGantry(gc.x, gc.z, gc.rot);
      scene.add(g.gantry);
      signalBulbs.push(...g.signalBulbs);
      vmsBoards.push(g.vmsBoard);
    });

    trafficSignalsRef.current = signalBulbs;
    vmsBoardsRef.current = vmsBoards;

    // -----------------------------------------------------------------------
    // REALISTIC CHENNAI LANDMARKS & URBAN ARCHITECTURE
    // -----------------------------------------------------------------------

    // 1. HISTORIC RIPON BUILDING & CHENNAI CENTRAL (Near RGGGH)
    const ripon = buildRiponBuildingCentralClockTower();
    const [riponX, riponZ] = gpsTo3D(13.0827, 80.2707);
    ripon.position.set(riponX - 25, 0, riponZ);
    ripon.rotation.y = Math.PI / 2;
    scene.add(ripon);

    // 2. ICONIC LIC BUILDING ON ANNA SALAI
    const lic = buildLICBuilding();
    const [licX, licZ] = gpsTo3D(13.0635, 80.2642);
    lic.position.set(licX, 0, licZ);
    lic.rotation.y = annaSalaiAngle;
    scene.add(lic);

    // 3. MA CHIDAMBARAM CRICKET STADIUM (CHEPAUK)
    const stadium = buildChepaukStadium();
    const [stadiumX, stadiumZ] = gpsTo3D(13.0628, 80.2795);
    stadium.position.set(stadiumX, 0, stadiumZ);
    scene.add(stadium);

    // 4. VALLUVAR KOTTAM (TEMPLE CHARIOT MONUMENT & AUDITORIUM)
    const valluvar = buildValluvarKottam();
    const [valX, valZ] = gpsTo3D(13.0536, 80.2415);
    valluvar.position.set(valX, 0, valZ);
    valluvar.rotation.y = -0.3;
    scene.add(valluvar);

    // 5. EXPRESS AVENUE MALL & ENTERTAINMENT ATRIUM
    const eaMall = buildExpressAvenueMall();
    const [eaX, eaZ] = gpsTo3D(13.0587, 80.2642);
    eaMall.position.set(eaX, 0, eaZ);
    eaMall.rotation.y = annaSalaiAngle + Math.PI;
    scene.add(eaMall);

    // 6. ELEVATED CHENNAI METRO VIADUCT & STATION
    const { viaductGroup, stationGroup } = buildElevatedMetroViaduct(800, annaSalaiAngle);
    scene.add(viaductGroup);
    scene.add(stationGroup);

    // Moving Metro Train
    const metroTrain = buildChennaiMetroTrain();
    metroTrain.position.set(26 + 1.2 * Math.cos(annaSalaiAngle), 18.7, 0 - 1.2 * Math.sin(annaSalaiAngle));
    metroTrain.rotation.y = annaSalaiAngle;
    scene.add(metroTrain);
    metroTrainRef.current = metroTrain;

    // 7. MARINA BEACH LIGHTHOUSE WITH REVOLVING BEACON
    const lighthouse = buildMarinaLighthouse();
    const [lhX, lhZ] = gpsTo3D(13.0398, 80.2785);
    lighthouse.group.position.set(lhX, 0, lhZ);
    scene.add(lighthouse.group);
    lighthouseBeaconRef.current = lighthouse.beaconLight;

    // 8. TIDEL PARK / IT CORRIDOR TECH TOWERS
    const tidel = buildTidelParkTechTower();
    const [tidelX, tidelZ] = gpsTo3D(12.9890, 80.2450);
    tidel.position.set(tidelX, 0, Math.min(tidelZ, 380));
    scene.add(tidel);

    // 9. HIGH-RISE COMMERCIAL GLASS SKYLINE CLUSTERS
    const corporateTowerCoords = [
      { lat: 13.0670, lng: 80.2580, height: 62, width: 28, depth: 22, color: 0x0284c7 },
      { lat: 13.0645, lng: 80.2470, height: 52, width: 24, depth: 24, color: 0x06b6d4 },
      { lat: 13.0540, lng: 80.2550, height: 48, width: 22, depth: 20, color: 0x3b82f6 }, // Moved away from road
      { lat: 13.0720, lng: 80.2610, height: 58, width: 26, depth: 26, color: 0x0ea5e9 },
      { lat: 13.0450, lng: 80.2620, height: 44, width: 24, depth: 18, color: 0x6366f1 },
      { lat: 13.0760, lng: 80.2520, height: 50, width: 22, depth: 22, color: 0x0284c7 },
      // New additions for density
      { lat: 13.0600, lng: 80.2600, height: 65, width: 30, depth: 30, color: 0x0ea5e9 },
      { lat: 13.0620, lng: 80.2520, height: 55, width: 25, depth: 25, color: 0x0284c7 },
      { lat: 13.0680, lng: 80.2500, height: 70, width: 32, depth: 28, color: 0x3b82f6 },
      { lat: 13.0480, lng: 80.2580, height: 45, width: 24, depth: 24, color: 0x06b6d4 }, // Moved away from road
      { lat: 13.0750, lng: 80.2480, height: 48, width: 22, depth: 26, color: 0x6366f1 },
      { lat: 13.0710, lng: 80.2650, height: 60, width: 28, depth: 28, color: 0x0ea5e9 },
    ];

    corporateTowerCoords.forEach((t) => {
      const [tx, tz] = gpsTo3D(t.lat, t.lng);
      const tower = buildGlassCorporateTower(t.height, t.width, t.depth, t.color);
      tower.position.set(tx, 0, tz);
      scene.add(tower);
    });

    // 10. URBAN RESIDENTIAL APARTMENT BLOCKS
    const residentialCoords = [
      { lat: 13.0550, lng: 80.2460, height: 38, width: 30, depth: 20 },
      { lat: 13.0480, lng: 80.2500, height: 34, width: 26, depth: 18 },
      { lat: 13.0690, lng: 80.2420, height: 36, width: 28, depth: 22 },
      { lat: 13.0410, lng: 80.2680, height: 32, width: 24, depth: 20 },
      // New additions for density
      { lat: 13.0580, lng: 80.2420, height: 40, width: 28, depth: 24 },
      { lat: 13.0610, lng: 80.2400, height: 35, width: 30, depth: 20 },
      { lat: 13.0450, lng: 80.2480, height: 38, width: 26, depth: 26 },
      { lat: 13.0720, lng: 80.2380, height: 42, width: 32, depth: 22 },
      { lat: 13.0650, lng: 80.2650, height: 34, width: 24, depth: 24 },
      { lat: 13.0470, lng: 80.2630, height: 36, width: 28, depth: 20 }, // Moved away from road
    ];

    residentialCoords.forEach((r) => {
      const [rx, rz] = gpsTo3D(r.lat, r.lng);
      const resBlock = buildUrbanResidentialBlock(r.height, r.width, r.depth);
      resBlock.position.set(rx, 0, rz);
      scene.add(resBlock);
    });

    // 11. ROADSIDE BUS STOP SHELTERS & GULMOHAR TREES
    const busStopPositions = [
      { x: -32, z: -80, rot: annaSalaiAngle },
      { x: -5, z: 70, rot: annaSalaiAngle },
      { x: 30, z: -160, rot: 0 },
      { x: 75, z: 50, rot: 0 },
    ];
    busStopPositions.forEach((bs) => {
      const shelter = buildBusStopShelter();
      shelter.position.set(bs.x, 0, bs.z);
      shelter.rotation.y = bs.rot;
      scene.add(shelter);
    });

    // Flaming Orange Gulmohar Avenue Trees
    for (let g = -240; g <= 240; g += 48) {
      const gx = -15 + g * Math.sin(annaSalaiAngle) + 24 * Math.cos(annaSalaiAngle);
      const gz = 0 + g * Math.cos(annaSalaiAngle) - 24 * Math.sin(annaSalaiAngle);
      const gTree = buildGulmoharTree(gx, gz);
      scene.add(gTree);
    }

    // 12. 3D HOSPITAL COMPLEXES
    const hospitalsList = hospital?.allHospitals?.length ? hospital.allHospitals : INITIAL_HOSPITALS;
    hospitalsList.forEach((h, idx) => {
      const [hx, hz] = gpsTo3D(h.latitude, h.longitude);
      const hosp = buildRealisticHospitalComplex(h.name, idx === 0);
      hosp.position.set(hx, 0, hz);
      scene.add(hosp);
    });

    // 13. EMERGENCY DISPATCH DEPOTS
    const [ambDepX, ambDepZ] = gpsTo3D(AMBULANCE_DEPOT.latitude, AMBULANCE_DEPOT.longitude);
    const ambDepotBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(26, 14, 20),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 })
    );
    ambDepotBuilding.position.set(ambDepX, 7, ambDepZ);
    ambDepotBuilding.castShadow = true;
    scene.add(ambDepotBuilding);

    const [polDepX, polDepZ] = gpsTo3D(POLICE_DEPOT.latitude, POLICE_DEPOT.longitude);
    const polDepotBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(26, 14, 20),
      new THREE.MeshStandardMaterial({ color: 0x3730a3, metalness: 0.7, roughness: 0.2 })
    );
    polDepotBuilding.position.set(polDepX, 7, polDepZ);
    polDepotBuilding.castShadow = true;
    scene.add(polDepotBuilding);

    // -----------------------------------------------------------------------
    // EMERGENCY VEHICLES & CRASH SCENE
    // -----------------------------------------------------------------------
    const ambBuilt = buildHighFidelityAmbulance();
    scene.add(ambBuilt.group);
    ambulanceMeshRef.current = ambBuilt.group;
    ambSirenLightRef.current = ambBuilt.sirenLight;

    const polBuilt = buildHighFidelityPolice();
    scene.add(polBuilt.group);
    policeMeshRef.current = polBuilt.group;
    polStrobeLightRef.current = polBuilt.strobeLight;

    const trfBuilt = buildHighFidelityTrafficInterceptor();
    scene.add(trfBuilt.group);
    trafficMeshRef.current = trfBuilt.group;
    trfStrobeLightRef.current = trfBuilt.strobeLight;

    // Crash Scene Incident
    const incScene = buildRealisticIncidentScene();
    scene.add(incScene.group);
    incidentGroupRef.current = incScene.group;
    pulseReticleRef.current = incScene.pulseReticle;
    incidentAmberLightsRef.current = incScene.amberLights;

    // Ambient Civilian Vehicles (Auto-rickshaws, MTC buses, cars)
    const civVehicles: Array<{ mesh: THREE.Group; speed: number; laneZ: number; dir: number }> = [];

    // Auto-Rickshaws
    for (let r = 0; r < 18; r++) {
      const rickshaw = buildRealisticAutoRickshaw();
      const dir = r % 2 === 0 ? 1 : -1;
      rickshaw.position.set(-130 + r * 65, 0, 55 + (dir === 1 ? 6 : -6));
      rickshaw.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(rickshaw);
      civVehicles.push({ mesh: rickshaw, speed: 0.06, laneZ: rickshaw.position.z, dir });
    }

    // MTC City Buses
    for (let b = 0; b < 6; b++) {
      const bus = buildRealisticMTCBus();
      const dir = b === 0 ? 1 : -1;
      bus.position.set(-100 + b * 200, 0, 55 + (dir === 1 ? 9 : -9));
      bus.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(bus);
      civVehicles.push({ mesh: bus, speed: 0.08, laneZ: bus.position.z, dir });
    }

    // Civilian Cars
    const civCarColors = [0x94a3b8, 0xf8fafc, 0x1e293b, 0xdc2626, 0x2563eb, 0x059669];
    for (let c = 0; c < 24; c++) {
      const car = buildRealisticCivilianCar(civCarColors[c % civCarColors.length]);
      const dir = c % 2 === 0 ? 1 : -1;
      car.position.set(-150 + c * 50, 0, 55 + (dir === 1 ? 3 : -3));
      car.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(car);
      civVehicles.push({ mesh: car, speed: 0.10, laneZ: car.position.z, dir });
    }

    civilianVehiclesRef.current = civVehicles;

    // -----------------------------------------------------------------------
    // ANIMATION RENDER LOOP
    // -----------------------------------------------------------------------
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Flashing Emergency Siren Radiance
      if (ambSirenLightRef.current) {
        ambSirenLightRef.current.intensity = Math.sin(elapsedTime * 15) > 0 ? 7.0 : 0.9;
      }
      if (polStrobeLightRef.current) {
        polStrobeLightRef.current.color.setHex(Math.sin(elapsedTime * 16) > 0 ? 0xef4444 : 0x3b82f6);
      }
      if (trfStrobeLightRef.current) {
        trfStrobeLightRef.current.color.setHex(Math.sin(elapsedTime * 14) > 0 ? 0xf59e0b : 0x06b6d4);
      }

      // Revolving Marina Lighthouse Searchlight
      if (lighthouseBeaconRef.current) {
        const beaconAngle = elapsedTime * 0.8;
        lighthouseBeaconRef.current.target.position.x = lighthouse.group.position.x + Math.sin(beaconAngle) * 90;
        lighthouseBeaconRef.current.target.position.z = lighthouse.group.position.z + Math.cos(beaconAngle) * 90;
      }

      // Smooth Elevated Metro Train Transit
      if (metroTrainRef.current) {
        const trainOffset = ((elapsedTime * 28) % 700) - 350;
        const tx = 26 + 1.2 * Math.cos(annaSalaiAngle) + trainOffset * Math.sin(annaSalaiAngle);
        const tz = 0 - 1.2 * Math.sin(annaSalaiAngle) + trainOffset * Math.cos(annaSalaiAngle);
        metroTrainRef.current.position.set(tx, 18.7, tz);
      }

      // Incident Ground Hazard Pulse & Amber Flare Flicker
      if (pulseReticleRef.current) {
        pulseReticleRef.current.scale.setScalar(1 + (Math.sin(elapsedTime * 4) + 1) * 0.16);
      }
      incidentAmberLightsRef.current.forEach((flare, idx) => {
        flare.intensity = 2.5 + Math.sin(elapsedTime * 8 + idx * 2) * 1.5;
      });

      // SCATS Signal & VMS Board Updates
      if (trafficSignalsRef.current.length > 0) {
        trafficSignalsRef.current.forEach((bulb) => {
          if (bulb.material instanceof THREE.MeshBasicMaterial) {
            bulb.material.color.setHex(traffic.greenCorridorActive ? 0x10b981 : 0xf59e0b);
          }
        });
      }
      if (vmsBoardsRef.current.length > 0) {
        vmsBoardsRef.current.forEach((vms) => {
          if (vms.material instanceof THREE.MeshBasicMaterial) {
            vms.material.color.setHex(traffic.greenCorridorActive ? 0x059669 : 0xd97706);
          }
        });
      }

      // Animate Ambient Traffic Fleet
      civilianVehiclesRef.current.forEach((civ) => {
        civ.mesh.position.x += civ.speed * civ.dir;
        if (civ.mesh.position.x > 260) civ.mesh.position.x = -260;
        if (civ.mesh.position.x < -260) civ.mesh.position.x = 260;
      });

      // Smooth Dynamic Camera Tracking
      const currentTarget = controls.target.clone();

      if (cameraModeRef.current === 'AMBULANCE' && ambulanceMeshRef.current) {
        const ambP = ambulanceMeshRef.current.position;
        controls.target.lerp(ambP, 0.08);
      } else if (cameraModeRef.current === 'POLICE' && policeMeshRef.current) {
        const polP = policeMeshRef.current.position;
        controls.target.lerp(polP, 0.08);
      } else if (cameraModeRef.current === 'TRAFFIC' && trafficMeshRef.current) {
        const trfP = trafficMeshRef.current.position;
        controls.target.lerp(trfP, 0.08);
      } else if (cameraModeRef.current === 'INCIDENT' && incidentGroupRef.current) {
        const incP = incidentGroupRef.current.position;
        controls.target.lerp(incP, 0.08);
      }

      // True follow-cam: move the camera by the same delta so it doesn't get left behind
      if (['AMBULANCE', 'POLICE', 'TRAFFIC', 'INCIDENT'].includes(cameraModeRef.current)) {
        const deltaTarget = controls.target.clone().sub(currentTarget);
        camera.position.add(deltaTarget);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 400);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Ambulance Position & Route
  useEffect(() => {
    if (!sceneRef.current || !ambulanceMeshRef.current) return;
    const [ax, az] = gpsTo3D(ambulance.latitude, ambulance.longitude);
    const mesh = ambulanceMeshRef.current;

    const dx = ax - prevAmbPos.current[0];
    const dz = az - prevAmbPos.current[1];
    if (Math.hypot(dx, dz) > 0.01) {
      mesh.rotation.y = Math.atan2(dx, dz);
    }
    prevAmbPos.current = [ax, az];
    mesh.position.set(ax, 0, az);

    if (ambulanceRouteLineRef.current) {
      sceneRef.current.remove(ambulanceRouteLineRef.current);
    }

    if (ambulance.route && ambulance.route.length > 1) {
      const points = ambulance.route.map(([lat, lng]) => {
        const [x, z] = gpsTo3D(lat, lng);
        return new THREE.Vector3(x, 0.6, z);
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: traffic.greenCorridorActive ? 0x10b981 : 0x38bdf8,
          linewidth: 4,
        })
      );
      sceneRef.current.add(line);
      ambulanceRouteLineRef.current = line;
    }
  }, [ambulance.latitude, ambulance.longitude, ambulance.route, traffic.greenCorridorActive]);

  // Update Police Position & Route
  useEffect(() => {
    if (!sceneRef.current || !policeMeshRef.current) return;
    const [px, pz] = gpsTo3D(police.latitude, police.longitude);
    const mesh = policeMeshRef.current;

    const dx = px - prevPolPos.current[0];
    const dz = pz - prevPolPos.current[1];
    if (Math.hypot(dx, dz) > 0.01) {
      mesh.rotation.y = Math.atan2(dx, dz);
    }
    prevPolPos.current = [px, pz];
    mesh.position.set(px, 0, pz);

    if (policeRouteLineRef.current) {
      sceneRef.current.remove(policeRouteLineRef.current);
    }

    if (police.route && police.route.length > 1) {
      const points = police.route.map(([lat, lng]) => {
        const [x, z] = gpsTo3D(lat, lng);
        return new THREE.Vector3(x, 0.6, z);
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x818cf8, linewidth: 3 }));
      sceneRef.current.add(line);
      policeRouteLineRef.current = line;
    }
  }, [police.latitude, police.longitude, police.route]);

  // Update Traffic Agent Position & Corridor Route
  useEffect(() => {
    if (!sceneRef.current || !trafficMeshRef.current) return;
    const [tx, tz] = gpsTo3D(traffic.latitude, traffic.longitude);
    const mesh = trafficMeshRef.current;

    const dx = tx - prevTrfPos.current[0];
    const dz = tz - prevTrfPos.current[1];
    if (Math.hypot(dx, dz) > 0.01) {
      mesh.rotation.y = Math.atan2(dx, dz);
    }
    prevTrfPos.current = [tx, tz];
    mesh.position.set(tx, 0, tz);

    if (trafficRouteLineRef.current) {
      sceneRef.current.remove(trafficRouteLineRef.current);
    }

    if (traffic.route && traffic.route.length > 1) {
      const points = traffic.route.map(([lat, lng]) => {
        const [x, z] = gpsTo3D(lat, lng);
        return new THREE.Vector3(x, 0.55, z);
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3.5 })
      );
      sceneRef.current.add(line);
      trafficRouteLineRef.current = line;
    }
  }, [traffic.latitude, traffic.longitude, traffic.route]);

  // Update Incident Scene Position (Accurate on highway/intersection, not inside hospital)
  useEffect(() => {
    if (!incidentGroupRef.current) return;
    if (activeIncident) {
      const [ix, iz] = gpsTo3D(activeIncident.latitude, activeIncident.longitude);
      incidentGroupRef.current.position.set(ix, 0, iz);
      incidentGroupRef.current.visible = true;
    } else {
      incidentGroupRef.current.visible = false;
    }
  }, [activeIncident]);

  // Camera presets focused on active emergency agents and simulation
  const setCameraPreset = (
    preset: 'TACTICAL' | 'TOP_DOWN' | 'AMBULANCE' | 'POLICE' | 'TRAFFIC' | 'INCIDENT' | 'HOSPITAL' | 'APOLLO' | 'CENTRAL' | 'LIC' | 'MARINA' | 'CHEPAUK' | 'VALLUVAR' | 'EXPRESS_MALL' | 'METRO'
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    if (preset === 'TACTICAL') {
      setCameraMode('FREE');
      camera.position.set(0, 160, 180);
      controls.target.set(0, 0, 0);
      controls.update();
    } else if (preset === 'TOP_DOWN') {
      setCameraMode('FREE');
      camera.position.set(0, 290, 0.1);
      controls.target.set(0, 0, 0);
      controls.update();
    } else if (preset === 'AMBULANCE') {
      setCameraMode('AMBULANCE');
      if (ambulanceMeshRef.current) {
        const p = ambulanceMeshRef.current.position;
        camera.position.set(p.x + 28, 28, p.z + 32);
        controls.target.copy(p);
        controls.update();
      }
    } else if (preset === 'POLICE') {
      setCameraMode('POLICE');
      if (policeMeshRef.current) {
        const p = policeMeshRef.current.position;
        camera.position.set(p.x + 28, 28, p.z + 32);
        controls.target.copy(p);
        controls.update();
      }
    } else if (preset === 'TRAFFIC') {
      setCameraMode('TRAFFIC');
      if (trafficMeshRef.current) {
        const p = trafficMeshRef.current.position;
        camera.position.set(p.x + 24, 24, p.z + 28);
        controls.target.copy(p);
        controls.update();
      }
    } else if (preset === 'INCIDENT') {
      setCameraMode('INCIDENT');
      if (incidentGroupRef.current) {
        const p = incidentGroupRef.current.position;
        camera.position.set(p.x + 24, 24, p.z + 28);
        controls.target.copy(p);
        controls.update();
      }
    } else if (preset === 'HOSPITAL' || preset === 'APOLLO') {
      setCameraMode('APOLLO');
      const targetHosp = hospital.selectedHospital || INITIAL_HOSPITALS[0];
      const [hx, hz] = gpsTo3D(targetHosp.latitude, targetHosp.longitude);
      camera.position.set(hx + 35, 35, hz + 45);
      controls.target.set(hx, 10, hz);
      controls.update();
    } else if (preset === 'CENTRAL') {
      setCameraMode('CENTRAL');
      const [cx, cz] = gpsTo3D(13.0827, 80.2707);
      camera.position.set(cx + 45, 45, cz + 60);
      controls.target.set(cx, 12, cz);
      controls.update();
    } else if (preset === 'LIC') {
      setCameraMode('LIC');
      const [lx, lz] = gpsTo3D(13.0635, 80.2642);
      camera.position.set(lx + 40, 40, lz + 50);
      controls.target.set(lx, 18, lz);
      controls.update();
    } else if (preset === 'MARINA') {
      setCameraMode('MARINA');
      const [mx, mz] = gpsTo3D(13.0398, 80.2785);
      camera.position.set(mx + 45, 42, mz + 55);
      controls.target.set(mx, 15, mz);
      controls.update();
    } else if (preset === 'CHEPAUK') {
      setCameraMode('CHEPAUK');
      const [sx, sz] = gpsTo3D(13.0628, 80.2795);
      camera.position.set(sx + 50, 48, sz + 65);
      controls.target.set(sx, 12, sz);
      controls.update();
    } else if (preset === 'VALLUVAR') {
      setCameraMode('VALLUVAR');
      const [vx, vz] = gpsTo3D(13.0536, 80.2415);
      camera.position.set(vx + 42, 38, vz + 52);
      controls.target.set(vx, 10, vz);
      controls.update();
    } else if (preset === 'EXPRESS_MALL') {
      setCameraMode('EXPRESS_MALL');
      const [ex, ez] = gpsTo3D(13.0587, 80.2642);
      camera.position.set(ex + 45, 40, ez + 55);
      controls.target.set(ex, 12, ez);
      controls.update();
    } else if (preset === 'METRO') {
      setCameraMode('METRO');
      camera.position.set(65, 38, -15);
      controls.target.set(26, 18, -40);
      controls.update();
    }
  };

  const panCamera = (dx: number, dz: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraMode('FREE');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    camera.position.x += dx;
    camera.position.z += dz;
    controls.target.x += dx;
    controls.target.z += dz;
    controls.update();
  };

  const rotateCamera = (angleDelta: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraMode('FREE');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const radius = Math.hypot(offset.x, offset.z);
    const currentAngle = Math.atan2(offset.x, offset.z);
    const newAngle = currentAngle + angleDelta;
    camera.position.x = controls.target.x + radius * Math.sin(newAngle);
    camera.position.z = controls.target.z + radius * Math.cos(newAngle);
    controls.update();
  };

  const tiltCamera = (deltaY: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraMode('FREE');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    camera.position.y = Math.max(15, Math.min(420, camera.position.y + deltaY));
    controls.update();
  };

  const zoomCamera = (factor: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraMode('FREE');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    offset.multiplyScalar(factor);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  };

  return (
    <div className="relative w-full h-full min-h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        id="tactical-3d-canvas-mount"
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing touch-none"
        style={{ minHeight: '520px', width: '100%', height: '100%' }}
      />

      {/* Top Floating Header & Presets */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-auto">
          <button
            type="button"
            id="switch-2d-btn"
            onClick={onSwitchTo2D}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            2D Streets
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-red-600 text-white shadow-lg shadow-red-900/50 cursor-pointer"
          >
            3D Digital Twin
          </button>
        </div>

        {/* Camera Tracking Presets & Active Units */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-auto max-w-2xl overflow-x-auto">
          <button
            type="button"
            id="preset-tactical-btn"
            onClick={() => setCameraPreset('TACTICAL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              cameraMode === 'FREE' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            id="preset-ambulance-btn"
            onClick={() => setCameraPreset('AMBULANCE')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              cameraMode === 'AMBULANCE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <AmbulanceIcon className="w-3.5 h-3.5 text-emerald-400" />
            Ambulance #108
          </button>
          <button
            type="button"
            id="preset-police-btn"
            onClick={() => setCameraPreset('POLICE')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              cameraMode === 'POLICE' ? 'bg-blue-950 text-blue-300 border border-blue-700' : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Police Unit
          </button>
          <button
            type="button"
            id="preset-traffic-btn"
            onClick={() => setCameraPreset('TRAFFIC')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              cameraMode === 'TRAFFIC' ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Traffic Agent (TR-07)
          </button>
          {activeIncident && (
            <button
              type="button"
              id="preset-incident-btn"
              onClick={() => setCameraPreset('INCIDENT')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                cameraMode === 'INCIDENT' ? 'bg-red-950 text-red-300 border border-red-700' : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Crash Site
            </button>
          )}
          <button
            type="button"
            id="preset-hospital-btn"
            onClick={() => setCameraPreset('HOSPITAL')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              cameraMode === 'APOLLO' ? 'bg-teal-950 text-teal-300 border border-teal-700' : 'text-slate-400 hover:text-teal-400'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-teal-400" />
            Hospital
          </button>
        </div>
      </div>

      {/* Floating 3D Live Digital Twin Telemetry Card (Top Left) */}
      <div className="absolute top-16 left-4 z-20 pointer-events-auto flex flex-col gap-2 max-w-xs">
        <div className="bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl text-xs font-mono space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-200 font-bold tracking-wide">CHENNAI 3D TWIN</span>
            </div>
            <span className="text-[10px] text-cyan-400 uppercase font-semibold">Live Highway Model</span>
          </div>

          {/* Vehicle Telemetry */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[9px] uppercase">🚑 ALS 108 Status</div>
              <div className="text-emerald-300 font-bold text-xs truncate">
                {ambulance.eta ? formatEta(ambulance.eta) : ambulance.status.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[9px] uppercase">🚓 Police ETA</div>
              <div className="text-blue-300 font-bold text-sm">
                {police.eta ? formatEta(police.eta) : 'En Route'}
              </div>
            </div>
          </div>

          {/* Green Wave Status */}
          <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${traffic.greenCorridorActive ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="text-[10px] text-slate-300">SCATS Green Wave</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              traffic.greenCorridorActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-amber-950 text-amber-400 border border-amber-700'
            }`}>
              {traffic.greenCorridorActive ? 'ACTIVE LOCK' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating 3D Gesture Controls Hint */}
      <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-cyan-300 shadow-xl flex items-center gap-2">
          <span>🖱️ Left-Click: Orbit • Scroll: Zoom • Right-Click: Pan</span>
        </div>
      </div>

      {/* Interactive On-Screen Camera D-Pad & Adjustment Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-auto flex flex-col items-center gap-2">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            View Adjuster
          </div>

          {/* Directional Pan D-Pad */}
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              type="button"
              id="cam-pan-up"
              title="Pan North / Forward"
              onClick={() => panCamera(0, -20)}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-900"
            >
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            </button>
            <div />

            <button
              type="button"
              id="cam-pan-left"
              title="Pan West / Left"
              onClick={() => panCamera(-20, 0)}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-900"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              type="button"
              id="cam-recenter"
              title="Reset View to Center"
              onClick={() => setCameraPreset('TACTICAL')}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/50 flex items-center justify-center cursor-pointer transition-colors"
            >
              <Crosshair className="w-4 h-4 text-cyan-300" />
            </button>
            <button
              type="button"
              id="cam-pan-right"
              title="Pan East / Right"
              onClick={() => panCamera(20, 0)}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-900"
            >
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>

            <div />
            <button
              type="button"
              id="cam-pan-down"
              title="Pan South / Backward"
              onClick={() => panCamera(0, 20)}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-colors active:bg-cyan-900"
            >
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            </button>
            <div />
          </div>

          {/* Rotate, Tilt & Zoom Action Rows */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 w-full justify-between">
            <button
              type="button"
              id="cam-rotate-left"
              title="Rotate Camera Left"
              onClick={() => rotateCamera(0.25)}
              className="w-8 h-7 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            </button>
            <button
              type="button"
              id="cam-tilt-up"
              title="Tilt Camera Up (Higher Angle)"
              onClick={() => tiltCamera(20)}
              className="px-1.5 h-7 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center cursor-pointer text-[10px] font-mono"
            >
              Tilt ▲
            </button>
            <button
              type="button"
              id="cam-tilt-down"
              title="Tilt Camera Down (Lower Angle)"
              onClick={() => tiltCamera(-20)}
              className="px-1.5 h-7 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center cursor-pointer text-[10px] font-mono"
            >
              Tilt ▼
            </button>
            <button
              type="button"
              id="cam-rotate-right"
              title="Rotate Camera Right"
              onClick={() => rotateCamera(-0.25)}
              className="w-8 h-7 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center cursor-pointer text-xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 w-full justify-between">
            <button
              type="button"
              id="cam-zoom-in"
              title="Zoom In"
              onClick={() => zoomCamera(0.8)}
              className="flex-1 h-7 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold border border-slate-700 flex items-center justify-center cursor-pointer text-sm"
            >
              <ZoomIn className="w-3.5 h-3.5 mr-1" />+
            </button>
            <button
              type="button"
              id="cam-zoom-out"
              title="Zoom Out"
              onClick={() => zoomCamera(1.25)}
              className="flex-1 h-7 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold border border-slate-700 flex items-center justify-center cursor-pointer text-sm"
            >
              <ZoomOut className="w-3.5 h-3.5 mr-1" />-
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
