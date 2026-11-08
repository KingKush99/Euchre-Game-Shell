import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type CharacterPose =
  | 'standing'
  | 'pointing_right'
  | 'pointing_left'
  | 'pointing_up'
  | 'waving'
  | 'cheering'
  | 'hands_on_hips'
  | 'thinking';

interface ThreeCharacterCanvasProps {
  colors: {
    hair: string;
    shirt: string;
    pants: string;
    shoes: string;
    eyes: string;
    skin: string;
  };
  rotationAngle: number;
  autoRotate?: boolean;
  mascot?: string;
  isDragging?: boolean;
  eyeStyle?: string;
  noseStyle?: string;
  mouthStyle?: string;
  hairStyle?: string;
  zoom?: number;
  pose?: CharacterPose;
}

export const ThreeCharacterCanvas: React.FC<ThreeCharacterCanvasProps> = ({
  colors,
  rotationAngle,
  autoRotate = false,
  mascot = 'fox',
  eyeStyle = 'Classic Dot',
  noseStyle = 'Pointed Nose',
  mouthStyle = 'Smile',
  hairStyle = 'Cowboy Hat + Pigtails',
  zoom = 4.2,
  pose = 'standing',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const leftArmGroupRef = useRef<THREE.Group | null>(null);
  const rightArmGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;
  const poseRef = useRef<CharacterPose>(pose);
  poseRef.current = pose;

  const materialsRef = useRef<{
    hair?: THREE.MeshStandardMaterial;
    shirt?: THREE.MeshStandardMaterial;
    pants?: THREE.MeshStandardMaterial;
    shoes?: THREE.MeshStandardMaterial;
    eyes?: THREE.MeshStandardMaterial;
    skin?: THREE.MeshStandardMaterial;
  }>({});

  // Effect to update camera position on zoom change
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = zoom;
    }
  }, [zoom]);

  // Update arm and head rotations when pose changes
  useEffect(() => {
    const leftArm = leftArmGroupRef.current;
    const rightArm = rightArmGroupRef.current;
    const head = headGroupRef.current;
    if (!leftArm || !rightArm || !head) return;

    switch (pose) {
      case 'pointing_right':
        rightArm.rotation.set(-Math.PI / 3.2, 0.35, -Math.PI / 2.8);
        leftArm.rotation.set(0.15, -0.2, 0.45);
        head.rotation.set(-0.05, 0.22, 0);
        break;
      case 'pointing_left':
        leftArm.rotation.set(-Math.PI / 3.2, -0.35, Math.PI / 2.8);
        rightArm.rotation.set(0.15, 0.2, -0.45);
        head.rotation.set(-0.05, -0.22, 0);
        break;
      case 'pointing_up':
        rightArm.rotation.set(-Math.PI / 1.45, 0.15, -Math.PI / 6);
        leftArm.rotation.set(0.15, -0.1, 0.35);
        head.rotation.set(-0.25, 0.12, 0);
        break;
      case 'waving':
        rightArm.rotation.set(-Math.PI / 1.7, 0.1, -Math.PI / 4.5);
        leftArm.rotation.set(0.15, -0.2, 0.4);
        head.rotation.set(0, 0.1, 0.05);
        break;
      case 'cheering':
        leftArm.rotation.set(-Math.PI / 1.55, -0.25, Math.PI / 3.5);
        rightArm.rotation.set(-Math.PI / 1.55, 0.25, -Math.PI / 3.5);
        head.rotation.set(-0.2, 0, 0);
        break;
      case 'hands_on_hips':
        leftArm.rotation.set(0.25, -0.35, 0.75);
        rightArm.rotation.set(0.25, 0.35, -0.75);
        head.rotation.set(0, 0, 0);
        break;
      case 'thinking':
        rightArm.rotation.set(-Math.PI / 2.1, 0.45, -0.15);
        leftArm.rotation.set(0.2, -0.1, 0.6);
        head.rotation.set(0.12, 0.22, 0.12);
        break;
      case 'standing':
      default:
        leftArm.rotation.set(0, 0, 0);
        rightArm.rotation.set(0, 0, 0);
        head.rotation.set(0, 0, 0);
        break;
    }
  }, [pose]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 280;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure deep black background for character studio

    // Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.65, zoom || 3.8);
    camera.lookAt(0, 0.60, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio circular pedestal & shadow catcher
    const pedestalGeo = new THREE.CylinderGeometry(0.85, 0.92, 0.04, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      roughness: 0.6,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.18, 0);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Gold studio rim around pedestal
    const rimGeo = new THREE.TorusGeometry(0.88, 0.015, 12, 48);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.8,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(0, -0.16, 0);
    scene.add(rimMesh);

    // ==========================================
    // STUDIO ARMCHAIR (Character Sitting in Studio)
    // ==========================================
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, -0.32, -0.05);
    scene.add(chairGroup);

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Rich vintage brown leather
      roughness: 0.5,
      metalness: 0.1,
    });
    const woodTrimMat = new THREE.MeshStandardMaterial({
      color: 0x271507,
      roughness: 0.4,
      metalness: 0.2,
    });

    // Seat cushion
    const seatGeo = new THREE.BoxGeometry(0.65, 0.18, 0.62);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.set(0, 0.08, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    chairGroup.add(seat);

    // Chair Backrest
    const backGeo = new THREE.BoxGeometry(0.65, 0.72, 0.16);
    const backrest = new THREE.Mesh(backGeo, leatherMat);
    backrest.position.set(0, 0.45, -0.26);
    backrest.rotation.x = -0.12;
    backrest.castShadow = true;
    backrest.receiveShadow = true;
    chairGroup.add(backrest);

    // Left Armrest
    const armGeo = new THREE.BoxGeometry(0.14, 0.38, 0.62);
    const leftArm = new THREE.Mesh(armGeo, leatherMat);
    leftArm.position.set(-0.36, 0.25, 0);
    leftArm.castShadow = true;
    chairGroup.add(leftArm);

    // Right Armrest
    const rightArm = new THREE.Mesh(armGeo, leatherMat);
    rightArm.position.set(0.36, 0.25, 0);
    rightArm.castShadow = true;
    chairGroup.add(rightArm);

    // Wooden Chair Legs
    [[-0.28, 0.22], [0.28, 0.22], [-0.28, -0.22], [0.28, -0.22]].forEach(([lx, lz]) => {
      const legGeo = new THREE.CylinderGeometry(0.035, 0.025, 0.32, 12);
      const leg = new THREE.Mesh(legGeo, woodTrimMat);
      leg.position.set(lx, -0.12, lz);
      leg.castShadow = true;
      chairGroup.add(leg);
    });

    // Studio Spotlight & Rim Lighting matching the reference image
    const ambientLight = new THREE.AmbientLight(0xdce7f5, 0.85);
    scene.add(ambientLight);

    // Key overhead spotlight from top-left
    const keySpot = new THREE.SpotLight(0xffffff, 2.2, 20, Math.PI / 4, 0.4, 1);
    keySpot.position.set(-2.5, 6.5, 4.0);
    keySpot.target.position.set(0, 0.6, 0);
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    scene.add(keySpot);
    scene.add(keySpot.target);

    // Rim / Back light from top-right for hair and shoulder separation
    const rimLight = new THREE.DirectionalLight(0xa5c4f2, 1.2);
    rimLight.position.set(3.5, 5.0, -2.5);
    scene.add(rimLight);

    // Soft front fill light
    const fillLight = new THREE.DirectionalLight(0xfff1e6, 0.7);
    fillLight.position.set(1.5, 1.5, 3.5);
    scene.add(fillLight);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: colors.skin || '#dfb594',
      roughness: 0.82,
      metalness: 0.02,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: colors.hair || '#664e3c',
      roughness: 0.90,
      metalness: 0.02,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: colors.shirt || '#8c5be8',
      roughness: 0.78,
      metalness: 0.03,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: colors.pants || '#121319',
      roughness: 0.92,
      metalness: 0.02,
    });
    const shoesMat = new THREE.MeshStandardMaterial({
      color: colors.shoes || '#a8934a',
      roughness: 0.75,
      metalness: 0.05,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: colors.eyes || '#3d7350',
      roughness: 0.25,
      metalness: 0.1,
    });
    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1b1c2b,
      roughness: 0.85,
      metalness: 0.05,
    });
    const darkSleeveMat = new THREE.MeshStandardMaterial({
      color: 0x171826,
      roughness: 0.88,
      metalness: 0.02,
    });
    const shoulderPatchMat = new THREE.MeshStandardMaterial({
      color: 0xcbb298,
      roughness: 0.85,
    });
    const goldBroochMat = new THREE.MeshStandardMaterial({
      color: 0xe5ba45,
      metalness: 0.85,
      roughness: 0.25,
    });
    const buckleOuterMat = new THREE.MeshStandardMaterial({
      color: 0xa87ff0,
      roughness: 0.65,
      metalness: 0.15,
    });
    const bootCuffMat = new THREE.MeshStandardMaterial({
      color: 0xb59e56,
      roughness: 0.70,
      metalness: 0.04,
    });
    const bootSoleMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.90,
    });
    const darkClaspMat = new THREE.MeshStandardMaterial({
      color: 0x1e2030,
      roughness: 0.80,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.30,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.20,
    });

    materialsRef.current = {
      skin: skinMat,
      hair: hairMat,
      shirt: shirtMat,
      pants: pantsMat,
      shoes: shoesMat,
      eyes: eyeMat,
    };

    // Main character group
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);
    characterGroupRef.current = characterGroup;

    // Contact shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(3, 6, 15, 0.75)');
      grad.addColorStop(0.5, 'rgba(4, 8, 20, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.1),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -0.18, 0.05);
    scene.add(shadowPlane);

    // ================= HEAD GROUP =================
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0);
    characterGroup.add(headGroup);
    headGroupRef.current = headGroup;

    // Head Upper
    const headUpperGeo = new THREE.SphereGeometry(0.29, 16, 16);
    headUpperGeo.scale(0.96, 1.12, 0.94);
    const headUpper = new THREE.Mesh(headUpperGeo, skinMat);
    headUpper.position.set(0, 0.29, 0);
    headUpper.castShadow = true;
    headGroup.add(headUpper);

    // Chiseled Tapered Jaw
    const jawGeo = new THREE.CylinderGeometry(0.22, 0.13, 0.22, 10);
    const jaw = new THREE.Mesh(jawGeo, skinMat);
    jaw.position.set(0, 0.12, 0.04);
    jaw.castShadow = true;
    headGroup.add(jaw);

    // Low-poly Ears
    const earGeo = new THREE.SphereGeometry(0.052, 12, 12);
    earGeo.scale(0.35, 1, 0.65);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.29, 0.25, -0.02);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.29, 0.25, -0.02);
    headGroup.add(rightEar);

    // Hair / Hat / Crown
    const hasCustomHat = hairStyle.toLowerCase().includes('hat') || hairStyle.toLowerCase().includes('stetson');
    const isCrown = hairStyle.toLowerCase().includes('crown');

    const buzzCutGeo = new THREE.SphereGeometry(0.30, 16, 16);
    buzzCutGeo.scale(0.98, 1.05, 0.96);
    const buzzCut = new THREE.Mesh(buzzCutGeo, hairMat);
    buzzCut.position.set(0, 0.31, -0.02);
    headGroup.add(buzzCut);

    const hairlineFrontGeo = new THREE.BoxGeometry(0.26, 0.05, 0.08);
    const hairlineFront = new THREE.Mesh(hairlineFrontGeo, hairMat);
    hairlineFront.position.set(0, 0.41, 0.22);
    hairlineFront.rotation.x = -0.35;
    headGroup.add(hairlineFront);

    [-0.14, 0.14].forEach((xSide) => {
      const templeGeo = new THREE.BoxGeometry(0.04, 0.08, 0.06);
      const temple = new THREE.Mesh(templeGeo, hairMat);
      temple.position.set(xSide, 0.35, 0.18);
      headGroup.add(temple);
    });

    if (isCrown) {
      const crownGeo = new THREE.CylinderGeometry(0.34, 0.30, 0.18, 5);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(0, 0.57, 0);
      headGroup.add(crown);
    } else if (hasCustomHat) {
      const hatBrimGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.03, 24);
      hatBrimGeo.scale(1, 1, 1.15);
      const hatBrim = new THREE.Mesh(hatBrimGeo, goldBroochMat);
      hatBrim.position.set(0, 0.53, 0);
      headGroup.add(hatBrim);
    }

    // Eyes
    const scleraGeo = new THREE.BoxGeometry(0.062, 0.032, 0.02);
    const leftSclera = new THREE.Mesh(scleraGeo, whiteMat);
    leftSclera.position.set(-0.11, 0.27, 0.265);
    leftSclera.rotation.y = 0.14;
    headGroup.add(leftSclera);

    const rightSclera = new THREE.Mesh(scleraGeo, whiteMat);
    rightSclera.position.set(0.11, 0.27, 0.265);
    rightSclera.rotation.y = -0.14;
    headGroup.add(rightSclera);

    const irisGeo = new THREE.SphereGeometry(0.028, 12, 12);
    const leftIris = new THREE.Mesh(irisGeo, eyeMat);
    leftIris.position.set(-0.11, 0.27, 0.28);
    headGroup.add(leftIris);

    const rightIris = new THREE.Mesh(irisGeo, eyeMat);
    rightIris.position.set(0.11, 0.27, 0.28);
    headGroup.add(rightIris);

    const pupilGeo = new THREE.SphereGeometry(0.014, 8, 8);
    const leftPupil = new THREE.Mesh(pupilGeo, darkMat);
    leftPupil.position.set(-0.11, 0.27, 0.30);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, darkMat);
    rightPupil.position.set(0.11, 0.27, 0.30);
    headGroup.add(rightPupil);

    // Brows
    const browGeo = new THREE.BoxGeometry(0.085, 0.022, 0.02);
    const leftBrow = new THREE.Mesh(browGeo, hairMat);
    leftBrow.position.set(-0.11, 0.32, 0.27);
    leftBrow.rotation.z = 0.13;
    leftBrow.rotation.y = 0.12;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, hairMat);
    rightBrow.position.set(0.11, 0.32, 0.27);
    rightBrow.rotation.z = -0.13;
    rightBrow.rotation.y = -0.12;
    headGroup.add(rightBrow);

    // Nose
    const noseBridgeGeo = new THREE.BoxGeometry(0.032, 0.10, 0.045);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
    noseBridge.position.set(0, 0.21, 0.285);
    noseBridge.rotation.x = -0.16;
    headGroup.add(noseBridge);

    const noseTipGeo = new THREE.ConeGeometry(0.03, 0.048, 5);
    const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
    noseTip.position.set(0, 0.16, 0.305);
    noseTip.rotation.x = -Math.PI / 4;
    headGroup.add(noseTip);

    // Mouth
    const mouthGeo = new THREE.BoxGeometry(0.075, 0.016, 0.02);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x8a5454 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.09, 0.25);
    headGroup.add(mouth);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.105, 0.12, 0.16, 12);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 1.02, 0);
    characterGroup.add(neck);

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.44, 16);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.set(0, 0.75, 0);
    torso.castShadow = true;
    characterGroup.add(torso);

    // Shoulders
    const shoulderCapGeo = new THREE.SphereGeometry(0.09, 12, 12);
    shoulderCapGeo.scale(1.1, 0.6, 1.1);

    const leftShoulderCap = new THREE.Mesh(shoulderCapGeo, shirtMat);
    leftShoulderCap.position.set(-0.29, 0.91, 0.02);
    characterGroup.add(leftShoulderCap);

    const rightShoulderCap = new THREE.Mesh(shoulderCapGeo, shirtMat);
    rightShoulderCap.position.set(0.29, 0.91, 0.02);
    characterGroup.add(rightShoulderCap);

    const patchGeo = new THREE.BoxGeometry(0.08, 0.028, 0.11);
    const leftPatch = new THREE.Mesh(patchGeo, shoulderPatchMat);
    leftPatch.position.set(-0.29, 0.93, 0.02);
    leftPatch.rotation.z = -0.22;
    characterGroup.add(leftPatch);

    const rightPatch = new THREE.Mesh(patchGeo, shoulderPatchMat);
    rightPatch.position.set(0.29, 0.93, 0.02);
    rightPatch.rotation.z = 0.22;
    characterGroup.add(rightPatch);

    // Placket & Clasps
    const placketGeo = new THREE.BoxGeometry(0.042, 0.38, 0.025);
    const placket = new THREE.Mesh(placketGeo, darkTrimMat);
    placket.position.set(0, 0.74, 0.23);
    characterGroup.add(placket);

    [0.12, 0.04, -0.04, -0.12].forEach((offsetY) => {
      const claspGeo = new THREE.BoxGeometry(0.10, 0.016, 0.028);
      const clasp = new THREE.Mesh(claspGeo, darkClaspMat);
      clasp.position.set(0, 0.74 + offsetY, 0.235);
      characterGroup.add(clasp);
    });

    // Belt
    const beltGeo = new THREE.CylinderGeometry(0.252, 0.252, 0.085, 16);
    const belt = new THREE.Mesh(beltGeo, darkTrimMat);
    belt.position.set(0, 0.53, 0);
    characterGroup.add(belt);

    const broochGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.022, 16);
    const brooch = new THREE.Mesh(broochGeo, goldBroochMat);
    brooch.rotation.x = Math.PI / 2;
    brooch.position.set(0, 0.53, 0.255);
    characterGroup.add(brooch);

    // Tunic Skirt
    const skirtLeftGeo = new THREE.BoxGeometry(0.13, 0.19, 0.24);
    const skirtLeft = new THREE.Mesh(skirtLeftGeo, shirtMat);
    skirtLeft.position.set(-0.10, 0.43, 0.01);
    skirtLeft.rotation.z = 0.08;
    characterGroup.add(skirtLeft);

    const skirtRightGeo = new THREE.BoxGeometry(0.13, 0.19, 0.24);
    const skirtRight = new THREE.Mesh(skirtRightGeo, shirtMat);
    skirtRight.position.set(0.10, 0.43, 0.01);
    skirtRight.rotation.z = -0.08;
    characterGroup.add(skirtRight);

    // ================= LEFT ARM GROUP (Pivoted at shoulder) =================
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 0.88, 0);
    characterGroup.add(leftArmGroup);
    leftArmGroupRef.current = leftArmGroup;

    const upperArmGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.16, 12);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
    leftUpperArm.position.set(0, -0.10, 0);
    leftArmGroup.add(leftUpperArm);

    const leftUnderSleeveGeo = new THREE.CylinderGeometry(0.072, 0.066, 0.12, 12);
    const leftUnderSleeve = new THREE.Mesh(leftUnderSleeveGeo, darkSleeveMat);
    leftUnderSleeve.position.set(-0.02, -0.23, 0.01);
    leftArmGroup.add(leftUnderSleeve);

    const sleeveCuffGeo = new THREE.CylinderGeometry(0.074, 0.070, 0.035, 12);
    const leftSleeveCuff = new THREE.Mesh(sleeveCuffGeo, darkTrimMat);
    leftSleeveCuff.position.set(-0.03, -0.30, 0.02);
    leftArmGroup.add(leftSleeveCuff);

    const forearmGeo = new THREE.CylinderGeometry(0.055, 0.046, 0.22, 12);
    const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
    leftForearm.position.set(-0.04, -0.42, 0.04);
    leftForearm.rotation.x = -Math.PI / 18;
    leftArmGroup.add(leftForearm);

    // Helper to build articulated hand with proper fingers and pointing index
    const buildArticulatedHand = (side: 'left' | 'right', isPointing: boolean) => {
      const handGroup = new THREE.Group();
      const isLeft = side === 'left';
      const xSign = isLeft ? -1 : 1;

      // Palm base
      const palmGeo = new THREE.BoxGeometry(0.066, 0.072, 0.036);
      const palm = new THREE.Mesh(palmGeo, skinMat);
      palm.position.set(0, 0, 0);
      palm.castShadow = true;
      handGroup.add(palm);

      // Wrist cuff ring
      const wristGeo = new THREE.CylinderGeometry(0.044, 0.046, 0.025, 10);
      const wrist = new THREE.Mesh(wristGeo, skinMat);
      wrist.position.set(0, 0.045, 0);
      handGroup.add(wrist);

      // Articulated Thumb
      const thumbGroup = new THREE.Group();
      thumbGroup.position.set(xSign * 0.036, 0.01, 0.015);
      thumbGroup.rotation.set(0.2, xSign * 0.45, xSign * 0.35);

      const thumbBaseGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.036, 8);
      const thumbBase = new THREE.Mesh(thumbBaseGeo, skinMat);
      thumbBase.position.set(0, -0.016, 0);
      thumbGroup.add(thumbBase);

      const thumbKnuckleGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const thumbKnuckle = new THREE.Mesh(thumbKnuckleGeo, skinMat);
      thumbKnuckle.position.set(0, -0.034, 0);
      thumbGroup.add(thumbKnuckle);

      const thumbTipGeo = new THREE.CylinderGeometry(0.011, 0.014, 0.032, 8);
      const thumbTip = new THREE.Mesh(thumbTipGeo, skinMat);
      thumbTip.position.set(0, -0.050, 0.005);
      thumbTip.rotation.x = -0.3;
      thumbGroup.add(thumbTip);

      handGroup.add(thumbGroup);

      // Finger positions along the bottom edge of the palm
      const fingerData = [
        { name: 'index', x: xSign * 0.022, length: 0.075, radius: 0.0125, isIndex: true },
        { name: 'middle', x: xSign * 0.007, length: 0.080, radius: 0.0130, isIndex: false },
        { name: 'ring', x: -xSign * 0.008, length: 0.072, radius: 0.0120, isIndex: false },
        { name: 'pinky', x: -xSign * 0.022, length: 0.060, radius: 0.0105, isIndex: false },
      ];

      fingerData.forEach((f) => {
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(f.x, -0.036, 0);

        if (f.isIndex && isPointing) {
          // Pointing Index Finger: Extended straight out in gesture!
          const knuckleGeo = new THREE.SphereGeometry(f.radius * 1.15, 8, 8);
          const knuckle = new THREE.Mesh(knuckleGeo, skinMat);
          knuckle.position.set(0, 0, 0);
          fingerGroup.add(knuckle);

          const phalanx1Geo = new THREE.CylinderGeometry(f.radius * 0.95, f.radius * 1.05, 0.042, 8);
          const phalanx1 = new THREE.Mesh(phalanx1Geo, skinMat);
          phalanx1.position.set(0, -0.024, 0);
          fingerGroup.add(phalanx1);

          const jointGeo = new THREE.SphereGeometry(f.radius * 0.95, 8, 8);
          const joint = new THREE.Mesh(jointGeo, skinMat);
          joint.position.set(0, -0.046, 0);
          fingerGroup.add(joint);

          const phalanx2Geo = new THREE.CylinderGeometry(f.radius * 0.75, f.radius * 0.95, 0.038, 8);
          const phalanx2 = new THREE.Mesh(phalanx2Geo, skinMat);
          phalanx2.position.set(0, -0.066, 0);
          fingerGroup.add(phalanx2);

          const tipGeo = new THREE.SphereGeometry(f.radius * 0.8, 8, 8);
          const tip = new THREE.Mesh(tipGeo, skinMat);
          tip.position.set(0, -0.086, 0);
          fingerGroup.add(tip);
        } else {
          // Natural curved / cupped fingers
          const knuckleGeo = new THREE.SphereGeometry(f.radius * 1.1, 8, 8);
          const knuckle = new THREE.Mesh(knuckleGeo, skinMat);
          knuckle.position.set(0, 0, 0);
          fingerGroup.add(knuckle);

          // Proximal segment curved inward
          const phalanx1Geo = new THREE.CylinderGeometry(f.radius * 0.9, f.radius, 0.026, 8);
          const phalanx1 = new THREE.Mesh(phalanx1Geo, skinMat);
          phalanx1.position.set(0, -0.014, 0.008);
          phalanx1.rotation.x = -0.6;
          fingerGroup.add(phalanx1);

          // Distal segment curled into palm
          const phalanx2Geo = new THREE.CylinderGeometry(f.radius * 0.75, f.radius * 0.85, 0.022, 8);
          const phalanx2 = new THREE.Mesh(phalanx2Geo, skinMat);
          phalanx2.position.set(0, -0.028, 0.020);
          phalanx2.rotation.x = -1.2;
          fingerGroup.add(phalanx2);

          const tipGeo = new THREE.SphereGeometry(f.radius * 0.8, 8, 8);
          const tip = new THREE.Mesh(tipGeo, skinMat);
          tip.position.set(0, -0.038, 0.024);
          fingerGroup.add(tip);
        }

        handGroup.add(fingerGroup);
      });

      return handGroup;
    };

    // Attach Left Hand
    const leftHand = buildArticulatedHand('left', pose === 'pointing_left');
    leftHand.position.set(-0.05, -0.56, 0.05);
    leftArmGroup.add(leftHand);

    // ================= RIGHT ARM GROUP (Pivoted at shoulder) =================
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 0.88, 0);
    characterGroup.add(rightArmGroup);
    rightArmGroupRef.current = rightArmGroup;

    const rightUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
    rightUpperArm.position.set(0, -0.10, 0);
    rightArmGroup.add(rightUpperArm);

    const rightUnderSleeve = new THREE.Mesh(leftUnderSleeveGeo, darkSleeveMat);
    rightUnderSleeve.position.set(0.02, -0.23, 0.01);
    rightArmGroup.add(rightUnderSleeve);

    const rightSleeveCuff = new THREE.Mesh(sleeveCuffGeo, darkTrimMat);
    rightSleeveCuff.position.set(0.03, -0.30, 0.02);
    rightArmGroup.add(rightSleeveCuff);

    const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
    rightForearm.position.set(0.04, -0.42, 0.04);
    rightForearm.rotation.x = -Math.PI / 18;
    rightArmGroup.add(rightForearm);

    // Attach Right Hand
    const rightHand = buildArticulatedHand('right', pose === 'pointing_right' || pose === 'pointing_up');
    rightHand.position.set(0.05, -0.56, 0.05);
    rightArmGroup.add(rightHand);

    // Initial pose application
    switch (pose) {
      case 'pointing_right':
        rightArmGroup.rotation.set(-Math.PI / 3.2, 0.35, -Math.PI / 2.8);
        leftArmGroup.rotation.set(0.15, -0.2, 0.45);
        headGroup.rotation.set(-0.05, 0.22, 0);
        break;
      case 'pointing_left':
        leftArmGroup.rotation.set(-Math.PI / 3.2, -0.35, Math.PI / 2.8);
        rightArmGroup.rotation.set(0.15, 0.2, -0.45);
        headGroup.rotation.set(-0.05, -0.22, 0);
        break;
      case 'pointing_up':
        rightArmGroup.rotation.set(-Math.PI / 1.45, 0.15, -Math.PI / 6);
        leftArmGroup.rotation.set(0.15, -0.1, 0.35);
        headGroup.rotation.set(-0.25, 0.12, 0);
        break;
      case 'waving':
        rightArmGroup.rotation.set(-Math.PI / 1.7, 0.1, -Math.PI / 4.5);
        leftArmGroup.rotation.set(0.15, -0.2, 0.4);
        headGroup.rotation.set(0, 0.1, 0.05);
        break;
      case 'cheering':
        leftArmGroup.rotation.set(-Math.PI / 1.55, -0.25, Math.PI / 3.5);
        rightArmGroup.rotation.set(-Math.PI / 1.55, 0.25, -Math.PI / 3.5);
        headGroup.rotation.set(-0.2, 0, 0);
        break;
      case 'hands_on_hips':
        leftArmGroup.rotation.set(0.25, -0.35, 0.75);
        rightArmGroup.rotation.set(0.25, 0.35, -0.75);
        headGroup.rotation.set(0, 0, 0);
        break;
      case 'thinking':
        rightArmGroup.rotation.set(-Math.PI / 2.1, 0.45, -0.15);
        leftArmGroup.rotation.set(0.2, -0.1, 0.6);
        headGroup.rotation.set(0.12, 0.22, 0.12);
        break;
      case 'standing':
      default:
        break;
    }

    // Sitting Posture Legs (Thighs rotated forward 90 degrees, shins dropping down)
    const thighGeo = new THREE.CylinderGeometry(0.105, 0.085, 0.36, 12);
    thighGeo.rotateX(Math.PI / 2);

    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.position.set(-0.13, 0.14, 0.16);
    characterGroup.add(leftThigh);

    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.position.set(0.13, 0.14, 0.16);
    characterGroup.add(rightThigh);

    const shinGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.32, 12);
    const leftShin = new THREE.Mesh(shinGeo, pantsMat);
    leftShin.position.set(-0.13, -0.06, 0.32);
    characterGroup.add(leftShin);

    const rightShin = new THREE.Mesh(shinGeo, pantsMat);
    rightShin.position.set(0.13, -0.06, 0.32);
    characterGroup.add(rightShin);

    // Lower character group slightly to sit perfectly on the seat cushion
    characterGroup.position.y = -0.15;

    // Boots
    const bootShaftGeo = new THREE.CylinderGeometry(0.095, 0.085, 0.24, 12);
    const leftBootShaft = new THREE.Mesh(bootShaftGeo, shoesMat);
    leftBootShaft.position.set(-0.13, -0.04, 0);
    characterGroup.add(leftBootShaft);

    const rightBootShaft = new THREE.Mesh(bootShaftGeo, shoesMat);
    rightBootShaft.position.set(0.13, -0.04, 0);
    characterGroup.add(rightBootShaft);

    const cuffGeo = new THREE.CylinderGeometry(0.112, 0.102, 0.075, 12);
    const leftCuff = new THREE.Mesh(cuffGeo, bootCuffMat);
    leftCuff.position.set(-0.13, 0.04, 0);
    characterGroup.add(leftCuff);

    const rightCuff = new THREE.Mesh(cuffGeo, bootCuffMat);
    rightCuff.position.set(0.13, 0.04, 0);
    characterGroup.add(rightCuff);

    [-0.01, -0.04, -0.07, -0.10].forEach((offsetY) => {
      const strapGeo = new THREE.BoxGeometry(0.055, 0.014, 0.02);
      const leftStrap = new THREE.Mesh(strapGeo, darkClaspMat);
      leftStrap.position.set(-0.13, offsetY, 0.088);
      characterGroup.add(leftStrap);

      const rightStrap = new THREE.Mesh(strapGeo, darkClaspMat);
      rightStrap.position.set(0.13, offsetY, 0.088);
      characterGroup.add(rightStrap);
    });

    const bootToeGeo = new THREE.BoxGeometry(0.11, 0.08, 0.21);
    const leftBootToe = new THREE.Mesh(bootToeGeo, shoesMat);
    leftBootToe.position.set(-0.13, -0.11, 0.045);
    characterGroup.add(leftBootToe);

    const rightBootToe = new THREE.Mesh(bootToeGeo, shoesMat);
    rightBootToe.position.set(0.13, -0.11, 0.045);
    characterGroup.add(rightBootToe);

    const toeCapGeo = new THREE.BoxGeometry(0.112, 0.04, 0.09);
    const leftToeCap = new THREE.Mesh(toeCapGeo, bootSoleMat);
    leftToeCap.position.set(-0.13, -0.12, 0.11);
    characterGroup.add(leftToeCap);

    const rightToeCap = new THREE.Mesh(toeCapGeo, bootSoleMat);
    rightToeCap.position.set(0.13, -0.12, 0.11);
    characterGroup.add(rightToeCap);

    const heelGeo = new THREE.BoxGeometry(0.11, 0.035, 0.08);
    const leftHeel = new THREE.Mesh(heelGeo, bootSoleMat);
    leftHeel.position.set(-0.13, -0.14, -0.03);
    characterGroup.add(leftHeel);

    const rightHeel = new THREE.Mesh(heelGeo, bootSoleMat);
    rightHeel.position.set(0.13, -0.14, -0.03);
    characterGroup.add(rightHeel);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (characterGroupRef.current) {
        // Idle breathing bob
        characterGroupRef.current.position.y = Math.sin(time * 2.5) * 0.015;

        if (autoRotateRef.current) {
          characterGroupRef.current.rotation.y += 0.008;
        }
      }

      // Waving hand animation
      if (poseRef.current === 'waving' && rightArmGroupRef.current) {
        rightArmGroupRef.current.rotation.z = -Math.PI / 4.5 + Math.sin(time * 7) * 0.22;
      }

      // Cheering subtle bounce
      if (poseRef.current === 'cheering' && leftArmGroupRef.current && rightArmGroupRef.current) {
        leftArmGroupRef.current.rotation.z = Math.PI / 3.5 + Math.sin(time * 4) * 0.08;
        rightArmGroupRef.current.rotation.z = -Math.PI / 3.5 - Math.sin(time * 4) * 0.08;
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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!cameraRef.current) return;
      const zoomStep = e.deltaY > 0 ? 0.3 : -0.3;
      cameraRef.current.position.z = Math.min(7.0, Math.max(1.8, cameraRef.current.position.z + zoomStep));
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [colors, eyeStyle, noseStyle, mouthStyle, hairStyle]);

  useEffect(() => {
    if (materialsRef.current.skin) materialsRef.current.skin.color.set(colors.skin);
    if (materialsRef.current.hair) materialsRef.current.hair.color.set(colors.hair);
    if (materialsRef.current.shirt) materialsRef.current.shirt.color.set(colors.shirt);
    if (materialsRef.current.pants) materialsRef.current.pants.color.set(colors.pants);
    if (materialsRef.current.shoes) materialsRef.current.shoes.color.set(colors.shoes);
    if (materialsRef.current.eyes) materialsRef.current.eyes.color.set(colors.eyes);
  }, [colors]);

  useEffect(() => {
    if (characterGroupRef.current && !autoRotate) {
      characterGroupRef.current.rotation.y = (rotationAngle * Math.PI) / 180;
    }
  }, [rotationAngle, autoRotate]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[260px] flex items-center justify-center relative select-none"
    />
  );
};
