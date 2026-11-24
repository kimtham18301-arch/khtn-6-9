(function(){
'use strict';
var D=window.KHTN, app=document.getElementById('app');
var SUBJ={hoa:'Hóa học',ly:'Vật lí',sinh:'Sinh học',td:'Trái Đất & chung'};
var byId={};D.forEach(function(t){byId[t.id]=t});
var KEY='khtn-progress-v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function save(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function best(id){var p=load()[id];return p?p.best:null}
function tag(s){return '<span class="tag '+s+'">'+SUBJ[s]+'</span>'}
function pct(list){var d=0;list.forEach(function(t){var b=best(t.id);if(b!=null&&b>=0.67)d++});return list.length?Math.round(d/list.length*100):0}

function home(){
  var h='<section class="hero"><h1>Tự học Khoa học tự nhiên 6 – 9</h1><p>Nắm chắc từng bài, không mất gốc: lý thuyết ngắn, công thức, bài luyện có lời giải, và bài kiểm tra nền chỉ ra phần cần ôn lại.</p><a class="btn" href="#/kiem-tra/8">Kiểm tra nền trước khi lên lớp</a></section><div class="grid">';
  [6,7,8,9].forEach(function(g){var l=D.filter(function(t){return t.grade===g});
    h+='<a class="card" href="#/lop/'+g+'"><h2>Lớp '+g+'</h2><div class="muted">'+l.length+' bài · '+l.reduce(function(s,t){return s+t.questions.length},0)+' câu luyện</div><div class="bar"><i style="width:'+pct(l)+'%"></i></div><small>Hoàn thành '+pct(l)+'%</small></a>'});
  h+='</div><h2>Lộ trình gợi ý</h2><ul class="tight"><li><b>Ôn nền:</b> làm bài kiểm tra nền của lớp sắp học; bài sai sẽ có liên kết tới kiến thức cần ôn.</li><li><b>Học tiếp:</b> mỗi bài đọc lý thuyết – ghi công thức – làm câu luyện; đạt từ 67% thì tính là xong.</li><li><b>Sổ tay:</b> tra nhanh công thức toàn cấp 2.</li></ul>';
  app.innerHTML=h}

function grade(g,f){
  var l=D.filter(function(t){return t.grade===g});
  var h='<div class="crumb"><a href="#/">Trang chủ</a></div><h1>Khoa học tự nhiên lớp '+g+'</h1><div class="bar"><i style="width:'+pct(l)+'%"></i></div><div class="row"><a class="btn alt" href="#/kiem-tra/'+g+'">Kiểm tra nền lớp '+g+'</a></div><div class="filters">';
  ['all'].concat(Object.keys(SUBJ)).forEach(function(s){h+='<button data-s="'+s+'" class="'+((f||'all')===s?'on':'')+'">'+(s==='all'?'Tất cả':SUBJ[s])+'</button>'});
  h+='</div><div class="grid">';
  l.filter(function(t){return !f||f==='all'||t.subj===f}).forEach(function(t){var b=best(t.id);
    h+='<a class="card" href="#/bai/'+t.id+'">'+tag(t.subj)+'<h2 style="margin:.3em 0">'+esc(t.title)+'</h2><div class="muted">'+t.questions.length+' câu luyện</div>'+(b==null?'':'<div class="'+(b>=0.67?'done':'muted')+'">Điểm tốt nhất: '+Math.round(b*100)+'%'+(b>=0.67?' ✓':'')+'</div>')+'</a>'});
  h+='</div>';app.innerHTML=h;
  app.querySelectorAll('.filters button').forEach(function(b){b.onclick=function(){grade(g,b.dataset.s)}})}

function renderQ(q,i,onAns){
  var box=document.createElement('div');box.className='q';
  var h='<b>Câu '+(i+1)+'.</b> '+esc(q.q);
  if(q.o){q._s=q._s||shuffle(q.o);q._s.forEach(function(o){h+='<button class="opt">'+esc(o)+'</button>'})}
  else h+='<div class="num"><input type="text" inputmode="decimal" placeholder="Nhập số"> <span>'+esc(q.u||'')+'</span><button class="btn">Kiểm tra</button></div>';
  h+='<div class="fb" hidden></div>';box.innerHTML=h;
  var fb=box.querySelector('.fb'),done=false;
  function fin(ok){if(done)return;done=true;fb.hidden=false;fb.className='fb '+(ok?'ok':'bad');
    fb.innerHTML=(ok?'✔ Chính xác. ':'✘ Chưa đúng. ')+esc(q.w||'')+(q.o&&!ok?'<br>Đáp án: <b>'+esc(q.o[0])+'</b>':'')+(q.n!=null&&!ok?'<br>Đáp án: <b>'+String(q.n).replace('.',',')+' '+esc(q.u||'')+'</b>':'');
    box.querySelectorAll('button,input').forEach(function(x){x.disabled=true});onAns(ok)}
  if(q.o)box.querySelectorAll('.opt').forEach(function(b){b.onclick=function(){var ok=b.textContent===q.o[0];b.classList.add(ok?'ok':'bad');if(!ok)box.querySelectorAll('.opt').forEach(function(x){if(x.textContent===q.o[0])x.classList.add('ok')});fin(ok)}});
  else{var inp=box.querySelector('input');box.querySelector('.btn').onclick=function(){var v=parseFloat(inp.value.replace(',','.'));if(isNaN(v)){inp.focus();return}fin(Math.abs(v-q.n)<=(q.t||0)+1e-9)};inp.onkeydown=function(e){if(e.key==='Enter')box.querySelector('.btn').click()}}
  return box}

function pad(){
  var w=document.createElement('div');w.innerHTML='<h2>Bảng nháp</h2><canvas class="pad"></canvas><div class="row"><button class="btn alt" id="pe">Bút</button><button class="btn alt" id="er">Tẩy</button><button class="btn alt" id="cl">Xóa hết</button></div>';
  var c=w.querySelector('canvas'),x=c.getContext('2d'),draw=false,mode='pen';
  function fit(){var r=c.getBoundingClientRect();c.width=r.width*2;c.height=r.height*2;x.scale(2,2);x.lineCap='round'}
  setTimeout(fit,0);
  function pos(e){var r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
  c.onpointerdown=function(e){draw=true;c.setPointerCapture(e.pointerId);var p=pos(e);x.beginPath();x.moveTo(p[0],p[1])};
  c.onpointermove=function(e){if(!draw)return;var p=pos(e);x.strokeStyle=mode==='pen'?'#111':'#fff';x.lineWidth=mode==='pen'?2:18;x.lineTo(p[0],p[1]);x.stroke()};
  c.onpointerup=function(){draw=false};
  w.querySelector('#pe').onclick=function(){mode='pen'};w.querySelector('#er').onclick=function(){mode='er'};
  w.querySelector('#cl').onclick=function(){x.clearRect(0,0,c.width,c.height)};
  return w}

function lesson(id){
  var t=byId[id];if(!t){app.innerHTML='<p>Không tìm thấy bài.</p>';return}
  var h='<div class="crumb"><a href="#/">Trang chủ</a> › <a href="#/lop/'+t.grade+'">Lớp '+t.grade+'</a></div>'+tag(t.subj)+' <span class="muted">Lớp '+t.grade+'</span><h1>'+esc(t.title)+'</h1>';
  if(t.prereq.length){h+='<div class="card"><b>Ôn nền trước khi học:</b> '+t.prereq.map(function(p){var b=byId[p];return b?'<a href="#/bai/'+p+'">'+esc(b.title)+' (lớp '+b.grade+')</a>':''}).join(' · ')+'</div>'}
  h+='<h2>Kiến thức cần nhớ</h2><ul class="tight">'+t.theory.map(function(s){return'<li>'+esc(s)+'</li>'}).join('')+'</ul><h2>Công thức & ghi nhớ</h2>'+t.formulas.map(function(f){return'<div class="formula">'+esc(f)+'</div>'}).join('')+'<h2>Luyện tập</h2><div id="qs"></div><div id="res"></div><div id="padw"></div>';
  app.innerHTML=h;
  var qs=document.getElementById('qs'),right=0,answered=0;
  t.questions.forEach(function(q,i){qs.appendChild(renderQ(q,i,function(ok){answered++;if(ok)right++;
    if(answered===t.questions.length){var s=right/t.questions.length,p=load();p[id]=p[id]||{};if(p[id].best==null||s>p[id].best)p[id].best=s;p[id].last=s;save(p);
      var r=document.getElementById('res');r.className='card';r.innerHTML='<b>Kết quả: '+right+'/'+t.questions.length+' ('+Math.round(s*100)+'%)</b><p>'+(s>=0.67?'Tốt! Bạn đã nắm bài này.':'Hãy đọc lại lý thuyết phía trên, ôn các bài nền rồi làm lại.')+'</p><button class="btn" id="again">Làm lại</button>';
      document.getElementById('again').onclick=function(){t.questions.forEach(function(q){q._s=null});lesson(id)}}}))});
  document.getElementById('padw').appendChild(pad())}

function placement(g){
  var pool=D.filter(function(t){return t.grade<g||(g===6&&t.grade===6)});
  var picks=[];pool.forEach(function(t){picks.push({t:t,q:t.questions[Math.floor(Math.random()*t.questions.length)]})});
  picks=shuffle(picks).slice(0,12);
  var h='<div class="crumb"><a href="#/">Trang chủ</a></div><h1>Kiểm tra nền cho lớp '+g+'</h1><p class="muted">'+picks.length+' câu từ kiến thức các lớp trước. Sau khi làm xong, hệ thống chỉ ra bài cần ôn.</p><div id="qs"></div><div id="res"></div>';
  app.innerHTML=h;var qs=document.getElementById('qs'),n=0,weak=[];
  picks.forEach(function(p,i){qs.appendChild(renderQ(p.q,i,function(ok){n++;if(!ok)weak.push(p.t);
    if(n===picks.length){var r=document.getElementById('res');r.className='card';
      r.innerHTML=weak.length?'<b>Đúng '+(picks.length-weak.length)+'/'+picks.length+'. Cần ôn lại:</b><ul>'+weak.map(function(t){return'<li><a href="#/bai/'+t.id+'">'+esc(t.title)+'</a> (lớp '+t.grade+')</li>'}).join('')+'</ul>':'<b>Tuyệt vời! Bạn nắm vững nền tảng.</b>';
      r.innerHTML+='<button class="btn" id="re">Làm đề khác</button>';document.getElementById('re').onclick=function(){placement(g)}}}))})}

function notebook(){
  var h='<h1>Sổ tay công thức</h1><input type="search" id="s" placeholder="Tìm công thức, chủ đề…"><div id="list"></div>';app.innerHTML=h;
  function show(q){q=(q||'').toLowerCase();var out='';D.forEach(function(t){var hit=t.formulas.filter(function(f){return !q||(f+' '+t.title).toLowerCase().indexOf(q)>-1});
    if(hit.length)out+='<div class="card" style="margin:8px 0">'+tag(t.subj)+' <a href="#/bai/'+t.id+'"><b>Lớp '+t.grade+' – '+esc(t.title)+'</b></a>'+hit.map(function(f){return'<div class="formula">'+esc(f)+'</div>'}).join('')+'</div>'});
    document.getElementById('list').innerHTML=out||'<p>Không có kết quả.</p>'}
  show();document.getElementById('s').oninput=function(e){show(e.target.value)}}

function progress(){
  var p=load(),h='<h1>Tiến độ học tập</h1>';
  [6,7,8,9].forEach(function(g){var l=D.filter(function(t){return t.grade===g});h+='<div class="card" style="margin:8px 0"><b>Lớp '+g+'</b> – '+pct(l)+'%<div class="bar"><i style="width:'+pct(l)+'%"></i></div></div>'});
  var weak=D.filter(function(t){var b=best(t.id);return b!=null&&b<0.67});
  h+='<h2>Bài cần ôn lại</h2>'+(weak.length?'<ul>'+weak.map(function(t){return'<li><a href="#/bai/'+t.id+'">'+esc(t.title)+'</a> (lớp '+t.grade+')</li>'}).join('')+'</ul>':'<p class="muted">Chưa có bài nào dưới 67%.</p>');
  h+='<p><button class="btn alt" id="rs">Xóa toàn bộ tiến độ</button></p>';app.innerHTML=h;
  document.getElementById('rs').onclick=function(){if(confirm('Xóa toàn bộ tiến độ trên thiết bị này?')){save({});progress()}}}

function route(){
  var m=location.hash.replace(/^#\/?/,'').split('/');
  if(m[0]==='lop')grade(+m[1]);else if(m[0]==='bai')lesson(m[1]);else if(m[0]==='kiem-tra')placement(+m[1]);
  else if(m[0]==='so-tay')notebook();else if(m[0]==='tien-do')progress();else home();
  window.scrollTo(0,0)}
window.addEventListener('hashchange',route);route();
})();
