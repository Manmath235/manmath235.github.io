(function(){
  /* Tabs + clickable diagram marks. Buttons [role=tab], panels [role=tabpanel],
     and any [data-i] element (e.g. SVG rings/nodes) stay in sync by index. */
  function initTabs(root){
    var tabs=[].slice.call(root.querySelectorAll('[role=tab]'));
    var panels=[].slice.call(root.querySelectorAll('[role=tabpanel]'));
    var marks=[].slice.call(root.querySelectorAll('[data-i]:not([role=tab])'));
    if(!tabs.length) return;
    function select(i,focus){
      tabs.forEach(function(t,k){
        var on=k===i; t.setAttribute('aria-selected',on?'true':'false'); t.tabIndex=on?0:-1; t.classList.toggle('on',on);
        if(on&&focus) t.focus();
      });
      panels.forEach(function(p,k){ p.hidden=k!==i; });
      marks.forEach(function(m){ m.classList.toggle('on',+m.getAttribute('data-i')===i); });
    }
    tabs.forEach(function(t,k){
      t.addEventListener('click',function(){ select(k); });
      t.addEventListener('keydown',function(e){
        var n=tabs.length;
        if(e.key==='ArrowDown'||e.key==='ArrowRight'){ e.preventDefault(); select((k+1)%n,true); }
        else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){ e.preventDefault(); select((k+n-1)%n,true); }
      });
    });
    marks.forEach(function(m){
      m.addEventListener('click',function(){ select(+m.getAttribute('data-i')); });
      m.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); select(+m.getAttribute('data-i')); } });
    });
    select(0);
  }
  document.querySelectorAll('[data-tabs]').forEach(initTabs);

  /* Prompt builder: five fields assemble into one colour-coded prompt */
  var b=document.getElementById('builder');
  if(b){
    var f=[].slice.call(b.querySelectorAll('textarea')), out=b.querySelector('.bout');
    var defaults=f.map(function(t){ return t.value; });
    var labels=['You are','Context:','Task:','Format:','Constraints:'], colors=['#046A38','#E34222','#046A38','#E34222','#046A38'];
    function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
    function render(){
      out.innerHTML=f.map(function(t,i){
        var v=t.value.trim().replace(/\s*\.\s*$/,'');
        return '<em style="color:'+colors[i]+'">'+labels[i]+'</em> '+(v?esc(v):'...')+'.';
      }).join('\n');
    }
    f.forEach(function(t){ t.addEventListener('input',render); });
    b.querySelector('[data-reset]').addEventListener('click',function(){ f.forEach(function(t,i){ t.value=defaults[i]; }); render(); });
    var cp=b.querySelector('[data-copy]');
    cp.addEventListener('click',function(){
      var txt=out.textContent, done=function(){ cp.textContent='Copied'; setTimeout(function(){ cp.textContent='Copy prompt'; },1600); };
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done,function(){});
      else { var r=document.createRange(); r.selectNodeContents(out); var s=getSelection(); s.removeAllRanges(); s.addRange(r); try{document.execCommand('copy');done();}catch(e){} }
    });
    render();
  }
})();
