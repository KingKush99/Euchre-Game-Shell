import * as THREE from 'three';
import { Card } from '../types/poker';
import { getCustomAssets } from './customAssets';
import { drawBicycleRiderBack, CardBackColor } from './bicycleBacks';

// Cache generated textures to avoid canvas re-creation
const textureCache = new Map<string, THREE.CanvasTexture>();

function drawCrispPip(
  ctx: CanvasRenderingContext2D,
  suit: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const symbol =
    suit === 'spades' ? '♠' : suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : '♣';
  ctx.fillText(symbol, 0, 0);
  ctx.restore();
}

/**
 * Creates a high-definition realistic playing card canvas texture for Three.js.
 * Strictly adheres to 9-A play deck + 5s for scoring.
 */
export function createRealisticCardTexture(card: Card): THREE.CanvasTexture {
  const cacheKey = `${card.suit}-${card.value}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 716;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const mainColor = isRed ? '#dc2626' : '#0f172a';
  const rankStr =
    card.value === 5
      ? '5'
      : card.value === 9
      ? '9'
      : card.value === 10
      ? '10'
      : card.value === 11
      ? 'J'
      : card.value === 12
      ? 'Q'
      : card.value === 13
      ? 'K'
      : card.value === 14
      ? 'A'
      : `${card.value}`;

  // 1. Crisp White Cardstock Base with rounded edges
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  // Rounded card rectangle
  ctx.beginPath();
  ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 24);
  ctx.fill();

  // Subtle linen / cardstock gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#fafaf9');
  grad.addColorStop(1, '#f5f5f4');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(12, 12, canvas.width - 24, canvas.height - 24, 20);
  ctx.fill();

  // 2. Realistic Double Border & Margin
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(22, 22, canvas.width - 44, canvas.height - 44, 16);
  ctx.stroke();

  ctx.strokeStyle = isRed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(30, 30, canvas.width - 60, canvas.height - 60, 12);
  ctx.stroke();

  // 3. Dual Corner Indices (Top-Left & Bottom-Right)
  // Top-Left Index
  ctx.fillStyle = mainColor;
  ctx.font =
    card.value === 10
      ? '900 52px "Arial Black", "Trebuchet MS", sans-serif'
      : 'bold 58px "Playfair Display", "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rankStr, 62, 70);
  drawCrispPip(ctx, card.suit, 62, 124, 46, mainColor);

  // Bottom-Right Index (Rotated 180)
  ctx.save();
  ctx.translate(canvas.width - 62, canvas.height - 70);
  ctx.rotate(Math.PI);
  ctx.fillText(rankStr, 0, 0);
  drawCrispPip(ctx, card.suit, 0, -54, 46, mainColor);
  ctx.restore();

  // 4. Center Artwork based on Rank
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (card.value === 14) {
    // =========================================================================
    // ACE: Large central ornate suit pip with filigree
    // =========================================================================
    if (card.suit === 'spades') {
      // Ornate Master Ace of Spades
      ctx.save();
      ctx.fillStyle = mainColor;
      ctx.font = 'bold 240px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♠', cx, cy - 10);

      // Gold filigree ring
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 142, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 150, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.font = '900 20px "Trebuchet MS", sans-serif';
      ctx.fillText('★ EUCHRE CHAMPIONSHIP ★', cx, cy + 175);
      ctx.restore();
    } else {
      drawCrispPip(ctx, card.suit, cx, cy, 220, mainColor);
    }
  } else if (card.value >= 11 && card.value <= 13) {
    // =========================================================================
    // ROYAL COURT CARDS (J, Q, K): Authentic English court figures
    // =========================================================================
    const courtWidth = 280;
    const courtHeight = 430;
    const courtX = cx - courtWidth / 2;
    const courtY = cy - courtHeight / 2;

    // Court Outer Gold Frame
    ctx.fillStyle = isRed ? '#fff5f5' : '#f8fafc';
    ctx.fillRect(courtX, courtY, courtWidth, courtHeight);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 5;
    ctx.strokeRect(courtX, courtY, courtWidth, courtHeight);

    ctx.strokeStyle = isRed ? '#dc2626' : '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(courtX + 6, courtY + 6, courtWidth - 12, courtHeight - 12);

    // Symmetrical Court Divider
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(courtX, cy);
    ctx.lineTo(courtX + courtWidth, cy);
    ctx.stroke();

    // Royal Crown / Emblem in Center
    ctx.fillStyle = '#f59e0b';
    ctx.font = '54px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', cx, cy);

    // Top Royal Portrait Section
    ctx.fillStyle = mainColor;
    ctx.font = 'bold 74px "Playfair Display", serif';
    ctx.fillText(rankStr, cx, cy - 110);
    drawCrispPip(ctx, card.suit, cx, cy - 48, 62, mainColor);

    // Bottom Inverted Royal Portrait Section
    ctx.save();
    ctx.translate(cx, cy + 110);
    ctx.rotate(Math.PI);
    ctx.fillText(rankStr, 0, 0);
    drawCrispPip(ctx, card.suit, 0, -62, 62, mainColor);
    ctx.restore();
  } else if (card.value === 5) {
    // =========================================================================
    // 5 CARD (Scoring Card): Standard 5-pip distribution
    // =========================================================================
    const pipSpreadX = 90;
    const pipSpreadY = 145;
    const pipSize = 78;

    // 4 Corner Pips
    drawCrispPip(ctx, card.suit, cx - pipSpreadX, cy - pipSpreadY, pipSize, mainColor);
    drawCrispPip(ctx, card.suit, cx + pipSpreadX, cy - pipSpreadY, pipSize, mainColor);
    drawCrispPip(ctx, card.suit, cx - pipSpreadX, cy + pipSpreadY, pipSize, mainColor);
    drawCrispPip(ctx, card.suit, cx + pipSpreadX, cy + pipSpreadY, pipSize, mainColor);

    // 1 Center Pip
    drawCrispPip(ctx, card.suit, cx, cy, pipSize, mainColor);
  } else if (card.value === 9) {
    // =========================================================================
    // 9 CARD: 4 Top pips + 4 Bottom pips + 1 Center pip
    // =========================================================================
    const pipSpreadX = 90;
    const pipSize = 72;
    const pipsY = [-165, -55, 55, 165];

    pipsY.forEach((offsetY) => {
      drawCrispPip(ctx, card.suit, cx - pipSpreadX, cy + offsetY, pipSize, mainColor);
      drawCrispPip(ctx, card.suit, cx + pipSpreadX, cy + offsetY, pipSize, mainColor);
    });
    // Center Pip
    drawCrispPip(ctx, card.suit, cx, cy, pipSize, mainColor);
  } else if (card.value === 10) {
    // =========================================================================
    // 10 CARD: 4 Outer Left + 4 Outer Right + 2 Center Vertical Pips
    // =========================================================================
    const pipSpreadX = 90;
    const pipSize = 68;
    const pipsY = [-170, -60, 60, 170];

    pipsY.forEach((offsetY) => {
      drawCrispPip(ctx, card.suit, cx - pipSpreadX, cy + offsetY, pipSize, mainColor);
      drawCrispPip(ctx, card.suit, cx + pipSpreadX, cy + offsetY, pipSize, mainColor);
    });
    // Two Center Pips
    drawCrispPip(ctx, card.suit, cx, cy - 110, pipSize, mainColor);
    drawCrispPip(ctx, card.suit, cx, cy + 110, pipSize, mainColor);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates or retrieves the realistic card back texture.
 * Respects user's uploaded custom card back if available.
 */
export function createRealisticCardBackTexture(backColor: CardBackColor = 'blue'): THREE.Texture {
  const assets = getCustomAssets();
  const loader = new THREE.TextureLoader();

  if (assets.cardBackUrl) {
    const customTex = loader.load(assets.cardBackUrl);
    customTex.minFilter = THREE.LinearFilter;
    customTex.magFilter = THREE.LinearFilter;
    return customTex;
  }

  const svgUrl = `/card_backs/rider-back-${backColor}.svg`;
  const texture = loader.load(svgUrl);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
