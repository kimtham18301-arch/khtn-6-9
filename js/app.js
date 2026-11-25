(function(){
'use strict';

var D = window.KHTN || [];
var EXAMS = window.KHTN_EXAMS || [];
var BANK = window.KHTNBank;
var app = document.getElementById('app');
var SUBJ = { hoa:'Hóa học', ly:'Vật lí', sinh:'Sinh học', td:'Trái Đất & chung' };
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
var quickExamSpecs = {}; // cache per examId so quick print Phần 1 & Phần 2 on card share exact Mã đề

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
    if (btn) btn.textContent = t === 'dark' ? 'Giao diện sáng' : 'Giao diện tối';
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

// Mistake tracking works for BOTH static and dynamically generated questions!
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
      // trim oldest
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
      '<div class="q-text"><b>Câu ' + (displayIdx + 1) + '.</b> ' + esc(q.q) + '</div>' +
    '</div>';

  if (choices) {
    var letters = ['A', 'B', 'C', 'D'];
    choices.forEach(function(o, oi){
      h += '<button type="button" class="opt" data-val="' + esc(o) + '"><b>' + (letters[oi] || '') + '.</b> ' + esc(o) + '</button>';
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
         '<div class="q-hint" hidden><b>Gợi ý:</b> ' + esc(opts.hintText) + '</div>';
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
      if (q.o) ansLine = '<br>Đáp án đúng: <b>' + esc(q.o[0]) + '</b>';
      else if (q.n != null) ansLine = '<br>Đáp án đúng: <b>' + fmtNum(q.n) + (q.u ? ' ' + esc(q.u) : '') + '</b>';
    }
    var headText = ok ? 'Chính xác.' : (skipped ? 'Chưa trả lời (0 điểm).' : 'Chưa đúng.');
    fb.innerHTML =
      '<div><b>' + headText + '</b> ' + ansLine + '</div>' +
      (q.w ? '<div style="margin-top:4px"><b>Giải thích:</b> ' + esc(q.w) + '</div>' : '');

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

// Helper: build fresh randomized printable worksheet & study handout for a lesson (immutable snapshot)
function createFreshLessonSnapshot(topic, diffFilter, currentQuestions){
  var items = [];
  if (currentQuestions && currentQuestions.length) {
    currentQuestions.forEach(function(item){
      if (diffFilter && diffFilter !== 'all' && String(item.d) !== String(diffFilter)) return;
      items.push({ topicTitle: '', q: item.q });
    });
  } else {
    var sampled = BANK ? BANK.sampleLessonSet(topic, 4).items : getTopicPool(topic, 3);
    sampled.forEach(function(item){
      if (diffFilter && diffFilter !== 'all' && String(item.d) !== String(diffFilter)) return;
      items.push({ topicTitle: '', q: item.q });
    });
  }

  var diffNote = diffFilter && diffFilter !== 'all' ? ' · ' + DIFF[Number(diffFilter)] : ' · Sắp xếp từ Dễ đến Khó';
  return window.KHTNPrint.prepare({
    prefix: 'L' + topic.grade,
    docTitle: 'ĐỀ BÀI TẬP KHTN LỚP ' + topic.grade,
    subtitle: topic.title + diffNote,
    lesson: (!diffFilter || diffFilter === 'all') ? topic : null,
    items: items
  });
}

// Helper: select fresh randomized questions for an exam using expanded + parametric bank
function buildExamItems(exam, levelMode){
  var all = [];
  var seenQ = {};
  (exam.topics || []).forEach(function(tid){
    var t = byId[tid];
    if (!t) return;
    getTopicPool(t, 6).forEach(function(item){
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
    subtitle: 'KHTN Lớp ' + ex.grade + ' · ' + ex.term + ' · ' + mTxt + ' · Phạm vi: ' + ex.scope,
    minutes: ex.minutes,
    items: picks.map(function(p){ return { topicTitle: p.t.title.replace(/^Bài \d+:\s*/, ''), q: p.q }; })
  });
  quickExamSpecs[ex.id + '::' + m] = snap;
  return snap;
}

function getOrCreateExamPrintSpec(ex, levelMode){
  var key = ex.id + '::' + (levelMode || ex.presetLevel || 'standard');
  if (!quickExamSpecs[key]) {
    return createFreshExamSnapshot(ex, levelMode);
  }
  return quickExamSpecs[key];
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
      '<h1>Hệ thống Tự học & Ngân hàng Đề Random KHTN (Trọng tâm Lớp 7 – 8)</h1>' +
      '<p>Đầy đủ kiến thức Bộ GD&ĐT (GDPT 2018), củng cố từ <b>Dễ → Khó</b>. <b>Mỗi lần bấm vào bài học hoặc đề kiểm tra đều sinh bộ câu hỏi random mới</b>; khi tải về tự động tách độc lập <b>Phần 1: Đề (Không đáp án)</b> và <b>Phần 2: Đáp án riêng</b> theo Mã đề.</p>' +
      '<div class="row">' +
        '<a class="btn" href="#/lop/7">Vào học Lớp 7 (12 bài · 18 đề)</a>' +
        '<a class="btn" href="#/lop/8">Vào học Lớp 8 (16 bài · 19 đề)</a>' +
        '<a class="btn ghost" href="#/de-kiem-tra/7">Kho Đề 15p · Giữa kì · Cuối kì</a>' +
      '</div>' +
    '</section>';

  var l7 = D.filter(function(t){ return t.grade === 7; });
  var l8 = D.filter(function(t){ return t.grade === 8; });
  var ex7 = EXAMS.filter(function(e){ return e.grade === 7; });
  var ex8 = EXAMS.filter(function(e){ return e.grade === 8; });
  var estQ7 = BANK ? BANK.estimateTotalQuestions(l7) : l7.reduce(function(s,t){ return s+t.questions.length; },0);
  var estQ8 = BANK ? BANK.estimateTotalQuestions(l8) : l8.reduce(function(s,t){ return s+t.questions.length; },0);

  h += '<h2>Trọng tâm củng cố Lớp 7 & Lớp 8 (Chuẩn Bộ GD&ĐT)</h2><div class="grid two" style="margin-bottom:18px">';
  [
    { g:7, list:l7, qTotal:estQ7, exs:ex7, desc:'Đủ 4 mạch Mở đầu – Hóa (Nguyên tử → Hóa trị) – Lý (Tốc độ, Âm, Quang, Từ) – Sinh (Quang hợp, Hô hấp, Vận chuyển, Cảm ứng, Sinh sản).' },
    { g:8, list:l8, qTotal:estQ8, exs:ex8, desc:'Đủ Hóa 8 (Phản ứng, Mol, Dung dịch, PTHH, Acid–Base–Muối) – Lý 8 (Áp suất, Archimedes, Đòn bẩy, Điện, Nhiệt) – Sinh học người & Hệ sinh thái.' }
  ].forEach(function(item){
    var p = pct(item.list);
    h +=
      '<div class="card highlight">' +
        '<div class="row between"><h2 style="margin:0">KHTN Lớp ' + item.g + '</h2><span class="badge pri">Random mỗi lần mở · Tải 2 phần</span></div>' +
        '<p class="muted" style="font-size:.92rem;margin:.45em 0">' + esc(item.desc) + '</p>' +
        '<div class="muted" style="font-size:.9rem"><b>' + item.list.length + ' bài</b> · <b>' + item.qTotal + '+ câu & biến thể động</b> · <b>' + item.exs.length + ' bộ đề KT</b></div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
        '<div class="row" style="margin-top:10px">' +
          '<a class="btn sm" href="#/lop/' + item.g + '">Học từ dễ đến khó</a>' +
          '<a class="btn sm alt" href="#/de-kiem-tra/' + item.g + '">Đề 15p · Giữa kì · Cuối kì</a>' +
          '<a class="btn sm subtle" href="#/kiem-tra/' + item.g + '">Kiểm tra nền</a>' +
        '</div>' +
      '</div>';
  });
  h += '</div>';

  h += '<div class="grid two" style="margin-bottom:18px">';
  if (resumeTopic) {
    var resumeLabel = resume.kind === 'recent' ? 'Bài học gần nhất' : 'Gợi ý bắt đầu';
    h +=
      '<a class="card" href="#/bai/' + resumeTopic.id + '">' +
        '<div class="row between"><span class="badge pri">' + resumeLabel + '</span>' + tag(resumeTopic.subj) + '</div>' +
        '<h3 style="margin:.45em 0 .2em;font-size:1.12rem">Học tiếp: ' + esc(resumeTopic.title) + '</h3>' +
        '<div class="muted">Lớp ' + resumeTopic.grade + ' · Tự động sinh bộ câu hỏi ngẫu nhiên mới khi bấm vào</div>' +
      '</a>';
  }
  h +=
    '<div class="card">' +
      '<div class="row between"><span class="badge">Tổng quan tiến độ</span><a href="#/tien-do" style="font-size:.9rem;font-weight:600">Xem chi tiết</a></div>' +
      '<div class="row" style="gap:18px;margin-top:10px">' +
        '<div><div class="stat-val">' + completed + '/' + D.length + '</div><div class="muted" style="font-size:.84rem">Bài đạt chuẩn</div></div>' +
        '<div><div class="stat-val">' + avgScore + '</div><div class="muted" style="font-size:.84rem">Điểm TB (/10)</div></div>' +
        '<div><div class="stat-val">' + examsDone + '</div><div class="muted" style="font-size:.84rem">Đề KT đã làm</div></div>' +
        '<div><div class="stat-val">' + mistakeCount + '</div><div class="muted" style="font-size:.84rem">Câu cần ôn</div></div>' +
      '</div>' +
      (mistakeCount ? '<div style="margin-top:10px"><a class="btn sm alt" href="#/luyen-tap/cau-sai">Luyện lại ' + mistakeCount + ' câu hay sai</a></div>' : '') +
    '</div>';
  h += '</div>';

  h += '<h2>Toàn bộ các khối lớp THCS (6 – 9)</h2><div class="grid">';
  [6,7,8,9].forEach(function(g){
    var l = D.filter(function(t){ return t.grade === g; });
    var exCount = EXAMS.filter(function(ex){ return ex.grade === g; }).length;
    var p = pct(l);
    var totalQ = BANK ? BANK.estimateTotalQuestions(l) : l.reduce(function(s,t){ return s + t.questions.length; }, 0);
    h +=
      '<a class="card" href="#/lop/' + g + '">' +
        '<div class="row between"><h2 style="margin:0">Lớp ' + g + '</h2><span class="badge ' + ((g === 7 || g === 8) ? 'pri' : (p === 100 ? 'ok' : '')) + '">' + ((g === 7 || g === 8) ? 'Trọng tâm' : p + '%') + '</span></div>' +
        '<div class="muted" style="margin-top:4px">' + l.length + ' bài · ' + totalQ + '+ câu · ' + exCount + ' đề KT</div>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
        '<small class="muted">Hoàn thành ' + p + '% (' + l.filter(function(t){ return isMastered(t.id); }).length + '/' + l.length + ' bài)</small>' +
      '</a>';
  });
  h += '</div>';

  app.innerHTML = h;
}

// --- Categorized Exam List Renderer ---
var EXAM_CATEGORIES = [
  { key:'all',      label:'Tất cả loại đề' },
  { key:'15p-hk1',  label:'15 phút – Học kì I' },
  { key:'15p-hk2',  label:'15 phút – Học kì II' },
  { key:'45p',      label:'45 phút / Chuyên đề' },
  { key:'gk',       label:'Đề Giữa kì' },
  { key:'ck',       label:'Đề Cuối kì' },
  { key:'nc',       label:'Củng cố & Nâng cao' }
];

function matchExamCat(ex, catKey){
  if (!catKey || catKey === 'all') return true;
  if (catKey === '15p-hk1') return ex.kind === '15p' && ex.term === 'HK1';
  if (catKey === '15p-hk2') return ex.kind === '15p' && ex.term === 'HK2';
  return ex.kind === catKey;
}

function mountExamExplorer(containerEl, g, initialCat){
  var cat = initialCat || 'all';
  var examsAll = EXAMS.filter(function(ex){ return ex.grade === g; });
  var saved = loadExams();

  function render(){
    if (!examsAll.length) {
      containerEl.innerHTML = '<div class="empty">Chưa có đề kiểm tra cho lớp này.</div>';
      return;
    }
    var presentCats = EXAM_CATEGORIES.filter(function(c){
      return c.key === 'all' || examsAll.some(function(ex){ return matchExamCat(ex, c.key); });
    });

    var h = '<div class="filters" id="ex-cat-bar">' +
      presentCats.map(function(c){
        var cnt = examsAll.filter(function(ex){ return matchExamCat(ex, c.key); }).length;
        return '<button type="button" data-ec="' + c.key + '" class="' + (cat === c.key ? 'on' : '') + '">' + c.label + ' (' + cnt + ')</button>';
      }).join('') +
      '</div>';

    var sections = [
      { key:'15p-hk1', title:'1. Đề kiểm tra 15 phút – Học kì I (Đánh giá thường xuyên)' },
      { key:'15p-hk2', title:'2. Đề kiểm tra 15 phút – Học kì II (Đánh giá thường xuyên)' },
      { key:'45p',     title:'3. Đề kiểm tra 45 phút / Chuyên đề theo phân môn (Hóa · Lý · Sinh)' },
      { key:'gk',      title:'4. Đề kiểm tra Giữa học kì (Giữa kì I & Giữa kì II)' },
      { key:'ck',      title:'5. Đề kiểm tra Cuối học kì (Cuối kì I & Cuối kì II)' },
      { key:'nc',      title:'6. Đề Củng cố chắc gốc & Bồi dưỡng Vận dụng cao' }
    ];

    sections.forEach(function(sec){
      if (cat !== 'all' && cat !== sec.key) return;
      var group = examsAll.filter(function(ex){ return matchExamCat(ex, sec.key); });
      if (!group.length) return;

      h += '<h2 style="margin-top:1.1em">' + sec.title + '</h2><div class="grid two">';
      group.forEach(function(ex){
        var st = saved[ex.id];
        var badgeTxt = ex.kind === '15p'
          ? '15 phút · ' + ex.term
          : (ex.kind === '45p' ? 'Chuyên đề · ' + ex.minutes + ' phút'
            : (ex.kind === 'gk' ? 'Giữa kì · ' + ex.minutes + ' phút'
              : (ex.kind === 'ck' ? 'Cuối kì · ' + ex.minutes + ' phút' : 'Củng cố / Nâng cao · ' + ex.minutes + ' phút')));
        var badgeCls = ex.kind === '15p' ? 'pri' : (ex.kind === 'nc' ? 'ok' : 'warn');

        h +=
          '<div class="card">' +
            '<div class="row between">' +
              '<span class="badge ' + badgeCls + '">' + badgeTxt + '</span>' +
              '<span class="badge">' + ex.count + ' câu random</span>' +
            '</div>' +
            '<h3 style="margin:.5em 0 .2em;font-size:1.1rem">' + esc(ex.title) + '</h3>' +
            '<div class="muted" style="font-size:.91rem;margin-bottom:10px">Phạm vi: ' + esc(ex.scope) + '</div>' +
            (st ? '<div class="' + (st.best >= 0.67 ? 'done' : 'muted') + '" style="font-size:.89rem;margin-bottom:10px">Cao nhất: ' + score10(st.best) + '/10 · Gần nhất: ' + score10(st.last) + '/10 (' + st.attempts + ' lượt)</div>' : '') +
            '<div class="row">' +
              '<a class="btn sm" href="#/lam-de/' + ex.id + '">Làm đề (Random mới)</a>' +
              '<button type="button" class="btn sm alt" data-print-quiz="' + ex.id + '">Phần 1: Đề (Không đáp án)</button>' +
              '<button type="button" class="btn sm subtle" data-print-key="' + ex.id + '">Phần 2: Đáp án</button>' +
            '</div>' +
          '</div>';
      });
      h += '</div>';
    });

    containerEl.innerHTML = h;
    containerEl.querySelectorAll('#ex-cat-bar button').forEach(function(b){
      b.onclick = function(){ cat = b.dataset.ec; render(); };
    });
    containerEl.querySelectorAll('[data-print-quiz]').forEach(function(b){
      b.onclick = function(){
        var ex = examById[b.getAttribute('data-print-quiz')];
        if (!ex) return;
        window.KHTNPrint.open(getOrCreateExamPrintSpec(ex), 'quiz', {
          onRegenerate: function(){ return createFreshExamSnapshot(ex); }
        });
      };
    });
    containerEl.querySelectorAll('[data-print-key]').forEach(function(b){
      b.onclick = function(){
        var ex = examById[b.getAttribute('data-print-key')];
        if (!ex) return;
        window.KHTNPrint.open(getOrCreateExamPrintSpec(ex), 'key', {
          onRegenerate: function(){ return createFreshExamSnapshot(ex); }
        });
      };
    });
  }

  render();
}

// --- VIEW 2: Grade ---
function grade(g, activeTab){
  if ([6,7,8,9].indexOf(g) === -1) {
    updateNavActive('');
    app.innerHTML = '<div class="empty"><p>Không có dữ liệu cho lớp này.</p><a class="btn" href="#/">Về trang chủ</a></div>';
    return;
  }
  updateNavActive('lop-' + g);
  var tab = activeTab === 'exams' ? 'exams' : 'lessons';
  var filterTerm = 'all';
  var filterSubj = 'all';
  var filterStatus = 'all';
  var searchText = '';

  var list = D.filter(function(t){ return t.grade === g; }).slice().sort(function(a, b){
    return (a.order || 99) - (b.order || 99);
  });
  var examCount = EXAMS.filter(function(ex){ return ex.grade === g; }).length;
  var presentSubjs = Object.keys(SUBJ).filter(function(s){
    return list.some(function(t){ return t.subj === s; });
  });
  var hasTerms = list.some(function(t){ return !!t.term; });

  function renderView(){
    var h =
      '<div class="crumb"><a href="#/">Trang chủ</a> › Lớp ' + g + '</div>' +
      '<div class="row between">' +
        '<h1>Khoa học tự nhiên lớp ' + g + '</h1>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="g-print-formulas">In PDF Sổ tay công thức lớp ' + g + '</button>' +
          '<a class="btn sm subtle" href="#/kiem-tra/' + g + '">Kiểm tra nền</a>' +
        '</div>' +
      '</div>' +
      '<div class="bar"><i style="width:' + pct(list) + '%"></i></div>' +
      '<div class="muted" style="font-size:.9rem;margin-bottom:10px">Hoàn thành ' + pct(list) + '% (' +
        list.filter(function(t){ return isMastered(t.id); }).length + '/' + list.length + ' bài đạt từ 6,7/10) · Mỗi lần mở bài đều sinh câu hỏi random mới</div>' +
      '<div class="tabs">' +
        '<button type="button" data-gtab="lessons" class="' + (tab === 'lessons' ? 'on' : '') + '">Lộ trình từng bài từ Dễ → Khó (' + list.length + ')</button>' +
        '<button type="button" data-gtab="exams" class="' + (tab === 'exams' ? 'on' : '') + '">Đề kiểm tra 15p · 45p · Giữa kì · Cuối kì (' + examCount + ')</button>' +
      '</div>';

    if (tab === 'lessons') {
      h +=
        '<input type="search" id="g-search" placeholder="Tìm nhanh bài học hoặc công thức lớp ' + g + ' (không cần gõ dấu)…" value="' + esc(searchText) + '">' +
        (hasTerms ? '<div class="filters" id="g-term">' +
          '<button type="button" data-tm="all" class="' + (filterTerm === 'all' ? 'on' : '') + '">Cả năm (' + list.length + ')</button>' +
          '<button type="button" data-tm="HK1" class="' + (filterTerm === 'HK1' ? 'on' : '') + '">Học kì I (' + list.filter(function(t){ return t.term === 'HK1'; }).length + ')</button>' +
          '<button type="button" data-tm="HK2" class="' + (filterTerm === 'HK2' ? 'on' : '') + '">Học kì II (' + list.filter(function(t){ return t.term === 'HK2'; }).length + ')</button>' +
        '</div>' : '') +
        '<div class="filters" id="g-subj">' +
          '<button type="button" data-s="all" class="' + (filterSubj === 'all' ? 'on' : '') + '">Tất cả mạch (' + list.length + ')</button>' +
          presentSubjs.map(function(s){
            var cnt = list.filter(function(t){ return t.subj === s; }).length;
            return '<button type="button" data-s="' + s + '" class="' + (filterSubj === s ? 'on' : '') + '">' + SUBJ[s] + ' (' + cnt + ')</button>';
          }).join('') +
        '</div>' +
        '<div class="filters" id="g-stat">' +
          '<button type="button" data-st="all" class="' + (filterStatus === 'all' ? 'on' : '') + '">Mọi trạng thái</button>' +
          '<button type="button" data-st="todo" class="' + (filterStatus === 'todo' ? 'on' : '') + '">Chưa đạt</button>' +
          '<button type="button" data-st="done" class="' + (filterStatus === 'done' ? 'on' : '') + '">Đã nắm vững</button>' +
        '</div>' +
        '<div id="g-cards"></div>';
    } else {
      h += '<p class="muted">Mỗi lần bấm làm đề hoặc tạo mã đề đều sinh bộ câu hỏi khác nhau. Khi tải/in luôn tách riêng <b>Phần 1: Đề (Không đáp án)</b> và <b>Phần 2: Đáp án</b> khóa theo Mã đề riêng.</p>' +
        '<div id="g-exams-box"></div>';
    }

    app.innerHTML = h;

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

    if (tab === 'lessons') {
      renderCards();
      app.querySelectorAll('#g-term button').forEach(function(b){
        b.onclick = function(){
          filterTerm = b.dataset.tm;
          app.querySelectorAll('#g-term button').forEach(function(x){ x.classList.toggle('on', x === b); });
          renderCards();
        };
      });
      app.querySelectorAll('#g-subj button').forEach(function(b){
        b.onclick = function(){
          filterSubj = b.dataset.s;
          app.querySelectorAll('#g-subj button').forEach(function(x){ x.classList.toggle('on', x === b); });
          renderCards();
        };
      });
      app.querySelectorAll('#g-stat button').forEach(function(b){
        b.onclick = function(){
          filterStatus = b.dataset.st;
          app.querySelectorAll('#g-stat button').forEach(function(x){ x.classList.toggle('on', x === b); });
          renderCards();
        };
      });
      document.getElementById('g-search').oninput = function(e){
        searchText = e.target.value;
        renderCards();
      };
    } else {
      mountExamExplorer(document.getElementById('g-exams-box'), g, 'all');
    }
  }

  function renderCards(){
    var q = normVi(searchText);
    var filtered = list.filter(function(t){
      if (filterTerm !== 'all' && t.term !== filterTerm) return false;
      if (filterSubj !== 'all' && t.subj !== filterSubj) return false;
      if (filterStatus === 'todo' && isMastered(t.id)) return false;
      if (filterStatus === 'done' && !isMastered(t.id)) return false;
      if (q && normVi(t.title + ' ' + t.formulas.join(' ')).indexOf(q) === -1) return false;
      return true;
    });

    var container = document.getElementById('g-cards');
    if (!filtered.length) {
      container.innerHTML = '<div class="empty">Không có bài nào khớp với bộ lọc hiện tại.</div>';
      return;
    }
    var out = '<div class="grid">';
    filtered.forEach(function(t){
      var b = best(t.id);
      var poolCount = getTopicPool(t, 4).length;
      out +=
        '<a class="card" href="#/bai/' + t.id + '">' +
          '<div class="row between">' +
            '<div class="row" style="gap:5px">' + tag(t.subj) + (t.term ? '<span class="badge">' + t.term + '</span>' : '') + '</div>' +
            (b != null && b >= 0.67 ? '<span class="badge ok">Đạt</span>' : '<span class="badge pri">Random Dễ → Khó</span>') +
          '</div>' +
          '<h2 style="margin:.45em 0 .25em;font-size:1.06rem">' + esc(t.title) + '</h2>' +
          '<div class="muted" style="font-size:.88rem">Kho ' + poolCount + '+ câu & biến thể' + (t.examples ? ' · ' + t.examples.length + ' ví dụ' : '') + '</div>' +
          (b == null ? '' : '<div style="margin-top:6px;font-size:.9rem" class="' + (b >= 0.67 ? 'done' : 'muted') + '">Điểm tốt nhất: ' + score10(b) + '/10 (' + Math.round(b * 100) + '%)</div>') +
        '</a>';
    });
    out += '</div>';
    container.innerHTML = out;
  }

  renderView();
}

// --- VIEW 3: Lesson (Fresh Random Set Every Time Opened + Isolated 2-Part Download) ---
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

  // Scratchpad strokes can stay handy per lesson, while EVERY visit draws a FRESH random set of questions!
  var allDrafts = loadDrafts();
  var padDraft = allDrafts[id] || { strokes: [] };

  var sameGrade = D.filter(function(x){ return x.grade === t.grade; }).slice().sort(function(a,b){
    return (a.order || 99) - (b.order || 99);
  });
  var pos = sameGrade.findIndex(function(x){ return x.id === id; });
  var prevLesson = pos > 0 ? sameGrade[pos - 1] : null;
  var nextLesson = pos > -1 && pos < sameGrade.length - 1 ? sameGrade[pos + 1] : null;
  var relatedExams = EXAMS.filter(function(ex){ return ex.topics.indexOf(id) > -1; });

  // Draw a brand-new random workout for this visit!
  var sampled = BANK ? BANK.sampleLessonSet(t, 4) : { totalAvailable: t.questions.length, items: getTopicPool(t, 1) };
  var sessionItems = sampled.items; // array of { q, staticIdx, d }
  var totalBankCount = sampled.totalAvailable;
  var sessionAnswers = {};
  var sessionOrders = {};
  var lockedPrintSpec = null; // frozen snapshot for current sessionItems so Phần 1 & Phần 2 match 100%!

  var availDiffs = [1, 2, 3, 4].filter(function(lv){
    return sessionItems.some(function(it){ return it.d === lv; });
  });
  var selectedDiff = availDiffs.length >= 3 ? String(availDiffs[0]) : 'all';

  var h =
    '<div class="crumb"><a href="#/">Trang chủ</a> › <a href="#/lop/' + t.grade + '">Lớp ' + t.grade + '</a> › ' + esc(t.title) + '</div>' +
    '<div class="row between">' +
      '<div class="row">' +
        tag(t.subj) +
        '<span class="badge">Lớp ' + t.grade + (t.term ? ' · ' + t.term : '') + '</span>' +
        '<span class="badge pri" id="bank-info">Bộ ' + sessionItems.length + ' câu ngẫu nhiên (kho ' + totalBankCount + '+ câu)</span>' +
      '</div>' +
      '<div class="row">' +
        '<button type="button" class="btn sm alt" id="top-dl-2part">Tải / In 2 phần (Đề + Đáp án)</button>' +
      '</div>' +
    '</div>' +
    '<h1>' + esc(t.title) + '</h1>';

  if (t.prereq && t.prereq.length) {
    h += '<div class="card soft" style="margin-bottom:14px"><b>Kiến thức nền liên quan:</b> ' +
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
      '<ul class="tight">' + t.theory.map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<h2>2. Công thức & quy tắc cần thuộc</h2>' +
      t.formulas.map(function(f){ return '<div class="formula">' + esc(f) + '</div>'; }).join('');

  if (t.examples && t.examples.length) {
    h += '<h2>3. Ví dụ minh họa từ Cơ bản đến Vận dụng</h2>';
    t.examples.forEach(function(ex, ei){
      h +=
        '<div class="example-card">' +
          '<div><b>Ví dụ ' + (ei + 1) + '.</b> ' + esc(ex.q) + '</div>' +
          '<details' + (ei === 0 ? ' open' : '') + '>' +
            '<summary>Xem lời giải từng bước</summary>' +
            '<ol class="example-steps">' + ex.steps.map(function(st){ return '<li>' + esc(st) + '</li>'; }).join('') + '</ol>' +
            '<div><b>Đáp số:</b> ' + esc(ex.ans) + '</div>' +
          '</details>' +
        '</div>';
    });
  }
  h += '</section>';

  h +=
    '<div class="row between">' +
      '<h2 style="margin:.4em 0">4. Bài tập củng cố từ Dễ đến Khó (Random mới mỗi lần mở)</h2>' +
      '<button type="button" class="btn sm alt" id="btn-reroll">Đổi bộ câu hỏi khác (Random)</button>' +
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
        '<div><b>Tải về / In PDF tách riêng 2 phần độc lập (Khổ A4)</b><div class="muted" style="font-size:.9rem">Tách rõ <b>Phần 1: Đề bài (Không có đáp án)</b> và <b>Phần 2: Đáp án riêng</b> theo Mã đề cố định — khi bấm Random bộ đề mới sẽ không ảnh hưởng đến bộ đề đã tải.</div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm" id="pdf-quiz">Phần 1: Đề (Không đáp án)</button>' +
          '<button type="button" class="btn sm alt" id="pdf-key">Phần 2: Đáp án riêng</button>' +
          '<button type="button" class="btn sm subtle" id="pdf-study">Lý thuyết + Đề</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (relatedExams.length) {
    h += '<div class="card soft" style="margin-top:12px"><b>Đề kiểm tra 15p / Giữa kì / Cuối kì có bài này:</b><div class="row" style="margin-top:8px">' +
      relatedExams.slice(0, 6).map(function(ex){
        return '<a class="btn sm subtle" href="#/lam-de/' + ex.id + '">' + esc(ex.title) + '</a>';
      }).join('') + '</div></div>';
  }

  h +=
    '<div class="lesson-nav">' +
      (prevLesson ? '<a class="btn subtle" href="#/bai/' + prevLesson.id + '">← ' + esc(prevLesson.title) + '</a>' : '<span></span>') +
      (nextLesson ? '<a class="btn" href="#/bai/' + nextLesson.id + '">' + esc(nextLesson.title) + ' →</a>' : '<a class="btn" href="#/lop/' + t.grade + '/exams">Làm đề kiểm tra lớp ' + t.grade + ' →</a>') +
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
    lockedPrintSpec = null; // new set gets its own new Mã đề when printed, old snapshots stay untouched in history!
    availDiffs = [1, 2, 3, 4].filter(function(lv){
      return sessionItems.some(function(it){ return it.d === lv; });
    });
    if (selectedDiff !== 'all' && availDiffs.indexOf(Number(selectedDiff)) === -1) {
      selectedDiff = availDiffs.length ? String(availDiffs[0]) : 'all';
    }
    if (bankInfoEl) {
      bankInfoEl.textContent = 'Đã random bộ ' + sessionItems.length + ' câu mới (kho ' + totalBankCount + '+ câu)';
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

    resEl.className = 'card highlight';
    resEl.style.marginTop = '12px';
    resEl.innerHTML =
      '<div class="row between">' +
        '<div><div class="score-big">Điểm ' + esc(levelTitle) + ': ' + score10(ratio) + ' / 10</div>' +
        '<div>Đúng <b>' + right + '/' + idxs.length + '</b> câu (' + Math.round(ratio * 100) + '%)</div></div>' +
        '<span class="badge ' + (ratio >= 0.67 ? 'ok' : 'warn') + '">' + (ratio >= 0.67 ? 'Đã vững mức này' : 'Nên củng cố thêm') + '</span>' +
      '</div>' +
      '<p style="margin:.6em 0">' + (ratio >= 0.67
        ? (nextDiff ? 'Rất tốt! Bạn đã nắm chắc bậc này. Hãy bước tiếp lên <b>' + DIFF[Number(nextDiff)] + '</b> nhé.' : 'Xuất sắc! Bạn có thể bấm Random bộ câu mới để luyện thêm các biến thể khác.')
        : 'Hãy xem kĩ lời giải từng câu rồi bấm Random bộ câu mới ở mức này để luyện lại cho chắc gốc nhé!') + '</p>' +
      '<div class="row">' +
        (nextDiff ? '<button type="button" class="btn" id="next-diff">Tiến lên ' + DIFF[Number(nextDiff)] + ' →</button>' : '') +
        '<button type="button" class="btn ' + (nextDiff ? 'alt' : '') + '" id="again-rand">Random bộ câu mới</button>' +
        (nextLesson ? '<a class="btn subtle" href="#/bai/' + nextLesson.id + '">Sang bài tiếp theo</a>' : '') +
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

  // Locked snapshot for current lesson session + isolated regeneration
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
  if ([6,7,8,9].indexOf(g) === -1) g = 7;
  updateNavActive('de-kiem-tra');

  var h =
    '<div class="crumb"><a href="#/">Trang chủ</a> › Kho đề kiểm tra lớp ' + g + '</div>' +
    '<div class="row between">' +
      '<h1>Kho Đề Kiểm Tra Random – Lớp ' + g + '</h1>' +
      '<div class="row">' +
        [7,8,6,9].map(function(gr){
          var lbl = (gr === 7 || gr === 8) ? ('Lớp ' + gr + ' ★') : ('Lớp ' + gr);
          return '<a class="btn sm ' + (gr === g ? 'on' : 'subtle') + '" href="#/de-kiem-tra/' + gr + '">' + lbl + '</a>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<p class="muted">Mỗi lần bấm vào đề đều random bộ câu hỏi mới sắp từ dễ đến khó. Khi tải về chia rõ <b>Phần 1: Đề bài (Không có đáp án)</b> và <b>Phần 2: Đáp án riêng</b> khóa theo từng Mã đề độc lập.</p>' +
    '<div id="cat-exams-box"></div>';

  app.innerHTML = h;
  mountExamExplorer(document.getElementById('cat-exams-box'), g, initialCat || 'all');
}

// --- VIEW 5: Exam Runner (#/lam-de/:examId) ---
function examRunner(examId){
  var ex = examById[examId];
  if (!ex) {
    updateNavActive('de-kiem-tra');
    app.innerHTML = '<div class="empty"><p>Không tìm thấy đề kiểm tra.</p><a class="btn" href="#/de-kiem-tra/7">Xem danh sách đề</a></div>';
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

    var h =
      '<div class="crumb"><a href="#/">Trang chủ</a> › <a href="#/de-kiem-tra/' + ex.grade + '">Đề kiểm tra lớp ' + ex.grade + '</a> › ' + esc(ex.title) + '</div>' +
      '<div class="row" style="margin-bottom:6px">' +
        '<span class="badge pri">Lớp ' + ex.grade + ' · ' + esc(ex.term) + '</span>' +
        '<span class="badge">' + ex.minutes + ' phút</span>' +
        '<span class="badge">' + ex.count + ' câu random (Dễ → Khó)</span>' +
      '</div>' +
      '<h1>' + esc(ex.title) + '</h1>' +
      '<p class="muted"><b>Phạm vi kiến thức:</b> ' + esc(ex.scope) + '</p>' +
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
          '<b>Các bài học trong phạm vi đề:</b> ' +
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

    // Freeze this exact online attempt into its own immutable snapshot immediately!
    // Even if user later clicks "Random đề khác", this attempt's Phần 1 & Phần 2 remain 100% locked together!
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
        '<div class="muted">Mã đề hiện tại: <b>' + esc(attemptSpec.code) + '</b> · ' + esc(levelTxt) + ' · ' + picks.length + ' câu</div></div>' +
        '<div class="row">' +
          '<button type="button" class="btn sm alt" id="ex-top-pdf">Tải / In Đề & Đáp án (' + esc(attemptSpec.code) + ')</button>' +
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
          '<div>Mã đề: <b>' + esc(attemptSpec.code) + '</b> · Đúng <b>' + right + '/' + picks.length + '</b> câu (' + Math.round(ratio * 100) + '%) · Thời gian: ' + spentTxt + '</div></div>' +
          '<span class="badge ' + (ratio >= 0.8 ? 'ok' : (ratio >= 0.65 ? 'pri' : 'warn')) + '">' +
            (ratio >= 0.8 ? 'Giỏi' : (ratio >= 0.65 ? 'Khá / Đạt' : 'Cần củng cố thêm')) +
          '</span>' +
        '</div>' +
        '<div class="diff-grid">' +
          [1,2,3,4].filter(function(lv){ return byDiff[lv].tot > 0; }).map(function(lv){
            return '<div class="diff-stat"><span class="badge d' + lv + '">' + DIFF_SHORT[lv] + '</span>' +
              '<div style="font-weight:700;font-size:1.1rem;margin-top:4px">' + byDiff[lv].ok + ' / ' + byDiff[lv].tot + ' câu</div></div>';
          }).join('') +
        '</div>' +
        (weakList.length
          ? '<b>Các bài cần ôn củng cố lại từ đề này:</b><ul class="tight">' + weakList.map(function(t){
              return '<li><a href="#/bai/' + t.id + '">' + esc(t.title) + '</a> (Lớp ' + t.grade + ')</li>';
            }).join('') + '</ul>'
          : '<p class="done">Tuyệt vời! Bạn làm đúng 100% các mức độ trong đề này.</p>') +
        '<div class="row" style="margin-top:12px">' +
          '<button type="button" class="btn" id="ex-retry">Random bộ đề mới</button>' +
          '<button type="button" class="btn alt" id="ex-pdf-q">Phần 1: Đề (Không đáp án)</button>' +
          '<button type="button" class="btn subtle" id="ex-pdf-k">Phần 2: Đáp án riêng</button>' +
          '<a class="btn subtle" href="#/de-kiem-tra/' + ex.grade + '">Danh sách đề</a>' +
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
        showTopic: true,
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
  var cfg = { grade:'all', subj:'all', diff:'all', qtype:'all', count:10, keyword:'' };
  if (!s) return cfg;

  var cm = s.match(/(\d+)\s*(cau|bai)/);
  if (cm) {
    var c = parseInt(cm[1], 10);
    if (c >= 1 && c <= 40) cfg.count = c;
    s = s.replace(cm[0], ' ');
  }

  var gm = s.match(/(?:lop|khtn|l)\s*([6-9])/);
  if (!gm) gm = s.match(/\b([6-9])\b/);
  if (gm) {
    cfg.grade = gm[1];
    s = s.replace(gm[0], ' ');
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

// --- VIEW 6: Custom Practice Builder & Runner ---
function practice(presetMode){
  updateNavActive('luyen-tap');
  var mistakesMap = loadMistakes();
  var mistakeEntries = Object.keys(mistakesMap).map(function(k){ return mistakesMap[k]; }).filter(function(e){
    return byId[e.topicId] && getMistakeQuestion(e);
  });

  var state = {
    grade: 'all',
    subj: 'all',
    diff: 'all',
    qtype: 'all',
    count: 10,
    keyword: '',
    onlyMistakes: presetMode === 'cau-sai',
    sortEasyToHard: true
  };

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
      if (state.subj !== 'all' && t.subj !== state.subj) return;
      var topicText = normVi(t.title + ' ' + t.formulas.join(' ') + ' ' + t.theory.join(' '));
      var kw = normVi(state.keyword);
      getTopicPool(t, 4).forEach(function(item){
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
      '<div class="crumb"><a href="#/">Trang chủ</a> › Chọn bài luyện</div>' +
      '<h1>Tạo bộ đề luyện Random theo yêu cầu</h1>' +
      '<p class="muted">Mỗi lần tạo đều sinh câu hỏi mới từ kho mở rộng & biến thể động. Khi tải/in tách riêng <b>Phần 1: Đề (Không đáp án)</b> và <b>Phần 2: Đáp án</b> khóa theo Mã đề.</p>' +
      '<section class="card" style="margin-bottom:14px">' +
        '<label for="quick-cmd" style="display:block;font-weight:700;margin-bottom:6px">Yêu cầu nhanh</label>' +
        '<div class="row">' +
          '<input type="text" id="quick-cmd" style="flex:1;min-width:220px" placeholder="Ví dụ: 10 câu hóa lớp 8 cơ bản, 10 câu lý lớp 7 vận dụng, 8 câu mol…">' +
          '<button type="button" class="btn" id="apply-cmd">Áp dụng</button>' +
        '</div>' +
        '<div class="row" style="margin-top:8px">' +
          '<span class="muted" style="font-size:.86rem">Gợi ý:</span>' +
          '<button type="button" class="chip" data-ex="10 câu hóa lớp 7 cơ bản">10 câu hóa 7 dễ</button>' +
          '<button type="button" class="chip" data-ex="10 câu hóa lớp 8 vận dụng">10 câu hóa 8 vận dụng</button>' +
          '<button type="button" class="chip" data-ex="10 câu lý lớp 8 thông hiểu">10 câu lý 8 thông hiểu</button>' +
          '<button type="button" class="chip" data-ex="12 câu sinh lớp 8">12 câu sinh 8</button>' +
        '</div>' +
      '</section>' +
      '<section class="card">' +
        '<div class="form-grid">' +
          '<div class="field"><label for="p-grade">Lớp</label><select id="p-grade">' +
            '<option value="all">Tất cả (6–9)</option><option value="7">Lớp 7 (Trọng tâm)</option><option value="8">Lớp 8 (Trọng tâm)</option><option value="6">Lớp 6</option><option value="9">Lớp 9</option>' +
          '</select></div>' +
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
          '<div class="field"><label for="p-type">Dạng câu</label><select id="p-type">' +
            '<option value="all">Trắc nghiệm + Điền số</option><option value="mc">Chỉ trắc nghiệm</option><option value="num">Chỉ điền số / tính toán</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-count">Số câu</label><select id="p-count">' +
            '<option value="6">6 câu</option><option value="10">10 câu</option><option value="15">15 câu</option><option value="20">20 câu</option><option value="25">25 câu</option>' +
          '</select></div>' +
          '<div class="field"><label for="p-kw">Từ khóa chủ đề</label><input type="text" id="p-kw" placeholder="VD: mol, áp suất, đòn bẩy, máu…"></div>' +
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
    var elSubj = document.getElementById('p-subj');
    var elDiff = document.getElementById('p-diff');
    var elType = document.getElementById('p-type');
    var elCount = document.getElementById('p-count');
    var elKw = document.getElementById('p-kw');
    var elOrder = document.getElementById('p-order');
    var elOnlyErr = document.getElementById('p-only-err');
    var elSummary = document.getElementById('p-summary');
    var btnStart = document.getElementById('p-start');
    var btnPrint = document.getElementById('p-print');
    var btnPrintKey = document.getElementById('p-print-key');
    var cachedBuilderSpec = null;

    function syncInputs(){
      elGrade.value = state.grade;
      elSubj.value = state.subj;
      elDiff.value = state.diff;
      elType.value = state.qtype;
      if (!Array.prototype.some.call(elCount.options, function(o){ return String(o.value) === String(state.count); })) {
        var opt = document.createElement('option');
        opt.value = state.count;
        opt.textContent = state.count + ' câu';
        elCount.appendChild(opt);
      }
      elCount.value = String(state.count);
      elKw.value = state.keyword;
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
        elSummary.innerHTML = '<b>Không tìm thấy câu hỏi phù hợp.</b> Hãy nới rộng bộ lọc hoặc đổi mức độ.';
        btnStart.disabled = true;
        btnPrint.disabled = true;
        btnPrintKey.disabled = true;
      } else {
        elSummary.innerHTML =
          'Kho câu hỏi & biến thể khớp: <b>' + pool.length + '+ câu</b> · Sẽ random ra <b>' + take + ' câu</b>' +
          (state.sortEasyToHard ? ' (sắp từ Dễ → Khó)' : '') +
          ' · Dự kiến <b>~' + estMinutes(take, false) + ' phút</b>.';
        btnStart.disabled = false;
        btnPrint.disabled = false;
        btnPrintKey.disabled = false;
      }
    }

    function pickItems(){
      var pool = collectPool();
      var take = Math.min(pool.length, Number(state.count) || 10);
      var high = shuffle(pool.filter(function(x){ return x.weight >= 3; }));
      var mid = shuffle(pool.filter(function(x){ return x.weight > 0 && x.weight < 3; }));
      var low = shuffle(pool.filter(function(x){ return x.weight === 0; }));
      var chosen = high.concat(mid, low).slice(0, take);
      if (state.sortEasyToHard) {
        chosen.sort(function(a, b){ return a.d - b.d; });
      }
      return chosen;
    }

    function makeFreshBuilderSpec(){
      var picks = pickItems();
      cachedBuilderSpec = window.KHTNPrint.prepare({
        prefix: state.grade === 'all' ? 'LT' : 'L' + state.grade,
        docTitle: 'ĐỀ BÀI TẬP TỰ CHỌN KHTN',
        subtitle: (state.grade !== 'all' ? 'Lớp ' + state.grade + ' · ' : '') + (state.subj !== 'all' ? SUBJ[state.subj] + ' · ' : '') + 'Sắp xếp từ Dễ đến Khó',
        items: picks.map(function(p){ return { topicTitle: p.t.title.replace(/^Bài \d+:\s*/, ''), q: p.q }; })
      });
      return cachedBuilderSpec;
    }

    function getBuilderSpec(){
      return cachedBuilderSpec || makeFreshBuilderSpec();
    }

    elGrade.onchange = function(){ state.grade = elGrade.value; updateSummary(); };
    elSubj.onchange = function(){ state.subj = elSubj.value; updateSummary(); };
    elDiff.onchange = function(){ state.diff = elDiff.value; updateSummary(); };
    elType.onchange = function(){ state.qtype = elType.value; updateSummary(); };
    elCount.onchange = function(){ state.count = parseInt(elCount.value, 10) || 10; updateSummary(); };
    elKw.oninput = function(){ state.keyword = elKw.value; updateSummary(); };
    elOrder.onchange = function(){ state.sortEasyToHard = elOrder.checked; updateSummary(); };
    if (elOnlyErr) elOnlyErr.onchange = function(){ state.onlyMistakes = elOnlyErr.checked; updateSummary(); };

    var cmdInput = document.getElementById('quick-cmd');
    function applyPrompt(txt){
      var parsed = parsePracticePrompt(txt);
      state.grade = parsed.grade;
      state.subj = parsed.subj;
      state.diff = parsed.diff;
      state.qtype = parsed.qtype;
      state.count = parsed.count;
      state.keyword = parsed.keyword;
      state.onlyMistakes = false;
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

    btnStart.onclick = function(){ runPracticeSession(pickItems()); };
    btnPrint.onclick = function(){
      window.KHTNPrint.open(getBuilderSpec(), 'quiz', { onRegenerate: makeFreshBuilderSpec });
    };
    btnPrintKey.onclick = function(){
      window.KHTNPrint.open(getBuilderSpec(), 'key', { onRegenerate: makeFreshBuilderSpec });
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

// --- VIEW 7: Placement Test (Kiểm tra nền) ---
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
      '<span class="muted">Mã đề: <b>' + esc(sheetSpec.code) + '</b> · ' + picks.length + ' câu ngẫu nhiên từ dễ đến trung bình.</span>' +
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
        D.forEach(function(t){
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
                '<div>' + tag(t.subj) + ' <a href="#/bai/' + t.id + '" style="font-weight:700">Lớp ' + t.grade + ' – ' + esc(t.title) + '</a></div>' +
                '<a href="#/bai/' + t.id + '" style="font-size:.88rem">Học bài →</a>' +
              '</div>' +
              g.formulas.map(function(f){ return '<div class="formula">' + esc(f) + '</div>'; }).join('') +
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
        box.innerHTML = '<div class="empty">Hiện chưa có câu làm sai nào được ghi nhận. Khi làm bài hoặc đề kiểm tra, các câu sai sẽ tự động lưu ở đây để bạn củng cố lại.</div>';
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
              '<p style="margin:.6em 0 .4em"><b>Đề:</b> ' + esc(q.q) + '</p>' +
              '<div class="fb ok"><b>Đáp án đúng:</b> ' + esc(ans) + (q.w ? '<br><b>Giải thích:</b> ' + esc(q.w) : '') + '</div>' +
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
    '<div class="crumb"><a href="#/">Trang chủ</a> › Tiến độ học tập</div>' +
    '<h1>Tiến độ học tập & Lịch sử kiểm tra</h1>' +
    '<div class="grid stats" style="margin-bottom:16px">' +
      '<div class="card"><div class="muted">Bài đạt chuẩn</div><div class="stat-val">' + completed + ' / ' + D.length + '</div></div>' +
      '<div class="card"><div class="muted">Điểm TB bài học</div><div class="stat-val">' + avgScore + '</div></div>' +
      '<div class="card"><div class="muted">Đề KT đã làm</div><div class="stat-val">' + doneExamIds.length + ' / ' + EXAMS.length + '</div></div>' +
      '<div class="card"><div class="muted">Câu cần ôn lại</div><div class="stat-val">' + mistakeCount + '</div></div>' +
    '</div>';

  if (doneExamIds.length) {
    h += '<section class="card" style="margin-bottom:16px"><h2 style="margin-top:0">Kết quả đề kiểm tra (15 phút · 45 phút · Giữa kì · Cuối kì)</h2><div class="grid two">';
    doneExamIds.forEach(function(id){
      var ex = examById[id], st = examStats[id];
      h +=
        '<div class="card soft">' +
          '<div class="row between"><b>' + esc(ex.title) + ' (Lớp ' + ex.grade + ')</b><span class="badge ' + (st.best >= 0.67 ? 'ok' : 'warn') + '">' + score10(st.best) + '/10</span></div>' +
          '<div class="muted" style="font-size:.88rem;margin:4px 0 8px">Gần nhất: ' + score10(st.last) + '/10 · ' + st.attempts + ' lượt làm</div>' +
          '<a class="btn sm alt" href="#/lam-de/' + id + '">Random đề mới</a>' +
        '</div>';
    });
    h += '</div></section>';
  }

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
  h += '<section class="card"><h2 style="margin-top:0">Tiến độ theo lớp</h2>';
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

  var weakLessons = D.filter(function(t){ var b = best(t.id); return b != null && b < 0.67; });
  h += '<h2>Bài cần củng cố lại (dưới 6,7 / 10)</h2>';
  if (weakLessons.length) {
    h += '<div class="grid">';
    weakLessons.forEach(function(t){
      h +=
        '<a class="card" href="#/bai/' + t.id + '">' +
          tag(t.subj) +
          '<h3 style="margin:.4em 0 .2em">' + esc(t.title) + '</h3>' +
          '<div class="muted">Lớp ' + t.grade + ' · Điểm hiện tại: ' + score10(best(t.id)) + '/10</div>' +
        '</a>';
    });
    h += '</div>';
  } else {
    h += '<div class="card soft muted">Chưa có bài nào dưới 6,7/10.</div>';
  }

  h +=
    '<h2>Quản lý dữ liệu trên thiết bị</h2>' +
    '<div class="card">' +
      '<p class="muted" style="margin-top:0">Bạn có thể sao lưu tiến độ để chuyển sang iPad/máy khác hoặc xóa toàn bộ dữ liệu học tập trên thiết bị này.</p>' +
      '<div class="row">' +
        '<button type="button" class="btn sm alt" id="btn-export">Sao lưu tiến độ (JSON)</button>' +
        '<button type="button" class="btn sm subtle" id="btn-import">Khôi phục từ tệp</button>' +
        '<input type="file" id="file-import" accept="application/json" hidden>' +
        '<button type="button" class="btn sm danger" id="rs">Xóa toàn bộ tiến độ</button>' +
      '</div>' +
    '</div>';

  app.innerHTML = h;

  document.getElementById('btn-export').onclick = function(){
    var payload = {
      version: 5,
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
