import gsap from 'gsap';
import {
  EDU_ITEMS as SENIOR_ITEMS,
  GRADES,
  SUBJECTS,
  getContentLang,
  makeQuestions,
  setContentLang,
  tr
} from './senior-content.js';
import './senior.css';

export { onBgReady, UZ_ALPHABET, playSound, drawEduCardFrame } from './edu-engine-legacy.js';

let modalEl = null;
let modalBody = null;
let modalTitle = null;
let modalSub = null;
let modalScore = null;
let activeItem = null;
let activeCleanup = null;
let activeTimers = new Set();
let onCloseCb = null;
let lang = getContentLang() || 'uz';
let grade = 5;

const L = (key, vars) => tr(lang, key, vars);

function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

function refreshItems() {
  SENIOR_ITEMS.forEach((item) => {
    const g = item.grades.join(', ');
    item.title = `${L(item.subject)} · ${L(item.skill)}`;
    item.subGlyph = `${L('grade')} ${g}`;
    item.category = L(item.subject);
    item.year = `${L('grade')} ${g}`;
    item.desc = L('game_desc', { grade: g, subject: L(item.subject), skill: L(item.skill) });
  });
}
refreshItems();

export const EDU_ITEMS = SENIOR_ITEMS;

window.addEventListener('alif:lang', (e) => {
  const next = e.detail?.lang;
  if (!next || next === lang) return;
  lang = next;
  setContentLang(lang);
  refreshItems();
  if (isEduGameOpen() && activeItem) openEduGame(activeItem, onCloseCb, true);
});

function ensureModal() {
  if (modalEl) return;
  modalEl = document.getElementById('edu-modal');
  modalBody = document.getElementById('edu-body');
  modalTitle = document.getElementById('edu-title');
  modalSub = document.getElementById('edu-sub');
  modalScore = document.getElementById('edu-score');
  const closeBtn = document.getElementById('edu-close');
  if (closeBtn) closeBtn.addEventListener('click', closeEduGame);
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeEduGame();
    });
  }
}

function clearActiveGame() {
  activeTimers.forEach((id) => {
    window.clearTimeout(id);
    window.clearInterval(id);
  });
  activeTimers.clear();
  if (activeCleanup) {
    try { activeCleanup(); } catch {}
    activeCleanup = null;
  }
}

export function isEduGameOpen() {
  return Boolean(modalEl && modalEl.classList.contains('is-open'));
}

export function closeEduGame() {
  if (!modalEl || !isEduGameOpen()) return;
  clearActiveGame();
  modalEl.classList.remove('is-open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-game-open');
  window.dispatchEvent(new Event('alif:gamemodal'));
  gsap.to(modalEl, {
    opacity: 0,
    duration: 0.28,
    ease: 'power2.in',
    onComplete: () => {
      if (!isEduGameOpen()) {
        modalEl.style.visibility = 'hidden';
        modalBody.innerHTML = '';
        if (onCloseCb) onCloseCb();
      }
    }
  });
}

function itemForGrade(item) {
  if (!item.config?.grades?.length) return item;
  const g = item.config.grades.includes(grade) ? grade : item.config.grades[item.config.grades.length - 1];
  return { ...item, config: { ...item.config, grades: [g] } };
}

function trackFor(item) {
  if (item?.subject === 'math') return 'math';
  if (item?.subject === 'logic') return 'logic';
  return 'lang';
}

function buildTopControls(item, mode) {
  const topRight = modalEl.querySelector('.edu-top-right');
  if (!topRight) return;

  let gradeBox = topRight.querySelector('#edu-grade-box');
  if (!gradeBox) {
    gradeBox = document.createElement('div');
    gradeBox.id = 'edu-grade-box';
    gradeBox.className = 'senior-grade';
    topRight.prepend(gradeBox);
  }
  gradeBox.innerHTML = `<span>${L('grade')}</span>`;
  const sel = document.createElement('select');
  sel.setAttribute('aria-label', L('grade'));
  GRADES.forEach((g) => {
    const opt = document.createElement('option');
    opt.value = String(g);
    opt.textContent = String(g);
    sel.appendChild(opt);
  });
  sel.value = String(grade);
  sel.addEventListener('change', () => {
    grade = Number(sel.value);
    if (isEduGameOpen() && activeItem) openEduGame(activeItem, onCloseCb, true);
  });
  gradeBox.appendChild(sel);

  let subjectBox = topRight.querySelector('#edu-subject-box');
  if (!subjectBox) {
    subjectBox = document.createElement('div');
    subjectBox.id = 'edu-subject-box';
    subjectBox.className = 'senior-grade';
    topRight.insertBefore(subjectBox, gradeBox.nextSibling);
  }
  subjectBox.innerHTML = `<span>${L('subject')}</span>`;
  const subSel = document.createElement('select');
  subSel.setAttribute('aria-label', L('subject'));
  SUBJECTS.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = L(s);
    subSel.appendChild(opt);
  });
  subSel.value = item.subject || 'uzbek';
  subSel.addEventListener('change', () => {
    const next = SENIOR_ITEMS.find((it) => it.subject === subSel.value && it.grades.includes(grade))
      || SENIOR_ITEMS.find((it) => it.subject === subSel.value);
    if (next) openEduGame(next, onCloseCb, true);
  });
  subjectBox.appendChild(subSel);

  let replayBtn = topRight.querySelector('#edu-head-replay');
  if (!replayBtn) {
    replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.id = 'edu-head-replay';
    replayBtn.className = 'pill-btn';
    topRight.insertBefore(replayBtn, subjectBox.nextSibling);
  }
  replayBtn.textContent = `↻ ${L('replay')}`;
  replayBtn.onclick = () => {
    if (mode === 'pvp') openPvpDuel(item.config?.track || trackFor(item));
    else openEduGame(item, onCloseCb, true);
  };

  let pvpBtn = topRight.querySelector('#edu-pvp-toggle');
  if (!pvpBtn) {
    pvpBtn = document.createElement('button');
    pvpBtn.type = 'button';
    pvpBtn.id = 'edu-pvp-toggle';
    pvpBtn.className = 'pill-btn edu-pvp-toggle';
    topRight.insertBefore(pvpBtn, replayBtn.nextSibling);
  }
  pvpBtn.textContent = `⚔️ ${L('pvp')}`;
  pvpBtn.title = L('duel_desc');
  pvpBtn.classList.toggle('is-active', mode === 'pvp');
  pvpBtn.onclick = () => openPvpDuel(trackFor(item));
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function mountQuiz(item) {
  clearActiveGame();
  const abort = new AbortController();
  activeCleanup = () => abort.abort();
  const signal = abort.signal;

  const questions = makeQuestions(itemForGrade(item), Math.min(item.config?.count || 6, 8), Math.random, lang);
  let index = 0;
  let score = 0;
  const wrap = el('div', 'senior-quiz');
  const head = el('div', 'senior-head');
  const counter = el('span', 'senior-counter');
  const star = el('span', 'senior-star');
  head.append(counter, star);
  const bar = el('div', 'senior-progress');
  const fill = el('i', 'senior-progress-fill');
  bar.appendChild(fill);
  const prompt = el('h3', 'senior-question');
  const options = el('div', 'senior-options');
  const inputRow = el('div', 'senior-input-row');
  const input = el('input', 'senior-input');
  input.type = 'text';
  input.placeholder = L('type_answer');
  input.autocomplete = 'off';
  const checkBtn = el('button', 'pill-btn', L('check'));
  checkBtn.type = 'button';
  inputRow.append(input, checkBtn);
  const feedback = el('div', 'senior-feedback');
  const nextBtn = el('button', 'pill-btn senior-next', '');
  nextBtn.type = 'button';
  nextBtn.hidden = true;
  wrap.append(head, bar, prompt, options, inputRow, feedback, nextBtn);
  modalBody.innerHTML = '';
  modalBody.appendChild(wrap);
  if (modalScore) modalScore.style.display = '';
  modalScore.textContent = `★ 0`;

  let locked = false;
  function draw() {
    locked = false;
    const q = questions[index];
    counter.textContent = `${L('question')} ${index + 1} ${L('of')} ${questions.length}`;
    star.textContent = `★ ${score}`;
    fill.style.width = `${((index + 1) / questions.length) * 100}%`;
    prompt.textContent = q.prompt;
    options.innerHTML = '';
    inputRow.hidden = q.kind !== 'input';
    feedback.textContent = '';
    nextBtn.hidden = true;
    if (q.kind === 'choice') {
      q.options.forEach((opt) => {
        const b = el('button', 'senior-opt', opt.label);
        b.type = 'button';
        b.addEventListener('click', () => finish(opt.correct, q), { signal });
        options.appendChild(b);
      });
    } else {
      input.value = '';
      checkBtn.onclick = () => {
        const norm = (v) => String(v).trim().toLowerCase().replace(/\s+/g, '').replace(/,/, '.');
        finish(norm(input.value) === norm(q.answer), q);
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !locked) checkBtn.click();
      }, { signal });
      input.focus();
    }
  }

  function finish(ok, q) {
    if (locked) return;
    locked = true;
    if (ok) score++;
    modalScore.textContent = `★ ${score}`;
    star.textContent = `★ ${score}`;
    feedback.textContent = `${ok ? L('correct') : L('wrong')} · ${L('solution')} ${q.explain}`;
    feedback.classList.toggle('is-ok', ok);
    feedback.classList.toggle('is-bad', !ok);
    options.querySelectorAll('.senior-opt').forEach((b, i) => {
      b.classList.toggle('is-correct', Boolean(q.options?.[i]?.correct));
      b.disabled = true;
    });
    input.disabled = true;
    checkBtn.disabled = true;
    nextBtn.textContent = index === questions.length - 1 ? L('finish') : L('next_question');
    nextBtn.hidden = false;
  }

  nextBtn.addEventListener('click', () => {
    if (index === questions.length - 1) {
      closeEduGame();
      return;
    }
    index++;
    draw();
  }, { signal });

  draw();
}

function pvpOptions(q) {
  if (q.kind === 'choice' && q.options?.length) return q.options.slice(0, 4);
  const answer = String(q.answer);
  const set = new Set([answer]);
  const n = Number(answer.replace(',', '.'));
  if (Number.isFinite(n)) {
    [1, -1, 2, -2, 10, -10].forEach((d) => set.add(String(n + d)));
  } else {
    ['—', `${answer}?`, `${answer} 1`].forEach((v) => set.add(v));
  }
  const opts = shuffle([...set]).slice(0, 4);
  if (!opts.includes(answer)) opts[0] = answer;
  return shuffle(opts).map((label) => ({ label, correct: label === answer }));
}

export function openPvpDuel(track = 'lang') {
  ensureModal();
  clearActiveGame();
  activeItem = {
    id: 99,
    subject: track === 'math' ? 'math' : track === 'logic' ? 'logic' : 'uzbek',
    skill: 'mixed',
    grades: [grade],
    glyph: '⚔️',
    subGlyph: L('duel_live'),
    title: `${L('pvp')} · ${L(track === 'math' ? 'math' : track === 'logic' ? 'logic' : 'uzbek')}`,
    category: L('duel_live'),
    year: '1 vs 2',
    desc: L('duel_desc'),
    accent: '#5eead4',
    art: 'yulduz',
    bg: 'space',
    gameType: 'pvp-duel',
    config: { track, directPvp: true, count: 6 }
  };
  activeItem.title = `${L('pvp')} · ${L(activeItem.subject)}`;
  modalTitle.textContent = activeItem.title;
  modalSub.textContent = `${L('duel_live')}, 1 vs 2`;
  if (modalScore) modalScore.style.display = 'none';
  buildTopControls(activeItem, 'pvp');
  showModal();
  mountPvp(track);
}

function mountPvp(track) {
  clearActiveGame();
  const abort = new AbortController();
  activeCleanup = () => abort.abort();
  const signal = abort.signal;

  const pool = SENIOR_ITEMS.filter((it) => {
    if (track === 'math') return it.subject === 'math';
    if (track === 'logic') return it.subject === 'logic';
    return ['uzbek', 'russian', 'english', 'karakalpak'].includes(it.subject);
  });
  const rounds = [];
  for (let i = 0; i < 6; i++) {
    const src = shuffle(pool.filter((it) => !it.grades || it.grades.includes(grade)))[0] || pool[0];
    const used = itemForGrade(src);
    const q = makeQuestions(used, 1, Math.random, lang)[0];
    rounds.push({ q, opts: pvpOptions(q), src });
  }

  let round = 0;
  let p1 = 0;
  let p2 = 0;
  let answered = { 1: null, 2: null };
  let intervalId = null;
  let time = 15;
  let roundLocked = false;

  const wrap = el('div', 'pvp-arena');
  const bar = el('div', 'pvp-bar');
  const roundTag = el('span', 'pvp-round');
  const p1Tag = el('strong', 'pvp-score p1');
  const p2Tag = el('strong', 'pvp-score p2');
  const timerTag = el('span', 'pvp-timer');
  bar.append(p1Tag, roundTag, timerTag, p2Tag);
  const desc = el('p', 'pvp-desc', L('duel_desc'));
  const prompt = el('h3', 'senior-question pvp-prompt');
  const sides = el('div', 'pvp-sides');
  const side1 = el('div', 'pvp-side p1');
  const side2 = el('div', 'pvp-side p2');
  const title1 = el('div', 'pvp-player-title', `${L('player1')} · ${L('p1_keys')}`);
  const title2 = el('div', 'pvp-player-title', `${L('player2')} · ${L('p2_keys')}`);
  const opts1 = el('div', 'pvp-options');
  const opts2 = el('div', 'pvp-options');
  const status1 = el('div', 'pvp-status');
  const status2 = el('div', 'pvp-status');
  side1.append(title1, opts1, status1);
  side2.append(title2, opts2, status2);
  sides.append(side1, side2);
  const result = el('div', 'pvp-result');
  result.hidden = true;
  const nextBtn = el('button', 'pill-btn senior-next', L('next_question'));
  nextBtn.type = 'button';
  nextBtn.hidden = true;
  wrap.append(bar, desc, prompt, sides, result, nextBtn);
  modalBody.innerHTML = '';
  modalBody.appendChild(wrap);

  function renderScores() {
    p1Tag.textContent = `${L('player1')} ★ ${p1}`;
    p2Tag.textContent = `${L('player2')} ★ ${p2}`;
    roundTag.textContent = `${L('round')} ${round + 1}/${rounds.length}`;
    timerTag.textContent = `${time}s`;
  }

  function renderRound() {
    roundLocked = false;
    answered = { 1: null, 2: null };
    time = 15;
    result.hidden = true;
    result.textContent = '';
    nextBtn.hidden = true;
    status1.textContent = '';
    status2.textContent = '';
    const { q, opts } = rounds[round];
    prompt.textContent = q.prompt;
    opts1.innerHTML = '';
    opts2.innerHTML = '';
    const keys1 = ['1', '2', '3', '4'];
    const keys2 = ['7', '8', '9', '0'];
    opts.forEach((opt, i) => {
      const b1 = el('button', 'pvp-opt', `${keys1[i]}  ${opt.label}`);
      const b2 = el('button', 'pvp-opt', `${keys2[i]}  ${opt.label}`);
      b1.type = 'button';
      b2.type = 'button';
      b1.addEventListener('click', () => press(1, i), { signal });
      b2.addEventListener('click', () => press(2, i), { signal });
      opts1.appendChild(b1);
      opts2.appendChild(b2);
    });
    renderScores();
    if (intervalId) window.clearInterval(intervalId);
    intervalId = window.setInterval(() => {
      time--;
      renderScores();
      if (time <= 0) {
        if (!answered[1]) answered[1] = { ok: false, skipped: true };
        if (!answered[2]) answered[2] = { ok: false, skipped: true };
        finishRound();
      }
    }, 1000);
    activeTimers.add(intervalId);
  }

  function press(player, idx) {
    if (roundLocked || answered[player]) return;
    const opt = rounds[round].opts[idx];
    const ok = Boolean(opt?.correct);
    answered[player] = { ok, idx };
    if (ok) {
      if (player === 1) p1++;
      else p2++;
    }
    const status = player === 1 ? status1 : status2;
    status.textContent = ok ? L('correct') : L('wrong');
    status.className = `pvp-status ${ok ? 'is-ok' : 'is-bad'}`;
    renderScores();
    if (answered[1] && answered[2]) finishRound();
  }

  function onKey(e) {
    const i1 = ['1', '2', '3', '4'].indexOf(e.key);
    const i2 = ['7', '8', '9', '0'].indexOf(e.key);
    if (i1 >= 0) { e.preventDefault(); press(1, i1); }
    if (i2 >= 0) { e.preventDefault(); press(2, i2); }
    if (e.key === 'Enter' && !nextBtn.hidden) nextBtn.click();
  }
  document.addEventListener('keydown', onKey, { signal });

  function finishRound() {
    if (roundLocked) return;
    roundLocked = true;
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
    const opts = rounds[round].opts;
    [opts1, opts2].forEach((box, sideIdx) => {
      [...box.children].forEach((b, i) => {
        b.disabled = true;
        b.classList.toggle('is-correct', Boolean(opts[i]?.correct));
        const a = answered[sideIdx + 1];
        if (a && a.idx === i) b.classList.add(a.ok ? 'is-picked-ok' : 'is-picked-bad');
      });
    });
    if (!answered[1]) { answered[1] = { ok: false, skipped: true }; status1.textContent = L('no_answer'); }
    if (!answered[2]) { answered[2] = { ok: false, skipped: true }; status2.textContent = L('no_answer'); }
    result.hidden = false;
    result.textContent = `${L('solution')} ${rounds[round].q.explain}`;
    renderScores();
    if (round === rounds.length - 1) {
      nextBtn.textContent = L('finish');
      nextBtn.hidden = false;
      nextBtn.onclick = () => showWinner(p1, p2);
    } else {
      nextBtn.textContent = L('next_question');
      nextBtn.hidden = false;
      nextBtn.onclick = () => { round++; renderRound(); };
    }
  }

  function showWinner(a, b) {
    prompt.textContent = a === b ? L('draw') : L('winner', { p: a > b ? L('player1') : L('player2') });
    desc.textContent = `${L('result')}: ${L('player1')} ★ ${a} · ${L('player2')} ★ ${b}`;
    sides.classList.add('is-done');
    nextBtn.textContent = L('new_duel');
    nextBtn.hidden = false;
    nextBtn.onclick = () => openPvpDuel(track);
  }

  renderRound();
}

function showModal() {
  modalEl.classList.add('is-open');
  modalEl.setAttribute('aria-hidden', 'false');
  modalEl.style.visibility = 'visible';
  document.body.classList.add('is-game-open');
  window.dispatchEvent(new Event('alif:gamemodal'));
  gsap.fromTo(modalEl, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' });
}

export function openEduGame(item, onClose, keepState = false) {
  ensureModal();
  clearActiveGame();
  if (!keepState) onCloseCb = onClose || null;
  activeItem = item;
  modalTitle.textContent = item.title;
  modalSub.textContent = `${item.category}, ${item.year}`;
  buildTopControls(item, 'quiz');
  showModal();
  mountQuiz(item);
}
