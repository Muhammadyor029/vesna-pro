/* ALIF.12 — qo'shimcha qatlam:
   tillar (uz/kaa/ru/en), kontakt, sozlamalar, robot-yordamchi, ko'z dam olish taymeri,
   to'lqin effekti (sayt so'nadi va qaytadi), ko'z mashqlari, xatolarni ko'rsatish.
   Asosiy 3D kod (index.html) bilan faqat DOM va 'alif:robot-click' hodisasi orqali bog'lanadi. */

import { toggleTheme, onThemeChange } from './theme.ts';

// ───────────────────────── SOZLAMALAR (SHUNI O'ZGARTIR) ─────────────────────────
const CONFIG = {
  email: 'hello@vesna.uz',        // TODO: haqiqiy pochtangni yoz
  telegram: 'https://t.me/vesna_edu', // TODO: haqiqiy Telegram havolangni yoz
  defaultLang: 'uz',
  intervalOptions: [10, 15, 20, 30], // daqiqa
  restOptions: [20, 40, 60],         // soniya
  defaultInterval: 20,
  defaultRest: 40,
  idleCutoffMs: 45000,               // shuncha vaqt harakat bo'lmasa, ekran vaqti sanalmaydi
  snoozeMin: 5,
  promptAutoMs: 12000                // robot xabaridan keyin to'lqin o'zi boshlanadi
};
const DEMO = /[?&]demo\b/.test(location.search); // ?demo — taqdimot uchun: 30 s da eslatma, 15 s dam olish

// ───────────────────────── TARJIMALAR ─────────────────────────
// Qoraqalpoq (kaa) matnlari TEKSHIRILISHI KERAK (ona tili egasi bilan).
const I18N = {
  uz: {
    nav_sphere: 'Fanlar xaritasi', nav_games: 'Mashqlar', nav_letters: 'Fanlar', nav_alphabet: 'Yoʻriqnoma', nav_contact: 'Boğlaniş',
    hint_spin: 'AYLANTIRIB TANLANG', play_arrow: 'Boshlash →', close: 'Yopish', scroll: 'SURİŞ',
    menu_intro: '5–11-sinf: matematika va tillar',
    gallery_left: '5–11-SINF', gallery_right: 'MATEMATIKA · TILLAR',
    tag1: '5–11-sinf', tag2: 'Matematika va tillar', tag3: 'Tezkor mashq',
    set_every: 'Köz uçun dam oliş eslatmasi', set_rest: 'Dam oliş davomiyligi', min: 'daq', sec: 's',
    rest_now: 'Hozir dam olamiz', eye_now: 'Köz maşqi',
    theme_mode: 'Kungi / Tungi rejim', theme_day: 'Kun', theme_night: 'Tun',
    guide_btn: 'Yoʻriqnoma', guide_title: 'VESNA PRO — Yoʻriqnoma', guide_sub: '5–11-sinf oʻquvchilari va oʻqituvchilari uchun',
    greet: ['Salom! Men Vesna. Meni bosib kör!', 'Birga öynaymizmi?'],
    again: 'Yana salom! Davom etamizmi?',
    prompt_now: 'Hozir dam olamiz', prompt_later: '5 daqiqadan keyin',
    rest_title: 'Köz dam olsin!', back_msg: 'Qaytding! Davom etamizmi?', back_btn: 'Qaytiş',
    eye_start: 'Köz maşqi', eye_choose: 'Maşqni tanla',
    break_msgs: [
      'Közlaring çarçadi! Derazadan uzoqqa qara.',
      'Biroz havo almaştiraylik, köçaga çiqib kel.',
      'Dars vaqti ham böldi, vazifangni qilib kel, keyin yana öynaymiz.',
      '20 soniya uzoqdagi narsaga qara, keyin davom etamiz.',
      'Közlaringni kaftlaring bilan yopib, dam ol.'
    ],
    ex_ball_t: 'Şarni kuzat', ex_ball_d: 'Boşingni burma, faqat közing bilan şarni kuzat.',
    ex_focus_t: 'Yaqin va uzoq', ex_focus_d: 'Doira kattalaşsa yaqinga, kiçiklaşsa uzoqqa qara.',
    ex_blink_t: 'Kapalak', ex_blink_d: 'Qanotlar yopilganda közingni qis.',
    ex_far_t: 'Uzoqqa qara', ex_far_d: 'Derazadan eng uzoqdagi narsaga qara.',
    ex_near: 'Yaqin', ex_farw: 'Uzoq', ex_stop: 'Töxtat', ex_done: 'Barakalla!',
    contact_title: 'Boğlaniş',
    contact_lead: 'Savolingiz bormi yoki maktabingizda VESNA ni sinab körmoqçimisiz? Yozing!',
    contact_email: 'Poçta yoziş', contact_tg: 'Telegram',
    f_school: 'Maktab nomi', f_name: 'Ismingiz', f_phone: 'Telefon yoki Telegram', f_msg: 'Xabar', f_send: 'Yuboriş',
    mail_subject: 'VESNA haqida', err_boot: 'Sayt töliq yuklanmadi. Sahifani yangilang.', reload: 'Yangilaş'
  },
  kaa: {
    nav_sphere: 'Fanlar kartası', nav_games: 'Mashıqlar', nav_letters: 'Fanlar', nav_alphabet: 'Bağanısh', nav_contact: 'Baylanıs',
    hint_spin: 'AYLANDIRIP SAYLAŃ', play_arrow: 'Baslaw →', close: 'Jabıw', scroll: 'SÚRIŃ',
    menu_intro: '5–11-klass: matematika hám tiller',
    gallery_left: '5–11-KLASS', gallery_right: 'MATEMATIKA · TILLER',
    tag1: '5–11-klass', tag2: 'Matematika hám tiller', tag3: 'Tez mashıq',
    set_every: 'Kóz dem alıw eskertiwi', set_rest: 'Dem alıw dawamlılığı', min: 'min', sec: 's',
    rest_now: 'Házir dem alamız', eye_now: 'Kóz shınıǵıwı',
    theme_mode: 'Kún / Tún rejimi', theme_day: 'Kún', theme_night: 'Tún',
    guide_btn: 'Bağanısh', guide_title: 'VESNA PRO — Bağanısh', guide_sub: '5–11-klass oqıwshıları hám oqıtıwshıları ushın',
    greet: ['Sálem! Men Vesna. Maǵan bas!', 'Birge oynayıqpa?'],
    again: 'Taǵı sálem! Dawam etemizbe?',
    prompt_now: 'Házir dem alamız', prompt_later: '5 minuttan keyin',
    rest_title: 'Kózlerge dem kerek!', back_msg: 'Qaytıp keldiń! Dawam etemizbe?', back_btn: 'Qaytıw',
    eye_start: 'Kóz shınıǵıwı', eye_choose: 'Shınıǵıwdı tańla',
    break_msgs: [
      'Kózleriń sharshadı! Derezeden uzaqqa qara.',
      'Azıraq hawa almasayıq, kóshege shıǵıp kel.',
      'Sabaq waqtı da boldı, tapsırmańdı orınlap kel, keyin taǵı oynaymız.',
      '20 sekund uzaqtaǵı nárseǵe qara, keyin dawam etemiz.',
      'Kózlerińdi alaqanıń menen jabıp, dem al.'
    ],
    ex_ball_t: 'Sharıqtı baqla', ex_ball_d: 'Basıńdı burma, tek kózińdi júgirt.',
    ex_focus_t: 'Jaqın hám uzaq', ex_focus_d: 'Dóńgelek úlkeyse jaqınǵa, kishireyse uzaqqa qara.',
    ex_blink_t: 'Kóbelek', ex_blink_d: 'Qanatlar jabılǵanda kózińdi qısıp ash.',
    ex_far_t: 'Uzaqqa qara', ex_far_d: 'Derezeden eń uzaqtaǵı nárseǵe qara.',
    ex_near: 'Jaqın', ex_farw: 'Uzaq', ex_stop: 'Toqtat', ex_done: 'Aferin!',
    contact_title: 'Baylanıs',
    contact_lead: 'Sorawıńız barma yamasa VESNA di mektebińizde sınap kórgińiz keledi me? Jazıń!',
    contact_email: 'Poshta jazıw', contact_tg: 'Telegram',
    f_school: 'Mektep atı', f_name: 'Atıńız', f_phone: 'Telefon yamasa Telegram', f_msg: 'Xabar', f_send: 'Jiberiw',
    mail_subject: 'VESNA haqqında', err_boot: 'Sayt tolıq júklenbedi. Betti jańalań.', reload: 'Jańalaw'
  },
  ru: {
    nav_sphere: 'Карта предметов', nav_games: 'Упражнения', nav_letters: 'Предметы', nav_alphabet: 'Инструкция', nav_contact: 'Контакты',
    hint_spin: 'ВРАЩАЙТЕ И ВЫБИРАЙТЕ', play_arrow: 'Начать →', close: 'Закрыть', scroll: 'ЛИСТАЙТЕ',
    menu_intro: '5–11 классы: математика и языки',
    gallery_left: '5–11 КЛАССЫ', gallery_right: 'МАТЕМАТИКА · ЯЗЫКИ',
    tag1: '5–11 классы', tag2: 'Математика и языки', tag3: 'Быстрая тренировка',
    set_every: 'Напоминание об отдыхе для глаз', set_rest: 'Длительность отдыха', min: 'мин', sec: 'с',
    rest_now: 'Отдохнём сейчас', eye_now: 'Зарядка для глаз',
    theme_mode: 'Дневной / Ночной режим', theme_day: 'День', theme_night: 'Ночь',
    guide_btn: 'Инструкция', guide_title: 'VESNA PRO — Инструкция', guide_sub: 'Для учеников 5–11 классов и учителей',
    greet: ['Привет! Я Весна. Нажми на меня!', 'Давай играть вместе?'],
    again: 'Снова привет! Продолжим?',
    prompt_now: 'Отдохнём сейчас', prompt_later: 'Через 5 минут',
    rest_title: 'Глазам нужен отдых!', back_msg: 'Ты вернулся! Продолжим?', back_btn: 'Вернуться',
    eye_start: 'Зарядка для глаз', eye_choose: 'Выбери упражнение',
    break_msgs: [
      'Глазки устали! Посмотри вдаль, в окно.',
      'Давай проветримся: выйди на улицу подышать.',
      'Пора и за уроки — сделай домашку, а потом поиграем.',
      'Посмотри 20 секунд на что-нибудь далёкое, и продолжим.',
      'Закрой глаза ладошками и отдохни.'
    ],
    ex_ball_t: 'Следи за шариком', ex_ball_d: 'Не двигай головой — следи только глазами.',
    ex_focus_t: 'Ближе и дальше', ex_focus_d: 'Круг растёт — смотри вблизи, уменьшается — вдаль.',
    ex_blink_t: 'Бабочка', ex_blink_d: 'Когда крылья закрываются — моргни.',
    ex_far_t: 'Смотри вдаль', ex_far_d: 'Найди за окном самый далёкий предмет и смотри на него.',
    ex_near: 'Близко', ex_farw: 'Далеко', ex_stop: 'Остановить', ex_done: 'Молодец!',
    contact_title: 'Контакты',
    contact_lead: 'Есть вопрос или хотите попробовать VESNA в вашей школе? Напишите нам!',
    contact_email: 'Написать на почту', contact_tg: 'Telegram',
    f_school: 'Название школы', f_name: 'Ваше имя', f_phone: 'Телефон или Telegram', f_msg: 'Сообщение', f_send: 'Отправить',
    mail_subject: 'Про VESNA', err_boot: 'Сайт загрузился не полностью. Обновите страницу.', reload: 'Обновить'
  },
  en: {
    nav_sphere: 'Subjects map', nav_games: 'Exercises', nav_letters: 'Subjects', nav_alphabet: 'Guide', nav_contact: 'Contact',
    hint_spin: 'SPIN AND PICK', play_arrow: 'Start →', close: 'Close', scroll: 'SCROLL',
    menu_intro: 'Grades 5–11: maths and languages',
    gallery_left: 'GRADES 5–11', gallery_right: 'MATHS · LANGUAGES',
    tag1: 'Grades 5–11', tag2: 'Maths and languages', tag3: 'Quick practice',
    set_every: 'Eye-rest reminder', set_rest: 'Rest length', min: 'min', sec: 's',
    rest_now: 'Rest now', eye_now: 'Eye exercise',
    theme_mode: 'Day / Night mode', theme_day: 'Day', theme_night: 'Night',
    guide_btn: 'Guide', guide_title: 'VESNA PRO — User Guide', guide_sub: 'For grades 5–11 students and teachers',
    greet: ["Hi! I'm Vesna. Tap me!", "Shall we play together?"],
    again: 'Hi again! Shall we continue?',
    prompt_now: 'Rest now', prompt_later: 'In 5 minutes',
    rest_title: 'Time to rest your eyes!', back_msg: "You're back! Shall we continue?", back_btn: 'Back to the site',
    eye_start: 'Eye exercise', eye_choose: 'Pick an exercise',
    break_msgs: [
      'Your eyes are tired! Look far out of the window.',
      "Let's get some fresh air. Step outside for a bit.",
      "It's homework time too. Do it, then we'll play again.",
      'Look at something far away for 20 seconds, then we continue.',
      'Cover your eyes with your palms and rest.'
    ],
    ex_ball_t: 'Follow the ball', ex_ball_d: "Don't move your head — follow it with your eyes only.",
    ex_focus_t: 'Near and far', ex_focus_d: 'Circle grows: look near. It shrinks: look far away.',
    ex_blink_t: 'Butterfly', ex_blink_d: 'Blink when the wings close.',
    ex_far_t: 'Look far away', ex_far_d: 'Find the farthest thing outside the window and look at it.',
    ex_near: 'Near', ex_farw: 'Far', ex_stop: 'Stop', ex_done: 'Well done!',
    contact_title: 'Contact',
    contact_lead: 'Have a question, or want to try VESNA at your school? Write to us!',
    contact_email: 'Send an email', contact_tg: 'Telegram',
    f_school: 'School name', f_name: 'Your name', f_phone: 'Phone or Telegram', f_msg: 'Message', f_send: 'Send',
    mail_subject: 'About VESNA', err_boot: 'The site did not load fully. Please refresh.', reload: 'Refresh'
  }
};
const LANGS = [
  { code: 'uz', name: 'O‘zbekcha', short: 'UZ' },
  { code: 'kaa', name: 'Qaraqalpaqsha', short: 'QQ' },
  { code: 'ru', name: 'Русский', short: 'RU' },
  { code: 'en', name: 'English', short: 'EN' }
];

// ───────────────────────── YORDAMCHILAR ─────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const store = {
  get(k, d) { try { const v = localStorage.getItem('alif.' + k); return v === null ? d : v; } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('alif.' + k, String(v)); } catch (_) {} },
  sget(k, d) { try { const v = sessionStorage.getItem('alif.' + k); return v === null ? d : v; } catch (_) { return d; } },
  sset(k, v) { try { sessionStorage.setItem('alif.' + k, String(v)); } catch (_) {} }
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────── XATOLARNI KO'RSATISH (telefonda tashxis uchun) ─────────────────────────
const toast = document.createElement('div');
toast.className = 'alif-toast';
document.body.appendChild(toast);
function showToast(msg) {
  toast.innerHTML = '';
  const span = document.createElement('span');
  span.textContent = msg;
  const btn = document.createElement('button');
  btn.textContent = 'OK';
  btn.className = 'bubble-btn';
  btn.onclick = () => toast.classList.remove('is-on');
  toast.append(span, btn);
  toast.classList.add('is-on');
}
let lastErr = '';
window.addEventListener('error', (e) => {
  lastErr = (e.message || 'Error') + (e.filename ? ' @ ' + String(e.filename).split('/').pop() + ':' + e.lineno : '');
  showToast(lastErr);
});
window.addEventListener('unhandledrejection', (e) => {
  lastErr = 'Promise: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason));
  showToast(lastErr);
});

const bootMsg = document.createElement('div');
bootMsg.className = 'alif-boot-msg';
document.body.appendChild(bootMsg);
setTimeout(() => {
  if (window.__alifBoot) return;
  const noImportMap = !(HTMLScriptElement.supports && HTMLScriptElement.supports('importmap'));
  bootMsg.innerHTML = '';
  const box = document.createElement('div');
  const p = document.createElement('div');
  p.textContent = t('err_boot');
  const b = document.createElement('button');
  b.className = 'big-btn';
  b.style.marginTop = '16px';
  b.textContent = t('reload');
  b.onclick = () => location.reload();
  const sm = document.createElement('small');
  sm.textContent = (noImportMap ? 'importmap: no. ' : '') + (lastErr || 'timeout') + ' | ' + navigator.userAgent;
  box.append(p, b, sm);
  bootMsg.appendChild(box);
  bootMsg.classList.add('is-on');
}, 20000);
window.addEventListener('alif:ready', () => bootMsg.classList.remove('is-on'));

// ───────────────────────── I18N ─────────────────────────
function detectLang() {
  const saved = store.get('lang', '');
  if (I18N[saved]) return saved;
  const n = (navigator.language || '').toLowerCase();
  if (n.startsWith('ru')) return 'ru';
  if (n.startsWith('en')) return 'en';
  return CONFIG.defaultLang;
}
let lang = detectLang();
function t(key) { return (I18N[lang] && I18N[lang][key]) ?? I18N.uz[key] ?? key; }

function applyLang() {
  document.documentElement.lang = lang === 'kaa' ? 'kk-Latn' : lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  const cur = LANGS.find((l) => l.code === lang);
  const codeEl = $('#lang-code');
  if (codeEl) codeEl.textContent = cur ? cur.short : 'UZ';
  document.querySelectorAll('.lang-opt').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));
  renderChips();
  renderGuide();
  const guideNavBtn = $('#nav-guide');
  if (guideNavBtn) guideNavBtn.title = t('guide_btn');
  window.dispatchEvent(new CustomEvent('alif:lang', { detail: { lang } }));
}
function setLang(code) {
  if (!I18N[code]) return;
  lang = code;
  store.set('lang', code);
  applyLang();
  closeLangPop();
}

// Til tanlash oynasi
const langPop = $('#lang-pop');
const langBtn = $('#nav-lang');
LANGS.forEach((l) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'lang-opt';
  b.dataset.lang = l.code;
  const n = document.createElement('span');
  n.textContent = l.name;
  const s = document.createElement('small');
  s.textContent = l.short;
  b.append(n, s);
  b.addEventListener('click', () => setLang(l.code));
  langPop.appendChild(b);
});
function openLangPop() { langPop.classList.add('is-open'); langBtn.setAttribute('aria-expanded', 'true'); langPop.setAttribute('aria-hidden', 'false'); }
function closeLangPop() { langPop.classList.remove('is-open'); langBtn.setAttribute('aria-expanded', 'false'); langPop.setAttribute('aria-hidden', 'true'); }
langBtn.addEventListener('click', (e) => { e.stopPropagation(); langPop.classList.contains('is-open') ? closeLangPop() : openLangPop(); });
document.addEventListener('pointerdown', (e) => {
  if (!langPop.contains(e.target) && !langBtn.contains(e.target)) closeLangPop();
});

// ───────────────────────── SOZLAMALAR (interval, dam olish vaqti) ─────────────────────────
let intervalMin = Number(store.get('interval', CONFIG.defaultInterval));
let restSec = Number(store.get('rest', CONFIG.defaultRest));
if (!CONFIG.intervalOptions.includes(intervalMin)) intervalMin = CONFIG.defaultInterval;
if (!CONFIG.restOptions.includes(restSec)) restSec = CONFIG.defaultRest;
const effInterval = () => (DEMO ? 0.5 : intervalMin) * 60; // sekund
const effRest = () => (DEMO ? 15 : restSec);

function renderChips() {
  const iv = $('#chips-interval');
  const rs = $('#chips-rest');
  if (!iv || !rs) return;
  iv.innerHTML = '';
  rs.innerHTML = '';
  CONFIG.intervalOptions.forEach((n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (n === intervalMin ? ' is-active' : '');
    b.textContent = n + ' ' + t('min');
    b.onclick = () => { intervalMin = n; store.set('interval', n); activeSec = 0; store.sset('active', 0); renderChips(); };
    iv.appendChild(b);
  });
  CONFIG.restOptions.forEach((n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (n === restSec ? ' is-active' : '');
    b.textContent = n + ' ' + t('sec');
    b.onclick = () => { restSec = n; store.set('rest', n); renderChips(); };
    rs.appendChild(b);
  });
}

// ───────────────────────── (Kontakt olib tashlandi) ─────────────────────────

// ───────────────────────── rAF / vaqtni to'xtatish (dam olish paytida) ─────────────────────────
const realRAF = window.requestAnimationFrame.bind(window);
const realCancel = window.cancelAnimationFrame.bind(window);
const realNow = performance.now.bind(performance);
let timeOffset = 0;      // to'xtatilgan vaqt yig'indisi (ms)
let pausedAt = 0;
let paused = false;
const heldQueue = new Map();
let heldId = -1;
window.requestAnimationFrame = (cb) => {
  if (paused) { heldQueue.set(heldId, cb); return heldId--; }
  return realRAF((ts) => cb(ts - timeOffset));
};
window.cancelAnimationFrame = (id) => { if (heldQueue.has(id)) heldQueue.delete(id); else realCancel(id); };
performance.now = () => realNow() - timeOffset;
function pauseSite() { if (paused) return; paused = true; pausedAt = realNow(); }
function resumeSite() {
  if (!paused) return;
  timeOffset += realNow() - pausedAt;
  paused = false;
  const q = Array.from(heldQueue.values());
  heldQueue.clear();
  q.forEach((cb) => realRAF((ts) => cb(ts - timeOffset)));
}

// ───────────────────────── ROBOT-YORDAMCHI ─────────────────────────
const SVG_NS = 'http://www.w3.org/2000/svg';
const mascot = document.createElement('div');
mascot.className = 'mascot';
mascot.setAttribute('role', 'button');
mascot.setAttribute('aria-label', 'Alif robot');
mascot.tabIndex = 0;
mascot.innerHTML = `
<svg viewBox="0 0 120 130" aria-hidden="true">
  <defs>
    <!-- Studio Chrome Metallic Gradient (matches Alifbo 3D Bot) -->
    <radialGradient id="mChromeHead" cx="38%" cy="24%" r="76%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="28%" stop-color="#e4e9f5"/>
      <stop offset="56%" stop-color="#7c859e"/>
      <stop offset="82%" stop-color="#222738"/>
      <stop offset="100%" stop-color="#9ca6c2"/>
    </radialGradient>
    <linearGradient id="mChromeMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#b8c1d6"/>
      <stop offset="75%" stop-color="#2a3042"/>
      <stop offset="100%" stop-color="#e3e8f4"/>
    </linearGradient>
    <radialGradient id="mChromeBall" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#c4cde0"/>
      <stop offset="100%" stop-color="#2b3145"/>
    </radialGradient>
    <radialGradient id="mVisorBlack" cx="42%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#191c26"/>
      <stop offset="48%" stop-color="#06070a"/>
      <stop offset="100%" stop-color="#020203"/>
    </radialGradient>
    <linearGradient id="mVisorGloss" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="mHaloMetal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#606982"/>
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#9ea8c2"/>
      <stop offset="100%" stop-color="#485068"/>
    </linearGradient>
  </defs>

  <!-- Left & Right Chrome Torus Ears + Dark Obsidian Inner Caps -->
  <g>
    <ellipse cx="20" cy="60" rx="8.5" ry="12.5" fill="url(#mChromeMetal)" stroke="#1a1f2d" stroke-width="1"/>
    <ellipse cx="19" cy="60" rx="4.2" ry="7.2" fill="#06070b"/>
    <ellipse cx="100" cy="60" rx="8.5" ry="12.5" fill="url(#mChromeMetal)" stroke="#1a1f2d" stroke-width="1"/>
    <ellipse cx="101" cy="60" rx="4.2" ry="7.2" fill="#06070b"/>
  </g>

  <!-- Chrome Antenna Stem & Chrome Silver Sphere -->
  <rect x="57.6" y="13" width="4.8" height="16" rx="2" fill="url(#mChromeMetal)"/>
  <circle cx="60" cy="10.5" r="5.5" fill="url(#mChromeBall)"/>

  <!-- Wide-Oval Studio Chrome Head (1.1 x 1.0) -->
  <ellipse cx="60" cy="60" rx="39" ry="35.5" fill="url(#mChromeHead)"/>
  <ellipse cx="60" cy="60" rx="38.5" ry="35" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>

  <!-- Glossy Curved Obsidian Visor -->
  <path d="M 30 58 C 30 43, 44 37, 60 37 C 76 37, 90 43, 90 58 C 90 73, 76 80, 60 80 C 44 80, 30 73, 30 58 Z"
        fill="url(#mVisorBlack)" stroke="rgba(255,255,255,0.16)" stroke-width="0.9"/>
  <!-- Crisp Studio Clearcoat Reflection on Visor -->
  <path d="M 35 50 C 40 41, 56 39, 71 42 C 62 45, 44 49, 36 56 Z" fill="url(#mVisorGloss)"/>

  <!-- #f2f2ee Off-White Vertical Capsule Eyes (1:1 with Alifbo 3D Robot) -->
  <g class="m-eyes">
    <rect class="m-eye" x="45.5" y="50" width="7.2" height="17" rx="3.6" fill="#f2f2ee"/>
    <rect class="m-eye" x="67.3" y="50" width="7.2" height="17" rx="3.6" fill="#f2f2ee"/>
  </g>

  <!-- Floating Tilted Chrome Halo Ring Underneath -->
  <ellipse cx="60" cy="112" rx="30" ry="6.2" fill="none" stroke="url(#mHaloMetal)" stroke-width="4.2"/>
</svg>`;
document.body.appendChild(mascot);
// SVG ichidagi elementlarga transform-box kerak
const mStyle = document.createElement('style');
mStyle.textContent = '.mascot .m-eye{transform-box:fill-box;transform-origin:center}';
document.head.appendChild(mStyle);

const bubble = document.createElement('div');
bubble.className = 'mascot-bubble';
bubble.setAttribute('role', 'status');
bubble.setAttribute('aria-live', 'polite');
document.body.appendChild(bubble);
let bubbleTimer = 0;
function say(text, { actions = null, ms = 6000 } = {}) {
  clearTimeout(bubbleTimer);
  bubble.innerHTML = '';
  const p = document.createElement('div');
  p.textContent = text;
  bubble.appendChild(p);
  if (actions) {
    const row = document.createElement('div');
    row.className = 'bubble-actions';
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bubble-btn' + (a.ghost ? ' ghost' : '');
      b.textContent = a.label;
      b.onclick = a.onClick;
      row.appendChild(b);
    });
    bubble.appendChild(row);
  }
  bubble.classList.add('is-open');
  if (ms) bubbleTimer = setTimeout(hideBubble, ms);
}
function hideBubble() { clearTimeout(bubbleTimer); bubble.classList.remove('is-open'); }
function hop() {
  mascot.classList.remove('is-hop');
  void mascot.offsetWidth;
  mascot.classList.add('is-hop');
}

// ko'zlari kursor/barmoqqa ergashadi
let eyeX = 0, eyeY = 0, tgtX = 0, tgtY = 0, lastSentX = 99, lastSentY = 99;
function aimAt(px, py) {
  const r = mascot.getBoundingClientRect();
  const dx = px - (r.left + r.width / 2);
  const dy = py - (r.top + r.height / 2);
  const d = Math.hypot(dx, dy) || 1;
  const k = Math.min(1, d / 220);
  tgtX = (dx / d) * 4.5 * k;
  tgtY = (dy / d) * 3.5 * k;
}
window.addEventListener('pointermove', (e) => aimAt(e.clientX, e.clientY), { passive: true });
window.addEventListener('touchstart', (e) => { if (e.touches[0]) aimAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
(function eyeLoop() {
  if (!paused && !document.hidden) {
    eyeX += (tgtX - eyeX) * 0.18;
    eyeY += (tgtY - eyeY) * 0.18;
    if (Math.abs(eyeX - lastSentX) > 0.02 || Math.abs(eyeY - lastSentY) > 0.02) {
      lastSentX = eyeX;
      lastSentY = eyeY;
      mascot.style.setProperty('--ex', eyeX.toFixed(2));
      mascot.style.setProperty('--ey', eyeY.toFixed(2));
    }
  }
  realRAF(eyeLoop);
})();
// ko'z qisish
(function blinkLoop() {
  setTimeout(() => {
    if (!mascot.classList.contains('is-sleep')) {
      mascot.classList.add('is-blink');
      setTimeout(() => mascot.classList.remove('is-blink'), 140);
    }
    blinkLoop();
  }, 2600 + Math.random() * 3200);
})();

// ───────────────────────── EKRAN VAQTI TAYMERI ─────────────────────────
let state = 'awake'; // awake | prompt | dissolving | resting | returning
let activeSec = Number(store.sget('active', 0)) || 0;
let lastInput = Date.now();
let lastMsgIdx = -1;
['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'].forEach((ev) =>
  window.addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true })
);
let promptTimer = 0;
setInterval(() => {
  if (state !== 'awake') return;
  if (document.visibilityState !== 'visible') return;
  if (Date.now() - lastInput > CONFIG.idleCutoffMs) return;
  activeSec += 1;
  if (activeSec % 5 === 0) store.sset('active', activeSec);
  if (activeSec >= effInterval()) promptBreak();
}, 1000);

function pickBreakMsg() {
  const arr = t('break_msgs');
  let i;
  do { i = Math.floor(Math.random() * arr.length); } while (arr.length > 1 && i === lastMsgIdx);
  lastMsgIdx = i;
  return arr[i];
}
function promptBreak() {
  if (state !== 'awake') return;
  state = 'prompt';
  hop();
  const go = () => { clearTimeout(promptTimer); hideBubble(); startRest(cornerOrigin()); };
  const later = () => {
    clearTimeout(promptTimer);
    hideBubble();
    state = 'awake';
    activeSec = Math.max(0, effInterval() - CONFIG.snoozeMin * 60);
    if (DEMO) activeSec = 0;
    store.sset('active', activeSec);
  };
  say(pickBreakMsg(), { ms: 0, actions: [{ label: t('prompt_now'), onClick: go }, { label: t('prompt_later'), onClick: later, ghost: true }] });
  promptTimer = setTimeout(go, CONFIG.promptAutoMs);
}

// ───────────────────────── TO'LQIN EFFEKTI ─────────────────────────
const veil = document.createElement('div');
veil.className = 'rest-veil';
veil.innerHTML = `
  <div class="veil-orb o1"></div><div class="veil-orb o2"></div><div class="veil-orb o3"></div>
  <div class="eye-stage" id="eye-stage"></div>
  <div class="rest-panel" id="rest-panel">
    <h2 class="rest-title" id="rest-title"></h2>
    <p class="rest-sub" id="rest-sub"></p>
    <div class="eye-picker" id="eye-picker"></div>
    <div class="rest-timer" id="rest-timer"></div>
    <div class="rest-bar"><i id="rest-bar"></i></div>
    <div class="rest-actions">
      <button type="button" class="big-btn alt" id="rest-eye"></button>
      <button type="button" class="big-btn" id="rest-back"></button>
    </div>
  </div>`;
document.body.appendChild(veil);
const ring = document.createElement('div');
ring.className = 'wave-ring';
document.body.appendChild(ring);
const el = {
  title: $('#rest-title', veil), sub: $('#rest-sub', veil), picker: $('#eye-picker', veil),
  timer: $('#rest-timer', veil), bar: $('#rest-bar', veil), eyeBtn: $('#rest-eye', veil), backBtn: $('#rest-back', veil),
  stage: $('#eye-stage', veil)
};

function cornerOrigin() {
  const r = mascot.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function maxRadius(x, y) {
  const w = window.innerWidth, h = window.innerHeight;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
}
// r: 0 -> maxR; veil maskasini va halqani har kadrda yangilaydi
function runWave(mode, origin, dur) {
  return new Promise((resolve) => {
    const soft = 150;
    const R = maxRadius(origin.x, origin.y) + soft;
    veil.style.setProperty('--ox', origin.x + 'px');
    veil.style.setProperty('--oy', origin.y + 'px');
    veil.style.setProperty('--soft', soft + 'px');
    veil.classList.remove('mode-in', 'mode-out');
    veil.classList.add('is-on', mode === 'in' ? 'mode-in' : 'mode-out');
    ring.style.left = origin.x + 'px';
    ring.style.top = origin.y + 'px';
    ring.classList.add('is-on');
    if (reduced) dur = 250;
    const t0 = realNow();
    (function step() {
      const k = clamp((realNow() - t0) / dur, 0, 1);
      const r = easeInOut(k) * R;
      veil.style.setProperty('--r', r + 'px');
      const s = Math.max(0, (r - soft / 2) / 49);
      ring.style.transform = `scale(${s})`;
      ring.style.opacity = String(clamp(1 - k * 0.9, 0, 1));
      if (k < 1) realRAF(step);
      else { ring.classList.remove('is-on'); resolve(); }
    })();
  });
}

let restTimerId = 0;
let restLeft = 0;
let exerciseRunning = null; // { cancel }
let restOrigin = { x: 0, y: 0 };

function setRestTexts(titleKey, subText) {
  el.title.textContent = t(titleKey);
  el.sub.textContent = subText;
  el.eyeBtn.textContent = '👀 ' + t('eye_start');
  el.backBtn.textContent = t('back_btn');
}

async function startRest(origin, opts = {}) {
  if (state === 'dissolving' || state === 'resting' || state === 'returning') return;
  clearTimeout(promptTimer);
  hideBubble();
  closeLangPop();
  state = 'dissolving';
  restOrigin = origin;
  veil.classList.remove('is-rest', 'is-picking', 'is-exercise');
  setRestTexts('rest_title', pickBreakMsg());
  el.timer.textContent = '';
  el.bar.style.width = '0%';
  setTimeout(() => { mascot.classList.add('is-center', 'is-sleep'); }, 450);
  await runWave('in', origin, 1500);
  // butun ekran yopildi: maskani olib tashlaymiz, saytni to'xtatamiz
  veil.classList.remove('mode-in', 'mode-out');
  pauseSite();
  state = 'resting';
  mascot.classList.remove('is-sleep');
  veil.classList.add('is-rest');
  if (opts.exercise) veil.classList.add('is-picking');
  restLeft = effRest();
  const total = restLeft;
  clearInterval(restTimerId);
  const tick = () => {
    const s = Math.max(0, restLeft);
    el.timer.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    el.bar.style.width = (100 - (restLeft / total) * 100) + '%';
  };
  tick();
  restTimerId = setInterval(() => {
    if (exerciseRunning) return; // mashq paytida taymer kutadi
    restLeft -= 1;
    tick();
    if (restLeft <= 0) { clearInterval(restTimerId); endRest(); }
  }, 1000);
}

async function endRest() {
  if (state !== 'resting') return;
  state = 'returning';
  clearInterval(restTimerId);
  if (exerciseRunning) { exerciseRunning.cancel(); exerciseRunning = null; }
  veil.classList.remove('is-picking', 'is-exercise', 'is-rest');
  mascot.classList.remove('is-hidden');
  resumeSite();
  const c = { x: window.innerWidth / 2, y: window.innerHeight * 0.33 };
  const wavePromise = runWave('out', c, 1700);
  setTimeout(() => { mascot.classList.remove('is-center'); }, 500);
  await wavePromise;
  veil.classList.remove('is-on', 'mode-in', 'mode-out');
  state = 'awake';
  activeSec = 0;
  store.sset('active', 0);
  hop();
  say(t('back_msg'), { ms: 5000 });
}

el.backBtn.addEventListener('click', () => endRest());
el.eyeBtn.addEventListener('click', () => { veil.classList.toggle('is-picking'); });

// ───────────────────────── KO'Z MASHQLARI ─────────────────────────
const EXERCISES = {
  ball: { emoji: '🎯', dur: 40 },
  focus: { emoji: '🔭', dur: 30 },
  blink: { emoji: '🦋', dur: 24 },
  far: { emoji: '🌳', dur: 20 }
};
function renderPicker() {
  el.picker.innerHTML = '';
  Object.keys(EXERCISES).forEach((id) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'eye-card';
    const e = document.createElement('span');
    e.textContent = EXERCISES[id].emoji;
    const n = document.createElement('div');
    n.textContent = t('ex_' + id + '_t');
    b.append(e, n);
    b.addEventListener('click', () => startExercise(id));
    el.picker.appendChild(b);
  });
}
window.addEventListener('alif:lang', renderPicker);

function startExercise(id) {
  if (state !== 'resting' || exerciseRunning) return;
  veil.classList.remove('is-picking');
  veil.classList.add('is-exercise');
  mascot.classList.add('is-hidden');
  const cfg = EXERCISES[id];
  const stage = el.stage;
  stage.innerHTML = '';
  const hud = document.createElement('div');
  hud.className = 'eye-hud';
  const h = document.createElement('h3');
  h.textContent = t('ex_' + id + '_t');
  const p = document.createElement('p');
  p.textContent = t('ex_' + id + '_d');
  hud.append(h, p);
  const prog = document.createElement('div');
  prog.className = 'eye-prog';
  const foot = document.createElement('div');
  foot.className = 'eye-foot';
  const stop = document.createElement('button');
  stop.type = 'button';
  stop.className = 'big-btn alt';
  stop.textContent = t('ex_stop');
  foot.appendChild(stop);
  stage.append(hud, prog, foot);

  const W = () => stage.clientWidth;
  const H = () => stage.clientHeight;
  let cancelled = false;
  let label = null;
  let ball = null, focus = null, big = null;

  if (id === 'ball') {
    ball = document.createElement('div');
    ball.className = 'eye-ball';
    label = document.createElement('div');
    label.className = 'eye-label';
    stage.append(ball, label);
  } else if (id === 'focus') {
    focus = document.createElement('div');
    focus.className = 'eye-focus';
    label = document.createElement('div');
    label.className = 'eye-label';
    stage.append(focus, label);
  } else if (id === 'blink') {
    const bf = document.createElement('div');
    bf.className = 'butterfly';
    bf.innerHTML = '<i></i><i></i>';
    label = document.createElement('div');
    label.className = 'eye-label';
    stage.append(bf, label);
  } else {
    big = document.createElement('div');
    big.className = 'eye-big';
    stage.appendChild(big);
  }

  const t0 = realNow();
  let finished = false;
  const finish = (completed) => {
    if (finished) return;
    finished = true;
    cancelled = true;
    exerciseRunning = null;
    veil.classList.remove('is-exercise');
    mascot.classList.remove('is-hidden');
    stage.innerHTML = '';
    if (completed) {
      el.title.textContent = t('ex_done');
      el.sub.textContent = t('back_msg');
      hop();
      restLeft = Math.min(restLeft, 3); // mashqdan keyin tez qaytamiz
    }
  };
  exerciseRunning = { cancel: () => finish(false) };
  stop.addEventListener('click', () => finish(false));

  const cx = () => W() / 2;
  const cy = () => H() / 2 + 20;
  (function loop() {
    if (cancelled) return;
    const sec = (realNow() - t0) / 1000;
    prog.style.width = clamp((sec / cfg.dur) * 100, 0, 100) + '%';
    if (sec >= cfg.dur) { finish(true); return; }
    if (id === 'ball') {
      const A = Math.min(W() * 0.38, 340), B = Math.min(H() * 0.28, 220);
      const w = (Math.PI * 2) / 5; // 5 s bir davr
      const phase = Math.floor(sec / 10) % 4;
      const s = Math.sin(w * sec);
      let x = cx(), y = cy(), sym = '';
      if (phase === 0) { x += A * s; sym = '←  →'; }
      else if (phase === 1) { y += B * s; sym = '↑  ↓'; }
      else if (phase === 2) { x += A * 0.8 * s; y += B * 0.8 * s; sym = '↗  ↙'; }
      else { x += A * s; y += (B * Math.sin(2 * w * sec)) / 2; sym = '∞'; }
      ball.style.transform = `translate(${x}px, ${y}px)`;
      label.textContent = sym;
      label.style.top = '118px';
    } else if (id === 'focus') {
      const k = 0.5 + 0.5 * Math.sin((Math.PI * 2 * sec) / 6 - Math.PI / 2);
      focus.style.transform = `scale(${0.35 + 1.5 * k})`;
      label.textContent = k > 0.5 ? t('ex_near') : t('ex_farw');
    } else if (id === 'blink') {
      label.textContent = Math.min(12, Math.floor(sec / 2) + 1) + ' / 12';
    } else {
      big.textContent = String(Math.max(0, Math.ceil(cfg.dur - sec)));
    }
    realRAF(loop);
  })();
}

// ───────────────────────── SAYT YO'RIQNOMASI (ALIFBO BÖLIMIDA) ─────────────────────────
const GUIDE_DATA = {
  uz: {
    lead: 'VESNA — boşlanğiç va maktabga kiruvçilar uçun 29 ta harf, raqamlar, mantiq va 40 ta öyin.',
    cards: [
      {
        title: '1. Sfera',
        tag: '20 ta karta',
        items: [
          'Şarni aylantirib mavzuni tanlang.',
          'Kartani ikki marta bosib «Öynaş →» tugmasini bosing.'
        ]
      },
      {
        title: '2. Maşqlar',
        tag: '40 öyin · PvP',
        items: [
          'Har bir öyinda har xil savollar beriladi, bitta öyin içida ham, qaytadan ham takrorlanmaydi.',
          'Yuqoridagi «⚔️ PvP» va «↻ Qayta» tugmalari bilan 2 kişi bellashing.'
        ]
      },
      {
        title: '3. Harflar (29 ta)',
        tag: 'A – ʼ + Öyinlar',
        items: [
          '3. Ç, 8. Ğ, 17. Ö, 22. Ş va 29. ʼ (tutuq belgisi) tartibida jadval.',
          'Pastdagi til öyinlari va «⚔️ Alifbo PvP Duel»ni birga öynang.'
        ]
      },
      {
        title: '4. Alifbo (Robot) va Kun/Tun',
        tag: 'Kun / Tun',
        items: [
          'Robotça bilan suhbatlaşing, köz dam oliş taymeri va maşqini oçing.',
          'Tepadagi sariq/qora kalit bilan kun va tun rejimini almaştiring.'
        ]
      }
    ],
    footLeft: 'Yopiş: ESC yoki «Yopiş».',
    footRight: 'VESNA'
  },
  kaa: {
    lead: 'VESNA — baslawısh hám mektepke kirer balalar ushın 29 hárip hám 40 interaktiv oyın.',
    cards: [
      {
        title: '1. Sfera',
        tag: '20 karta',
        items: [
          'Shardı aylandırıp tema saylań.',
          'Kartanı eki márte basıp «Oynaw →» túymesin basıń.'
        ]
      },
      {
        title: '2. Shınıǵıwlar',
        tag: '40 oyın · PvP',
        items: [
          'Hár bir oyında sorawlar qaytalawlanbay jańadan beriledi.',
          'Joqarıdaǵı «⚔️ PvP» hám «↻ Qayta» arqalı 2 oyınshı jarısıń.'
        ]
      },
      {
        title: '3. Háripler (29)',
        tag: 'A – ʼ + Oyınlar',
        items: [
          '3. Ç, 8. Ğ, 17. Ö, 22. Ş hám 29. ʼ tártibinde álipbe.',
          'Til oyınları hám «⚔️ PvP Duel» usı bólimde de bar.'
        ]
      },
      {
        title: '4. Álipbe (Robot) hám Kún/Tún',
        tag: 'Kún / Tún',
        items: [
          'Robotsha arqalı kóz dem alıwı hám shınıǵıwlardı qosıń.',
          'Joqarıdaǵı túyme menen kún hám tún rejimine ótiń.'
        ]
      }
    ],
    footLeft: 'Jabıw: ESC yamasa «Jabıw».',
    footRight: 'VESNA'
  },
  ru: {
    lead: 'VESNA — 40 интерактивных игр для дошкольников и начинающих: 29 букв, счёт и логика.',
    cards: [
      {
        title: '1. Сфера',
        tag: '20 карточек',
        items: [
          'Поверните 3D-шар и выберите тему.',
          'Нажмите на карточку дважды и выберите «Играть →».'
        ]
      },
      {
        title: '2. Игры',
        tag: '40 игр · PvP',
        items: [
          'Вопросы внутри каждой игры и при перезапуске не повторяются.',
          'Кнопки «⚔️ PvP» и «↻ Qayta» запускают парный режим и повтор.'
        ]
      },
      {
        title: '3. Буквы (29)',
        tag: 'A – ʼ + Игры',
        items: [
          'Порядок с 3. Ç, 8. Ğ, 17. Ö, 22. Ş и 29. ʼ (tutuq belgisi).',
          'Языковые игры и «⚔️ PvP Дуэль» встроены прямо сюда.'
        ]
      },
      {
        title: '4. Азбука (Робот) и Тема',
        tag: 'День / Ночь',
        items: [
          'Нажмите на робота для паузы и гимнастики для глаз.',
          'Переключатель сверху меняет дневную и ночную тему.'
        ]
      }
    ],
    footLeft: 'Закрыть: ESC или «Закрыть».',
    footRight: 'VESNA'
  },
  en: {
    lead: 'VESNA features 40 non-repeating interactive games for early learners and school entrants.',
    cards: [
      {
        title: '1. Sphere',
        tag: '20 cards',
        items: [
          'Rotate the globe to pick a topic.',
          'Tap a card twice and press Play →.'
        ]
      },
      {
        title: '2. Games',
        tag: '40 games · PvP',
        items: [
          'Every game deals fresh non-repeating prompts and equations.',
          'Use «⚔️ PvP» and «↻ Qayta» inside any game to duel or restart.'
        ]
      },
      {
        title: '3. Letters (29)',
        tag: 'A – ʼ + Games',
        items: [
          'Full 1–29 order including Ç, Ğ, Ö, Ş, and 29. ʼ (tutuq belgisi).',
          'Includes all language mini-games and PvP Alphabet Duel.'
        ]
      },
      {
        title: '4. Alphabet (Robot) & Theme',
        tag: 'Day / Night',
        items: [
          'Interact with the 3D robot and open eye-care breaks anytime.',
          'Use the top switch to toggle between Night and Day modes.'
        ]
      }
    ],
    footLeft: 'Press ESC or Close to collapse.',
    footRight: 'VESNA'
  }
};

const aboutGuideDock = $('#about-guide-dock');
const aboutGuidePanel = $('#about-guide-panel');
const aboutGuideToggle = $('#about-guide-toggle');
const aboutGuideClose = $('#about-guide-close');
const guideBody = $('#guide-body');
const navGuideBtn = $('#nav-guide');
const menuGuideBtn = $('#btn-guide-open');

function renderGuide() {
  if (!guideBody) return;
  const g = GUIDE_DATA[lang] || GUIDE_DATA.uz;
  guideBody.innerHTML = '';

  const hero = document.createElement('div');
  hero.className = 'guide-hero';
  const lead = document.createElement('p');
  lead.className = 'guide-hero-lead';
  lead.textContent = g.lead;
  hero.appendChild(lead);

  const grid = document.createElement('div');
  grid.className = 'guide-grid';
  g.cards.forEach((c) => {
    const card = document.createElement('section');
    card.className = 'guide-card';
    const head = document.createElement('div');
    head.className = 'guide-card-head';
    const title = document.createElement('h3');
    title.className = 'guide-card-title';
    title.textContent = c.title;
    const tag = document.createElement('span');
    tag.className = 'guide-card-tag';
    tag.textContent = c.tag;
    head.append(title, tag);

    const list = document.createElement('ul');
    list.className = 'guide-list';
    c.items.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });
    card.append(head, list);
    grid.appendChild(card);
  });

  const foot = document.createElement('div');
  foot.className = 'guide-foot';
  const fl = document.createElement('span');
  fl.textContent = g.footLeft;
  const fr = document.createElement('strong');
  fr.textContent = g.footRight;
  foot.append(fl, fr);

  guideBody.append(hero, grid, foot);
}

function isGuideOpen() {
  return Boolean(aboutGuidePanel && aboutGuidePanel.classList.contains('is-open'));
}

function openGuide(navigateToAbout = false) {
  if (navigateToAbout && window.location.hash !== '#about') {
    window.location.hash = '#about';
  }
  if (!aboutGuidePanel) return;
  closeLangPop();
  renderGuide();
  aboutGuidePanel.classList.add('is-open');
  aboutGuidePanel.setAttribute('aria-hidden', 'false');
  if (aboutGuideToggle) aboutGuideToggle.setAttribute('aria-expanded', 'true');
  if (aboutGuideDock) aboutGuideDock.classList.add('is-open');
}

function closeGuide() {
  if (!aboutGuidePanel || !isGuideOpen()) return;
  aboutGuidePanel.classList.remove('is-open');
  aboutGuidePanel.setAttribute('aria-hidden', 'true');
  if (aboutGuideToggle) aboutGuideToggle.setAttribute('aria-expanded', 'false');
  if (aboutGuideDock) aboutGuideDock.classList.remove('is-open');
}

if (aboutGuideToggle) {
  aboutGuideToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isGuideOpen()) closeGuide();
    else openGuide(false);
  });
}
if (aboutGuideClose) {
  aboutGuideClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeGuide();
  });
}
if (navGuideBtn) {
  navGuideBtn.addEventListener('click', () => {
    if (window.location.hash === '#about' && isGuideOpen()) closeGuide();
    else openGuide(true);
  });
}
if (menuGuideBtn) {
  menuGuideBtn.addEventListener('click', () => {
    const menuBtn = $('#dock-menu-btn');
    if (menuBtn && menuBtn.classList.contains('is-open')) menuBtn.click();
    openGuide(true);
  });
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isGuideOpen()) closeGuide();
});

// ───────────────────────── ULASH: tugmalar va hodisalar ─────────────────────────
mascot.addEventListener('click', () => {
  if (state === 'resting') { hop(); return; }
  if (state !== 'awake' && state !== 'prompt') return;
  hop();
  startRest(cornerOrigin());
});
mascot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mascot.click(); } });
window.addEventListener('alif:robot-click', (e) => {
  if (state === 'awake' || state === 'prompt') startRest({ x: e.detail.x, y: e.detail.y });
});
$('#btn-rest-now').addEventListener('click', () => { $('#dock-menu-btn').click(); startRest(cornerOrigin()); });
$('#btn-eye-now').addEventListener('click', () => { $('#dock-menu-btn').click(); startRest(cornerOrigin(), { exercise: true }); });

const navThemeBtn = $('#nav-theme');
const menuThemeBtn = $('#btn-theme-toggle');
const menuThemeSwitch = $('#menu-theme-switch');

function handleThemeToggle() {
  toggleTheme();
}

onThemeChange((theme) => {
  const isDay = theme === 'light';
  if (navThemeBtn) {
    navThemeBtn.classList.toggle('is-day', isDay);
    navThemeBtn.setAttribute('aria-checked', String(isDay));
    navThemeBtn.title = t('theme_mode');
  }
  if (menuThemeBtn) menuThemeBtn.setAttribute('aria-checked', String(isDay));
  if (menuThemeSwitch) menuThemeSwitch.classList.toggle('is-day', isDay);
});

if (navThemeBtn) {
  navThemeBtn.addEventListener('click', handleThemeToggle);
}
if (menuThemeBtn) {
  menuThemeBtn.addEventListener('click', handleThemeToggle);
}

// xavfsizlik: sayt qotib qolmasin
setInterval(() => { if (state === 'awake' && paused) resumeSite(); }, 1500);

// ───────────────────────── BOSHLASH ─────────────────────────
renderPicker();
applyLang();
const visited = store.get('visited', '');
store.set('visited', '1');
setTimeout(() => {
  if (state !== 'awake') return;
  hop();
  if (visited) say(t('again'), { ms: 5000 });
  else { const g = t('greet'); say(g[0] + ' ' + g[1], { ms: 7000 }); }
}, 4500);
