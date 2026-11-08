import * as THREE from 'three';
import { PlayerProfile } from '../types/poker';

export interface ArticulatedCharacter3D {
  group: THREE.Group;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftHand?: THREE.Object3D;
  rightHand?: THREE.Object3D;
  torso: THREE.Object3D;
  head: THREE.Object3D;
  nameSprite: THREE.Sprite;
  setNameplateVisible: (visible: boolean) => void;
  petGroup?: THREE.Group;
  petLeftLeg?: THREE.Mesh;
  petRightLeg?: THREE.Mesh;
  petTail?: THREE.Mesh;
  updateAnimation: (delta: number, isMoving: boolean) => void;
  dispose: () => void;
}

export function create3DPlayerCharacter(
  playerProfile: PlayerProfile,
  customConfigOverride?: Partial<PlayerProfile['characterConfig']>
): ArticulatedCharacter3D {
  const group = new THREE.Group();

  // Extract config or provide exact defaults from the reference image
  const cfg = {
    eyesStyle: 'Focused Gaze',
    noseStyle: 'Chiseled',
    mouthStyle: 'Determined',
    faceStyle: 'Angular OSRS',
    hairStyle: 'Buzz Cut',
    bodyStyle: 'Standard Athletic',
    shirtsStyle: 'Lilac Gambeson',
    pantsStyle: 'Dark Fitted Trousers',
    shoesStyle: 'Cuffed Tan Boots',
    hairColor: '#664e3c',
    shirtColor: '#8c5be8',
    pantsColor: '#121319',
    shoesColor: '#a8934a',
    eyesColor: '#3d7350',
    skinColor: '#dfb594',
    ...(playerProfile.characterConfig || {}),
    ...(customConfigOverride || {}),
  };

  const skinColor = cfg.skinColor || '#dfb594';
  const hairColor = cfg.hairColor || '#664e3c';
  const shirtColor = cfg.shirtColor || '#8c5be8';
  const pantsColor = cfg.pantsColor || '#121319';
  const shoesColor = cfg.shoesColor || '#a8934a';
  const eyesColor = cfg.eyesColor || '#3d7350';

  // Materials matching reference image palette
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.82, metalness: 0.02 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.90, metalness: 0.02 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.78, metalness: 0.03 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.92, metalness: 0.02 });
  const shoesMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.75, metalness: 0.05 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: eyesColor, roughness: 0.25, metalness: 0.1 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf4f6fb, roughness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.9, metalness: 0.05 });
  const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x1b1c2b, roughness: 0.85, metalness: 0.05 });
  const darkSleeveMat = new THREE.MeshStandardMaterial({ color: 0x171826, roughness: 0.88, metalness: 0.02 });
  const shoulderPatchMat = new THREE.MeshStandardMaterial({ color: 0xcbb298, roughness: 0.85 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xe5ba45, metalness: 0.85, roughness: 0.25 });
  const buckleOuterMat = new THREE.MeshStandardMaterial({ color: 0xa87ff0, roughness: 0.65, metalness: 0.15 });
  const bootCuffMat = new THREE.MeshStandardMaterial({ color: 0x8a773a, roughness: 0.82, metalness: 0.04 });
  const bootSoleMat = new THREE.MeshStandardMaterial({ color: 0x221a14, roughness: 0.88, metalness: 0.05 });
  const darkClaspMat = new THREE.MeshStandardMaterial({ color: 0x11121d, roughness: 0.9 });

  // Body scale adjustments based on bodyStyle
  const isBrawny = (cfg.bodyStyle || '').toLowerCase().includes('brawny') || (cfg.bodyStyle || '').toLowerCase().includes('titan');
  const isSlim = (cfg.bodyStyle || '').toLowerCase().includes('slim') || (cfg.bodyStyle || '').toLowerCase().includes('runner');
  const widthMult = isBrawny ? 1.25 : isSlim ? 0.88 : 1.0;

  // 1. Torso - Lilac Gambeson Tunic
  const torsoGeo = new THREE.CylinderGeometry(1.8 * widthMult, 1.5 * widthMult, 4.4, 16);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 5.2;
  torso.castShadow = true;
  group.add(torso);

  // Shoulder Caps (Purple rounded epaulette caps)
  const shoulderCapGeo = new THREE.SphereGeometry(0.85, 12, 12);
  shoulderCapGeo.scale(1.15 * widthMult, 0.65, 1.15);

  const leftShoulderCap = new THREE.Mesh(shoulderCapGeo, shirtMat);
  leftShoulderCap.position.set(-1.8 * widthMult, 7.0, 0.1);
  group.add(leftShoulderCap);

  const rightShoulderCap = new THREE.Mesh(shoulderCapGeo, shirtMat);
  rightShoulderCap.position.set(1.8 * widthMult, 7.0, 0.1);
  group.add(rightShoulderCap);

  // Tan Shoulder Cutout Patches
  const patchGeo = new THREE.BoxGeometry(0.8 * widthMult, 0.25, 1.1);
  const leftPatch = new THREE.Mesh(patchGeo, shoulderPatchMat);
  leftPatch.position.set(-1.8 * widthMult, 7.3, 0.1);
  leftPatch.rotation.z = -0.22;
  group.add(leftPatch);

  const rightPatch = new THREE.Mesh(patchGeo, shoulderPatchMat);
  rightPatch.position.set(1.8 * widthMult, 7.3, 0.1);
  rightPatch.rotation.z = 0.22;
  group.add(rightPatch);

  // Dark trim for shoulder patches
  const patchTrimGeo = new THREE.BoxGeometry(0.88 * widthMult, 0.12, 1.18);
  const leftPatchTrim = new THREE.Mesh(patchTrimGeo, darkTrimMat);
  leftPatchTrim.position.set(-1.8 * widthMult, 7.15, 0.1);
  leftPatchTrim.rotation.z = -0.22;
  group.add(leftPatchTrim);

  const rightPatchTrim = new THREE.Mesh(patchTrimGeo, darkTrimMat);
  rightPatchTrim.position.set(1.8 * widthMult, 7.15, 0.1);
  rightPatchTrim.rotation.z = 0.22;
  group.add(rightPatchTrim);

  // Center Front Placket (Dark navy vertical stripe)
  const placketGeo = new THREE.BoxGeometry(0.42, 3.8, 0.25);
  const placket = new THREE.Mesh(placketGeo, darkTrimMat);
  placket.position.set(0, 5.2, 1.45);
  group.add(placket);

  // EXACT 4 FROG FASTENERS down the front placket
  [1.2, 0.4, -0.4, -1.2].forEach((offsetY) => {
    const claspGeo = new THREE.BoxGeometry(1.0, 0.16, 0.3);
    const clasp = new THREE.Mesh(claspGeo, darkClaspMat);
    clasp.position.set(0, 5.2 + offsetY, 1.5);
    group.add(clasp);
  });

  // Gold Diamond Brooch / Insignia on Right Chest (Viewer's Left)
  const broochGeo = new THREE.OctahedronGeometry(0.38, 0);
  const brooch = new THREE.Mesh(broochGeo, goldMat);
  brooch.position.set(-1.0 * widthMult, 5.8, 1.5);
  brooch.rotation.set(0.2, 0, Math.PI / 4);
  group.add(brooch);

  // Dark Belt & Hollow Diamond Buckle
  const beltGeo = new THREE.CylinderGeometry(1.6 * widthMult, 1.6 * widthMult, 0.75, 16);
  const belt = new THREE.Mesh(beltGeo, darkTrimMat);
  belt.position.set(0, 3.1, 0);
  group.add(belt);

  const buckleOuterGeo = new THREE.BoxGeometry(0.9, 0.9, 0.25);
  const buckleOuter = new THREE.Mesh(buckleOuterGeo, buckleOuterMat);
  buckleOuter.rotation.z = Math.PI / 4;
  buckleOuter.position.set(0, 3.1, 1.55);
  group.add(buckleOuter);

  const buckleInnerGeo = new THREE.BoxGeometry(0.45, 0.45, 0.3);
  const buckleInner = new THREE.Mesh(buckleInnerGeo, darkTrimMat);
  buckleInner.rotation.z = Math.PI / 4;
  buckleInner.position.set(0, 3.1, 1.58);
  group.add(buckleInner);

  // Tunic Skirt / Flared Lower Tunic with center front inverted-V slit
  const skirtGeo = new THREE.BoxGeometry(1.3 * widthMult, 1.8, 2.2);
  const leftSkirt = new THREE.Mesh(skirtGeo, shirtMat);
  leftSkirt.position.set(-0.85 * widthMult, 2.0, 0.1);
  leftSkirt.rotation.z = 0.08;
  group.add(leftSkirt);

  const rightSkirt = new THREE.Mesh(skirtGeo, shirtMat);
  rightSkirt.position.set(0.85 * widthMult, 2.0, 0.1);
  rightSkirt.rotation.z = -0.08;
  group.add(rightSkirt);

  // 2. Head Group (Hierarchically unites skull, face features, and hair so they move as one and never glitch)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 9.2, 0);
  group.add(headGroup);

  const headGeo = new THREE.SphereGeometry(1.35, 16, 16);
  headGeo.scale(0.96, 1.12, 0.94);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Chiseled Tapered Jaw
  const jawGeo = new THREE.CylinderGeometry(1.0, 0.6, 1.0, 10);
  const jaw = new THREE.Mesh(jawGeo, skinMat);
  jaw.position.set(0, -0.75, 0.2);
  headGroup.add(jaw);

  // Low-poly Ears
  const earGeo = new THREE.SphereGeometry(0.24, 12, 12);
  earGeo.scale(0.35, 1, 0.65);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-1.35, -0.1, -0.05);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(1.35, -0.1, -0.05);
  headGroup.add(rightEar);

  // 3. Eyes (Almond Green Eyes + Focused Angled Brows)
  const scleraGeo = new THREE.BoxGeometry(0.28, 0.15, 0.1);
  const leftSclera = new THREE.Mesh(scleraGeo, whiteMat);
  leftSclera.position.set(-0.48, 0, 1.22);
  leftSclera.rotation.y = 0.14;
  headGroup.add(leftSclera);

  const rightSclera = new THREE.Mesh(scleraGeo, whiteMat);
  rightSclera.position.set(0.48, 0, 1.22);
  rightSclera.rotation.y = -0.14;
  headGroup.add(rightSclera);

  // Irises
  const irisGeo = new THREE.SphereGeometry(0.13, 12, 12);
  const leftIris = new THREE.Mesh(irisGeo, eyeMat);
  leftIris.position.set(-0.48, 0, 1.30);
  headGroup.add(leftIris);

  const rightIris = new THREE.Mesh(irisGeo, eyeMat);
  rightIris.position.set(0.48, 0, 1.30);
  headGroup.add(rightIris);

  // Pupils
  const pupilGeo = new THREE.SphereGeometry(0.065, 8, 8);
  const leftPupil = new THREE.Mesh(pupilGeo, darkMat);
  leftPupil.position.set(-0.48, 0, 1.38);
  headGroup.add(leftPupil);

  const rightPupil = new THREE.Mesh(pupilGeo, darkMat);
  rightPupil.position.set(0.48, 0, 1.38);
  headGroup.add(rightPupil);

  // Focused Dark Eyebrows
  const eyebrowGeo = new THREE.BoxGeometry(0.40, 0.10, 0.1);
  const leftEyebrow = new THREE.Mesh(eyebrowGeo, hairMat);
  leftEyebrow.position.set(-0.48, 0.3, 1.25);
  leftEyebrow.rotation.z = 0.13;
  leftEyebrow.rotation.y = 0.12;
  headGroup.add(leftEyebrow);

  const rightEyebrow = new THREE.Mesh(eyebrowGeo, hairMat);
  rightEyebrow.position.set(0.48, 0.3, 1.25);
  rightEyebrow.rotation.z = -0.13;
  rightEyebrow.rotation.y = -0.12;
  headGroup.add(rightEyebrow);

  // 4. Nose (Low-poly chiseled bridge)
  const noseBridgeGeo = new THREE.BoxGeometry(0.15, 0.48, 0.2);
  const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
  noseBridge.position.set(0, -0.25, 1.32);
  noseBridge.rotation.x = -0.16;
  headGroup.add(noseBridge);

  const noseTipGeo = new THREE.ConeGeometry(0.14, 0.22, 5);
  const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
  noseTip.position.set(0, -0.45, 1.42);
  noseTip.rotation.x = -Math.PI / 4;
  headGroup.add(noseTip);

  // 5. Mouth (Subtle neutral line with lip color)
  const mouthGeo = new THREE.BoxGeometry(0.35, 0.08, 0.1);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x8a5454 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, -0.8, 1.15);
  headGroup.add(mouth);

  // Throat skin notch & Dark collar band
  const neckGeo = new THREE.CylinderGeometry(0.5, 0.58, 0.8, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 7.7, 0);
  group.add(neck);

  const collarGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.2, 16);
  const collar = new THREE.Mesh(collarGeo, darkTrimMat);
  collar.position.set(0, 7.35, 0);
  group.add(collar);

  // 6. Hair & Hat Customization (attached to headGroup with polygonOffset so it never clips or glitches)
  const hairStyle = (cfg.hairStyle || '').toLowerCase();
  const isCrown = hairStyle.includes('crown') || (playerProfile.currentHatId || '').includes('crown');
  const hasExplicitHat = (playerProfile.currentHatId && playerProfile.currentHatId !== 'none' && playerProfile.currentHatId !== 'stetson_classic') || hairStyle.includes('hat');

  hairMat.polygonOffset = true;
  hairMat.polygonOffsetFactor = -1.5;
  hairMat.polygonOffsetUnits = -1.5;

  // Buzz Cut Cap securely wrapping the skull
  const buzzDomeGeo = new THREE.SphereGeometry(1.42, 16, 16);
  buzzDomeGeo.scale(1.02, 1.08, 1.02);
  const buzzDome = new THREE.Mesh(buzzDomeGeo, hairMat);
  buzzDome.position.set(0, 0.22, -0.05);
  headGroup.add(buzzDome);

  // Buzz cut hairline
  const hairlineGeo = new THREE.BoxGeometry(1.2, 0.24, 0.35);
  const hairline = new THREE.Mesh(hairlineGeo, hairMat);
  hairline.position.set(0, 0.6, 1.02);
  hairline.rotation.x = -0.35;
  headGroup.add(hairline);

  // Temple corners
  [-0.65, 0.65].forEach((xSide) => {
    const templeGeo = new THREE.BoxGeometry(0.18, 0.36, 0.28);
    const temple = new THREE.Mesh(templeGeo, hairMat);
    temple.position.set(xSide, 0.3, 0.85);
    headGroup.add(temple);
  });

  if (isCrown) {
    const crownGeo = new THREE.CylinderGeometry(1.6, 1.4, 0.9, 5);
    const crown = new THREE.Mesh(crownGeo, goldMat);
    crown.position.set(0, 1.7, 0);
    headGroup.add(crown);
  } else if (hasExplicitHat) {
    const hatBrimGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.3, 32);
    hatBrimGeo.scale(1, 1, 1.2);
    const hatBrim = new THREE.Mesh(hatBrimGeo, goldMat);
    hatBrim.position.set(0, 1.2, 0);
    hatBrim.rotation.x = -Math.PI / 20;
    hatBrim.castShadow = true;
    headGroup.add(hatBrim);
  }

  // -------------------------------------------------------------
  // 7. ARMS & BARE FOREARMS / CLENCHED FISTS (Hierarchical Articulation)
  // -------------------------------------------------------------
  // Left Arm Group (pivot at shoulder y=6.9)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-2.2 * widthMult, 6.9, 0);

  // Upper arm sleeve (Lilac)
  const armUpperGeo = new THREE.CylinderGeometry(0.38, 0.35, 1.6, 12);
  const leftUpperArmMesh = new THREE.Mesh(armUpperGeo, shirtMat);
  leftUpperArmMesh.position.set(0, -0.8, 0);
  leftUpperArmMesh.castShadow = true;
  leftArmGroup.add(leftUpperArmMesh);

  // Dark elbow undersleeve
  const underSleeveGeo = new THREE.CylinderGeometry(0.36, 0.33, 1.1, 12);
  const leftUnderSleeveMesh = new THREE.Mesh(underSleeveGeo, darkSleeveMat);
  leftUnderSleeveMesh.position.set(0, -1.9, 0.05);
  leftArmGroup.add(leftUnderSleeveMesh);

  // Dark elbow cuff band
  const cuffBandGeo = new THREE.CylinderGeometry(0.37, 0.35, 0.35, 12);
  const leftCuffBand = new THREE.Mesh(cuffBandGeo, darkTrimMat);
  leftCuffBand.position.set(0, -2.5, 0.1);
  leftArmGroup.add(leftCuffBand);

  // BARE SKIN Forearm
  const forearmGeo = new THREE.CylinderGeometry(0.28, 0.23, 1.8, 12);
  const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
  leftForearm.position.set(0, -3.5, 0.2);
  leftForearm.rotation.x = -0.15;
  leftArmGroup.add(leftForearm);

  // Helper to build realistic, articulated hands with palm, thumb, and 4 fingers
  const buildFullHand = (side: 'left' | 'right', material: THREE.Material): THREE.Group => {
    const handGroup = new THREE.Group();
    const isLeft = side === 'left';
    const xSign = isLeft ? 1 : -1; // Thumb points inward towards body

    // 1. Wrist Transition Joint
    const wristGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.24, 12);
    const wrist = new THREE.Mesh(wristGeo, material);
    wrist.position.set(0, 0.15, 0);
    wrist.castShadow = true;
    handGroup.add(wrist);

    // 2. Palm Body (Anatomically contoured)
    const palmGeo = new THREE.BoxGeometry(0.56, 0.62, 0.30);
    const palm = new THREE.Mesh(palmGeo, material);
    palm.position.set(0, -0.16, 0);
    palm.castShadow = true;
    handGroup.add(palm);

    // Thenar eminence (Fleshy thumb base muscle pad)
    const thenarGeo = new THREE.SphereGeometry(0.18, 8, 8);
    thenarGeo.scale(1.0, 1.25, 0.85);
    const thenar = new THREE.Mesh(thenarGeo, material);
    thenar.position.set(xSign * 0.20, -0.10, 0.08);
    handGroup.add(thenar);

    // Hypothenar eminence (Outer palm edge pad)
    const hypothenarGeo = new THREE.SphereGeometry(0.14, 8, 8);
    hypothenarGeo.scale(0.85, 1.2, 0.8);
    const hypothenar = new THREE.Mesh(hypothenarGeo, material);
    hypothenar.position.set(-xSign * 0.20, -0.15, 0.05);
    handGroup.add(hypothenar);

    // 3. Articulated Opposable Thumb
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(xSign * 0.25, -0.05, 0.10);
    thumbGroup.rotation.set(0.22, xSign * 0.42, xSign * 0.35);

    const thumbBaseGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.26, 8);
    const thumbBase = new THREE.Mesh(thumbBaseGeo, material);
    thumbBase.position.set(0, -0.12, 0);
    thumbGroup.add(thumbBase);

    const thumbKnuckleGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const thumbKnuckle = new THREE.Mesh(thumbKnuckleGeo, material);
    thumbKnuckle.position.set(0, -0.25, 0);
    thumbGroup.add(thumbKnuckle);

    const thumbDistalGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.24, 8);
    const thumbDistal = new THREE.Mesh(thumbDistalGeo, material);
    thumbDistal.position.set(0, -0.37, 0.04);
    thumbDistal.rotation.x = -0.32;
    thumbGroup.add(thumbDistal);

    const thumbTipGeo = new THREE.SphereGeometry(0.095, 8, 8);
    const thumbTip = new THREE.Mesh(thumbTipGeo, material);
    thumbTip.position.set(0, -0.49, 0.08);
    thumbGroup.add(thumbTip);

    handGroup.add(thumbGroup);

    // 4. Four Articulated Fingers (Index, Middle, Ring, Pinky)
    const fingers = [
      { name: 'index', x: xSign * 0.18, len1: 0.23, len2: 0.19, rad: 0.094, curl: 0.45 },
      { name: 'middle', x: xSign * 0.06, len1: 0.26, len2: 0.22, rad: 0.098, curl: 0.50 },
      { name: 'ring', x: -xSign * 0.06, len1: 0.24, len2: 0.20, rad: 0.092, curl: 0.55 },
      { name: 'pinky', x: -xSign * 0.18, len1: 0.19, len2: 0.16, rad: 0.080, curl: 0.60 },
    ];

    fingers.forEach((f) => {
      const fGroup = new THREE.Group();
      fGroup.position.set(f.x, -0.46, 0);

      // Metacarpophalangeal Joint (Knuckle)
      const knuckleGeo = new THREE.SphereGeometry(f.rad * 1.05, 8, 8);
      const knuckle = new THREE.Mesh(knuckleGeo, material);
      fGroup.add(knuckle);

      // Proximal Phalanx
      const p1Geo = new THREE.CylinderGeometry(f.rad * 0.88, f.rad, f.len1, 8);
      const p1 = new THREE.Mesh(p1Geo, material);
      p1.position.set(0, -f.len1 * 0.48, 0.04);
      p1.rotation.x = -f.curl * 0.7;
      fGroup.add(p1);

      // Interphalangeal Joint
      const jointGeo = new THREE.SphereGeometry(f.rad * 0.9, 8, 8);
      const joint = new THREE.Mesh(jointGeo, material);
      joint.position.set(0, -f.len1 * 0.95, 0.11);
      fGroup.add(joint);

      // Distal Phalanx (curled gently into palm)
      const p2Geo = new THREE.CylinderGeometry(f.rad * 0.75, f.rad * 0.86, f.len2, 8);
      const p2 = new THREE.Mesh(p2Geo, material);
      p2.position.set(0, -f.len1 * 0.95 - f.len2 * 0.45, 0.21);
      p2.rotation.x = -f.curl * 1.2;
      fGroup.add(p2);

      // Rounded Fingertip Pad
      const tipGeo = new THREE.SphereGeometry(f.rad * 0.8, 8, 8);
      const tip = new THREE.Mesh(tipGeo, material);
      tip.position.set(0, -f.len1 * 0.95 - f.len2 * 0.9, 0.29);
      fGroup.add(tip);

      handGroup.add(fGroup);
    });

    return handGroup;
  };

  // Attach realistic articulated Left Hand
  const leftHand = buildFullHand('left', skinMat);
  leftHand.position.set(0, -4.35, 0.32);
  leftArmGroup.add(leftHand);

  group.add(leftArmGroup);

  // Right Arm Group (pivot at shoulder y=6.9)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(2.2 * widthMult, 6.9, 0);

  const rightUpperArmMesh = new THREE.Mesh(armUpperGeo, shirtMat);
  rightUpperArmMesh.position.set(0, -0.8, 0);
  rightUpperArmMesh.castShadow = true;
  rightArmGroup.add(rightUpperArmMesh);

  const rightUnderSleeveMesh = new THREE.Mesh(underSleeveGeo, darkSleeveMat);
  rightUnderSleeveMesh.position.set(0, -1.9, 0.05);
  rightArmGroup.add(rightUnderSleeveMesh);

  const rightCuffBand = new THREE.Mesh(cuffBandGeo, darkTrimMat);
  rightCuffBand.position.set(0, -2.5, 0.1);
  rightArmGroup.add(rightCuffBand);

  const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
  rightForearm.position.set(0, -3.5, 0.2);
  rightForearm.rotation.x = -0.15;
  rightArmGroup.add(rightForearm);

  // Attach realistic articulated Right Hand
  const rightHand = buildFullHand('right', skinMat);
  rightHand.position.set(0, -4.35, 0.32);
  rightArmGroup.add(rightHand);

  group.add(rightArmGroup);

  // -------------------------------------------------------------
  // 8. LEGS & BOOTS (Hierarchical Articulation)
  // -------------------------------------------------------------
  // Left Leg Group (pivot at hip y=2.8)
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-1.0 * widthMult, 2.8, 0);

  // Fitted Jet Black Trousers
  const thighGeo = new THREE.CylinderGeometry(0.55, 0.44, 2.0, 12);
  const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
  leftThigh.position.set(0, -1.0, 0);
  leftThigh.castShadow = true;
  leftLegGroup.add(leftThigh);

  // Cuffed Tan Leather Boots with Folded Collar
  const bootCuffShaftGeo = new THREE.CylinderGeometry(0.58, 0.52, 0.55, 12);
  const leftBootCuff = new THREE.Mesh(bootCuffShaftGeo, bootCuffMat);
  leftBootCuff.position.set(0, -1.9, 0.05);
  leftLegGroup.add(leftBootCuff);

  const bootShaftGeo = new THREE.CylinderGeometry(0.48, 0.43, 1.4, 12);
  const leftBootShaft = new THREE.Mesh(bootShaftGeo, shoesMat);
  leftBootShaft.position.set(0, -2.4, 0.05);
  leftLegGroup.add(leftBootShaft);

  // 4 Black Laces / clasps down front shin
  [-1.9, -2.15, -2.4, -2.65].forEach((offsetY) => {
    const strapGeo = new THREE.BoxGeometry(0.3, 0.08, 0.12);
    const strap = new THREE.Mesh(strapGeo, darkClaspMat);
    strap.position.set(0, offsetY, 0.5);
    leftLegGroup.add(strap);
  });

  // Boot Foot
  const bootFootGeo = new THREE.BoxGeometry(0.6, 0.55, 1.2);
  const leftBootFoot = new THREE.Mesh(bootFootGeo, shoesMat);
  leftBootFoot.position.set(0, -2.75, 0.35);
  leftLegGroup.add(leftBootFoot);

  // Dark Toe Cap
  const toeCapGeo = new THREE.BoxGeometry(0.62, 0.28, 0.5);
  const leftToeCap = new THREE.Mesh(toeCapGeo, bootSoleMat);
  leftToeCap.position.set(0, -2.85, 0.7);
  leftLegGroup.add(leftToeCap);

  // Dark Sole & Heel
  const heelGeo = new THREE.BoxGeometry(0.62, 0.2, 0.6);
  const leftHeel = new THREE.Mesh(heelGeo, bootSoleMat);
  leftHeel.position.set(0, -2.95, -0.1);
  leftLegGroup.add(leftHeel);

  group.add(leftLegGroup);

  // Right Leg Group (pivot at hip y=2.8)
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(1.0 * widthMult, 2.8, 0);

  const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
  rightThigh.position.set(0, -1.0, 0);
  rightThigh.castShadow = true;
  rightLegGroup.add(rightThigh);

  const rightBootCuff = new THREE.Mesh(bootCuffShaftGeo, bootCuffMat);
  rightBootCuff.position.set(0, -1.9, 0.05);
  rightLegGroup.add(rightBootCuff);

  const rightBootShaft = new THREE.Mesh(bootShaftGeo, shoesMat);
  rightBootShaft.position.set(0, -2.4, 0.05);
  rightLegGroup.add(rightBootShaft);

  [-1.9, -2.15, -2.4, -2.65].forEach((offsetY) => {
    const strapGeo = new THREE.BoxGeometry(0.3, 0.08, 0.12);
    const strap = new THREE.Mesh(strapGeo, darkClaspMat);
    strap.position.set(0, offsetY, 0.5);
    rightLegGroup.add(strap);
  });

  const rightBootFoot = new THREE.Mesh(bootFootGeo, shoesMat);
  rightBootFoot.position.set(0, -2.75, 0.35);
  rightLegGroup.add(rightBootFoot);

  const rightToeCap = new THREE.Mesh(toeCapGeo, bootSoleMat);
  rightToeCap.position.set(0, -2.85, 0.7);
  rightLegGroup.add(rightToeCap);

  const rightHeel = new THREE.Mesh(heelGeo, bootSoleMat);
  rightHeel.position.set(0, -2.95, -0.1);
  rightLegGroup.add(rightHeel);

  group.add(rightLegGroup);

  const leftArm = leftArmGroup;
  const rightArm = rightArmGroup;
  const leftLeg = leftLegGroup;
  const rightLeg = rightLegGroup;

  // 9. Floating Nameplate Billboard Badge
  const nameplateCanvas = document.createElement('canvas');
  nameplateCanvas.width = 512;
  nameplateCanvas.height = 128;
  const ctx = nameplateCanvas.getContext('2d')!;

  // Background gradient pill
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.5, '#fbbf24');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.roundRect(16, 16, 480, 96, 48);
  ctx.fill();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.roundRect(16, 16, 480, 96, 48);
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const displayName = playerProfile.name || playerProfile.username || 'Gambler';
  ctx.fillText(`🤠 ${displayName.toUpperCase()} • LV.${playerProfile.level || 1}`, 256, 64);

  const nameTexture = new THREE.CanvasTexture(nameplateCanvas);
  const nameMat = new THREE.SpriteMaterial({ map: nameTexture, transparent: true });
  const nameSprite = new THREE.Sprite(nameMat);
  nameSprite.position.set(0, 13.6, 0);
  nameSprite.scale.set(12, 3, 1);
  nameSprite.visible = false; // Hidden by default! Only show on hover per user request
  group.add(nameSprite);

  const setNameplateVisible = (visible: boolean) => {
    nameSprite.visible = visible;
  };

  // 10. Companion 3D Mascot Pet (walking faithfully beside player)
  let petGroup: THREE.Group | undefined;
  let petLeftLeg: THREE.Mesh | undefined;
  let petRightLeg: THREE.Mesh | undefined;
  let petTail: THREE.Mesh | undefined;

  const mascot = playerProfile.mascot || 'fox';
  petGroup = new THREE.Group();
  petGroup.position.set(3.8, 0, 0.5);

  let petColor = '#ea580c'; // Fox orange
  if (mascot === 'panda') petColor = '#f8fafc';
  if (mascot === 'tiger') petColor = '#f97316';
  if (mascot === 'lion') petColor = '#eab308';
  if (mascot === 'dragon' || mascot === 'frog') petColor = '#10b981';
  if (mascot === 'unicorn' || mascot === 'cat') petColor = '#ec4899';
  if (mascot === 'wolf' || mascot === 'koala') petColor = '#94a3b8';
  if (mascot === 'bear') petColor = '#78350f';

  const petMat = new THREE.MeshStandardMaterial({ color: petColor, roughness: 0.7 });
  const petDarkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

  // Pet Body
  const pBody = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), petMat);
  pBody.scale.set(1, 0.9, 1.4);
  pBody.position.y = 1.4;
  pBody.castShadow = true;
  petGroup.add(pBody);

  // Pet Head
  const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), petMat);
  pHead.position.set(0, 2.4, 0.8);
  pHead.castShadow = true;
  petGroup.add(pHead);

  // Pet Snout
  const pSnout = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 8), petDarkMat);
  pSnout.rotation.x = -Math.PI / 4;
  pSnout.position.set(0, 2.3, 1.5);
  petGroup.add(pSnout);

  // Pet Ears
  const pEarGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
  const pLeftEar = new THREE.Mesh(pEarGeo, petMat);
  pLeftEar.position.set(-0.5, 3.1, 0.6);
  petGroup.add(pLeftEar);

  const pRightEar = new THREE.Mesh(pEarGeo, petMat);
  pRightEar.position.set(0.5, 3.1, 0.6);
  petGroup.add(pRightEar);

  // Pet Legs
  const pLegGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 8);
  petLeftLeg = new THREE.Mesh(pLegGeo, petDarkMat);
  petLeftLeg.position.set(-0.5, 0.5, 0.4);
  petGroup.add(petLeftLeg);

  petRightLeg = new THREE.Mesh(pLegGeo, petDarkMat);
  petRightLeg.position.set(0.5, 0.5, 0.4);
  petGroup.add(petRightLeg);

  // Pet Tail
  const pTailGeo = new THREE.CylinderGeometry(0.15, 0.35, 1.2, 8);
  petTail = new THREE.Mesh(pTailGeo, petMat);
  petTail.position.set(0, 1.8, -1.3);
  petTail.rotation.x = Math.PI / 3;
  petGroup.add(petTail);

  group.add(petGroup);

  // Walk Cycle Animation Controller
  let legAngle = 0;

  const updateAnimation = (delta: number, isMoving: boolean) => {
    if (isMoving) {
      legAngle += 14 * delta;
      const swing = Math.sin(legAngle) * 0.65;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing;
      rightArm.rotation.x = swing;
      torso.position.y = 5.2 + Math.abs(Math.sin(legAngle * 2)) * 0.35;
      headGroup.position.y = 9.2 + Math.abs(Math.sin(legAngle * 2)) * 0.35;
      nameSprite.position.y = 13.6 + Math.abs(Math.sin(legAngle * 2)) * 0.35;

      if (petGroup && petLeftLeg && petRightLeg && petTail) {
        petLeftLeg.rotation.x = -swing * 0.8;
        petRightLeg.rotation.x = swing * 0.8;
        petTail.rotation.z = Math.sin(legAngle * 2) * 0.4;
        petGroup.position.y = Math.abs(Math.sin(legAngle * 2)) * 0.25;
      }
    } else {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = 0;
      rightArm.rotation.x = 0;
      torso.position.y = 5.2;
      headGroup.position.y = 9.2;
      nameSprite.position.y = 13.6;

      if (petGroup && petLeftLeg && petRightLeg && petTail) {
        petLeftLeg.rotation.x = 0;
        petRightLeg.rotation.x = 0;
        petTail.rotation.z = Math.sin(Date.now() * 0.003) * 0.2;
        petGroup.position.y = 0;
      }
    }
  };

  const dispose = () => {
    nameTexture.dispose();
    skinMat.dispose();
    hairMat.dispose();
    shirtMat.dispose();
    pantsMat.dispose();
    shoesMat.dispose();
    eyeMat.dispose();
  };

  return {
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    leftHand,
    rightHand,
    torso,
    head: headGroup,
    nameSprite,
    setNameplateVisible,
    petGroup,
    petLeftLeg,
    petRightLeg,
    petTail,
    updateAnimation,
    dispose,
  };
}
