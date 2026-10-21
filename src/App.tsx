/**
 * Sierra-07: Meta Quest 3 WebXR Passthrough HUD Application
 * Built with A-Frame WebXR, React, and Tailwind CSS.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AFrameScene } from './components/AFrameScene';
import { DomHudOverlay } from './components/DomHudOverlay';
import { HudControlPanel } from './components/HudControlPanel';
import { HudDrawState } from './utils/hud-canvas';
import {
  playLaserFire,
  playEmptyDry,
  playReload,
  playDamage,
  playHeal,
  playVisorBoot
} from './utils/audio';

export default function App() {
  // HUD Tactical State
  const [hudState, setHudState] = useState<HudDrawState>({
    health: 100,
    maxHealth: 100,
    shield: 120,
    maxShield: 150,
    ammo: 42,
    maxAmmo: 42,
    reserveAmmo: 336,
    weaponName: 'ARC-9 PROTON CARBINE',
    fireMode: 'auto',
    isReloading: false,
    reloadProgress: 0,
    heat: 15,
    recoil: 0,
    cameraYaw: 45,
    themeKey: 'cyan',
    targetDistance: 14.8,
    isFiring: false,
    visorScanline: true
  });

  // Passthrough & Scene Configurations
  const [bgMode, setBgMode] = useState<'quest-ar' | 'webcam' | 'matrix' | 'deck' | 'none'>('quest-ar');
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hudDistance, setHudDistance] = useState<number>(0.85); // 85cm is optimal in Quest 3
  const [hudScale, setHudScale] = useState<number>(1.0);
  const [show3DAnchors, setShow3DAnchors] = useState<boolean>(false);
  const [isInAR, setIsInAR] = useState<boolean>(false);

  // Timers and references
  const lastDamageTimeRef = useRef<number>(Date.now());
  const reloadTimerRef = useRef<number | null>(null);

  // Play visor boot sound on first interaction
  useEffect(() => {
    const handleFirstGesture = () => {
      if (soundEnabled) {
        playVisorBoot();
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [soundEnabled]);

  // Listen to WebXR events dispatched by A-Frame
  useEffect(() => {
    const onXrStart = (e: any) => {
      setIsInAR(true);
      setBgMode('quest-ar'); // Use clean transparent background for Quest 3 hardware passthrough
    };

    const onXrEnd = () => {
      setIsInAR(false);
    };

    window.addEventListener('quest-xr-session-start', onXrStart);
    window.addEventListener('quest-xr-session-end', onXrEnd);

    return () => {
      window.removeEventListener('quest-xr-session-start', onXrStart);
      window.removeEventListener('quest-xr-session-end', onXrEnd);
    };
  }, []);

  // Continuous loop for recoil decay, heat dissipation, distance oscillation, and shield recharge
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setHudState((prev) => {
        let newRecoil = prev.recoil > 0 ? Math.max(0, prev.recoil - 0.12) : 0;
        let newHeat = prev.heat > 0 ? Math.max(0, prev.heat - 0.7) : 0;
        let newIsFiring = prev.isFiring ? false : false;

        // Camera yaw sync from A-Frame component
        let newYaw = prev.cameraYaw;
        if (window.__SIERRA_HUD_STATE__?.cameraYaw !== undefined) {
          newYaw = window.__SIERRA_HUD_STATE__.cameraYaw;
        }

        // Target distance slight drift
        const targetDist = 14.8 + 0.3 * Math.sin(now * 0.001);

        // Passive shield recharge after 4 seconds of no damage
        let newShield = prev.shield;
        if (now - lastDamageTimeRef.current > 4000 && prev.shield < prev.maxShield) {
          newShield = Math.min(prev.maxShield, prev.shield + 0.5);
        }

        return {
          ...prev,
          recoil: newRecoil,
          heat: newHeat,
          isFiring: newIsFiring,
          cameraYaw: newYaw,
          targetDistance: targetDist,
          shield: newShield
        };
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // WEAPON FIRE LOGIC
  const handleFire = useCallback(() => {
    setHudState((prev) => {
      if (prev.isReloading) return prev;

      if (prev.ammo <= 0) {
        if (soundEnabled) playEmptyDry();
        return prev;
      }

      // Ammo consumption based on fire mode
      const shots = prev.fireMode === 'burst' ? Math.min(3, prev.ammo) : 1;
      const newAmmo = Math.max(0, prev.ammo - shots);
      const addedHeat = prev.fireMode === 'overcharge' ? 22 : (prev.fireMode === 'burst' ? 14 : 6);
      const newHeat = Math.min(100, prev.heat + addedHeat);

      if (soundEnabled) {
        playLaserFire(prev.fireMode);
      }

      return {
        ...prev,
        ammo: newAmmo,
        heat: newHeat,
        recoil: 1.0,
        isFiring: true
      };
    });
  }, [soundEnabled]);

  // WEAPON RELOAD LOGIC
  const handleReload = useCallback(() => {
    setHudState((prev) => {
      if (prev.isReloading || prev.ammo === prev.maxAmmo || prev.reserveAmmo <= 0) {
        return prev;
      }

      if (soundEnabled) {
        playReload();
      }

      // Start reload animation loop
      let step = 0;
      const totalSteps = 20;

      if (reloadTimerRef.current) clearInterval(reloadTimerRef.current);

      reloadTimerRef.current = window.setInterval(() => {
        step++;
        const progress = Math.min(1, step / totalSteps);

        if (step >= totalSteps) {
          clearInterval(reloadTimerRef.current!);
          reloadTimerRef.current = null;

          setHudState((curr) => {
            const needed = curr.maxAmmo - curr.ammo;
            const take = Math.min(needed, curr.reserveAmmo);
            return {
              ...curr,
              ammo: curr.ammo + take,
              reserveAmmo: curr.reserveAmmo - take,
              isReloading: false,
              reloadProgress: 0,
              heat: Math.max(0, curr.heat - 30) // reload cools weapon
            };
          });
        } else {
          setHudState((curr) => ({
            ...curr,
            reloadProgress: progress
          }));
        }
      }, 50);

      return {
        ...prev,
        isReloading: true,
        reloadProgress: 0
      };
    });
  }, [soundEnabled]);

  // DAMAGE TEST
  const handleTakeDamage = useCallback((amount: number) => {
    lastDamageTimeRef.current = Date.now();
    if (soundEnabled) playDamage();

    setHudState((prev) => {
      let remaining = amount;
      let newShield = prev.shield;
      let newHealth = prev.health;

      // Shield absorbs damage first
      if (newShield > 0) {
        if (newShield >= remaining) {
          newShield -= remaining;
          remaining = 0;
        } else {
          remaining -= newShield;
          newShield = 0;
        }
      }

      if (remaining > 0) {
        newHealth = Math.max(0, newHealth - remaining);
      }

      return {
        ...prev,
        shield: newShield,
        health: newHealth,
        recoil: 0.8
      };
    });
  }, [soundEnabled]);

  // HEAL RESTORE
  const handleHeal = useCallback((amount: number) => {
    if (soundEnabled) playHeal();
    setHudState((prev) => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + amount),
      shield: Math.min(prev.maxShield, prev.shield + 20)
    }));
  }, [soundEnabled]);

  // FIRE MODE CYCLE
  const handleToggleMode = useCallback(() => {
    setHudState((prev) => {
      const modes: ('auto' | 'burst' | 'overcharge')[] = ['auto', 'burst', 'overcharge'];
      const nextIndex = (modes.indexOf(prev.fireMode) + 1) % modes.length;
      return {
        ...prev,
        fireMode: modes[nextIndex]
      };
    });
  }, []);

  // VISOR THEME CYCLE / SELECTION
  const handleSelectTheme = useCallback((key: string) => {
    setHudState((prev) => ({
      ...prev,
      themeKey: key as any
    }));
  }, []);

  // TOGGLE WEBCAM FEED (For desktop/phone passthrough testing)
  const handleToggleWebcam = useCallback(async () => {
    if (bgMode === 'webcam') {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
        setWebcamStream(null);
      }
      setBgMode('quest-ar');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        setWebcamStream(stream);
        setBgMode('webcam');
      } catch (err) {
        console.warn('Webcam access was denied or unavailable:', err);
        alert('Webcam permission is required to simulate passthrough on this device.');
      }
    }
  }, [bgMode, webcamStream]);

  // LAUNCH META QUEST 3 WEBXR PASSTHROUGH AR
  const handleEnterAR = useCallback(() => {
    const sceneEl = document.querySelector('a-scene') as any;
    if (sceneEl) {
      if (sceneEl.enterVR) {
        sceneEl.enterVR();
      } else if (typeof navigator !== 'undefined' && (navigator as any).xr) {
        (navigator as any).xr
          .requestSession('immersive-ar', {
            optionalFeatures: ['local-floor', 'hit-test', 'dom-overlay', 'unbounded'],
            domOverlay: { root: document.getElementById('xr-overlay-container') as Element }
          })
          .then((session: any) => {
            if (sceneEl.renderer && sceneEl.renderer.xr) {
              sceneEl.renderer.xr.setSession(session);
            }
          })
          .catch((err: any) => {
            console.warn('Native AR session request fallback:', err);
            sceneEl.enterVR();
          });
      }
    }
  }, []);

  // KEYBOARD SHORTCUTS (Space = Fire, R = Reload, H = Damage, M = Heal, T = Theme, B = Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if user is in an input
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFire();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReload();
      } else if (e.code === 'KeyH') {
        handleTakeDamage(25);
      } else if (e.code === 'KeyM') {
        handleHeal(30);
      } else if (e.code === 'KeyT') {
        const themes = ['cyan', 'amber', 'emerald', 'crimson'];
        const next = themes[(themes.indexOf(hudState.themeKey) + 1) % themes.length];
        handleSelectTheme(next);
      } else if (e.code === 'KeyB') {
        handleToggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFire, handleReload, handleTakeDamage, handleHeal, hudState.themeKey, handleSelectTheme, handleToggleMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Primary A-Frame Scene with Head-Locked Camera Rig & Quest Passthrough */}
      <AFrameScene
        hudState={hudState}
        onFire={handleFire}
        onReload={handleReload}
        onToggleMode={handleToggleMode}
        bgMode={bgMode}
        webcamStream={webcamStream}
        hudDistance={hudDistance}
        hudScale={hudScale}
        show3DAnchors={show3DAnchors}
        onEnterAR={handleEnterAR}
        isInAR={isInAR}
      />

      {/* Synchronized Vector DOM Overlay (Acts as XR dom-overlay and desktop HUD) */}
      <DomHudOverlay
        hudState={hudState}
        onFire={handleFire}
        onReload={handleReload}
        onToggleMode={handleToggleMode}
        isXrActive={isInAR}
      />

      {/* Top Floating Action Bar & Settings Drawer */}
      <HudControlPanel
        onEnterAR={handleEnterAR}
        isInAR={isInAR}
        onFire={handleFire}
        onReload={handleReload}
        onTakeDamage={handleTakeDamage}
        onHeal={handleHeal}
        onToggleMode={handleToggleMode}
        fireMode={hudState.fireMode}
        themeKey={hudState.themeKey}
        onSelectTheme={handleSelectTheme}
        bgMode={bgMode}
        onSelectBgMode={setBgMode}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        hudDistance={hudDistance}
        onSetHudDistance={setHudDistance}
        hudScale={hudScale}
        onSetHudScale={setHudScale}
        show3DAnchors={show3DAnchors}
        onToggle3DAnchors={() => setShow3DAnchors(!show3DAnchors)}
        webcamActive={bgMode === 'webcam'}
        onToggleWebcam={handleToggleWebcam}
      />
    </div>
  );
}
