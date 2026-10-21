/**
 * HudControlPanel.tsx - Quick tactical controls & Meta Quest 3 WebXR AR Launcher
 */
import React, { useState } from 'react';
import {
  Glasses,
  Camera,
  Crosshair,
  RotateCcw,
  Heart,
  Shield,
  Palette,
  Volume2,
  VolumeX,
  Sliders,
  HelpCircle,
  X,
  Maximize2,
  Activity
} from 'lucide-react';
import { HUD_THEMES, HudTheme } from '../utils/hud-canvas';

interface HudControlPanelProps {
  onEnterAR: () => void;
  isInAR: boolean;
  onFire: () => void;
  onReload: () => void;
  onTakeDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onToggleMode: () => void;
  fireMode: string;
  themeKey: string;
  onSelectTheme: (key: string) => void;
  bgMode: 'quest-ar' | 'webcam' | 'matrix' | 'deck' | 'none';
  onSelectBgMode: (mode: 'quest-ar' | 'webcam' | 'matrix' | 'deck' | 'none') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hudDistance: number;
  onSetHudDistance: (dist: number) => void;
  hudScale: number;
  onSetHudScale: (scale: number) => void;
  show3DAnchors: boolean;
  onToggle3DAnchors: () => void;
  webcamActive: boolean;
  onToggleWebcam: () => void;
}

export const HudControlPanel: React.FC<HudControlPanelProps> = ({
  onEnterAR,
  isInAR,
  onFire,
  onReload,
  onTakeDamage,
  onHeal,
  onToggleMode,
  fireMode,
  themeKey,
  onSelectTheme,
  bgMode,
  onSelectBgMode,
  soundEnabled,
  onToggleSound,
  hudDistance,
  onSetHudDistance,
  hudScale,
  onSetHudScale,
  show3DAnchors,
  onToggle3DAnchors,
  webcamActive,
  onToggleWebcam
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      {/* Floating Top-Center Action Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        {/* Main Quest 3 AR Button */}
        <button
          onClick={onEnterAR}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-['Orbitron'] font-bold text-xs rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all active:scale-95"
          title="Launch Quest 3 Passthrough AR"
        >
          <Glasses className="w-4 h-4" />
          <span>{isInAR ? 'IN QUEST AR' : 'ENTER QUEST PASSTHROUGH AR'}</span>
        </button>

        {/* Quick Webcam Simulation Button */}
        <button
          onClick={onToggleWebcam}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-full border transition-all ${
            bgMode === 'webcam'
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
              : 'border-slate-700 hover:border-cyan-500/50 text-slate-300'
          }`}
          title="Toggle Webcam feed for testing passthrough on desktop/phone"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Webcam Passthrough</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="p-1.5 text-slate-300 hover:text-cyan-400 rounded-full hover:bg-slate-800 transition-colors"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* HUD Settings drawer toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1.5 rounded-full transition-colors ${
            isOpen ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
          }`}
          title="HUD & Tactical Controls"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Quest 3 Guide toggle */}
        <button
          onClick={() => setShowGuide(true)}
          className="p-1.5 text-slate-300 hover:text-cyan-400 rounded-full hover:bg-slate-800 transition-colors"
          title="Meta Quest 3 Passthrough Setup Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Slide-out HUD & Diagnostics Settings Drawer */}
      {isOpen && (
        <div className="fixed top-20 right-4 z-30 w-80 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-lg p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] font-['Rajdhani',sans-serif] text-slate-200 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-['Orbitron'] text-xs font-bold tracking-wider text-white">
                TACTICAL HUD CONTROLS
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Simulation Tests */}
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[11px] font-['Orbitron'] font-bold text-cyan-400 tracking-wider block mb-2">
                WEAPON & COMBAT SIMULATOR
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onFire}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 rounded text-xs font-['Orbitron'] text-cyan-200 active:scale-95 transition-all"
                >
                  <Crosshair className="w-3.5 h-3.5" /> Fire [Space]
                </button>
                <button
                  onClick={onReload}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-950 hover:bg-amber-900 border border-amber-500/40 rounded text-xs font-['Orbitron'] text-amber-200 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reload [R]
                </button>
              </div>
            </div>

            {/* Health & Shield Tester */}
            <div>
              <label className="text-[11px] font-['Orbitron'] font-bold text-cyan-400 tracking-wider block mb-2">
                DAMAGE & VITALITY TEST
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onTakeDamage(25)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 rounded text-xs font-mono text-red-300 active:scale-95"
                >
                  -25 Damage [H]
                </button>
                <button
                  onClick={() => onHeal(30)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded text-xs font-mono text-emerald-300 active:scale-95"
                >
                  <Heart className="w-3 h-3" /> +30 Heal [M]
                </button>
              </div>
            </div>

            {/* Visor Color Themes */}
            <div>
              <label className="text-[11px] font-['Orbitron'] font-bold text-cyan-400 tracking-wider block mb-2">
                VISOR PALETTE
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(HUD_THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => onSelectTheme(key)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-mono transition-all ${
                      themeKey === key
                        ? 'border-cyan-400 bg-cyan-950 text-white'
                        : 'border-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primary }} />
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Passthrough Simulation Background */}
            <div>
              <label className="text-[11px] font-['Orbitron'] font-bold text-cyan-400 tracking-wider block mb-2">
                PASSTHROUGH BACKGROUND (DESKTOP)
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => onSelectBgMode('webcam')}
                  className={`py-1 px-2 rounded border text-center ${
                    bgMode === 'webcam' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Live Webcam
                </button>
                <button
                  onClick={() => onSelectBgMode('matrix')}
                  className={`py-1 px-2 rounded border text-center ${
                    bgMode === 'matrix' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Cyber Grid
                </button>
                <button
                  onClick={() => onSelectBgMode('deck')}
                  className={`py-1 px-2 rounded border text-center ${
                    bgMode === 'deck' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Sci-Fi Deck
                </button>
                <button
                  onClick={() => onSelectBgMode('quest-ar')}
                  className={`py-1 px-2 rounded border text-center ${
                    bgMode === 'quest-ar' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Quest 3 AR (Clean)
                </button>
              </div>
            </div>

            {/* HUD Distance & Scale */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span>Headlock Distance:</span>
                <span className="text-cyan-400">{hudDistance.toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={hudDistance}
                onChange={(e) => onSetHudDistance(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />

              <div className="flex justify-between text-xs font-mono pt-1">
                <span>Visor Scale:</span>
                <span className="text-cyan-400">{hudScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.3"
                step="0.05"
                value={hudScale}
                onChange={(e) => onSetHudScale(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Spatial Anchors Toggle */}
            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
              <span>Show 3D World Anchors</span>
              <button
                onClick={onToggle3DAnchors}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  show3DAnchors ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    show3DAnchors ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meta Quest 3 Passthrough AR Instructions Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] font-['Rajdhani',sans-serif]">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Glasses className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="font-['Orbitron'] text-base font-bold text-white">
                    META QUEST 3 PASSTHROUGH AR SETUP
                  </h2>
                  <p className="text-xs text-cyan-300 font-mono">WebXR Immersive-AR Head-Locked Visor</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-slate-300 leading-relaxed">
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg">
                <div className="font-['Orbitron'] font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  HOW IT WORKS ON QUEST 3:
                </div>
                Meta Quest 3 features high-resolution stereo full-color passthrough cameras. When you launch WebXR in AR mode, the browser makes the 3D scene background 100% transparent, displaying the real physical world directly behind your video game HUD!
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>
                  <strong className="text-white">Open Meta Quest Browser</strong> inside your Meta Quest 3 headset.
                </li>
                <li>
                  Navigate to this application URL.
                </li>
                <li>
                  Click the <strong className="text-cyan-400">"ENTER QUEST PASSTHROUGH AR"</strong> button at the top (or standard WebXR AR prompt).
                </li>
                <li>
                  Allow spatial/camera permissions if prompted by Horizon OS.
                </li>
                <li>
                  The holographic HUD will instantly lock to your head orientation:
                  <ul className="list-disc list-inside ml-4 mt-1 text-slate-400 space-y-0.5">
                    <li>Top-Left: <span className="text-cyan-300">Ashen (Sierra-07)</span></li>
                    <li>Bottom-Left: <span className="text-emerald-300">Segmented Health & Shield Bar</span></li>
                    <li>Bottom-Right: <span className="text-amber-300">ARC-9 Proton Ammo Counter</span></li>
                    <li>Center: <span className="text-cyan-300">Dynamic Crosshair & 360° Compass</span></li>
                  </ul>
                </li>
                <li>
                  <strong className="text-white">Quest Touch Controller Controls:</strong>
                  <div className="mt-1 text-slate-400">
                    • Right/Left Index Trigger: <span className="text-white">Fire weapon</span><br />
                    • Grip Button: <span className="text-white">Reload magazine</span><br />
                    • A or X Button: <span className="text-white">Cycle Fire Mode (Auto / Burst / Overcharge)</span>
                  </div>
                </li>
              </ol>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-['Orbitron'] text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowGuide(false);
                    onEnterAR();
                  }}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded font-['Orbitron'] text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                >
                  Enter Passthrough AR Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
