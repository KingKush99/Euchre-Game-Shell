import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerProfile, TownLocation } from '../types/poker';
import { ALLOW_ALL_CITIES_UNRESTRICTED, TOWNS_DATA } from '../data/gameData';
import {
  Trophy,
  Play,
  Lock,
  CheckCircle2,
  CloudFog,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface ThreeCandyCrush3DMapProps {
  playerProfile: PlayerProfile;
  onSelectTown?: (town: TownLocation) => void;
  onTravelToTown?: (town: TownLocation) => void;
}

// Helper: Create 5-pointed Star Shape for 3D extrusion (Sheriff / Frontier Star)
function createStarShape(points = 5, outerRadius = 1.45, innerRadius = 0.85): THREE.Shape {
  const shape = new THREE.Shape();
  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export const ThreeCandyCrush3DMap: React.FC<ThreeCandyCrush3DMapProps> = ({
  playerProfile,
  onSelectTown,
  onTravelToTown,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('pine_hollow');
  const [cameraDragOffsetZ, setCameraDragOffsetZ] = useState<number>(0);

  const towns = TOWNS_DATA;
  const selectedTown = towns.find((t) => t.id === selectedLevelId) || towns[0];

  const currentLevel = playerProfile.level || 0;

  const isLevelUnlocked = (town: TownLocation, idx: number) => {
    if (ALLOW_ALL_CITIES_UNRESTRICTED) return true;
    if (idx === 0) return true;
    if (playerProfile.level >= town.requiredLevel) return true;
    if (playerProfile.conqueredTowns?.includes(towns[idx - 1].id)) return true;
    return false;
  };

  const isLevelConquered = (town: TownLocation) => {
    return playerProfile.conqueredTowns?.includes(town.id) || town.conquered || false;
  };

  // Antique Woodcut / Brass Engraved Level Badge Texture
  const createOldStyleLevelTexture = (levelNum: number, isUnlocked: boolean, isConquered: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Antique Parchment / Brass disc face
    const grad = ctx.createRadialGradient(110, 100, 15, 128, 128, 120);
    if (isConquered) {
      grad.addColorStop(0, '#fef3c7');
      grad.addColorStop(0.4, '#d97706');
      grad.addColorStop(1, '#78350f');
    } else if (isUnlocked) {
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#b45309');
      grad.addColorStop(1, '#451a03');
    } else {
      grad.addColorStop(0, '#64748b');
      grad.addColorStop(0.6, '#334155');
      grad.addColorStop(1, '#0f172a');
    }

    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Weathered Brass Engraved Outer Rings
    ctx.lineWidth = 8;
    ctx.strokeStyle = isConquered ? '#fde047' : isUnlocked ? '#d97706' : '#475569';
    ctx.stroke();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1a0c02';
    ctx.stroke();

    // Inner dashed compass stitch
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isUnlocked ? 'rgba(254, 240, 138, 0.6)' : 'rgba(203, 213, 225, 0.3)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Bold Vintage Woodcut Number
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Deep Carved Shadow
    ctx.font = '900 96px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#0a0401';
    ctx.fillText(String(levelNum), 128, 142);

    // Warm Gold/Parchment Face
    ctx.fillStyle = isConquered ? '#ffffff' : isUnlocked ? '#fef3c7' : '#94a3b8';
    ctx.fillText(String(levelNum), 128, 138);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Warm Western Frontier Horizon
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1f150e');
    scene.fog = new THREE.FogExp2('#2b1c12', 0.022);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 140);
    camera.position.set(0, 11, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 3. Warm Western Sunset & Lantern Lighting
    const ambientLight = new THREE.AmbientLight('#92704c', 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#ffddaa', 1.6);
    sunLight.position.set(12, 22, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight('#fef08a', '#3e2415', 0.5);
    scene.add(hemiLight);

    // 4. Sandstone Canyon / Weathered Frontier Topography
    const terrainGeo = new THREE.PlaneGeometry(55, 95, 48, 64);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let p = 0; p < posAttr.count; p++) {
      const vx = posAttr.getX(p);
      const vz = posAttr.getZ(p);
      const hillHeight = Math.sin(vx * 0.18) * 1.6 + Math.cos(vz * 0.12) * 1.3 - 2.6;
      posAttr.setY(p, hillHeight);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: '#a37648', // Warm antique sandstone parchment
      roughness: 0.9,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Weathered Western Pine Trees & Sandstone Boulders
    for (let t = 0; t < 24; t++) {
      const propGroup = new THREE.Group();
      const tx = ((t % 2 === 0 ? 1 : -1) * (6.5 + (t % 5) * 2.2)) + (Math.sin(t) * 1.4);
      const tz = 14 - t * 2.6;
      const ty = Math.sin(tx * 0.18) * 1.6 + Math.cos(tz * 0.12) * 1.3 - 2.6;

      if (t % 3 === 0) {
        // Sandstone Mesa Rock
        const rockGeo = new THREE.DodecahedronGeometry(1.1 + (t % 2) * 0.4, 0);
        rockGeo.scale(1.4, 0.8, 1.2);
        const rockMat = new THREE.MeshStandardMaterial({ color: '#7c5535', roughness: 0.95 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.y = 0.5;
        rock.castShadow = true;
        propGroup.add(rock);
      } else {
        // Frontier Alpine Pine
        const trunkGeo = new THREE.CylinderGeometry(0.18, 0.26, 2.0, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: '#452614', roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.0;
        trunk.castShadow = true;
        propGroup.add(trunk);

        // 3 Tiers of dark pine foliage
        [1.8, 2.7, 3.4].forEach((py, idx) => {
          const coneGeo = new THREE.ConeGeometry(1.3 - idx * 0.35, 1.4, 7);
          const pineMat = new THREE.MeshStandardMaterial({ color: '#273e27', roughness: 0.85 });
          const cone = new THREE.Mesh(coneGeo, pineMat);
          cone.position.y = py;
          cone.castShadow = true;
          propGroup.add(cone);
        });
      }

      propGroup.position.set(tx, ty, tz);
      scene.add(propGroup);
    }

    // 5. Weathered Frontier Wagon Trail (Rutted timber & gravel path)
    const curvePoints: THREE.Vector3[] = [];
    const levelPositions: { pos: THREE.Vector3; town: TownLocation; idx: number }[] = [];

    const numLevels = towns.length;
    for (let i = 0; i < numLevels; i++) {
      const x = Math.sin(i * 1.35) * 4.6;
      const y = i * 0.95 - 0.4;
      const z = 12 - i * 3.4;

      const pt = new THREE.Vector3(x, y, z);
      curvePoints.push(pt);
      levelPositions.push({ pos: pt, town: towns[i], idx: i });
    }

    const pathCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(pathCurve, 140, 0.52, 12, false);

    // Weathered pioneer trail texture
    const trailCanvas = document.createElement('canvas');
    trailCanvas.width = 256;
    trailCanvas.height = 64;
    const tctx = trailCanvas.getContext('2d');
    if (tctx) {
      tctx.fillStyle = '#6e4a28'; // Dirt earth
      tctx.fillRect(0, 0, 256, 64);
      tctx.fillStyle = '#4a3219'; // Weathered wooden cross-ties
      for (let s = 0; s < 256; s += 24) {
        tctx.fillRect(s, 4, 10, 56);
      }
      // Golden wagon ruts
      tctx.fillStyle = '#8c6035';
      tctx.fillRect(0, 16, 256, 4);
      tctx.fillRect(0, 44, 256, 4);
    }
    const trailTex = new THREE.CanvasTexture(trailCanvas);
    trailTex.wrapS = THREE.RepeatWrapping;
    trailTex.wrapT = THREE.RepeatWrapping;
    trailTex.repeat.set(24, 1);

    const tubeMat = new THREE.MeshStandardMaterial({
      map: trailTex,
      roughness: 0.8,
      metalness: 0.1,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.receiveShadow = true;
    scene.add(tubeMesh);

    // 6. 3D SHERIFF STAR LEVEL NODES
    const levelMeshes: THREE.Mesh[] = [];
    const cloudsList: { group: THREE.Group; basePos: THREE.Vector3; seed: number }[] = [];
    const starShape = createStarShape(5, 1.45, 0.85);

    const starExtrudeSettings = {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    };
    const starBaseGeo = new THREE.ExtrudeGeometry(starShape, starExtrudeSettings);
    starBaseGeo.rotateX(Math.PI / 2);

    // Little Sheriff Stars Geometry
    const ratingStarShape = createStarShape(5, 0.22, 0.11);
    const ratingStarGeo = new THREE.ExtrudeGeometry(ratingStarShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 });
    ratingStarGeo.rotateX(Math.PI / 2);

    levelPositions.forEach(({ pos, town, idx }) => {
      const unlocked = isLevelUnlocked(town, idx);
      const conquered = isLevelConquered(town);
      const levelNum = idx + 1;

      const levelGroup = new THREE.Group();
      levelGroup.position.copy(pos);
      levelGroup.position.y += 0.32;

      // A. The 3D Beveled Sheriff Star Platform Base (Antique Brass & Bronze)
      const starBaseMat = new THREE.MeshStandardMaterial({
        color: conquered ? '#fde047' : unlocked ? '#d97706' : '#334155',
        metalness: conquered ? 0.8 : unlocked ? 0.6 : 0.2,
        roughness: conquered ? 0.25 : unlocked ? 0.4 : 0.8,
      });
      const starBaseMesh = new THREE.Mesh(starBaseGeo, starBaseMat);
      starBaseMesh.castShadow = true;
      starBaseMesh.receiveShadow = true;
      levelGroup.add(starBaseMesh);

      // B. The Central Brass Engraved Level Badge
      const buttonGeo = new THREE.CylinderGeometry(0.86, 0.94, 0.28, 32);
      const buttonTex = createOldStyleLevelTexture(levelNum, unlocked, conquered);
      const buttonTopMat = new THREE.MeshStandardMaterial({
        map: buttonTex,
        roughness: 0.3,
        metalness: 0.4,
      });
      const buttonSideMat = new THREE.MeshStandardMaterial({
        color: conquered ? '#92400e' : unlocked ? '#78350f' : '#1e293b',
        roughness: 0.4,
        metalness: 0.5,
      });
      const buttonMesh = new THREE.Mesh(buttonGeo, [buttonSideMat, buttonTopMat, buttonSideMat]);
      buttonMesh.position.y = 0.24;
      buttonMesh.castShadow = true;
      buttonMesh.receiveShadow = true;
      levelGroup.add(buttonMesh);

      // C. Brass Rating Stars
      const starsPedestal = new THREE.Group();
      starsPedestal.position.set(0, 0.22, 1.05);

      const starOffsets = [-0.38, 0, 0.38];
      starOffsets.forEach((offsetX, sIdx) => {
        const starMat = new THREE.MeshStandardMaterial({
          color: conquered ? '#fde047' : unlocked && sIdx === 1 ? '#fbbf24' : '#64748b',
          emissive: conquered ? '#d97706' : unlocked && sIdx === 1 ? '#92400e' : '#000000',
          emissiveIntensity: conquered ? 0.4 : 0.15,
          roughness: 0.3,
          metalness: 0.7,
        });
        const miniStar = new THREE.Mesh(ratingStarGeo, starMat);
        miniStar.position.set(offsetX, 0, sIdx === 1 ? 0.08 : 0);
        miniStar.castShadow = true;
        starsPedestal.add(miniStar);
      });
      levelGroup.add(starsPedestal);

      buttonMesh.userData = { town, idx, unlocked };
      starBaseMesh.userData = { town, idx, unlocked };
      levelMeshes.push(buttonMesh);
      levelMeshes.push(starBaseMesh);

      scene.add(levelGroup);

      // D. REALISTIC 3D VOLUMETRIC FOG OF WAR CLOUDS COVERING LOCKED CITIES
      if (!unlocked) {
        const cloudClusterGroup = new THREE.Group();
        cloudClusterGroup.position.copy(pos);
        cloudClusterGroup.position.y += 0.85;

        // Billowy cloud puffs in weathered mist & amber dust palette
        const cloudMaterials = [
          new THREE.MeshStandardMaterial({ color: '#f1f5f9', transparent: true, opacity: 0.92, roughness: 0.95 }),
          new THREE.MeshStandardMaterial({ color: '#e2e8f0', transparent: true, opacity: 0.88, roughness: 0.9 }),
          new THREE.MeshStandardMaterial({ color: '#cbd5e1', transparent: true, opacity: 0.85, roughness: 0.85 }),
          new THREE.MeshStandardMaterial({ color: '#94a3b8', transparent: true, opacity: 0.82, roughness: 0.8 }),
        ];

        for (let c = 0; c < 16; c++) {
          const radius = 0.8 + Math.random() * 0.7;
          const puffGeo = new THREE.DodecahedronGeometry(radius, 1);
          const puffMat = cloudMaterials[c % cloudMaterials.length];
          const puffMesh = new THREE.Mesh(puffGeo, puffMat);

          const angle = (c / 16) * Math.PI * 2 + Math.random() * 0.4;
          const dist = 0.3 + Math.random() * 1.4;
          const px = Math.cos(angle) * dist;
          const py = (Math.random() - 0.25) * 0.8;
          const pz = Math.sin(angle) * dist;

          puffMesh.position.set(px, py, pz);
          puffMesh.scale.set(1.25, 0.85, 1.25);
          cloudClusterGroup.add(puffMesh);
        }

        scene.add(cloudClusterGroup);
        cloudsList.push({ group: cloudClusterGroup, basePos: pos.clone(), seed: idx * 1.7 });
      }
    });

    // 7. Active Avatar Location Marker (Frontier Brass Spur Pin)
    const activeTownIdx = Math.max(0, towns.findIndex((t) => t.id === playerProfile.currentTownId));
    const activeLevelObj = levelPositions[activeTownIdx] || levelPositions[0];

    const avatarPinGroup = new THREE.Group();
    avatarPinGroup.position.copy(activeLevelObj.pos);
    avatarPinGroup.position.y += 2.2;

    const pinHeadGeo = new THREE.ConeGeometry(0.35, 0.8, 8);
    pinHeadGeo.rotateX(Math.PI);
    const pinMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const pinMesh = new THREE.Mesh(pinHeadGeo, pinMat);
    avatarPinGroup.add(pinMesh);

    scene.add(avatarPinGroup);

    // 8. Raycasting & Interactive Level Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let dragStartY = 0;
    let currentDragZ = 0;

    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(levelMeshes, false);

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData;
        if (hitData && hitData.town) {
          sounds.playClick();
          setSelectedLevelId(hitData.town.id);
          if (onSelectTown) onSelectTown(hitData.town);
          return;
        }
      }

      isDragging = true;
      dragStartY = event.clientY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaY = event.clientY - dragStartY;
      dragStartY = event.clientY;
      currentDragZ += deltaY * 0.035;
      currentDragZ = Math.max(-20, Math.min(8, currentDragZ));
      setCameraDragOffsetZ(currentDragZ);
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      currentDragZ -= event.deltaY * 0.015;
      currentDragZ = Math.max(-20, Math.min(8, currentDragZ));
      setCameraDragOffsetZ(currentDragZ);
    };

    const el = renderer.domElement;
    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('wheel', handleWheel, { passive: false });

    // 9. Animation Render Loop
    let animFrame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Avatar pin bobbing
      avatarPinGroup.position.y = activeLevelObj.pos.y + 2.2 + Math.sin(elapsedTime * 3) * 0.15;
      avatarPinGroup.rotation.y = elapsedTime * 1.5;

      // Realistic volumetric clouds drifting over locked cities
      cloudsList.forEach(({ group, seed }) => {
        group.rotation.y = Math.sin(elapsedTime * 0.3 + seed) * 0.1;
        group.position.y = group.position.y + Math.sin(elapsedTime * 1.1 + seed) * 0.002;
      });

      // Camera smoothly tracks selected level + drag offset
      const targetLevelObj = levelPositions.find((lp) => lp.town.id === selectedLevelId) || levelPositions[0];
      const targetCamPos = new THREE.Vector3(
        targetLevelObj.pos.x * 0.45,
        targetLevelObj.pos.y + 7.2,
        targetLevelObj.pos.z + 9.5 + currentDragZ
      );
      camera.position.lerp(targetCamPos, 0.08);
      camera.lookAt(targetLevelObj.pos.x * 0.5, targetLevelObj.pos.y + 0.5, targetLevelObj.pos.z + currentDragZ);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animFrame);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [playerProfile]);

  const handlePlayLevel = (town: TownLocation) => {
    sounds.playWin();
    confetti({ particleCount: 60, spread: 70 });
    if (onTravelToTown) {
      onTravelToTown(town);
    }
  };

  const selectedTownIndex = towns.findIndex((t) => t.id === selectedTown.id);
  const selectedUnlocked = isLevelUnlocked(selectedTown, selectedTownIndex);
  const selectedConquered = isLevelConquered(selectedTown);

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1c120c] via-[#24170f] to-[#140a05] border-4 border-amber-600/70 rounded-3xl p-3 sm:p-4 shadow-2xl text-stone-100 relative overflow-hidden flex flex-col font-sans select-none">
      {/* Top Header Bar - Clean and Minimal */}
      <div className="w-full bg-stone-950/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-xl shrink-0 z-20 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow shrink-0">
            <Compass className="w-4 h-4 text-stone-950" />
          </div>
          <div>
            <h2 className="text-amber-200 font-black text-xs sm:text-sm uppercase tracking-wider drop-shadow flex items-center gap-2">
              <span>Frontier Campaign Trail</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40 font-mono">
                {playerProfile.conqueredTowns?.length || 0}/10 Conquered
              </span>
            </h2>
          </div>
        </div>

        {/* Trail Navigation Controls */}
        <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setCameraDragOffsetZ((z) => Math.max(-20, z - 4))}
            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 transition cursor-pointer"
            title="Scroll Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCameraDragOffsetZ((z) => Math.min(8, z + 4))}
            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 transition cursor-pointer"
            title="Scroll Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCameraDragOffsetZ(0)}
            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="relative w-full flex-1 rounded-2xl overflow-hidden shadow-inner my-2 cursor-grab active:cursor-grabbing" />

      {/* Bottom Selected Level Action Drawer - Sleek and Simplified */}
      <div className="w-full bg-stone-950/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 z-20 text-white">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Level Star Badge Preview */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-lg border shrink-0 ${
            selectedConquered
              ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-yellow-200 text-stone-950'
              : selectedUnlocked
              ? 'bg-amber-600/30 border-amber-400 text-amber-300'
              : 'bg-stone-900 border-stone-800 text-stone-500'
          }`}>
            {selectedUnlocked ? `★ ${selectedTownIndex + 1}` : <Lock className="w-4 h-4 text-stone-500" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white truncate uppercase tracking-wider">
                {selectedTown.name}
              </h3>
              {selectedConquered && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  CONQUERED
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              {selectedUnlocked
                ? `Boss: ${selectedTown.bossName}`
                : `Fog of War: Unlocks at Level ${selectedTown.requiredLevel}`}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedUnlocked ? (
            <button
              onClick={() => handlePlayLevel(selectedTown)}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border border-yellow-200"
            >
              <Play className="w-3.5 h-3.5 fill-stone-950" />
              <span>{selectedConquered ? 'Travel & Replay' : 'Travel & Play'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-xl text-xs text-stone-400 font-bold">
              <CloudFog className="w-3.5 h-3.5 text-stone-400 animate-pulse" />
              <span>Shrouded in Clouds</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
