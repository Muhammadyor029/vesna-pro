// 3D Liquid Crystal & Multi-Layer Dust Background Renderer + Liquid Glass Navbar Controller

import * as THREE from 'three';
import { createCrystalField } from './crystal-bg.ts';
import { initMotionSensor, getMotionParallax } from './motion-sensor.ts';
import { getTheme, onThemeChange } from './theme.ts';
import { isLowEndDevice } from './perf.ts';

export type AlifRoute = 'gallery' | 'projects' | 'alphabet' | 'about';

let routeOpaque = false;
let notifyRouteChange: (() => void) | null = null;

export function setLivingBgRoute(route: AlifRoute): void {
  routeOpaque = route === 'projects' || route === 'about';
  if (notifyRouteChange) notifyRouteChange();
}

export function spawnBgPulse(_x: number, _y: number, _color?: string): void {
  // Kept as exported no-op for compatibility
}

export function initLivingBackground(): void {
  const canvasEl = document.getElementById('living-bg-canvas') as HTMLCanvasElement | null;
  if (!canvasEl) return;

  initMotionSensor();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const lowEnd = isLowEndDevice();

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      alpha: true,
      antialias: !lowEnd,
      powerPreference: lowEnd ? 'default' : 'high-performance'
    });
  } catch {
    return;
  }

  const getDpr = () => Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : window.innerWidth >= 1440 ? 1.25 : 1.5);
  renderer.setPixelRatio(getDpr());
  renderer.setSize(window.innerWidth, Math.max(1, window.innerHeight), false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 60);
  camera.position.set(0, 0, 9.5);

  const crystal = createCrystalField({
    renderer,
    scale: 1.15,
    shardCount: window.innerWidth < 640 ? 10 : 16,
    spreadX: 11.5,
    spreadY: 6.8,
    spreadZ: 4.5,
    opacity: 0.94,
    includeFlanks: true,
    theme: getTheme()
  });
  crystal.group.position.set(0, 0, -1.2);
  scene.add(crystal.group);

  onThemeChange((theme) => {
    crystal.setTheme(theme);
    renderer.toneMappingExposure = theme === 'light' ? 1.08 : 1.2;
  });

  function onResize(): void {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(getDpr());
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);

  let rafId = 0;
  let paused = false;
  let lastFrame = 0;
  const start = performance.now();

  function renderLoop(now: number): void {
    rafId = 0;
    if (paused) return;
    if (lowEnd && lastFrame && now - lastFrame < 32) {
      rafId = requestAnimationFrame(renderLoop);
      return;
    }
    lastFrame = now;
    const elapsed = (now - start) * 0.001;
    const motion = getMotionParallax();

    // True 3D camera shift driven by cursor or mobile gyroscope
    camera.position.x = motion.x * 1.1;
    camera.position.y = -motion.y * 0.72;
    camera.lookAt(0, 0, -1.2);

    crystal.update(reduced ? 0 : elapsed, motion.x, motion.y);
    renderer.render(scene, camera);
    if (!reduced && !paused) {
      rafId = requestAnimationFrame(renderLoop);
    }
  }

  function syncPauseState(): void {
    const shouldPause = routeOpaque || document.hidden || document.body.classList.contains('is-game-open');
    if (shouldPause === paused) return;
    paused = shouldPause;
    if (paused) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    } else if (!reduced && !rafId) {
      rafId = requestAnimationFrame(renderLoop);
    }
  }

  notifyRouteChange = syncPauseState;
  syncPauseState();
  if (!paused) {
    rafId = requestAnimationFrame(renderLoop);
  }
  document.addEventListener('visibilitychange', syncPauseState);
  window.addEventListener('alif:gamemodal', syncPauseState);
}

export function initLiquidGlassNavbar(): () => void {
  const dock = document.getElementById('dock') as HTMLElement | null;
  const pill = document.getElementById('dock-active-pill') as HTMLElement | null;

  if (!dock) return () => {};

  const syncActivePill = () => {
    if (!pill) return;
    const activeTab = dock.querySelector('.dock-tab.is-active') as HTMLElement | null;
    if (!activeTab) {
      pill.style.opacity = '0';
      return;
    }
    const x = activeTab.offsetLeft;
    const y = activeTab.offsetTop;
    const w = activeTab.offsetWidth;
    const h = activeTab.offsetHeight;
    pill.style.opacity = '1';
    pill.style.width = `${w}px`;
    pill.style.height = `${h}px`;
    pill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  dock.addEventListener('pointermove', (e) => {
    const rect = dock.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    dock.style.setProperty('--dock-mx', `${x.toFixed(1)}%`);
    dock.style.setProperty('--dock-my', `${y.toFixed(1)}%`);
    dock.classList.add('is-specular-hot');
  });

  dock.addEventListener('pointerleave', () => {
    dock.classList.remove('is-specular-hot');
  });

  window.addEventListener('resize', () => {
    requestAnimationFrame(syncActivePill);
  });
  window.addEventListener('alif:lang', () => {
    requestAnimationFrame(syncActivePill);
  });
  window.addEventListener('alif:theme', () => {
    requestAnimationFrame(syncActivePill);
  });
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(syncActivePill));
  }

  requestAnimationFrame(syncActivePill);
  return syncActivePill;
}
