import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerProfile, TownLocation } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { create3DPlayerCharacter } from '../utils/create3DCharacter';
import { SkipForward, DoorOpen } from 'lucide-react';

interface SaloonWalkInCutsceneProps {
  playerProfile: PlayerProfile;
  currentTown: TownLocation;
  onCompleteCutscene: () => void;
}

export const SaloonWalkInCutscene: React.FC<SaloonWalkInCutsceneProps> = ({
  playerProfile,
  currentTown,
  onCompleteCutscene,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [progressText, setProgressText] = useState(`Entering ${currentTown.name} Saloon...`);

  useEffect(() => {
    sounds.playClick();

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9c9588);

    // Camera
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(-4.5, 4.5, 9.5);
    camera.lookAt(0, 1.2, -1);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting: Warm Tavern Atmosphere
    const ambientLight = new THREE.AmbientLight(0xffedd5, 1.25);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
    mainLight.position.set(-3, 12, 8);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 1. Warm Wood Plank Floor
    const floorGeo = new THREE.PlaneGeometry(36, 44);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x76543c, roughness: 0.82 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. Beige Plaster Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc1baa8, roughness: 0.9 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(36, 14), wallMat);
    backWall.position.set(0, 7, -13);
    scene.add(backWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(44, 14), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(18, 7, 0);
    scene.add(rightWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(44, 14), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-18, 7, 0);
    scene.add(leftWall);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 44),
      new THREE.MeshStandardMaterial({ color: 0x8e8779, roughness: 0.95 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 14, 0);
    scene.add(ceiling);

    // 3. Timber Posts & Beams
    const timberMat = new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.65 });
    const postPositions = [
      [0, 7, -12.8],
      [-8, 7, -12.8],
      [8, 7, -12.8],
      [17.8, 7, 0],
      [-17.8, 7, 0],
    ];
    postPositions.forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.65, 14, 0.65), timberMat);
      post.position.set(px, py, pz);
      scene.add(post);
    });

    [-8, 0, 8].forEach((bx) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 44), timberMat);
      beam.position.set(bx, 13.6, 0);
      scene.add(beam);
    });

    // 4. Back Wall Banner ("HEART TAVERN ♥")
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 128;
    const bctx = bannerCanvas.getContext('2d');
    if (bctx) {
      bctx.fillStyle = '#831843';
      bctx.fillRect(0, 0, 1024, 128);
      bctx.strokeStyle = '#fef08a';
      bctx.lineWidth = 6;
      bctx.strokeRect(8, 8, 1008, 112);
      bctx.fillStyle = '#ffffff';
      bctx.font = 'bold 42px "Times New Roman", Georgia, serif';
      bctx.textAlign = 'center';
      bctx.textBaseline = 'middle';
      bctx.fillText('HEART TAVERN', 260, 64);
      bctx.fillStyle = '#f43f5e';
      bctx.fillText('♥', 512, 64);
      bctx.fillStyle = '#ffffff';
      bctx.fillText('HEART TAVERN ♥', 760, 64);
    }
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 2.0),
      new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.4 })
    );
    bannerMesh.position.set(0, 10.2, -12.9);
    scene.add(bannerMesh);

    // 5. Fireplace on Right Wall
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xc5c0b1, roughness: 0.88 });
    const fpBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 8.5, 7.5), stoneMat);
    fpBody.position.set(16.5, 4.25, 2.0);
    scene.add(fpBody);

    const firebox = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.4, 4.8),
      new THREE.MeshStandardMaterial({ color: 0x141416 })
    );
    firebox.position.set(15.6, 1.7, 2.0);
    scene.add(firebox);

    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd152 });
    [-1.2, -0.6, 0, 0.6, 1.2].forEach((fz) => {
      const flGeo = new THREE.SphereGeometry(0.24, 12, 12);
      flGeo.scale(0.5, 1.6, 0.5);
      const fl = new THREE.Mesh(flGeo, flameMat);
      fl.position.set(15.6, 0.8, 2.0 + fz);
      scene.add(fl);
    });

    const fireLight = new THREE.PointLight(0xf59e0b, 2.4, 16);
    fireLight.position.set(15.0, 1.8, 2.0);
    scene.add(fireLight);

    // 6. Vibrant Magenta Rug with White Inset Border
    const rugCanvas = document.createElement('canvas');
    rugCanvas.width = 512;
    rugCanvas.height = 512;
    const rctx = rugCanvas.getContext('2d');
    if (rctx) {
      rctx.fillStyle = '#db2777';
      rctx.fillRect(0, 0, 512, 512);
      rctx.strokeStyle = '#ffffff';
      rctx.lineWidth = 14;
      rctx.strokeRect(24, 24, 464, 464);
    }
    const rugTex = new THREE.CanvasTexture(rugCanvas);
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(9.5, 10.5),
      new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.85 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.012, -1);
    scene.add(rug);

    // 7. Square Seafoam Green Card Table
    const tableFelt = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.08, 5.2),
      new THREE.MeshStandardMaterial({ color: 0x2ea38d, roughness: 0.45 })
    );
    tableFelt.position.set(0, 0.76, -1);
    tableFelt.receiveShadow = true;
    scene.add(tableFelt);

    const woodRim = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.18, 5.6),
      new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.6 })
    );
    woodRim.position.set(0, 0.70, -1);
    scene.add(woodRim);

    // 4 Table Legs
    [[-2.4, -3.4], [2.4, -3.4], [-2.4, 1.4], [2.4, 1.4]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.76, 0.24), timberMat);
      leg.position.set(lx, 0.38, lz);
      scene.add(leg);
    });

    // Gold Dealer Button in center
    const dealerBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.25 })
    );
    dealerBtn.position.set(0, 0.82, -1);
    scene.add(dealerBtn);

    // 8. Tall Wooden Chairs around Table
    let playerChairGroup: THREE.Group | null = null;
    const chairPositions = [
      { x: 0, z: 2.65, rot: Math.PI },         // Seat 0 (You - pulled out so you can step in cleanly)
      { x: -3.1, z: -1, rot: Math.PI / 2 },    // West Bot
      { x: 0, z: -4.1, rot: 0 },               // Partner Pete
      { x: 3.1, z: -1, rot: -Math.PI / 2 },    // East Bot
    ];

    chairPositions.forEach((cp, idx) => {
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x422512, roughness: 0.6 });
      const chairGroup = new THREE.Group();
      chairGroup.position.set(cp.x, 0, cp.z);
      chairGroup.rotation.y = cp.rot;
      if (idx === 0) {
        playerChairGroup = chairGroup;
      }

      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 1.0), chairMat);
      seat.position.set(0, 0.48, 0);
      chairGroup.add(seat);

      [[-0.4, 0.24, -0.4], [0.4, 0.24, -0.4], [-0.4, 0.24, 0.4], [0.4, 0.24, 0.4]].forEach(([lx, ly, lz]) => {
        const cLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.08), chairMat);
        cLeg.position.set(lx, ly, lz);
        chairGroup.add(cLeg);
      });

      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 0.08), chairMat);
      postL.position.set(-0.4, 1.1, -0.4);
      chairGroup.add(postL);

      const postR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 0.08), chairMat);
      postR.position.set(0.4, 1.1, -0.4);
      chairGroup.add(postR);

      const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.05), chairMat);
      backPanel.position.set(0, 1.2, -0.4);
      chairGroup.add(backPanel);

      scene.add(chairGroup);
    });

    // 4. Exact Character from Player Profile
    const playerChar = create3DPlayerCharacter(playerProfile);
    const playerGroup = playerChar.group;
    playerGroup.scale.set(0.24, 0.24, 0.24); // Proportionally scale to saloon furniture
    scene.add(playerGroup);

    // Single Quick Swoop Animation (1.5 seconds total, smooth easeInOut)
    const startTime = Date.now();
    const DURATION = 1.5; // seconds
    let animFrame: number;

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const t = Math.min(1, elapsed / DURATION);

      // Path around chair so player NEVER walks through the chair:
      // Phase 1 (t: 0 -> 0.62): Walk down the right aisle safely clear of chair (x = 1.85, z: 7.5 -> 2.15)
      // Phase 2 (t: 0.62 -> 0.84): Turn left and step across between table (z: 1.8) and chair (z: 2.65) (x: 1.85 -> 0.0, z: 2.15 -> 2.35)
      // Phase 3 (t: 0.84 -> 1.0): Sits down onto seat facing table, chair tucks in gently
      let currentX = 0;
      let currentY = 0;
      let currentZ = 0;
      let currentRotY = 0;

      if (t < 0.62) {
        const p1 = t / 0.62;
        const ease1 = p1 * p1 * (3 - 2 * p1);
        currentX = THREE.MathUtils.lerp(1.95, 1.85, ease1);
        currentZ = THREE.MathUtils.lerp(7.5, 2.15, ease1);
        currentRotY = Math.PI; // Walking forward facing the table
        currentY = 0;
      } else if (t < 0.84) {
        const p2 = (t - 0.62) / (0.84 - 0.62);
        const ease2 = p2 * p2 * (3 - 2 * p2);
        currentX = THREE.MathUtils.lerp(1.85, 0.0, ease2);
        currentZ = THREE.MathUtils.lerp(2.15, 2.35, ease2);
        currentRotY = THREE.MathUtils.lerp(Math.PI * 0.7, Math.PI, ease2);
        currentY = 0;
      } else {
        const p3 = (t - 0.84) / (1.0 - 0.84);
        const ease3 = p3 * p3 * (3 - 2 * p3);
        currentX = 0;
        currentZ = THREE.MathUtils.lerp(2.35, 2.50, ease3);
        currentRotY = Math.PI;
        currentY = THREE.MathUtils.lerp(0, -0.16, ease3);
      }

      playerGroup.position.set(currentX, currentY, currentZ);
      playerGroup.rotation.y = currentRotY;

      // Chair tucks in slightly when player sits down
      if (playerChairGroup) {
        if (t < 0.84) {
          playerChairGroup.position.z = 2.65;
        } else {
          const p3 = (t - 0.84) / 0.16;
          playerChairGroup.position.z = THREE.MathUtils.lerp(2.65, 2.45, p3);
        }
      }

      // Camera swoops smoothly overhead into table POV
      const camEase = 1 - Math.pow(1 - t, 2.5);
      camera.position.x = THREE.MathUtils.lerp(-3.5, 0, camEase);
      camera.position.y = THREE.MathUtils.lerp(3.8, 1.95, camEase);
      camera.position.z = THREE.MathUtils.lerp(8.5, 3.4, camEase);
      camera.lookAt(0, 0.9, -1);

      // Animate character walk cycle during walk, stopping when seated
      playerChar.updateAnimation(0.016, t < 0.82);

      if (t >= 1) {
        cancelAnimationFrame(animFrame);
        onCompleteCutscene();
        return;
      }

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
      cancelAnimationFrame(animFrame);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      playerChar.dispose();
      renderer.dispose();
    };
  }, [currentTown, onCompleteCutscene, playerProfile]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 3D Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full" />

      {/* On-screen Cinematic Overlay Banner */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 bg-black/80 border-2 border-amber-500/80 px-6 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] text-center flex items-center gap-3 backdrop-blur-md">
        <DoorOpen className="w-5 h-5 text-amber-400" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">
            {currentTown.name.toUpperCase()} SALOON
          </span>
          <span className="text-xs font-bold text-white font-serif">{progressText}</span>
        </div>
      </div>

      {/* Skip Entrance Button */}
      <button
        onClick={() => {
          sounds.playClick();
          onCompleteCutscene();
        }}
        className="absolute bottom-6 right-6 z-30 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-2xl transition hover:scale-105 active:scale-95 flex items-center gap-2 border border-amber-300 cursor-pointer"
      >
        <span>Skip Entrance</span>
        <SkipForward className="w-4 h-4 fill-stone-950" />
      </button>
    </div>
  );
};
