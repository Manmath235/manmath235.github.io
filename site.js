(function(){
  "use strict";
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width:820px)').matches;
  var clamp = function(v,a,b){ return v<a?a:(v>b?b:v); };
  var lerp = function(a,b,t){ return a+(b-a)*t; };

  /* ---------- EXPERIENCE AUTOMATION (auto-calculated years) ---------- */
  function calcExp(){
    var start = new Date(2023, 2, 1);            // 1 March 2023
    var y = (Date.now() - start.getTime()) / (365.25 * 24 * 3600 * 1000);
    return Math.max(1, Math.floor(y)) + '+';
  }
  var expStr = calcExp();
  ['yrsStat','yrsMetric'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.textContent = expStr;
  });
  var yrEl = document.getElementById('yr'); if(yrEl) yrEl.textContent = new Date().getFullYear();

  /* ---------- DOCK (bottom navigation) ---------- */
  var pill=document.getElementById('dockPill'), chev=document.getElementById('dockChev');
  if(pill && chev){
    chev.addEventListener('click', function(){
      var c=pill.classList.toggle('collapsed');
      chev.setAttribute('aria-expanded', c?'false':'true');
      chev.setAttribute('aria-label', c?'Show quick links':'Collapse quick links');
    });
  }

  /* ---------- NAV ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger'), navLinks = document.getElementById('navLinks');
  if(burger && navLinks){
    burger.setAttribute('aria-expanded','false');
    burger.addEventListener('click', function(){
      var open = navLinks.classList.toggle('show');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ navLinks.classList.remove('show'); burger.setAttribute('aria-expanded','false'); }); });
  }

  /* ---------- HERO NAME (solid wordmark) ---------- */
  document.querySelectorAll('.hero-name .ln').forEach(function(ln){
    ln.textContent = ln.getAttribute('data-word') || ln.textContent;
  });

  /* ---------- PROCESS SPINE (scroll progress for #about section) ---------- */
  var spine = document.getElementById('spine'), spineFill = document.getElementById('spineFill');
  var psteps = spine ? Array.prototype.slice.call(spine.querySelectorAll('.pstep')) : [];

  function updateSpine(){
    if(!spine || !spineFill) return;
    var r = spine.getBoundingClientRect();
    var p2 = clamp((window.innerHeight*0.72 - r.top) / (r.height || 1), 0, 1);
    spineFill.style.height = (p2*100).toFixed(1)+'%';
    psteps.forEach(function(s,i){ s.classList.toggle('on', p2 >= (i+0.45)/psteps.length); });
  }

  function frame(now){
    updateSpine();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener('scroll', function(){
    if(nav) nav.classList.toggle('shrink', window.scrollY > 40);
  }, {passive:true});

  /* ---------- RADIAL SKILL SYSTEM ---------- */
  var radial = document.getElementById('radial'), rsvg = document.getElementById('radialSvg');
  if(radial && rsvg){
    var nodes = radial.querySelectorAll('.snode');
    var svgns = 'http://www.w3.org/2000/svg';
    nodes.forEach(function(node){
      var a = parseFloat(node.getAttribute('data-a')) * Math.PI/180;
      var r = parseFloat(node.getAttribute('data-r'));            // viewBox units (0-400)
      var vx = 200 + Math.cos(a)*r, vy = 200 + Math.sin(a)*r;
      node.style.left = (vx/4)+'%'; node.style.top = (vy/4)+'%';
      var line = document.createElementNS(svgns,'line');
      line.setAttribute('x1',200); line.setAttribute('y1',200);
      line.setAttribute('x2',vx); line.setAttribute('y2',vy);
      line.setAttribute('stroke','rgba(4,106,56,0.35)');
      line.setAttribute('stroke-width','1');
      line.setAttribute('stroke-dasharray','3 5');
      rsvg.appendChild(line);
    });
    var core = document.createElementNS(svgns,'circle');
    core.setAttribute('cx',200); core.setAttribute('cy',200); core.setAttribute('r',150);
    core.setAttribute('fill','none'); core.setAttribute('stroke','rgba(20,24,36,0.12)'); core.setAttribute('stroke-width','1');
    rsvg.insertBefore(core, rsvg.firstChild);
  }

  /* ---------- REVEALS ---------- */
  if('IntersectionObserver' in window && !RM){
    var rio = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('[data-rv]').forEach(function(el){ rio.observe(el); });
  } else {
    document.querySelectorAll('[data-rv]').forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- SKILL BARS ---------- */
  function fillBars(){ document.querySelectorAll('.skill-bar i').forEach(function(b){ b.style.width = (b.getAttribute('data-w')||0)+'%'; }); }
  var sk = document.getElementById('skills-bars');
  if('IntersectionObserver' in window && sk){
    var sio = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ fillBars(); sio.disconnect(); } }); }, {threshold:0.3});
    sio.observe(sk);
  } else { fillBars(); }

  /* ---------- PROJECT FILTER ---------- */
  var projFilter = document.getElementById('projFilter');
  if(projFilter){
    var groups = document.querySelectorAll('.proj-group');
    projFilter.querySelectorAll('.pf-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var f = btn.getAttribute('data-filter');
        projFilter.querySelectorAll('.pf-btn').forEach(function(b){
          var on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        groups.forEach(function(g){ g.hidden = !(f === 'all' || g.getAttribute('data-group') === f); });
      });
    });
  }

  /* ---------- MODALS (file-drawer FLIP open/close) ---------- */
  var lastOrigin = null;
  var FLIP_OPEN_MS = 560, FLIP_CLOSE_MS = 440;

  function flipRect(sheet, target){
    var r1 = sheet.getBoundingClientRect();
    var dx = target.left + target.width/2 - (r1.left + r1.width/2);
    var dy = target.top + target.height/2 - (r1.top + r1.height/2);
    var sx = Math.max(target.width / r1.width, 0.001);
    var sy = Math.max(target.height / r1.height, 0.001);
    return 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
  }

  function focusableIn(container){
    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
    )).filter(function(el){ return el.offsetParent !== null; });
  }

  function trapTab(e){
    var open = document.querySelector('.ovl.open');
    if(!open || e.key !== 'Tab') return;
    var f = focusableIn(open);
    if(!f.length) return;
    var first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  function openModal(id, originEl){
    var m = document.getElementById(id);
    if(!m) return;
    lastOrigin = originEl || null;
    var sheet = m.querySelector('.sheet');
    document.body.style.overflow = 'hidden';
    m.classList.add('open');
    m.setAttribute('aria-hidden','false');
    setTimeout(function(){
      var closeBtn = m.querySelector('[data-close]');
      if(closeBtn) closeBtn.focus();
    }, FLIP_OPEN_MS);

    if(originEl && sheet){
      var originRect = originEl.getBoundingClientRect();
      sheet.style.transition = 'none';
      sheet.style.opacity = '0';
      // measure the sheet's natural (final) layout, then jump it to the folder's position/size
      requestAnimationFrame(function(){
        sheet.style.transform = flipRect(sheet, originRect);
        sheet.style.opacity = '.5';
        requestAnimationFrame(function(){
          sheet.style.transition = 'transform ' + FLIP_OPEN_MS + 'ms cubic-bezier(.16,1,.3,1), opacity .32s ease';
          sheet.style.transform = 'none';
          sheet.style.opacity = '1';
        });
      });
    }
  }
  // Exposed so the 3D project carousel (a separate <script type="module">, its
  // own scope) can open the same modal with the *actual on-screen position of
  // the clicked 3D book* as the FLIP animation's origin — instead of proxying
  // a click onto the hidden fallback card, whose getBoundingClientRect() is
  // all zeros (display:none), which is why the sheet used to fly in from the
  // top-left corner instead of from the card itself.
  window.__openProjectModal = openModal;

  function closeAll(){
    document.querySelectorAll('.ovl.open').forEach(function(o){
      var sheet = o.querySelector('.sheet');
      var origin = lastOrigin;
      o.setAttribute('aria-hidden','true');
      if(origin && sheet){
        var originRect = origin.getBoundingClientRect();
        sheet.style.transition = 'transform ' + FLIP_CLOSE_MS + 'ms cubic-bezier(.4,0,.2,1), opacity .3s ease';
        sheet.style.transform = flipRect(sheet, originRect);
        sheet.style.opacity = '0';
        origin.classList.add('filed');
        setTimeout(function(){ origin.classList.remove('filed'); }, 700);
        setTimeout(function(){
          o.classList.remove('open');
          document.body.style.overflow = '';
          sheet.style.transition = ''; sheet.style.transform = ''; sheet.style.opacity = '';
          if(origin.focus) origin.focus();
        }, FLIP_CLOSE_MS);
      } else {
        o.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    lastOrigin = null;
  }
  document.querySelectorAll('[data-modal]').forEach(function(c){
    c.addEventListener('click', function(){ openModal(c.getAttribute('data-modal'), c); });
    c.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openModal(c.getAttribute('data-modal'), c); } });
  });
  document.querySelectorAll('.ovl').forEach(function(o){
    o.addEventListener('click', function(e){ if(e.target === o || (e.target.closest && e.target.closest('[data-close]'))){ closeAll(); } });
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAll(); });
  document.addEventListener('keydown', trapTab);

  /* ---------- ASK AI (uses the experience automation) ---------- */
  var askai = document.getElementById('askai');
  if(askai){
    askai.addEventListener('click', function(){
      var exp = calcExp();
      var p = "You are a recruiter's assistant. Give a sharp candidate brief on Manmathnath Mahanta, a Business Analyst / Product Owner (" + exp + " years, Kolkata, India) targeting MNC and product roles.\n\nFacts:\n- Bridges business and engineering: requirement elicitation, BRD/FSD/SRS, user stories, UML, process mapping, UAT, Agile/Scrum, Product Owner.\n- Currently sole BA across multiple concurrent product builds at Tech Exactly, working directly with international clients in the UAE, KSA and Ireland.\n- Uses AI-assisted tools to accelerate documentation, validation and productivity.\n- Client products: Dailok (AI mental-health app, UAE healthcare, crisis-safety design), Galway Safe App (passive, privacy-first public-safety app, Ireland), WasteOps (multi-tenant industrial waste SaaS, KSA), E2P Motorsports (event-comms app with role-based access).\n- Flagship at Sai Paramount: BBPS-integrated fintech platform, 10+ payment categories and first-of-its-kind real-time rent payment over IMPS; scaled to Rs 4,000 Cr+ across 6 lakh+ transactions in 5 months.\n- Impact: ~30% efficiency gain at Sai Paramount; 26.54% churn reduction (analytics project).\n- Analytics: SQL (joins, CTEs, window functions), Power BI, Advanced Excel, KPI design.\n- Tools: JIRA, Confluence, Figma, MS Office Suite.\n- Education: MBA - Business Analysis, Lovely Professional University (Online), Mar 2026-Present; B.Sc., North Odisha University, 2022.\n- Certifications: Business Analysis (Microsoft), Data Analytics Professional Certificate (Google), Power BI Data Analytics 2.0 (CodeBasics), SQL Beginner to Advanced (CodeBasics), Agile Requirements (LinkedIn Learning), Excel Beginner to Advanced (CodeBasics).\n- Experience: Tech Exactly (Mar 2026-Present), Sai Paramount IT (Jul 2024-Mar 2026), GEEMSCO (Mar 2023-Jul 2024).\n\nWrite: Why he stands out (3-4 bullets), What he brings (3-4 bullets), Proof of work (4-5 bullets with numbers), Bottom line (1 sentence). Every bullet has a specific fact. Under 200 words.";
      window.open('https://chatgpt.com/?q=' + encodeURIComponent(p), '_blank');
    });
  }
})();

  // Mobile: show the first two bullets of each role, rest behind a toggle
  document.querySelectorAll('.xp-panel').forEach(function(p){
    var ul=p.querySelector('ul');
    if(!ul||ul.children.length<=2) return;
    var b=document.createElement('button');
    b.type='button';b.className='xp-more';b.textContent='Show more';
    b.setAttribute('aria-expanded','false');
    b.addEventListener('click',function(){
      var o=p.classList.toggle('open');
      b.textContent=o?'Show less':'Show more';
      b.setAttribute('aria-expanded',o);
    });
    ul.after(b);
  });
