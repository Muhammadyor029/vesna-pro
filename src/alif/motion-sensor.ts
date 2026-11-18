// Unified Cursor + Mobile Gyroscope 3D Parallax Controller for ALIF.12
// Smoothly combines pointer position on desktop and DeviceOrientation tilt on mobile,
// including adaptive baseline calibration and iOS 13+ permission handling.

export interface MotionParallax {
  /** Normalized horizontal parallax in [-1, 1] */
  x: number;
  /** Normalized vertical parallax in [-1, 1] */
  y: number;
  /** True when live gyroscope sensor readings have arrived */
  hasGyro: boolean;
}

let initialized = false;
let pointerX = 0;
let pointerY = 0;
let hasPointer = false;

let gyroX = 0;
let gyroY = 0;
let hasGyro = false;
let baseBeta: number | null = null;
let baseGamma: number | null = null;

let smoothX = 0;
let smoothY = 0;
let lastUpdateTime = 0;
let permissionAttempted = false;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function onOrientation(e: DeviceOrientationEvent): void {
  if (e.beta === null || e.gamma === null) return;
  const beta = e.beta;
  const gamma = e.gamma;

  if (baseBeta === null || baseGamma === null) {
    baseBeta = beta;
    baseGamma = gamma;
  } else {
    // Slowly adapt baseline so holding device at a new angle stays comfortable
    baseBeta += (beta - baseBeta) * 0.008;
    baseGamma += (gamma - baseGamma) * 0.008;
  }

  // Handle landscape vs portrait cleanly when screen.orientation is available
  const angle = window.screen?.orientation?.angle ?? 0;
  let dx = gamma - baseGamma;
  let dy = beta - baseBeta;
  if (angle === 90) {
    dx = beta - baseBeta;
    dy = -(gamma - baseGamma);
  } else if (angle === -90 || angle === 270) {
    dx = -(beta - baseBeta);
    dy = gamma - baseGamma;
  }

  gyroX = clamp(dx / 24, -1, 1);
  gyroY = clamp(dy / 22, -1, 1);
  hasGyro = true;
}

export async function requestGyroPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const DevOrient = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  if (DevOrient && typeof DevOrient.requestPermission === 'function') {
    try {
      const res = await DevOrient.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

export function initMotionSensor(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener(
    'pointermove',
    (e) => {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      pointerX = clamp((e.clientX / w) * 2 - 1, -1, 1);
      pointerY = clamp((e.clientY / h) * 2 - 1, -1, 1);
      hasPointer = true;
    },
    { passive: true }
  );

  // Attach DeviceOrientation immediately for Android & desktop sensors
  window.addEventListener('deviceorientation', onOrientation, { passive: true });

  // On iOS 13+, request DeviceOrientation permission on first user tap
  const unlockIosGyro = () => {
    if (permissionAttempted) return;
    permissionAttempted = true;
    requestGyroPermission().then((ok) => {
      if (ok) {
        window.addEventListener('deviceorientation', onOrientation, { passive: true });
      }
    });
  };

  window.addEventListener('pointerdown', unlockIosGyro, { passive: true, once: true });
  window.addEventListener('touchstart', unlockIosGyro, { passive: true, once: true });
}

export function getMotionParallax(): MotionParallax {
  if (!initialized) initMotionSensor();

  const now = performance.now();
  const dt = lastUpdateTime ? Math.min(0.05, (now - lastUpdateTime) * 0.001) : 0.016;
  lastUpdateTime = now;

  const targetX = hasGyro ? (hasPointer ? gyroX * 0.72 + pointerX * 0.28 : gyroX) : pointerX;
  const targetY = hasGyro ? (hasPointer ? gyroY * 0.72 + pointerY * 0.28 : gyroY) : pointerY;

  const rate = 1 - Math.exp(-7.5 * dt);
  smoothX += (targetX - smoothX) * rate;
  smoothY += (targetY - smoothY) * rate;

  return {
    x: smoothX,
    y: smoothY,
    hasGyro
  };
}
