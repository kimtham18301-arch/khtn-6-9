(function(){
'use strict';

var D = window.KHTN || [];
var EXAMS = window.KHTN_EXAMS || [];
var BANK = window.KHTNBank;
var app = document.getElementById('app');
var SUBJ = { hoa:'Hóa học', ly:'Vật lí', sinh:'Sinh học', td:'Mở đầu / Trái Đất' };
var DIFF = {
  1:'Mức 1 · Câu Dễ',
  2:'Mức 2 · Trung bình',
  3:'Mức 3 · Câu Khá',
  4:'Mức 4 · Câu Khó'
};
var DIFF_SHORT = {
  1:'Mức 1 · Dễ',
  2:'Mức 2 · TB',
  3:'Mức 3 · Khá',
  4:'Mức 4 · Khó'
};
var STAGE_META = {
  1: { term:'HK1', title:'Giai đoạn 1 – Đầu Học kì I đến Giữa kì I (Tuần 1 – Tuần 9)', note:'Học tới đâu làm đề tới đó: Học bài → Kiểm tra 15p (Lần 1, 2) → Kiểm tra Giữa kì I.' },
  2: { term:'HK1', title:'Giai đoạn 2 – Sau Giữa kì I đến Cuối kì I (Tuần 10 – Tuần 18)', note:'Học bài mới sau Giữa kì → Kiểm tra 15p (Lần 3, 4) → Kiểm tra Cuối kì I. Không trộn kiến thức HK2.' },
  3: { term:'HK2', title:'Giai đoạn 3 – Đầu Học kì II đến Giữa kì II (Tuần 19 – Tuần 26)', note:'Học đầu Học kì II → Kiểm tra 15p (Lần 1, 2) → Kiểm tra Giữa kì II.' },
  4: { term:'HK2', title:'Giai đoạn 4 – Sau Giữa kì II đến Cuối kì II (Tuần 27 – Tuần 35)', note:'Học nửa sau Học kì II → Kiểm tra 15p (Lần 3, 4) → Kiểm tra Cuối kì II.' },
  5: { term:'Cả năm', title:'Giai đoạn 5 – Ôn tổng hợp cả năm & Bồi dưỡng Nâng cao', note:'Dùng khi đã học xong cả 2 học kì hoặc ôn hè lên lớp mới.' }
};

var byId = {};
D.forEach(function(t){ byId[t.id] = t; });
var examById = {};
EXAMS.forEach(function(ex){ examById[ex.id] = ex; });

var KEY_PROG = 'khtn-progress-v1';
var KEY_DRAFT = 'khtn-drafts-v1';
var KEY_MISTAKE = 'khtn-mistakes-v1';
var KEY_EXAMS = 'khtn-exams-v1';
var KEY_META = 'khtn-meta-v1';
var KEY_THEME = 'khtn-theme';
var KEY_FONTSIZE = 'khtn-fontsize';

var PUBLIC_URL = 'https://kimtham18301-arch.github.io/scibook/';
var currentCleanup = null;
var quickExamSpecs = {};
var toastTimer = null;

// --- Storage helpers ---
function readJSON(key, fallback){
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function writeJSON(key, val){
  try { localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch (e) { return false; }
}
function loadProg(){ return readJSON(KEY_PROG, {}); }
function saveProg(p){ return writeJSON(KEY_PROG, p); }
function loadDrafts(){ return readJSON(KEY_DRAFT, {}); }
function saveDrafts(d){ return writeJSON(KEY_DRAFT, d); }
function loadMistakes(){ return readJSON(KEY_MISTAKE, {}); }
function saveMistakes(m){ return writeJSON(KEY_MISTAKE, m); }
function loadExams(){ return readJSON(KEY_EXAMS, {}); }
function saveExams(x){ return writeJSON(KEY_EXAMS, x); }
function loadMeta(){ return readJSON(KEY_META, {}); }
function saveMeta(m){ return writeJSON(KEY_META, m); }

function getPrefGrade(){
  var m = loadMeta();
  var g = Number(m.prefGrade);
  return [6,7,8,9].indexOf(g) > -1 ? g : 8;
}
function setPrefGrade(g){
  if ([6,7,8,9].indexOf(Number(g)) === -1) return;
  var m = loadMeta();
  m.prefGrade = Number(g);
  saveMeta(m);
  syncGradeNavLinks();
}
function syncGradeNavLinks(){
  var g = getPrefGrade();
  var navEx = document.getElementById('nav-exam-link');
  var bGrade = document.getElementById('bnav-grade-link');
  var bGradeLbl = document.getElementById('bnav-grade-lbl');
  var bExam = document.getElementById('bnav-exam-link');
  if (navEx) navEx.setAttribute('href', '#/de-kiem-tra/' + g);
  if (bGrade) bGrade.setAttribute('href', '#/lop/' + g);
  if (bGradeLbl) bGradeLbl.textContent = 'Lớp ' + g;
  if (bExam) bExam.setAttribute('href', '#/de-kiem-tra/' + g);
}

// --- Toast Notification ---
function showToast(msg){
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ el.hidden = true; }, 3200);
}

// --- Stop Speech Synthesis Safely ---
function stopSpeech(){
  try {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {}
}

// --- Copy Text Helper (works across phones & older browsers) ---
function copyText(txt, okMsg){
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function(){
      showToast(okMsg || '✓ Đã sao chép đường link! Bạn dán gửi qua Zalo được ngay.');
    }).catch(function(){ fallbackCopy(txt, okMsg); });
  } else {
    fallbackCopy(txt, okMsg);
  }
}
function fallbackCopy(txt, okMsg){
  var ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showToast(okMsg || '✓ Đã sao chép đường link! Bạn dán gửi qua Zalo được ngay.');
  } catch (e) {
    prompt('Sao chép đường link dưới đây:', txt);
  }
  document.body.removeChild(ta);
}

function getShareableBaseUrl(){
  if (location.hostname && location.hostname.indexOf('github.io') > -1) {
    return location.origin + location.pathname;
  }
  return PUBLIC_URL;
}
function getShareableCurrentUrl(){
  var base = getShareableBaseUrl();
  var h = location.hash || '';
  return h && h !== '#/' ? (base + h) : base;
}

// --- Info Modal (Help & Share) ---
function openInfoModal(titleHtml, bodyHtml, onMount){
  var modal = document.getElementById('info-modal');
  if (!modal) return;
  function onKey(e){ if (e.key === 'Escape') close(); }
  function close(){
    modal.hidden = true;
    modal.innerHTML = '';
    document.removeEventListener('keydown', onKey);
  }
  modal.innerHTML =
    '<div class="modal-card narrow">' +
      '<div class="modal-head">' +
        '<b id="info-modal-title">' + titleHtml + '</b>' +
        '<button type="button" class="btn sm subtle" data-act="close-info">✕ Đóng</button>' +
      '</div>' +
      '<div class="modal-body" style="background:var(--card)">' + bodyHtml + '</div>' +
    '</div>';
  modal.querySelector('[data-act="close-info"]').onclick = close;
  modal.onclick = function(e){ if (e.target === modal) close(); };
  document.addEventListener('keydown', onKey);
  modal.hidden = false;
  if (typeof onMount === 'function') onMount(modal, close);
}

function openShareModal(customLabel){
  var homeUrl = getShareableBaseUrl();
  var curUrl = getShareableCurrentUrl();
  var hasSpecificPage = curUrl !== homeUrl;
  var canNativeShare = typeof navigator.share === 'function';

  var html =
    '<p style="margin-top:0">Ai có đường link này đều mở học và in đề được ngay <b>trên điện thoại, iPad và máy tính</b> — hoàn toàn miễn phí, không cần tạo tài khoản.</p>';

  if (hasSpecificPage) {
    html +=
      '<div class="card highlight" style="margin-bottom:12px">' +
        '<b>📌 Gửi đúng bài / đề đang mở' + (customLabel ? ' (' + esc(customLabel) + ')' : '') + ':</b>' +
        '<div style="margin:6px 0;padding:8px 10px;background:var(--bg);border:1px solid var(--line);border-radius:8px;word-break:break-all;font-size:.88rem">' + esc(curUrl) + '</div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm" id="sh-copy-cur">📋 Sao chép link bài đang mở</button>' +
          (canNativeShare ? '<button type="button" class="btn sm alt" id="sh-native-cur">📲 Gửi qua Zalo / Messenger</button>' : '') +
        '</div>' +
      '</div>';
  }

  html +=
    '<div class="card" style="margin-bottom:12px">' +
      '<b>🏠 Link Trang chủ (Đầy đủ Lớp 6, 7, 8, 9):</b>' +
      '<div style="margin:6px 0;padding:8px 10px;background:var(--surface);border:1px solid var(--line);border-radius:8px;word-break:break-all;font-size:.9rem;font-weight:600">' + esc(homeUrl) + '</div>' +
      '<div class="row">' +
        '<button type="button" class="btn ' + (hasSpecificPage ? 'sm alt' : '') + '" id="sh-copy-home">📋 Sao chép link Trang chủ</button>' +
        (canNativeShare && !hasSpecificPage ? '<button type="button" class="btn alt" id="sh-native-home">📲 Mở bảng gửi nhanh (Zalo / Tin nhắn)</button>' : '') +
      '</div>' +
    '</div>' +
    '<div class="card soft">' +
      '<b>📱 Mẹo ghim ra màn hình điện thoại như ứng dụng:</b>' +
      '<ul class="tight" style="font-size:.9rem">' +
        '<li><b>iPhone / iPad (Safari):</b> Bấm biểu tượng <b>Chia sẻ</b> (ô vuông có mũi tên lên) → Chọn <b>Thêm vào MH chính</b>.</li>' +
        '<li><b>Điện thoại Android (Chrome):</b> Bấm dấu 3 chấm <b>⋮</b> góc phải trên → Chọn <b>Thêm vào màn hình chính</b>.</li>' +
      '</ul>' +
    '</div>';

  openInfoModal('📤 Chia sẻ đường link học tập miễn phí', html, function(modal){
    var bCur = modal.querySelector('#sh-copy-cur');
    if (bCur) bCur.onclick = function(){ copyText(curUrl, '✓ Đã chép link bài đang mở! Bạn dán vào Zalo / Messenger nhé.'); };
    var bHome = modal.querySelector('#sh-copy-home');
    if (bHome) bHome.onclick = function(){ copyText(homeUrl, '✓ Đã chép link Trang chủ! Bạn dán vào Zalo / Messenger nhé.'); };
    var bNatCur = modal.querySelector('#sh-native-cur');
    if (bNatCur) bNatCur.onclick = function(){
      navigator.share({ title: customLabel || 'SciBook', url: curUrl }).catch(function(){});
    };
    var bNatHome = modal.querySelector('#sh-native-home');
    if (bNatHome) bNatHome.onclick = function(){
      navigator.share({ title: 'SciBook – Pastel Science Book', url: homeUrl }).catch(function(){});
    };
  });
}

function openHelpModal(){
  var html =
    '<div class="card highlight" style="margin-bottom:12px">' +
      '<b>✨ Trang web được thiết kế để ai cũng dùng được ngay:</b>' +
      '<div class="muted" style="font-size:.92rem;margin-top:4px">Không cần đăng kí tài khoản, không thu phí, không quảng cáo. Học tới đâu máy tự động nhớ kết quả tới đó.</div>' +
    '</div>' +
    '<div style="display:grid;gap:10px">' +
      '<div class="card">' +
        '<b>1️⃣ Cách vào học một bài trên lớp</b>' +
        '<div class="muted" style="font-size:.92rem;margin-top:3px">Ở Trang chủ, bấm chọn <b>Lớp 6, 7, 8 hoặc 9</b> → bấm <b>Học bài trên lớp</b> → chọn tên bài. Có nút <b>🔊 Nghe đọc tóm tắt</b> và câu hỏi sắp sẵn từ <b>Dễ → Khó</b>.</div>' +
      '</div>' +
      '<div class="card">' +
        '<b>2️⃣ Cách làm đề kiểm tra 15 phút · Giữa kì · Cuối kì</b>' +
        '<div class="muted" style="font-size:.92rem;margin-top:3px">Bấm mục <b>📝 Đề kiểm tra</b> → chọn đúng bài hoặc tuần đang học ở trường. Có thể chọn <b>Biết đúng/sai ngay từng câu</b> (dễ học) hoặc <b>Làm hết đề rồi nộp chấm điểm</b>.</div>' +
      '</div>' +
      '<div class="card">' +
        '<b>3️⃣ Cách In ra giấy A4 hoặc Lưu thành PDF gửi Zalo</b>' +
        '<div class="muted" style="font-size:.92rem;margin-top:3px">Bấm mục <b>🖨️ In đề A4</b> → chọn đề cần in → bấm nút tím <b>In ra giấy / Lưu thành PDF</b>. Hệ thống tự tách <b>Tờ Đề bài (không đáp án)</b> ở trang trước và <b>Tờ Đáp án</b> sang trang mới!</div>' +
      '</div>' +
      '<div class="card">' +
        '<b>4️⃣ Phóng to chữ &amp; Đọc ban đêm đỡ mỏi mắt</b>' +
        '<div class="muted" style="font-size:.92rem;margin-top:3px">Bấm nút <b>A+ Chữ to</b> ở thanh trên cùng để phóng to toàn bộ chữ trên trang web (có 3 mức cỡ chữ).</div>' +
      '</div>' +
    '</div>';
  openInfoModal('❓ Hướng dẫn sử dụng dễ hiểu (30 giây)', html);
}

// --- Top Bar Controls Init (Theme, Font Size, Share, Help) ---
(function initTopControls(){
  // 1. Theme
  var themeBtn = document.getElementById('theme-toggle');
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(KEY_THEME); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = savedTheme || (prefersDark ? 'dark' : 'light');

  function applyTheme(t){
    theme = t;
    document.documentElement.dataset.theme = t;
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀️ Ban ngày' : '🌙 Ban đêm';
  }
  applyTheme(theme);
  if (themeBtn) {
    themeBtn.onclick = function(){
      var next = theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY_THEME, next); } catch (e) {}
      applyTheme(next);
      showToast(next === 'dark' ? '🌙 Đã chuyển sang nền tối dịu mắt' : '☀️ Đã chuyển sang nền sáng');
    };
  }

  // 2. Font size scaling (normal -> large -> xlarge -> normal)
  var fontBtn = document.getElementById('font-toggle');
  var savedFont = 'normal';
  try { savedFont = localStorage.getItem(KEY_FONTSIZE) || 'normal'; } catch (e) {}
  var fontModes = ['normal', 'large', 'xlarge'];
  if (fontModes.indexOf(savedFont) === -1) savedFont = 'normal';

  function applyFont(f){
    savedFont = f;
    document.documentElement.dataset.fontsize = f;
    if (fontBtn) {
      fontBtn.classList.toggle('active', f !== 'normal');
      fontBtn.textContent = f === 'xlarge' ? 'A++ Rất to' : (f === 'large' ? 'A+ Chữ to ✓' : 'A+ Chữ to');
    }
  }
  applyFont(savedFont);
  if (fontBtn) {
    fontBtn.onclick = function(){
      var nextIdx = (fontModes.indexOf(savedFont) + 1) % fontModes.length;
      var nextF = fontModes[nextIdx];
      try { localStorage.setItem(KEY_FONTSIZE, nextF); } catch (e) {}
      applyFont(nextF);
      showToast(nextF === 'large' ? '✓ Đã bật cỡ chữ TO dễ đọc' : (nextF === 'xlarge' ? '✓ Đã bật cỡ chữ RẤT TO' : '✓ Đã trở về cỡ chữ vừa'));
    };
  }

  // 3. Share & Help buttons
  var shareBtn = document.getElementById('share-btn');
  if (shareBtn) shareBtn.onclick = function(){ openShareModal(); };
  var helpBtn = document.getElementById('help-btn');
  if (helpBtn) helpBtn.onclick = function(){ openHelpModal(); };

  syncGradeNavLinks();
})();

// --- Formatting & Utilities ---
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}
function fmtMath(s){
  return (window.KHTNMath && typeof window.KHTNMath.format === 'function')
    ? window.KHTNMath.format(s)
    : esc(s);
}
function fmtFormula(s){
  return (window.KHTNMath && typeof window.KHTNMath.formatFormula === 'function')
    ? window.KHTNMath.formatFormula(s)
    : fmtMath(s);
}
function normVi(s){
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}
function shuffle(a){
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function fmtNum(n){ return String(n).replace('.', ','); }
function score10(ratio){ return (Math.round(ratio * 100) / 10).toFixed(1).replace('.', ','); }
function round1(val){ return Math.round(val * 10) / 10; }

// Forgiving numeric input parser: accepts comma/dot decimals, accidental trailing units (e.g. "50 cm/s", "25%"), and simple fractions ("1/2")
function parseNumInput(raw, unitHint){
  var s = String(raw || '').trim();
  if (!s) return NaN;
  if (unitHint) {
    var uEsc = String(unitHint).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp('\\s*' + uEsc + '\\s*$', 'i'), '').trim();
  }
  s = s.replace(/\s*(cm\/s|m\/s²|m\/s|km\/h|mmol|mol|gam|kg|mg|ml|ms|hz|kpa|pa|kj|kw|amu|giờ|phút|độ|cm²|m²|cm³|m³|cm|mm|km|lít|%|°|g|h|s|l|m|n|j|v|a|w)\s*$/i, '').trim();
  var clean = s.replace(/\s+/g, '').replace(',', '.');
  if (/^[+-]?\d+(\.\d+)?\/[+-]?\d+(\.\d+)?$/.test(clean)) {
    var parts = clean.split('/');
    var den = parseFloat(parts[1]);
    return den !== 0 ? parseFloat(parts[0]) / den : NaN;
  }
  if (!/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(clean)) return NaN;
  return parseFloat(clean);
}

function getDiff(q){
  if (q && (q.d === 1 || q.d === 2 || q.d === 3 || q.d === 4)) return q.d;
  return q && q.n != null ? 2 : 1;
}
function diffBadge(q){
  var d = getDiff(q);
  return '<span class="badge d' + d + '">' + DIFF_SHORT[d] + '</span>';
}
function best(id){
  var p = loadProg()[id];
  return p && typeof p.best === 'number' ? p.best : null;
}
function isMastered(id){
  var b = best(id);
  return b != null && b >= 0.67;
}
function tag(s){ return '<span class="tag ' + s + '">' + (SUBJ[s] || s) + '</span>'; }
function pct(list){
  if (!list.length) return 0;
  var d = 0;
  list.forEach(function(t){ if (isMastered(t.id)) d++; });
  return Math.round((d / list.length) * 100);
}
function pickHint(topic, q){
  if (!topic) return '';
  var candidates = (topic.formulas || []).concat(topic.theory || []);
  if (!candidates.length) return '';
  var qWords = normVi((q.q || '') + ' ' + (q.u || '')).split(/[^a-z0-9]+/).filter(function(w){ return w.length >= 2; });
  var bestCand = candidates[0], bestScore = -1;
  candidates.forEach(function(c, idx){
    var cn = normVi(c);
    var sc = idx < (topic.formulas || []).length ? 0.5 : 0;
    qWords.forEach(function(w){ if (cn.indexOf(w) > -1) sc += (w.length >= 3 ? 2 : 1); });
    if (sc > bestScore) { bestScore = sc; bestCand = c; }
  });
  return bestCand;
}

// Clean text for Vietnamese Speech Synthesis
function plainSpeechText(raw){
  var s = String(raw || '').split(' || ')[0];
  var subMap = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
  s = s.replace(/[₀-₉]/g, function(c){ return subMap[c] || c; });
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1 chia $2');
  s = s.replace(/→|⇒/g, ', suy ra ');
  s = s.replace(/⇄/g, ' thuận nghịch ');
  s = s.replace(/·|×/g, ' nhân ');
  return s;
}

// Mistake tracking
function mistakeKey(topicId, qObj){
  return topicId + '::' + normVi(qObj && qObj.q ? qObj.q : '').slice(0, 90);
}
function recordMistake(topicId, qIdx, ok, qObj){
  if (!topicId || !qObj) return;
  var m = loadMistakes();
  var k = mistakeKey(topicId, qObj);
  var legacyKey = qIdx != null ? (topicId + '::' + qIdx) : null;
  if (ok) {
    var changed = false;
    if (m[k]) { delete m[k]; changed = true; }
    if (legacyKey && m[legacyKey]) { delete m[legacyKey]; changed = true; }
    if (changed) saveMistakes(m);
  } else {
    var prev = m[k] || { topicId: topicId, qIndex: qIdx, qSnap: JSON.parse(JSON.stringify(qObj)), count: 0 };
    prev.count = (prev.count || 0) + 1;
    prev.qSnap = JSON.parse(JSON.stringify(qObj));
    prev.lastWrongAt = Date.now();
    m[k] = prev;
    if (Object.keys(m).length > 120) {
      var sortedKeys = Object.keys(m).sort(function(a,b){ return (m[b].lastWrongAt||0) - (m[a].lastWrongAt||0); });
      var nextM = {};
      sortedKeys.slice(0, 100).forEach(function(sk){ nextM[sk] = m[sk]; });
      m = nextM;
    }
    saveMistakes(m);
  }
}
function getMistakeQuestion(entry){
  if (!entry) return null;
  if (entry.qSnap && entry.qSnap.q) return entry.qSnap;
  var t = byId[entry.topicId];
  if (t && entry.qIndex != null && t.questions[entry.qIndex]) return t.questions[entry.qIndex];
  return null;
}

function getTopicPool(topic, rounds){
  if (BANK && typeof BANK.getPoolForTopic === 'function') {
    return BANK.getPoolForTopic(topic, rounds || 5);
  }
  return (topic.questions || []).map(function(q, i){ return { q: q, staticIdx: i, d: getDiff(q) }; });
}

function getResumeTarget(){
  var meta = loadMeta();
  if (meta.lastLessonId && byId[meta.lastLessonId]) {
    return { id: meta.lastLessonId, kind: 'recent' };
  }
  var pg = getPrefGrade();
  var nextL = D.find(function(t){ return t.grade === pg && !isMastered(t.id); }) ||
              D.find(function(t){ return t.grade === 8 && !isMastered(t.id); }) ||
              D.find(function(t){ return t.grade === 7 && !isMastered(t.id); }) ||
              D.find(function(t){ return !isMastered(t.id); }) || D[0];
  return nextL ? { id: nextL.id, kind: 'suggest' } : null;
}

function updateNavActive(routeKey){
  document.querySelectorAll('#main-nav a').forEach(function(a){
    var active = a.dataset.nav === routeKey;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  var bKey = routeKey.indexOf('lop-') === 0 ? 'lop' : routeKey;
  document.querySelectorAll('#bottom-nav a').forEach(function(a){
    var active = a.dataset.bnav === bKey;
    a.classList.toggle('active', active);
  });
}

// ============================================================================
// BẢNG LỘ TRÌNH KIỂM TRA THEO THỨ TỰ THỜI GIAN HỌC KÌ & SỔ ĐIỂM THÔNG TƯ 22
// ============================================================================
function computeCircular22Gradebook(g){
  var examStats = loadExams();
  var gExams = EXAMS.filter(function(ex){ return ex.grade === g && ex.col; });
  var byCol = {};
  gExams.forEach(function(ex){
    var st = examStats[ex.id];
    byCol[ex.col] = {
      exam: ex,
      val: st && typeof st.best === 'number' ? round1(st.best * 10) : null
    };
  });

  function calcTermAvg(prefix){
    var cols = [prefix + '-tx1', prefix + '-tx2', prefix + '-tx3', prefix + '-tx4'];
    var gk = byCol[prefix + '-gk'] ? byCol[prefix + '-gk'].val : null;
    var ck = byCol[prefix + '-ck'] ? byCol[prefix + '-ck'].val : null;
    var presentTxs = cols.map(function(c){ return byCol[c] ? byCol[c].val : null; }).filter(function(v){ return v != null; });
    if (presentTxs.length < 3 || gk == null || ck == null) return null;
    var sumTx = presentTxs.reduce(function(a, b){ return a + b; }, 0);
    return round1((sumTx + 2 * gk + 3 * ck) / (presentTxs.length + 5));
  }

  var hk1 = calcTermAvg('hk1');
  var hk2 = calcTermAvg('hk2');
  var cn = (hk1 != null && hk2 != null) ? round1((hk1 + 2 * hk2) / 3) : null;

  return { byCol: byCol, hk1: hk1, hk2: hk2, cn: cn };
}

function rankLabel(score){
  if (score == null || isNaN(score)) return 'Chưa đủ bài kiểm tra';
  if (score >= 8.0) return 'Tốt (Giỏi)';
  if (score >= 6.5) return 'Khá';
  if (score >= 5.0) return 'Đạt';
  return 'Chưa đạt';
}

function mountGradebookWidget(containerEl, g){
  if (!containerEl) return;
  if (g !== 7 && g !== 8) {
    containerEl.innerHTML = '';
    return;
  }
  var gb = computeCircular22Gradebook(g);
  var simMode = false;

  function cellHtml(colKey, isMilestone){
    var info = gb.byCol[colKey];
    var cls = isMilestone ? ' class="gb-milestone"' : '';
    if (!info) return '<td' + cls + '>—</td>';
    var v = info.val;
    var sub = info.exam.shortLabel ? '<span class="gb-sub">' + esc(info.exam.shortLabel) + '</span>' : '';
    if (simMode) {
      return '<td' + cls + '><input type="text" class="gb-inp" data-col="' + colKey + '" value="' + (v != null ? fmtNum(v) : '8,0') + '">' + sub + '</td>';
    }
    if (v != null) {
      return '<td' + cls + '><a class="gb-cell-link ' + (v >= 6.5 ? 'done' : '') + '" href="#/lam-de/' + info.exam.id + '" title="Bấm để làm lại: ' + esc(info.exam.title) + '">' + fmtNum(v.toFixed(1)) + '</a>' + sub + '</td>';
    }
    return '<td' + cls + '><a class="gb-cell-link" href="#/lam-de/' + info.exam.id + '" title="' + esc(info.exam.title) + '">Làm bài ›</a>' + sub + '</td>';
  }

  function render(){
    var h =
      '<section class="card" style="margin:14px 0">' +
        '<div class="row between">' +
          '<div>' +
            '<b>📅 Bảng Lộ Trình Đề Kiểm Tra Theo Tuần Học – Lớp ' + g + '</b>' +
            '<div class="muted" style="font-size:.86rem;line-height:1.65">Trên lớp học tới tuần nào, bấm chữ <b>Làm bài ›</b> ở đúng ô đó để rèn đề &amp; tự tính điểm trung bình học kì.</div>' +
          '</div>' +
          '<button type="button" class="btn sm ' + (simMode ? 'on' : 'alt') + '" id="gb-sim-btn">' + (simMode ? '✕ Đóng tính thử' : '🧮 Nhập thử điểm trường') + '</button>' +
        '</div>' +
        '<div class="gb-wrap">' +
          '<table class="gb-table">' +
            '<thead>' +
              '<tr>' +
                '<th rowspan="2">Học kì</th>' +
                '<th colspan="3" class="gb-stage-h1">Nửa đầu học kì → Giữa kì</th>' +
                '<th colspan="3" class="gb-stage-h2">Sau Giữa kì → Cuối kì</th>' +
                '<th rowspan="2">ĐTB kì</th>' +
              '</tr>' +
              '<tr>' +
                '<th>KT 15 phút<br><small>Lần 1</small></th>' +
                '<th>KT 15 phút<br><small>Lần 2</small></th>' +
                '<th class="gb-milestone">Kiểm tra<br>Giữa kì</th>' +
                '<th>KT 15 phút<br><small>Lần 3</small></th>' +
                '<th>KT 15 phút<br><small>Lần 4</small></th>' +
                '<th class="gb-milestone">Kiểm tra<br>Cuối kì</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                '<td><b>Học kì I</b><br><small class="muted">Tuần 1–18</small></td>' +
                cellHtml('hk1-tx1', false) + cellHtml('hk1-tx2', false) + cellHtml('hk1-gk', true) +
                cellHtml('hk1-tx3', false) + cellHtml('hk1-tx4', false) + cellHtml('hk1-ck', true) +
                '<td id="gb-avg-hk1"><b>' + (gb.hk1 != null ? fmtNum(gb.hk1.toFixed(1)) : '—') + '</b></td>' +
              '</tr>' +
              '<tr>' +
                '<td><b>Học kì II</b><br><small class="muted">Tuần 19–35</small></td>' +
                cellHtml('hk2-tx1', false) + cellHtml('hk2-tx2', false) + cellHtml('hk2-gk', true) +
                cellHtml('hk2-tx3', false) + cellHtml('hk2-tx4', false) + cellHtml('hk2-ck', true) +
                '<td id="gb-avg-hk2"><b>' + (gb.hk2 != null ? fmtNum(gb.hk2.toFixed(1)) : '—') + '</b></td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="row between" style="font-size:.9rem">' +
          '<span id="gb-year-summary"><b>Điểm TB cả năm:</b> ' + (gb.cn != null ? ('<b class="done">' + fmtNum(gb.cn.toFixed(1)) + '</b> (' + rankLabel(gb.cn) + ')') : 'Bấm <b>Làm bài ›</b> ở từng cột hoặc bấm <b>Nhập thử điểm trường</b> để tính điểm tổng kết.') + '</span>' +
          '<span class="muted">' + fmtMath('ĐTB_kì = \\frac{Tổng điểm 15p + 2·GK + 3·CK}{Số bài 15p + 5}') + '</span>' +
        '</div>' +
      '</section>';

    containerEl.innerHTML = h;
    containerEl.querySelector('#gb-sim-btn').onclick = function(){
      simMode = !simMode;
      render();
      if (simMode) recalcSim();
    };

    function recalcSim(){
      var vals = {};
      containerEl.querySelectorAll('.gb-inp').forEach(function(inp){
        var v = parseNumInput(inp.value);
        vals[inp.dataset.col] = (!isNaN(v) && v >= 0 && v <= 10) ? v : null;
      });
      function termSim(p){
        var txs = [vals[p+'-tx1'], vals[p+'-tx2'], vals[p+'-tx3'], vals[p+'-tx4']].filter(function(x){ return x != null; });
        var gk = vals[p+'-gk'], ck = vals[p+'-ck'];
        if (txs.length < 3 || gk == null || ck == null) return null;
        var sumTx = txs.reduce(function(a, b){ return a + b; }, 0);
        return round1((sumTx + 2*gk + 3*ck) / (txs.length + 5));
      }
      var s1 = termSim('hk1'), s2 = termSim('hk2');
      var scn = (s1 != null && s2 != null) ? round1((s1 + 2*s2) / 3) : null;
      containerEl.querySelector('#gb-avg-hk1').innerHTML = '<b>' + (s1 != null ? fmtNum(s1.toFixed(1)) : '—') + '</b>';
      containerEl.querySelector('#gb-avg-hk2').innerHTML = '<b>' + (s2 != null ? fmtNum(s2.toFixed(1)) : '—') + '</b>';
      containerEl.querySelector('#gb-year-summary').innerHTML =
        '<b>ĐTB cả năm (tính thử):</b> ' + (scn != null ? ('<b class="done">' + fmtNum(scn.toFixed(1)) + ' / 10</b> — Xếp loại: <b>' + rankLabel(scn) + '</b>') : 'Nhập điểm từ 0 đến 10 (có thể xóa trống Lần 4 nếu trường chỉ lấy 3 bài 15p).');
    }

    if (simMode) {
      containerEl.querySelectorAll('.gb-inp').forEach(function(inp){
        inp.oninput = recalcSim;
      });
    }
  }

  render();
}

// --- Shared Question Renderer ---
function renderQ(q, displayIdx, opts){
  opts = opts || {};
  var deferred = !!opts.deferred;
  var box = document.createElement('article');
  box.className = 'q';

  var choices = q.o ? (opts.order && opts.order.length === q.o.length ? opts.order : shuffle(q.o)) : null;
  var topicBadge = opts.showTopic && opts.topic
    ? '<span class="badge">Lớp ' + opts.topic.grade + ' · ' + esc(opts.topic.title.replace(/^Bài \d+:\s*/, '')) + '</span>'
    : '';
  var typeLabel = q.o ? 'Chọn đáp án A, B, C, D' : 'Điền con số';

  var h =
    '<div class="q-head">' +
      '<div class="q-meta">' + diffBadge(q) + topicBadge + '<span class="badge">' + typeLabel + '</span></div>' +
      '<div class="q-text"><b>Câu ' + (displayIdx + 1) + '.</b> ' + fmtMath(q.q) + '</div>' +
    '</div>';

  if (choices) {
    var letters = ['A', 'B', 'C', 'D'];
    choices.forEach(function(o, oi){
      h += '<button type="button" class="opt" data-val="' + esc(o) + '"><b>' + (letters[oi] || '') + '.</b> ' + fmtMath(o) + '</button>';
    });
  } else {
    h +=
      '<div class="num">' +
        '<input type="text" inputmode="decimal" placeholder="Chỉ nhập số (VD: 1,5)" aria-label="Nhập đáp án số">' +
        (q.u ? '<span class="badge">' + esc(q.u) + '</span>' : '') +
        (deferred ? '' : '<button type="button" class="btn sm" data-act="check">✓ Kiểm tra đáp án</button>') +
      '</div>' +
      '<div class="fb-err" hidden></div>';
  }

  if (opts.hintText && !deferred) {
    h += '<div class="row" style="margin-top:8px"><button type="button" class="btn sm subtle" data-act="hint">💡 Xem gợi ý cách làm</button></div>' +
         '<div class="q-hint" hidden><b>Gợi ý:</b> ' + fmtMath(opts.hintText) + '</div>';
  }
  h += '<div class="fb" hidden></div>';
  box.innerHTML = h;

  var fb = box.querySelector('.fb');
  var errEl = box.querySelector('.fb-err');
  var hintBtn = box.querySelector('[data-act="hint"]');
  var hintBox = box.querySelector('.q-hint');
  var done = false;
  var selectedVal = null;

  if (hintBtn && hintBox) {
    hintBtn.onclick = function(){
      hintBox.hidden = !hintBox.hidden;
      hintBtn.textContent = hintBox.hidden ? '💡 Xem gợi ý cách làm' : 'Ẩn gợi ý';
    };
  }

  function applyResult(ok, answerState, silent, skipped){
    if (done) return;
    done = true;
    if (errEl) errEl.hidden = true;
    fb.hidden = false;
    fb.className = 'fb ' + (ok ? 'ok' : 'bad');

    var ansLine = '';
    if (!ok) {
      if (q.o) ansLine = '<br>👉 Đáp án đúng là: <b>' + fmtMath(q.o[0]) + '</b>';
      else if (q.n != null) ansLine = '<br>👉 Đáp số đúng là: <b>' + fmtNum(q.n) + (q.u ? ' ' + esc(q.u) : '') + '</b>';
    }
    var headText = ok ? '🎉 Chính xác! Giỏi lắm.' : (skipped ? '⚠️ Câu này chưa điền đáp án (0 điểm).' : '💡 Chưa đúng rồi — xem cách giải bên dưới nhé:');
    fb.innerHTML =
      '<div><b>' + headText + '</b> ' + ansLine + '</div>' +
      (q.w ? '<div style="margin-top:5px"><b>Cách giải dễ hiểu:</b> ' + fmtMath(q.w) + '</div>' : '');

    box.querySelectorAll('.opt, input, [data-act="check"]').forEach(function(x){ x.disabled = true; });
    if (hintBtn) hintBtn.hidden = true;

    if (!silent && typeof opts.onAnswer === 'function') {
      opts.onAnswer(ok, answerState);
    }
  }

  if (choices) {
    var optBtns = box.querySelectorAll('.opt');
    optBtns.forEach(function(b){
      b.onclick = function(){
        if (done) return;
        var val = b.dataset.val;
        if (deferred) {
          selectedVal = val;
          optBtns.forEach(function(x){ x.classList.toggle('selected', x === b); });
          if (typeof opts.onSelect === 'function') opts.onSelect();
          return;
        }
        var ok = val === q.o[0];
        b.classList.add(ok ? 'ok' : 'bad');
        if (!ok) {
          optBtns.forEach(function(x){
            if (x.dataset.val === q.o[0]) x.classList.add('ok');
          });
        }
        applyResult(ok, { ok: ok, chosen: val }, false, false);
      };
    });
    if (!deferred && opts.savedAnswer) {
      optBtns.forEach(function(b){
        if (b.dataset.val === opts.savedAnswer.chosen) {
          b.classList.add(opts.savedAnswer.ok ? 'ok' : 'bad');
        }
        if (!opts.savedAnswer.ok && b.dataset.val === q.o[0]) {
          b.classList.add('ok');
        }
      });
      applyResult(!!opts.savedAnswer.ok, opts.savedAnswer, true, false);
    }
  } else {
    var inp = box.querySelector('input');
    var chk = box.querySelector('[data-act="check"]');
    if (deferred) {
      inp.oninput = function(){
        if (typeof opts.onSelect === 'function') opts.onSelect();
      };
    } else {
      chk.onclick = function(){
        var v = parseNumInput(inp.value, q.u);
        if (isNaN(v)) {
          errEl.textContent = 'Bạn chỉ cần gõ con số kết quả thôi nhé (ví dụ: 2,5 hoặc 50), không cần gõ chữ.';
          errEl.hidden = false;
          inp.focus();
          return;
        }
        var ok = Math.abs(v - q.n) <= (q.t || 0) + 1e-9;
        applyResult(ok, { ok: ok, input: inp.value.trim() }, false, false);
      };
      inp.onkeydown = function(e){ if (e.key === 'Enter') chk.click(); };
      if (opts.savedAnswer) {
        inp.value = opts.savedAnswer.input || '';
        applyResult(!!opts.savedAnswer.ok, opts.savedAnswer, true, false);
      }
    }
  }

  box._isAnswered = function(){
    if (choices) return selectedVal != null;
    var inputEl = box.querySelector('input');
    return inputEl && inputEl.value.trim().length > 0;
  };
  box._grade = function(){
    if (choices) {
      var skipped = selectedVal == null;
      var ok = !skipped && selectedVal === q.o[0];
      box.querySelectorAll('.opt').forEach(function(b){
        b.classList.remove('selected');
        if (b.dataset.val === q.o[0]) b.classList.add('ok');
        else if (b.dataset.val === selectedVal && !ok) b.classList.add('bad');
      });
      applyResult(ok, { ok: ok, chosen: selectedVal }, true, skipped);
      return { ok: ok, skipped: skipped, diff: getDiff(q) };
    } else {
      var inputEl = box.querySelector('input');
      var raw = inputEl ? inputEl.value.trim() : '';
      var skippedNum = raw.length === 0;
      var v = parseNumInput(raw, q.u);
      var okNum = !skippedNum && !isNaN(v) && Math.abs(v - q.n) <= (q.t || 0) + 1e-9;
      applyResult(okNum, { ok: okNum, input: raw }, true, skippedNum);
      return { ok: okNum, skipped: skippedNum, diff: getDiff(q) };
    }
  };
  box._choices = choices;
  return box;
}

// Helper: strictly single-lesson snapshot (ZERO leakage from other lessons!)
function createFreshLessonSnapshot(topic, diffFilter, currentQuestions){
  var items = [];
  var src = (currentQuestions && currentQuestions.length)
    ? currentQuestions
    : (BANK ? BANK.sampleLessonSet(topic, 4).items : getTopicPool(topic, 3));

  src.forEach(function(item){
    if (diffFilter && diffFilter !== 'all' && String(item.d) !== String(diffFilter)) return;
    items.push({ topicTitle: '', q: item.q });
  });

  var diffNote = diffFilter && diffFilter !== 'all' ? ' · ' + DIFF[Number(diffFilter)] : ' · Chỉ gồm kiến thức bài này';
  return window.KHTNPrint.prepare({
    prefix: 'L' + topic.grade,
    docTitle: 'PHIẾU BÀI TẬP THEO BÀI – KHTN LỚP ' + topic.grade,
    subtitle: topic.title + diffNote,
    lesson: (!diffFilter || diffFilter === 'all') ? topic : null,
    items: items
  });
}

// Helper: STRICTLY scoped exam item builder
function buildExamItems(exam, levelMode){
  var all = [];
  var seenQ = {};
  (exam.topics || []).forEach(function(tid){
    var t = byId[tid];
    if (!t) return;
    var rounds = exam.topics.length === 1 ? 2 : 3;
    getTopicPool(t, rounds).forEach(function(item){
      if (seenQ[item.q.q]) return;
      seenQ[item.q.q] = true;
      all.push({ t: t, q: item.q, qIndex: item.staticIdx, d: item.d });
    });
  });

  var mode = levelMode || exam.presetLevel || 'standard';
  var target = Math.min(exam.count || 10, all.length);
  var b1 = shuffle(all.filter(function(x){ return x.d === 1; }));
  var b2 = shuffle(all.filter(function(x){ return x.d === 2; }));
  var b3 = shuffle(all.filter(function(x){ return x.d === 3; }));
  var b4 = shuffle(all.filter(function(x){ return x.d === 4; }));

  var want1, want2, want3, want4;
  if (mode === 'basic') {
    want1 = Math.round(target * 0.55);
    want2 = target - want1;
    want3 = 0;
    want4 = 0;
  } else if (mode === 'advanced') {
    want1 = Math.max(1, Math.round(target * 0.10));
    want2 = Math.round(target * 0.25);
    want3 = Math.round(target * 0.35);
    want4 = Math.max(0, target - want1 - want2 - want3);
  } else {
    want1 = Math.round(target * 0.40);
    want2 = Math.round(target * 0.30);
    want3 = Math.round(target * 0.20);
    want4 = Math.max(0, target - want1 - want2 - want3);
  }

  var picked = [];
  var used = {};
  function takeFrom(arr, n){
    for (var i = 0; i < arr.length && n > 0; i++) {
      var k = arr[i].q.q;
      if (used[k]) continue;
      used[k] = true;
      picked.push(arr[i]);
      n--;
    }
  }
  takeFrom(b1, want1);
  takeFrom(b2, want2);
  takeFrom(b3, want3);
  takeFrom(b4, want4);

  if (picked.length < target) {
    var rest = shuffle(all).filter(function(x){ return !used[x.q.q]; });
    takeFrom(rest, target - picked.length);
  }
  picked.sort(function(a, b){ return a.d - b.d; });
  return picked;
}

function collectExamProblemTypes(topicsList){
  var TYPES = window.KHTN_TYPES || {};
  var out = [];
  (topicsList || []).forEach(function(tid){
    var t = byId[tid];
    if (t && TYPES[tid] && TYPES[tid].length) {
      out.push({ title: t.title, types: TYPES[tid] });
    }
  });
  return out;
}

function createFreshExamSnapshot(ex, levelMode){
  var m = levelMode || ex.presetLevel || 'standard';
  var mTxt = m === 'basic' ? 'Mức Dễ – Lấy gốc' : (m === 'advanced' ? 'Mức Nâng cao' : 'Vừa sức trên lớp');
  var picks = buildExamItems(ex, m);
  var snap = window.KHTNPrint.prepare({
    prefix: 'KT' + ex.grade,
    docTitle: ex.title.toUpperCase(),
    subtitle: 'KHTN Lớp ' + ex.grade + ' · ' + ex.term + (ex.weeks ? ' (' + ex.weeks + ')' : '') + ' · ' + mTxt + ' · ' + ex.scope,
    minutes: ex.minutes,
    isExam: true,
    problemTypes: collectExamProblemTypes(ex.topics),
    items: picks.map(function(p){ return { topicTitle: p.t.title.replace(/^Bài \d+:\s*/, ''), q: p.q }; })
  });
  quickExamSpecs[ex.id + '::' + m] = snap;
  return snap;
}

function getOrCreateExamPrintSpec(ex, levelMode){
  var key = ex.id + '::' + (levelMode || ex.presetLevel || 'standard');
  return quickExamSpecs[key] || createFreshExamSnapshot(ex, levelMode);
}

// --- VIEW 1: Home (2-Step Quick Start for Non-Tech Users + Voice Search + Clear Navigation) ---
function home(){
  updateNavActive('home');
  var prog = loadProg();
  var mistakes = loadMistakes();
  var examStats = loadExams();
  var mistakeCount = Object.keys(mistakes).length;
  var completed = D.filter(function(t){ return isMastered(t.id); }).length;
  var scores = Object.keys(prog).map(function(id){ return prog[id].best; }).filter(function(v){ return typeof v === 'number'; });
  var avgScore = scores.length ? score10(scores.reduce(function(a,b){ return a+b; }, 0) / scores.length) : '—';
  var examsDone = Object.keys(examStats).length;
  var resume = getResumeTarget();
  var resumeTopic = resume ? byId[resume.id] : null;
  var chosenGrade = getPrefGrade();
  var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function renderQuickActionsHtml(g){
    var gLessons = D.filter(function(t){ return t.grade === g; }).length;
    var gExams = EXAMS.filter(function(e){ return e.grade === g; }).length;
    return (
      '<a class="action-card primary-act" href="#/lop/' + g + '">' +
        '<span class="act-ico" aria-hidden="true">📖</span>' +
        '<span class="act-body">' +
          '<b>1. Vào học bài trên lớp (Lớp ' + g + ')</b>' +
          '<span>Có ' + gLessons + ' bài tóm tắt ngắn gọn, nghe đọc thành tiếng, ví dụ mẫu và câu hỏi từ Dễ → Khó.</span>' +
        '</span>' +
      '</a>' +
      '<a class="action-card primary-act" href="#/de-kiem-tra/' + g + '">' +
        '<span class="act-ico" aria-hidden="true">📝</span>' +
        '<span class="act-body">' +
          '<b>2. Làm đề 15 phút · Giữa kì · Cuối kì (Lớp ' + g + ')</b>' +
          '<span>Có ' + gExams + ' đề sắp đúng thứ tự tuần học ở trường. Bấm chọn đáp án, biết điểm ngay.</span>' +
        '</span>' +
      '</a>' +
      '<a class="action-card" href="#/in-nhanh/' + g + '">' +
        '<span class="act-ico" aria-hidden="true">🖨️</span>' +
        '<span class="act-body">' +
          '<b>3. In đề giấy A4 kèm Đáp án riêng (Lớp ' + g + ')</b>' +
          '<span>Dành cho phụ huynh &amp; thầy cô: 1 bấm in ra tờ Đề cho con làm và tờ Đáp án ở trang sau.</span>' +
        '</span>' +
      '</a>' +
      '<a class="action-card" href="' + (mistakeCount ? '#/luyen-tap/cau-sai' : '#/so-tay') + '">' +
        '<span class="act-ico" aria-hidden="true">' + (mistakeCount ? '🔁' : '📐') + '</span>' +
        '<span class="act-body">' +
          '<b>' + (mistakeCount ? ('4. Ôn lại ' + mistakeCount + ' câu từng làm sai') : '4. Xem Sổ tay Công thức dễ hiểu') + '</b>' +
          '<span>' + (mistakeCount ? 'Hệ thống tự gom lại các câu chưa vững để em làm lại cho nhớ bài.' : 'Tra cứu nhanh toàn bộ công thức Hóa · Lý · Sinh có giải thích từng kí hiệu.') + '</span>' +
        '</span>' +
      '</a>'
    );
  }

  var h =
    '<section class="quick-box" aria-label="Chọn nhanh trong 2 bước">' +
      '<div class="quick-head">' +
        '<span class="quick-badge">✨ Miễn phí 100% · Bấm vào dùng ngay, không cần đăng nhập</span>' +
        '<div class="row">' +
          '<button type="button" class="btn sm subtle" id="home-help-btn">❓ Cách dùng (30 giây)</button>' +
          '<button type="button" class="btn sm alt" id="home-share-btn">📤 Gửi link qua Zalo</button>' +
        '</div>' +
      '</div>' +
      '<h1 style="margin:0 0 4px">SciBook</h1>' + +
      '<p class="muted" style="margin:0 0 12px">Dành cho học sinh tự học ở nhà, phụ huynh kèm con và thầy cô lấy đề in giấy — chỉ cần <b>2 bước đơn giản</b>:</p>' +

      '<div class="step-label"><span class="step-num">1</span><span>Chọn lớp đang học:</span></div>' +
      '<div class="grade-pills" id="home-grade-pills">' +
        [6,7,8,9].map(function(gr){
          var lc = D.filter(function(t){ return t.grade === gr; }).length;
          var ec = EXAMS.filter(function(e){ return e.grade === gr; }).length;
          var sub = lc + ' bài · ' + ec + ' đề KT' + ((gr === 7 || gr === 8) ? ' ★' : '');
          return '<button type="button" class="grade-pill ' + (chosenGrade === gr ? 'on' : '') + '" data-g="' + gr + '">' +
            '<b>Lớp ' + gr + '</b><small>' + sub + '</small></button>';
        }).join('') +
      '</div>' +

      '<div class="step-label"><span class="step-num">2</span><span id="step2-title">Chọn việc muốn làm ngay (Đang chọn Lớp ' + chosenGrade + '):</span></div>' +
      '<div class="action-grid" id="home-actions">' +
        renderQuickActionsHtml(chosenGrade) +
      '</div>' +
    '</section>';

  // Global Instant Search + Voice Search
  h +=
    '<section class="search-hero" aria-label="Tìm nhanh bài học hoặc đề kiểm tra">' +
      '<label for="home-search" style="display:block;font-weight:750;margin-bottom:6px">🔍 Tìm nhanh bài học hoặc công thức (không cần gõ dấu tiếng Việt):</label>' +
      '<div class="search-bar-row">' +
        '<input type="search" id="home-search" placeholder="Ví dụ: mol, tốc độ, áp suất, hóa trị, quang hợp, điện…">' +
        (SpeechRec ? '<button type="button" class="mic-btn" id="home-mic-btn">🎤 Bấm nói tên bài</button>' : '') +
      '</div>' +
      '<div class="row" style="margin-top:8px">' +
        '<span class="muted" style="font-size:.84rem">Bấm thử:</span>' +
        '<button type="button" class="chip" data-q="mol">Bài Mol (Lớp 8)</button>' +
        '<button type="button" class="chip" data-q="áp suất">Áp suất (Lớp 8)</button>' +
        '<button type="button" class="chip" data-q="tốc độ">Tốc độ (Lớp 7)</button>' +
        '<button type="button" class="chip" data-q="hóa trị">Hóa trị (Lớp 7)</button>' +
        '<button type="button" class="chip" data-q="quang hợp">Quang hợp (Lớp 7)</button>' +
      '</div>' +
      '<div id="home-search-out" class="search-results" hidden></div>' +
    '</section>';

  // Resume + Progress Strip
  h += '<div class="grid two" style="margin-bottom:18px">';
  if (resumeTopic) {
    h +=
      '<a class="card highlight" href="#/bai/' + resumeTopic.id + '">' +
        '<div class="row between"><span class="badge pri">▶ Học tiếp ngay</span>' + tag(resumeTopic.subj) + '</div>' +
        '<h3 style="margin:.45em 0 .2em;font-size:1.1rem">' + esc(resumeTopic.title) + '</h3>' +
        '<div class="muted" style="font-size:.9rem">Lớp ' + resumeTopic.grade + (resumeTopic.weeks ? ' · ' + resumeTopic.weeks : '') + ' · Bấm vào để mở tiếp bài học &amp; giấy nháp</div>' +
      '</a>';
  }
  h +=
    '<div class="card">' +
      '<div class="row between"><span class="badge">📊 Kết quả trên máy này</span><a href="#/tien-do" style="font-size:.9rem;font-weight:700">Mở Sổ điểm ›</a></div>' +
      '<div class="row" style="gap:18px;margin-top:10px">' +
        '<div><div class="stat-val">' + completed + '/' + D.length + '</div><div class="muted" style="font-size:.84rem">Bài đã vững</div></div>' +
        '<div><div class="stat-val">' + avgScore + '</div><div class="muted" style="font-size:.84rem">Điểm TB bài</div></div>' +
        '<div><div class="stat-val">' + examsDone + '</div><div class="muted" style="font-size:.84rem">Đề đã làm</div></div>' +
        '<div><div class="stat-val">' + mistakeCount + '</div><div class="muted" style="font-size:.84rem">Câu cần ôn</div></div>' +
      '</div>' +
    '</div>';
  h += '</div>';

  // Bookshelf 4 Volumes
  h += '<h2>📚 Tủ Sách 4 Lớp (Chương trình GDPT 2018 của Bộ GD&amp;ĐT)</h2><div class="grid">';
  [6,7,8,9].forEach(function(g){
    var l = D.filter(function(t){ return t.grade === g; });
    var exCount = EXAMS.filter(function(ex){ return ex.grade === g; }).length;
    var p = pct(l);
    var totalQ = BANK ? BANK.estimateTotalQuestions(l) : l.reduce(function(s,t){ return s + t.questions.length; }, 0);
    h +=
      '<a class="vol-card v' + g + '" href="#/lop/' + g + '">' +
        '<div class="row between"><span class="vol-label">Sách Lớp ' + g + '</span><span class="badge ' + ((g === 7 || g === 8) ? 'pri' : (p === 100 ? 'ok' : '')) + '">' + ((g === 7 || g === 8) ? 'Đầy đủ 4 giai đoạn' : p + '%') + '</span></div>' +
        '<h2 style="margin:.2em 0 .15em">KHTN Lớp ' + g + '</h2>' +
        '<div class="muted" style="margin-top:2px;font-size:.9rem">' + l.length + ' bài học · ' + totalQ + '+ câu hỏi · ' + exCount + ' đề KT</div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
        '<small class="muted">Đã nắm vững ' + l.filter(function(t){ return isMastered(t.id); }).length + '/' + l.length + ' bài (' + p + '%)</small>' +
      '</a>';
  });
  h += '</div>';

  app.innerHTML = h;

  document.getElementById('home-help-btn').onclick = openHelpModal;
  document.getElementById('home-share-btn').onclick = function(){ openShareModal(); };

  // Wire Step 1 Grade Pills
  var pillsWrap = document.getElementById('home-grade-pills');
  var actionsWrap = document.getElementById('home-actions');
  var step2Title = document.getElementById('step2-title');
  pillsWrap.querySelectorAll('.grade-pill').forEach(function(btn){
    btn.onclick = function(){
      chosenGrade = Number(btn.dataset.g);
      setPrefGrade(chosenGrade);
      pillsWrap.querySelectorAll('.grade-pill').forEach(function(x){ x.classList.toggle('on', x === btn); });
      step2Title.textContent = 'Chọn việc muốn làm ngay (Đang chọn Lớp ' + chosenGrade + '):';
      actionsWrap.innerHTML = renderQuickActionsHtml(chosenGrade);
    };
  });

  // Wire Instant Search + Voice Recognition
  var sInput = document.getElementById('home-search');
  var sOut = document.getElementById('home-search-out');

  function runHomeSearch(raw){
    var q = normVi(raw);
    if (!q) {
      sOut.hidden = true;
      sOut.innerHTML = '';
      return;
    }
    var matchedTopics = D.filter(function(t){
      return normVi(t.title + ' ' + 'lop ' + t.grade + ' ' + t.formulas.join(' ') + ' ' + t.theory.join(' ')).indexOf(q) > -1;
    }).slice(0, 6);

    var matchedExams = EXAMS.filter(function(ex){
      return normVi(ex.title + ' lop ' + ex.grade + ' ' + ex.scope).indexOf(q) > -1;
    }).slice(0, 4);

    if (!matchedTopics.length && !matchedExams.length) {
      sOut.hidden = false;
      sOut.innerHTML = '<div class="empty" style="padding:12px">Không tìm thấy bài nào có từ <b>"' + esc(raw) + '"</b>. Bạn thử gõ ngắn hơn (ví dụ: <b>mol</b>, <b>điện</b>, <b>tốc độ</b>) nhé!</div>';
      return;
    }

    var rows = '';
    matchedTopics.forEach(function(t){
      var singleEx = EXAMS.find(function(e){ return e.topics.length === 1 && e.topics[0] === t.id; });
      rows +=
        '<div class="s-item">' +
          '<div>' + tag(t.subj) + ' <b>Lớp ' + t.grade + ' – ' + esc(t.title) + '</b>' +
            (t.weeks ? ' <small class="muted">(' + esc(t.weeks) + ')</small>' : '') +
          '</div>' +
          '<div class="row">' +
            '<a class="btn sm" href="#/bai/' + t.id + '">📖 Học bài này</a>' +
            (singleEx ? '<a class="btn sm alt" href="#/lam-de/' + singleEx.id + '">📝 Đề 15p</a>' : '') +
          '</div>' +
        '</div>';
    });
    matchedExams.forEach(function(ex){
      rows +=
        '<div class="s-item">' +
          '<div><span class="badge pri">Đề KT Lớp ' + ex.grade + '</span> <b>' + esc(ex.title) + '</b> <small class="muted">(' + ex.minutes + ' phút)</small></div>' +
          '<div class="row">' +
            '<a class="btn sm" href="#/lam-de/' + ex.id + '">📝 Làm đề</a>' +
          '</div>' +
        '</div>';
    });
    sOut.hidden = false;
    sOut.innerHTML = rows;
  }

  sInput.oninput = function(){ runHomeSearch(sInput.value); };
  app.querySelectorAll('[data-q]').forEach(function(chip){
    chip.onclick = function(){
      sInput.value = chip.dataset.q;
      runHomeSearch(chip.dataset.q);
    };
  });

  var micBtn = document.getElementById('home-mic-btn');
  if (micBtn && SpeechRec) {
    var rec = null;
    micBtn.onclick = function(){
      if (rec) {
        try { rec.stop(); } catch (e) {}
        return;
      }
      try {
        rec = new SpeechRec();
        rec.lang = 'vi-VN';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        micBtn.classList.add('listening');
        micBtn.textContent = '🔴 Đang nghe… Hãy nói tên bài';
        rec.onresult = function(ev){
          var txt = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
          if (txt) {
            sInput.value = txt;
            runHomeSearch(txt);
            showToast('🎤 Đã nghe: "' + txt + '"');
          }
        };
        rec.onerror = function(){
          showToast('Không nghe rõ hoặc trình duyệt chưa cấp quyền micro. Bạn có thể gõ chữ vào ô tìm kiếm nhé.');
        };
        rec.onend = function(){
          micBtn.classList.remove('listening');
          micBtn.textContent = '🎤 Bấm nói tên bài';
          rec = null;
        };
        rec.start();
      } catch (e) {
        micBtn.classList.remove('listening');
        rec = null;
      }
    };
  }
}

// --- Stage-Based Exam Explorer Renderer ---
var EXAM_STAGE_FILTERS = [
  { key:'all', label:'Cả năm (4 giai đoạn)' },
  { key:'s1',  label:'Đầu HK1 → Giữa kì I' },
  { key:'s2',  label:'Sau GK1 → Cuối kì I' },
  { key:'s3',  label:'Đầu HK2 → Giữa kì II' },
  { key:'s4',  label:'Sau GK2 → Cuối kì II' },
  { key:'15p', label:'Chỉ đề 15 phút' },
  { key:'gkck',label:'Chỉ đề Giữa kì & Cuối kì' }
];

function matchStageFilter(ex, fKey){
  if (!fKey || fKey === 'all') return true;
  if (fKey === 's1') return ex.stage === 1;
  if (fKey === 's2') return ex.stage === 2;
  if (fKey === 's3') return ex.stage === 3;
  if (fKey === 's4') return ex.stage === 4;
  if (fKey === '15p') return ex.kind === '15p';
  if (fKey === 'gkck') return ex.kind === 'gk' || ex.kind === 'ck';
  return true;
}

function renderExamCardHtml(ex, saved){
  var st = saved[ex.id];
  var stageTag = (ex.stage === 1 || ex.stage === 3) ? 'Trước Giữa kì' : 'Sau Giữa kì';
  var colBadge = ex.kind === 'gk'
    ? '<span class="badge warn">Đề Giữa học kì</span>'
    : (ex.kind === 'ck'
      ? '<span class="badge d4">Đề Cuối học kì</span>'
      : (ex.col
        ? '<span class="badge pri">Kiểm tra 15p · ' + stageTag + '</span>'
        : (ex.kind === '15p'
          ? '<span class="badge ok">15p theo bài · ' + stageTag + '</span>'
          : '<span class="badge">Đề ôn tổng hợp</span>')));

  return (
    '<div class="card">' +
      '<div class="row between">' +
        colBadge +
        '<span class="badge">' + (ex.weeks ? esc(ex.weeks) + ' · ' : '') + ex.minutes + ' phút · ' + ex.count + ' câu</span>' +
      '</div>' +
      '<h3 style="margin:.5em 0 .2em;font-size:1.06rem">' + esc(ex.title) + '</h3>' +
      '<div class="muted" style="font-size:.89rem;margin-bottom:10px">' + esc(ex.scope) + '</div>' +
      (st ? '<div class="' + (st.best >= 0.65 ? 'done' : 'muted') + '" style="font-size:.89rem;margin-bottom:10px">Điểm cao nhất: ' + score10(st.best) + '/10 · Gần nhất: ' + score10(st.last) + '/10 (' + st.attempts + ' lần làm)</div>' : '') +
      '<div class="row">' +
        '<a class="btn sm" href="#/lam-de/' + ex.id + '">▶ Làm đề ngay</a>' +
        '<button type="button" class="btn sm alt" data-print-both="' + ex.id + '">🖨️ In Đề + Đáp án</button>' +
      '</div>' +
    '</div>'
  );
}

function wirePrintButtons(rootEl){
  rootEl.querySelectorAll('[data-print-both]').forEach(function(b){
    b.onclick = function(){
      var ex = examById[b.getAttribute('data-print-both')];
      if (!ex) return;
      window.KHTNPrint.open(getOrCreateExamPrintSpec(ex), 'both', {
        onRegenerate: function(){ return createFreshExamSnapshot(ex); }
      });
    };
  });
  rootEl.querySelectorAll('[data-print-quiz]').forEach(function(b){
    b.onclick = function(){
      var ex = examById[b.getAttribute('data-print-quiz')];
      if (!ex) return;
      window.KHTNPrint.open(getOrCreateExamPrintSpec(ex), 'quiz', {
        onRegenerate: function(){ return createFreshExamSnapshot(ex); }
      });
    };
  });
  rootEl.querySelectorAll('[data-print-key]').forEach(function(b){
    b.onclick = function(){
      var ex = examById[b.getAttribute('data-print-key')];
      if (!ex) return;
      window.KHTNPrint.open(getOrCreateExamPrintSpec(ex), 'key', {
        onRegenerate: function(){ return createFreshExamSnapshot(ex); }
      });
    };
  });
}

function mountExamExplorer(containerEl, g, initialFilter){
  var fKey = initialFilter || 'all';
  var examsAll = EXAMS.filter(function(ex){ return ex.grade === g; });
  var saved = loadExams();

  function render(){
    if (!examsAll.length) {
      containerEl.innerHTML = '<div class="empty">Chưa có đề kiểm tra cho lớp này.</div>';
      return;
    }
    var h = '<div class="filters" id="ex-stage-bar">' +
      EXAM_STAGE_FILTERS.filter(function(f){
        return f.key === 'all' || examsAll.some(function(ex){ return matchStageFilter(ex, f.key); });
      }).map(function(f){
        var cnt = examsAll.filter(function(ex){ return matchStageFilter(ex, f.key); }).length;
        return '<button type="button" data-ef="' + f.key + '" class="' + (fKey === f.key ? 'on' : '') + '">' + f.label + ' (' + cnt + ')</button>';
      }).join('') +
      '</div>';

    [1, 2, 3, 4, 5].forEach(function(stNum){
      var group = examsAll.filter(function(ex){
        return (ex.stage || 1) === stNum && matchStageFilter(ex, fKey);
      });
      if (!group.length) return;
      var sm = STAGE_META[stNum];
      h +=
        '<div class="stage-block ' + (sm.term === 'HK2' ? 'hk2' : '') + '">' +
          '<h2 style="margin-top:0">' + esc(sm.title) + '</h2>' +
          '<p class="muted" style="margin:.2em 0 .9em;font-size:.9rem">' + esc(sm.note) + '</p>' +
          '<div class="grid two">' +
            group.map(function(ex){ return renderExamCardHtml(ex, saved); }).join('') +
          '</div>' +
        '</div>';
    });

    containerEl.innerHTML = h;
    containerEl.querySelectorAll('#ex-stage-bar button').forEach(function(b){
      b.onclick = function(){ fKey = b.dataset.ef; render(); };
    });
    wirePrintButtons(containerEl);
  }

  render();
}

// --- VIEW 2: Grade ---
function grade(g, activeTab){
  if ([6,7,8,9].indexOf(g) === -1) {
    updateNavActive('home');
    app.innerHTML = '<div class="empty"><p>Không có dữ liệu cho lớp này.</p><a class="btn" href="#/">Về trang chủ</a></div>';
    return;
  }
  setPrefGrade(g);
  updateNavActive('lop-' + g);
  var hasStages = (g === 7 || g === 8);
  var tab = activeTab === 'exams' ? 'exams' : (hasStages ? 'roadmap' : 'lessons');
  var filterSubj = 'all';
  var searchText = '';

  var list = D.filter(function(t){ return t.grade === g; }).slice().sort(function(a, b){
    return (a.order || 99) - (b.order || 99);
  });
  var gExams = EXAMS.filter(function(ex){ return ex.grade === g; });
  var presentSubjs = Object.keys(SUBJ).filter(function(s){
    return list.some(function(t){ return t.subj === s; });
  });

  function renderLessonCard(t){
    var b = best(t.id);
    var poolCount = getTopicPool(t, 4).length;
    return (
      '<a class="card" href="#/bai/' + t.id + '">' +
        '<div class="row between">' +
          '<div class="row" style="gap:5px">' + tag(t.subj) + (t.weeks ? '<span class="badge">' + esc(t.weeks) + '</span>' : '') + '</div>' +
          (b != null && b >= 0.67 ? '<span class="badge ok">✓ Đã vững</span>' : '<span class="badge pri">Học bài ›</span>') +
        '</div>' +
        '<h3 style="margin:.45em 0 .25em;font-size:1.04rem">' + esc(t.title) + '</h3>' +
        '<div class="muted" style="font-size:.86rem">' + (t.periods ? t.periods + ' tiết · ' : '') + poolCount + '+ câu hỏi từ Dễ → Khó</div>' +
        (b == null ? '' : '<div style="margin-top:6px;font-size:.89rem" class="' + (b >= 0.67 ? 'done' : 'muted') + '">Điểm cao nhất: ' + score10(b) + '/10</div>') +
      '</a>'
    );
  }

  function renderView(){
    var h =
      '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › Lớp ' + g + '</div>' +
      '<div class="row between">' +
        '<h1>Bài học &amp; Đề kiểm tra KHTN Lớp ' + g + '</h1>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="g-print-formulas">🖨️ In Sổ tay công thức lớp ' + g + '</button>' +
          '<a class="btn sm subtle" href="#/in-nhanh/' + g + '">🖨️ Kho đề in giấy A4</a>' +
          '<a class="btn sm subtle" href="#/kiem-tra/' + g + '">Kiểm tra gốc</a>' +
        '</div>' +
      '</div>' +
      '<div class="helper-tip">' +
        '<span>💡 <b>Cách học dễ nhất:</b> Bấm vào tên bài đang học trên lớp → đọc tóm tắt ngắn → làm câu hỏi từ Dễ đến Khó → làm đề 15 phút của bài đó.</span>' +
        '<div class="row">' +
          [6,7,8,9].map(function(gr){
            return '<a class="btn sm ' + (gr === g ? 'on' : 'subtle') + '" href="#/lop/' + gr + '">Lớp ' + gr + '</a>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div id="gb-slot"></div>' +
      '<div class="tabs">' +
        (hasStages ? '<button type="button" data-gtab="roadmap" class="' + (tab === 'roadmap' ? 'on' : '') + '">📅 Học theo thứ tự tuần trên lớp</button>' : '') +
        '<button type="button" data-gtab="lessons" class="' + (tab === 'lessons' ? 'on' : '') + '">📖 Tìm theo môn (' + list.length + ' bài)</button>' +
        '<button type="button" data-gtab="exams" class="' + (tab === 'exams' ? 'on' : '') + '">📝 Đề kiểm tra (' + gExams.length + ' đề)</button>' +
      '</div>' +
      '<div id="g-body"></div>';

    app.innerHTML = h;
    mountGradebookWidget(document.getElementById('gb-slot'), g);

    document.getElementById('g-print-formulas').onclick = function(){
      var TYPES = window.KHTN_TYPES || {};
      var spec = window.KHTNPrint.prepare({
        prefix: 'ST' + g,
        subtitle: 'Toàn bộ công thức & các dạng bài trọng tâm KHTN Lớp ' + g + ' (GDPT 2018)',
        formulaGroups: list.map(function(t){ return { grade: t.grade, title: t.title, formulas: t.formulas, types: TYPES[t.id] || null }; })
      });
      window.KHTNPrint.open(spec, 'formulas');
    };

    app.querySelectorAll('[data-gtab]').forEach(function(b){
      b.onclick = function(){ tab = b.dataset.gtab; renderView(); };
    });

    var bodyEl = document.getElementById('g-body');
    var savedEx = loadExams();

    if (tab === 'roadmap') {
      var rHtml = '';
      [1, 2, 3, 4].forEach(function(stNum){
        var stLessons = list.filter(function(t){ return t.stage === stNum; });
        var stExams = gExams.filter(function(ex){ return ex.stage === stNum; });
        var sm = STAGE_META[stNum];
        rHtml +=
          '<section class="stage-block ' + (sm.term === 'HK2' ? 'hk2' : '') + '">' +
            '<h2 style="margin-top:0">' + esc(sm.title) + '</h2>' +
            '<p class="muted" style="margin:.2em 0 .8em;font-size:.9rem">' + esc(sm.note) + '</p>' +
            '<h3>📖 Bước 1: Chọn bài học trên lớp (' + stLessons.length + ' bài)</h3>' +
            '<div class="grid">' + stLessons.map(renderLessonCard).join('') + '</div>' +
            '<h3 style="margin-top:14px">📝 Bước 2: Làm đề kiểm tra 15p &amp; Giữa kì / Cuối kì của giai đoạn này (' + stExams.length + ' đề)</h3>' +
            '<div class="grid two">' + stExams.map(function(ex){ return renderExamCardHtml(ex, savedEx); }).join('') + '</div>' +
          '</section>';
      });
      bodyEl.innerHTML = rHtml;
      wirePrintButtons(bodyEl);
    } else if (tab === 'lessons') {
      bodyEl.innerHTML =
        '<input type="search" id="g-search" placeholder="🔍 Gõ tên bài hoặc công thức lớp ' + g + ' cần tìm…" value="' + esc(searchText) + '">' +
        '<div class="filters" id="g-subj">' +
          '<button type="button" data-s="all" class="' + (filterSubj === 'all' ? 'on' : '') + '">Tất cả (' + list.length + ')</button>' +
          presentSubjs.map(function(s){
            var cnt = list.filter(function(t){ return t.subj === s; }).length;
            return '<button type="button" data-s="' + s + '" class="' + (filterSubj === s ? 'on' : '') + '">' + SUBJ[s] + ' (' + cnt + ')</button>';
          }).join('') +
        '</div>' +
        '<div id="g-cards"></div>';

      function refreshCards(){
        var q = normVi(searchText);
        var filtered = list.filter(function(t){
          if (filterSubj !== 'all' && t.subj !== filterSubj) return false;
          if (q && normVi(t.title + ' ' + t.formulas.join(' ')).indexOf(q) === -1) return false;
          return true;
        });
        document.getElementById('g-cards').innerHTML = filtered.length
          ? '<div class="grid">' + filtered.map(renderLessonCard).join('') + '</div>'
          : '<div class="empty">Không tìm thấy bài phù hợp.</div>';
      }
      refreshCards();
      bodyEl.querySelectorAll('#g-subj button').forEach(function(b){
        b.onclick = function(){
          filterSubj = b.dataset.s;
          bodyEl.querySelectorAll('#g-subj button').forEach(function(x){ x.classList.toggle('on', x === b); });
          refreshCards();
        };
      });
      document.getElementById('g-search').oninput = function(e){ searchText = e.target.value; refreshCards(); };
    } else {
      mountExamExplorer(bodyEl, g, 'all');
    }
  }

  renderView();
}

// --- VIEW 3: Lesson ---
function lesson(id){
  var t = byId[id];
  if (!t) {
    updateNavActive('home');
    app.innerHTML = '<div class="empty"><p>Không tìm thấy bài học.</p><a class="btn" href="#/">Về trang chủ</a></div>';
    return;
  }
  setPrefGrade(t.grade);
  updateNavActive('lop-' + t.grade);

  var meta = loadMeta();
  meta.lastLessonId = id;
  saveMeta(meta);

  var allDrafts = loadDrafts();
  var padDraft = allDrafts[id] || { strokes: [] };

  var sameGrade = D.filter(function(x){ return x.grade === t.grade; }).slice().sort(function(a,b){
    return (a.order || 99) - (b.order || 99);
  });
  var pos = sameGrade.findIndex(function(x){ return x.id === id; });
  var prevLesson = pos > 0 ? sameGrade[pos - 1] : null;
  var nextLesson = pos > -1 && pos < sameGrade.length - 1 ? sameGrade[pos + 1] : null;

  var relatedExams = EXAMS.filter(function(ex){
    return ex.topics.indexOf(id) > -1 && (!t.stage || !ex.stage || ex.stage <= t.stage || ex.topics.length === 1);
  });

  var sampled = BANK ? BANK.sampleLessonSet(t, 4) : { totalAvailable: t.questions.length, items: getTopicPool(t, 1) };
  var sessionItems = sampled.items;
  var totalBankCount = sampled.totalAvailable;
  var sessionAnswers = {};
  var sessionOrders = {};
  var lockedPrintSpec = null;

  var availDiffs = [1, 2, 3, 4].filter(function(lv){
    return sessionItems.some(function(it){ return it.d === lv; });
  });
  var selectedDiff = availDiffs.length >= 3 ? String(availDiffs[0]) : 'all';
  var canSpeak = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function';

  var h =
    '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › <a href="#/lop/' + t.grade + '">Lớp ' + t.grade + '</a> › ' + esc(t.title) + '</div>' +
    '<div class="row between">' +
      '<div class="row">' +
        tag(t.subj) +
        '<span class="badge">Lớp ' + t.grade + (t.term ? ' · ' + t.term : '') + (t.weeks ? ' · ' + t.weeks : '') + '</span>' +
        '<span class="badge pri" id="bank-info">Kho ' + totalBankCount + '+ câu chỉ riêng bài này</span>' +
      '</div>' +
      '<div class="row">' +
        '<button type="button" class="btn sm subtle" id="les-share-btn">📤 Gửi link bài này</button>' +
        '<button type="button" class="btn sm alt" id="top-dl-2part">🖨️ In bài này (Đề + Đáp án)</button>' +
      '</div>' +
    '</div>' +
    '<h1>' + esc(t.title) + '</h1>';

  if (t.prereq && t.prereq.length) {
    h += '<div class="card soft" style="margin-bottom:14px"><b>📌 Bài nền liên quan đã học trước:</b> ' +
      t.prereq.map(function(pid){
        var b = byId[pid];
        if (!b) return '';
        var okMark = isMastered(pid) ? ' <span class="done">(đã vững ✓)</span>' : '';
        return '<a href="#/bai/' + pid + '">' + esc(b.title) + ' (Lớp ' + b.grade + ')</a>' + okMark;
      }).join(' · ') + '</div>';
  }

  h +=
    '<section class="card" style="margin-bottom:14px">' +
      '<div class="row between">' +
        '<h2 style="margin:0">1. Tóm tắt ngắn gọn cần nhớ</h2>' +
        (canSpeak ? '<button type="button" class="btn sm alt" id="btn-tts">🔊 Nghe đọc tóm tắt</button>' : '') +
      '</div>' +
      '<ul class="tight" style="margin-top:8px">' + t.theory.map(function(s){ return '<li>' + fmtMath(s) + '</li>'; }).join('') + '</ul>' +
      '<h2>2. Công thức &amp; giải thích từng kí hiệu</h2>' +
      t.formulas.map(function(f){ return '<div class="formula">' + fmtFormula(f) + '</div>'; }).join('');

  var topicTypes = (window.KHTN_TYPES && window.KHTN_TYPES[t.id]) ? window.KHTN_TYPES[t.id] : null;
  if (topicTypes && topicTypes.length) {
    h += '<h2>3. Các dạng bài tập thường gặp &amp; Ví dụ giải mẫu</h2>';
    topicTypes.forEach(function(tp, ti){
      h +=
        '<div class="type-card">' +
          '<div><b>' + fmtMath(tp.name) + '</b></div>' +
          '<div class="type-method">💡 <b>Cách làm:</b> ' + fmtMath(tp.method) + '</div>' +
          (tp.ex
            ? '<details' + (ti === 0 ? ' open' : '') + '>' +
                '<summary>👉 Xem ví dụ mẫu &amp; lời giải</summary>' +
                '<div class="type-ex"><b>Ví dụ:</b> ' + fmtMath(tp.ex) +
                  (tp.sol ? '<br><b>Lời giải:</b> ' + fmtMath(tp.sol) : '') +
                '</div>' +
              '</details>'
            : '') +
        '</div>';
    });
  } else if (t.examples && t.examples.length) {
    h += '<h2>3. Ví dụ giải mẫu từng bước</h2>';
    t.examples.forEach(function(ex, ei){
      h +=
        '<div class="example-card">' +
          '<div><b>Ví dụ ' + (ei + 1) + '.</b> ' + fmtMath(ex.q) + '</div>' +
          '<details' + (ei === 0 ? ' open' : '') + '>' +
            '<summary>👉 Bấm xem lời giải từng bước</summary>' +
            '<ol class="example-steps">' + ex.steps.map(function(st){ return '<li>' + fmtMath(st) + '</li>'; }).join('') + '</ol>' +
            '<div><b>Đáp số:</b> ' + fmtMath(ex.ans) + '</div>' +
          '</details>' +
        '</div>';
    });
  }
  h += '</section>';

  h +=
    '<div class="row between">' +
      '<h2 style="margin:.4em 0">4. Làm bài tập từ Dễ đến Khó (Biết đúng/sai ngay)</h2>' +
      '<button type="button" class="btn sm alt" id="btn-reroll">🔄 Đổi bộ câu hỏi khác (cùng bài)</button>' +
    '</div>' +
    '<div class="helper-tip">' +
      '<span>💡 <b>Cách làm:</b> Bấm thẳng vào đáp án <b>A, B, C, D</b> (hoặc gõ số rồi bấm Kiểm tra) để xem giải thích ngay. Làm xong Mức Dễ hãy bấm lên Mức tiếp theo nhé!</span>' +
    '</div>' +
    (availDiffs.length > 1 ? '<div class="ladder" id="diff-ladder"></div>' : '') +
    '<div class="workspace has-pad">' +
      '<div>' +
        '<div id="qs"></div>' +
        '<div id="res"></div>' +
      '</div>' +
      '<div class="pad-col" id="padw"></div>' +
    '</div>';

  h +=
    '<div class="card soft" style="margin-top:16px">' +
      '<div class="row between">' +
        '<div><b>🖨️ In phiếu bài tập ra giấy A4 hoặc Lưu PDF</b><div class="muted" style="font-size:.9rem">Gồm riêng câu hỏi của bài <b>' + esc(t.title) + '</b>, tách sẵn Tờ Đề bài và Tờ Đáp án ở trang sau.</div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm" id="pdf-both">🖨️ In gộp Đề + Đáp án</button>' +
          '<button type="button" class="btn sm alt" id="pdf-study">📖 In Lý thuyết + Đề + Đáp án</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (relatedExams.length) {
    h += '<div class="card soft" style="margin-top:12px"><b>📝 Luyện đề kiểm tra 15 phút / Giữa kì có bài này:</b><div class="row" style="margin-top:8px">' +
      relatedExams.map(function(ex){
        return '<a class="btn sm subtle" href="#/lam-de/' + ex.id + '">▶ ' + esc(ex.title) + '</a>';
      }).join('') + '</div></div>';
  }

  h +=
    '<div class="lesson-nav">' +
      (prevLesson ? '<a class="btn subtle" href="#/bai/' + prevLesson.id + '">← Bài trước: ' + esc(prevLesson.title) + '</a>' : '<span></span>') +
      (nextLesson ? '<a class="btn" href="#/bai/' + nextLesson.id + '">Bài tiếp theo: ' + esc(nextLesson.title) + ' →</a>' : '<a class="btn" href="#/de-kiem-tra/' + t.grade + '">Sang Đề kiểm tra lớp ' + t.grade + ' →</a>') +
    '</div>';

  app.innerHTML = h;

  document.getElementById('les-share-btn').onclick = function(){ openShareModal(t.title); };

  // Wire Read-Aloud TTS
  var ttsBtn = document.getElementById('btn-tts');
  if (ttsBtn && canSpeak) {
    var speakingThis = false;
    ttsBtn.onclick = function(){
      if (speakingThis || window.speechSynthesis.speaking) {
        stopSpeech();
        speakingThis = false;
        ttsBtn.textContent = '🔊 Nghe đọc tóm tắt';
        return;
      }
      var fullTxt = t.title + '. Tóm tắt kiến thức cần nhớ: ' + t.theory.map(plainSpeechText).join('. ');
      var utt = new SpeechSynthesisUtterance(fullTxt);
      utt.lang = 'vi-VN';
      utt.rate = 0.96;
      speakingThis = true;
      ttsBtn.textContent = '⏹ Dừng đọc';
      utt.onend = function(){ speakingThis = false; ttsBtn.textContent = '🔊 Nghe đọc tóm tắt'; };
      utt.onerror = function(){
        speakingThis = false;
        ttsBtn.textContent = '🔊 Nghe đọc tóm tắt';
        showToast('Thiết bị này chưa cài giọng đọc tiếng Việt.');
      };
      window.speechSynthesis.speak(utt);
    };
  }

  var qsEl = document.getElementById('qs');
  var resEl = document.getElementById('res');
  var ladderEl = document.getElementById('diff-ladder');
  var bankInfoEl = document.getElementById('bank-info');

  function rerollQuestions(){
    sampled = BANK ? BANK.sampleLessonSet(t, 4) : { totalAvailable: t.questions.length, items: getTopicPool(t, 1) };
    sessionItems = sampled.items;
    totalBankCount = sampled.totalAvailable;
    sessionAnswers = {};
    sessionOrders = {};
    lockedPrintSpec = null;
    availDiffs = [1, 2, 3, 4].filter(function(lv){
      return sessionItems.some(function(it){ return it.d === lv; });
    });
    if (selectedDiff !== 'all' && availDiffs.indexOf(Number(selectedDiff)) === -1) {
      selectedDiff = availDiffs.length ? String(availDiffs[0]) : 'all';
    }
    if (bankInfoEl) {
      bankInfoEl.textContent = 'Đã đổi bộ ' + sessionItems.length + ' câu hỏi mới (kho ' + totalBankCount + '+ câu)';
    }
    showToast('🔄 Đã đổi bộ câu hỏi mới với số liệu khác!');
    renderQuestionsForSelectedDiff();
  }

  document.getElementById('btn-reroll').onclick = rerollQuestions;

  function indicesForDiff(df){
    var pairs = [];
    sessionItems.forEach(function(item, i){
      if (df === 'all' || String(item.d) === String(df)) pairs.push({ i: i, d: item.d });
    });
    pairs.sort(function(a, b){ return a.d - b.d || a.i - b.i; });
    return pairs.map(function(p){ return p.i; });
  }

  function renderLadder(){
    if (!ladderEl) return;
    var steps = availDiffs.map(function(lv){
      var idxs = indicesForDiff(String(lv));
      var ansCnt = idxs.filter(function(i){ return !!sessionAnswers[i]; }).length;
      var okCnt = idxs.filter(function(i){ return sessionAnswers[i] && sessionAnswers[i].ok; }).length;
      var statusTxt = ansCnt === idxs.length && idxs.length > 0
        ? ('Đúng ' + okCnt + '/' + idxs.length + (okCnt / idxs.length >= 0.67 ? ' ✓' : ''))
        : ('Đã làm ' + ansCnt + '/' + idxs.length + ' câu');
      return '<button type="button" class="ladder-step ' + (selectedDiff === String(lv) ? 'on' : '') + '" data-df="' + lv + '">' +
        '<b>' + DIFF[lv] + '</b><small>' + statusTxt + '</small></button>';
    });
    var allIdxs = indicesForDiff('all');
    var allAns = allIdxs.filter(function(i){ return !!sessionAnswers[i]; }).length;
    steps.push(
      '<button type="button" class="ladder-step ' + (selectedDiff === 'all' ? 'on' : '') + '" data-df="all">' +
      '<b>Xem tất cả câu</b><small>' + allAns + '/' + allIdxs.length + ' câu lượt này</small></button>'
    );
    ladderEl.innerHTML = steps.join('');
    ladderEl.querySelectorAll('button').forEach(function(b){
      b.onclick = function(){
        selectedDiff = b.dataset.df;
        renderQuestionsForSelectedDiff();
      };
    });
  }

  function updateProgressIfReady(){
    var answeredKeys = Object.keys(sessionAnswers);
    var minNeeded = Math.min(3, sessionItems.length);
    if (answeredKeys.length < minNeeded) return;
    var rightAll = answeredKeys.filter(function(k){ return sessionAnswers[k].ok; }).length;
    var ratioAll = rightAll / answeredKeys.length;
    var p = loadProg();
    p[id] = p[id] || { attempts: 0 };
    if (p[id].best == null || ratioAll > p[id].best) p[id].best = ratioAll;
    p[id].last = ratioAll;
    p[id].updatedAt = Date.now();
    saveProg(p);
  }

  function renderSummary(idxs, justFinished){
    var allDoneInView = idxs.length > 0 && idxs.every(function(i){ return !!sessionAnswers[i]; });
    if (!allDoneInView) {
      resEl.className = '';
      resEl.innerHTML = '';
      return;
    }
    var right = idxs.filter(function(i){ return sessionAnswers[i].ok; }).length;
    var ratio = right / idxs.length;
    if (justFinished) {
      updateProgressIfReady();
      var p = loadProg();
      p[id] = p[id] || { attempts: 0 };
      p[id].attempts = (p[id].attempts || 0) + 1;
      saveProg(p);
    }

    var nextDiff = null;
    if (selectedDiff !== 'all') {
      var curPos = availDiffs.indexOf(Number(selectedDiff));
      if (curPos > -1 && curPos < availDiffs.length - 1) nextDiff = String(availDiffs[curPos + 1]);
    }
    var levelTitle = selectedDiff === 'all' ? 'toàn bài' : DIFF[Number(selectedDiff)];
    var singleTopicExam = EXAMS.find(function(ex){ return ex.topics.length === 1 && ex.topics[0] === id; });

    resEl.className = 'card highlight';
    resEl.style.marginTop = '12px';
    resEl.innerHTML =
      '<div class="row between">' +
        '<div><div class="score-big">Điểm ' + esc(levelTitle) + ': ' + score10(ratio) + ' / 10</div>' +
        '<div>Làm đúng <b>' + right + '/' + idxs.length + '</b> câu</div></div>' +
        '<span class="badge ' + (ratio >= 0.67 ? 'ok' : 'warn') + '">' + (ratio >= 0.67 ? '✓ Đã nắm vững' : 'Nên làm thêm 1 lượt') + '</span>' +
      '</div>' +
      '<p style="margin:.6em 0">' + (ratio >= 0.67
        ? (nextDiff ? 'Giỏi lắm! Bấm nút bên dưới để bước tiếp lên <b>' + DIFF[Number(nextDiff)] + '</b> nhé.' : 'Xuất sắc! Em đã hoàn thành bài này — có thể thử sức với Đề kiểm tra 15 phút bên dưới.')
        : 'Đừng lo nhé! Em xem lại cách giải ở từng câu phía trên rồi bấm Đổi bộ câu hỏi khác để làm lại cho quen tay.') + '</p>' +
      '<div class="row">' +
        (nextDiff ? '<button type="button" class="btn" id="next-diff">Làm tiếp ' + DIFF[Number(nextDiff)] + ' →</button>' : '') +
        (!nextDiff && singleTopicExam ? '<a class="btn" href="#/lam-de/' + singleTopicExam.id + '">📝 Làm Đề 15 phút bài này →</a>' : '') +
        '<button type="button" class="btn alt" id="again-rand">🔄 Đổi bộ câu hỏi khác</button>' +
      '</div>';

    var btnNextDiff = document.getElementById('next-diff');
    if (btnNextDiff) {
      btnNextDiff.onclick = function(){
        selectedDiff = nextDiff;
        renderQuestionsForSelectedDiff();
        qsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }
    document.getElementById('again-rand').onclick = rerollQuestions;
  }

  function renderQuestionsForSelectedDiff(){
    renderLadder();
    qsEl.innerHTML = '';
    var idxs = indicesForDiff(selectedDiff);
    idxs.forEach(function(sIdx, displayIdx){
      var item = sessionItems[sIdx];
      var q = item.q;
      var qNode = renderQ(q, displayIdx, {
        topic: t,
        qIndex: item.staticIdx,
        order: sessionOrders[sIdx] || null,
        savedAnswer: sessionAnswers[sIdx] || null,
        hintText: pickHint(t, q),
        onAnswer: function(ok, ansState){
          sessionAnswers[sIdx] = ansState;
          recordMistake(t.id, item.staticIdx, ok, q);
          renderLadder();
          var allDone = idxs.every(function(i){ return !!sessionAnswers[i]; });
          if (allDone) renderSummary(idxs, true);
        }
      });
      if (qNode._choices) {
        sessionOrders[sIdx] = qNode._choices;
      }
      qsEl.appendChild(qNode);
    });
    renderSummary(idxs, false);
  }

  renderQuestionsForSelectedDiff();

  var padEl = window.KHTNPad.create({
    initialStrokes: padDraft.strokes || [],
    onChange: function(strokes){
      var d = loadDrafts();
      d[id] = { strokes: strokes, updatedAt: Date.now() };
      saveDrafts(d);
    }
  });
  document.getElementById('padw').appendChild(padEl);
  currentCleanup = function(){
    stopSpeech();
    if (padEl && padEl._destroy) padEl._destroy();
  };

  function getLockedSnapshot(){
    if (!lockedPrintSpec) {
      lockedPrintSpec = createFreshLessonSnapshot(t, 'all', sessionItems);
    }
    return lockedPrintSpec;
  }
  function openLessonPrint(mode){
    window.KHTNPrint.open(getLockedSnapshot(), mode, {
      onRegenerate: function(){
        lockedPrintSpec = createFreshLessonSnapshot(t, 'all', null);
        return lockedPrintSpec;
      }
    });
  }
  document.getElementById('top-dl-2part').onclick = function(){ openLessonPrint('both'); };
  document.getElementById('pdf-both').onclick = function(){ openLessonPrint('both'); };
  document.getElementById('pdf-study').onclick = function(){ openLessonPrint('study'); };
}

// --- VIEW 4: Exam Catalog (#/de-kiem-tra/:g/:cat) ---
function examCatalog(g, initialCat){
  if ([6,7,8,9].indexOf(g) === -1) g = getPrefGrade();
  setPrefGrade(g);
  updateNavActive('de-kiem-tra');

  var h =
    '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › Đề kiểm tra Lớp ' + g + '</div>' +
    '<div class="row between">' +
      '<h1>📝 Kho Đề Kiểm Tra 15 phút · Giữa kì · Cuối kì – Lớp ' + g + '</h1>' +
      '<div class="row">' +
        [6,7,8,9].map(function(gr){
          var lbl = (gr === 7 || gr === 8) ? ('Lớp ' + gr + ' ★') : ('Lớp ' + gr);
          return '<a class="btn sm ' + (gr === g ? 'on' : 'subtle') + '" href="#/de-kiem-tra/' + gr + '">' + lbl + '</a>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="cat-gb-slot"></div>' +
    '<div class="helper-tip">' +
      '<span>✅ <b>An tâm luyện tập:</b> Đề tuần nào chỉ hỏi đúng những bài đã học tới tuần đó — không bao giờ lẫn câu hỏi của học kì sau.</span>' +
      '<a class="btn sm alt" href="#/luyen-tap">🎯 Tự chọn số câu theo ý muốn</a>' +
    '</div>' +
    '<div id="cat-exams-box"></div>';

  app.innerHTML = h;
  mountGradebookWidget(document.getElementById('cat-gb-slot'), g);
  mountExamExplorer(document.getElementById('cat-exams-box'), g, initialCat || 'all');
}

// --- VIEW 4B: Dedicated 1-Screen Quick Print Page for Parents & Teachers (#/in-nhanh/:g) ---
function quickPrintPage(g){
  if ([6,7,8,9].indexOf(g) === -1) g = getPrefGrade();
  setPrefGrade(g);
  updateNavActive('in-nhanh');
  var pTab = 'exams';

  var gLessons = D.filter(function(t){ return t.grade === g; }).slice().sort(function(a,b){
    return (a.order || 99) - (b.order || 99);
  });
  var gExams = EXAMS.filter(function(ex){ return ex.grade === g; });

  function render(){
    var h =
      '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › In đề giấy A4 (Lớp ' + g + ')</div>' +
      '<div class="row between">' +
        '<h1>🖨️ In Đề Ra Giấy A4 / Lưu File PDF Gửi Zalo – Lớp ' + g + '</h1>' +
        '<div class="row">' +
          [6,7,8,9].map(function(gr){
            return '<a class="btn sm ' + (gr === g ? 'on' : 'subtle') + '" href="#/in-nhanh/' + gr + '">Lớp ' + gr + '</a>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="card highlight" style="margin-bottom:14px">' +
        '<div class="row between">' +
          '<div>' +
            '<b>✨ Chỉ cần 1 lần bấm là có đủ cả Tờ Đề (cho con làm) + Tờ Đáp Án (ở trang riêng để bố mẹ/thầy cô dò)!</b>' +
            '<div class="muted" style="font-size:.9rem;margin-top:3px">Muốn in thêm toàn bộ bảng công thức tóm tắt của cả năm Lớp ' + g + ' để dán góc học tập, bấm nút bên phải:</div>' +
          '</div>' +
          '<button type="button" class="btn alt" id="qp-all-formulas">📖 In Sổ tay Công thức Lớp ' + g + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="tabs">' +
        '<button type="button" data-qpt="exams" class="' + (pTab === 'exams' ? 'on' : '') + '">📝 In Đề Kiểm Tra 15p · Giữa kì · Cuối kì (' + gExams.length + ' đề)</button>' +
        '<button type="button" data-qpt="lessons" class="' + (pTab === 'lessons' ? 'on' : '') + '">📖 In Phiếu Bài Tập Từng Bài Học (' + gLessons.length + ' bài)</button>' +
      '</div>' +
      '<div id="qp-body"></div>';

    app.innerHTML = h;

    document.getElementById('qp-all-formulas').onclick = function(){
      var TYPES = window.KHTN_TYPES || {};
      var spec = window.KHTNPrint.prepare({
        prefix: 'ST' + g,
        subtitle: 'Toàn bộ công thức & các dạng bài trọng tâm KHTN Lớp ' + g + ' (GDPT 2018)',
        formulaGroups: gLessons.map(function(t){ return { grade: t.grade, title: t.title, formulas: t.formulas, types: TYPES[t.id] || null }; })
      });
      window.KHTNPrint.open(spec, 'formulas');
    };

    app.querySelectorAll('[data-qpt]').forEach(function(b){
      b.onclick = function(){ pTab = b.dataset.qpt; render(); };
    });

    var body = document.getElementById('qp-body');
    if (pTab === 'exams') {
      body.innerHTML = '<div class="grid two">' + gExams.map(function(ex){
        return (
          '<div class="card">' +
            '<div class="row between"><span class="badge pri">' + esc(ex.term) + (ex.weeks ? ' · ' + esc(ex.weeks) : '') + '</span><span class="badge">' + ex.count + ' câu · ' + ex.minutes + ' phút</span></div>' +
            '<h3 style="margin:.45em 0 .2em">' + esc(ex.title) + '</h3>' +
            '<div class="muted" style="font-size:.88rem;margin-bottom:10px">' + esc(ex.scope) + '</div>' +
            '<div class="row">' +
              '<button type="button" class="btn sm" data-qp-ex="' + ex.id + '" data-mode="both">🖨️ Xem &amp; In (Đề + Đáp án)</button>' +
              '<button type="button" class="btn sm subtle" data-qp-ex="' + ex.id + '" data-mode="quiz">Chỉ tờ Đề</button>' +
            '</div>' +
          '</div>'
        );
      }).join('') + '</div>';

      body.querySelectorAll('[data-qp-ex]').forEach(function(btn){
        btn.onclick = function(){
          var ex = examById[btn.getAttribute('data-qp-ex')];
          var md = btn.getAttribute('data-mode') || 'both';
          if (!ex) return;
          window.KHTNPrint.open(getOrCreateExamPrintSpec(ex), md, {
            onRegenerate: function(){ return createFreshExamSnapshot(ex); }
          });
        };
      });
    } else {
      body.innerHTML = '<div class="grid two">' + gLessons.map(function(t){
        return (
          '<div class="card">' +
            '<div class="row between">' + tag(t.subj) + (t.weeks ? '<span class="badge">' + esc(t.weeks) + '</span>' : '') + '</div>' +
            '<h3 style="margin:.45em 0 .25em">' + esc(t.title) + '</h3>' +
            '<div class="row" style="margin-top:8px">' +
              '<button type="button" class="btn sm" data-qp-les="' + t.id + '" data-mode="study">📖 In Lý thuyết + Đề + Đáp án</button>' +
              '<button type="button" class="btn sm alt" data-qp-les="' + t.id + '" data-mode="both">🖨️ Chỉ Đề + Đáp án</button>' +
            '</div>' +
          '</div>'
        );
      }).join('') + '</div>';

      body.querySelectorAll('[data-qp-les]').forEach(function(btn){
        btn.onclick = function(){
          var t = byId[btn.getAttribute('data-qp-les')];
          var md = btn.getAttribute('data-mode') || 'study';
          if (!t) return;
          var snap = createFreshLessonSnapshot(t, 'all', null);
          window.KHTNPrint.open(snap, md, {
            onRegenerate: function(){ return createFreshLessonSnapshot(t, 'all', null); }
          });
        };
      });
    }
  }

  render();
}

// --- VIEW 5: Exam Runner (#/lam-de/:examId) ---
function examRunner(examId){
  var ex = examById[examId];
  if (!ex) {
    updateNavActive('de-kiem-tra');
    app.innerHTML = '<div class="empty"><p>Không tìm thấy đề kiểm tra.</p><a class="btn" href="#/de-kiem-tra/8">Xem danh sách đề</a></div>';
    return;
  }
  setPrefGrade(ex.grade);
  updateNavActive('de-kiem-tra');

  var levelMode = ex.presetLevel || 'standard';
  var examMode = 'practice'; // Default to instant feedback so non-tech students immediately see right/wrong! Can switch to 'exam' in 1 tap.
  var timerId = null;

  function stopTimer(){
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function renderSetup(){
    stopTimer();
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    var st = loadExams()[ex.id];
    var setupPrintSpec = null;

    var h =
      '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › <a href="#/de-kiem-tra/' + ex.grade + '">Đề kiểm tra Lớp ' + ex.grade + '</a> › ' + esc(ex.title) + '</div>' +
      '<div class="row between" style="margin-bottom:6px">' +
        '<div class="row">' +
          '<span class="badge pri">Lớp ' + ex.grade + ' · ' + esc(ex.term) + (ex.weeks ? ' · ' + esc(ex.weeks) : '') + '</span>' +
          '<span class="badge">' + ex.minutes + ' phút · ' + ex.count + ' câu hỏi</span>' +
        '</div>' +
        '<button type="button" class="btn sm subtle" id="ex-share-btn">📤 Gửi link đề này</button>' +
      '</div>' +
      '<h1>' + esc(ex.title) + '</h1>' +
      '<p class="muted"><b>Phạm vi kiến thức:</b> ' + esc(ex.scope) + '</p>' +
      (st ? '<div class="card soft" style="margin-bottom:14px">📊 Bạn đã làm đề này <b>' + st.attempts + ' lần</b> · Điểm cao nhất: <b class="done">' + score10(st.best) + '/10</b> · Lần gần nhất: <b>' + score10(st.last) + '/10</b></div>' : '') +
      '<section class="card">' +
        '<h2 style="margin-top:0">Chọn cách làm bài (rất đơn giản):</h2>' +
        '<div class="choice-cards" id="mode-cards">' +
          '<button type="button" class="choice-card ' + (examMode === 'practice' ? 'on' : '') + '" data-m="practice">' +
            '<b>✅ Biết Đúng / Sai ngay từng câu (Khuyên dùng)</b>' +
            '<small>Bấm câu nào biết kết quả và xem lời giải dễ hiểu ngay câu đó, không áp lực.</small>' +
          '</button>' +
          '<button type="button" class="choice-card ' + (examMode === 'exam' ? 'on' : '') + '" data-m="exam">' +
            '<b>⏱ Làm giống thi thật trên lớp</b>' +
            '<small>Chọn đáp án hết cả đề rồi bấm nút Nộp bài ở cuối trang để chấm điểm một lượt.</small>' +
          '</button>' +
        '</div>' +

        '<h3>Độ khó câu hỏi:</h3>' +
        '<div class="filters" id="level-pills" style="margin-bottom:16px">' +
          '<button type="button" data-lv="basic" class="' + (levelMode === 'basic' ? 'on' : '') + '">🌱 Dễ – Lấy lại gốc</button>' +
          '<button type="button" data-lv="standard" class="' + (levelMode === 'standard' ? 'on' : '') + '">⭐ Vừa sức trên lớp (Chuẩn)</button>' +
          '<button type="button" data-lv="advanced" class="' + (levelMode === 'advanced' ? 'on' : '') + '">🚀 Nâng cao (Điểm 9–10)</button>' +
        '</div>' +

        '<div class="row">' +
          '<button type="button" class="btn lg" id="ex-start">▶ Bắt đầu làm bài ngay</button>' +
          '<button type="button" class="btn alt" id="ex-print-now">🖨️ In ra giấy A4 (Đề + Đáp án)</button>' +
          '<a class="btn subtle" href="#/de-kiem-tra/' + ex.grade + '">← Chọn đề khác</a>' +
        '</div>' +
      '</section>';

    app.innerHTML = h;

    document.getElementById('ex-share-btn').onclick = function(){ openShareModal(ex.title); };

    app.querySelectorAll('#mode-cards .choice-card').forEach(function(c){
      c.onclick = function(){
        examMode = c.dataset.m;
        app.querySelectorAll('#mode-cards .choice-card').forEach(function(x){ x.classList.toggle('on', x === c); });
      };
    });
    app.querySelectorAll('#level-pills button').forEach(function(b){
      b.onclick = function(){
        levelMode = b.dataset.lv;
        setupPrintSpec = null;
        app.querySelectorAll('#level-pills button').forEach(function(x){ x.classList.toggle('on', x === b); });
      };
    });

    function ensureSetupSpec(){
      if (!setupPrintSpec) setupPrintSpec = createFreshExamSnapshot(ex, levelMode);
      return setupPrintSpec;
    }
    document.getElementById('ex-start').onclick = function(){ startExam(); };
    document.getElementById('ex-print-now').onclick = function(){
      window.KHTNPrint.open(ensureSetupSpec(), 'both', {
        onRegenerate: function(){ setupPrintSpec = createFreshExamSnapshot(ex, levelMode); return setupPrintSpec; }
      });
    };
  }

  function startExam(){
    stopTimer();
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    var picks = buildExamItems(ex, levelMode);
    var isDeferred = examMode === 'exam';
    var levelTxt = levelMode === 'basic' ? 'Mức Dễ – Lấy gốc' : (levelMode === 'advanced' ? 'Mức Nâng cao' : 'Vừa sức trên lớp');

    var attemptSpec = window.KHTNPrint.prepare({
      prefix: 'KT' + ex.grade,
      docTitle: ex.title.toUpperCase(),
      subtitle: 'KHTN Lớp ' + ex.grade + ' · ' + ex.term + ' · ' + levelTxt,
      minutes: ex.minutes,
      isExam: true,
      problemTypes: collectExamProblemTypes(ex.topics),
      items: picks.map(function(p){ return { topicTitle: p.t.title.replace(/^Bài \d+:\s*/, ''), q: p.q }; })
    });

    var submitted = false;
    var totalSec = ex.minutes * 60;
    var leftSec = totalSec;
    var paused = false;
    var timerHidden = false;
    var startTs = Date.now();

    function fmtClock(sec){
      var s = Math.max(0, sec);
      var m = Math.floor(s / 60);
      var r = s % 60;
      return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
    }

    var h =
      '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › <a href="#/de-kiem-tra/' + ex.grade + '">Đề kiểm tra Lớp ' + ex.grade + '</a> › ' + esc(ex.title) + '</div>' +
      '<div class="row between">' +
        '<div><h1 style="margin-bottom:.15em">' + esc(ex.title) + '</h1>' +
        '<div class="muted">Mã đề: <b>' + esc(attemptSpec.code) + '</b> · ' + (isDeferred ? 'Chế độ Thi thử (Làm xong bấm Nộp bài)' : 'Chế độ Ôn luyện (Biết đúng/sai ngay)') + '</div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="ex-top-pdf">🖨️ In đề này</button>' +
          '<button type="button" class="btn sm subtle" id="ex-new">🔄 Đổi đề mới</button>' +
          '<button type="button" class="btn sm subtle" id="ex-cfg">⚙ Đổi cách làm</button>' +
        '</div>' +
      '</div>' +
      '<div class="exam-bar">' +
        '<div class="row">' +
          '<span class="timer" id="ex-clock">' + fmtClock(leftSec) + '</span>' +
          '<button type="button" class="btn sm subtle" id="ex-pause">Tạm dừng</button>' +
          '<button type="button" class="btn sm subtle" id="ex-hide-t">Ẩn giờ</button>' +
          '<span class="muted" style="font-weight:700" id="ex-prog">Đã làm: 0/' + picks.length + ' câu</span>' +
        '</div>' +
        '<div class="row">' +
          (isDeferred ? '<button type="button" class="btn sm" id="ex-submit">✅ Nộp bài chấm điểm</button>' : '') +
        '</div>' +
      '</div>' +
      (isDeferred ? '<div class="helper-tip"><span>👉 Bạn cứ bấm chọn đáp án từng câu (đổi ý bấm chọn lại thoải mái). Làm xong kéo xuống cuối trang bấm nút <b>✅ Nộp bài chấm điểm</b> nhé!</span></div>' : '') +
      '<div id="ex-time-msg" class="q-hint" hidden>⏰ Đã hết thời gian gợi ý (' + ex.minutes + ' phút). Bạn vẫn được kiểm tra lại và bấm Nộp bài bình thường, không bị trừ điểm!</div>' +
      '<div class="workspace has-pad exam-ws">' +
        '<div>' +
          '<div id="qs"></div>' +
          (isDeferred
            ? '<div class="exam-bottom-submit" id="ex-bottom-box">' +
                '<div><b id="ex-bottom-prog">Đã chọn đáp án: 0/' + picks.length + ' câu</b><div class="muted" style="font-size:.88rem">Kiểm tra lại một lượt rồi bấm nút bên phải để xem điểm và lời giải chi tiết.</div></div>' +
                '<button type="button" class="btn lg" id="ex-submit-bottom">✅ Nộp bài &amp; Chấm điểm ngay</button>' +
              '</div>'
            : '') +
          '<div id="res"></div>' +
        '</div>' +
        '<div class="pad-col" id="padw"></div>' +
      '</div>';

    app.innerHTML = h;

    var clockEl = document.getElementById('ex-clock');
    var progEl = document.getElementById('ex-prog');
    var bottomProgEl = document.getElementById('ex-bottom-prog');
    var bottomBoxEl = document.getElementById('ex-bottom-box');
    var timeMsgEl = document.getElementById('ex-time-msg');
    var qsEl = document.getElementById('qs');
    var resEl = document.getElementById('res');
    var qNodes = [];

    document.getElementById('ex-top-pdf').onclick = function(){
      window.KHTNPrint.open(attemptSpec, 'both', {
        onRegenerate: function(){ return createFreshExamSnapshot(ex, levelMode); }
      });
    };

    timerId = setInterval(function(){
      if (paused || submitted) return;
      leftSec--;
      if (clockEl) {
        clockEl.textContent = fmtClock(leftSec);
        clockEl.classList.toggle('low', leftSec <= 120 && leftSec > 0);
      }
      if (leftSec <= 0) {
        stopTimer();
        if (timeMsgEl) timeMsgEl.hidden = false;
      }
    }, 1000);

    document.getElementById('ex-pause').onclick = function(){
      paused = !paused;
      this.textContent = paused ? '▶ Tiếp tục' : 'Tạm dừng';
    };
    document.getElementById('ex-hide-t').onclick = function(){
      timerHidden = !timerHidden;
      clockEl.hidden = timerHidden;
      this.textContent = timerHidden ? 'Hiện giờ' : 'Ẩn giờ';
    };
    document.getElementById('ex-new').onclick = function(){ startExam(); showToast('🔄 Đã tạo mã đề mới!'); };
    document.getElementById('ex-cfg').onclick = function(){ renderSetup(); };

    function updateAnsweredCount(){
      if (isDeferred) {
        var c = qNodes.filter(function(n){ return n._isAnswered(); }).length;
        if (progEl) progEl.textContent = 'Đã làm: ' + c + '/' + picks.length + ' câu';
        if (bottomProgEl) bottomProgEl.textContent = 'Đã chọn đáp án: ' + c + '/' + picks.length + ' câu';
      }
    }

    function finishExam(results){
      if (submitted) return;
      submitted = true;
      stopTimer();

      var right = 0;
      var byDiff = { 1:{ok:0,tot:0}, 2:{ok:0,tot:0}, 3:{ok:0,tot:0}, 4:{ok:0,tot:0} };
      var weakMap = {};

      results.forEach(function(r, i){
        var p = picks[i];
        byDiff[r.diff].tot++;
        if (r.ok) { right++; byDiff[r.diff].ok++; }
        else weakMap[p.t.id] = p.t;
        recordMistake(p.t.id, p.qIndex, r.ok, p.q);
      });

      var ratio = right / picks.length;
      var spentSec = Math.max(1, Math.round((Date.now() - startTs) / 1000));
      var spentTxt = Math.floor(spentSec / 60) + ' phút ' + (spentSec % 60) + ' giây';

      var saved = loadExams();
      var prev = saved[ex.id] || { attempts: 0 };
      prev.attempts = (prev.attempts || 0) + 1;
      prev.last = ratio;
      if (prev.best == null || ratio > prev.best) prev.best = ratio;
      prev.levelMode = levelMode;
      prev.updatedAt = Date.now();
      saved[ex.id] = prev;
      saveExams(saved);

      var subBtn = document.getElementById('ex-submit');
      if (subBtn) subBtn.disabled = true;
      if (bottomBoxEl) bottomBoxEl.hidden = true;

      var weakList = Object.keys(weakMap).map(function(k){ return weakMap[k]; });
      resEl.className = 'card highlight';
      resEl.style.marginTop = '14px';
      resEl.innerHTML =
        '<div class="row between">' +
          '<div><div class="score-big">🎉 Điểm của bạn: ' + score10(ratio) + ' / 10</div>' +
          '<div>Mã đề: <b>' + esc(attemptSpec.code) + '</b> · Đúng <b>' + right + '/' + picks.length + '</b> câu · ' +
          (ex.col ? 'Đã tự động lưu vào Sổ điểm!' : 'Thời gian làm: ' + spentTxt) + '</div></div>' +
          '<span class="badge ' + (ratio >= 0.8 ? 'ok' : (ratio >= 0.65 ? 'pri' : 'warn')) + '">' +
            (ratio >= 0.8 ? 'Tốt (Giỏi)' : (ratio >= 0.65 ? 'Khá' : (ratio >= 0.5 ? 'Đạt' : 'Cần cố gắng thêm'))) +
          '</span>' +
        '</div>' +
        '<div class="diff-grid">' +
          [1,2,3,4].filter(function(lv){ return byDiff[lv].tot > 0; }).map(function(lv){
            return '<div class="diff-stat"><span class="badge d' + lv + '">' + DIFF_SHORT[lv] + '</span>' +
              '<div style="font-weight:700;font-size:1.1rem;margin-top:4px">Đúng ' + byDiff[lv].ok + ' / ' + byDiff[lv].tot + '</div></div>';
          }).join('') +
        '</div>' +
        (weakList.length
          ? '<b>📖 Gợi ý các bài nên mở xem lại cho chắc:</b><ul class="tight">' + weakList.map(function(t){
              return '<li><a href="#/bai/' + t.id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ')</li>';
            }).join('') + '</ul>'
          : '<p class="done">🌟 Tuyệt vời! Bạn làm đúng hết tất cả các câu trong đề này.</p>') +
        '<div class="row" style="margin-top:12px">' +
          '<button type="button" class="btn" id="ex-retry">🔄 Làm đề mới (số liệu khác)</button>' +
          '<button type="button" class="btn alt" id="ex-pdf-both">🖨️ In đề này + Đáp án</button>' +
          '<a class="btn subtle" href="#/tien-do">🏆 Xem Sổ điểm</a>' +
        '</div>';

      document.getElementById('ex-retry').onclick = function(){ startExam(); };
      document.getElementById('ex-pdf-both').onclick = function(){ window.KHTNPrint.open(attemptSpec, 'both'); };
      resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    var instantResults = [];
    var instantAnswered = 0;

    picks.forEach(function(p, i){
      var itemChoiceOrder = attemptSpec.items[i] ? attemptSpec.items[i].choices : null;
      var node = renderQ(p.q, i, {
        topic: p.t,
        qIndex: p.qIndex,
        order: itemChoiceOrder,
        showTopic: ex.topics.length > 1,
        deferred: isDeferred,
        hintText: pickHint(p.t, p.q),
        onSelect: updateAnsweredCount,
        onAnswer: function(ok){
          instantAnswered++;
          instantResults[i] = { ok: ok, skipped: false, diff: getDiff(p.q) };
          if (progEl) progEl.textContent = 'Đã làm: ' + instantAnswered + '/' + picks.length + ' câu';
          if (instantAnswered === picks.length) {
            finishExam(instantResults);
          }
        }
      });
      qNodes.push(node);
      qsEl.appendChild(node);
    });

    function handleTriggerSubmit(){
      var unanswered = qNodes.filter(function(n){ return !n._isAnswered(); }).length;
      if (unanswered > 0 && !confirm('Bạn còn ' + unanswered + ' câu chưa chọn đáp án (sẽ tính 0 điểm câu đó). Bạn vẫn muốn nộp bài chứ?')) {
        return;
      }
      var results = qNodes.map(function(n){ return n._grade(); });
      finishExam(results);
    }

    if (isDeferred) {
      document.getElementById('ex-submit').onclick = handleTriggerSubmit;
      var bSub = document.getElementById('ex-submit-bottom');
      if (bSub) bSub.onclick = handleTriggerSubmit;
    }

    var padEl = window.KHTNPad.create({});
    document.getElementById('padw').appendChild(padEl);
    currentCleanup = function(){
      stopTimer();
      if (padEl && padEl._destroy) padEl._destroy();
    };
  }

  renderSetup();
}

// --- Natural Vietnamese Practice Command Parser ---
function parsePracticePrompt(text){
  var s = normVi(text);
  var cfg = { grade:String(getPrefGrade()), stageCap:'all', subj:'all', diff:'all', qtype:'all', count:10, keyword:'' };
  if (!s) return cfg;

  var cm = s.match(/(\d+)\s*(cau|bai)/);
  if (cm) {
    var c = parseInt(cm[1], 10);
    if (c >= 1 && c <= 40) cfg.count = c;
    s = s.replace(cm[0], ' ');
  }

  if (/hoc ki 1|hk1|giua ki 1/.test(s)) {
    cfg.stageCap = /giua ki 1/.test(s) ? '1' : '2';
    s = s.replace(/giua ki 1|hoc ki 1|hk1/g, ' ');
  } else if (/giua ki 2/.test(s)) {
    cfg.stageCap = '3';
    s = s.replace(/giua ki 2/g, ' ');
  }

  var gm = s.match(/(?:lop|khtn|l)\s*([6-9])/);
  if (!gm) gm = s.match(/\b([6-9])\b/);
  if (gm) {
    cfg.grade = gm[1];
    s = s.replace(gm[0], ' ');
  } else {
    cfg.grade = 'all';
  }

  if (/van dung cao|rat kho/.test(s)) {
    cfg.diff = '4';
    s = s.replace(/van dung cao|rat kho/g, ' ');
  } else if (/van dung|nang cao|\bkho\b/.test(s)) {
    cfg.diff = '34';
    s = s.replace(/van dung|nang cao|\bkho\b/g, ' ');
  } else if (/thong hieu|trung binh/.test(s)) {
    cfg.diff = '2';
    s = s.replace(/thong hieu|trung binh/g, ' ');
  } else if (/nhan biet|co ban|\bde\b/.test(s)) {
    cfg.diff = '1';
    s = s.replace(/nhan biet|co ban|\bde\b/g, ' ');
  }

  if (s.indexOf('dien so') > -1 || s.indexOf('tinh toan') > -1 || s.indexOf('tu luan') > -1) {
    cfg.qtype = 'num';
    s = s.replace(/dien so|tinh toan|tu luan/g, ' ');
  } else if (s.indexOf('trac nghiem') > -1) {
    cfg.qtype = 'mc';
    s = s.replace(/trac nghiem/g, ' ');
  }

  if (/\bhoa\b|hoa hoc/.test(s) && s.indexOf('hoa tri') === -1 && s.indexOf('hoa hop') === -1 && s.indexOf('tien hoa') === -1 && s.indexOf('tieu hoa') === -1) {
    cfg.subj = 'hoa';
    s = s.replace(/hoa hoc|\bhoa\b/g, ' ');
  } else if (/\bly\b|\bli\b|vat ly|vat li/.test(s)) {
    cfg.subj = 'ly';
    s = s.replace(/vat ly|vat li|\bly\b|\bli\b/g, ' ');
  } else if (/\bsinh\b|sinh hoc/.test(s) && s.indexOf('sinh san') === -1 && s.indexOf('sinh truong') === -1 && s.indexOf('sinh thai') === -1) {
    cfg.subj = 'sinh';
    s = s.replace(/sinh hoc|\bsinh\b/g, ' ');
  } else if (/trai dat|thien van|bau troi/.test(s)) {
    cfg.subj = 'td';
  }

  var stop = /\b(cho|toi|em|be|on|luyen|tap|co|ve|phan|chu de|tong hop|khtn|mon|va|muc|do|tu|den)\b/g;
  cfg.keyword = s.replace(stop, ' ').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return cfg;
}

// --- VIEW 6: Custom Practice Builder ---
function practice(presetMode){
  updateNavActive('');
  var mistakesMap = loadMistakes();
  var mistakeEntries = Object.keys(mistakesMap).map(function(k){ return mistakesMap[k]; }).filter(function(e){
    return byId[e.topicId] && getMistakeQuestion(e);
  });

  var state = {
    grade: String(getPrefGrade()),
    stageCap: '1',
    topicId: 'all',
    subj: 'all',
    diff: 'all',
    qtype: 'all',
    count: 10,
    keyword: '',
    onlyMistakes: presetMode === 'cau-sai',
    sortEasyToHard: true
  };

  function allowedByStageCap(t){
    if (state.stageCap === 'all' || !t.stage) return true;
    if (state.stageCap === '1') return t.stage === 1;
    if (state.stageCap === '2') return t.stage <= 2;
    if (state.stageCap === '3only') return t.stage === 3;
    if (state.stageCap === 'hk2') return t.term === 'HK2';
    return true;
  }

  function collectPool(){
    if (state.onlyMistakes) {
      return mistakeEntries.map(function(e){
        var t = byId[e.topicId];
        var q = getMistakeQuestion(e);
        return { t: t, q: q, qIndex: e.qIndex, d: getDiff(q), weight: 3 };
      });
    }
    var pool = [];
    D.forEach(function(t){
      if (state.grade !== 'all' && String(t.grade) !== String(state.grade)) return;
      if (state.topicId !== 'all' && t.id !== state.topicId) return;
      if (state.topicId === 'all' && !allowedByStageCap(t)) return;
      if (state.subj !== 'all' && t.subj !== state.subj) return;
      var topicText = normVi(t.title + ' ' + t.formulas.join(' ') + ' ' + t.theory.join(' '));
      var kw = normVi(state.keyword);
      var rounds = state.topicId !== 'all' ? 7 : 4;
      getTopicPool(t, rounds).forEach(function(item){
        var q = item.q;
        var qd = item.d;
        if (state.diff === '12' && qd > 2) return;
        if (state.diff === '34' && qd < 3) return;
        if (['1','2','3','4'].indexOf(state.diff) > -1 && String(qd) !== state.diff) return;
        if (state.qtype === 'mc' && !q.o) return;
        if (state.qtype === 'num' && q.n == null) return;
        if (kw && topicText.indexOf(kw) === -1 && normVi(q.q).indexOf(kw) === -1) return;
        var isWrong = !!mistakesMap[mistakeKey(t.id, q)];
        var weight = (isWrong ? 3 : 0) + (!isMastered(t.id) ? 1 : 0);
        pool.push({ t: t, q: q, qIndex: item.staticIdx, d: qd, weight: weight });
      });
    });
    return pool;
  }

  function renderBuilder(){
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    var h =
      '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › Tự chọn bài luyện</div>' +
      '<h1>🎯 Tự chọn bài luyện theo ý muốn</h1>' +
      '<p class="muted">Gõ yêu cầu bình thường bằng tiếng Việt hoặc chọn lớp &amp; bài học bên dưới:</p>' +
      '<section class="card" style="margin-bottom:14px">' +
        '<label for="quick-cmd" style="display:block;font-weight:700;margin-bottom:6px">Gõ nhanh điều bạn muốn luyện:</label>' +
        '<div class="row">' +
          '<input type="text" id="quick-cmd" style="flex:1;min-width:220px" placeholder="Ví dụ: 10 câu mol lớp 8, 10 câu tốc độ lớp 7…">' +
          '<button type="button" class="btn" id="apply-cmd">Chọn ngay</button>' +
        '</div>' +
        '<div class="row" style="margin-top:8px">' +
          '<span class="muted" style="font-size:.86rem">Bấm nhanh:</span>' +
          '<button type="button" class="chip" data-ex="10 câu mol lớp 8">10 câu bài Mol 8</button>' +
          '<button type="button" class="chip" data-ex="10 câu hóa lớp 7 giữa kì 1">10 câu Hóa 7 trước GK1</button>' +
          '<button type="button" class="chip" data-ex="10 câu tốc độ lớp 7">10 câu Tốc độ 7</button>' +
          '<button type="button" class="chip" data-ex="10 câu áp suất lớp 8">10 câu Áp suất 8</button>' +
        '</div>' +
      '</section>' +
      '<section class="card">' +
        '<div class="form-grid">' +
          '<div class="field"><label for="p-grade">1. Chọn Lớp</label><select id="p-grade">' +
            '<option value="6">Lớp 6</option><option value="7">Lớp 7</option><option value="8">Lớp 8</option><option value="9">Lớp 9</option><option value="all">Tất cả (6–9)</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-stage">2. Đã học tới đâu?</label><select id="p-stage">' +
            '<option value="1">Nửa đầu Học kì I (Trước Giữa kì I)</option>' +
            '<option value="2">Hết Học kì I (Không trộn HK2)</option>' +
            '<option value="3only">Nửa đầu Học kì II (Trước Giữa kì II)</option>' +
            '<option value="hk2">Trọn Học kì II</option>' +
            '<option value="all">Cả năm học</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-topic">3. Chọn riêng 1 bài (nếu muốn)</label><select id="p-topic"></select></div>' +
          '<div class="field"><label for="p-subj">4. Môn học</label><select id="p-subj">' +
            '<option value="all">Tất cả môn</option><option value="hoa">Hóa học</option><option value="ly">Vật lí</option><option value="sinh">Sinh học</option><option value="td">Mở đầu / Trái Đất</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-diff">5. Độ khó</label><select id="p-diff">' +
            '<option value="all">Đủ từ Dễ → Khó</option>' +
            '<option value="1">Chỉ câu Dễ</option>' +
            '<option value="12">Câu Dễ + Trung bình</option>' +
            '<option value="34">Câu Khá + Khó</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-count">6. Số câu muốn làm</label><select id="p-count">' +
            '<option value="6">6 câu (Nhanh 5 phút)</option><option value="10">10 câu (Chuẩn 15 phút)</option><option value="15">15 câu</option><option value="20">20 câu (Chuẩn Giữa kì)</option>' +
          '</select></div>' +
        '</div>' +
        '<div class="row" style="margin:8px 0 14px">' +
          '<label class="row" style="cursor:pointer"><input type="checkbox" id="p-order"> Xếp câu Dễ làm trước, câu Khó làm sau</label>' +
          (mistakeEntries.length ? '<label class="row" style="cursor:pointer"><input type="checkbox" id="p-only-err"> Chỉ ôn lại các câu từng làm sai (' + mistakeEntries.length + ' câu)</label>' : '') +
        '</div>' +
        '<div id="p-summary" class="card soft" style="margin-bottom:14px"></div>' +
        '<div class="row">' +
          '<button type="button" class="btn lg" id="p-start">▶ Bắt đầu làm bài</button>' +
          '<button type="button" class="btn alt" id="p-print">🖨️ In ra giấy A4 (Đề + Đáp án)</button>' +
        '</div>' +
      '</section>';

    app.innerHTML = h;

    var elGrade = document.getElementById('p-grade');
    var elStage = document.getElementById('p-stage');
    var elTopic = document.getElementById('p-topic');
    var elSubj = document.getElementById('p-subj');
    var elDiff = document.getElementById('p-diff');
    var elCount = document.getElementById('p-count');
    var elOrder = document.getElementById('p-order');
    var elOnlyErr = document.getElementById('p-only-err');
    var elSummary = document.getElementById('p-summary');
    var btnStart = document.getElementById('p-start');
    var btnPrint = document.getElementById('p-print');
    var cachedBuilderSpec = null;

    function rebuildTopicDropdown(){
      var gTopics = D.filter(function(t){
        return (state.grade === 'all' || String(t.grade) === String(state.grade)) && allowedByStageCap(t);
      }).sort(function(a,b){ return a.grade - b.grade || (a.order||99) - (b.order||99); });

      var optsHtml = '<option value="all">-- Tất cả bài trong phần đã chọn (' + gTopics.length + ' bài) --</option>';
      gTopics.forEach(function(t){
        optsHtml += '<option value="' + t.id + '">' + (state.grade === 'all' ? 'Lớp ' + t.grade + ' – ' : '') + esc(t.title) + '</option>';
      });
      elTopic.innerHTML = optsHtml;
      if (state.topicId !== 'all' && !gTopics.some(function(t){ return t.id === state.topicId; })) {
        state.topicId = 'all';
      }
      elTopic.value = state.topicId;
    }

    function syncInputs(){
      elGrade.value = state.grade;
      elStage.value = state.stageCap;
      rebuildTopicDropdown();
      elSubj.value = state.subj;
      elDiff.value = state.diff;
      if (!Array.prototype.some.call(elCount.options, function(o){ return String(o.value) === String(state.count); })) {
        var opt = document.createElement('option');
        opt.value = state.count;
        opt.textContent = state.count + ' câu';
        elCount.appendChild(opt);
      }
      elCount.value = String(state.count);
      elOrder.checked = state.sortEasyToHard;
      if (elOnlyErr) elOnlyErr.checked = state.onlyMistakes;
      cachedBuilderSpec = null;
      updateSummary();
    }

    function updateSummary(){
      cachedBuilderSpec = null;
      var pool = collectPool();
      var take = Math.min(pool.length, Number(state.count) || 10);
      if (!pool.length) {
        elSummary.innerHTML = '<b>Chưa có câu hỏi khớp lựa chọn này.</b> Bạn hãy chọn mục "Cả năm học" hoặc chọn "Tất cả môn" nhé.';
        btnStart.disabled = true;
        btnPrint.disabled = true;
      } else {
        var scopeNote = state.topicId !== 'all' && byId[state.topicId]
          ? ('Chỉ hỏi riêng bài: <b>' + esc(byId[state.topicId].title) + '</b>')
          : ('Tìm thấy <b>' + pool.length + '+ câu phù hợp</b>');
        elSummary.innerHTML = '✅ ' + scopeNote + ' · Sẽ lấy ra <b>' + take + ' câu</b>' +
          (state.sortEasyToHard ? ' (sắp từ Dễ → Khó)' : '') + '.';
        btnStart.disabled = false;
        btnPrint.disabled = false;
      }
    }

    function pickItems(){
      var pool = collectPool();
      var take = Math.min(pool.length, Number(state.count) || 10);
      var seen = {};
      var uniq = shuffle(pool).filter(function(x){
        if (seen[x.q.q]) return false;
        seen[x.q.q] = true;
        return true;
      });
      var chosen = uniq.slice(0, take);
      if (state.sortEasyToHard) chosen.sort(function(a, b){ return a.d - b.d; });
      return chosen;
    }

    function makeFreshBuilderSpec(){
      var picks = pickItems();
      var singleT = state.topicId !== 'all' ? byId[state.topicId] : null;
      cachedBuilderSpec = window.KHTNPrint.prepare({
        prefix: state.grade === 'all' ? 'LT' : 'L' + state.grade,
        docTitle: singleT ? ('ĐỀ KIỂM TRA 15 PHÚT – ' + singleT.title.toUpperCase()) : 'PHIẾU BÀI TẬP TỰ LUYỆN KHTN',
        subtitle: singleT ? ('Lớp ' + singleT.grade + ' · Chỉ gồm bài ' + singleT.title) : ('Lớp ' + state.grade + ' · Đúng phạm vi đã chọn'),
        items: picks.map(function(p){ return { topicTitle: singleT ? '' : p.t.title.replace(/^Bài \d+:\s*/, ''), q: p.q }; })
      });
      return cachedBuilderSpec;
    }

    elGrade.onchange = function(){ state.grade = elGrade.value; state.topicId = 'all'; rebuildTopicDropdown(); updateSummary(); };
    elStage.onchange = function(){ state.stageCap = elStage.value; state.topicId = 'all'; rebuildTopicDropdown(); updateSummary(); };
    elTopic.onchange = function(){ state.topicId = elTopic.value; updateSummary(); };
    elSubj.onchange = function(){ state.subj = elSubj.value; updateSummary(); };
    elDiff.onchange = function(){ state.diff = elDiff.value; updateSummary(); };
    elCount.onchange = function(){ state.count = parseInt(elCount.value, 10) || 10; updateSummary(); };
    elOrder.onchange = function(){ state.sortEasyToHard = elOrder.checked; updateSummary(); };
    if (elOnlyErr) elOnlyErr.onchange = function(){ state.onlyMistakes = elOnlyErr.checked; updateSummary(); };

    var cmdInput = document.getElementById('quick-cmd');
    function applyPrompt(txt){
      var parsed = parsePracticePrompt(txt);
      state.grade = parsed.grade;
      state.stageCap = parsed.stageCap;
      state.subj = parsed.subj;
      state.diff = parsed.diff;
      state.count = parsed.count;
      state.keyword = '';
      state.topicId = 'all';
      state.onlyMistakes = false;

      if (parsed.keyword) {
        var candidates = D.filter(function(t){
          return (state.grade === 'all' || String(t.grade) === String(state.grade)) &&
                 normVi(t.title).indexOf(parsed.keyword) > -1;
        });
        if (candidates.length === 1) {
          state.grade = String(candidates[0].grade);
          state.stageCap = 'all';
          state.topicId = candidates[0].id;
          state.subj = 'all';
        } else {
          state.stageCap = parsed.stageCap === 'all' ? 'all' : parsed.stageCap;
          state.keyword = parsed.keyword;
        }
      }
      syncInputs();
      showToast('✓ Đã chọn bài theo yêu cầu của bạn!');
    }
    document.getElementById('apply-cmd').onclick = function(){ applyPrompt(cmdInput.value); };
    cmdInput.onkeydown = function(e){ if (e.key === 'Enter') applyPrompt(cmdInput.value); };
    app.querySelectorAll('[data-ex]').forEach(function(chip){
      chip.onclick = function(){
        cmdInput.value = chip.dataset.ex;
        applyPrompt(chip.dataset.ex);
      };
    });

    btnStart.onclick = function(){
      var singleT = state.topicId !== 'all' ? byId[state.topicId] : null;
      runPracticeSession(pickItems(), singleT ? ('Luyện bài: ' + singleT.title) : null);
    };
    btnPrint.onclick = function(){
      window.KHTNPrint.open(cachedBuilderSpec || makeFreshBuilderSpec(), 'both', { onRegenerate: makeFreshBuilderSpec });
    };

    syncInputs();
    if (presetMode === 'cau-sai' && mistakeEntries.length > 0) {
      runPracticeSession(pickItems(), 'Ôn lại các câu từng làm sai');
    }
  }

  function runPracticeSession(picks, customTitle){
    if (!picks.length) { renderBuilder(); return; }
    var title = customTitle || ('Bài luyện tập (' + picks.length + ' câu · Dễ → Khó)');
    var sheetSpec = window.KHTNPrint.prepare({
      prefix: 'LT',
      docTitle: 'PHIẾU LUYỆN TẬP KHTN',
      subtitle: title,
      items: picks.map(function(x){ return { topicTitle: x.t.title.replace(/^Bài \d+:\s*/, ''), q: x.q }; })
    });

    var h =
      '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › <a href="#/luyen-tap" id="back-builder">Tự chọn bài luyện</a> › Đang làm bài</div>' +
      '<div class="row between">' +
        '<div><h1 style="margin-bottom:.15em">' + esc(title) + '</h1><div class="muted">Mã phiếu: <b>' + esc(sheetSpec.code) + '</b></div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="run-pdf">🖨️ In phiếu này (Đề + Đáp án)</button>' +
          '<button type="button" class="btn sm subtle" id="chg-cfg">🔄 Chọn bài khác</button>' +
        '</div>' +
      '</div>' +
      '<div class="workspace has-pad">' +
        '<div><div id="qs"></div><div id="res"></div></div>' +
        '<div class="pad-col" id="padw"></div>' +
      '</div>';

    app.innerHTML = h;
    document.getElementById('chg-cfg').onclick = renderBuilder;
    document.getElementById('back-builder').onclick = function(e){ e.preventDefault(); renderBuilder(); };
    document.getElementById('run-pdf').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'both'); };

    var qsEl = document.getElementById('qs');
    var resEl = document.getElementById('res');
    var answered = 0, right = 0, weakMap = {};

    picks.forEach(function(p, i){
      qsEl.appendChild(renderQ(p.q, i, {
        topic: p.t,
        qIndex: p.qIndex,
        order: sheetSpec.items[i] ? sheetSpec.items[i].choices : null,
        showTopic: true,
        hintText: pickHint(p.t, p.q),
        onAnswer: function(ok){
          answered++;
          if (ok) right++;
          else weakMap[p.t.id] = p.t;
          recordMistake(p.t.id, p.qIndex, ok, p.q);

          if (answered === picks.length) {
            var ratio = right / picks.length;
            var weakList = Object.keys(weakMap).map(function(k){ return weakMap[k]; });
            resEl.className = 'card highlight';
            resEl.style.marginTop = '12px';
            resEl.innerHTML =
              '<div class="score-big">🎉 Điểm của bạn: ' + score10(ratio) + ' / 10</div>' +
              '<p>Đúng <b>' + right + '/' + picks.length + '</b> câu.</p>' +
              (weakList.length
                ? '<b>📖 Các bài nên mở xem lại:</b><ul class="tight">' + weakList.map(function(t){
                    return '<li><a href="#/bai/' + t.id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ')</li>';
                  }).join('') + '</ul>'
                : '<p class="done">🌟 Xuất sắc! Bạn trả lời đúng hết toàn bộ câu hỏi.</p>') +
              '<div class="row" style="margin-top:12px">' +
                '<button type="button" class="btn" id="re-cfg">🔄 Làm lượt mới</button>' +
                '<button type="button" class="btn alt" id="s-pdf-both">🖨️ In Đề + Đáp án</button>' +
              '</div>';

            document.getElementById('re-cfg').onclick = renderBuilder;
            document.getElementById('s-pdf-both').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'both'); };
          }
        }
      }));
    });

    var padEl = window.KHTNPad.create({});
    document.getElementById('padw').appendChild(padEl);
    currentCleanup = function(){ if (padEl && padEl._destroy) padEl._destroy(); };
  }

  renderBuilder();
}

// --- VIEW 7: Placement Test ---
function placement(g){
  if ([6,7,8,9].indexOf(g) === -1) g = getPrefGrade();
  updateNavActive('');

  var pool = D.filter(function(t){ return t.grade < g || (g === 6 && t.grade === 6); });
  var picks = [];
  pool.forEach(function(t){
    var tPool = getTopicPool(t, 3);
    var easyPool = tPool.filter(function(x){ return x.d <= 2; });
    var src = easyPool.length ? easyPool : tPool;
    var chosen = src[Math.floor(Math.random() * src.length)];
    picks.push({ t: t, q: chosen.q, qIndex: chosen.staticIdx, d: chosen.d });
  });
  picks = shuffle(picks).slice(0, 12).sort(function(a, b){ return a.d - b.d; });
  var sheetSpec = window.KHTNPrint.prepare({
    prefix: 'KN' + g,
    docTitle: 'ĐỀ KIỂM TRA KIẾN THỨC GỐC TRƯỚC LỚP ' + g,
    subtitle: 'Kiểm tra nhanh kiến thức nền tảng trước khi học KHTN Lớp ' + g,
    items: picks.map(function(x){ return { topicTitle: x.t.title.replace(/^Bài \d+:\s*/, ''), q: x.q }; })
  });

  var h =
    '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › Kiểm tra gốc Lớp ' + g + '</div>' +
    '<div class="row between">' +
      '<h1>Kiểm tra kiến thức gốc trước khi học Lớp ' + g + '</h1>' +
      '<div class="row">' +
        [6,7,8,9].map(function(gr){
          return '<a class="btn sm ' + (gr === g ? 'on' : 'subtle') + '" href="#/kiem-tra/' + gr + '">Lớp ' + gr + '</a>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div class="row between" style="margin-bottom:8px">' +
      '<span class="muted">Gồm <b>' + picks.length + ' câu cơ bản</b> để biết phần nào còn hổng và cần xem lại.</span>' +
      '<div class="row">' +
        '<button type="button" class="btn sm alt" id="pl-top-pdf">🖨️ In Đề + Đáp án</button>' +
        '<button type="button" class="btn sm subtle" id="pl-reroll">🔄 Đổi đề khác</button>' +
      '</div>' +
    '</div>' +
    '<div class="workspace has-pad">' +
      '<div><div id="qs"></div><div id="res"></div></div>' +
      '<div class="pad-col" id="padw"></div>' +
    '</div>';

  app.innerHTML = h;
  document.getElementById('pl-top-pdf').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'both'); };
  document.getElementById('pl-reroll').onclick = function(){ placement(g); };

  var qsEl = document.getElementById('qs');
  var resEl = document.getElementById('res');
  var answered = 0, weak = [];

  picks.forEach(function(p, i){
    qsEl.appendChild(renderQ(p.q, i, {
      topic: p.t,
      qIndex: p.qIndex,
      order: sheetSpec.items[i] ? sheetSpec.items[i].choices : null,
      showTopic: false,
      hintText: pickHint(p.t, p.q),
      onAnswer: function(ok){
        answered++;
        if (!ok) weak.push(p.t);
        recordMistake(p.t.id, p.qIndex, ok, p.q);

        if (answered === picks.length) {
          var right = picks.length - weak.length;
          var ratio = right / picks.length;
          var meta = loadMeta();
          meta.lastPlacement = {
            grade: g,
            right: right,
            total: picks.length,
            score10: score10(ratio),
            weakIds: weak.map(function(x){ return x.id; }),
            date: Date.now()
          };
          saveMeta(meta);

          resEl.className = 'card highlight';
          resEl.style.marginTop = '12px';
          resEl.innerHTML =
            '<div class="score-big">Điểm kiểm tra gốc: ' + score10(ratio) + ' / 10</div>' +
            '<p>Đúng <b>' + right + '/' + picks.length + '</b> câu.</p>' +
            (weak.length
              ? '<b>📌 Các bài gốc nên bấm vào đọc lại 5 phút:</b><ul class="tight">' +
                weak.map(function(t){
                  return '<li><a href="#/bai/' + t.id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ' · ' + SUBJ[t.subj] + ')</li>';
                }).join('') + '</ul>'
              : '<p class="done">🌟 Tuyệt vời! Nền tảng của bạn rất vững để học Lớp ' + g + '.</p>') +
            '<div class="row" style="margin-top:12px">' +
              '<button type="button" class="btn" id="re">🔄 Làm đề khác</button>' +
              '<button type="button" class="btn alt" id="pl-pdf">🖨️ In Đề + Đáp án</button>' +
            '</div>';

          document.getElementById('re').onclick = function(){ placement(g); };
          document.getElementById('pl-pdf').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'both'); };
        }
      }
    }));
  });

  var padEl = window.KHTNPad.create({});
  document.getElementById('padw').appendChild(padEl);
  currentCleanup = function(){ if (padEl && padEl._destroy) padEl._destroy(); };
}

// --- VIEW 8: Notebook ---
function notebook(initialTab){
  updateNavActive('so-tay');
  var tab = initialTab === 'mistakes' ? 'mistakes' : 'formulas';
  var gradeFilter = 'all';
  var subjFilter = 'all';
  var query = '';

  function render(){
    var mistakes = loadMistakes();
    var mList = Object.keys(mistakes).map(function(k){ return mistakes[k]; })
      .filter(function(m){ return byId[m.topicId] && getMistakeQuestion(m); })
      .sort(function(a,b){ return (b.lastWrongAt || 0) - (a.lastWrongAt || 0); });

    var h =
      '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › Sổ tay công thức &amp; Câu hay sai</div>' +
      '<div class="row between">' +
        '<h1>📖 Sổ tay Công thức &amp; Câu Hay Sai</h1>' +
        '<button type="button" class="btn sm alt" id="nb-print-btn">' +
          (tab === 'formulas' ? '🖨️ In Sổ tay đang xem' : '🖨️ In phiếu câu hay sai') +
        '</button>' +
      '</div>' +
      '<div class="tabs">' +
        '<button type="button" data-tab="formulas" class="' + (tab === 'formulas' ? 'on' : '') + '">📐 Bảng Công thức dễ hiểu</button>' +
        '<button type="button" data-tab="mistakes" class="' + (tab === 'mistakes' ? 'on' : '') + '">🔁 Câu từng làm sai (' + mList.length + ')</button>' +
      '</div>';

    if (tab === 'formulas') {
      h +=
        '<input type="search" id="nb-search" placeholder="🔍 Gõ tên công thức hoặc bài học (không cần dấu, VD: mol, ap suat, hoa tri)…" value="' + esc(query) + '">' +
        '<div class="filters" id="nb-g">' +
          ['all','6','7','8','9'].map(function(g){
            return '<button type="button" data-g="' + g + '" class="' + (gradeFilter === g ? 'on' : '') + '">' + (g === 'all' ? 'Tất cả lớp' : 'Lớp ' + g) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="filters" id="nb-s">' +
          ['all'].concat(Object.keys(SUBJ)).map(function(s){
            return '<button type="button" data-s="' + s + '" class="' + (subjFilter === s ? 'on' : '') + '">' + (s === 'all' ? 'Tất cả môn' : SUBJ[s]) + '</button>';
          }).join('') +
        '</div>' +
        '<div id="nb-list"></div>';
    } else {
      h += '<div id="nb-mistakes"></div>';
    }

    app.innerHTML = h;
    app.querySelectorAll('[data-tab]').forEach(function(b){
      b.onclick = function(){ tab = b.dataset.tab; render(); };
    });

    if (tab === 'formulas') {
      function matchingFormulaGroups(){
        var q = normVi(query);
        var TYPES = window.KHTN_TYPES || {};
        var groups = [];
        D.slice().sort(function(a,b){ return a.grade - b.grade || (a.order||99) - (b.order||99); }).forEach(function(t){
          if (gradeFilter !== 'all' && String(t.grade) !== gradeFilter) return;
          if (subjFilter !== 'all' && t.subj !== subjFilter) return;
          var hit = t.formulas.filter(function(f){
            return !q || normVi(f + ' ' + t.title).indexOf(q) > -1;
          });
          if (hit.length) groups.push({ topic: t, grade: t.grade, title: t.title, formulas: hit, types: TYPES[t.id] || null });
        });
        return groups;
      }

      function showFormulas(){
        var groups = matchingFormulaGroups();
        var out = '';
        groups.forEach(function(g){
          var t = g.topic;
          out +=
            '<div class="card" style="margin:10px 0">' +
              '<div class="row between">' +
                '<div>' + tag(t.subj) + ' <a href="#/bai/' + t.id + '" style="font-weight:700">Lớp ' + t.grade + (t.term ? ' (' + t.term + ')' : '') + ' – ' + esc(t.title) + '</a></div>' +
                '<a class="btn sm subtle" href="#/bai/' + t.id + '">Mở bài học ›</a>' +
              '</div>' +
              g.formulas.map(function(f){ return '<div class="formula">' + fmtFormula(f) + '</div>'; }).join('') +
            '</div>';
        });
        document.getElementById('nb-list').innerHTML = out || '<div class="empty">Không có công thức nào khớp từ khóa này.</div>';
      }
      showFormulas();
      document.getElementById('nb-search').oninput = function(e){ query = e.target.value; showFormulas(); };
      app.querySelectorAll('#nb-g button').forEach(function(b){
        b.onclick = function(){
          gradeFilter = b.dataset.g;
          app.querySelectorAll('#nb-g button').forEach(function(x){ x.classList.toggle('on', x === b); });
          showFormulas();
        };
      });
      app.querySelectorAll('#nb-s button').forEach(function(b){
        b.onclick = function(){
          subjFilter = b.dataset.s;
          app.querySelectorAll('#nb-s button').forEach(function(x){ x.classList.toggle('on', x === b); });
          showFormulas();
        };
      });
      document.getElementById('nb-print-btn').onclick = function(){
        var groups = matchingFormulaGroups();
        if (!groups.length) return;
        var spec = window.KHTNPrint.prepare({
          prefix: gradeFilter === 'all' ? 'ST' : 'ST' + gradeFilter,
          subtitle: 'Sổ tay công thức KHTN' + (gradeFilter !== 'all' ? ' · Lớp ' + gradeFilter : '') + (subjFilter !== 'all' ? ' · ' + SUBJ[subjFilter] : ''),
          formulaGroups: groups
        });
        window.KHTNPrint.open(spec, 'formulas');
      };
    } else {
      var box = document.getElementById('nb-mistakes');
      document.getElementById('nb-print-btn').disabled = mList.length === 0;
      document.getElementById('nb-print-btn').onclick = function(){
        if (!mList.length) return;
        var spec = window.KHTNPrint.prepare({
          prefix: 'CS',
          docTitle: 'PHIẾU ÔN LẠI CÁC CÂU HAY SAI',
          subtitle: 'Danh sách câu cần làm lại cho nhớ kỹ (' + mList.length + ' câu)',
          items: mList.map(function(m){
            var t = byId[m.topicId];
            return { topicTitle: 'Lớp ' + t.grade + ' · ' + t.title.replace(/^Bài \d+:\s*/, ''), q: getMistakeQuestion(m) };
          })
        });
        window.KHTNPrint.open(spec, 'both');
      };

      if (!mList.length) {
        box.innerHTML = '<div class="empty">🎉 Hiện tại chưa có câu làm sai nào! Khi làm bài nếu có câu nhầm, hệ thống sẽ tự lưu vào đây để bạn dễ ôn lại.</div>';
      } else {
        var out =
          '<div class="helper-tip">' +
            '<span>💡 Khi bạn bấm <b>Làm lại ngay</b> và trả lời đúng, câu đó sẽ tự động được gỡ khỏi danh sách sai.</span>' +
            '<a class="btn sm" href="#/luyen-tap/cau-sai">▶ Làm lại ' + mList.length + ' câu này ngay</a>' +
          '</div>';

        mList.forEach(function(m){
          var t = byId[m.topicId];
          var q = getMistakeQuestion(m);
          var ans = q.o ? q.o[0] : (fmtNum(q.n) + (q.u ? ' ' + q.u : ''));
          out +=
            '<div class="card" style="margin:10px 0">' +
              '<div class="row between">' +
                '<div>' + tag(t.subj) + ' ' + diffBadge(q) + ' <a href="#/bai/' + t.id + '"><b>Lớp ' + t.grade + ' – ' + esc(t.title) + '</b></a></div>' +
                '<span class="badge warn">Đã nhầm ' + (m.count || 1) + ' lần</span>' +
              '</div>' +
              '<p style="margin:.6em 0 .4em"><b>Câu hỏi:</b> ' + fmtMath(q.q) + '</p>' +
              '<div class="fb ok"><b>Đáp án đúng:</b> ' + fmtMath(ans) + (q.w ? '<br><b>Cách giải:</b> ' + fmtMath(q.w) : '') + '</div>' +
            '</div>';
        });
        box.innerHTML = out;
      }
    }
  }

  render();
}

// --- VIEW 9: Progress ---
function progress(){
  updateNavActive('tien-do');
  var prog = loadProg();
  var examStats = loadExams();
  var meta = loadMeta();
  var mistakes = loadMistakes();
  var mistakeCount = Object.keys(mistakes).length;
  var completed = D.filter(function(t){ return isMastered(t.id); }).length;
  var scores = Object.keys(prog).map(function(id){ return prog[id].best; }).filter(function(v){ return typeof v === 'number'; });
  var avgScore = scores.length ? score10(scores.reduce(function(a,b){ return a+b; }, 0) / scores.length) : '—';
  var doneExamIds = Object.keys(examStats).filter(function(id){ return examById[id]; });

  var h =
    '<div class="crumb"><a href="#/">🏠 Trang chủ</a> › Sổ điểm &amp; Tiến độ học tập</div>' +
    '<h1>🏆 Sổ Điểm &amp; Kết Quả Học Tập</h1>' +
    '<div class="grid stats" style="margin-bottom:16px">' +
      '<div class="card"><div class="muted">Bài đã nắm vững</div><div class="stat-val">' + completed + ' / ' + D.length + '</div></div>' +
      '<div class="card"><div class="muted">Điểm TB bài học</div><div class="stat-val">' + avgScore + '</div></div>' +
      '<div class="card"><div class="muted">Đề KT đã làm</div><div class="stat-val">' + doneExamIds.length + ' / ' + EXAMS.length + '</div></div>' +
      '<div class="card"><div class="muted">Câu cần ôn lại</div><div class="stat-val">' + mistakeCount + '</div></div>' +
    '</div>' +
    '<div id="prog-gb-7"></div>' +
    '<div id="prog-gb-8"></div>';

  if (meta.lastPlacement) {
    var lp = meta.lastPlacement;
    var dt = new Date(lp.date).toLocaleDateString('vi-VN');
    h +=
      '<section class="card highlight" style="margin-bottom:16px">' +
        '<div class="row between"><b>Kết quả Kiểm tra gốc gần nhất (Lớp ' + lp.grade + ')</b><span class="badge pri">' + esc(lp.score10) + ' / 10 · ' + dt + '</span></div>' +
        '<p style="margin:.45em 0">Đúng ' + lp.right + '/' + lp.total + ' câu.</p>';
    if (lp.weakIds && lp.weakIds.length) {
      h += '<ul class="tight">' + lp.weakIds.map(function(id){
        var t = byId[id];
        if (!t) return '';
        var doneNow = isMastered(id);
        return '<li><a href="#/bai/' + id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ') ' +
          (doneNow ? '<span class="badge ok">Đã ôn đạt ✓</span>' : '<span class="badge warn">Chưa ôn đạt</span>') + '</li>';
      }).join('') + '</ul>';
    } else {
      h += '<div class="done">Nền tảng rất tốt, không có bài nào bị hổng.</div>';
    }
    h += '</section>';
  }

  h += '<div class="grid two">';
  h += '<section class="card"><h2 style="margin-top:0">Tiến độ theo từng Lớp</h2>';
  [6,7,8,9].forEach(function(g){
    var l = D.filter(function(t){ return t.grade === g; });
    var p = pct(l);
    h +=
      '<div style="margin:10px 0">' +
        '<div class="row between"><a href="#/lop/' + g + '"><b>Lớp ' + g + '</b></a><span>' + p + '% (' + l.filter(function(t){ return isMastered(t.id); }).length + '/' + l.length + ' bài)</span></div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
      '</div>';
  });
  h += '</section>';

  h += '<section class="card"><h2 style="margin-top:0">Mức nắm vững theo Môn</h2>';
  Object.keys(SUBJ).forEach(function(s){
    var l = D.filter(function(t){ return t.subj === s; });
    var p = pct(l);
    h +=
      '<div style="margin:10px 0">' +
        '<div class="row between"><div>' + tag(s) + '</div><span>' + p + '% (' + l.filter(function(t){ return isMastered(t.id); }).length + '/' + l.length + ' bài)</span></div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
      '</div>';
  });
  h += '</section></div>';

  h +=
    '<h2>Chuyển sổ điểm sang máy khác hoặc làm mới</h2>' +
    '<div class="card">' +
      '<p class="muted" style="margin-top:0">Điểm số luôn tự động lưu trên máy này. Nếu muốn chuyển điểm sang điện thoại hoặc máy tính khác, bấm <b>Lưu sổ điểm về máy</b> rồi mở lại trên máy mới.</p>' +
      '<div class="row">' +
        '<button type="button" class="btn sm alt" id="btn-export">📥 Lưu sổ điểm về máy</button>' +
        '<button type="button" class="btn sm subtle" id="btn-import">📂 Mở lại sổ điểm đã lưu</button>' +
        '<input type="file" id="file-import" accept="application/json,.json" hidden>' +
        '<button type="button" class="btn sm danger" id="rs">🗑 Xóa điểm để học lại từ đầu</button>' +
      '</div>' +
    '</div>';

  app.innerHTML = h;
  mountGradebookWidget(document.getElementById('prog-gb-7'), 7);
  mountGradebookWidget(document.getElementById('prog-gb-8'), 8);

  document.getElementById('btn-export').onclick = function(){
    var payload = {
      version: 6,
      exportedAt: new Date().toISOString(),
      progress: loadProg(),
      exams: loadExams(),
      mistakes: loadMistakes(),
      meta: loadMeta()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'so-diem-khtn-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    showToast('📥 Đã lưu tệp sổ điểm về máy!');
  };

  var fileInput = document.getElementById('file-import');
  document.getElementById('btn-import').onclick = function(){ fileInput.click(); };
  fileInput.onchange = function(){
    var f = fileInput.files && fileInput.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function(){
      try {
        var data = JSON.parse(reader.result);
        if (data.progress) saveProg(data.progress);
        if (data.exams) saveExams(data.exams);
        if (data.mistakes) saveMistakes(data.mistakes);
        if (data.meta) saveMeta(data.meta);
        syncGradeNavLinks();
        showToast('✓ Đã khôi phục sổ điểm thành công!');
        progress();
      } catch (e) {
        alert('Tệp không đúng định dạng sổ điểm đã lưu.');
      }
    };
    reader.readAsText(f);
  };

  document.getElementById('rs').onclick = function(){
    if (confirm('Bạn có chắc muốn xóa toàn bộ điểm số và lịch sử làm bài trên máy này để bắt đầu lại từ đầu không?')) {
      saveProg({});
      saveExams({});
      saveDrafts({});
      saveMistakes({});
      saveMeta({});
      try { localStorage.removeItem('khtn-snapshots-v1'); } catch (e) {}
      showToast('Đã xóa dữ liệu, sẵn sàng học lại từ đầu!');
      progress();
    }
  };
}

// --- Router ---
function route(){
  stopSpeech();
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  var m = location.hash.replace(/^#\/?/, '').split('/');
  if (m[0] === 'lop') grade(parseInt(m[1], 10), m[2]);
  else if (m[0] === 'bai') lesson(m[1]);
  else if (m[0] === 'de-kiem-tra') examCatalog(parseInt(m[1], 10), m[2]);
  else if (m[0] === 'in-nhanh') quickPrintPage(parseInt(m[1], 10));
  else if (m[0] === 'lam-de') examRunner(m[1]);
  else if (m[0] === 'luyen-tap') practice(m[1]);
  else if (m[0] === 'kiem-tra') placement(parseInt(m[1], 10));
  else if (m[0] === 'so-tay') notebook(m[1]);
  else if (m[0] === 'tien-do') progress();
  else home();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
})();
