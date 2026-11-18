// Multi-Layer 3D Atmospheric Dust Field ("chang") for VESNA
// Removes 3D crystal clusters while preserving deep 3D Z-strata dust,
// Day/Night theme adaptation, and smooth Cursor/Gyroscope 3D parallax.

import * as THREE from 'three';
import type { AlifTheme } from './theme.ts';

export interface CrystalFieldHandle {
  group: THREE.Group;
  update: (elapsed: number, parallaxX?: number, parallaxY?: number) => void;
  setTheme: (theme: AlifTheme) => void;
  dispose: () => void;
}

export function createCrystalField(options: {
  renderer?: THREE.WebGLRenderer;
  scale?: number;
  shardCount?: number;
  spreadX?: number;
  spreadY?: number;
  spreadZ?: number;
  opacity?: number;
  includeFlanks?: boolean;
  theme?: AlifTheme;
} = {}): CrystalFieldHandle {
  const {
    scale = 1,
    spreadX = 11,
    spreadY = 6.5,
    opacity = 0.9,
    theme: initialTheme = 'dark'
  } = options;

  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  // Multi-Layer 3D Atmospheric Dust Field ("chang") for 3D spatial depth
  const dustCount = 320;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSizes = new Float32Array(dustCount);
  const dustSeeds = new Float32Array(dustCount);
  const dustTints = new Float32Array(dustCount);

  for (let i = 0; i < dustCount; i++) {
    // 3 distinct depth strata: near foreground bokeh (+z), mid (0), deep background (-z)
    const layer = i % 3;
    const golden = i * 2.3999632;
    const rad = Math.sqrt((i + 0.5) / dustCount);
    const xSpread = spreadX * (layer === 0 ? 0.65 : layer === 1 ? 0.78 : 0.96);
    const ySpread = spreadY * (layer === 0 ? 0.65 : layer === 1 ? 0.78 : 0.96);

    dustPos[i * 3] = Math.cos(golden) * xSpread * (0.22 + 0.78 * rad);
    dustPos[i * 3 + 1] = Math.sin(golden * 1.618) * ySpread * 0.68;
    dustPos[i * 3 + 2] =
      layer === 0
        ? scale * (1.45 + ((i * 13) % 20) * 0.11)
        : layer === 1
          ? scale * (-0.95 + ((i * 17) % 24) * 0.1)
          : -scale * (2.1 + ((i * 23) % 30) * 0.12);

    dustSizes[i] =
      layer === 0
        ? (0.2 + ((i * 7) % 10) * 0.022) * scale
        : layer === 1
          ? (0.115 + ((i * 11) % 10) * 0.015) * scale
          : (0.08 + ((i * 5) % 8) * 0.01) * scale;

    dustSeeds[i] = (i * 1.37) % 100;
    dustTints[i] = (i % 4) / 3;
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSizes, 1));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeeds, 1));
  dustGeo.setAttribute('aTint', new THREE.BufferAttribute(dustTints, 1));

  const dustMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uDayMix: { value: initialTheme === 'light' ? 1 : 0 },
      uParallax: { value: new THREE.Vector2(0, 0) },
      uScale: { value: scale }
    },
    vertexShader: `
      attribute float aSize;
      attribute float aSeed;
      attribute float aTint;
      uniform float uTime;
      uniform vec2 uParallax;
      uniform float uScale;
      varying float vTwinkle;
      varying float vTint;
      varying float vDepthAlpha;

      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.28 + aSeed) * 0.24 * uScale;
        p.y += cos(uTime * 0.22 + aSeed * 1.3) * 0.18 * uScale + mod(uTime * 0.06 * uScale + aSeed, 0.8 * uScale) * 0.12;
        p.z += sin(uTime * 0.19 + aSeed * 0.7) * 0.15 * uScale;

        // Depth-proportional parallax shift (foreground dust shifts faster than distant dust)
        float depthFactor = clamp((p.z / max(uScale, 0.001) + 4.0) / 7.0, 0.25, 1.85);
        p.x -= uParallax.x * 0.62 * depthFactor * uScale;
        p.y += uParallax.y * 0.44 * depthFactor * uScale;

        vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPos;

        float dist = max(1.0, -mvPos.z);
        gl_PointSize = clamp((aSize * 620.0) / dist, 2.0, 42.0);

        vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + fract(aSeed) * 1.4) + aSeed * 3.1);
        vTint = aTint;
        vDepthAlpha = clamp(depthFactor * 0.78, 0.34, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      uniform float uDayMix;
      varying float vTwinkle;
      varying float vTint;
      varying float vDepthAlpha;

      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        if (r > 0.5) discard;

        float core = smoothstep(0.16, 0.0, r);
        float halo = pow(max(0.0, 1.0 - r * 2.0), 2.1);
        float alpha = (core * 0.95 + halo * 0.45) * vTwinkle * vDepthAlpha * uOpacity;

        vec3 nightCol = mix(vec3(0.55, 0.88, 1.0), vec3(0.95, 0.98, 1.0), vTint);
        vec3 dayCol = mix(vec3(0.08, 0.42, 0.86), vec3(0.05, 0.62, 0.76), vTint);
        vec3 col = mix(nightCol, dayCol, uDayMix);
        col += vec3(0.35) * core * (1.0 - uDayMix * 0.5);

        gl_FragColor = vec4(col, alpha * mix(0.88, 0.58, uDayMix));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: initialTheme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending
  });

  const dustPoints = new THREE.Points(dustGeo, dustMat);
  group.add(dustPoints);
  disposables.push(dustGeo, dustMat);

  function applyTheme(theme: AlifTheme): void {
    const isDay = theme === 'light';
    dustMat.uniforms.uDayMix.value = isDay ? 1 : 0;
    dustMat.blending = isDay ? THREE.NormalBlending : THREE.AdditiveBlending;
    dustMat.needsUpdate = true;
  }

  applyTheme(initialTheme);

  let smoothPX = 0;
  let smoothPY = 0;

  return {
    group,
    setTheme: applyTheme,
    update(elapsed: number, parallaxX = 0, parallaxY = 0) {
      smoothPX += (parallaxX - smoothPX) * 0.08;
      smoothPY += (parallaxY - smoothPY) * 0.08;

      dustMat.uniforms.uTime.value = elapsed;
      dustMat.uniforms.uParallax.value.set(smoothPX, smoothPY);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    }
  };
}
