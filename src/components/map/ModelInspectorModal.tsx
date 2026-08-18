import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  X,
  RotateCw,
  Sun,
  Eye,
  Sliders,
  Sparkles,
  Shield,
  Ambulance,
  Zap,
  Building,
  Radio,
  Compass,
  Cpu,
} from 'lucide-react';
import {
  buildHighFidelityAmbulance,
  buildHighFidelityPolice,
  buildHighFidelityTrafficInterceptor,
  buildRealisticAutoRickshaw,
  buildRealisticMTCBus,
  buildChennaiMetroTrain,
  buildRealisticHospitalComplex,
  buildRiponBuildingCentralClockTower,
  buildLICBuilding,
} from './tactical3dModels';

export type InspectableModelId =
  | 'AMBULANCE_108'
  | 'POLICE_INTERCEPTOR'
  | 'TRAFFIC_AGENT'
  | 'AUTO_RICKSHAW'
  | 'MTC_BUS'
  | 'METRO_TRAIN'
  | 'APOLLO_HOSPITAL'
  | 'RIPON_CLOCK_TOWER'
  | 'LIC_TOWER';

interface ModelInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModelId?: InspectableModelId;
}

interface ModelMeta {
  id: InspectableModelId;
  name: string;
  category: 'EMERGENCY_VEHICLE' | 'TRANSIT' | 'INFRASTRUCTURE';
  icon: any;
  tag: string;
  specs: {
    unitId: string;
    engineOrType: string;
    capacityOrBeds: string;
    aiRole: string;
    telemetry: string;
  };
  description: string;
}

const MODEL_CATALOG: ModelMeta[] = [
  {
    id: 'AMBULANCE_108',
    name: '108 ALS Emergency Ambulance',
    category: 'EMERGENCY_VEHICLE',
    icon: Ambulance,
    tag: 'Priority 1 Swarm Agent',
    specs: {
      unitId: 'TN-01-EM-108 (AM-15)',
      engineOrType: 'Mercedes/Force Traveller ALS 2.6L CRDi',
      capacityOrBeds: '1 Critical Care Stretcher + 2 Paramedics',
      aiRole: 'Primary Patient Transit & Triage Coordinator',
      telemetry: 'Real-time GPS 10Hz, Pulse O2, Defib sync',
    },
    description:
      'High-roof Advanced Life Support mobile unit equipped with high-vis Battenburg reflective livery, aerodynamic dual-siren lightbar, multi-parameter patient monitor, and autonomous green corridor signal preemption transponder.',
  },
  {
    id: 'POLICE_INTERCEPTOR',
    name: 'Police Highway Pursuit Interceptor',
    category: 'EMERGENCY_VEHICLE',
    icon: Shield,
    tag: 'Perimeter Clearance Unit',
    specs: {
      unitId: 'TN-01-G-0100 (PD-28)',
      engineOrType: 'Mahindra Scorpio-N 2.2L mHawk 4x4',
      capacityOrBeds: '4 Tactical Officers + Command Radio',
      aiRole: 'Accident Scene Isolation & Crowd Control',
      telemetry: 'ANPR High-Res Cameras, DSRC Mesh Transceiver',
    },
    description:
      'Heavy-duty highway patrol cruiser fitted with reinforced push-bumper, roof strobe bar, 360-degree spotlight array, and automatic vehicle routing integration for high-speed crash site containment.',
  },
  {
    id: 'TRAFFIC_AGENT',
    name: 'Traffic Agent TR-07 Interceptor',
    category: 'EMERGENCY_VEHICLE',
    icon: Zap,
    tag: 'Corridor Optimization Unit',
    specs: {
      unitId: 'TN-02-TR-07 (TRF-01)',
      engineOrType: 'Tata Safari Cyber-Patrol EV Platform',
      capacityOrBeds: '2 Traffic Tech Specialists',
      aiRole: 'SCATS Adaptive Signal Preemption & Lane Clearing',
      telemetry: 'Microwave Radar, Dynamic VMS Broadcast Node',
    },
    description:
      'Autonomous intelligent traffic management vehicle equipped with directional radio transmitter capable of synchronizing city-wide SCATS traffic signals to hold green waves along emergency routes.',
  },
  {
    id: 'AUTO_RICKSHAW',
    name: 'Chennai Bajaj RE Auto Rickshaw',
    category: 'TRANSIT',
    icon: Radio,
    tag: 'City Civilian Traffic Flow',
    specs: {
      unitId: 'TN-09-AR-4821',
      engineOrType: '236cc 4-Stroke CNG / Petrol',
      capacityOrBeds: '3 Passengers + 1 Driver',
      aiRole: 'Dynamic Civilian Obstacle Agent',
      telemetry: 'Passive GPS Swarm Tracking Node',
    },
    description:
      'Classic 3-wheeled urban commuter with yellow and black canopy, single front suspension fork, and realistic maneuverability modeling for dense street simulation.',
  },
  {
    id: 'MTC_BUS',
    name: 'MTC Express Transit Bus',
    category: 'TRANSIT',
    icon: Compass,
    tag: 'Public Mass Transit Agent',
    specs: {
      unitId: 'MTC-21G (Ashok Leyland Viking)',
      engineOrType: 'H-Series 6-Cylinder Diesel BS6',
      capacityOrBeds: '55 Passengers',
      aiRole: 'Heavy Traffic Congestion Element',
      telemetry: 'MTC Central Telematics & Route Beacon',
    },
    description:
      'Metropolitan Transport Corporation city bus featuring realistic green-white livery, electronic LED route display board, panoramic windshield, and multi-axle passenger load simulation.',
  },
  {
    id: 'METRO_TRAIN',
    name: 'Chennai Metro Rail Aerodynamic Train',
    category: 'TRANSIT',
    icon: Cpu,
    tag: 'Rapid Elevated Transit',
    specs: {
      unitId: 'CMRL Blue Line Trainset #04',
      engineOrType: 'Electric Multiple Unit (25kV AC Catenary)',
      capacityOrBeds: '4-Car Aerodynamic Consist (1200 Pax)',
      aiRole: 'Continuous Transit Corridor Baseline',
      telemetry: 'CBTC Automatic Train Operation (ATO)',
    },
    description:
      'Modern stainless-steel streamlined train with blue livery, roof pantographs, interior cabin illumination, and full elevated concrete viaduct track infrastructure.',
  },
  {
    id: 'APOLLO_HOSPITAL',
    name: 'Apollo Hospital Emergency Complex',
    category: 'INFRASTRUCTURE',
    icon: Building,
    tag: 'Destination Medical Center',
    specs: {
      unitId: 'APOLLO-GREAMS-01',
      engineOrType: 'Level 1 Trauma & Super Specialty Care',
      capacityOrBeds: '560 Total Beds • 45 ICU Ready',
      aiRole: 'Dynamic Hospital Triage & Bed Allocation',
      telemetry: 'HL7 / FHIR Real-Time ER Capacity Feed',
    },
    description:
      '3D architectural model of the Apollo Greams Road trauma facility with illuminated red emergency entrance, dual ambulance receiving bays, triage wing, and rooftop helipad with landing beacons.',
  },
  {
    id: 'RIPON_CLOCK_TOWER',
    name: 'Ripon Building & Central Clock Tower',
    category: 'INFRASTRUCTURE',
    icon: Building,
    tag: 'Chennai Heritage Landmark',
    specs: {
      unitId: 'CHENNAI-CORP-HQ',
      engineOrType: 'Neo-Classical & Indo-Saracenic Architecture',
      capacityOrBeds: 'City Command & Civic Administration',
      aiRole: 'Urban Visual Spatial Anchor',
      telemetry: 'Municipal Optical Fiber Node #01',
    },
    description:
      'Detailed heritage model showcasing white all-plaster facade, 3-tier neo-classical clock tower with working dial, ionic columns, and classical arched arcade.',
  },
  {
    id: 'LIC_TOWER',
    name: 'LIC Building (Anna Salai)',
    category: 'INFRASTRUCTURE',
    icon: Building,
    tag: 'High-Rise Architectural Landmark',
    specs: {
      unitId: 'LIC-MOUNT-ROAD',
      engineOrType: '15-Storey Brutalist Skyscraper (54m)',
      capacityOrBeds: 'Commercial & Financial Hub',
      aiRole: 'Central Corridor Waypoint',
      telemetry: 'Corridor Microwave Relay Tower',
    },
    description:
      'Historic 15-story Mount Road landmark featuring horizontal brise-soleil sunshades, glowing office windows, rooftop radio masts, and illuminated gold crest.',
  },
];

export const ModelInspectorModal: React.FC<ModelInspectorModalProps> = ({
  isOpen,
  onClose,
  initialModelId = 'AMBULANCE_108',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<InspectableModelId>(initialModelId);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [sirensActive, setSirensActive] = useState<boolean>(true);
  const [lightPreset, setLightPreset] = useState<'STUDIO' | 'SUNLIGHT' | 'NIGHT_NEON'>('STUDIO');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Dynamic lights ref
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sirenLightRef = useRef<THREE.PointLight | null>(null);

  const activeMeta = MODEL_CATALOG.find((m) => m.id === selectedId) || MODEL_CATALOG[0];

  useEffect(() => {
    setSelectedId(initialModelId);
  }, [initialModelId]);

  // Initialize Three.js Studio Scene
  useEffect(() => {
    if (!isOpen) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(16, 12, 18);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 120;
    controls.minDistance = 3;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // Grid Floor Pedestal
    const grid = new THREE.GridHelper(40, 40, 0x0ea5e9, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Glowing Circular Turntable Base
    const discGeo = new THREE.CylinderGeometry(14, 14, 0.4, 64);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x090e17,
      roughness: 0.2,
      metalness: 0.8,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.2;
    disc.receiveShadow = true;
    scene.add(disc);

    const ringGeo = new THREE.RingGeometry(13.5, 13.9, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // Studio Lighting Array
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(15, 25, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    fillLight.position.set(-15, 15, -15);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 2.5);
    rimLight.position.set(0, 20, -20);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Siren Pulse Point Light
    const sirenLight = new THREE.PointLight(0xef4444, 4.0, 25);
    sirenLight.position.set(0, 4.5, 0);
    scene.add(sirenLight);
    sirenLightRef.current = sirenLight;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }

      // Pulse siren lights if vehicle
      if (sirenLightRef.current && sirensActive) {
        const isRed = Math.floor(elapsed * 6) % 2 === 0;
        sirenLightRef.current.color.setHex(isRed ? 0xef4444 : 0x3b82f6);
        sirenLightRef.current.intensity = 3.5 + Math.sin(elapsed * 12) * 1.5;
      } else if (sirenLightRef.current) {
        sirenLightRef.current.intensity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, [isOpen, autoRotate, sirensActive]);

  // Load Model when selectedId changes
  useEffect(() => {
    if (!sceneRef.current || !isOpen) return;
    const scene = sceneRef.current;

    // Remove existing model
    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current = null;
    }

    let group = new THREE.Group();
    let targetCameraDist = 18;
    let targetHeight = 1.5;

    switch (selectedId) {
      case 'AMBULANCE_108': {
        const amb = buildHighFidelityAmbulance();
        group.add(amb.group);
        targetCameraDist = 16;
        targetHeight = 2.0;
        break;
      }
      case 'POLICE_INTERCEPTOR': {
        const pol = buildHighFidelityPolice();
        group.add(pol.group);
        targetCameraDist = 15;
        targetHeight = 1.6;
        break;
      }
      case 'TRAFFIC_AGENT': {
        const trf = buildHighFidelityTrafficInterceptor();
        group.add(trf.group);
        targetCameraDist = 15;
        targetHeight = 1.6;
        break;
      }
      case 'AUTO_RICKSHAW': {
        const auto = buildRealisticAutoRickshaw();
        group.add(auto);
        targetCameraDist = 10;
        targetHeight = 1.2;
        break;
      }
      case 'MTC_BUS': {
        const bus = buildRealisticMTCBus();
        group.add(bus);
        targetCameraDist = 24;
        targetHeight = 2.4;
        break;
      }
      case 'METRO_TRAIN': {
        const train = buildChennaiMetroTrain();
        group.add(train);
        targetCameraDist = 32;
        targetHeight = 3.0;
        break;
      }
      case 'APOLLO_HOSPITAL': {
        const hosp = buildRealisticHospitalComplex('Apollo Main Hospital', true);
        hosp.scale.set(0.65, 0.65, 0.65);
        group.add(hosp);
        targetCameraDist = 48;
        targetHeight = 12.0;
        break;
      }
      case 'RIPON_CLOCK_TOWER': {
        const ripon = buildRiponBuildingCentralClockTower();
        ripon.scale.set(0.6, 0.6, 0.6);
        group.add(ripon);
        targetCameraDist = 44;
        targetHeight = 14.0;
        break;
      }
      case 'LIC_TOWER': {
        const lic = buildLICBuilding();
        lic.scale.set(0.55, 0.55, 0.55);
        group.add(lic);
        targetCameraDist = 55;
        targetHeight = 18.0;
        break;
      }
    }

    // Apply wireframe toggle
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => (m.wireframe = wireframeMode));
        } else {
          child.material.wireframe = wireframeMode;
        }
      }
    });

    scene.add(group);
    currentModelGroupRef.current = group;

    // Reposition camera smoothly
    if (cameraRef.current && controlsRef.current) {
      controlsRef.current.target.set(0, targetHeight, 0);
      cameraRef.current.position.set(targetCameraDist, targetCameraDist * 0.7, targetCameraDist * 1.1);
      controlsRef.current.update();
    }
  }, [selectedId, isOpen, wireframeMode]);

  // Handle Lighting preset changes
  useEffect(() => {
    if (!keyLightRef.current || !fillLightRef.current || !rimLightRef.current || !sceneRef.current) return;
    const scene = sceneRef.current;

    if (lightPreset === 'STUDIO') {
      scene.background = new THREE.Color(0x050b14);
      keyLightRef.current.color.setHex(0xffffff);
      keyLightRef.current.intensity = 2.2;
      fillLightRef.current.color.setHex(0x93c5fd);
      fillLightRef.current.intensity = 1.0;
      rimLightRef.current.color.setHex(0x06b6d4);
    } else if (lightPreset === 'SUNLIGHT') {
      scene.background = new THREE.Color(0x0284c7);
      keyLightRef.current.color.setHex(0xfffae6);
      keyLightRef.current.intensity = 3.0;
      fillLightRef.current.color.setHex(0xbae6fd);
      fillLightRef.current.intensity = 1.4;
      rimLightRef.current.color.setHex(0xfbbf24);
    } else if (lightPreset === 'NIGHT_NEON') {
      scene.background = new THREE.Color(0x020617);
      keyLightRef.current.color.setHex(0x38bdf8);
      keyLightRef.current.intensity = 1.2;
      fillLightRef.current.color.setHex(0xa855f7);
      fillLightRef.current.intensity = 1.5;
      rimLightRef.current.color.setHex(0xec4899);
    }
  }, [lightPreset]);

  if (!isOpen) return null;

  return (
    <div
      id="model-inspector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Real-World 3D Digital Twin Model Inspector
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded-full font-semibold">
                  PBR Studio 60FPS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive real-world Three.js geometric models, mechanical specifications & PBR materials.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-3d-inspector-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Selection Tabs Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 overflow-x-auto">
          {MODEL_CATALOG.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                id={`inspect-tab-${item.id}`}
                onClick={() => setSelectedId(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content (3D Canvas + Specs Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-hidden min-h-[440px]">
          {/* 3D WebGL Studio Canvas Viewport */}
          <div className="lg:col-span-8 relative bg-slate-950 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
            <div
              ref={mountRef}
              id="model-turntable-canvas"
              className="w-full h-full min-h-[380px] cursor-grab active:cursor-grabbing"
              style={{ width: '100%', height: '100%' }}
            />

            {/* Viewport Floating Controls (Top Left & Bottom Left) */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                id="toggle-turntable-spin"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                  autoRotate
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>Auto-Spin: {autoRotate ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                id="toggle-wireframe-mode"
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                  wireframeMode
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Wireframe: {wireframeMode ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                id="toggle-siren-strobes"
                onClick={() => setSirensActive(!sirensActive)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                  sirensActive
                    ? 'bg-red-950 text-red-300 border-red-600'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Sirens: {sirensActive ? 'PULSE' : 'OFF'}</span>
              </button>
            </div>

            {/* Lighting Preset Selector (Bottom Left) */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto">
              <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                Light:
              </span>
              <button
                type="button"
                onClick={() => setLightPreset('STUDIO')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  lightPreset === 'STUDIO' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Studio
              </button>
              <button
                type="button"
                onClick={() => setLightPreset('SUNLIGHT')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  lightPreset === 'SUNLIGHT' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sunlight
              </button>
              <button
                type="button"
                onClick={() => setLightPreset('NIGHT_NEON')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  lightPreset === 'NIGHT_NEON' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Neon Night
              </button>
            </div>

            {/* Hint tag */}
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800 pointer-events-none">
              Left Click: Rotate • Right Click: Pan • Scroll: Zoom
            </div>
          </div>

          {/* Right Sidebar: Mechanical & Technical Specs */}
          <div className="lg:col-span-4 p-5 bg-slate-900/40 flex flex-col gap-4 overflow-y-auto max-h-[460px]">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                  {activeMeta.tag}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {activeMeta.specs.unitId}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1.5">{activeMeta.name}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeMeta.description}</p>
            </div>

            {/* Specs Table */}
            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Technical & Agent Telematics
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Chassis / Architecture:</span>
                  <span className="text-slate-100 font-semibold">{activeMeta.specs.engineOrType}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Capacity / Payload:</span>
                  <span className="text-slate-100 font-semibold">{activeMeta.specs.capacityOrBeds}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">URSAI Swarm Role:</span>
                  <span className="text-cyan-300 font-semibold">{activeMeta.specs.aiRole}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Active Sensor Telemetry:</span>
                  <span className="text-emerald-300 font-semibold">{activeMeta.specs.telemetry}</span>
                </div>
              </div>
            </div>

            {/* Real-World 3D Features List */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Model Rendering Features:</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Physically-Based Rendering (PBR) Metallic & Roughness map</li>
                <li>Dynamic multi-strobe emergency LED flashers & spotlight beams</li>
                <li>True real-world scaling aligned with OSRM GPS coordinates</li>
                <li>Procedural contact ambient occlusion and shadows</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
