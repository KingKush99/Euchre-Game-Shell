import fs from 'fs';
import path from 'path';

// Clean vector path symbols for exact crisp rendering
const SYMBOL_PATHS = {
  spades: 'M 0,-30 C 8,-12 28,-2 28,12 C 28,24 18,32 6,32 C 2,32 0,30 0,30 C 0,30 -2,32 -6,32 C -18,32 -28,24 -28,12 C -28,-2 -8,-12 0,-30 Z M -4,28 L -12,42 L 12,42 L 4,28 Z',
  hearts: 'M 0,-10 C -6,-28 -32,-28 -32,2 C -32,22 0,42 0,42 C 0,42 32,22 32,2 C 32,-28 6,-28 0,-10 Z',
  diamonds: 'M 0,-34 L 26,0 L 0,34 L -26,0 Z',
  clubs: 'M 0,-28 C 10,-28 16,-18 16,-8 C 16,0 8,8 2,9 C 12,5 28,12 28,24 C 28,34 18,42 6,42 C 4,42 2,40 0,38 C -2,40 -4,42 -6,42 C -18,42 -28,34 -28,24 C -28,12 -12,5 -2,9 C -8,8 -16,0 -16,-8 C -16,-18 -10,-28 0,-28 Z M -4,34 L -10,48 L 10,48 L 4,34 Z'
};

const SUITS = [
  { name: 'spades', symbol: '♠', color: '#0f172a', isRed: false },
  { name: 'hearts', symbol: '♥', color: '#dc2626', isRed: true },
  { name: 'diamonds', symbol: '♦', color: '#dc2626', isRed: true },
  { name: 'clubs', symbol: '♣', color: '#0f172a', isRed: false },
];

const VALUES = [
  { val: 5, rank: '5' },
  { val: 9, rank: '9' },
  { val: 10, rank: '10' },
  { val: 11, rank: 'J', title: 'JACK' },
  { val: 12, rank: 'Q', title: 'QUEEN' },
  { val: 13, rank: 'K', title: 'KING' },
  { val: 14, rank: 'A', title: 'ACE' },
];

function getPipSvg(suitName, x, y, scale = 1, flipped = false) {
  const pathD = SYMBOL_PATHS[suitName];
  const color = suitName === 'hearts' || suitName === 'diamonds' ? '#dc2626' : '#0f172a';
  const transform = `translate(${x}, ${y}) scale(${scale}) ${flipped ? 'rotate(180)' : ''}`;
  return `<path d="${pathD}" fill="${color}" transform="${transform}" />`;
}

function generateCourtCardArt(val, suitObj) {
  const { name: suit, isRed, color } = suitObj;
  const rank = val === 11 ? 'J' : val === 12 ? 'Q' : 'K';
  const title = val === 11 ? 'JACK' : val === 12 ? 'QUEEN' : 'KING';

  const primaryFill = isRed ? '#fee2e2' : '#f1f5f9';
  const strokeColor = isRed ? '#dc2626' : '#0f172a';
  const goldColor = '#eab308';
  const blueColor = '#2563eb';

  // Traditional Court Frame with Ornate Gold & Royal Red/Blue Motifs
  return `
    <g transform="translate(100, 140)">
      <!-- Outer Court Border -->
      <rect x="0" y="0" width="300" height="420" rx="12" fill="#ffffff" stroke="${strokeColor}" stroke-width="4" />
      <rect x="6" y="6" width="288" height="408" rx="8" fill="${primaryFill}" stroke="${goldColor}" stroke-width="2" />
      <line x1="6" y1="210" x2="294" y2="210" stroke="${strokeColor}" stroke-width="3" />

      <!-- Top Half Royal Illustration -->
      <g transform="translate(150, 105)">
        <!-- Royal Robe & Shoulder Pattern -->
        <path d="M -90,60 L -110,100 L 110,100 L 90,60 L 50,20 L -50,20 Z" fill="${strokeColor}" />
        <path d="M -70,30 L 70,30 L 80,90 L -80,90 Z" fill="${goldColor}" opacity="0.9" />
        <path d="M -40,30 L 0,80 L 40,30 Z" fill="${blueColor}" />

        <!-- Head / Face -->
        <circle cx="0" cy="-10" r="34" fill="#fef3c7" stroke="${strokeColor}" stroke-width="2.5" />
        <!-- Crown / Headdress -->
        ${
          val === 13
            ? `<path d="M -30,-40 L -40,-70 L -15,-52 L 0,-75 L 15,-52 L 40,-70 L 30,-40 Z" fill="${goldColor}" stroke="${strokeColor}" stroke-width="2" />`
            : val === 12
            ? `<path d="M -26,-40 L -32,-62 L 0,-48 L 32,-62 L 26,-40 Z" fill="${goldColor}" stroke="${strokeColor}" stroke-width="2" />`
            : `<path d="M -28,-40 L -28,-58 L 28,-58 L 28,-40 Z" fill="${goldColor}" stroke="${strokeColor}" stroke-width="2" />`
        }

        <!-- Facial Features -->
        <circle cx="-10" cy="-14" r="3" fill="${strokeColor}" />
        <circle cx="10" cy="-14" r="3" fill="${strokeColor}" />
        <path d="M -8,8 Q 0,16 8,8" fill="none" stroke="${strokeColor}" stroke-width="2" />

        <!-- Held Item Emblem -->
        ${
          val === 13
            ? `<line x1="55" y1="-30" x2="55" y2="70" stroke="${goldColor}" stroke-width="5" /><path d="M 50,-40 L 60,-40 L 55,-55 Z" fill="${strokeColor}" />`
            : val === 12
            ? `<circle cx="-55" cy="20" r="10" fill="${goldColor}" stroke="${strokeColor}" /><path d="M -55,30 L -55,60" stroke="${goldColor}" stroke-width="3" />`
            : `<path d="M 50,-20 L 60,30 L 45,30 Z" fill="${goldColor}" stroke="${strokeColor}" />`
        }

        <!-- Suit Pip Emblem on Robe -->
        ${getPipSvg(suit, -70, -20, 0.45)}
      </g>

      <!-- Bottom Half Inverted Royal Illustration -->
      <g transform="translate(150, 315) rotate(180)">
        <path d="M -90,60 L -110,100 L 110,100 L 90,60 L 50,20 L -50,20 Z" fill="${strokeColor}" />
        <path d="M -70,30 L 70,30 L 80,90 L -80,90 Z" fill="${goldColor}" opacity="0.9" />
        <path d="M -40,30 L 0,80 L 40,30 Z" fill="${blueColor}" />

        <circle cx="0" cy="-10" r="34" fill="#fef3c7" stroke="${strokeColor}" stroke-width="2.5" />
        ${
          val === 13
            ? `<path d="M -30,-40 L -40,-70 L -15,-52 L 0,-75 L 15,-52 L 40,-70 L 30,-40 Z" fill="${goldColor}" stroke="${strokeColor}" stroke-width="2" />`
            : val === 12
            ? `<path d="M -26,-40 L -32,-62 L 0,-48 L 32,-62 L 26,-40 Z" fill="${goldColor}" stroke="${strokeColor}" stroke-width="2" />`
            : `<path d="M -28,-40 L -28,-58 L 28,-58 L 28,-40 Z" fill="${goldColor}" stroke="${strokeColor}" stroke-width="2" />`
        }

        <circle cx="-10" cy="-14" r="3" fill="${strokeColor}" />
        <circle cx="10" cy="-14" r="3" fill="${strokeColor}" />
        <path d="M -8,8 Q 0,16 8,8" fill="none" stroke="${strokeColor}" stroke-width="2" />

        ${
          val === 13
            ? `<line x1="55" y1="-30" x2="55" y2="70" stroke="${goldColor}" stroke-width="5" /><path d="M 50,-40 L 60,-40 L 55,-55 Z" fill="${strokeColor}" />`
            : val === 12
            ? `<circle cx="-55" cy="20" r="10" fill="${goldColor}" stroke="${strokeColor}" /><path d="M -55,30 L -55,60" stroke="${goldColor}" stroke-width="3" />`
            : `<path d="M 50,-20 L 60,30 L 45,30 Z" fill="${goldColor}" stroke="${strokeColor}" />`
        }

        ${getPipSvg(suit, -70, -20, 0.45)}
      </g>
    </g>
  `;
}

function generateCardSVG(suitObj, valObj) {
  const { name: suit, isRed, color } = suitObj;
  const { val, rank } = valObj;

  let centerContent = '';

  if (val === 14) {
    // ACE (Bicycle Emblem Ace)
    centerContent = `
      <g transform="translate(250, 350)">
        <circle cx="0" cy="0" r="130" fill="${isRed ? '#fff1f2' : '#f8fafc'}" stroke="${isRed ? '#fca5a5' : '#cbd5e1'}" stroke-width="3" />
        <circle cx="0" cy="0" r="118" fill="none" stroke="${isRed ? '#fda4af' : '#e2e8f0'}" stroke-width="1.5" stroke-dasharray="4,4" />
        ${getPipSvg(suit, 0, -10, 2.2)}
        <text x="0" y="85" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="900" letter-spacing="5" fill="${isRed ? '#991b1b' : '#0f172a'}" text-anchor="middle">STANDARD DECK</text>
      </g>
    `;
  } else if (val >= 11 && val <= 13) {
    // ROYAL COURT (J, Q, K)
    centerContent = generateCourtCardArt(val, suitObj);
  } else if (val === 5) {
    // 5 PIPS
    centerContent = `
      <g>
        ${getPipSvg(suit, 170, 220, 1.1)}
        ${getPipSvg(suit, 330, 220, 1.1)}
        ${getPipSvg(suit, 250, 350, 1.2)}
        ${getPipSvg(suit, 170, 480, 1.1, true)}
        ${getPipSvg(suit, 330, 480, 1.1, true)}
      </g>
    `;
  } else if (val === 9) {
    // 9 PIPS
    centerContent = `
      <g>
        ${getPipSvg(suit, 160, 200, 0.95)}
        ${getPipSvg(suit, 340, 200, 0.95)}
        ${getPipSvg(suit, 160, 300, 0.95)}
        ${getPipSvg(suit, 340, 300, 0.95)}
        ${getPipSvg(suit, 250, 350, 1.0)}
        ${getPipSvg(suit, 160, 400, 0.95, true)}
        ${getPipSvg(suit, 340, 400, 0.95, true)}
        ${getPipSvg(suit, 160, 500, 0.95, true)}
        ${getPipSvg(suit, 340, 500, 0.95, true)}
      </g>
    `;
  } else if (val === 10) {
    // 10 PIPS
    centerContent = `
      <g>
        ${getPipSvg(suit, 160, 190, 0.9)}
        ${getPipSvg(suit, 340, 190, 0.9)}
        ${getPipSvg(suit, 250, 240, 0.9)}
        ${getPipSvg(suit, 160, 310, 0.9)}
        ${getPipSvg(suit, 340, 310, 0.9)}
        ${getPipSvg(suit, 160, 390, 0.9, true)}
        ${getPipSvg(suit, 340, 390, 0.9, true)}
        ${getPipSvg(suit, 250, 460, 0.9, true)}
        ${getPipSvg(suit, 160, 510, 0.9, true)}
        ${getPipSvg(suit, 340, 510, 0.9, true)}
      </g>
    `;
  }

  // Condensed index rendering for 10
  const isTen = rank === '10';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Outer Cardstock with Corner Radii -->
  <rect x="8" y="8" width="484" height="684" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" filter="url(#shadow)"/>
  <rect x="22" y="22" width="456" height="656" rx="20" fill="none" stroke="${isRed ? '#fee2e2' : '#f1f5f9'}" stroke-width="2"/>
  <rect x="30" y="30" width="440" height="640" rx="16" fill="none" stroke="${isRed ? '#fecdd3' : '#e2e8f0'}" stroke-width="1.5"/>

  <!-- Top-Left Corner Index -->
  <g transform="translate(62, 82)">
    <text x="0" y="0" font-family="${isTen ? "'Arial Narrow', 'Condensed', sans-serif" : "'Georgia', serif"}" font-size="${isTen ? '56' : '52'}" font-weight="900" fill="${color}" text-anchor="middle">${rank}</text>
    ${getPipSvg(suit, 0, 32, 0.45)}
  </g>

  <!-- Center Card Artwork / Pips -->
  ${centerContent}

  <!-- Bottom-Right Inverted Corner Index -->
  <g transform="translate(438, 618) rotate(180)">
    <text x="0" y="0" font-family="${isTen ? "'Arial Narrow', 'Condensed', sans-serif" : "'Georgia', serif"}" font-size="${isTen ? '56' : '52'}" font-weight="900" fill="${color}" text-anchor="middle">${rank}</text>
    ${getPipSvg(suit, 0, 32, 0.45)}
  </g>
</svg>`;
}

// Generate all 28 cards (9, 10, J, Q, K, A, and 5)
SUITS.forEach((suitObj) => {
  VALUES.forEach((valObj) => {
    const filename = `${suitObj.name}-${valObj.rank.toLowerCase()}.svg`;
    const svg = generateCardSVG(suitObj, valObj);
    fs.writeFileSync(path.join('public', 'cards', filename), svg, 'utf-8');
  });
});

console.log('Successfully generated all card face SVGs matching the uploaded card images!');
