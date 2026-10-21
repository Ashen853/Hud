/**
 * A-Frame Custom Components for Quest 3 Passthrough HUD
 */

declare global {
  interface Window {
    AFRAME?: any;
    __SIERRA_HUD_STATE__?: {
      cameraYaw: number;
      onFire?: () => void;
      onReload?: () => void;
      onToggleMode?: () => void;
    };
  }
}

let componentsRegistered = false;

export function registerAframeComponents(): void {
  if (componentsRegistered) return;
  if (typeof window === 'undefined' || !window.AFRAME) return;

  const AFRAME = window.AFRAME;

  // Track camera rotation to update compass and head-orientation telemetry
  if (!AFRAME.components['hud-head-tracker']) {
    AFRAME.registerComponent('hud-head-tracker', {
      schema: {
        targetCanvas: { type: 'selector' }
      },
      init: function () {
        this.euler = new AFRAME.THREE.Euler(0, 0, 0, 'YXZ');
      },
      tick: function () {
        if (!this.el.object3D) return;
        this.euler.setFromQuaternion(this.el.object3D.quaternion);
        // Yaw in degrees from 0 to 360
        let yawDeg = Math.round((this.euler.y * 180) / Math.PI);
        if (yawDeg < 0) yawDeg += 360;

        if (window.__SIERRA_HUD_STATE__) {
          window.__SIERRA_HUD_STATE__.cameraYaw = yawDeg;
        }
      }
    });
  }

  // Handle Meta Quest 3 Touch Controller events (Trigger = Fire, Grip = Reload, A/X = Toggle)
  if (!AFRAME.components['quest-hud-controls']) {
    AFRAME.registerComponent('quest-hud-controls', {
      schema: {
        hand: { type: 'string', default: 'right' }
      },
      init: function () {
        const el = this.el;

        el.addEventListener('triggerdown', () => {
          if (window.__SIERRA_HUD_STATE__?.onFire) {
            window.__SIERRA_HUD_STATE__.onFire();
          }
        });

        el.addEventListener('gripdown', () => {
          if (window.__SIERRA_HUD_STATE__?.onReload) {
            window.__SIERRA_HUD_STATE__.onReload();
          }
        });

        el.addEventListener('abuttondown', () => {
          if (window.__SIERRA_HUD_STATE__?.onToggleMode) {
            window.__SIERRA_HUD_STATE__.onToggleMode();
          }
        });

        el.addEventListener('xbuttondown', () => {
          if (window.__SIERRA_HUD_STATE__?.onToggleMode) {
            window.__SIERRA_HUD_STATE__.onToggleMode();
          }
        });
      }
    });
  }

  // Quest passthrough scene initialization
  if (!AFRAME.components['quest-passthrough-init']) {
    AFRAME.registerComponent('quest-passthrough-init', {
      init: function () {
        const sceneEl = this.el;

        const updatePassthrough = () => {
          if (sceneEl.renderer) {
            // Ensure WebGLRenderer alpha is transparent so Quest 3 passthrough video shows
            sceneEl.renderer.setClearAlpha(0);
            sceneEl.renderer.setClearColor(0x000000, 0);
          }
        };

        sceneEl.addEventListener('render-target-loaded', updatePassthrough);
        sceneEl.addEventListener('enter-vr', () => {
          updatePassthrough();
          // Dispatch custom event for React state
          window.dispatchEvent(new CustomEvent('quest-xr-session-start', {
            detail: { isAR: sceneEl.is('ar-mode') }
          }));
        });

        sceneEl.addEventListener('exit-vr', () => {
          window.dispatchEvent(new CustomEvent('quest-xr-session-end'));
        });
      }
    });
  }

  componentsRegistered = true;
}
