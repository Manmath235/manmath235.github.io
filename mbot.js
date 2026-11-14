/* M-Bot: the site's small assistant.
   Says one line per page, opens a quick-answer panel written from this portfolio's content,
   and offers a full AI brief in ChatGPT. No external libraries. */
(function(){
  "use strict";
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var paint = window.paintIcons || function(){};

  function store(kind){ try{ return window[kind]; }catch(e){ return null; } }
  function get(kind, k){ try{ var s = store(kind); return s ? s.getItem(k) : null; }catch(e){ return null; } }
  function set(kind, k, v){ try{ var s = store(kind); if(s) s.setItem(k, v); }catch(e){} }

  function years(){
    var y = (Date.now() - new Date(2023, 2, 1).getTime()) / (365.25*24*3600*1000);
    return Math.max(1, Math.floor(y)) + '+';
  }

  /* ---------- which page are we on ---------- */
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var PAGE = /^(index\.html)?$/.test(file) ? 'home'
    : file.indexOf('work') === 0 ? 'work'
    : file.indexOf('experience') === 0 ? 'experience'
    : file.indexOf('skills') === 0 ? 'skills'
    : file.indexOf('writing') === 0 ? 'writing'
    : document.querySelector('.nf') ? 'lost' : 'home';

  var LINES = {
    home:       "Hi, I'm M-Bot! Want a 30-second summary of Manmathnath?",
    work:       "Tip: open any project for the full case study. Not sure where to start? Ask me.",
    experience: "Three roles, one path: from supporting requirement docs to owning delivery as Product Owner.",
    skills:     "Curious what he uses day to day? Tap me for the quick version.",
    writing:    "His prompt-writing guide has a live prompt builder you can try.",
    lost:       "Looks like a wrong turn. Want me to take you home?"
  };

  /* ---------- answers (all taken from this portfolio) ---------- */
  var WA = 'https://wa.me/917008548402', MAIL = 'mailto:manmath.contact@gmail.com',
      LI = 'https://www.linkedin.com/in/connect-manmath', CV = 'assets/Manmathnath%20Mahanta%20-%20Resume.pdf';
  function btn(href, icon, label, attrs){ return '<a class="mb-act" href="' + href + '"' + (attrs || '') + '><i data-i="' + icon + '"></i>' + label + '</a>'; }
  var CONTACT = '<div class="mb-acts">' + btn(WA, 'whatsapp', 'WhatsApp', ' target="_blank" rel="noopener"') + btn(MAIL, 'mail', 'Email') +
      btn(LI, 'linkedin', 'LinkedIn', ' target="_blank" rel="noopener"') + btn(CV, 'download', 'CV', ' download') + '</div>';

  var A = {
    summary: { q: '30-second summary', a: function(){ return '<p>Manmathnath is a <b>Business Analyst / Product Owner</b> with <b>' + years() + ' years</b> across FinTech, Healthcare AI, Industrial Ops, Public Safety and Event SaaS.</p><p>Right now he is the sole BA across multiple concurrent product builds at Tech Exactly, owning each from discovery and BRD/FSD/SRS through to UAT sign-off.</p>'; } },
    results: { q: 'Key results', a: function(){ return '<ul><li><b>₹4,000 Cr+</b> processed across <b>6 lakh+</b> transactions within 5 months of go-live, on a BBPS fintech platform where he led the business analysis.</li><li><b>About 30%</b> better operational efficiency at Sai Paramount, from tighter requirements, shorter UAT cycles and fewer defects.</li><li><b>13 projects</b> in this portfolio across 5 industries.</li></ul>' + '<div class="mb-acts">' + btn('work.html', 'grid', 'See the projects') + '</div>'; } },
    experience: { q: 'Experience', a: function(){ return '<ul><li><b>Tech Exactly</b>, Business Analyst · Mar 2026 to present</li><li><b>Sai Paramount IT Solutions</b>, Business Analyst · Jul 2024 to Mar 2026</li><li><b>GEEMSCO Consultancy Services</b>, Business Analyst · Mar 2023 to Jul 2024</li></ul>' + '<div class="mb-acts">' + btn('experience.html', 'briefcase', 'Full experience') + '</div>'; } },
    skills: { q: 'Skills & tools', a: function(){ return '<p><b>Core:</b> requirement elicitation, BRD / FSD / SRS, user stories with acceptance criteria, Agile/Scrum and backlog ownership, UAT, process mapping and UML.</p><p><b>Data:</b> Power BI, SQL (joins, CTEs, window functions) and Excel.</p><p><b>Tools:</b> JIRA, Confluence, Figma, ClickUp, Notion, LucidChart, Postman, Claude and Lovable.</p>'; } },
    education: { q: 'Education', a: function(){ return '<ul><li><b>MBA in Business Analysis</b>, Lovely Professional University (Online) · Mar 2026 to present</li><li><b>B.Sc.</b>, North Odisha University, Barbil · 2022</li></ul><p>Certified in Business Analysis (Microsoft), Data Analytics (Google), Power BI, SQL and Excel (CodeBasics) and Agile Requirements (LinkedIn Learning).</p>'; } },
    start: { q: 'Which project first?', a: function(){ return '<p>Most people start with the flagship, the <b>BBPS fintech platform</b>: ₹4,000 Cr+ processed in 5 months.</p><p>Then <b>Dailok</b>, an AI mental-health app with crisis-safety design in Arabic and English.</p><div class="mb-acts">' + btn('work.html#bbps', 'arrow-right', 'Open BBPS') + btn('work.html#dailok', 'arrow-right', 'Open Dailok') + '</div>'; } },
    read: { q: 'Which article first?', a: function(){ return '<p>Start with <b>Prompt Engineering for Business Analysts</b>. It has a simple five-part structure and a live prompt builder you can edit.</p><div class="mb-acts">' + btn('blog-prompt-engineering.html', 'pen', 'Read it') + '</div>'; } },
    open: { q: 'Is he open to roles?', a: function(){ return '<p>Yes. He is open to <b>Business Analyst / Product Owner</b> roles where he can own outcomes end to end, ideally with a team shipping products at scale.</p>' + CONTACT; } },
    contact: { q: 'How to contact him', a: function(){ return '<p>The quickest way is WhatsApp. He is based in Kolkata, India (UTC+5:30).</p>' + CONTACT; } },
    home: { q: 'Take me home', a: function(){ return '<p>Sure, here are the main places.</p><div class="mb-acts">' + btn('index.html', 'home', 'Home') + btn('work.html', 'grid', 'Work') + btn(CV, 'download', 'CV', ' download') + '</div>'; } }
  };
  var CHIPS = {
    home: ['summary', 'results', 'open', 'contact', 'experience', 'skills'],
    work: ['start', 'results', 'summary', 'skills', 'contact'],
    experience: ['experience', 'results', 'education', 'open', 'contact'],
    skills: ['skills', 'education', 'summary', 'results', 'contact'],
    writing: ['read', 'summary', 'results', 'contact'],
    lost: ['home', 'summary', 'contact']
  };

  /* ---------- the character (inline SVG) ---------- */
  function face(id){
    return '<svg class="mb-svg" viewBox="0 0 120 120" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9A3C"/><stop offset=".55" stop-color="#F26B1D"/><stop offset="1" stop-color="#D9480F"/></linearGradient>' +
        '<linearGradient id="' + id + 'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A2D52"/><stop offset="1" stop-color="#070E1C"/></linearGradient>' +
        '<radialGradient id="' + id + 'g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE7A8"/><stop offset="1" stop-color="#FFA41B" stop-opacity="0"/></radialGradient>' +
        '<filter id="' + id + 'e" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>' +
      '<g class="mb-ant"><path d="M60 24 V12" stroke="#1A2D52" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="10" r="10" fill="url(#' + id + 'g)"/><circle cx="60" cy="10" r="5" fill="#FFC56B"/></g>' +
      '<rect x="9" y="50" width="11" height="24" rx="5.5" fill="#1A2D52"/><rect x="100" y="50" width="11" height="24" rx="5.5" fill="#1A2D52"/>' +
      '<rect x="17" y="22" width="86" height="76" rx="28" fill="url(#' + id + 'b)"/>' +
      '<path d="M32 30 Q60 22 88 30" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '<rect x="27" y="38" width="66" height="44" rx="18" fill="url(#' + id + 'v)"/>' +
      '<rect x="27.5" y="38.5" width="65" height="43" rx="17.5" fill="none" stroke="#fff" stroke-opacity=".14"/>' +
      '<g class="mb-eyes" filter="url(#' + id + 'e)">' +
        '<g class="mb-open"><rect x="42" y="49" width="11" height="15" rx="5.5" fill="#E9F2FF"/><rect x="67" y="49" width="11" height="15" rx="5.5" fill="#E9F2FF"/></g>' +
        '<g class="mb-happy"><path d="M42 58 Q47.5 50 53 58" stroke="#E9F2FF" stroke-width="3.6" stroke-linecap="round" fill="none"/><path d="M67 58 Q72.5 50 78 58" stroke="#E9F2FF" stroke-width="3.6" stroke-linecap="round" fill="none"/></g>' +
      '</g>' +
      '<path class="mb-mouth" d="M53 71 Q60 76 67 71" stroke="#FFB36B" stroke-width="3" stroke-linecap="round" fill="none"/>' +
      '<circle cx="35" cy="76" r="4" fill="#FF7A59" opacity=".55"/><circle cx="85" cy="76" r="4" fill="#FF7A59" opacity=".55"/>' +
      '<g class="mb-arm"><rect x="98" y="78" width="12" height="22" rx="6" fill="#F26B1D" stroke="#C2410C" stroke-opacity=".35"/></g>' +
    '</svg>';
  }

  /* ---------- build the DOM ---------- */
  var root = document.createElement('div');
  root.className = 'mb' + (RM ? ' mb--still' : '');
  root.innerHTML =
    '<div class="mb-bubble" role="status" hidden><button class="mb-bx" type="button" aria-label="Hide message"><i data-i="x"></i></button><span class="mb-btext"></span></div>' +
    '<button class="mb-bot" type="button" aria-label="Ask M-Bot about Manmathnath" aria-expanded="false" aria-controls="mb-panel">' + face('mbA') + '<span class="mb-shadow"></span></button>' +
    '<section class="mb-panel" id="mb-panel" role="dialog" aria-modal="false" aria-labelledby="mb-title" hidden>' +
      '<header class="mb-head"><span class="mb-mini">' + face('mbB') + '</span><span><strong id="mb-title">M-Bot</strong><small>Answers from this portfolio</small></span>' +
      '<button class="mb-x" type="button" aria-label="Close assistant"><i data-i="x"></i></button></header>' +
      '<div class="mb-log" aria-live="polite"></div>' +
      '<div class="mb-chips" role="group" aria-label="Suggested questions"></div>' +
      '<footer class="mb-foot"><button class="mb-gpt" type="button"><i data-i="sparkles"></i> Full AI brief in ChatGPT <i data-i="external"></i></button>' +
      '<small>Opens chatgpt.com in a new tab with a summary of this portfolio.</small></footer>' +
    '</section>';
  document.body.appendChild(root);
  paint(root);

  var bot = root.querySelector('.mb-bot'), bubble = root.querySelector('.mb-bubble'), btext = root.querySelector('.mb-btext');
  var panel = root.querySelector('.mb-panel'), log = root.querySelector('.mb-log'), chipsBox = root.querySelector('.mb-chips');
  var lastFocus = null, greeted = false, busy = false, asked = {};

  /* ---------- small animations ---------- */
  function blink(){
    if(RM) return;
    root.classList.add('blink');
    setTimeout(function(){ root.classList.remove('blink'); }, 150);
    setTimeout(blink, 2600 + Math.random() * 3200);
  }
  setTimeout(blink, 1800);
  function wave(){ if(RM) return; root.classList.remove('wave'); void root.offsetWidth; root.classList.add('wave'); }

  if(FINE && !RM){
    var eyes = root.querySelectorAll('.mb-eyes'), raf = 0, last = null;
    window.addEventListener('pointermove', function(e){
      last = e; if(raf) return;
      raf = requestAnimationFrame(function(){
        raf = 0;
        var r = bot.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
        var dx = last.clientX - cx, dy = last.clientY - cy, d = Math.max(1, Math.hypot(dx, dy));
        var k = Math.min(1, d / 260);
        eyes[0].style.transform = 'translate(' + (dx/d*4*k).toFixed(2) + 'px,' + (dy/d*3*k).toFixed(2) + 'px)';
      });
    }, {passive:true});
  }

  /* ---------- speech bubble ---------- */
  var typeTimer = 0, hideTimer = 0;
  function say(text){
    clearTimeout(typeTimer); clearTimeout(hideTimer);
    bubble.hidden = false; root.classList.add('talking');
    requestAnimationFrame(function(){ bubble.classList.add('show'); });
    wave();
    if(RM){ btext.textContent = text; root.classList.remove('talking'); }
    else {
      var i = 0; btext.textContent = '';
      (function type(){
        i += 2; btext.textContent = text.slice(0, i);
        if(i < text.length) typeTimer = setTimeout(type, 22); else root.classList.remove('talking');
      })();
    }
    hideTimer = setTimeout(hideBubble, 9000);
  }
  function hideBubble(){
    clearTimeout(hideTimer); bubble.classList.remove('show'); root.classList.remove('talking');
    setTimeout(function(){ if(!bubble.classList.contains('show')) bubble.hidden = true; }, 300);
  }
  bubble.addEventListener('click', function(e){
    if(e.target.closest('.mb-bx')){ hideBubble(); set('localStorage', 'mbot-quiet', '1'); return; }
    hideBubble(); open();
  });

  var quiet = get('localStorage', 'mbot-quiet') === '1';
  var seenKey = 'mbot-seen-' + PAGE;
  if(!quiet && !get('sessionStorage', seenKey)){
    setTimeout(function(){
      if(panel.hidden){ say(LINES[PAGE]); set('sessionStorage', seenKey, '1'); }
    }, PAGE === 'lost' ? 900 : 2600);
  }

  /* ---------- panel ---------- */
  function msg(html, who){
    var m = document.createElement('div');
    m.className = 'mb-msg ' + (who || 'bot');
    m.innerHTML = html; paint(m);
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function renderChips(){
    chipsBox.innerHTML = '';
    (CHIPS[PAGE] || CHIPS.home).forEach(function(k){
      if(asked[k]) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mb-chip'; b.textContent = A[k].q;
      b.addEventListener('click', function(){ ask(k); });
      chipsBox.appendChild(b);
    });
    chipsBox.hidden = !chipsBox.children.length;
  }
  function ask(k){
    if(busy) return;
    busy = true; asked[k] = true;
    var hadFocus = document.activeElement && document.activeElement.classList.contains('mb-chip');
    msg(A[k].q, 'me');
    renderChips();
    if(hadFocus){ var nx = chipsBox.querySelector('button') || panel.querySelector('.mb-gpt'); if(nx) nx.focus({preventScroll:true}); }
    var t = msg('<span class="mb-dots"><i></i><i></i><i></i></span>', 'bot typing');
    root.classList.add('talking');
    setTimeout(function(){
      t.classList.remove('typing'); t.innerHTML = A[k].a(); paint(t);
      log.scrollTop = log.scrollHeight;
      root.classList.remove('talking'); busy = false;
    }, RM ? 0 : 650);
  }
  function open(from){
    if(!panel.hidden) return;
    lastFocus = from && from.focus ? from : document.activeElement;
    hideBubble();
    panel.hidden = false; root.classList.add('open');
    bot.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function(){ panel.classList.add('show'); });
    if(!greeted){
      greeted = true;
      msg('<p>Hi! I\'m <b>M-Bot</b>, Manmathnath\'s portfolio assistant. Pick a question below and I\'ll answer from what\'s on this site.</p>');
      renderChips();
    }
    wave();
    setTimeout(function(){ var c = chipsBox.querySelector('button') || panel.querySelector('.mb-x'); if(c) c.focus(); }, 80);
  }
  function close(){
    if(panel.hidden) return;
    panel.classList.remove('show'); root.classList.remove('open');
    bot.setAttribute('aria-expanded', 'false');
    setTimeout(function(){ panel.hidden = true; }, 250);
    if(lastFocus && lastFocus.focus) lastFocus.focus(); else bot.focus();
  }
  bot.addEventListener('click', function(){ panel.hidden ? open(bot) : close(); });
  bot.addEventListener('mouseenter', function(){ root.classList.add('happy'); });
  bot.addEventListener('mouseleave', function(){ root.classList.remove('happy'); });
  panel.querySelector('.mb-x').addEventListener('click', close);
  panel.querySelector('.mb-gpt').addEventListener('click', function(){ if(window.openAIBrief) window.openAIBrief(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !panel.hidden) close(); });
  document.addEventListener('click', function(e){
    if(panel.hidden) return;
    var path = e.composedPath ? e.composedPath() : [e.target];
    if(path.indexOf(root) > -1) return;                       // inside the assistant (even if the clicked chip was removed)
    if(e.target.closest && e.target.closest('[data-askai]')) return;
    close();
  });
  // keep the bot clear of the case-study sheet
  var sheet = document.getElementById('sheet');
  if(sheet && 'MutationObserver' in window){
    var syncSheet = function(){ var on = sheet.classList.contains('open'); root.classList.toggle('mb--away', on); if(on){ hideBubble(); close(); } };
    new MutationObserver(syncSheet).observe(sheet, {attributes:true, attributeFilter:['class']});
    syncSheet();
  }

  window.MBot = { open: open, close: close, say: say };
})();
