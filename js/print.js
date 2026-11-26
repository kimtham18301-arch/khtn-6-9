(function(){
'use strict';

// Hệ thống Xuất / Tải / In Khổ A4 ĐỘC LẬP 2 PHẦN:
//   - PHẦN 1: ĐỀ BÀI (KHÔNG CÓ ĐÁP ÁN)
//   - PHẦN 2: ĐÁP ÁN & LỜI GIẢI CHI TIẾT
// Mỗi bộ đề khi tạo đều được đóng băng (immutable snapshot) theo Mã đề riêng và lưu vào lịch sử tạm,
// đảm bảo khi random bộ đề mới hoàn toàn KHÔNG ảnh hưởng hay trộn lẫn với đề/đáp án đã tạo trước đó.

var KEY_SNAPS = 'khtn-snapshots-v1';
var DIFF_NAME = {
  1:'Mức 1: Nhận biết (Dễ)',
  2:'Mức 2: Thông hiểu (TB)',
  3:'Mức 3: Vận dụng (Khá)',
  4:'Mức 4: Vận dụng cao (Khó)'
};

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

function makeCode(prefix){
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var out = '';
  for (var i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return 'KHTN-' + (prefix || 'DE') + '-' + out;
}

function shuffleCopy(arr){
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function formatNum(n){
  return String(n).replace('.', ',');
}

function loadHistory(){
  try {
    var raw = localStorage.getItem(KEY_SNAPS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveSnapshotToHistory(spec){
  try {
    var list = loadHistory().filter(function(x){ return x && x.code !== spec.code; });
    // Store compact immutable copy (without heavy lesson object if not needed, or keep lightweight fields)
    var copy = JSON.parse(JSON.stringify(spec));
    list.unshift(copy);
    if (list.length > 15) list = list.slice(0, 15);
    localStorage.setItem(KEY_SNAPS, JSON.stringify(list));
  } catch (e) {}
}

function shortAnsText(item){
  var q = item.q;
  if (item.choices) {
    var letters = ['A', 'B', 'C', 'D'];
    var idx = item.choices.indexOf(q.o[0]);
    return idx > -1 ? letters[idx] : q.o[0];
  }
  return formatNum(q.n) + (q.u ? ' ' + q.u : '');
}

function renderQuickKeyTable(items){
  var html = '<div style="margin:8px 0 14px;padding:10px 12px;border:1px solid #888;border-radius:6px;background:#f8fafc">' +
    '<div style="font-weight:700;margin-bottom:6px">BẢNG TRA NHANH ĐÁP ÁN (' + items.length + ' CÂU):</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:4px 10px;font-size:.92rem">';
  items.forEach(function(it, idx){
    html += '<div><b>Câu ' + (idx + 1) + ':</b> ' + esc(shortAnsText(it)) + '</div>';
  });
  html += '</div></div>';
  return html;
}

function renderQuestionListHtml(items, isKey){
  var html = '';
  items.forEach(function(item, idx){
    var q = item.q;
    var dLabel = q.d && DIFF_NAME[q.d] ? DIFF_NAME[q.d] : '';
    html += '<div class="sheet-q">';
    html += '<div><b>Câu ' + (idx + 1) + '.</b> ' + fmtMath(q.q) +
      (dLabel || item.topicTitle ? ' <span style="color:#555;font-size:.85rem">[' + esc([dLabel, item.topicTitle].filter(Boolean).join(' · ')) + ']</span>' : '') + '</div>';

    if (!isKey) {
      if (item.choices) {
        var letters = ['A', 'B', 'C', 'D'];
        html += '<div class="sheet-opts">';
        item.choices.forEach(function(opt, oi){
          html += '<div><b>' + letters[oi] + '.</b> ' + fmtMath(opt) + '</div>';
        });
        html += '</div>';
      } else {
        html += '<div style="margin:6px 0 0 18px">Đáp số: .................................... ' + esc(q.u || '') + '</div>';
      }
      html += '<div class="sheet-lines"><div></div><div></div>' + (item.choices ? '' : '<div></div>') + '</div>';
    } else {
      var ansText = '';
      if (item.choices) {
        var lettersKey = ['A', 'B', 'C', 'D'];
        var correctIdx = item.choices.indexOf(q.o[0]);
        ansText = (correctIdx > -1 ? '<b>' + lettersKey[correctIdx] + '.</b> ' : '') + fmtMath(q.o[0]);
      } else {
        ansText = esc(formatNum(q.n) + (q.u ? ' ' + q.u : ''));
      }
      html += '<div class="sheet-ans"><b>Đáp án đúng:</b> ' + ansText + '<br><b>Lời giải chi tiết:</b> ' + fmtMath(q.w || '') + '</div>';
    }
    html += '</div>';
  });
  return html;
}

function buildSheetHtml(spec, mode){
  if (mode === 'formulas' && spec.formulaGroups) {
    var fHtml =
      '<div class="sheet-preview">' +
        '<div class="sheet-head">' +
          '<div>' +
            '<div style="font-size:1.18rem;font-weight:700">SCIBOOK · SỔ TAY TÓM TẮT CÔNG THỨC & GHI NHỚ KHTN</div>' +
            '<div class="sheet-meta">' + esc(spec.subtitle) + ' · ' + spec.formulaGroups.length + ' chủ đề</div>' +
          '</div>' +
          '<div class="sheet-code">' + esc(spec.code) + '</div>' +
        '</div>';
    spec.formulaGroups.forEach(function(g, gi){
      fHtml += '<div class="sheet-q"><b>' + (gi + 1) + '. Lớp ' + g.grade + ' – ' + esc(g.title) + '</b><ul style="margin:6px 0 10px 18px;padding:0">';
      g.formulas.forEach(function(f){
        fHtml += '<li style="margin:7px 0;line-height:1.8">' + fmtMath(f) + '</li>';
      });
      fHtml += '</ul></div>';
    });
    fHtml += '</div>';
    return fHtml;
  }

  if (mode === 'study' && spec.lesson) {
    var t = spec.lesson;
    var sHtml =
      '<div class="sheet-preview">' +
        '<div class="sheet-head">' +
          '<div>' +
            '<div style="font-size:1.18rem;font-weight:700">SCIBOOK · TÀI LIỆU LÝ THUYẾT & ĐỀ LUYỆN (KHÔNG KÈM ĐÁP ÁN)</div>' +
            '<div class="sheet-meta">Lớp ' + t.grade + ' – ' + esc(t.title) + ' · Sắp xếp từ Dễ đến Khó</div>' +
          '</div>' +
          '<div class="sheet-code">Mã đề: ' + esc(spec.code) + '</div>' +
        '</div>' +
        '<div style="margin-bottom:12px"><b>I. KIẾN THỨC TRỌNG TÂM CẦN NHỚ</b><ul style="margin:5px 0 0 18px;padding:0">' +
          (t.theory || []).map(function(line){ return '<li style="margin:5px 0">' + fmtMath(line) + '</li>'; }).join('') +
        '</ul></div>' +
        '<div style="margin-bottom:12px"><b>II. CÔNG THỨC & QUY TẮC CHUẨN</b><ul style="margin:5px 0 0 18px;padding:0">' +
          (t.formulas || []).map(function(f){ return '<li style="margin:8px 0;line-height:1.85"><b>' + fmtMath(f) + '</b></li>'; }).join('') +
        '</ul></div>';

    if (t.examples && t.examples.length) {
      sHtml += '<div style="margin-bottom:14px"><b>III. VÍ DỤ MINH HỌA TỪNG BƯỚC</b>';
      t.examples.forEach(function(ex, ei){
        sHtml += '<div style="margin:6px 0 8px 10px"><div><i>Ví dụ ' + (ei + 1) + ':</i> ' + fmtMath(ex.q) + '</div>' +
          '<div style="margin-left:12px;color:#222;line-height:1.8">• ' + ex.steps.map(fmtMath).join('<br>• ') + '<br>⇒ <b>Đáp số:</b> ' + fmtMath(ex.ans) + '</div></div>';
      });
      sHtml += '</div>';
    }

    sHtml += '<div><b>IV. BÀI TẬP TỰ LUYỆN – PHẦN ĐỀ KHÔNG CÓ ĐÁP ÁN (' + spec.items.length + ' CÂU)</b>' +
      renderQuestionListHtml(spec.items, false) +
      '</div>' +
      '<div class="sheet-meta" style="margin-top:14px;border-top:1px solid #bbb;padding-top:8px">' +
        'Phần đáp án được tách riêng ở <b>Phần 2 (Mã đề: ' + esc(spec.code) + ')</b> — hoàn toàn độc lập với các lần random sau.' +
      '</div></div>';
    return sHtml;
  }

  var isKey = mode === 'key';
  var docTitle = isKey
    ? 'PHẦN 2: ĐÁP ÁN & LỜI GIẢI CHI TIẾT'
    : ('PHẦN 1: ' + (spec.docTitle || 'ĐỀ BÀI TẬP / KIỂM TRA') + ' (KHÔNG CÓ ĐÁP ÁN)');
  var estMin = spec.minutes || Math.max(5, Math.ceil(spec.items.length * 1.5));

  var html =
    '<div class="sheet-preview">' +
      '<div class="sheet-head">' +
        '<div>' +
          '<div style="font-size:1.14rem;font-weight:700">' + esc(docTitle) + '</div>' +
          '<div class="sheet-meta">' + esc(spec.subtitle) + ' · ' + spec.items.length + ' câu · Thời gian: ' + estMin + ' phút</div>' +
          (isKey
            ? '<div class="sheet-meta" style="margin-top:4px;font-weight:600">Bản chấm điểm đối chiếu đúng theo Mã đề ' + esc(spec.code) + ' (độc lập với các mã đề random khác)</div>'
            : '<div class="sheet-meta" style="margin-top:6px">Họ và tên: .................................................. Lớp: ............ Điểm: ......../10</div>') +
        '</div>' +
        '<div class="sheet-code">Mã đề: ' + esc(spec.code) + '</div>' +
      '</div>';

  if (isKey) {
    html += renderQuickKeyTable(spec.items);
  }
  html += renderQuestionListHtml(spec.items, isKey);

  html += '<div class="sheet-meta" style="margin-top:16px;border-top:1px solid #bbb;padding-top:8px">' +
    (isKey
      ? 'Phiếu đáp án này khóa cố định theo <b>Mã đề: ' + esc(spec.code) + '</b>.'
      : 'Phiếu đề bài (không kèm đáp án) – Đối chiếu kết quả bằng <b>Phần 2: Đáp án</b> có cùng <b>Mã đề: ' + esc(spec.code) + '</b>.') +
    ' Thang điểm 10 (mỗi câu ' + formatNum(Math.round((10 / Math.max(1, spec.items.length)) * 100) / 100) + ' điểm).' +
    '</div></div>';
  return html;
}

// Wrap a sheet into a standalone self-contained A4 printable HTML file for direct download
function buildStandaloneDownloadFile(spec, mode){
  var partTag = mode === 'key' ? 'PHAN-2-DAP-AN' : 'PHAN-1-DE-KHONG-DAP-AN';
  var pageTitle = partTag + '_' + spec.code;
  var bodySheet = buildSheetHtml(spec, mode);
  var mathCss = (window.KHTNMath && typeof window.KHTNMath.cssString === 'function') ? window.KHTNMath.cssString() : '';
  return '<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<title>' + esc(pageTitle) + '</title>\n' +
    '<style>\n' +
    'body{margin:0;padding:20px;background:#f7f4ff;font:15px/1.7 "Times New Roman",Cambria,Georgia,serif;color:#111}\n' +
    '.top-bar{max-width:210mm;margin:0 auto 14px;padding:10px 14px;background:#fff;border:1px solid #d8ccf8;border-radius:10px;display:flex;justify-content:space-between;align-items:center;font-family:system-ui,sans-serif}\n' +
    '.pbtn{background:#6d5dfc;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-weight:600;cursor:pointer}\n' +
    '.sheet-preview{background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:22px 26px;max-width:210mm;margin:0 auto}\n' +
    '.sheet-preview li{margin:7px 0;line-height:1.8}\n' +
    '.sheet-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}\n' +
    '.sheet-meta{font-size:.9rem;color:#333}\n' +
    '.sheet-code{font-family:Consolas,monospace;font-weight:700;border:1.5px solid #111;padding:3px 8px;border-radius:4px;font-size:.92rem;white-space:nowrap}\n' +
    '.sheet-q{margin:12px 0;page-break-inside:avoid}\n' +
    '.sheet-opts{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin:5px 0 0 18px}\n' +
    '.sheet-lines{margin-top:8px}.sheet-lines div{border-bottom:1px dotted #888;height:24px}\n' +
    '.sheet-ans{margin:4px 0 0 18px;color:#111;line-height:1.8}\n' +
    mathCss + '\n' +
    '@media print{@page{size:A4;margin:14mm}body{background:#fff;padding:0}.top-bar{display:none!important}.sheet-preview{border:0;padding:0;max-width:none}}\n' +
    '</style>\n</head>\n<body>\n' +
    '<div class="top-bar"><div><b>SciBook · ' + esc(mode === 'key' ? 'Phần 2: Đáp án & lời giải' : 'Phần 1: Đề bài (Không có đáp án)') + '</b> · Mã đề: <b>' + esc(spec.code) + '</b></div>' +
    '<button class="pbtn" onclick="window.print()">In ra giấy / Lưu thành PDF (A4)</button></div>\n' +
    bodySheet + '\n</body>\n</html>';
}

function triggerDownload(filename, htmlContent){
  var blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
}

window.KHTNPrint = {
  // Deep-clone & freeze snapshot so future randomizations NEVER mutate this exam/worksheet!
  prepare: function(opts){
    var items = (opts.items || []).map(function(it){
      var qCopy = JSON.parse(JSON.stringify(it.q));
      return {
        topicTitle: it.topicTitle || '',
        q: qCopy,
        choices: qCopy.o ? shuffleCopy(qCopy.o) : null
      };
    });
    var lessonCopy = opts.lesson ? {
      grade: opts.lesson.grade,
      title: opts.lesson.title,
      theory: (opts.lesson.theory || []).slice(),
      formulas: (opts.lesson.formulas || []).slice(),
      examples: opts.lesson.examples ? JSON.parse(JSON.stringify(opts.lesson.examples)) : null
    } : null;

    var spec = {
      code: opts.code || makeCode(opts.prefix),
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }),
      docTitle: opts.docTitle || '',
      subtitle: opts.subtitle || 'Khoa học tự nhiên THCS (GDPT 2018)',
      minutes: opts.minutes || null,
      lesson: lessonCopy,
      formulaGroups: opts.formulaGroups ? JSON.parse(JSON.stringify(opts.formulaGroups)) : null,
      items: items
    };
    if (!spec.formulaGroups && spec.items.length) {
      saveSnapshotToHistory(spec);
    }
    return spec;
  },

  // opts: { onRegenerate: function() -> newSpec }
  open: function(initialSpec, initialMode, opts){
    opts = opts || {};
    var spec = initialSpec;
    var mode = initialMode || (spec.formulaGroups ? 'formulas' : 'quiz');
    var modal = document.getElementById('print-modal');
    var printRoot = document.getElementById('print-root');
    if (!modal || !printRoot) return;

    function render(){
      var sheetHtml = buildSheetHtml(spec, mode);
      printRoot.innerHTML = sheetHtml;
      var history = loadHistory();

      var modeBtns = '';
      if (spec.formulaGroups) {
        modeBtns = '<button type="button" class="btn sm on" data-mode="formulas">Sổ tay công thức</button>';
      } else {
        modeBtns +=
          '<button type="button" class="btn sm ' + (mode === 'quiz' ? 'on' : 'subtle') + '" data-mode="quiz">Phần 1: Đề (Không đáp án)</button>' +
          '<button type="button" class="btn sm ' + (mode === 'key' ? 'on' : 'subtle') + '" data-mode="key">Phần 2: Đáp án riêng</button>';
        if (spec.lesson) {
          modeBtns += '<button type="button" class="btn sm ' + (mode === 'study' ? 'on' : 'subtle') + '" data-mode="study">Lý thuyết + Đề</button>';
        }
      }

      var historySelect = '';
      if (!spec.formulaGroups && history.length > 1) {
        historySelect = '<select id="snap-hist" style="padding:5px 8px;font-size:.84rem;border-radius:8px" title="Chọn lại mã đề đã tạo trước đó">' +
          history.map(function(h){
            return '<option value="' + esc(h.code) + '"' + (h.code === spec.code ? ' selected' : '') + '>' +
              esc(h.code) + ' (' + h.items.length + ' câu · ' + esc(h.createdAt || '') + ')' +
            '</option>';
          }).join('') +
        '</select>';
      }

      modal.innerHTML =
        '<div class="modal-card">' +
          '<div class="modal-head">' +
            '<div class="row">' +
              '<b id="print-modal-title">Tải / In Bộ Đề Độc Lập</b>' +
              '<span class="badge pri">Mã đề: ' + esc(spec.code) + '</span>' +
              historySelect +
              (typeof opts.onRegenerate === 'function' ? '<button type="button" class="btn sm subtle" data-act="regen">Random mã đề khác</button>' : '') +
            '</div>' +
            '<div class="row">' +
              '<button type="button" class="btn sm subtle" data-act="close">Đóng</button>' +
            '</div>' +
          '</div>' +
          '<div style="padding:10px 18px;border-bottom:1px solid var(--line);background:var(--card);display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center">' +
            '<div class="row">' + modeBtns + '</div>' +
            '<div class="row">' +
              (!spec.formulaGroups
                ? '<button type="button" class="btn sm" data-act="dl-both">Tải cả 2 file (Đề không đáp án + Đáp án)</button>' +
                  '<button type="button" class="btn sm alt" data-act="print">In / Lưu PDF phần đang mở</button>'
                : '<button type="button" class="btn sm" data-act="print">In / Lưu PDF Sổ tay</button>') +
            '</div>' +
          '</div>' +
          '<div class="modal-body">' + sheetHtml + '</div>' +
        '</div>';

      modal.querySelectorAll('[data-mode]').forEach(function(b){
        b.onclick = function(){ mode = b.dataset.mode; render(); };
      });
      modal.querySelector('[data-act="print"]').onclick = function(){ window.print(); };
      modal.querySelector('[data-act="close"]').onclick = close;

      var btnBoth = modal.querySelector('[data-act="dl-both"]');
      if (btnBoth) {
        btnBoth.onclick = function(){
          var fileQuiz = buildStandaloneDownloadFile(spec, 'quiz');
          var fileKey = buildStandaloneDownloadFile(spec, 'key');
          triggerDownload('1-DE-KHONG-DAP-AN_' + spec.code + '.html', fileQuiz);
          setTimeout(function(){
            triggerDownload('2-DAP-AN-CHI-TIET_' + spec.code + '.html', fileKey);
          }, 250);
        };
      }

      var btnRegen = modal.querySelector('[data-act="regen"]');
      if (btnRegen && typeof opts.onRegenerate === 'function') {
        btnRegen.onclick = function(){
          spec = opts.onRegenerate();
          render();
        };
      }

      var histEl = modal.querySelector('#snap-hist');
      if (histEl) {
        histEl.onchange = function(){
          var found = loadHistory().find(function(x){ return x.code === histEl.value; });
          if (found) { spec = found; render(); }
        };
      }
    }

    function onKey(e){ if (e.key === 'Escape') close(); }
    function close(){
      modal.hidden = true;
      modal.innerHTML = '';
      document.removeEventListener('keydown', onKey);
    }

    modal.onclick = function(e){ if (e.target === modal) close(); };
    document.addEventListener('keydown', onKey);
    modal.hidden = false;
    render();
  }
};
})();
