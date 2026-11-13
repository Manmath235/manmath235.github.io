(function(){
  "use strict";
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ICONS (inline SVG, no external icon font) ---------- */
  var P = {
    'arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-up-right':'<path d="M7 17 17 7M8 7h9v9"/>',
    'download':'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    'mail':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    'phone':'<path d="M21 16.5v3a2 2 0 0 1-2.2 2A18.6 18.6 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.7a2 2 0 0 1-.5 2.1L8.4 10.8a15 15 0 0 0 4.8 4.8l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    'whatsapp':'<path d="M3.5 20.5l1.2-4.1A8.6 8.6 0 1 1 8 19.5z"/><path d="M9 8.6c.1 3.4 2.9 6.2 6.3 6.3l1.1-1.5-2.1-1.1-1 .9a5 5 0 0 1-2.6-2.6l.9-1-1.1-2.1z"/>',
    'home':'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    'grid':'<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    'briefcase':'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    'pen':'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    'layers':'<path d="m12 2.5 9.5 5-9.5 5-9.5-5z"/><path d="m2.5 16.5 9.5 5 9.5-5M2.5 12l9.5 5 9.5-5"/>',
    'sparkles':'<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    'check':'<path d="M20 6 9 17l-5-5"/>',
    'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    'file':'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    'users':'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.6a6.5 6.5 0 0 1 3.5 5.4"/>',
    'target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    'chart':'<path d="M3 3v18h18"/><path d="M7.5 16v-3M12 16V9M16.5 16v-5M21 6l-4.5 3"/>',
    'flow':'<rect x="3" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/><path d="M6.5 9v4a2 2 0 0 0 2 2H14"/>',
    'shield':'<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    'globe':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    'pin':'<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    'award':'<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
    'cap':'<path d="M2 9.5 12 4.5l10 5-10 5z"/><path d="M6 11.5V16c3 2.5 9 2.5 12 0v-4.5M22 9.5V15"/>',
    'external':'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    'x':'<path d="M6 6l12 12M18 6 6 18"/>',
    'message':'<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3.5 21l1.4-4.8A8.5 8.5 0 1 1 21 12z"/>',
    'zap':'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    'list':'<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
    'cycle':'<path d="M20 11a8 8 0 0 0-14.7-4.4L3 9"/><path d="M3 4v5h5"/><path d="M4 13a8 8 0 0 0 14.7 4.4L21 15"/><path d="M21 20v-5h-5"/>',
    'check-square':'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
    'database':'<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    'compass':'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    'alert':'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
    'box':'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    'cpu':'<rect x="5" y="5" width="14" height="14" rx="2.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9.5 2v3M14.5 2v3M9.5 19v3M14.5 19v3M2 9.5h3M2 14.5h3M19 9.5h3M19 14.5h3"/>',
    'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    'layout':'<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9h18M9 21V9"/>',
    'bot':'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13v1M15 13v1M9.5 17h5"/><circle cx="12" cy="3.5" r="1"/>',
    'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'clipboard':'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    'trend':'<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  var GH = '<svg class="ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
  function icon(name){
    if(name==='github') return GH;
    var p = P[name]; if(!p) return '';
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
  }
  function paintIcons(root){
    (root||document).querySelectorAll('i[data-i]').forEach(function(el){
      if(el.firstChild) return;
      el.innerHTML = icon(el.getAttribute('data-i'));
      el.setAttribute('aria-hidden','true');
    });
  }
  paintIcons();
  window.paintIcons = paintIcons;

  /* ---------- YEARS OF EXPERIENCE (auto) ---------- */
  function calcExp(){
    var start = new Date(2023, 2, 1); // 1 March 2023
    var y = (Date.now() - start.getTime()) / (365.25*24*3600*1000);
    return Math.max(1, Math.floor(y)) + '+';
  }
  var exp = calcExp();
  document.querySelectorAll('[data-years]').forEach(function(el){ el.textContent = exp; });
  document.querySelectorAll('[data-year-now]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* ---------- HEADER ---------- */
  var hdr = document.querySelector('.hdr');
  function onScroll(){ if(hdr) hdr.classList.toggle('scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---------- REVEAL ---------- */
  var rv = document.querySelectorAll('.rv');
  if('IntersectionObserver' in window && !RM){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
    rv.forEach(function(el){ io.observe(el); });
  } else { rv.forEach(function(el){ el.classList.add('in'); }); }

  /* ---------- PROJECT FILTER ---------- */
  var filters = document.querySelectorAll('[data-filter]');
  filters.forEach(function(btn){
    btn.addEventListener('click', function(){
      var f = btn.getAttribute('data-filter');
      filters.forEach(function(b){ b.setAttribute('aria-pressed', b===btn ? 'true' : 'false'); });
      document.querySelectorAll('[data-group]').forEach(function(card){
        card.hidden = !(f==='all' || card.getAttribute('data-group')===f);
      });
    });
  });

  /* ---------- CASE-STUDY SHEET ---------- */
  var ovl = document.getElementById('sheet');
  if(ovl){
    var body = ovl.querySelector('[data-sheet-body]'), title = ovl.querySelector('[data-sheet-title]');
    var lastFocus = null, openId = null;
    function open(id, push){
      var tpl = document.getElementById('case-'+id);
      if(!tpl) return;
      lastFocus = document.activeElement;
      body.innerHTML = '';
      body.appendChild(tpl.content.cloneNode(true));
      paintIcons(body);
      var h = body.querySelector('h2'); title.textContent = h ? h.textContent : '';
      ovl.classList.add('open'); ovl.setAttribute('aria-hidden','false');
      document.body.classList.add('locked');
      ovl.querySelector('.sheet').scrollTop = 0;
      openId = id;
      if(push !== false && location.hash !== '#'+id) history.pushState(null,'','#'+id);
      setTimeout(function(){ ovl.querySelector('.sheet-x').focus(); }, 60);
    }
    function close(push){
      if(!openId) return;
      ovl.classList.remove('open'); ovl.setAttribute('aria-hidden','true');
      document.body.classList.remove('locked');
      openId = null;
      setTimeout(function(){ body.innerHTML=''; }, 350);
      if(push !== false && location.hash) history.pushState(null,'',location.pathname + location.search);
      if(lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-case]').forEach(function(card){
      card.addEventListener('click', function(e){ e.preventDefault(); open(card.getAttribute('data-case')); });
    });
    ovl.addEventListener('click', function(e){ if(e.target === ovl || e.target.closest('.sheet-x')) close(); });
    document.addEventListener('keydown', function(e){
      if(!openId) return;
      if(e.key === 'Escape') close();
      if(e.key === 'Tab'){
        var f = ovl.querySelectorAll('a[href],button,iframe,[tabindex]:not([tabindex="-1"])');
        if(!f.length) return;
        var first=f[0], last=f[f.length-1];
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    });
    function fromHash(){
      var id = location.hash.slice(1);
      if(id && document.getElementById('case-'+id)) open(id, false); else close(false);
    }
    window.addEventListener('popstate', fromHash);
    fromHash();
  }

  /* ---------- ASK AI ---------- */
  document.querySelectorAll('[data-askai]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var p = "You are a recruiter's assistant. Give a sharp candidate brief on Manmathnath Mahanta, a Business Analyst / Product Owner (" + exp + " years, Kolkata, India) targeting MNC and product roles.\n\nFacts:\n- Bridges business and engineering: requirement elicitation, BRD/FSD/SRS, user stories, UML, process mapping, UAT, Agile/Scrum, Product Owner.\n- Currently sole BA across multiple concurrent product builds at Tech Exactly, working directly with international clients in the UAE, KSA and Ireland.\n- Uses AI-assisted tools to accelerate documentation, validation and productivity.\n- Client products: Dailok (AI mental-health app, UAE healthcare, crisis-safety design), Galway Safe App (passive, privacy-first public-safety app, Ireland), WasteOps (multi-tenant industrial waste SaaS, KSA), E2P Motorsports (event-comms app with role-based access).\n- Flagship at Sai Paramount: BBPS-integrated fintech platform, 10+ payment categories and first-of-its-kind real-time rent payment over IMPS; scaled to Rs 4,000 Cr+ across 6 lakh+ transactions in 5 months.\n- Impact: ~30% efficiency gain at Sai Paramount; 26.54% churn reduction (analytics project).\n- Analytics: SQL (joins, CTEs, window functions), Power BI, Advanced Excel, KPI design.\n- Tools: JIRA, Confluence, Figma, MS Office Suite.\n- Education: MBA - Business Analysis, Lovely Professional University (Online), Mar 2026-Present; B.Sc., North Odisha University, 2022.\n- Certifications: Business Analysis (Microsoft), Data Analytics Professional Certificate (Google), Power BI Data Analytics 2.0 (CodeBasics), SQL Beginner to Advanced (CodeBasics), Agile Requirements (LinkedIn Learning), Excel Beginner to Advanced (CodeBasics).\n- Experience: Tech Exactly (Mar 2026-Present), Sai Paramount IT (Jul 2024-Mar 2026), GEEMSCO (Mar 2023-Jul 2024).\n\nWrite: Why he stands out (3-4 bullets), What he brings (3-4 bullets), Proof of work (4-5 bullets with numbers), Bottom line (1 sentence). Every bullet has a specific fact. Under 200 words.";
      window.open('https://chatgpt.com/?q=' + encodeURIComponent(p), '_blank', 'noopener');
    });
  });
})();
