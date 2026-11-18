// VESNA — Interactive 29-Letter Reformed Uzbek Latin Alphabet Section
// Supports 3 switchable layout concepts so the user can preview and keep one.

import { UZ_ALPHABET, EDU_ITEMS, openEduGame, openPvpDuel } from './edu-engine.js';
import { t as ct } from './senior-content.js';
import { drawIllustration } from './edu-art.js';
import { isDayMode, onThemeChange } from './theme.ts';

type IdeaId = 'matrix' | 'strip' | 'cards';
type FilterId = 'all' | 'yangi' | 'unli' | 'undosh' | 'belgi';

interface AlphabetEntry {
  num: number;
  upper: string;
  lower: string;
  example: string;
  words?: string[];
  art: string;
  hint: string;
  type: FilterId;
  old?: string;
}

const LETTERS = UZ_ALPHABET as AlphabetEntry[];

const IDEA_KEY = 'vesna.alphabet.idea';
const SAVED_IDEA = (() => {
  try {
    const v = localStorage.getItem(IDEA_KEY);
    return v === 'matrix' || v === 'strip' || v === 'cards' ? v : 'matrix';
  } catch {
    return 'matrix';
  }
})();

// Model-like form descriptor for the inline self-check (Django ModelForm-inspired schema)
interface AlphabetCheckSchema {
  title: string;
  prompt: string;
  options: string[];
  answer: string;
  explain: string;
}

function shuffleArr<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCheckForLetter(entry: AlphabetEntry): AlphabetCheckSchema {
  if (entry.upper === 'Ç') {
    return {
      title: '3-harf tekşiruvi',
      prompt: '3-örindagi harf qaysi?',
      options: shuffleArr(['Ç ç', 'Ş ş', 'C c', 'Ğ ğ']),
      answer: 'Ç ç',
      explain: 'Töğri! 3-örinda «Ç ç» turadi (masalan: Çoynak).'
    };
  }
  if (entry.upper === 'Ğ') {
    return {
      title: '8-harf tekşiruvi',
      prompt: '«Ğ ğ» harfi alifboda neçinçi örinda turadi?',
      options: shuffleArr(['8 · Ğ ğ', '7 · G g', '22 · Ş ş', '17 · Ö ö']),
      answer: '8 · Ğ ğ',
      explain: 'Töğri! «Ğ ğ» alifboda 8-örinda turadi (masalan: Ğoz, Toğ).'
    };
  }
  if (entry.upper === 'Ö') {
    return {
      title: '17-harf tekşiruvi',
      prompt: '17-örinda qaysi harf turadi?',
      options: shuffleArr(['Ö ö', 'O o', 'U u', 'Ğ ğ']),
      answer: 'Ö ö',
      explain: 'Töğri! «Ö ö» 17-örinda turadi (Ördak).'
    };
  }
  if (entry.upper === 'Ş') {
    return {
      title: '22-harf tekşiruvi',
      prompt: '«Quyoş» sözidagi 22-harf qaysi?',
      options: shuffleArr(['Ş ş', 'S s', 'Ç ç', 'J j']),
      answer: 'Ş ş',
      explain: 'Töğri! 22-örinda «Ş ş» turadi (Quyoş, Şar, Şir).'
    };
  }
  if (entry.type === 'belgi') {
    return {
      title: '29-belgi tekşiruvi',
      prompt: '29-örindagi «ʼ» belgisi qaysi sözda töğri işlatilgan?',
      options: shuffleArr(['Maʼno', 'Anor', 'Şar', 'Çoynak']),
      answer: 'Maʼno',
      explain: 'Töğri! «ʼ» — tutuq belgisi bölib, Maʼno, Aʼlo, Sanʼat kabi sözlarda qöllanadi.'
    };
  }
  const distractors = shuffleArr(LETTERS.filter((l) => l.upper !== entry.upper && l.type !== 'belgi'))
    .slice(0, 3)
    .map((l) => l.example);
  const wordChoices = entry.words && entry.words.length ? entry.words : [entry.example];
  const answer = wordChoices[Math.floor(Math.random() * wordChoices.length)];
  const opts = shuffleArr([answer, ...distractors]);
  return {
    title: `${entry.num}-harf tekşiruvi`,
    prompt: `«${entry.upper} ${entry.lower}» harfi bilan boşlanadigan sözni tanlang:`,
    options: opts,
    answer,
    explain: `Barakalla! «${answer}» sözi ${entry.num}-harf «${entry.upper}» bilan boşlanadi.`
  };
}

function convertOldToReformed(input: string): string {
  return input
    .replace(/Ch/g, 'Ç')
    .replace(/CH/g, 'Ç')
    .replace(/ch/g, 'ç')
    .replace(/Sh/g, 'Ş')
    .replace(/SH/g, 'Ş')
    .replace(/sh/g, 'ş')
    .replace(/O['‘ʻ`]/g, 'Ö')
    .replace(/o['‘ʻ`]/g, 'ö')
    .replace(/G['‘ʻ`]/g, 'Ğ')
    .replace(/g['‘ʻ`]/g, 'ğ')
    .replace(/([A-Za-zÖöĞğŞşÇç])['‘`]/g, '$1ʼ');
}

function accentForEntry(entry: AlphabetEntry): string {
  if (entry.type === 'yangi') return '#5eead4';
  if (entry.type === 'belgi') return '#ffd166';
  if (entry.type === 'unli') return '#68b5ff';
  return '#a78bfa';
}

function findSeniorItem(subject: string, skill: string) {
  return EDU_ITEMS.find((it) => it.subject === subject && it.skill === skill) || EDU_ITEMS[0];
}

function launchRelatedGame(entry: AlphabetEntry): void {
  if (entry.type === 'belgi') openEduGame(findSeniorItem('logic', 'odd_one'));
  else if (['Ş', 'Ç', 'Ö', 'Ğ'].includes(entry.upper)) openEduGame(findSeniorItem('uzbek', 'spelling'));
  else openEduGame(findSeniorItem('math', 'mul_large'));
}

export function createAlphabetView() {
  const section = document.getElementById('view-alphabet') as HTMLElement | null;
  const host = document.getElementById('alpha-host') as HTMLElement | null;

  if (!section || !host) {
    return {
      el: section || document.createElement('div'),
      enter() {},
      leave() {}
    };
  }
  const hostEl: HTMLElement = host;

  let activeIdea: IdeaId = SAVED_IDEA;
  let activeFilter: FilterId = 'all';
  let selectedIdx = 2; // Start on #3 Ç ç so reformed letters are immediately clear
  let matrixSubTab: 'trace' | 'check' = 'trace';
  let converterText = 'Çoynak, Şar, Ördak, Ğoz va Maʼno';
  let expandedCardIdx: number | null = 2;
  let quizIdx = 0;
  let quizStreak = 0;
  let quizFeedback: { text: string; ok: boolean } | null = null;
  let isVisible = false;
  let rafId = 0;
  let activeArtCanvases: Array<{ canvas: HTMLCanvasElement; art: string; accent: string; size: number }> = [];

  let quizTimer = 0;

  // Mini tracing state
  let traceStrokes: Array<Array<{ x: number; y: number }>> = [];
  let traceCanvasCleanup: (() => void) | null = null;

  const CARD_QUIZ_BANK = [
    { q: '3-örinda turgan yangi harf qaysi?', opts: ['Ç ç', 'Ş ş', 'Ö ö', 'Ğ ğ'], a: 'Ç ç' },
    { q: '29-örinda alifboga nima qöşilgan?', opts: ['ʼ (tutuq belgisi)', 'Ng ng', 'Ş ş', 'Ç ç'], a: 'ʼ (tutuq belgisi)' },
    { q: '17-örinda qaysi harf turadi?', opts: ['17 · Ö ö', '16 · O o', '8 · Ğ ğ', '22 · Ş ş'], a: '17 · Ö ö' },
    { q: '22-örindagi harf qaysi?', opts: ['Ş ş (22)', 'Ç ç (3)', 'S s (21)', 'Ğ ğ (8)'], a: 'Ş ş (22)' },
    { q: '8-örindagi harf qaysi?', opts: ['Ğ ğ (8)', 'G g (7)', 'Q q (19)', 'Ö ö (17)'], a: 'Ğ ğ (8)' },
    { q: '«Quyosh» sözining yangi alifbodagi töğri yozuvi:', opts: ['Quyoş', 'Quyos', 'Quyoch', 'Qöyoş'], a: 'Quyoş' },
    { q: '«Maʼno» sözida 29-belgi qanday qöyiladi?', opts: ['Maʼno', 'Mano', 'Mağno', 'Maçno'], a: 'Maʼno' },
    { q: '«Choynak» sözi qaysi harf bilan boşlanadi?', opts: ['Ç', 'Ş', 'C', 'Ğ'], a: 'Ç' },
    { q: '«Toğ» sözi oxirida qaysi harf yoziladi?', opts: ['ğ', 'g', 'q', 'ç'], a: 'ğ' },
    { q: 'Alifboda 1-örindagi unli harf qaysi?', opts: ['A a', 'O o', 'E e', 'I i'], a: 'A a' }
  ];
  let quizOrder = shuffleArr(CARD_QUIZ_BANK.map((_, i) => i));
  let shuffledQuizOpts = shuffleArr(CARD_QUIZ_BANK[quizOrder[0]].opts);

  function stopArtLoop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function startArtLoop() {
    stopArtLoop();
    if (!isVisible) return;
    let lastTick = 0;
    const tick = (now: number) => {
      rafId = 0;
      if (!isVisible) return;
      if (!document.hidden && !document.body.classList.contains('is-game-open') && (!lastTick || now - lastTick >= 42)) {
        lastTick = now;
        const t = now * 0.001;
        for (const item of activeArtCanvases) {
          if (!item.canvas.isConnected) continue;
          const ctx = item.canvas.getContext('2d');
          if (!ctx) continue;
          const w = item.canvas.width;
          const h = item.canvas.height;
          ctx.clearRect(0, 0, w, h);
          drawIllustration(ctx, item.art, w / 2, h / 2, item.size, t, item.accent);
        }
      }
      if (isVisible) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function attachMiniTracePad(canvas: HTMLCanvasElement, entry: AlphabetEntry) {
    if (traceCanvasCleanup) {
      traceCanvasCleanup();
      traceCanvasCleanup = null;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(240, rect.width || 320);
    const cssH = 164;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.height = cssH + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pre-render static ruled lines + ghost glyph into offscreen guide canvas
    const bgBuf = document.createElement('canvas');
    bgBuf.width = canvas.width;
    bgBuf.height = canvas.height;
    const bgCtx = bgBuf.getContext('2d');
    const day = isDayMode();
    if (bgCtx) {
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgCtx.strokeStyle = day ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)';
      bgCtx.setLineDash([5, 5]);
      bgCtx.lineWidth = 1;
      [cssH * 0.24, cssH * 0.5, cssH * 0.78].forEach((y) => {
        bgCtx.beginPath();
        bgCtx.moveTo(16, y);
        bgCtx.lineTo(cssW - 16, y);
        bgCtx.stroke();
      });
      bgCtx.setLineDash([]);

      const label = entry.type === 'belgi' ? 'ʼ' : `${entry.upper} ${entry.lower}`;
      bgCtx.font = `800 ${entry.type === 'belgi' ? 110 : 78}px "Nunito", sans-serif`;
      bgCtx.textAlign = 'center';
      bgCtx.textBaseline = 'middle';
      bgCtx.fillStyle = day ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.09)';
      bgCtx.fillText(label, cssW / 2, cssH / 2 + 4);
      bgCtx.strokeStyle = day ? 'rgba(2, 132, 199, 0.35)' : 'rgba(94, 234, 212, 0.35)';
      bgCtx.lineWidth = 1.5;
      bgCtx.setLineDash([4, 4]);
      bgCtx.strokeText(label, cssW / 2, cssH / 2 + 4);
      bgCtx.setLineDash([]);
    }

    let drawing = false;
    let currentStroke: Array<{ x: number; y: number }> = [];

    const drawPad = () => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.drawImage(bgBuf, 0, 0, cssW, cssH);

      // User strokes
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 8;
      ctx.strokeStyle = day ? '#0284c7' : '#5eead4';
      for (const s of traceStrokes) {
        if (s.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(s[0].x, s[0].y);
        for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const getPt = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      drawing = true;
      currentStroke = [getPt(e)];
      traceStrokes.push(currentStroke);
      drawPad();
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing) return;
      e.preventDefault();
      currentStroke.push(getPt(e));
      drawPad();
    };
    const onUp = () => {
      drawing = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    drawPad();

    traceCanvasCleanup = () => {
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }

  function render() {
    clearTimeout(quizTimer);
    quizTimer = 0;
    if (traceCanvasCleanup) {
      traceCanvasCleanup();
      traceCanvasCleanup = null;
    }
    activeArtCanvases = [];

    const entry = LETTERS[selectedIdx] || LETTERS[0];
    const accent = accentForEntry(entry);

    const ideaTabs: Array<{ id: IdeaId; label: string; desc: string }> = [
      { id: 'matrix', label: '1-g‘oya · Studiya', desc: '29 jadval + yon maşq' },
      { id: 'strip', label: '2-g‘oya · Lenta', desc: 'Taqqoslaş + ögirgiç' },
      { id: 'cards', label: '3-g‘oya · Kartalar', desc: 'Guruhlar + tez test' }
    ];

    hostEl.innerHTML = '';

    const shell = document.createElement('div');
    shell.className = 'alpha-studio-shell';

    // Top Studio Header + 3-Concept Switcher
    const header = document.createElement('header');
    header.className = 'alpha-studio-head';
    header.innerHTML = `
      <div class="alpha-head-title-wrap">
        <h1 class="alpha-head-title">Yangi Özbek Alifbosi <span class="alpha-count-tag">29 ta</span></h1>
        <p class="alpha-head-sub">1. A a — 29. ʼ (tutuq belgisi) · Ç, Ğ, Ö, Ş tartibi</p>
      </div>
      <div class="alpha-idea-switcher" role="tablist" aria-label="Alifbo dizayn g‘oyalari">
        ${ideaTabs
          .map(
            (tab) => `
          <button type="button" class="alpha-idea-btn ${activeIdea === tab.id ? 'is-active' : ''}" data-idea="${tab.id}" role="tab" aria-selected="${activeIdea === tab.id}">
            <strong>${tab.label}</strong>
            <span>${tab.desc}</span>
          </button>`
          )
          .join('')}
      </div>
    `;
    shell.appendChild(header);

    header.querySelectorAll('.alpha-idea-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = (btn as HTMLElement).dataset.idea as IdeaId;
        if (!next || next === activeIdea) return;
        activeIdea = next;
        try {
          localStorage.setItem(IDEA_KEY, next);
        } catch {}
        render();
      });
    });

    // Render active design idea
    if (activeIdea === 'matrix') {
      renderMatrixIdea(shell, entry, accent);
    } else if (activeIdea === 'strip') {
      renderStripIdea(shell, entry, accent);
    } else {
      renderCardsIdea(shell);
    }

    // Integrated Language & Alphabet Mini-Games + 2-Player PvP Duel Dock
    renderIntegratedLanguageGames(shell);

    hostEl.appendChild(shell);
    startArtLoop();
  }

  function renderIntegratedLanguageGames(shell: HTMLElement) {
    const langItems = EDU_ITEMS.filter((it) => ['uzbek', 'russian', 'english', 'karakalpak'].includes(String(it.subject)));
    const dock = document.createElement('section');
    dock.className = 'alpha-games-dock';
    dock.setAttribute('aria-label', String(ct('nav_letters')));

    dock.innerHTML = `
      <div class="alpha-games-head">
        <div>
          <h2 class="alpha-games-title">${ct('nav_letters')} (${langItems.length})</h2>
          <p class="alpha-games-sub">${ct('app_subtitle')} · ${ct('start_desc', { count: 6 })}</p>
        </div>
        <button type="button" class="edu-btn-primary alpha-pvp-cta" id="alpha-pvp-duel-btn">⚔️ ${ct('pvp')} (1 vs 2)</button>
      </div>
      <div class="alpha-games-grid"></div>
    `;

    dock.querySelector('#alpha-pvp-duel-btn')?.addEventListener('click', () => {
      openPvpDuel('lang');
    });

    const grid = dock.querySelector('.alpha-games-grid') as HTMLElement;
    langItems.forEach((gameItem) => {
      if (!gameItem) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'alpha-game-btn';
      btn.innerHTML = `
        <span class="alpha-game-glyph">${gameItem.glyph}</span>
        <span class="alpha-game-info">
          <strong>${gameItem.title}</strong>
          <small>${gameItem.subGlyph}</small>
        </span>
        <span class="alpha-game-go" aria-hidden="true">→</span>
      `;
      btn.addEventListener('click', () => openEduGame(gameItem));
      grid.appendChild(btn);
    });

    shell.appendChild(dock);
  }

  // ── IDEA 1: Glass Matrix (29 cells) + Interactive Practice Stage ──────────
  function renderMatrixIdea(shell: HTMLElement, entry: AlphabetEntry, accent: string) {
    const filters: Array<{ id: FilterId; label: string }> = [
      { id: 'all', label: 'Hammasi (29)' },
      { id: 'yangi', label: 'Yangi harflar (4)' },
      { id: 'unli', label: 'Unlilar (5)' },
      { id: 'undosh', label: 'Undoshlar (19)' },
      { id: 'belgi', label: 'Tutuq belgisi (1)' }
    ];

    const filterRow = document.createElement('div');
    filterRow.className = 'alpha-filter-row';
    filters.forEach((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `alpha-filter-btn ${activeFilter === f.id ? 'is-active' : ''}`;
      b.textContent = f.label;
      b.addEventListener('click', () => {
        activeFilter = f.id;
        render();
      });
      filterRow.appendChild(b);
    });
    shell.appendChild(filterRow);

    const gridLayout = document.createElement('div');
    gridLayout.className = 'alpha-matrix-layout';

    // Left: 29-letter numbered matrix
    const board = document.createElement('div');
    board.className = 'alpha-matrix-board';
    const filtered = activeFilter === 'all' ? LETTERS : LETTERS.filter((l) => l.type === activeFilter);

    filtered.forEach((l) => {
      const idx = l.num - 1;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = [
        'alpha-matrix-cell',
        idx === selectedIdx ? 'is-selected' : '',
        l.type === 'yangi' ? 'is-reformed' : '',
        l.type === 'belgi' ? 'is-mark' : ''
      ]
        .filter(Boolean)
        .join(' ');
      cell.innerHTML = `
        <span class="alpha-cell-num">${String(l.num).padStart(2, '0')}</span>
        <span class="alpha-cell-glyph">${l.type === 'belgi' ? 'ʼ' : `${l.upper} <small>${l.lower}</small>`}</span>
        <span class="alpha-cell-word">${l.old ? l.old : l.example}</span>
      `;
      cell.addEventListener('click', () => {
        selectedIdx = idx;
        traceStrokes = [];
        render();
      });
      board.appendChild(cell);
    });

    // Right: Selected letter spotlight + mini write & form check
    const stage = document.createElement('aside');
    stage.className = 'alpha-stage-card';

    const artWrap = document.createElement('div');
    artWrap.className = 'alpha-stage-top';

    const glyphBox = document.createElement('div');
    glyphBox.className = 'alpha-stage-hero';
    const displayPair = entry.type === 'belgi' ? 'ʼ' : `${entry.upper} ${entry.lower}`;
    glyphBox.innerHTML = `
      <div class="alpha-stage-meta">
        <span>${String(entry.num).padStart(2, '0')} / 29</span>
        <span>·</span>
        <span>${entry.type === 'yangi' ? 'Yangi harf' : entry.type === 'belgi' ? 'Tutuq belgisi' : entry.type === 'unli' ? 'Unli' : 'Undosh'}</span>
        ${entry.old ? `<span>· Avvalgi: <strong>${entry.old}</strong></span>` : ''}
      </div>
      <div class="alpha-stage-pair" style="--entry-accent:${accent}">${displayPair}</div>
      <div class="alpha-stage-words">
        ${(entry.words || [entry.example]).map((w) => `<span class="alpha-word-chip">${w}</span>`).join('')}
      </div>
    `;

    const artCanvas = document.createElement('canvas');
    artCanvas.width = 124;
    artCanvas.height = 124;
    artCanvas.className = 'alpha-stage-art';
    activeArtCanvases.push({ canvas: artCanvas, art: entry.art, accent, size: 96 });

    artWrap.append(glyphBox, artCanvas);
    stage.appendChild(artWrap);

    // Practice tabs: Yozib kör | Tekşiruv
    const subTabs = document.createElement('div');
    subTabs.className = 'alpha-subtabs';
    subTabs.innerHTML = `
      <button type="button" class="alpha-subtab ${matrixSubTab === 'trace' ? 'is-active' : ''}" data-sub="trace">Yozib kör (Taxta)</button>
      <button type="button" class="alpha-subtab ${matrixSubTab === 'check' ? 'is-active' : ''}" data-sub="check">Tekşiruv maşqi</button>
      <button type="button" class="pill-btn alpha-open-game-btn">Katta öyin →</button>
    `;
    subTabs.querySelectorAll('[data-sub]').forEach((b) => {
      b.addEventListener('click', () => {
        matrixSubTab = (b as HTMLElement).dataset.sub as 'trace' | 'check';
        render();
      });
    });
    subTabs.querySelector('.alpha-open-game-btn')?.addEventListener('click', () => launchRelatedGame(entry));
    stage.appendChild(subTabs);

    const labBody = document.createElement('div');
    labBody.className = 'alpha-lab-body';

    if (matrixSubTab === 'trace') {
      const padCanvas = document.createElement('canvas');
      padCanvas.className = 'alpha-mini-pad';
      const padActions = document.createElement('div');
      padActions.className = 'alpha-pad-actions';
      padActions.innerHTML = `
        <span class="alpha-pad-hint">${entry.hint}</span>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="pill-btn" id="alpha-trace-prev" aria-label="Oldingi harf">←</button>
          <button type="button" class="pill-btn" id="alpha-trace-next" aria-label="Keyingi harf">→</button>
          <button type="button" class="pill-btn" id="alpha-clear-pad">Tozalaş</button>
        </div>
      `;
      labBody.append(padCanvas, padActions);
      stage.appendChild(labBody);
      requestAnimationFrame(() => attachMiniTracePad(padCanvas, entry));
      padActions.querySelector('#alpha-trace-prev')?.addEventListener('click', () => {
        selectedIdx = (selectedIdx - 1 + LETTERS.length) % LETTERS.length;
        traceStrokes = [];
        render();
      });
      padActions.querySelector('#alpha-trace-next')?.addEventListener('click', () => {
        selectedIdx = (selectedIdx + 1) % LETTERS.length;
        traceStrokes = [];
        render();
      });
      padActions.querySelector('#alpha-clear-pad')?.addEventListener('click', () => {
        traceStrokes = [];
        attachMiniTracePad(padCanvas, entry);
      });
    } else {
      const schema = buildCheckForLetter(entry);
      const formBox = document.createElement('div');
      formBox.className = 'alpha-check-form';
      formBox.innerHTML = `
        <div class="alpha-check-prompt">${schema.prompt}</div>
        <div class="alpha-check-opts">
          ${schema.options.map((o) => `<button type="button" class="alpha-check-opt" data-val="${o}">${o}</button>`).join('')}
        </div>
        <div class="alpha-check-msg" id="alpha-check-msg"></div>
      `;
      formBox.querySelectorAll('.alpha-check-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = (btn as HTMLElement).dataset.val || '';
          const msgEl = formBox.querySelector('#alpha-check-msg') as HTMLElement;
          formBox.querySelectorAll('.alpha-check-opt').forEach((x) => x.classList.remove('is-correct', 'is-wrong'));
          if (val === schema.answer) {
            btn.classList.add('is-correct');
            msgEl.textContent = schema.explain;
            msgEl.style.color = isDayMode() ? '#047857' : '#5eead4';
          } else {
            btn.classList.add('is-wrong');
            msgEl.textContent = 'Yana bir marta urinib köring.';
            msgEl.style.color = isDayMode() ? '#be123c' : '#ff8fab';
          }
        });
      });
      labBody.appendChild(formBox);
      stage.appendChild(labBody);
    }

    gridLayout.append(board, stage);
    shell.appendChild(gridLayout);
  }

  // ── IDEA 2: Editorial Spotlight Strip + Old-to-New Live Converter ─────────
  function renderStripIdea(shell: HTMLElement, entry: AlphabetEntry, accent: string) {
    const spotlight = document.createElement('div');
    spotlight.className = 'alpha-spotlight';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'alpha-nav-arrow';
    prevBtn.textContent = '←';
    prevBtn.setAttribute('aria-label', 'Oldingi harf');
    prevBtn.addEventListener('click', () => {
      selectedIdx = (selectedIdx - 1 + LETTERS.length) % LETTERS.length;
      render();
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'alpha-nav-arrow';
    nextBtn.textContent = '→';
    nextBtn.setAttribute('aria-label', 'Keyingi harf');
    nextBtn.addEventListener('click', () => {
      selectedIdx = (selectedIdx + 1) % LETTERS.length;
      render();
    });

    const center = document.createElement('div');
    center.className = 'alpha-spot-center';

    const artCanvas = document.createElement('canvas');
    artCanvas.width = 148;
    artCanvas.height = 148;
    artCanvas.className = 'alpha-spot-art';
    activeArtCanvases.push({ canvas: artCanvas, art: entry.art, accent, size: 112 });

    const info = document.createElement('div');
    info.className = 'alpha-spot-info';
    info.innerHTML = `
      <div class="alpha-spot-pos">Tartib raqami: <strong>${String(entry.num).padStart(2, '0')} / 29</strong></div>
      <div class="alpha-spot-diff">
        ${entry.old ? `<span class="alpha-diff-old">${entry.old}</span><span class="alpha-diff-arrow">→</span>` : ''}
        <span class="alpha-diff-new">${entry.type === 'belgi' ? 'ʼ' : `${entry.upper} ${entry.lower}`}</span>
      </div>
      <p class="alpha-spot-hint">${entry.hint}</p>
      <div class="alpha-stage-words">
        ${(entry.words || [entry.example]).map((w) => `<span class="alpha-word-chip">${w}</span>`).join('')}
      </div>
    `;

    const actionCol = document.createElement('div');
    actionCol.className = 'alpha-spot-actions';
    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'edu-btn-primary';
    playBtn.textContent = 'Bu harf bilan öyin →';
    playBtn.addEventListener('click', () => launchRelatedGame(entry));
    actionCol.appendChild(playBtn);

    center.append(artCanvas, info, actionCol);
    spotlight.append(prevBtn, center, nextBtn);
    shell.appendChild(spotlight);

    // Live Eski -> Yangi Converter
    const conv = document.createElement('div');
    conv.className = 'alpha-converter-card';
    conv.innerHTML = `
      <div class="alpha-conv-head">
        <strong>Eski yozuvdan yangisiga jonli ögirgiç</strong>
        <div class="alpha-conv-presets">
          <button type="button" class="alpha-preset-btn" data-txt="Choynak, shahar, o'rdak, g'oz, ma'no">Namuna 1</button>
          <button type="button" class="alpha-preset-btn" data-txt="Quyosh chiqdi, bog'da a'lo dars">Namuna 2</button>
        </div>
      </div>
      <div class="alpha-conv-grid">
        <label class="alpha-conv-col">
          <span>Avvalgi yozuv (ch, sh, o', g', ')</span>
          <input type="text" class="alpha-conv-input" maxlength="80" />
        </label>
        <div class="alpha-conv-col">
          <span>Yangi alifbo (ç, ş, ö, ğ, ʼ)</span>
          <div class="alpha-conv-output"></div>
        </div>
      </div>
    `;

    const inputEl = conv.querySelector('.alpha-conv-input') as HTMLInputElement;
    const outputEl = conv.querySelector('.alpha-conv-output') as HTMLElement;
    inputEl.value = converterText;
    outputEl.textContent = convertOldToReformed(converterText);

    inputEl.addEventListener('input', () => {
      converterText = inputEl.value;
      outputEl.textContent = convertOldToReformed(converterText) || '—';
    });

    conv.querySelectorAll('.alpha-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = (btn as HTMLElement).dataset.txt || '';
        converterText = val;
        inputEl.value = val;
        outputEl.textContent = convertOldToReformed(val);
      });
    });
    shell.appendChild(conv);

    // Horizontal tactile dock strip (1..29)
    const stripWrap = document.createElement('div');
    stripWrap.className = 'alpha-strip-dock';
    LETTERS.forEach((l, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `alpha-strip-item ${i === selectedIdx ? 'is-active' : ''} ${l.old ? 'is-special' : ''}`;
      btn.innerHTML = `<small>${String(l.num).padStart(2, '0')}</small><strong>${l.upper}</strong>`;
      btn.addEventListener('click', () => {
        selectedIdx = i;
        render();
      });
      stripWrap.appendChild(btn);
    });
    shell.appendChild(stripWrap);

    requestAnimationFrame(() => {
      const act = stripWrap.querySelector('.is-active') as HTMLElement | null;
      act?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }

  // ── IDEA 3: Quick Test & Full 29-Letter Interactive Shelf ────────────────
  function renderCardsIdea(shell: HTMLElement) {
    // Quick 1-click Quiz Challenge + Complete 29-item Interactive List
    const lowerGrid = document.createElement('div');
    lowerGrid.className = 'alpha-cards-lower';

    // Mini Quiz Box
    const realQIdx = quizOrder[quizIdx % quizOrder.length];
    const qData = CARD_QUIZ_BANK[realQIdx];
    const quizCard = document.createElement('div');
    quizCard.className = 'alpha-quiz-card';
    quizCard.innerHTML = `
      <div class="alpha-quiz-head">
        <strong>Tez savol (${(quizIdx % quizOrder.length) + 1} / ${quizOrder.length})</strong>
        <span class="alpha-streak">★ ${quizStreak}</span>
      </div>
      <p class="alpha-quiz-q">${qData.q}</p>
      <div class="alpha-check-opts">
        ${shuffledQuizOpts.map((o) => `<button type="button" class="alpha-check-opt" data-val="${o}">${o}</button>`).join('')}
      </div>
      <div class="alpha-check-msg" style="color:${quizFeedback ? (quizFeedback.ok ? (isDayMode() ? '#047857' : '#5eead4') : (isDayMode() ? '#be123c' : '#ff8fab')) : ''}">${quizFeedback ? quizFeedback.text : ''}</div>
    `;
    quizCard.querySelectorAll('.alpha-check-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = (btn as HTMLElement).dataset.val || '';
        if (val === qData.a) {
          quizStreak++;
          quizFeedback = { text: 'Töğri javob! Keyingi savolga ötamiz.', ok: true };
          render();
          clearTimeout(quizTimer);
          quizTimer = window.setTimeout(() => {
            quizTimer = 0;
            quizIdx++;
            if (quizIdx % quizOrder.length === 0) {
              const last = quizOrder[quizOrder.length - 1];
              quizOrder = shuffleArr(CARD_QUIZ_BANK.map((_, i) => i));
              if (quizOrder[0] === last && quizOrder.length > 1) {
                [quizOrder[0], quizOrder[1]] = [quizOrder[1], quizOrder[0]];
              }
            }
            const nextQ = CARD_QUIZ_BANK[quizOrder[quizIdx % quizOrder.length]];
            shuffledQuizOpts = shuffleArr(nextQ.opts);
            quizFeedback = null;
            if (isVisible && activeIdea === 'cards') render();
          }, 950);
        } else {
          quizStreak = 0;
          quizFeedback = { text: 'Töğri javobni qayta tanlab köring.', ok: false };
          render();
        }
      });
    });

    // Full 29-item Compact Reference Shelf (clickable to trace directly)
    const refCard = document.createElement('div');
    refCard.className = 'alpha-ref-card';
    const refTitle = document.createElement('div');
    refTitle.className = 'alpha-ref-head';
    refTitle.innerHTML = '<strong>Töliq 29 talik tartib</strong><span>Bosing → yozib köring</span>';
    refCard.appendChild(refTitle);

    const refList = document.createElement('div');
    refList.className = 'alpha-ref-grid';
    LETTERS.forEach((l, i) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `alpha-ref-row ${expandedCardIdx === i ? 'is-active' : ''} ${l.old ? 'is-special' : ''}`;
      row.innerHTML = `
        <span class="alpha-ref-num">${l.num}.</span>
        <strong class="alpha-ref-glyph">${l.type === 'belgi' ? 'ʼ' : `${l.upper} ${l.lower}`}</strong>
        <span class="alpha-ref-ex">${l.old ? l.old : l.example}</span>
      `;
      row.addEventListener('click', () => {
        expandedCardIdx = i;
        selectedIdx = i;
        openEduGame({ ...EDU_ITEMS[1], config: { ...(EDU_ITEMS[1].config || {}), startLetter: l.upper } });
      });
      refList.appendChild(row);
    });
    refCard.appendChild(refList);

    lowerGrid.append(quizCard, refCard);
    shell.appendChild(lowerGrid);
  }

  // Re-render pad stroke colors cleanly on Day/Night toggle
  onThemeChange(() => {
    if (isVisible) render();
  });

  // Keyboard ← / → support in Strip mode
  window.addEventListener('keydown', (e) => {
    if (!isVisible || activeIdea !== 'strip') return;
    if ((document.activeElement as HTMLElement)?.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') {
      selectedIdx = (selectedIdx + 1) % LETTERS.length;
      render();
    } else if (e.key === 'ArrowLeft') {
      selectedIdx = (selectedIdx - 1 + LETTERS.length) % LETTERS.length;
      render();
    }
  });

  return {
    el: section,
    enter() {
      isVisible = true;
      render();
    },
    leave() {
      isVisible = false;
      clearTimeout(quizTimer);
      quizTimer = 0;
      stopArtLoop();
      if (traceCanvasCleanup) {
        traceCanvasCleanup();
        traceCanvasCleanup = null;
      }
    }
  };
}
