import * as THREE from 'three';

export interface Vehicle3DInstance {
  group: THREE.Group;
  frontAxleGroup: THREE.Group;
  frontWheelL: THREE.Group;
  frontWheelR: THREE.Group;
  rearWheelL: THREE.Group;
  rearWheelR: THREE.Group;
  steeringTiller: THREE.Object3D;
  leftHeadlight: THREE.SpotLight;
  rightHeadlight: THREE.SpotLight;
  headlightLenses: THREE.Mesh[];
  steamParticles: THREE.Points;
  driverSeatPos: THREE.Vector3;
  updateAnimation: (delta: number, speed: number, steerAngle: number) => void;
  toggleHeadlights: () => boolean;
  dispose: () => void;
}

export function create3DSteamBuggy(scene: THREE.Scene, initialPos = { x: 6, z: 38, rot: Math.PI }): Vehicle3DInstance {
  const group = new THREE.Group();
  group.position.set(initialPos.x, 0, initialPos.z);
  group.rotation.y = initialPos.rot;
  // Scaled 2.4x so the vehicle is comfortably large, proportional to the ~11-unit-tall character
  group.scale.set(2.4, 2.4, 2.4);

  // Materials
  const mahoganyMat = new THREE.MeshStandardMaterial({
    color: 0x4a1e12,
    roughness: 0.6,
    metalness: 0.1,
  });
  const royalNavyBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.25,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.35,
    metalness: 0.75,
  });
  const brassMetalMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.8,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.65,
    metalness: 0.5,
  });
  const leatherSeatMat = new THREE.MeshStandardMaterial({
    color: 0x831843, // Deep wine/burgundy tufted leather
    roughness: 0.75,
    metalness: 0.05,
  });
  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.1,
  });

  // 1. Chassis Frame (Wood Planks & Brass Rails)
  const chassisGeo = new THREE.BoxGeometry(2.4, 0.25, 4.6);
  const chassis = new THREE.Mesh(chassisGeo, mahoganyMat);
  chassis.position.y = 1.0;
  chassis.castShadow = true;
  group.add(chassis);

  // Brass bumper rails
  const frontBumperGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 12);
  const frontBumper = new THREE.Mesh(frontBumperGeo, brassMetalMat);
  frontBumper.rotation.z = Math.PI / 2;
  frontBumper.position.set(0, 1.0, 2.38);
  group.add(frontBumper);

  const rearBumperGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 12);
  const rearBumper = new THREE.Mesh(rearBumperGeo, brassMetalMat);
  rearBumper.rotation.z = Math.PI / 2;
  rearBumper.position.set(0, 1.0, -2.38);
  group.add(rearBumper);

  // 2. Carriage Body / Mudguards
  const bodyGeo = new THREE.BoxGeometry(2.2, 1.1, 3.2);
  const body = new THREE.Mesh(bodyGeo, royalNavyBodyMat);
  body.position.set(0, 1.6, -0.2);
  body.castShadow = true;
  group.add(body);

  // Gold pinstripe molding around body
  const trimGeo = new THREE.BoxGeometry(2.26, 0.08, 3.26);
  const trim = new THREE.Mesh(trimGeo, goldTrimMat);
  trim.position.set(0, 2.05, -0.2);
  group.add(trim);

  // Radiator Brass Grill Front
  const grillGeo = new THREE.BoxGeometry(1.6, 1.2, 0.2);
  const grill = new THREE.Mesh(grillGeo, brassMetalMat);
  grill.position.set(0, 1.65, 1.45);
  grill.castShadow = true;
  group.add(grill);

  // Radiator Slats
  for (let i = -0.55; i <= 0.55; i += 0.22) {
    const slatGeo = new THREE.BoxGeometry(0.06, 0.9, 0.08);
    const slat = new THREE.Mesh(slatGeo, ironMat);
    slat.position.set(i, 1.65, 1.55);
    group.add(slat);
  }

  // 3. Luxurious Tufted Leather Driver Bench
  const benchGroup = new THREE.Group();
  benchGroup.position.set(0, 1.7, 0.1);

  // Seat bottom
  const seatBottomGeo = new THREE.BoxGeometry(1.9, 0.35, 1.1);
  const seatBottom = new THREE.Mesh(seatBottomGeo, leatherSeatMat);
  seatBottom.position.y = 0.55;
  seatBottom.castShadow = true;
  benchGroup.add(seatBottom);

  // Seat backrest
  const seatBackGeo = new THREE.BoxGeometry(1.9, 1.1, 0.3);
  const seatBack = new THREE.Mesh(seatBackGeo, leatherSeatMat);
  seatBack.position.set(0, 1.15, -0.42);
  seatBack.castShadow = true;
  benchGroup.add(seatBack);

  // Brass side grab handles
  [-1.0, 1.0].forEach((hx) => {
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const handle = new THREE.Mesh(handleGeo, brassMetalMat);
    handle.position.set(hx, 1.0, -0.1);
    benchGroup.add(handle);
  });

  group.add(benchGroup);

  // Driver seat position vector in vehicle local space
  const driverSeatPos = new THREE.Vector3(0, 2.1, 0.1);

  // 4. Brass Steering Column & Tiller Wheel
  const steeringColumnGroup = new THREE.Group();
  steeringColumnGroup.position.set(0, 1.7, 0.85);

  const columnGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.1, 10);
  const columnMesh = new THREE.Mesh(columnGeo, brassMetalMat);
  columnMesh.position.set(0, 0.45, 0);
  columnMesh.rotation.x = -Math.PI / 6;
  steeringColumnGroup.add(columnMesh);

  // Steering wheel ring
  const wheelRingGeo = new THREE.TorusGeometry(0.38, 0.04, 12, 24);
  const wheelRing = new THREE.Mesh(wheelRingGeo, mahoganyMat);
  wheelRing.position.set(0, 0.9, -0.25);
  wheelRing.rotation.x = Math.PI / 3;
  steeringColumnGroup.add(wheelRing);

  // 3-Spoke brass center
  const wheelCenterGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12);
  const wheelCenter = new THREE.Mesh(wheelCenterGeo, brassMetalMat);
  wheelCenter.position.set(0, 0.9, -0.25);
  wheelCenter.rotation.x = Math.PI / 3;
  steeringColumnGroup.add(wheelCenter);

  group.add(steeringColumnGroup);

  // 5. Rear Steam Boiler & Smokestack
  const boilerGroup = new THREE.Group();
  boilerGroup.position.set(0, 1.7, -1.2);

  // Horizontal Brass Tank
  const boilerGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.5, 16);
  const boiler = new THREE.Mesh(boilerGeo, brassMetalMat);
  boiler.rotation.x = Math.PI / 2;
  boiler.castShadow = true;
  boilerGroup.add(boiler);

  // Brass Dome Cap
  const domeGeo = new THREE.SphereGeometry(0.65, 16, 12);
  const dome = new THREE.Mesh(domeGeo, brassMetalMat);
  dome.position.z = -0.75;
  boilerGroup.add(dome);

  // Vertical Exhaust Smokestack Chimney
  const chimneyGeo = new THREE.CylinderGeometry(0.18, 0.14, 1.8, 12);
  const chimney = new THREE.Mesh(chimneyGeo, ironMat);
  chimney.position.set(0, 1.3, -0.5);
  chimney.castShadow = true;
  boilerGroup.add(chimney);

  // Chimney flared crown
  const crownGeo = new THREE.CylinderGeometry(0.26, 0.18, 0.25, 12);
  const crown = new THREE.Mesh(crownGeo, brassMetalMat);
  crown.position.set(0, 2.2, -0.5);
  boilerGroup.add(crown);

  group.add(boilerGroup);

  // 6. Spoked Carriage Wheels Helper
  const createSpokedWheel = (radius: number, width: number) => {
    const wheelGroup = new THREE.Group();

    // Outer tire / iron band
    const rimGeo = new THREE.TorusGeometry(radius, width * 0.45, 12, 32);
    const rim = new THREE.Mesh(rimGeo, tireRubberMat);
    rim.castShadow = true;
    wheelGroup.add(rim);

    // Inner brass rim lining
    const innerRimGeo = new THREE.TorusGeometry(radius - 0.08, width * 0.2, 8, 28);
    const innerRim = new THREE.Mesh(innerRimGeo, brassMetalMat);
    wheelGroup.add(innerRim);

    // Center turned hub
    const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, width * 1.5, 16);
    const hub = new THREE.Mesh(hubGeo, brassMetalMat);
    hub.rotation.x = Math.PI / 2;
    hub.castShadow = true;
    wheelGroup.add(hub);

    // 10 Wooden Spokes
    for (let s = 0; s < 10; s++) {
      const angle = (s / 10) * Math.PI * 2;
      const spokeGeo = new THREE.CylinderGeometry(0.035, 0.045, radius * 0.92, 8);
      const spoke = new THREE.Mesh(spokeGeo, mahoganyMat);
      spoke.position.set((Math.cos(angle) * radius) / 2, (Math.sin(angle) * radius) / 2, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      wheelGroup.add(spoke);
    }

    return wheelGroup;
  };

  // 7. FRONT STEERABLE AXLE & WHEELS
  const frontAxleGroup = new THREE.Group();
  frontAxleGroup.position.set(0, 0.85, 1.55);

  const frontAxleBarGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.8, 12);
  const frontAxleBar = new THREE.Mesh(frontAxleBarGeo, ironMat);
  frontAxleBar.rotation.z = Math.PI / 2;
  frontAxleGroup.add(frontAxleBar);

  const frontWheelL = createSpokedWheel(0.85, 0.18);
  frontWheelL.position.set(-1.4, 0, 0);
  frontWheelL.rotation.y = Math.PI / 2;
  frontAxleGroup.add(frontWheelL);

  const frontWheelR = createSpokedWheel(0.85, 0.18);
  frontWheelR.position.set(1.4, 0, 0);
  frontWheelR.rotation.y = -Math.PI / 2;
  frontAxleGroup.add(frontWheelR);

  group.add(frontAxleGroup);

  // 8. REAR DRIVE AXLE & LARGE WHEELS
  const rearAxleGroup = new THREE.Group();
  rearAxleGroup.position.set(0, 1.1, -1.45);

  const rearAxleBarGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.9, 12);
  const rearAxleBar = new THREE.Mesh(rearAxleBarGeo, ironMat);
  rearAxleBar.rotation.z = Math.PI / 2;
  rearAxleGroup.add(rearAxleBar);

  const rearWheelL = createSpokedWheel(1.1, 0.22);
  rearWheelL.position.set(-1.45, 0, 0);
  rearWheelL.rotation.y = Math.PI / 2;
  rearAxleGroup.add(rearWheelL);

  const rearWheelR = createSpokedWheel(1.1, 0.22);
  rearWheelR.position.set(1.45, 0, 0);
  rearWheelR.rotation.y = -Math.PI / 2;
  rearAxleGroup.add(rearWheelR);

  group.add(rearAxleGroup);

  // 9. Brass Lantern Headlights
  const headlightLenses: THREE.Mesh[] = [];

  const createLantern = (x: number) => {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, 1.7, 2.0);

    // Brass housing
    const houseGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.5, 12);
    const house = new THREE.Mesh(houseGeo, brassMetalMat);
    house.rotation.x = Math.PI / 2;
    house.castShadow = true;
    lanternGroup.add(house);

    // Glowing front glass lens
    const lensGeo = new THREE.CircleGeometry(0.22, 16);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.z = 0.26;
    lanternGroup.add(lens);
    headlightLenses.push(lens);

    return lanternGroup;
  };

  group.add(createLantern(-1.0));
  group.add(createLantern(1.0));

  // Twin Spotlights casting light cones forward on the cobblestones
  const leftHeadlight = new THREE.SpotLight(0xfef08a, 4.0, 45, Math.PI / 6, 0.45, 1.2);
  leftHeadlight.position.set(-1.0, 1.7, 2.2);
  const leftTarget = new THREE.Object3D();
  leftTarget.position.set(-1.0, 0.2, 25);
  group.add(leftTarget);
  leftHeadlight.target = leftTarget;
  group.add(leftHeadlight);

  const rightHeadlight = new THREE.SpotLight(0xfef08a, 4.0, 45, Math.PI / 6, 0.45, 1.2);
  rightHeadlight.position.set(1.0, 1.7, 2.2);
  const rightTarget = new THREE.Object3D();
  rightTarget.position.set(1.0, 0.2, 25);
  group.add(rightTarget);
  rightHeadlight.target = rightTarget;
  group.add(rightHeadlight);

  // 10. Exhaust Steam Particle System
  const particleCount = 28;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 0.4;
    particlePositions[i * 3 + 1] = 3.6 + (i / particleCount) * 2.2;
    particlePositions[i * 3 + 2] = -1.7 - (i / particleCount) * 3.0;
    particleScales[i] = 1.0 + Math.random() * 2.5;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xe2e8f0,
    size: 0.9,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });

  const steamParticles = new THREE.Points(particleGeo, particleMat);
  group.add(steamParticles);

  scene.add(group);

  let areHeadlightsOn = true;
  let wheelRotAngle = 0;
  let particleClock = 0;

  const updateAnimation = (delta: number, speed: number, steerAngle: number) => {
    // 1. Steering front axle rotation
    frontAxleGroup.rotation.y = THREE.MathUtils.lerp(frontAxleGroup.rotation.y, -steerAngle, 0.2);

    // Steering column tiller wheel also tilts
    steeringColumnGroup.rotation.z = frontAxleGroup.rotation.y * 0.9;

    // 2. Wheels spin based on vehicle linear speed (v = w * r)
    wheelRotAngle += (speed * delta) / 0.85;
    frontWheelL.rotation.z = wheelRotAngle;
    frontWheelR.rotation.z = wheelRotAngle;
    rearWheelL.rotation.z = (wheelRotAngle * 0.85) / 1.1;
    rearWheelR.rotation.z = (wheelRotAngle * 0.85) / 1.1;

    // 3. Subtle chassis suspension bounce / engine rumble
    const rumble = Math.sin(Date.now() * 0.02) * (Math.abs(speed) > 0.5 ? 0.04 : 0.012);
    body.position.y = 1.6 + rumble;
    benchGroup.position.y = 1.7 + rumble * 0.8;

    // 4. Steam exhaust particle billows
    particleClock += delta * (Math.abs(speed) * 0.2 + 1.2);
    const posAttr = steamParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      let py = posAttr.array[idx + 1] + delta * 2.4;
      let pz = posAttr.array[idx + 2] - (speed * delta * 0.8 + delta * 1.5);
      let px = posAttr.array[idx] + (Math.sin(particleClock + i) * 0.04);

      if (py > 6.5) {
        py = 3.6;
        pz = -1.7;
        px = (Math.random() - 0.5) * 0.2;
      }

      posAttr.array[idx] = px;
      posAttr.array[idx + 1] = py;
      posAttr.array[idx + 2] = pz;
    }
    posAttr.needsUpdate = true;
  };

  const toggleHeadlights = (): boolean => {
    areHeadlightsOn = !areHeadlightsOn;
    leftHeadlight.intensity = areHeadlightsOn ? 4.0 : 0;
    rightHeadlight.intensity = areHeadlightsOn ? 4.0 : 0;
    headlightLenses.forEach((lens) => {
      const mat = lens.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = areHeadlightsOn ? 1.2 : 0.1;
    });
    return areHeadlightsOn;
  };

  const dispose = () => {
    scene.remove(group);
    particleGeo.dispose();
    particleMat.dispose();
  };

  return {
    group,
    frontAxleGroup,
    frontWheelL,
    frontWheelR,
    rearWheelL,
    rearWheelR,
    steeringTiller: steeringColumnGroup,
    leftHeadlight,
    rightHeadlight,
    headlightLenses,
    steamParticles,
    driverSeatPos,
    updateAnimation,
    toggleHeadlights,
    dispose,
  };
}
