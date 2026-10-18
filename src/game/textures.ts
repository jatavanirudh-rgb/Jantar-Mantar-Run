/**
 * Procedural Canvas Textures for Jan Tar Runner
 * Zero external image files; 100% canvas-generated with SRGBColorSpace.
 */

import * as THREE from 'three';

// Cache generated textures
const textureCache = new Map<string, THREE.CanvasTexture>();

function setupTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Delhi Police Barricade Texture (yellow & red/black hazard stripes with "DELHI POLICE" stencil)
 */
export function getBarricadeTexture(): THREE.CanvasTexture {
  const key = 'barricade';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Yellow base
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 512, 128);

  // Red/Dark diagonal warning stripes
  ctx.fillStyle = '#b91c1c';
  const stripeW = 32;
  for (let x = -128; x < 512 + 128; x += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeW, 0);
    ctx.lineTo(x + stripeW + 128, 128);
    ctx.lineTo(x + 128, 128);
    ctx.closePath();
    ctx.fill();
  }

  // Center white banner plaque
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(96, 28, 320, 72);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e3a8a';
  ctx.strokeRect(96, 28, 320, 72);

  // Stencil text
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DELHI POLICE', 256, 56);

  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('STOP • PROTEST AREA • CAUTION', 256, 84);

  const tex = setupTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Protest Placard Textures (Assorted realistic youth protest signs)
 */
const PLACARDS = [
  { title: 'PEACEFUL\nPROTEST', sub: 'Right to Assembly', bg: '#fef3c7', text: '#1e293b', accent: '#dc2626' },
  { title: 'VOICE OF\nYOUTH', sub: 'Jantar Mantar', bg: '#ffffff', text: '#047857', accent: '#f59e0b' },
  { title: 'SAVE OUR\nFUTURE', sub: 'Listen to Us', bg: '#e0f2fe', text: '#0369a1', accent: '#0284c7' },
  { title: 'UNITY IN\nDIVERSITY', sub: 'New Delhi', bg: '#fff7ed', text: '#c2410c', accent: '#15803d' },
];

export function getPlacardTexture(index = 0): THREE.CanvasTexture {
  const safeIdx = Math.abs(index) % PLACARDS.length;
  const key = `placard_${safeIdx}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const item = PLACARDS[safeIdx];
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Cardboard background
  ctx.fillStyle = item.bg;
  ctx.fillRect(0, 0, 256, 320);

  // Subtle cardboard edge border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#78350f';
  ctx.strokeRect(4, 4, 248, 312);

  // Tricolor accent ribbon top
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(10, 10, 78, 8);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(88, 10, 80, 8);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(168, 10, 78, 8);

  // Hand-painted look text
  ctx.fillStyle = item.text;
  ctx.font = '900 34px sans-serif';
  ctx.textAlign = 'center';

  const lines = item.title.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 128, 110 + i * 44);
  });

  // Highlight badge
  ctx.fillStyle = item.accent;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(item.sub, 128, 230);

  // Hashtag
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('#JantarMantar2026', 128, 270);

  const tex = setupTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Asphalt road texture with lane lines
 */
export function getRoadTexture(): THREE.CanvasTexture {
  const key = 'road';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark Delhi tarmac
  ctx.fillStyle = '#26282d';
  ctx.fillRect(0, 0, 512, 512);

  // Speckled asphalt noise
  ctx.fillStyle = '#343840';
  for (let i = 0; i < 3000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Subtle tire skid tracks
  ctx.fillStyle = 'rgba(15, 17, 23, 0.4)';
  ctx.fillRect(80, 0, 40, 512);
  ctx.fillRect(240, 0, 40, 512);
  ctx.fillRect(400, 0, 40, 512);

  // White dotted lane dividers (3 lanes: borders at x=170 and x=342)
  ctx.fillStyle = '#f8fafc';
  // Dotted dashes
  for (let y = 30; y < 512; y += 120) {
    ctx.fillRect(166, y, 10, 60);
    ctx.fillRect(336, y, 10, 60);
  }

  // Road curb edges (solid yellow / white curbs)
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(0, 0, 14, 512);
  ctx.fillRect(498, 0, 14, 512);

  const tex = setupTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, tex);
  return tex;
}

/**
 * Red Sandstone Brick Texture for Jantar Mantar structures
 */
export function getSandstoneTexture(): THREE.CanvasTexture {
  const key = 'sandstone';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Terracotta red sandstone base
  ctx.fillStyle = '#993d28';
  ctx.fillRect(0, 0, 256, 256);

  // Layered stone grain
  for (let y = 0; y < 256; y += 32) {
    ctx.fillStyle = (y / 32) % 2 === 0 ? '#863220' : '#a84732';
    ctx.fillRect(0, y, 256, 30);

    // Stone joints
    ctx.fillStyle = '#592015';
    ctx.fillRect(0, y + 30, 256, 2);
    for (let x = (y % 64 === 0 ? 0 : 32); x < 256; x += 64) {
      ctx.fillRect(x, y, 2, 30);
    }
  }

  const tex = setupTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Police Jeep / Gypsy side logo decal
 */
export function getPoliceDoorTexture(): THREE.CanvasTexture {
  const key = 'police_door';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 256, 128);

  // Blue and red band
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 48, 256, 20);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 68, 256, 12);

  // Text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DELHI POLICE', 128, 38);

  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PCR VAN • DIAL 112', 128, 64);

  const tex = setupTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Auto-rickshaw green & yellow CNG livery
 */
export function getAutorickshawTexture(): THREE.CanvasTexture {
  const key = 'autorickshaw';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Green lower body
  ctx.fillStyle = '#15803d';
  ctx.fillRect(0, 128, 256, 128);

  // Yellow upper roof & hood
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 256, 128);

  // Black separator
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 124, 256, 8);

  // CNG Green circular emblem
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(128, 190, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#16a34a';
  ctx.stroke();

  ctx.fillStyle = '#16a34a';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CNG', 128, 190);

  const tex = setupTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Golden Rupee Coin Face Texture
 */
export function getCoinTexture(): THREE.CanvasTexture {
  const key = 'coin_face';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Golden metallic gradient
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.7, '#eab308');
  grad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  // Outer beaded rim
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#a16207';
  ctx.stroke();

  // Indian Rupee symbol "₹"
  ctx.fillStyle = '#713f12';
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', 128, 134);

  const tex = setupTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}
