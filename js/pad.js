(function(){
'use strict';

// Vector-stroke scratchpad: supports Apple Pencil, touch, mouse; undo; crisp redraw on resize; JSON persistence.
window.KHTNPad = {
  create: function(opts){
    opts = opts || {};
    var strokes = Array.isArray(opts.initialStrokes) ? opts.initialStrokes.slice() : [];
    var onChange = typeof opts.onChange === 'function' ? opts.onChange : function(){};
    var mode = 'pen'; // 'pen' | 'eraser'
    var color = '#111827';
    var penSize = 2.2;
    var eraserSize = 18;
    var drawing = false;
    var current = null;

    var box = document.createElement('section');
    box.className = 'pad-box';
    box.innerHTML =
      '<div class="pad-top">' +
        '<h2>Trang Vở Nháp</h2>' +
        '<span class="muted" style="font-size:.82rem" id="pad-hint">Viết bút, ngón tay hoặc chuột</span>' +
      '</div>' +
      '<div class="pad-wrap"><canvas class="pad" aria-label="Bảng nháp vẽ tay"></canvas></div>' +
      '<div class="pad-tools">' +
        '<button type="button" class="btn sm on" data-tool="pen">Bút</button>' +
        '<button type="button" class="btn sm subtle" data-tool="eraser">Tẩy</button>' +
        '<button type="button" class="swatch on" data-color="#111827" style="background:#111827" title="Mực đen" aria-label="Mực đen"></button>' +
        '<button type="button" class="swatch" data-color="#1b66c9" style="background:#1b66c9" title="Mực xanh" aria-label="Mực xanh"></button>' +
        '<button type="button" class="swatch" data-color="#c43434" style="background:#c43434" title="Mực đỏ" aria-label="Mực đỏ"></button>' +
        '<button type="button" class="btn sm subtle" data-act="undo" disabled>Hoàn tác</button>' +
        '<button type="button" class="btn sm subtle" data-act="clear" disabled>Xóa hết</button>' +
      '</div>';

    var canvas = box.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var btnPen = box.querySelector('[data-tool="pen"]');
    var btnEraser = box.querySelector('[data-tool="eraser"]');
    var btnUndo = box.querySelector('[data-act="undo"]');
    var btnClear = box.querySelector('[data-act="clear"]');
    var swatches = box.querySelectorAll('.swatch');

    function cssSize(){
      var r = canvas.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    }

    function updateButtons(){
      btnPen.className = 'btn sm ' + (mode === 'pen' ? 'on' : 'subtle');
      btnEraser.className = 'btn sm ' + (mode === 'eraser' ? 'on' : 'subtle');
      canvas.classList.toggle('erasing', mode === 'eraser');
      btnUndo.disabled = strokes.length === 0;
      btnClear.disabled = strokes.length === 0;
      swatches.forEach(function(s){
        s.classList.toggle('on', mode === 'pen' && s.dataset.color === color);
      });
    }

    function drawStroke(st, w, h){
      if (!st.pts || !st.pts.length) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = st.mode === 'eraser' ? '#ffffff' : (st.color || '#111827');
      ctx.lineWidth = st.size || penSize;
      ctx.beginPath();
      var p0 = st.pts[0];
      ctx.moveTo(p0[0] * w, p0[1] * h);
      if (st.pts.length === 1) {
        ctx.lineTo(p0[0] * w + 0.1, p0[1] * h + 0.1);
      } else {
        for (var i = 1; i < st.pts.length; i++) {
          ctx.lineTo(st.pts[i][0] * w, st.pts[i][1] * h);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    function redraw(){
      var sz = cssSize();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pw = Math.round(sz.w * dpr);
      var ph = Math.round(sz.h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sz.w, sz.h);
      for (var i = 0; i < strokes.length; i++) {
        drawStroke(strokes[i], sz.w, sz.h);
      }
    }

    function normPos(e){
      var r = canvas.getBoundingClientRect();
      var w = Math.max(1, r.width), h = Math.max(1, r.height);
      return [
        Math.round(((e.clientX - r.left) / w) * 10000) / 10000,
        Math.round(((e.clientY - r.top) / h) * 10000) / 10000
      ];
    }

    canvas.addEventListener('pointerdown', function(e){
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      var pt = normPos(e);
      current = {
        mode: mode,
        color: color,
        size: mode === 'eraser' ? eraserSize : penSize,
        pts: [pt]
      };
      strokes.push(current);
      redraw();
      updateButtons();
    });

    canvas.addEventListener('pointermove', function(e){
      if (!drawing || !current) return;
      var pt = normPos(e);
      var last = current.pts[current.pts.length - 1];
      if (Math.abs(pt[0] - last[0]) + Math.abs(pt[1] - last[1]) < 0.0015) return;
      current.pts.push(pt);
      var sz = cssSize();
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = current.mode === 'eraser' ? '#ffffff' : current.color;
      ctx.lineWidth = current.size;
      ctx.beginPath();
      ctx.moveTo(last[0] * sz.w, last[1] * sz.h);
      ctx.lineTo(pt[0] * sz.w, pt[1] * sz.h);
      ctx.stroke();
      ctx.restore();
    });

    function endDraw(){
      if (!drawing) return;
      drawing = false;
      current = null;
      if (strokes.length > 250) strokes = strokes.slice(-250);
      onChange(strokes);
    }
    canvas.addEventListener('pointerup', endDraw);
    canvas.addEventListener('pointercancel', endDraw);

    btnPen.onclick = function(){ mode = 'pen'; updateButtons(); };
    btnEraser.onclick = function(){ mode = 'eraser'; updateButtons(); };
    swatches.forEach(function(s){
      s.onclick = function(){
        color = s.dataset.color;
        mode = 'pen';
        updateButtons();
      };
    });
    btnUndo.onclick = function(){
      if (!strokes.length) return;
      strokes.pop();
      redraw();
      updateButtons();
      onChange(strokes);
    };
    btnClear.onclick = function(){
      if (!strokes.length) return;
      strokes = [];
      redraw();
      updateButtons();
      onChange(strokes);
    };

    var ro = null;
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(function(){ redraw(); });
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', redraw);
    }
    requestAnimationFrame(function(){ redraw(); updateButtons(); });

    box._destroy = function(){
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', redraw);
    };
    box.getStrokes = function(){ return strokes; };
    return box;
  }
};
})();
