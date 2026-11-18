// Sound effects disabled by user preference — clean silent no-op module.

export type SfxName =
  | 'ripple'
  | 'ripple-tap'
  | 'warp'
  | 'basscrack'
  | 'cybershift'
  | 'glitch'
  | 'cinestrike'
  | 'chime';

export interface PlaySfxOptions {
  gainScale?: number;
  pitch?: number;
  delay?: number;
}

export function isSoundEnabled(): boolean {
  return false;
}

export function setSoundEnabled(_next: boolean): void {}

export function toggleSound(): boolean {
  return false;
}

export function onSoundChange(cb: (enabled: boolean) => void): () => void {
  try {
    cb(false);
  } catch {
    // ignore
  }
  return () => {};
}

export function preloadAllSfx(): void {}

export function playSfx(_name: SfxName, _opts: PlaySfxOptions = {}): void {}

export function playGameSfx(_type: string, _step = 0): void {}

export function installGlobalButtonSfx(): void {}
