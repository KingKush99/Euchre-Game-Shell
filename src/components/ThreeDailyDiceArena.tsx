import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerProfile } from '../types/poker';
import { create3DPlayerCharacter, ArticulatedCharacter3D } from '../utils/create3DCharacter';
import { sounds } from '../utils/soundEffects';

interface ThreeDailyDiceArenaProps {
  playerProfile?: PlayerProfile;
  diceValues: number[];
  held: boolean[];
  isRolling: boolean;
  rollTriggerCount: number;
  onToggleHold: (index: number) => void;
}

// Generate high-resolution canvas textures for the 6 faces of a red saloon die with crisp white dots
function createDiceTextures(): THREE.CanvasTexture[] {
  const textures: THREE.CanvasTexture[] = [];

  // Face values 1 to 6
  for (let val = 1; val <= 6; val++) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Vibrant Crimson Casino Red Background with subtle specular rim
      const bgGrad = ctx.createRadialGradient(128, 128, 20, 128, 128, 150);
      bgGrad.addColorStop(0, '#dc2626'); // Bright red core
      bgGrad.addColorStop(0.75, '#b91c1c'); // Rich crimson
      bgGrad.addColorStop(1, '#881313'); // Deep dark border for 3D curvature
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 256, 256);

      // Subtle rounded border inset highlight
      ctx.strokeStyle = 'rgba(254, 202, 202, 0.45)';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 236, 236);

      // 2. White Dots (Pips)
      ctx.fillStyle = '#ffffff';
      const drawPip = (x: number, y: number) => {
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Subtle specular highlight on pip
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Subtle drop shadow ring
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff'; // reset
      };

      const c = 128;
      const l = 68;
      const r = 188;
      const t = 68;
      const b = 188;

      if (val === 1) {
        drawPip(c, c);
      } else if (val === 2) {
        drawPip(l, t);
        drawPip(r, b);
      } else if (val === 3) {
        drawPip(l, t);
        drawPip(c, c);
        drawPip(r, b);
      } else if (val === 4) {
        drawPip(l, t);
        drawPip(r, t);
        drawPip(l, b);
        drawPip(r, b);
      } else if (val === 5) {
        drawPip(l, t);
        drawPip(r, t);
        drawPip(c, c);
        drawPip(l, b);
        drawPip(r, b);
      } else if (val === 6) {
        drawPip(l, t);
        drawPip(l, c);
        drawPip(l, b);
        drawPip(r, t);
        drawPip(r, c);
        drawPip(r, b);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
  }

  return textures;
}

// Map face numbers to Three.js BoxGeometry material order:
// [+X, -X, +Y, -Y, +Z, -Z] -> standard layout where opposite sides sum to 7:
// +X: 2, -X: 5
// +Y: 1, -Y: 6
// +Z: 3, -Z: 4
function getDiceMaterials(textures: THREE.CanvasTexture[]): THREE.MeshStandardMaterial[] {
  const t1 = textures[0];
  const t2 = textures[1];
  const t3 = textures[2];
  const t4 = textures[3];
  const t5 = textures[4];
  const t6 = textures[5];

  const createMat = (map: THREE.CanvasTexture) =>
    new THREE.MeshStandardMaterial({
      map,
      roughness: 0.28,
      metalness: 0.1,
    });

  return [
    createMat(t2), // +X (face 2)
    createMat(t5), // -X (face 5)
    createMat(t1), // +Y (face 1)
    createMat(t6), // -Y (face 6)
    createMat(t3), // +Z (face 3)
    createMat(t4), // -Z (face 4)
  ];
}

// Compute rotation angles (in radians) so that target face value is facing UP (+Y)
function getTargetFaceRotation(value: number): { x: number; y: number; z: number } {
  // Base alignments for face to point UP:
  switch (value) {
    case 1: // +Y is already up
      return { x: 0, y: 0, z: 0 };
    case 2: // +X is face 2 -> rotate around Z by -PI/2
      return { x: 0, y: 0, z: -Math.PI / 2 };
    case 3: // +Z is face 3 -> rotate around X by PI/2
      return { x: Math.PI / 2, y: 0, z: 0 };
    case 4: // -Z is face 4 -> rotate around X by -PI/2
      return { x: -Math.PI / 2, y: 0, z: 0 };
    case 5: // -X is face 5 -> rotate around Z by PI/2
      return { x: 0, y: 0, z: Math.PI / 2 };
    case 6: // -Y is face 6 -> rotate around X by PI
      return { x: Math.PI, y: 0, z: 0 };
    default:
      return { x: 0, y: 0, z: 0 };
  }
}

// Fixed resting slots for 5 dice inside the wooden box
const RESTING_SLOTS = [
  { x: -1.75, z: -0.65 },
  { x: -0.85, z: 0.65 },
  { x: 0.1, z: -0.55 },
  { x: 1.05, z: 0.6 },
  { x: 1.95, z: -0.4 },
];

// Classic American Red Solo Cup 3D Model with rolled white rim, horizontal grip ribs, and glossy plastic finish
function createRedSoloCup(): THREE.Group {
  const cupGroup = new THREE.Group();

  // Glossy Crimson Red Plastic Outer Material
  const redPlasticMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Iconic Red Solo Cup Crimson
    roughness: 0.22,
    metalness: 0.04,
  });

  // Pure White Plastic Inner Liner Material
  const whitePlasticMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.02,
    side: THREE.BackSide,
  });

  // White Rolled Top Rim Material
  const whiteRimMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.02,
  });

  // 1. Main outer red tapered cup wall
  const outerGeo = new THREE.CylinderGeometry(0.55, 0.39, 1.38, 36, 1, true);
  const outerMesh = new THREE.Mesh(outerGeo, redPlasticMat);
  outerMesh.castShadow = true;
  outerMesh.receiveShadow = true;
  cupGroup.add(outerMesh);

  // 2. Inner white plastic liner
  const innerGeo = new THREE.CylinderGeometry(0.53, 0.37, 1.36, 36, 1, true);
  const innerMesh = new THREE.Mesh(innerGeo, whitePlasticMat);
  cupGroup.add(innerMesh);

  // 3. White rolled top lip rim (the classic signature lip of a Solo cup)
  const topLipGeo = new THREE.TorusGeometry(0.545, 0.038, 16, 36);
  const topLip = new THREE.Mesh(topLipGeo, whiteRimMat);
  topLip.rotation.x = Math.PI / 2;
  topLip.position.y = 0.69;
  topLip.castShadow = true;
  cupGroup.add(topLip);

  // 4. Characteristic horizontal grip ribs / stepped ridges along mid and lower sections
  const ribLevels = [
    { y: 0.22, r: 0.51, thick: 0.016 },
    { y: 0.05, r: 0.48, thick: 0.016 },
    { y: -0.12, r: 0.45, thick: 0.016 },
    { y: -0.28, r: 0.43, thick: 0.016 },
    { y: -0.42, r: 0.41, thick: 0.014 },
  ];

  ribLevels.forEach((rib) => {
    const ribGeo = new THREE.TorusGeometry(rib.r, rib.thick, 12, 36);
    const ribMesh = new THREE.Mesh(ribGeo, redPlasticMat);
    ribMesh.rotation.x = Math.PI / 2;
    ribMesh.position.y = rib.y;
    cupGroup.add(ribMesh);
  });

  // 5. Stepped bottom base
  const baseOuterGeo = new THREE.CylinderGeometry(0.39, 0.36, 0.06, 36);
  const baseOuter = new THREE.Mesh(baseOuterGeo, redPlasticMat);
  baseOuter.position.y = -0.66;
  baseOuter.castShadow = true;
  cupGroup.add(baseOuter);

  // Base inner bottom disc
  const baseInnerGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.02, 36);
  const baseInner = new THREE.Mesh(baseInnerGeo, whitePlasticMat);
  baseInner.position.y = -0.63;
  cupGroup.add(baseInner);

  return cupGroup;
}

export const ThreeDailyDiceArena: React.FC<ThreeDailyDiceArenaProps> = ({
  playerProfile,
  diceValues,
  held,
  isRolling,
  rollTriggerCount,
  onToggleHold,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredDieIndex, setHoveredDieIndex] = useState<number | null>(null);

  // References across animation frames
  const diceMeshesRef = useRef<THREE.Mesh[]>([]);
  const heldIndicatorsRef = useRef<THREE.Mesh[]>([]);
  const characterRef = useRef<ArticulatedCharacter3D | null>(null);
  const diceCupRef = useRef<THREE.Group | null>(null);
  const animTimeRef = useRef<{
    startTime: number;
    duration: number;
    active: boolean;
    hasPlayedClatter: boolean;
  }>({
    startTime: 0,
    duration: 1.6,
    active: false,
    hasPlayedClatter: false,
  });

  // Track latest props in refs for the animation loop
  const diceValuesRef = useRef(diceValues);
  diceValuesRef.current = diceValues;

  const heldRef = useRef(held);
  heldRef.current = held;
  const lastTriggerRef = useRef<number>(0);

  // Setup Three.js scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 340;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep saloon night black/navy

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.2, 5.8, 6.4);
    camera.lookAt(0.3, 0.2, 0.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.75); // Warm saloon glow
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3db, 1.25);
    dirLight.position.set(3, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const boxSpotLight = new THREE.SpotLight(0xffddaa, 1.4, 15, Math.PI / 4, 0.4);
    boxSpotLight.position.set(0.5, 6.0, 0.5);
    boxSpotLight.target.position.set(0.5, 0, 0);
    scene.add(boxSpotLight);
    scene.add(boxSpotLight.target);

    // Subtle blue rim light for character silhouette
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-5, 4, -3);
    scene.add(rimLight);

    // 3. Saloon Floorboards (Underneath entire scene)
    const floorGeo = new THREE.PlaneGeometry(16, 12);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x181008,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    // 4. THE WOODEN DICE BOX / TRAY
    const boxGroup = new THREE.Group();
    boxGroup.position.set(0.65, 0, 0.1);

    const boxWidth = 5.6;
    const boxDepth = 3.6;
    const wallHeight = 0.65;
    const wallThickness = 0.28;

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x3d1c06, // Rich dark polished mahogany
      roughness: 0.45,
      metalness: 0.1,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished brass trim & corners
      roughness: 0.25,
      metalness: 0.85,
    });

    // Felt Floor (Deep green saloon felt)
    const feltGeo = new THREE.BoxGeometry(boxWidth, 0.1, boxDepth);
    const feltMat = new THREE.MeshStandardMaterial({
      color: 0x0c3e23, // Classic deep emerald casino felt
      roughness: 0.95,
      metalness: 0.0,
    });
    const felt = new THREE.Mesh(feltGeo, feltMat);
    felt.position.y = 0.05;
    felt.receiveShadow = true;
    boxGroup.add(felt);

    // Box Wooden Walls (Back, Front, Left, Right)
    // Back wall
    const wallBack = new THREE.Mesh(
      new THREE.BoxGeometry(boxWidth + wallThickness * 2, wallHeight, wallThickness),
      woodMat
    );
    wallBack.position.set(0, wallHeight / 2, -boxDepth / 2 - wallThickness / 2);
    wallBack.castShadow = true;
    wallBack.receiveShadow = true;
    boxGroup.add(wallBack);

    // Front wall
    const wallFront = new THREE.Mesh(
      new THREE.BoxGeometry(boxWidth + wallThickness * 2, wallHeight, wallThickness),
      woodMat
    );
    wallFront.position.set(0, wallHeight / 2, boxDepth / 2 + wallThickness / 2);
    wallFront.castShadow = true;
    wallFront.receiveShadow = true;
    boxGroup.add(wallFront);

    // Left wall
    const wallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, boxDepth),
      woodMat
    );
    wallLeft.position.set(-boxWidth / 2 - wallThickness / 2, wallHeight / 2, 0);
    wallLeft.castShadow = true;
    wallLeft.receiveShadow = true;
    boxGroup.add(wallLeft);

    // Right wall
    const wallRight = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, boxDepth),
      woodMat
    );
    wallRight.position.set(boxWidth / 2 + wallThickness / 2, wallHeight / 2, 0);
    wallRight.castShadow = true;
    wallRight.receiveShadow = true;
    boxGroup.add(wallRight);

    // Brass corner brackets on 4 corners
    const cornerPositions = [
      { x: -boxWidth / 2 - wallThickness / 2, z: -boxDepth / 2 - wallThickness / 2 },
      { x: boxWidth / 2 + wallThickness / 2, z: -boxDepth / 2 - wallThickness / 2 },
      { x: -boxWidth / 2 - wallThickness / 2, z: boxDepth / 2 + wallThickness / 2 },
      { x: boxWidth / 2 + wallThickness / 2, z: boxDepth / 2 + wallThickness / 2 },
    ];
    cornerPositions.forEach((pos) => {
      const cornerBracket = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness * 1.3, wallHeight * 1.05, wallThickness * 1.3),
        brassMat
      );
      cornerBracket.position.set(pos.x, wallHeight / 2, pos.z);
      boxGroup.add(cornerBracket);
    });

    // Gold Saloon Stamp in Center of Felt
    const goldStampGeo = new THREE.RingGeometry(0.35, 0.42, 32);
    const goldStamp = new THREE.Mesh(goldStampGeo, brassMat);
    goldStamp.rotation.x = -Math.PI / 2;
    goldStamp.position.set(0, 0.11, 0);
    boxGroup.add(goldStamp);

    scene.add(boxGroup);

    // 5. FIVE 3D RED DICE WITH WHITE DOTS
    const diceTextures = createDiceTextures();
    const diceMaterials = getDiceMaterials(diceTextures);

    const diceSize = 0.62;
    const dieGeo = new THREE.BoxGeometry(diceSize, diceSize, diceSize);

    const diceMeshes: THREE.Mesh[] = [];
    const indicators: THREE.Mesh[] = [];

    for (let i = 0; i < 5; i++) {
      const dieMesh = new THREE.Mesh(dieGeo, diceMaterials);
      dieMesh.castShadow = true;
      dieMesh.receiveShadow = true;
      dieMesh.userData = { dieIndex: i };

      const slot = RESTING_SLOTS[i];
      dieMesh.position.set(boxGroup.position.x + slot.x, 0.1 + diceSize / 2, boxGroup.position.z + slot.z);

      const targetRot = getTargetFaceRotation(diceValuesRef.current[i] || 1);
      dieMesh.rotation.set(targetRot.x, targetRot.y, targetRot.z);

      scene.add(dieMesh);
      diceMeshes.push(dieMesh);

      // Held Indicator Base Ring (Glows emerald/gold under held dice)
      const ringGeo = new THREE.RingGeometry(0.38, 0.46, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(boxGroup.position.x + slot.x, 0.12, boxGroup.position.z + slot.z);
      scene.add(ring);
      indicators.push(ring);
    }

    diceMeshesRef.current = diceMeshes;
    heldIndicatorsRef.current = indicators;

    // 6. THE USER'S 3D CHARACTER (from their profile)
    const effectiveProfile: PlayerProfile = playerProfile || {
      id: 'player',
      username: 'Lucky Gambler',
      name: 'Lucky Gambler',
      avatar: '🤠',
      level: 1,
      chips: 5000,
      sovereigns: 100,
    };

    const character = create3DPlayerCharacter(effectiveProfile);
    character.setNameplateVisible(false);
    character.group.scale.set(0.25, 0.25, 0.25);
    character.group.position.set(-3.2, 0, 0.4); // Standing proudly to the left of the tray
    character.group.rotation.y = 0.65; // Facing toward the dice box
    scene.add(character.group);
    characterRef.current = character;

    // 7. CLASSIC RED SOLO CUP
    const soloCup = createRedSoloCup();
    soloCup.position.set(-2.35, 0.72, 0.55); // Standing upright on table beside character
    soloCup.rotation.set(0, 0, 0);
    scene.add(soloCup);
    diceCupRef.current = soloCup;

    // 8. Raycasting for Clicking Directly on 3D Dice to Hold/Unhold
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(diceMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const idx = hit.userData.dieIndex;
        if (typeof idx === 'number') {
          sounds.playClick();
          onToggleHold(idx);
        }
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(diceMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        setHoveredDieIndex(hit.userData.dieIndex);
        container.style.cursor = 'pointer';
      } else {
        setHoveredDieIndex(null);
        container.style.cursor = 'default';
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. ANIMATION LOOP
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTotal = clock.getElapsedTime();

      // Gentle subtle breathing on character
      if (characterRef.current) {
        characterRef.current.updateAnimation(delta, false);
      }

      // Update Held Indicators Opacity and Pulse
      indicators.forEach((ring, idx) => {
        const isHeld = heldRef.current[idx];
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (isHeld) {
          mat.opacity = 0.75 + Math.sin(elapsedTotal * 5) * 0.2;
          mat.color.setHex(0x34d399); // Emerald pulse
        } else {
          mat.opacity = 0.0;
        }
      });

      // Handle Active Throw Animation with the Saloon Leather Cup
      const animState = animTimeRef.current;
      const diceCup = diceCupRef.current;

      if (animState.active) {
        const animElapsed = (Date.now() - animState.startTime) / 1000;
        const p = Math.min(1.0, animElapsed / animState.duration);

        // Cup keyframe positions
        const CUP_REST_POS = new THREE.Vector3(-2.35, 0.72, 0.55);
        const CUP_SHAKE_POS = new THREE.Vector3(-2.05, 1.65, 0.45);
        const CUP_TILT_POS = new THREE.Vector3(-0.92, 1.35, 0.12);

        if (p < 0.36) {
          // PHASE 1: GRAB & SHAKE THE CUP (0.0 <= p < 0.36)
          const grabT = Math.min(1.0, p / 0.14);
          if (characterRef.current) {
            const char = characterRef.current;
            char.rightArm.rotation.x = THREE.MathUtils.lerp(0, -1.25, grabT);
            char.rightArm.rotation.z = THREE.MathUtils.lerp(0, -0.32, grabT);
            char.torso.rotation.y = THREE.MathUtils.lerp(0, -0.2, grabT);
          }

          if (diceCup) {
            diceCup.position.lerpVectors(CUP_REST_POS, CUP_SHAKE_POS, grabT);
            // Vigorous rattle and vibration in the cup
            const shakeY = Math.sin(animElapsed * 38) * 0.12;
            const shakeTiltZ = Math.sin(animElapsed * 42) * 0.22;
            const shakePitchX = Math.cos(animElapsed * 36) * 0.14;
            diceCup.position.y += shakeY;
            diceCup.rotation.z = shakeTiltZ;
            diceCup.rotation.x = shakePitchX;
          }

          // Unheld dice are nested inside the shaking cup!
          diceMeshes.forEach((mesh, idx) => {
            if (heldRef.current[idx]) {
              const slot = RESTING_SLOTS[idx];
              mesh.position.set(boxGroup.position.x + slot.x, 0.1 + diceSize / 2, boxGroup.position.z + slot.z);
              const targetRot = getTargetFaceRotation(diceValuesRef.current[idx]);
              mesh.rotation.set(targetRot.x, targetRot.y, targetRot.z);
              mesh.scale.set(1, 1, 1);
              return;
            }

            if (diceCup) {
              mesh.position.set(
                diceCup.position.x + ((idx % 3) - 1) * 0.08,
                diceCup.position.y + 0.14 + Math.sin(animElapsed * 35 + idx) * 0.05,
                diceCup.position.z + ((idx % 2) - 0.5) * 0.08
              );
              mesh.rotation.x += 0.35;
              mesh.rotation.y += 0.45;
              mesh.scale.set(0.85, 0.85, 0.85); // tucked inside cup
            }
          });
        } else if (p < 0.76) {
          // PHASE 2: SWEEP CUP FORWARD & ROLL DICE OUT ONTO FELT (0.36 <= p < 0.76)
          const sweepT = (p - 0.36) / 0.22;
          const sweepClamped = Math.min(1.0, Math.max(0.0, sweepT));

          if (characterRef.current) {
            const char = characterRef.current;
            char.rightArm.rotation.x = THREE.MathUtils.lerp(-1.25, 0.95, sweepClamped);
            char.rightArm.rotation.z = THREE.MathUtils.lerp(-0.32, 0.2, sweepClamped);
            char.torso.rotation.y = THREE.MathUtils.lerp(-0.2, 0.35, sweepClamped);
          }

          if (diceCup) {
            diceCup.position.lerpVectors(CUP_SHAKE_POS, CUP_TILT_POS, sweepClamped);
            diceCup.rotation.z = THREE.MathUtils.lerp(0, -Math.PI * 0.58, sweepClamped); // mouth angled down towards felt
            diceCup.rotation.x = THREE.MathUtils.lerp(0, 0.25, sweepClamped);
          }

          // Unheld dice roll out of the cup mouth!
          diceMeshes.forEach((mesh, idx) => {
            if (heldRef.current[idx]) {
              const slot = RESTING_SLOTS[idx];
              mesh.position.set(boxGroup.position.x + slot.x, 0.1 + diceSize / 2, boxGroup.position.z + slot.z);
              const targetRot = getTargetFaceRotation(diceValuesRef.current[idx]);
              mesh.rotation.set(targetRot.x, targetRot.y, targetRot.z);
              mesh.scale.set(1, 1, 1);
              return;
            }

            const dieStagger = 0.36 + idx * 0.035;
            if (p < dieStagger) {
              if (diceCup) {
                mesh.position.set(diceCup.position.x + 0.2, diceCup.position.y - 0.1, diceCup.position.z);
                mesh.scale.set(0.9, 0.9, 0.9);
              }
            } else {
              const flightP = (p - dieStagger) / (0.92 - dieStagger);
              const flightClamped = Math.min(1.0, Math.max(0.0, flightP));

              const mouthPos = new THREE.Vector3(CUP_TILT_POS.x + 0.25, CUP_TILT_POS.y - 0.15, CUP_TILT_POS.z);
              const slot = RESTING_SLOTS[idx];
              const targetPos = new THREE.Vector3(
                boxGroup.position.x + slot.x,
                0.1 + diceSize / 2,
                boxGroup.position.z + slot.z
              );

              mesh.position.lerpVectors(mouthPos, targetPos, flightClamped);

              // Parabolic bounce and tumble across green felt
              const forwardArc = Math.sin(flightClamped * Math.PI) * 0.42;
              const bounce =
                flightClamped > 0.42 && flightClamped < 0.85
                  ? Math.abs(Math.sin((flightClamped - 0.42) * Math.PI * 3.5)) * 0.22 * (1 - flightClamped)
                  : 0;
              mesh.position.y += forwardArc + bounce;
              mesh.scale.set(1, 1, 1);

              if (flightClamped < 0.88) {
                mesh.rotation.x += 0.45 + idx * 0.06;
                mesh.rotation.y += 0.35 + idx * 0.05;
                mesh.rotation.z += 0.40 + idx * 0.07;
              } else {
                const settleT = Math.min(1.0, (flightClamped - 0.88) / 0.12);
                const targetRot = getTargetFaceRotation(diceValuesRef.current[idx]);
                mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRot.x + Math.PI * 4, settleT * 0.4);
                mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRot.y, settleT * 0.4);
                mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, targetRot.z + Math.PI * 4, settleT * 0.4);
              }
            }
          });

          if (p > 0.52 && !animState.hasPlayedClatter) {
            animState.hasPlayedClatter = true;
            sounds.playDiceRoll();
          }
        } else {
          // PHASE 3: CUP RETURNS & RIGHTS ITSELF (0.76 <= p <= 1.0)
          const returnT = (p - 0.76) / 0.24;
          const returnClamped = Math.min(1.0, Math.max(0.0, returnT));

          if (characterRef.current) {
            const char = characterRef.current;
            char.rightArm.rotation.x = THREE.MathUtils.lerp(0.95, 0, returnClamped);
            char.rightArm.rotation.z = THREE.MathUtils.lerp(0.2, 0, returnClamped);
            char.torso.rotation.y = THREE.MathUtils.lerp(0.35, 0, returnClamped);
          }

          if (diceCup) {
            diceCup.position.lerpVectors(CUP_TILT_POS, CUP_REST_POS, returnClamped);
            diceCup.rotation.z = THREE.MathUtils.lerp(-Math.PI * 0.58, 0, returnClamped);
            diceCup.rotation.x = THREE.MathUtils.lerp(0.25, 0, returnClamped);
          }

          diceMeshes.forEach((mesh, idx) => {
            const slot = RESTING_SLOTS[idx];
            const targetPos = new THREE.Vector3(
              boxGroup.position.x + slot.x,
              0.1 + diceSize / 2,
              boxGroup.position.z + slot.z
            );
            mesh.position.lerp(targetPos, 0.25);
            const targetRot = getTargetFaceRotation(diceValuesRef.current[idx]);
            mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRot.x, 0.25);
            mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRot.y, 0.25);
            mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, targetRot.z, 0.25);
            mesh.scale.set(1, 1, 1);
          });
        }

        // Finish animation
        if (p >= 1.0) {
          animState.active = false;
          if (diceCup) {
            diceCup.position.copy(CUP_REST_POS);
            diceCup.rotation.set(0, 0, 0);
          }
          diceMeshes.forEach((mesh, idx) => {
            const slot = RESTING_SLOTS[idx];
            mesh.position.set(boxGroup.position.x + slot.x, 0.1 + diceSize / 2, boxGroup.position.z + slot.z);
            const targetRot = getTargetFaceRotation(diceValuesRef.current[idx]);
            mesh.rotation.set(targetRot.x, targetRot.y, targetRot.z);
            mesh.scale.set(1, 1, 1);
          });
        }
      } else {
        // Idle: Cup rests standing upright beside tray
        if (diceCup) {
          diceCup.position.set(-2.35, 0.72, 0.55);
          diceCup.rotation.set(0, 0, 0);
        }
      }

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      diceTextures.forEach((t) => t.dispose());
      diceMaterials.forEach((m) => m.dispose());
      if (characterRef.current) {
        characterRef.current.dispose();
      }
    };
  }, [playerProfile]);

  // Trigger throw animation strictly once when rollTriggerCount changes
  useEffect(() => {
    if (rollTriggerCount > lastTriggerRef.current) {
      lastTriggerRef.current = rollTriggerCount;
      animTimeRef.current = {
        startTime: Date.now(),
        duration: 1.6,
        active: true,
        hasPlayedClatter: false,
      };
    }
  }, [rollTriggerCount]);

  // Update die orientations whenever values or held states change while resting
  useEffect(() => {
    if (animTimeRef.current.active) return; // let animation handle it

    diceMeshesRef.current.forEach((mesh, idx) => {
      const slot = RESTING_SLOTS[idx];
      mesh.position.set(0.65 + slot.x, 0.1 + 0.62 / 2, 0.1 + slot.z);
      const targetRot = getTargetFaceRotation(diceValues[idx] || 1);
      mesh.rotation.set(targetRot.x, targetRot.y, targetRot.z);
    });
  }, [diceValues]);

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-3xl overflow-hidden border-2 border-red-500/70 bg-black shadow-[inset_0_0_60px_rgba(0,0,0,0.95)] select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating 3D Badge Indicator */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-300 bg-black/85 border border-red-500/50 px-3 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          🎲 3D RED SOLO CUP & SALOON TRAY • CLICK DIE TO HOLD
        </span>
      </div>

      {/* Character Nameplate Pin */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <div className="bg-black/85 border border-slate-700 px-3 py-1 rounded-xl text-left shadow-lg backdrop-blur-sm">
          <div className="text-[9px] font-black uppercase text-amber-400">ROLLER</div>
          <div className="text-xs font-black text-white">{playerProfile?.name || 'Saloon Gambler'}</div>
        </div>
      </div>

      {/* Hovered Die Tooltip */}
      {hoveredDieIndex !== null && !isRolling && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none animate-in fade-in duration-150">
          <span className="text-xs font-black bg-emerald-500 text-stone-950 px-3 py-1 rounded-full shadow-lg">
            Die #{hoveredDieIndex + 1}: Value {diceValues[hoveredDieIndex]} ({held[hoveredDieIndex] ? 'HELD ✓' : 'Click to Hold'})
          </span>
        </div>
      )}
    </div>
  );
};
