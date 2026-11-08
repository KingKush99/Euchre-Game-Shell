import fs from 'fs';
import path from 'path';

function generateBicycleRiderBackSVG(color) {
  const isRed = color === 'red';
  const primaryColor = isRed ? '#e11d48' : '#1e3a8a'; // Vibrant Rider Red or Navy Blue
  const deepColor = isRed ? '#9f1239' : '#172554';
  const white = '#ffffff';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700">
  <defs>
    <pattern id="stipple-${color}" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="1.1" fill="${deepColor}" opacity="0.6"/>
    </pattern>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- White Cardstock Base -->
  <rect x="6" y="6" width="488" height="688" rx="26" fill="#fcfcfc" stroke="#d1d5db" stroke-width="2"/>

  <!-- Color Field -->
  <rect x="26" y="26" width="448" height="648" rx="18" fill="${primaryColor}"/>
  <rect x="26" y="26" width="448" height="648" rx="18" fill="url(#stipple-${color})"/>

  <!-- Outer Double White Filigree Borders -->
  <rect x="34" y="34" width="432" height="632" rx="14" fill="none" stroke="${white}" stroke-width="3.5"/>
  <rect x="40" y="40" width="420" height="620" rx="10" fill="none" stroke="${white}" stroke-width="1.5"/>

  <!-- Inner Ornate Border Frame -->
  <rect x="48" y="48" width="404" height="604" rx="8" fill="none" stroke="${white}" stroke-width="1.2" stroke-dasharray="3,3"/>

  <!-- 4 Corner Cherubs & Scrollwork Arches -->
  <!-- Top Left Corner Arch -->
  <g transform="translate(52, 52)">
    <path d="M 0,0 Q 40,0 40,40 Q 20,20 0,0 Z" fill="${white}" opacity="0.9"/>
    <circle cx="28" cy="28" r="14" fill="${deepColor}" stroke="${white}" stroke-width="1.5"/>
    <circle cx="28" cy="28" r="6" fill="${white}"/>
  </g>
  <!-- Top Right Corner Arch -->
  <g transform="translate(448, 52) scale(-1, 1)">
    <path d="M 0,0 Q 40,0 40,40 Q 20,20 0,0 Z" fill="${white}" opacity="0.9"/>
    <circle cx="28" cy="28" r="14" fill="${deepColor}" stroke="${white}" stroke-width="1.5"/>
    <circle cx="28" cy="28" r="6" fill="${white}"/>
  </g>
  <!-- Bottom Left Corner Arch -->
  <g transform="translate(52, 648) scale(1, -1)">
    <path d="M 0,0 Q 40,0 40,40 Q 20,20 0,0 Z" fill="${white}" opacity="0.9"/>
    <circle cx="28" cy="28" r="14" fill="${deepColor}" stroke="${white}" stroke-width="1.5"/>
    <circle cx="28" cy="28" r="6" fill="${white}"/>
  </g>
  <!-- Bottom Right Corner Arch -->
  <g transform="translate(448, 648) scale(-1, -1)">
    <path d="M 0,0 Q 40,0 40,40 Q 20,20 0,0 Z" fill="${white}" opacity="0.9"/>
    <circle cx="28" cy="28" r="14" fill="${deepColor}" stroke="${white}" stroke-width="1.5"/>
    <circle cx="28" cy="28" r="6" fill="${white}"/>
  </g>

  <!-- Side Heart Scrollwork Flourishes -->
  <path d="M 40,250 C 70,250 80,300 40,350 C 80,400 70,450 40,450" fill="none" stroke="${white}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 460,250 C 430,250 420,300 460,350 C 420,400 430,450 460,450" fill="none" stroke="${white}" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Top & Bottom Crown/Heart Motifs -->
  <!-- Top Motif -->
  <g transform="translate(250, 48)">
    <path d="M -25,0 Q 0,-15 25,0 Q 0,15 -25,0 Z" fill="${white}"/>
    <path d="M 0,-12 C -8,-22 -20,-10 0,5 C 20,-10 8,-22 0,-12 Z" fill="${white}"/>
  </g>
  <!-- Bottom Motif -->
  <g transform="translate(250, 652) rotate(180)">
    <path d="M -25,0 Q 0,-15 25,0 Q 0,15 -25,0 Z" fill="${white}"/>
    <path d="M 0,-12 C -8,-22 -20,-10 0,5 C 20,-10 8,-22 0,-12 Z" fill="${white}"/>
  </g>

  <!-- Center Hub: Radiating Bicycle Propeller & Spoke Wheel -->
  <g transform="translate(250, 350)">
    <circle cx="0" cy="0" r="32" fill="${deepColor}" stroke="${white}" stroke-width="3"/>
    <circle cx="0" cy="0" r="24" fill="${primaryColor}" stroke="${white}" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="10" fill="${white}"/>
    <circle cx="0" cy="0" r="4" fill="${deepColor}"/>
    
    <!-- Propeller Blades -->
    <path d="M -160,0 L 160,0" stroke="${white}" stroke-width="3" stroke-linecap="round"/>
    <path d="M 0,-30 L 0,30" stroke="${white}" stroke-width="3" stroke-linecap="round"/>
    <path d="M -130,-16 L 130,16 M -130,16 L 130,-16" stroke="${white}" stroke-width="1.8" stroke-dasharray="6,3"/>
  </g>

  <!-- Top Medallion: Angel Cherub Riding Bicycle -->
  <g transform="translate(250, 205)">
    <!-- Medallion Outer Double Ring -->
    <circle cx="0" cy="0" r="114" fill="${deepColor}" stroke="${white}" stroke-width="4"/>
    <circle cx="0" cy="0" r="105" fill="none" stroke="${white}" stroke-width="1.8"/>
    <circle cx="0" cy="0" r="99" fill="none" stroke="${white}" stroke-width="1" stroke-dasharray="3,3"/>

    <!-- Cloud Horizon Lines in Medallion -->
    <path d="M -90,20 Q -40,10 0,20 Q 40,30 90,20 M -80,40 Q 0,30 80,40" stroke="${white}" stroke-width="1" opacity="0.6" fill="none"/>

    <!-- Bicycle Spoke Wheel -->
    <circle cx="0" cy="32" r="42" fill="none" stroke="${white}" stroke-width="3"/>
    <circle cx="0" cy="32" r="36" fill="none" stroke="${white}" stroke-width="1" stroke-dasharray="4,4"/>
    <circle cx="0" cy="32" r="5" fill="${white}"/>

    <!-- Angel Wings -->
    <path d="M -10,-25 Q -45,-45 -35,-15 Q -25,-5 -10,-10 Z" fill="${white}"/>
    <path d="M 10,-25 Q 45,-45 35,-15 Q 25,-5 10,-10 Z" fill="${white}"/>

    <!-- Cherub Head with Crown -->
    <circle cx="0" cy="-38" r="14" fill="${white}"/>
    <path d="M -8,-50 L 0,-56 L 8,-50 L 5,-44 L -5,-44 Z" fill="${white}"/>

    <!-- Cherub Torso & Legs on Bicycle Pedals -->
    <ellipse cx="0" cy="-14" rx="12" ry="18" fill="${white}"/>
    <path d="M -8,0 L -18,18 L -6,32 M 8,0 L 18,18 L 6,32" stroke="${white}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Bottom Medallion: Inverted Angel Cherub Riding Bicycle -->
  <g transform="translate(250, 495) rotate(180)">
    <!-- Medallion Outer Double Ring -->
    <circle cx="0" cy="0" r="114" fill="${deepColor}" stroke="${white}" stroke-width="4"/>
    <circle cx="0" cy="0" r="105" fill="none" stroke="${white}" stroke-width="1.8"/>
    <circle cx="0" cy="0" r="99" fill="none" stroke="${white}" stroke-width="1" stroke-dasharray="3,3"/>

    <!-- Cloud Horizon Lines in Medallion -->
    <path d="M -90,20 Q -40,10 0,20 Q 40,30 90,20 M -80,40 Q 0,30 80,40" stroke="${white}" stroke-width="1" opacity="0.6" fill="none"/>

    <!-- Bicycle Spoke Wheel -->
    <circle cx="0" cy="32" r="42" fill="none" stroke="${white}" stroke-width="3"/>
    <circle cx="0" cy="32" r="36" fill="none" stroke="${white}" stroke-width="1" stroke-dasharray="4,4"/>
    <circle cx="0" cy="32" r="5" fill="${white}"/>

    <!-- Angel Wings -->
    <path d="M -10,-25 Q -45,-45 -35,-15 Q -25,-5 -10,-10 Z" fill="${white}"/>
    <path d="M 10,-25 Q 45,-45 35,-15 Q 25,-5 10,-10 Z" fill="${white}"/>

    <!-- Cherub Head with Crown -->
    <circle cx="0" cy="-38" r="14" fill="${white}"/>
    <path d="M -8,-50 L 0,-56 L 8,-50 L 5,-44 L -5,-44 Z" fill="${white}"/>

    <!-- Cherub Torso & Legs on Bicycle Pedals -->
    <ellipse cx="0" cy="-14" rx="12" ry="18" fill="${white}"/>
    <path d="M -8,0 L -18,18 L -6,32 M 8,0 L 18,18 L 6,32" stroke="${white}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

const dir = path.join(process.cwd(), 'public', 'card_backs');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const redSvg = generateBicycleRiderBackSVG('red');
const blueSvg = generateBicycleRiderBackSVG('blue');

fs.writeFileSync(path.join(dir, 'card_back_red.svg'), redSvg);
fs.writeFileSync(path.join(dir, 'rider-back-red.svg'), redSvg);
fs.writeFileSync(path.join(dir, 'card_back_blue.svg'), blueSvg);
fs.writeFileSync(path.join(dir, 'rider-back-blue.svg'), blueSvg);

console.log('Successfully generated Bicycle Rider card backs for red and blue!');
