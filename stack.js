(function(){
  /* Stacked card carousel: the front card is full size, the next cards peek out
     behind it on the right, each a little shorter. Swipe, arrows, dots or click a
     peeking card to move. */
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-stack]').forEach(init);

  function init(root){
    root.classList.add('stack');
    var all = [].slice.call(root.children);
    all.forEach(function(el){
      el.classList.add('stack-item');
      [].forEach.call(el.querySelectorAll('a,button,[tabindex]'), function(f){
        f.setAttribute('data-ti', f.hasAttribute('tabindex') ? f.getAttribute('tabindex') : '');
      });
      [].forEach.call(el.querySelectorAll('.pcard-name .nm'), function(n){ n.textContent = n.textContent.replace(/-/g,' '); });
    });
    var visible = all.slice(), idx = 0, moved = false;

    var ctl = document.createElement('div'); ctl.className = 'stack-ctl';
    ctl.innerHTML = '<button type="button" class="sc-b" data-prev aria-label="Previous card"><i class="bi bi-chevron-left"></i></button>'
      + '<div class="sc-dots" role="tablist" aria-label="Choose a card"></div>'
      + '<button type="button" class="sc-b" data-next aria-label="Next card"><i class="bi bi-chevron-right"></i></button>'
      + '<span class="sc-count" aria-live="polite"></span>';
    root.insertAdjacentElement('afterend', ctl);
    var dots = ctl.querySelector('.sc-dots'), count = ctl.querySelector('.sc-count');

    function setFocusable(el, on){
      [].forEach.call(el.querySelectorAll('[data-ti]'), function(f){
        if(on){ var v = f.getAttribute('data-ti'); if(v === '') f.removeAttribute('tabindex'); else f.setAttribute('tabindex', v); }
        else f.setAttribute('tabindex', '-1');
      });
    }

    function render(){
      var n = visible.length; if(idx > n-1) idx = n-1; if(idx < 0) idx = 0;
      all.forEach(function(el){ if(visible.indexOf(el) < 0){ el.hidden = true; } else { el.hidden = false; } });
      visible.forEach(function(el, k){
        var d = k - idx;
        el.setAttribute('data-tone', (k % 2) ? 'o' : 'g');
        el.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
        setFocusable(el, d === 0);
        if(d < 0){
          el.style.transform = 'translateX(-5%) scale(.96)'; el.style.opacity = '0'; el.style.pointerEvents = 'none'; el.style.zIndex = '0'; el.style.filter = '';
        } else if(d <= 3){
          el.style.transform = d === 0 ? 'none' : 'translateX(calc(var(--peek) * ' + d + ')) scaleY(' + (1 - d*0.09).toFixed(2) + ')';
          el.style.opacity = d === 0 ? '1' : String(1 - d*0.12); el.style.pointerEvents = ''; el.style.zIndex = String(10 - d);
          el.style.filter = d === 0 ? '' : 'brightness(' + (1 - d*0.08).toFixed(2) + ')';
        } else {
          el.style.transform = 'translateX(calc(var(--peek) * 3)) scaleY(.7)'; el.style.opacity = '0'; el.style.pointerEvents = 'none'; el.style.zIndex = '0';
        }
      });
      dots.innerHTML = '';
      if(n <= 14){
        visible.forEach(function(el, k){
          var b = document.createElement('button'); b.type = 'button'; b.className = 'sc-dot' + (k === idx ? ' on' : '');
          b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', k === idx ? 'true' : 'false'); b.setAttribute('aria-label', 'Card ' + (k+1) + ' of ' + n);
          b.addEventListener('click', function(){ go(k); });
          dots.appendChild(b);
        });
      }
      count.textContent = (idx+1) + ' / ' + n;
      ctl.querySelector('[data-prev]').disabled = idx === 0;
      ctl.querySelector('[data-next]').disabled = idx === n-1;
      ctl.style.display = n > 1 ? '' : 'none';
    }
    function go(k){ idx = k; render(); }

    ctl.querySelector('[data-prev]').addEventListener('click', function(){ go(idx-1); });
    ctl.querySelector('[data-next]').addEventListener('click', function(){ go(idx+1); });

    /* click a peeking card to bring it forward (and do not trigger what is inside it) */
    root.addEventListener('click', function(e){
      var it = e.target.closest ? e.target.closest('.stack-item') : null;
      if(!it) return;
      var k = visible.indexOf(it);
      if(moved || (k !== idx && k > -1)){
        e.preventDefault(); e.stopPropagation();
        if(!moved && k > -1) go(k);
      }
    }, true);
    root.addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight'){ e.preventDefault(); go(Math.min(idx+1, visible.length-1)); }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); go(Math.max(idx-1, 0)); }
    });

    /* swipe */
    var sx = 0, sy = 0, down = false;
    root.addEventListener('pointerdown', function(e){ down = true; sx = e.clientX; sy = e.clientY; moved = false; });
    root.addEventListener('pointerup', function(e){
      if(!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)*1.3){
        moved = true; go(dx < 0 ? Math.min(idx+1, visible.length-1) : Math.max(idx-1, 0));
        setTimeout(function(){ moved = false; }, 60);
      }
    });
    root.addEventListener('pointercancel', function(){ down = false; });

    /* optional filter bar (projects) */
    var bar = root.getAttribute('data-filter-bar') && document.getElementById(root.getAttribute('data-filter-bar'));
    if(bar){
      [].forEach.call(bar.querySelectorAll('.pf-btn'), function(btn){
        btn.addEventListener('click', function(){
          var f = btn.getAttribute('data-filter');
          visible = all.filter(function(el){ return f === 'all' || el.getAttribute('data-group') === f; });
          idx = 0; render();
        });
      });
    }
    render();
  }
})();
