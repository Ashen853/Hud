/**
 * High-Resolution 2D Canvas Renderer for Head-Locked WebXR HUD
 * Renders at 2048x1024 for pristine crispness in Meta Quest 3 lenses
 */

export interface HudTheme {
  name: string;
  primary: string; // main cyan/amber/emerald
  primaryRgb: [number, number, number];
  accent: string;
  warning: string;
  critical: string;
  dim: string;
  gridColor: string;
}

export const HUD_THEMES: Record<string, HudTheme> = {
  cyan: {
    name: 'Cyan Tactical',
    primary: '#00f0ff',
    primaryRgb: [0, 240, 255],
    accent: '#38bdf8',
    warning: '#f59e0b',
    critical: '#ef4444',
    dim: 'rgba(0, 240, 255, 0.25)',
    gridColor: 'rgba(0, 240, 255, 0.08)'
  },
  amber: {
    name: 'Amber Night-Ops',
    primary: '#f59e0b',
    primaryRgb: [245, 158, 11],
    accent: '#fbbf24',
    warning: '#f97316',
    critical: '#ef4444',
    dim: 'rgba(245, 158, 11, 0.25)',
    gridColor: 'rgba(245, 158, 11, 0.08)'
  },
  emerald: {
    name: 'Emerald Ghost',
    primary: '#10b981',
    primaryRgb: [16, 185, 129],
    accent: '#34d399',
    warning: '#eab308',
    critical: '#f43f5e',
    dim: 'rgba(16, 185, 129, 0.25)',
    gridColor: 'rgba(16, 185, 129, 0.08)'
  },
  crimson: {
    name: 'Crimson Hazard',
    primary: '#f43f5e',
    primaryRgb: [244, 63, 94],
    accent: '#fb7185',
    warning: '#fb923c',
    critical: '#ef4444',
    dim: 'rgba(244, 63, 94, 0.25)',
    gridColor: 'rgba(244, 63, 94, 0.08)'
  }
};

export interface HudDrawState {
  health: number; // 0 - 100
  maxHealth: number;
  shield: number; // 0 - 150
  maxShield: number;
  ammo: number; // current ammo
  maxAmmo: number;
  reserveAmmo: number;
  weaponName: string;
  fireMode: 'auto' | 'burst' | 'overcharge';
  isReloading: boolean;
  reloadProgress: number; // 0 - 1
  heat: number; // 0 - 100
  recoil: number; // 0 - 1
  cameraYaw: number; // 0 - 360 degrees
  themeKey: keyof typeof HUD_THEMES;
  targetDistance: number;
  isFiring: boolean;
  visorScanline: boolean;
}

export function drawHudOnCanvas(
  canvas: HTMLCanvasElement,
  state: HudDrawState,
  timeMs: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const theme = HUD_THEMES[state.themeKey] || HUD_THEMES.cyan;
  const [pr, pg, pb] = theme.primaryRgb;

  // Clear canvas (MUST remain transparent for Quest 3 AR passthrough)
  ctx.clearRect(0, 0, w, h);

  // Subtle tactical helmet visor outer vignette/brackets
  ctx.save();
  drawHelmetVisorPerimeter(ctx, w, h, theme, timeMs, state);

  // TOP-LEFT: Ashen (Sierra-07) Callsign & Operative Diagnostics
  drawTopLeftCallsign(ctx, 60, 60, theme, state, timeMs);

  // TOP-CENTER: 360 Compass Heading Ribbon
  drawTopCompass(ctx, w / 2, 70, theme, state.cameraYaw);

  // TOP-RIGHT: Tactical Systems & Bio-Telemetry
  drawTopRightTelemetry(ctx, w - 60, 60, theme, state, timeMs);

  // CENTER: Dynamic Tactical Reticle & Target Lock
  drawCenterReticle(ctx, w / 2, h / 2, theme, state, timeMs);

  // BOTTOM-LEFT: Health & Shield Bar Cluster
  drawBottomLeftVitals(ctx, 70, h - 70, theme, state, timeMs);

  // BOTTOM-RIGHT: Fictional Ammo Counter & Weapon Status
  drawBottomRightAmmo(ctx, w - 70, h - 70, theme, state, timeMs);

  ctx.restore();
}

/**
 * Helmet Visor Outer Border & Corner HUD Brackets
 */
function drawHelmetVisorPerimeter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: HudTheme,
  timeMs: number,
  state: HudDrawState
): void {
  const [r, g, b] = theme.primaryRgb;

  // Subtle curved visor border line
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.22)`;
  ctx.lineWidth = 1.5;

  const m = 35; // margin
  const cornerLen = 140;

  // Top-left bracket
  ctx.beginPath();
  ctx.moveTo(m + cornerLen, m);
  ctx.lineTo(m + 40, m);
  ctx.lineTo(m, m + 40);
  ctx.lineTo(m, m + cornerLen);
  ctx.stroke();

  // Top-right bracket
  ctx.beginPath();
  ctx.moveTo(w - m - cornerLen, m);
  ctx.lineTo(w - m - 40, m);
  ctx.lineTo(w - m, m + 40);
  ctx.lineTo(w - m, m + cornerLen);
  ctx.stroke();

  // Bottom-left bracket
  ctx.beginPath();
  ctx.moveTo(m, h - m - cornerLen);
  ctx.lineTo(m, h - m - 40);
  ctx.lineTo(m + 40, h - m);
  ctx.lineTo(m + cornerLen, h - m);
  ctx.stroke();

  // Bottom-right bracket
  ctx.beginPath();
  ctx.moveTo(w - m - cornerLen, h - m);
  ctx.lineTo(w - m - 40, h - m);
  ctx.lineTo(w - m, h - m - 40);
  ctx.lineTo(w - m, h - m - cornerLen);
  ctx.stroke();

  // Low health warning border pulse if health < 30
  if (state.health < 30) {
    const pulse = 0.3 + 0.3 * Math.sin(timeMs * 0.008);
    ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Warning text top center below compass
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 22px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRITICAL DAMAGE // SEEK IMMEDIATE COVER', w / 2, 130);
  }
}

/**
 * TOP-LEFT: Nickname 'Ashen (Sierra-07)' and Unit Status
 */
function drawTopLeftCallsign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: HudTheme,
  state: HudDrawState,
  timeMs: number
): void {
  const [r, g, b] = theme.primaryRgb;

  // Callsign badge container
  ctx.save();
  ctx.translate(x, y);

  // Background glow panel
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(380, 0);
  ctx.lineTo(410, 30);
  ctx.lineTo(410, 85);
  ctx.lineTo(25, 85);
  ctx.lineTo(0, 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pulsing active neural link indicator dot
  const pulse = 0.5 + 0.5 * Math.sin(timeMs * 0.005);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + 0.6 * pulse})`;
  ctx.beginPath();
  ctx.arc(20, 28, 5, 0, Math.PI * 2);
  ctx.fill();

  // Unit tag
  ctx.fillStyle = theme.accent;
  ctx.font = '600 13px Orbitron, sans-serif';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '2px';
  ctx.fillText('OPERATIVE CALLSIGN', 36, 22);

  // Exact user nickname requested: Ashen (Sierra-07)
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 26px Orbitron, sans-serif';
  ctx.fillText('Ashen (Sierra-07)', 36, 52);

  // Secondary sub-info line
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
  ctx.font = '600 13px Rajdhani, monospace';
  ctx.fillText('CLASS: VANGUARD-07 // NEURAL LINK: SYNCED [99.8%] // AR-PASSTHROUGH ACTIVE', 12, 75);

  // Mini HUD telemetry bracket below callsign
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
  ctx.beginPath();
  ctx.moveTo(0, 95);
  ctx.lineTo(220, 95);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 255, 255, 0.6)`;
  ctx.font = '500 12px Rajdhani, monospace';
  ctx.fillText('SYS.LOC: GRID 47-E // LAT 37.77 // SEC-LEVEL 4', 0, 112);

  ctx.restore();
}

/**
 * TOP-CENTER: 360-degree Compass Ribbon
 */
function drawTopCompass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theme: HudTheme,
  yawDeg: number
): void {
  const [r, g, b] = theme.primaryRgb;
  const width = 360;

  ctx.save();
  ctx.translate(cx, cy);

  // Background frame
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
  ctx.lineWidth = 1;

  ctx.strokeRect(-width / 2, -18, width, 36);
  ctx.fillRect(-width / 2, -18, width, 36);

  // Center indicator marker (triangle)
  ctx.fillStyle = theme.primary;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(-6, 30);
  ctx.lineTo(6, 30);
  ctx.closePath();
  ctx.fill();

  // Clip to compass window
  ctx.save();
  ctx.beginPath();
  ctx.rect(-width / 2 + 2, -16, width - 4, 32);
  ctx.clip();

  // Draw compass ticks
  const degPerPixel = 0.45; // scale
  const directions: Record<number, string> = {
    0: 'N',
    45: 'NE',
    90: 'E',
    135: 'SE',
    180: 'S',
    225: 'SW',
    270: 'W',
    315: 'NW'
  };

  for (let angle = 0; angle < 360; angle += 15) {
    let diff = angle - yawDeg;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    const xPos = diff / degPerPixel;
    if (Math.abs(xPos) < width / 2) {
      const isCard = directions[angle] !== undefined;
      ctx.strokeStyle = isCard ? theme.primary : `rgba(${r}, ${g}, ${b}, 0.35)`;
      ctx.lineWidth = isCard ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(xPos, -15);
      ctx.lineTo(xPos, isCard ? 0 : -6);
      ctx.stroke();

      if (isCard) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 13px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(directions[angle], xPos, 14);
      }
    }
  }

  ctx.restore();

  // Exact heading degrees readout
  ctx.fillStyle = theme.primary;
  ctx.font = '700 14px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(yawDeg).toString().padStart(3, '0')}°`, 0, -24);

  ctx.restore();
}

/**
 * TOP-RIGHT: Tactical System Status & Biometrics
 */
function drawTopRightTelemetry(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: HudTheme,
  state: HudDrawState,
  timeMs: number
): void {
  const [r, g, b] = theme.primaryRgb;

  ctx.save();
  ctx.translate(x, y);

  const panelW = 320;
  // Frame
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-panelW, 0);
  ctx.lineTo(-panelW - 25, 25);
  ctx.lineTo(-panelW - 25, 85);
  ctx.lineTo(-20, 85);
  ctx.lineTo(0, 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = theme.accent;
  ctx.font = '700 13px Orbitron, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('META QUEST 3 // PASSTHROUGH AR', -15, 22);

  // Status stats
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 13px Rajdhani, monospace';
  ctx.fillText('REFRESH: 120 FPS // LATENCY: 4.2ms // 6-DOF TRACK', -15, 44);

  // Bio-telemetry
  const heartRate = 72 + Math.floor(Math.sin(timeMs * 0.003) * 6);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
  ctx.fillText(`HR: ${heartRate} BPM | O2: 99% | CORE: 36.8°C | BATTERY: 94%`, -15, 68);

  ctx.restore();
}

/**
 * CENTER: Tactical Reticle & Dynamic Crosshair
 */
function drawCenterReticle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theme: HudTheme,
  state: HudDrawState,
  timeMs: number
): void {
  const [r, g, b] = theme.primaryRgb;
  const recoilOffset = (state.recoil || 0) * 18;

  ctx.save();
  ctx.translate(cx, cy);

  // Outer rotating holographic ring (slow subtle spin)
  ctx.save();
  ctx.rotate((timeMs * 0.0004) % (Math.PI * 2));
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([12, 18, 4, 18]);
  ctx.beginPath();
  ctx.arc(0, 0, 75 + recoilOffset, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Central dot
  ctx.fillStyle = state.isFiring ? '#ffffff' : theme.primary;
  ctx.beginPath();
  ctx.arc(0, 0, state.isFiring ? 4.5 : 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 4 Crosshair ticks with recoil expansion
  const gap = 16 + recoilOffset;
  const len = 12;
  ctx.strokeStyle = state.isFiring ? '#ffffff' : theme.primary;
  ctx.lineWidth = 2;

  // Up
  ctx.beginPath();
  ctx.moveTo(0, -gap);
  ctx.lineTo(0, -gap - len);
  ctx.stroke();

  // Down
  ctx.beginPath();
  ctx.moveTo(0, gap);
  ctx.lineTo(0, gap + len);
  ctx.stroke();

  // Left
  ctx.beginPath();
  ctx.moveTo(-gap, 0);
  ctx.lineTo(-gap - len, 0);
  ctx.stroke();

  // Right
  ctx.beginPath();
  ctx.moveTo(gap, 0);
  ctx.lineTo(gap + len, 0);
  ctx.stroke();

  // Lock-on brackets
  const bracketDist = 38 + recoilOffset;
  const bSize = 8;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
  ctx.lineWidth = 1.5;

  // Top-left bracket
  ctx.beginPath();
  ctx.moveTo(-bracketDist, -bracketDist + bSize);
  ctx.lineTo(-bracketDist, -bracketDist);
  ctx.lineTo(-bracketDist + bSize, -bracketDist);
  ctx.stroke();

  // Top-right bracket
  ctx.beginPath();
  ctx.moveTo(bracketDist - bSize, -bracketDist);
  ctx.lineTo(bracketDist, -bracketDist);
  ctx.lineTo(bracketDist, -bracketDist + bSize);
  ctx.stroke();

  // Bottom-left bracket
  ctx.beginPath();
  ctx.moveTo(-bracketDist, bracketDist - bSize);
  ctx.lineTo(-bracketDist, bracketDist);
  ctx.lineTo(-bracketDist + bSize, bracketDist);
  ctx.stroke();

  // Bottom-right bracket
  ctx.beginPath();
  ctx.moveTo(bracketDist - bSize, bracketDist);
  ctx.lineTo(bracketDist, bracketDist);
  ctx.lineTo(bracketDist, bracketDist - bSize);
  ctx.stroke();

  // Distance rangefinder readout
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
  ctx.font = '600 12px Rajdhani, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`RNG: ${state.targetDistance.toFixed(1)}m [LOCKED]`, 0, gap + len + 22);

  ctx.restore();
}

/**
 * BOTTOM-LEFT: Health Bar & Kinetic Shield
 */
function drawBottomLeftVitals(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: HudTheme,
  state: HudDrawState,
  timeMs: number
): void {
  const [r, g, b] = theme.primaryRgb;

  ctx.save();
  ctx.translate(x, y);

  const containerW = 420;
  const containerH = 130;

  // Background panel with angled sci-fi corner
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(containerW - 35, 0);
  ctx.lineTo(containerW, 35);
  ctx.lineTo(containerW, containerH);
  ctx.lineTo(35, containerH);
  ctx.lineTo(0, containerH - 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Header Title
  ctx.fillStyle = theme.accent;
  ctx.font = '700 13px Orbitron, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SUIT VITALS // OPERATIVE INTEGRITY', 20, 26);

  // 1. KINETIC SHIELD BAR (Top bar)
  const shieldRatio = Math.max(0, Math.min(1, state.shield / state.maxShield));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '600 12px Rajdhani, monospace';
  ctx.fillText(`SHIELD [${Math.round(state.shield)} / ${state.maxShield}]`, 20, 48);

  const barW = 360;
  const barH = 12;
  // Shield Background groove
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(20, 52, barW, barH);
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
  ctx.strokeRect(20, 52, barW, barH);

  // Shield segmented fill
  const shieldFillW = barW * shieldRatio;
  const shieldGrad = ctx.createLinearGradient(20, 0, 20 + shieldFillW, 0);
  shieldGrad.addColorStop(0, '#38bdf8');
  shieldGrad.addColorStop(1, '#00f0ff');
  ctx.fillStyle = shieldGrad;
  ctx.fillRect(21, 53, Math.max(0, shieldFillW - 2), barH - 2);

  // 2. HEALTH BAR (Main bottom bar, segmented)
  const hpRatio = Math.max(0, Math.min(1, state.health / state.maxHealth));
  let hpColor = '#10b981'; // Green/Cyan
  if (hpRatio < 0.3) {
    hpColor = '#ef4444'; // Critical Red
  } else if (hpRatio < 0.6) {
    hpColor = '#f59e0b'; // Amber Warning
  }

  ctx.fillStyle = hpColor;
  ctx.font = '700 14px Orbitron, sans-serif';
  ctx.fillText(`HEALTH [${Math.round(state.health)}%]`, 20, 84);

  // Segmented health bar (20 segments)
  const segments = 20;
  const segGap = 3;
  const totalSegW = barW;
  const segW = (totalSegW - (segments - 1) * segGap) / segments;
  const activeSegments = Math.round(hpRatio * segments);

  for (let i = 0; i < segments; i++) {
    const sx = 20 + i * (segW + segGap);
    const sy = 90;
    const isLit = i < activeSegments;

    if (isLit) {
      ctx.fillStyle = hpColor;
      if (hpRatio < 0.3 && Math.floor(timeMs * 0.008) % 2 === 0) {
        ctx.fillStyle = '#ffffff'; // blinking critical effect
      }
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    }

    ctx.fillRect(sx, sy, segW, 16);
  }

  // Armor & Bio-stabilizer footnote
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
  ctx.font = '500 11px Rajdhani, monospace';
  ctx.fillText(`ARMOR RATING: MK-VII NANO-WEAVE // STATUS: STABLE`, 20, 122);

  ctx.restore();
}

/**
 * BOTTOM-RIGHT: Fictional Ammo Counter & Weapon Specs
 */
function drawBottomRightAmmo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: HudTheme,
  state: HudDrawState,
  timeMs: number
): void {
  const [r, g, b] = theme.primaryRgb;

  ctx.save();
  ctx.translate(x, y);

  const containerW = 400;
  const containerH = 130;

  // Background panel with angled sci-fi corner (mirrored)
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-containerW + 35, 0);
  ctx.lineTo(-containerW, 35);
  ctx.lineTo(-containerW, containerH);
  ctx.lineTo(-35, containerH);
  ctx.lineTo(0, containerH - 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Weapon designation
  ctx.fillStyle = theme.accent;
  ctx.font = '700 14px Orbitron, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(state.weaponName.toUpperCase(), -20, 26);

  // Fire Mode Badge
  const modeText = `MODE: ${state.fireMode.toUpperCase()}`;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
  ctx.font = '600 12px Orbitron, sans-serif';
  ctx.fillText(modeText, -20, 44);

  // Big Main Ammo Numbers
  const ammoRatio = state.ammo / state.maxAmmo;
  let ammoColor = '#ffffff';
  if (state.ammo === 0) {
    ammoColor = '#ef4444';
  } else if (ammoRatio < 0.25) {
    ammoColor = '#f59e0b';
  }

  if (state.isReloading) {
    // Reload animation
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 32px Orbitron, sans-serif';
    ctx.textAlign = 'right';
    const dots = '.'.repeat((Math.floor(timeMs * 0.005) % 4) + 1);
    ctx.fillText(`RELOADING${dots}`, -20, 88);

    // Reload progress bar
    const rProgW = 220;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-240, 100, rProgW, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-240, 100, rProgW * state.reloadProgress, 8);
  } else {
    // Ammo Count Display
    ctx.fillStyle = ammoColor;
    ctx.font = '900 50px Orbitron, sans-serif';
    ctx.textAlign = 'right';
    const ammoStr = state.ammo.toString().padStart(2, '0');
    ctx.fillText(ammoStr, -110, 92);

    // Slash and max ammo
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
    ctx.font = '700 24px Orbitron, sans-serif';
    ctx.fillText(`/${state.maxAmmo}`, -50, 86);

    // Reserve ammo
    ctx.fillStyle = `rgba(255, 255, 255, 0.75)`;
    ctx.font = '600 14px Rajdhani, monospace';
    ctx.fillText(`RES: ${state.reserveAmmo}`, -20, 75);

    // Individual ammo rounds visual strip (vertical bullets or ticks)
    const tickCount = Math.min(24, state.maxAmmo);
    const activeTicks = Math.round((state.ammo / state.maxAmmo) * tickCount);
    const tickW = 5;
    const tickGap = 3;
    const startX = -20 - tickCount * (tickW + tickGap);

    for (let t = 0; t < tickCount; t++) {
      const tx = startX + t * (tickW + tickGap);
      ctx.fillStyle = t < activeTicks ? (ammoRatio < 0.25 ? '#f59e0b' : theme.primary) : 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(tx, 102, tickW, 8);
    }
  }

  // Thermal Heat Gauge (fills when firing rapidly)
  const heatRatio = Math.max(0, Math.min(1, state.heat / 100));
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
  ctx.font = '500 11px Rajdhani, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`HEAT: ${Math.round(state.heat)}%`, -containerW + 20, 118);

  // Heat mini-bar
  const heatBarW = 90;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(-containerW + 80, 110, heatBarW, 6);
  ctx.fillStyle = heatRatio > 0.8 ? '#ef4444' : (heatRatio > 0.5 ? '#f59e0b' : theme.primary);
  ctx.fillRect(-containerW + 80, 110, heatBarW * heatRatio, 6);

  ctx.restore();
}
