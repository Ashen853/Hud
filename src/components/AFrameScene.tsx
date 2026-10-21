/**
 * AFrameScene.tsx - Head-locked WebXR HUD for Meta Quest 3 Passthrough
 */
import React, { useEffect, useRef, useState } from 'react';
import { registerAframeComponents } from '../utils/aframe-components';
import { drawHudOnCanvas, HudDrawState, HUD_THEMES } from '../utils/hud-canvas';

interface AFrameSceneProps {
  hudState: HudDrawState;
  onFire: () => void;
  onReload: () => void;
  onToggleMode: () => void;
  bgMode: 'quest-ar' | 'webcam' | 'matrix' | 'deck' | 'none';
  webcamStream: MediaStream | null;
  hudDistance: number; // in meters (e.g. 0.85m)
  hudScale: number; // 0.8 to 1.4
  show3DAnchors: boolean;
  onEnterAR: () => void;
  isInAR: boolean;
}

export const AFrameScene: React.FC<AFrameSceneProps> = ({
  hudState,
  onFire,
  onReload,
  onToggleMode,
  bgMode,
  webcamStream,
  hudDistance,
  hudScale,
  show3DAnchors,
  onEnterAR,
  isInAR
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);
  const planeRef = useRef<HTMLElement | null>(null);
  const [aframeReady, setAframeReady] = useState(false);

  // Sync state to global window object for A-Frame components
  useEffect(() => {
    window.__SIERRA_HUD_STATE__ = {
      cameraYaw: hudState.cameraYaw,
      onFire,
      onReload,
      onToggleMode
    };
  }, [hudState.cameraYaw, onFire, onReload, onToggleMode]);

  // Register A-Frame custom components on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAframe = () => {
        if (window.AFRAME) {
          registerAframeComponents();
          setAframeReady(true);
        } else {
          setTimeout(checkAframe, 100);
        }
      };
      checkAframe();
    }
  }, []);

  // Bind webcam stream if active
  useEffect(() => {
    if (videoRef.current && webcamStream && bgMode === 'webcam') {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay webcam video blocked or failed:', err);
      });
    }
  }, [webcamStream, bgMode]);

  // Render loop to paint the head-locked HUD canvas and update Three.js texture
  useEffect(() => {
    let animId: number;

    const renderLoop = (timeMs: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Draw HUD elements (Ashen Sierra-07, Health, Ammo, Compass, Reticle)
        drawHudOnCanvas(canvas, hudState, timeMs);

        // Notify A-Frame Three.js material that texture updated
        if (planeRef.current) {
          const planeEl = planeRef.current as any;
          const mesh = planeEl.getObject3D?.('mesh');
          if (mesh && mesh.material && mesh.material.map) {
            mesh.material.map.needsUpdate = true;
          }
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [hudState]);

  const planeWidth = 1.7 * hudScale;
  const planeHeight = 0.85 * hudScale;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* 2D High-Resolution Canvas (2048x1024) used as the A-Frame texture */}
      <canvas
        ref={canvasRef}
        id="hud-canvas"
        width={2048}
        height={1024}
        className="hidden pointer-events-none"
      />

      {/* Desktop / Non-XR Webcam Passthrough Simulator Background */}
      {bgMode === 'webcam' && (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none filter contrast-105 brightness-95"
        />
      )}

      {/* Cyberpunk Holographic Matrix Grid Simulation */}
      {bgMode === 'matrix' && (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-zinc-950 to-black pointer-events-none">
          <div
            className="w-full h-full opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      )}

      {/* Sci-Fi Observation Deck Backdrop */}
      {bgMode === 'deck' && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#030712] via-[#0b1329] to-[#020617] pointer-events-none flex items-center justify-center">
          <div className="text-center opacity-30 text-cyan-400 font-mono text-sm tracking-widest">
            SIMULATED OBSERVATION ENVIRONMENT // 0.85 AU ORBIT
          </div>
        </div>
      )}

      {/* A-FRAME WEBXR SCENE */}
      {aframeReady ? (
        <a-scene
          ref={sceneRef}
          embedded
          vr-mode-ui="enabled: false"
          renderer="alpha: true; antialias: true; colorManagement: true; precision: high;"
          webxr="referenceSpaceType: local-floor; requiredFeatures: local-floor; optionalFeatures: hit-test, dom-overlay, unbounded; overlayElement: #xr-overlay-container;"
          quest-passthrough-init=""
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }}
        >
          {/* Lighting */}
          <a-light type="ambient" color="#334155" intensity="1.2"></a-light>
          <a-light type="directional" color="#00f0ff" intensity="0.8" position="1 2 1"></a-light>

          {/* HEAD CAMERA - HEAD-LOCKED RIG */}
          {/* In A-Frame, entities placed inside <a-camera> follow the user's view in 6-DOF */}
          <a-camera
            id="head-camera"
            position="0 1.6 0"
            look-controls="pointerLockEnabled: false"
            wasd-controls="enabled: false"
            hud-head-tracker=""
          >
            {/* HEAD-LOCKED HUD CONTAINER */}
            <a-entity
              id="hud-headlocked-rig"
              position={`0 0 -${hudDistance}`}
            >
              {/* Primary Head-locked HUD Curved/Flat Plane */}
              <a-plane
                ref={planeRef}
                id="hud-canvas-plane"
                width={planeWidth}
                height={planeHeight}
                position="0 0 0"
                material="shader: flat; transparent: true; src: #hud-canvas; opacity: 0.98; depthTest: false;"
              ></a-plane>

              {/* 3D Head-Locked Reticle Orbit (Adds physical depth in stereoscopic XR) */}
              <a-ring
                radius-inner="0.038"
                radius-outer="0.040"
                position="0 0 0.005"
                material={`color: ${HUD_THEMES[hudState.themeKey]?.primary || '#00f0ff'}; shader: flat; transparent: true; opacity: 0.45;`}
                animation="property: rotation; to: 0 0 360; loop: true; dur: 20000; easing: linear"
              ></a-ring>

              {/* Floating 3D Ammo Power Cell indicator in bottom-right */}
              <a-cylinder
                radius="0.012"
                height="0.04"
                position={`${0.62 * hudScale} ${-0.28 * hudScale} 0.01`}
                material={`color: ${hudState.ammo > 0 ? (HUD_THEMES[hudState.themeKey]?.accent || '#38bdf8') : '#ef4444'}; metalness: 0.8; roughness: 0.2; emissive: ${HUD_THEMES[hudState.themeKey]?.primary || '#00f0ff'}; emissiveIntensity: 0.6`}
                animation="property: rotation; to: 360 360 0; loop: true; dur: 8000; easing: linear"
              ></a-cylinder>

              {/* Floating 3D Health Core Orb in bottom-left */}
              <a-sphere
                radius="0.014"
                position={`${-0.62 * hudScale} ${-0.28 * hudScale} 0.01`}
                material={`color: ${hudState.health > 30 ? '#10b981' : '#ef4444'}; roughness: 0.1; emissive: ${hudState.health > 30 ? '#10b981' : '#ef4444'}; emissiveIntensity: 0.7`}
                animation="property: scale; dir: alternate; dur: 1200; loop: true; to: 1.15 1.15 1.15"
              ></a-sphere>
            </a-entity>
          </a-camera>

          {/* META QUEST 3 TOUCH CONTROLLERS */}
          {/* Listens for triggers, grips, buttons to fire, reload, and toggle */}
          <a-entity
            id="left-touch-controller"
            oculus-touch-controls="hand: left"
            quest-hud-controls="hand: left"
          ></a-entity>
          <a-entity
            id="right-touch-controller"
            oculus-touch-controls="hand: right"
            quest-hud-controls="hand: right"
          ></a-entity>

          {/* Optional 3D Holographic World Anchors (To verify spatial passthrough depth) */}
          {show3DAnchors && (
            <a-entity id="world-hologram-anchors">
              <a-box
                position="0 1.4 -2.8"
                scale="0.3 0.3 0.3"
                material="color: #00f0ff; wireframe: true; opacity: 0.65"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 12000; easing: linear"
              ></a-box>
              <a-sphere
                position="1.5 1.6 -3"
                radius="0.18"
                material="color: #38bdf8; wireframe: true; opacity: 0.5"
                animation="property: position; dir: alternate; dur: 3000; loop: true; to: 1.5 1.8 -3"
              ></a-sphere>
              <a-cylinder
                position="-1.5 1.3 -2.6"
                radius="0.1"
                height="0.6"
                material="color: #10b981; wireframe: true; opacity: 0.5"
              ></a-cylinder>
            </a-entity>
          )}
        </a-scene>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-cyan-400 font-mono text-sm">
          INITIALIZING A-FRAME WEBXR SYSTEM...
        </div>
      )}
    </div>
  );
};
