import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Card, PlayerProfile } from '../types/poker';
import { IN_GAME_THEMES } from '../data/themesData';
import {
  createRealisticCardTexture,
  createRealisticCardBackTexture,
} from '../utils/cardTextureGenerator';
import { getCustomAssets } from '../utils/customAssets';
import { sounds } from '../utils/soundEffects';

interface ActiveTrickCard {
  id: string;
  mesh: THREE.Mesh;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startRot: THREE.Euler;
  targetRot: THREE.Euler;
  startTime: number;
  duration: number;
  isLanded: boolean;
  landTime?: number;
  playerId: string;
}

interface ThreePokerTable3DProps {
  playerProfile?: PlayerProfile;
  playedCards?: { playerId: string; card: Card }[];
  trumpSuit?: string | null;
  cameraAngle?: 'table' | 'overhead' | 'cinematic' | 'first_person';
  cameraPreset?: 'table' | 'overhead' | 'cinematic' | 'first_person' | 'player_pov';
  inGameTheme?: string;
  isShuffling?: boolean;
  isDealing?: boolean;
  dealerIndex?: number;
  playerHand?: Card[];
  playerCardCounts?: number[];
  team1Score?: number;
  team2Score?: number;
  activeEmote?: any;
  playerCount?: number;
  players?: any[];
  communityCards?: any[];
  pot?: number;
  activePlayerIdx?: number;
  dealerIdx?: number;
  winners?: any[];
}

interface CharacterAnimData {
  charGroup: THREE.Group;
  basePosY: number;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  hatGroup?: THREE.Group;
  armL: THREE.Mesh;
  armR: THREE.Mesh;
  foreL: THREE.Mesh;
  foreR: THREE.Mesh;
  handL: THREE.Object3D;
  handR: THREE.Object3D;
}

interface SeatedCharacterConfig {
  id: string;
  name: string;
  skinColor: number;
  hairColor: number;
  shirtColor: number;
  vestColor: number;
  pantsColor: number;
  bootColor: number;
  eyeColor: number;
  hatColor: number;
  hatType?: 'stetson' | 'bowler' | 'crown' | 'sombrero' | 'none';
  hasMustache?: boolean;
  position: [number, number, number];
  rotationY: number;
}

// Helper to dispose Three.js object hierarchy
function disposeHierarchy(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}

// Generates the authentic "HEART TAVERN ♥" maroon banner with gold trim
function createHeartTavernBannerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Deep wine/crimson maroon field
    ctx.fillStyle = '#831843';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Gold outer pinstripe frame
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 12;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    // Inner subtle gold pinstripe
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // 3. Bold white tavern typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Left wing (mirrored visually from central post)
    ctx.fillText('HEART TAVERN', 540, 130);

    // Center ruby heart
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('♥', 1024, 128);

    // Right wing
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HEART TAVERN ♥', 1520, 130);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generates the vibrant magenta rug with inset white border stripe from image
function createMagentaRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Vibrant magenta / fuchsia field
    ctx.fillStyle = '#db2777';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer edge border
    ctx.strokeStyle = '#be185d';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Crisp white/cream inset border stripe matching the image
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 26;
    ctx.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);

    // Soft inner pink pinstripe
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 5;
    ctx.strokeRect(74, 74, canvas.width - 148, canvas.height - 148);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const ThreePokerTable3D: React.FC<ThreePokerTable3DProps> = ({
  playerProfile,
  playedCards = [],
  trumpSuit = null,
  cameraAngle = 'overhead',
  cameraPreset,
  inGameTheme = 'in_game_1',
  isShuffling = false,
  isDealing = false,
  dealerIndex = 0,
  playerHand = [],
  playerCardCounts = [5, 5, 5, 5],
  team1Score = 0,
  team2Score = 0,
  activeEmote = null,
  playerCount = 4,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Store all props in a ref so the single persistent Three.js render loop can access them
  const propsRef = useRef({
    playerProfile,
    playedCards,
    trumpSuit,
    cameraAngle,
    cameraPreset,
    inGameTheme,
    isShuffling,
    isDealing,
    dealerIndex,
    playerHand,
    playerCardCounts,
    team1Score,
    team2Score,
    activeEmote,
    playerCount,
  });

  propsRef.current = {
    playerProfile,
    playedCards,
    trumpSuit,
    cameraAngle,
    cameraPreset,
    inGameTheme,
    isShuffling,
    isDealing,
    dealerIndex,
    playerHand,
    playerCardCounts,
    team1Score,
    team2Score,
    activeEmote,
    playerCount,
  };

  // Group & Character Animation References
  const trickCardsGroupRef = useRef<THREE.Group | null>(null);
  const scoreCardsGroupRef = useRef<THREE.Group | null>(null);
  const heldCardsGroupsRef = useRef<THREE.Group[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Tracks character body parts for 3D Emote Animations
  const characterAnimRefs = useRef<Record<string, CharacterAnimData>>({});

  // Active trick cards and player throw animations
  const activeTrickCardsRef = useRef<Map<string, ActiveTrickCard>>(new Map());
  const characterThrowAnimRef = useRef<Record<string, { startTime: number; duration: number }>>({});
  const clockRef = useRef<THREE.Clock | null>(null);

  // 1. Initial Scene Setup (runs ONCE on mount to prevent WebGL context exhaustion)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    const themeConfig =
      IN_GAME_THEMES.find((t) => t.themeKey === inGameTheme) || IN_GAME_THEMES[0];
    const feltColor = themeConfig.feltColorHex ?? 0x2ea38d; // Authentic seafoam/jade green felt
    const rimColor = themeConfig.rimColorHex ?? 0x422512;
    const bgColor = 0x9c9588; // Muted warm tavern ambient background matching image

    // Table coordinates & height
    const TABLE_CENTER_X = -2.2;
    const TABLE_CENTER_Z = 1.0;
    const TABLE_HEIGHT = 0.68;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);

    // Camera - Initialized overhead directly above the central table for immediate top-down gameplay view
    const initialFov = width / height < 1.55 ? Math.min(65, 52 * (1.55 / (width / height))) : 52;
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.1, 1000);
    camera.position.set(TABLE_CENTER_X, 15.2, TABLE_CENTER_Z + 3.6);
    camera.lookAt(TABLE_CENTER_X, TABLE_HEIGHT, TABLE_CENTER_Z + 0.2);
    cameraRef.current = camera;

    // Renderer (Fail-safe WebGL initialization)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('WebGLRenderer standard init failed, retrying fallback:', err);
      renderer = new THREE.WebGLRenderer({ antialias: false });
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear any previous elements in container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Warm Ambient and Directional Tavern Lighting
    const ambientLight = new THREE.AmbientLight(0xffedd5, 1.25);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xfff7ed, 1.4);
    mainSun.position.set(-4, 18, 12);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 1024;
    mainSun.shadow.mapSize.height = 1024;
    scene.add(mainSun);

    // ==========================================
    // 1. TAVERN ARCHITECTURE: FLOOR, WALLS, CEILING
    // ==========================================
    // Warm brown plank wood floor
    const floorGeo = new THREE.PlaneGeometry(52, 46);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x76543c, roughness: 0.82 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 4);
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor plank seams
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x4d3220 });
    for (let p = -24; p <= 24; p += 1.4) {
      const seamGeo = new THREE.BoxGeometry(0.03, 0.008, 44);
      const seam = new THREE.Mesh(seamGeo, seamMat);
      seam.position.set(p, 0.005, 4);
      scene.add(seam);
    }

    // Warm beige plaster walls
    const plasterMat = new THREE.MeshStandardMaterial({ color: 0xc1baa8, roughness: 0.9 });

    // Back Wall
    const backWallGeo = new THREE.PlaneGeometry(48, 18);
    const backWall = new THREE.Mesh(backWallGeo, plasterMat);
    backWall.position.set(0, 9, -15.8);
    scene.add(backWall);

    // Right Wall (with fireplace)
    const rightWallGeo = new THREE.PlaneGeometry(44, 18);
    const rightWall = new THREE.Mesh(rightWallGeo, plasterMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(23.8, 9, 6);
    scene.add(rightWall);

    // Left Wall
    const leftWallGeo = new THREE.PlaneGeometry(44, 18);
    const leftWall = new THREE.Mesh(leftWallGeo, plasterMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-23.8, 9, 6);
    scene.add(leftWall);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(48, 44);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x8e8779, roughness: 0.95 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 17.5, 6);
    scene.add(ceiling);

    // ==========================================
    // 2. TIMBER POST & BEAM FRAMEWORK (From Image)
    // ==========================================
    const timberMat = new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.65 });

    // Vertical Timber Posts
    const postPositions = [
      [0, 8.8, -15.6], // Center post splitting back wall
      [-10, 8.8, -15.6], // Left back post
      [10, 8.8, -15.6], // Right back post
      [-23.5, 8.8, -15.6], // Far back left post
      [23.5, 8.8, -15.6], // Far back right post
      [-23.5, 8.8, 6], // Left wall post
      [23.5, 8.8, 6], // Right wall post
      [-23.5, 8.8, 18], // Left front post
      [23.5, 8.8, 18], // Right front post
    ];
    postPositions.forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.75, 17.6, 0.75), timberMat);
      post.position.set(px, py, pz);
      post.castShadow = true;
      scene.add(post);
    });

    // Overhead Ceiling Beams (Rafters projecting along Z)
    const beamXList = [0, -10, 10, -23.5, 23.5];
    beamXList.forEach((bx) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 44), timberMat);
      beam.position.set(bx, 16.8, 6);
      beam.castShadow = true;
      scene.add(beam);
    });

    // Horizontal Wall Plate / Header Beam across top of back wall
    const backHeader = new THREE.Mesh(new THREE.BoxGeometry(48, 0.85, 0.65), timberMat);
    backHeader.position.set(0, 16.8, -15.6);
    scene.add(backHeader);

    // ==========================================
    // 3. BACK WALL "HEART TAVERN ♥" BANNER
    // ==========================================
    const bannerTex = createHeartTavernBannerTexture();
    const bannerMat = new THREE.MeshStandardMaterial({
      map: bannerTex,
      roughness: 0.4,
      metalness: 0.05,
    });
    const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(21.0, 2.5), bannerMat);
    bannerMesh.position.set(0, 13.0, -15.7);
    scene.add(bannerMesh);

    // ==========================================
    // 4. LARGE STONE FIREPLACE WITH GLOWING FLAMES
    // ==========================================
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xc5c0b1, roughness: 0.88 });
    const cavityMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.95 });

    // Lower mantel body
    const fpBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 10.5, 9.8), stoneMat);
    fpBody.position.set(21.0, 5.25, 5.0);
    fpBody.castShadow = true;
    scene.add(fpBody);

    // Mantel shelf trim
    const fpShelf = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.35, 10.4), stoneMat);
    fpShelf.position.set(21.0, 10.5, 5.0);
    scene.add(fpShelf);

    // Upper chimney stack rising to ceiling
    const fpStack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 7.0, 7.8), stoneMat);
    fpStack.position.set(21.0, 14.0, 5.0);
    scene.add(fpStack);

    // Recessed dark firebox cavity
    const firebox = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.4, 6.2), cavityMat);
    firebox.position.set(19.8, 2.2, 5.0);
    scene.add(firebox);

    // 5 Glowing Golden-Yellow Upright Oval Flames (From Image)
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd152 });
    [-1.8, -0.9, 0, 0.9, 1.8].forEach((offsetZ) => {
      const flameGeo = new THREE.SphereGeometry(0.32, 16, 16);
      flameGeo.scale(0.55, 1.8, 0.55);
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMesh.position.set(19.8, 1.0, 5.0 + offsetZ);
      scene.add(flameMesh);
    });

    // Fireplace warm ambient glow
    const fireLight = new THREE.PointLight(0xf59e0b, 2.6, 18);
    fireLight.position.set(19.2, 2.2, 5.0);
    scene.add(fireLight);

    // ==========================================
    // 5. SALOON BAR COUNTER (Left Background)
    // ==========================================
    const barWoodMat = new THREE.MeshStandardMaterial({ color: 0x3a2012, roughness: 0.55 });
    const barBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.4, 12.5), barWoodMat);
    barBase.position.set(-20.2, 1.7, -5.0);
    barBase.castShadow = true;
    scene.add(barBase);

    const barTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 13.0), barWoodMat);
    barTop.position.set(-20.2, 3.45, -5.0);
    scene.add(barTop);

    // ==========================================
    // 6. WAGON WHEEL RING CHANDELIERS (Left & Right)
    // ==========================================
    const createChandelier = (cx: number, cy: number, cz: number) => {
      const chGroup = new THREE.Group();
      chGroup.position.set(cx, cy, cz);

      // Bronze / Iron Ring
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x352012,
        roughness: 0.6,
        metalness: 0.4,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.08, 12, 32), ringMat);
      ring.rotation.x = Math.PI / 2;
      chGroup.add(ring);

      // 4 Suspension wires connecting to overhead ceiling beam at y = 16.8
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x221307 });
      const wireH = 16.8 - cy;
      for (let w = 0; w < 4; w++) {
        const ang = (w * Math.PI) / 2;
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, wireH, 4), wireMat);
        wire.position.set((Math.cos(ang) * 1.8) / 2, wireH / 2, (Math.sin(ang) * 1.8) / 2);
        wire.rotation.z = Math.cos(ang) * -0.12;
        wire.rotation.x = Math.sin(ang) * 0.12;
        chGroup.add(wire);
      }

      // 8 White candles with golden flame tips
      const candleMat = new THREE.MeshStandardMaterial({ color: 0xfdfbf7, roughness: 0.4 });
      const candleFlameMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      for (let c = 0; c < 8; c++) {
        const ang = (c * Math.PI) / 4;
        const candX = Math.cos(ang) * 1.8;
        const candZ = Math.sin(ang) * 1.8;

        const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 8), candleMat);
        candle.position.set(candX, 0.21, candZ);
        chGroup.add(candle);

        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), candleFlameMat);
        flame.scale.set(0.6, 1.4, 0.6);
        flame.position.set(candX, 0.48, candZ);
        chGroup.add(flame);
      }

      // Warm chandelier light
      const chLight = new THREE.PointLight(0xfef08a, 1.3, 22);
      chLight.position.set(0, 0.3, 0);
      chGroup.add(chLight);

      scene.add(chGroup);
    };

    createChandelier(-10, 13.5, 2.0); // Left chandelier
    createChandelier(10, 13.5, 2.0); // Right chandelier

    // ==========================================
    // 7. VIBRANT MAGENTA RUG WITH INSET WHITE BORDER
    // ==========================================
    const rugTex = createMagentaRugTexture();
    const rugMat = new THREE.MeshStandardMaterial({
      map: rugTex,
      roughness: 0.85,
    });
    const rugMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 12.5), rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.position.set(TABLE_CENTER_X, 0.012, TABLE_CENTER_Z);
    rugMesh.receiveShadow = true;
    scene.add(rugMesh);

    // ==========================================
    // 8. SQUARE SEAFOAM GREEN CARD TABLE
    // ==========================================
    const tableGroup = new THREE.Group();
    tableGroup.position.set(TABLE_CENTER_X, 0, TABLE_CENTER_Z);
    scene.add(tableGroup);

    // Flat Seafoam Green Felt Top
    const customAssets = getCustomAssets();
    let tableFeltMat: THREE.Material;
    if (customAssets.tableThemeUrl) {
      const loader = new THREE.TextureLoader();
      const customTex = loader.load(customAssets.tableThemeUrl);
      tableFeltMat = new THREE.MeshStandardMaterial({ map: customTex, roughness: 0.45 });
    } else {
      tableFeltMat = new THREE.MeshStandardMaterial({ color: feltColor, roughness: 0.5 });
    }

    const feltTop = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.08, 6.4), tableFeltMat);
    feltTop.position.set(0, TABLE_HEIGHT, 0);
    feltTop.receiveShadow = true;
    tableGroup.add(feltTop);

    // Crisp Inset Trim around Felt Boundary
    const innerTrimMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const innerTrim = new THREE.Mesh(new THREE.BoxGeometry(6.44, 0.082, 6.44), innerTrimMat);
    innerTrim.position.set(0, TABLE_HEIGHT - 0.002, 0);
    tableGroup.add(innerTrim);

    // Outer Dark Wood Rim / Apron
    const tableRimMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      roughness: 0.4,
      metalness: 0.1,
    });
    const tableRimMesh = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.24, 7.0), tableRimMat);
    tableRimMesh.position.set(0, TABLE_HEIGHT - 0.07, 0);
    tableRimMesh.castShadow = true;
    tableGroup.add(tableRimMesh);

    // 4 Sturdy Square Corner Legs
    const tableLegMat = new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.6 });
    const legCornerOffsets = [
      [-2.95, -2.95],
      [2.95, -2.95],
      [-2.95, 2.95],
      [2.95, 2.95],
    ];
    legCornerOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, TABLE_HEIGHT, 0.32),
        tableLegMat
      );
      leg.position.set(lx, TABLE_HEIGHT / 2, lz);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    // Center Gold Dealer Coin / Button
    const dealerBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.25 })
    );
    dealerBtn.position.set(0, TABLE_HEIGHT + 0.06, 0);
    tableGroup.add(dealerBtn);

    // ==========================================
    // 9. CLASSIC TALL WOODEN TAVERN CHAIRS
    // ==========================================
    const createSaloonChair = (posX: number, posZ: number, rotY: number) => {
      const chairGroup = new THREE.Group();
      chairGroup.position.set(posX, 0, posZ);
      chairGroup.rotation.y = rotY;

      const chairWoodMat = new THREE.MeshStandardMaterial({ color: 0x422512, roughness: 0.55 });

      // Flat square wooden seat
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.2), chairWoodMat);
      seat.position.set(0, 0.50, 0);
      seat.castShadow = true;
      chairGroup.add(seat);

      // 4 Straight square legs
      const legOffsets = [
        [-0.48, 0.25, -0.48],
        [0.48, 0.25, -0.48],
        [-0.48, 0.25, 0.48],
        [0.48, 0.25, 0.48],
      ];
      legOffsets.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.50, 0.09), chairWoodMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        chairGroup.add(leg);
      });

      // Tall Rear Backrest Posts
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.5, 0.09), chairWoodMat);
      postL.position.set(-0.48, 1.25, -0.48);
      chairGroup.add(postL);

      const postR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.5, 0.09), chairWoodMat);
      postR.position.set(0.48, 1.25, -0.48);
      chairGroup.add(postR);

      // Solid flat rectangular backrest panel (Matching Image)
      const backPanel = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.95, 0.06), chairWoodMat);
      backPanel.position.set(0, 1.38, -0.48);
      chairGroup.add(backPanel);

      scene.add(chairGroup);
    };

    // Chair positions on table matching active player count
    const allSaloonChairs = [
      { id: 'p0', x: TABLE_CENTER_X, z: TABLE_CENTER_Z + 3.7, rot: Math.PI }, // South (You)
      { id: 'p1', x: TABLE_CENTER_X - 3.7, z: TABLE_CENTER_Z, rot: Math.PI / 2 }, // West
      { id: 'p2', x: TABLE_CENTER_X, z: TABLE_CENTER_Z - 3.7, rot: 0 }, // North
      { id: 'p3', x: TABLE_CENTER_X + 3.7, z: TABLE_CENTER_Z, rot: -Math.PI / 2 }, // East
    ];

    const activeCount = propsRef.current.playerCount || 4;
    let activePlayerIds: string[] = ['p0', 'p1', 'p2', 'p3'];
    if (activeCount === 2) activePlayerIds = ['p0', 'p2'];
    else if (activeCount === 3) activePlayerIds = ['p0', 'p1', 'p3'];

    allSaloonChairs
      .filter((c) => activePlayerIds.includes(c.id))
      .forEach((c) => createSaloonChair(c.x, c.z, c.rot));

    // ==========================================
    // 10. SEATED CHARACTERS AT TABLE (Matching Image)
    // ==========================================
    const createFullSeatedCharacter = (cfg: SeatedCharacterConfig) => {
      const charGroup = new THREE.Group();
      charGroup.position.set(cfg.position[0], cfg.position[1], cfg.position[2]);
      charGroup.rotation.y = cfg.rotationY;

      const skinMat = new THREE.MeshStandardMaterial({ color: cfg.skinColor, roughness: 0.85 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: cfg.shirtColor, roughness: 0.84 });
      const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x26223b, roughness: 0.85 });
      const shoulderPatchMat = new THREE.MeshStandardMaterial({ color: 0xcbb298, roughness: 0.85 });
      const goldBroochMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
      const buckleMat = new THREE.MeshStandardMaterial({ color: 0x5a4b73, roughness: 0.6, metalness: 0.2 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: cfg.pantsColor, roughness: 0.9 });
      const bootMat = new THREE.MeshStandardMaterial({ color: cfg.bootColor, roughness: 0.75 });
      const bootCuffMat = new THREE.MeshStandardMaterial({ color: 0x776941, roughness: 0.8 });
      const hairMat = new THREE.MeshStandardMaterial({ color: cfg.hairColor, roughness: 0.88 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: cfg.eyeColor, roughness: 0.3 });

      // Pelvis / Belt
      const pelvisGeo = new THREE.BoxGeometry(0.7, 0.22, 0.55);
      const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
      pelvis.position.set(0, 0.62, 0);
      charGroup.add(pelvis);

      // Belt & Diamond Buckle
      const beltGeo = new THREE.BoxGeometry(0.74, 0.14, 0.58);
      const belt = new THREE.Mesh(beltGeo, darkTrimMat);
      belt.position.set(0, 0.72, 0);
      charGroup.add(belt);

      const buckleOuterGeo = new THREE.BoxGeometry(0.16, 0.16, 0.06);
      const buckleOuter = new THREE.Mesh(buckleOuterGeo, buckleMat);
      buckleOuter.rotation.z = Math.PI / 4;
      buckleOuter.position.set(0, 0.72, 0.30);
      charGroup.add(buckleOuter);

      // Thighs (extending forward naturally to chair edge)
      const thighGeo = new THREE.BoxGeometry(0.24, 0.20, 0.56);
      const thighL = new THREE.Mesh(thighGeo, pantsMat);
      thighL.position.set(-0.24, 0.60, 0.28);
      charGroup.add(thighL);

      const thighR = new THREE.Mesh(thighGeo, pantsMat);
      thighR.position.set(0.24, 0.60, 0.28);
      charGroup.add(thighR);

      // Shins (going down to floor)
      const shinGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.54, 10);
      const shinL = new THREE.Mesh(shinGeo, pantsMat);
      shinL.position.set(-0.24, 0.27, 0.52);
      charGroup.add(shinL);

      const shinR = new THREE.Mesh(shinGeo, pantsMat);
      shinR.position.set(0.24, 0.27, 0.52);
      charGroup.add(shinR);

      // Cuffed Tan Boots
      const cuffGeo = new THREE.CylinderGeometry(0.11, 0.10, 0.12, 10);
      const cuffL = new THREE.Mesh(cuffGeo, bootCuffMat);
      cuffL.position.set(-0.24, 0.24, 0.52);
      charGroup.add(cuffL);

      const cuffR = new THREE.Mesh(cuffGeo, bootCuffMat);
      cuffR.position.set(0.24, 0.24, 0.52);
      charGroup.add(cuffR);

      const bootGeo = new THREE.BoxGeometry(0.20, 0.16, 0.32);
      const bootL = new THREE.Mesh(bootGeo, bootMat);
      bootL.position.set(-0.24, 0.08, 0.58);
      charGroup.add(bootL);

      const bootR = new THREE.Mesh(bootGeo, bootMat);
      bootR.position.set(0.24, 0.08, 0.58);
      charGroup.add(bootR);

      // Torso - Adventurer / Gambeson Tunic
      const torsoGeo = new THREE.BoxGeometry(0.78, 0.92, 0.46);
      const torso = new THREE.Mesh(torsoGeo, shirtMat);
      torso.position.set(0, 1.15, -0.05);
      charGroup.add(torso);

      // Shoulder Patches (Tan Cutouts with Dark Trim)
      const patchGeo = new THREE.BoxGeometry(0.20, 0.06, 0.32);
      const patchL = new THREE.Mesh(patchGeo, shoulderPatchMat);
      patchL.position.set(-0.32, 1.56, -0.04);
      charGroup.add(patchL);

      const patchR = new THREE.Mesh(patchGeo, shoulderPatchMat);
      patchR.position.set(0.32, 1.56, -0.04);
      charGroup.add(patchR);

      // Center Placket (Dark vertical band)
      const placketGeo = new THREE.BoxGeometry(0.11, 0.82, 0.04);
      const placket = new THREE.Mesh(placketGeo, darkTrimMat);
      placket.position.set(0, 1.16, 0.19);
      charGroup.add(placket);

      // Gold Diamond Brooch on Right Chest (Viewer's Left)
      const broochGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
      const brooch = new THREE.Mesh(broochGeo, goldBroochMat);
      brooch.rotation.z = Math.PI / 4;
      brooch.position.set(-0.22, 1.34, 0.20);
      charGroup.add(brooch);

      // Head (Angular OSRS Low-Poly Aesthetic)
      const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
      headGeo.scale(1, 1.12, 0.96);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0, 1.84, -0.02);
      charGroup.add(head);

      // Tapered Jaw
      const jawGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.20, 10);
      const jaw = new THREE.Mesh(jawGeo, skinMat);
      jaw.position.set(0, 1.70, 0.02);
      charGroup.add(jaw);

      // Buzz Cut Skull Cap
      const hairGeo = new THREE.SphereGeometry(0.33, 14, 14);
      hairGeo.scale(1.02, 1.04, 0.98);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 1.87, -0.04);
      charGroup.add(hair);

      // Eyes (Green / Hazel)
      const eyeGeo = new THREE.BoxGeometry(0.06, 0.04, 0.02);
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.11, 1.85, 0.26);
      charGroup.add(eyeL);

      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.11, 1.85, 0.26);
      charGroup.add(eyeR);

      // Focused Dark Brows
      const browGeo = new THREE.BoxGeometry(0.09, 0.02, 0.02);
      const browL = new THREE.Mesh(browGeo, hairMat);
      browL.position.set(-0.11, 1.90, 0.26);
      browL.rotation.z = 0.1;
      charGroup.add(browL);

      const browR = new THREE.Mesh(browGeo, hairMat);
      browR.position.set(0.11, 1.90, 0.26);
      browR.rotation.z = -0.1;
      charGroup.add(browR);

      // Nose
      const noseGeo = new THREE.ConeGeometry(0.035, 0.07, 5);
      const nose = new THREE.Mesh(noseGeo, skinMat);
      nose.rotation.x = -Math.PI / 4;
      nose.position.set(0, 1.78, 0.29);
      charGroup.add(nose);

      // Optional Hat Group
      let hatGroup: THREE.Group | undefined;
      if (cfg.hatType && cfg.hatType !== 'none') {
        hatGroup = new THREE.Group();
        const hatMat = new THREE.MeshStandardMaterial({ color: cfg.hatColor, roughness: 0.6 });
        const hatBrimGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.03, 18);
        const brim = new THREE.Mesh(hatBrimGeo, hatMat);
        brim.position.set(0, 2.10, -0.02);
        hatGroup.add(brim);

        const hatCrownGeo = new THREE.CylinderGeometry(0.34, 0.40, 0.38, 16);
        const crown = new THREE.Mesh(hatCrownGeo, hatMat);
        crown.position.set(0, 2.30, -0.02);
        hatGroup.add(crown);

        charGroup.add(hatGroup);
      }

      // Arms reaching towards table
      const upperArmGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.45, 8);
      const armL = new THREE.Mesh(upperArmGeo, shirtMat);
      armL.position.set(-0.46, 1.25, 0.14);
      armL.rotation.x = Math.PI / 6;
      armL.rotation.z = -Math.PI / 10;
      charGroup.add(armL);

      const armR = new THREE.Mesh(upperArmGeo, shirtMat);
      armR.position.set(0.46, 1.25, 0.14);
      armR.rotation.x = Math.PI / 6;
      armR.rotation.z = Math.PI / 10;
      charGroup.add(armR);

      // Bare Forearms reaching directly to table felt
      const forearmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.50, 8);
      const foreL = new THREE.Mesh(forearmGeo, skinMat);
      foreL.position.set(-0.36, 0.92, 0.46);
      foreL.rotation.x = Math.PI / 3;
      charGroup.add(foreL);

      const foreR = new THREE.Mesh(forearmGeo, skinMat);
      foreR.position.set(0.36, 0.92, 0.46);
      foreR.rotation.x = Math.PI / 3;
      charGroup.add(foreR);

      // Helper to build realistic, articulated hands for seated characters (wrist, contoured palm, thumb, and 4 fingers)
      const buildSeatedHand = (side: 'left' | 'right', skinMaterial: THREE.Material): THREE.Group => {
        const handGroup = new THREE.Group();
        const isLeft = side === 'left';
        const xSign = isLeft ? 1 : -1; // Thumb points inward

        // 1. Wrist collar connecting seamlessly to forearm cylinder
        const wristGeo = new THREE.CylinderGeometry(0.060, 0.055, 0.06, 10);
        const wrist = new THREE.Mesh(wristGeo, skinMaterial);
        wrist.position.set(0, 0.015, 0);
        handGroup.add(wrist);

        // 2. Wide, thick Palm Body resting on table rim / felt
        const palmGeo = new THREE.BoxGeometry(0.14, 0.048, 0.14);
        const palm = new THREE.Mesh(palmGeo, skinMaterial);
        palm.position.set(0, -0.012, 0.07);
        palm.castShadow = true;
        handGroup.add(palm);

        // Thenar muscle pad for thumb base
        const thenarGeo = new THREE.SphereGeometry(0.036, 8, 8);
        thenarGeo.scale(1.0, 0.8, 1.2);
        const thenar = new THREE.Mesh(thenarGeo, skinMaterial);
        thenar.position.set(xSign * 0.052, -0.008, 0.06);
        handGroup.add(thenar);

        // 3. Articulated Thumb
        const thumbGroup = new THREE.Group();
        thumbGroup.position.set(xSign * 0.068, -0.008, 0.055);
        thumbGroup.rotation.y = xSign * 0.5;

        const thumbBase = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.055, 8), skinMaterial);
        thumbBase.position.set(xSign * 0.014, 0, 0.020);
        thumbBase.rotation.z = -xSign * 0.28;
        thumbGroup.add(thumbBase);

        const thumbKnuckle = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), skinMaterial);
        thumbKnuckle.position.set(xSign * 0.026, 0, 0.045);
        thumbGroup.add(thumbKnuckle);

        const thumbTip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.046, 8), skinMaterial);
        thumbTip.position.set(xSign * 0.034, -0.003, 0.066);
        thumbTip.rotation.z = -xSign * 0.38;
        thumbGroup.add(thumbTip);

        handGroup.add(thumbGroup);

        // 4. Four clearly articulated fingers resting on table felt
        const fingers = [
          { name: 'index', x: xSign * 0.046, len: 0.088, rad: 0.022 },
          { name: 'middle', x: xSign * 0.015, len: 0.096, rad: 0.023 },
          { name: 'ring', x: -xSign * 0.015, len: 0.088, rad: 0.021 },
          { name: 'pinky', x: -xSign * 0.046, len: 0.074, rad: 0.018 },
        ];

        fingers.forEach((f) => {
          const fingerGroup = new THREE.Group();
          fingerGroup.position.set(f.x, -0.010, 0.14);

          // Knuckle
          const knuckle = new THREE.Mesh(new THREE.SphereGeometry(f.rad * 1.1, 8, 8), skinMaterial);
          fingerGroup.add(knuckle);

          // Phalanx 1 (proximal)
          const p1 = new THREE.Mesh(new THREE.CylinderGeometry(f.rad * 0.90, f.rad, f.len * 0.52, 8), skinMaterial);
          p1.position.set(0, -0.004, f.len * 0.25);
          p1.rotation.x = Math.PI / 2 + 0.08;
          fingerGroup.add(p1);

          // Joint
          const joint = new THREE.Mesh(new THREE.SphereGeometry(f.rad * 0.90, 8, 8), skinMaterial);
          joint.position.set(0, -0.007, f.len * 0.52);
          fingerGroup.add(joint);

          // Phalanx 2 (distal tip)
          const p2 = new THREE.Mesh(new THREE.CylinderGeometry(f.rad * 0.76, f.rad * 0.88, f.len * 0.44, 8), skinMaterial);
          p2.position.set(0, -0.010, f.len * 0.74);
          p2.rotation.x = Math.PI / 2 + 0.16;
          fingerGroup.add(p2);

          // Fingertip pad
          const tip = new THREE.Mesh(new THREE.SphereGeometry(f.rad * 0.82, 8, 8), skinMaterial);
          tip.position.set(0, -0.013, f.len * 0.96);
          fingerGroup.add(tip);

          handGroup.add(fingerGroup);
        });

        return handGroup;
      };

      // Hands attached DIRECTLY to the ends of the forearms (physically joined at the wrist)
      const handL = buildSeatedHand('left', skinMat);
      handL.position.set(0, -0.25, 0);
      handL.rotation.x = -Math.PI / 3; // Counter-rotate so the palm rests flat horizontally on the felt
      foreL.add(handL);

      const handR = buildSeatedHand('right', skinMat);
      handR.position.set(0, -0.25, 0);
      handR.rotation.x = -Math.PI / 3;
      foreR.add(handR);

      scene.add(charGroup);

      // Store character limb references for 3D Emote Animations
      characterAnimRefs.current[cfg.id] = {
        charGroup,
        basePosY: cfg.position[1],
        torso,
        head,
        hatGroup,
        armL,
        armR,
        foreL,
        foreR,
        handL,
        handR,
      };
    };

    const allSeatedConfigs: SeatedCharacterConfig[] = [
      {
        id: 'p0',
        name: 'You',
        skinColor: 0xdcb594,
        hairColor: 0x8c735d,
        shirtColor: 0x9b7cc0,
        vestColor: 0x26223b,
        pantsColor: 0x1b2029,
        bootColor: 0x8a7b4e,
        eyeColor: 0x4e7a58,
        hatColor: 0x1c1917,
        hatType: 'none',
        hasMustache: false,
        position: [TABLE_CENTER_X, 0, TABLE_CENTER_Z + 3.7],
        rotationY: Math.PI,
      },
      {
        id: 'p1',
        name: 'West Kid',
        skinColor: 0xdcb594,
        hairColor: 0x4a3b32,
        shirtColor: 0x2a4365,
        vestColor: 0x1a202c,
        pantsColor: 0x1b2029,
        bootColor: 0x8a7b4e,
        eyeColor: 0x3182ce,
        hatColor: 0x1a202c,
        hatType: 'none',
        hasMustache: false,
        position: [TABLE_CENTER_X - 3.7, 0, TABLE_CENTER_Z],
        rotationY: Math.PI / 2,
      },
      {
        id: 'p2',
        name: 'Partner Pete',
        skinColor: 0xdcb594,
        hairColor: 0x713f12,
        shirtColor: 0x22543d,
        vestColor: 0x1c4532,
        pantsColor: 0x1b2029,
        bootColor: 0x8a7b4e,
        eyeColor: 0x38a169,
        hatColor: 0x22543d,
        hatType: 'none',
        hasMustache: false,
        position: [TABLE_CENTER_X, 0, TABLE_CENTER_Z - 3.7],
        rotationY: 0,
      },
      {
        id: 'p3',
        name: 'East Maverick',
        skinColor: 0xdcb594,
        hairColor: 0x27272a,
        shirtColor: 0x742a2a,
        vestColor: 0x4a1d1d,
        pantsColor: 0x1b2029,
        bootColor: 0x8a7b4e,
        eyeColor: 0x9b2c2c,
        hatColor: 0x18181b,
        hatType: 'none',
        hasMustache: false,
        position: [TABLE_CENTER_X + 3.7, 0, TABLE_CENTER_Z],
        rotationY: -Math.PI / 2,
      },
    ];

    const seatedConfigs = allSeatedConfigs.filter((c) => activePlayerIds.includes(c.id));
    seatedConfigs.forEach((cfg) => createFullSeatedCharacter(cfg));

    // Dynamic Groups for Shuffling/Deck, Trick Cards, and Scorecards attached to Table
    const cardDeckGroup = new THREE.Group();
    tableGroup.add(cardDeckGroup);

    const shuffleCardCount = 12;
    const shuffleCards: THREE.Mesh[] = [];
    const deckBackTex = createRealisticCardBackTexture();
    const cardBackMat = new THREE.MeshStandardMaterial({ map: deckBackTex, roughness: 0.35 });

    for (let i = 0; i < shuffleCardCount; i++) {
      const cGeo = new THREE.BoxGeometry(0.52, 0.012, 0.74);
      const cMesh = new THREE.Mesh(cGeo, cardBackMat);
      cMesh.position.set(0, TABLE_HEIGHT + 0.08 + i * 0.015, 0);
      cMesh.castShadow = true;
      cardDeckGroup.add(cMesh);
      shuffleCards.push(cMesh);
    }

    const trickCardsGroup = new THREE.Group();
    tableGroup.add(trickCardsGroup);
    trickCardsGroupRef.current = trickCardsGroup;

    const scoreCardsGroup = new THREE.Group();
    tableGroup.add(scoreCardsGroup);
    scoreCardsGroupRef.current = scoreCardsGroup;

    // Animation Loop
    let animFrame: number;
    const clock = new THREE.Clock();
    clockRef.current = clock;

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentProps = propsRef.current;

      // Update camera view based on cameraAngle or cameraPreset (overhead by default, never from side)
      if (cameraRef.current) {
        const cam = cameraRef.current;
        const activeAngle =
          currentProps.cameraAngle ||
          (currentProps.cameraPreset === 'player_pov' ? 'first_person' : currentProps.cameraPreset) ||
          'overhead';

        if (activeAngle === 'first_person') {
          cam.position.lerp(new THREE.Vector3(TABLE_CENTER_X, 2.1, TABLE_CENTER_Z + 3.8), 0.08);
          cam.lookAt(TABLE_CENTER_X, 0.7, TABLE_CENTER_Z - 1.2);
        } else if (activeAngle === 'cinematic') {
          cam.position.lerp(new THREE.Vector3(TABLE_CENTER_X + 6.5, 9.5, TABLE_CENTER_Z + 8.5), 0.08);
          cam.lookAt(TABLE_CENTER_X, 1.2, TABLE_CENTER_Z);
        } else if (activeAngle === 'table') {
          // Elevated front view facing North across table (symmetrical, never side angle)
          cam.position.lerp(new THREE.Vector3(TABLE_CENTER_X, 10.8, TABLE_CENTER_Z + 6.5), 0.08);
          cam.lookAt(TABLE_CENTER_X, 1.0, TABLE_CENTER_Z);
        } else {
          // Overhead bird's-eye view - directly overhead centered on the table
          cam.position.lerp(new THREE.Vector3(TABLE_CENTER_X, 15.2, TABLE_CENTER_Z + 3.6), 0.08);
          cam.lookAt(TABLE_CENTER_X, TABLE_HEIGHT, TABLE_CENTER_Z + 0.2);
        }
      }

      // Shuffling / Dealing Animation
      if (currentProps.isShuffling) {
        cardDeckGroup.visible = true;
        shuffleCards.forEach((c, idx) => {
          const side = idx % 2 === 0 ? 1 : -1;
          const wave = Math.sin(elapsedTime * 10 + idx * 0.8);
          c.position.x = side * Math.abs(wave) * 0.35;
          c.position.y = TABLE_HEIGHT + 0.08 + Math.sin(elapsedTime * 12 + idx) * 0.08 + idx * 0.01;
          c.rotation.z = side * wave * 0.25;
        });
      } else if (currentProps.isDealing) {
        cardDeckGroup.visible = true;
        shuffleCards.forEach((c, idx) => {
          const angle = (idx % 4) * (Math.PI / 2) + elapsedTime * 4;
          const dist = Math.min(1.8, (elapsedTime * 2.5) % 2.2);
          c.position.x = Math.cos(angle) * dist;
          c.position.z = Math.sin(angle) * dist;
          c.position.y = TABLE_HEIGHT + 0.08 + Math.sin(elapsedTime * 8) * 0.05;
          c.rotation.y = angle;
        });
      } else {
        cardDeckGroup.visible = true;
        shuffleCards.forEach((c, idx) => {
          c.position.set(0, TABLE_HEIGHT + 0.08 + idx * 0.015, 0);
          c.rotation.set(0, 0, 0);
        });
      }

      // ==========================================
      // 3D CHARACTER BODY EMOTE ANIMATIONS
      // ==========================================
      const activeEmoteObj = currentProps.activeEmote;
      const activePlayerId = activeEmoteObj?.playerId || 'p0';
      const emoteType = activeEmoteObj?.id || activeEmoteObj?.type || 'saloon_laugh';

      Object.entries(characterAnimRefs.current).forEach(([pid, rawRefs]) => {
        const refs = rawRefs as CharacterAnimData;
        const isPerforming = activeEmoteObj && pid === activePlayerId;

        if (isPerforming) {
          const T = elapsedTime * 4; // animation time scaler

          // Stand up prominently from the chair for all emotes so gesture is clearly visible overhead
          refs.charGroup.position.y = THREE.MathUtils.lerp(
            refs.charGroup.position.y,
            refs.basePosY + 0.85,
            0.15
          );

          if (emoteType === 'victory_cheer' || emoteType === 'victory_lap' || emoteType === 'sovereign_fanfare') {
            // Stand tall and triumphantly wave both arms high in the air
            refs.torso.rotation.z = Math.sin(T * 2) * 0.18;
            refs.torso.rotation.x = -0.15;
            refs.head.rotation.x = -0.3 + Math.sin(T * 3) * 0.12;
            refs.armL.rotation.x = THREE.MathUtils.lerp(refs.armL.rotation.x, -2.4, 0.2);
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -2.4, 0.2);
            refs.armL.rotation.z = Math.sin(T * 4) * 0.4 - 0.4;
            refs.armR.rotation.z = -Math.sin(T * 4) * 0.4 + 0.4;
            refs.foreL.rotation.z = Math.sin(T * 5) * 0.6;
            refs.foreR.rotation.z = -Math.sin(T * 5) * 0.6;
            refs.handL.rotation.set(-0.3, 0, Math.sin(T * 6) * 0.5);
            refs.handR.rotation.set(-0.3, 0, -Math.sin(T * 6) * 0.5);
          } else if (emoteType === 'tip_hat') {
            // Stand up, bow forward gracefully, take off hat and sweep it wide
            refs.torso.rotation.x = THREE.MathUtils.lerp(refs.torso.rotation.x, 0.35, 0.15);
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -1.8, 0.2);
            refs.foreR.rotation.x = THREE.MathUtils.lerp(refs.foreR.rotation.x, 0.95, 0.2);
            refs.handR.rotation.set(-0.8, 0.4, -0.5);
            if (refs.hatGroup) {
              refs.hatGroup.position.y = THREE.MathUtils.lerp(refs.hatGroup.position.y, 0.55, 0.2);
              refs.hatGroup.position.x = THREE.MathUtils.lerp(refs.hatGroup.position.x, 0.35, 0.2);
              refs.hatGroup.rotation.x = Math.sin(T * 3) * 0.25;
            }
            refs.head.rotation.x = THREE.MathUtils.lerp(refs.head.rotation.x, 0.4, 0.15);
          } else if (emoteType === 'applause' || emoteType === 'slow_clap') {
            // Stand up tall and clap enthusiastically high in front of chest
            refs.torso.rotation.x = THREE.MathUtils.lerp(refs.torso.rotation.x, 0.05, 0.1);
            refs.armL.rotation.x = THREE.MathUtils.lerp(refs.armL.rotation.x, -1.2, 0.2);
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -1.2, 0.2);
            refs.foreL.rotation.z = THREE.MathUtils.lerp(refs.foreL.rotation.z, 0.95, 0.2);
            refs.foreR.rotation.z = THREE.MathUtils.lerp(refs.foreR.rotation.z, -0.95, 0.2);
            refs.foreL.rotation.y = Math.sin(T * 9) * 0.45;
            refs.foreR.rotation.y = -Math.sin(T * 9) * 0.45;
            refs.handL.rotation.set(-0.4, 1.2, 0);
            refs.handR.rotation.set(-0.4, -1.2, 0);
          } else if (emoteType === 'table_slam') {
            // Stand tall and violently slam both palms onto table
            const slamPhase = Math.sin(T * 3.5);
            refs.torso.rotation.x = slamPhase > 0 ? -0.2 : 0.4;
            refs.armL.rotation.x = slamPhase > 0 ? -2.0 : 0.4;
            refs.armR.rotation.x = slamPhase > 0 ? -2.0 : 0.4;
            refs.head.rotation.x = slamPhase > 0 ? -0.4 : 0.35;
            refs.handL.rotation.x = -Math.PI / 3;
            refs.handR.rotation.x = -Math.PI / 3;
          } else if (emoteType === 'saloon_laugh') {
            // Stand up, lean head and torso back with hearty belly laugh
            refs.torso.rotation.x = THREE.MathUtils.lerp(refs.torso.rotation.x, -0.35, 0.15);
            refs.head.rotation.x = -0.3 + Math.sin(T * 6) * 0.25;
            refs.armL.rotation.x = THREE.MathUtils.lerp(refs.armL.rotation.x, -0.7, 0.15);
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -0.7, 0.15);
            refs.foreL.rotation.z = -0.4 + Math.sin(T * 6) * 0.2;
            refs.foreR.rotation.z = 0.4 - Math.sin(T * 6) * 0.2;
          } else if (emoteType === 'finger_guns' || emoteType === 'quickdraw') {
            // Stand in gunslinger stance and aim dual finger guns across table
            refs.torso.rotation.x = 0.1;
            refs.armL.rotation.x = THREE.MathUtils.lerp(refs.armL.rotation.x, -1.55, 0.2);
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -1.55, 0.2);
            refs.foreL.rotation.x = THREE.MathUtils.lerp(refs.foreL.rotation.x, 0.1, 0.2);
            refs.foreR.rotation.x = THREE.MathUtils.lerp(refs.foreR.rotation.x, 0.1, 0.2);
            refs.handL.rotation.set(0, 0, Math.PI / 2);
            refs.handR.rotation.set(0, 0, -Math.PI / 2);
          } else if (emoteType === 'fist_pump') {
            // Stand tall and vigorously pump right fist in the air
            refs.torso.rotation.z = -0.15;
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -2.2 + Math.sin(T * 6) * 0.45, 0.25);
            refs.foreR.rotation.x = THREE.MathUtils.lerp(refs.foreR.rotation.x, 0.2, 0.2);
            refs.handR.rotation.set(-1.0, 0, 0);
          } else if (emoteType === 'facepalm') {
            // Stand up, bow head down and slap palm against forehead
            refs.torso.rotation.x = THREE.MathUtils.lerp(refs.torso.rotation.x, 0.25, 0.15);
            refs.head.rotation.x = THREE.MathUtils.lerp(refs.head.rotation.x, 0.45, 0.15);
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -1.7, 0.2);
            refs.foreR.rotation.x = THREE.MathUtils.lerp(refs.foreR.rotation.x, 1.3, 0.2);
            refs.handR.rotation.set(-0.9, 0.3, -0.2);
          } else {
            // Any other emote: Stand up and reach hands out expressively
            refs.torso.rotation.x = THREE.MathUtils.lerp(refs.torso.rotation.x, 0.15, 0.15);
            refs.armL.rotation.x = THREE.MathUtils.lerp(refs.armL.rotation.x, -1.4, 0.15);
            refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -1.4, 0.15);
            refs.head.rotation.y = Math.sin(T * 3) * 0.25;
            refs.handL.rotation.x = -Math.PI / 4;
            refs.handR.rotation.x = -Math.PI / 4;
          }
        } else {
          // Smoothly return body parts to resting seated pose
          refs.charGroup.position.y = THREE.MathUtils.lerp(
            refs.charGroup.position.y,
            refs.basePosY,
            0.1
          );
          refs.torso.rotation.set(
            THREE.MathUtils.lerp(refs.torso.rotation.x, 0, 0.1),
            THREE.MathUtils.lerp(refs.torso.rotation.y, 0, 0.1),
            THREE.MathUtils.lerp(refs.torso.rotation.z, 0, 0.1)
          );
          refs.head.rotation.set(
            THREE.MathUtils.lerp(refs.head.rotation.x, 0, 0.1),
            THREE.MathUtils.lerp(refs.head.rotation.y, 0, 0.1),
            THREE.MathUtils.lerp(refs.head.rotation.z, 0, 0.1)
          );
          if (refs.hatGroup) {
            refs.hatGroup.position.y = THREE.MathUtils.lerp(refs.hatGroup.position.y, 0, 0.1);
            refs.hatGroup.rotation.set(0, 0, 0);
          }
          refs.armL.rotation.set(
            THREE.MathUtils.lerp(refs.armL.rotation.x, Math.PI / 6, 0.1),
            0,
            THREE.MathUtils.lerp(refs.armL.rotation.z, -Math.PI / 10, 0.1)
          );
          // Check if this character is currently throwing a card
          const throwAnim = characterThrowAnimRef.current[pid];
          if (throwAnim && elapsedTime - throwAnim.startTime < throwAnim.duration) {
            const p = (elapsedTime - throwAnim.startTime) / throwAnim.duration;
            if (p < 0.28) {
              // 1. Cock arm slightly back with held card
              refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -0.65, 0.28);
              refs.foreR.rotation.x = THREE.MathUtils.lerp(refs.foreR.rotation.x, 0.75, 0.28);
              refs.handR.rotation.x = THREE.MathUtils.lerp(refs.handR.rotation.x, 0.4, 0.28);
            } else if (p < 0.68) {
              // 2. Rapid whip-forward flick toward table felt
              refs.torso.rotation.x = THREE.MathUtils.lerp(refs.torso.rotation.x, 0.16, 0.35);
              refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, -1.35, 0.4);
              refs.foreR.rotation.x = THREE.MathUtils.lerp(refs.foreR.rotation.x, 0.15, 0.4);
              refs.handR.rotation.x = THREE.MathUtils.lerp(refs.handR.rotation.x, -1.15, 0.4);
            } else {
              // 3. Follow-through returning smoothly to resting felt pose
              refs.torso.rotation.x = THREE.MathUtils.lerp(refs.torso.rotation.x, 0, 0.18);
              refs.armR.rotation.x = THREE.MathUtils.lerp(refs.armR.rotation.x, Math.PI / 6, 0.18);
              refs.foreR.rotation.x = THREE.MathUtils.lerp(refs.foreR.rotation.x, Math.PI / 3, 0.18);
              refs.handR.rotation.x = THREE.MathUtils.lerp(refs.handR.rotation.x, -Math.PI / 3, 0.18);
            }
          } else {
            // Resting right arm on felt
            refs.armR.rotation.set(
              THREE.MathUtils.lerp(refs.armR.rotation.x, Math.PI / 6, 0.1),
              0,
              THREE.MathUtils.lerp(refs.armR.rotation.z, Math.PI / 10, 0.1)
            );
            refs.foreR.rotation.set(
              THREE.MathUtils.lerp(refs.foreR.rotation.x, Math.PI / 3, 0.1),
              0,
              0
            );
            refs.handR.position.set(0, -0.25, 0);
            refs.handR.rotation.set(
              THREE.MathUtils.lerp(refs.handR.rotation.x, -Math.PI / 3, 0.12),
              0,
              0
            );
          }

          refs.foreL.rotation.set(
            THREE.MathUtils.lerp(refs.foreL.rotation.x, Math.PI / 3, 0.1),
            0,
            0
          );
          // Keep left hand resting securely with fingers on felt
          refs.handL.position.set(0, -0.25, 0);
          refs.handL.rotation.set(
            THREE.MathUtils.lerp(refs.handL.rotation.x, -Math.PI / 3, 0.12),
            0,
            0
          );
        }
      });

      // Update flying trick cards (realistic ballistic throw physics onto the felt)
      activeTrickCardsRef.current.forEach((item) => {
        const elapsed = elapsedTime - item.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / item.duration));

        if (progress < 1) {
          // Ballistic throw trajectory (ease-out cubic horizontal travel)
          const t = 1 - Math.pow(1 - progress, 2.6);

          item.mesh.position.x = THREE.MathUtils.lerp(item.startPos.x, item.targetPos.x, t);
          item.mesh.position.z = THREE.MathUtils.lerp(item.startPos.z, item.targetPos.z, t);

          // Parabolic flight arc peaking above table
          const arcHeight = 0.85;
          item.mesh.position.y =
            THREE.MathUtils.lerp(item.startPos.y, item.targetPos.y, progress) +
            Math.sin(progress * Math.PI) * arcHeight;

          // Aerodynamic card tumble & rotation towards target orientation
          const wobble = Math.sin(progress * Math.PI * 2) * 0.22 * (1 - progress);
          item.mesh.rotation.x = THREE.MathUtils.lerp(item.startRot.x, item.targetRot.x, t) + wobble;
          item.mesh.rotation.y =
            THREE.MathUtils.lerp(item.startRot.y, item.targetRot.y, t) +
            Math.sin((1 - progress) * Math.PI) * 0.42;
          item.mesh.rotation.z =
            THREE.MathUtils.lerp(item.startRot.z, item.targetRot.z, t) +
            Math.sin(progress * Math.PI) * 0.16;
        } else {
          // Touchdown impact on felt
          if (!item.isLanded) {
            item.isLanded = true;
            item.landTime = elapsedTime;
            sounds.playCardDrop();
          }

          const settleTime = elapsedTime - (item.landTime || elapsedTime);
          if (settleTime < 0.14) {
            const bounce = Math.sin((settleTime / 0.14) * Math.PI) * 0.032 * (1 - settleTime / 0.14);
            item.mesh.position.x = item.targetPos.x;
            item.mesh.position.y = item.targetPos.y + bounce;
            item.mesh.position.z = item.targetPos.z;
            item.mesh.rotation.copy(item.targetRot);
          } else {
            item.mesh.position.copy(item.targetPos);
            item.mesh.rotation.copy(item.targetRot);
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      if (w / h < 1.55) {
        camera.fov = Math.min(65, 46 * (1.55 / (w / h)));
      } else {
        camera.fov = 46;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      activeTrickCardsRef.current.clear();
      characterThrowAnimRef.current = {};
      clockRef.current = null;
      disposeHierarchy(scene);
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [inGameTheme]);

  // 2. Dynamic Update: Render & Animate Card Throws onto the Table Felt
  useEffect(() => {
    const group = trickCardsGroupRef.current;
    if (!group) return;

    // Build unique keys for currently played trick cards
    const activeKeys = new Set(
      playedCards.map((pc) => `${pc.playerId}-${pc.card.id}-${pc.card.suit}-${pc.card.value}`)
    );

    // Remove cards no longer in the trick (trick completed/cleared)
    activeTrickCardsRef.current.forEach((item, key) => {
      if (!activeKeys.has(key)) {
        group.remove(item.mesh);
        disposeHierarchy(item.mesh);
        activeTrickCardsRef.current.delete(key);
      }
    });

    if (playedCards.length === 0) {
      return;
    }

    const tableHeight = 0.68;
    const nowSec = clockRef.current ? clockRef.current.getElapsedTime() : performance.now() / 1000;

    playedCards.forEach((pc, idx) => {
      const key = `${pc.playerId}-${pc.card.id}-${pc.card.suit}-${pc.card.value}`;

      // Calculate target resting position & rotation on the felt
      let targetX = 0;
      let targetZ = 0;
      let targetRotY = 0;

      // Calculate launch position from the throwing player's seated hand position
      let startX = 0;
      let startY = tableHeight + 0.95;
      let startZ = 0;
      let startRot = new THREE.Euler(0, 0, 0);

      if (pc.playerId === 'p0') {
        // You (South seat)
        startX = 0;
        startZ = 2.45;
        startRot = new THREE.Euler(-0.45, 0, 0);
        targetX = 0;
        targetZ = 0.75;
        targetRotY = 0;
      } else if (pc.playerId === 'p1') {
        // West Kid (West seat)
        startX = -2.45;
        startZ = 0;
        startRot = new THREE.Euler(0, Math.PI / 2, 0.45);
        targetX = -0.95;
        targetZ = 0;
        targetRotY = Math.PI / 2;
      } else if (pc.playerId === 'p2') {
        // Partner Pete (North seat)
        startX = 0;
        startZ = -2.45;
        startRot = new THREE.Euler(0.45, Math.PI, 0);
        targetX = 0;
        targetZ = -0.75;
        targetRotY = Math.PI;
      } else {
        // East Maverick (East seat)
        startX = 2.45;
        startZ = 0;
        startRot = new THREE.Euler(0, -Math.PI / 2, -0.45);
        targetX = 0.95;
        targetZ = 0;
        targetRotY = -Math.PI / 2;
      }

      const targetPos = new THREE.Vector3(targetX, tableHeight + 0.08 + idx * 0.012, targetZ);
      const targetRot = new THREE.Euler(0, targetRotY + (idx - 1.5) * 0.14, 0);

      // If this card is already tracked, just update its final resting layer height
      if (activeTrickCardsRef.current.has(key)) {
        const existing = activeTrickCardsRef.current.get(key)!;
        existing.targetPos.copy(targetPos);
        existing.targetRot.copy(targetRot);
        return;
      }

      // Create new 3D card mesh with realistic Bicycle front and back faces
      const cardGeo = new THREE.BoxGeometry(0.62, 0.016, 0.88);
      const frontTex = createRealisticCardTexture(pc.card);
      const backTex = createRealisticCardBackTexture('red');

      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.26,
        metalness: 0.02,
      });
      const backMat = new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.32,
        metalness: 0.02,
      });
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xfdfbf7,
        roughness: 0.55,
      });

      // 6-face box material: +Y is card face, -Y is Bicycle rider card back
      const cardMesh = new THREE.Mesh(cardGeo, [
        edgeMat,
        edgeMat,
        frontMat,
        backMat,
        edgeMat,
        edgeMat,
      ]);
      cardMesh.castShadow = true;
      cardMesh.receiveShadow = true;

      const startPos = new THREE.Vector3(startX, startY, startZ);
      cardMesh.position.copy(startPos);
      cardMesh.rotation.copy(startRot);

      group.add(cardMesh);

      // Register flight physics
      const throwDuration = 0.48;
      activeTrickCardsRef.current.set(key, {
        id: key,
        mesh: cardMesh,
        startPos,
        targetPos,
        startRot,
        targetRot,
        startTime: nowSec,
        duration: throwDuration,
        isLanded: false,
        playerId: pc.playerId,
      });

      // Trigger throwing character's arm flick gesture
      characterThrowAnimRef.current[pc.playerId] = {
        startTime: nowSec,
        duration: throwDuration,
      };

      // Crisp card throw whoosh sound
      sounds.playCardThrow();
    });
  }, [playedCards]);

  // 3. Dynamic Update: 3D 5s Scorecards on Felt
  useEffect(() => {
    const group = scoreCardsGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      disposeHierarchy(child);
    }

    const tableHeight = 0.68;
    const cardGeo5 = new THREE.BoxGeometry(0.5, 0.012, 0.7);
    const textureLoader = new THREE.TextureLoader();

    const texRedBack = textureLoader.load('/card_backs/rider-back-red.svg');
    const texBlueBack = textureLoader.load('/card_backs/rider-back-blue.svg');

    // --- Team 1 (Red 5s: 5 of Hearts & 5 of Diamonds) ---
    const t1BasePos: [number, number, number] = [-1.9, tableHeight + 0.08, 1.1];
    const t1RotY = 0.28;

    const t1HeartsTex = textureLoader.load('/cards/hearts-5.svg');
    const t1DiamondsTex = textureLoader.load('/cards/diamonds-5.svg');

    const t1MatBottom = new THREE.MeshStandardMaterial({
      map: t1HeartsTex,
      roughness: 0.25,
      metalness: 0.02,
    });
    const t1MatTop = new THREE.MeshStandardMaterial({
      map: team1Score >= 6 ? t1DiamondsTex : texRedBack,
      roughness: 0.25,
      metalness: 0.02,
    });

    const t1CardBottom = new THREE.Mesh(cardGeo5, t1MatBottom);
    t1CardBottom.position.set(t1BasePos[0], t1BasePos[1], t1BasePos[2]);
    t1CardBottom.rotation.y = t1RotY;
    t1CardBottom.castShadow = true;
    group.add(t1CardBottom);

    const t1SlideOffset = team1Score === 0 ? 0 : Math.min(0.36, (team1Score % 6) * 0.07);
    const t1CardTop = new THREE.Mesh(cardGeo5, t1MatTop);
    t1CardTop.position.set(
      t1BasePos[0] + Math.cos(t1RotY) * t1SlideOffset,
      t1BasePos[1] + 0.014,
      t1BasePos[2] - Math.sin(t1RotY) * t1SlideOffset
    );
    t1CardTop.rotation.y = t1RotY + (team1Score >= 6 ? 0.15 : -0.1);
    t1CardTop.castShadow = true;
    group.add(t1CardTop);

    // --- Team 2 (Black 5s: 5 of Spades & 5 of Clubs) ---
    const t2BasePos: [number, number, number] = [1.9, tableHeight + 0.08, -1.1];
    const t2RotY = Math.PI - 0.28;

    const t2SpadesTex = textureLoader.load('/cards/spades-5.svg');
    const t2ClubsTex = textureLoader.load('/cards/clubs-5.svg');

    const t2MatBottom = new THREE.MeshStandardMaterial({
      map: t2SpadesTex,
      roughness: 0.25,
      metalness: 0.02,
    });
    const t2MatTop = new THREE.MeshStandardMaterial({
      map: team2Score >= 6 ? t2ClubsTex : texBlueBack,
      roughness: 0.25,
      metalness: 0.02,
    });

    const t2CardBottom = new THREE.Mesh(cardGeo5, t2MatBottom);
    t2CardBottom.position.set(t2BasePos[0], t2BasePos[1], t2BasePos[2]);
    t2CardBottom.rotation.y = t2RotY;
    t2CardBottom.castShadow = true;
    group.add(t2CardBottom);

    const t2SlideOffset = team2Score === 0 ? 0 : Math.min(0.36, (team2Score % 6) * 0.07);
    const t2CardTop = new THREE.Mesh(cardGeo5, t2MatTop);
    t2CardTop.position.set(
      t2BasePos[0] + Math.cos(t2RotY) * t2SlideOffset,
      t2BasePos[1] + 0.014,
      t2BasePos[2] - Math.sin(t2RotY) * t2SlideOffset
    );
    t2CardTop.rotation.y = t2RotY + (team2Score >= 6 ? 0.15 : -0.1);
    t2CardTop.castShadow = true;
    group.add(t2CardTop);
  }, [team1Score, team2Score]);

  return <div ref={mountRef} className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden" />;
};
