import * as THREE from 'three';
import gsap from 'gsap';
window.gsap = gsap;
    import { EDU_ITEMS, drawEduCardFrame, openEduGame, closeEduGame, isEduGameOpen, onBgReady } from './edu-engine.js';
    import { t as ct, st } from './senior-content.js';
    import { createAlphabetView } from './alphabet-view.ts';
    import { initLivingBackground, initLiquidGlassNavbar, setLivingBgRoute, spawnBgPulse } from './living-bg.ts';
    import { createCrystalField } from './crystal-bg.ts';
    import { getTheme, isDayMode, onThemeChange } from './theme.ts';
    import { initMotionSensor, getMotionParallax } from './motion-sensor.ts';
    // gsap imported from module
    // Shrift yuklanguncha (max 1.5s) kutamiz, canvas matnlari to'g'ri chiqsin
    try {
      await Promise.race([
        Promise.all([document.fonts.load('800 24px Nunito'), document.fonts.load('400 14px Nunito')]),
        new Promise((r) => setTimeout(r, 1500))
      ]);
    } catch (_) {}
    window.__alifBoot = 'modules-ok';
    initMotionSensor();
    initLivingBackground();
    const syncDockPill = initLiquidGlassNavbar();

    // ── 1. Media Data & Helpers ───────────────────────────────────────────
    const ITEMS = EDU_ITEMS;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const getCapDpr = (desktopMax = 1.5) => (
      isSoftwareGl
        ? 1
        : Math.min(window.devicePixelRatio || 1, window.innerWidth >= 1440 ? 1.25 : (isTouchDevice() ? 1.5 : desktopMax))
    );

    const isSoftwareGl = (() => {
      try {
        const c = document.createElement('canvas');
        const gl = c.getContext('webgl2') || c.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    function createEduCardCanvas(item, w = 480, h = 270) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      drawEduCardFrame(ctx, w, h, item, 0, 0);
      return { canvas: c, ctx, w, h };
    }

    function makeLoopDriver(renderer, onFrame) {
      let running = false;
      let rafId = 0;
      let timerId = 0;
      let lastTime = 0;

      function afterDraw(cb) {
        const gl = renderer.getContext();
        if (gl && typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (!running) {
              try { gl.deleteSync(sync); } catch {}
              return;
            }
            const st = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
            if (st === gl.UNSIGNALED) {
              timerId = window.setTimeout(poll, 5);
            } else {
              try { gl.deleteSync(sync); } catch {}
              timerId = window.setTimeout(cb, 80);
            }
          };
          timerId = window.setTimeout(poll, 5);
        } else {
          timerId = window.setTimeout(cb, 80);
        }
      }

      function tick(now) {
        if (!running) return;
        const t = typeof now === 'number' ? now : performance.now();
        const dt = lastTime ? Math.min((t - lastTime) / 1000, 0.05) : 1 / 60;
        lastTime = t;
        onFrame(dt, t / 1000);
        if (!running) return;
        if (isSoftwareGl) {
          afterDraw(() => tick(performance.now()));
        } else {
          rafId = requestAnimationFrame(tick);
        }
      }

      return {
        start() {
          if (running) return;
          running = true;
          lastTime = performance.now();
          rafId = requestAnimationFrame(tick);
        },
        stop() {
          running = false;
          cancelAnimationFrame(rafId);
          clearTimeout(timerId);
        }
      };
    }

    // ── 2. Shared Dock & Router ───────────────────────────────────────────
    const dockEl = document.getElementById('dock');
    const menuBtn = document.getElementById('dock-menu-btn');
    const menuPanel = document.getElementById('dock-menu-panel');
    const tabEls = Array.from(dockEl.querySelectorAll('.dock-tab'));
    let dockRevealed = false;
    let menuOpen = false;

    function revealDock(immediate = false) {
      if (dockRevealed) return;
      dockRevealed = true;
      dockEl.style.pointerEvents = 'auto';
      if (immediate || reducedMotion) {
        gsap.set(dockEl, { y: 0, opacity: 1 });
        syncDockPill();
      } else {
        gsap.fromTo(dockEl, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', onComplete: syncDockPill });
      }
      requestAnimationFrame(syncDockPill);
    }

    function setMenuOpen(open) {
      menuOpen = open;
      menuBtn.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuPanel.classList.toggle('is-open', open);
      menuPanel.setAttribute('aria-hidden', String(!open));
    }

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuOpen(!menuOpen);
    });

    document.addEventListener('pointerdown', (e) => {
      if (menuOpen && !menuPanel.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    const viewBuilders = {};
    const viewInstances = {};
    let currentRoute = null;
    let isSwitching = false;
    let activeViewDriver = null;

    window.addEventListener('alif:gamemodal', () => {
      if (!activeViewDriver) return;
      if (isEduGameOpen()) activeViewDriver.stop();
      else activeViewDriver.start();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const ag = document.getElementById('about-guide-panel');
      if (ag && ag.classList.contains('is-open')) return;
      if (menuOpen) {
        setMenuOpen(false);
        return;
      }
      if (isEduGameOpen()) {
        closeEduGame();
      }
    });

    function parseHash() {
      const h = (window.location.hash || '#gallery').replace('#', '').toLowerCase();
      return (h === 'projects' || h === 'alphabet' || h === 'about' || h === 'gallery') ? h : 'gallery';
    }

    function updateDockTabs(route) {
      for (const tab of tabEls) {
        tab.classList.toggle('is-active', tab.dataset.route === route);
      }
      requestAnimationFrame(syncDockPill);
    }

    function switchRoute(nextRoute) {
      if (nextRoute === currentRoute && viewInstances[nextRoute]) return;
      setMenuOpen(false);
      updateDockTabs(nextRoute);
      setLivingBgRoute(nextRoute);

      const prevRoute = currentRoute;
      currentRoute = nextRoute;

      const ensureInstance = (r) => {
        if (!viewInstances[r]) {
          viewInstances[r] = viewBuilders[r]();
        }
        return viewInstances[r];
      };

      if (!prevRoute) {
        const inst = ensureInstance(nextRoute);
        inst.el.style.visibility = 'visible';
        inst.el.style.opacity = '1';
        inst.enter(true);
        if (nextRoute !== 'gallery' || reducedMotion) {
          revealDock(nextRoute !== 'gallery' && reducedMotion);
        }
        return;
      }

      const prevInst = viewInstances[prevRoute];
      const nextInst = ensureInstance(nextRoute);

      gsap.killTweensOf(prevInst.el);
      gsap.killTweensOf(nextInst.el);
      isSwitching = true;

      gsap.to(prevInst.el, {
        opacity: 0,
        duration: reducedMotion ? 0 : 0.35,
        ease: 'power2.in',
        onComplete: () => {
          prevInst.leave();
          prevInst.el.style.visibility = 'hidden';

          nextInst.el.style.visibility = 'visible';
          nextInst.el.style.opacity = '0';
          nextInst.enter(false);
          revealDock(false);

          gsap.to(nextInst.el, {
            opacity: 1,
            duration: reducedMotion ? 0 : 0.5,
            ease: 'power2.out',
            onComplete: () => {
              isSwitching = false;
            }
          });
        }
      });
    }

    window.addEventListener('hashchange', () => {
      switchRoute(parseHash());
    });

    document.querySelectorAll('[data-route]').forEach((el) => {
      el.addEventListener('click', (e) => {
        const target = el.getAttribute('href');
        if (target && target.startsWith('#')) {
          setMenuOpen(false);
          if (window.location.hash === target) {
            e.preventDefault();
          }
        }
      });
    });

    // ── 3. View 1: Gallery (Sphere of Videos) ─────────────────────────────
    viewBuilders.gallery = () => {
      const section = document.getElementById('view-gallery');
      const host = document.getElementById('gal-canvas');
      const sideInners = Array.from(section.querySelectorAll('.gal-side-inner'));
      const counterEl = document.getElementById('gal-counter');
      const hintEl = document.getElementById('gal-hint');
      const captionInner = document.getElementById('gal-caption-inner');
      const cursorLabel = document.getElementById('gal-cursor-label');
      const overviewEl = document.getElementById('gal-overview');
      const ovTitle = document.getElementById('ov-title');
      const ovSub = document.getElementById('ov-sub');
      const ovDesc = document.getElementById('ov-desc');
      const ovClose = document.getElementById('ov-close');

      const galleryItems = ITEMS.slice(0, 20);
      const N = galleryItems.length;
      const touch = isTouchDevice();

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !touch, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x0c0c0d, 0);
      renderer.setPixelRatio(getCapDpr());
      renderer.setSize(window.innerWidth, window.innerHeight);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 100);
      camera.position.set(0, 0, 12);

      const px = (v) => v * (2 * 12 * Math.tan(Math.PI / 6)) / Math.max(1, window.innerHeight);

      function getLayout() {
        const vw = window.innerWidth;
        const vh = Math.max(1, window.innerHeight);
        const isPhone = vw <= 640;
        const isMid = vw >= 1025 && vw <= 1440;
        const bigScale = vw > 1440 ? Math.min(1.55, Math.min(vw / 1380, vh / 860)) : (isMid ? 0.84 : 1);
        const planeSize = isPhone ? 74 : Math.round(108 * bigScale);
        const phoneRad = Math.max(90, vw / 2 - 24 - planeSize / 2);
        const radX = isPhone ? phoneRad : Math.round(255 * bigScale);
        const radY = isPhone ? phoneRad : Math.round(255 * bigScale);
        const radZ = isPhone ? phoneRad : Math.round(255 * bigScale);
        const centerScale = planeSize * (120 / 82);
        const circleRadius = isPhone ? 240 * 0.75 : Math.round(240 * Math.max(1, bigScale * 0.92));
        return { vw, vh, isPhone, planeSize, radX, radY, radZ, centerScale, circleRadius };
      }

      let layout = getLayout();

      // Wordmark canvas plane
      function createWordmarkMesh() {
        const dpr = getCapDpr(1.5);
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        ctx.font = '600 64px "Nunito", ui-sans-serif, sans-serif';
        const text = 'VESNA';
        const m = ctx.measureText(text);
        const w = Math.ceil(m.width + 24);
        const h = 92;
        c.width = w * dpr;
        c.height = h * dpr;
        ctx.scale(dpr, dpr);
        ctx.font = '600 64px "Nunito", ui-sans-serif, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, w / 2, h / 2 + 2);

        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;

        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          color: isDayMode() ? 0x0f172a : 0xededeb,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        const worldW = px(90);
        mesh.scale.set(worldW, worldW * (h / w), 1);
        mesh.renderOrder = 2;
        return mesh;
      }

      const wordmarkMesh = createWordmarkMesh();
      scene.add(wordmarkMesh);

      const sphereGroup = new THREE.Group();
      scene.add(sphereGroup);

      const planeGeo = new THREE.PlaneGeometry(1, 1);
      const planes = [];

      onThemeChange((theme) => {
        const day = theme === 'light';
        wordmarkMesh.material.color.setHex(day ? 0x0f172a : 0xededeb);
        planes.forEach((p) => {
          if (p.card && p.texture) {
            drawEduCardFrame(p.card.ctx, p.card.w, p.card.h, p.item, 0, 0);
            p.texture.needsUpdate = true;
          } else if (p.mat) {
            p.mat.color.setHex(day ? 0xdbeafe : 0x1b1b1d);
          }
        });
      });

      function fibonacciUnit(i, total) {
        const y = i * (2 / total) - 1 + 1 / total;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const angle = Math.PI * (3 - Math.sqrt(5)) * i;
        return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
      }

      for (let i = 0; i < N; i++) {
        const item = galleryItems[i];
        const unit = fibonacciUnit(i, N);
        const mat = new THREE.MeshBasicMaterial({
          color: isDayMode() ? 0xdbeafe : 0x1b1b1d,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(planeGeo, mat);
        const state = {
          index: i,
          item,
          mesh,
          mat,
          unit,
          aspect: 16 / 9,
          texture: null,
          hasFrame: false,
          loadStarted: false,
          sizePx: layout.planeSize,
          baseOpacity: 0,
          localPos: new THREE.Vector3(0, 0, 0),
          fibPos: new THREE.Vector3(unit.x * px(layout.radX), unit.y * px(layout.radY), unit.z * px(layout.radZ)),
          isCircleIntro: i < 10
        };
        mesh.userData.planeState = state;
        sphereGroup.add(mesh);
        planes.push(state);
      }

      // Video management
      let circleLoadedCount = 0;
      const counterObj = { val: 1 };
      let introPhase = reducedMotion ? 'sphere' : 'loading';
      let introStartTime = 0;
      let circleStarted = false;
      let circleSpinFactor = 0;
      let videosStarted = false;
      let lastHemisphereCheck = 0;

      function updateCounterDisplay() {
        const v = Math.max(1, Math.min(100, Math.round(counterObj.val)));
        counterEl.textContent = String(v).padStart(3, '0');
      }

      function startLoadingVideos() {
        if (videosStarted) return;
        videosStarted = true;
        planes.forEach((p, idx) => {
          window.setTimeout(() => {
            if (p.hasFrame) return;
            p.hasFrame = true;
            const texW = window.innerWidth >= 1440 ? 520 : 400;
            const texH = Math.round(texW * (9 / 16));
            const card = createEduCardCanvas(p.item, texW, texH);
            p.card = card;
            const tex = new THREE.CanvasTexture(card.canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            p.texture = tex;
            p.mat.map = tex;
            p.mat.color.setHex(0xffffff);
            p.mat.needsUpdate = true;

            if (idx < 10) {
              circleLoadedCount++;
              if (introPhase === 'loading') {
                const target = Math.min(99, Math.round((circleLoadedCount / 10) * 99));
                gsap.to(counterObj, {
                  val: Math.max(counterObj.val, target),
                  duration: 0.35,
                  ease: 'power1.out',
                  onUpdate: updateCounterDisplay
                });
              }
            }
          }, idx * 80);
        });

        onBgReady(() => {
          planes.forEach((p) => {
            if (p.card && p.texture) {
              drawEduCardFrame(p.card.ctx, p.card.w, p.card.h, p.item, 0, 0);
              p.texture.needsUpdate = true;
            }
          });
        });
      }

      // Spin state
      let velX = 0;
      let velY = 0;
      let targetYaw = 0;
      let targetPitch = 0;
      let smoothYaw = 0;
      let smoothPitch = 0;
      let userInteracted = false;
      const idleAxis = new THREE.Vector3(Math.sin(23 * Math.PI / 180), Math.cos(23 * Math.PI / 180), 0).normalize();
      const AXIS_X = new THREE.Vector3(1, 0, 0);
      const AXIS_Y = new THREE.Vector3(0, 1, 0);
      const AXIS_Z = new THREE.Vector3(0, 0, 1);
      const _qYaw = new THREE.Quaternion();
      const _qPitch = new THREE.Quaternion();
      const _qIdle = new THREE.Quaternion();
      const _invGroupQuat = new THREE.Quaternion();
      const _wp = new THREE.Vector3();
      const _dir = new THREE.Vector3();
      const _localTarget = new THREE.Vector3();

      // Expand & Overview state
      let expandedIndex = null;
      let overviewOpen = false;
      const zoomState = { expand: 0, overview: 0 };

      // Cursor label quickTo
      const labelQuickX = gsap.quickTo(cursorLabel, 'x', { duration: 0.5, ease: 'power3.out' });
      const labelQuickY = gsap.quickTo(cursorLabel, 'y', { duration: 0.5, ease: 'power3.out' });
      let labelVisible = false;

      function setCursorLabelVisible(show, text) {
        if (touch) return;
        if (text) cursorLabel.textContent = text;
        if (show === labelVisible) return;
        labelVisible = show;
        gsap.to(cursorLabel, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.6,
          duration: show ? 0.6 : 0.35,
          ease: 'power4.out'
        });
      }

      // Hover caption
      let hoveredIndex = null;
      let captionText = '';

      function updateCaption(planeState) {
        const nextText = planeState ? `${planeState.item.title}|${planeState.item.category}` : '';
        if (nextText === captionText) return;
        captionText = nextText;

        gsap.killTweensOf(captionInner);
        if (!planeState) {
          gsap.to(captionInner, {
            yPercent: -110,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => { captionInner.innerHTML = ''; }
          });
          return;
        }

        const renderNext = () => {
          captionInner.innerHTML = `<span class="gal-cap-title">${planeState.item.title}</span><span class="gal-cap-cat">${planeState.item.category}</span>`;
          gsap.fromTo(captionInner, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' });
        };

        if (captionInner.innerHTML) {
          gsap.to(captionInner, {
            yPercent: -110,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: renderNext
          });
        } else {
          renderNext();
        }
      }

      function openZoom(idx) {
        expandedIndex = idx;
        overviewOpen = false;
        updateCaption(null);
        hoveredIndex = null;
        planes[idx].mesh.renderOrder = 25;
        planes[idx].mat.depthTest = false;
        gsap.to(zoomState, { expand: 1, duration: 0.8, ease: 'power4.out' });
        gsap.to(hintEl, { opacity: 0, duration: 0.35 });
      }

      function openOverview() {
        if (expandedIndex === null) return;
        overviewOpen = true;
        const item = planes[expandedIndex].item;
        ovTitle.textContent = item.title;
        ovSub.textContent = `${item.category}, ${item.year}`;
        ovDesc.textContent = item.desc;
        overviewEl.classList.add('is-open');
        overviewEl.setAttribute('aria-hidden', 'false');

        gsap.to(zoomState, { overview: 1, duration: 0.8, ease: 'power4.out' });
        gsap.killTweensOf(overviewEl);
        gsap.fromTo(overviewEl, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: 0.12 });
        if (labelVisible) cursorLabel.textContent = 'Yopiş';
      }

      function closeOverview() {
        if (!overviewOpen) return;
        overviewOpen = false;
        overviewEl.classList.remove('is-open');
        overviewEl.setAttribute('aria-hidden', 'true');
        gsap.to(zoomState, { overview: 0, duration: 0.8, ease: 'power4.out' });
        gsap.killTweensOf(overviewEl);
        gsap.to(overviewEl, { opacity: 0, y: 10, duration: 0.35, ease: 'power2.in' });
        if (labelVisible) cursorLabel.textContent = "Ma'lumot";
      }

      function closeZoom() {
        if (expandedIndex === null) return;
        const prevIdx = expandedIndex;
        expandedIndex = null;
        if (overviewOpen) closeOverview();
        setCursorLabelVisible(false);
        gsap.to(zoomState, {
          expand: 0,
          overview: 0,
          duration: 0.8,
          ease: 'power4.out',
          onComplete: () => {
            if (expandedIndex === null && planes[prevIdx]) {
              planes[prevIdx].mesh.renderOrder = 0;
              planes[prevIdx].mat.depthTest = true;
            }
          }
        });
        lastHemisphereCheck = 0;
      }

      const ovPlay = document.getElementById('ov-play');
      ovPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (expandedIndex !== null) {
          openEduGame(planes[expandedIndex].item);
        }
      });

      ovClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeZoom();
      });

      // Pointer & Raycaster
      const raycaster = new THREE.Raycaster();
      const pointerNdc = new THREE.Vector2(-99, -99);
      let pointerClientX = window.innerWidth / 2;
      let pointerClientY = window.innerHeight / 2;
      let pointerDirty = false;
      let isDragging = false;
      let downX = 0;
      let downY = 0;
      let prevX = 0;
      let prevY = 0;
      let totalPath = 0;
      let pinchDist = 0;

      function updateCursorStyle(hitPlane) {
        if (isDragging) {
          host.style.cursor = 'grabbing';
          return;
        }
        if (hitPlane) {
          host.style.cursor = 'pointer';
          return;
        }
        if (expandedIndex !== null) {
          host.style.cursor = 'default';
          return;
        }
        const dx = pointerClientX - window.innerWidth / 2;
        const dy = pointerClientY - window.innerHeight / 2;
        host.style.cursor = (dx * dx + dy * dy <= 250 * 250) ? 'grab' : 'default';
      }

      function raycastAt(clientX, clientY) {
        if (introPhase !== 'sphere') return null;
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);
        const meshes = planes.map((p) => p.mesh);
        const hits = raycaster.intersectObjects(meshes, false);
        if (!hits.length) return null;
        if (expandedIndex !== null) {
          const zHit = hits.find((h) => h.object.userData.planeState.index === expandedIndex);
          return zHit ? zHit.object.userData.planeState : null;
        }
        return hits[0].object.userData.planeState;
      }

      host.addEventListener('pointerdown', (e) => {
        if (introPhase !== 'sphere') return;
        isDragging = true;
        downX = prevX = e.clientX;
        downY = prevY = e.clientY;
        totalPath = 0;
        pointerClientX = e.clientX;
        pointerClientY = e.clientY;
        if (expandedIndex === null) updateCursorStyle(null);
      });

      window.addEventListener('pointermove', (e) => {
        if (currentRoute !== 'gallery') return;
        pointerClientX = e.clientX;
        pointerClientY = e.clientY;
        pointerDirty = true;

        if (!touch) {
          labelQuickX(e.clientX + 14);
          labelQuickY(e.clientY + 14);
        }

        if (isDragging && expandedIndex === null && introPhase === 'sphere') {
          const dx = e.clientX - prevX;
          const dy = e.clientY - prevY;
          totalPath += Math.hypot(dx, dy);
          prevX = e.clientX;
          prevY = e.clientY;
          if (Math.hypot(e.clientX - downX, e.clientY - downY) > 2) {
            userInteracted = true;
            gsap.to(hintEl, { opacity: 0, duration: 0.4 });
          }
          velX += dx * 0.001;
          velY += dy * 0.001;
        } else if (isDragging) {
          const dx = e.clientX - prevX;
          const dy = e.clientY - prevY;
          totalPath += Math.hypot(dx, dy);
          prevX = e.clientX;
          prevY = e.clientY;
        }
      });

      window.addEventListener('pointerup', (e) => {
        if (!isDragging || currentRoute !== 'gallery') return;
        isDragging = false;
        const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
        const isClick = moved < 6 && totalPath < 10;

        if (isClick && introPhase === 'sphere') {
          const hit = raycastAt(e.clientX, e.clientY);
          if (expandedIndex === null) {
            if (hit) {
              userInteracted = true;
              spawnBgPulse(e.clientX, e.clientY, hit.item?.accent);
              openZoom(hit.index);
            }
          } else {
            if (hit && hit.index === expandedIndex) {
              if (overviewOpen) closeOverview();
              else openOverview();
            } else {
              closeZoom();
            }
          }
        }
        pointerDirty = true;
      });

      host.addEventListener('wheel', (e) => {
        if (introPhase !== 'sphere' || expandedIndex !== null) return;
        e.preventDefault();
        userInteracted = true;
        gsap.to(hintEl, { opacity: 0, duration: 0.4 });
        velX += e.deltaY * 0.0002;
      }, { passive: false });

      host.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          pinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });

      host.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && introPhase === 'sphere' && expandedIndex === null) {
          const d = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const delta = pinchDist - d;
          pinchDist = d;
          userInteracted = true;
          velX += delta * 0.0002;
        }
      }, { passive: true });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !isEduGameOpen() && currentRoute === 'gallery' && expandedIndex !== null) {
          closeZoom();
        }
      });

      // Intro orchestration
      let introInitialized = false;

      function runIntro() {
        if (introInitialized) return;
        introInitialized = true;

        if (reducedMotion) {
          introPhase = 'sphere';
          wordmarkMesh.material.opacity = 0;
          wordmarkMesh.visible = false;
          counterEl.style.display = 'none';
          sideInners.forEach((s) => gsap.set(s, { yPercent: 0, transform: 'none' }));
          planes.forEach((p) => {
            p.localPos.copy(p.fibPos);
            p.sizePx = layout.planeSize;
            p.baseOpacity = 1;
          });
          startLoadingVideos();
          revealDock(true);
          return;
        }

        introStartTime = performance.now();
        gsap.to(wordmarkMesh.material, { opacity: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' });
        gsap.fromTo(sideInners, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.5 });
        gsap.fromTo(counterEl, { yPercent: 110 }, { yPercent: 0, duration: 0.75, ease: 'power4.out', delay: 0.5 });

        window.setTimeout(() => {
          startLoadingVideos();
        }, 200);
      }

      function triggerCircleIntro() {
        if (circleStarted) return;
        circleStarted = true;
        introPhase = 'circle';

        gsap.to(counterObj, {
          val: 100,
          duration: 0.25,
          ease: 'power1.out',
          onUpdate: updateCounterDisplay,
          onComplete: () => {
            gsap.to(counterEl, { yPercent: -120, duration: 0.5, ease: 'power2.in' });
          }
        });

        circleSpinFactor = 1;
        const circleR = px(layout.circleRadius);

        for (let i = 0; i < 10; i++) {
          const p = planes[i];
          const a = -Math.PI / 2 + i * (Math.PI * 2 / 10);
          p.localPos.set(Math.cos(a) * circleR, Math.sin(a) * circleR, 0);
          p.sizePx = 0.01;
          p.baseOpacity = 0;

          gsap.to(p, {
            baseOpacity: 1,
            duration: 1.0,
            ease: 'power3.out',
            delay: i * 0.1
          });
          gsap.to(p, {
            sizePx: 70,
            duration: 1.0,
            ease: 'back.out(1.7)',
            delay: i * 0.1
          });
        }

        // 1.3s later ramp spin up to 7.3x over 1s (power2.in)
        const spinProxy = { mult: 1 };
        gsap.to(spinProxy, {
          mult: 7.3,
          duration: 1.0,
          delay: 1.3,
          ease: 'power2.in',
          onUpdate: () => { circleSpinFactor = spinProxy.mult; }
        });

        // 0.8s after that: fade wordmark, slide out side labels, collapse 10 planes
        const collapseDelay = 1.3 + 1.0 + 0.8;
        gsap.to(wordmarkMesh.material, {
          opacity: 0,
          duration: 0.75,
          delay: collapseDelay,
          ease: 'power2.inOut',
          onComplete: () => { wordmarkMesh.visible = false; }
        });

        gsap.to(sideInners, {
          yPercent: -105,
          duration: 0.65,
          delay: collapseDelay,
          ease: 'power2.inOut'
        });

        for (let i = 0; i < 10; i++) {
          const p = planes[i];
          const zStack = (9 - i) * px(1.5);
          gsap.to(p.localPos, {
            x: 0,
            y: 0,
            z: zStack,
            duration: 1.25,
            delay: collapseDelay + i * 0.05,
            ease: 'power2.inOut'
          });
          gsap.to(p, {
            sizePx: layout.centerScale,
            duration: 1.25,
            delay: collapseDelay + i * 0.05,
            ease: 'power2.inOut'
          });
        }

        // 0.2s after collapse ends -> explode into sphere
        const collapseEnd = collapseDelay + 1.25 + 9 * 0.05;
        const explodeDelay = collapseEnd + 0.2;

        gsap.delayedCall(explodeDelay, () => {
          introPhase = 'explode';
          circleSpinFactor = 0;
          sphereGroup.quaternion.identity();

          for (let i = 0; i < N; i++) {
            const p = planes[i];
            const startPos = p.localPos.clone();
            const endPos = p.fibPos;
            const prog = { t: 0 };

            if (i >= 10) {
              p.sizePx = 0.01;
              p.baseOpacity = 0;
              gsap.to(p, { baseOpacity: 1, duration: 0.9, ease: 'power3.out' });
            }

            gsap.to(p, {
              sizePx: layout.planeSize,
              duration: 1.0,
              ease: 'power3.out'
            });

            gsap.to(prog, {
              t: 1,
              duration: 1.0,
              ease: 'power3.out',
              onUpdate: () => {
                const overshoot = 1 + 0.1 * Math.sin(Math.PI * prog.t);
                p.localPos.lerpVectors(startPos, endPos, prog.t).multiplyScalar(overshoot);
              },
              onComplete: () => {
                p.localPos.copy(p.fibPos);
                if (i === N - 1) {
                  introPhase = 'sphere';
                }
              }
            });
          }

          gsap.fromTo(sideInners, { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 });
          revealDock(false);
          gsap.to(hintEl, { opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.2 });
        });
      }

      const driver = makeLoopDriver(renderer, (dt, elapsed) => {
        const frameScale = dt * 60;

        if (introPhase === 'loading') {
          const ms = performance.now() - introStartTime;
          if (ms >= 2000 && (circleLoadedCount >= 10 || ms >= 30000)) {
            triggerCircleIntro();
          }
        }

        if (introPhase === 'circle' && circleSpinFactor > 0) {
          const dRot = (0.5 * Math.PI / 180) * circleSpinFactor * frameScale;
          _qYaw.setFromAxisAngle(AXIS_Z, -dRot);
          sphereGroup.quaternion.premultiply(_qYaw).normalize();
        }

        if (introPhase === 'sphere') {
          if (expandedIndex === null) {
            const friction = Math.pow(0.94, frameScale);
            velX *= friction;
            velY *= friction;
            targetYaw += velX * frameScale;
            targetPitch += velY * frameScale;

            const smoothAmt = 1 - Math.pow(1 - 0.11, frameScale);
            const prevSY = smoothYaw;
            const prevSP = smoothPitch;
            smoothYaw += (targetYaw - smoothYaw) * smoothAmt;
            smoothPitch += (targetPitch - smoothPitch) * smoothAmt;

            const dYaw = smoothYaw - prevSY;
            const dPitch = smoothPitch - prevSP;

            if (Math.abs(dYaw) > 1e-7) {
              _qYaw.setFromAxisAngle(AXIS_Y, dYaw);
              sphereGroup.quaternion.premultiply(_qYaw);
            }
            if (Math.abs(dPitch) > 1e-7) {
              _qPitch.setFromAxisAngle(AXIS_X, dPitch);
              sphereGroup.quaternion.premultiply(_qPitch);
            }

            if (!userInteracted && !reducedMotion) {
              _qIdle.setFromAxisAngle(idleAxis, 0.001 * frameScale);
              sphereGroup.quaternion.premultiply(_qIdle);
            }
            sphereGroup.quaternion.normalize();
          }

          // Smoothly animate loaded cards with throttled GPU uploads (keeps 60fps silky)
          if (!reducedMotion && N > 0 && !isEduGameOpen()) {
            const nowMs = performance.now();
            const activeIdx = expandedIndex !== null ? expandedIndex : hoveredIndex;
            if (activeIdx !== null) {
              const ap = planes[activeIdx];
              if (ap && ap.card && ap.texture && (!ap.lastAnimMs || nowMs - ap.lastAnimMs > 46)) {
                ap.lastAnimMs = nowMs;
                drawEduCardFrame(ap.card.ctx, ap.card.w, ap.card.h, ap.item, elapsed, 1);
                ap.texture.needsUpdate = true;
              }
            }
            if (typeof makeLoopDriver.__galAnimCursor !== 'number') makeLoopDriver.__galAnimCursor = 0;
            let updated = 0;
            for (let step = 0; step < N && updated < 1; step++) {
              const idx = (makeLoopDriver.__galAnimCursor + step) % N;
              if (idx === activeIdx) continue;
              const p = planes[idx];
              if (p && p.hasFrame && p.card && p.texture && (!p.lastAnimMs || nowMs - p.lastAnimMs > 115)) {
                p.lastAnimMs = nowMs;
                drawEduCardFrame(p.card.ctx, p.card.w, p.card.h, p.item, elapsed, 0);
                p.texture.needsUpdate = true;
                updated++;
              }
            }
            makeLoopDriver.__galAnimCursor = (makeLoopDriver.__galAnimCursor + 1) % N;
          }

          // Batched hover raycast
          if (pointerDirty && !isDragging) {
            pointerDirty = false;
            const hit = raycastAt(pointerClientX, pointerClientY);
            updateCursorStyle(hit);
            if (expandedIndex === null) {
              const hitIdx = hit ? hit.index : null;
              if (hitIdx !== hoveredIndex) {
                hoveredIndex = hitIdx;
                updateCaption(hit);
              }
              setCursorLabelVisible(false);
            } else {
              const overZoomed = hit && hit.index === expandedIndex;
              setCursorLabelVisible(Boolean(overZoomed), overviewOpen ? 'Yopiş' : "Ma'lumot");
            }
          }
        }

        // Update plane transforms and opacities
        _invGroupQuat.copy(sphereGroup.quaternion).invert();
        const exp = zoomState.expand;
        const ov = zoomState.overview;

        for (let i = 0; i < N; i++) {
          const p = planes[i];
          p.mesh.quaternion.copy(_invGroupQuat);

          if (exp > 0.0001 && expandedIndex !== null) {
            if (i === expandedIndex) {
              const ovLift = Math.min(310, Math.max(240, layout.vh * 0.28));
              const availH = layout.vh - ovLift * ov;
              let targetH = availH * 0.76;
              let targetW = targetH * p.aspect;
              if (targetW > layout.vw - 24) {
                targetW = layout.vw - 24;
                targetH = targetW / p.aspect;
              }
              const currW = THREE.MathUtils.lerp(layout.planeSize, targetW, exp);
              const currH = THREE.MathUtils.lerp(layout.planeSize / p.aspect, targetH, exp);
              p.mesh.scale.set(px(currW), px(currH), 1);

              _localTarget.set(0, px(ovLift * 0.48 * ov), 0);
              sphereGroup.worldToLocal(_localTarget);
              p.mesh.position.lerpVectors(p.localPos, _localTarget, exp);
              p.mat.opacity = 1;
            } else {
              const push = 1 + (1.8 - 1) * exp;
              p.mesh.position.copy(p.localPos).multiplyScalar(push);
              const wPx = p.sizePx;
              p.mesh.scale.set(px(wPx), px(wPx / p.aspect), 1);
              p.mat.opacity = p.baseOpacity * (1 - (1 - 0.1) * exp);
            }
          } else {
            p.mesh.position.copy(p.localPos);
            const wPx = p.sizePx;
            p.mesh.scale.set(px(wPx), px(wPx / p.aspect), 1);
            p.mat.opacity = p.baseOpacity;
          }
        }

        const motion = getMotionParallax();
        const camFactor = expandedIndex === null ? 1 : Math.max(0, 1 - zoomState.expand);
        camera.position.x = motion.x * 0.72 * camFactor;
        camera.position.y = -motion.y * 0.48 * camFactor;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      });

      function onResize() {
        layout = getLayout();
        camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(getCapDpr());
        renderer.setSize(window.innerWidth, window.innerHeight);

        const worldW = px(90);
        const mapImg = wordmarkMesh.material.map?.image;
        if (mapImg) {
          wordmarkMesh.scale.set(worldW, worldW * (mapImg.height / mapImg.width), 1);
        }

        for (let i = 0; i < N; i++) {
          const p = planes[i];
          p.fibPos.set(
            p.unit.x * px(layout.radX),
            p.unit.y * px(layout.radY),
            p.unit.z * px(layout.radZ)
          );
          if (introPhase === 'sphere') {
            p.localPos.copy(p.fibPos);
            p.sizePx = layout.planeSize;
          }
        }
      }

      window.addEventListener('resize', onResize);

      return {
        el: section,
        enter() {
          onResize();
          runIntro();
          activeViewDriver = driver;
          if (!isEduGameOpen()) driver.start();
        },
        leave() {
          if (activeViewDriver === driver) activeViewDriver = null;
          driver.stop();
          setCursorLabelVisible(false);
          updateCaption(null);
        }
      };
    };

    // ── 4. View 2: Projects (WebGL Grid + Glass-Lens Post Pass) ──────────
    viewBuilders.projects = () => {
      const section = document.getElementById('view-projects');
      const host = document.getElementById('proj-canvas');
      const bubbleEl = document.getElementById('proj-view-bubble');

      const projItems = ITEMS;
      const touch = isTouchDevice();

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setClearColor(isDayMode() ? 0xe4edfa : 0x05070e, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = isDayMode() ? 1.06 : 1.15;
      const getDpr = () => getCapDpr();
      renderer.setPixelRatio(getDpr());
      renderer.setSize(window.innerWidth, window.innerHeight);
      host.appendChild(renderer.domElement);

      const gl = renderer.getContext();
      const canFloatRt = renderer.capabilities.isWebGL2 && Boolean(gl.getExtension('EXT_color_buffer_float'));

      let rt = null;
      function makeRenderTarget() {
        const dpr = getDpr();
        const rw = Math.max(1, Math.floor(window.innerWidth * dpr));
        const rh = Math.max(1, Math.floor(window.innerHeight * dpr));
        const vw = window.innerWidth;
        if (rt) rt.dispose();
        rt = new THREE.WebGLRenderTarget(rw, rh, {
          samples: (isSoftwareGl || touch || vw >= 1440) ? 0 : 2,
          type: canFloatRt ? THREE.HalfFloatType : THREE.UnsignedByteType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter
        });
      }
      makeRenderTarget();

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isDayMode() ? 0xe4edfa : 0x05070e);

      // Photorealistic Living 3D Quartz Crystal Backdrop + Multi-Depth Dust inside Projects scene
      const projCrystal = createCrystalField({
        renderer,
        scale: 175,
        shardCount: 14,
        spreadX: 1550,
        spreadY: 960,
        spreadZ: 420,
        opacity: 0.92,
        includeFlanks: true,
        theme: getTheme()
      });
      scene.add(projCrystal.group);

      const fov = 35;
      const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / Math.max(1, window.innerHeight), 1, 8000);
      let baseCamZ = 1000;
      function syncCamera() {
        const w = window.innerWidth;
        const h = Math.max(1, window.innerHeight);
        baseCamZ = (h / 2) / Math.tan((fov * Math.PI / 180) / 2);
        camera.aspect = w / h;
        camera.position.set(w / 2, -h / 2, baseCamZ);
        camera.lookAt(w / 2, -h / 2, 0);
        camera.updateProjectionMatrix();

        const crystalRatio = Math.max(0.55, Math.min(1.25, Math.min(w, h) / 900));
        projCrystal.group.position.set(w / 2, -h / 2, -520);
        projCrystal.group.scale.setScalar(crystalRatio);
      }
      syncCamera();

      const scrollGroup = new THREE.Group();
      scene.add(scrollGroup);

      // Post-processing glass-lens pass
      const postScene = new THREE.Scene();
      const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const postMat = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: rt.texture }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          varying vec2 vUv;

          void main() {
            float band = 0.08;
            float t = 0.0;
            float dir = 0.0;
            if (vUv.y > 1.0 - band) {
              t = (vUv.y - (1.0 - band)) / band;
              dir = -1.0;
            } else if (vUv.y < band) {
              t = (band - vUv.y) / band;
              dir = 1.0;
            }

            vec3 col;
            if (t > 0.0) {
              float sag = 1.0 - sqrt(max(0.0, 1.0 - t * t));
              float distortion = sag * band * 1.0;
              vec2 baseUv = vec2(vUv.x, clamp(vUv.y + dir * distortion, 0.0, 1.0));

              vec3 acc = vec3(0.0);
              vec3 wSum = vec3(0.0);
              for (int i = 0; i < 16; i++) {
                float fi = float(i) / 15.0;
                float off = (fi - 0.5) * 0.01 * distortion * 30.0;
                vec2 suv = clamp(baseUv + vec2(0.0, off), 0.0, 1.0);
                vec3 s = texture2D(tDiffuse, suv).rgb;
                float wr = smoothstep(0.8, 0.2, fi);
                float wg = smoothstep(0.0, 0.5, fi) * smoothstep(1.0, 0.5, fi);
                float wb = smoothstep(0.2, 0.8, fi);
                vec3 w = vec3(wr, wg, wb);
                acc += s * w;
                wSum += w;
              }
              col = acc / max(wSum, vec3(0.0001));
            } else {
              col = texture2D(tDiffuse, vUv).rgb;
            }

            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
        depthTest: false,
        depthWrite: false
      });
      postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

      // Fallback 1x1 dark texture
      const dummyTex = new THREE.DataTexture(new Uint8Array([22, 22, 24, 255]), 1, 1);
      dummyTex.colorSpace = THREE.SRGBColorSpace;
      dummyTex.needsUpdate = true;

      // Headline canvas mesh with scramble animation
      const headlineCanvas = document.createElement('canvas');
      const headlineCtx = headlineCanvas.getContext('2d', { willReadFrequently: true });
      const headlineTex = new THREE.CanvasTexture(headlineCanvas);
      headlineTex.colorSpace = THREE.SRGBColorSpace;
      headlineTex.minFilter = THREE.LinearFilter;
      headlineTex.magFilter = THREE.LinearFilter;
      headlineTex.generateMipmaps = false;

      const headlineMat = new THREE.MeshBasicMaterial({ map: headlineTex, transparent: true, opacity: 0, depthWrite: false });
      const headlineMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), headlineMat);
      scrollGroup.add(headlineMesh);

      const SCRAMBLE_GLYPHS = ['.', ':', '·', ',', ';', '_'];
      const headlineRuns = () => ({
        desktop: [
          { text: `${st('hero1')} `, font: '500 16px "Nunito", ui-sans-serif, sans-serif', tracking: -0.16, color: '#ededeb' },
          { text: st('hero2'), font: '400 17px "Nunito", ui-serif, serif', tracking: 0, color: '#ededeb' }
        ],
        phone: [
          { text: `${st('hero1')} `, font: '500 16px "Nunito", ui-sans-serif, sans-serif', tracking: -0.16, color: '#ededeb' },
          { text: st('short'), font: '400 17px "Nunito", ui-serif, serif', tracking: 0, color: '#ededeb' }
        ]
      });

      const scrambleSeeds = [];
      for (let i = 0; i < 80; i++) {
        scrambleSeeds.push({
          rand: Math.random(),
          glyph: SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)]
        });
      }

      function drawTrackedText(ctx, text, x, y, tracking) {
        if (!tracking) {
          ctx.fillText(text, x, y);
          return ctx.measureText(text).width;
        }
        let cx = x;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          ctx.fillText(ch, cx, y);
          cx += ctx.measureText(ch).width + tracking;
        }
        return cx - x;
      }

      function measureTracked(ctx, text, tracking) {
        if (!tracking) return ctx.measureText(text).width;
        let w = 0;
        for (let i = 0; i < text.length; i++) {
          w += ctx.measureText(text[i]).width + (i < text.length - 1 ? tracking : 0);
        }
        return w;
      }

      let headlineProg = reducedMotion ? 1 : 0;

      function drawHeadline(progress) {
        const vw = window.innerWidth;
        const isPhone = vw <= 640;
        const dpr = getDpr();
        const cw = vw;
        const ch = isPhone ? 56 : 36;
        if (headlineCanvas.width !== Math.floor(cw * dpr) || headlineCanvas.height !== Math.floor(ch * dpr)) {
          headlineCanvas.width = Math.floor(cw * dpr);
          headlineCanvas.height = Math.floor(ch * dpr);
        }
        const ctx = headlineCtx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cw, ch);
        ctx.textBaseline = 'middle';

        const resolveStr = (str, offsetIdx) => {
          if (progress >= 1) return str;
          let out = '';
          const len = str.length || 1;
          for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            if (ch === ' ') { out += ' '; continue; }
            const pos = (offsetIdx + i) / 55;
            const seed = scrambleSeeds[(offsetIdx + i) % scrambleSeeds.length];
            const threshold = 0.7 * pos + 0.3 * seed.rand;
            out += progress >= threshold ? ch : seed.glyph;
          }
          return out;
        };

        const inkColor = isDayMode() ? '#0f172a' : '#ededeb';

        if (!isPhone) {
          const runs = headlineRuns().desktop;
          ctx.font = runs[0].font;
          const w0 = measureTracked(ctx, runs[0].text, runs[0].tracking);
          ctx.font = runs[1].font;
          const w1 = measureTracked(ctx, runs[1].text, runs[1].tracking);
          const totalW = w0 + w1;
          let sx = (cw - totalW) / 2;
          const cy = ch / 2;

          ctx.font = runs[0].font;
          ctx.fillStyle = inkColor;
          drawTrackedText(ctx, resolveStr(runs[0].text, 0), sx, cy, runs[0].tracking);
          sx += w0;
          ctx.font = runs[1].font;
          ctx.fillStyle = inkColor;
          drawTrackedText(ctx, resolveStr(runs[1].text, runs[0].text.length), sx, cy, runs[1].tracking);
        } else {
          const runs = headlineRuns().phone;
          ctx.textAlign = 'center';
          ctx.font = runs[0].font;
          ctx.fillStyle = inkColor;
          ctx.fillText(resolveStr(runs[0].text, 0), cw / 2, 16);
          ctx.font = runs[1].font;
          ctx.fillStyle = inkColor;
          ctx.fillText(resolveStr(runs[1].text, runs[0].text.length), cw / 2, 36);
          ctx.textAlign = 'left';
        }

        headlineTex.needsUpdate = true;
        headlineMesh.scale.set(cw, ch, 1);
        const topOffset = Math.max(150, Math.round(window.innerHeight * 0.16));
        headlineMesh.position.set(cw / 2, -(topOffset + ch / 2), 0);
      }

      // Footer mesh
      const footerCanvas = document.createElement('canvas');
      const footerCtx = footerCanvas.getContext('2d', { willReadFrequently: true });
      const footerTex = new THREE.CanvasTexture(footerCanvas);
      footerTex.colorSpace = THREE.SRGBColorSpace;
      footerTex.minFilter = THREE.LinearFilter;
      footerTex.magFilter = THREE.LinearFilter;
      footerTex.generateMipmaps = false;
      const footerMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: footerTex, transparent: true, depthWrite: false })
      );
      scrollGroup.add(footerMesh);

      function drawFooter(yTop) {
        const vw = window.innerWidth;
        const isPhone = vw <= 640;
        const dpr = getDpr();
        const ch = 28;
        footerCanvas.width = Math.floor(vw * dpr);
        footerCanvas.height = Math.floor(ch * dpr);
        const ctx = footerCtx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, ch);
        ctx.font = '400 13px "Nunito", ui-serif, serif';
        ctx.fillStyle = isDayMode() ? '#475569' : '#8a8a88';
        ctx.textBaseline = 'middle';
        if (!isPhone) {
          ctx.textAlign = 'center';
          ctx.fillText(`VESNA PRO — ${st('subtitle')}`, vw / 2, ch / 2);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText('VESNA', 8, ch / 2);
          ctx.textAlign = 'right';
          ctx.fillText('Boşlanğiç · Ş Ç Ö Ğ', vw - 8, ch / 2);
        }
        footerTex.needsUpdate = true;
        footerMesh.scale.set(vw, ch, 1);
        footerMesh.position.set(vw / 2, -(yTop + ch / 2), 0);
      }

      // Text caption helper for tile title/category
      function makeCaptionTexture(text, font, color) {
        const dpr = getDpr();
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.font = font;
        const w = Math.ceil(ctx.measureText(text).width + 6);
        const h = 20;
        c.width = w * dpr;
        c.height = h * dpr;
        ctx.scale(dpr, dpr);
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 1, h / 2);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        return { tex, w, h };
      }

      function makeChipLabel(indexNum, category) {
        const dpr = getDpr();
        const txt = `${String(indexNum + 1).padStart(2, '0')}  ${category}`;
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d', { willReadFrequently: true });
        const font = '500 12px "Nunito", ui-sans-serif, sans-serif';
        ctx.font = font;
        const tw = Math.ceil(ctx.measureText(txt).width);
        const w = tw + 16; // 8px sides
        const h = 12 + 6 + 4; // 6px top, 4px bottom
        c.width = w * dpr;
        c.height = h * dpr;
        ctx.scale(dpr, dpr);
        ctx.font = font;
        ctx.fillStyle = '#ededeb';
        ctx.textBaseline = 'top';
        ctx.fillText(txt, 8, 6);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        return { tex, w, h };
      }

      const tileGeo = new THREE.PlaneGeometry(1, 1);
      const tiles = [];

      const TILE_VERT = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const TILE_FRAG = `
        uniform sampler2D uTex;
        uniform sampler2D uTex2;
        uniform float uMix;
        uniform float uReveal;
        uniform float uOpacity;
        uniform float uTime;
        uniform float uDayMix;
        varying vec2 vUv;

        void main() {
          float sweep = fract(uTime * 0.6);
          float band = smoothstep(0.18, 0.0, abs((vUv.x + vUv.y) * 0.5 - sweep)) * 0.035;
          vec3 skelDark = vec3(0.085 + band);
          vec3 skelLight = vec3(0.86 + band * 0.8, 0.91 + band * 0.8, 0.98);
          vec3 skel = mix(skelDark, skelLight, uDayMix);
          vec3 m0 = texture2D(uTex, vUv).rgb;
          vec3 m1 = texture2D(uTex2, vUv).rgb;
          vec3 media = mix(m0, m1, uMix);

          // Liquid Glass specular edge & diagonal caustic sheen
          float ex = min(vUv.x, 1.0 - vUv.x);
          float ey = min(vUv.y, 1.0 - vUv.y);
          float edge = pow(1.0 - clamp(min(ex, ey) * 14.0, 0.0, 1.0), 2.0);
          float diag = vUv.x * 0.75 + vUv.y * 0.55 - fract(uTime * 0.16) * 2.2 + 0.5;
          float caustic = smoothstep(0.18, 0.0, abs(diag)) * (0.05 + 0.08 * uMix);
          vec3 glowCol = mix(vec3(0.72, 0.88, 1.0), vec3(1.0, 1.0, 1.0), uDayMix);
          media += glowCol * (edge * (0.09 + 0.14 * uMix) + caustic * mix(1.0, 0.55, uDayMix));

          vec3 col = mix(skel, media, uReveal);
          gl_FragColor = vec4(col, uOpacity);
        }
      `;

      const CHIP_FRAG = `
        uniform sampler2D uTex;
        uniform sampler2D uTex2;
        uniform sampler2D uLabelTex;
        uniform vec4 uTileRect;
        uniform vec2 uBlurRadiusUv;
        uniform vec2 uChipSize;
        uniform float uMix;
        uniform float uReveal;
        uniform float uOpacity;
        uniform float uDayMix;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
        }

        void main() {
          vec2 p = (vUv - 0.5) * uChipSize;
          float d = roundedBoxSDF(p, uChipSize * 0.5, 4.0);
          float alphaMask = 1.0 - smoothstep(-0.75, 0.75, d);
          if (alphaMask <= 0.001) discard;

          vec2 tileUv = vec2(
            mix(uTileRect.x, uTileRect.z, vUv.x),
            mix(uTileRect.y, uTileRect.w, vUv.y)
          );

          vec3 blurCol = vec3(0.0);
          for (int i = 0; i < 12; i++) {
            float fi = float(i);
            float r = sqrt((fi + 0.5) / 12.0);
            float theta = fi * 2.39996323;
            vec2 off = vec2(cos(theta), sin(theta)) * r * uBlurRadiusUv;
            vec2 suv = clamp(tileUv + off, 0.0, 1.0);
            vec3 s0 = texture2D(uTex, suv).rgb;
            vec3 s1 = texture2D(uTex2, suv).rgb;
            blurCol += mix(s0, s1, uMix);
          }
          blurCol /= 12.0;

          vec3 skelChip = mix(vec3(0.085), vec3(0.90, 0.94, 0.99), uDayMix);
          vec3 mediaBlur = mix(skelChip, blurCol, uReveal);
          vec3 tintTarget = mix(vec3(0.05), vec3(0.97, 0.985, 1.0), uDayMix);
          vec3 bg = mix(mediaBlur, tintTarget, mix(0.45, 0.62, uDayMix));
          vec4 lbl = texture2D(uLabelTex, vUv);
          vec3 lblTint = mix(lbl.rgb, vec3(0.06, 0.09, 0.16), uDayMix);
          vec3 col = mix(bg, lblTint, lbl.a);
          gl_FragColor = vec4(col, alphaMask * uOpacity);
        }
      `;

      const initialDayMix = isDayMode() ? 1 : 0;
      for (let i = 0; i < projItems.length; i++) {
        const item = projItems[i];
        const tileMat = new THREE.ShaderMaterial({
          uniforms: {
            uTex: { value: dummyTex },
            uTex2: { value: dummyTex },
            uMix: { value: 0 },
            uReveal: { value: 0 },
            uOpacity: { value: 0 },
            uTime: { value: 0 },
            uDayMix: { value: initialDayMix }
          },
          vertexShader: TILE_VERT,
          fragmentShader: TILE_FRAG,
          transparent: true,
          depthWrite: false
        });
        const tileMesh = new THREE.Mesh(tileGeo, tileMat);

        const chipLbl = makeChipLabel(i, item.category);
        const chipMat = new THREE.ShaderMaterial({
          uniforms: {
            uTex: { value: dummyTex },
            uTex2: { value: dummyTex },
            uLabelTex: { value: chipLbl.tex },
            uTileRect: { value: new THREE.Vector4(0, 0, 1, 1) },
            uBlurRadiusUv: { value: new THREE.Vector2(0.08, 0.14) },
            uChipSize: { value: new THREE.Vector2(chipLbl.w, chipLbl.h) },
            uMix: { value: 0 },
            uReveal: { value: 0 },
            uOpacity: { value: 0 },
            uDayMix: { value: initialDayMix }
          },
          vertexShader: TILE_VERT,
          fragmentShader: CHIP_FRAG,
          transparent: true,
          depthWrite: false
        });
        const chipMesh = new THREE.Mesh(tileGeo, chipMat);
        chipMesh.renderOrder = 2;

        const titleInfo = makeCaptionTexture(item.title, '500 12px "Nunito", ui-sans-serif, sans-serif', '#ffffff');
        const titleMat = new THREE.MeshBasicMaterial({
          map: titleInfo.tex,
          color: isDayMode() ? 0x0f172a : 0xededeb,
          transparent: true,
          opacity: 0,
          depthWrite: false
        });
        const titleMesh = new THREE.Mesh(tileGeo, titleMat);

        const catInfo = makeCaptionTexture(`${item.category}, ${item.year}`, '400 13px "Nunito", ui-serif, serif', '#ffffff');
        const catMat = new THREE.MeshBasicMaterial({
          map: catInfo.tex,
          color: isDayMode() ? 0x475569 : 0x8a8a88,
          transparent: true,
          opacity: 0,
          depthWrite: false
        });
        const catMesh = new THREE.Mesh(tileGeo, catMat);

        scrollGroup.add(tileMesh, chipMesh, titleMesh, catMesh);

        const tState = {
          index: i,
          item,
          tileMesh,
          tileMat,
          chipMesh,
          chipMat,
          chipW: chipLbl.w,
          chipH: chipLbl.h,
          titleMesh,
          titleMat,
          titleW: titleInfo.w,
          titleH: titleInfo.h,
          catMesh,
          catMat,
          catW: catInfo.w,
          catH: catInfo.h,
          col: 0,
          row: 0,
          x: 0,
          yTop: 0,
          tileW: 100,
          tileH: 56,
          riseOffset: reducedMotion ? 0 : 60,
          opacityVal: reducedMotion ? 1 : 0,
          loading: false,
          stillReady: false,
          videoTex: null
        };
        tileMesh.userData.tileState = tState;
        tiles.push(tState);
      }

      let pageHeight = 1000;
      let targetScroll = 0;
      let currentScroll = 0;
      let scrollVel = 0;

      let lastFooterTop = 0;

      function layoutGrid() {
        const vw = window.innerWidth;
        const vh = Math.max(1, window.innerHeight);
        const isPhone = vw <= 640;
        const isBig = vw >= 1440;
        const cols = vw >= 1840 ? 5 : (vw > 960 ? 4 : (vw > 600 ? 3 : 2));
        const pad = isBig ? Math.round(Math.min(44, vw * 0.022)) : 12;
        const colGap = isBig ? 16 : 12;
        const rowGap = isBig ? 40 : 32;
        const tileW = (vw - pad * 2 - (cols - 1) * colGap) / cols;
        const tileH = tileW * (9 / 16);

        drawHeadline(headlineProg);
        const headlineH = isPhone ? 56 : 36;
        const topOffset = Math.max(150, Math.round(vh * 0.16));
        const gridTop = topOffset + headlineH + (isBig ? 56 : 48);
        const blockHeight = tileH + 10 + 16 + 4 + 16; // tile + 10px + title + 4px + cat

        let maxBottom = gridTop;
        for (let i = 0; i < tiles.length; i++) {
          const t = tiles[i];
          const col = i % cols;
          const row = Math.floor(i / cols);
          const xLeft = pad + col * (tileW + colGap);
          const yTop = gridTop + row * (blockHeight + rowGap);

          const chipMaxW = Math.max(40, tileW - 16);
          const chipScale = t.chipW > chipMaxW ? chipMaxW / t.chipW : 1;
          t.drawChipW = t.chipW * chipScale;
          t.drawChipH = t.chipH * chipScale;

          const titleScale = t.titleW > tileW ? tileW / t.titleW : 1;
          t.drawTitleW = t.titleW * titleScale;
          t.drawTitleH = t.titleH * titleScale;

          const catScale = t.catW > tileW ? tileW / t.catW : 1;
          t.drawCatW = t.catW * catScale;
          t.drawCatH = t.catH * catScale;

          t.col = col;
          t.row = row;
          t.x = xLeft;
          t.yTop = yTop;
          t.tileW = tileW;
          t.tileH = tileH;

          t.tileMesh.scale.set(tileW, tileH, 1);
          t.chipMesh.scale.set(t.drawChipW, t.drawChipH, 1);
          t.titleMesh.scale.set(t.drawTitleW, t.drawTitleH, 1);
          t.catMesh.scale.set(t.drawCatW, t.drawCatH, 1);

          const u0 = 8 / tileW;
          const u1 = (8 + t.drawChipW) / tileW;
          const v1 = 1 - 8 / tileH;
          const v0 = 1 - (8 + t.drawChipH) / tileH;
          t.chipMat.uniforms.uTileRect.value.set(u0, v0, u1, v1);
          t.chipMat.uniforms.uBlurRadiusUv.value.set(40 / tileW, 40 / tileH);

          maxBottom = Math.max(maxBottom, yTop + blockHeight);
        }

        const footerTop = maxBottom + 240;
        lastFooterTop = footerTop;
        drawFooter(footerTop);
        pageHeight = Math.max(vh, footerTop + 100);
        const maxScroll = Math.max(0, pageHeight - vh);
        targetScroll = Math.min(targetScroll, maxScroll);
        currentScroll = Math.min(currentScroll, maxScroll);
      }

      layoutGrid();

      onThemeChange((theme) => {
        const day = theme === 'light';
        const bgHex = day ? 0xe4edfa : 0x05070e;
        scene.background.setHex(bgHex);
        renderer.setClearColor(bgHex, 1);
        renderer.toneMappingExposure = day ? 1.06 : 1.15;
        projCrystal.setTheme(theme);
        drawHeadline(headlineProg);
        if (lastFooterTop > 0) drawFooter(lastFooterTop);
        const titleHex = day ? 0x0f172a : 0xededeb;
        const catHex = day ? 0x475569 : 0x8a8a88;
        const dayMix = day ? 1 : 0;
        tiles.forEach((t) => {
          t.titleMat.color.setHex(titleHex);
          t.catMat.color.setHex(catHex);
          t.tileMat.uniforms.uDayMix.value = dayMix;
          t.chipMat.uniforms.uDayMix.value = dayMix;
          if (t.stillCard && t.stillTex) {
            drawEduCardFrame(t.stillCard.ctx, t.stillCard.w, t.stillCard.h, t.item, 0, 0);
            t.stillTex.needsUpdate = true;
          }
          if (t.liveCard && t.videoTex) {
            drawEduCardFrame(t.liveCard.ctx, t.liveCard.w, t.liveCard.h, t.item, 0, 1);
            t.videoTex.needsUpdate = true;
          }
        });
      });

      let entrancePlayed = false;
      function playEntrance() {
        if (entrancePlayed) return;
        entrancePlayed = true;

        if (reducedMotion) {
          headlineProg = 1;
          headlineMat.opacity = 1;
          drawHeadline(1);
          tiles.forEach((t) => {
            t.opacityVal = 1;
            t.riseOffset = 0;
          });
          return;
        }

        gsap.to(headlineMat, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        const hp = { p: 0 };
        gsap.to(hp, {
          p: 1,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            headlineProg = hp.p;
            drawHeadline(hp.p);
          }
        });

        tiles.forEach((t) => {
          const delay = 0.35 + 0.08 * t.col + 0.06 * t.row;
          gsap.to(t, { opacityVal: 1, duration: 0.9, delay, ease: 'power2.out' });
          gsap.to(t, { riseOffset: 0, duration: 1.2, delay, ease: 'expo.out' });
        });
      }

      function loadTileMedia(t) {
        if (t.loading) return;
        t.loading = true;

        const texW = window.innerWidth >= 1440 ? 520 : 400;
        const texH = Math.round(texW * (9 / 16));
        const stillCard = createEduCardCanvas(t.item, texW, texH);
        const stillTex = new THREE.CanvasTexture(stillCard.canvas);
        stillTex.colorSpace = THREE.SRGBColorSpace;
        stillTex.minFilter = THREE.LinearFilter;
        stillTex.magFilter = THREE.LinearFilter;
        stillTex.generateMipmaps = false;

        const liveCard = createEduCardCanvas(t.item, texW, texH);
        drawEduCardFrame(liveCard.ctx, liveCard.w, liveCard.h, t.item, 0, 1);
        const liveTex = new THREE.CanvasTexture(liveCard.canvas);
        liveTex.colorSpace = THREE.SRGBColorSpace;
        liveTex.minFilter = THREE.LinearFilter;
        liveTex.magFilter = THREE.LinearFilter;
        liveTex.generateMipmaps = false;

        t.stillCard = stillCard;
        t.stillTex = stillTex;
        t.liveCard = liveCard;
        t.videoTex = liveTex;
        t.tileMat.uniforms.uTex.value = stillTex;
        t.tileMat.uniforms.uTex2.value = liveTex;
        t.chipMat.uniforms.uTex.value = stillTex;
        t.chipMat.uniforms.uTex2.value = liveTex;
        t.stillReady = true;

        gsap.to(t.tileMat.uniforms.uReveal, { value: 1, duration: 0.8, ease: 'power2.out' });
        gsap.to(t.chipMat.uniforms.uReveal, { value: 1, duration: 0.8, ease: 'power2.out' });
      }

      onBgReady(() => {
        tiles.forEach((t) => {
          if (t.stillCard && t.stillTex) {
            drawEduCardFrame(t.stillCard.ctx, t.stillCard.w, t.stillCard.h, t.item, 0, 0);
            t.stillTex.needsUpdate = true;
          }
          if (t.liveCard && t.videoTex) {
            drawEduCardFrame(t.liveCard.ctx, t.liveCard.w, t.liveCard.h, t.item, 0, 1);
            t.videoTex.needsUpdate = true;
          }
        });
      });

      // Hover & View Bubble
      const bubbleX = gsap.quickTo(bubbleEl, 'x', { duration: 0.5, ease: 'power3.out' });
      const bubbleY = gsap.quickTo(bubbleEl, 'y', { duration: 0.5, ease: 'power3.out' });
      let bubbleShown = false;
      let hoveredTile = null;
      let mobileCenterTile = null;

      function setBubbleVisible(show) {
        if (touch || window.innerWidth <= 1024) show = false;
        if (show === bubbleShown) return;
        bubbleShown = show;
        gsap.killTweensOf(bubbleEl, 'opacity,scale');
        gsap.to(bubbleEl, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.6,
          duration: show ? 0.75 : 0.6,
          ease: 'power4.out'
        });
      }

      function setActiveVideoTile(nextTile, isDesktopHover) {
        for (const t of tiles) {
          const active = t === nextTile;
          const targetMix = active ? 1 : 0;
          if (Math.abs(t.tileMat.uniforms.uMix.value - targetMix) > 0.001) {
            gsap.to(t.tileMat.uniforms.uMix, { value: targetMix, duration: 0.45, ease: 'power2.out' });
            gsap.to(t.chipMat.uniforms.uMix, { value: targetMix, duration: 0.45, ease: 'power2.out' });
          }
        }
        if (isDesktopHover) {
          host.style.cursor = nextTile ? 'pointer' : 'default';
          setBubbleVisible(Boolean(nextTile));
        }
      }

      // Open playable educational game
      let lightboxOpen = false;
      function openLightbox(item) {
        lightboxOpen = true;
        setBubbleVisible(false);
        openEduGame(item, () => {
          lightboxOpen = false;
        });
      }

      function closeLightbox() {
        if (!lightboxOpen) return;
        lightboxOpen = false;
        closeEduGame();
      }

      // Scroll & Raycast Input
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2(-99, -99);
      let pointerX = -999;
      let pointerY = -999;
      let pointerDirty = false;
      let touchStartY = 0;
      let touchLastY = 0;
      let touchMoved = 0;
      let isTouchDown = false;

      host.addEventListener('wheel', (e) => {
        if (isEduGameOpen()) return;
        e.preventDefault();
        const maxS = Math.max(0, pageHeight - window.innerHeight);
        targetScroll = Math.max(0, Math.min(maxS, targetScroll + e.deltaY));
        pointerDirty = true;
      }, { passive: false });

      host.addEventListener('touchstart', (e) => {
        if (isEduGameOpen() || e.touches.length !== 1) return;
        isTouchDown = true;
        touchStartY = touchLastY = e.touches[0].clientY;
        touchMoved = 0;
        scrollVel = 0;
      }, { passive: true });

      host.addEventListener('touchmove', (e) => {
        if (!isTouchDown || isEduGameOpen() || e.touches.length !== 1) return;
        const y = e.touches[0].clientY;
        const dy = touchLastY - y;
        touchMoved += Math.abs(dy);
        touchLastY = y;
        scrollVel = dy;
        const maxS = Math.max(0, pageHeight - window.innerHeight);
        targetScroll = Math.max(0, Math.min(maxS, targetScroll + dy));
      }, { passive: true });

      host.addEventListener('touchend', () => {
        isTouchDown = false;
      });

      window.addEventListener('pointermove', (e) => {
        if (currentRoute !== 'projects' || isEduGameOpen()) return;
        pointerX = e.clientX;
        pointerY = e.clientY;
        pointerDirty = true;
        if (!touch && window.innerWidth > 1024) {
          bubbleX(e.clientX - 32);
          bubbleY(e.clientY - 32);
        }
      });

      host.addEventListener('pointerleave', () => {
        if (!touch && window.innerWidth > 1024) {
          hoveredTile = null;
          setActiveVideoTile(null, true);
        }
      });

      host.addEventListener('click', (e) => {
        if (isEduGameOpen() || touchMoved > 10) return;
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(tiles.map((t) => t.tileMesh), false);
        if (hits.length) {
          openLightbox(hits[0].object.userData.tileState.item);
        }
      });

      const driver = makeLoopDriver(renderer, (dt, elapsed) => {
        const frameScale = dt * 60;
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const maxS = Math.max(0, pageHeight - vh);

        if (!isTouchDown && Math.abs(scrollVel) > 0.05) {
          scrollVel *= Math.pow(0.95, frameScale);
          targetScroll = Math.max(0, Math.min(maxS, targetScroll + scrollVel * frameScale));
        }

        const ease = 1 - Math.pow(1 - 0.12, frameScale);
        currentScroll += (targetScroll - currentScroll) * ease;
        scrollGroup.position.y = currentScroll;

        // Visible loading & tile updates
        const minLoadY = currentScroll - 0.6 * vh;
        const maxLoadY = currentScroll + 2.6 * vh;

        let closestCenterTile = null;
        let closestDist = Infinity;
        const viewCenterY = currentScroll + vh / 2;

        for (let i = 0; i < tiles.length; i++) {
          const t = tiles[i];
          const yBottom = t.yTop + t.tileH;
          if (!t.loading && yBottom >= minLoadY && t.yTop <= maxLoadY) {
            loadTileMedia(t);
          }

          t.tileMat.uniforms.uTime.value = elapsed;
          t.tileMat.uniforms.uOpacity.value = t.opacityVal;
          t.chipMat.uniforms.uOpacity.value = t.opacityVal;
          t.titleMat.opacity = t.opacityVal;
          t.catMat.opacity = t.opacityVal;

          const rise = t.riseOffset;
          const cx = t.x + t.tileW / 2;
          const cy = -(t.yTop + t.tileH / 2 + rise);
          t.tileMesh.position.set(cx, cy, 0);
          const cw = t.drawChipW || t.chipW;
          const ch = t.drawChipH || t.chipH;
          const tw = t.drawTitleW || t.titleW;
          const th = t.drawTitleH || t.titleH;
          const ctw = t.drawCatW || t.catW;
          const cth = t.drawCatH || t.catH;
          t.chipMesh.position.set(t.x + 8 + cw / 2, -(t.yTop + 8 + ch / 2 + rise), 0.1);
          t.titleMesh.position.set(t.x + tw / 2, -(t.yTop + t.tileH + 10 + th / 2 + rise), 0);
          t.catMesh.position.set(t.x + ctw / 2, -(t.yTop + t.tileH + 10 + 16 + 4 + cth / 2 + rise), 0);

          const tileCenterY = t.yTop + t.tileH / 2;
          const dist = Math.abs(tileCenterY - viewCenterY);
          if (dist < closestDist) {
            closestDist = dist;
            closestCenterTile = t;
          }
        }

        const activeTile = (touch || vw <= 1024) ? mobileCenterTile : hoveredTile;
        if (!reducedMotion && !isEduGameOpen()) {
          const nowMs = performance.now();
          if (activeTile && activeTile.liveCard && activeTile.videoTex && (!activeTile.lastAnimMs || nowMs - activeTile.lastAnimMs > 46)) {
            activeTile.lastAnimMs = nowMs;
            drawEduCardFrame(activeTile.liveCard.ctx, activeTile.liveCard.w, activeTile.liveCard.h, activeTile.item, elapsed, 1);
            activeTile.videoTex.needsUpdate = true;
          }
          const visibleTiles = tiles.filter(
            (t) => t.stillReady && t.yTop + t.tileH >= currentScroll - 80 && t.yTop <= currentScroll + vh + 80
          );
          if (visibleTiles.length > 0) {
            if (typeof makeLoopDriver.__projAnimCursor !== 'number') makeLoopDriver.__projAnimCursor = 0;
            const vt = visibleTiles[makeLoopDriver.__projAnimCursor % visibleTiles.length];
            if (vt && vt !== activeTile && (!vt.lastAnimMs || nowMs - vt.lastAnimMs >= 115)) {
              vt.lastAnimMs = nowMs;
              const mix = vt.tileMat.uniforms.uMix.value;
              if (mix < 0.98 && vt.stillCard && vt.stillTex) {
                drawEduCardFrame(vt.stillCard.ctx, vt.stillCard.w, vt.stillCard.h, vt.item, elapsed, 0);
                vt.stillTex.needsUpdate = true;
              }
              if (mix > 0.02 && vt.liveCard && vt.videoTex) {
                drawEduCardFrame(vt.liveCard.ctx, vt.liveCard.w, vt.liveCard.h, vt.item, elapsed, 1);
                vt.videoTex.needsUpdate = true;
              }
            }
            makeLoopDriver.__projAnimCursor = (makeLoopDriver.__projAnimCursor + 1) % visibleTiles.length;
          }
        }

        if (touch || vw <= 1024) {
          if (closestCenterTile !== mobileCenterTile) {
            mobileCenterTile = closestCenterTile;
            setActiveVideoTile(mobileCenterTile, false);
          }
        } else if (pointerDirty && !isEduGameOpen()) {
          pointerDirty = false;
          const rect = renderer.domElement.getBoundingClientRect();
          ndc.x = ((pointerX - rect.left) / rect.width) * 2 - 1;
          ndc.y = -((pointerY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(ndc, camera);
          const hits = raycaster.intersectObjects(tiles.map((t) => t.tileMesh), false);
          const hitTile = hits.length ? hits[0].object.userData.tileState : null;
          if (hitTile !== hoveredTile) {
            hoveredTile = hitTile;
            setActiveVideoTile(hoveredTile, true);
          }
        }

        const motion = getMotionParallax();
        camera.position.set(vw / 2 + motion.x * 58, -vh / 2 - motion.y * 38, baseCamZ);
        camera.lookAt(vw / 2, -vh / 2, 0);
        projCrystal.update(elapsed, motion.x, motion.y);

        renderer.setRenderTarget(rt);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCam);
      });

      function onResize() {
        renderer.setPixelRatio(getDpr());
        renderer.setSize(window.innerWidth, window.innerHeight);
        makeRenderTarget();
        postMat.uniforms.tDiffuse.value = rt.texture;
        syncCamera();
        layoutGrid();
      }
      window.addEventListener('resize', onResize);

      return {
        el: section,
        enter() {
          onResize();
          playEntrance();
          activeViewDriver = driver;
          if (!isEduGameOpen()) driver.start();
        },
        leave() {
          if (activeViewDriver === driver) activeViewDriver = null;
          driver.stop();
          setBubbleVisible(false);
          closeLightbox();
        }
      };
    };

    // ── 5. View 3: About (Chrome Bot + Magnetic Horizontal Track) ─────────
    viewBuilders.about = () => {
      const section = document.getElementById('view-about');
      const host = document.getElementById('about-canvas');
      const scrollHint = document.getElementById('about-scroll-hint');
      const scrollArrow = document.getElementById('about-scroll-arrow');
      const touch = isTouchDevice();

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setClearColor(isDayMode() ? 0xe4edfa : 0x05070e, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      const getDpr = () => getCapDpr();
      renderer.setPixelRatio(getDpr());
      renderer.setSize(window.innerWidth, window.innerHeight);
      host.appendChild(renderer.domElement);

      const gl = renderer.getContext();
      const canHalfFloat = renderer.capabilities.isWebGL2 && Boolean(gl.getExtension('EXT_color_buffer_float'));

      let bgTarget = null;
      function makeBgTarget() {
        const dpr = getDpr();
        const rw = Math.max(1, Math.floor(window.innerWidth * dpr));
        const rh = Math.max(1, Math.floor(window.innerHeight * dpr));
        if (bgTarget) bgTarget.dispose();
        bgTarget = new THREE.WebGLRenderTarget(rw, rh, {
          type: canHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter
        });
      }
      makeBgTarget();

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isDayMode() ? 0xe4edfa : 0x05070e);

      const fov = 45;
      const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 100);
      camera.position.set(0, 0, 13);

      // Photorealistic Living 3D Quartz Crystal Backdrop + Multi-Depth Dust inside About scene
      const aboutCrystal = createCrystalField({
        renderer,
        scale: 1.5,
        shardCount: 14,
        spreadX: 17,
        spreadY: 9.5,
        spreadZ: 5,
        opacity: 0.9,
        includeFlanks: true,
        theme: getTheme()
      });
      aboutCrystal.group.position.set(0, 0, -14);
      scene.add(aboutCrystal.group);

      // PMREM black room studio environment
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x0a0a0b);

      function addEnvPanel(w, h, pos, lookAt, intensity) {
        const geo = new THREE.PlaneGeometry(w, h);
        const col = new THREE.Color().setScalar(intensity);
        const mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(pos[0], pos[1], pos[2]);
        m.lookAt(lookAt[0], lookAt[1], lookAt[2]);
        envScene.add(m);
      }
      addEnvPanel(14, 5, [0, 6, 0], [0, 0, 0], 1.1);
      addEnvPanel(3.2, 10, [-6, 0, 0], [0, 0, 0], 1.0);
      addEnvPanel(2.4, 10, [6, 0, 0], [0, 0, 0], 0.85);
      addEnvPanel(12, 2.2, [0, -1.5, -6], [0, -1.5, 0], 0.6);
      addEnvPanel(5, 4, [3, 2.5, 6], [0, 0, 0], 0.8);
      addEnvPanel(14, 6, [0, -6, 0], [0, 0, 0], 0.22);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(envScene, 0.04).texture;
      pmrem.dispose();

      // Shared bot shader uniforms
      const botUniforms = {
        uReveal: { value: reducedMotion ? 1 : 0 },
        uMinY: { value: -1.4 },
        uMaxY: { value: 1.5 },
        uBand: { value: 0.97 },
        uTime: { value: 0 },
        uHoverPos: { value: new THREE.Vector3(0, 0, 0) },
        uHover: { value: 0 },
        uBotCenter: { value: new THREE.Vector3(0, 0, -1) },
        uBotScale: { value: 1 },
        uLiquidTint: { value: new THREE.Color(0x8fa0ff) },
        uMeniscusColor: { value: new THREE.Color(0x1621ff) }
      };

      function enhanceBotMaterial(mat) {
        mat.customProgramCacheKey = () => 'krst-bot-mat-v1';
        mat.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, botUniforms);

          shader.vertexShader = 'varying vec3 vBotWorldPos;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `#include <project_vertex>
            vBotWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
          );

          shader.fragmentShader = `
            uniform float uReveal;
            uniform float uMinY;
            uniform float uMaxY;
            uniform float uBand;
            uniform float uTime;
            uniform vec3 uHoverPos;
            uniform float uHover;
            uniform vec3 uBotCenter;
            uniform float uBotScale;
            uniform vec3 uLiquidTint;
            uniform vec3 uMeniscusColor;
            varying vec3 vBotWorldPos;

            float botHash(vec2 p) {
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            float botNoise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              vec2 u = f * f * (3.0 - 2.0 * f);
              return mix(
                mix(botHash(i), botHash(i + vec2(1.0, 0.0)), u.x),
                mix(botHash(i + vec2(0.0, 1.0)), botHash(i + vec2(1.0, 1.0)), u.x),
                u.y
              );
            }
          \n` + shader.fragmentShader;

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <clipping_planes_fragment>',
            `#include <clipping_planes_fragment>
            vec3 botLocal = (vBotWorldPos - uBotCenter) / max(uBotScale, 0.001);
            float bWave = (botNoise(botLocal.xz * 2.5 + vec2(uTime * 0.35, uTime * 0.22)) - 0.5) * 0.95 * (1.0 - uReveal);
            float bLineY = mix(uMinY - uBand, uMaxY + 0.25 * uBand, uReveal) + bWave;
            if (botLocal.y > bLineY && uReveal < 0.999) discard;`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <tonemapping_fragment>',
            `
            float bBandT = clamp((bLineY - botLocal.y) / uBand, 0.0, 1.0);
            float bFadeOut = 1.0 - smoothstep(0.92, 1.0, uReveal);
            float bLiquidMask = (1.0 - bBandT) * bFadeOut;
            gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 1.45 + uLiquidTint * 0.32, bLiquidMask);
            float bMeniscus = pow(1.0 - bBandT, 3.0) * 1.4 * bFadeOut;
            gl_FragColor.rgb += uMeniscusColor * bMeniscus;

            float bDistH = distance(vBotWorldPos, uHoverPos);
            float bHoverGlow = pow(smoothstep(1.09, 0.262, bDistH), 3.0) * 0.4 * uHover;
            gl_FragColor.rgb += uMeniscusColor * bHoverGlow;
            #include <tonemapping_fragment>`
          );
        };
        return mat;
      }

      const chromeMat = enhanceBotMaterial(new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.07
      }));

      const visorMat = enhanceBotMaterial(new THREE.MeshPhysicalMaterial({
        color: 0x040405,
        metalness: 0.3,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.04
      }));

      const eyeMat = enhanceBotMaterial(new THREE.MeshBasicMaterial({
        color: 0xf2f2ee
      }));

      // Assemble bot
      const botRoot = new THREE.Group();
      botRoot.position.set(0, 0, -1);
      scene.add(botRoot);

      const botInner = new THREE.Group();
      botRoot.add(botInner);

      // Head
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), chromeMat);
      headMesh.scale.set(1.1, 1, 0.98);
      botInner.add(headMesh);

      // Visor patch
      const visorGeo = new THREE.SphereGeometry(1, 40, 24, Math.PI / 2 - 1.02, 2.04, Math.PI / 2 - 0.5, 1.0);
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.scale.set(1.1 * 1.015, 1 * 1.015, 0.98 * 1.015);
      botInner.add(visorMesh);

      // Eyes on visor surface
      const eyeGeo = new THREE.CapsuleGeometry(0.075, 0.2, 8, 16);
      const eyes = [];
      [-0.3, 0.3].forEach((ex) => {
        const ey = 0.03;
        const rx = 1.1 * 1.015;
        const ry = 1.015;
        const rz = 0.98 * 1.015;
        const ez = Math.sqrt(Math.max(0.01, 1 - (ex / rx) ** 2 - (ey / ry) ** 2)) * rz + 0.015;
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(ex, ey, ez);
        eye.scale.set(1, 1, 0.45);
        botInner.add(eye);
        eyes.push(eye);
      });

      // Antenna
      const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.42, 24), chromeMat);
      stemMesh.position.set(0, 1.15, 0);
      botInner.add(stemMesh);

      const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.095, 24, 16), chromeMat);
      ballMesh.position.set(0, 1.38, 0);
      botInner.add(ballMesh);

      // Ears
      [-1.1, 1.1].forEach((ex) => {
        const earRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.065, 20, 36), chromeMat);
        earRing.position.set(ex, 0, 0);
        earRing.rotation.y = Math.PI / 2;
        botInner.add(earRing);

        const earCap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 24), visorMat);
        earCap.position.set(ex, 0, 0);
        earCap.rotation.z = Math.PI / 2;
        botInner.add(earCap);
      });

      // Halo under head
      const haloPivot = new THREE.Group();
      haloPivot.position.set(0, -1.28, 0);
      haloPivot.rotation.x = 0.92 * (Math.PI / 2);
      const haloMesh = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.05, 16, 44), chromeMat);
      haloPivot.add(haloMesh);
      botInner.add(haloPivot);

      // Center on bounding box
      const bbox = new THREE.Box3().setFromObject(botInner);
      const bCenter = new THREE.Vector3();
      const bSize = new THREE.Vector3();
      bbox.getCenter(bCenter);
      bbox.getSize(bSize);
      botInner.children.forEach((child) => {
        child.position.sub(bCenter);
      });

      const centeredBox = new THREE.Box3().setFromObject(botInner);
      botUniforms.uMinY.value = centeredBox.min.y;
      botUniforms.uMaxY.value = centeredBox.max.y;
      const botRawHeight = bSize.y || 2.8;

      let botBaseScale = 1;
      function syncBotScale() {
        const vw = window.innerWidth;
        const vh = Math.max(1, window.innerHeight);
        let targetPx = 205;
        if (vw <= 1024) targetPx *= 0.85;
        else if (vw <= 1440) targetPx *= 0.92;
        else targetPx = Math.min(310, Math.max(220, vh * 0.27));
        const visH = 2 * (13 - (-1)) * Math.tan((fov * Math.PI / 180) / 2);
        botBaseScale = (targetPx / vh) * visH / botRawHeight;
        botRoot.scale.setScalar(botBaseScale);
        botUniforms.uBotScale.value = botBaseScale;
      }
      syncBotScale();

      // Lens Disc (z = -8)
      const lensMat = new THREE.ShaderMaterial({
        uniforms: {
          tBg: { value: bgTarget.texture },
          uResolution: { value: new THREE.Vector2(window.innerWidth * getDpr(), window.innerHeight * getDpr()) },
          uDiscCenter: { value: new THREE.Vector2(0.5, 0.5) },
          uDissolve: { value: 0 },
          uGlow: { value: 11.0 },
          uNovaColor: { value: new THREE.Color(0xffffff) },
          uRingColor: { value: new THREE.Color(0x252ba7) }
        },
        vertexShader: `
          varying vec2 vLocalPos;
          void main() {
            vLocalPos = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tBg;
          uniform vec2 uResolution;
          uniform vec2 uDiscCenter;
          uniform float uDissolve;
          uniform float uGlow;
          uniform vec3 uNovaColor;
          uniform vec3 uRingColor;
          varying vec2 vLocalPos;

          void main() {
            float nd = length(vLocalPos);
            if (nd > 1.0) discard;

            vec2 screenUv = gl_FragCoord.xy / uResolution;
            vec2 dir = screenUv - uDiscCenter;
            float dLen = length(dir);
            vec2 nDir = dLen > 0.0001 ? dir / dLen : vec2(0.0);

            float distortFade = 1.0 - smoothstep(0.0, 0.8, uDissolve);
            float zoomPull = 0.5 * 0.30 * nd * nd;
            float rimPull = smoothstep(0.85, 1.0, nd) * 0.2344;
            vec2 pulledUv = screenUv - dir * zoomPull * distortFade - nDir * rimPull * 0.08 * distortFade;

            float dispAmt = smoothstep(0.6, 1.0, nd) * 1.64 * 0.004 * distortFade;
            vec3 bgCol = vec3(0.0);
            if (dispAmt > 0.00001) {
              vec3 acc = vec3(0.0);
              vec3 wSum = vec3(0.0);
              for (int i = 0; i < 8; i++) {
                float fi = float(i) / 7.0;
                float off = (fi - 0.5) * dispAmt * 2.0;
                vec2 suv = clamp(pulledUv + nDir * off, 0.0, 1.0);
                vec3 s = texture2D(tBg, suv).rgb;
                float wr = exp(-pow((fi - 0.18) / 0.28, 2.0));
                float wg = exp(-pow((fi - 0.50) / 0.28, 2.0));
                float wb = exp(-pow((fi - 0.82) / 0.28, 2.0));
                vec3 w = vec3(wr, wg, wb);
                acc += s * w;
                wSum += w;
              }
              bgCol = acc / max(wSum, vec3(0.0001));
            } else {
              bgCol = texture2D(tBg, clamp(pulledUv, 0.0, 1.0)).rgb;
            }

            float lightFade = 1.0 - smoothstep(0.0, 0.6, uDissolve);

            // White nova
            float novaSigma = 4.0 * uGlow * 0.003;
            float nova = exp(-(nd * nd) / (2.0 * novaSigma * novaSigma)) * (0.285 * (uGlow / 17.0) * 1.15);

            // Main #252ba7 ring at 0.49, width 0.08 + wide aura
            float ringCore = exp(-pow((nd - 0.49) / 0.04, 2.0));
            float ringAura = exp(-pow((nd - 0.49) / 0.18, 2.0)) * 0.35;
            float ringInt = (ringCore + ringAura) * (0.9 * (uGlow / 17.0) * 1.8);

            // Thin white rim at 0.483
            float whiteRim = exp(-pow((nd - 0.483) / 0.008, 2.0)) * 0.65;

            // Edge ring at 0.478, width 0.06, softness 1, intensity 1.053
            float edgeRing = smoothstep(0.06, 0.0, abs(nd - 0.478)) * 1.053;

            vec3 lightAdd = (uNovaColor * (nova + whiteRim) + uRingColor * (ringInt + edgeRing)) * lightFade;
            vec3 finalCol = bgCol + lightAdd;

            float edgeFeather = 1.0 - smoothstep(0.94, 1.0, nd);
            float alpha = (1.0 - smoothstep(0.8, 1.0, uDissolve)) * edgeFeather;

            gl_FragColor = vec4(finalCol, alpha);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthWrite: false
      });

      const lensDisc = new THREE.Mesh(new THREE.CircleGeometry(1, 48), lensMat);
      lensDisc.position.set(0, 0, -8);
      lensDisc.renderOrder = 5;
      lensDisc.visible = false;
      scene.add(lensDisc);

      // ── Text Layer at z = -8 ─────────────────────────────────────────
      const textGroup = new THREE.Group();
      scene.add(textGroup);

      const Z_TEXT = -8;
      const distText = 13 - Z_TEXT; // 21
      const visHText = 2 * distText * Math.tan((fov * Math.PI / 180) / 2);
      const px8 = (v) => (v * visHText) / Math.max(1, window.innerHeight);

      function createTextLineMesh(drawFn, wPx, hPx) {
        const dpr = getDpr();
        const c = document.createElement('canvas');
        c.width = Math.max(2, Math.ceil(wPx * dpr));
        c.height = Math.max(2, Math.ceil(hPx * dpr));
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.scale(dpr, dpr);
        drawFn(ctx, wPx, hPx);

        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;

        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1, depthWrite: false });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        mesh.scale.set(px8(wPx), px8(hPx), 1);
        return { mesh, mat, tex, wPx, hPx };
      }

      const measureCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });

      function wrapLines(text, font, maxWidthPx) {
        measureCtx.font = font;
        const words = text.split(' ');
        const lines = [];
        let curr = '';
        for (const w of words) {
          const test = curr ? curr + ' ' + w : w;
          if (measureCtx.measureText(test).width <= maxWidthPx || !curr) {
            curr = test;
          } else {
            lines.push(curr);
            curr = w;
          }
        }
        if (curr) lines.push(curr);
        return lines;
      }

      let trackBlocks = [];
      let interactiveMeshes = [];
      let northfoldOverlay = null;
      let headlineMeshes = [];
      let trackLengthPx = 3000;
      let currentTrackPx = 0;
      let targetTrackPx = 0;
      let trackVel = 0;
      let hasScrolledTrack = false;

      function buildTextWorld() {
        while (textGroup.children.length) {
          const ch = textGroup.children[0];
          textGroup.remove(ch);
          if (ch.material?.map) ch.material.map.dispose();
          if (ch.material) ch.material.dispose();
          if (ch.geometry) ch.geometry.dispose();
        }
        trackBlocks = [];
        interactiveMeshes = [];
        headlineMeshes = [];
        northfoldOverlay = null;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isPhone = vw <= 640;
        const isNarrow = vw <= 1024;
        const day = isDayMode();
        const inkCol = day ? '#0f172a' : '#ededeb';
        const muteCol = day ? '#475569' : '#8a8a88';

        // 1. Headline (full-viewport canvas centred on screen at baseX = 0)
        {
          let hSize = isPhone ? 62 : 75;
          if (isNarrow) {
            measureCtx.font = `300 ${hSize}px "Nunito", ui-serif, serif`;
            const testWords = ['raqamlar', 'öyinlar', 'birinçi', 'qadam.'];
            const widest = Math.max(...testWords.map((w) => measureCtx.measureText(w).width));
            const maxW = vw - 48;
            if (widest > maxW) hSize = Math.floor(hSize * (maxW / widest));
          }
          const tmSize = isNarrow ? 16 : 24;
          const lineStep = hSize * 1.18;
          const subSize = isPhone ? 12 : 14;
          const fontH = `300 ${hSize}px "Nunito", ui-serif, serif`;
          const fontTm = `400 ${tmSize}px "Nunito", ui-sans-serif, sans-serif`;
          const fontSub = `500 ${subSize}px "Nunito", ui-sans-serif, sans-serif`;

          const drawTrackedLine = (ctx, text, cx, cy, tracking) => {
            ctx.font = fontH;
            let total = 0;
            for (let i = 0; i < text.length; i++) {
              total += ctx.measureText(text[i]).width + (i < text.length - 1 ? tracking : 0);
            }
            let x = cx - total / 2;
            ctx.textAlign = 'left';
            for (let i = 0; i < text.length; i++) {
              ctx.fillText(text[i], x, cy);
              x += ctx.measureText(text[i]).width + tracking;
            }
          };

          const measureTrackedLine = (text, font, tracking) => {
            measureCtx.font = font;
            let total = 0;
            for (let i = 0; i < text.length; i++) {
              total += measureCtx.measureText(text[i]).width + (i < text.length - 1 ? tracking : 0);
            }
            return total;
          };

          const tracking = -0.01 * hSize;
          let linesSpec;
          const heroA = st('hero1');
          const heroB = st('hero2');
          if (!isNarrow) {
            linesSpec = [
              { type: 'text', text: heroA },
              { type: 'text', text: heroB },
              { type: 'motion' }
            ];
          } else {
            const maxW = vw - 48;
            const l1 = wrapLines(heroA, fontH, maxW);
            const l2 = wrapLines(heroB, fontH, maxW);
            linesSpec = [...l1.map((t) => ({ type: 'text', text: t })), ...l2.map((t) => ({ type: 'text', text: t }))];
            const wMotionPlus = measureTrackedLine('VESNA', fontH, tracking) + 8 + measureTrackedLine('™', fontTm, 0) + measureTrackedLine(` · ${st('short')}`, fontH, tracking);
            if (wMotionPlus <= maxW) {
              linesSpec.push({ type: 'motion' });
            } else {
              linesSpec.push({ type: 'motionOnly' });
              const l3 = wrapLines('sari birinçi qadam.', fontH, maxW);
              l3.forEach((t) => linesSpec.push({ type: 'text', text: t }));
            }
          }

          const totalTextH = linesSpec.length * lineStep;
          const totalBlockH = totalTextH + 56 + subSize;
          const topY = -totalBlockH / 2 + lineStep / 2;
          const subY = topY + (linesSpec.length - 1) * lineStep + lineStep * 0.45 + 56;

          let nfBounds = { x: 0, y: 0, w: 100, h: 20 };

          const hObj = createTextLineMesh((ctx, w, h) => {
            ctx.fillStyle = inkCol;
            ctx.textBaseline = 'middle';
            const cx = w / 2;
            const cyOff = h / 2;

            linesSpec.forEach((spec, idx) => {
              const ly = cyOff + topY + idx * lineStep;
              if (spec.type === 'text') {
                drawTrackedLine(ctx, spec.text, cx, ly, tracking);
              } else if (spec.type === 'motion' || spec.type === 'motionOnly') {
                const mW = measureTrackedLine('Bilim', fontH, tracking);
                ctx.font = fontTm;
                const tmW = ctx.measureText('™').width;
                const rest = spec.type === 'motion' ? ' sari birinçi qadam.' : '';
                const restW = rest ? measureTrackedLine(rest, fontH, tracking) : 0;
                const fullW = mW + 8 + tmW + restW;
                let sx = cx - fullW / 2;

                ctx.font = fontH;
                ctx.textAlign = 'left';
                for (let i = 0; i < 'Bilim'.length; i++) {
                  ctx.fillText('Bilim'[i], sx, ly);
                  sx += ctx.measureText('Bilim'[i]).width + tracking;
                }
                sx += 8;
                ctx.font = fontTm;
                ctx.fillText('™', sx, ly - 0.2 * hSize);
                sx += tmW;
                if (rest) {
                  ctx.font = fontH;
                  for (let i = 0; i < rest.length; i++) {
                    ctx.fillText(rest[i], sx, ly);
                    sx += ctx.measureText(rest[i]).width + tracking;
                  }
                }
              }
            });

            const prefix = `${st('hero1')} · `;
            const brand = 'Ş · Ç · Ö · Ğ';
            ctx.font = fontSub;
            ctx.textAlign = 'left';
            const pW = ctx.measureText(prefix).width;
            const bW = ctx.measureText(brand).width;
            const sx = cx - (pW + bW) / 2;
            const sy = cyOff + subY;
            ctx.fillStyle = inkCol;
            ctx.fillText(prefix + brand, sx, sy);

            nfBounds = {
              x: sx + pW - w / 2 + bW / 2,
              y: -(sy - h / 2),
              w: bW + 6,
              h: subSize + 10
            };
          }, vw, vh);

          hObj.mesh.position.set(0, 0, Z_TEXT);
          textGroup.add(hObj.mesh);
          headlineMeshes.push({ mesh: hObj.mesh, baseXPx: 0 });

          // Background-coloured overlay over "Ş · Ç · Ö · Ğ" (clickable to open 29-letter alphabet board)
          const nfMat = new THREE.MeshBasicMaterial({ color: day ? 0xe4edfa : 0x0c0c0d, transparent: true, opacity: 0, depthWrite: false });
          const nfMesh = new THREE.Mesh(new THREE.PlaneGeometry(px8(nfBounds.w), px8(nfBounds.h)), nfMat);
          nfMesh.position.set(px8(nfBounds.x), px8(nfBounds.y), Z_TEXT + 0.02);
          nfMesh.renderOrder = 2;
          nfMesh.userData.action = 'alphabet';
          nfMesh.userData.onHover = (over) => {
            gsap.to(nfMat, { opacity: over ? 0.5 : 0, duration: 0.55, ease: 'expo.out' });
          };
          textGroup.add(nfMesh);
          headlineMeshes.push({ mesh: nfMesh, baseXPx: nfBounds.x });
          interactiveMeshes.push(nfMesh);
        }

        // 2. 10 Track Stops
        const maxBlockW = isPhone ? Math.min(vw - 56, 300) : 440;
        const bandGapPx = isPhone ? 64 : 78;
        let cursorX = vw / 2 + (isPhone ? 70 : 200);

        const stops = [
          {
            kind: 'paragraph', side: 'top',
            heading: st('hero1'),
            body: st('about'),
            wrapW: Math.min(320, maxBlockW)
          },
          {
            kind: 'list', side: 'bottom',
            heading: st('sections'),
            rows: st('sectionsRows').split('|')
          },
          {
            kind: 'chapter', side: 'top',
            heading: st('chapter1'),
            numeral: 'I',
            body: st('chapter1Body'),
            wrapW: Math.min(300, maxBlockW)
          },
          {
            kind: 'quote', side: 'bottom',
            quote: st('quote1'),
            note: st('quote1Note'),
            wrapW: Math.min(440, maxBlockW)
          },
          {
            kind: 'stats', side: 'top',
            heading: st('stats'),
            rows: st('statsRows').split('|')
          },
          {
            kind: 'paragraph', side: 'bottom',
            heading: `${ct('math')} · ${ct('logic')}`,
            body: st('mathBody'),
            wrapW: Math.min(320, maxBlockW)
          },
          {
            kind: 'chapter', side: 'top',
            heading: st('chapter2'),
            numeral: 'II',
            body: st('chapter2Body'),
            wrapW: Math.min(300, maxBlockW)
          },
          {
            kind: 'list', side: 'bottom',
            heading: st('signs'),
            rows: st('signsRows').split('|')
          },
          {
            kind: 'quote', side: 'top',
            quote: st('quote2'),
            note: st('quote2Note'),
            wrapW: Math.min(440, maxBlockW)
          },
          {
            kind: 'links', side: 'bottom',
            heading: st('start'),
            rows: [
              { text: `${ct('nav_letters')} →`, action: 'alphabet', color: inkCol },
              { text: `${st('startRows').split('|')[1]} →`, action: 'projects', color: inkCol },
              { text: st('startRows').split('|')[2], action: null, color: muteCol }
            ]
          }
        ];

        const headFont = '500 12px "Nunito", ui-sans-serif, sans-serif';

        for (const stop of stops) {
          // Build lines top-to-bottom in local block px
          const rawLines = [];
          let blockW = 0;

          if (stop.kind === 'paragraph') {
            rawLines.push({ text: stop.heading, font: headFont, color: muteCol, h: 16, gapAfter: 16 });
            const pFont = '300 22px "Nunito", ui-serif, serif';
            const wrapped = wrapLines(stop.body, pFont, stop.wrapW);
            wrapped.forEach((ln, idx) => {
              rawLines.push({ text: ln, font: pFont, color: inkCol, h: 29, gapAfter: idx < wrapped.length - 1 ? 0 : 0 });
            });
          } else if (stop.kind === 'list') {
            rawLines.push({ text: stop.heading, font: headFont, color: muteCol, h: 16, gapAfter: 14 });
            const lFont = '400 18px "Nunito", ui-serif, serif';
            stop.rows.forEach((r, idx) => {
              rawLines.push({ text: r, font: lFont, color: inkCol, h: 22, gapAfter: idx < stop.rows.length - 1 ? 7 : 0 });
            });
          } else if (stop.kind === 'chapter') {
            rawLines.push({ text: stop.heading, font: headFont, color: muteCol, h: 16, gapAfter: 12 });
            rawLines.push({ text: stop.numeral, font: '300 72px "Nunito", ui-serif, serif', color: inkCol, h: 74, gapAfter: 12 });
            const cFont = '300 19px "Nunito", ui-serif, serif';
            const wrapped = wrapLines(stop.body, cFont, stop.wrapW);
            wrapped.forEach((ln) => {
              rawLines.push({ text: ln, font: cFont, color: inkCol, h: 26, gapAfter: 0 });
            });
          } else if (stop.kind === 'quote') {
            const qSize = isPhone ? 30 : 40;
            const qFont = `italic 300 ${qSize}px "Nunito", ui-serif, serif`;
            const qStep = Math.round(qSize * 1.12);
            const wrapped = wrapLines(stop.quote, qFont, stop.wrapW);
            wrapped.forEach((ln, idx) => {
              rawLines.push({ text: ln, font: qFont, color: inkCol, h: qStep, gapAfter: idx === wrapped.length - 1 ? 14 : 0 });
            });
            rawLines.push({ text: stop.note, font: headFont, color: muteCol, h: 16, gapAfter: 0 });
          } else if (stop.kind === 'stats') {
            rawLines.push({ text: stop.heading, font: headFont, color: muteCol, h: 16, gapAfter: 14 });
            const sFont = '400 18px "Nunito", ui-sans-serif, sans-serif';
            stop.rows.forEach((r, idx) => {
              rawLines.push({ text: r, font: sFont, color: inkCol, h: 22, gapAfter: idx < stop.rows.length - 1 ? 9 : 0 });
            });
          } else if (stop.kind === 'links') {
            rawLines.push({ text: stop.heading, font: headFont, color: muteCol, h: 16, gapAfter: 14 });
            const kFont = '300 22px "Nunito", ui-serif, serif';
            stop.rows.forEach((r, idx) => {
              rawLines.push({ text: r.text, font: kFont, color: r.color, h: 28, gapAfter: idx < stop.rows.length - 1 ? 8 : 0, action: r.action });
            });
          }

          let totalH = 0;
          rawLines.forEach((l) => {
            measureCtx.font = l.font;
            l.w = Math.ceil(measureCtx.measureText(l.text).width + 8);
            blockW = Math.max(blockW, l.w);
            totalH += l.h + l.gapAfter;
          });

          // Position block vertically
          // top block: bottom at +bandGapPx above centre; bottom block: top at -bandGapPx below centre
          const blockTopYWorldPx = stop.side === 'top' ? (bandGapPx + totalH) : (-bandGapPx);
          let yCursor = blockTopYWorldPx;

          const lineObjects = [];
          for (const l of rawLines) {
            const obj = createTextLineMesh((ctx, w, h) => {
              ctx.font = l.font;
              ctx.fillStyle = l.color;
              ctx.textBaseline = 'middle';
              ctx.fillText(l.text, 2, h / 2);
            }, l.w, l.h);

            const baseCenterXPx = cursorX + l.w / 2;
            const baseCenterYWorld = px8(yCursor - l.h / 2);
            obj.mesh.position.set(px8(baseCenterXPx), baseCenterYWorld, Z_TEXT);
            textGroup.add(obj.mesh);

            if (l.action) {
              obj.mesh.userData.action = l.action;
              obj.mesh.userData.onHover = (over) => {
                gsap.to(obj.mat, { opacity: over ? 0.5 : 1, duration: 0.55, ease: 'expo.out' });
              };
              interactiveMeshes.push(obj.mesh);
            }

            lineObjects.push({
              mesh: obj.mesh,
              baseCenterXPx,
              baseY: baseCenterYWorld,
              halfWWorld: px8(l.w / 2),
              halfHWorld: px8(l.h / 2),
              shift: 0
            });

            yCursor -= (l.h + l.gapAfter);
          }

          // Order lines from inside (nearest centre y = 0) outward
          const orderedLines = stop.side === 'top' ? [...lineObjects].reverse() : [...lineObjects];
          trackBlocks.push({ side: stop.side, lines: orderedLines });

          const adv = Math.max(0.62 * blockW, isPhone ? 150 : 200) + (isPhone ? 60 : 90);
          cursorX += adv;
        }

        const endOfLastBlock = cursorX;
        trackLengthPx = endOfLastBlock + (isPhone ? 140 : 260) + vw / 2;
      }

      buildTextWorld();

      onThemeChange((theme) => {
        const day = theme === 'light';
        const bgHex = day ? 0xe4edfa : 0x05070e;
        scene.background.setHex(bgHex);
        renderer.setClearColor(bgHex, 1);
        aboutCrystal.setTheme(theme);
        buildTextWorld();
      });

      // Bot idle, sleep, blink, hover, click
      let pointerNdcX = 0;
      let pointerNdcY = 0;
      let hasMouseMoved = false;
      let botTargetRot = touch ? { x: 0, y: 0, z: 0 } : { x: -0.62, y: 0.59, z: 0.2 };
      let botCurrRot = { x: botTargetRot.x, y: botTargetRot.y, z: botTargetRot.z };
      const floatState = { phase: 0, speed: 1, amplitude: 1 };
      const shakeState = { y: 0 };
      const clickAnimRot = { x: 0, y: 0, z: 0 };
      let isSleeping = false;
      let isClickFrozen = false;
      let hitToggle = false;
      let lensActive = false;
      let lastActivityTime = performance.now();
      let blinkTimer = null;
      let hoverActive = false;

      function scheduleBlink() {
        clearTimeout(blinkTimer);
        blinkTimer = window.setTimeout(() => {
          if (currentRoute === 'about' && !isSleeping && !isClickFrozen) {
            eyes.forEach((eye) => {
              gsap.to(eye.scale, {
                y: 0.1,
                duration: 0.09,
                ease: 'power2.in',
                yoyo: true,
                repeat: 1
              });
            });
          }
          scheduleBlink();
        }, 3000 + Math.random() * 2000);
      }

      function triggerHeadShake() {
        const tl = gsap.timeline();
        tl.to(shakeState, { y: 0.22, duration: 0.09, ease: 'power2.out' })
          .to(shakeState, { y: -0.18, duration: 0.12, ease: 'power2.inOut' })
          .to(shakeState, { y: 0.10, duration: 0.11, ease: 'power2.inOut' })
          .to(shakeState, { y: 0, duration: 0.18, ease: 'power2.out' });
      }

      function wakeBot() {
        lastActivityTime = performance.now();
        if (!isSleeping) return;
        isSleeping = false;
        gsap.to(floatState, { speed: 1, amplitude: 1, duration: 0.8, ease: 'power2.out' });
        eyes.forEach((eye) => gsap.to(eye.scale, { y: 1, duration: 0.15, ease: 'power2.out' }));
        triggerHeadShake();
      }

      function sleepBot() {
        if (isSleeping || touch || botUniforms.uReveal.value < 0.98 || isClickFrozen) return;
        isSleeping = true;
        eyes.forEach((eye) => gsap.to(eye.scale, { y: 0.2, duration: 1.1, ease: 'power2.inOut' }));
        gsap.to(botTargetRot, { x: 0.42, y: 0, z: 0.12, duration: 1.4, ease: 'power2.inOut' });
        gsap.to(floatState, { speed: 0.35, amplitude: 1.6, duration: 1.6, ease: 'power2.inOut' });
      }

      function fireLensAndBotReaction() {
        if (botUniforms.uReveal.value < 0.8 || lensActive || isClickFrozen) return;
        isClickFrozen = true;
        lensActive = true;
        lensDisc.visible = true;
        lensDisc.scale.setScalar(0.001);
        lensMat.uniforms.uDissolve.value = 0;

        let dissolveTriggered = false;
        const scaleObj = { s: 0.001 };
        gsap.to(scaleObj, {
          s: 10,
          duration: 4.0,
          ease: 'expo.out',
          onUpdate: () => {
            lensDisc.scale.setScalar(scaleObj.s);
            if (!dissolveTriggered && scaleObj.s >= 6.14) {
              dissolveTriggered = true;
              gsap.to(lensMat.uniforms.uDissolve, {
                value: 1,
                duration: 0.8975,
                ease: 'sine.inOut',
                onComplete: () => {
                  lensActive = false;
                  lensDisc.visible = false;
                  lensDisc.scale.setScalar(0.001);
                  lensMat.uniforms.uDissolve.value = 0;
                }
              });
            }
          }
        });

        hitToggle = !hitToggle;
        if (hitToggle) {
          // Recoil
          eyes.forEach((eye) => gsap.to(eye.scale, { y: 0.15, duration: 0.16, ease: 'power3.out' }));
          const tl = gsap.timeline({
            onComplete: () => {
              isClickFrozen = false;
              triggerHeadShake();
            }
          });
          tl.to(clickAnimRot, { x: -0.45, y: 0.18, duration: 0.16, ease: 'power3.out' })
            .to(clickAnimRot, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
          eyes.forEach((eye) => gsap.to(eye.scale, { y: 1, duration: 0.4, delay: 0.25, ease: 'power2.out' }));
        } else {
          // Spin + Z wobble
          const tl = gsap.timeline({
            onComplete: () => {
              clickAnimRot.y = 0;
              isClickFrozen = false;
              triggerHeadShake();
            }
          });
          tl.to(clickAnimRot, { y: Math.PI * 2, duration: 1.1, ease: 'power3.inOut' }, 0)
            .to(clickAnimRot, { z: 0.25, duration: 0.35, ease: 'power2.out' }, 0)
            .to(clickAnimRot, { z: 0, duration: 0.75, ease: 'elastic.out(1, 0.5)' }, 0.35);
        }
      }

      // Raycasting & input for About
      const raycaster = new THREE.Raycaster();
      const pointerNdc = new THREE.Vector2(-99, -99);
      let pointerDirty = false;
      let hoveredInteractive = null;
      let touchLastX = 0;
      let touchLastY = 0;
      let isTouchDown = false;
      let touchMoved = 0;

      const onUserActivity = () => {
        if (currentRoute === 'about') wakeBot();
      };

      ['mousemove', 'wheel', 'pointerdown', 'touchstart', 'keydown'].forEach((ev) => {
        window.addEventListener(ev, onUserActivity, { passive: true });
      });

      window.addEventListener('pointermove', (e) => {
        if (currentRoute !== 'about' || isEduGameOpen()) return;
        hasMouseMoved = true;
        const hw = window.innerWidth / 2;
        const hh = window.innerHeight / 2;
        const ox = (e.clientX - hw) / Math.max(1, hw);
        const oy = (e.clientY - hh) / Math.max(1, hh);
        pointerNdcX = ox;
        pointerNdcY = oy;
        if (!isSleeping) {
          botTargetRot.x = THREE.MathUtils.clamp(oy, -0.62, 0.62);
          botTargetRot.y = THREE.MathUtils.clamp(ox, -0.59, 0.59);
          botTargetRot.z = 0.2 * ox;
        }
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerDirty = true;
      });

      function fadeScrollHint() {
        if (hasScrolledTrack) return;
        hasScrolledTrack = true;
        gsap.to(scrollHint, { opacity: 0, duration: 0.45, ease: 'power2.out' });
      }

      host.addEventListener('wheel', (e) => {
        if (isEduGameOpen()) return;
        e.preventDefault();
        fadeScrollHint();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        targetTrackPx += delta;
        pointerDirty = true;
      }, { passive: false });

      host.addEventListener('touchstart', (e) => {
        if (isEduGameOpen() || e.touches.length !== 1) return;
        isTouchDown = true;
        touchLastX = e.touches[0].clientX;
        touchLastY = e.touches[0].clientY;
        touchMoved = 0;
        trackVel = 0;
      }, { passive: true });

      host.addEventListener('touchmove', (e) => {
        if (!isTouchDown || isEduGameOpen() || e.touches.length !== 1) return;
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = touchLastX - x;
        const dy = touchLastY - y;
        touchLastX = x;
        touchLastY = y;
        const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        touchMoved += Math.abs(delta);
        if (touchMoved > 4) fadeScrollHint();
        trackVel = delta;
        targetTrackPx += delta;
      }, { passive: true });

      host.addEventListener('touchend', () => {
        isTouchDown = false;
      });

      host.addEventListener('click', (e) => {
        if (isEduGameOpen() || touchMoved > 10) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);

        const botHits = raycaster.intersectObject(botRoot, true);
        if (botHits.length) {
          fireLensAndBotReaction();
          window.dispatchEvent(new CustomEvent('alif:robot-click', { detail: { x: e.clientX, y: e.clientY } }));
          return;
        }
        const linkHits = raycaster.intersectObjects(interactiveMeshes, false);
        if (linkHits.length) {
          const act = linkHits[0].object.userData.action;
          if (act === 'alphabet') {
            openEduGame(ITEMS[4]);
          } else if (act === 'projects') {
            window.location.hash = '#projects';
          }
        }
      });

      let aboutVisited = false;
      let revealTween = null;

      function startAboutEntrance() {
        const firstVisit = !aboutVisited;
        aboutVisited = true;
        lastActivityTime = performance.now();

        if (reducedMotion) {
          botUniforms.uReveal.value = 1;
          gsap.set(scrollHint, { opacity: 1, x: 0 });
        } else {
          if (revealTween) revealTween.kill();
          botUniforms.uReveal.value = 0;
          revealTween = gsap.to(botUniforms.uReveal, {
            value: 1,
            duration: 3.85,
            delay: firstVisit ? 1.0 : 0.45,
            ease: 'power2.out'
          });

          if (!hasScrolledTrack) {
            gsap.fromTo(scrollHint, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.9, delay: 1.6, ease: 'expo.out' });
            gsap.killTweensOf(scrollArrow);
            gsap.to(scrollArrow, { x: 5, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          }
        }
        scheduleBlink();
      }

      const _discWorld = new THREE.Vector3();

      const driver = makeLoopDriver(renderer, (dt, elapsed) => {
        const frameScale = dt * 60;
        const motion = getMotionParallax();
        botUniforms.uTime.value = elapsed;

        // Smooth 3D camera parallax driven by cursor or mobile gyroscope
        camera.position.x = motion.x * 0.55;
        camera.position.y = -motion.y * 0.36;
        camera.lookAt(0, 0, -1);

        aboutCrystal.update(elapsed, motion.x, motion.y);

        // Sleep check (30s idle on desktop)
        if (!touch && !isSleeping && performance.now() - lastActivityTime > 30000) {
          sleepBot();
        }

        // On mobile/touch with gyroscope, let robot look follow phone tilt
        if (motion.hasGyro && !isSleeping && !isClickFrozen) {
          botTargetRot.x = THREE.MathUtils.clamp(motion.y * 0.58, -0.62, 0.62);
          botTargetRot.y = THREE.MathUtils.clamp(motion.x * 0.58, -0.59, 0.59);
          botTargetRot.z = 0.2 * motion.x;
        }

        // Bot follow & float
        const rotEase = 1 - Math.pow(1 - 0.08, 60 * dt);
        if (!isClickFrozen) {
          botCurrRot.x += (botTargetRot.x - botCurrRot.x) * rotEase;
          botCurrRot.y += (botTargetRot.y - botCurrRot.y) * rotEase;
          botCurrRot.z += (botTargetRot.z - botCurrRot.z) * rotEase;
        }
        botRoot.rotation.set(
          botCurrRot.x + clickAnimRot.x,
          botCurrRot.y + clickAnimRot.y,
          botCurrRot.z + clickAnimRot.z
        );

        let floatY = 0;
        if (!reducedMotion) {
          floatState.phase += dt * 1.5 * floatState.speed;
          const targetFloat = Math.sin(floatState.phase) * 0.2 * floatState.amplitude * botUniforms.uReveal.value;
          floatY = botRoot.position.y + (targetFloat - botRoot.position.y) * rotEase;
        }
        botRoot.position.y = floatY + shakeState.y;
        botUniforms.uBotCenter.value.copy(botRoot.position);

        // Halo spin
        haloMesh.rotation.z += 0.35 * dt;

        // Hover raycast on bot & interactive links
        if (pointerDirty) {
          pointerDirty = false;
          raycaster.setFromCamera(pointerNdc, camera);
          const botHits = raycaster.intersectObject(botRoot, true);
          if (botHits.length && botUniforms.uReveal.value >= 0.8) {
            hoverActive = true;
            botUniforms.uHoverPos.value.copy(botHits[0].point);
          } else {
            hoverActive = false;
          }

          const linkHits = raycaster.intersectObjects(interactiveMeshes, false);
          const nextLink = linkHits.length ? linkHits[0].object : null;
          if (nextLink !== hoveredInteractive) {
            if (hoveredInteractive?.userData.onHover) hoveredInteractive.userData.onHover(false);
            hoveredInteractive = nextLink;
            if (hoveredInteractive?.userData.onHover) hoveredInteractive.userData.onHover(true);
          }
          host.style.cursor = (hoverActive || Boolean(nextLink)) ? 'pointer' : 'default';
        }

        const hTarget = hoverActive ? 1 : 0;
        const hRate = hoverActive ? 0.1 : 0.05;
        botUniforms.uHover.value += (hTarget - botUniforms.uHover.value) * (1 - Math.pow(1 - hRate, frameScale));

        // Track scroll & wrap
        if (!isTouchDown && Math.abs(trackVel) > 0.05) {
          trackVel *= Math.pow(0.95, frameScale);
          targetTrackPx += trackVel * frameScale;
        }
        const trackEase = 1 - Math.pow(1 - 0.12, frameScale);
        currentTrackPx += (targetTrackPx - currentTrackPx) * trackEase;

        const wrapPx = (rawX) => {
          const L = trackLengthPx;
          return (((rawX + L / 2) % L) + L) % L - L / 2;
        };

        headlineMeshes.forEach((hm) => {
          hm.mesh.position.x = px8(wrapPx(hm.baseXPx - currentTrackPx));
        });

        // Magnetic make-space
        const isPhone = window.innerWidth <= 640;
        const ovalScale = isPhone ? 0.7875 : 1;
        const Rx = 3.4 * ovalScale;
        const Ry = 4.0543 * ovalScale;
        const pad = 0.35;

        for (const block of trackBlocks) {
          let prevShift = 0;
          const lines = block.lines;
          for (let k = 0; k < lines.length; k++) {
            const ln = lines[k];
            const wx = px8(wrapPx(ln.baseCenterXPx - currentTrackPx));
            ln.mesh.position.x = wx;

            const left = wx - ln.halfWWorld;
            const right = wx + ln.halfWWorld;
            const d = (0 >= left && 0 <= right) ? 0 : Math.min(Math.abs(left), Math.abs(right));

            let need = 0;
            if (d < Rx) {
              const h = Ry * Math.sqrt(Math.max(0, 1 - (d / Rx) * (d / Rx))) + pad;
              if (block.side === 'top') {
                const baseBottom = ln.baseY - ln.halfHWorld;
                need = Math.max(0, h - baseBottom);
              } else {
                const baseTop = ln.baseY + ln.halfHWorld;
                need = Math.max(0, baseTop + h);
              }
            }
            if (k > 0) {
              need = Math.max(need, prevShift);
            }
            const factor = Math.max(0.1, 0.14 - 0.012 * k);
            const stepFactor = 1 - Math.pow(1 - factor, frameScale);
            ln.shift += (need - ln.shift) * stepFactor;
            prevShift = ln.shift;

            ln.mesh.position.y = ln.baseY + (block.side === 'top' ? ln.shift : -ln.shift);
          }
        }

        if (lensActive) {
          _discWorld.copy(lensDisc.position).project(camera);
          lensMat.uniforms.uDiscCenter.value.set(_discWorld.x * 0.5 + 0.5, _discWorld.y * 0.5 + 0.5);

          botRoot.visible = false;
          lensDisc.visible = false;
          renderer.setRenderTarget(bgTarget);
          renderer.render(scene, camera);
          renderer.setRenderTarget(null);
          botRoot.visible = true;
          lensDisc.visible = true;
        }

        renderer.render(scene, camera);
      });

      function onResize() {
        const dpr = getDpr();
        camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        makeBgTarget();
        lensMat.uniforms.tBg.value = bgTarget.texture;
        lensMat.uniforms.uResolution.value.set(window.innerWidth * dpr, Math.max(1, window.innerHeight) * dpr);
        syncBotScale();
        buildTextWorld();
      }
      window.addEventListener('resize', onResize);

      return {
        el: section,
        enter() {
          onResize();
          startAboutEntrance();
          activeViewDriver = driver;
          if (!isEduGameOpen()) driver.start();
        },
        leave() {
          if (activeViewDriver === driver) activeViewDriver = null;
          driver.stop();
          clearTimeout(blinkTimer);
        }
      };
    };

    // ── 5b. View 3: 29-Letter Alphabet Studio ────────────────────────────
    viewBuilders.alphabet = () => createAlphabetView();

    // ── 6. Boot ───────────────────────────────────────────────────────────
    async function boot() {
      await Promise.allSettled([
        document.fonts.load('600 64px "Nunito"'),
        document.fonts.load('500 16px "Nunito"'),
        document.fonts.load('400 18px "Nunito"'),
        document.fonts.load('300 75px "Nunito"'),
        document.fonts.load('400 18px "Nunito"'),
        document.fonts.load('italic 300 40px "Nunito"')
      ]);
      await document.fonts.ready;

      const initial = parseHash();
      switchRoute(initial);
      if (initial !== 'gallery') {
        revealDock(false);
      }
    }

    boot();
