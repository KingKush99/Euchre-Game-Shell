import * as THREE from 'three';
import { sounds } from './soundEffects';

export interface BoxCollider {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CircleCollider {
  id: string;
  name: string;
  x: number;
  z: number;
  r: number;
}

export interface DynamicProp {
  id: string;
  type: 'barrel' | 'crate';
  mesh: THREE.Group;
  pos: { x: number; z: number };
  vel: { x: number; z: number };
  radius: number;
  rotY: number;
  angVel: number;
}

export interface NPCAgent {
  id: string;
  name: string;
  title: string;
  role: string;
  pos: { x: number; z: number; rot: number };
  target: { x: number; z: number };
  speed: number;
  radius: number;
  waitTimer: number;
  isMoving: boolean;
  charRef: any;
  speechText?: string;
  speechTimer?: number;
}

// ------------------------------------------------------------------
// BOWER KINGDOM TOWN STATIC COLLIDERS (5X EXPANDED SCALE)
// ------------------------------------------------------------------
export const TOWN_BOX_COLLIDERS: BoxCollider[] = [
  // 1. Heart Tavern (West Grand Saloon)
  {
    id: 'bld_tavern',
    name: 'Heart Tavern',
    minX: -146,
    maxX: -94,
    minZ: -34,
    maxZ: 34,
  },
  // Heart Tavern Beer Garden Tables
  {
    id: 'tavern_table_north',
    name: 'Beer Garden Table North',
    minX: -88,
    maxX: -76,
    minZ: -18,
    maxZ: -10,
  },
  {
    id: 'tavern_table_south',
    name: 'Beer Garden Table South',
    minX: -88,
    maxX: -76,
    minZ: 10,
    maxZ: 18,
  },

  // 2. Diamond Market (East Grand Shop)
  {
    id: 'bld_market',
    name: 'Diamond Market',
    minX: 94,
    maxX: 146,
    minZ: -34,
    maxZ: 34,
  },
  // Diamond Market Covered Bazaar Stalls
  {
    id: 'market_stall_north',
    name: 'Market Bazaar Stall North',
    minX: 74,
    maxX: 86,
    minZ: -24,
    maxZ: -14,
  },
  {
    id: 'market_stall_south',
    name: 'Market Bazaar Stall South',
    minX: 74,
    maxX: 86,
    minZ: 14,
    maxZ: 24,
  },

  // 3. Spade Hall (North Royal Boss Palace)
  {
    id: 'bld_spade_hall',
    name: 'Spade Hall Palace',
    minX: -54,
    maxX: 54,
    minZ: -224,
    maxZ: -156,
  },

  // 4. South Grand Entrance Gate & Boundary Walls
  {
    id: 'gate_tower_left',
    name: 'Entrance Watchtower West',
    minX: -34,
    maxX: -24,
    minZ: 204,
    maxZ: 216,
  },
  {
    id: 'gate_tower_right',
    name: 'Entrance Watchtower East',
    minX: 24,
    maxX: 34,
    minZ: 204,
    maxZ: 216,
  },
  {
    id: 'boundary_wall_south_left',
    name: 'South Perimeter Wall West',
    minX: -150,
    maxX: -24,
    minZ: 208,
    maxZ: 214,
  },
  {
    id: 'boundary_wall_south_right',
    name: 'South Perimeter Wall East',
    minX: 24,
    maxX: 150,
    minZ: 208,
    maxZ: 214,
  },

  // 5. Crown Plaza Stone Benches Around Fountain
  {
    id: 'bench_north',
    name: 'Crown Plaza Stone Bench North',
    minX: -6,
    maxX: 6,
    minZ: -34,
    maxZ: -30,
  },
  {
    id: 'bench_south',
    name: 'Crown Plaza Stone Bench South',
    minX: -6,
    maxX: 6,
    minZ: 30,
    maxZ: 34,
  },
  {
    id: 'bench_west',
    name: 'Crown Plaza Stone Bench West',
    minX: -34,
    maxX: -30,
    minZ: -6,
    maxZ: 6,
  },
  {
    id: 'bench_east',
    name: 'Crown Plaza Stone Bench East',
    minX: 30,
    maxX: 34,
    minZ: -6,
    maxZ: 6,
  },
];

export const TOWN_CIRCLE_COLLIDERS: CircleCollider[] = [
  // Central Tiered Fountain
  { id: 'fountain', name: 'Crown Plaza Fountain', x: 0, z: 0, r: 14.5 },

  // Spade Hall Monument Trophy Pedestal
  { id: 'obs_pedestal', name: 'Spade Trophy Monument', x: 0, z: -136, r: 5.5 },

  // Grand Avenue Trees
  { id: 'tree_n1_w', name: 'North Avenue Tree 1 West', x: -24, z: -80, r: 3.5 },
  { id: 'tree_n1_e', name: 'North Avenue Tree 1 East', x: 24, z: -80, r: 3.5 },
  { id: 'tree_n2_w', name: 'North Avenue Tree 2 West', x: -24, z: -120, r: 3.5 },
  { id: 'tree_n2_e', name: 'North Avenue Tree 2 East', x: 24, z: -120, r: 3.5 },

  { id: 'tree_s1_w', name: 'South Avenue Tree 1 West', x: -24, z: 70, r: 3.5 },
  { id: 'tree_s1_e', name: 'South Avenue Tree 1 East', x: 24, z: 70, r: 3.5 },
  { id: 'tree_s2_w', name: 'South Avenue Tree 2 West', x: -24, z: 130, r: 3.5 },
  { id: 'tree_s2_e', name: 'South Avenue Tree 2 East', x: 24, z: 130, r: 3.5 },

  { id: 'tree_w1', name: 'Tavern Courtyard Tree North', x: -65, z: -40, r: 3.5 },
  { id: 'tree_w2', name: 'Tavern Courtyard Tree South', x: -65, z: 40, r: 3.5 },

  { id: 'tree_e1', name: 'Market Courtyard Tree North', x: 65, z: -40, r: 3.5 },
  { id: 'tree_e2', name: 'Market Courtyard Tree South', x: 65, z: 40, r: 3.5 },

  // Ornate Lampposts
  { id: 'lamp_nw', name: 'Plaza Lamppost NW', x: -26, z: -26, r: 1.4 },
  { id: 'lamp_ne', name: 'Plaza Lamppost NE', x: 26, z: -26, r: 1.4 },
  { id: 'lamp_sw', name: 'Plaza Lamppost SW', x: -26, z: 26, r: 1.4 },
  { id: 'lamp_se', name: 'Plaza Lamppost SE', x: 26, z: 26, r: 1.4 },
  { id: 'lamp_gate_w', name: 'Entrance Lamppost West', x: -22, z: 202, r: 1.4 },
  { id: 'lamp_gate_e', name: 'Entrance Lamppost East', x: 22, z: 202, r: 1.4 },
  { id: 'lamp_ave_n', name: 'North Avenue Lamppost', x: -16, z: -100, r: 1.4 },
  { id: 'lamp_ave_s', name: 'South Avenue Lamppost', x: 16, z: 100, r: 1.4 },
];

export const TOWN_BOUNDS = {
  minX: -148.0,
  maxX: 148.0,
  minZ: -245.0,
  maxZ: 245.0,
};

// ------------------------------------------------------------------
// COLLISION RESOLUTION: CIRCLE VS BOX
// ------------------------------------------------------------------
export function resolveCircleVsBox(
  pos: { x: number; z: number },
  radius: number,
  box: BoxCollider
): { collided: boolean; nx: number; nz: number; depth: number } {
  const closestX = Math.max(box.minX, Math.min(box.maxX, pos.x));
  const closestZ = Math.max(box.minZ, Math.min(box.maxZ, pos.z));

  const dx = pos.x - closestX;
  const dz = pos.z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq < radius * radius) {
    const dist = Math.sqrt(distSq);
    if (dist > 0.0001) {
      const nx = dx / dist;
      const nz = dz / dist;
      const depth = radius - dist;
      pos.x += nx * depth;
      pos.z += nz * depth;
      return { collided: true, nx, nz, depth };
    } else {
      // Circle center inside box: find closest edge
      const dMinX = pos.x - box.minX;
      const dMaxX = box.maxX - pos.x;
      const dMinZ = pos.z - box.minZ;
      const dMaxZ = box.maxZ - pos.z;
      const minEdge = Math.min(dMinX, dMaxX, dMinZ, dMaxZ);

      let nx = 0;
      let nz = 0;
      if (minEdge === dMinX) nx = -1;
      else if (minEdge === dMaxX) nx = 1;
      else if (minEdge === dMinZ) nz = -1;
      else nz = 1;

      const depth = radius + minEdge;
      pos.x += nx * depth;
      pos.z += nz * depth;
      return { collided: true, nx, nz, depth };
    }
  }

  return { collided: false, nx: 0, nz: 0, depth: 0 };
}

// ------------------------------------------------------------------
// COLLISION RESOLUTION: CIRCLE VS CIRCLE
// ------------------------------------------------------------------
export function resolveCircleVsCircle(
  pos1: { x: number; z: number },
  r1: number,
  pos2: { x: number; z: number },
  r2: number,
  fixedPos2 = true
): { collided: boolean; nx: number; nz: number; depth: number } {
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  const distSq = dx * dx + dz * dz;
  const minDist = r1 + r2;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq) || 0.001;
    const nx = dx / dist;
    const nz = dz / dist;
    const depth = minDist - dist;

    if (fixedPos2) {
      pos1.x += nx * depth;
      pos1.z += nz * depth;
    } else {
      pos1.x += nx * depth * 0.5;
      pos1.z += nz * depth * 0.5;
      pos2.x -= nx * depth * 0.5;
      pos2.z -= nz * depth * 0.5;
    }

    return { collided: true, nx, nz, depth };
  }

  return { collided: false, nx: 0, nz: 0, depth: 0 };
}

// ------------------------------------------------------------------
// RESOLVE CHARACTER AGAINST ALL STATIC OBSTACLES & BOUNDS
// ------------------------------------------------------------------
export function resolvePersonObstacles(pos: { x: number; z: number }, radius = 1.3): boolean {
  let anyCollision = false;

  // Run 2 iterative passes to ensure zero penetration even on corners
  for (let pass = 0; pass < 2; pass++) {
    // Box obstacles (buildings, stalls, benches)
    for (const box of TOWN_BOX_COLLIDERS) {
      const res = resolveCircleVsBox(pos, radius, box);
      if (res.collided) anyCollision = true;
    }

    // Circle obstacles (fountain, pillars, trees, lampposts)
    for (const circ of TOWN_CIRCLE_COLLIDERS) {
      const res = resolveCircleVsCircle(pos, radius, { x: circ.x, z: circ.z }, circ.r, true);
      if (res.collided) anyCollision = true;
    }

    // Town outer boundary walls
    if (pos.x - radius < TOWN_BOUNDS.minX) {
      pos.x = TOWN_BOUNDS.minX + radius;
      anyCollision = true;
    } else if (pos.x + radius > TOWN_BOUNDS.maxX) {
      pos.x = TOWN_BOUNDS.maxX - radius;
      anyCollision = true;
    }

    if (pos.z - radius < TOWN_BOUNDS.minZ) {
      pos.z = TOWN_BOUNDS.minZ + radius;
      anyCollision = true;
    } else if (pos.z + radius > TOWN_BOUNDS.maxZ) {
      pos.z = TOWN_BOUNDS.maxZ - radius;
      anyCollision = true;
    }
  }

  return anyCollision;
}

// ------------------------------------------------------------------
// DYNAMIC PROPS CREATION: BARRELS & CRATES
// ------------------------------------------------------------------
export function createDynamicProps(scene: THREE.Scene): DynamicProp[] {
  const props: DynamicProp[] = [];

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x6b4226,
    roughness: 0.65,
    metalness: 0.1,
  });
  const ironBandMat = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.4,
    metalness: 0.7,
  });
  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x854d0e,
    roughness: 0.7,
    metalness: 0.05,
  });

  // 1. Cider Barrel Helper
  const createBarrelMesh = () => {
    const group = new THREE.Group();
    const barrelGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.8, 16);
    barrelGeo.scale(1.15, 1.0, 1.15); // Bulging middle
    const barrelBody = new THREE.Mesh(barrelGeo, woodMat);
    barrelBody.position.y = 0.9;
    barrelBody.castShadow = true;
    group.add(barrelBody);

    // Iron bands
    [-0.55, -0.15, 0.15, 0.55].forEach((y) => {
      const ringGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.08, 16);
      const ring = new THREE.Mesh(ringGeo, ironBandMat);
      ring.position.y = 0.9 + y;
      group.add(ring);
    });

    return group;
  };

  // 2. Cargo Crate Helper
  const createCrateMesh = () => {
    const group = new THREE.Group();
    const crateGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.y = 0.8;
    crate.castShadow = true;
    group.add(crate);

    // Iron corner brackets
    const frameGeo = new THREE.BoxGeometry(1.64, 0.1, 1.64);
    const topFrame = new THREE.Mesh(frameGeo, ironBandMat);
    topFrame.position.y = 1.55;
    group.add(topFrame);
    const botFrame = new THREE.Mesh(frameGeo, ironBandMat);
    botFrame.position.y = 0.05;
    group.add(botFrame);

    return group;
  };

  // Initial placements near Tavern, Market Stalls, and Plaza Fountain (5x scale)
  const propConfigs: Array<{ id: string; type: 'barrel' | 'crate'; x: number; z: number }> = [
    { id: 'barrel_tavern_1', type: 'barrel', x: -74.0, z: -6.0 },
    { id: 'barrel_tavern_2', type: 'barrel', x: -72.0, z: 6.0 },
    { id: 'crate_tavern_3', type: 'crate', x: -75.0, z: 12.0 },
    { id: 'crate_market_1', type: 'crate', x: 74.0, z: -8.0 },
    { id: 'barrel_market_2', type: 'barrel', x: 72.0, z: 6.0 },
    { id: 'crate_market_3', type: 'crate', x: 75.0, z: 12.0 },
    { id: 'crate_stables_1', type: 'crate', x: 20.0, z: 120.0 },
    { id: 'barrel_stables_2', type: 'barrel', x: 24.0, z: 125.0 },
  ];

  for (const cfg of propConfigs) {
    const mesh = cfg.type === 'barrel' ? createBarrelMesh() : createCrateMesh();
    mesh.position.set(cfg.x, 0, cfg.z);
    scene.add(mesh);

    props.push({
      id: cfg.id,
      type: cfg.type,
      mesh,
      pos: { x: cfg.x, z: cfg.z },
      vel: { x: 0, z: 0 },
      radius: cfg.type === 'barrel' ? 1.0 : 1.15,
      rotY: Math.random() * Math.PI * 2,
      angVel: 0,
    });
  }

  return props;
}

// ------------------------------------------------------------------
// STEP DYNAMIC PROPS PHYSICS & COLLISIONS
// ------------------------------------------------------------------
export function stepDynamicProps(
  props: DynamicProp[],
  delta: number,
  playerPos: { x: number; z: number },
  playerRadius: number,
  vehicle?: { pos: { x: number; z: number }; speed: number; rot: number; radius: number }
) {
  for (let i = 0; i < props.length; i++) {
    const p = props[i];

    // Apply friction / damping
    p.vel.x *= 0.90;
    p.vel.z *= 0.90;
    p.angVel *= 0.88;

    // Zero out tiny velocities
    if (Math.hypot(p.vel.x, p.vel.z) < 0.05) {
      p.vel.x = 0;
      p.vel.z = 0;
    }

    // Integrate position
    p.pos.x += p.vel.x * delta;
    p.pos.z += p.vel.z * delta;
    p.rotY += p.angVel * delta;

    // 1. Collision with static town obstacles
    resolvePersonObstacles(p.pos, p.radius);

    // 2. Collision with Player
    const playerDist = Math.hypot(p.pos.x - playerPos.x, p.pos.z - playerPos.z);
    const minDist = p.radius + playerRadius;
    if (playerDist < minDist) {
      const nx = (p.pos.x - playerPos.x) / (playerDist || 1);
      const nz = (p.pos.z - playerPos.z) / (playerDist || 1);
      const depth = minDist - playerDist;

      // Push prop away
      p.pos.x += nx * depth * 0.7;
      p.pos.z += nz * depth * 0.7;
      p.vel.x += nx * 14.0;
      p.vel.z += nz * 14.0;
      p.angVel += (Math.random() - 0.5) * 6.0;

      // Push player slightly back
      playerPos.x -= nx * depth * 0.3;
      playerPos.z -= nz * depth * 0.3;
    }

    // 3. Collision with Vehicle
    if (vehicle && Math.abs(vehicle.speed) > 0.5) {
      const vDist = Math.hypot(p.pos.x - vehicle.pos.x, p.pos.z - vehicle.pos.z);
      const vMin = p.radius + vehicle.radius;
      if (vDist < vMin) {
        const nx = (p.pos.x - vehicle.pos.x) / (vDist || 1);
        const nz = (p.pos.z - vehicle.pos.z) / (vDist || 1);
        const impulse = Math.abs(vehicle.speed) * 0.85 + 5.0;

        p.vel.x += nx * impulse;
        p.vel.z += nz * impulse;
        p.angVel += (nx - nz) * 8.0;
        sounds.playCollisionThud();
      }
    }

    // 4. Collision with other Props (Object-to-Object)
    for (let j = i + 1; j < props.length; j++) {
      const other = props[j];
      const res = resolveCircleVsCircle(p.pos, p.radius, other.pos, other.radius, false);
      if (res.collided) {
        // Elastic impulse exchange
        const relVelX = p.vel.x - other.vel.x;
        const relVelZ = p.vel.z - other.vel.z;
        const velAlongNormal = relVelX * res.nx + relVelZ * res.nz;

        if (velAlongNormal < 0) {
          const impulse = -1.5 * velAlongNormal;
          p.vel.x += res.nx * impulse * 0.5;
          p.vel.z += res.nz * impulse * 0.5;
          other.vel.x -= res.nx * impulse * 0.5;
          other.vel.z -= res.nz * impulse * 0.5;
          sounds.playChipSound();
        }
      }
    }

    // Update 3D mesh
    p.mesh.position.x = p.pos.x;
    p.mesh.position.z = p.pos.z;
    p.mesh.rotation.y = p.rotY;
  }
}
