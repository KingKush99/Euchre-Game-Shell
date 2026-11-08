import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { PlayerProfile, TownLocation } from '../types/poker';
import { CITY_SCALE_MULTIPLIERS } from '../data/gameData';
import { sounds } from '../utils/soundEffects';
import { create3DPlayerCharacter } from '../utils/create3DCharacter';
import {
  TOWN_BOX_COLLIDERS,
  TOWN_CIRCLE_COLLIDERS,
  TOWN_BOUNDS,
  resolvePersonObstacles,
  resolveCircleVsCircle,
  resolveCircleVsBox,
  createDynamicProps,
  stepDynamicProps,
  DynamicProp,
} from '../utils/townPhysics';
import { create3DSteamBuggy, Vehicle3DInstance } from '../utils/vehicle3D';
import { Gauge, Compass, Volume2, Lightbulb, LogOut, RotateCcw, RotateCw, Navigation, Car, Sparkles } from 'lucide-react';

interface ThreeTown3DProps {
  playerProfile: PlayerProfile;
  currentTown: TownLocation;
  onSelectTownId: (townId: string) => void;
  onEnterSaloon: (mode: 'cash' | 'tournament' | 'boss_duel') => void;
  onOpenProperties: () => void;
  onOpenShop: () => void;
  onOpenWheel?: () => void;
  onPlayerPositionChange?: (normPos: { x: number; y: number }) => void;
  cameraMode?: 'follow' | 'orbit' | 'birds_eye';
}

export const ThreeTown3D: React.FC<ThreeTown3DProps> = ({
  playerProfile,
  currentTown,
  onSelectTownId,
  onEnterSaloon,
  onOpenProperties,
  onOpenShop,
  onOpenWheel,
  onPlayerPositionChange,
  cameraMode = 'follow',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeBuildingPrompt, setActiveBuildingPrompt] = useState<{
    id: string;
    name: string;
    type: 'saloon' | 'boss' | 'bank' | 'shop' | 'wheel';
    actionText: string;
    description: string;
    gameMode: 'cash' | 'tournament' | 'boss_duel';
    stakes: string;
  } | null>(null);

  // Vehicle Driving State & Prompt
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [activeVehiclePrompt, setActiveVehiclePrompt] = useState<boolean>(false);
  const [drivingHUD, setDrivingHUD] = useState<{
    speed: number;
    gear: 'D' | 'R' | 'P';
    lightsOn: boolean;
  }>({ speed: 0, gear: 'P', lightsOn: true });

  // Floating Overhead Speedometer Position Tag (Over vehicle in 3D scene)
  const [overheadTagPos, setOverheadTagPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Camera Orbit & Heading State
  const [cameraHeadingDeg, setCameraHeadingDeg] = useState<number>(0);
  const [npcSpeechBubble, setNpcSpeechBubble] = useState<{
    name: string;
    text: string;
    role: string;
  } | null>(null);

  // Character movement states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  // Start player on the south boulevard approaching Crown Plaza (5x scale)
  const playerPos = useRef({ x: 0, z: 155, rot: Math.PI, isWalking: false });
  const targetWalkPos = useRef<{ x: number; z: number } | null>(null);
  const zoomDistance = useRef<number>(48);

  // User 360° Camera Orbit & Pitch refs
  const cameraYaw = useRef<number>(0);
  const cameraPitch = useRef<number>(0.38);
  const isPointerDown = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDragged = useRef<boolean>(false);

  // Vehicle State Ref (for 60fps synchronous physics inside animate)
  const isDrivingRef = useRef<boolean>(false);
  const drivingData = useRef<{
    x: number;
    z: number;
    speed: number;
    steer: number;
    rot: number;
    gear: 'D' | 'R' | 'P';
    lightsOn: boolean;
  }>({
    x: 18.0,
    z: 135.0,
    speed: 0,
    steer: 0,
    rot: Math.PI,
    gear: 'P',
    lightsOn: true,
  });

  // Vehicle action triggers from HUD buttons
  const vehicleInstanceRef = useRef<Vehicle3DInstance | null>(null);

  const handleToggleHeadlights = () => {
    if (vehicleInstanceRef.current) {
      const newState = vehicleInstanceRef.current.toggleHeadlights();
      drivingData.current.lightsOn = newState;
      setDrivingHUD((prev) => ({ ...prev, lightsOn: newState }));
      sounds.playClick();
    }
  };

  const handleHonkHorn = () => {
    sounds.playHorn();
  };

  const handleExitVehicle = () => {
    if (!isDrivingRef.current) return;
    isDrivingRef.current = false;
    setIsDriving(false);
    // Place player beside vehicle
    playerPos.current.x = drivingData.current.x - 3.2;
    playerPos.current.z = drivingData.current.z;
    playerPos.current.rot = drivingData.current.rot - Math.PI / 2;
    drivingData.current.speed = 0;
    drivingData.current.gear = 'P';
    setDrivingHUD({ speed: 0, gear: 'P', lightsOn: drivingData.current.lightsOn });
    sounds.playClick();
  };

  const handleEnterVehicle = () => {
    if (isDrivingRef.current) return;
    isDrivingRef.current = true;
    setIsDriving(true);
    targetWalkPos.current = null;
    drivingData.current.gear = 'D';
    sounds.playVehicleIgnition();
  };

  const handleRotateCamera = (direction: 'left' | 'right' | 'reset') => {
    if (direction === 'left') {
      cameraYaw.current -= Math.PI / 4;
    } else if (direction === 'right') {
      cameraYaw.current += Math.PI / 4;
    } else {
      cameraYaw.current = 0;
      cameraPitch.current = 0.38;
    }
  };

  // Setup Keyboard Listeners for 3D Movement, Driving, and Camera Rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        targetWalkPos.current = null;
      }

      // Interaction key [E]
      if (key === 'e') {
        if (isDrivingRef.current) {
          handleExitVehicle();
        } else if (activeVehiclePrompt) {
          handleEnterVehicle();
        } else if (activeBuildingPrompt) {
          handleTriggerBuilding(activeBuildingPrompt.gameMode);
        }
      }

      // Vehicle specific keys
      if (isDrivingRef.current) {
        if (key === 'h') {
          handleHonkHorn();
        } else if (key === 'l') {
          handleToggleHeadlights();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeBuildingPrompt, activeVehiclePrompt]);

  const handleTriggerBuilding = (mode: 'cash' | 'tournament' | 'boss_duel') => {
    sounds.playClick();
    onEnterSaloon(mode);
  };

  // -------------------------------------------------------------
  // HIGH-RESOLUTION PROCEDURAL TEXTURE GENERATORS
  // -------------------------------------------------------------

  // 1. Tudor Half-Timber Wall Texture with dark oak beams and cream stucco plaster
  const createTudorWallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Cream / stucco plaster
    ctx.fillStyle = '#eee5d8';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle plaster grain noise
    ctx.fillStyle = 'rgba(0,0,0,0.035)';
    for (let i = 0; i < 2400; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Dark oak timber beams
    ctx.fillStyle = '#3a2012';

    // Frame borders
    ctx.fillRect(0, 0, 512, 22);
    ctx.fillRect(0, 490, 512, 22);
    ctx.fillRect(0, 0, 22, 512);
    ctx.fillRect(490, 0, 22, 512);

    // Horizontal middle beam
    ctx.fillRect(0, 245, 512, 22);

    // Vertical studs
    ctx.fillRect(160, 0, 20, 512);
    ctx.fillRect(332, 0, 20, 512);

    // Diagonal braces
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#3a2012';
    ctx.beginPath();
    ctx.moveTo(22, 22);
    ctx.lineTo(160, 245);
    ctx.moveTo(490, 22);
    ctx.lineTo(332, 245);
    ctx.stroke();

    // Stone foundation at base
    ctx.fillStyle = '#8a8276';
    ctx.fillRect(0, 465, 512, 47);
    ctx.strokeStyle = '#5f584e';
    ctx.lineWidth = 2;
    for (let sx = 0; sx < 512; sx += 64) {
      ctx.strokeRect(sx, 465, 64, 47);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  // 2. Terracotta Medieval Scallop Roof Tile Texture
  const createRoofTilesTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#9e3921';
    ctx.fillRect(0, 0, 512, 512);

    const rowHeight = 32;
    const tileWidth = 48;
    for (let y = 0; y < 512; y += rowHeight) {
      const isOdd = (y / rowHeight) % 2 === 1;
      const xOffset = isOdd ? tileWidth / 2 : 0;
      for (let x = -tileWidth; x < 512 + tileWidth; x += tileWidth) {
        const variance = Math.sin(x * 12 + y * 7) * 15;
        const r = Math.min(220, Math.max(140, 175 + variance));
        const g = Math.min(100, Math.max(40, 65 + variance * 0.4));
        const b = Math.min(70, Math.max(25, 42 + variance * 0.3));
        ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;

        ctx.beginPath();
        ctx.roundRect(x + xOffset + 1, y + 1, tileWidth - 2, rowHeight + 6, [0, 0, 8, 8]);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  };

  // 3. Clean Light Cobblestone Circular Plaza Texture
  const createCobblestoneTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ece7db';
    ctx.fillRect(0, 0, 512, 512);

    ctx.lineWidth = 2;
    for (let y = 0; y < 512; y += 24) {
      const isOdd = (y / 24) % 2 === 1;
      const xOffset = isOdd ? 18 : 0;
      for (let x = -36; x < 512 + 36; x += 36) {
        const stoneVar = Math.sin(x * 5 + y * 9) * 14;
        const gray = Math.floor(238 + stoneVar);
        ctx.fillStyle = `rgb(${gray},${gray - 4},${gray - 10})`;
        ctx.strokeStyle = '#c6c0b2';
        ctx.beginPath();
        ctx.roundRect(x + xOffset + 2, y + 2, 32, 20, 6);
        ctx.fill();
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  };

  // 4. Grand Signboard Canvas Texture
  const createSignTexture = (text: string, bgColor: string, textColor = '#ffffff', borderColor = '#f59e0b', icon = '') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1024, 180);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 1008, 164);

    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 984, 140);

    ctx.fillStyle = '#fbbf24';
    [[32, 32], [992, 32], [32, 148], [992, 148]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = textColor;
    ctx.font = '900 64px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${icon ? icon + ' ' : ''}${text}`.trim(), 512, 92);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  };

  // -------------------------------------------------------------
  // THREE.JS SCENE LIFECYCLE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Daylight Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#b4c4ce');
    scene.fog = new THREE.FogExp2('#cad5dc', 0.0035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // High-angle elevated third-person perspective looking down into Crown Plaza
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.5, 1200);
    camera.position.set(0, 32, 78);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    // 2. Balanced Daylight Lighting & Sunlight
    const ambientLight = new THREE.AmbientLight('#f1f5f9', 1.15);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fff7ed', 1.6);
    sunLight.position.set(120, 260, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 600;
    sunLight.shadow.camera.left = -220;
    sunLight.shadow.camera.right = 220;
    sunLight.shadow.camera.top = 260;
    sunLight.shadow.camera.bottom = -260;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight('#93c5fd', 0.5);
    skyFill.position.set(-80, 120, -100);
    scene.add(skyFill);

    // 3. Ground & Paved Courtyard (5x scale: 1600x1600 realm)
    const groundMat = new THREE.MeshStandardMaterial({ color: '#bfbaa7', roughness: 0.94 });
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Clean cobblestone central Crown Plaza disc (radius 48)
    const cobbleTex = createCobblestoneTexture();
    const plazaMat = new THREE.MeshStandardMaterial({
      map: cobbleTex,
      roughness: 0.85,
    });
    const plazaGeo = new THREE.CylinderGeometry(48, 48, 0.25, 64);
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.position.set(0, 0.12, 0);
    plazaMesh.receiveShadow = true;
    scene.add(plazaMesh);

    // Decorative stone curb border around the circular plaza
    const curbGeo = new THREE.TorusGeometry(48.2, 0.6, 12, 64);
    const curbMat = new THREE.MeshStandardMaterial({ color: '#7a756b', roughness: 0.9 });
    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    curbMesh.rotation.x = Math.PI / 2;
    curbMesh.position.set(0, 0.2, 0);
    curbMesh.receiveShadow = true;
    scene.add(curbMesh);

    // Grand Radial Cobblestone Avenues linking the 4 districts
    // South Avenue: Carriage Boulevard to South Gate
    const southAveGeo = new THREE.PlaneGeometry(36, 180);
    const southAveMesh = new THREE.Mesh(southAveGeo, plazaMat);
    southAveMesh.rotation.x = -Math.PI / 2;
    southAveMesh.position.set(0, 0.13, 110);
    southAveMesh.receiveShadow = true;
    scene.add(southAveMesh);

    // North Avenue: Royal Promenade to Spade Palace
    const northAveGeo = new THREE.PlaneGeometry(36, 150);
    const northAveMesh = new THREE.Mesh(northAveGeo, plazaMat);
    northAveMesh.rotation.x = -Math.PI / 2;
    northAveMesh.position.set(0, 0.13, -95);
    northAveMesh.receiveShadow = true;
    scene.add(northAveMesh);

    // West Avenue: Street to Heart Tavern
    const westAveGeo = new THREE.PlaneGeometry(80, 32);
    const westAveMesh = new THREE.Mesh(westAveGeo, plazaMat);
    westAveMesh.rotation.x = -Math.PI / 2;
    westAveMesh.position.set(-65, 0.13, 0);
    westAveMesh.receiveShadow = true;
    scene.add(westAveMesh);

    // East Avenue: Street to Diamond Market
    const eastAveGeo = new THREE.PlaneGeometry(80, 32);
    const eastAveMesh = new THREE.Mesh(eastAveGeo, plazaMat);
    eastAveMesh.rotation.x = -Math.PI / 2;
    eastAveMesh.position.set(65, 0.13, 0);
    eastAveMesh.receiveShadow = true;
    scene.add(eastAveMesh);

    // -------------------------------------------------------------
    // INTERACTIVE VENUES LIST
    // -------------------------------------------------------------
    const interactiveBuildings: Array<{
      id: string;
      name: string;
      type: 'saloon' | 'boss' | 'bank' | 'shop' | 'wheel';
      x: number;
      z: number;
      actionText: string;
      description: string;
      gameMode: 'cash' | 'tournament' | 'boss_duel';
      stakes: string;
      meshGroup: THREE.Group;
    }> = [];

    // Shared Materials
    const tudorWallTex = createTudorWallTexture();
    const tudorWallMat = new THREE.MeshStandardMaterial({ map: tudorWallTex, roughness: 0.8 });
    const roofTex = createRoofTilesTexture();
    const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.65 });
    const woodBeamMat = new THREE.MeshStandardMaterial({ color: '#3a2012', roughness: 0.85 });
    const stonePillarMat = new THREE.MeshStandardMaterial({ color: '#ded7c6', roughness: 0.9 });
    const stoneWallMat = new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.25 });

    // Helper: Create a Classic Street Lantern Post
    const createStreetLantern = (x: number, z: number) => {
      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(x, 0, z);

      // Dark iron pole
      const poleGeo = new THREE.CylinderGeometry(0.3, 0.45, 12, 12);
      const ironMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7, metalness: 0.4 });
      const pole = new THREE.Mesh(poleGeo, ironMat);
      pole.position.y = 6;
      pole.castShadow = true;
      lanternGroup.add(pole);

      // Octagonal warm amber housing
      const houseGeo = new THREE.CylinderGeometry(1.2, 0.9, 2.2, 6);
      const houseMat = new THREE.MeshStandardMaterial({
        color: '#fef08a',
        emissive: '#f59e0b',
        emissiveIntensity: 0.65,
        roughness: 0.3,
      });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.y = 12.8;
      lanternGroup.add(house);

      // Pointed pyramidal roof cap
      const capGeo = new THREE.ConeGeometry(1.6, 1.4, 6);
      const capMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 14.4;
      lanternGroup.add(cap);

      // Warm point light
      const light = new THREE.PointLight('#fef08a', 0.85, 24);
      light.position.y = 12.8;
      lanternGroup.add(light);

      scene.add(lanternGroup);
      return lanternGroup;
    };

    // Helper: Create Colorful Pastel Produce/Eggs for market stalls
    const createEggBatch = (parentGroup: THREE.Group, startX: number, startZ: number, count = 10) => {
      const eggColors = ['#fbcfe8', '#e9d5ff', '#a7f3d0', '#fef08a', '#ffedd5', '#f1f5f9'];
      for (let i = 0; i < count; i++) {
        const eggMat = new THREE.MeshStandardMaterial({
          color: eggColors[i % eggColors.length],
          roughness: 0.35,
        });
        const eggGeo = new THREE.SphereGeometry(0.65, 12, 12);
        const egg = new THREE.Mesh(eggGeo, eggMat);
        egg.scale.set(0.85, 1.25, 0.85);
        egg.position.set(startX + (i % 5) * 1.6, 5.7, startZ + Math.floor(i / 5) * 1.5);
        egg.castShadow = true;
        parentGroup.add(egg);
      }
    };

    // -------------------------------------------------------------
    // 4. THE GRAND ENTRANCE GATE & STONE DEFENSIVE WALLS (z = 210)
    // -------------------------------------------------------------
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 210);

    // Left and Right Fortified Stone Watchtowers
    [-29, 29].forEach((px) => {
      const towerGeo = new THREE.BoxGeometry(8, 28, 8);
      const tower = new THREE.Mesh(towerGeo, stonePillarMat);
      tower.position.set(px, 14, 0);
      tower.castShadow = true;
      tower.receiveShadow = true;
      gateGroup.add(tower);

      // Crenellated battlements on tower top
      const topCapGeo = new THREE.BoxGeometry(9.2, 2.0, 9.2);
      const topCap = new THREE.Mesh(topCapGeo, stoneWallMat);
      topCap.position.set(px, 29, 0);
      topCap.castShadow = true;
      gateGroup.add(topCap);
    });

    // Outer Fortress Stone Perimeter Walls
    [-80, 80].forEach((wx) => {
      const wallGeo = new THREE.BoxGeometry(90, 18, 6);
      const wall = new THREE.Mesh(wallGeo, stoneWallMat);
      wall.position.set(wx > 0 ? wx + 25 : wx - 25, 9, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      gateGroup.add(wall);
    });

    // Grand Entrance Arch Sign ("WELCOME TO BOWER KINGDOM")
    const bannerTex = createSignTexture('WELCOME TO BOWER KINGDOM', '#19393e', '#ffffff', '#e2e8f0');
    const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.5 });
    const bannerGeo = new THREE.BoxGeometry(48, 5.8, 1.4);
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(0, 24, 0);
    bannerMesh.castShadow = true;
    gateGroup.add(bannerMesh);

    // Left and Right Entrance Guard/Stall Tables
    [-20, 20].forEach((tx, idx) => {
      const tableTopGeo = new THREE.BoxGeometry(10, 0.8, 4.0);
      const tableTopMat = new THREE.MeshStandardMaterial({ color: '#dfc79b', roughness: 0.75 });
      const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
      tableTop.position.set(tx, 4.6, 0);
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      gateGroup.add(tableTop);

      createEggBatch(gateGroup, tx - 3.5, -0.6, 8);
      createStreetLantern(tx + (idx === 0 ? -6 : 6), 202);
    });

    scene.add(gateGroup);

    // -------------------------------------------------------------
    // 5. THE TIERED WATER FOUNTAIN (In the exact center of Crown Plaza: 0, 0, 0)
    // -------------------------------------------------------------
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, 0);

    // Circular stone basin rim (radius 14)
    const basinGeo = new THREE.CylinderGeometry(14, 14.8, 2.8, 40, 1, true);
    const basin = new THREE.Mesh(basinGeo, stonePillarMat);
    basin.position.y = 1.4;
    basin.castShadow = true;
    basin.receiveShadow = true;
    fountainGroup.add(basin);

    // Basin pool water
    const poolGeo = new THREE.CircleGeometry(13.6, 40);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const pool = new THREE.Mesh(poolGeo, waterMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = 2.0;
    fountainGroup.add(pool);

    // Center fluted stone column pedestal
    const colGeo = new THREE.CylinderGeometry(2.4, 3.2, 8.0, 20);
    const col = new THREE.Mesh(colGeo, stonePillarMat);
    col.position.y = 4.8;
    col.castShadow = true;
    fountainGroup.add(col);

    // Upper circular tier bowl
    const upperBowlGeo = new THREE.CylinderGeometry(6.4, 2.6, 2.0, 24);
    const upperBowl = new THREE.Mesh(upperBowlGeo, stonePillarMat);
    upperBowl.position.y = 9.2;
    upperBowl.castShadow = true;
    fountainGroup.add(upperBowl);

    // Upper bowl water pool
    const upperWaterGeo = new THREE.CircleGeometry(6.0, 24);
    const upperWater = new THREE.Mesh(upperWaterGeo, waterMat);
    upperWater.rotation.x = -Math.PI / 2;
    upperWater.position.y = 10.15;
    fountainGroup.add(upperWater);

    // Center bubbling fountain jet
    const jetGeo = new THREE.CylinderGeometry(0.5, 0.8, 6.0, 16);
    const jetMat = new THREE.MeshStandardMaterial({
      color: '#e0f2fe',
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
    });
    const jet = new THREE.Mesh(jetGeo, jetMat);
    jet.position.y = 13.0;
    fountainGroup.add(jet);

    scene.add(fountainGroup);

    // -------------------------------------------------------------
    // 6. PARK BENCHES, CANOPY TREES, AND STREET LIGHTS AROUND PLAZA
    // -------------------------------------------------------------
    // Slatted Wooden Park Benches (Placed at 32 units around the fountain)
    const createParkBench = (bx: number, bz: number, brot: number) => {
      const benchGroup = new THREE.Group();
      benchGroup.position.set(bx, 0, bz);
      benchGroup.rotation.y = brot;

      const woodMat = new THREE.MeshStandardMaterial({ color: '#5c3317', roughness: 0.8 });
      const frameMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });

      // Seat slats
      for (let s = 0; s < 3; s++) {
        const slatGeo = new THREE.BoxGeometry(8.5, 0.35, 0.9);
        const slat = new THREE.Mesh(slatGeo, woodMat);
        slat.position.set(0, 1.8, -1.0 + s * 1.0);
        slat.castShadow = true;
        benchGroup.add(slat);
      }
      // Backrest slats
      for (let b = 0; b < 3; b++) {
        const backGeo = new THREE.BoxGeometry(8.5, 0.8, 0.3);
        const back = new THREE.Mesh(backGeo, woodMat);
        back.position.set(0, 2.7 + b * 0.9, -1.5);
        back.castShadow = true;
        benchGroup.add(back);
      }
      // End frames
      [-3.8, 3.8].forEach((fx) => {
        const legGeo = new THREE.BoxGeometry(0.5, 2.8, 2.6);
        const leg = new THREE.Mesh(legGeo, frameMat);
        leg.position.set(fx, 1.4, 0);
        leg.castShadow = true;
        benchGroup.add(leg);
      });

      scene.add(benchGroup);
    };

    // 4 Cardinal Benches around fountain
    createParkBench(0, -32, 0);
    createParkBench(0, 32, Math.PI);
    createParkBench(-32, 0, Math.PI / 2);
    createParkBench(32, 0, -Math.PI / 2);

    // Spherical Low-Poly Green Trees (Matching static colliders)
    const createStylizedTree = (tx: number, tz: number, scale = 1.0) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0, tz);
      treeGroup.scale.set(scale, scale, scale);

      // Brown trunk
      const trunkGeo = new THREE.CylinderGeometry(1.2, 1.6, 12.0, 10);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#452a17', roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 6.0;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Spherical foliage canopy
      const leavesMat = new THREE.MeshStandardMaterial({ color: '#3f6240', roughness: 0.75, flatShading: true });
      const foliageGeo = new THREE.SphereGeometry(7.5, 14, 12);
      const foliage = new THREE.Mesh(foliageGeo, leavesMat);
      foliage.position.y = 16.0;
      foliage.castShadow = true;
      treeGroup.add(foliage);

      scene.add(treeGroup);
    };

    // Trees along avenues and outer plazas
    createStylizedTree(-24, -80, 1.15);
    createStylizedTree(24, -80, 1.15);
    createStylizedTree(-24, -120, 1.25);
    createStylizedTree(24, -120, 1.25);

    createStylizedTree(-24, 70, 1.1);
    createStylizedTree(24, 70, 1.1);
    createStylizedTree(-24, 130, 1.2);
    createStylizedTree(24, 130, 1.2);

    createStylizedTree(-65, -40, 1.2);
    createStylizedTree(-65, 40, 1.2);
    createStylizedTree(65, -40, 1.2);
    createStylizedTree(65, 40, 1.2);

    // Plaza & Boulevard Lanterns
    createStreetLantern(-26, -26);
    createStreetLantern(26, -26);
    createStreetLantern(-26, 26);
    createStreetLantern(26, 26);
    createStreetLantern(-18, 100);
    createStreetLantern(18, 100);
    createStreetLantern(-18, -100);
    createStreetLantern(18, -100);

    // -------------------------------------------------------------
    // 7. SURROUNDING TUDOR HALF-TIMBER BUILDINGS (Separated 5x layout)
    // -------------------------------------------------------------

    // Helper: Create Tudor Half-Timber Building
    const createTudorBuilding = (
      x: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      signText: string,
      signColor: string,
      signIcon = ''
    ) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(x, 0, z);

      // Main stucco body
      const bodyGeo = new THREE.BoxGeometry(width, height, depth);
      const body = new THREE.Mesh(bodyGeo, tudorWallMat);
      body.position.y = height / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      bGroup.add(body);

      // Pitched terracotta gabled roof
      const roofPeak = height + 14;
      const roofGeo = new THREE.ConeGeometry(width * 0.75, 16, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = roofPeak;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.05, 1.0, depth / (width * 0.75));
      roof.castShadow = true;
      bGroup.add(roof);

      // Dark wood timber eave trims
      const eaveGeo = new THREE.BoxGeometry(width + 2, 1.0, depth + 2);
      const eave = new THREE.Mesh(eaveGeo, woodBeamMat);
      eave.position.y = height;
      bGroup.add(eave);

      // Front Storefront Sign Board
      const signTex = createSignTexture(signText, signColor, '#ffffff', '#fbbf24', signIcon);
      const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 });
      const signGeo = new THREE.BoxGeometry(width * 0.65, 4.8, 0.6);
      const signMesh = new THREE.Mesh(signGeo, signMat);
      signMesh.position.set(0, height * 0.72, depth / 2 + 0.4);
      signMesh.castShadow = true;
      bGroup.add(signMesh);

      // Arched Entry Doorway
      const doorGeo = new THREE.BoxGeometry(6.0, 10.0, 0.6);
      const doorMat = new THREE.MeshStandardMaterial({ color: '#2d180b', roughness: 0.9 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 5.0, depth / 2 + 0.4);
      bGroup.add(door);

      // Cozy door lantern
      createStreetLantern(x > 0 ? x - 6 : x + 6, z + depth / 2 + 4);

      scene.add(bGroup);
      return bGroup;
    };

    // Helper: Outdoor Patio Table with Benches
    const createPatioTable = (tx: number, tz: number) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(tx, 0, tz);

      const tableTopGeo = new THREE.BoxGeometry(10, 0.6, 5);
      const tableTopMat = new THREE.MeshStandardMaterial({ color: '#654321', roughness: 0.8 });
      const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
      tableTop.position.y = 3.5;
      tableTop.castShadow = true;
      tableGroup.add(tableTop);

      [-3.5, 3.5].forEach((lx) => {
        const legGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.5, 8);
        const leg = new THREE.Mesh(legGeo, woodBeamMat);
        leg.position.set(lx, 1.75, 0);
        leg.castShadow = true;
        tableGroup.add(leg);
      });

      // Flanking benches
      [-3.8, 3.8].forEach((bz) => {
        const bGeo = new THREE.BoxGeometry(9, 0.4, 1.8);
        const bench = new THREE.Mesh(bGeo, tableTopMat);
        bench.position.set(0, 2.0, bz);
        bench.castShadow = true;
        tableGroup.add(bench);
      });

      scene.add(tableGroup);
    };

    // Helper: Bazaar Market Stall with Striped Canopy
    const createBazaarStall = (sx: number, sz: number, canopyColor: string) => {
      const stallGroup = new THREE.Group();
      stallGroup.position.set(sx, 0, sz);

      // Wooden counter table
      const counterGeo = new THREE.BoxGeometry(12, 3.6, 4.8);
      const counterMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85 });
      const counter = new THREE.Mesh(counterGeo, counterMat);
      counter.position.y = 1.8;
      counter.castShadow = true;
      stallGroup.add(counter);

      // Striped awning canopy
      const canopyGeo = new THREE.BoxGeometry(13.5, 0.6, 6.2);
      const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.6 });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 7.2;
      canopy.castShadow = true;
      stallGroup.add(canopy);

      // Corner posts
      [-5.5, 5.5].forEach((px) => {
        [-2.0, 2.0].forEach((pz) => {
          const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 5.4, 6);
          const post = new THREE.Mesh(postGeo, woodBeamMat);
          post.position.set(px, 4.5, pz);
          post.castShadow = true;
          stallGroup.add(post);
        });
      });

      createEggBatch(stallGroup, -4.2, -1.0, 10);
      scene.add(stallGroup);
    };

    // 1. LEFT WING: "HEART TAVERN" (West District: x = -120, z = 0)
    const tavernGroup = createTudorBuilding(
      -120,
      0,
      48,
      32,
      64,
      'HEART TAVERN',
      '#9d174d',
      '♥'
    );
    // Hanging pink tavern banner
    const bannerFlagGeo = new THREE.PlaneGeometry(5.0, 14.0);
    const flagMat = new THREE.MeshStandardMaterial({ color: '#ec4899', side: THREE.DoubleSide, roughness: 0.6 });
    const bannerFlag = new THREE.Mesh(bannerFlagGeo, flagMat);
    bannerFlag.position.set(-104, 24, 18);
    bannerFlag.rotation.y = Math.PI / 2;
    scene.add(bannerFlag);

    // Tavern Beer Garden Patio Tables
    createPatioTable(-82, -14);
    createPatioTable(-82, 14);

    interactiveBuildings.push({
      id: 'building_heart_tavern',
      name: 'Heart Tavern',
      type: 'saloon',
      x: -100,
      z: 0,
      actionText: 'ENTER HEART TAVERN',
      description: `The grand parlor of ${currentTown.name}. Join 4-seat cash tables and local cup brackets!`,
      gameMode: 'cash',
      stakes: `$${currentTown.buyIn} Buy-in`,
      meshGroup: tavernGroup,
    });

    // 2. RIGHT WING: "DIAMOND MARKET" (East District: x = 120, z = 0)
    const marketGroup = createTudorBuilding(
      120,
      0,
      48,
      32,
      64,
      'DIAMOND MARKET',
      '#1e40af',
      '♦'
    );

    // Covered Bazaar Stalls in Market Square
    createBazaarStall(80, -18, '#3b82f6');
    createBazaarStall(80, 18, '#10b981');

    interactiveBuildings.push({
      id: 'building_diamond_market',
      name: 'Diamond Market',
      type: 'shop',
      x: 100,
      z: 0,
      actionText: 'VISIT DIAMOND MARKET',
      description: 'Trade playing card decks, lucky charms, outfits, and booster packs.',
      gameMode: 'cash',
      stakes: 'Shop & Trading',
      meshGroup: marketGroup,
    });

    // 3. NORTH PALACE: "SPADE HALL" (North District: x = 0, z = -190)
    const hallGroup = new THREE.Group();
    hallGroup.position.set(0, 0, -190);

    const hallBodyGeo = new THREE.BoxGeometry(104, 44, 60);
    const hallBody = new THREE.Mesh(hallBodyGeo, tudorWallMat);
    hallBody.position.y = 22;
    hallBody.castShadow = true;
    hallBody.receiveShadow = true;
    hallGroup.add(hallBody);

    // Grand gabled palace roof
    const hallRoofGeo = new THREE.ConeGeometry(74, 22, 4);
    const hallRoof = new THREE.Mesh(hallRoofGeo, roofMat);
    hallRoof.position.y = 55;
    hallRoof.rotation.y = Math.PI / 4;
    hallRoof.scale.set(1.1, 1.0, 60 / 52);
    hallRoof.castShadow = true;
    hallGroup.add(hallRoof);

    // Spade Hall Purple Sign
    const spadeTex = createSignTexture('SPADE HALL', '#5b21b6', '#ffffff', '#fbbf24', '♠');
    const spadeMat = new THREE.MeshStandardMaterial({ map: spadeTex, roughness: 0.5 });
    const spadeSignGeo = new THREE.BoxGeometry(42, 6.2, 0.8);
    const spadeSign = new THREE.Mesh(spadeSignGeo, spadeMat);
    spadeSign.position.set(0, 32, 30.5);
    hallGroup.add(spadeSign);

    // Golden glowing arched central portal
    const archGeo = new THREE.BoxGeometry(16, 22, 1.2);
    const archMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: '#d97706',
      emissiveIntensity: 0.7,
    });
    const archPortal = new THREE.Mesh(archGeo, archMat);
    archPortal.position.set(0, 11, 30.4);
    hallGroup.add(archPortal);

    // Golden Trophy Monument Pedestal in front of Spade Hall (z = -168 world pos)
    const pedestalGeo = new THREE.CylinderGeometry(4.0, 5.0, 5.0, 12);
    const pedestal = new THREE.Mesh(pedestalGeo, stonePillarMat);
    pedestal.position.set(0, 2.5, 22);
    pedestal.castShadow = true;
    hallGroup.add(pedestal);

    const trophyGeo = new THREE.OctahedronGeometry(2.6, 0);
    const trophy = new THREE.Mesh(trophyGeo, goldMat);
    trophy.position.set(0, 7.0, 22);
    trophy.castShadow = true;
    hallGroup.add(trophy);

    const trophyLight = new THREE.PointLight('#f59e0b', 1.4, 30);
    trophyLight.position.set(0, 8, 22);
    hallGroup.add(trophyLight);

    scene.add(hallGroup);

    interactiveBuildings.push({
      id: 'building_spade_hall',
      name: `${currentTown.bossName}'s Spade Hall`,
      type: 'boss',
      x: 0,
      z: -155,
      actionText: `CHALLENGE ${currentTown.bossName.toUpperCase()}`,
      description: `High-stakes championship duel to claim ${currentTown.name}!`,
      gameMode: 'boss_duel',
      stakes: `Boss: ${currentTown.bossName}`,
      meshGroup: hallGroup,
    });

    // -------------------------------------------------------------
    // 8. FOREGROUND ROUNDED CANOPY BUSHES (Framing the south entrance boulevard)
    // -------------------------------------------------------------
    const bushMat = new THREE.MeshStandardMaterial({ color: '#4a6f4e', roughness: 0.8, flatShading: true });
    [
      [-36, 180, 2.0],
      [36, 180, 2.0],
      [-42, 165, 1.8],
      [42, 165, 1.8],
    ].forEach(([bx, bz, bscale]) => {
      const bushGeo = new THREE.SphereGeometry(6.0 * bscale, 10, 8);
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.scale.set(1.0, 1.25, 1.0);
      bush.position.set(bx, 4.0 * bscale, bz);
      scene.add(bush);
    });

    // -------------------------------------------------------------
    // 9. 3D HERO CHARACTER & PLAZA CITIZENS
    // -------------------------------------------------------------
    const heroChar = create3DPlayerCharacter(playerProfile);
    const heroGroup = heroChar.group;
    heroGroup.position.set(playerPos.current.x, 0, playerPos.current.z);
    heroGroup.rotation.y = playerPos.current.rot;
    scene.add(heroGroup);

    // -------------------------------------------------------------
    // 10. 3D ROYAL STEAM BUGGY VEHICLE
    // -------------------------------------------------------------
    const steamBuggy = create3DSteamBuggy(scene, {
      x: drivingData.current.x,
      z: drivingData.current.z,
      rot: drivingData.current.rot,
    });
    vehicleInstanceRef.current = steamBuggy;

    // -------------------------------------------------------------
    // 11. DYNAMIC PHYSICS PROPS (BARRELS & CRATES)
    // -------------------------------------------------------------
    const dynamicProps = createDynamicProps(scene);

    // -------------------------------------------------------------
    // 12. PLAZA CITIZENS & ROAMING NPCS
    // -------------------------------------------------------------
    // NPC 1: Dia (Heart Tavern Host)
    const npcDia = create3DPlayerCharacter(
      { ...playerProfile, name: 'Dia', level: 9 },
      {
        shirtColor: '#9d174d', // Heart Tavern Magenta
        hairColor: '#3a2012',
        pantsColor: '#1e293b',
        shoesColor: '#a8934a',
        skinColor: '#dfb594',
      }
    );
    scene.add(npcDia.group);

    // NPC 2: Aldo (Diamond Market Merchant)
    const npcAldo = create3DPlayerCharacter(
      { ...playerProfile, name: 'Aldo', level: 11 },
      {
        shirtColor: '#1e40af', // Diamond Blue
        hairColor: '#52525b',
        pantsColor: '#18181b',
        shoesColor: '#78350f',
        skinColor: '#d6a37e',
      }
    );
    scene.add(npcAldo.group);

    // NPC 3: Tavern Guard (Grand Entrance Sentry)
    const npcGuard = create3DPlayerCharacter(
      { ...playerProfile, name: 'Tavern Guard', level: 14 },
      {
        shirtColor: '#5b21b6', // Royal Purple
        hairColor: '#27272a',
        pantsColor: '#09090b',
        shoesColor: '#a16207',
        skinColor: '#e0b595',
      }
    );
    scene.add(npcGuard.group);

    // NPC 4: Silas (Market Produce Trader)
    const npcSilas = create3DPlayerCharacter(
      { ...playerProfile, name: 'Trader Silas', level: 8 },
      {
        shirtColor: '#d97706', // Warm Amber
        hairColor: '#713f12',
        pantsColor: '#292524',
        shoesColor: '#451a03',
        skinColor: '#e5c29f',
      }
    );
    scene.add(npcSilas.group);

    // NPC 5: Lady Clara (Visiting Duchess)
    const npcClara = create3DPlayerCharacter(
      { ...playerProfile, name: 'Lady Clara', level: 16 },
      {
        shirtColor: '#047857', // Emerald Silk
        hairColor: '#451a03',
        pantsColor: '#1e293b',
        shoesColor: '#ca8a04',
        skinColor: '#f1d2b8',
      }
    );
    scene.add(npcClara.group);

    // Living NPC agent state with wandering zones and bump quotes (scaled to 5x town)
    const npcAgents = [
      {
        id: 'dia',
        name: 'Dia',
        role: 'Tavern Hostess',
        pos: { x: -80, z: 0, rot: Math.PI / 3 },
        startPos: { x: -80, z: 0 },
        wanderRadius: 16.0,
        target: { x: -80, z: 0 },
        speed: 5.5,
        radius: 1.25,
        waitTimer: 2.0,
        isMoving: false,
        char: npcDia,
        bumpQuote: 'Careful with the pints, traveler! Heart Tavern welcomes you.',
      },
      {
        id: 'aldo',
        name: 'Aldo',
        role: 'Market Merchant',
        pos: { x: 78, z: -4, rot: -Math.PI / 3 },
        startPos: { x: 78, z: -4 },
        wanderRadius: 16.0,
        target: { x: 78, z: -4 },
        speed: 5.0,
        radius: 1.25,
        waitTimer: 3.0,
        isMoving: false,
        char: npcAldo,
        bumpQuote: 'Mind the antique decks! Take a seat inside for big stakes.',
      },
      {
        id: 'guard',
        name: 'Tavern Guard',
        role: 'Royal Sentry',
        pos: { x: -18, z: 185, rot: 0 },
        startPos: { x: -18, z: 185 },
        wanderRadius: 14.0,
        target: { x: -18, z: 185 },
        speed: 4.5,
        radius: 1.25,
        waitTimer: 4.0,
        isMoving: false,
        char: npcGuard,
        bumpQuote: 'Halt, citizen! Mind your step and respect the King’s peace.',
      },
      {
        id: 'silas',
        name: 'Trader Silas',
        role: 'Plaza Peddler',
        pos: { x: -14, z: 75, rot: 0 },
        startPos: { x: -14, z: 75 },
        wanderRadius: 18.0,
        target: { x: -14, z: 75 },
        speed: 5.2,
        radius: 1.25,
        waitTimer: 2.5,
        isMoving: false,
        char: npcSilas,
        bumpQuote: 'Fresh cider and cards for sale! Pardon me, traveler.',
      },
      {
        id: 'clara',
        name: 'Lady Clara',
        role: 'Kingdom Noble',
        pos: { x: 22, z: -20, rot: -Math.PI / 4 },
        startPos: { x: 22, z: -20 },
        wanderRadius: 16.0,
        target: { x: 22, z: -20 },
        speed: 4.2,
        radius: 1.25,
        waitTimer: 3.5,
        isMoving: false,
        char: npcClara,
        bumpQuote: 'Oh my goodness! Watch your carriage around the fountain!',
      },
    ];

    // Speech bubble trigger with auto-dismiss
    let speechDismissTimeout: any = null;
    const triggerNpcSpeech = (name: string, text: string, role: string) => {
      setNpcSpeechBubble({ name, text, role });
      if (speechDismissTimeout) clearTimeout(speechDismissTimeout);
      speechDismissTimeout = setTimeout(() => {
        setNpcSpeechBubble(null);
      }, 3500);
    };

    // -------------------------------------------------------------
    // POINTER EVENTS: 360° USER DRAG ROTATION & CLICK INTERACTION
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Hover nameplate raycasting: ONLY show nameplate when cursor hovers over character
    const updateCharacterHover = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        heroChar.setNameplateVisible(false);
        npcAgents.forEach((npc) => npc.char.setNameplateVisible(false));
        return;
      }

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // 1. Check Player character
      const heroHits = raycaster.intersectObject(heroChar.group, true);
      const isHeroHovered = heroHits.length > 0;
      heroChar.setNameplateVisible(isHeroHovered);

      // 2. Check each NPC agent
      npcAgents.forEach((npc) => {
        const npcHits = raycaster.intersectObject(npc.char.group, true);
        const isNpcHovered = npcHits.length > 0;
        npc.char.setNameplateVisible(isNpcHovered);
      });
    };

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      hasDragged.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isPointerDown.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        if (Math.hypot(dx, dy) > 4) {
          hasDragged.current = true;
        }

        // Smooth camera yaw & pitch orbit
        cameraYaw.current += dx * 0.007;
        cameraPitch.current = Math.max(0.16, Math.min(1.22, cameraPitch.current - dy * 0.005));

        dragStart.current = { x: e.clientX, y: e.clientY };
      } else {
        // Free hover: detect hover over player or NPCs to show nameplates
        updateCharacterHover(e.clientX, e.clientY);
      }
    };

    const handlePointerLeave = () => {
      heroChar.setNameplateVisible(false);
      npcAgents.forEach((npc) => npc.char.setNameplateVisible(false));
    };

    const handlePointerUp = (e: PointerEvent) => {
      isPointerDown.current = false;

      // If user did not drag the camera, treat as a click to interact or walk
      if (!hasDragged.current) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // 1. Check Steam Buggy Vehicle Click
        const buggyIntersects = raycaster.intersectObject(steamBuggy.group, true);
        if (buggyIntersects.length > 0) {
          if (!isDrivingRef.current) {
            handleEnterVehicle();
            return;
          }
        }

        // 2. Check interactive building click
        const buildingHitList: THREE.Object3D[] = [];
        interactiveBuildings.forEach((b) => buildingHitList.push(b.meshGroup));
        const buildingIntersects = raycaster.intersectObjects(buildingHitList, true);
        if (buildingIntersects.length > 0) {
          const clickedObj = buildingIntersects[0].object;
          let curr: THREE.Object3D | null = clickedObj;
          let hitBuilding = null;
          while (curr && !hitBuilding) {
            hitBuilding = interactiveBuildings.find((b) => b.meshGroup === curr);
            curr = curr.parent;
          }

          if (hitBuilding) {
            sounds.playClick();
            handleTriggerBuilding(hitBuilding.gameMode);
            return;
          }
        }

        // 3. Click to walk on ground (only if not driving)
        if (!isDrivingRef.current) {
          const intersects = raycaster.intersectObject(ground);
          if (intersects.length > 0) {
            const hit = intersects[0].point;
            const clampedX = Math.max(-140, Math.min(140, hit.x));
            const clampedZ = Math.max(-200, Math.min(200, hit.z));
            targetWalkPos.current = { x: clampedX, z: clampedZ };
            sounds.playClick();
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    // -------------------------------------------------------------
    // RENDER LOOP & REAL-TIME PHYSICS SIMULATION
    // -------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let lastHUDUpdate = 0;
    let lastOverheadTagUpdate = 0;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1); // clamp delta
      const time = clock.getElapsedTime();

      // Animate tiered water fountain jet & water surface
      jet.scale.y = 1.0 + Math.sin(time * 6.0) * 0.12;
      upperWater.rotation.z = time * 0.25;
      pool.rotation.z = -time * 0.15;

      // Update Compass Heading
      const headingDeg = Math.round(((-cameraYaw.current * 180) / Math.PI) % 360 + 360) % 360;
      setCameraHeadingDeg(headingDeg);

      // =============================================================
      // MODE A: DRIVING THE ROYAL STEAM BUGGY
      // =============================================================
      if (isDrivingRef.current) {
        // Vehicle Throttle & Acceleration
        const isGas = keysPressed.current['w'] || keysPressed.current['arrowup'];
        const isBrake = keysPressed.current['s'] || keysPressed.current['arrowdown'];
        const isHandbrake = keysPressed.current[' '];

        if (isGas) {
          drivingData.current.speed = Math.min(44, drivingData.current.speed + 32 * delta);
          drivingData.current.gear = 'D';
        } else if (isBrake) {
          if (drivingData.current.speed > 0.5) {
            drivingData.current.speed = Math.max(0, drivingData.current.speed - 38 * delta);
            drivingData.current.gear = 'D';
          } else {
            drivingData.current.speed = Math.max(-18, drivingData.current.speed - 22 * delta);
            drivingData.current.gear = 'R';
          }
        } else {
          // Coasting drag
          drivingData.current.speed *= (1 - 1.8 * delta);
          if (Math.abs(drivingData.current.speed) < 0.1) drivingData.current.speed = 0;
          if (drivingData.current.speed === 0) drivingData.current.gear = 'P';
        }

        // Spacebar Handbrake
        if (isHandbrake) {
          drivingData.current.speed *= (1 - 5.5 * delta);
        }

        // Vehicle Steering
        const isSteerLeft = keysPressed.current['a'] || keysPressed.current['arrowleft'];
        const isSteerRight = keysPressed.current['d'] || keysPressed.current['arrowright'];

        if (isSteerLeft) {
          drivingData.current.steer = Math.min(0.55, drivingData.current.steer + 4.5 * delta);
        } else if (isSteerRight) {
          drivingData.current.steer = Math.max(-0.55, drivingData.current.steer - 4.5 * delta);
        } else {
          drivingData.current.steer *= (1 - 7.0 * delta);
        }

        // Integrate Heading & Position
        const turnRate = (drivingData.current.speed / 16) * drivingData.current.steer;
        drivingData.current.rot += turnRate * delta;

        const forwardX = Math.sin(drivingData.current.rot);
        const forwardZ = Math.cos(drivingData.current.rot);
        drivingData.current.x += forwardX * drivingData.current.speed * delta;
        drivingData.current.z += forwardZ * drivingData.current.speed * delta;

        // -----------------------------------------------------------
        // VEHICLE COLLISION PHYSICS (OBJECTS & OBJECTS)
        // -----------------------------------------------------------
        // 1. Vehicle vs Static Obstacles (Buildings, Fountain, Benches, Trees, Bounds)
        const vehiclePos = { x: drivingData.current.x, z: drivingData.current.z };
        const hasCollidedObstacle = resolvePersonObstacles(vehiclePos, 3.8);

        if (hasCollidedObstacle) {
          drivingData.current.x = vehiclePos.x;
          drivingData.current.z = vehiclePos.z;

          if (Math.abs(drivingData.current.speed) > 4.0) {
            sounds.playCollisionThud();
            // Elastic recoil bounce
            drivingData.current.speed = -drivingData.current.speed * 0.35;
          } else {
            drivingData.current.speed = 0;
          }
        }

        // 2. Vehicle vs Dynamic Barrels & Crates
        stepDynamicProps(dynamicProps, delta, playerPos.current, 1.25, {
          pos: vehiclePos,
          speed: drivingData.current.speed,
          rot: drivingData.current.rot,
          radius: 3.8,
        });

        // 3. Vehicle vs People / NPCs (Push people safely aside)
        npcAgents.forEach((npc) => {
          const dx = npc.pos.x - drivingData.current.x;
          const dz = npc.pos.z - drivingData.current.z;
          const dist = Math.hypot(dx, dz);
          const minDist = 5.2;

          if (dist < minDist) {
            const nx = (dx / (dist || 1));
            const nz = (dz / (dist || 1));
            npc.pos.x += nx * 3.4;
            npc.pos.z += nz * 3.4;
            resolvePersonObstacles(npc.pos, npc.radius);
            sounds.playNpcBump();
            triggerNpcSpeech(npc.name, 'Whoa there! Mind the carriage wheels!', npc.role);
          }
        });

        // Synchronize Buggy 3D Mesh
        steamBuggy.group.position.set(drivingData.current.x, 0, drivingData.current.z);
        steamBuggy.group.rotation.y = drivingData.current.rot;
        steamBuggy.updateAnimation(delta, drivingData.current.speed, drivingData.current.steer);

        // Seated Player Character in Driver Seat
        heroGroup.position.set(drivingData.current.x, 0.45, drivingData.current.z);
        heroGroup.rotation.y = drivingData.current.rot;
        heroChar.updateAnimation(delta * 0.1, false);

        // Synchronize Player Pos ref
        playerPos.current.x = drivingData.current.x;
        playerPos.current.z = drivingData.current.z;
        playerPos.current.rot = drivingData.current.rot;

        // Camera Follows Vehicle smoothly from behind
        const camDistance = 26;
        const targetCamX = drivingData.current.x - Math.sin(drivingData.current.rot) * camDistance;
        const targetCamZ = drivingData.current.z - Math.cos(drivingData.current.rot) * camDistance;
        const targetCamY = 16.0;
        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.08);
        camera.lookAt(drivingData.current.x, 3.5, drivingData.current.z);

        // Update Driving HUD UI at throttled rate
        if (time - lastHUDUpdate > 0.06) {
          lastHUDUpdate = time;
          setDrivingHUD({
            speed: Math.round(Math.abs(drivingData.current.speed)),
            gear: drivingData.current.gear,
            lightsOn: drivingData.current.lightsOn,
          });
        }
      } else {
        // =============================================================
        // MODE B: WALKING CHARACTER WITH 360° USER ROTATION
        // =============================================================

        // Keyboard Camera Orbit (Q: Left, E: Right when not near interactable)
        if (keysPressed.current['q']) {
          cameraYaw.current -= 1.8 * delta;
        }
        if (keysPressed.current['e'] && !activeBuildingPrompt && !activeVehiclePrompt) {
          cameraYaw.current += 1.8 * delta;
        }

        // Camera-Relative Movement Vectors
        const camForwardX = -Math.sin(cameraYaw.current);
        const camForwardZ = -Math.cos(cameraYaw.current);
        const camRightX = Math.cos(cameraYaw.current);
        const camRightZ = -Math.sin(cameraYaw.current);

        let moveX = 0;
        let moveZ = 0;
        let isMoving = false;
        const speed = 22 * delta;

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
          moveX += camForwardX;
          moveZ += camForwardZ;
          isMoving = true;
        }
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
          moveX -= camForwardX;
          moveZ -= camForwardZ;
          isMoving = true;
        }
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
          moveX -= camRightX;
          moveZ -= camRightZ;
          isMoving = true;
        }
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
          moveX += camRightX;
          moveZ += camRightZ;
          isMoving = true;
        }

        if (isMoving) {
          const moveLen = Math.hypot(moveX, moveZ);
          if (moveLen > 0.001) {
            playerPos.current.x += (moveX / moveLen) * speed;
            playerPos.current.z += (moveZ / moveLen) * speed;
            playerPos.current.rot = Math.atan2(moveX, moveZ);
          }
        }

        // Click-to-walk logic
        if (targetWalkPos.current) {
          const tdx = targetWalkPos.current.x - playerPos.current.x;
          const tdz = targetWalkPos.current.z - playerPos.current.z;
          const dist = Math.hypot(tdx, tdz);
          if (dist > 1.5) {
            playerPos.current.x += (tdx / dist) * speed;
            playerPos.current.z += (tdz / dist) * speed;
            playerPos.current.rot = Math.atan2(tdx, tdz);
            isMoving = true;
          } else {
            targetWalkPos.current = null;
          }
        }

        // -----------------------------------------------------------
        // COLLISION PHYSICS: PEOPLE & OBJECTS
        // -----------------------------------------------------------
        // 1. Player vs Static Obstacles (Walls, Fountain, Stalls, Benches, Bounds)
        resolvePersonObstacles(playerPos.current, 1.25);

        // 2. Player vs Parked Steam Buggy (Object Collider)
        resolveCircleVsBox(playerPos.current, 1.25, {
          id: 'buggy_parked',
          name: 'Parked Steam Buggy',
          minX: drivingData.current.x - 3.4,
          maxX: drivingData.current.x + 3.4,
          minZ: drivingData.current.z - 5.8,
          maxZ: drivingData.current.z + 5.8,
        });

        // -----------------------------------------------------------
        // COLLISION PHYSICS: PEOPLE & PEOPLE
        // -----------------------------------------------------------
        // 1. Player vs All NPCs
        npcAgents.forEach((npc) => {
          const res = resolveCircleVsCircle(playerPos.current, 1.25, npc.pos, npc.radius, false);
          if (res.collided) {
            sounds.playNpcBump();
            triggerNpcSpeech(npc.name, npc.bumpQuote, npc.role);
          }
        });

        // 2. Dynamic Props Physics (Objects & Objects / People)
        stepDynamicProps(dynamicProps, delta, playerPos.current, 1.25);

        // Update Hero Mesh
        heroGroup.position.set(playerPos.current.x, 0, playerPos.current.z);
        heroGroup.rotation.y = playerPos.current.rot;
        heroChar.updateAnimation(delta, isMoving);

        // Proximity check for Steam Buggy vehicle (scaled to 2.4x)
        const distToBuggy = Math.hypot(
          playerPos.current.x - drivingData.current.x,
          playerPos.current.z - drivingData.current.z
        );
        setActiveVehiclePrompt(distToBuggy < 8.0);

        // Idle buggy animation (steam puffs)
        steamBuggy.updateAnimation(delta, 0, 0);

        // Camera Follow in Walking Mode with User Orbit Yaw & Pitch
        if (cameraMode === 'follow') {
          const camDistH = Math.cos(cameraPitch.current) * zoomDistance.current;
          const camDistV = Math.sin(cameraPitch.current) * zoomDistance.current;
          const targetCamX = playerPos.current.x + Math.sin(cameraYaw.current) * camDistH;
          const targetCamY = 4.5 + camDistV;
          const targetCamZ = playerPos.current.z + Math.cos(cameraYaw.current) * camDistH;

          camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.1);
          camera.lookAt(playerPos.current.x, 4.0, playerPos.current.z);
        } else if (cameraMode === 'birds_eye') {
          camera.position.lerp(new THREE.Vector3(0, 130, 10), 0.08);
          camera.lookAt(0, 0, -10);
        } else {
          camera.position.x = Math.sin(time * 0.15) * 75;
          camera.position.z = Math.cos(time * 0.15) * 75;
          camera.position.y = 40;
          camera.lookAt(playerPos.current.x, 6, playerPos.current.z);
        }
      }

      // =============================================================
      // NPC ROAMING AI & NPC-TO-NPC COLLISION PHYSICS
      // =============================================================
      npcAgents.forEach((npc, i) => {
        // AI wandering waypoints
        npc.waitTimer -= delta;
        if (npc.waitTimer <= 0) {
          // Pick new wander target near startPos
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * npc.wanderRadius;
          npc.target.x = npc.startPos.x + Math.cos(angle) * dist;
          npc.target.z = npc.startPos.z + Math.sin(angle) * dist;
          npc.waitTimer = 3.0 + Math.random() * 4.0;
        }

        const tdx = npc.target.x - npc.pos.x;
        const tdz = npc.target.z - npc.pos.z;
        const tdist = Math.hypot(tdx, tdz);

        if (tdist > 1.0) {
          const moveStep = npc.speed * delta;
          npc.pos.x += (tdx / tdist) * moveStep;
          npc.pos.z += (tdz / tdist) * moveStep;
          npc.pos.rot = Math.atan2(tdx, tdz);
          npc.isMoving = true;
        } else {
          npc.isMoving = false;
        }

        // NPCs respect static obstacles
        resolvePersonObstacles(npc.pos, npc.radius);

        // Pairwise NPC vs NPC Collisions (People & People)
        for (let j = i + 1; j < npcAgents.length; j++) {
          const otherNpc = npcAgents[j];
          resolveCircleVsCircle(npc.pos, npc.radius, otherNpc.pos, otherNpc.radius, false);
        }

        // Update NPC 3D Mesh
        npc.char.group.position.set(npc.pos.x, 0, npc.pos.z);
        npc.char.group.rotation.y = npc.pos.rot;
        npc.char.updateAnimation(delta, npc.isMoving);
        npc.char.head.rotation.y = Math.sin(time * 1.5 + i) * 0.15;
      });

      // Radar coordinates update
      if (onPlayerPositionChange) {
        const normX = Math.round(50 + (playerPos.current.x / 28) * 35);
        const normY = Math.round(50 + (playerPos.current.z / 65) * 35);
        onPlayerPositionChange({ x: normX, y: normY });
      }

      // Interactive building proximity prompt (only when walking)
      if (!isDrivingRef.current) {
        let closestBuilding: typeof activeBuildingPrompt = null;
        let closestDist = 18;

        interactiveBuildings.forEach((b) => {
          const dist = Math.hypot(b.x - playerPos.current.x, b.z - playerPos.current.z);
          if (dist < closestDist) {
            closestDist = dist;
            closestBuilding = {
              id: b.id,
              name: b.name,
              type: b.type,
              actionText: b.actionText,
              description: b.description,
              gameMode: b.gameMode,
              stakes: b.stakes,
            };
          }
        });

        setActiveBuildingPrompt(closestBuilding);
      } else {
        setActiveBuildingPrompt(null);
      }

      // -----------------------------------------------------------
      // REAL-TIME OVERHEAD SPEEDOMETER POSITION PROJECTION
      // -----------------------------------------------------------
      if (time - lastOverheadTagUpdate > 0.04 && container) {
        lastOverheadTagUpdate = time;
        // Point in 3D space directly above vehicle roof (Y = 8.0)
        const overhead3D = new THREE.Vector3(drivingData.current.x, 8.0, drivingData.current.z);
        overhead3D.project(camera);
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const screenX = (overhead3D.x * 0.5 + 0.5) * cw;
        const screenY = (-(overhead3D.y * 0.5) + 0.5) * ch;
        const inFront = overhead3D.z < 1.0;

        setOverheadTagPos({
          x: Math.round(screenX),
          y: Math.round(screenY),
          visible: inFront && screenX > -80 && screenX < cw + 80 && screenY > -80 && screenY < ch + 80,
        });
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Scroll wheel zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = e.deltaY > 0 ? 3.0 : -3.0;
      zoomDistance.current = Math.min(52, Math.max(18, zoomDistance.current + zoomStep));
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
      heroChar.dispose();
      steamBuggy.dispose();
      npcAgents.forEach((a) => a.char.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentTown, cameraMode, playerProfile]);

  return (
    <div className="relative w-full h-full bg-[#070b14] overflow-hidden select-none font-sans">
      {/* Full 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Click & Drag to Rotate Camera 360°"
      />

      {/* Floating 360° Camera Rotation & Compass Controls */}
      <div className="fixed top-20 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#0c1424]/90 border border-amber-500/40 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span className="text-xs font-black tracking-wider">{cameraHeadingDeg}°</span>
          </div>
          <div className="w-[1px] h-4 bg-stone-700" />
          <button
            onClick={() => handleRotateCamera('left')}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-amber-400 transition active:scale-95"
            title="Rotate View Left [Q]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleRotateCamera('right')}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-amber-400 transition active:scale-95"
            title="Rotate View Right [E]"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleRotateCamera('reset')}
            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold uppercase transition active:scale-95"
            title="Reset North Orientation"
          >
            North
          </button>
        </div>
      </div>

      {/* NPC Bump Dialogue Speech Bubble */}
      {npcSpeechBubble && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-30 max-w-sm bg-[#0c1424]/95 border border-amber-400 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-200 pointer-events-none">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase text-amber-400">{npcSpeechBubble.name}</span>
            <span className="text-[9px] text-stone-400">({npcSpeechBubble.role})</span>
          </div>
          <p className="text-xs text-stone-200 font-medium leading-tight">"{npcSpeechBubble.text}"</p>
        </div>
      )}

      {/* OVERHEAD FLOATING SPEEDOMETER GAUGE (Only active when driving) */}
      {overheadTagPos.visible && isDriving && (
        <div
          className="fixed z-30 pointer-events-none transition-transform duration-75"
          style={{
            left: `${overheadTagPos.x}px`,
            top: `${overheadTagPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2.5 bg-[#091122]/95 border-2 border-cyan-400 rounded-2xl px-3 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-md animate-in fade-in zoom-in duration-150">
              {/* Dynamic Speedometer Circle Arc */}
              <div className="relative w-9 h-9 rounded-full bg-stone-900/90 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-inner shrink-0">
                <span className="text-xs font-black text-white leading-none">
                  {drivingHUD.speed}
                </span>
                <span className="text-[7px] font-black text-cyan-400 tracking-tight">MPH</span>
              </div>

              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase shadow ${
                      drivingHUD.gear === 'D'
                        ? 'bg-emerald-500 text-stone-950'
                        : drivingHUD.gear === 'R'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-stone-950'
                    }`}
                  >
                    GEAR: {drivingHUD.gear}
                  </span>
                  <span className="text-[11px] font-black text-stone-100">Royal Steam Buggy</span>
                </div>
              </div>
            </div>
            {/* Pointer Down Arrow */}
            <div className="w-2.5 h-2.5 bg-[#091122] border-r-2 border-b-2 border-cyan-400 rotate-45 -mt-1.5 shadow-sm" />
          </div>
        </div>
      )}

      {/* Interactive Vehicle Proximity Prompt (When Walking near Steam Buggy) */}
      {activeVehiclePrompt && !isDriving && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-sm bg-[#0c1424]/95 border-2 border-cyan-400 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🚗</span>
              <div>
                <h3 className="font-black text-xs text-white">Drive Steam Buggy</h3>
                <p className="text-[10px] text-stone-400">Press E to drive through town</p>
              </div>
            </div>

            <button
              onClick={handleEnterVehicle}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-black text-xs uppercase shadow transition active:scale-95 shrink-0"
            >
              [E] DRIVE
            </button>
          </div>
        </div>
      )}

      {/* SPEEDOMETER & VEHICLE CONTAINER HUD (Only shown when driving) */}
      {isDriving && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xl bg-[#09101f]/95 border-2 border-cyan-500/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Circular Dial Speedometer */}
          <div className="relative w-16 h-16 rounded-full bg-stone-950 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-inner shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="17"
                fill="none"
                stroke="rgba(6, 182, 212, 0.2)"
                strokeWidth="2.5"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="106"
                strokeDashoffset={Math.max(0, 106 - (drivingHUD.speed / 44) * 106)}
                strokeLinecap="round"
                className="transition-all duration-200"
              />
            </svg>
            <span className="text-xl font-black text-white leading-none z-10">{drivingHUD.speed}</span>
            <span className="text-[9px] font-black text-cyan-400 tracking-wider z-10">MPH</span>
          </div>

          {/* Vehicle & Controls Container Box */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md font-black text-xs shadow ${
                  drivingHUD.gear === 'D'
                    ? 'bg-emerald-500 text-stone-950'
                    : drivingHUD.gear === 'R'
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-500 text-stone-950'
                }`}
              >
                GEAR: {drivingHUD.gear}
              </span>
              <span className="text-xs font-bold text-stone-300 tracking-wide">Royal Steam Buggy</span>
            </div>

            {/* Control Tips Container Box (Matching exact style from reference image) */}
            <div className="bg-[#0b162b] border border-slate-700/80 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-inner">
              <div className="flex items-center gap-1 shrink-0">
                <span className="bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-md text-xs shadow">
                  E
                </span>
                <span className="bg-blue-600 text-white font-black px-2 py-0.5 rounded-md text-xs shadow">
                  A
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white leading-tight">
                  {isDriving ? 'Drive Royal Steam Buggy' : 'Walk through Bower Kingdom'}
                </span>
                <span className="text-[10px] text-stone-400 leading-tight">
                  {isDriving
                    ? 'W/S gas & reverse · A/D steer · Space handbrake · E exits vehicle'
                    : 'WASD to move · E enters vehicles · scroll to zoom · hover for details'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Quick Action Controls (When driving) */}
          {isDriving && (
            <div className="flex flex-col gap-1.5 shrink-0 ml-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleHonkHorn}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow"
                  title="Honk Horn [H]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>HORN</span>
                </button>
                <button
                  onClick={handleToggleHeadlights}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow ${
                    drivingHUD.lightsOn
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                  title="Toggle Headlights [L]"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>LIGHTS</span>
                </button>
              </div>
              <button
                onClick={handleExitVehicle}
                className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase flex items-center justify-center gap-1 shadow transition active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>[E] EXIT</span>
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Floating Interactive Building Prompt Card (When Walking near Building) */}
      {activeBuildingPrompt && !isDriving && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md bg-[#0c1424]/95 border-2 border-amber-500 rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-inner">
                {activeBuildingPrompt.type === 'saloon'
                  ? '🍺'
                  : activeBuildingPrompt.type === 'boss'
                  ? '⚔️'
                  : activeBuildingPrompt.type === 'bank'
                  ? '🏛️'
                  : '⚡'}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {activeBuildingPrompt.stakes}
                </div>
                <h3 className="font-black text-sm text-white">{activeBuildingPrompt.name}</h3>
                <p className="text-[11px] text-stone-300 line-clamp-1">{activeBuildingPrompt.description}</p>
              </div>
            </div>

            <button
              onClick={() => handleTriggerBuilding(activeBuildingPrompt.gameMode)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wide shadow-lg transition active:scale-95 shrink-0"
            >
              [E] ENTER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
