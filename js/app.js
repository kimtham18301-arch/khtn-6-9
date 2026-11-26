(function(){
'use strict';

var D = window.KHTN || [];
var EXAMS = window.KHTN_EXAMS || [];
var BANK = window.KHTNBank;
var app = document.getElementById('app');
var SUBJ = { hoa:'Hóa học', ly:'Vật lí', sinh:'Sinh học', td:'Mở đầu / Trái Đất' };
var DIFF = {
  1:'Nhận biết (Dễ)',
  2:'Thông hiểu (TB)',
  3:'Vận dụng (Khá)',
  4:'Vận dụng cao (Khó)'
};
var DIFF_SHORT = {
  1:'Mức 1 · Dễ',
  2:'Mức 2 · TB',
  3:'Mức 3 · Khá',
  4:'Mức 4 · Khó'
};
var STAGE_META = {
  1: { term:'HK1', title:'Giai đoạn 1 – Đầu Học kì I đến Giữa kì I (Tuần 1 – Tuần 9)', note:'Lộ trình đúng thứ tự: Học từng bài → Kiểm tra 15p (Lần 1) → Kiểm tra 15p (Lần 2) → Chốt Kiểm tra Giữa kì I.' },
  2: { term:'HK1', title:'Giai đoạn 2 – Sau Giữa kì I đến Cuối kì I (Tuần 10 – Tuần 18)', note:'Lộ trình đúng thứ tự: Học bài mới sau Giữa kì → Kiểm tra 15p (Lần 3, Lần 4) → Chốt Kiểm tra Cuối kì I. Không chèn kiến thức HK2.' },
  3: { term:'HK2', title:'Giai đoạn 3 – Đầu Học kì II đến Giữa kì II (Tuần 19 – Tuần 26)', note:'Lộ trình đúng thứ tự: Học kiến thức đầu HK2 → Kiểm tra 15p (Lần 1) → Kiểm tra 15p (Lần 2) → Chốt Kiểm tra Giữa kì II.' },
  4: { term:'HK2', title:'Giai đoạn 4 – Sau Giữa kì II đến Cuối kì II (Tuần 27 – Tuần 35)', note:'Lộ trình đúng thứ tự: Học nửa sau HK2 → Kiểm tra 15p (Lần 3, Lần 4) → Chốt Kiểm tra Cuối kì II.' },
  5: { term:'Cả năm', title:'Giai đoạn 5 – Ôn tổng hợp chuyển lớp & Bồi dưỡng Nâng cao', note:'Chỉ dùng khi đã hoàn tất cả 2 học kì hoặc ôn thi học sinh giỏi.' }
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

var currentCleanup = null;
var quickExamSpecs = {};

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

// --- Theme toggle ---
(function initTheme(){
  var btn = document.getElementById('theme-toggle');
  var saved = null;
  try { saved = localStorage.getItem(KEY_THEME); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');

  function apply(t){
    theme = t;
    document.documentElement.dataset.theme = t;
    if (btn) btn.textContent = t === 'dark' ? 'Đọc ban ngày' : 'Đọc ban đêm';
  }
  apply(theme);
  if (btn) {
    btn.onclick = function(){
      var next = theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY_THEME, next); } catch (e) {}
      apply(next);
    };
  }
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
function parseNumInput(raw){
  var clean = String(raw || '').replace(/\s+/g, '').replace(',', '.');
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
function estMinutes(qCount, withTheory){
  return Math.max(2, Math.ceil(qCount * 1.2 + (withTheory ? 2 : 0)));
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
  var nextL = D.find(function(t){ return t.grade === 7 && !isMastered(t.id); }) ||
              D.find(function(t){ return t.grade === 8 && !isMastered(t.id); }) ||
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
}

// ============================================================================
// BẢNG LỘ TRÌNH KIỂM TRA THEO THỨ TỰ THỜI GIAN HỌC KÌ & SỔ ĐIỂM THÔNG TƯ 22
// Thứ tự thời gian: KT 15p (Lần 1) -> KT 15p (Lần 2) -> Giữa kì -> KT 15p (Lần 3, 4) -> Cuối kì
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
    return '<td' + cls + '><a class="gb-cell-link" href="#/lam-de/' + info.exam.id + '" title="' + esc(info.exam.title) + '">Mở đề ›</a>' + sub + '</td>';
  }

  function render(){
    var h =
      '<section class="card" style="margin:14px 0">' +
        '<div class="row between">' +
          '<div>' +
            '<b>Lộ trình Đề Kiểm Tra theo Giai đoạn Học kì – KHTN Lớp ' + g + '</b>' +
            '<div class="muted" style="font-size:.86rem;line-height:1.75">Sắp xếp đúng thứ tự học tới đâu lấy đề tới đó: <b>Kiểm tra 15p (Lần 1) → Kiểm tra 15p (Lần 2) → Giữa kì → Kiểm tra 15p (Lần 3, Lần 4) → Cuối kì</b>. <i>(Trường lấy 3 hoặc 4 cột 15p đều tính đúng)</i>.</div>' +
          '</div>' +
          '<button type="button" class="btn sm ' + (simMode ? 'on' : 'alt') + '" id="gb-sim-btn">' + (simMode ? 'Đóng tính thử' : 'Tính thử điểm TB') + '</button>' +
        '</div>' +
        '<div class="gb-wrap">' +
          '<table class="gb-table">' +
            '<thead>' +
              '<tr>' +
                '<th rowspan="2">Học kì</th>' +
                '<th colspan="3" class="gb-stage-h1">Giai đoạn 1: Đầu kì → Giữa kì</th>' +
                '<th colspan="3" class="gb-stage-h2">Giai đoạn 2: Sau Giữa kì → Cuối kì</th>' +
                '<th rowspan="2">ĐTB kì</th>' +
              '</tr>' +
              '<tr>' +
                '<th>Kiểm tra 15p<br><small>Lần 1</small></th>' +
                '<th>Kiểm tra 15p<br><small>Lần 2</small></th>' +
                '<th class="gb-milestone">Kiểm tra<br>Giữa kì</th>' +
                '<th>Kiểm tra 15p<br><small>Lần 3</small></th>' +
                '<th>Kiểm tra 15p<br><small>Lần 4 / TH</small></th>' +
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
          '<span id="gb-year-summary"><b>ĐTB cả năm:</b> ' + (gb.cn != null ? ('<b class="done">' + fmtNum(gb.cn.toFixed(1)) + '</b> (' + rankLabel(gb.cn) + ')') : 'Bấm <b>Mở đề ›</b> đúng cột giai đoạn đang học trên lớp để rèn đề & lưu điểm.') + '</span>' +
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
        '<b>ĐTB cả năm (dự kiến):</b> ' + (scn != null ? ('<b class="done">' + fmtNum(scn.toFixed(1)) + ' / 10</b> — Mức đánh giá: <b>' + rankLabel(scn) + '</b>') : 'Nhập điểm từ 0 đến 10 (có thể để trống Lần 4 nếu trường chỉ lấy 3 bài 15p).');
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
  var typeLabel = q.o ? 'Trắc nghiệm' : 'Điền số';

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
        '<input type="text" inputmode="decimal" placeholder="Nhập số (VD: 1,5)" aria-label="Nhập đáp án số">' +
        '<span>' + esc(q.u || '') + '</span>' +
        (deferred ? '' : '<button type="button" class="btn sm" data-act="check">Kiểm tra</button>') +
      '</div>' +
      '<div class="fb-err" hidden></div>';
  }

  if (opts.hintText && !deferred) {
    h += '<div class="row" style="margin-top:8px"><button type="button" class="btn sm subtle" data-act="hint">Xem gợi ý</button></div>' +
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
      hintBtn.textContent = hintBox.hidden ? 'Xem gợi ý' : 'Ẩn gợi ý';
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
      if (q.o) ansLine = '<br>Đáp án đúng: <b>' + fmtMath(q.o[0]) + '</b>';
      else if (q.n != null) ansLine = '<br>Đáp án đúng: <b>' + fmtNum(q.n) + (q.u ? ' ' + esc(q.u) : '') + '</b>';
    }
    var headText = ok ? 'Chính xác.' : (skipped ? 'Chưa trả lời (0 điểm).' : 'Chưa đúng.');
    fb.innerHTML =
      '<div><b>' + headText + '</b> ' + ansLine + '</div>' +
      (q.w ? '<div style="margin-top:4px"><b>Giải thích:</b> ' + fmtMath(q.w) + '</div>' : '');

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
        var v = parseNumInput(inp.value);
        if (isNaN(v)) {
          errEl.textContent = 'Vui lòng nhập một số hợp lệ (có thể dùng dấu phẩy, ví dụ: 2,5 hoặc 20000).';
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
      var v = parseNumInput(raw);
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

  var diffNote = diffFilter && diffFilter !== 'all' ? ' · ' + DIFF[Number(diffFilter)] : ' · Chỉ xoay quanh đúng bài học này';
  return window.KHTNPrint.prepare({
    prefix: 'L' + topic.grade,
    docTitle: 'ĐỀ BÀI TẬP THEO BÀI – KHTN LỚP ' + topic.grade,
    subtitle: topic.title + diffNote,
    lesson: (!diffFilter || diffFilter === 'all') ? topic : null,
    items: items
  });
}

// Helper: STRICTLY scoped exam item builder — ONLY pulls from `exam.topics`, NEVER from later stages/semesters!
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

function createFreshExamSnapshot(ex, levelMode){
  var m = levelMode || ex.presetLevel || 'standard';
  var mTxt = m === 'basic' ? 'Mức Cơ bản' : (m === 'advanced' ? 'Mức Nâng cao' : 'Chuẩn ma trận Bộ GD&ĐT');
  var picks = buildExamItems(ex, m);
  var snap = window.KHTNPrint.prepare({
    prefix: 'KT' + ex.grade,
    docTitle: ex.title.toUpperCase(),
    subtitle: 'KHTN Lớp ' + ex.grade + ' · ' + ex.term + (ex.weeks ? ' (' + ex.weeks + ')' : '') + ' · ' + mTxt + ' · ' + ex.scope,
    minutes: ex.minutes,
    items: picks.map(function(p){ return { topicTitle: p.t.title.replace(/^Bài \d+:\s*/, ''), q: p.q }; })
  });
  quickExamSpecs[ex.id + '::' + m] = snap;
  return snap;
}

function getOrCreateExamPrintSpec(ex, levelMode){
  var key = ex.id + '::' + (levelMode || ex.presetLevel || 'standard');
  return quickExamSpecs[key] || createFreshExamSnapshot(ex, levelMode);
}

// --- VIEW 1: Home ---
function home(){
  updateNavActive('');
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

  var h =
    '<section class="hero">' +
      '<div class="hero-kicker">✦ Pastel Open-Book · Natural Science 6–9 ✦</div>' +
      '<h1>SciBook</h1>' +
      '<p>Quyển sách pastel tự học &amp; luyện đề Khoa học tự nhiên (Trọng tâm Tập 7 &amp; Tập 8): công thức phân số rõ nét, chia <b>4 giai đoạn năm học (140 tiết)</b>, sổ điểm <b>Thông tư 22/2021/TT-BGDĐT</b>, khóa chặt random theo từng bài và tách riêng 2 phần Đề – Đáp án khi in PDF.</p>' +
      '<div class="row">' +
        '<a class="btn" href="#/lop/7">Mở Tập 7 (Lớp 7)</a>' +
        '<a class="btn" href="#/lop/8">Mở Tập 8 (Lớp 8)</a>' +
        '<a class="btn ghost" href="#/de-kiem-tra/8">Phụ lục Đề 15p · Giữa kì · Cuối kì</a>' +
      '</div>' +
    '</section>';

  var l7 = D.filter(function(t){ return t.grade === 7; });
  var l8 = D.filter(function(t){ return t.grade === 8; });
  var ex7 = EXAMS.filter(function(e){ return e.grade === 7; });
  var ex8 = EXAMS.filter(function(e){ return e.grade === 8; });
  var estQ7 = BANK ? BANK.estimateTotalQuestions(l7) : l7.reduce(function(s,t){ return s+t.questions.length; },0);
  var estQ8 = BANK ? BANK.estimateTotalQuestions(l8) : l8.reduce(function(s,t){ return s+t.questions.length; },0);

  h += '<h2>Lộ trình 4 Giai đoạn & Sổ điểm Thông tư 22 (Trọng tâm Lớp 7 – 8)</h2><div class="grid two" style="margin-bottom:18px">';
  [
    { g:7, list:l7, qTotal:estQ7, exs:ex7, desc:'HK1 (72 tiết): Mở đầu, Nguyên tử, Bảng tuần hoàn, Tốc độ → GK1 → Phân tử, Hóa trị, Âm thanh, Ánh sáng → CK1. HK2 (68 tiết): Từ trường, Quang hợp – Hô hấp, Vận chuyển → GK2 → Cảm ứng, Sinh sản → CK2.' },
    { g:8, list:l8, qTotal:estQ8, exs:ex8, desc:'HK1 (72 tiết): Thí nghiệm, Phản ứng – BTKL, Mol – Thể tích khí, Áp suất → GK1 → Dung dịch, PTHH, Archimedes, Đòn bẩy, Tiêu hóa → CK1. HK2 (68 tiết): Acid–Base, Oxide–Muối, Điện, Tuần hoàn → GK2 → Nhiệt, Thần kinh, Sinh thái → CK2.' }
  ].forEach(function(item){
    var p = pct(item.list);
    var gb = computeCircular22Gradebook(item.g);
    h +=
      '<div class="card highlight">' +
        '<div class="row between"><h2 style="margin:0">KHTN Lớp ' + item.g + '</h2><span class="badge pri">15p → Giữa kì → 15p → Cuối kì</span></div>' +
        '<p class="muted" style="font-size:.9rem;margin:.45em 0">' + esc(item.desc) + '</p>' +
        '<div class="muted" style="font-size:.9rem"><b>' + item.list.length + ' bài</b> · <b>' + item.qTotal + '+ câu khóa đúng bài</b> · <b>' + item.exs.length + ' đề theo giai đoạn</b></div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
        '<div class="muted" style="font-size:.86rem;margin-bottom:8px">ĐTB HK1: <b>' + (gb.hk1 != null ? fmtNum(gb.hk1.toFixed(1)) : '—') + '</b> · ĐTB HK2: <b>' + (gb.hk2 != null ? fmtNum(gb.hk2.toFixed(1)) : '—') + '</b> · Cả năm: <b>' + (gb.cn != null ? fmtNum(gb.cn.toFixed(1)) : '—') + '</b></div>' +
        '<div class="row">' +
          '<a class="btn sm" href="#/lop/' + item.g + '">Vào lộ trình từng giai đoạn</a>' +
          '<a class="btn sm alt" href="#/de-kiem-tra/' + item.g + '">Chọn đề 15p · Giữa kì · Cuối kì</a>' +
        '</div>' +
      '</div>';
  });
  h += '</div>';

  h += '<div class="grid two" style="margin-bottom:18px">';
  if (resumeTopic) {
    h +=
      '<a class="card" href="#/bai/' + resumeTopic.id + '">' +
        '<div class="row between"><span class="badge pri">Bài học gần nhất</span>' + tag(resumeTopic.subj) + '</div>' +
        '<h3 style="margin:.45em 0 .2em;font-size:1.12rem">Học tiếp: ' + esc(resumeTopic.title) + '</h3>' +
        '<div class="muted">Lớp ' + resumeTopic.grade + (resumeTopic.weeks ? ' · ' + resumeTopic.weeks : '') + ' · Chỉ random xoay quanh kiến thức bài này</div>' +
      '</a>';
  }
  h +=
    '<div class="card">' +
      '<div class="row between"><span class="badge">Tổng quan tiến độ</span><a href="#/tien-do" style="font-size:.9rem;font-weight:600">Xem sổ điểm & tiến độ</a></div>' +
      '<div class="row" style="gap:18px;margin-top:10px">' +
        '<div><div class="stat-val">' + completed + '/' + D.length + '</div><div class="muted" style="font-size:.84rem">Bài đạt chuẩn</div></div>' +
        '<div><div class="stat-val">' + avgScore + '</div><div class="muted" style="font-size:.84rem">Điểm TB bài</div></div>' +
        '<div><div class="stat-val">' + examsDone + '</div><div class="muted" style="font-size:.84rem">Đề KT đã làm</div></div>' +
        '<div><div class="stat-val">' + mistakeCount + '</div><div class="muted" style="font-size:.84rem">Câu cần ôn</div></div>' +
      '</div>' +
      (mistakeCount ? '<div style="margin-top:10px"><a class="btn sm alt" href="#/luyen-tap/cau-sai">Luyện lại ' + mistakeCount + ' câu hay sai</a></div>' : '') +
    '</div>';
  h += '</div>';

  h += '<h2>Tủ sách 4 Tập (Lớp 6 – Lớp 9)</h2><div class="grid">';
  [6,7,8,9].forEach(function(g){
    var l = D.filter(function(t){ return t.grade === g; });
    var exCount = EXAMS.filter(function(ex){ return ex.grade === g; }).length;
    var p = pct(l);
    var totalQ = BANK ? BANK.estimateTotalQuestions(l) : l.reduce(function(s,t){ return s + t.questions.length; }, 0);
    h +=
      '<a class="vol-card v' + g + '" href="#/lop/' + g + '">' +
        '<div class="row between"><span class="vol-label">Quyển Tập ' + g + '</span><span class="badge ' + ((g === 7 || g === 8) ? 'pri' : (p === 100 ? 'ok' : '')) + '">' + ((g === 7 || g === 8) ? 'Trọng tâm' : p + '%') + '</span></div>' +
        '<h2 style="margin:.2em 0 .15em">KHTN Lớp ' + g + '</h2>' +
        '<div class="muted" style="margin-top:2px;font-size:.9rem">' + l.length + ' chương bài · ' + totalQ + '+ câu · ' + exCount + ' đề KT</div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
        '<small class="muted">Đã đọc & đạt ' + l.filter(function(t){ return isMastered(t.id); }).length + '/' + l.length + ' bài (' + p + '%)</small>' +
      '</a>';
  });
  h += '</div>';

  app.innerHTML = h;
}

// --- Stage-Based Exam Explorer Renderer ---
var EXAM_STAGE_FILTERS = [
  { key:'all', label:'Cả năm theo 4 giai đoạn' },
  { key:'s1',  label:'GĐ1: Đầu HK1 → Giữa kì I' },
  { key:'s2',  label:'GĐ2: Sau GK1 → Cuối kì I' },
  { key:'s3',  label:'GĐ3: Đầu HK2 → Giữa kì II' },
  { key:'s4',  label:'GĐ4: Sau GK2 → Cuối kì II' },
  { key:'15p', label:'Chỉ đề Kiểm tra 15p' },
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
    ? '<span class="badge warn">Đề Giữa học kì · Chốt nửa đầu kì</span>'
    : (ex.kind === 'ck'
      ? '<span class="badge d4">Đề Cuối học kì · Chốt cả học kì</span>'
      : (ex.col
        ? '<span class="badge pri">Kiểm tra 15p · ' + stageTag + '</span>'
        : (ex.kind === '15p'
          ? '<span class="badge ok">Kiểm tra 15p theo bài · ' + stageTag + '</span>'
          : '<span class="badge">Đề ôn tổng hợp</span>')));

  return (
    '<div class="card">' +
      '<div class="row between">' +
        colBadge +
        '<span class="badge">' + (ex.weeks ? esc(ex.weeks) + ' · ' : '') + ex.minutes + 'p · ' + ex.count + ' câu</span>' +
      '</div>' +
      '<h3 style="margin:.5em 0 .2em;font-size:1.06rem">' + esc(ex.title) + '</h3>' +
      '<div class="muted" style="font-size:.89rem;margin-bottom:10px">' + esc(ex.scope) + '</div>' +
      (st ? '<div class="' + (st.best >= 0.65 ? 'done' : 'muted') + '" style="font-size:.89rem;margin-bottom:10px">Điểm cột: ' + score10(st.best) + '/10 · Gần nhất: ' + score10(st.last) + '/10 (' + st.attempts + ' lượt)</div>' : '') +
      '<div class="row">' +
        '<a class="btn sm" href="#/lam-de/' + ex.id + '">Làm đề (Random trong phạm vi)</a>' +
        '<button type="button" class="btn sm alt" data-print-quiz="' + ex.id + '">Phần 1: Đề</button>' +
        '<button type="button" class="btn sm subtle" data-print-key="' + ex.id + '">Phần 2: Đáp án</button>' +
      '</div>' +
    '</div>'
  );
}

function wirePrintButtons(rootEl){
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

// --- VIEW 2: Grade (Integrated 4-Stage Learning + Exam Timeline + Circular 22 Gradebook) ---
function grade(g, activeTab){
  if ([6,7,8,9].indexOf(g) === -1) {
    updateNavActive('');
    app.innerHTML = '<div class="empty"><p>Không có dữ liệu cho lớp này.</p><a class="btn" href="#/">Về trang chủ</a></div>';
    return;
  }
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
          (b != null && b >= 0.67 ? '<span class="badge ok">Đạt</span>' : '<span class="badge pri">Dễ → Khó</span>') +
        '</div>' +
        '<h3 style="margin:.45em 0 .25em;font-size:1.04rem">' + esc(t.title) + '</h3>' +
        '<div class="muted" style="font-size:.86rem">' + (t.periods ? t.periods + ' tiết · ' : '') + 'Kho ' + poolCount + '+ câu khóa đúng bài</div>' +
        (b == null ? '' : '<div style="margin-top:6px;font-size:.89rem" class="' + (b >= 0.67 ? 'done' : 'muted') + '">Điểm tốt nhất: ' + score10(b) + '/10</div>') +
      '</a>'
    );
  }

  function renderView(){
    var h =
      '<div class="crumb"><a href="#/">Trang chủ</a> › Lớp ' + g + '</div>' +
      '<div class="row between">' +
        '<h1>Lộ trình & Hệ thống Kiểm tra KHTN Lớp ' + g + '</h1>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="g-print-formulas">In PDF Sổ tay công thức lớp ' + g + '</button>' +
          '<a class="btn sm subtle" href="#/kiem-tra/' + g + '">Kiểm tra nền</a>' +
        '</div>' +
      '</div>' +
      '<div id="gb-slot"></div>' +
      '<div class="tabs">' +
        (hasStages ? '<button type="button" data-gtab="roadmap" class="' + (tab === 'roadmap' ? 'on' : '') + '">Lộ trình 4 Giai đoạn (Học bài → KT 15p → Giữa kì → Cuối kì)</button>' : '') +
        '<button type="button" data-gtab="lessons" class="' + (tab === 'lessons' ? 'on' : '') + '">Tra cứu theo môn (' + list.length + ' bài)</button>' +
        '<button type="button" data-gtab="exams" class="' + (tab === 'exams' ? 'on' : '') + '">Tất cả Đề kiểm tra (' + gExams.length + ' đề)</button>' +
      '</div>' +
      '<div id="g-body"></div>';

    app.innerHTML = h;
    mountGradebookWidget(document.getElementById('gb-slot'), g);

    document.getElementById('g-print-formulas').onclick = function(){
      var spec = window.KHTNPrint.prepare({
        prefix: 'ST' + g,
        subtitle: 'Toàn bộ công thức & ghi nhớ trọng tâm KHTN Lớp ' + g + ' (GDPT 2018)',
        formulaGroups: list.map(function(t){ return { grade: t.grade, title: t.title, formulas: t.formulas }; })
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
            '<h3>Bước 1: Học & củng cố từng bài trong giai đoạn (' + stLessons.length + ' bài)</h3>' +
            '<div class="grid">' + stLessons.map(renderLessonCard).join('') + '</div>' +
            '<h3 style="margin-top:14px">Bước 2: Đề Kiểm tra 15p & Giữa kì / Cuối kì đúng giai đoạn này (' + stExams.length + ' đề)</h3>' +
            '<div class="grid two">' + stExams.map(function(ex){ return renderExamCardHtml(ex, savedEx); }).join('') + '</div>' +
          '</section>';
      });
      bodyEl.innerHTML = rHtml;
      wirePrintButtons(bodyEl);
    } else if (tab === 'lessons') {
      bodyEl.innerHTML =
        '<input type="search" id="g-search" placeholder="Tìm nhanh bài học hoặc công thức lớp ' + g + '…" value="' + esc(searchText) + '">' +
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

// --- VIEW 3: Lesson (Strictly Scoped Random Questions of ONLY This Lesson) ---
function lesson(id){
  var t = byId[id];
  if (!t) {
    updateNavActive('');
    app.innerHTML = '<div class="empty"><p>Không tìm thấy bài học.</p><a class="btn" href="#/">Về trang chủ</a></div>';
    return;
  }
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

  // Only show exams from the SAME stage/term (never jump ahead to a future semester exam!)
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

  var h =
    '<div class="crumb"><a href="#/">Trang chủ</a> › <a href="#/lop/' + t.grade + '">Lớp ' + t.grade + '</a> › ' + esc(t.title) + '</div>' +
    '<div class="row between">' +
      '<div class="row">' +
        tag(t.subj) +
        '<span class="badge">Lớp ' + t.grade + (t.term ? ' · ' + t.term : '') + (t.weeks ? ' · ' + t.weeks : '') + '</span>' +
        '<span class="badge pri" id="bank-info">Random ' + sessionItems.length + ' câu đúng bài này (kho ' + totalBankCount + '+ câu)</span>' +
      '</div>' +
      '<div class="row">' +
        '<button type="button" class="btn sm alt" id="top-dl-2part">Tải / In 2 phần (Đề + Đáp án)</button>' +
      '</div>' +
    '</div>' +
    '<h1>' + esc(t.title) + '</h1>';

  if (t.prereq && t.prereq.length) {
    h += '<div class="card soft" style="margin-bottom:14px"><b>Kiến thức nền đã học trước đó:</b> ' +
      t.prereq.map(function(pid){
        var b = byId[pid];
        if (!b) return '';
        var okMark = isMastered(pid) ? ' <span class="done">(đã vững ✓)</span>' : '';
        return '<a href="#/bai/' + pid + '">' + esc(b.title) + ' (lớp ' + b.grade + ')</a>' + okMark;
      }).join(' · ') + '</div>';
  }

  h +=
    '<section class="card" style="margin-bottom:14px">' +
      '<h2 style="margin-top:0">1. Kiến thức trọng tâm (Bộ GD&ĐT)</h2>' +
      '<ul class="tight">' + t.theory.map(function(s){ return '<li>' + fmtMath(s) + '</li>'; }).join('') + '</ul>' +
      '<h2>2. Công thức & ý nghĩa từng đại lượng</h2>' +
      t.formulas.map(function(f){ return '<div class="formula">' + fmtFormula(f) + '</div>'; }).join('');

  if (t.examples && t.examples.length) {
    h += '<h2>3. Ví dụ minh họa từ Cơ bản đến Vận dụng</h2>';
    t.examples.forEach(function(ex, ei){
      h +=
        '<div class="example-card">' +
          '<div><b>Ví dụ ' + (ei + 1) + '.</b> ' + fmtMath(ex.q) + '</div>' +
          '<details' + (ei === 0 ? ' open' : '') + '>' +
            '<summary>Xem lời giải từng bước</summary>' +
            '<ol class="example-steps">' + ex.steps.map(function(st){ return '<li>' + fmtMath(st) + '</li>'; }).join('') + '</ol>' +
            '<div><b>Đáp số:</b> ' + fmtMath(ex.ans) + '</div>' +
          '</details>' +
        '</div>';
    });
  }
  h += '</section>';

  h +=
    '<div class="row between">' +
      '<h2 style="margin:.4em 0">4. Bài tập củng cố đúng trọng tâm bài (Không chèn bài sau)</h2>' +
      '<button type="button" class="btn sm alt" id="btn-reroll">Đổi bộ câu hỏi khác (Random trong bài)</button>' +
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
        '<div><b>Tải về / In PDF tách riêng 2 phần độc lập (Khổ A4)</b><div class="muted" style="font-size:.9rem">Chỉ xuất câu hỏi của riêng bài này. Tách rõ <b>Phần 1: Đề (Không đáp án)</b> và <b>Phần 2: Đáp án riêng</b> khóa theo Mã đề cố định.</div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm" id="pdf-quiz">Phần 1: Đề (Không đáp án)</button>' +
          '<button type="button" class="btn sm alt" id="pdf-key">Phần 2: Đáp án riêng</button>' +
          '<button type="button" class="btn sm subtle" id="pdf-study">Lý thuyết + Đề</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (relatedExams.length) {
    h += '<div class="card soft" style="margin-top:12px"><b>Bài kiểm tra 15 phút / Giữa kì của giai đoạn này:</b><div class="row" style="margin-top:8px">' +
      relatedExams.map(function(ex){
        return '<a class="btn sm subtle" href="#/lam-de/' + ex.id + '">' + esc(ex.title) + '</a>';
      }).join('') + '</div></div>';
  }

  h +=
    '<div class="lesson-nav">' +
      (prevLesson ? '<a class="btn subtle" href="#/bai/' + prevLesson.id + '">← Trang trước: ' + esc(prevLesson.title) + '</a>' : '<span></span>') +
      (nextLesson ? '<a class="btn" href="#/bai/' + nextLesson.id + '">Lật trang tiếp: ' + esc(nextLesson.title) + ' →</a>' : '<a class="btn" href="#/lop/' + t.grade + '/exams">Mở Phụ lục Đề kiểm tra lớp ' + t.grade + ' →</a>') +
    '</div>';

  app.innerHTML = h;

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
      bankInfoEl.textContent = 'Đã random bộ ' + sessionItems.length + ' câu mới đúng bài này (kho ' + totalBankCount + '+ câu)';
    }
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
      '<b>Tất cả (Dễ → Khó)</b><small>' + allAns + '/' + allIdxs.length + ' câu lượt này</small></button>'
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
    var levelTitle = selectedDiff === 'all' ? 'toàn bài (Dễ → Khó)' : DIFF[Number(selectedDiff)];
    var singleTopicExam = EXAMS.find(function(ex){ return ex.topics.length === 1 && ex.topics[0] === id; });

    resEl.className = 'card highlight';
    resEl.style.marginTop = '12px';
    resEl.innerHTML =
      '<div class="row between">' +
        '<div><div class="score-big">Điểm ' + esc(levelTitle) + ': ' + score10(ratio) + ' / 10</div>' +
        '<div>Đúng <b>' + right + '/' + idxs.length + '</b> câu (' + Math.round(ratio * 100) + '%)</div></div>' +
        '<span class="badge ' + (ratio >= 0.67 ? 'ok' : 'warn') + '">' + (ratio >= 0.67 ? 'Đã vững mức này' : 'Nên củng cố thêm') + '</span>' +
      '</div>' +
      '<p style="margin:.6em 0">' + (ratio >= 0.67
        ? (nextDiff ? 'Rất tốt! Hãy bước tiếp lên <b>' + DIFF[Number(nextDiff)] + '</b> trong chính bài này nhé.' : 'Xuất sắc! Bạn đã nắm vững cả 4 mức độ của bài này — có thể làm thử bài Kiểm tra 15 phút riêng của chủ đề này.')
        : 'Hãy đọc lại lời giải từng câu rồi bấm Random bộ câu mới ở mức này để rèn thêm nhé!') + '</p>' +
      '<div class="row">' +
        (nextDiff ? '<button type="button" class="btn" id="next-diff">Tiến lên ' + DIFF[Number(nextDiff)] + ' →</button>' : '') +
        (!nextDiff && singleTopicExam ? '<a class="btn" href="#/lam-de/' + singleTopicExam.id + '">Làm KT 15 phút bài này →</a>' : '') +
        '<button type="button" class="btn alt" id="again-rand">Random bộ câu mới trong bài</button>' +
      '</div>';

    var btnNextDiff = document.getElementById('next-diff');
    if (btnNextDiff) {
      btnNextDiff.onclick = function(){
        selectedDiff = nextDiff;
        renderQuestionsForSelectedDiff();
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
  currentCleanup = function(){ if (padEl && padEl._destroy) padEl._destroy(); };

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
  document.getElementById('top-dl-2part').onclick = function(){ openLessonPrint('quiz'); };
  document.getElementById('pdf-quiz').onclick = function(){ openLessonPrint('quiz'); };
  document.getElementById('pdf-key').onclick = function(){ openLessonPrint('key'); };
  document.getElementById('pdf-study').onclick = function(){ openLessonPrint('study'); };
}

// --- VIEW 4: Exam Catalog (#/de-kiem-tra/:g/:cat) ---
function examCatalog(g, initialCat){
  if ([6,7,8,9].indexOf(g) === -1) g = 8;
  updateNavActive('de-kiem-tra');

  var h =
    '<div class="crumb"><a href="#/">Trang chủ</a> › Lộ trình đề kiểm tra lớp ' + g + '</div>' +
    '<div class="row between">' +
      '<h1>Lộ trình Đề Kiểm Tra & Cột Điểm Trường – Lớp ' + g + '</h1>' +
      '<div class="row">' +
        [7,8,6,9].map(function(gr){
          var lbl = (gr === 7 || gr === 8) ? ('Lớp ' + gr + ' ★') : ('Lớp ' + gr);
          return '<a class="btn sm ' + (gr === g ? 'on' : 'subtle') + '" href="#/de-kiem-tra/' + gr + '">' + lbl + '</a>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="cat-gb-slot"></div>' +
    '<p class="muted">Mỗi đề kiểm tra được <b>khóa chặt theo đúng phạm vi bài đã học của từng giai đoạn</b>: bài 15 phút chỉ xoay quanh đúng bài vừa học (đổi số liệu/câu hỏi trong bài đó), đề Giữa kì chỉ lấy nửa đầu học kì, đề Cuối kì chỉ lấy trong học kì đó — tuyệt đối không chèn kiến thức học kì sau.</p>' +
    '<div id="cat-exams-box"></div>';

  app.innerHTML = h;
  mountGradebookWidget(document.getElementById('cat-gb-slot'), g);
  mountExamExplorer(document.getElementById('cat-exams-box'), g, initialCat || 'all');
}

// --- VIEW 5: Exam Runner (#/lam-de/:examId) ---
function examRunner(examId){
  var ex = examById[examId];
  if (!ex) {
    updateNavActive('de-kiem-tra');
    app.innerHTML = '<div class="empty"><p>Không tìm thấy đề kiểm tra.</p><a class="btn" href="#/de-kiem-tra/8">Xem danh sách đề</a></div>';
    return;
  }
  updateNavActive('de-kiem-tra');

  var levelMode = ex.presetLevel || 'standard';
  var examMode = 'exam';
  var timerId = null;

  function stopTimer(){
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function renderSetup(){
    stopTimer();
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    var st = loadExams()[ex.id];
    var setupPrintSpec = null;
    var coefNote = ex.kind === 'gk'
      ? 'Đề Giữa kì (chỉ gồm kiến thức nửa đầu học kì)'
      : (ex.kind === 'ck'
        ? 'Đề Cuối kì (tổng hợp đúng học kì này)'
        : (ex.col ? 'Đề Kiểm tra 15p chính thức theo giai đoạn' : 'Đề Kiểm tra 15p tự luyện riêng theo bài'));

    var h =
      '<div class="crumb"><a href="#/">Trang chủ</a> › <a href="#/de-kiem-tra/' + ex.grade + '">Đề kiểm tra lớp ' + ex.grade + '</a> › ' + esc(ex.title) + '</div>' +
      '<div class="row" style="margin-bottom:6px">' +
        '<span class="badge pri">Lớp ' + ex.grade + ' · ' + esc(ex.term) + (ex.weeks ? ' · ' + esc(ex.weeks) : '') + '</span>' +
        '<span class="badge warn">' + esc(coefNote) + '</span>' +
        '<span class="badge">' + ex.minutes + ' phút · ' + ex.count + ' câu</span>' +
      '</div>' +
      '<h1>' + esc(ex.title) + '</h1>' +
      '<p class="muted"><b>Phạm vi khóa chặt:</b> ' + esc(ex.scope) + '</p>' +
      (st ? '<div class="card soft" style="margin-bottom:14px">Lịch sử làm đề này: <b>' + st.attempts + ' lượt</b> · Điểm cao nhất: <b class="done">' + score10(st.best) + '/10</b> · Gần nhất: <b>' + score10(st.last) + '/10</b></div>' : '') +
      '<section class="card">' +
        '<h2 style="margin-top:0">Tùy chọn mức độ & hình thức làm đề</h2>' +
        '<div class="form-grid">' +
          '<div class="field"><label for="ex-level">Cấu trúc độ khó</label><select id="ex-level">' +
            '<option value="standard">Chuẩn ma trận Bộ GD&ĐT (40% Dễ · 30% TB · 20% Khá · 10% Khó)</option>' +
            '<option value="basic">Củng cố gốc (55% Nhận biết Dễ · 45% Thông hiểu TB)</option>' +
            '<option value="advanced">Đề Nâng cao / Thử sức (tập trung Vận dụng & Vận dụng cao)</option>' +
          '</select></div>' +
          '<div class="field"><label for="ex-mode">Chế độ làm bài</label><select id="ex-mode">' +
            '<option value="exam">Thi thật (làm hết đề rồi bấm Nộp bài chấm điểm)</option>' +
            '<option value="practice">Ôn luyện (kiểm tra & xem lời giải ngay từng câu)</option>' +
          '</select></div>' +
        '</div>' +
        '<div class="card soft" style="margin:10px 0 14px">' +
          '<b>Chỉ lấy câu hỏi từ ' + ex.topics.length + ' bài đã học sau (không lẫn bài ngoài phạm vi):</b> ' +
          ex.topics.map(function(tid){
            var bt = byId[tid];
            return bt ? '<a href="#/bai/' + tid + '">' + esc(bt.title) + '</a>' : '';
          }).filter(Boolean).join(' · ') +
        '</div>' +
        '<div class="row">' +
          '<button type="button" class="btn" id="ex-start">Bắt đầu làm đề (Random mới)</button>' +
          '<button type="button" class="btn alt" id="ex-print-now">Tải / In Phần 1: Đề (Không đáp án)</button>' +
          '<button type="button" class="btn subtle" id="ex-key-now">Tải / In Phần 2: Đáp án riêng</button>' +
          '<a class="btn subtle" href="#/de-kiem-tra/' + ex.grade + '">Danh sách đề</a>' +
        '</div>' +
      '</section>';

    app.innerHTML = h;
    var elLevel = document.getElementById('ex-level');
    var elMode = document.getElementById('ex-mode');
    elLevel.value = levelMode;
    elMode.value = examMode;
    elLevel.onchange = function(){ levelMode = elLevel.value; setupPrintSpec = null; };
    elMode.onchange = function(){ examMode = elMode.value; };

    function ensureSetupSpec(){
      if (!setupPrintSpec) setupPrintSpec = createFreshExamSnapshot(ex, levelMode);
      return setupPrintSpec;
    }
    document.getElementById('ex-start').onclick = function(){ startExam(); };
    document.getElementById('ex-print-now').onclick = function(){
      window.KHTNPrint.open(ensureSetupSpec(), 'quiz', {
        onRegenerate: function(){ setupPrintSpec = createFreshExamSnapshot(ex, levelMode); return setupPrintSpec; }
      });
    };
    document.getElementById('ex-key-now').onclick = function(){
      window.KHTNPrint.open(ensureSetupSpec(), 'key', {
        onRegenerate: function(){ setupPrintSpec = createFreshExamSnapshot(ex, levelMode); return setupPrintSpec; }
      });
    };
  }

  function startExam(){
    stopTimer();
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    var picks = buildExamItems(ex, levelMode);
    var isDeferred = examMode === 'exam';
    var levelTxt = levelMode === 'basic' ? 'Củng cố gốc' : (levelMode === 'advanced' ? 'Nâng cao' : 'Chuẩn ma trận Bộ GD&ĐT');

    var attemptSpec = window.KHTNPrint.prepare({
      prefix: 'KT' + ex.grade,
      docTitle: ex.title.toUpperCase(),
      subtitle: 'KHTN Lớp ' + ex.grade + ' · ' + ex.term + ' · ' + levelTxt,
      minutes: ex.minutes,
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
      '<div class="crumb"><a href="#/">Trang chủ</a> › <a href="#/de-kiem-tra/' + ex.grade + '">Đề kiểm tra lớp ' + ex.grade + '</a> › ' + esc(ex.title) + '</div>' +
      '<div class="row between">' +
        '<div><h1 style="margin-bottom:.15em">' + esc(ex.title) + '</h1>' +
        '<div class="muted">Mã đề: <b>' + esc(attemptSpec.code) + '</b> · Khóa đúng phạm vi: ' + esc(ex.scope) + '</div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="ex-top-pdf">Tải / In 2 phần (' + esc(attemptSpec.code) + ')</button>' +
          '<button type="button" class="btn sm subtle" id="ex-new">Random đề khác</button>' +
          '<button type="button" class="btn sm subtle" id="ex-cfg">Cấu hình</button>' +
        '</div>' +
      '</div>' +
      '<div class="exam-bar">' +
        '<div class="row">' +
          '<span class="timer" id="ex-clock">' + fmtClock(leftSec) + '</span>' +
          '<button type="button" class="btn sm subtle" id="ex-pause">Tạm dừng</button>' +
          '<button type="button" class="btn sm subtle" id="ex-hide-t">Ẩn đồng hồ</button>' +
          '<span class="muted" id="ex-prog">Đã trả lời: 0/' + picks.length + '</span>' +
        '</div>' +
        '<div class="row">' +
          (isDeferred ? '<button type="button" class="btn sm" id="ex-submit">Nộp bài kiểm tra</button>' : '') +
        '</div>' +
      '</div>' +
      '<div id="ex-time-msg" class="q-hint" hidden>Đã hết thời gian gợi ý (' + ex.minutes + ' phút). Bạn vẫn có thể kiểm tra lại và bấm Nộp bài khi sẵn sàng.</div>' +
      '<div class="workspace has-pad exam-ws">' +
        '<div><div id="qs"></div><div id="res"></div></div>' +
        '<div class="pad-col" id="padw"></div>' +
      '</div>';

    app.innerHTML = h;

    var clockEl = document.getElementById('ex-clock');
    var progEl = document.getElementById('ex-prog');
    var timeMsgEl = document.getElementById('ex-time-msg');
    var qsEl = document.getElementById('qs');
    var resEl = document.getElementById('res');
    var qNodes = [];

    document.getElementById('ex-top-pdf').onclick = function(){
      window.KHTNPrint.open(attemptSpec, 'quiz', {
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
      this.textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
    };
    document.getElementById('ex-hide-t').onclick = function(){
      timerHidden = !timerHidden;
      clockEl.hidden = timerHidden;
      this.textContent = timerHidden ? 'Hiện đồng hồ' : 'Ẩn đồng hồ';
    };
    document.getElementById('ex-new').onclick = function(){ startExam(); };
    document.getElementById('ex-cfg').onclick = function(){ renderSetup(); };

    function updateAnsweredCount(){
      if (isDeferred) {
        var c = qNodes.filter(function(n){ return n._isAnswered(); }).length;
        if (progEl) progEl.textContent = 'Đã trả lời: ' + c + '/' + picks.length;
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

      var weakList = Object.keys(weakMap).map(function(k){ return weakMap[k]; });
      resEl.className = 'card highlight';
      resEl.style.marginTop = '14px';
      resEl.innerHTML =
        '<div class="row between">' +
          '<div><div class="score-big">Điểm bài kiểm tra: ' + score10(ratio) + ' / 10</div>' +
          '<div>Mã đề: <b>' + esc(attemptSpec.code) + '</b> · Đúng <b>' + right + '/' + picks.length + '</b> câu · ' +
          (ex.col ? 'Đã lưu điểm vào bảng lộ trình kiểm tra!' : 'Thời gian: ' + spentTxt) + '</div></div>' +
          '<span class="badge ' + (ratio >= 0.8 ? 'ok' : (ratio >= 0.65 ? 'pri' : 'warn')) + '">' +
            (ratio >= 0.8 ? 'Tốt (Giỏi)' : (ratio >= 0.65 ? 'Khá' : (ratio >= 0.5 ? 'Đạt' : 'Chưa đạt'))) +
          '</span>' +
        '</div>' +
        '<div class="diff-grid">' +
          [1,2,3,4].filter(function(lv){ return byDiff[lv].tot > 0; }).map(function(lv){
            return '<div class="diff-stat"><span class="badge d' + lv + '">' + DIFF_SHORT[lv] + '</span>' +
              '<div style="font-weight:700;font-size:1.1rem;margin-top:4px">' + byDiff[lv].ok + ' / ' + byDiff[lv].tot + ' câu</div></div>';
          }).join('') +
        '</div>' +
        (weakList.length
          ? '<b>Các bài trong giai đoạn này cần xem lại:</b><ul class="tight">' + weakList.map(function(t){
              return '<li><a href="#/bai/' + t.id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ')</li>';
            }).join('') + '</ul>'
          : '<p class="done">Tuyệt vời! Bạn nắm chắc toàn bộ kiến thức của bài kiểm tra này.</p>') +
        '<div class="row" style="margin-top:12px">' +
          '<button type="button" class="btn" id="ex-retry">Random mã đề mới (cùng phạm vi)</button>' +
          '<button type="button" class="btn alt" id="ex-pdf-q">Phần 1: Đề (Không đáp án)</button>' +
          '<button type="button" class="btn subtle" id="ex-pdf-k">Phần 2: Đáp án riêng</button>' +
          '<a class="btn subtle" href="#/de-kiem-tra/' + ex.grade + '">Xem Sổ điểm & Lộ trình</a>' +
        '</div>';

      document.getElementById('ex-retry').onclick = function(){ startExam(); };
      document.getElementById('ex-pdf-q').onclick = function(){ window.KHTNPrint.open(attemptSpec, 'quiz'); };
      document.getElementById('ex-pdf-k').onclick = function(){ window.KHTNPrint.open(attemptSpec, 'key'); };
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
          if (progEl) progEl.textContent = 'Đã trả lời: ' + instantAnswered + '/' + picks.length;
          if (instantAnswered === picks.length) {
            finishExam(instantResults);
          }
        }
      });
      qNodes.push(node);
      qsEl.appendChild(node);
    });

    if (isDeferred) {
      document.getElementById('ex-submit').onclick = function(){
        var unanswered = qNodes.filter(function(n){ return !n._isAnswered(); }).length;
        if (unanswered > 0 && !confirm('Còn ' + unanswered + ' câu chưa trả lời (tính 0 điểm). Bạn có chắc muốn nộp bài không?')) {
          return;
        }
        var results = qNodes.map(function(n){ return n._grade(); });
        finishExam(results);
      };
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
  var cfg = { grade:'8', stageCap:'all', subj:'all', diff:'all', qtype:'all', count:10, keyword:'' };
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

// --- VIEW 6: Custom Practice Builder (Now with Strict Stage / Semester Cap!) ---
function practice(presetMode){
  updateNavActive('luyen-tap');
  var mistakesMap = loadMistakes();
  var mistakeEntries = Object.keys(mistakesMap).map(function(k){ return mistakesMap[k]; }).filter(function(e){
    return byId[e.topicId] && getMistakeQuestion(e);
  });

  var state = {
    grade: '8',
    stageCap: '1', // default to Stage 1 so students don't get future semester questions unless chosen!
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
    if (state.stageCap === '2') return t.stage <= 2; // Trọn HK1
    if (state.stageCap === '3only') return t.stage === 3; // Nửa đầu HK2
    if (state.stageCap === 'hk2') return t.term === 'HK2'; // Trọn HK2
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
      '<div class="crumb"><a href="#/">Trang chủ</a> › Chọn bài luyện khóa theo giai đoạn</div>' +
      '<h1>Tạo bộ đề luyện Random (Khóa chặt theo bài / học kì đã học)</h1>' +
      '<p class="muted">Chọn <b>đúng 1 bài vừa học</b> hoặc <b>giai đoạn hiện tại ở trường</b> để hệ thống chỉ random câu hỏi trong phạm vi đó — tuyệt đối không chèn kiến thức học kì sau.</p>' +
      '<section class="card" style="margin-bottom:14px">' +
        '<label for="quick-cmd" style="display:block;font-weight:700;margin-bottom:6px">Yêu cầu nhanh</label>' +
        '<div class="row">' +
          '<input type="text" id="quick-cmd" style="flex:1;min-width:220px" placeholder="Ví dụ: 10 câu mol lớp 8, 10 câu hóa lớp 7 giữa kì 1, 10 câu tốc độ lớp 7…">' +
          '<button type="button" class="btn" id="apply-cmd">Áp dụng</button>' +
        '</div>' +
        '<div class="row" style="margin-top:8px">' +
          '<span class="muted" style="font-size:.86rem">Ví dụ khóa đúng bài:</span>' +
          '<button type="button" class="chip" data-ex="10 câu mol lớp 8">10 câu riêng bài Mol 8</button>' +
          '<button type="button" class="chip" data-ex="10 câu hóa lớp 7 giữa kì 1">10 câu Hóa 7 trước GK1</button>' +
          '<button type="button" class="chip" data-ex="10 câu tốc độ lớp 7">10 câu riêng Tốc độ 7</button>' +
          '<button type="button" class="chip" data-ex="10 câu áp suất lớp 8">10 câu riêng Áp suất 8</button>' +
        '</div>' +
      '</section>' +
      '<section class="card">' +
        '<div class="form-grid">' +
          '<div class="field"><label for="p-grade">Lớp</label><select id="p-grade">' +
            '<option value="7">Lớp 7</option><option value="8">Lớp 8</option><option value="6">Lớp 6</option><option value="9">Lớp 9</option><option value="all">Tất cả (6–9)</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-stage">Giai đoạn đã học trên lớp</label><select id="p-stage">' +
            '<option value="1">GĐ1: Nửa đầu HK1 (Trước Giữa kì I)</option>' +
            '<option value="2">Trọn Học kì I (Không chèn HK2)</option>' +
            '<option value="3only">GĐ3: Nửa đầu HK2 (Trước Giữa kì II)</option>' +
            '<option value="hk2">Trọn Học kì II</option>' +
            '<option value="all">Toàn bộ cả năm</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-topic">Hoặc khóa cứng 1 bài cụ thể</label><select id="p-topic"></select></div>' +
          '<div class="field"><label for="p-subj">Môn / Mạch</label><select id="p-subj">' +
            '<option value="all">Tất cả môn</option><option value="hoa">Hóa học (Chất)</option><option value="ly">Vật lí (Năng lượng)</option><option value="sinh">Sinh học (Vật sống)</option><option value="td">Mở đầu / Trái Đất</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-diff">Mức độ</label><select id="p-diff">' +
            '<option value="all">Đủ từ Dễ → Khó (Mức 1–4)</option>' +
            '<option value="1">Mức 1: Nhận biết (Dễ)</option>' +
            '<option value="2">Mức 2: Thông hiểu (TB)</option>' +
            '<option value="12">Củng cố gốc (Mức 1 + Mức 2)</option>' +
            '<option value="3">Mức 3: Vận dụng (Khá)</option>' +
            '<option value="4">Mức 4: Vận dụng cao (Khó)</option>' +
            '<option value="34">Nâng cao (Mức 3 + Mức 4)</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-count">Số câu</label><select id="p-count">' +
            '<option value="6">6 câu</option><option value="10">10 câu (Chuẩn 15p)</option><option value="15">15 câu</option><option value="20">20 câu (Chuẩn GK)</option><option value="24">24 câu (Chuẩn CK)</option>' +
          '</select></div>' +
        '</div>' +
        '<div class="row" style="margin:8px 0 14px">' +
          '<label class="row" style="cursor:pointer"><input type="checkbox" id="p-order"> Sắp xếp câu hỏi tăng dần từ Dễ đến Khó</label>' +
          (mistakeEntries.length ? '<label class="row" style="cursor:pointer"><input type="checkbox" id="p-only-err"> Chỉ luyện các câu từng làm sai (' + mistakeEntries.length + ')</label>' : '') +
        '</div>' +
        '<div id="p-summary" class="card soft" style="margin-bottom:14px"></div>' +
        '<div class="row">' +
          '<button type="button" class="btn" id="p-start">Bắt đầu luyện (Random mới)</button>' +
          '<button type="button" class="btn alt" id="p-print">Tải / In Phần 1: Đề (Không đáp án)</button>' +
          '<button type="button" class="btn subtle" id="p-print-key">Tải / In Phần 2: Đáp án riêng</button>' +
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
    var btnPrintKey = document.getElementById('p-print-key');
    var cachedBuilderSpec = null;

    function rebuildTopicDropdown(){
      var gTopics = D.filter(function(t){
        return (state.grade === 'all' || String(t.grade) === String(state.grade)) && allowedByStageCap(t);
      }).sort(function(a,b){ return a.grade - b.grade || (a.order||99) - (b.order||99); });

      var optsHtml = '<option value="all">-- Tất cả bài trong giai đoạn đã chọn (' + gTopics.length + ' bài) --</option>';
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
        elSummary.innerHTML = '<b>Không có câu hỏi khớp bộ lọc này.</b> Hãy chọn "Toàn bộ cả năm" hoặc đổi môn học.';
        btnStart.disabled = true;
        btnPrint.disabled = true;
        btnPrintKey.disabled = true;
      } else {
        var scopeNote = state.topicId !== 'all' && byId[state.topicId]
          ? ('Khóa cứng duy nhất: <b>' + esc(byId[state.topicId].title) + '</b>')
          : ('Khóa trong giai đoạn đã chọn · Ngân hàng khớp: <b>' + pool.length + '+ câu</b>');
        elSummary.innerHTML = scopeNote + ' · Sẽ random ra <b>' + take + ' câu</b>' +
          (state.sortEasyToHard ? ' (từ Dễ → Khó)' : '') + '.';
        btnStart.disabled = false;
        btnPrint.disabled = false;
        btnPrintKey.disabled = false;
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
        docTitle: singleT ? ('ĐỀ KIỂM TRA 15 PHÚT – ' + singleT.title.toUpperCase()) : 'ĐỀ BÀI TẬP THEO GIAI ĐOẠN KHTN',
        subtitle: singleT ? ('Lớp ' + singleT.grade + ' · Chỉ xoay quanh ' + singleT.title) : ('Lớp ' + state.grade + ' · Khóa chặt theo giai đoạn đã học'),
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

      // If prompt names a specific single lesson (e.g. "mol", "tốc độ", "áp suất", "hóa trị"), lock strictly to that 1 lesson!
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
      runPracticeSession(pickItems(), singleT ? ('Luyện chuyên biệt: ' + singleT.title) : null);
    };
    btnPrint.onclick = function(){
      window.KHTNPrint.open(cachedBuilderSpec || makeFreshBuilderSpec(), 'quiz', { onRegenerate: makeFreshBuilderSpec });
    };
    btnPrintKey.onclick = function(){
      window.KHTNPrint.open(cachedBuilderSpec || makeFreshBuilderSpec(), 'key', { onRegenerate: makeFreshBuilderSpec });
    };

    syncInputs();
    if (presetMode === 'cau-sai' && mistakeEntries.length > 0) {
      runPracticeSession(pickItems(), 'Luyện củng cố các câu từng làm sai');
    }
  }

  function runPracticeSession(picks, customTitle){
    if (!picks.length) { renderBuilder(); return; }
    var title = customTitle || ('Lượt luyện tập (' + picks.length + ' câu · Dễ → Khó)');
    var sheetSpec = window.KHTNPrint.prepare({
      prefix: 'LT',
      docTitle: 'ĐỀ LUYỆN TẬP KHTN',
      subtitle: title,
      items: picks.map(function(x){ return { topicTitle: x.t.title.replace(/^Bài \d+:\s*/, ''), q: x.q }; })
    });

    var h =
      '<div class="crumb"><a href="#/">Trang chủ</a> › <a href="#/luyen-tap" id="back-builder">Chọn bài luyện</a> › Đang làm bài</div>' +
      '<div class="row between">' +
        '<div><h1 style="margin-bottom:.15em">' + esc(title) + '</h1><div class="muted">Mã đề: <b>' + esc(sheetSpec.code) + '</b></div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="run-pdf">Tải / In 2 phần (' + esc(sheetSpec.code) + ')</button>' +
          '<button type="button" class="btn sm subtle" id="chg-cfg">Đổi cấu hình / Random mới</button>' +
        '</div>' +
      '</div>' +
      '<div class="workspace has-pad">' +
        '<div><div id="qs"></div><div id="res"></div></div>' +
        '<div class="pad-col" id="padw"></div>' +
      '</div>';

    app.innerHTML = h;
    document.getElementById('chg-cfg').onclick = renderBuilder;
    document.getElementById('back-builder').onclick = function(e){ e.preventDefault(); renderBuilder(); };
    document.getElementById('run-pdf').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'quiz'); };

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
              '<div class="score-big">Điểm lượt: ' + score10(ratio) + ' / 10</div>' +
              '<p>Mã đề: <b>' + esc(sheetSpec.code) + '</b> · Đúng <b>' + right + '/' + picks.length + '</b> câu (' + Math.round(ratio * 100) + '%).</p>' +
              (weakList.length
                ? '<b>Các bài nên ôn củng cố lại:</b><ul class="tight">' + weakList.map(function(t){
                    return '<li><a href="#/bai/' + t.id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ')</li>';
                  }).join('') + '</ul>'
                : '<p class="done">Xuất sắc! Bạn trả lời đúng toàn bộ lượt luyện này.</p>') +
              '<div class="row" style="margin-top:12px">' +
                '<button type="button" class="btn" id="re-cfg">Random lượt luyện mới</button>' +
                '<button type="button" class="btn alt" id="s-pdf-q">Phần 1: Đề (Không đáp án)</button>' +
                '<button type="button" class="btn subtle" id="s-pdf-k">Phần 2: Đáp án riêng</button>' +
              '</div>';

            document.getElementById('re-cfg').onclick = renderBuilder;
            document.getElementById('s-pdf-q').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'quiz'); };
            document.getElementById('s-pdf-k').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'key'); };
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
  if ([6,7,8,9].indexOf(g) === -1) g = 8;
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
    docTitle: 'ĐỀ KIỂM TRA KIẾN THỨC NỀN LỚP ' + g,
    subtitle: 'Đánh giá kiến thức nền trước khi học KHTN Lớp ' + g,
    items: picks.map(function(x){ return { topicTitle: x.t.title.replace(/^Bài \d+:\s*/, ''), q: x.q }; })
  });

  var h =
    '<div class="crumb"><a href="#/">Trang chủ</a> › Kiểm tra nền lớp ' + g + '</div>' +
    '<div class="row between">' +
      '<h1>Kiểm tra kiến thức nền trước khi học lớp ' + g + '</h1>' +
      '<div class="row">' +
        [7,8,6,9].map(function(gr){
          return '<a class="btn sm ' + (gr === g ? 'on' : 'subtle') + '" href="#/kiem-tra/' + gr + '">Lớp ' + gr + '</a>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div class="row between" style="margin-bottom:8px">' +
      '<span class="muted">Mã đề: <b>' + esc(sheetSpec.code) + '</b> · ' + picks.length + ' câu cốt lõi từ lớp trước.</span>' +
      '<div class="row">' +
        '<button type="button" class="btn sm alt" id="pl-top-pdf">Tải / In 2 phần (Đề + Đáp án)</button>' +
        '<button type="button" class="btn sm subtle" id="pl-reroll">Random đề nền khác</button>' +
      '</div>' +
    '</div>' +
    '<div class="workspace has-pad">' +
      '<div><div id="qs"></div><div id="res"></div></div>' +
      '<div class="pad-col" id="padw"></div>' +
    '</div>';

  app.innerHTML = h;
  document.getElementById('pl-top-pdf').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'quiz'); };
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
            '<div class="score-big">Điểm kiểm tra nền: ' + score10(ratio) + ' / 10</div>' +
            '<p>Đúng <b>' + right + '/' + picks.length + '</b> câu.</p>' +
            (weak.length
              ? '<b>Kiến thức gốc cần củng cố lại ngay:</b><ul class="tight">' +
                weak.map(function(t){
                  return '<li><a href="#/bai/' + t.id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ' · ' + SUBJ[t.subj] + ')</li>';
                }).join('') + '</ul>'
              : '<p class="done">Tuyệt vời! Bạn đã nắm vững toàn bộ nền tảng cho lớp ' + g + '.</p>') +
            '<div class="row" style="margin-top:12px">' +
              '<button type="button" class="btn" id="re">Random đề khác</button>' +
              '<button type="button" class="btn alt" id="pl-pdf">Phần 1: Đề (Không đáp án)</button>' +
              '<button type="button" class="btn subtle" id="pl-key">Phần 2: Đáp án riêng</button>' +
            '</div>';

          document.getElementById('re').onclick = function(){ placement(g); };
          document.getElementById('pl-pdf').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'quiz'); };
          document.getElementById('pl-key').onclick = function(){ window.KHTNPrint.open(sheetSpec, 'key'); };
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
      '<div class="crumb"><a href="#/">Trang chủ</a> › Sổ tay</div>' +
      '<div class="row between">' +
        '<h1>Sổ tay công thức & Câu hay sai</h1>' +
        '<button type="button" class="btn sm alt" id="nb-print-btn">' +
          (tab === 'formulas' ? 'In / Lưu PDF sổ tay đang lọc' : 'Tải / In 2 phần phiếu câu hay sai') +
        '</button>' +
      '</div>' +
      '<div class="tabs">' +
        '<button type="button" data-tab="formulas" class="' + (tab === 'formulas' ? 'on' : '') + '">Công thức & quy tắc chuẩn</button>' +
        '<button type="button" data-tab="mistakes" class="' + (tab === 'mistakes' ? 'on' : '') + '">Câu hay sai cần củng cố (' + mList.length + ')</button>' +
      '</div>';

    if (tab === 'formulas') {
      h +=
        '<input type="search" id="nb-search" placeholder="Tìm công thức, đơn vị, tên bài (không cần gõ dấu, VD: mol, ap suat, hoa tri)…" value="' + esc(query) + '">' +
        '<div class="filters" id="nb-g">' +
          ['all','7','8','6','9'].map(function(g){
            return '<button type="button" data-g="' + g + '" class="' + (gradeFilter === g ? 'on' : '') + '">' + (g === 'all' ? 'Mọi lớp' : 'Lớp ' + g) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="filters" id="nb-s">' +
          ['all'].concat(Object.keys(SUBJ)).map(function(s){
            return '<button type="button" data-s="' + s + '" class="' + (subjFilter === s ? 'on' : '') + '">' + (s === 'all' ? 'Mọi môn' : SUBJ[s]) + '</button>';
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
        var groups = [];
        D.slice().sort(function(a,b){ return a.grade - b.grade || (a.order||99) - (b.order||99); }).forEach(function(t){
          if (gradeFilter !== 'all' && String(t.grade) !== gradeFilter) return;
          if (subjFilter !== 'all' && t.subj !== subjFilter) return;
          var hit = t.formulas.filter(function(f){
            return !q || normVi(f + ' ' + t.title).indexOf(q) > -1;
          });
          if (hit.length) groups.push({ topic: t, grade: t.grade, title: t.title, formulas: hit });
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
                '<a href="#/bai/' + t.id + '" style="font-size:.88rem">Học bài →</a>' +
              '</div>' +
              g.formulas.map(function(f){ return '<div class="formula">' + fmtFormula(f) + '</div>'; }).join('') +
            '</div>';
        });
        document.getElementById('nb-list').innerHTML = out || '<div class="empty">Không có công thức nào khớp với tìm kiếm.</div>';
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
          docTitle: 'ĐỀ ÔN CỦNG CỐ CÁC CÂU HAY SAI',
          subtitle: 'Danh sách câu cần làm lại cho chắc gốc (' + mList.length + ' câu)',
          items: mList.map(function(m){
            var t = byId[m.topicId];
            return { topicTitle: 'Lớp ' + t.grade + ' · ' + t.title.replace(/^Bài \d+:\s*/, ''), q: getMistakeQuestion(m) };
          })
        });
        window.KHTNPrint.open(spec, 'quiz');
      };

      if (!mList.length) {
        box.innerHTML = '<div class="empty">Hiện chưa có câu làm sai nào được ghi nhận.</div>';
      } else {
        var out =
          '<div class="row between" style="margin-bottom:12px">' +
            '<span class="muted">Trả lời đúng lại câu hỏi sẽ tự động xóa khỏi danh sách này.</span>' +
            '<a class="btn sm" href="#/luyen-tap/cau-sai">Luyện lại ' + mList.length + ' câu này</a>' +
          '</div>';

        mList.forEach(function(m){
          var t = byId[m.topicId];
          var q = getMistakeQuestion(m);
          var ans = q.o ? q.o[0] : (fmtNum(q.n) + (q.u ? ' ' + q.u : ''));
          out +=
            '<div class="card" style="margin:10px 0">' +
              '<div class="row between">' +
                '<div>' + tag(t.subj) + ' ' + diffBadge(q) + ' <a href="#/bai/' + t.id + '"><b>Lớp ' + t.grade + ' – ' + esc(t.title) + '</b></a></div>' +
                '<span class="badge warn">Sai ' + (m.count || 1) + ' lần</span>' +
              '</div>' +
              '<p style="margin:.6em 0 .4em"><b>Đề:</b> ' + fmtMath(q.q) + '</p>' +
              '<div class="fb ok"><b>Đáp án đúng:</b> ' + fmtMath(ans) + (q.w ? '<br><b>Giải thích:</b> ' + fmtMath(q.w) : '') + '</div>' +
            '</div>';
        });
        box.innerHTML = out;
      }
    }
  }

  render();
}

// --- VIEW 9: Progress (Includes Circular 22 Gradebooks for Grade 7 & Grade 8) ---
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
    '<div class="crumb"><a href="#/">Trang chủ</a> › Sổ điểm & Tiến độ học tập</div>' +
    '<h1>Sổ điểm Thông tư 22 & Tiến độ học tập</h1>' +
    '<div class="grid stats" style="margin-bottom:16px">' +
      '<div class="card"><div class="muted">Bài đạt chuẩn</div><div class="stat-val">' + completed + ' / ' + D.length + '</div></div>' +
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
        '<div class="row between"><b>Kết quả Kiểm tra nền gần nhất (Lớp ' + lp.grade + ')</b><span class="badge pri">' + esc(lp.score10) + ' / 10 · ' + dt + '</span></div>' +
        '<p style="margin:.45em 0">Đúng ' + lp.right + '/' + lp.total + ' câu.</p>';
    if (lp.weakIds && lp.weakIds.length) {
      h += '<ul class="tight">' + lp.weakIds.map(function(id){
        var t = byId[id];
        if (!t) return '';
        var doneNow = isMastered(id);
        return '<li><a href="#/bai/' + id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ') ' +
          (doneNow ? '<span class="badge ok">Đã ôn đạt</span>' : '<span class="badge warn">Chưa ôn đạt</span>') + '</li>';
      }).join('') + '</ul>';
    } else {
      h += '<div class="done">Không có lỗ hổng nền tảng trong lần kiểm tra này.</div>';
    }
    h += '</section>';
  }

  h += '<div class="grid two">';
  h += '<section class="card"><h2 style="margin-top:0">Tiến độ bài học theo lớp</h2>';
  [7,8,6,9].forEach(function(g){
    var l = D.filter(function(t){ return t.grade === g; });
    var p = pct(l);
    h +=
      '<div style="margin:10px 0">' +
        '<div class="row between"><a href="#/lop/' + g + '"><b>Lớp ' + g + ((g===7||g===8)?' (Trọng tâm)':'') + '</b></a><span>' + p + '% (' + l.filter(function(t){ return isMastered(t.id); }).length + '/' + l.length + ')</span></div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
      '</div>';
  });
  h += '</section>';

  h += '<section class="card"><h2 style="margin-top:0">Mức nắm vững theo môn</h2>';
  Object.keys(SUBJ).forEach(function(s){
    var l = D.filter(function(t){ return t.subj === s; });
    var p = pct(l);
    h +=
      '<div style="margin:10px 0">' +
        '<div class="row between"><div>' + tag(s) + '</div><span>' + p + '% (' + l.filter(function(t){ return isMastered(t.id); }).length + '/' + l.length + ')</span></div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
      '</div>';
  });
  h += '</section></div>';

  h +=
    '<h2>Quản lý dữ liệu trên thiết bị</h2>' +
    '<div class="card">' +
      '<p class="muted" style="margin-top:0">Sao lưu sổ điểm & tiến độ sang thiết bị khác hoặc xóa dữ liệu trên máy này.</p>' +
      '<div class="row">' +
        '<button type="button" class="btn sm alt" id="btn-export">Sao lưu tiến độ (JSON)</button>' +
        '<button type="button" class="btn sm subtle" id="btn-import">Khôi phục từ tệp</button>' +
        '<input type="file" id="file-import" accept="application/json" hidden>' +
        '<button type="button" class="btn sm danger" id="rs">Xóa toàn bộ tiến độ</button>' +
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
    a.download = 'khtn-tien-do-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
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
        alert('Đã khôi phục tiến độ học tập thành công.');
        progress();
      } catch (e) {
        alert('Tệp sao lưu không hợp lệ.');
      }
    };
    reader.readAsText(f);
  };

  document.getElementById('rs').onclick = function(){
    if (confirm('Xóa toàn bộ tiến độ, lịch sử đề kiểm tra và câu sai trên thiết bị này?')) {
      saveProg({});
      saveExams({});
      saveDrafts({});
      saveMistakes({});
      saveMeta({});
      try { localStorage.removeItem('khtn-snapshots-v1'); } catch (e) {}
      progress();
    }
  };
}

// --- Router ---
function route(){
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  var m = location.hash.replace(/^#\/?/, '').split('/');
  if (m[0] === 'lop') grade(parseInt(m[1], 10), m[2]);
  else if (m[0] === 'bai') lesson(m[1]);
  else if (m[0] === 'de-kiem-tra') examCatalog(parseInt(m[1], 10), m[2]);
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
