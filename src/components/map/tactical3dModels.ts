import * as THREE from 'three';

// ---------------------------------------------------------------------------
// PBR MATERIAL PALETTE FOR SOPHISTICATED URBAN DIGITAL TWIN
// ---------------------------------------------------------------------------
export const MATERIALS = {
  // Vehicle Body Paints (Now highly realistic with clearcoat reflections)
  ambulanceWhite: new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: 0.1,
    metalness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  }),
  policeBlack: new THREE.MeshPhysicalMaterial({
    color: 0x050505,
    roughness: 0.15,
    metalness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.8,
  }),
  policeWhite: new THREE.MeshPhysicalMaterial({
    color: 0xf1f5f9,
    roughness: 0.15,
    metalness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  }),
  autoYellow: new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24,
    roughness: 0.2,
    metalness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.2,
  }),
  autoBlack: new THREE.MeshPhysicalMaterial({
    color: 0x18181b,
    roughness: 0.25,
    metalness: 0.4,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.0,
  }),
  busGreen: new THREE.MeshPhysicalMaterial({
    color: 0x059669,
    roughness: 0.2,
    metalness: 0.25,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.2,
  }),
  busWhite: new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.0,
  }),

  // Glass & Polycarbonate
  tintedGlass: new THREE.MeshPhysicalMaterial({
    color: 0x020617,
    roughness: 0.0,
    metalness: 0.2,
    transmission: 0.8,
    transparent: true,
    opacity: 0.9,
    envMapIntensity: 2.0,
    ior: 1.5,
  }),
  clearGlass: new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.0,
    metalness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.7,
    envMapIntensity: 2.5,
    ior: 1.5,
  }),
  redLens: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  blueLens: new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
  amberLens: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
  greenLens: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
  headlightWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),

  // High-Vis Emergency Decals & Liveries
  fluoYellow: new THREE.MeshBasicMaterial({ color: 0x84cc16 }),
  trafficYellow: new THREE.MeshPhysicalMaterial({ color: 0xeab308, roughness: 0.15, metalness: 0.4, clearcoat: 0.9, clearcoatRoughness: 0.1, envMapIntensity: 1.5 }),
  trafficCyan: new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, roughness: 0.15, metalness: 0.4, clearcoat: 0.9, clearcoatRoughness: 0.1, envMapIntensity: 1.5 }),
  emergencyRed: new THREE.MeshBasicMaterial({ color: 0xdc2626 }),
  goldBadge: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15, envMapIntensity: 2.0 }),

  // Mechanicals & Wheels
  rubberTire: new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95, metalness: 0.05 }),
  alloyRim: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1, envMapIntensity: 1.8 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2, envMapIntensity: 1.5 }),
  chromeMetal: new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 1.0, roughness: 0.02, envMapIntensity: 2.5 }),

  // Roadway & Urban Materials
  asphaltPavement: new THREE.MeshStandardMaterial({
    color: 0x0a101d,
    roughness: 0.65,
    metalness: 0.2,
    envMapIntensity: 0.6, /* Makes the road look slightly wet at night */
  }),
  concreteMedian: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.8,
    metalness: 0.1,
  }),
  laneYellow: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
  laneWhite: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  contactShadow: new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.65,
  }),
};

// ---------------------------------------------------------------------------
// PROCEDURAL CANVAS TEXTURE GENERATORS (FOR REAL-WORLD CITY FIDELITY)
// ---------------------------------------------------------------------------
export function createBuildingWindowTexture(litProbability = 0.45, isNight = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = isNight ? '#0b1329' : '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    const cols = 16;
    const rows = 16;
    const padX = 6;
    const padY = 6;
    const winW = (512 - (cols + 1) * padX) / cols;
    const winH = (512 - (rows + 1) * padY) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padX + c * (winW + padX);
        const y = padY + r * (winH + padY);

        const isLit = Math.random() < litProbability;
        if (isLit) {
          const warm = Math.random() > 0.4;
          ctx.fillStyle = warm ? '#fef08a' : '#38bdf8';
        } else {
          ctx.fillStyle = isNight ? '#020617' : '#334155';
        }
        ctx.fillRect(x, y, winW, winH);

        // Window frame
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, winW, winH);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createHelipadCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Dark tarmac square
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // Red outer border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 16;
    ctx.strokeRect(20, 20, 472, 472);

    // Yellow circle ring
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(256, 256, 180, 0, Math.PI * 2);
    ctx.stroke();

    // White bold 'H'
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 220px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', 256, 260);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Create soft contact shadow plane beneath vehicle
function createContactShadow(width: number, length: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(width, length);
  const mesh = new THREE.Mesh(geo, MATERIALS.contactShadow);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.04;
  return mesh;
}

// ---------------------------------------------------------------------------
// 1. HIGH-FIDELITY 108 ADVANCED LIFE SUPPORT (ALS) AMBULANCE
// ---------------------------------------------------------------------------
export function buildHighFidelityAmbulance(): {
  group: THREE.Group;
  sirenLight: THREE.PointLight;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
  strobeRods: THREE.Mesh[];
} {
  const group = new THREE.Group();

  // Contact Shadow
  group.add(createContactShadow(4.2, 8.8));

  // 1. Chassis & Heavy Bumper Frame
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 7.8), MATERIALS.darkSteel);
  chassis.position.y = 0.5;
  chassis.castShadow = true;
  group.add(chassis);

  // Front Heavy Bumper & Lower Grille
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.7, 0.6), MATERIALS.darkSteel);
  frontBumper.position.set(0, 0.6, 3.8);
  const grille = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.1), MATERIALS.chromeMetal);
  grille.position.set(0, 0.7, 4.11);
  group.add(frontBumper, grille);

  // 2. Aerodynamic Driver Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.1, 3.2), MATERIALS.ambulanceWhite);
  cab.position.set(0, 1.6, 2.1);
  cab.castShadow = true;
  group.add(cab);

  // Sloping Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.6, 1.4), MATERIALS.ambulanceWhite);
  hood.position.set(0, 1.25, 3.4);
  hood.rotation.x = 0.18;
  group.add(hood);

  // Curved Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.3, 0.15), MATERIALS.tintedGlass);
  windshield.position.set(0, 2.15, 3.2);
  windshield.rotation.x = -0.32;
  group.add(windshield);

  // Cab Side Windows
  const sideWinL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 1.5), MATERIALS.tintedGlass);
  sideWinL.position.set(1.76, 2.05, 2.1);
  const sideWinR = sideWinL.clone();
  sideWinR.position.x = -1.76;
  group.add(sideWinL, sideWinR);

  // Side Rear-View Mirrors
  const mirrorMat = MATERIALS.darkSteel;
  const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.25), mirrorMat);
  mirrorL.position.set(1.95, 2.0, 3.0);
  const mirrorR = mirrorL.clone();
  mirrorR.position.x = -1.95;
  group.add(mirrorL, mirrorR);

  // 3. Medical Box Body (High-Roof Modular Patient Care Unit)
  const medBox = new THREE.Mesh(new THREE.BoxGeometry(3.7, 2.8, 5.0), MATERIALS.ambulanceWhite);
  medBox.position.set(0, 2.05, -1.6);
  medBox.castShadow = true;
  group.add(medBox);

  // Rooftop AC / Air Filtration Unit
  const acPod = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 2.2), MATERIALS.ambulanceWhite);
  acPod.position.set(0, 3.65, -1.5);
  group.add(acPod);

  // High-Vis Fluorescent Battenburg Checkered Side Decals
  const battenburgL1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 4.9), MATERIALS.fluoYellow);
  battenburgL1.position.set(1.86, 1.6, -1.6);
  const battenburgL2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 4.9), MATERIALS.emergencyRed);
  battenburgL2.position.set(1.86, 1.15, -1.6);
  const battenburgR1 = battenburgL1.clone();
  battenburgR1.position.x = -1.86;
  const battenburgR2 = battenburgL2.clone();
  battenburgR2.position.x = -1.86;
  group.add(battenburgL1, battenburgL2, battenburgR1, battenburgR2);

  // Red Cross / Star of Life Emblems
  const crossH1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 1.4), MATERIALS.emergencyRed);
  crossH1.position.set(1.86, 2.45, -1.6);
  const crossV1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.4), MATERIALS.emergencyRed);
  crossV1.position.set(1.86, 2.45, -1.6);
  const crossH2 = crossH1.clone();
  crossH2.position.x = -1.86;
  const crossV2 = crossV1.clone();
  crossV2.position.x = -1.86;
  group.add(crossH1, crossV1, crossH2, crossV2);

  // Rear Chevron Safety Hazard Markings on Back Doors
  const rearChev1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.05), MATERIALS.emergencyRed);
  rearChev1.position.set(0, 1.5, -4.12);
  const rearChev2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.05), MATERIALS.fluoYellow);
  rearChev2.position.set(0, 2.0, -4.12);
  group.add(rearChev1, rearChev2);

  // 4. Wheels with Rubber Tires & Deep Alloy Rims
  const wheels = [
    [1.88, 0.6, 2.3],
    [-1.88, 0.6, 2.3],
    [1.88, 0.6, -2.2],
    [-1.88, 0.6, -2.2],
    [1.88, 0.6, -3.2], // Dual rear axle for heavy ALS medical gear
    [-1.88, 0.6, -3.2],
  ];

  wheels.forEach(([x, y, z]) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.48, 18), MATERIALS.rubberTire);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    tire.castShadow = true;

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 12), MATERIALS.alloyRim);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.52, 8), MATERIALS.darkSteel);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, y, z);

    group.add(tire, rim, hub);
  });

  // 5. Emergency Rooftop LED Lightbar & Strobes
  const strobeRods: THREE.Mesh[] = [];
  const barMount = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.6), MATERIALS.darkSteel);
  barMount.position.set(0, 3.5, 1.8);
  group.add(barMount);

  const strobeRed = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.5), MATERIALS.redLens);
  strobeRed.position.set(-0.65, 3.75, 1.8);
  const strobeBlue = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.5), MATERIALS.blueLens);
  strobeBlue.position.set(0.65, 3.75, 1.8);
  group.add(strobeRed, strobeBlue);
  strobeRods.push(strobeRed, strobeBlue);

  // Rear Strobe Pods
  const rearStrobeL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.2), MATERIALS.blueLens);
  rearStrobeL.position.set(1.65, 3.3, -4.1);
  const rearStrobeR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.2), MATERIALS.amberLens);
  rearStrobeR.position.set(-1.65, 3.3, -4.1);
  group.add(rearStrobeL, rearStrobeR);
  strobeRods.push(rearStrobeL, rearStrobeR);

  // Siren Point Light (Bounces dynamic red/blue radiance on ground & street)
  const sirenLight = new THREE.PointLight(0xef4444, 4.5, 35);
  sirenLight.position.set(0, 4.3, 1.8);
  group.add(sirenLight);

  // 6. Dual Xenon Projector Headlights
  const hlMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), MATERIALS.headlightWhite);
  hlMeshL.position.set(-1.3, 1.1, 4.05);
  const hlMeshR = hlMeshL.clone();
  hlMeshR.position.x = 1.3;
  group.add(hlMeshL, hlMeshR);

  const headlightL = new THREE.SpotLight(0xffffff, 5.0, 45, Math.PI / 7, 0.3);
  headlightL.position.set(-1.3, 1.1, 4.0);
  headlightL.target.position.set(-1.3, 0, 22);
  group.add(headlightL, headlightL.target);

  const headlightR = new THREE.SpotLight(0xffffff, 5.0, 45, Math.PI / 7, 0.3);
  headlightR.position.set(1.3, 1.1, 4.0);
  headlightR.target.position.set(1.3, 0, 22);
  group.add(headlightR, headlightR.target);

  return { group, sirenLight, headlightL, headlightR, strobeRods };
}

// ---------------------------------------------------------------------------
// 2. HIGH-FIDELITY CHENNAI POLICE PURSUIT INTERCEPTOR (SUV / CRUISER)
// ---------------------------------------------------------------------------
export function buildHighFidelityPolice(): {
  group: THREE.Group;
  strobeLight: THREE.PointLight;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
} {
  const group = new THREE.Group();

  group.add(createContactShadow(3.8, 7.5));

  // 1. Sleek SUV / Cruiser Body
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 6.4), MATERIALS.policeBlack);
  lowerBody.position.y = 0.85;
  lowerBody.castShadow = true;
  group.add(lowerBody);

  // White Doors & Police Livery Center Section
  const centerDoors = new THREE.Mesh(new THREE.BoxGeometry(3.24, 0.85, 2.7), MATERIALS.policeWhite);
  centerDoors.position.set(0, 0.9, 0.1);
  group.add(centerDoors);

  // Gold Crest Police Emblem Badge on Doors
  const crestL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12), MATERIALS.goldBadge);
  crestL.rotation.z = Math.PI / 2;
  crestL.position.set(1.63, 0.95, 0.1);
  const crestR = crestL.clone();
  crestR.position.x = -1.63;
  group.add(crestL, crestR);

  // 2. Aerodynamic Cabin Glass Greenhouse
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 3.4), MATERIALS.tintedGlass);
  cabin.position.set(0, 1.75, -0.2);
  group.add(cabin);

  // Raked Windshield & Rear Window Slopes
  const frontRake = new THREE.Mesh(new THREE.BoxGeometry(2.78, 1.0, 0.2), MATERIALS.tintedGlass);
  frontRake.position.set(0, 1.6, 1.45);
  frontRake.rotation.x = -0.45;
  const rearRake = new THREE.Mesh(new THREE.BoxGeometry(2.78, 0.85, 0.2), MATERIALS.tintedGlass);
  rearRake.position.set(0, 1.6, -1.85);
  rearRake.rotation.x = 0.4;
  group.add(frontRake, rearRake);

  // 3. Heavy-Duty Push-Bumper / Bullbar
  const bullbar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.35), MATERIALS.darkSteel);
  bullbar.position.set(0, 0.85, 3.4);
  group.add(bullbar);

  // 4. Wheels
  const wheelPositions = [
    [1.65, 0.55, 1.9],
    [-1.65, 0.55, 1.9],
    [1.65, 0.55, -1.9],
    [-1.65, 0.55, -1.9],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.42, 16), MATERIALS.rubberTire);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    tire.castShadow = true;

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.44, 10), MATERIALS.alloyRim);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);

    group.add(tire, rim);
  });

  // 5. Ultra-Slim Aero LED Lightbar
  const lightbarBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.4), MATERIALS.darkSteel);
  lightbarBase.position.set(0, 2.26, -0.2);
  group.add(lightbarBase);

  const strobeR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.2, 0.35), MATERIALS.redLens);
  strobeR.position.set(-0.55, 2.4, -0.2);
  const strobeB = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.2, 0.35), MATERIALS.blueLens);
  strobeB.position.set(0.55, 2.4, -0.2);
  group.add(strobeR, strobeB);

  const strobeLight = new THREE.PointLight(0x3b82f6, 4.0, 30);
  strobeLight.position.set(0, 3.0, -0.2);
  group.add(strobeLight);

  // Headlights
  const headlightL = new THREE.SpotLight(0xffffff, 4.5, 40, Math.PI / 7, 0.3);
  headlightL.position.set(-1.1, 0.9, 3.3);
  headlightL.target.position.set(-1.1, 0, 20);
  group.add(headlightL, headlightL.target);

  const headlightR = new THREE.SpotLight(0xffffff, 4.5, 40, Math.PI / 7, 0.3);
  headlightR.position.set(1.1, 0.9, 3.3);
  headlightR.target.position.set(1.1, 0, 20);
  group.add(headlightR, headlightR.target);

  return { group, strobeLight, headlightL, headlightR };
}

// ---------------------------------------------------------------------------
// 2B. HIGH-FIDELITY TRAFFIC AGENT RAPID CORRIDOR INTERCEPTOR (TR-07)
// ---------------------------------------------------------------------------
export function buildHighFidelityTrafficInterceptor(): {
  group: THREE.Group;
  strobeLight: THREE.PointLight;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
} {
  const group = new THREE.Group();

  group.add(createContactShadow(3.8, 7.5));

  // 1. High-Vis Patrol Chassis
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 6.2), MATERIALS.trafficYellow);
  lowerBody.position.y = 0.85;
  lowerBody.castShadow = true;
  group.add(lowerBody);

  // Chevron Cyan High-Visibility Side Panels
  const sidePanelL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 4.0), MATERIALS.trafficCyan);
  sidePanelL.position.set(1.62, 0.9, 0);
  const sidePanelR = sidePanelL.clone();
  sidePanelR.position.x = -1.62;
  group.add(sidePanelL, sidePanelR);

  // High-Vis Fluo Chevrons on Front Bonnet
  const bonnetStripe = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 1.6), MATERIALS.fluoYellow);
  bonnetStripe.position.set(0, 1.38, 1.8);
  group.add(bonnetStripe);

  // 2. Aerodynamic Cabin Glass Greenhouse
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 3.2), MATERIALS.tintedGlass);
  cabin.position.set(0, 1.75, -0.2);
  group.add(cabin);

  // Windshield & Slopes
  const frontRake = new THREE.Mesh(new THREE.BoxGeometry(2.78, 1.0, 0.2), MATERIALS.tintedGlass);
  frontRake.position.set(0, 1.6, 1.35);
  frontRake.rotation.x = -0.45;
  const rearRake = new THREE.Mesh(new THREE.BoxGeometry(2.78, 0.85, 0.2), MATERIALS.tintedGlass);
  rearRake.position.set(0, 1.6, -1.75);
  rearRake.rotation.x = 0.4;
  group.add(frontRake, rearRake);

  // 3. Heavy-Duty Push-Bumper
  const bullbar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.35), MATERIALS.darkSteel);
  bullbar.position.set(0, 0.85, 3.3);
  group.add(bullbar);

  // 4. Wheels
  const wheelPositions = [
    [1.65, 0.55, 1.8],
    [-1.65, 0.55, 1.8],
    [1.65, 0.55, -1.8],
    [-1.65, 0.55, -1.8],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.42, 16), MATERIALS.rubberTire);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    tire.castShadow = true;

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.44, 10), MATERIALS.alloyRim);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);

    group.add(tire, rim);
  });

  // 5. SCATS Signal Override Transceiver Mast (Roof)
  const scatsMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8), MATERIALS.chromeMetal);
  scatsMast.position.set(0.8, 2.5, -0.6);
  const scatsSensorDome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), MATERIALS.fluoYellow);
  scatsSensorDome.position.set(0.8, 2.9, -0.6);
  group.add(scatsMast, scatsSensorDome);

  // 6. Amber & Cyan Emergency Lightbar
  const lightbarBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.4), MATERIALS.darkSteel);
  lightbarBase.position.set(0, 2.26, -0.1);
  group.add(lightbarBase);

  const strobeAmber = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.2, 0.35), MATERIALS.amberLens);
  strobeAmber.position.set(-0.55, 2.4, -0.1);
  const strobeCyan = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.2, 0.35), MATERIALS.greenLens);
  strobeCyan.position.set(0.55, 2.4, -0.1);
  group.add(strobeAmber, strobeCyan);

  const strobeLight = new THREE.PointLight(0xf59e0b, 4.0, 30);
  strobeLight.position.set(0, 3.0, -0.1);
  group.add(strobeLight);

  // Headlights
  const headlightL = new THREE.SpotLight(0xffffff, 4.5, 40, Math.PI / 7, 0.3);
  headlightL.position.set(-1.1, 0.9, 3.2);
  headlightL.target.position.set(-1.1, 0, 20);
  group.add(headlightL, headlightL.target);

  const headlightR = new THREE.SpotLight(0xffffff, 4.5, 40, Math.PI / 7, 0.3);
  headlightR.position.set(1.1, 0.9, 3.2);
  headlightR.target.position.set(1.1, 0, 20);
  group.add(headlightR, headlightR.target);

  return { group, strobeLight, headlightL, headlightR };
}

// ---------------------------------------------------------------------------
// 3. ICONIC CHENNAI AUTO-RICKSHAW (3-WHEELER)
// ---------------------------------------------------------------------------
export function buildRealisticAutoRickshaw(): THREE.Group {
  const group = new THREE.Group();

  group.add(createContactShadow(2.4, 3.8));

  // Lower Body Chassis (Black)
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.6, 3.2), MATERIALS.autoBlack);
  lowerBody.position.y = 0.55;
  lowerBody.castShadow = true;
  group.add(lowerBody);

  // Upper Body Hull (Bright Chennai Yellow)
  const upperBody = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.75, 2.2), MATERIALS.autoYellow);
  upperBody.position.set(0, 1.15, -0.3);
  group.add(upperBody);

  // Canvas Roof Canopy
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.25, 2.9), MATERIALS.autoYellow);
  roof.position.set(0, 1.85, 0.1);
  group.add(roof);

  // Front Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 0.1), MATERIALS.tintedGlass);
  windshield.position.set(0, 1.45, 1.35);
  windshield.rotation.x = -0.2;
  group.add(windshield);

  // Passenger Bench Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.6), MATERIALS.darkSteel);
  seat.position.set(0, 0.85, -0.6);
  group.add(seat);

  // Single Front Steer Wheel
  const frontTire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 14), MATERIALS.rubberTire);
  frontTire.rotation.z = Math.PI / 2;
  frontTire.position.set(0, 0.38, 1.4);
  group.add(frontTire);

  // Dual Rear Wheels
  [-1.0, 1.0].forEach((rx) => {
    const rearTire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.25, 14), MATERIALS.rubberTire);
    rearTire.rotation.z = Math.PI / 2;
    rearTire.position.set(rx, 0.42, -0.8);
    group.add(rearTire);
  });

  // Single Front Round Headlight
  const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12), MATERIALS.headlightWhite);
  hl.rotation.x = Math.PI / 2;
  hl.position.set(0, 0.8, 1.62);
  group.add(hl);

  return group;
}

// ---------------------------------------------------------------------------
// 4. METROPOLITAN TRANSPORT CORPORATION (MTC) CHENNAI CITY BUS
// ---------------------------------------------------------------------------
export function buildRealisticMTCBus(): THREE.Group {
  const group = new THREE.Group();

  group.add(createContactShadow(4.2, 14.5));

  // Main Bus Hull
  const busBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, 13.0), MATERIALS.busGreen);
  busBody.position.y = 1.9;
  busBody.castShadow = true;
  group.add(busBody);

  // Upper White Stripe & Roof Section
  const upperStripe = new THREE.Mesh(new THREE.BoxGeometry(3.64, 0.9, 13.04), MATERIALS.busWhite);
  upperStripe.position.set(0, 2.7, 0);
  group.add(upperStripe);

  // Panoramic Front Windscreen
  const frontWindscreen = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.5, 0.15), MATERIALS.tintedGlass);
  frontWindscreen.position.set(0, 2.2, 6.55);
  frontWindscreen.rotation.x = -0.1;
  group.add(frontWindscreen);

  // Destination Electronic LED Matrix Sign: "18A • BROADWAY ➔ TAMBARAM"
  const destSign = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.35, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b })
  );
  destSign.position.set(0, 3.1, 6.56);
  group.add(destSign);

  // Side Passenger Windows (Long tinted strip)
  const sideGlassL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 11.0), MATERIALS.tintedGlass);
  sideGlassL.position.set(1.83, 2.2, -0.4);
  const sideGlassR = sideGlassL.clone();
  sideGlassR.position.x = -1.83;
  group.add(sideGlassL, sideGlassR);

  // 6 Bus Wheels
  const busWheels = [
    [1.85, 0.65, 4.5],
    [-1.85, 0.65, 4.5],
    [1.85, 0.65, -3.2],
    [-1.85, 0.65, -3.2],
    [1.85, 0.65, -4.5],
    [-1.85, 0.65, -4.5],
  ];

  busWheels.forEach(([x, y, z]) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.45, 16), MATERIALS.rubberTire);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.47, 10), MATERIALS.alloyRim);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);
    group.add(tire, rim);
  });

  return group;
}

// ---------------------------------------------------------------------------
// 5. MODERN CIVILIAN SEDANS & SUVS
// ---------------------------------------------------------------------------
export function buildRealisticCivilianCar(colorHex: number): THREE.Group {
  const group = new THREE.Group();

  group.add(createContactShadow(3.2, 6.2));

  const carPaint = new THREE.MeshPhysicalMaterial({
    color: colorHex,
    roughness: 0.1,
    metalness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  });

  // Lower Car Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.8, 5.2), carPaint);
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  // Glass Greenhouse Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.75, 2.8), MATERIALS.tintedGlass);
  cabin.position.set(0, 1.35, -0.2);
  group.add(cabin);

  // Sloped Windshield
  const ws = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 0.15), MATERIALS.tintedGlass);
  ws.position.set(0, 1.25, 1.25);
  ws.rotation.x = -0.45;
  group.add(ws);

  // Wheels
  [
    [1.4, 0.48, 1.5],
    [-1.4, 0.48, 1.5],
    [1.4, 0.48, -1.5],
    [-1.4, 0.48, -1.5],
  ].forEach(([x, y, z]) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 14), MATERIALS.rubberTire);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.37, 8), MATERIALS.alloyRim);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);
    group.add(tire, rim);
  });

  // Front Headlights & Rear Taillights
  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.1), MATERIALS.headlightWhite);
  hlL.position.set(-0.95, 0.75, 2.61);
  const hlR = hlL.clone();
  hlR.position.x = 0.95;
  const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.1), MATERIALS.redLens);
  tailL.position.set(-0.95, 0.75, -2.61);
  const tailR = tailL.clone();
  tailR.position.x = 0.95;
  group.add(hlL, hlR, tailL, tailR);

  return group;
}

// ---------------------------------------------------------------------------
// 6. HIGH-TECH MODERN MEDICAL CENTER / HOSPITAL COMPLEX
// ---------------------------------------------------------------------------
export function buildRealisticHospitalComplex(name: string, isApollo: boolean): THREE.Group {
  const group = new THREE.Group();

  // 1. Main Architectural Medical Tower
  const towerHeight = isApollo ? 34 : 26;
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.7,
  });
  const glassFacadeMat = new THREE.MeshPhysicalMaterial({
    color: isApollo ? 0x0284c7 : 0x0d9488,
    roughness: 0.1,
    metalness: 0.8,
    transmission: 0.4,
    transparent: true,
    opacity: 0.85,
  });

  const tower = new THREE.Mesh(new THREE.BoxGeometry(26, towerHeight, 22), towerMat);
  tower.position.y = towerHeight / 2;
  tower.castShadow = true;
  group.add(tower);

  // Glass Facade Curtain Walls with Horizontal Architectural Louvers
  const glassCurtain = new THREE.Mesh(new THREE.BoxGeometry(26.2, towerHeight - 4, 18), glassFacadeMat);
  glassCurtain.position.set(0, towerHeight / 2, 0);
  group.add(glassCurtain);

  // Glowing Floor Slabs
  for (let f = 4; f < towerHeight - 2; f += 4) {
    const slabGlow = new THREE.Mesh(
      new THREE.BoxGeometry(26.3, 0.3, 18.2),
      new THREE.MeshBasicMaterial({ color: isApollo ? 0x38bdf8 : 0x2dd4bf })
    );
    slabGlow.position.set(0, f, 0);
    group.add(slabGlow);
  }

  // 2. Emergency & Trauma Care Entrance Canopy (With Ambulance Intake Bay)
  const erCanopyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.3 });
  const erCanopy = new THREE.Mesh(new THREE.BoxGeometry(20, 1.2, 12), erCanopyMat);
  erCanopy.position.set(0, 5.5, 14);
  erCanopy.castShadow = true;

  // Support Pillars
  const pillarMat = MATERIALS.darkSteel;
  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.5, 8), pillarMat);
  p1.position.set(-8.5, 2.75, 18.5);
  const p2 = p1.clone();
  p2.position.x = 8.5;
  group.add(erCanopy, p1, p2);

  // Illuminated Emergency Intake Sign
  const erSign = new THREE.Mesh(
    new THREE.BoxGeometry(12, 1.4, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  erSign.position.set(0, 6.8, 19.8);
  group.add(erSign);

  // 3. Rooftop Helipad with Landing "H" & Perimeter Beacon Lights
  const helipadPad = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 7.5, 0.6, 32),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  );
  helipadPad.position.y = towerHeight + 0.3;
  group.add(helipadPad);

  const helipadRing = new THREE.Mesh(
    new THREE.RingGeometry(6.2, 6.8, 32),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
  );
  helipadRing.rotation.x = -Math.PI / 2;
  helipadRing.position.y = towerHeight + 0.62;
  group.add(helipadRing);

  // Large White "H" Marking
  const hBar1 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 5.0), MATERIALS.laneWhite);
  hBar1.rotation.x = -Math.PI / 2;
  hBar1.position.set(-1.8, towerHeight + 0.63, 0);
  const hBar2 = hBar1.clone();
  hBar2.position.x = 1.8;
  const hBarCross = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.0), MATERIALS.laneWhite);
  hBarCross.rotation.x = -Math.PI / 2;
  hBarCross.position.set(0, towerHeight + 0.63, 0);
  group.add(hBar1, hBar2, hBarCross);

  // 4. Emerald Green Medical Cross Beacon
  const crossMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.4, 0.8), crossMat);
  crossH.position.set(0, towerHeight + 4.5, 0);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.4, 0.8), crossMat);
  crossV.position.set(0, towerHeight + 4.5, 0);
  group.add(crossH, crossV);

  // Rooftop beacon light
  const beaconLight = new THREE.PointLight(0x10b981, 2.5, 45);
  beaconLight.position.set(0, towerHeight + 7.0, 0);
  group.add(beaconLight);

  return group;
}

// ---------------------------------------------------------------------------
// 7. HIGH-TECH SCATS INTELLIGENT TRAFFIC SIGNAL GANTRY WITH VMS LED SIGN
// ---------------------------------------------------------------------------
export function buildHighTechSCATSGantry(
  x: number,
  z: number,
  rotY: number
): { gantry: THREE.Group; signalBulbs: THREE.Mesh[]; vmsBoard: THREE.Mesh } {
  const gantry = new THREE.Group();
  gantry.position.set(x, 0, z);
  gantry.rotation.y = rotY;

  const trussMat = MATERIALS.darkSteel;

  // Heavy Vertical Support Columns
  const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 12, 12), trussMat);
  colL.position.set(-16, 6, 0);
  const colR = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 12, 12), trussMat);
  colR.position.set(16, 6, 0);

  // Overhead Cross Truss
  const trussTop = new THREE.Mesh(new THREE.BoxGeometry(32.8, 0.4, 0.4), trussMat);
  trussTop.position.set(0, 11.5, 0);
  const trussBottom = new THREE.Mesh(new THREE.BoxGeometry(32.8, 0.4, 0.4), trussMat);
  trussBottom.position.set(0, 9.8, 0);

  gantry.add(colL, colR, trussTop, trussBottom);

  // Electronic VMS (Variable Message Sign) Digital Board
  const vmsBoard = new THREE.Mesh(
    new THREE.BoxGeometry(18, 1.8, 0.4),
    new THREE.MeshBasicMaterial({ color: 0x059669 })
  );
  vmsBoard.position.set(0, 10.6, 0.35);
  gantry.add(vmsBoard);

  // 3 Dedicated Lane Traffic Signal Light Heads
  const signalBulbs: THREE.Mesh[] = [];
  [-9, 0, 9].forEach((sx) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.6, 0.5), trussMat);
    box.position.set(sx, 10.4, 0.5);
    gantry.add(box);

    const greenBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    greenBulb.position.set(sx, 9.7, 0.8);
    gantry.add(greenBulb);
    signalBulbs.push(greenBulb);
  });

  return { gantry, signalBulbs, vmsBoard };
}

// ---------------------------------------------------------------------------
// 8. MODERN GOOSENECK LED STREETLIGHTS & BOULEVARD PALMS
// ---------------------------------------------------------------------------
export function buildModernStreetlight(x: number, z: number): { group: THREE.Group; light: THREE.PointLight } {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 11, 10), MATERIALS.darkSteel);
  pole.position.y = 5.5;
  group.add(pole);

  // Curved Gooseneck Arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 0.2), MATERIALS.darkSteel);
  arm.position.set(1.4, 10.8, 0);
  arm.rotation.z = -0.15;
  group.add(arm);

  // LED Luminaire Head
  const luminaire = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.45), MATERIALS.darkSteel);
  luminaire.position.set(2.8, 10.5, 0);
  group.add(luminaire);

  const bulb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.35), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  bulb.position.set(2.8, 10.4, 0);
  group.add(bulb);

  const light = new THREE.PointLight(0xfef08a, 1.2, 24);
  light.position.set(2.8, 9.8, 0);
  group.add(light);

  return { group, light };
}

// Sculpted Tropical Boulevard Palm Tree
export function buildBoulevardPalm(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.4, 5.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
  );
  trunk.position.y = 2.75;
  group.add(trunk);

  const palmCrownMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
  for (let i = 0; i < 6; i++) {
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.2, 5), palmCrownMat);
    frond.position.set(0, 5.5, 0);
    frond.rotation.z = 0.75;
    frond.rotation.y = (i * Math.PI) / 3;
    group.add(frond);
  }

  return group;
}

// ---------------------------------------------------------------------------
// 9. HISTORIC RIPON BUILDING & CHENNAI CENTRAL CLOCK TOWER
// ---------------------------------------------------------------------------
export function buildRiponBuildingCentralClockTower(): THREE.Group {
  const group = new THREE.Group();

  const whiteStoneMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.1,
  });
  const roofRedMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.4,
    metalness: 0.15,
  });
  const clockFaceMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // Main Palatial Symmetrical Building Wings
  const baseWings = new THREE.Mesh(new THREE.BoxGeometry(48, 14, 20), whiteStoneMat);
  baseWings.position.y = 7;
  baseWings.castShadow = true;
  group.add(baseWings);

  // Decorative Arched Colonnade Entablature
  const portico = new THREE.Mesh(new THREE.BoxGeometry(22, 16, 6), whiteStoneMat);
  portico.position.set(0, 8, 11);
  portico.castShadow = true;
  group.add(portico);

  // Central Clock Tower (Indo-Saracenic 43m Landmark)
  const tower = new THREE.Mesh(new THREE.BoxGeometry(10, 36, 10), whiteStoneMat);
  tower.position.y = 18;
  tower.castShadow = true;
  group.add(tower);

  // 4-Sided Illuminated Analog Clock Faces
  [
    [0, 28, 5.05, 0],
    [0, 28, -5.05, Math.PI],
    [5.05, 28, 0, Math.PI / 2],
    [-5.05, 28, 0, -Math.PI / 2],
  ].forEach(([cx, cy, cz, rot]) => {
    const clockDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 24), clockFaceMat);
    clockDisc.rotation.x = Math.PI / 2;
    clockDisc.rotation.y = rot;
    clockDisc.position.set(cx, cy, cz);
    group.add(clockDisc);
  });

  // Top Pyramidal Dome & Flag Mast
  const cupola = new THREE.Mesh(new THREE.ConeGeometry(5.5, 8, 8), roofRedMat);
  cupola.position.y = 40;
  cupola.castShadow = true;
  group.add(cupola);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 8), MATERIALS.chromeMetal);
  mast.position.y = 47;
  group.add(mast);

  return group;
}

// ---------------------------------------------------------------------------
// 10. ICONIC LIC BUILDING (CHENNAI'S HISTORIC 15-STOREY SKYSCRAPER)
// ---------------------------------------------------------------------------
export function buildLICBuilding(): THREE.Group {
  const group = new THREE.Group();

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.4,
    metalness: 0.2,
  });
  const glassRibbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.8,
    transmission: 0.5,
    transparent: true,
    opacity: 0.85,
  });

  const towerHeight = 46;

  // Main 15-Storey Tower Slab
  const tower = new THREE.Mesh(new THREE.BoxGeometry(22, towerHeight, 14), concreteMat);
  tower.position.y = towerHeight / 2;
  tower.castShadow = true;
  group.add(tower);

  // Horizontal Ribbon Window Strips
  for (let f = 3; f < towerHeight - 3; f += 3) {
    const winStrip = new THREE.Mesh(new THREE.BoxGeometry(22.2, 1.2, 14.2), glassRibbonMat);
    winStrip.position.set(0, f, 0);
    group.add(winStrip);
  }

  // Iconic Red Vertical Side Fin
  const redFin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, towerHeight + 4, 16),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.3 })
  );
  redFin.position.set(-11, (towerHeight + 4) / 2, 0);
  redFin.castShadow = true;
  group.add(redFin);

  // Rooftop Illuminated "LIC" Monogram Signboard
  const logoBox = new THREE.Mesh(
    new THREE.BoxGeometry(14, 3.2, 1.0),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  logoBox.position.set(0, towerHeight + 2.5, 0);
  group.add(logoBox);

  return group;
}

// ---------------------------------------------------------------------------
// 11. MARINA BEACH LIGHTHOUSE & COASTLINE PROMENADE
// ---------------------------------------------------------------------------
export function buildMarinaLighthouse(): { group: THREE.Group; beaconLight: THREE.SpotLight } {
  const group = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });

  // Cylindrical Tower Base with Alternating Red & White Maritime Bands
  const totalHeight = 42;
  const numBands = 7;
  const bandHeight = totalHeight / numBands;

  for (let b = 0; b < numBands; b++) {
    const mat = b % 2 === 0 ? redMat : whiteMat;
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(
        4.0 - (b * 0.2),
        4.2 - (b * 0.2),
        bandHeight,
        24
      ),
      mat
    );
    band.position.y = b * bandHeight + bandHeight / 2;
    band.castShadow = true;
    group.add(band);
  }

  // Top Observation Deck & Lantern Room
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 0.8, 24), lanternMat);
  deck.position.y = totalHeight + 0.4;
  group.add(deck);

  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 3.6, 16),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 })
  );
  lantern.position.y = totalHeight + 2.6;
  group.add(lantern);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
  dome.position.y = totalHeight + 4.4;
  group.add(dome);

  // Revolving Maritime Searchlight Beacon
  const beaconLight = new THREE.SpotLight(0xfef08a, 6.0, 180, Math.PI / 5, 0.4);
  beaconLight.position.set(0, totalHeight + 2.6, 0);
  beaconLight.target.position.set(50, 0, 0);
  group.add(beaconLight, beaconLight.target);

  return { group, beaconLight };
}

// ---------------------------------------------------------------------------
// 12. TIDEL PARK / OMR IT CORRIDOR TECH TOWERS
// ---------------------------------------------------------------------------
export function buildTidelParkTechTower(): THREE.Group {
  const group = new THREE.Group();

  const darkGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.05,
    metalness: 0.9,
    transmission: 0.6,
    transparent: true,
    opacity: 0.9,
  });
  const steelFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  });

  const towerHeight = 38;

  // Main Tiered IT Tech Building
  const techBlock1 = new THREE.Mesh(new THREE.BoxGeometry(36, towerHeight, 24), darkGlassMat);
  techBlock1.position.y = towerHeight / 2;
  techBlock1.castShadow = true;
  group.add(techBlock1);

  // Top Glass Atrium Crown
  const crown = new THREE.Mesh(new THREE.BoxGeometry(30, 4, 18), steelFrameMat);
  crown.position.set(0, towerHeight + 2, 0);
  group.add(crown);

  // Telecom Sat Antenna Towers on Roof
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 10, 8), steelFrameMat);
  antenna.position.set(10, towerHeight + 9, 5);
  group.add(antenna);

  return group;
}

// ---------------------------------------------------------------------------
// 13. MA CHIDAMBARAM CRICKET STADIUM (CHEPAUK STADIUM)
// ---------------------------------------------------------------------------
export function buildChepaukStadium(): THREE.Group {
  const group = new THREE.Group();

  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.2 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 });
  const pitchGrassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const pitchTurfMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });

  // Outer Stadium Base Drum
  const base = new THREE.Mesh(new THREE.CylinderGeometry(44, 46, 12, 36), concreteMat);
  base.position.y = 6;
  base.castShadow = true;
  group.add(base);

  // Seating Grandstands Tier
  const grandstand = new THREE.Mesh(new THREE.CylinderGeometry(41, 43, 16, 36), standMat);
  grandstand.position.y = 11;
  group.add(grandstand);

  // Inner Cricket Field Grass
  const field = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 0.2, 32), pitchGrassMat);
  field.position.y = 12.1;
  group.add(field);

  // Central 22-Yard Pitch Strip
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 12), pitchTurfMat);
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.y = 12.25;
  group.add(pitch);

  // Circular Cantilever Tensile Roof Ring
  const roofRing = new THREE.Mesh(
    new THREE.RingGeometry(32, 46, 36),
    roofMat
  );
  roofRing.rotation.x = -Math.PI / 2;
  roofRing.position.y = 20;
  roofRing.castShadow = true;
  group.add(roofRing);

  // 4 Iconic Chepauk Floodlight Pylons
  const floodlightPositions = [
    [-48, -48],
    [48, -48],
    [-48, 48],
    [48, 48],
  ];

  floodlightPositions.forEach(([fx, fz]) => {
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 38, 8), concreteMat);
    pylon.position.set(fx, 19, fz);
    pylon.castShadow = true;

    // Head Floodlight Matrix Array
    const head = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 1.2), new THREE.MeshBasicMaterial({ color: 0xffedd5 }));
    head.position.set(fx, 38, fz);
    head.lookAt(0, 10, 0);

    const lightBulb = new THREE.PointLight(0xffedd5, 3.0, 75);
    lightBulb.position.set(fx, 38, fz);

    group.add(pylon, head, lightBulb);
  });

  return group;
}

// ---------------------------------------------------------------------------
// 14. VALLUVAR KOTTAM (TEMPLE CHARIOT MONUMENT & AUDITORIUM)
// ---------------------------------------------------------------------------
export function buildValluvarKottam(): THREE.Group {
  const group = new THREE.Group();

  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.25 });
  const goldKalasamMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
  const auditoriumMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

  // Main Auditorium Base Platform
  const audBase = new THREE.Mesh(new THREE.BoxGeometry(50, 6, 32), auditoriumMat);
  audBase.position.set(-15, 3, 0);
  audBase.castShadow = true;
  group.add(audBase);

  // Dravidian Temple Chariot Base (Stone Ther)
  const chariotBase = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 16), graniteMat);
  chariotBase.position.set(22, 3.5, 0);
  chariotBase.castShadow = true;
  group.add(chariotBase);

  // 4 Giant Granite Stone Wheels
  const wheelPositions = [
    [16, 3.2, 8.2],
    [28, 3.2, 8.2],
    [16, 3.2, -8.2],
    [28, 3.2, -8.2],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.8, 20), graniteMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    group.add(wheel);
  });

  // Multi-Tiered Vimanam (Pyramidal Temple Spire - 39m high)
  for (let t = 0; t < 5; t++) {
    const size = 14 - t * 2.2;
    const tier = new THREE.Mesh(new THREE.BoxGeometry(size, 4, size), graniteMat);
    tier.position.set(22, 7 + t * 4 + 2, 0);
    tier.castShadow = true;
    group.add(tier);
  }

  // Top Golden Kalasam Finial
  const kalasam = new THREE.Mesh(new THREE.ConeGeometry(1.6, 5, 12), goldKalasamMat);
  kalasam.position.set(22, 29.5, 0);
  group.add(kalasam);

  return group;
}

// ---------------------------------------------------------------------------
// 15. ELEVATED CHENNAI METRO VIADUCT & STATION
// ---------------------------------------------------------------------------
export function buildElevatedMetroViaduct(length = 600, angle = -0.52): { viaductGroup: THREE.Group; stationGroup: THREE.Group } {
  const viaductGroup = new THREE.Group();
  const stationGroup = new THREE.Group();

  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
  const glassStationMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.8,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  const viaductHeight = 18;
  const viaductWidth = 8.5;

  // Deck Beam
  const deck = new THREE.Mesh(new THREE.BoxGeometry(viaductWidth, 1.2, length), concreteMat);
  deck.rotation.y = angle;
  deck.position.set(26, viaductHeight, 0);
  deck.castShadow = true;
  viaductGroup.add(deck);

  // Parapets
  [-viaductWidth / 2 + 0.3, viaductWidth / 2 - 0.3].forEach((off) => {
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, length), concreteMat);
    parapet.rotation.y = angle;
    const px = 26 + off * Math.cos(angle);
    const pz = 0 - off * Math.sin(angle);
    parapet.position.set(px, viaductHeight + 0.9, pz);
    viaductGroup.add(parapet);
  });

  // Steel Metro Rails (2 tracks)
  [-2.2, -1.2, 1.2, 2.2].forEach((off) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, length), railMat);
    rail.rotation.y = angle;
    const rx = 26 + off * Math.cos(angle);
    const rz = 0 - off * Math.sin(angle);
    rail.position.set(rx, viaductHeight + 0.7, rz);
    viaductGroup.add(rail);
  });

  // Support Pillars every 35 units
  for (let p = -length / 2 + 20; p <= length / 2 - 20; p += 35) {
    const px = 26 + p * Math.sin(angle);
    const pz = 0 + p * Math.cos(angle);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, viaductHeight, 16), concreteMat);
    pillar.position.set(px, viaductHeight / 2, pz);
    pillar.castShadow = true;

    // Pier Cap (Hammerhead)
    const cap = new THREE.Mesh(new THREE.BoxGeometry(viaductWidth + 1, 1.5, 3), concreteMat);
    cap.rotation.y = angle;
    cap.position.set(px, viaductHeight - 0.7, pz);
    viaductGroup.add(pillar, cap);
  }

  // ----------------------------------------------------
  // ELEVATED METRO STATION CANOPY (e.g. AG-DMS / Thousand Lights Metro)
  // ----------------------------------------------------
  const stationCenter = new THREE.Vector3(26, viaductHeight, -40);
  stationGroup.position.copy(stationCenter);
  stationGroup.rotation.y = angle;

  // Station Platform Hall
  const hall = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 48), glassStationMat);
  hall.position.y = 3.5;
  stationGroup.add(hall);

  // Arched Station Roof
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 8.5, 48, 16, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 })
  );
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 7.5;
  stationGroup.add(roof);

  // Neon Blue Platform Glow
  const platGlow = new THREE.PointLight(0x0284c7, 3.5, 35);
  platGlow.position.y = 4;
  stationGroup.add(platGlow);

  return { viaductGroup, stationGroup };
}

// ---------------------------------------------------------------------------
// 16. CHENNAI METRO 3-COACH HIGH-SPEED TRAIN
// ---------------------------------------------------------------------------
export function buildChennaiMetroTrain(): THREE.Group {
  const trainGroup = new THREE.Group();

  const steelBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
  const blueStripeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const glassMat = MATERIALS.tintedGlass;

  const coachLength = 14;
  const coachWidth = 3.0;
  const coachHeight = 3.2;

  // 3 Coaches
  [-coachLength - 1, 0, coachLength + 1].forEach((cz, idx) => {
    const coach = new THREE.Group();
    coach.position.z = cz;

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(coachWidth, coachHeight, coachLength), steelBodyMat);
    body.position.y = coachHeight / 2 + 0.3;
    body.castShadow = true;
    coach.add(body);

    // Blue Metro Brand Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(coachWidth + 0.05, 0.4, coachLength), blueStripeMat);
    stripe.position.y = 1.6;
    coach.add(stripe);

    // Windows
    const winL = new THREE.Mesh(new THREE.PlaneGeometry(coachLength - 2, 1.1), glassMat);
    winL.position.set(-coachWidth / 2 - 0.05, 2.2, 0);
    winL.rotation.y = -Math.PI / 2;

    const winR = winL.clone();
    winR.position.x = coachWidth / 2 + 0.05;
    winR.rotation.y = Math.PI / 2;

    coach.add(winL, winR);

    // Front/Rear aerodynamic nose on outer coaches
    if (idx === 0) {
      // Rear Nose
      const nose = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 4), steelBodyMat);
      nose.rotation.x = -Math.PI / 2;
      nose.rotation.y = Math.PI / 4;
      nose.position.set(0, 1.8, -coachLength / 2 - 1.2);
      coach.add(nose);
    } else if (idx === 2) {
      // Front Nose
      const nose = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 4), steelBodyMat);
      nose.rotation.x = Math.PI / 2;
      nose.rotation.y = Math.PI / 4;
      nose.position.set(0, 1.8, coachLength / 2 + 1.2);

      // Headlights
      const hl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.2), MATERIALS.headlightWhite);
      hl.position.set(0, 1.2, coachLength / 2 + 2.2);
      coach.add(nose, hl);
    }

    trainGroup.add(coach);
  });

  return trainGroup;
}

// ---------------------------------------------------------------------------
// 17. CONTEMPORARY GLASS CORPORATE SKYSCRAPERS
// ---------------------------------------------------------------------------
export function buildGlassCorporateTower(height = 54, width = 24, depth = 20, colorHex = 0x0284c7): THREE.Group {
  const group = new THREE.Group();

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: colorHex,
    roughness: 0.08,
    metalness: 0.88,
    transmission: 0.55,
    transparent: true,
    opacity: 0.9,
  });
  const darkFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
  const floorSlabMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });

  // Main Glass Monolith
  const tower = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), glassMat);
  tower.position.y = height / 2;
  tower.castShadow = true;
  group.add(tower);

  // Interior Illuminated Floor Slabs
  for (let f = 3; f < height - 2; f += 3.5) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(width - 0.8, 0.4, depth - 0.8), floorSlabMat);
    slab.position.y = f;
    group.add(slab);
  }

  // Steel Corner Columns
  const colGeo = new THREE.BoxGeometry(1.0, height, 1.0);
  [
    [-width / 2 + 0.5, -depth / 2 + 0.5],
    [width / 2 - 0.5, -depth / 2 + 0.5],
    [-width / 2 + 0.5, depth / 2 - 0.5],
    [width / 2 - 0.5, depth / 2 - 0.5],
  ].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(colGeo, darkFrameMat);
    col.position.set(cx, height / 2, cz);
    col.castShadow = true;
    group.add(col);
  });

  // Rooftop Crown & Aircraft Warning Beacon
  const crown = new THREE.Mesh(new THREE.BoxGeometry(width - 2, 3, depth - 2), darkFrameMat);
  crown.position.y = height + 1.5;
  group.add(crown);

  const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), MATERIALS.redLens);
  redBeacon.position.set(0, height + 3.5, 0);
  group.add(redBeacon);

  return group;
}

// ---------------------------------------------------------------------------
// 18. MODERN RESIDENTIAL APARTMENT COMPLEX
// ---------------------------------------------------------------------------
export function buildUrbanResidentialBlock(height = 36, width = 28, depth = 18): THREE.Group {
  const group = new THREE.Group();

  const stuccoMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
  const woodPanelMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  const glassBalconyMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.7,
  });

  // Main Concrete Core
  const core = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), stuccoMat);
  core.position.y = height / 2;
  core.castShadow = true;
  group.add(core);

  // Cantilevered Balconies along facades
  for (let f = 4; f < height - 2; f += 4) {
    const balconyL = new THREE.Mesh(new THREE.BoxGeometry(width - 4, 1.2, 2.5), glassBalconyMat);
    balconyL.position.set(0, f, depth / 2 + 1.25);

    const balconyR = balconyL.clone();
    balconyR.position.z = -depth / 2 - 1.25;

    // Warm wood feature accent
    const woodBand = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.2), woodPanelMat);
    woodBand.position.set(-6, f + 1, depth / 2 + 0.1);

    group.add(balconyL, balconyR, woodBand);
  }

  // Rooftop Garden Canopy & Solar Panels
  const pergola = new THREE.Mesh(new THREE.BoxGeometry(14, 2.5, 10), woodPanelMat);
  pergola.position.set(-4, height + 1.25, 0);
  group.add(pergola);

  return group;
}

// ---------------------------------------------------------------------------
// 19. EXPRESS AVENUE SHOPPING MALL & ENTERTAINMENT COMPLEX
// ---------------------------------------------------------------------------
export function buildExpressAvenueMall(): THREE.Group {
  const group = new THREE.Group();

  const mallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });
  const glassAtriumMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    roughness: 0.05,
    metalness: 0.7,
    transmission: 0.8,
    transparent: true,
    opacity: 0.85,
  });
  const retailLogoMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // Main Expansive Mall Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(62, 16, 44), mallMat);
  base.position.y = 8;
  base.castShadow = true;
  group.add(base);

  // Grand Cylindrical Glass Entrance Rotunda
  const rotunda = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 22, 24), glassAtriumMat);
  rotunda.position.set(0, 11, 22);
  group.add(rotunda);

  // Rooftop Glass Skylight Spine
  const skylight = new THREE.Mesh(new THREE.BoxGeometry(40, 2.5, 14), glassAtriumMat);
  skylight.position.set(0, 17, 0);
  group.add(skylight);

  // Illuminated Retail Brand Fascia
  const logoBanner = new THREE.Mesh(new THREE.BoxGeometry(18, 3.5, 0.4), retailLogoMat);
  logoBanner.position.set(0, 18, 33.5);
  group.add(logoBanner);

  return group;
}

// ---------------------------------------------------------------------------
// 20. ROADSIDE BUS STOP SHELTER
// ---------------------------------------------------------------------------
export function buildBusStopShelter(): THREE.Group {
  const group = new THREE.Group();

  const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
  const glassMat = MATERIALS.clearGlass;
  const adBoardMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // Canopy Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 3.0), steelMat);
  roof.position.set(0, 3.2, 0);
  roof.castShadow = true;
  group.add(roof);

  // Glass Back Wall
  const back = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 2.8), glassMat);
  back.position.set(0, 1.5, -1.4);
  group.add(back);

  // Bench
  const bench = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 0.8), steelMat);
  bench.position.set(0, 0.6, -0.6);
  group.add(bench);

  // Illuminated Ad Totem
  const ad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 1.2), adBoardMat);
  ad.position.set(3.1, 1.4, 0);
  group.add(ad);

  return group;
}

// ---------------------------------------------------------------------------
// 21. GULMOHAR TREE (ROYAL POINCIANA / FLAMING ORANGE CANOPY)
// ---------------------------------------------------------------------------
export function buildGulmoharTree(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x573926, roughness: 0.9 });
  const orangeFoliageMat = new THREE.MeshStandardMaterial({
    color: 0xea580c, // Bright flaming orange Gulmohar blossom
    roughness: 0.7,
    metalness: 0.05,
  });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 4.5, 8), trunkMat);
  trunk.position.y = 2.25;
  trunk.castShadow = true;
  group.add(trunk);

  // Wide Umbraculiform (Umbrella) Crown
  const crown1 = new THREE.Mesh(new THREE.ConeGeometry(4.2, 3.5, 8), orangeFoliageMat);
  crown1.position.y = 5.8;
  crown1.castShadow = true;

  const crown2 = new THREE.Mesh(new THREE.SphereGeometry(3.6, 8, 8), orangeFoliageMat);
  crown2.scale.set(1.4, 0.6, 1.4);
  crown2.position.y = 5.2;
  crown2.castShadow = true;

  group.add(crown1, crown2);
  return group;
}

