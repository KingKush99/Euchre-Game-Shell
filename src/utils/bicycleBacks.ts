// Generator for authentic Bicycle Rider Playing Card Backs (Blue and Red)

export type CardBackColor = 'blue' | 'red';

/**
 * Draws the high-detail Bicycle Rider Back on a Canvas 2D context.
 */
export function drawBicycleRiderBack(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: CardBackColor = 'blue'
) {
  const isBlue = color === 'blue';
  const mainColor = isBlue ? '#172b6b' : '#b91c1c';
  const deepColor = isBlue ? '#0f1c48' : '#7f1d1d';
  const lightColor = '#ffffff';

  // 1. Pure White Cardstock with rounded corners
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Outer Margin and Framing Border
  const margin = Math.round(width * 0.055);
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;

  ctx.fillStyle = mainColor;
  ctx.fillRect(margin, margin, innerW, innerH);

  // White inner perimeter line
  ctx.strokeStyle = lightColor;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(margin + 4, margin + 4, innerW - 8, innerH - 8);

  ctx.lineWidth = 1.2;
  ctx.strokeRect(margin + 8, margin + 8, innerW - 16, innerH - 16);

  // 3. Stippled Background Texture
  ctx.fillStyle = deepColor;
  const dotStep = 10;
  for (let y = margin + 12; y < margin + innerH - 12; y += dotStep) {
    for (let x = margin + 12; x < margin + innerW - 12; x += dotStep) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // 4. Center Double-Circle Medallions (Bicycle Rider Figure)
  const cx = width / 2;
  const cy = height / 2;
  const rMedallion = innerW * 0.28;
  const offsetMedallionY = innerH * 0.21;

  const drawAngelMedallion = (yCenter: number, isFlipped: boolean) => {
    ctx.save();
    ctx.translate(cx, yCenter);
    if (isFlipped) ctx.rotate(Math.PI);

    // Medallion Background & Outer Double Ring
    ctx.fillStyle = deepColor;
    ctx.beginPath();
    ctx.arc(0, 0, rMedallion, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, rMedallion, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, rMedallion - 4, 0, Math.PI * 2);
    ctx.stroke();

    // Radiating hatch lines in circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (rMedallion - 12), Math.sin(a) * (rMedallion - 12));
      ctx.lineTo(Math.cos(a) * (rMedallion - 4), Math.sin(a) * (rMedallion - 4));
      ctx.stroke();
    }

    // Angel / Cherub Riding Unicycle / Bicycle
    ctx.fillStyle = lightColor;
    ctx.strokeStyle = lightColor;

    // Bicycle Wheel
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, rMedallion * 0.35, rMedallion * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    // Wheel spokes
    for (let s = 0; s < Math.PI * 2; s += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(0, rMedallion * 0.35);
      ctx.lineTo(
        Math.cos(s) * (rMedallion * 0.38),
        rMedallion * 0.35 + Math.sin(s) * (rMedallion * 0.38)
      );
      ctx.stroke();
    }

    // Cherub Body
    ctx.beginPath();
    ctx.arc(0, -rMedallion * 0.38, rMedallion * 0.16, 0, Math.PI * 2); // Head
    ctx.fill();

    // Wings
    ctx.beginPath();
    ctx.ellipse(-rMedallion * 0.28, -rMedallion * 0.28, rMedallion * 0.18, rMedallion * 0.09, -0.4, 0, Math.PI * 2);
    ctx.ellipse(rMedallion * 0.28, -rMedallion * 0.28, rMedallion * 0.18, rMedallion * 0.09, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.ellipse(0, -rMedallion * 0.1, rMedallion * 0.14, rMedallion * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs pedaling
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-rMedallion * 0.08, rMedallion * 0.05);
    ctx.lineTo(-rMedallion * 0.14, rMedallion * 0.22);
    ctx.lineTo(0, rMedallion * 0.35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rMedallion * 0.08, rMedallion * 0.05);
    ctx.lineTo(rMedallion * 0.14, rMedallion * 0.22);
    ctx.lineTo(0, rMedallion * 0.35);
    ctx.stroke();

    ctx.restore();
  };

  // Top and Bottom Angel Medallions
  drawAngelMedallion(cy - offsetMedallionY, false);
  drawAngelMedallion(cy + offsetMedallionY, true);

  // 5. Central Hub & Radiating Fan Rays (Bicycle Propeller Center)
  ctx.save();
  ctx.translate(cx, cy);

  // Fan Spokes
  ctx.strokeStyle = lightColor;
  ctx.lineWidth = 1.8;
  const spokeCount = 28;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * Math.PI * 2) / spokeCount;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * (innerW * 0.38), Math.sin(angle) * 22);
    ctx.stroke();
  }

  // Central Hub
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lightColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 6. Corner Cherubs & Acanthus Leaf Filigree Scrollwork
  const drawCornerFiligree = (cornerX: number, cornerY: number, scaleX: number, scaleY: number) => {
    ctx.save();
    ctx.translate(cornerX, cornerY);
    ctx.scale(scaleX, scaleY);

    ctx.fillStyle = lightColor;
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 2;

    // Corner Winged Cherub
    ctx.beginPath();
    ctx.arc(38, 38, 12, 0, Math.PI * 2); // Head
    ctx.fill();

    // Cherub Wing
    ctx.beginPath();
    ctx.ellipse(56, 32, 18, 9, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Floral acanthus scroll curves
    ctx.beginPath();
    ctx.arc(42, 68, 24, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(68, 42, 24, Math.PI, 0);
    ctx.stroke();

    // Heart palmette shape
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.quadraticCurveTo(34, 12, 42, 28);
    ctx.quadraticCurveTo(28, 34, 18, 18);
    ctx.fill();

    ctx.restore();
  };

  // 4 corners
  drawCornerFiligree(margin + 4, margin + 4, 1, 1);
  drawCornerFiligree(margin + innerW - 4, margin + 4, -1, 1);
  drawCornerFiligree(margin + 4, margin + innerH - 4, 1, -1);
  drawCornerFiligree(margin + innerW - 4, margin + innerH - 4, -1, -1);
}

/**
 * Generates a high-res Data URL of the authentic Bicycle Rider Back.
 */
export function getBicycleRiderDataUrl(color: CardBackColor = 'blue'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 716;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  drawBicycleRiderBack(ctx, canvas.width, canvas.height, color);
  return canvas.toDataURL('image/png');
}
