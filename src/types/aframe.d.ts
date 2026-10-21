/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  interface Navigator {
    xr?: any;
  }

  interface Window {
    AFRAME?: any;
    __SIERRA_HUD_STATE__?: any;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
