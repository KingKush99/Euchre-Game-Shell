import fs from 'fs';
import path from 'path';

// Generate ultra-accurate 5-card SVGs matching the uploaded card images

function getClubs5SVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 720" width="500" height="720">
  <!-- Outer Black Bezel -->
  <rect width="500" height="720" rx="36" fill="#000000"/>
  <!-- Card White Base -->
  <rect x="12" y="12" width="476" height="696" rx="28" fill="#ffffff"/>

  <defs>
    <!-- Club Pip Path -->
    <g id="club-pip">
      <circle cx="0" cy="-14" r="14" fill="#000000"/>
      <circle cx="-13" cy="4" r="14" fill="#000000"/>
      <circle cx="13" cy="4" r="14" fill="#000000"/>
      <circle cx="0" cy="0" r="10" fill="#000000"/>
      <!-- Stem -->
      <path d="M -3,6 L -10,24 L 10,24 L 3,6 Z" fill="#000000"/>
    </g>
    <g id="small-club-pip">
      <use href="#club-pip" transform="scale(0.52)"/>
    </g>
  </defs>

  <!-- Top-Left Index (5 + Club) -->
  <g transform="translate(56, 105)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#000000" text-anchor="middle">5</text>
    <use href="#small-club-pip" x="0" y="44"/>
  </g>

  <!-- 5 Center Pips (Quincunx) -->
  <!-- Top-Left Pip -->
  <use href="#club-pip" transform="translate(150, 175) scale(1.65)"/>
  <!-- Top-Right Pip -->
  <use href="#club-pip" transform="translate(350, 175) scale(1.65)"/>
  <!-- Center Pip -->
  <use href="#club-pip" transform="translate(250, 360) scale(1.65)"/>
  <!-- Bottom-Left Pip -->
  <use href="#club-pip" transform="translate(150, 545) scale(1.65)"/>
  <!-- Bottom-Right Pip -->
  <use href="#club-pip" transform="translate(350, 545) scale(1.65)"/>

  <!-- Bottom-Right Inverted Index (5 + Club) -->
  <g transform="translate(444, 615) rotate(180)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#000000" text-anchor="middle">5</text>
    <use href="#small-club-pip" x="0" y="44"/>
  </g>
</svg>`;
}

function getDiamonds5SVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 720" width="500" height="720">
  <!-- Outer Black Bezel -->
  <rect width="500" height="720" rx="36" fill="#000000"/>
  <!-- Card White Base -->
  <rect x="12" y="12" width="476" height="696" rx="28" fill="#ffffff"/>

  <defs>
    <!-- Diamond Pip Path -->
    <g id="diamond-pip">
      <path d="M 0,-34 L 24,0 L 0,34 L -24,0 Z" fill="#d40000"/>
    </g>
    <g id="small-diamond-pip">
      <path d="M 0,-16 L 11,0 L 0,16 L -11,0 Z" fill="#d40000"/>
    </g>
  </defs>

  <!-- Top-Left Index (5 + Diamond) -->
  <g transform="translate(56, 105)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#d40000" text-anchor="middle">5</text>
    <use href="#small-diamond-pip" x="0" y="44"/>
  </g>

  <!-- 5 Center Pips (Quincunx) -->
  <!-- Top-Left Pip -->
  <use href="#diamond-pip" transform="translate(150, 160) scale(1.5)"/>
  <!-- Top-Right Pip -->
  <use href="#diamond-pip" transform="translate(350, 160) scale(1.5)"/>
  <!-- Center Pip -->
  <use href="#diamond-pip" transform="translate(250, 360) scale(1.5)"/>
  <!-- Bottom-Left Pip -->
  <use href="#diamond-pip" transform="translate(150, 560) scale(1.5)"/>
  <!-- Bottom-Right Pip -->
  <use href="#diamond-pip" transform="translate(350, 560) scale(1.5)"/>

  <!-- Bottom-Right Inverted Index (5 + Diamond) -->
  <g transform="translate(444, 615) rotate(180)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#d40000" text-anchor="middle">5</text>
    <use href="#small-diamond-pip" x="0" y="44"/>
  </g>
</svg>`;
}

function getHearts5SVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 720" width="500" height="720">
  <!-- Outer Black Bezel -->
  <rect width="500" height="720" rx="36" fill="#000000"/>
  <!-- Card White Base -->
  <rect x="12" y="12" width="476" height="696" rx="28" fill="#ffffff"/>

  <defs>
    <!-- Heart Pip Path -->
    <g id="heart-pip">
      <path d="M 0,26 C -28,3 -32,-16 -18,-26 C -6,-33 0,-18 0,-18 C 0,-18 6,-33 18,-26 C 32,-16 28,3 0,26 Z" fill="#d40000"/>
    </g>
    <g id="small-heart-pip">
      <use href="#heart-pip" transform="scale(0.55)"/>
    </g>
  </defs>

  <!-- Top-Left Index (5 + Heart) -->
  <g transform="translate(56, 105)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#d40000" text-anchor="middle">5</text>
    <use href="#small-heart-pip" x="0" y="44"/>
  </g>

  <!-- 5 Center Pips (Quincunx) -->
  <!-- Top-Left Pip -->
  <use href="#heart-pip" transform="translate(150, 185) scale(1.4)"/>
  <!-- Top-Right Pip -->
  <use href="#heart-pip" transform="translate(350, 185) scale(1.4)"/>
  <!-- Center Pip -->
  <use href="#heart-pip" transform="translate(250, 360) scale(1.4)"/>
  <!-- Bottom-Left Pip -->
  <use href="#heart-pip" transform="translate(150, 535) scale(1.4)"/>
  <!-- Bottom-Right Pip -->
  <use href="#heart-pip" transform="translate(350, 535) scale(1.4)"/>

  <!-- Bottom-Right Inverted Index (5 + Heart) -->
  <g transform="translate(444, 615) rotate(180)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#d40000" text-anchor="middle">5</text>
    <use href="#small-heart-pip" x="0" y="44"/>
  </g>
</svg>`;
}

function getSpades5SVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 720" width="500" height="720">
  <!-- Outer Black Bezel -->
  <rect width="500" height="720" rx="36" fill="#000000"/>
  <!-- Card White Base -->
  <rect x="12" y="12" width="476" height="696" rx="28" fill="#ffffff"/>

  <defs>
    <!-- Spade Pip Path -->
    <g id="spade-pip">
      <path d="M 0,-30 C -22,-3 -26,14 -12,24 C -4,29 0,16 0,16 C 0,16 4,29 12,24 C 26,14 22,-3 0,-30 Z" fill="#000000"/>
      <!-- Stem -->
      <path d="M -3,14 L -8,28 L 8,28 L 3,14 Z" fill="#000000"/>
    </g>
    <g id="small-spade-pip">
      <use href="#spade-pip" transform="scale(0.55)"/>
    </g>
  </defs>

  <!-- Top-Left Index (5 + Spade) -->
  <g transform="translate(56, 105)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#000000" text-anchor="middle">5</text>
    <use href="#small-spade-pip" x="0" y="44"/>
  </g>

  <!-- 5 Center Pips (Quincunx) -->
  <!-- Top-Left Pip -->
  <use href="#spade-pip" transform="translate(150, 185) scale(1.4)"/>
  <!-- Top-Right Pip -->
  <use href="#spade-pip" transform="translate(350, 185) scale(1.4)"/>
  <!-- Center Pip -->
  <use href="#spade-pip" transform="translate(250, 360) scale(1.4)"/>
  <!-- Bottom-Left Pip (inverted as in traditional deck) -->
  <use href="#spade-pip" transform="translate(150, 535) rotate(180) scale(1.4)"/>
  <!-- Bottom-Right Pip (inverted as in traditional deck) -->
  <use href="#spade-pip" transform="translate(350, 535) rotate(180) scale(1.4)"/>

  <!-- Bottom-Right Inverted Index (5 + Spade) -->
  <g transform="translate(444, 615) rotate(180)">
    <text x="0" y="0" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="76" font-weight="300" fill="#000000" text-anchor="middle">5</text>
    <use href="#small-spade-pip" x="0" y="44"/>
  </g>
</svg>`;
}

fs.writeFileSync(path.join('public', 'cards', 'clubs-5.svg'), getClubs5SVG(), 'utf-8');
fs.writeFileSync(path.join('public', 'cards', 'diamonds-5.svg'), getDiamonds5SVG(), 'utf-8');
fs.writeFileSync(path.join('public', 'cards', 'hearts-5.svg'), getHearts5SVG(), 'utf-8');
fs.writeFileSync(path.join('public', 'cards', 'spades-5.svg'), getSpades5SVG(), 'utf-8');

console.log('Successfully wrote the 4 exact 5-card SVGs to /public/cards/');
