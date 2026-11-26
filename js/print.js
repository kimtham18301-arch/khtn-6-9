(function(){
'use strict';

// Hệ thống Xuất / Tải / In Khổ A4 Thân Thiện Cho Mọi Lứa Tuổi:
//   - Chế độ GỘP 1 CHẠM ('both'): In Tờ 1: Đề bài (Không có đáp án) + tự động sang trang mới in Tờ 2: Đáp án & lời giải!
//   - Tờ 1 riêng ('quiz') & Tờ 2 riêng ('key'), chia rõ Phần A (Trắc nghiệm lí thuyết) & Phần B (Bài tập củng cố)
//   - Ghi chú Các dạng bài tập & Ví dụ mẫu: luôn có trong tài liệu Bài học / Sổ tay PDF; ở Đề kiểm tra có nút BẬT / TẮT tùy chọn!

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

function fmtFormula(s){
  return (window.KHTNMath && typeof window.KHTNMath.formatFormula === 'function')
    ? window.KHTNMath.formatFormula(s)
    : fmtMath(s);
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
    '<div style="font-weight:700;margin-bottom:6px">BẢNG DÒ NHANH ĐÁP ÁN (' + items.length + ' CÂU):</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:4px 10px;font-size:.92rem">';
  items.forEach(function(it, idx){
    html += '<div><b>Câu ' + (idx + 1) + ':</b> ' + esc(shortAnsText(it)) + '</div>';
  });
  html += '</div></div>';
  return html;
}

function renderProblemTypesHtml(typeGroups, headingText){
  if (!typeGroups || !typeGroups.length) return '';
  var html = '<div class="sheet-types-box">' +
    '<div style="font-weight:700;font-size:1.02rem;margin-bottom:6px;text-transform:uppercase">' +
      esc(headingText || 'CÁC DẠNG BÀI TẬP CÓ THỂ XUẤT HIỆN & VÍ DỤ MINH HỌA') +
    '</div>';
  typeGroups.forEach(function(grp){
    if (!grp.types || !grp.types.length) return;
    if (typeGroups.length > 1 && grp.title) {
      html += '<div style="font-weight:700;margin:8px 0 4px;color:#1e1b4b">▸ ' + esc(grp.title) + '</div>';
    }
    grp.types.forEach(function(tp){
      html +=
        '<div class="sheet-ptype">' +
          '<div><b>• ' + fmtMath(tp.name) + '</b></div>' +
          '<div style="margin-left:12px;font-size:.93rem">– <i>Cách làm:</i> ' + fmtMath(tp.method) + '</div>' +
          (tp.ex ? '<div style="margin-left:12px;font-size:.93rem">– <i>Ví dụ mẫu:</i> ' + fmtMath(tp.ex) +
            (tp.sol ? '<br><span style="margin-left:10px">⇒ <i>Hướng dẫn giải:</i> ' + fmtMath(tp.sol) + '</span>' : '') +
          '</div>' : '') +
        '</div>';
    });
  });
  html += '</div>';
  return html;
}

function renderSingleQuestionHtml(item, qNumber, isKey){
  var q = item.q;
  var dLabel = q.d && DIFF_NAME[q.d] ? DIFF_NAME[q.d] : '';
  var html = '<div class="sheet-q">';
  html += '<div><b>Câu ' + qNumber + '.</b> ' + fmtMath(q.q) +
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
      html += '<div style="margin:6px 0 0 18px">Điền đáp số: .................................... ' + esc(q.u || '') + '</div>';
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
    html += '<div class="sheet-ans"><b>Đáp án đúng:</b> ' + ansText + '<br><b>Cách giải dễ hiểu:</b> ' + fmtMath(q.w || '') + '</div>';
  }
  html += '</div>';
  return html;
}

function renderQuestionListHtml(items, isKey, splitBySection){
  var ltItems = [];
  var btItems = [];
  items.forEach(function(it, idx){
    if (it.sec === 'lt') ltItems.push({ it: it, num: idx + 1 });
    else btItems.push({ it: it, num: idx + 1 });
  });

  var canSplit = splitBySection && ltItems.length > 0 && btItems.length > 0;
  if (!canSplit) {
    var flatHtml = '';
    items.forEach(function(it, idx){
      flatHtml += renderSingleQuestionHtml(it, idx + 1, isKey);
    });
    return flatHtml;
  }

  var html =
    '<div class="sheet-sec-head">PHẦN A. TRẮC NGHIỆM LÍ THUYẾT TRỌNG TÂM (' + ltItems.length + ' CÂU)</div>';
  ltItems.forEach(function(x){
    html += renderSingleQuestionHtml(x.it, x.num, isKey);
  });
  html +=
    '<div class="sheet-sec-head" style="margin-top:14px">PHẦN B. BÀI TẬP CỦNG CỐ TỪ DỄ ĐẾN KHÓ (' + btItems.length + ' CÂU)</div>';
  btItems.forEach(function(x){
    html += renderSingleQuestionHtml(x.it, x.num, isKey);
  });
  return html;
}

function buildSinglePartInner(spec, isKey, includeTypes){
  var docTitle = isKey
    ? 'TỜ 2: ĐÁP ÁN & CÁCH GIẢI CHI TIẾT (DÀNH ĐỂ DÒ KẾT QUẢ)'
    : ('TỜ 1: ' + (spec.docTitle || 'ĐỀ BÀI TẬP / KIỂM TRA') + ' (KHÔNG CÓ ĐÁP ÁN)');
  var estMin = spec.minutes || Math.max(5, Math.ceil(spec.items.length * 1.5));

  var html =
    '<div class="sheet-head">' +
      '<div>' +
        '<div style="font-size:1.12rem;font-weight:700">' + esc(docTitle) + '</div>' +
        '<div class="sheet-meta">' + esc(spec.subtitle) + ' · ' + spec.items.length + ' câu · Thời gian: ' + estMin + ' phút</div>' +
        (isKey
          ? '<div class="sheet-meta" style="margin-top:4px;font-weight:600">Bản chấm điểm đối chiếu đúng theo Mã đề ' + esc(spec.code) + '</div>'
          : '<div class="sheet-meta" style="margin-top:6px">Họ và tên học sinh: .................................................. Lớp: ............ Điểm: ......../10</div>') +
      '</div>' +
      '<div class="sheet-code">Mã đề: ' + esc(spec.code) + '</div>' +
    '</div>';

  if (!isKey && includeTypes && spec.problemTypes && spec.problemTypes.length) {
    html += renderProblemTypesHtml(
      spec.problemTypes,
      spec.isExam
        ? 'GHI CHÚ ÔN TẬP: CÁC DẠNG BÀI TẬP TRONG ĐỀ & VÍ DỤ MẪU'
        : 'GHI CHÚ BÀI HỌC: CÁC DẠNG BÀI TẬP TRONG BÀI & VÍ DỤ MẪU'
    );
  }

  if (isKey) {
    html += renderQuickKeyTable(spec.items);
  }
  html += renderQuestionListHtml(spec.items, isKey, !spec.isExam);

  html += '<div class="sheet-meta" style="margin-top:16px;border-top:1px solid #bbb;padding-top:8px">' +
    (isKey
      ? 'Tờ đáp án này khớp cố định với <b>Mã đề: ' + esc(spec.code) + '</b>.'
      : 'Tờ đề bài (không kèm đáp án) – Đối chiếu kết quả bằng <b>Tờ 2: Đáp án</b> có cùng <b>Mã đề: ' + esc(spec.code) + '</b>.') +
    ' Thang điểm 10 (mỗi câu ' + formatNum(Math.round((10 / Math.max(1, spec.items.length)) * 100) / 100) + ' điểm).' +
    '</div>';
  return html;
}

function buildSheetHtml(spec, mode, includeTypes){
  if (mode === 'formulas' && spec.formulaGroups) {
    var fHtml =
      '<div class="sheet-preview">' +
        '<div class="sheet-head">' +
          '<div>' +
            '<div style="font-size:1.16rem;font-weight:700">SỔ TAY CÔNG THỨC' + (includeTypes ? ' & CÁC DẠNG BÀI TẬP KHTN' : ' & GHI NHỚ KHTN') + '</div>' +
            '<div class="sheet-meta">' + esc(spec.subtitle) + ' · ' + spec.formulaGroups.length + ' bài học</div>' +
          '</div>' +
          '<div class="sheet-code">' + esc(spec.code) + '</div>' +
        '</div>';
    spec.formulaGroups.forEach(function(g, gi){
      fHtml += '<div class="sheet-q"><b>' + (gi + 1) + '. Lớp ' + g.grade + ' – ' + esc(g.title) + '</b><ul style="margin:6px 0 8px 18px;padding:0">';
      g.formulas.forEach(function(f){
        fHtml += '<li style="margin:8px 0;line-height:1.8">' + fmtFormula(f) + '</li>';
      });
      fHtml += '</ul>';
      if (includeTypes && g.types && g.types.length) {
        fHtml += '<div style="margin:4px 0 10px 10px;padding:8px 12px;border-left:3px solid #6d5dfc;background:#faf8ff">' +
          '<div style="font-weight:700;font-size:.94rem;margin-bottom:4px">Các dạng bài tập thường gặp & Ví dụ:</div>';
        g.types.forEach(function(tp){
          fHtml += '<div style="margin:5px 0;font-size:.92rem;line-height:1.65">' +
            '<b>• ' + fmtMath(tp.name) + '</b><br>' +
            '<span style="margin-left:10px">– <i>Cách làm:</i> ' + fmtMath(tp.method) + '</span>' +
            (tp.ex ? '<br><span style="margin-left:10px">– <i>Ví dụ:</i> ' + fmtMath(tp.ex) + (tp.sol ? ' ⇒ <i>Giải:</i> ' + fmtMath(tp.sol) : '') + '</span>' : '') +
          '</div>';
        });
        fHtml += '</div>';
      }
      fHtml += '</div>';
    });
    fHtml += '</div>';
    return fHtml;
  }

  if (mode === 'study' && spec.lesson) {
    var t = spec.lesson;
    var lessonTypes = (spec.problemTypes && spec.problemTypes.length) ? spec.problemTypes : (t.types ? [{ title: t.title, types: t.types }] : []);
    var sHtml =
      '<div class="sheet-preview">' +
        '<div class="sheet-head">' +
          '<div>' +
            '<div style="font-size:1.15rem;font-weight:700">TÀI LIỆU LÝ THUYẾT, CÁC DẠNG BÀI &amp; ĐỀ TỰ LUYỆN</div>' +
            '<div class="sheet-meta">Lớp ' + t.grade + ' – ' + esc(t.title) + ' · Có Trắc nghiệm lí thuyết &amp; Bài tập từ Dễ đến Khó</div>' +
          '</div>' +
          '<div class="sheet-code">Mã đề: ' + esc(spec.code) + '</div>' +
        '</div>' +
        '<div style="margin-bottom:12px"><b>I. KIẾN THỨC TRỌNG TÂM CẦN NHỚ</b><ul style="margin:5px 0 0 18px;padding:0">' +
          (t.theory || []).map(function(line){ return '<li style="margin:5px 0">' + fmtMath(line) + '</li>'; }).join('') +
        '</ul></div>' +
        '<div style="margin-bottom:12px"><b>II. CÔNG THỨC &amp; Ý NGHĨA ĐẠI LƯỢNG</b><ul style="margin:5px 0 0 18px;padding:0">' +
          (t.formulas || []).map(function(f){ return '<li style="margin:8px 0;line-height:1.85">' + fmtFormula(f) + '</li>'; }).join('') +
        '</ul></div>';

    if (lessonTypes.length) {
      sHtml += '<div style="margin-bottom:14px">' +
        renderProblemTypesHtml(lessonTypes, 'III. CÁC DẠNG BÀI TẬP TRONG BÀI & VÍ DỤ GIẢI MẪU') +
      '</div>';
    } else if (t.examples && t.examples.length) {
      sHtml += '<div style="margin-bottom:14px"><b>III. VÍ DỤ GIẢI MẪU TỪNG BƯỚC</b>';
      t.examples.forEach(function(ex, ei){
        sHtml += '<div style="margin:6px 0 8px 10px"><div><i>Ví dụ ' + (ei + 1) + ':</i> ' + fmtMath(ex.q) + '</div>' +
          '<div style="margin-left:12px;color:#222;line-height:1.8">• ' + ex.steps.map(fmtMath).join('<br>• ') + '<br>⇒ <b>Đáp số:</b> ' + fmtMath(ex.ans) + '</div></div>';
      });
      sHtml += '</div>';
    }

    sHtml += '<div><b>IV. BÀI TẬP TỰ LUYỆN (' + spec.items.length + ' CÂU – KHÔNG CÓ ĐÁP ÁN)</b>' +
      renderQuestionListHtml(spec.items, false, true) +
      '</div>' +
      '<div class="sheet-page-break"></div>' +
      buildSinglePartInner(spec, true, false) +
      '</div>';
    return sHtml;
  }

  if (mode === 'both') {
    return '<div class="sheet-preview">' +
      buildSinglePartInner(spec, false, includeTypes) +
      '<div class="sheet-page-break"></div>' +
      buildSinglePartInner(spec, true, false) +
    '</div>';
  }

  var isKey = mode === 'key';
  return '<div class="sheet-preview">' + buildSinglePartInner(spec, isKey, includeTypes) + '</div>';
}

function buildStandaloneDownloadFile(spec, mode, includeTypes){
  var partTag = mode === 'key' ? 'TO-2-DAP-AN' : (mode === 'both' ? 'TRON-BO-DE-VA-DAP-AN' : 'TO-1-DE-BAI');
  var pageTitle = partTag + '_' + spec.code;
  var bodySheet = buildSheetHtml(spec, mode, includeTypes);
  var mathCss = (window.KHTNMath && typeof window.KHTNMath.cssString === 'function') ? window.KHTNMath.cssString() : '';
  return '<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<title>' + esc(pageTitle) + '</title>\n' +
    '<style>\n' +
    'body{margin:0;padding:20px;background:#f7f4ff;font:15px/1.7 "Times New Roman",Cambria,Georgia,serif;color:#111}\n' +
    '.top-bar{max-width:210mm;margin:0 auto 14px;padding:12px 16px;background:#fff;border:1.5px solid #c4b5fd;border-radius:12px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;font-family:system-ui,sans-serif}\n' +
    '.pbtn{background:#6d5dfc;color:#fff;border:0;border-radius:9px;padding:10px 16px;font-weight:700;font-size:15px;cursor:pointer}\n' +
    '.sheet-preview{background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:22px 26px;max-width:210mm;margin:0 auto}\n' +
    '.sheet-preview li{margin:7px 0;line-height:1.8}\n' +
    '.sheet-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}\n' +
    '.sheet-meta{font-size:.9rem;color:#333}\n' +
    '.sheet-code{font-family:Consolas,monospace;font-weight:700;border:1.5px solid #111;padding:3px 8px;border-radius:4px;font-size:.92rem;white-space:nowrap}\n' +
    '.sheet-sec-head{font-weight:700;font-size:1rem;padding:5px 10px;margin:10px 0 8px;background:#f3f0ff;border-left:4px solid #6d5dfc}\n' +
    '.sheet-types-box{margin:10px 0 14px;padding:10px 14px;border:1px solid #a5b4fc;border-radius:6px;background:#faf8ff}\n' +
    '.sheet-ptype{margin:6px 0;line-height:1.68;page-break-inside:avoid}\n' +
    '.sheet-q{margin:12px 0;page-break-inside:avoid}\n' +
    '.sheet-opts{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin:5px 0 0 18px}\n' +
    '.sheet-lines{margin-top:8px}.sheet-lines div{border-bottom:1px dotted #888;height:24px}\n' +
    '.sheet-ans{margin:4px 0 0 18px;color:#111;line-height:1.8}\n' +
    '.sheet-page-break{margin:28px 0;padding-top:20px;border-top:2px dashed #94a3b8;page-break-before:always;break-before:page}\n' +
    mathCss + '\n' +
    '@media print{@page{size:A4;margin:14mm}body{background:#fff;padding:0}.top-bar{display:none!important}.sheet-preview{border:0;padding:0;max-width:none}.sheet-page-break{border-top:0;margin:0;padding:0;page-break-before:always;break-before:page}}\n' +
    '</style>\n</head>\n<body>\n' +
    '<div class="top-bar"><div><b>SciBook</b> · Mã đề: <b>' + esc(spec.code) + '</b><div style="font-size:13px;color:#555;margin-top:2px">Bấm nút màu tím bên cạnh để in ra máy in hoặc chọn Save as PDF (Lưu dưới dạng PDF).</div></div>' +
    '<button class="pbtn" onclick="window.print()">In ra giấy / Lưu thành PDF</button></div>\n' +
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
  prepare: function(opts){
    var classify = (window.KHTNBank && typeof window.KHTNBank.classifySection === 'function')
      ? window.KHTNBank.classifySection
      : function(q){ return (q && q.n == null && (!q.d || q.d <= 2)) ? 'lt' : 'bt'; };

    var items = (opts.items || []).map(function(it){
      var qCopy = JSON.parse(JSON.stringify(it.q));
      return {
        topicTitle: it.topicTitle || '',
        sec: it.sec || classify(qCopy, qCopy.d),
        q: qCopy,
        choices: qCopy.o ? shuffleCopy(qCopy.o) : null
      };
    });

    var lessonCopy = null;
    if (opts.lesson) {
      var lTypes = (window.KHTN_TYPES && window.KHTN_TYPES[opts.lesson.id]) ? window.KHTN_TYPES[opts.lesson.id] : null;
      lessonCopy = {
        id: opts.lesson.id,
        grade: opts.lesson.grade,
        title: opts.lesson.title,
        theory: (opts.lesson.theory || []).slice(),
        formulas: (opts.lesson.formulas || []).slice(),
        examples: opts.lesson.examples ? JSON.parse(JSON.stringify(opts.lesson.examples)) : null,
        types: lTypes ? JSON.parse(JSON.stringify(lTypes)) : null
      };
    }

    var pTypes = opts.problemTypes ? JSON.parse(JSON.stringify(opts.problemTypes)) : null;
    if (!pTypes && lessonCopy && lessonCopy.types) {
      pTypes = [{ title: lessonCopy.title, types: lessonCopy.types }];
    }

    var spec = {
      code: opts.code || makeCode(opts.prefix),
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }),
      docTitle: opts.docTitle || '',
      subtitle: opts.subtitle || 'Khoa học tự nhiên THCS (GDPT 2018)',
      minutes: opts.minutes || null,
      isExam: !!opts.isExam,
      lesson: lessonCopy,
      problemTypes: pTypes,
      formulaGroups: opts.formulaGroups ? JSON.parse(JSON.stringify(opts.formulaGroups)) : null,
      items: items
    };
    if (!spec.formulaGroups && spec.items.length) {
      saveSnapshotToHistory(spec);
    }
    return spec;
  },

  open: function(initialSpec, initialMode, opts){
    opts = opts || {};
    var spec = initialSpec;
    var mode = initialMode || (spec.formulaGroups ? 'formulas' : 'both');
    var includeTypes = !spec.isExam;

    var modal = document.getElementById('print-modal');
    var printRoot = document.getElementById('print-root');
    if (!modal || !printRoot) return;

    function render(){
      var sheetHtml = buildSheetHtml(spec, mode, includeTypes);
      printRoot.innerHTML = sheetHtml;
      var history = loadHistory();

      var modeBtns = '';
      if (spec.formulaGroups) {
        modeBtns = '<button type="button" class="btn sm on" data-mode="formulas">Sổ tay công thức &amp; dạng bài</button>';
      } else {
        modeBtns +=
          '<button type="button" class="btn sm ' + (mode === 'both' ? 'on' : 'subtle') + '" data-mode="both">1+2. Gộp Đề + Đáp án (Khác trang)</button>' +
          '<button type="button" class="btn sm ' + (mode === 'quiz' ? 'on' : 'subtle') + '" data-mode="quiz">1. Chỉ tờ Đề bài</button>' +
          '<button type="button" class="btn sm ' + (mode === 'key' ? 'on' : 'subtle') + '" data-mode="key">2. Chỉ tờ Đáp án</button>';
        if (spec.lesson) {
          modeBtns += '<button type="button" class="btn sm ' + (mode === 'study' ? 'on' : 'subtle') + '" data-mode="study">Lý thuyết + Dạng bài + Đề + Đáp án</button>';
        }
      }

      var canToggleTypes = false;
      if (mode === 'formulas' && spec.formulaGroups && spec.formulaGroups.some(function(g){ return g.types && g.types.length; })) {
        canToggleTypes = true;
      } else if ((mode === 'quiz' || mode === 'both') && spec.problemTypes && spec.problemTypes.length) {
        canToggleTypes = true;
      }

      var typesToggleHtml = canToggleTypes
        ? '<label class="row" style="font-size:.85rem;font-weight:650;cursor:pointer;padding:5px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--line)">' +
            '<input type="checkbox" id="toggle-pdf-types"' + (includeTypes ? ' checked' : '') + '> ' +
            (spec.isExam ? 'Kèm Các dạng bài &amp; Ví dụ mẫu (tùy chọn)' : 'Kèm Các dạng bài &amp; Ví dụ mẫu') +
          '</label>'
        : '';

      var historySelect = '';
      if (!spec.formulaGroups && history.length > 1) {
        historySelect = '<select id="snap-hist" style="padding:6px 9px;font-size:.84rem;border-radius:8px" title="Mở lại mã đề đã tạo trước đó">' +
          history.map(function(h){
            return '<option value="' + esc(h.code) + '"' + (h.code === spec.code ? ' selected' : '') + '>' +
              'Đề cũ: ' + esc(h.code) + ' (' + h.items.length + ' câu · ' + esc(h.createdAt || '') + ')' +
            '</option>';
          }).join('') +
        '</select>';
      }

      modal.innerHTML =
        '<div class="modal-card">' +
          '<div class="modal-head">' +
            '<div class="row">' +
              '<b id="print-modal-title">Xem trước &amp; In giấy A4 / Lưu PDF</b>' +
              '<span class="badge pri">Mã đề: ' + esc(spec.code) + '</span>' +
              historySelect +
              (typeof opts.onRegenerate === 'function' ? '<button type="button" class="btn sm subtle" data-act="regen">Đổi mã đề mới</button>' : '') +
            '</div>' +
            '<div class="row">' +
              '<button type="button" class="btn sm subtle" data-act="close">✕ Đóng</button>' +
            '</div>' +
          '</div>' +
          '<div class="print-guide">' +
            '<b>Hướng dẫn:</b> Bấm nút <b>In ra giấy / Lưu thành PDF</b> bên dưới. ' +
            'Nếu muốn lưu thành file PDF, ở mục <b>Máy in (Destination)</b> chọn <b>Save as PDF (Lưu dưới dạng PDF)</b> rồi bấm <b>Lưu</b>.' +
          '</div>' +
          '<div style="padding:10px 18px;border-bottom:1px solid var(--line);background:var(--card);display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center">' +
            '<div class="row">' + modeBtns + typesToggleHtml + '</div>' +
            '<div class="row">' +
              '<button type="button" class="btn" data-act="print">In ra giấy / Lưu thành PDF</button>' +
              (!spec.formulaGroups
                ? '<button type="button" class="btn sm alt" data-act="dl-both" title="Tải riêng 2 tệp về máy để mở khi không có mạng">Tải 2 tệp riêng</button>'
                : '') +
            '</div>' +
          '</div>' +
          '<div class="modal-body">' + sheetHtml + '</div>' +
        '</div>';

      modal.querySelectorAll('[data-mode]').forEach(function(b){
        b.onclick = function(){ mode = b.dataset.mode; render(); };
      });
      var chkTypes = modal.querySelector('#toggle-pdf-types');
      if (chkTypes) {
        chkTypes.onchange = function(){
          includeTypes = chkTypes.checked;
          render();
        };
      }
      modal.querySelector('[data-act="print"]').onclick = function(){ window.print(); };
      modal.querySelector('[data-act="close"]').onclick = close;

      var btnBoth = modal.querySelector('[data-act="dl-both"]');
      if (btnBoth) {
        btnBoth.onclick = function(){
          var fileQuiz = buildStandaloneDownloadFile(spec, 'quiz', includeTypes);
          var fileKey = buildStandaloneDownloadFile(spec, 'key', false);
          triggerDownload('1-TO-DE-BAI_' + spec.code + '.html', fileQuiz);
          setTimeout(function(){
            triggerDownload('2-TO-DAP-AN_' + spec.code + '.html', fileKey);
          }, 250);
        };
      }

      var btnRegen = modal.querySelector('[data-act="regen"]');
      if (btnRegen && typeof opts.onRegenerate === 'function') {
        btnRegen.onclick = function(){
          spec = opts.onRegenerate();
          includeTypes = !spec.isExam;
          render();
        };
      }

      var histEl = modal.querySelector('#snap-hist');
      if (histEl) {
        histEl.onchange = function(){
          var found = loadHistory().find(function(x){ return x.code === histEl.value; });
          if (found) { spec = found; includeTypes = !spec.isExam; render(); }
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
