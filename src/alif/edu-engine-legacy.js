// Interactive educational games for beginners & school entrants, Liquid Glass illustrated cards & PvP
// Reformed Uzbek Latin Alphabet (29): Ş ş (sh), Ç ç (ch), Ö ö (o'), Ğ ğ (g'), ʼ (tutuq)

import gsap from 'gsap';
import { drawIllustration, drawApple, drawBalloon, drawStar, drawDuck, hexAlpha } from './edu-art.js';
import { isDayMode } from './theme.ts';
import { isLowEndDevice } from './perf.ts';

// ── Background Image Preloader ──────────────────────────────────────────────
const BG_PATHS = {
  aurora: './assets/images/glass_aurora_bg_1794753550731.webp',
  valley: './assets/images/storybook_valley_bg_1794753551314.webp',
  space: './assets/images/cosmic_nebula_bg_1794753551824.webp',
  prism: './assets/images/studio_prism_bg_1794753553266.webp'
};

const BG_CACHE = {};
const bgListeners = new Set();
let bgLoadedCount = 0;

Object.entries(BG_PATHS).forEach(([key, url]) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    BG_CACHE[key] = img;
    bgLoadedCount++;
    bgListeners.forEach((cb) => { try { cb(key); } catch {} });
  };
  img.src = url;
});

export function onBgReady(cb) {
  bgListeners.add(cb);
  if (bgLoadedCount > 0) cb('init');
  return () => bgListeners.delete(cb);
}

function drawCoverBg(ctx, w, h, key, dimAlpha = 0.35) {
  const img = BG_CACHE[key] || BG_CACHE.aurora;
  if (img && img.naturalWidth) {
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = w / h;
    let dw = w, dh = h, dx = 0, dy = 0;
    if (cr > ir) {
      dw = w;
      dh = w / ir;
      dy = (h - dh) / 2;
    } else {
      dh = h;
      dw = h * ir;
      dx = (w - dw) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    if (dimAlpha > 0) {
      ctx.fillStyle = `rgba(10, 12, 18, ${dimAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#131829');
    grad.addColorStop(1, '#0c0e16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

export const UZ_ALPHABET = [
  { num: 1, upper: 'A', lower: 'a', example: 'Anor', words: ['Anor', 'Ari', 'Asal'], art: 'olma', hint: '1-harf · Unli tovuş', type: 'unli' },
  { num: 2, upper: 'B', lower: 'b', example: 'Bola', words: ['Bola', 'Boğ', 'Baliq'], art: 'sir', hint: '2-harf · Undosh tovuş', type: 'undosh' },
  { num: 3, upper: 'Ç', lower: 'ç', example: 'Çoynak', words: ['Çoynak', 'Çana', 'Çiroq'], art: 'coy', hint: '3-harf · Yangi harf (avvalgi Ch ch)', type: 'yangi', old: 'Ch ch' },
  { num: 4, upper: 'D', lower: 'd', example: 'Daftar', words: ['Daftar', 'Daraxt', 'Daryo'], art: 'kitob', hint: '4-harf · Undosh tovuş', type: 'undosh' },
  { num: 5, upper: 'E', lower: 'e', example: 'Eşik', words: ['Eşik', 'Erkak', 'Elak'], art: 'kitob', hint: '5-harf · Unli tovuş', type: 'unli' },
  { num: 6, upper: 'F', lower: 'f', example: 'Fil', words: ['Fil', 'Fasl', 'Fonar'], art: 'sir', hint: '6-harf · Undosh tovuş', type: 'undosh' },
  { num: 7, upper: 'G', lower: 'g', example: 'Gul', words: ['Gul', 'Gilam', 'Gilos'], art: 'gul', hint: '7-harf · Undosh tovuş', type: 'undosh' },
  { num: 8, upper: 'Ğ', lower: 'ğ', example: 'Ğoz', words: ['Ğoz', 'Toğ', 'Boğ'], art: 'tog', hint: '8-harf · Yangi harf (avvalgi Gʻ gʻ)', type: 'yangi', old: 'Gʻ gʻ' },
  { num: 9, upper: 'H', lower: 'h', example: 'Havo', words: ['Havo', 'Hovli', 'Hikoya'], art: 'sar', hint: '9-harf · Undosh tovuş', type: 'undosh' },
  { num: 10, upper: 'I', lower: 'i', example: 'Ilm', words: ['Ilm', 'Ikki', 'Issiq'], art: 'kitob', hint: '10-harf · Unli tovuş', type: 'unli' },
  { num: 11, upper: 'J', lower: 'j', example: 'Jöja', words: ['Jöja', 'Jayron', 'Jilğa'], art: 'ordak', hint: '11-harf · Undosh tovuş', type: 'undosh' },
  { num: 12, upper: 'K', lower: 'k', example: 'Kitob', words: ['Kitob', 'Kapalak', 'Kema'], art: 'kitob', hint: '12-harf · Undosh tovuş', type: 'undosh' },
  { num: 13, upper: 'L', lower: 'l', example: 'Lola', words: ['Lola', 'Limon', 'Laylak'], art: 'gul', hint: '13-harf · Undosh tovuş', type: 'undosh' },
  { num: 14, upper: 'M', lower: 'm', example: 'Maktab', words: ['Maktab', 'Meva', 'Muşuk'], art: 'kitob', hint: '14-harf · Undosh tovuş', type: 'undosh' },
  { num: 15, upper: 'N', lower: 'n', example: 'Non', words: ['Non', 'Nur', 'Nok'], art: 'quyos', hint: '15-harf · Undosh tovuş', type: 'undosh' },
  { num: 16, upper: 'O', lower: 'o', example: 'Olma', words: ['Olma', 'Osmon', 'Ota'], art: 'olma', hint: '16-harf · Unli tovuş', type: 'unli' },
  { num: 17, upper: 'Ö', lower: 'ö', example: 'Ördak', words: ['Ördak', 'Öqiş', 'Qözi'], art: 'ordak', hint: '17-harf · Yangi harf (avvalgi Oʻ oʻ)', type: 'yangi', old: 'Oʻ oʻ' },
  { num: 18, upper: 'P', lower: 'p', example: 'Poyezd', words: ['Poyezd', 'Paxta', 'Piyola'], art: 'poyezd', hint: '18-harf · Undosh tovuş', type: 'undosh' },
  { num: 19, upper: 'Q', lower: 'q', example: 'Qurbaqa', words: ['Qurbaqa', 'Qalam', 'Qor'], art: 'qurbaqa', hint: '19-harf · Undosh tovuş', type: 'undosh' },
  { num: 20, upper: 'R', lower: 'r', example: 'Raketa', words: ['Raketa', 'Rasm', 'Rang'], art: 'raketa', hint: '20-harf · Undosh tovuş', type: 'undosh' },
  { num: 21, upper: 'S', lower: 's', example: 'Soat', words: ['Soat', 'Suv', 'Savat'], art: 'quyos', hint: '21-harf · Undosh tovuş', type: 'undosh' },
  { num: 22, upper: 'Ş', lower: 'ş', example: 'Şar', words: ['Şar', 'Şir', 'Quyoş'], art: 'sir', hint: '22-harf · Yangi harf (avvalgi Sh sh)', type: 'yangi', old: 'Sh sh' },
  { num: 23, upper: 'T', lower: 't', example: 'Tarozi', words: ['Tarozi', 'Toğ', 'Tuz'], art: 'tarozi', hint: '23-harf · Undosh tovuş', type: 'undosh' },
  { num: 24, upper: 'U', lower: 'u', example: 'Uçqur', words: ['Uçqur', 'Uzum', 'Uy'], art: 'raketa', hint: '24-harf · Unli tovuş', type: 'unli' },
  { num: 25, upper: 'V', lower: 'v', example: 'Vatan', words: ['Vatan', 'Vodiy', 'Varaqa'], art: 'tog', hint: '25-harf · Undosh tovuş', type: 'undosh' },
  { num: 26, upper: 'X', lower: 'x', example: 'Xat', words: ['Xat', 'Xona', 'Xarita'], art: 'kitob', hint: '26-harf · Undosh tovuş', type: 'undosh' },
  { num: 27, upper: 'Y', lower: 'y', example: 'Yulduz', words: ['Yulduz', 'Yomğir', 'Yöl'], art: 'yulduz', hint: '27-harf · Undosh tovuş', type: 'undosh' },
  { num: 28, upper: 'Z', lower: 'z', example: 'Zebra', words: ['Zebra', 'Zina', 'Zafar'], art: 'sir', hint: '28-harf · Undosh tovuş', type: 'undosh' },
  { num: 29, upper: 'ʼ', lower: 'ʼ', example: 'Maʼno', words: ['Maʼno', 'Aʼlo', 'Sanʼat'], art: 'kitob', hint: '29-belgi · Tutuq belgisi (unli yoki undoshdan keyin)', type: 'belgi', old: 'Tutuq belgisi' }
];

export const EDU_ITEMS = [
  { id: 1, glyph: 'Ş ş', subGlyph: 'Rasm ovi · sh → ş', title: 'Şir va Şar', category: 'Yangi Alifbo', year: 'Boşlanğiç', desc: 'Vodiy boğida tarkibida Ş harfi bor rasmlarni (Şir, Şar, Quyoş) toping!', accent: '#68b5ff', art: 'sir', bg: 'valley', gameType: 'picture-hunt', config: { letter: 'Ş', old: 'sh' } },
  { id: 2, glyph: 'A – ʼ', subGlyph: '29 harf yoziş', title: 'Harf Yozib Kör', category: 'Yangi Alifbo', year: 'Boşlanğiç', desc: 'Barcha 29 ta harfni (A dan ʼ belgisigaça) suyuq şisha taxtasida barmoq bilan çizing.', accent: '#5eead4', art: 'coy', bg: 'prism', gameType: 'letter-trace', config: {} },
  { id: 3, glyph: 'Ö ö', subGlyph: "Köl öyini · o' → ö", title: 'Ördak va Öt', category: 'Yangi Alifbo', year: 'Boşlanğiç', desc: 'Köldagi Ö harfli ördakçalarni tutib uyasiga kuzating!', accent: '#ffd166', art: 'ordak', bg: 'valley', gameType: 'duck-pond', config: { letter: 'Ö' } },
  { id: 4, glyph: 'Ğ ğ', subGlyph: "Sehrli fonar · g' → ğ", title: 'Ğoz va Toğ', category: 'Yangi Alifbo', year: 'Boşlanğiç', desc: 'Tungi vodiyda sehrli fonarni yurgizib Ğ harfli rasmlarni yoritib toping!', accent: '#ff8fab', art: 'tog', bg: 'valley', gameType: 'flashlight-hunt', config: { letter: 'Ğ' } },
  { id: 5, glyph: '29 ta', subGlyph: 'Alifbo · A – ʼ', title: 'Yangi Alifbo', category: 'Alifbo', year: 'Tayyorlov', desc: '1 dan 29 gaça yangi özbek lotin alifbosi (Ç, Ğ, Ö, Ş, ʼ) va tez topiş PvP maşqi!', accent: '#a78bfa', art: 'kitob', bg: 'prism', gameType: 'alphabet-board', config: {} },
  { id: 6, glyph: 'A E Ö', subGlyph: 'Musiqiy tovuş', title: 'Unli Ksilofon', category: 'Alifbo', year: 'Boşlanğiç', desc: 'Rasm va sözdagi tuşib qolgan unli harfni şisha klavişda bosing!', accent: '#56ccf2', art: 'sar', bg: 'aurora', gameType: 'xylophone-notes', config: { mode: 'vowels' } },
  { id: 7, glyph: '_AR', subGlyph: 'Şar yoriş · Ş Ç Ö Ğ', title: 'Harf Ovçisi', category: 'Alifbo', year: 'Tayyorlov', desc: 'Kosmik osmonga kötarilayotgan Ş, Ç, Ö, Ğ şarlaridan töğrisini yoring.', accent: '#5eead4', art: 'sar', bg: 'space', gameType: 'balloon-pop', config: { mode: 'reformed' } },
  { id: 8, glyph: 'ŞA+R', subGlyph: 'Qisqa sözlar', title: 'Rasmli Sözlar', category: 'Öqiş', year: 'İlk qadam', desc: 'Rasmga qarab harflarni ketma-ket tering va ilk qisqa sözlarni yiğing.', accent: '#ffd166', art: 'quyos', bg: 'prism', gameType: 'word-builder', config: { level: 1 } },
  { id: 9, glyph: 'QUYOŞ', subGlyph: 'Söz tuziş', title: 'Söz Ustasi', category: 'Öqiş', year: 'Tayyorlov', desc: 'Ş, Ç, Ö, Ğ va ʼ belgilari qatnaşgan sözlarni şisha bloklarda tuzing.', accent: '#ff8fab', art: 'qozi', bg: 'aurora', gameType: 'word-builder', config: { level: 2 } },
  { id: 10, glyph: '1 — 10', subGlyph: 'Olma savati', title: 'Olma Sanaş', category: 'Raqamlar', year: 'İlk qadam', desc: 'Boğdan kerakli miqdordagi olmalarni savatga sanab soling!', accent: '#68b5ff', art: 'olma', bg: 'valley', gameType: 'apple-basket', config: { max: 10 } },
  { id: 11, glyph: '11 — 20', subGlyph: 'Yulduz yiğiş', title: 'Yulduzlar 11–20', category: 'Raqamlar', year: 'Tayyorlov', desc: '10 talik qutiga qöşimça yulduzlarni yiğib 11 dan 20 gaça sonlarni tuzing.', accent: '#5eead4', art: 'yulduz', bg: 'space', gameType: 'apple-basket', config: { max: 20 } },
  { id: 12, glyph: '1 → 10', subGlyph: 'Qurbaqa sakraşi', title: 'Qurbaqa Yöli', category: 'Raqamlar', year: 'İlk qadam', desc: 'Qurbaqa nilufar yaproqlaridan tartib bilan (1 → 2 → 3...) sakrab ötsin!', accent: '#ffd166', art: 'qurbaqa', bg: 'valley', gameType: 'frog-hops', config: { step: 1 } },
  { id: 13, glyph: '2 · 4 · 6', subGlyph: 'Poyezd vagoni', title: 'Sakraş Poyezdi', category: 'Raqamlar', year: 'Tayyorlov', desc: 'Poyezd vagonlarida yetişmayotgan sonli yuklarni yuklab yölga çiqaring!', accent: '#ff8fab', art: 'poyezd', bg: 'valley', gameType: 'train-builder', config: {} },
  { id: 14, glyph: '6 < 9', subGlyph: 'Şisha tarozi', title: 'Katta va Kiçik', category: 'Raqamlar', year: 'Boşlanğiç', desc: 'Tarozi pallalaridagi olmalarni soliştirib (<, =, >) belgisini bosing.', accent: '#68b5ff', art: 'tarozi', bg: 'prism', gameType: 'balance-scale', config: { mode: 'compare' } },
  { id: 15, glyph: '3 + 4', subGlyph: 'Şirga olma ber', title: 'Şir Ziyofati', category: 'Qöşiş', year: 'İlk qadam', desc: 'Quvnoq şirga olmalarni sanab bering va jami sonini hisoblang!', accent: '#5eead4', art: 'sir', bg: 'valley', gameType: 'lion-feeder', config: {} },
  { id: 16, glyph: '7 + 6', subGlyph: 'Pufak qöşiş', title: 'Önlikdan Ötiş', category: 'Qöşiş', year: 'Tayyorlov', desc: 'Suyuq şisha pufaklarini sanab qöşiş javobini toping!', accent: '#ffd166', art: 'yulduz', bg: 'aurora', gameType: 'bubble-math', config: { mode: 'add', maxSum: 20 } },
  { id: 17, glyph: '14 + 12', subGlyph: 'Kosmik raketa', title: 'Raketa Qöşiş', category: 'Qöşiş', year: 'Boşlanğiç', desc: 'Töğri javobli meteoritni lazer bilan urib raketani yulduzlarga uçiring!', accent: '#ff8fab', art: 'raketa', bg: 'space', gameType: 'rocket-shooter', config: { mode: 'add' } },
  { id: 18, glyph: '? + ? = 10', subGlyph: 'Tarozi 10', title: 'Önlik Tarozisi', category: 'Qöşiş', year: 'İlk qadam', desc: 'Tarozini 10 ga tenglaş uçun yetmayotgan olma toşini pallasiga qöying!', accent: '#a78bfa', art: 'tarozi', bg: 'prism', gameType: 'balance-scale', config: { mode: 'maketen' } },
  { id: 19, glyph: '9 − 4', subGlyph: 'Şar yorib ayir', title: 'Yorib Ayiriş', category: 'Ayiriş', year: 'İlk qadam', desc: 'Avval şarçalarni yoring, söng neçtasi qolganini sanab javobni toping!', accent: '#5eead4', art: 'sar', bg: 'aurora', gameType: 'bubble-math', config: { mode: 'sub', maxVal: 10 } },
  { id: 20, glyph: '15 − 7', subGlyph: '20 içida ayir', title: 'Katta Ayiriş', category: 'Ayiriş', year: 'Tayyorlov', desc: 'Pufakçalarni birma-bir yorib 20 içida ayirişni öz közlaringiz bilan köring!', accent: '#ffd166', art: 'olma', bg: 'space', gameType: 'bubble-math', config: { mode: 'sub', maxVal: 20 } },
  { id: 21, glyph: '+ / −', subGlyph: 'Kosmik sinov', title: 'Hisob Raketasi', category: 'Matematika', year: 'Boşlanğiç', desc: 'Qöşiş va ayiriş misollarini tezkor lazer zarbalari bilan yeçing!', accent: '#ff8fab', art: 'raketa', bg: 'space', gameType: 'rocket-shooter', config: { mode: 'mixed' } },
  { id: 22, glyph: 'sh → ş', subGlyph: 'Sehrli konveyer', title: 'Tört Yangi Harf', category: 'Yangi Alifbo', year: 'Tayyorlov', desc: "Eski sh, ch, o', g' sözlarini sehrli tugma bilan yangi harfga aylantiring!", accent: '#68b5ff', art: 'kitob', bg: 'prism', gameType: 'magic-zap', config: {} },
  { id: 23, glyph: '★ ↔ ★', subGlyph: 'Rasmli xotira', title: 'Juftini Top', category: 'Mantiq', year: 'İlk qadam', desc: 'Suyuq şisha kartalarni oçib rasm va söz juftliklarini toping.', accent: '#5eead4', art: 'gul', bg: 'aurora', gameType: 'memory-art', config: { mode: 'art' } },
  { id: 24, glyph: '100 ★', subGlyph: 'Olimpiada', title: 'Katta Bellaşuv', category: 'Sinov', year: 'Tayyorlov', desc: 'Barcha öyinlardan tasodifiy tanlanadigan katta bellaşuv!', accent: '#ffd166', art: 'raketa', bg: 'space', gameType: 'final-mix', config: {} },
  { id: 25, glyph: '▲ ● ★', subGlyph: 'Geometriya', title: 'Şakllar Dunyosi', category: 'Mantiq', year: 'İlk qadam', desc: 'Doira, kvadrat, uçburçak, yulduz va yurak şakllarini soyasidan tanib oling!', accent: '#68b5ff', art: 'yulduz', bg: 'prism', gameType: 'shadow-match', config: {} },
  { id: 26, glyph: '🔴 🔵 ?', subGlyph: 'Ketma-ketlik', title: 'Mantiqiy Zanjir', category: 'Mantiq', year: 'Tayyorlov', desc: 'Rang, şakl va sonlar ketma-ketligini davom ettiring!', accent: '#a78bfa', art: 'gul', bg: 'aurora', gameType: 'pattern-next', config: {} },
  { id: 27, glyph: '🎨', subGlyph: 'Rang aralaşuvi', title: 'Ranglar Sehrgarligi', category: 'Ijod', year: 'İlk qadam', desc: 'Ikki rangni aralaştirib qaysi yangi rang hosil bölişini toping!', accent: '#ff8fab', art: 'sar', bg: 'valley', gameType: 'color-mixer', config: {} },
  { id: 28, glyph: '👏 1·2·3', subGlyph: 'Böğin sanaş', title: 'Böğin Çapagi', category: 'Öqiş', year: 'Tayyorlov', desc: 'Rasm va sözdagi böğinlar sonini qarsak bilan sanab toping!', accent: '#5eead4', art: 'ordak', bg: 'valley', gameType: 'syllable-clap', config: {} },
  { id: 29, glyph: 'Unli/Und', subGlyph: '29 ta harf', title: 'Tovuş Ajratiş', category: 'Alifbo', year: 'Tayyorlov', desc: 'Harflarni Unli (A E I O U Ö) va Undosh savatlariga ajrating!', accent: '#ffd166', art: 'kitob', bg: 'prism', gameType: 'vowel-sort', config: {} },
  { id: 30, glyph: '↔ Zid', subGlyph: 'Maʼno juftlari', title: 'Zid Sözlar', category: 'Öqiş', year: 'Tayyorlov', desc: 'Katta↔Kiçik, Issiq↔Sovuq kabi qarama-qarşi maʼnoli sözlarni toping!', accent: '#56ccf2', art: 'tarozi', bg: 'aurora', gameType: 'opposite-words', config: {} },
  { id: 31, glyph: '🕒 Soat', subGlyph: 'Vaqt örganiş', title: 'Soat Vaqti', category: 'Mantiq', year: 'Tayyorlov', desc: 'Şisha soat strelkalariga qarab aniq soat va yarim soatni toping!', accent: '#68b5ff', art: 'quyos', bg: 'prism', gameType: 'clock-time', config: {} },
  { id: 32, glyph: 'Ç ç', subGlyph: 'Rasm ovi · ch → ç', title: 'Çoynak va Çana', category: 'Yangi Alifbo', year: 'Boşlanğiç', desc: 'Tarkibida yangi Ç ç harfi qatnaşgan rasmli kartalarni ovlang!', accent: '#5eead4', art: 'coy', bg: 'valley', gameType: 'picture-hunt', config: { letter: 'Ç', old: 'ch' } },
  { id: 33, glyph: 'Ö ö', subGlyph: "Tungi fonar · o' → ö", title: 'Örmon Fonari', category: 'Yangi Alifbo', year: 'Boşlanğiç', desc: 'Tungi ördak va qözi vodiysida Ö ö harfli rasmlarni fonar bilan toping!', accent: '#ffd166', art: 'qozi', bg: 'valley', gameType: 'flashlight-hunt', config: { letter: 'Ö' } },
  { id: 34, glyph: '5 · 10 · 15', subGlyph: 'Tez sakraş', title: 'Beşlik Sakraş', category: 'Raqamlar', year: 'Tayyorlov', desc: 'Qurbaqani 5 qadamlik nilufar yaproqlaridan marra tomon sakrating!', accent: '#5eead4', art: 'qurbaqa', bg: 'valley', gameType: 'frog-hops', config: { step: 5 } },
  { id: 35, glyph: 'Maʼno', subGlyph: '29-belgi · ʼ', title: 'Tutuq ʼ Ustasi', category: 'Yangi Alifbo', year: 'Tayyorlov', desc: 'Maʼno, Aʼlo, Sanʼat kabi sözlardagi tutuq belgisi va maxsus harf şarlarini yoring!', accent: '#a78bfa', art: 'kitob', bg: 'space', gameType: 'balloon-pop', config: { mode: 'tutuq' } },
  { id: 36, glyph: 'QALAM', subGlyph: 'Maktab anjomi', title: 'Maktab Sumkasi', category: 'Öqiş', year: 'Tayyorlov', desc: 'Qalam, Kitob, Sumka, Maktab kabi asosiy maktab sözlarini harflardan yiğing!', accent: '#ff8fab', art: 'kitob', bg: 'prism', gameType: 'word-builder', config: { level: 3 } },
  { id: 37, glyph: '4 + 3', subGlyph: '10 içida tez', title: 'Tez Hisob 10', category: 'Matematika', year: 'İlk qadam', desc: 'Maktabga tayyorlov uçun 10 içidagi eng oson qöşiş va ayiriş meteorlari!', accent: '#68b5ff', art: 'raketa', bg: 'space', gameType: 'rocket-shooter', config: { mode: 'easy10' } },
  { id: 38, glyph: 'A ↔ Ş', subGlyph: '29 harf xotira', title: 'Alifbo Xotira', category: 'Alifbo', year: 'Boşlanğiç', desc: 'Harf va unga mos rasm-söz juftliklarini xotirada saqlab toping!', accent: '#ffd166', art: 'sir', bg: 'aurora', gameType: 'memory-art', config: { mode: 'alpha' } },
  { id: 39, glyph: '_ITOB', subGlyph: 'Boş harf ovi', title: 'Boş Harfni Top', category: 'Öqiş', year: 'İlk qadam', desc: 'Rasmga qarab sözning birinçi tuşib qolgan harfini 29 ta harf içidan tanlang!', accent: '#5eead4', art: 'gul', bg: 'valley', gameType: 'first-letter', config: {} },
  { id: 40, glyph: '🏆 40', subGlyph: 'Super sayohat', title: 'Katta Sayohat', category: 'Sinov', year: 'Tayyorlov', desc: 'Barcha öyinlardan tasodifiy marafon — PvP musobaqa uçun eng zör sinov!', accent: '#ffd166', art: 'yulduz', bg: 'space', gameType: 'final-mix', config: {} }
];

// ── Silent SFX No-Op (audio disabled) ───────────────────────────────────────
export function playSound() {}

// ── Procedural 16:9 Liquid Glass Card Renderer (Day & Night Mode Aware) ────
export function drawEduCardFrame(ctx, w, h, item, time = 0, active = 0) {
  ctx.clearRect(0, 0, w, h);
  const day = isDayMode();

  // 1. Backdrop (Day: bright glacial frost over art; Night: deep sapphire-obsidian)
  drawCoverBg(ctx, w, h, item.bg || 'aurora', day ? 0 : 0.44 - active * 0.1);
  if (day) {
    const dayWash = ctx.createLinearGradient(0, 0, w, h);
    dayWash.addColorStop(0, `rgba(248, 251, 255, ${0.86 - active * 0.05})`);
    dayWash.addColorStop(0.5, `rgba(232, 242, 254, ${0.82 - active * 0.05})`);
    dayWash.addColorStop(1, `rgba(215, 231, 252, ${0.86 - active * 0.05})`);
    ctx.fillStyle = dayWash;
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Faceted Liquid Glass Planes inside card
  ctx.save();
  const facetShift = Math.sin(time * 0.45 + item.id) * 14;
  const facetA = ctx.createLinearGradient(0, 0, w * 0.7, h);
  if (day) {
    facetA.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
    facetA.addColorStop(0.5, hexAlpha(item.accent, 0.10));
    facetA.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  } else {
    facetA.addColorStop(0, 'rgba(190, 230, 255, 0.12)');
    facetA.addColorStop(0.5, 'rgba(94, 234, 212, 0.04)');
    facetA.addColorStop(1, 'rgba(10, 14, 28, 0.0)');
  }
  ctx.fillStyle = facetA;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.62 + facetShift, 0);
  ctx.lineTo(w * 0.34 - facetShift * 0.5, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const facetB = ctx.createLinearGradient(w * 0.35, 0, w, h);
  facetB.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
  facetB.addColorStop(0.55, hexAlpha(item.accent, day ? 0.16 + 0.08 * active : 0.11 + 0.09 * active));
  facetB.addColorStop(1, day ? 'rgba(255, 255, 255, 0.52)' : 'rgba(165, 210, 255, 0.14)');
  ctx.fillStyle = facetB;
  ctx.beginPath();
  ctx.moveTo(w * 0.58 + facetShift, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h * 0.76);
  ctx.lineTo(w * 0.42 - facetShift * 0.4, h);
  ctx.closePath();
  ctx.fill();

  // Subtle facet cut line
  ctx.strokeStyle = day ? 'rgba(15, 23, 42, 0.08)' : 'rgba(220, 242, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.58 + facetShift, 0);
  ctx.lineTo(w * 0.42 - facetShift * 0.4, h);
  ctx.stroke();

  // Animated liquid specular caustic streak
  const sweepX = ((time * 0.22 + item.id * 0.17) % 1.8) - 0.4;
  const sheen = ctx.createLinearGradient(
    w * (sweepX - 0.18),
    0,
    w * (sweepX + 0.18),
    h
  );
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(0.5, day ? `rgba(255, 255, 255, ${0.42 + active * 0.22})` : `rgba(225, 245, 255, ${0.11 + active * 0.10})`);
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // 3. Luminous corner bloom behind illustration
  const glowR = w * (0.48 + 0.10 * active);
  const rad = ctx.createRadialGradient(w * 0.78, h * 0.40, 6, w * 0.78, h * 0.40, glowR);
  rad.addColorStop(0, hexAlpha(item.accent, day ? 0.28 + 0.16 * active : 0.34 + 0.20 * active));
  rad.addColorStop(0.55, hexAlpha(item.accent, 0.08));
  rad.addColorStop(1, day ? 'rgba(255,255,255,0)' : 'rgba(10,12,18,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, w, h);

  // 4. Liquid Glass Frosted Left Slab
  const pad = 12;
  const gw = w * 0.50;
  const gh = h * 0.68;
  ctx.save();
  roundRect(ctx, pad, pad, gw, gh, 16);
  const glassGrad = ctx.createLinearGradient(pad, pad, pad + gw * 0.4, pad + gh);
  if (day) {
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.94)');
    glassGrad.addColorStop(0.45, 'rgba(242, 247, 255, 0.80)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.88)');
  } else {
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
    glassGrad.addColorStop(0.38, 'rgba(180, 220, 255, 0.10)');
    glassGrad.addColorStop(0.65, 'rgba(14, 18, 34, 0.52)');
    glassGrad.addColorStop(1, 'rgba(160, 215, 255, 0.14)');
  }
  ctx.fillStyle = glassGrad;
  ctx.fill();

  // Bevel rim
  const rimGrad = ctx.createLinearGradient(pad, pad, pad + gw, pad + gh);
  if (day) {
    rimGrad.addColorStop(0, active > 0.3 ? 'rgba(2, 132, 199, 0.55)' : 'rgba(15, 23, 42, 0.16)');
    rimGrad.addColorStop(0.5, hexAlpha(item.accent, 0.42));
    rimGrad.addColorStop(1, 'rgba(15, 23, 42, 0.12)');
  } else {
    rimGrad.addColorStop(0, active > 0.3 ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.44)');
    rimGrad.addColorStop(0.5, 'rgba(130, 215, 255, 0.34)');
    rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.26)');
  }
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Inner top specular highlight arc
  ctx.strokeStyle = day ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.62)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(pad + 18, pad + 1.5);
  ctx.lineTo(pad + gw - 18, pad + 1.5);
  ctx.stroke();
  ctx.restore();

  // 5. Illustrated animated sprite on the right backdrop
  ctx.save();
  const artScale = h * (0.58 + active * 0.05);
  drawIllustration(ctx, item.art || 'gul', w * 0.77, h * 0.40, artScale, time + item.id * 0.4, item.accent);
  ctx.restore();

  // 6. Left frosted slab typography (crisp contrast)
  ctx.save();
  ctx.fillStyle = day ? '#0f172a' : '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const gLen = item.glyph.length;
  const gSize = gLen <= 3 ? 58 : (gLen <= 6 ? 42 : 31);
  ctx.font = `700 ${gSize}px "Nunito", ui-serif, serif`;
  ctx.fillText(item.glyph, pad + 18, pad + gh * 0.39);
  ctx.restore();

  // Tag chip inside slab
  const badgeTxt = item.subGlyph;
  ctx.font = '700 12px "Nunito", ui-sans-serif, sans-serif';
  const tw = ctx.measureText(badgeTxt).width;
  const bx = pad + 18;
  const by = pad + gh * 0.64;
  ctx.fillStyle = hexAlpha(item.accent, day ? 0.22 : 0.28);
  roundRect(ctx, bx, by, tw + 18, 24, 999);
  ctx.fill();
  ctx.strokeStyle = hexAlpha(item.accent, day ? 0.72 : 0.78);
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.fillStyle = day ? '#0f172a' : '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(badgeTxt, bx + 9, by + 12);

  // 7. Bottom Liquid Glass footer bar inside card
  const barY = h * 0.775;
  const barGrad = ctx.createLinearGradient(0, barY, w, h);
  if (day) {
    barGrad.addColorStop(0, 'rgba(255, 255, 255, 0.90)');
    barGrad.addColorStop(1, 'rgba(235, 244, 255, 0.86)');
  } else {
    barGrad.addColorStop(0, 'rgba(10, 14, 28, 0.76)');
    barGrad.addColorStop(1, 'rgba(14, 20, 38, 0.68)');
  }
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, barY, w, h - barY);
  ctx.strokeStyle = day ? 'rgba(15, 23, 42, 0.12)' : 'rgba(210, 235, 255, 0.30)';
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(w, barY);
  ctx.stroke();

  ctx.save();
  ctx.fillStyle = day ? '#0f172a' : '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '700 14.5px "Nunito", ui-sans-serif, sans-serif';
  ctx.fillText(item.title, 18, h * 0.89);

  ctx.textAlign = 'right';
  ctx.fillStyle = day
    ? (active > 0.3 ? '#0284c7' : '#0369a1')
    : (active > 0.3 ? item.accent : 'rgba(225, 240, 255, 0.9)');
  ctx.font = '600 13px "Nunito", ui-serif, serif';
  ctx.fillText(`${item.year} · Öynaş →`, w - 18, h * 0.89);
  ctx.restore();

  // Outer Liquid Glass double-bevel frame
  const outerRim = ctx.createLinearGradient(0, 0, w, h);
  if (day) {
    outerRim.addColorStop(0, active > 0.35 ? 'rgba(2, 132, 199, 0.55)' : 'rgba(15, 23, 42, 0.18)');
    outerRim.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    outerRim.addColorStop(1, 'rgba(15, 23, 42, 0.16)');
  } else {
    outerRim.addColorStop(0, active > 0.35 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.40)');
    outerRim.addColorStop(0.5, 'rgba(130, 215, 255, 0.32)');
    outerRim.addColorStop(1, 'rgba(255, 255, 255, 0.24)');
  }
  ctx.strokeStyle = outerRim;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(0.9, 0.9, w - 1.8, h - 1.8);
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

// ── Playable Educational Games Modal Engine ──────────────────────────────────
let modalEl = null;
let modalBody = null;
let modalTitle = null;
let modalSub = null;
let modalScore = null;
let onCloseCb = null;
let activeCleanup = null;
const activeTimers = new Set();

function gameTimeout(fn, ms) {
  const id = window.setTimeout(() => {
    activeTimers.delete(id);
    fn();
  }, ms);
  activeTimers.add(id);
  return id;
}

function clearActiveGame() {
  activeTimers.forEach((id) => window.clearTimeout(id));
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

function ensureModal() {
  if (modalEl) return;
  modalEl = document.getElementById('edu-modal');
  modalBody = document.getElementById('edu-body');
  modalTitle = document.getElementById('edu-title');
  modalSub = document.getElementById('edu-sub');
  modalScore = document.getElementById('edu-score');
  const closeBtn = document.getElementById('edu-close');
  closeBtn.addEventListener('click', closeEduGame);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeEduGame();
  });
}

// ── Session-Wide Non-Repeating Randomizer ───────────────────────────────────
const GAME_SEEN = new Map();

function pickFreshBatch(gameKey, pool, count, keyFn = (x) => JSON.stringify(x)) {
  let seen = GAME_SEEN.get(gameKey);
  if (!seen) {
    seen = new Set();
    GAME_SEEN.set(gameKey, seen);
  }
  const avail = pool.filter((it) => !seen.has(keyFn(it)));
  if (avail.length >= count) {
    const chosen = shuffle(avail).slice(0, count);
    chosen.forEach((it) => seen.add(keyFn(it)));
    return chosen;
  }
  // Use any remaining unseen items first, then cycle pool without duplicating current batch
  const head = shuffle(avail);
  seen.clear();
  const headKeys = new Set(head.map(keyFn));
  const tail = shuffle(pool.filter((it) => !headKeys.has(keyFn(it)))).slice(0, Math.max(0, count - head.length));
  const res = shuffle([...head, ...tail]);
  res.forEach((it) => seen.add(keyFn(it)));
  return res;
}

function pickFreshMath(gameKey, generator, sigFn, maxTries = 28) {
  let seen = GAME_SEEN.get(gameKey);
  if (!seen) {
    seen = new Set();
    GAME_SEEN.set(gameKey, seen);
  }
  if (seen.size > 48) seen.clear();
  let candidate = generator();
  for (let i = 0; i < maxTries; i++) {
    const sig = sigFn(candidate);
    if (!seen.has(sig)) {
      seen.add(sig);
      return candidate;
    }
    candidate = generator();
  }
  seen.clear();
  seen.add(sigFn(candidate));
  return candidate;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeChoices(correct, pool) {
  const set = new Set([correct]);
  for (const x of shuffle(pool)) {
    if (set.size >= 4) break;
    set.add(x);
  }
  return shuffle(Array.from(set));
}

function mountCanvasStage(heightPx = 320) {
  const wrap = document.createElement('div');
  wrap.className = 'edu-canvas-wrap';
  const c = document.createElement('canvas');
  c.className = 'edu-game-canvas';
  wrap.appendChild(c);
  modalBody.appendChild(wrap);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const stageScale = (vw >= 1560 && vh >= 880) ? 1.32 : (vw >= 1200 && vh >= 740 ? 1.16 : 1);
  const dpr = Math.min(window.devicePixelRatio || 1, isLowEndDevice() ? 1 : 1.5);
  const w = Math.max(300, wrap.clientWidth || 680);
  const h = Math.min(Math.round(vh * 0.52), Math.round(heightPx * stageScale));
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  c.style.width = '100%';
  c.style.height = `${h}px`;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return {
    wrap,
    canvas: c,
    ctx,
    w,
    h,
    getXY(e) {
      const rect = c.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * w,
        y: ((clientY - rect.top) / rect.height) * h
      };
    }
  };
}

function spawnParticles(list, x, y, color, count = 14) {
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const spd = 0.9 + Math.random() * 2.1;
    list.push({
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 0.7,
      life: 1,
      color,
      r: 2.5 + Math.random() * 3
    });
  }
}

function updateAndDrawParticles(ctx, list) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.045;
    p.life -= 0.018;
    if (p.life <= 0) { list.splice(i, 1); continue; }
    ctx.fillStyle = hexAlpha(p.color, p.life);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

const PVP_LANG_QUESTIONS = [
  { q: 'Avvalgi «Ch ch» yangi alifboda nechanchi va qaysi harf?', opts: ['3 · Ç ç', '22 · Ş ş', '8 · Ğ ğ', '17 · Ö ö'], a: '3 · Ç ç' },
  { q: 'Avvalgi «Sh sh» qaysi harfga o‘zgargan?', opts: ['Ş ş (22)', 'Ç ç (3)', 'S s (21)', 'Ğ ğ (8)'], a: 'Ş ş (22)' },
  { q: 'Avvalgi «Gʻ gʻ» qaysi harf bilan yoziladi?', opts: ['Ğ ğ (8)', 'G g (7)', 'Q q (19)', 'H h (9)'], a: 'Ğ ğ (8)' },
  { q: 'Avvalgi «Oʻ oʻ» yangi alifboda qanday yoziladi?', opts: ['Ö ö (17)', 'O o (16)', 'U u (24)', 'I i (10)'], a: 'Ö ö (17)' },
  { q: 'Alifboning 29-o‘rnida qaysi belgi turadi?', opts: ['ʼ (tutuq)', 'Ng ng', 'Ş ş', 'Ç ç'], a: 'ʼ (tutuq)' },
  { q: '«Quyosh» so‘zi yangi alifboda qanday yoziladi?', opts: ['Quyoş', 'Quyos', 'Quyoch', 'Qöyoş'], a: 'Quyoş' },
  { q: '«O‘rdak» so‘zining to‘g‘ri yangi yozuvi:', opts: ['Ördak', 'Ordak', 'Urdak', 'Ğördak'], a: 'Ördak' },
  { q: '«Choynak» so‘zi qaysi harf bilan boshlanadi?', opts: ['Ç', 'Ş', 'C', 'Ğ'], a: 'Ç' },
  { q: '«Ma’no» so‘zida 29-belgi qanday qo‘yiladi?', opts: ['Maʼno', 'Mano', 'Mağno', 'Maçno'], a: 'Maʼno' },
  { q: '«G‘oz» so‘zining bosh harfi qaysi?', opts: ['Ğ', 'G', 'Q', 'Ö'], a: 'Ğ' },
  { q: '«Bog‘» so‘zi oxirida qaysi harf yoziladi?', opts: ['ğ', 'g', 'q', 'ç'], a: 'ğ' },
  { q: '«Shamol» so‘zining yangi shakli:', opts: ['Şamol', 'Çamol', 'Samol', 'Ğamol'], a: 'Şamol' },
  { q: 'Alifboda 1-o‘rindagi unli harf:', opts: ['A a', 'O o', 'E e', 'I i'], a: 'A a' },
  { q: '«A’lo» so‘zidagi belgi nechanchi o‘rinda?', opts: ['29 · ʼ', '28 · Z', '17 · Ö', '3 · Ç'], a: '29 · ʼ' },
  { q: 'Qaysi harf UNLI tovush hisoblanadi?', opts: ['Ö ö', 'Ş ş', 'Ç ç', 'Ğ ğ'], a: 'Ö ö' },
  { q: '«Ol-ma» so‘zida nechta bo‘g‘in bor?', opts: ['2 ta', '1 ta', '3 ta', '4 ta'], a: '2 ta' },
  { q: '«Ka-pa-lak» so‘zi nechta bo‘g‘indan iborat?', opts: ['3 ta', '2 ta', '1 ta', '4 ta'], a: '3 ta' },
  { q: '«Katta» so‘zining ziddi qaysi?', opts: ['Kiçik', 'Uzun', 'Issiq', 'Tez'], a: 'Kiçik' },
  { q: '«Issiq» so‘zining ziddi qaysi?', opts: ['Sovuq', 'Baland', 'Yangi', 'Şirin'], a: 'Sovuq' },
  { q: '«Qalam» so‘zi qaysi harf bilan boshlanadi?', opts: ['Q', 'K', 'G', 'Ğ'], a: 'Q' },
  { q: 'Qizil va sariq rang qo‘shilsa qaysi rang chiqadi?', opts: ['Zarğaldoq', 'Yaşil', 'Kök', 'Qora'], a: 'Zarğaldoq' },
  { q: 'Ko‘k va sariq rang qo‘shilsa qaysi rang bo‘ladi?', opts: ['Yaşil', 'Binafşa', 'Puşti', 'Kulrang'], a: 'Yaşil' },
  { q: 'Alifboda oxirgi harf (28-o‘rin) qaysi?', opts: ['Z z', 'Y y', 'X x', 'V v'], a: 'Z z' },
  { q: '«Kitob» so‘zida nechta bo‘g‘in bor?', opts: ['2 ta', '1 ta', '3 ta', '4 ta'], a: '2 ta' }
];

function makeRandomMathDuelQuestion() {
  return pickFreshMath('pvp-math-duel', () => {
    const kind = randInt(0, 2);
    if (kind === 0) {
      const a = randInt(3, 14);
      const b = randInt(2, 12);
      const ans = a + b;
      return { q: `${a} + ${b} = ?`, opts: makeChoices(ans, [ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter((x) => x > 0 && x !== ans)).map(String), a: String(ans) };
    }
    if (kind === 1) {
      const a = randInt(8, 20);
      const b = randInt(2, a - 1);
      const ans = a - b;
      return { q: `${a} − ${b} = ?`, opts: makeChoices(ans, [ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter((x) => x >= 0 && x !== ans)).map(String), a: String(ans) };
    }
    const x = randInt(2, 19);
    const y = randInt(2, 19);
    const sym = x < y ? '<' : x > y ? '>' : '=';
    return { q: `${x}  ?  ${y}`, opts: shuffle(['<', '=', '>']), a: sym };
  }, (item) => item.q);
}

export function openPvpDuel(track = 'lang') {
  openEduGame({
    id: 99,
    glyph: '⚔️ PvP',
    subGlyph: '2 Öyinçi Duel',
    title: track === 'math' ? 'Tez Hisob Dueli (PvP)' : 'Tez Alifbo Dueli (PvP)',
    category: track === 'math' ? 'Matematika PvP' : 'Yangi Alifbo PvP',
    year: '1 vs 2',
    accent: '#5eead4',
    gameType: 'pvp-duel',
    config: { track, directPvp: true }
  });
}

export function openEduGame(item, onClose) {
  ensureModal();
  clearActiveGame();
  onCloseCb = onClose || null;
  modalTitle.textContent = item.title;
  modalSub.textContent = `${item.category}, ${item.year}`;

  const topRight = modalEl.querySelector('.edu-top-right');
  let pvpBtn = topRight.querySelector('#edu-pvp-toggle');
  if (!pvpBtn) {
    pvpBtn = document.createElement('button');
    pvpBtn.type = 'button';
    pvpBtn.id = 'edu-pvp-toggle';
    pvpBtn.className = 'pill-btn edu-pvp-toggle';
    topRight.prepend(pvpBtn);
  }
  let headReplayBtn = topRight.querySelector('#edu-head-replay');
  if (!headReplayBtn) {
    headReplayBtn = document.createElement('button');
    headReplayBtn.type = 'button';
    headReplayBtn.id = 'edu-head-replay';
    headReplayBtn.className = 'pill-btn';
    headReplayBtn.textContent = '↻ Qayta';
    headReplayBtn.title = 'Yangi tasodifiy savollar bilan qayta boşlaş';
    topRight.insertBefore(headReplayBtn, pvpBtn.nextSibling);
  }

  // PvP status bar inside modal stage (above modalBody)
  const stageEl = modalEl.querySelector('.edu-stage');
  let pvpBar = stageEl.querySelector('#edu-pvp-bar');
  if (!pvpBar) {
    pvpBar = document.createElement('div');
    pvpBar.id = 'edu-pvp-bar';
    pvpBar.className = 'edu-pvp-bar';
    stageEl.insertBefore(pvpBar, modalBody);
  }

  let stars = 0;
  let pvpMode = Boolean(item.config && item.config.directPvp);
  let pvpTurn = 1; // 1 | 2
  let p1Stars = 0;
  let p2Stars = 0;

  const syncTopControls = () => {
    pvpBtn.classList.toggle('is-active', pvpMode);
    pvpBtn.textContent = pvpMode ? '⚔️ PvP: Yoqilgan' : '⚔️ PvP';
    if (pvpMode) {
      modalScore.style.display = 'none';
      pvpBar.style.display = 'flex';
      pvpBar.innerHTML = `
        <div class="edu-pvp-player p1 ${pvpTurn === 1 ? 'is-turn' : ''}">
          <span>1-Öyinçi</span><strong>★ ${p1Stars}</strong>
        </div>
        <div class="edu-pvp-mid">
          <span class="edu-pvp-turn-tag">${item.gameType === 'pvp-duel' ? 'Jonli Duel' : `Navbat: ${pvpTurn}-Öyinçi`}</span>
          ${item.gameType !== 'pvp-duel' ? '<button type="button" class="pill-btn edu-fast-duel-btn">⚡ Tez Duel</button>' : ''}
        </div>
        <div class="edu-pvp-player p2 ${pvpTurn === 2 ? 'is-turn' : ''}">
          <span>2-Öyinçi</span><strong>★ ${p2Stars}</strong>
        </div>
      `;
      const duelBtn = pvpBar.querySelector('.edu-fast-duel-btn');
      if (duelBtn) {
        duelBtn.onclick = () => {
          const isLang = /Alifbo|Öqiş|Harf|Ijod/i.test(item.category || '');
          gamePvpDuel({ track: isLang ? 'lang' : 'math' });
        };
      }
    } else {
      modalScore.style.display = '';
      pvpBar.style.display = 'none';
      modalScore.textContent = `★ ${stars}`;
    }
  };

  const addStar = (n = 1) => {
    stars += n;
    if (pvpMode) {
      if (pvpTurn === 1) p1Stars += n;
      else p2Stars += n;
    }
    syncTopControls();
  };

  const resetAndLaunch = () => {
    stars = 0;
    pvpTurn = 1;
    p1Stars = 0;
    p2Stars = 0;
    syncTopControls();
    launchGame(item);
  };

  pvpBtn.onclick = () => {
    pvpMode = !pvpMode;
    resetAndLaunch();
  };
  headReplayBtn.onclick = () => {
    resetAndLaunch();
  };

  syncTopControls();

  modalEl.classList.add('is-open');
  modalEl.style.visibility = 'visible';
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-game-open');
  window.dispatchEvent(new Event('alif:gamemodal'));
  gsap.killTweensOf(modalEl);
  gsap.fromTo(modalEl, { opacity: 0 }, { opacity: 1, duration: 0.34, ease: 'power2.out' });
  gsap.fromTo(stageEl, { scale: 0.88, y: 22 }, { scale: 1, y: 0, duration: 0.62, ease: 'expo.out' });

  function showVictory(headline, subtitle) {
    clearActiveGame();
    playSound('win');

    if (pvpMode && item.gameType !== 'pvp-duel') {
      if (pvpTurn === 1) {
        modalBody.innerHTML = `
          <div class="edu-finish">
            <div class="edu-finish-stars">⚔️</div>
            <h3 class="edu-finish-title">1-Öyinçi yakunladi: ★ ${p1Stars}</h3>
            <p class="edu-finish-desc">Endi 2-Öyinçi uçun yangi tasodifiy topşiriqlar tayyor!</p>
            <div class="edu-finish-actions">
              <button type="button" class="edu-btn-primary" id="edu-p2-start">2-Öyinçi Boşlasin →</button>
              <button type="button" class="pill-btn" id="edu-done">Çiqiş</button>
            </div>
          </div>
        `;
        modalBody.querySelector('#edu-p2-start').addEventListener('click', () => {
          pvpTurn = 2;
          syncTopControls();
          launchGame(item);
        });
        modalBody.querySelector('#edu-done').addEventListener('click', closeEduGame);
        return;
      }

      const winnerTitle =
        p1Stars > p2Stars ? '🏆 1-Öyinçi Ğolib!' : p2Stars > p1Stars ? '🏆 2-Öyinçi Ğolib!' : '🤝 Durang! Ikkalasi ham teng!';
      modalBody.innerHTML = `
        <div class="edu-finish">
          <div class="edu-finish-stars">🏆</div>
          <h3 class="edu-finish-title">${winnerTitle}</h3>
          <p class="edu-finish-desc">1-Öyinçi: <strong>★ ${p1Stars}</strong> &nbsp;·&nbsp; 2-Öyinçi: <strong>★ ${p2Stars}</strong></p>
          <div class="edu-finish-actions">
            <button type="button" class="edu-btn-primary" id="edu-replay">Yana PvP öynaş</button>
            <button type="button" class="pill-btn" id="edu-done">Çiqiş</button>
          </div>
        </div>
      `;
      modalBody.querySelector('#edu-replay').addEventListener('click', resetAndLaunch);
      modalBody.querySelector('#edu-done').addEventListener('click', closeEduGame);
      return;
    }

    modalBody.innerHTML = `
      <div class="edu-finish">
        <div class="edu-finish-stars">★★★</div>
        <h3 class="edu-finish-title">${headline || 'Barakalla!'}</h3>
        <p class="edu-finish-desc">${subtitle || `Siz ${stars} ta yulduzça topladingiz!`}</p>
        <div class="edu-finish-actions">
          <button type="button" class="edu-btn-primary" id="edu-replay">Yana öynaş</button>
          <button type="button" class="pill-btn" id="edu-done">Çiqiş</button>
        </div>
      </div>
    `;
    modalBody.querySelector('#edu-replay').addEventListener('click', () => {
      stars = 0;
      syncTopControls();
      launchGame(item);
    });
    modalBody.querySelector('#edu-done').addEventListener('click', closeEduGame);
  }

  // ── 0. SIMULTANEOUS 2-PLAYER SPLIT-SCREEN FAST PVP DUEL ──────────────────
  function gamePvpDuel(cfg = {}) {
    clearActiveGame();
    pvpTurn = 1;
    stars = 0;
    p1Stars = 0;
    p2Stars = 0;
    syncTopControls();

    const track = cfg.track || 'lang';
    const roundsTotal = 7;
    const questions = track === 'math'
      ? Array.from({ length: roundsTotal }, () => makeRandomMathDuelQuestion())
      : pickFreshBatch('pvp-lang-duel', PVP_LANG_QUESTIONS, roundsTotal, (q) => q.q);
    let rIdx = 0;

    const playDuelRound = () => {
      clearActiveGame();
      if (rIdx >= questions.length) {
        const winText =
          p1Stars > p2Stars ? '🏆 1-Öyinçi Tez Duel Ğolibi!' : p2Stars > p1Stars ? '🏆 2-Öyinçi Tez Duel Ğolibi!' : '🤝 Durang! Ikkalasi ham teng!';
        modalBody.innerHTML = `
          <div class="edu-finish">
            <div class="edu-finish-stars">⚔️</div>
            <h3 class="edu-finish-title">${winText}</h3>
            <p class="edu-finish-desc">1-Öyinçi: <strong>★ ${p1Stars}</strong> &nbsp;·&nbsp; 2-Öyinçi: <strong>★ ${p2Stars}</strong></p>
            <div class="edu-finish-actions">
              <button type="button" class="edu-btn-primary" id="edu-duel-replay">Yangi Savollar bilan Duel →</button>
              <button type="button" class="pill-btn" id="edu-done">Çiqiş</button>
            </div>
          </div>
        `;
        modalBody.querySelector('#edu-duel-replay').addEventListener('click', () => gamePvpDuel(cfg));
        modalBody.querySelector('#edu-done').addEventListener('click', closeEduGame);
        return;
      }

      const cur = questions[rIdx];
      rIdx++;
      const p1Opts = shuffle(cur.opts);
      const p2Opts = shuffle(cur.opts);
      let roundLocked = false;
      let p1Cooldown = false;
      let p2Cooldown = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>⚔️ Tez Duel · Savol ${rIdx} / ${questions.length}</span>
          <span class="edu-hud-pill">Kim birinçi töğri topsa +1 ★</span>
        </div>
        <div class="edu-duel-question">${cur.q}</div>
        <div class="edu-duel-arena">
          <div class="edu-duel-side p1">
            <div class="edu-duel-side-head"><span>1-Öyinçi</span><small>★ ${p1Stars}</small></div>
            <div class="edu-duel-opts">
              ${p1Opts.map((o) => `<button type="button" class="edu-opt edu-duel-btn" data-p="1" data-v="${o}">${o}</button>`).join('')}
            </div>
          </div>
          <div class="edu-duel-side p2">
            <div class="edu-duel-side-head"><span>2-Öyinçi</span><small>★ ${p2Stars}</small></div>
            <div class="edu-duel-opts">
              ${p2Opts.map((o) => `<button type="button" class="edu-opt edu-duel-btn" data-p="2" data-v="${o}">${o}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="edu-feedback" id="duel-fb">Ikkala öyinçi barobar javobni bosing!</div>
      `;

      modalBody.querySelectorAll('.edu-duel-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (roundLocked) return;
          const p = Number(btn.dataset.p);
          const v = btn.dataset.v;
          if (p === 1 && p1Cooldown) return;
          if (p === 2 && p2Cooldown) return;

          const fb = modalBody.querySelector('#duel-fb');
          if (v === cur.a) {
            roundLocked = true;
            btn.classList.add('is-correct');
            if (p === 1) p1Stars++;
            else p2Stars++;
            stars++;
            syncTopControls();
            if (fb) fb.textContent = `${p}-Öyinçi birinçi topdi! +1 ★`;
            gameTimeout(playDuelRound, 1050);
          } else {
            btn.classList.add('is-wrong');
            if (p === 1) { p1Cooldown = true; gameTimeout(() => { p1Cooldown = false; btn.classList.remove('is-wrong'); }, 750); }
            else { p2Cooldown = true; gameTimeout(() => { p2Cooldown = false; btn.classList.remove('is-wrong'); }, 750); }
            if (fb) fb.textContent = `${p}-Öyinçi xato bosdi!`;
          }
        });
      });
    };

    playDuelRound();
  }

  // ── 1. PICTURE HUNT (Ş ş / Ç ç — Dynamic Storybook Valley Collector) ───
  function gamePictureHunt(cfg) {
    clearActiveGame();
    const targetLetter = cfg.letter || 'Ş';
    const roundsTotal = 3;
    let roundIdx = 0;

    const banksByLetter = {
      'Ş': [
        { word: 'Şar', art: 'sar' },
        { word: 'Şir', art: 'sir' },
        { word: 'Quyoş', art: 'quyos' },
        { word: 'Şahar', art: 'raketa' },
        { word: 'Şamol', art: 'gul' },
        { word: 'Şirin', art: 'olma' },
        { word: 'Şahzod', art: 'yulduz' },
        { word: 'Şoli', art: 'kitob' },
        { word: 'Şarpa', art: 'tog' }
      ],
      'Ç': [
        { word: 'Çoynak', art: 'coy' },
        { word: 'Çana', art: 'poyezd' },
        { word: 'Çiroq', art: 'quyos' },
        { word: 'Çumoli', art: 'qurbaqa' },
        { word: 'Quşça', art: 'ordak' },
        { word: 'Keça', art: 'yulduz' },
        { word: 'Köpçik', art: 'sar' },
        { word: 'Ölçov', art: 'tarozi' },
        { word: 'Gulça', art: 'gul' }
      ]
    };
    const matchBank = banksByLetter[targetLetter] || banksByLetter['Ş'];
    const decoyBank = [
      { word: 'Olma', art: 'olma' },
      { word: 'Kitob', art: 'kitob' },
      { word: 'Lola', art: 'gul' },
      { word: 'Poyezd', art: 'poyezd' },
      { word: 'Yulduz', art: 'yulduz' },
      { word: 'Tarozi', art: 'tarozi' },
      { word: 'Ördak', art: 'ordak' },
      { word: 'Ğoz', art: 'tog' },
      { word: 'Qözi', art: 'qozi' },
      { word: 'Non', art: 'quyos' }
    ].filter((x) => !x.word.toUpperCase().includes(targetLetter));

    const roundMatches = pickFreshBatch(`pic-g-${targetLetter}`, matchBank, roundsTotal * 3, (x) => x.word);
    const roundDecoys = pickFreshBatch(`pic-b-${targetLetter}`, decoyBank, roundsTotal * 3, (x) => x.word);

    function startRound() {
      clearActiveGame();
      if (roundIdx >= roundsTotal) {
        showVictory('Ajoyib ovçi!', `"${targetLetter}" harfini rasmlardan aʼlo darajada topdingiz!`);
        return;
      }
      const goods = roundMatches.slice(roundIdx * 3, roundIdx * 3 + 3).map((x) => ({ ...x, good: true }));
      const bads = roundDecoys.slice(roundIdx * 3, roundIdx * 3 + 3).map((x) => ({ ...x, good: false }));
      roundIdx++;
      const objs = shuffle([...goods, ...bads]);

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Bosqiç ${roundIdx} / ${roundsTotal}</span>
          <span class="edu-hud-pill" id="hunt-found">Topildi: 0 / 3</span>
        </div>
        <div class="edu-banner">
          Rasmli şisha kartalardan tarkibida <strong>"${targetLetter} ${targetLetter.toLowerCase()}"</strong> harfi borlarini bosing!
        </div>
      `;

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(310);
      const particles = [];
      let foundCount = 0;

      const items = objs.map((o, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        return {
          ...o,
          baseX: w * (0.19 + col * 0.31),
          baseY: h * (0.28 + row * 0.44),
          x: w * (0.19 + col * 0.31),
          y: h * (0.28 + row * 0.44),
          r: Math.min(w / 7.5, 58),
          phase: idx * 1.1,
          collected: false,
          shake: 0,
          scale: 1
        };
      });

      let raf = 0;
      const tick = (now) => {
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'valley', 0.28);

        for (const it of items) {
          if (it.collected) {
            it.scale = Math.max(0, it.scale - 0.035);
            if (it.scale <= 0.02) continue;
          }
          it.shake *= 0.88;
          it.x = it.baseX + Math.sin(t * 0.7 + it.phase) * 5 + Math.sin(t * 32) * it.shake * 6;
          it.y = it.baseY + Math.cos(t * 0.85 + it.phase) * 4;

          ctx.save();
          ctx.translate(it.x, it.y);
          ctx.scale(it.scale, it.scale);

          ctx.fillStyle = it.shake > 0.1 ? 'rgba(255,143,171,0.28)' : 'rgba(255,255,255,0.12)';
          ctx.strokeStyle = it.shake > 0.1 ? '#ff8fab' : 'rgba(255,255,255,0.28)';
          ctx.lineWidth = 1.5;
          roundRect(ctx, -it.r * 1.15, -it.r * 0.92, it.r * 2.3, it.r * 1.84, 16);
          ctx.fill();
          ctx.stroke();

          drawIllustration(ctx, it.art, 0, -it.r * 0.12, it.r * 1.25, t + it.phase, item.accent);

          ctx.font = '600 14px "Nunito", ui-sans-serif, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(it.word, 0, it.r * 0.65);
          ctx.restore();
        }

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        const pt = getXY(e);
        for (const it of items) {
          if (it.collected) continue;
          if (Math.abs(pt.x - it.x) < it.r * 1.15 && Math.abs(pt.y - it.y) < it.r * 0.92) {
            if (it.good) {
              it.collected = true;
              foundCount++;
              addStar(1);
              playSound('pop', foundCount);
              spawnParticles(particles, it.x, it.y, '#5eead4', 18);
              const badge = modalBody.querySelector('#hunt-found');
              if (badge) badge.textContent = `Topildi: ${foundCount} / 3`;
              if (foundCount >= 3) {
                playSound('good');
                gameTimeout(startRound, 1150);
              }
            } else {
              it.shake = 1;
              playSound('bad');
              spawnParticles(particles, it.x, it.y, '#ff8fab', 8);
            }
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);
      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    startRound();
  }

  // ── 2. FLASHLIGHT NIGHT DISCOVERY (Ğ ğ / Ö ö Spotlight Hunt!) ──────────
  function gameFlashlightHunt(cfg) {
    clearActiveGame();
    const targetLetter = cfg.letter || 'Ğ';
    const goodByLetter = {
      'Ğ': [
        { word: 'Ğoz', art: 'ordak', good: true },
        { word: 'Toğ', art: 'tog', good: true },
        { word: 'Boğ', art: 'olma', good: true },
        { word: 'Ğalla', art: 'gul', good: true },
        { word: 'Ğor', art: 'tog', good: true },
        { word: 'Jilğa', art: 'quyos', good: true }
      ],
      'Ö': [
        { word: 'Ördak', art: 'ordak', good: true },
        { word: 'Qözi', art: 'qozi', good: true },
        { word: 'Örmon', art: 'tog', good: true },
        { word: 'Jöja', art: 'ordak', good: true },
        { word: 'Öt', art: 'gul', good: true },
        { word: 'Qöşiq', art: 'sar', good: true }
      ]
    };
    const goodBank = goodByLetter[targetLetter] || goodByLetter['Ğ'];
    const badBank = [
      { word: 'Olma', art: 'olma', good: false },
      { word: 'Kitob', art: 'kitob', good: false },
      { word: 'Raketa', art: 'raketa', good: false },
      { word: 'Şar', art: 'sar', good: false },
      { word: 'Çoynak', art: 'coy', good: false },
      { word: 'Lola', art: 'gul', good: false },
      { word: 'Yulduz', art: 'yulduz', good: false },
      { word: 'Poyezd', art: 'poyezd', good: false }
    ].filter((x) => !x.word.toUpperCase().includes(targetLetter));
    const bank = [
      ...pickFreshBatch(`flash-g-${targetLetter}`, goodBank, 3, (x) => x.word),
      ...pickFreshBatch(`flash-b-${targetLetter}`, badBank, 3, (x) => x.word)
    ];

    modalBody.innerHTML = `
      <div class="edu-hud">
        <span>Tungi fonar ovi</span>
        <span class="edu-hud-pill" id="fl-hud">Topildi: 0 / 3</span>
      </div>
      <div class="edu-banner">
        Fonarni qoronğida yurgizing va <strong>"${targetLetter} ${targetLetter.toLowerCase()}"</strong> harfli 3 ta rasmni topib bosing!
      </div>
    `;

    const { canvas, ctx, w, h, getXY } = mountCanvasStage(310);
    const particles = [];
    let found = 0;

    const objs = shuffle(bank).map((o, idx) => ({
      ...o,
      x: w * (0.17 + (idx % 3) * 0.33),
      y: h * (0.28 + Math.floor(idx / 3) * 0.44),
      r: 46,
      done: false,
      shake: 0,
      phase: idx
    }));

    let lightX = w / 2;
    let lightY = h / 2;

    const onMove = (e) => {
      const pt = getXY(e);
      lightX = pt.x;
      lightY = pt.y;
    };

    const onTap = (e) => {
      const pt = getXY(e);
      lightX = pt.x;
      lightY = pt.y;
      for (const o of objs) {
        if (o.done) continue;
        if (Math.hypot(pt.x - o.x, pt.y - o.y) < o.r + 10) {
          if (o.good) {
            o.done = true;
            found++;
            addStar(1);
            playSound('good');
            spawnParticles(particles, o.x, o.y, '#ffd166', 22);
            const hud = modalBody.querySelector('#fl-hud');
            if (hud) hud.textContent = `Topildi: ${found} / 3`;
            if (found >= 3) {
              gameTimeout(() => showVictory('Fonar qahramoni!', `Tungi vodiydagi barcha "${targetLetter}" harfli rasmlarni topdingiz!`), 1150);
            }
          } else {
            o.shake = 1;
            playSound('bad');
          }
          break;
        }
      }
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onTap);

    let raf = 0;
    const tick = (now) => {
      const t = now * 0.001;
      ctx.clearRect(0, 0, w, h);
      drawCoverBg(ctx, w, h, 'valley', 0.22);

      for (const o of objs) {
        o.shake *= 0.85;
        const ox = o.x + Math.sin(t * 45) * o.shake * 7;
        ctx.save();
        if (o.done) ctx.globalAlpha = 0.25;
        drawIllustration(ctx, o.art, ox, o.y - 10, 62, t + o.phase, '#ff8fab');
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 14px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(o.word, ox, o.y + 32);
        ctx.restore();
      }

      ctx.save();
      const beam = ctx.createRadialGradient(lightX, lightY, 22, lightX, lightY, 130);
      beam.addColorStop(0, 'rgba(6, 8, 14, 0)');
      beam.addColorStop(0.55, 'rgba(6, 8, 14, 0.35)');
      beam.addColorStop(1, 'rgba(6, 8, 14, 0.92)');
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lightX, lightY, 92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      updateAndDrawParticles(ctx, particles);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    activeCleanup = () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onTap);
    };
  }

  // ── 3. FULL 29-LETTER INTERACTIVE TRACING STUDIO ─────────────────────────
  function gameLetterTrace(cfg = {}) {
    const all29Upper = UZ_ALPHABET.map((l) => l.upper);
    let queue;
    if (cfg.letters && cfg.letters.length <= 2) {
      queue = [...cfg.letters];
    } else if (cfg.startLetter && all29Upper.includes(cfg.startLetter)) {
      queue = [cfg.startLetter, ...pickFreshBatch('letter-trace-29', all29Upper.filter((x) => x !== cfg.startLetter), 4, (x) => x)];
    } else {
      queue = pickFreshBatch('letter-trace-29', all29Upper, 5, (x) => x);
    }
    let idx = 0;
    let useLower = false;
    const tracedDone = new Set();

    function loadTrace() {
      clearActiveGame();
      if (idx >= queue.length) {
        showVictory('Mohir xattot!', 'Barcha tanlangan harflarni çiroyli yozişni örganib oldingiz!');
        return;
      }
      const rawCh = queue[idx];
      const alphaMatch = UZ_ALPHABET.find((a) => a.upper === rawCh || a.lower === rawCh) || UZ_ALPHABET[0];
      const ch = alphaMatch.type === 'belgi' ? 'ʼ' : (useLower ? alphaMatch.lower : alphaMatch.upper);
      const traceWord = alphaMatch.example;
      const traceArt = alphaMatch.art;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>${String(alphaMatch.num).padStart(2, '0')} / 29 · Navbat ${idx + 1}/${queue.length}</span>
          <span class="edu-hud-pill" id="trace-pct">Bajarildi: 0%</span>
        </div>
        <div class="edu-banner">
          ${alphaMatch.type === 'belgi'
            ? 'Tutuq belgisi <strong>"ʼ"</strong> ustidan qalam bilan yurgizing'
            : `<strong>"${ch}"</strong> harfi ustidan qalam bilan yurgizing`} (${traceWord})
        </div>
        <div class="edu-trace-row">
          <div class="edu-trace-side" id="trace-art-box"></div>
        </div>
      `;

      const sideBox = modalBody.querySelector('#trace-art-box');
      const artC = document.createElement('canvas');
      artC.width = 130;
      artC.height = 130;
      sideBox.appendChild(artC);
      const artCtx = artC.getContext('2d');

      const { wrap, canvas, ctx, w, h, getXY } = mountCanvasStage(225);
      wrap.style.flex = '1';
      modalBody.querySelector('.edu-trace-row').prepend(wrap);

      const ctrl = document.createElement('div');
      ctrl.className = 'edu-inline-actions';
      ctrl.innerHTML = `
        <button type="button" class="pill-btn" id="trace-case">${useLower ? 'Katta (A)' : 'Kiçik (a)'}</button>
        <button type="button" class="pill-btn" id="trace-clear">Tozalaş</button>
        <button type="button" class="edu-btn-primary" id="trace-next">${idx + 1 >= queue.length ? 'Yakunlaş ★' : 'Keyingi harf →'}</button>
      `;
      modalBody.appendChild(ctrl);

      // Interactive 29-letter selector strip so ALL 29 letters (A..Z + ʼ) can be traced!
      const picker = document.createElement('div');
      picker.className = 'edu-trace-picker';
      picker.innerHTML = UZ_ALPHABET.map((l) => `
        <button type="button" class="edu-trace-pill ${l.upper === alphaMatch.upper ? 'is-active' : ''} ${tracedDone.has(l.upper) ? 'is-done' : ''}" data-u="${l.upper}" title="${l.num}. ${l.example}">
          ${l.upper}
        </button>
      `).join('');
      modalBody.appendChild(picker);

      picker.querySelectorAll('.edu-trace-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pickedU = btn.dataset.u;
          queue[idx] = pickedU;
          loadTrace();
        });
      });

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = Math.round(w);
      maskCanvas.height = Math.round(h);
      const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      mCtx.fillStyle = '#000';
      mCtx.fillRect(0, 0, w, h);
      mCtx.fillStyle = '#fff';
      mCtx.font = `700 ${Math.round(h * 0.72)}px "Nunito", ui-sans-serif, sans-serif`;
      mCtx.textAlign = 'center';
      mCtx.textBaseline = 'middle';
      mCtx.fillText(ch, w / 2, h / 2 + 8);
      const imgData = mCtx.getImageData(0, 0, Math.round(w), Math.round(h)).data;

      const checkpoints = [];
      for (let py = 12; py < h - 12; py += 14) {
        for (let px = 12; px < w - 12; px += 14) {
          const offset = (Math.round(py) * Math.round(w) + Math.round(px)) * 4;
          if (imgData[offset] > 128) checkpoints.push({ x: px, y: py, hit: false });
        }
      }

      const strokes = [];
      const particles = [];
      let drawing = false;
      let currPath = [];
      let completed = false;

      const updatePct = () => {
        const hitCount = checkpoints.filter((c) => c.hit).length;
        const pct = Math.min(100, Math.round((hitCount / Math.max(1, checkpoints.length * 0.70)) * 100));
        const pctEl = modalBody.querySelector('#trace-pct');
        if (pctEl) pctEl.textContent = `Bajarildi: ${pct}%`;
        if (pct >= 100 && !completed) {
          completed = true;
          tracedDone.add(alphaMatch.upper);
          addStar(1);
          playSound('good');
          spawnParticles(particles, w / 2, h / 2, '#5eead4', 28);
          const pill = picker.querySelector(`[data-u="${alphaMatch.upper}"]`);
          if (pill) pill.classList.add('is-done');
        }
      };

      const paintAt = (pt) => {
        currPath.push(pt);
        for (const cp of checkpoints) {
          if (!cp.hit && Math.hypot(cp.x - pt.x, cp.y - pt.y) < 25) cp.hit = true;
        }
        if (Math.random() < 0.35) {
          particles.push({ x: pt.x, y: pt.y, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2, life: 0.9, color: '#5eead4', r: 2.5 });
        }
        updatePct();
      };

      const onDown = (e) => { e.preventDefault(); drawing = true; currPath = []; strokes.push(currPath); paintAt(getXY(e)); playSound('tap'); };
      const onMove = (e) => { if (!drawing) return; e.preventDefault(); paintAt(getXY(e)); };
      const onUp = () => { drawing = false; };

      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);

      ctrl.querySelector('#trace-case').addEventListener('click', () => {
        useLower = !useLower;
        loadTrace();
      });
      ctrl.querySelector('#trace-clear').addEventListener('click', () => {
        strokes.length = 0;
        checkpoints.forEach((c) => (c.hit = false));
        completed = false;
        updatePct();
      });
      ctrl.querySelector('#trace-next').addEventListener('click', () => { idx++; loadTrace(); });

      const dpr = Math.min(window.devicePixelRatio || 1, isLowEndDevice() ? 1 : 1.5);
      const bgBuf = document.createElement('canvas');
      bgBuf.width = canvas.width;
      bgBuf.height = canvas.height;
      const bgCtx = bgBuf.getContext('2d');
      let cachedCompleted = null;

      function rebuildBg(isComp) {
        cachedCompleted = isComp;
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bgCtx.clearRect(0, 0, w, h);
        drawCoverBg(bgCtx, w, h, 'prism', 0.42);

        bgCtx.strokeStyle = 'rgba(255,255,255,0.10)';
        bgCtx.setLineDash([6, 6]);
        [h * 0.25, h * 0.5, h * 0.78].forEach((ly) => {
          bgCtx.beginPath(); bgCtx.moveTo(16, ly); bgCtx.lineTo(w - 16, ly); bgCtx.stroke();
        });
        bgCtx.setLineDash([]);

        bgCtx.font = `700 ${Math.round(h * 0.72)}px "Nunito", ui-sans-serif, sans-serif`;
        bgCtx.textAlign = 'center';
        bgCtx.textBaseline = 'middle';
        bgCtx.fillStyle = 'rgba(255,255,255,0.12)';
        bgCtx.fillText(ch, w / 2, h / 2 + 8);
        bgCtx.strokeStyle = isComp ? 'rgba(94,234,212,0.8)' : 'rgba(255,255,255,0.35)';
        bgCtx.lineWidth = 2;
        bgCtx.setLineDash([5, 5]);
        bgCtx.strokeText(ch, w / 2, h / 2 + 8);
        bgCtx.setLineDash([]);
      }
      rebuildBg(false);

      let raf = 0;
      let lastArtMs = 0;
      const tick = (now) => {
        const t = now * 0.001;
        if (now - lastArtMs >= 50) {
          lastArtMs = now;
          artCtx.clearRect(0, 0, 130, 130);
          drawIllustration(artCtx, traceArt, 65, 55, 86, t, item.accent);
          artCtx.fillStyle = isDayMode() ? '#0f172a' : '#ffffff';
          artCtx.font = '600 13px "Nunito", sans-serif';
          artCtx.textAlign = 'center';
          artCtx.fillText(traceWord, 65, 118);
        }

        if (cachedCompleted !== completed) rebuildBg(completed);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(bgBuf, 0, 0, w, h);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 18;
        ctx.strokeStyle = completed ? '#5eead4' : '#68b5ff';
        for (const s of strokes) {
          if (s.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(s[0].x, s[0].y);
          for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
          ctx.stroke();
        }

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      activeCleanup = () => {
        cancelAnimationFrame(raf);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
    }
    loadTrace();
  }

  // ── 4. DUCK POND (Ö ö — Twilight Valley Pond) ────────────────────────────
  function gameDuckPond() {
    clearActiveGame();
    let caught = 0;
    const goal = 5;

    modalBody.innerHTML = `
      <div class="edu-hud">
        <span>Köl öyini</span>
        <span class="edu-hud-pill" id="duck-hud">Uyasida: 0 / ${goal}</span>
      </div>
      <div class="edu-banner">Köldagi faqat <strong>"Ö / ö"</strong> harfi yozilgan ördakçalarni bosing!</div>
    `;

    const { canvas, ctx, w, h, getXY } = mountCanvasStage(310);
    const particles = [];
    const ripples = [];

    const goodPool = pickFreshBatch('duck-good', ['Ö', 'ö', 'Ördak', 'Öt', 'Qözi', 'Öqiş', 'Qöşiş', 'Tört', 'Jöja'], 6, (x) => x);
    const badPool = pickFreshBatch('duck-bad', ['O', 'U', 'Olma', 'Uy', 'Anor', 'Şar', 'Çoy', 'Ğoz'], 6, (x) => x);

    const makeDuck = (isTarget) => {
      const dir = Math.random() < 0.5 ? 1 : -1;
      return {
        x: dir > 0 ? -40 : w + 40,
        y: randInt(95, h - 50),
        vx: dir * (0.45 + Math.random() * 0.45),
        dir,
        good: isTarget,
        label: isTarget ? goodPool[randInt(0, goodPool.length - 1)] : badPool[randInt(0, badPool.length - 1)],
        r: 34,
        phase: Math.random() * 6
      };
    };

    const ducks = [makeDuck(true), makeDuck(false), makeDuck(true), makeDuck(false), makeDuck(true)];

    let raf = 0;
    let prevNow = 0;
    const tick = (now) => {
      const dtScale = prevNow ? Math.min(2.5, Math.max(0.25, (now - prevNow) / 16.6667)) : 1;
      prevNow = now;
      const t = now * 0.001;
      ctx.clearRect(0, 0, w, h);
      drawCoverBg(ctx, w, h, 'valley', 0.25);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 1.0 * dtScale;
        rp.a -= 0.02 * dtScale;
        if (rp.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = hexAlpha(rp.col, rp.a);
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < ducks.length; i++) {
        const d = ducks[i];
        d.x += d.vx * dtScale;
        if (d.dir > 0 && d.x > w + 65) ducks[i] = makeDuck(Math.random() < 0.58);
        else if (d.dir < 0 && d.x < -65) ducks[i] = makeDuck(Math.random() < 0.58);

        drawDuck(ctx, d.x, d.y, d.r, d.dir, t + d.phase);

        ctx.fillStyle = 'rgba(20, 24, 38, 0.72)';
        ctx.strokeStyle = 'rgba(255,255,255,0.38)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, d.x - 28, d.y - 54, 56, 26, 999);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 13px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.label, d.x, d.y - 41);
      }

      updateAndDrawParticles(ctx, particles);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onTap = (e) => {
      const pt = getXY(e);
      ripples.push({ x: pt.x, y: pt.y, r: 8, a: 0.9, col: '#5eead4' });
      for (let i = ducks.length - 1; i >= 0; i--) {
        const d = ducks[i];
        if (Math.hypot(pt.x - d.x, pt.y - (d.y - 12)) < 48) {
          if (d.good) {
            caught++;
            addStar(1);
            playSound('note', caught);
            spawnParticles(particles, d.x, d.y, '#ffd166', 18);
            ducks[i] = makeDuck(true);
            const hud = modalBody.querySelector('#duck-hud');
            if (hud) hud.textContent = `Uyasida: ${caught} / ${goal}`;
            if (caught >= goal) {
              gameTimeout(() => showVictory('Ördakçalar uyasida!', 'Barcha Ö harfli ördakçalarni töğri topdingiz!'), 1150);
            }
          } else {
            playSound('bad');
            spawnParticles(particles, d.x, d.y, '#ff8fab', 10);
            d.vx = -d.vx;
            d.dir *= -1;
          }
          break;
        }
      }
    };
    canvas.addEventListener('pointerdown', onTap);
    activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
  }

  // ── 5. MUSICAL LIQUID-GLASS XYLOPHONE (Vowels A E I O U Ö) ───────────────
  function gameXylophoneNotes() {
    const allBank = [
      { w: '_LMA', a: 'O', art: 'olma' },
      { w: '_RDAK', a: 'Ö', art: 'ordak' },
      { w: '_NOR', a: 'A', art: 'olma' },
      { w: 'Q_ZI', a: 'Ö', art: 'qozi' },
      { w: 'G_L', a: 'U', art: 'gul' },
      { w: '_ŞIK', a: 'E', art: 'kitob' },
      { w: 'K_TOB', a: 'I', art: 'kitob' },
      { w: 'Ş_R', a: 'A', art: 'sar' },
      { w: 'Ş_R', a: 'I', art: 'sir' },
      { w: 'T_Ğ', a: 'O', art: 'tog' },
      { w: 'YULD_Z', a: 'U', art: 'yulduz' },
      { w: '_LAK', a: 'E', art: 'tarozi' }
    ];
    const bank = pickFreshBatch('xylophone', allBank, 5, (x) => `${x.w}:${x.a}`);
    const bars = [
      { l: 'A', col: '#ff8fab', note: 0 },
      { l: 'E', col: '#ffd166', note: 1 },
      { l: 'I', col: '#5eead4', note: 2 },
      { l: 'O', col: '#68b5ff', note: 3 },
      { l: 'U', col: '#a78bfa', note: 4 },
      { l: 'Ö', col: '#56ccf2', note: 5 }
    ];
    let idx = 0;

    function nextSong() {
      clearActiveGame();
      if (idx >= bank.length) {
        showVictory('Musiqiy ustoz!', 'Unli harflarni suyuq şisha ksilofonda bexato çaldingiz!');
        return;
      }
      const q = bank[idx];
      idx++;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Ksilofon ${idx} / ${bank.length}</span>
          <span class="edu-hud-pill">Unli tovuşni çaling!</span>
        </div>
        <div class="edu-word-card">
          <canvas id="xy-art" width="76" height="76"></canvas>
          <div class="edu-word-card-text">${q.w}</div>
        </div>
      `;
      const xCtx = modalBody.querySelector('#xy-art').getContext('2d');
      drawIllustration(xCtx, q.art, 38, 38, 62, 0.3, '#56ccf2');

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(220);
      const particles = [];
      let solved = false;
      const barRects = bars.map((b, i) => ({
        ...b,
        x: w * 0.08 + i * ((w * 0.84) / bars.length) + 4,
        y: 26 + i * 6,
        bw: (w * 0.84) / bars.length - 8,
        bh: h - 52 - i * 10,
        glow: 0
      }));

      let raf = 0;
      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'aurora', 0.40);

        for (const br of barRects) {
          br.glow *= 0.94;
          ctx.save();
          ctx.fillStyle = hexAlpha(br.col, 0.24 + br.glow * 0.45);
          ctx.strokeStyle = br.glow > 0.1 ? '#ffffff' : hexAlpha(br.col, 0.75);
          ctx.lineWidth = 2;
          roundRect(ctx, br.x, br.y, br.bw, br.bh, 14);
          ctx.fill();
          ctx.stroke();

          // Glossy top pearl dot
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.beginPath();
          ctx.arc(br.x + br.bw / 2, br.y + 18, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 26px "Nunito", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(br.l, br.x + br.bw / 2, br.y + br.bh / 2 + 8);
          ctx.restore();
        }
        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        if (solved) return;
        const pt = getXY(e);
        for (const br of barRects) {
          if (pt.x >= br.x && pt.x <= br.x + br.bw && pt.y >= br.y && pt.y <= br.y + br.bh) {
            br.glow = 1;
            playSound('note', br.note);
            if (br.l === q.a) {
              solved = true;
              addStar(1);
              playSound('good');
              spawnParticles(particles, br.x + br.bw / 2, br.y + br.bh / 2, '#5eead4', 24);
              const tEl = modalBody.querySelector('.edu-word-card-text');
              if (tEl) tEl.innerHTML = q.w.replace('_', `<span style="color:#5eead4">${q.a}</span>`);
              gameTimeout(nextSong, 1250);
            } else {
              playSound('bad');
              spawnParticles(particles, br.x + br.bw / 2, br.y + br.bh / 2, '#ff8fab', 10);
            }
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);
      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    nextSong();
  }

  // ── 6. ANIMATED FREIGHT TRAIN LOADER (Skip Counting & Sequence) ──────────
  function gameTrainBuilder() {
    const steps = [2, 3, 5, 10];
    const seqs = Array.from({ length: 4 }, () =>
      pickFreshMath('train-seq', () => {
        const step = steps[randInt(0, steps.length - 1)];
        const start = step === 10 ? randInt(1, 5) * 10 : step * randInt(1, 5);
        const holeIdx = randInt(1, 3);
        const vals = [start, start + step, start + step * 2, start + step * 3];
        const ans = vals[holeIdx];
        const cars = vals.map((v, idx) => (idx === holeIdx ? null : v));
        return { step, cars, ans };
      }, (s) => `${s.step}:${s.cars.join(',')}`)
    );
    let idx = 0;

    function nextTrain() {
      clearActiveGame();
      if (idx >= seqs.length) {
        showVictory('Poyezd maşinisti!', 'Barcha raqamli vagonlarni töğri yuklab manzilga yetkazdingiz!');
        return;
      }
      const cur = seqs[idx];
      idx++;
      const opts = makeChoices(cur.ans, [cur.ans - cur.step, cur.ans + cur.step, cur.ans + 2, cur.ans - 1].filter((x) => x > 0 && x !== cur.ans));

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Poyezd ${idx} / ${seqs.length}</span>
          <span class="edu-hud-pill">Qadam: +${cur.step}</span>
        </div>
        <div class="edu-banner">Böş vagonga qaysi sonli yuk töğri keladi?</div>
      `;

      const { canvas, ctx, w, h } = mountCanvasStage(210);
      const row = document.createElement('div');
      row.className = 'edu-options';
      row.innerHTML = opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('');
      modalBody.appendChild(row);

      const particles = [];
      let trainOffset = 0;
      let loaded = false;
      let locked = false;
      let raf = 0;
      let prevNow = 0;

      const tick = (now) => {
        const dtScale = prevNow ? Math.min(2.5, Math.max(0.25, (now - prevNow) / 16.6667)) : 1;
        prevNow = now;
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'valley', 0.30);

        if (loaded) trainOffset += 2.6 * dtScale;

        // Rails
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(0, h - 38, w, 4);

        // Draw locomotive + 4 glass cars (responsive scale on phones)
        const sc = Math.min(1, (w - 28) / 520);
        const startX = Math.max(42, 62 * sc);
        const carW = Math.round(88 * sc);
        const stepX = Math.round(104 * sc);
        const firstCarX = startX + Math.round(62 * sc);

        ctx.save();
        ctx.translate(trainOffset, 0);
        drawIllustration(ctx, 'poyezd', startX, h - 78, Math.round(84 * sc), t, '#ff8fab');

        cur.cars.forEach((val, ci) => {
          const cx = firstCarX + ci * stepX;
          const cy = h - 102;
          const isHole = val === null;
          ctx.fillStyle = isHole && !loaded ? 'rgba(255,209,102,0.22)' : 'rgba(255,255,255,0.16)';
          ctx.strokeStyle = isHole && !loaded ? '#ffd166' : 'rgba(255,255,255,0.35)';
          ctx.lineWidth = 2;
          roundRect(ctx, cx, cy, carW, 56, 12);
          ctx.fill();
          ctx.stroke();

          // Wheels
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + carW * 0.25, h - 42, Math.max(6.5, 9 * sc), 0, Math.PI * 2);
          ctx.arc(cx + carW * 0.75, h - 42, Math.max(6.5, 9 * sc), 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isHole && loaded ? '#5eead4' : '#ffffff';
          ctx.font = `700 ${Math.round(Math.max(16, 22 * sc))}px "Nunito", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(isHole ? (loaded ? String(cur.ans) : '?') : String(val), cx + carW / 2, cy + 28);
        });
        ctx.restore();

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      row.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (Number(btn.dataset.v) === cur.ans) {
            loaded = true;
            btn.classList.add('is-correct');
            addStar(1);
            playSound('good');
            spawnParticles(particles, w / 2, h / 2, '#5eead4', 26);
            gameTimeout(nextTrain, 1550);
          } else {
            btn.classList.add('is-wrong');
            playSound('bad');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 950);
          }
        });
      });

      activeCleanup = () => cancelAnimationFrame(raf);
    }
    nextTrain();
  }

  // ── 7. FEED THE LION ADDITION (Şir Ziyofati — Tap apples & Sum!) ──────────
  function gameLionFeeder() {
    let roundIdx = 0;
    const totalRounds = 4;

    function nextMeal() {
      clearActiveGame();
      if (roundIdx >= totalRounds) {
        showVictory('Mehribon hisobçi!', 'Şirga barcha olmalarni sanab berdingiz va jami sonini töğri topdingiz!');
        return;
      }
      roundIdx++;
      const pair = pickFreshMath('lion-meal', () => ({ a: randInt(2, 5), b: randInt(1, 5) }), (p) => `${p.a}+${p.b}`);
      const a = pair.a;
      const b = pair.b;
      const ans = a + b;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Ziyofat ${roundIdx} / ${totalRounds}</span>
          <span class="edu-hud-pill" id="lion-hud">Berildi: 0 / ${ans}</span>
        </div>
        <div class="edu-banner" id="lion-ban">
          Şirga avval <strong>${a}</strong> ta, söng yana <strong>${b}</strong> ta olma bosing (<strong>${a} + ${b}</strong>)!
        </div>
      `;

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(235);
      const ansRow = document.createElement('div');
      ansRow.className = 'edu-options';
      ansRow.style.opacity = '0.35';
      const opts = makeChoices(ans, [ans - 2, ans - 1, ans + 1, ans + 2].filter((x) => x > 0 && x !== ans));
      ansRow.innerHTML = opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('');
      modalBody.appendChild(ansRow);

      const particles = [];
      let fed = 0;
      let lionScale = 1;
      const lionX = w - Math.min(108, Math.max(66, w * 0.22));
      const appleZoneW = Math.max(150, lionX - 88);
      const cols = w < 420 ? 4 : 5;
      const colStep = appleZoneW / Math.max(1, cols - 1);
      const appleR = w < 420 ? 15 : 19;
      const apples = Array.from({ length: a + b }, (_, i) => ({
        x: 38 + (i % cols) * colStep,
        y: 56 + Math.floor(i / cols) * 62,
        taken: false,
        phase: i * 0.5
      }));

      let raf = 0;
      const tick = (now) => {
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'valley', 0.30);

        lionScale += (1 - lionScale) * 0.08;
        ctx.save();
        ctx.translate(lionX, h / 2 + 10);
        ctx.scale(lionScale, lionScale);
        drawIllustration(ctx, 'sir', 0, 0, Math.min(128, w * 0.28), t, '#ffd166');
        ctx.restore();

        for (const ap of apples) {
          if (ap.taken) continue;
          drawApple(ctx, ap.x, ap.y + Math.sin(t * 1.3 + ap.phase) * 2.5, appleR, t + ap.phase);
        }

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        if (fed >= ans) return;
        const pt = getXY(e);
        for (const ap of apples) {
          if (ap.taken) continue;
          if (Math.hypot(pt.x - ap.x, pt.y - ap.y) < 30) {
            ap.taken = true;
            fed++;
            lionScale = 1.18;
            playSound('note', fed);
            spawnParticles(particles, lionX, h / 2, '#ffd166', 14);
            const hud = modalBody.querySelector('#lion-hud');
            if (hud) hud.textContent = `Berildi: ${fed} / ${ans}`;
            if (fed >= ans) {
              ansRow.style.opacity = '1';
              const ban = modalBody.querySelector('#lion-ban');
              if (ban) ban.innerHTML = `Endi Şir jami neçta olma yeganini tanlang: <strong>${a} + ${b} = ?</strong>`;
            }
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);

      let locked = false;
      ansRow.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (fed < ans || locked) return;
          locked = true;
          if (Number(btn.dataset.v) === ans) {
            btn.classList.add('is-correct');
            addStar(1);
            playSound('good');
            gameTimeout(nextMeal, 1250);
          } else {
            btn.classList.add('is-wrong');
            playSound('bad');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 950);
          }
        });
      });

      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    nextMeal();
  }

  // ── 8. 29-LETTER INTERACTIVE ALPHABET STUDIO (+ PvP Target Finder) ────────
  function gameAlphabetBoard() {
    clearActiveGame();
    let selected = UZ_ALPHABET.find((l) => l.upper === 'Ç') || UZ_ALPHABET[0];
    const challengeQueue = pickFreshBatch('alpha-board-q', UZ_ALPHABET, 5, (l) => l.upper);
    let qIdx = 0;
    let feedbackMsg = '';

    const render = () => {
      if (qIdx >= challengeQueue.length) {
        showVictory('Alifbo bilimdoni!', '29 ta harf içidan barcha söralgan harflarni aniq topdingiz!');
        return;
      }
      const target = challengeQueue[qIdx];
      const displayGlyph = selected.type === 'belgi' ? selected.upper : `${selected.upper} ${selected.lower}`;
      modalBody.innerHTML = `
        <div class="edu-alpha-wrap">
          <div class="edu-board-challenge">
            <span>🎯 Topiş (${qIdx + 1}/${challengeQueue.length}): <strong>«${target.example}»</strong> sözidagi <strong>${target.num}. "${target.upper}"</strong> ni jadvaldan bosing!</span>
            <small>${feedbackMsg || 'Töğri harf +1 ★'}</small>
          </div>
          <div class="edu-alpha-hero">
            <canvas id="alpha-art" width="90" height="90" class="edu-alpha-art"></canvas>
            <div class="edu-alpha-big">${displayGlyph}</div>
            <div class="edu-alpha-info">
              <div class="edu-alpha-word">${String(selected.num).padStart(2, '0')}. ${selected.example}</div>
              <div class="edu-alpha-note">${selected.hint}${selected.old ? ` <span class="edu-badge">${selected.type === 'belgi' ? 'Belgi' : 'Yangi harf'}</span>` : ''}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="pill-btn" id="edu-trace-this">Yozib kör →</button>
              <button type="button" class="edu-btn-primary" id="edu-start-quiz">Şar ovi →</button>
            </div>
          </div>
          <div class="edu-alpha-grid">
            ${UZ_ALPHABET.map((l) => `
              <button type="button" class="edu-alpha-cell ${l.upper === selected.upper ? 'is-selected' : ''} ${l.type === 'yangi' || l.type === 'belgi' ? 'is-new' : ''}" data-u="${l.upper}">
                <span>${l.upper}</span><small>${l.type === 'belgi' ? '29' : l.lower}</small>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      const ac = modalBody.querySelector('#alpha-art').getContext('2d');
      drawIllustration(ac, selected.art, 45, 45, 72, 0.5, '#68b5ff');

      modalBody.querySelectorAll('.edu-alpha-cell').forEach((btn) => {
        btn.addEventListener('click', () => {
          playSound('tap');
          selected = UZ_ALPHABET.find((l) => l.upper === btn.dataset.u);
          if (selected && selected.upper === target.upper) {
            addStar(1);
            playSound('good');
            qIdx++;
            feedbackMsg = `✓ "${target.upper}" töğri!`;
          } else {
            feedbackMsg = `Hozir "${target.upper}" (${target.num}-örin) ni izlang!`;
          }
          render();
        });
      });
      modalBody.querySelector('#edu-trace-this').addEventListener('click', () => {
        playSound('tap');
        const seq = selected.upper === selected.lower ? [selected.upper] : [selected.upper, selected.lower];
        gameLetterTrace({ letters: seq });
      });
      modalBody.querySelector('#edu-start-quiz').addEventListener('click', () => {
        playSound('tap');
        gameBalloonPop({ mode: 'reformed' });
      });
    };
    render();
  }

  // ── 9. RISING BALLOON POP (Reformed & Tutuq ʼ Modes) ────────────────────
  function gameBalloonPop(cfg) {
    const tutuqBank = [
      { w: 'MA_NO', a: 'ʼ', art: 'kitob', pool: ['ʼ', 'Ğ', 'Ö', 'Ç', 'Ş'] },
      { w: 'A_LO', a: 'ʼ', art: 'yulduz', pool: ['ʼ', 'Ğ', 'Ö', 'Ç', 'Ş'] },
      { w: 'SAN_AT', a: 'ʼ', art: 'gul', pool: ['ʼ', 'G', 'O', 'Ç', 'Ş'] },
      { w: 'TA_LIM', a: 'ʼ', art: 'kitob', pool: ['ʼ', 'A', 'E', 'Ş', 'Ğ'] },
      { w: 'ŞE_R', a: 'ʼ', art: 'kitob', pool: ['ʼ', 'E', 'I', 'Ş', 'Ç'] },
      { w: 'ME_MOR', a: 'ʼ', art: 'tog', pool: ['ʼ', 'M', 'O', 'Ğ', 'Ö'] },
      { w: 'E_LON', a: 'ʼ', art: 'sar', pool: ['ʼ', 'L', 'O', 'Ç', 'Ş'] },
      { w: 'RA_NO', a: 'ʼ', art: 'gul', pool: ['ʼ', 'A', 'O', 'Ğ', 'Ş'] }
    ];
    const reformedBank = [
      { w: '_AR', a: 'Ş', art: 'sar', pool: ['Ş', 'Ç', 'Ö', 'Ğ', 'S'] },
      { w: '_OYNAK', a: 'Ç', art: 'coy', pool: ['Ç', 'Ş', 'C', 'Ğ', 'Ö'] },
      { w: '_RDAK', a: 'Ö', art: 'ordak', pool: ['Ö', 'O', 'Ş', 'Ğ', 'U'] },
      { w: 'TO_', a: 'Ğ', art: 'tog', pool: ['Ğ', 'G', 'Ş', 'Ç', 'Ö'] },
      { w: 'QUYO_', a: 'Ş', art: 'quyos', pool: ['Ş', 'S', 'Ç', 'Ğ', 'Ö'] },
      { w: '_OZ', a: 'Ğ', art: 'ordak', pool: ['Ğ', 'G', 'Q', 'Ç', 'Ş'] },
      { w: 'Q_ZI', a: 'Ö', art: 'qozi', pool: ['Ö', 'O', 'U', 'Ğ', 'Ş'] },
      { w: 'BO_', a: 'Ğ', art: 'olma', pool: ['Ğ', 'G', 'Q', 'Ç', 'Ö'] },
      { w: '_ANA', a: 'Ç', art: 'coy', pool: ['Ç', 'Ş', 'C', 'T', 'Ğ'] },
      { w: '_AMOL', a: 'Ş', art: 'sar', pool: ['Ş', 'S', 'Ç', 'Ğ', 'Ö'] },
      { w: 'MA_NO', a: 'ʼ', art: 'kitob', pool: ['ʼ', 'Ğ', 'Ö', 'Ç', 'Ş'] },
      { w: 'T_RT', a: 'Ö', art: 'tarozi', pool: ['Ö', 'O', 'U', 'A', 'Ğ'] }
    ];
    const sourceBank = cfg && cfg.mode === 'tutuq' ? tutuqBank : reformedBank;
    const bank = pickFreshBatch(`balloon-pop-${cfg?.mode || 'reformed'}`, sourceBank, 5, (x) => `${x.w}:${x.a}`);
    let roundIdx = 0;

    function playRound() {
      clearActiveGame();
      if (roundIdx >= bank.length) {
        showVictory('Şar qahramoni!', 'Barcha tuşib qolgan harf şarlarini aniq yordingiz!');
        return;
      }
      const q = bank[roundIdx];
      roundIdx++;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Şar ovi ${roundIdx} / ${bank.length}</span>
          <span class="edu-hud-pill">Töğri belgini yoring!</span>
        </div>
        <div class="edu-word-card">
          <canvas id="bp-art" width="76" height="76"></canvas>
          <div class="edu-word-card-text">${q.w}</div>
        </div>
      `;
      const bCtx = modalBody.querySelector('#bp-art').getContext('2d');
      drawIllustration(bCtx, q.art, 38, 38, 62, 0.3, item.accent);

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(250);
      const colors = ['#68b5ff', '#5eead4', '#ffd166', '#ff8fab'];
      const particles = [];

      const pool4 = makeChoices(q.a, q.pool.filter((x) => x !== q.a));
      const balloons = pool4.map((letter, idx) => ({
        letter,
        x: w * (0.16 + idx * 0.22),
        y: h + 30 + idx * 32,
        vy: 0.34 + Math.random() * 0.22,
        r: 34,
        color: colors[idx % colors.length],
        phase: idx * 1.4,
        dead: false
      }));

      let raf = 0;
      let prevNow = 0;
      let solved = false;
      const tick = (now) => {
        const dtScale = prevNow ? Math.min(2.5, Math.max(0.25, (now - prevNow) / 16.6667)) : 1;
        prevNow = now;
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'space', 0.25);

        for (const b of balloons) {
          if (b.dead) continue;
          b.y -= b.vy * dtScale;
          b.x += Math.sin(t * 1.1 + b.phase) * 0.22 * dtScale;
          if (b.y < -55) b.y = h + 55;
          drawBalloon(ctx, b.x, b.y, b.r, b.color, b.letter, t);
        }

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        if (solved) return;
        const pt = getXY(e);
        for (const b of balloons) {
          if (b.dead) continue;
          if (Math.hypot(pt.x - b.x, pt.y - b.y) < b.r * 1.15) {
            if (b.letter === q.a) {
              solved = true;
              b.dead = true;
              addStar(1);
              playSound('good');
              spawnParticles(particles, b.x, b.y, '#5eead4', 26);
              const wEl = modalBody.querySelector('.edu-word-card-text');
              if (wEl) wEl.innerHTML = q.w.replace('_', `<span style="color:#5eead4">${q.a}</span>`);
              gameTimeout(playRound, 1150);
            } else {
              b.dead = true;
              playSound('bad');
              spawnParticles(particles, b.x, b.y, '#ff8fab', 12);
            }
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);
      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    playRound();
  }

  // ── 10. ILLUSTRATED WORD BUILDER (Levels 1, 2 & School Starter 3) ─────────
  function gameWordBuilder(cfg) {
    const level1Pool = [
      { word: 'ŞAR', art: 'sar' }, { word: 'ŞIR', art: 'sir' }, { word: 'ÇOY', art: 'coy' },
      { word: 'TOĞ', art: 'tog' }, { word: 'ĞOZ', art: 'ordak' }, { word: 'GUL', art: 'gul' },
      { word: 'BOĞ', art: 'olma' }, { word: 'QOR', art: 'tog' }, { word: 'NON', art: 'quyos' },
      { word: 'ÖT', art: 'gul' }
    ];
    const level2Pool = [
      { word: 'QUYOŞ', art: 'quyos' }, { word: 'ÖRDAK', art: 'ordak' }, { word: 'ÇOYNAK', art: 'coy' },
      { word: 'QÖZI', art: 'qozi' }, { word: 'ŞAMOL', art: 'sar' }, { word: 'ÇIROQ', art: 'quyos' },
      { word: 'MAʼNO', art: 'kitob' }, { word: 'AʼLO', art: 'yulduz' }, { word: 'OLMA', art: 'olma' },
      { word: 'YULDUZ', art: 'yulduz' }
    ];
    const level3Pool = [
      { word: 'QALAM', art: 'kitob' }, { word: 'KITOB', art: 'kitob' }, { word: 'SUMKA', art: 'tarozi' },
      { word: 'MAKTAB', art: 'tog' }, { word: 'SOAT', art: 'quyos' }, { word: 'DAFTAR', art: 'kitob' },
      { word: 'RASM', art: 'gul' }, { word: 'DARS', art: 'yulduz' }, { word: 'POYEZD', art: 'poyezd' }
    ];
    const chosenPool = cfg.level === 1 ? level1Pool : cfg.level === 3 ? level3Pool : level2Pool;
    const bank = pickFreshBatch(`word-l${cfg.level || 2}`, chosenPool, 4, (x) => x.word);
    let roundIdx = 0;

    function nextWord() {
      clearActiveGame();
      if (roundIdx >= bank.length) {
        showVictory('Söz ustasi!', 'Rasmlarga qarab barcha sözlarni töğri tuzdingiz!');
        return;
      }
      const entry = bank[roundIdx];
      roundIdx++;
      const target = entry.word;
      const letters = shuffle(target.split('').map((ch, idx) => ({ ch, id: idx })));
      let built = [];

      const render = () => {
        const currentStr = built.map((b) => b.ch).join('');
        const isCorrect = currentStr === target;
        const isWrong = currentStr.length === target.length && !isCorrect;

        modalBody.innerHTML = `
          <div class="edu-hud">
            <span>Söz ${roundIdx} / ${bank.length}</span>
            <span class="edu-hud-pill">Harflarni tartibda tering</span>
          </div>
          <div style="display:flex;justify-content:center;margin:6px 0 12px;">
            <canvas id="wb-art" width="120" height="120"></canvas>
          </div>
          <div class="edu-slots">
            ${target.split('').map((_, i) => `<span class="edu-slot ${built[i] ? (isCorrect ? 'is-good' : isWrong ? 'is-bad' : 'is-filled') : ''}">${built[i] ? built[i].ch : ''}</span>`).join('')}
          </div>
          <div class="edu-letter-tray">
            ${letters.map((l) => {
              const used = built.some((b) => b.id === l.id);
              return `<button type="button" class="edu-tile-btn ${used ? 'is-used' : ''}" data-id="${l.id}" ${used ? 'disabled' : ''}>${l.ch}</button>`;
            }).join('')}
          </div>
          <div class="edu-feedback">
            ${isCorrect ? 'Barakalla! Töğri söz ✓' : isWrong ? 'Qaytadan urinib köring!' : '<button type="button" class="pill-btn" id="edu-clear">Tozalaş</button>'}
          </div>
        `;
        const wCtx = modalBody.querySelector('#wb-art').getContext('2d');
        drawIllustration(wCtx, entry.art, 60, 60, 96, isCorrect ? 1.2 : 0.2, item.accent);

        const clr = modalBody.querySelector('#edu-clear');
        if (clr) clr.addEventListener('click', () => { built = []; playSound('tap'); render(); });

        modalBody.querySelectorAll('.edu-tile-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (built.length >= target.length) return;
            const tile = letters.find((x) => x.id === Number(btn.dataset.id));
            if (!tile) return;
            built.push(tile);
            playSound('note', built.length);
            render();
            if (built.length === target.length) {
              if (built.map((b) => b.ch).join('') === target) {
                addStar(1);
                playSound('good');
                gameTimeout(nextWord, 1200);
              } else {
                playSound('bad');
                gameTimeout(() => { built = []; render(); }, 1150);
              }
            }
          });
        });
      };
      render();
    }
    nextWord();
  }

  // ── 11. ORCHARD APPLE BASKET & STAR GALAXY COUNTER ───────────────────────
  function gameAppleBasket(cfg) {
    const isTens = (cfg.max || 10) > 10;
    let roundIdx = 0;
    const totalRounds = 4;

    function nextRound() {
      clearActiveGame();
      if (roundIdx >= totalRounds) {
        showVictory('Sanoq ustasi!', 'Olmalar va yulduzlarni aniq sanab yiğdingiz!');
        return;
      }
      roundIdx++;
      const target = pickFreshMath(
        `basket-${isTens ? 20 : 10}`,
        () => (isTens ? randInt(11, 19) : randInt(2, 9)),
        String
      );
      const needMore = isTens ? target - 10 : target;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Sanoq ${roundIdx} / ${totalRounds}</span>
          <span class="edu-hud-pill" id="basket-hud">${isTens ? '10 + 0 = 10' : 'Savatda: 0'}</span>
        </div>
        <div class="edu-banner">
          ${isTens
            ? `Qutida <strong>10</strong> ta yulduz bor. Jami <strong>${target}</strong> ta bölişi uçun yulduzça qöşing!`
            : `Savatga roppa-rosa <strong>${target}</strong> ta olma soling!`}
        </div>
      `;

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(290);
      const ctrl = document.createElement('div');
      ctrl.className = 'edu-inline-actions';
      ctrl.innerHTML = `<button type="button" class="edu-btn-primary" id="basket-check">Tekşiriş ✓</button>`;
      modalBody.appendChild(ctrl);

      const particles = [];
      let collected = 0;
      const items = Array.from({ length: 10 }, (_, i) => ({
        idx: i,
        homeX: w * (0.16 + (i % 5) * 0.17),
        homeY: h * (0.22 + Math.floor(i / 5) * 0.22),
        x: w * (0.16 + (i % 5) * 0.17),
        y: h * (0.22 + Math.floor(i / 5) * 0.22),
        inBasket: false,
        phase: i * 0.6
      }));

      const basketX = w / 2;
      const basketY = h * 0.80;

      const updateHud = () => {
        const hud = modalBody.querySelector('#basket-hud');
        if (hud) hud.textContent = isTens ? `10 + ${collected} = ${10 + collected}` : `Savatda: ${collected}`;
      };

      let raf = 0;
      const tick = (now) => {
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, isTens ? 'space' : 'valley', 0.28);

        const basketW = Math.min(270, w - 24);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.strokeStyle = 'rgba(255,255,255,0.34)';
        ctx.lineWidth = 2;
        roundRect(ctx, basketX - basketW / 2, basketY - 34, basketW, 68, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 13px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isTens ? `10 ta yulduz + ${collected} ta` : `Savat: ${collected} ta olma`, basketX, basketY + 26);

        if (isTens) {
          for (let s = 0; s < 10; s++) {
            drawStar(ctx, basketX - basketW * 0.42 + (s % 5) * 18, basketY - 12 + Math.floor(s / 5) * 16, 6.5, '#5eead4');
          }
        }

        let bSlot = 0;
        for (const it of items) {
          const tx = it.inBasket
            ? (isTens ? basketX + 10 + (bSlot % 5) * 22 : basketX - basketW * 0.35 + (bSlot % 5) * (basketW * 0.165))
            : it.homeX;
          const ty = it.inBasket
            ? (isTens ? basketY - 10 + Math.floor(bSlot / 5) * 18 : basketY - 14 + Math.floor(bSlot / 5) * 20)
            : it.homeY + Math.sin(t * 1.2 + it.phase) * 2.5;
          if (it.inBasket) bSlot++;

          it.x += (tx - it.x) * 0.11;
          it.y += (ty - it.y) * 0.11;

          if (isTens) drawStar(ctx, it.x, it.y, it.inBasket ? 10 : 18, '#ffd166');
          else drawApple(ctx, it.x, it.y, it.inBasket ? 13 : 19, t + it.phase, it.inBasket);
        }

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        const pt = getXY(e);
        for (const it of items) {
          if (Math.hypot(pt.x - it.x, pt.y - it.y) < 28) {
            it.inBasket = !it.inBasket;
            collected = items.filter((x) => x.inBasket).length;
            playSound('note', collected);
            spawnParticles(particles, it.x, it.y, isTens ? '#ffd166' : '#5eead4', 10);
            updateHud();
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);

      ctrl.querySelector('#basket-check').addEventListener('click', () => {
        if (collected === needMore) {
          addStar(1);
          playSound('good');
          spawnParticles(particles, basketX, basketY, '#5eead4', 26);
          gameTimeout(nextRound, 1200);
        } else {
          playSound('bad');
          ctrl.querySelector('#basket-check').textContent = collected < needMore ? 'Yana qöşing!' : 'Biroz kamaytiring!';
          gameTimeout(() => {
            const btn = ctrl.querySelector('#basket-check');
            if (btn) btn.textContent = 'Tekşiriş ✓';
          }, 1500);
        }
      });

      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    nextRound();
  }

  // ── 12. FROG LILY-PAD SEQUENCE HOPPER ────────────────────────────────────
  function gameFrogHops(cfg) {
    let roundIdx = 0;
    const totalRounds = 3;

    function nextRound() {
      clearActiveGame();
      if (roundIdx >= totalRounds) {
        showVictory('Sakrovçi qahramon!', 'Barcha raqam yaproqlaridan adaşmay sakrab ötdingiz!');
        return;
      }
      roundIdx++;
      const pick = pickFreshMath(
        'frog-hop',
        () => {
          const step = cfg.step && cfg.step > 1 ? cfg.step : [1, 2, 3][randInt(0, 2)];
          const start = step === 1 ? randInt(1, 9) : randInt(1, 10);
          return { step, start };
        },
        (x) => `${x.start}+${x.step}`
      );
      const step = pick.step;
      const start = pick.start;
      const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
      const padsVal = shuffle(seq);

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Sakraş ${roundIdx} / ${totalRounds} · +${step}</span>
          <span class="edu-hud-pill" id="frog-next">Keyingi son: ${seq[0]}</span>
        </div>
        <div class="edu-banner">Qurbaqa ötişi uçun sonlarni <strong>kiçikdan kattaga (+${step})</strong> qarab bosing!</div>
      `;

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(290);
      const particles = [];
      let nextPtr = 0;

      const padR = Math.min(36, Math.max(24, Math.round(w * 0.082)));
      const pads = padsVal.map((val, i) => ({
        val,
        x: w * (0.14 + i * 0.18),
        y: h * (i % 2 === 0 ? 0.42 : 0.64),
        r: padR,
        done: false,
        shake: 0
      }));
      const frog = { x: 42, y: h * 0.82, tx: 42, ty: h * 0.82 };

      let raf = 0;
      const tick = (now) => {
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'valley', 0.28);

        for (const p of pads) {
          p.shake *= 0.88;
          const px = p.x + Math.sin(t * 32) * p.shake * 6;
          const py = p.y + Math.sin(t * 1.2 + p.x) * 2.5;
          ctx.fillStyle = p.done ? 'rgba(94,234,212,0.42)' : 'rgba(56,161,105,0.72)';
          ctx.strokeStyle = p.done ? '#ffffff' : 'rgba(255,255,255,0.38)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, p.r, 0.25, Math.PI * 2 - 0.25);
          ctx.lineTo(px, py);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 22px "Nunito", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(p.val), px, py);
        }

        frog.x += (frog.tx - frog.x) * 0.09;
        frog.y += (frog.ty - frog.y) * 0.09;
        drawIllustration(ctx, 'qurbaqa', frog.x, frog.y - 16, 48, t, '#5eead4');

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        const pt = getXY(e);
        for (const p of pads) {
          if (p.done) continue;
          if (Math.hypot(pt.x - p.x, pt.y - p.y) < p.r + 8) {
            if (p.val === seq[nextPtr]) {
              p.done = true;
              frog.tx = p.x;
              frog.ty = p.y;
              nextPtr++;
              addStar(1);
              playSound('note', nextPtr);
              spawnParticles(particles, p.x, p.y, '#5eead4', 16);
              const badge = modalBody.querySelector('#frog-next');
              if (badge) badge.textContent = nextPtr < seq.length ? `Keyingi son: ${seq[nextPtr]}` : 'Marra!';
              if (nextPtr >= seq.length) {
                playSound('good');
                gameTimeout(nextRound, 1250);
              }
            } else {
              p.shake = 1;
              playSound('bad');
            }
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);
      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    nextRound();
  }

  // ── 13. BALANCE SCALE (< = > & Make-10) ──────────────────────────────────
  function gameBalanceScale(cfg) {
    const isMakeTen = cfg.mode === 'maketen';
    let roundIdx = 0;
    const totalRounds = 4;

    function nextRound() {
      clearActiveGame();
      if (roundIdx >= totalRounds) {
        showVictory('Muvozanat ustasi!', 'Tarozini töğri hisoblab barobar qildingiz!');
        return;
      }
      roundIdx++;

      const vals = pickFreshMath(
        `scale-${isMakeTen ? '10' : 'cmp'}`,
        () => ({ l: isMakeTen ? 10 : randInt(1, 9), r: randInt(1, 9) }),
        (p) => `${p.l}:${p.r}`
      );
      const leftVal = vals.l;
      const rightValStart = vals.r;
      let addedVal = 0;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Tarozi ${roundIdx} / ${totalRounds}</span>
          <span class="edu-hud-pill">${isMakeTen ? `10 va ${rightValStart}` : `${leftVal} ? ${rightValStart}`}</span>
        </div>
        <div class="edu-banner">
          ${isMakeTen
            ? `Öng pallada <strong>${rightValStart}</strong> ta bor. <strong>10</strong> bölişi uçun neçta qöşiş kerak?`
            : `Çap va öng palladagi olmalarni soliştirib töğri belgini tanlang!`}
        </div>
      `;

      const { canvas, ctx, w, h } = mountCanvasStage(220);
      const particles = [];
      const choices = isMakeTen
        ? makeChoices(10 - rightValStart, [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== 10 - rightValStart))
        : ['<', '=', '>'];

      const row = document.createElement('div');
      row.className = 'edu-options';
      row.innerHTML = choices.map((c) => `<button type="button" class="edu-opt" data-v="${c}">${isMakeTen ? `+ ${c}` : c}</button>`).join('');
      modalBody.appendChild(row);

      let currTilt = 0;
      let locked = false;
      let raf = 0;

      const tick = (now) => {
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'prism', 0.36);

        const rightTotal = rightValStart + addedVal;
        const targetTilt = Math.max(-0.22, Math.min(0.22, (rightTotal - leftVal) * 0.045));
        currTilt += (targetTilt - currTilt) * 0.06;

        const sc = Math.min(1, (w - 24) / 360);
        const cx = w / 2;
        const py = 58;

        ctx.fillStyle = '#ffd166';
        ctx.fillRect(cx - 5 * sc, py, 10 * sc, 128);
        ctx.fillRect(cx - 55 * sc, py + 122, 110 * sc, 10);

        ctx.save();
        ctx.translate(cx, py + 8);
        ctx.rotate(currTilt);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-145 * sc, -4, 290 * sc, 8);

        [
          { px: -125 * sc, count: leftVal, col: '#68b5ff' },
          { px: 125 * sc, count: rightTotal, col: '#5eead4' }
        ].forEach((side) => {
          ctx.save();
          ctx.translate(side.px, 0);
          ctx.rotate(-currTilt);
          ctx.strokeStyle = 'rgba(255,255,255,0.55)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(-34 * sc, 72);
          ctx.moveTo(0, 0); ctx.lineTo(34 * sc, 72);
          ctx.stroke();

          ctx.fillStyle = hexAlpha(side.col, 0.72);
          ctx.beginPath();
          ctx.arc(0, 72, 42 * sc, 0, Math.PI);
          ctx.fill();

          for (let a = 0; a < side.count; a++) {
            drawApple(ctx, (-22 + (a % 4) * 14) * sc, 62 - Math.floor(a / 4) * 14 * sc, 6.5 * sc, t);
          }

          ctx.fillStyle = '#ffffff';
          ctx.font = `700 ${Math.round(Math.max(15, 18 * sc))}px "Nunito", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(String(side.count), 0, 26);
          ctx.restore();
        });
        ctx.restore();

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      row.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const v = btn.dataset.v;
          const ok = isMakeTen ? Number(v) === 10 - rightValStart : v === (leftVal < rightValStart ? '<' : leftVal > rightValStart ? '>' : '=');
          if (ok) {
            if (isMakeTen) addedVal = Number(v);
            btn.classList.add('is-correct');
            addStar(1);
            playSound('good');
            spawnParticles(particles, w / 2, 70, '#5eead4', 24);
            gameTimeout(nextRound, 1400);
          } else {
            btn.classList.add('is-wrong');
            playSound('bad');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 1000);
          }
        });
      });

      activeCleanup = () => cancelAnimationFrame(raf);
    }
    nextRound();
  }

  // ── 14. POP-TO-SUBTRACT & BUBBLE ADDITION ────────────────────────────────
  function gameBubbleMath(cfg) {
    const isSub = cfg.mode === 'sub';
    let roundIdx = 0;
    const totalRounds = 4;

    function nextRound() {
      clearActiveGame();
      if (roundIdx >= totalRounds) {
        showVictory('Hisob donosi!', isSub ? 'Şarçalarni yorib ayirişni juda yaxşi bajardingiz!' : 'Pufakçalarni birlaştirib töğri javob topdingiz!');
        return;
      }
      roundIdx++;

      const maxV = cfg.maxVal || 20;
      const calc = pickFreshMath(
        `bubble-${isSub ? 'sub' : 'add'}-${maxV}`,
        () => {
          if (isSub) {
            const aa = maxV <= 10 ? randInt(5, 10) : randInt(11, 18);
            const bb = randInt(2, Math.min(8, aa - 1));
            return { a: aa, b: bb, ans: aa - bb };
          }
          const aa = randInt(4, 9);
          const bb = randInt(Math.max(2, 11 - aa), 9);
          return { a: aa, b: bb, ans: aa + bb };
        },
        (p) => `${p.a}:${p.b}`
      );
      const a = calc.a;
      const b = calc.b;
      const ans = calc.ans;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Misol ${roundIdx} / ${totalRounds}</span>
          <span class="edu-hud-pill" id="bm-hud">${isSub ? `Yoriş: 0 / ${b}` : `${a} + ${b} = ?`}</span>
        </div>
        <div class="edu-banner" id="bm-banner">
          ${isSub
            ? `<strong>${a} − ${b}</strong>: Avval <strong>${b}</strong> ta şarçani bosing (yoring)!`
            : `<strong>${a} + ${b}</strong>: Kök va sariq şarçalarni sanab javobni bosing!`}
        </div>
      `;

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(230);
      const ansRow = document.createElement('div');
      ansRow.className = 'edu-options';
      const opts = makeChoices(ans, [ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter((x) => x >= 0 && x !== ans));
      ansRow.innerHTML = opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('');
      if (isSub) ansRow.style.opacity = '0.35';
      modalBody.appendChild(ansRow);

      const particles = [];
      let poppedCount = 0;
      let phaseReady = !isSub;

      const balls = [];
      if (isSub) {
        const cols = Math.min(a, w < 420 ? 5 : 6);
        const subStep = Math.min(58, (w - 56) / Math.max(1, cols));
        const subR = w < 420 ? 18 : 22;
        for (let i = 0; i < a; i++) {
          balls.push({
            x: w / 2 - ((Math.min(cols, a) - 1) * subStep) / 2 + (i % cols) * subStep,
            y: 62 + Math.floor(i / cols) * 60,
            r: subR,
            color: '#5eead4',
            popped: false,
            phase: i * 0.5
          });
        }
      } else {
        const addR = w < 420 ? 13 : 17;
        const leftCols = Math.min(a, w < 440 ? 3 : 5);
        const rightCols = Math.min(b, w < 440 ? 3 : 5);
        const zoneW = Math.max(70, w * 0.42 - 36);
        const lStep = leftCols > 1 ? Math.min(44, zoneW / (leftCols - 1)) : 0;
        const rStep = rightCols > 1 ? Math.min(44, zoneW / (rightCols - 1)) : 0;
        const lStart = Math.max(24, w * 0.22 - ((leftCols - 1) * lStep) / 2);
        const rStart = Math.min(w - 24 - (rightCols - 1) * rStep, w * 0.78 - ((rightCols - 1) * rStep) / 2);
        for (let i = 0; i < a; i++) {
          balls.push({ x: lStart + (i % leftCols) * lStep, y: 66 + Math.floor(i / leftCols) * 48, r: addR, color: '#68b5ff', phase: i });
        }
        for (let j = 0; j < b; j++) {
          balls.push({ x: rStart + (j % rightCols) * rStep, y: 66 + Math.floor(j / rightCols) * 48, r: addR, color: '#ffd166', phase: j + 3 });
        }
      }

      let raf = 0;
      const tick = (now) => {
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, item.bg || 'aurora', 0.34);

        if (!isSub) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '400 32px "Nunito", serif';
          ctx.textAlign = 'center';
          ctx.fillText('+', w / 2, h / 2);
        }

        for (const bl of balls) {
          if (bl.popped) continue;
          drawBalloon(ctx, bl.x, bl.y + Math.sin(t * 1.15 + bl.phase) * 3.5, bl.r, bl.color, '', t);
        }

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        if (!isSub || poppedCount >= b) return;
        const pt = getXY(e);
        for (const bl of balls) {
          if (bl.popped) continue;
          if (Math.hypot(pt.x - bl.x, pt.y - bl.y) < bl.r + 10) {
            bl.popped = true;
            poppedCount++;
            playSound('pop', poppedCount);
            spawnParticles(particles, bl.x, bl.y, '#5eead4', 16);
            const hud = modalBody.querySelector('#bm-hud');
            if (hud) hud.textContent = `Yorildi: ${poppedCount} / ${b}`;
            if (poppedCount >= b) {
              phaseReady = true;
              ansRow.style.opacity = '1';
              const ban = modalBody.querySelector('#bm-banner');
              if (ban) ban.innerHTML = `Endi qolgan şarçalarni sanab <strong>${a} − ${b}</strong> javobini bosing!`;
            }
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);

      let locked = false;
      ansRow.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!phaseReady || locked) return;
          locked = true;
          if (Number(btn.dataset.v) === ans) {
            btn.classList.add('is-correct');
            addStar(1);
            playSound('good');
            spawnParticles(particles, w / 2, h / 2, '#5eead4', 26);
            gameTimeout(nextRound, 1250);
          } else {
            btn.classList.add('is-wrong');
            playSound('bad');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 1000);
          }
        });
      });

      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    nextRound();
  }

  // ── 15. SPACE ROCKET METEOR SHOOTER ──────────────────────────────────────
  function gameRocketShooter(cfg) {
    clearActiveGame();
    let roundIdx = 0;
    const totalRounds = 5;

    function nextWave() {
      clearActiveGame();
      if (roundIdx >= totalRounds) {
        showVictory('Kosmik kapitan!', 'Raketangiz barcha meteorlarni yengib oyga yetib bordi!');
        return;
      }
      roundIdx++;
      const eq = pickFreshMath(
        `rocket-${cfg.mode || 'add'}`,
        () => {
          if (cfg.mode === 'easy10') {
            const isSub = Math.random() < 0.45;
            const aa = isSub ? randInt(4, 10) : randInt(1, 6);
            const bb = isSub ? randInt(1, aa - 1) : randInt(1, 10 - aa);
            return { a: aa, b: bb, op: isSub ? '−' : '+', ans: isSub ? aa - bb : aa + bb };
          }
          const isMixSub = cfg.mode === 'mixed' && Math.random() < 0.5;
          const aa = isMixSub ? randInt(12, 28) : randInt(11, 27);
          const bb = isMixSub ? randInt(3, 11) : randInt(10, 22);
          return { a: aa, b: bb, op: isMixSub ? '−' : '+', ans: isMixSub ? aa - bb : aa + bb };
        },
        (e) => `${e.a}${e.op}${e.b}`
      );
      const a = eq.a;
      const b = eq.b;
      const ans = eq.ans;
      const op = eq.op;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Kosmos ${roundIdx} / ${totalRounds}</span>
          <span class="edu-hud-pill">Töğri meteoritni bosing!</span>
        </div>
        <div class="edu-banner">
          Töğri javobli meteoritni lazer bilan urib tuşiring: <strong>${a} ${op} ${b} = ?</strong>
        </div>
      `;

      const { canvas, ctx, w, h, getXY } = mountCanvasStage(310);
      const particles = [];
      const laserBeams = [];
      const opts = makeChoices(ans, [ans - 2, ans - 1, ans + 1, ans + 2, ans + 10].filter((x) => x > 0 && x !== ans));

      const meteorR = Math.min(32, Math.max(24, Math.round(w * 0.085)));
      const meteors = opts.map((val, idx) => ({
        val,
        x: w * (0.16 + idx * 0.22),
        y: -20 - idx * 14,
        vy: 0.18 + randInt(0, 10) * 0.01,
        r: meteorR,
        dead: false,
        shake: 0
      }));

      let rocketX = w / 2;
      let solved = false;
      let raf = 0;
      let prevNow = 0;

      const tick = (now) => {
        const dtScale = prevNow ? Math.min(2.5, Math.max(0.25, (now - prevNow) / 16.6667)) : 1;
        prevNow = now;
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'space', 0.22);

        for (const m of meteors) {
          if (m.dead) continue;
          m.y += m.vy * dtScale;
          m.shake *= 0.85;
          if (m.y > h - 85) m.y = 35;

          const mx = m.x + Math.sin(t * 45) * m.shake * 7;
          ctx.fillStyle = 'rgba(255,255,255,0.16)';
          ctx.strokeStyle = m.shake > 0.1 ? '#ff8fab' : '#68b5ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(mx, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 20px "Nunito", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(m.val), mx, m.y);
        }

        for (let i = laserBeams.length - 1; i >= 0; i--) {
          const lb = laserBeams[i];
          lb.a -= 0.03 * dtScale;
          if (lb.a <= 0) { laserBeams.splice(i, 1); continue; }
          ctx.strokeStyle = hexAlpha('#5eead4', lb.a);
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(lb.x1, lb.y1);
          ctx.lineTo(lb.x2, lb.y2);
          ctx.stroke();
        }

        drawIllustration(ctx, 'raketa', rocketX, h - 42, 68, t, '#68b5ff');
        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onTap = (e) => {
        if (solved) return;
        const pt = getXY(e);
        for (const m of meteors) {
          if (m.dead) continue;
          if (Math.hypot(pt.x - m.x, pt.y - m.y) < m.r + 12) {
            rocketX = m.x;
            laserBeams.push({ x1: rocketX, y1: h - 65, x2: m.x, y2: m.y, a: 1 });
            playSound('laser');
            if (m.val === ans) {
              solved = true;
              m.dead = true;
              addStar(1);
              playSound('good');
              spawnParticles(particles, m.x, m.y, '#5eead4', 28);
              gameTimeout(nextWave, 1250);
            } else {
              m.shake = 1;
              playSound('bad');
              spawnParticles(particles, m.x, m.y, '#ff8fab', 10);
            }
            break;
          }
        }
      };
      canvas.addEventListener('pointerdown', onTap);
      activeCleanup = () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', onTap); };
    }
    nextWave();
  }

  // ── 16. MAGIC CONVEYOR TRANSFORMER (sh→ş, ch→ç, o'→ö, g'→ğ, '→ʼ) ──────────
  function gameMagicZap() {
    clearActiveGame();
    const allPairs = [
      { old: 'shahar', neo: 'Ş', full: 'şahar' },
      { old: 'choy', neo: 'Ç', full: 'çoy' },
      { old: "o'rdak", neo: 'Ö', full: 'ördak' },
      { old: "g'oz", neo: 'Ğ', full: 'ğoz' },
      { old: 'quyosh', neo: 'Ş', full: 'quyoş' },
      { old: "to'rt", neo: 'Ö', full: 'tört' },
      { old: 'chiroq', neo: 'Ç', full: 'çiroq' },
      { old: 'shamol', neo: 'Ş', full: 'şamol' },
      { old: "qo'zi", neo: 'Ö', full: 'qözi' },
      { old: "bog'", neo: 'Ğ', full: 'boğ' },
      { old: "ma'no", neo: 'ʼ', full: 'maʼno' },
      { old: "a'lo", neo: 'ʼ', full: 'aʼlo' }
    ];
    const pairs = pickFreshBatch('magic-zap', allPairs, 6, (x) => x.old);
    let idx = 0;

    function nextCap() {
      clearActiveGame();
      if (idx >= pairs.length) {
        showVictory('Sehrgar ustoz!', 'Eski yozuvni yangi Ş, Ç, Ö, Ğ va ʼ belgilariga bexato ötkazdingiz!');
        return;
      }
      const cur = pairs[idx];
      idx++;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Konveyer ${idx} / ${pairs.length}</span>
          <span class="edu-hud-pill">Yangi belgini tanlang!</span>
        </div>
        <div class="edu-banner">
          Eski yozuvdagi <strong>"${cur.old}"</strong> sözini yangi harf tugmasi bilan özgartiring:
        </div>
      `;

      const { canvas, ctx, w, h } = mountCanvasStage(190);
      const btnRow = document.createElement('div');
      btnRow.className = 'edu-options';
      btnRow.innerHTML = ['Ş', 'Ç', 'Ö', 'Ğ', 'ʼ'].map((l) => `<button type="button" class="edu-opt" data-l="${l}">${l}</button>`).join('');
      modalBody.appendChild(btnRow);

      const particles = [];
      let boxX = Math.max(96, w * 0.28);
      let zapped = false;
      let raf = 0;
      let prevNow = 0;

      const tick = (now) => {
        const dtScale = prevNow ? Math.min(2.5, Math.max(0.25, (now - prevNow) / 16.6667)) : 1;
        prevNow = now;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'prism', 0.36);

        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(20, h - 42, w - 40, 14);

        if (!zapped) boxX = Math.min(w - 96, boxX + 0.20 * dtScale);

        ctx.fillStyle = zapped ? 'rgba(94,234,212,0.24)' : 'rgba(255,255,255,0.16)';
        ctx.strokeStyle = zapped ? '#5eead4' : 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        roundRect(ctx, boxX - 90, 42, 180, 74, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '400 32px "Nunito", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zapped ? cur.full : cur.old, boxX, 79);

        updateAndDrawParticles(ctx, particles);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      btnRow.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (zapped) return;
          if (btn.dataset.l === cur.neo) {
            zapped = true;
            btn.classList.add('is-correct');
            addStar(1);
            playSound('good');
            spawnParticles(particles, boxX, 78, '#5eead4', 24);
            gameTimeout(nextCap, 1350);
          } else {
            btn.classList.add('is-wrong');
            playSound('bad');
            gameTimeout(() => btn.classList.remove('is-wrong'), 950);
          }
        });
      });

      activeCleanup = () => cancelAnimationFrame(raf);
    }
    nextCap();
  }

  // ── 17. ILLUSTRATED MEMORY MATCH CARDS (Art & Alphabet Modes) ────────────
  function gameMemoryArt(cfg = {}) {
    clearActiveGame();
    const artPairs = [
      { id: 'sar', a: { txt: 'Şar', art: null }, b: { txt: '', art: 'sar' } },
      { id: 'ordak', a: { txt: 'Ördak', art: null }, b: { txt: '', art: 'ordak' } },
      { id: 'coy', a: { txt: 'Çoy', art: null }, b: { txt: '', art: 'coy' } },
      { id: 'tog', a: { txt: 'Toğ', art: null }, b: { txt: '', art: 'tog' } },
      { id: 'sir', a: { txt: 'Şir', art: null }, b: { txt: '', art: 'sir' } },
      { id: 'quyos', a: { txt: 'Quyoş', art: null }, b: { txt: '', art: 'quyos' } },
      { id: 'qozi', a: { txt: 'Qözi', art: null }, b: { txt: '', art: 'qozi' } },
      { id: 'olma', a: { txt: 'Olma', art: null }, b: { txt: '', art: 'olma' } },
      { id: 'm1', a: { txt: '3 + 4', art: null }, b: { txt: '7', art: null } },
      { id: 'm2', a: { txt: '9 − 3', art: null }, b: { txt: '6', art: null } },
      { id: 'm3', a: { txt: '5 + 6', art: null }, b: { txt: '11', art: null } },
      { id: 'm4', a: { txt: '8 + 4', art: null }, b: { txt: '12', art: null } }
    ];
    const alphaPairs = UZ_ALPHABET.map((l) => ({
      id: `al-${l.upper}`,
      a: { txt: l.type === 'belgi' ? 'ʼ (29)' : `${l.upper} ${l.lower}`, art: null },
      b: { txt: l.example, art: l.art }
    }));
    const sourcePool = cfg.mode === 'alpha' ? alphaPairs : artPairs;
    const picked = pickFreshBatch(`memory-${cfg.mode || 'art'}`, sourcePool, 4, (x) => x.id);
    const pairs = picked.flatMap((p) => [
      { id: p.id, ...p.a },
      { id: p.id, ...p.b }
    ]);
    const cards = shuffle(pairs.map((p, idx) => ({ ...p, uid: idx, flipped: false, matched: false })));
    let first = null;
    let lock = false;
    let moves = 0;

    const render = () => {
      const done = cards.every((c) => c.matched);
      if (done) {
        addStar(4);
        showVictory('Zör xotira!', `Barcha 4 juftlikni ${moves} urinişda topdingiz!`);
        return;
      }
      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Xotira öyini</span>
          <span class="edu-hud-pill">Uriniş: ${moves}</span>
        </div>
        <div class="edu-banner">${cfg.mode === 'alpha' ? 'Harf va unga mos söz juftligini toping!' : 'Rasm va söz yoki misol va javob juftligini toping!'}</div>
        <div class="edu-mem-grid">
          ${cards.map((c) => `
            <button type="button" class="edu-mem-card ${c.flipped || c.matched ? 'is-open' : ''} ${c.matched ? 'is-matched' : ''}" data-uid="${c.uid}">
              ${c.flipped || c.matched
                ? (c.art && cfg.mode === 'alpha'
                  ? `<span style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;"><canvas class="mem-c" data-art="${c.art}" width="50" height="40"></canvas><span style="font-size:12px;font-weight:800;line-height:1.1">${c.txt}</span></span>`
                  : (c.art ? `<canvas class="mem-c" data-art="${c.art}" width="64" height="58"></canvas>` : `<span>${c.txt}</span>`))
                : '<span>?</span>'}
            </button>
          `).join('')}
        </div>
      `;

      modalBody.querySelectorAll('.mem-c').forEach((mc) => {
        const mCtx = mc.getContext('2d');
        const mw = mc.width;
        const mh = mc.height;
        drawIllustration(mCtx, mc.dataset.art, mw / 2, mh / 2, Math.min(mw, mh) * 0.88, 0.3, '#5eead4');
      });

      modalBody.querySelectorAll('.edu-mem-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (lock) return;
          const card = cards.find((c) => c.uid === Number(btn.dataset.uid));
          if (!card || card.flipped || card.matched) return;
          card.flipped = true;
          playSound('tap');
          render();
          if (!first) {
            first = card;
          } else {
            moves++;
            if (first.id === card.id) {
              first.matched = true;
              card.matched = true;
              first = null;
              addStar(1);
              playSound('good');
              render();
            } else {
              lock = true;
              playSound('bad');
              const prev = first;
              first = null;
              gameTimeout(() => { prev.flipped = false; card.flipped = false; lock = false; render(); }, 1150);
            }
          }
        });
      });
    };
    render();
  }

  // ── 18. GEOMETRY SHAPES & SHADOW MATCHER ─────────────────────────────────
  function gameShadowMatch() {
    const shapes = [
      { id: 'circle', name: 'Doira', col: '#68b5ff' },
      { id: 'square', name: 'Kvadrat', col: '#5eead4' },
      { id: 'triangle', name: 'Uçburçak', col: '#ffd166' },
      { id: 'star', name: 'Yulduz', col: '#ff8fab' },
      { id: 'hex', name: 'Oltiburçak', col: '#a78bfa' },
      { id: 'heart', name: 'Yurak', col: '#fb7185' },
      { id: 'diamond', name: 'Olmos', col: '#38bdf8' },
      { id: 'moon', name: 'Yarim oy', col: '#facc15' }
    ];
    const rounds = pickFreshBatch('shadow-match', shapes, 5, (s) => s.id);
    let idx = 0;

    function drawShape(ctx, id, x, y, r, col) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = col;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (id === 'circle') {
        ctx.arc(0, 0, r, 0, Math.PI * 2);
      } else if (id === 'square') {
        roundRect(ctx, -r * 0.86, -r * 0.86, r * 1.72, r * 1.72, 12);
      } else if (id === 'triangle') {
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.94, r * 0.78);
        ctx.lineTo(-r * 0.94, r * 0.78);
        ctx.closePath();
      } else if (id === 'hex') {
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 - Math.PI / 6;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
      } else if (id === 'diamond') {
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.78, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.78, 0);
        ctx.closePath();
      } else if (id === 'heart') {
        ctx.moveTo(0, r * 0.78);
        ctx.bezierCurveTo(r * 1.25, r * 0.05, r * 0.85, -r * 0.92, 0, -r * 0.35);
        ctx.bezierCurveTo(-r * 0.85, -r * 0.92, -r * 1.25, r * 0.05, 0, r * 0.78);
      } else if (id === 'moon') {
        ctx.arc(0, 0, r * 0.92, 0.45, Math.PI * 2 - 0.45);
        ctx.arc(r * 0.36, -r * 0.05, r * 0.72, Math.PI * 2 - 0.72, 0.72, true);
        ctx.closePath();
      } else {
        drawStar(ctx, 0, 0, r, col);
        ctx.restore();
        return;
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function nextShape() {
      clearActiveGame();
      if (idx >= rounds.length) {
        showVictory('Geometriya ustasi!', 'Barcha şakllarni va soyalarni bexato tanidingiz!');
        return;
      }
      const cur = rounds[idx];
      idx++;
      const opts = makeChoices(cur.name, shapes.filter((s) => s.id !== cur.id).map((s) => s.name));

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Şakl ${idx} / ${rounds.length}</span>
          <span class="edu-hud-pill">Soyadan şaklni taning</span>
        </div>
        <div class="edu-banner">Ekrandagi şaklning nomi qaysi?</div>
      `;
      const { canvas, ctx, w, h } = mountCanvasStage(200);
      const row = document.createElement('div');
      row.className = 'edu-options';
      row.innerHTML = opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('');
      modalBody.appendChild(row);

      let reveal = false;
      let locked = false;
      let raf = 0;
      const tick = (now) => {
        const t = now * 0.001;
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'prism', 0.35);
        const pulse = 1 + Math.sin(t * 2.2) * 0.05;
        drawShape(ctx, cur.id, w / 2, h / 2, Math.min(58, h * 0.32) * pulse, reveal ? cur.col : 'rgba(255,255,255,0.22)');
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      row.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (btn.dataset.v === cur.name) {
            reveal = true;
            btn.classList.add('is-correct');
            addStar(1);
            gameTimeout(nextShape, 1100);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 900);
          }
        });
      });
      activeCleanup = () => cancelAnimationFrame(raf);
    }
    nextShape();
  }

  // ── 19. LOGIC PATTERN SEQUENCE ───────────────────────────────────────────
  function gamePatternNext() {
    clearActiveGame();
    const patternBank = [
      { seq: ['🔴', '🔵', '🔴', '🔵'], ans: '🔴', pool: ['🔴', '🔵', '🟢', '🟡'], hint: 'Navbatma-navbat rang' },
      { seq: ['★', '🌙', '★', '🌙'], ans: '★', pool: ['★', '🌙', '☀', '☁'], hint: 'Yulduz va oy' },
      { seq: ['A', 'Ç', 'A', 'Ç'], ans: 'A', pool: ['A', 'Ç', 'Ş', 'Ö'], hint: 'Harf zanjiri' },
      { seq: ['5', '10', '15', '20'], ans: '25', pool: ['25', '21', '30', '22'], hint: '+5 qadam' },
      { seq: ['▲', '●', '●', '▲', '●'], ans: '●', pool: ['●', '▲', '■', '★'], hint: '1 uçburçak, 2 doira' },
      { seq: ['2', '4', '6', '8'], ans: '10', pool: ['10', '9', '12', '11'], hint: 'Juft sonlar (+2)' },
      { seq: ['🍏', '🍒', '🍏', '🍒'], ans: '🍏', pool: ['🍏', '🍒', '🍋', '🍇'], hint: 'Meva tartibi' },
      { seq: ['Ş', 'Ö', 'Ğ', 'Ş', 'Ö'], ans: 'Ğ', pool: ['Ğ', 'Ş', 'Ö', 'Ç'], hint: '3 harf sikli' },
      { seq: ['1', '3', '5', '7'], ans: '9', pool: ['9', '8', '10', '11'], hint: 'Toq sonlar (+2)' },
      { seq: ['10', '20', '30', '40'], ans: '50', pool: ['50', '45', '60', '35'], hint: 'Önliklar (+10)' }
    ];
    const picked = pickFreshBatch('pattern-next', patternBank, 5, (p) => p.seq.join(','));
    let idx = 0;

    function nextSeq() {
      clearActiveGame();
      if (idx >= picked.length) {
        showVictory('Mantiq ustasi!', 'Barcha mantiqiy zanjirlarni töğri davom ettirdingiz!');
        return;
      }
      const cur = picked[idx];
      idx++;
      const opts = makeChoices(cur.ans, cur.pool.filter((x) => x !== cur.ans));
      let locked = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Zanjir ${idx} / ${picked.length}</span>
          <span class="edu-hud-pill">${cur.hint}</span>
        </div>
        <div class="edu-banner">Söroq belgisi <strong>"?"</strong> örniga qaysi element keladi?</div>
        <div class="edu-pattern-row">
          ${cur.seq.map((it) => `<span class="edu-pattern-cell">${it}</span>`).join('')}
          <span class="edu-pattern-cell is-gap" id="pat-gap">?</span>
        </div>
        <div class="edu-options">
          ${opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('')}
        </div>
      `;

      modalBody.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (btn.dataset.v === cur.ans) {
            btn.classList.add('is-correct');
            const gap = modalBody.querySelector('#pat-gap');
            if (gap) gap.textContent = cur.ans;
            addStar(1);
            gameTimeout(nextSeq, 1050);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 900);
          }
        });
      });
    }
    nextSeq();
  }

  // ── 20. COLOR MIXING LABORATORY ──────────────────────────────────────────
  function gameColorMixer() {
    clearActiveGame();
    const mixes = [
      { aName: 'Qizil', aHex: '#ef4444', bName: 'Sariq', bHex: '#facc15', ans: 'Zarğaldoq', pool: ['Zarğaldoq', 'Binafşa', 'Yaşil', 'Kök'] },
      { aName: 'Kök', aHex: '#3b82f6', bName: 'Sariq', bHex: '#facc15', ans: 'Yaşil', pool: ['Yaşil', 'Zarğaldoq', 'Puşti', 'Qora'] },
      { aName: 'Qizil', aHex: '#ef4444', bName: 'Kök', bHex: '#3b82f6', ans: 'Binafşa', pool: ['Binafşa', 'Yaşil', 'Sariq', 'Kulrang'] },
      { aName: 'Qizil', aHex: '#ef4444', bName: 'Oq', bHex: '#f8fafc', ans: 'Puşti', pool: ['Puşti', 'Qora', 'Kök', 'Yaşil'] },
      { aName: 'Qora', aHex: '#1e293b', bName: 'Oq', bHex: '#f8fafc', ans: 'Kulrang', pool: ['Kulrang', 'Sariq', 'Qizil', 'Puşti'] },
      { aName: 'Kök', aHex: '#2563eb', bName: 'Oq', bHex: '#f8fafc', ans: 'Havorang', pool: ['Havorang', 'Qizil', 'Binafşa', 'Jigarrang'] },
      { aName: 'Sariq', aHex: '#eab308', bName: 'Yaşil', bHex: '#16a34a', ans: 'Oç yaşil', pool: ['Oç yaşil', 'Binafşa', 'Puşti', 'Qora'] }
    ];
    const picked = pickFreshBatch('color-mixer', mixes, 5, (m) => `${m.aName}+${m.bName}`);
    let idx = 0;

    function nextMix() {
      clearActiveGame();
      if (idx >= picked.length) {
        showVictory('Rassom usta!', 'Ranglarni aralaştirib barcha hosil bölgan ranglarni topdingiz!');
        return;
      }
      const cur = picked[idx];
      idx++;
      const opts = makeChoices(cur.ans, cur.pool.filter((x) => x !== cur.ans));
      let locked = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Rang ${idx} / ${picked.length}</span>
          <span class="edu-hud-pill">Rang aralaşuvi</span>
        </div>
        <div class="edu-banner"><strong>${cur.aName}</strong> va <strong>${cur.bName}</strong> ranglar qöşilsa qaysi rang çiqadi?</div>
        <div class="edu-color-mix-row">
          <div class="edu-color-swatch" style="background:${cur.aHex}">${cur.aName}</div>
          <span class="edu-color-op">+</span>
          <div class="edu-color-swatch" style="background:${cur.bHex}">${cur.bName}</div>
          <span class="edu-color-op">=</span>
          <div class="edu-color-swatch" style="background:rgba(255,255,255,0.14)">?</div>
        </div>
        <div class="edu-options">
          ${opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('')}
        </div>
      `;

      modalBody.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (btn.dataset.v === cur.ans) {
            btn.classList.add('is-correct');
            addStar(1);
            gameTimeout(nextMix, 1050);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 900);
          }
        });
      });
    }
    nextMix();
  }

  // ── 21. SYLLABLE CLAPPER (Bo‘g‘in Sanagiç) ───────────────────────────────
  function gameSyllableClap() {
    clearActiveGame();
    const words = [
      { word: 'Şar', syl: 'Şar', count: 1, art: 'sar' },
      { word: 'Non', syl: 'Non', count: 1, art: 'quyos' },
      { word: 'Boğ', syl: 'Boğ', count: 1, art: 'olma' },
      { word: 'Olma', syl: 'Ol-ma', count: 2, art: 'olma' },
      { word: 'Ördak', syl: 'Ör-dak', count: 2, art: 'ordak' },
      { word: 'Çoynak', syl: 'Çoy-nak', count: 2, art: 'coy' },
      { word: 'Qözi', syl: 'Qö-zi', count: 2, art: 'qozi' },
      { word: 'Quyoş', syl: 'Qu-yoş', count: 2, art: 'quyos' },
      { word: 'Poyezd', syl: 'Po-yezd', count: 2, art: 'poyezd' },
      { word: 'Qurbaqa', syl: 'Qur-ba-qa', count: 3, art: 'qurbaqa' },
      { word: 'Tarozi', syl: 'Ta-ro-zi', count: 3, art: 'tarozi' },
      { word: 'Raketa', syl: 'Ra-ke-ta', count: 3, art: 'raketa' },
      { word: 'Kapalak', syl: 'Ka-pa-lak', count: 3, art: 'gul' }
    ];
    const picked = pickFreshBatch('syllable-clap', words, 5, (w) => w.word);
    let idx = 0;

    function nextClap() {
      clearActiveGame();
      if (idx >= picked.length) {
        showVictory('Böğin ustasi!', 'Sözlardagi barcha böğinlarni töğri sanadingiz!');
        return;
      }
      const cur = picked[idx];
      idx++;
      let locked = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Söz ${idx} / ${picked.length}</span>
          <span class="edu-hud-pill">Qarsak bilan sanang 👏</span>
        </div>
        <div class="edu-word-card">
          <canvas id="syl-art" width="84" height="84"></canvas>
          <div class="edu-word-card-text" id="syl-word">${cur.word}</div>
        </div>
        <div class="edu-banner"><strong>"${cur.word}"</strong> sözida neçta böğin bor?</div>
        <div class="edu-options">
          ${[1, 2, 3, 4].map((n) => `<button type="button" class="edu-opt" data-v="${n}">👏 ${n} ta</button>`).join('')}
        </div>
      `;
      const sCtx = modalBody.querySelector('#syl-art').getContext('2d');
      drawIllustration(sCtx, cur.art, 42, 42, 68, 0.3, '#5eead4');

      modalBody.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (Number(btn.dataset.v) === cur.count) {
            btn.classList.add('is-correct');
            const wEl = modalBody.querySelector('#syl-word');
            if (wEl) wEl.textContent = cur.syl;
            addStar(1);
            gameTimeout(nextClap, 1100);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 900);
          }
        });
      });
    }
    nextClap();
  }

  // ── 22. VOWEL vs CONSONANT SORTER (All 29 Characters) ────────────────────
  function gameVowelSort() {
    clearActiveGame();
    const picked = pickFreshBatch('vowel-sort', UZ_ALPHABET, 7, (l) => l.upper);
    let idx = 0;

    function nextChar() {
      clearActiveGame();
      if (idx >= picked.length) {
        showVictory('Tovuş bilimdoni!', 'Unli va undosh harflarni aʼlo darajada ajratdingiz!');
        return;
      }
      const cur = picked[idx];
      idx++;
      const isVowel = cur.type === 'unli';
      let locked = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Belgi ${idx} / ${picked.length}</span>
          <span class="edu-hud-pill">${cur.num}-örin · ${cur.example}</span>
        </div>
        <div class="edu-banner">Ushbu belgi qaysi guruhga kiradi?</div>
        <div class="edu-sort-token">
          <span>${cur.type === 'belgi' ? 'ʼ' : `${cur.upper}${cur.lower}`}</span>
          <small>${cur.example}</small>
        </div>
        <div class="edu-sort-bins">
          <button type="button" class="edu-sort-bin" data-k="unli">
            <span>Unli tovuş</span>
            <small>A · E · I · O · U · Ö</small>
          </button>
          <button type="button" class="edu-sort-bin" data-k="other">
            <span>Undosh / Belgi</span>
            <small>B Ç D ... Z va ʼ</small>
          </button>
        </div>
      `;

      modalBody.querySelectorAll('.edu-sort-bin').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const ok = (btn.dataset.k === 'unli') === isVowel;
          if (ok) {
            btn.classList.add('is-correct');
            addStar(1);
            gameTimeout(nextChar, 850);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 850);
          }
        });
      });
    }
    nextChar();
  }

  // ── 23. OPPOSITE WORDS (Antonyms) ────────────────────────────────────────
  function gameOppositeWords() {
    clearActiveGame();
    const pairs = [
      { w: 'Katta', a: 'Kiçik', pool: ['Kiçik', 'Uzun', 'Baland', 'Oq'] },
      { w: 'Issiq', a: 'Sovuq', pool: ['Sovuq', 'Yumşoq', 'Tez', 'Quruq'] },
      { w: 'Tez', a: 'Sekin', pool: ['Sekin', 'Yaqin', 'Oğir', 'Yangi'] },
      { w: 'Uzun', a: 'Qisqa', pool: ['Qisqa', 'Katta', 'Keng', 'Yengil'] },
      { w: 'Kun', a: 'Tun', pool: ['Tun', 'Tong', 'Bahor', 'Şamol'] },
      { w: 'Baland', a: 'Past', pool: ['Past', 'Uzun', 'Yumşoq', 'Kök'] },
      { w: 'Yoruğ', a: 'Qoronği', pool: ['Qoronği', 'Sovuq', 'Şirin', 'Eski'] },
      { w: 'Oğir', a: 'Yengil', pool: ['Yengil', 'Katta', 'Qattiq', 'Tez'] },
      { w: 'Yangi', a: 'Eski', pool: ['Eski', 'Kiçik', 'Oçiq', 'Issiq'] },
      { w: 'Oçiq', a: 'Yopiq', pool: ['Yopiq', 'Töğri', 'Baland', 'Qisqa'] },
      { w: 'Şirin', a: 'Aççiq', pool: ['Aççiq', 'Sovuq', 'Yengil', 'Past'] }
    ];
    const picked = pickFreshBatch('opposite-words', pairs, 5, (p) => p.w);
    let idx = 0;

    function nextPair() {
      clearActiveGame();
      if (idx >= picked.length) {
        showVictory('Zid sözlar ustasi!', 'Barcha qarama-qarşi maʼnoli sözlarni töğri topdingiz!');
        return;
      }
      const cur = picked[idx];
      idx++;
      const opts = makeChoices(cur.a, cur.pool.filter((x) => x !== cur.a));
      let locked = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Söz ${idx} / ${picked.length}</span>
          <span class="edu-hud-pill">Zid maʼno ↔</span>
        </div>
        <div class="edu-word-card">
          <div class="edu-word-card-text">${cur.w} ↔ ?</div>
        </div>
        <div class="edu-banner"><strong>"${cur.w}"</strong> söziga qarama-qarşi sözni tanlang:</div>
        <div class="edu-options">
          ${opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('')}
        </div>
      `;

      modalBody.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (btn.dataset.v === cur.a) {
            btn.classList.add('is-correct');
            addStar(1);
            gameTimeout(nextPair, 950);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 850);
          }
        });
      });
    }
    nextPair();
  }

  // ── 24. ANALOG LIQUID GLASS CLOCK TIME ───────────────────────────────────
  function gameClockTime() {
    clearActiveGame();
    const times = [
      { h: 1, m: 0 }, { h: 2, m: 0 }, { h: 3, m: 0 }, { h: 4, m: 0 },
      { h: 5, m: 0 }, { h: 6, m: 0 }, { h: 7, m: 0 }, { h: 8, m: 0 },
      { h: 9, m: 0 }, { h: 10, m: 0 }, { h: 11, m: 0 }, { h: 12, m: 0 },
      { h: 1, m: 30 }, { h: 2, m: 30 }, { h: 3, m: 30 }, { h: 4, m: 30 },
      { h: 6, m: 30 }, { h: 7, m: 30 }, { h: 9, m: 30 }, { h: 11, m: 30 }
    ];
    const fmt = (t) => `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
    const picked = pickFreshBatch('clock-time', times, 4, fmt);
    let idx = 0;

    function nextClock() {
      clearActiveGame();
      if (idx >= picked.length) {
        showVictory('Vaqt ustasi!', 'Soat strelkalaridan vaqtni aniq öqişni örganib oldingiz!');
        return;
      }
      const cur = picked[idx];
      idx++;
      const ansStr = fmt(cur);
      const decoys = times.filter((t) => fmt(t) !== ansStr).map(fmt);
      const opts = makeChoices(ansStr, decoys);
      let locked = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Soat ${idx} / ${picked.length}</span>
          <span class="edu-hud-pill">Vaqtni toping 🕒</span>
        </div>
        <div class="edu-banner">Soat neça bölganini tanlang:</div>
      `;
      const { canvas, ctx, w, h } = mountCanvasStage(215);
      const row = document.createElement('div');
      row.className = 'edu-options';
      row.innerHTML = opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('');
      modalBody.appendChild(row);

      const drawClock = () => {
        ctx.clearRect(0, 0, w, h);
        drawCoverBg(ctx, w, h, 'prism', 0.34);
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.40;

        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 13px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let n = 1; n <= 12; n++) {
          const a = (n * Math.PI) / 6 - Math.PI / 2;
          ctx.fillText(String(n), cx + Math.cos(a) * (r * 0.78), cy + Math.sin(a) * (r * 0.78));
        }

        const minAng = (cur.m / 60) * Math.PI * 2 - Math.PI / 2;
        const hrAng = ((cur.h % 12 + cur.m / 60) / 12) * Math.PI * 2 - Math.PI / 2;

        // Minute hand
        ctx.strokeStyle = '#5eead4';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(minAng) * r * 0.64, cy + Math.sin(minAng) * r * 0.64);
        ctx.stroke();

        // Hour hand
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(hrAng) * r * 0.42, cy + Math.sin(hrAng) * r * 0.42);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawClock();

      row.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (btn.dataset.v === ansStr) {
            btn.classList.add('is-correct');
            addStar(1);
            gameTimeout(nextClock, 1050);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 850);
          }
        });
      });
    }
    nextClock();
  }

  // ── 25. FIRST LETTER FINDER (29-Letter Initial Sound Game) ───────────────
  function gameFirstLetter() {
    clearActiveGame();
    const bank = [
      { word: '_AR', a: 'Ş', art: 'sar', pool: ['Ş', 'Ç', 'S', 'Ğ'] },
      { word: '_OYNAK', a: 'Ç', art: 'coy', pool: ['Ç', 'Ş', 'K', 'T'] },
      { word: '_RDAK', a: 'Ö', art: 'ordak', pool: ['Ö', 'O', 'U', 'A'] },
      { word: '_OZ', a: 'Ğ', art: 'ordak', pool: ['Ğ', 'G', 'Q', 'X'] },
      { word: '_LMA', a: 'O', art: 'olma', pool: ['O', 'Ö', 'A', 'U'] },
      { word: '_ITOB', a: 'K', art: 'kitob', pool: ['K', 'Q', 'B', 'D'] },
      { word: '_UL', a: 'G', art: 'gul', pool: ['G', 'Ğ', 'L', 'M'] },
      { word: '_AKETA', a: 'R', art: 'raketa', pool: ['R', 'L', 'P', 'T'] },
      { word: '_URBAQA', a: 'Q', art: 'qurbaqa', pool: ['Q', 'K', 'Ğ', 'B'] },
      { word: '_OYEZD', a: 'P', art: 'poyezd', pool: ['P', 'B', 'T', 'V'] },
      { word: '_ULDUZ', a: 'Y', art: 'yulduz', pool: ['Y', 'J', 'Z', 'U'] },
      { word: '_AROZI', a: 'T', art: 'tarozi', pool: ['T', 'D', 'S', 'Z'] },
      { word: '_UYOŞ', a: 'Q', art: 'quyos', pool: ['Q', 'K', 'Ş', 'O'] }
    ];
    const picked = pickFreshBatch('first-letter', bank, 5, (x) => x.word);
    let idx = 0;

    function nextQ() {
      clearActiveGame();
      if (idx >= picked.length) {
        showVictory('Boş harf ustasi!', 'Rasmga qarab barcha sözlarning boş harfini töğri topdingiz!');
        return;
      }
      const cur = picked[idx];
      idx++;
      const opts = makeChoices(cur.a, cur.pool.filter((x) => x !== cur.a));
      let locked = false;

      modalBody.innerHTML = `
        <div class="edu-hud">
          <span>Söz ${idx} / ${picked.length}</span>
          <span class="edu-hud-pill">Boş harfni tanlang</span>
        </div>
        <div class="edu-word-card">
          <canvas id="fl-art" width="84" height="84"></canvas>
          <div class="edu-word-card-text" id="fl-word">${cur.word}</div>
        </div>
        <div class="edu-options">
          ${opts.map((o) => `<button type="button" class="edu-opt" data-v="${o}">${o}</button>`).join('')}
        </div>
      `;
      const fCtx = modalBody.querySelector('#fl-art').getContext('2d');
      drawIllustration(fCtx, cur.art, 42, 42, 68, 0.3, '#5eead4');

      modalBody.querySelectorAll('.edu-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          if (btn.dataset.v === cur.a) {
            btn.classList.add('is-correct');
            const wEl = modalBody.querySelector('#fl-word');
            if (wEl) wEl.innerHTML = cur.word.replace('_', `<span style="color:#5eead4">${cur.a}</span>`);
            addStar(1);
            gameTimeout(nextQ, 1050);
          } else {
            btn.classList.add('is-wrong');
            gameTimeout(() => { btn.classList.remove('is-wrong'); locked = false; }, 850);
          }
        });
      });
    }
    nextQ();
  }

  // ── 26. GRAND COMBINED MARATHON ──────────────────────────────────────────
  function gameFinalMix() {
    const pick = pickFreshBatch('final-mix', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 1, String)[0];
    if (pick === 0) gameFlashlightHunt({ letter: 'Ğ' });
    else if (pick === 1) gameLionFeeder();
    else if (pick === 2) gameTrainBuilder();
    else if (pick === 3) gameXylophoneNotes();
    else if (pick === 4) gameRocketShooter({ mode: 'mixed' });
    else if (pick === 5) gameMagicZap();
    else if (pick === 6) gameShadowMatch();
    else if (pick === 7) gamePatternNext();
    else if (pick === 8) gameSyllableClap();
    else gameOppositeWords();
  }

  function launchGame(cur) {
    switch (cur.gameType) {
      case 'pvp-duel': gamePvpDuel(cur.config); break;
      case 'picture-hunt': gamePictureHunt(cur.config); break;
      case 'flashlight-hunt': gameFlashlightHunt(cur.config); break;
      case 'letter-trace': gameLetterTrace(cur.config); break;
      case 'duck-pond': gameDuckPond(); break;
      case 'xylophone-notes': gameXylophoneNotes(); break;
      case 'train-builder': gameTrainBuilder(); break;
      case 'lion-feeder': gameLionFeeder(); break;
      case 'alphabet-board': gameAlphabetBoard(); break;
      case 'balloon-pop': gameBalloonPop(cur.config); break;
      case 'word-builder': gameWordBuilder(cur.config); break;
      case 'apple-basket': gameAppleBasket(cur.config); break;
      case 'frog-hops': gameFrogHops(cur.config); break;
      case 'balance-scale': gameBalanceScale(cur.config); break;
      case 'bubble-math': gameBubbleMath(cur.config); break;
      case 'rocket-shooter': gameRocketShooter(cur.config); break;
      case 'magic-zap': gameMagicZap(); break;
      case 'memory-art': gameMemoryArt(cur.config); break;
      case 'shadow-match': gameShadowMatch(); break;
      case 'pattern-next': gamePatternNext(); break;
      case 'color-mixer': gameColorMixer(); break;
      case 'syllable-clap': gameSyllableClap(); break;
      case 'vowel-sort': gameVowelSort(); break;
      case 'opposite-words': gameOppositeWords(); break;
      case 'clock-time': gameClockTime(); break;
      case 'first-letter': gameFirstLetter(); break;
      case 'final-mix': gameFinalMix(); break;
      default: gameAppleBasket({ max: 10 });
    }
  }

  launchGame(item);
}
