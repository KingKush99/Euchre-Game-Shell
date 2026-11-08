import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { create3DPlayerCharacter } from '../utils/create3DCharacter';
import { PlayerProfile } from '../types/poker';

export interface Opponent3DCharacterConfig {
  id: string;
  name: string;
  archetype: string;
  avatar: string;
  tagline: string;
  specialty: string;
  color: string;
  characterConfig: {
    eyesStyle: string;
    noseStyle: string;
    mouthStyle: string;
    faceStyle: string;
    hairStyle: string;
    bodyStyle: string;
    shirtsStyle: string;
    pantsStyle: string;
    shoesStyle: string;
    hairColor: string;
    shirtColor: string;
    pantsColor: string;
    shoesColor: string;
    eyesColor: string;
    skinColor: string;
  };
}

export const SALOON_3D_OPPONENTS: Opponent3DCharacterConfig[] = [
  {
    id: 'dealer',
    name: 'The Dealer',
    archetype: 'Saloon Master',
    avatar: '🎩',
    tagline: 'Flawless dealing with zero tells.',
    specialty: 'Calculates bower distribution and controls trump flow.',
    color: 'from-amber-600 to-amber-900',
    characterConfig: {
      eyesStyle: 'Focused Gaze',
      noseStyle: 'Chiseled',
      mouthStyle: 'Stoic',
      faceStyle: 'Angular OSRS',
      hairStyle: 'Bowler Hat',
      bodyStyle: 'Standard Athletic',
      shirtsStyle: 'Formal Saloon Vest',
      pantsStyle: 'Dark Fitted Trousers',
      shoesStyle: 'Polished Black Boots',
      hairColor: '#2b1d0c',
      shirtColor: '#d97706',
      pantsColor: '#171717',
      shoesColor: '#0a0a0a',
      eyesColor: '#d97706',
      skinColor: '#e0b89b',
    },
  },
  {
    id: 'strategist',
    name: 'The Strategist',
    archetype: 'Tactical Genius',
    avatar: '🧐',
    tagline: 'Reads your hand before trick two.',
    specialty: 'Patient play, traps loners, and punishes weak leads.',
    color: 'from-blue-600 to-indigo-900',
    characterConfig: {
      eyesStyle: 'Sharp Iris',
      noseStyle: 'Aquiline',
      mouthStyle: 'Calculating',
      faceStyle: 'Angular OSRS',
      hairStyle: 'Side Part Gentleman',
      bodyStyle: 'Slim Scholar',
      shirtsStyle: 'Sapphire Doublet',
      pantsStyle: 'Navy Tailored Pants',
      shoesStyle: 'Cuffed Tan Boots',
      hairColor: '#3b2b20',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      shoesColor: '#78350f',
      eyesColor: '#38bdf8',
      skinColor: '#f1cfb5',
    },
  },
  {
    id: 'jack',
    name: 'The Jack',
    archetype: 'Wildcard Gambler',
    avatar: '🃏',
    tagline: 'High-risk loner caller who plays to win big.',
    specialty: 'Aggressive 4-point loner hands and double bower sweeps.',
    color: 'from-purple-600 to-pink-900',
    characterConfig: {
      eyesStyle: 'Playful Glint',
      noseStyle: 'Straight',
      mouthStyle: 'Smirking',
      faceStyle: 'Chiseled Hero',
      hairStyle: 'Feathered Cavalier',
      bodyStyle: 'Standard Athletic',
      shirtsStyle: 'Royal Violet Gambeson',
      pantsStyle: 'Midnight Trousers',
      shoesStyle: 'Buckled Boots',
      hairColor: '#713f12',
      shirtColor: '#9333ea',
      pantsColor: '#2e1065',
      shoesColor: '#a855f7',
      eyesColor: '#c084fc',
      skinColor: '#fed7aa',
    },
  },
  {
    id: 'veteran',
    name: 'The Veteran',
    archetype: 'Frontier Legend',
    avatar: '🤠',
    tagline: 'Half a million hands across the territory.',
    specialty: 'Flawless stick-the-dealer defense and off-suit management.',
    color: 'from-stone-600 to-stone-900',
    characterConfig: {
      eyesStyle: 'Weathered Gaze',
      noseStyle: 'Broad Chiseled',
      mouthStyle: 'Determined',
      faceStyle: 'Rugged Outlaw',
      hairStyle: 'Wide Brim Cowboy Hat',
      bodyStyle: 'Brawny Titan',
      shirtsStyle: 'Frontier Leather Duster',
      pantsStyle: 'Heavy Denim Jeans',
      shoesStyle: 'Riding Spurs Boots',
      hairColor: '#52525b',
      shirtColor: '#78350f',
      pantsColor: '#3f3f46',
      shoesColor: '#451a03',
      eyesColor: '#71717a',
      skinColor: '#d4a373',
    },
  },
  {
    id: 'red_queen',
    name: 'The Red Queen',
    archetype: 'Royal Aristocrat',
    avatar: '👸',
    tagline: 'Commands hearts and diamonds with iron authority.',
    specialty: 'Crushing march leader and relentless trump order-ups.',
    color: 'from-rose-600 to-red-950',
    characterConfig: {
      eyesStyle: 'Piercing Emerald',
      noseStyle: 'Delicate',
      mouthStyle: 'Confident Smile',
      faceStyle: 'Refined Monarch',
      hairStyle: 'High Crown Bun',
      bodyStyle: 'Graceful Regent',
      shirtsStyle: 'Ruby Velvet Bodice',
      pantsStyle: 'Silk Crimson Skirt',
      shoesStyle: 'Gilded Slippers',
      hairColor: '#881337',
      shirtColor: '#e11d48',
      pantsColor: '#4c0519',
      shoesColor: '#fbbf24',
      eyesColor: '#10b981',
      skinColor: '#ffedd5',
    },
  },
  {
    id: 'blue_ace',
    name: 'The Blue Ace',
    archetype: 'Riverboat Shark',
    avatar: '♠️',
    tagline: 'Smooth, polished, and deadly with off-suit aces.',
    specialty: 'Master of cross-suit leads and baiting opponent bowers.',
    color: 'from-cyan-600 to-blue-950',
    characterConfig: {
      eyesStyle: 'Cool Cyan',
      noseStyle: 'Slim',
      mouthStyle: 'Suave',
      faceStyle: 'Angular OSRS',
      hairStyle: 'Slicked Riverboat Style',
      bodyStyle: 'Slim Aristocrat',
      shirtsStyle: 'Teal Silk Waistcoat',
      pantsStyle: 'Tailored Black Trousers',
      shoesStyle: 'Polished Dress Shoes',
      hairColor: '#1e293b',
      shirtColor: '#0891b2',
      pantsColor: '#0f172a',
      shoesColor: '#0284c7',
      eyesColor: '#38bdf8',
      skinColor: '#fde047',
    },
  },
  {
    id: 'card_shark',
    name: 'The Card Shark',
    archetype: 'Underworld Hustler',
    avatar: '🦈',
    tagline: 'Calculates every card in milliseconds.',
    specialty: 'Aggressive defensive euchres and tracking discards.',
    color: 'from-emerald-600 to-teal-950',
    characterConfig: {
      eyesStyle: 'Predator Eyes',
      noseStyle: 'Angular',
      mouthStyle: 'Sharp Grin',
      faceStyle: 'Angular Hustler',
      hairStyle: 'Shadowed Hood',
      bodyStyle: 'Athletic Scout',
      shirtsStyle: 'Dark Emerald Leather',
      pantsStyle: 'Stealth Black Pants',
      shoesStyle: 'Soft Leather Moccasins',
      hairColor: '#064e3b',
      shirtColor: '#059669',
      pantsColor: '#022c22',
      shoesColor: '#10b981',
      eyesColor: '#34d399',
      skinColor: '#e2e8f0',
    },
  },
  {
    id: 'rookie',
    name: 'The Rookie',
    archetype: 'Eager Beginner',
    avatar: '🤠',
    tagline: 'Hungry to learn every Euchre rule in the West.',
    specialty: 'Unpredictable calls that occasionally trigger surprise points.',
    color: 'from-lime-600 to-emerald-950',
    characterConfig: {
      eyesStyle: 'Wide Wonder',
      noseStyle: 'Button',
      mouthStyle: 'Happy Smile',
      faceStyle: 'Youthful Pioneer',
      hairStyle: 'Straw Rancher Hat',
      bodyStyle: 'Standard Athletic',
      shirtsStyle: 'Plaid Rancher Shirt',
      pantsStyle: 'Rugged Canvas Pants',
      shoesStyle: 'Work Boots',
      hairColor: '#b45309',
      shirtColor: '#65a30d',
      pantsColor: '#365314',
      shoesColor: '#78350f',
      eyesColor: '#84cc16',
      skinColor: '#fed7aa',
    },
  },
  {
    id: 'host',
    name: 'The Host',
    archetype: 'Saloon Proprietor',
    avatar: '🍺',
    tagline: 'Warm host of the Golden Horseshoe Parlor.',
    specialty: 'Steady team player who guarantees partner trick support.',
    color: 'from-amber-700 to-yellow-950',
    characterConfig: {
      eyesStyle: 'Warm Hazel',
      noseStyle: 'Generous',
      mouthStyle: 'Hearty Laugh',
      faceStyle: 'Jovial Bartender',
      hairStyle: 'Neat Horseshoe Beard',
      bodyStyle: 'Brawny Titan',
      shirtsStyle: 'Heavy Linen Apron',
      pantsStyle: 'Stout Brown Trousers',
      shoesStyle: 'Heavy Wooden Clogs',
      hairColor: '#451a03',
      shirtColor: '#d97706',
      pantsColor: '#78350f',
      shoesColor: '#292524',
      eyesColor: '#f59e0b',
      skinColor: '#fbcfe8',
    },
  },
  {
    id: 'collector',
    name: 'The Collector',
    archetype: 'Rare Card Hoarder',
    avatar: '📜',
    tagline: 'Keeper of ancient 1800s Euchre rulebooks.',
    specialty: 'Deep positional knowledge and perfect next-suit timing.',
    color: 'from-orange-600 to-amber-950',
    characterConfig: {
      eyesStyle: 'Scholarly Lens',
      noseStyle: 'Thin Chiseled',
      mouthStyle: 'Thoughtful',
      faceStyle: 'Wise Historian',
      hairStyle: 'Silvered Mage Mane',
      bodyStyle: 'Slim Scholar',
      shirtsStyle: 'Gilded Velvet Tunic',
      pantsStyle: 'Antique Gold Trousers',
      shoesStyle: 'Embroidered Slippers',
      hairColor: '#9ca3af',
      shirtColor: '#ea580c',
      pantsColor: '#9a3412',
      shoesColor: '#fbbf24',
      eyesColor: '#fb923c',
      skinColor: '#fef08a',
    },
  },
];

interface ThreeOpponent3DCanvasProps {
  character: Opponent3DCharacterConfig;
  className?: string;
  autoRotate?: boolean;
}

export const ThreeOpponent3DCanvas: React.FC<ThreeOpponent3DCanvasProps> = ({
  character,
  className = 'w-full h-full min-h-[220px]',
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const charGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 260;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 13.5);
    camera.lookAt(0, 4.8, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Saloon Stage Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(5, 12, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xf59e0b, 2.0, 20);
    rimLight.position.set(-6, 8, -4);
    scene.add(rimLight);

    const groundPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.8, 0.4, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.8,
        metalness: 0.2,
      })
    );
    groundPedestal.position.y = -0.2;
    groundPedestal.receiveShadow = true;
    scene.add(groundPedestal);

    // Circular glowing ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.45, 2.6, 32),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // 5. Build Character
    const mockProfile: PlayerProfile = {
      username: character.name,
      chips: 1000,
      gold: 50,
      sovereigns: 10,
      xp: 1000,
      level: 5,
      currentHatId: 'none',
      unlockedHats: ['none'],
      conqueredTowns: [],
      properties: {},
      claimedDailyDays: [],
      lastDailyClaim: 0,
      stats: {
        handsPlayed: 100,
        handsWon: 50,
        tournamentsPlayed: 10,
        tournamentsWon: 5,
        bossesDefeated: 1,
        biggestPotWon: 500,
        totalChipsWon: 2500,
        euchreSweeps: 12,
        lonerWins: 6,
      },
      characterConfig: character.characterConfig as any,
    };

    const articulatedChar = create3DPlayerCharacter(mockProfile);
    articulatedChar.setNameplateVisible(false);
    articulatedChar.group.scale.set(0.72, 0.72, 0.72);
    articulatedChar.group.position.set(0, 0, 0);
    scene.add(articulatedChar.group);
    charGroupRef.current = articulatedChar.group;

    // 6. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (articulatedChar) {
        articulatedChar.updateAnimation(delta, false);
      }

      if (charGroupRef.current) {
        if (autoRotate) {
          charGroupRef.current.rotation.y = Math.sin(time * 0.8) * 0.35;
        }
        // Subtle breathing bounce
        charGroupRef.current.position.y = Math.sin(time * 2) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw && nh) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(nw, nh);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (articulatedChar) {
        articulatedChar.dispose();
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [character, autoRotate]);

  return <div ref={mountRef} className={className} />;
};
