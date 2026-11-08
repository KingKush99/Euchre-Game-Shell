import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TownLocation, PlayerProfile } from '../types/poker';
import { ALLOW_ALL_CITIES_UNRESTRICTED, TOWNS_DATA } from '../data/gameData';
import { Lock, CheckCircle2, Building, Eye, RotateCw, ZoomIn, ZoomOut, Sparkles, Navigation, CloudFog, Compass } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ThreeWorldMap3DProps {
  playerProfile: PlayerProfile;
  currentTownId: string;
  selectedTown: TownLocation;
  onSelectTown: (town: TownLocation) => void;
  onTravelToTown: (town: TownLocation) => void;
}

export const ThreeWorldMap3D: React.FC<ThreeWorldMap3DProps> = ({
  playerProfile,
  currentTownId,
  selectedTown,
  onSelectTown,
  onTravelToTown,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredTown, setHoveredTown] = useState<TownLocation | null>(null);
  const [isFogEnabled, setIsFogEnabled] = useState<boolean>(true);

  // Camera Orbit Refs
  const cameraYaw = useRef<number>(0);
  const cameraPitch = useRef<number>(0.65);
  const cameraZoom = useRef<number>(26);
  const isPointerDown = useRef<boolean>(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 550;

    // 1. Scene & Atmosphere Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0704);
    scene.fog = new THREE.FogExp2(0x0c0704, 0.025);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const updateCameraPos = () => {
      const radius = cameraZoom.current;
      const x = radius * Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current);
      const y = radius * Math.sin(cameraPitch.current);
      const z = radius * Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current);
      camera.position.set(x, Math.max(6, y), z);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 18;
    sunLight.shadow.camera.bottom = -18;
    scene.add(sunLight);

    // Warm Western Sunset Glow Light
    const sunsetLight = new THREE.DirectionalLight(0xd97706, 1.4);
    sunsetLight.position.set(-25, 12, -15);
    scene.add(sunsetLight);

    // 5. 3D Relief Terrain Base (Frontier Mesa, Mountains & Canyons)
    const terrainGeo = new THREE.PlaneGeometry(42, 28, 64, 64);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      // Mesa elevation, rolling foothills and canyon depression
      let elevation =
        Math.sin(px * 0.35) * Math.cos(py * 0.35) * 1.1 +
        Math.sin(px * 0.75 + 1.2) * 0.45 +
        Math.cos(py * 0.85) * 0.35;
      
      // West Texas mountains in upper left
      if (px < -10 && py > 2) {
        elevation += Math.sin((px + 10) * 0.6) * 1.8;
      }
      // Gulf coastal slope in lower right
      if (px > 8 && py < -2) {
        elevation = Math.max(-0.4, elevation - 0.7);
      }
      posAttr.setZ(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xba8c59,
      roughness: 0.88,
      metalness: 0.08,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.y = -0.5;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Wooden Frontier Table Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3d1e0a, roughness: 0.5 });
    const frameGeo = new THREE.BoxGeometry(43.5, 1.2, 29.5);
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = -1.1;
    scene.add(frameMesh);

    // Decorative Compass Rose on Map Table corner
    const compassGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.08, 16);
    const compassMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      emissive: 0x451a03,
      roughness: 0.3,
      metalness: 0.8,
    });
    const compassMesh = new THREE.Mesh(compassGeo, compassMat);
    compassMesh.position.set(-17, -0.3, 10);
    scene.add(compassMesh);

    // 6. Town 3D Coordinates (-16 to 16 on X, -10 to 10 on Z)
    const town3DPositions = [
      { x: -14.5, z: -5.5 }, // 1. Galveston (Coastal Harbor)
      { x: -11.5, z: 3.5 },  // 2. San Antonio (Alamo Mission)
      { x: -8.0, z: -6.5 },  // 3. Austin (Capitol Citadel)
      { x: -5.0, z: 4.5 },   // 4. Fort Worth (Stockyard Fortress)
      { x: -1.5, z: -4.5 },  // 5. Dallas (High Stakes Banking Palace)
      { x: 2.0, z: 5.5 },    // 6. El Paso (Sunlit Canyon Saloon)
      { x: 5.5, z: -5.5 },   // 7. Amarillo (Golden Cattle Empire)
      { x: 9.0, z: 4.5 },    // 8. Lubbock (Cotton & Oil Reserve)
      { x: 12.0, z: -4.5 },  // 9. Houston (Space City Grand Arena)
      { x: 15.0, z: 3.5 },   // 10. Corpus Christi (Gulf Sovereign Harbor)
    ];

    // Curve Trail Line Connecting Towns
    const curvePoints = town3DPositions.map((p) => new THREE.Vector3(p.x, 0.25, p.z));
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const trailGeo = new THREE.TubeGeometry(curve, 96, 0.14, 8, false);
    const trailMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const trailMesh = new THREE.Mesh(trailGeo, trailMat);
    scene.add(trailMesh);

    // Animated Traveling Frontier Stagecoach / Horse Cart on unlocked trails
    const coachGroup = new THREE.Group();
    const coachBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    coachBody.position.y = 0.35;
    coachGroup.add(coachBody);
    const coachRoof = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.1, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b })
    );
    coachRoof.position.y = 0.65;
    coachGroup.add(coachRoof);
    scene.add(coachGroup);

    // 7. Town 3D Nodes, Buildings & Fog of War Shrouds
    const townMeshes: { mesh: THREE.Group; town: TownLocation; isUnlocked: boolean; isConquered: boolean }[] = [];
    const fogClouds: { mesh: THREE.Mesh; rotSpeed: number; baseY: number }[] = [];

    TOWNS_DATA.forEach((town, idx) => {
      const isUnlocked = ALLOW_ALL_CITIES_UNRESTRICTED || playerProfile.level >= town.requiredLevel || idx === 0;
      const isConquered = playerProfile.conqueredTowns?.includes(town.id) || false;
      const isCurrent = currentTownId === town.id;
      const isSelected = selectedTown.id === town.id;
      const pos = town3DPositions[idx] || { x: 0, z: 0 };

      const townGroup = new THREE.Group();
      townGroup.position.set(pos.x, 0, pos.z);
      (townGroup as any).userData = { town, isUnlocked, isConquered };

      // Base Star Pedestal (3D Extruded Star)
      const globeStar = new THREE.Shape();
      const step = Math.PI / 5;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 1.65 : 0.95;
        const a = i * step - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) globeStar.moveTo(x, y);
        else globeStar.lineTo(x, y);
      }
      globeStar.closePath();

      const baseGeo = new THREE.ExtrudeGeometry(globeStar, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08 });
      baseGeo.rotateX(Math.PI / 2);
      const baseMat = new THREE.MeshStandardMaterial({
        color: isUnlocked ? (isConquered ? 0x059669 : isCurrent ? 0xd97706 : 0x854d0e) : 0x27272a,
        roughness: 0.35,
        metalness: isUnlocked ? 0.6 : 0.1,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.22;
      baseMesh.receiveShadow = true;
      townGroup.add(baseMesh);

      // Node Ring Marker
      const ringGeo = new THREE.RingGeometry(1.5, 1.75, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isConquered ? 0x10b981 : isCurrent ? 0xfbbf24 : isUnlocked ? 0xf59e0b : 0x52525b,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.47;
      townGroup.add(ringMesh);

      if (isUnlocked) {
        // Unlocked City Architecture Model
        const buildingGeo = new THREE.BoxGeometry(1.1, 1.2, 1.1);
        const buildingMat = new THREE.MeshStandardMaterial({
          color: isConquered ? 0x047857 : isCurrent ? 0xf59e0b : 0xa16207,
          roughness: 0.4,
        });
        const building = new THREE.Mesh(buildingGeo, buildingMat);
        building.position.y = 1.05;
        building.castShadow = true;
        townGroup.add(building);

        // Architectural Roof
        const roofGeo = new THREE.ConeGeometry(0.95, 0.7, 4);
        const roofMat = new THREE.MeshStandardMaterial({
          color: isConquered ? 0x065f46 : 0x78350f,
          roughness: 0.5,
        });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 1.95;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        townGroup.add(roof);

        // Conquered Golden Star / Banner
        if (isConquered) {
          const starGeo = new THREE.OctahedronGeometry(0.35);
          const starMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.8,
          });
          const star = new THREE.Mesh(starGeo, starMat);
          star.position.y = 2.6;
          townGroup.add(star);
        }

        // Vertical Beacon Light Pillar
        const beaconGeo = new THREE.CylinderGeometry(0.08, 0.8, 5.5, 12);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: isCurrent ? 0xfef08a : isConquered ? 0x6ee7b7 : 0xfbbf24,
          transparent: true,
          opacity: 0.35,
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = 3.5;
        townGroup.add(beacon);

        // Ground Lantern Light
        const townLight = new THREE.PointLight(isCurrent ? 0xfbbf24 : 0xf59e0b, 1.2, 6);
        townLight.position.y = 2.0;
        townGroup.add(townLight);
      } else {
        // LOCKED TOWN: Shrouded Citadel in Fog of War
        const lockedGeo = new THREE.CylinderGeometry(0.6, 0.9, 1.5, 8);
        const lockedMat = new THREE.MeshStandardMaterial({
          color: 0x18181b,
          roughness: 0.95,
        });
        const lockedMesh = new THREE.Mesh(lockedGeo, lockedMat);
        lockedMesh.position.y = 0.98;
        townGroup.add(lockedMesh);

        // Volumetric Realistic Puffy Fog of War Cloud Spheres & Vapors
        const cloudTones = [0xe2e8f0, 0x94a3b8, 0x64748b, 0x475569];
        for (let f = 0; f < 6; f++) {
          const cloudGeo = new THREE.DodecahedronGeometry(1.4 + f * 0.35, 1);
          const cloudMat = new THREE.MeshStandardMaterial({
            color: cloudTones[f % cloudTones.length],
            roughness: 0.85,
            transparent: true,
            opacity: 0.8 - f * 0.08,
            flatShading: true,
          });
          const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
          const offsetX = (Math.random() - 0.5) * 1.5;
          const offsetY = 1.0 + f * 0.5;
          const offsetZ = (Math.random() - 0.5) * 1.5;
          cloudMesh.position.set(offsetX, offsetY, offsetZ);
          cloudMesh.scale.set(1.3, 0.8, 1.3);
          townGroup.add(cloudMesh);
          fogClouds.push({
            mesh: cloudMesh,
            rotSpeed: (Math.random() * 0.008 + 0.003) * (f % 2 === 0 ? 1 : -1),
            baseY: offsetY,
          });
        }
      }

      scene.add(townGroup);
      townMeshes.push({ mesh: townGroup, town, isUnlocked, isConquered });
    });

    // 8. Raycaster Interaction (Hover & Click on 3D Town Nodes)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      isPointerDown.current = true;
      pointerStart.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isPointerDown.current) {
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        pointerStart.current = { x: e.clientX, y: e.clientY };

        cameraYaw.current -= dx * 0.006;
        cameraPitch.current = Math.max(0.2, Math.min(1.4, cameraPitch.current + dy * 0.006));
        updateCameraPos();
        return;
      }

      // Check Hovered Town
      raycaster.setFromCamera(mouse, camera);
      const allMeshes: THREE.Object3D[] = [];
      townMeshes.forEach((t) => allMeshes.push(t.mesh));

      const intersects = raycaster.intersectObjects(allMeshes, true);
      if (intersects.length > 0) {
        let parent: any = intersects[0].object;
        while (parent && !parent.userData?.town && parent.parent) {
          parent = parent.parent;
        }
        if (parent?.userData?.town) {
          setHoveredTown(parent.userData.town);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredTown(null);
      container.style.cursor = 'grab';
    };

    const handlePointerUp = (e: MouseEvent) => {
      isPointerDown.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      raycaster.setFromCamera(mouse, camera);
      const allMeshes: THREE.Object3D[] = [];
      townMeshes.forEach((t) => allMeshes.push(t.mesh));

      const intersects = raycaster.intersectObjects(allMeshes, true);
      if (intersects.length > 0) {
        let parent: any = intersects[0].object;
        while (parent && !parent.userData?.town && parent.parent) {
          parent = parent.parent;
        }
        if (parent?.userData?.town) {
          sounds.playClick();
          onSelectTown(parent.userData.town);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraZoom.current = Math.max(14, Math.min(42, cameraZoom.current + e.deltaY * 0.02));
      updateCameraPos();
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('click', handleClick);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 9. 60 FPS Render & Animation Loop
    let animFrame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate Stagecoach moving along the frontier highway curve
      const coachProgress = (elapsed * 0.04) % 1.0;
      const coachPos = curve.getPointAt(coachProgress);
      const coachTangent = curve.getTangentAt(coachProgress);
      coachGroup.position.copy(coachPos);
      coachGroup.position.y += 0.15;
      coachGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), coachTangent);

      // Animate Fog of War dynamic rotating mists
      fogClouds.forEach((cloud, i) => {
        cloud.mesh.rotation.y += cloud.rotSpeed;
        cloud.mesh.rotation.z += 0.002;
        cloud.mesh.position.y = cloud.baseY + Math.sin(elapsed * 1.5 + i) * 0.08;
      });

      // Highlight currently selected town node
      townMeshes.forEach(({ mesh, town }) => {
        if (town.id === selectedTown.id) {
          mesh.rotation.y += 0.02;
          mesh.position.y = Math.sin(elapsed * 3.0) * 0.15;
        } else {
          mesh.rotation.y = 0;
          mesh.position.y = 0;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Listener
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
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [playerProfile, currentTownId, selectedTown.id]);

  const conqueredCount = playerProfile.conqueredTowns?.length || 0;

  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#090503] select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Fog of War Status & Campaign Stats */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-stone-950/90 border border-amber-500/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs">
        <div className="flex items-center gap-2 font-black text-amber-300 uppercase tracking-wider">
          <CloudFog className="w-4 h-4 text-amber-400" />
          <span>FRONTIER 3D GLOBE • FOG OF WAR</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-300">
          <span className="text-emerald-400 font-bold">
            🏆 {conqueredCount} / 10 Conquered
          </span>
          <span className="text-stone-600">•</span>
          <span className="text-amber-300 font-bold">
            ⭐ Player Level {playerProfile.level || 1}
          </span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-stone-800 text-[10px] text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cleared Frontier</span>
          <span className="text-stone-600">|</span>
          <span className="w-2 h-2 rounded-full bg-stone-600" />
          <span>🌫️ Shrouded Mist</span>
        </div>
      </div>

      {/* Top Right: Selected / Hovered Town Floating Card */}
      {(hoveredTown || selectedTown) && (
        <div className="absolute top-3 right-3 z-20 bg-stone-950/95 border-2 border-amber-400/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in zoom-in duration-150 text-left">
          {(() => {
            const target = hoveredTown || selectedTown;
            const isUnlocked =
              ALLOW_ALL_CITIES_UNRESTRICTED ||
              playerProfile.level >= target.requiredLevel ||
              target.id === TOWNS_DATA[0].id;
            const isConquered = playerProfile.conqueredTowns?.includes(target.id) || false;
            const isCurrent = target.id === currentTownId;

            return (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
                      City #{target.level} • {target.difficulty}
                    </span>
                    <h3 className="text-sm font-black text-white leading-tight mt-0.5">
                      {target.name}
                    </h3>
                  </div>

                  {isConquered ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-[9px] font-black shrink-0">
                      CONQUERED ✓
                    </span>
                  ) : isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 text-[9px] font-black shrink-0">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[9px] font-black shrink-0">
                      LOCKED 🔒
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-300 font-sans leading-relaxed">
                  {target.title}: {target.description}
                </p>

                <div className="p-2 bg-stone-900/90 rounded-xl border border-stone-800 text-[10px] space-y-1 font-mono">
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Boss:</span>
                    <span className="text-amber-300 font-bold">{target.bossName}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Stakes:</span>
                    <span className="text-yellow-400 font-bold">{target.stakes}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Min Level:</span>
                    <span className="text-cyan-400 font-bold">Level {target.requiredLevel}</span>
                  </div>
                </div>

                {/* Travel / Enter Saloon Action Button */}
                {isUnlocked ? (
                  <button
                    onClick={() => {
                      sounds.playWin();
                      onTravelToTown(target);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-amber-400 text-stone-950 font-black shadow-lg hover:bg-amber-300'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 shadow-md active:scale-95'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{isCurrent ? 'Enter Saloon (Current)' : `Travel to ${target.name}`}</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-[10px] text-stone-400 text-center font-bold">
                    Reach Level {target.requiredLevel} to Dispel Fog
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Bottom Center: Orbit & Zoom Controls Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-stone-950/85 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md text-xs text-stone-300">
        <span className="text-[10px] text-amber-300 font-bold hidden sm:inline">
          🖱️ Click & Drag to Orbit 3D Map • Scroll to Zoom
        </span>
        <div className="flex items-center gap-1 border-l border-stone-800 pl-2">
          <button
            onClick={() => {
              sounds.playClick();
              cameraZoom.current = Math.max(14, cameraZoom.current - 4);
            }}
            className="p-1 hover:text-amber-400 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              cameraZoom.current = Math.min(42, cameraZoom.current + 4);
            }}
            className="p-1 hover:text-amber-400 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              cameraYaw.current = 0;
              cameraPitch.current = 0.65;
              cameraZoom.current = 26;
            }}
            className="p-1 hover:text-amber-400 transition cursor-pointer"
            title="Reset View"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
