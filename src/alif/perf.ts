export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const small = Math.min(window.innerWidth, window.innerHeight) < 768;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return reduced || (coarse && small && (cores <= 4 || memory <= 4));
}
