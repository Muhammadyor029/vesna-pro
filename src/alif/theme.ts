// Day & Night Theme Controller for ALIF.12
// Persists theme in localStorage, updates <html data-theme="...">,
// and notifies 3D scenes & UI listeners seamlessly.

export type AlifTheme = 'dark' | 'light';

const STORAGE_KEY = 'alif.theme';

let currentTheme: AlifTheme = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
})();

const listeners = new Set<(theme: AlifTheme) => void>();

function applyDomTheme(theme: AlifTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('is-day', theme === 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#dce8fa' : '#080a12');
  }
}

applyDomTheme(currentTheme);

export function getTheme(): AlifTheme {
  return currentTheme;
}

export function isDayMode(): boolean {
  return currentTheme === 'light';
}

export function setTheme(next: AlifTheme): AlifTheme {
  const normalized: AlifTheme = next === 'light' ? 'light' : 'dark';
  if (normalized === currentTheme) {
    applyDomTheme(normalized);
    return currentTheme;
  }
  currentTheme = normalized;
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // ignore storage limits
  }
  applyDomTheme(normalized);
  listeners.forEach((cb) => {
    try {
      cb(normalized);
    } catch {
      // ignore listener errors
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('alif:theme', { detail: { theme: normalized } }));
  }
  return currentTheme;
}

export function toggleTheme(): AlifTheme {
  return setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

export function onThemeChange(cb: (theme: AlifTheme) => void): () => void {
  listeners.add(cb);
  cb(currentTheme);
  return () => listeners.delete(cb);
}
