// Crisp kid-friendly procedural Canvas illustrations for beginner & school-entrant cards & games

export function hexAlpha(hex, a) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}

export function drawApple(ctx, x, y, r, time = 0, highlighted = false) {
  ctx.save();
  ctx.translate(x, y);
  if (highlighted) {
    ctx.fillStyle = 'rgba(255, 110, 110, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
  // Apple body (two overlapping circles)
  const g = ctx.createRadialGradient(-r * 0.28, -r * 0.3, r * 0.12, 0, 0, r * 1.15);
  g.addColorStop(0, '#ff8f8f');
  g.addColorStop(0.45, '#e84a5f');
  g.addColorStop(1, '#9e1c2f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(-r * 0.25, 0, r * 0.78, 0, Math.PI * 2);
  ctx.arc(r * 0.25, 0, r * 0.78, 0, Math.PI * 2);
  ctx.fill();

  // Bottom taper
  ctx.beginPath();
  ctx.ellipse(0, r * 0.28, r * 0.85, r * 0.68, 0, 0, Math.PI);
  ctx.fill();

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.38, -r * 0.28, r * 0.16, r * 0.28, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = Math.max(2, r * 0.12);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.55);
  ctx.quadraticCurveTo(r * 0.1, -r * 0.95, r * 0.25, -r * 1.05);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = '#5cd68d';
  ctx.beginPath();
  ctx.ellipse(r * 0.32, -r * 0.82, r * 0.34, r * 0.16, -0.45 + Math.sin(time * 2) * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBalloon(ctx, x, y, r, color = '#8fa0ff', label = '', time = 0) {
  ctx.save();
  ctx.translate(x, y);

  // String
  ctx.strokeStyle = 'rgba(237,237,235,0.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, r * 1.15);
  ctx.quadraticCurveTo(Math.sin(time * 3 + x) * 6, r * 1.6, Math.cos(time * 2 + y) * 5, r * 2.15);
  ctx.stroke();

  // Knot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-4, r * 1.18);
  ctx.lineTo(4, r * 1.18);
  ctx.lineTo(0, r * 1.02);
  ctx.closePath();
  ctx.fill();

  // Balloon body
  const grad = ctx.createRadialGradient(-r * 0.32, -r * 0.35, r * 0.1, 0, 0, r * 1.25);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.22, color);
  grad.addColorStop(1, '#181822');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.88, r * 1.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner tint overlay so label stands out cleanly
  ctx.fillStyle = hexAlpha(color, 0.52);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.88, r * 1.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, -r * 0.38, r * 0.16, r * 0.28, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // Rim
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.88, r * 1.06, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (label) {
    ctx.fillStyle = '#0c0c0d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = label.length > 2 ? r * 0.56 : r * 0.85;
    ctx.font = `700 ${Math.round(fontSize)}px "Nunito", ui-sans-serif, sans-serif`;
    ctx.fillText(label, 0, 2);
  }
  ctx.restore();
}

export function drawStar(ctx, x, y, r, fill = '#f3c57a', stroke = 'rgba(255,255,255,0.4)') {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.46;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawDuck(ctx, x, y, r, facing = 1, time = 0) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 3.2) * 2.5);
  ctx.scale(facing, 1);

  // Water ripple
  ctx.strokeStyle = 'rgba(124, 224, 195, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.58, r * 0.95, r * 0.22, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Duck body
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.ellipse(-r * 0.08, r * 0.22, r * 0.68, r * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-r * 0.65, r * 0.1);
  ctx.lineTo(-r * 0.92, -r * 0.14);
  ctx.lineTo(-r * 0.52, r * 0.3);
  ctx.closePath();
  ctx.fill();

  // Wing
  ctx.fillStyle = '#f4b942';
  ctx.beginPath();
  ctx.ellipse(-r * 0.1, r * 0.22, r * 0.36, r * 0.22, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(r * 0.34, -r * 0.26, r * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#ff7b54';
  ctx.beginPath();
  ctx.ellipse(r * 0.72, -r * 0.22, r * 0.24, r * 0.11, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#141417';
  ctx.beginPath();
  ctx.arc(r * 0.42, -r * 0.33, r * 0.065, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(r * 0.44, -r * 0.35, r * 0.025, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawIllustration(ctx, kind, cx, cy, size, time = 0, accent = '#8fa0ff') {
  ctx.save();
  ctx.translate(cx, cy);
  const r = size * 0.46;

  switch (kind) {
    case 'sir': {
      // Cute lion cub with gentle breathing/bobbing & blink
      ctx.save();
      ctx.translate(0, Math.sin(time * 1.8) * 1.8);
      const maneCount = 12;
      ctx.fillStyle = '#d97736';
      for (let i = 0; i < maneCount; i++) {
        const a = (i / maneCount) * Math.PI * 2 + Math.sin(time * 1.4) * 0.05;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72, r * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
      // Ears
      ctx.fillStyle = '#f3b75f';
      ctx.beginPath();
      ctx.arc(-r * 0.48, -r * 0.5, r * 0.18, 0, Math.PI * 2);
      ctx.arc(r * 0.48, -r * 0.5, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // Face
      ctx.fillStyle = '#f8c978';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      // Eyes (subtle blink every ~4s)
      const blink = (time % 4.2) > 4.02;
      if (blink) {
        ctx.strokeStyle = '#141417';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.29, -r * 0.1);
        ctx.lineTo(-r * 0.15, -r * 0.1);
        ctx.moveTo(r * 0.15, -r * 0.1);
        ctx.lineTo(r * 0.29, -r * 0.1);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#141417';
        ctx.beginPath();
        ctx.arc(-r * 0.22, -r * 0.1, r * 0.075, 0, Math.PI * 2);
        ctx.arc(r * 0.22, -r * 0.1, r * 0.075, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.12, r * 0.025, 0, Math.PI * 2);
        ctx.arc(r * 0.24, -r * 0.12, r * 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
      // Nose + Smile
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.moveTo(-r * 0.1, r * 0.06);
      ctx.lineTo(r * 0.1, r * 0.06);
      ctx.lineTo(0, r * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-r * 0.09, r * 0.2, r * 0.09, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r * 0.09, r * 0.2, r * 0.09, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'sar': {
      drawBalloon(ctx, -r * 0.35, -r * 0.05 + Math.sin(time * 2) * 3, r * 0.46, '#8fa0ff', 'Ş', time);
      drawBalloon(ctx, r * 0.34, -r * 0.22 + Math.cos(time * 2.2) * 3, r * 0.42, '#f3c57a', 'ş', time + 1);
      break;
    }

    case 'coy': {
      // Teapot
      // Steam
      ctx.strokeStyle = 'rgba(237,237,235,0.45)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        const ox = i * r * 0.22;
        const phase = Math.sin(time * 3 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(ox, -r * 0.55);
        ctx.quadraticCurveTo(ox + phase, -r * 0.8, ox - phase, -r * 1.0);
        ctx.stroke();
      }
      // Handle
      ctx.strokeStyle = '#7ce0c3';
      ctx.lineWidth = Math.max(3, r * 0.12);
      ctx.beginPath();
      ctx.arc(-r * 0.5, r * 0.05, r * 0.36, Math.PI * 0.55, Math.PI * 1.45);
      ctx.stroke();
      // Spout
      ctx.beginPath();
      ctx.moveTo(r * 0.45, r * 0.15);
      ctx.quadraticCurveTo(r * 0.8, -r * 0.05, r * 0.78, -r * 0.28);
      ctx.stroke();
      // Body
      ctx.fillStyle = '#52c4a8';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.12, r * 0.56, r * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lid
      ctx.fillStyle = '#7ce0c3';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.3, r * 0.34, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -r * 0.44, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Decorative stripe
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(-r * 0.45, r * 0.05, r * 0.9, r * 0.12);
      break;
    }

    case 'ordak': {
      drawDuck(ctx, 0, 0, r * 0.95, 1, time);
      break;
    }

    case 'goz':
    case 'tog': {
      // Mountain & snow peak
      ctx.fillStyle = '#485278';
      ctx.beginPath();
      ctx.moveTo(-r * 0.95, r * 0.65);
      ctx.lineTo(-r * 0.15, -r * 0.65);
      ctx.lineTo(r * 0.65, r * 0.65);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#626f9e';
      ctx.beginPath();
      ctx.moveTo(-r * 0.1, r * 0.65);
      ctx.lineTo(r * 0.45, -r * 0.35);
      ctx.lineTo(r * 0.98, r * 0.65);
      ctx.closePath();
      ctx.fill();

      // Snow cap
      ctx.fillStyle = '#ededeb';
      ctx.beginPath();
      ctx.moveTo(-r * 0.15, -r * 0.65);
      ctx.lineTo(-r * 0.42, -r * 0.22);
      ctx.lineTo(-r * 0.22, -r * 0.16);
      ctx.lineTo(-r * 0.08, -r * 0.26);
      ctx.lineTo(r * 0.12, -r * 0.2);
      ctx.closePath();
      ctx.fill();

      // Flying goose V-wings in sky
      const wingY = -r * 0.5 + Math.sin(time * 4) * 3;
      ctx.strokeStyle = '#e58fa9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(r * 0.25, wingY + 5);
      ctx.quadraticCurveTo(r * 0.4, wingY - 8, r * 0.55, wingY);
      ctx.quadraticCurveTo(r * 0.7, wingY - 8, r * 0.82, wingY + 5);
      ctx.stroke();
      break;
    }

    case 'quyos': {
      // Radiant sun
      ctx.save();
      ctx.rotate(time * 0.35);
      ctx.strokeStyle = '#f3c57a';
      ctx.lineWidth = Math.max(2, r * 0.09);
      ctx.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
        ctx.lineTo(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88);
        ctx.stroke();
      }
      ctx.restore();
      const sg = ctx.createRadialGradient(-r * 0.15, -r * 0.15, r * 0.1, 0, 0, r * 0.55);
      sg.addColorStop(0, '#fff4b8');
      sg.addColorStop(1, '#f3a83b');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.fillStyle = '#6b3e08';
      ctx.beginPath();
      ctx.arc(-r * 0.15, -r * 0.06, r * 0.055, 0, Math.PI * 2);
      ctx.arc(r * 0.15, -r * 0.06, r * 0.055, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6b3e08';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, r * 0.04, r * 0.18, 0.2, Math.PI - 0.2);
      ctx.stroke();
      break;
    }

    case 'olma': {
      drawApple(ctx, -r * 0.28, r * 0.1 + Math.sin(time * 2.0) * 2.2, r * 0.45, time, false);
      drawApple(ctx, r * 0.36, -r * 0.12 + Math.cos(time * 1.8) * 2.2, r * 0.36, time + 1, false);
      break;
    }

    case 'yulduz': {
      drawStar(ctx, -r * 0.22, 0, r * 0.55, '#f3c57a');
      drawStar(ctx, r * 0.48, -r * 0.36 + Math.sin(time * 3) * 3, r * 0.28, '#8fa0ff');
      drawStar(ctx, r * 0.45, r * 0.42, r * 0.22, '#7ce0c3');
      break;
    }

    case 'raketa': {
      ctx.save();
      ctx.rotate(-0.45);
      ctx.translate(0, Math.sin(time * 6) * 2);
      // Flame
      ctx.fillStyle = '#ff9f43';
      ctx.beginPath();
      ctx.moveTo(-r * 0.18, r * 0.45);
      ctx.lineTo(r * 0.18, r * 0.45);
      ctx.lineTo(0, r * (0.9 + Math.sin(time * 20) * 0.12));
      ctx.closePath();
      ctx.fill();
      // Fins
      ctx.fillStyle = '#e58fa9';
      ctx.beginPath();
      ctx.moveTo(-r * 0.28, r * 0.15);
      ctx.lineTo(-r * 0.54, r * 0.52);
      ctx.lineTo(-r * 0.22, r * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.28, r * 0.15);
      ctx.lineTo(r * 0.54, r * 0.52);
      ctx.lineTo(r * 0.22, r * 0.45);
      ctx.closePath();
      ctx.fill();
      // Body
      ctx.fillStyle = '#ededeb';
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.3, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Nose
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(0, -r * 0.36, r * 0.22, Math.PI, 0);
      ctx.fill();
      // Window
      ctx.fillStyle = '#252ba7';
      ctx.beginPath();
      ctx.arc(0, -r * 0.08, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'poyezd': {
      const bob = Math.sin(time * 5) * 1.5;
      ctx.translate(0, bob);
      // Puff smoke
      ctx.fillStyle = 'rgba(237,237,235,0.3)';
      ctx.beginPath();
      ctx.arc(r * 0.38, -r * 0.68, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.18, -r * 0.85, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // Chimney
      ctx.fillStyle = '#f3c57a';
      ctx.fillRect(r * 0.32, -r * 0.5, r * 0.18, r * 0.32);
      // Boiler
      ctx.fillStyle = accent;
      ctx.fillRect(-r * 0.2, -r * 0.22, r * 0.85, r * 0.58);
      // Cabin
      ctx.fillStyle = '#7ce0c3';
      ctx.fillRect(-r * 0.72, -r * 0.48, r * 0.56, r * 0.84);
      // Cabin window
      ctx.fillStyle = '#141417';
      ctx.fillRect(-r * 0.58, -r * 0.32, r * 0.28, r * 0.26);
      // Wheels
      ctx.fillStyle = '#ededeb';
      [-r * 0.45, 0, r * 0.42].forEach((wx) => {
        ctx.beginPath();
        ctx.arc(wx, r * 0.42, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#141417';
        ctx.beginPath();
        ctx.arc(wx, r * 0.42, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ededeb';
      });
      break;
    }

    case 'tarozi': {
      const tilt = Math.sin(time * 2) * 0.14;
      // Pillar & Base
      ctx.fillStyle = '#f3c57a';
      ctx.fillRect(-r * 0.07, -r * 0.5, r * 0.14, r * 1.1);
      ctx.fillRect(-r * 0.48, r * 0.55, r * 0.96, r * 0.14);
      // Beam
      ctx.save();
      ctx.translate(0, -r * 0.45);
      ctx.rotate(tilt);
      ctx.fillStyle = '#ededeb';
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-r * 0.8, -r * 0.05, r * 1.6, r * 0.1);
      ctx.strokeRect(-r * 0.8, -r * 0.05, r * 1.6, r * 0.1);
      // Pans
      [-r * 0.7, r * 0.7].forEach((px, idx) => {
        ctx.save();
        ctx.translate(px, 0);
        ctx.rotate(-tilt);
        ctx.strokeStyle = 'rgba(237,237,235,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-r * 0.22, r * 0.48);
        ctx.moveTo(0, 0);
        ctx.lineTo(r * 0.22, r * 0.48);
        ctx.stroke();
        ctx.fillStyle = idx === 0 ? '#8fa0ff' : '#7ce0c3';
        ctx.beginPath();
        ctx.arc(0, r * 0.48, r * 0.25, 0, Math.PI);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
      break;
    }

    case 'kitob': {
      // Open book with gentle hover and floating sparkle
      ctx.save();
      ctx.translate(0, Math.sin(time * 1.8) * 2.2);
      ctx.fillStyle = '#ededeb';
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.35);
      ctx.quadraticCurveTo(-r * 0.45, -r * 0.55, -r * 0.85, -r * 0.35);
      ctx.lineTo(-r * 0.85, r * 0.48);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.28, 0, r * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#dcdcd8';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.35);
      ctx.quadraticCurveTo(r * 0.45, -r * 0.55, r * 0.85, -r * 0.35);
      ctx.lineTo(r * 0.85, r * 0.48);
      ctx.quadraticCurveTo(r * 0.45, r * 0.28, 0, r * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Letter A & Ş on pages
      ctx.fillStyle = '#252ba7';
      ctx.font = `700 ${Math.round(r * 0.45)}px "Nunito", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', -r * 0.42, r * 0.05);
      ctx.fillStyle = '#d94862';
      ctx.fillText('Ş', r * 0.42, r * 0.05);

      // Floating knowledge sparkle
      drawStar(ctx, 0, -r * 0.72 + Math.sin(time * 2.6) * 2.5, r * 0.16, '#ffd166', 'rgba(15,23,42,0.16)');
      ctx.restore();
      break;
    }

    case 'qurbaqa': {
      // Cute frog on lily pad
      ctx.fillStyle = '#38a169';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.48, r * 0.85, r * 0.26, 0, 0.2, Math.PI * 2 - 0.2);
      ctx.lineTo(0, r * 0.48);
      ctx.closePath();
      ctx.fill();

      const hop = Math.abs(Math.sin(time * 2.5)) * 5;
      ctx.translate(0, -hop);
      ctx.fillStyle = '#68d391';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.12, r * 0.52, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#68d391';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.32, r * 0.18, 0, Math.PI * 2);
      ctx.arc(r * 0.25, -r * 0.32, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.32, r * 0.11, 0, Math.PI * 2);
      ctx.arc(r * 0.25, -r * 0.32, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#141417';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.32, r * 0.055, 0, Math.PI * 2);
      ctx.arc(r * 0.25, -r * 0.32, r * 0.055, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.strokeStyle = '#1b4332';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, r * 0.05, r * 0.26, 0.15, Math.PI - 0.15);
      ctx.stroke();
      break;
    }

    case 'qozi': {
      // Fluffy lamb with gentle hop
      ctx.save();
      ctx.translate(0, Math.sin(time * 2.1) * 2.4);
      ctx.fillStyle = '#ededeb';
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.28, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#2d2d34';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.08, r * 0.28, r * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-r * 0.1, 0, r * 0.05, 0, Math.PI * 2);
      ctx.arc(r * 0.1, 0, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    default: {
      // Glowing flower / badge motif
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + time * 0.4;
        ctx.fillStyle = hexAlpha(accent, 0.72);
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f3c57a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
