/**
 * DomHudOverlay.tsx - Crisp Vector / DOM Overlay for WebXR & Screen Preview
 * Displays the futuristic video game HUD with 'Ashen (Sierra-07)', Health Bar, and Ammo Counter.
 */
import React from 'react';
import { HudDrawState, HUD_THEMES } from '../utils/hud-canvas';
import { Shield, Zap, AlertTriangle, Compass, Crosshair } from 'lucide-react';

interface DomHudOverlayProps {
  hudState: HudDrawState;
  onFire: () => void;
  onReload: () => void;
  onToggleMode: () => void;
  isXrActive: boolean;
}

export const DomHudOverlay: React.FC<DomHudOverlayProps> = ({
  hudState,
  onFire,
  onReload,
  onToggleMode,
  isXrActive
}) => {
  const theme = HUD_THEMES[hudState.themeKey] || HUD_THEMES.cyan;
  const hpRatio = Math.max(0, Math.min(1, hudState.health / hudState.maxHealth));
  const shieldRatio = Math.max(0, Math.min(1, hudState.shield / hudState.maxShield));
  const ammoRatio = hudState.ammo / hudState.maxAmmo;

  // Determine health color
  let hpColorClass = 'bg-emerald-400 text-emerald-400 border-emerald-500';
  if (hpRatio < 0.3) {
    hpColorClass = 'bg-red-500 text-red-500 border-red-500 animate-pulse';
  } else if (hpRatio < 0.6) {
    hpColorClass = 'bg-amber-400 text-amber-400 border-amber-500';
  }

  return (
    <div
      id="xr-overlay-container"
      className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 md:p-8 font-['Rajdhani',sans-serif]"
    >
      {/* Outer Tactical Visor Corners */}
      <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 pointer-events-none opacity-40" style={{ borderColor: theme.primary }} />
      <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 pointer-events-none opacity-40" style={{ borderColor: theme.primary }} />
      <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 pointer-events-none opacity-40" style={{ borderColor: theme.primary }} />
      <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 pointer-events-none opacity-40" style={{ borderColor: theme.primary }} />

      {/* Critical damage full screen pulse */}
      {hudState.health < 30 && (
        <div className="absolute inset-0 border-4 border-red-500/50 pointer-events-none animate-pulse bg-red-950/10" />
      )}

      {/* TOP ROW */}
      <div className="flex items-start justify-between w-full relative">
        {/* TOP-LEFT: Ashen (Sierra-07) Callsign & Operative Stats */}
        <div
          className="relative bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 p-3.5 rounded-sm shadow-[0_0_15px_rgba(0,240,255,0.15)] max-w-sm pointer-events-auto"
          style={{ borderColor: `${theme.primary}66` }}
        >
          {/* Top chamfer accent */}
          <div
            className="absolute top-0 right-0 w-4 h-4 bg-transparent border-t-2 border-r-2"
            style={{ borderColor: theme.primary }}
          />

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-ping bg-cyan-400" style={{ backgroundColor: theme.primary }} />
            <span className="font-['Orbitron'] text-[10px] tracking-widest uppercase opacity-75" style={{ color: theme.accent }}>
              TACTICAL HUD // MK-VII
            </span>
            <span className="text-[10px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30 font-mono text-cyan-300">
              SYS-OK
            </span>
          </div>

          {/* Nickname: Ashen (Sierra-07) */}
          <h1 className="font-['Orbitron'] text-xl md:text-2xl font-black tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] flex items-center gap-2">
            Ashen (Sierra-07)
          </h1>

          <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs font-mono opacity-80" style={{ color: theme.primary }}>
            <span>SR-07-9941</span>
            <span>•</span>
            <span>PASSTHROUGH AR</span>
            <span>•</span>
            <span className="text-white/90">Q3 COMPLIANT</span>
          </div>

          <div className="mt-2 pt-2 border-t border-cyan-500/20 text-[11px] font-mono text-slate-300 flex justify-between">
            <span>GRID: 47-E // LAT 37.77</span>
            <span className="text-cyan-400">SYNC 99.8%</span>
          </div>
        </div>

        {/* TOP-CENTER: 360-degree Compass */}
        <div className="hidden sm:flex flex-col items-center pointer-events-none">
          <div
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-950/80 backdrop-blur-md border rounded text-xs font-['Orbitron'] font-bold tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ borderColor: `${theme.primary}55`, color: theme.primary }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{Math.round(hudState.cameraYaw).toString().padStart(3, '0')}° HEADING</span>
            <span className="text-white/60">
              {hudState.cameraYaw >= 337.5 || hudState.cameraYaw < 22.5
                ? 'NORTH'
                : hudState.cameraYaw < 67.5
                ? 'NORTH-EAST'
                : hudState.cameraYaw < 112.5
                ? 'EAST'
                : hudState.cameraYaw < 157.5
                ? 'SOUTH-EAST'
                : hudState.cameraYaw < 202.5
                ? 'SOUTH'
                : hudState.cameraYaw < 247.5
                ? 'SOUTH-WEST'
                : hudState.cameraYaw < 292.5
                ? 'WEST'
                : 'NORTH-WEST'}
            </span>
          </div>
          {hudState.health < 30 && (
            <div className="mt-2 text-xs font-['Orbitron'] text-red-400 font-bold tracking-widest animate-bounce flex items-center gap-1 bg-red-950/80 px-2 py-0.5 border border-red-500/60 rounded">
              <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL DAMAGE DETECTED
            </div>
          )}
        </div>

        {/* TOP-RIGHT: Helmet Telemetry & Meta Quest 3 Status */}
        <div
          className="relative bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 p-3 rounded-sm shadow-[0_0_15px_rgba(0,240,255,0.15)] text-right max-w-[260px] pointer-events-auto"
          style={{ borderColor: `${theme.primary}66` }}
        >
          <div className="font-['Orbitron'] text-[10px] tracking-widest uppercase opacity-80" style={{ color: theme.accent }}>
            QUEST 3 PASSTHROUGH
          </div>
          <div className="text-xs font-bold text-white tracking-wider font-mono">
            STEREO RGB FEED
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-300 flex justify-end gap-2">
            <span>FPS: 120</span>
            <span>•</span>
            <span>LAT: 4.2ms</span>
            <span>•</span>
            <span className="text-emerald-400">6-DOF</span>
          </div>
          <div className="mt-1 text-[11px] font-mono opacity-70" style={{ color: theme.primary }}>
            BATTERY: 94% // CORE: 36.8°C
          </div>
        </div>
      </div>

      {/* CENTER: Dynamic Tactical Reticle (Visible on screen preview) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`relative flex items-center justify-center transition-all duration-75 ${
            hudState.isFiring ? 'scale-125' : 'scale-100'
          }`}
          style={{ width: 120, height: 120 }}
        >
          {/* Subtle Outer Ring */}
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-40 animate-[spin_30s_linear_infinite]"
            style={{ borderColor: theme.primary }}
          />
          {/* Center Point */}
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              hudState.isFiring ? 'bg-white shadow-[0_0_8px_white]' : 'shadow-[0_0_6px_cyan]'
            }`}
            style={{ backgroundColor: hudState.isFiring ? '#ffffff' : theme.primary }}
          />

          {/* Crosshair Ticks */}
          <div className="absolute -top-3 w-0.5 h-3" style={{ backgroundColor: theme.primary }} />
          <div className="absolute -bottom-3 w-0.5 h-3" style={{ backgroundColor: theme.primary }} />
          <div className="absolute -left-3 w-3 h-0.5" style={{ backgroundColor: theme.primary }} />
          <div className="absolute -right-3 w-3 h-0.5" style={{ backgroundColor: theme.primary }} />

          {/* Range readout */}
          <div
            className="absolute -bottom-8 font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30"
            style={{ color: theme.primary }}
          >
            {hudState.targetDistance.toFixed(1)}m LOCKED
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex items-end justify-between w-full relative">
        {/* BOTTOM-LEFT: Health & Shield Bar Cluster */}
        <div
          className="relative bg-slate-950/85 backdrop-blur-md border p-4 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.6)] min-w-[280px] sm:min-w-[340px] pointer-events-auto"
          style={{ borderColor: `${theme.primary}66` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" style={{ color: theme.primary }} />
              <span className="font-['Orbitron'] text-xs font-bold tracking-widest text-white">
                VITAL INTEGRITY
              </span>
            </div>
            <span className="font-mono text-xs text-slate-300">
              MK-VII SUIT
            </span>
          </div>

          {/* Shield Bar */}
          <div className="mb-2.5">
            <div className="flex justify-between text-[11px] font-mono text-cyan-300 mb-0.5">
              <span>KINETIC SHIELD</span>
              <span>{Math.round(hudState.shield)} / {hudState.maxShield}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 border border-cyan-500/40 rounded-xs overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-200"
                style={{ width: `${shieldRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Health Bar (Segmented) */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-['Orbitron'] text-sm font-bold text-white">
                HEALTH
              </span>
              <span className={`font-['Orbitron'] text-sm font-black ${hpRatio < 0.3 ? 'text-red-400' : 'text-emerald-400'}`}>
                {Math.round(hudState.health)}%
              </span>
            </div>

            {/* 20 Segmented Health Blocks */}
            <div className="grid grid-cols-20 gap-1 h-3.5">
              {Array.from({ length: 20 }).map((_, i) => {
                const isLit = i < Math.round(hpRatio * 20);
                return (
                  <div
                    key={i}
                    className={`h-full rounded-xs transition-all duration-150 ${
                      isLit
                        ? hpRatio < 0.3
                          ? 'bg-red-500 shadow-[0_0_4px_red]'
                          : hpRatio < 0.6
                          ? 'bg-amber-400'
                          : 'bg-emerald-400 shadow-[0_0_4px_#10b981]'
                        : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex justify-between text-[10px] font-mono opacity-70" style={{ color: theme.primary }}>
            <span>ARMOR STATUS: OPTIMAL</span>
            <span>BIO-MONITOR: ACTIVE</span>
          </div>
        </div>

        {/* BOTTOM-RIGHT: Fictional Ammo Counter */}
        <div
          className="relative bg-slate-950/85 backdrop-blur-md border p-4 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.6)] min-w-[280px] sm:min-w-[340px] text-right pointer-events-auto"
          style={{ borderColor: `${theme.primary}66` }}
        >
          {/* Header & Fire Mode */}
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onToggleMode}
              className="text-[10px] font-['Orbitron'] font-bold px-2 py-0.5 rounded border uppercase transition-colors hover:bg-cyan-500/20 active:scale-95"
              style={{ borderColor: `${theme.primary}88`, color: theme.primary }}
              title="Click to toggle Fire Mode"
            >
              MODE: {hudState.fireMode}
            </button>
            <span className="font-['Orbitron'] text-xs font-bold tracking-wider text-white">
              {hudState.weaponName}
            </span>
          </div>

          {/* Ammo Numbers or Reloading State */}
          {hudState.isReloading ? (
            <div className="my-1.5 py-1 text-center bg-amber-500/10 border border-amber-500/40 rounded">
              <div className="font-['Orbitron'] text-xl font-black text-amber-400 tracking-widest animate-pulse">
                RELOADING...
              </div>
              <div className="w-48 mx-auto h-1.5 bg-black/60 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${hudState.reloadProgress * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-end gap-2 my-1">
              <span
                className={`font-['Orbitron'] text-4xl sm:text-5xl font-black tracking-tight ${
                  hudState.ammo === 0
                    ? 'text-red-500 animate-pulse'
                    : ammoRatio < 0.25
                    ? 'text-amber-400'
                    : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                }`}
              >
                {hudState.ammo.toString().padStart(2, '0')}
              </span>
              <span className="font-['Orbitron'] text-2xl font-bold opacity-50 text-cyan-300">
                / {hudState.maxAmmo}
              </span>
              <span className="font-mono text-xs opacity-75 text-white ml-2">
                RES: {hudState.reserveAmmo}
              </span>
            </div>
          )}

          {/* Ammo Bullets Strip */}
          <div className="flex justify-end gap-1 my-1.5">
            {Array.from({ length: Math.min(24, hudState.maxAmmo) }).map((_, idx) => {
              const isFilled = idx < Math.round((hudState.ammo / hudState.maxAmmo) * Math.min(24, hudState.maxAmmo));
              return (
                <div
                  key={idx}
                  className={`w-1 h-3 rounded-xs transition-colors ${
                    isFilled
                      ? ammoRatio < 0.25
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                      : 'bg-white/10'
                  }`}
                  style={{ backgroundColor: isFilled ? (ammoRatio < 0.25 ? '#f59e0b' : theme.primary) : undefined }}
                />
              );
            })}
          </div>

          {/* Weapon Heat & Interactive Trigger Hint */}
          <div className="mt-2 pt-2 border-t border-cyan-500/20 flex justify-between items-center text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="opacity-70 text-slate-300">HEAT: {Math.round(hudState.heat)}%</span>
              <div className="w-12 h-1.5 bg-black/50 border border-slate-700 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-100"
                  style={{ width: `${Math.min(100, hudState.heat)}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onFire}
                className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-200 rounded font-['Orbitron'] text-[10px] tracking-wide active:scale-95"
              >
                FIRE [SPACE]
              </button>
              <button
                onClick={onReload}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 text-amber-200 rounded font-['Orbitron'] text-[10px] tracking-wide active:scale-95"
              >
                RELOAD [R]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
