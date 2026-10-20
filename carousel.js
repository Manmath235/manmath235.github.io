(async function(){
  "use strict";
  var stage = document.getElementById('shelfStage');
  var fallback = document.getElementById('workFallback');
  if(!stage || !fallback) return;

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer:coarse)').matches;
  function hasWebGL(){
    try{
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    }catch(e){ return false; }
  }
  if(RM || coarse || !hasWebGL()) return; // keep the card grid — no 3D on touch/reduced-motion/unsupported

  // Commit to the shelf's final layout size *immediately*, before Three.js
  // has even started downloading — never after. If the swap from the tall
  // fallback grid to the short carousel happened later (e.g. once the lazy
  // import finishes), it would land at an unpredictable moment: mid-scroll,
  // or mid-flight during a smooth nav-link jump to a section further down
  // the page, which is a real, reproducible layout shift (confirmed by
  // testing a scrollIntoView('#skills') landing hundreds of pixels off
  // because the grid collapsed while that scroll was still animating).
  // The loading spinner covers the wait; the page's shape never moves.
  stage.hidden = false;
  fallback.hidden = true;

  // Don't pay Three.js's download cost until the visitor actually scrolls
  // near the Work section (same lazy spirit as the loading="lazy" images).
  var workSection = document.getElementById('work');
  var lazyIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      lazyIO.disconnect();
      load();
    });
  }, { rootMargin: '600px 0px' });
  lazyIO.observe(workSection || stage);

  async function load(){
    var THREE;
    try{
      THREE = await import('./assets/vendor/three/three.module.min.js');
    }catch(e){ revertToFallback(); return; } // self-hosted file missing/unreachable

    try{ await initShelf(THREE); }
    catch(e){ console.warn('3D shelf failed, showing card grid instead.', e); revertToFallback(); }
  }

  function revertToFallback(){
    stage.hidden = true;
    fallback.hidden = false;
  }

  // Real bootstrap-icons codepoints (verified against the installed bootstrap-icons
  // 1.11.3 package, not guessed) — used only as a generated-cover fallback for
  // projects that have no real screenshot asset (client work under NDA, and the
  // BA markdown-style documents).
  var ICON_CODEPOINTS = {
    'bi-coin': '',
    'bi-heart-pulse': '',
    'bi-shield-check': '',
    'bi-recycle': '',
    'bi-flag': '',
    'bi-journal-text': '',
    'bi-journal-code': ''
  };

  async function initShelf(THREE){
    // ---- source of truth: read categories + books straight from the DOM ----
    // name, category color, icon, cover image (if a real one exists) and the
    // click target all come from the existing accessible card grid — nothing
    // here is invented separately from what's already on the page.
    var groupEls = fallback.querySelectorAll('.proj-group');
    var cats = Array.prototype.slice.call(groupEls).map(function(g){
      return {
        key: g.getAttribute('data-group'),
        label: g.querySelector('.gt').textContent.trim(),
        books: Array.prototype.slice.call(g.querySelectorAll('.pcard')).map(function(card){
          var color = (card.style.getPropertyValue('--tab') || '#046A38').trim();
          var name = (card.querySelector('.nm') || {}).textContent || 'project';
          var stat = card.querySelector('.pcard-meta .stat');
          var desc = card.querySelector('.pcard-desc');
          var iconEl = card.querySelector('.pcard-name .ic i');
          var iconClass = iconEl ? Array.prototype.slice.call(iconEl.classList).filter(function(c){ return c.indexOf('bi-') === 0; })[0] : null;
          return {
            el: card,
            name: name.trim(),
            stat: stat ? stat.textContent.trim() : '',
            desc: desc ? desc.textContent.trim() : '',
            color: color,
            icon: ICON_CODEPOINTS[iconClass] || '' // bi-journal fallback glyph
          };
        })
      };
    }).filter(function(c){ return c.books.length; });
    if(!cats.length) return;

    var canvas = document.getElementById('shelfCanvas');
    var tooltip = document.getElementById('shelfTooltip');
    var loading = document.getElementById('shelfLoading');
    var prevBtn = document.getElementById('shelfPrev');
    var nextBtn = document.getElementById('shelfNext');
    var countEl = document.getElementById('shelfCount');
    var nameEl = document.getElementById('shelfName');

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050608, 0.09);

    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.25, 8.2);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0x046A38, 0x0a0d12, 1.0));
    var key = new THREE.DirectionalLight(0xf9ebd7, 1.2); key.position.set(3, 5, 6); scene.add(key);
    var rim = new THREE.PointLight(0xE34222, 9, 20); rim.position.set(-4, 1, 2); scene.add(rim);
    var rim2 = new THREE.PointLight(0x046A38, 6, 18); rim2.position.set(4, -1, 3); scene.add(rim2);

    var shelfGroup = new THREE.Group(); scene.add(shelfGroup);

    var shelfDepth = 0.22;
    var sideMat = new THREE.MeshStandardMaterial({ color: 0x171c24, roughness: 0.75, metalness: 0.1 });

    var COVER_W = 560, COVER_H = 315; // px, 16:9 — bigger canvas for bigger cards

    var fontsReady = document.fonts ? Promise.all([
      document.fonts.load('400 ' + Math.round(COVER_H * 0.5) + 'px "bootstrap-icons"'),
      document.fonts.load('600 ' + Math.round(COVER_H * 0.13) + 'px "Fraunces"'),
      document.fonts.load('400 16px "Work Sans"')
    ]).catch(function(){}) : Promise.resolve();

    function shade(hex, amt){
      var n = parseInt(hex.replace('#', ''), 16);
      var r = Math.min(255, Math.max(0, (n >> 16) + amt));
      var g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
      var b = Math.min(255, Math.max(0, (n & 0xff) + amt));
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function wrapLines(ctx, text, maxWidth, maxLines){
      var words = (text || '').split(/\s+/).filter(Boolean);
      var lines = [], line = '';
      for(var i = 0; i < words.length; i++){
        var test = line ? line + ' ' + words[i] : words[i];
        if(ctx.measureText(test).width > maxWidth && line){ lines.push(line); line = words[i]; }
        else line = test;
        if(lines.length === maxLines) break;
      }
      if(line && lines.length < maxLines) lines.push(line);
      if(lines.length === maxLines){
        var last = lines[maxLines - 1];
        while(last.length > 4 && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
        var consumedWords = lines.slice(0, maxLines - 1).join(' ').split(' ').length + last.split(' ').length;
        if(consumedWords < words.length || (line && line !== last)) last += '…';
        lines[maxLines - 1] = last;
      }
      return lines;
    }

    // Every card is a designed, text-led cover — no project screenshots, no
    // dark scrim laid over a photo. Category color, an oversized faint icon
    // mark, an ALL-CAPS title and the project's own description (read
    // straight from its accessible card, same source of truth as everywhere
    // else) are the entire visual: the card talks about the project rather
    // than showing a picture of it.
    async function coverTexture(b, cat){
      var cvs = document.createElement('canvas');
      cvs.width = COVER_W; cvs.height = COVER_H;
      var ctx = cvs.getContext('2d');
      await fontsReady;

      var grad = ctx.createLinearGradient(0, 0, COVER_W, COVER_H);
      grad.addColorStop(0, shade(b.color, -8));
      grad.addColorStop(1, shade(b.color, -62));
      ctx.fillStyle = grad; ctx.fillRect(0, 0, COVER_W, COVER_H);

      // faint oversized icon mark, decorative only — not an overlay on a photo
      ctx.font = '400 ' + Math.round(COVER_H * 0.72) + 'px "bootstrap-icons"';
      ctx.fillStyle = 'rgba(255,255,255,.10)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.icon, COVER_W * 0.83, COVER_H * 0.48);

      var pad = Math.round(COVER_W * 0.048);

      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = b.color;
      ctx.font = "700 " + Math.round(COVER_H * 0.045) + "px 'Space Mono', monospace";
      ctx.fillText(cat.label.toUpperCase(), pad, Math.round(COVER_H * 0.13));

      ctx.fillStyle = '#ffffff';
      var titleSize = Math.round(COVER_H * 0.125);
      ctx.font = "600 " + titleSize + "px 'Fraunces', serif";
      var titleMaxWidth = COVER_W - pad * 2 - COVER_W * 0.14;
      var titleLines = wrapLines(ctx, b.name.replace(/-/g, ' ').toUpperCase(), titleMaxWidth, 2);
      var titleY = Math.round(COVER_H * 0.34);
      titleLines.forEach(function(line, i){ ctx.fillText(line, pad, titleY + i * Math.round(titleSize * 1.12)); });

      var descY = titleY + titleLines.length * Math.round(titleSize * 1.12) + Math.round(COVER_H * 0.09);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      var descSize = Math.round(COVER_H * 0.052);
      ctx.font = "400 " + descSize + "px 'Work Sans', sans-serif";
      var descText = b.desc || b.stat || '';
      var descLines = wrapLines(ctx, descText, COVER_W - pad * 2, 3);
      descLines.forEach(function(line, i){ ctx.fillText(line, pad, descY + i * Math.round(descSize * 1.5)); });

      var tex = new THREE.CanvasTexture(cvs);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    }

    var bookW = 3.1, bookH = bookW * (COVER_H / COVER_W);

    // build every cover texture first so the carousel appears whole rather
    // than populating piecemeal as images resolve
    var allBooks = [];
    cats.forEach(function(cat){ cat.books.forEach(function(b){ allBooks.push({ b: b, cat: cat }); }); });
    var textures = await Promise.all(allBooks.map(function(entry){ return coverTexture(entry.b, entry.cat); }));

    // one mesh per project, built once; the carousel only ever repositions
    // them — nothing is added/removed when filtering or navigating
    var books = allBooks.map(function(entry, i){
      var geo = new THREE.BoxGeometry(bookW, bookH, shelfDepth);
      var coverMat = new THREE.MeshStandardMaterial({ map: textures[i], roughness: 0.55, transparent: true });
      var mats = [sideMat, sideMat, sideMat, sideMat, coverMat, sideMat];
      var mesh = new THREE.Mesh(geo, mats);
      shelfGroup.add(mesh);
      return { mesh: mesh, mats: mats, data: entry.b, catKey: entry.cat.key, bobPhase: i * 1.3 };
    });

    // ---- carousel state ----
    var active = books.slice();          // the subset currently in play (filter changes this)
    var centerIndex = 0;                 // integer index into `active` that is in the spotlight
    var displayCenter = 0;               // eased/dragged float version used for layout each frame
    var animT = 0;                       // free-running clock for the idle per-card bob, never reset by interaction

    function layout(){
      var n = active.length;
      active.forEach(function(book, i){
        var offset = i - displayCenter;
        var a = Math.abs(offset);
        var scale = Math.max(0.4, 1.4 - a * 0.42);
        var x = offset * (bookW * 0.95);
        var z = -Math.min(a, 3) * 0.85;
        var rotY = Math.max(-0.9, Math.min(0.9, -offset * 0.55));
        var opacity = a > 4.2 ? 0 : Math.max(0, 1 - a * 0.32);
        // subtle idle movement — each card breathes gently on its own phase,
        // independent of carousel position, so the shelf never sits dead-still
        var bob = Math.sin(animT * 0.65 + book.bobPhase) * 0.045;
        var sway = Math.cos(animT * 0.5 + book.bobPhase) * 0.02;
        book.mesh.position.set(x + sway, bob, z);
        book.mesh.rotation.y = rotY;
        book.mesh.scale.setScalar(scale * (book === hovered ? 1.04 : 1));
        book.mats[4].opacity = opacity;
        book.mesh.visible = opacity > 0.01;
        book.mesh.renderOrder = 100 - Math.round(a * 10);
      });
      // books not in the active subset (filtered out) stay fully hidden
      books.forEach(function(b){ if(active.indexOf(b) === -1) b.mesh.visible = false; });

      var focused = active[Math.round(displayCenter)] || active[centerIndex];
      if(focused && nameEl && countEl){
        nameEl.textContent = focused.data.name.replace(/-/g, ' ') + (focused.data.stat ? ' · ' + focused.data.stat : '');
        countEl.textContent = (Math.round(displayCenter) + 1) + ' / ' + n;
      }
    }

    function goTo(i){
      centerIndex = Math.max(0, Math.min(active.length - 1, i));
    }

    function resize(){
      var r = stage.getBoundingClientRect();
      if(r.width < 2 || r.height < 2) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    }
    var ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    // ---- interaction ----
    var raycaster = new THREE.Raycaster();
    var ndc = new THREE.Vector2();
    var dragging = false, moved = false, downX = 0, dragDX = 0, lastX = 0;
    var hovered = null, idleT = 0;

    function pick(clientX, clientY){
      var r = canvas.getBoundingClientRect();
      ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      var hits = raycaster.intersectObjects(active.filter(function(b){ return b.mesh.visible; }).map(function(b){ return b.mesh; }));
      if(!hits.length) return null;
      var mesh = hits[0].object;
      return active.filter(function(b){ return b.mesh === mesh; })[0] || null;
    }

    // The book's actual on-screen bounding box, projected from its real 3D
    // corners through the camera — used as the modal FLIP animation's origin
    // instead of the hidden fallback card's element (which is display:none,
    // so its own getBoundingClientRect() is all zeros — that mismatch is
    // exactly why the sheet used to fly in from the top-left corner instead
    // of from the card that was actually clicked).
    var _corner = new THREE.Vector3();
    function bookScreenRect(mesh){
      var r = canvas.getBoundingClientRect();
      mesh.updateMatrixWorld(true);
      var hw = bookW / 2, hh = bookH / 2, hz = shelfDepth / 2;
      var corners = [
        [-hw, -hh, hz], [hw, -hh, hz], [hw, hh, hz], [-hw, hh, hz]
      ];
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      corners.forEach(function(c){
        _corner.set(c[0], c[1], c[2]).applyMatrix4(mesh.matrixWorld).project(camera);
        var px = r.left + (_corner.x * 0.5 + 0.5) * r.width;
        var py = r.top + (1 - (_corner.y * 0.5 + 0.5)) * r.height;
        minX = Math.min(minX, px); maxX = Math.max(maxX, px);
        minY = Math.min(minY, py); maxY = Math.max(maxY, py);
      });
      return { left: minX, top: minY, right: maxX, bottom: maxY, width: maxX - minX, height: maxY - minY,
        x: minX, y: minY };
    }

    // Opens the clicked/focused book: a modal card gets the real FLIP-from-
    // this-card animation via the exposed openModal; a BA-artifact link card
    // (no modal, just navigates) is simplest to proxy with a genuine click.
    function openBook(book){
      var el = book.data.el;
      if(!el) return;
      var modalId = el.getAttribute('data-modal');
      if(modalId && window.__openProjectModal){
        var rect = bookScreenRect(book.mesh);
        var proxy = {
          getBoundingClientRect: function(){ return rect; },
          classList: { add: function(){}, remove: function(){} },
          focus: function(){ if(stage.focus) stage.focus(); }
        };
        window.__openProjectModal(modalId, proxy);
      } else {
        el.click();
      }
    }

    // how many carousel steps a full-width drag covers
    // dragging right brings the NEXT project forward (per spec), so a
    // positive pixel delta must produce a positive index delta.
    function pxToIndex(px){
      var r = canvas.getBoundingClientRect();
      return px / (r.width / 4.2);
    }

    canvas.addEventListener('pointerdown', function(e){
      dragging = true; moved = false; dragDX = 0; downX = lastX = e.clientX;
      stage.classList.add('dragging');
      canvas.setPointerCapture(e.pointerId);
      idleT = 0;
    });
    canvas.addEventListener('pointerup', function(e){
      dragging = false; stage.classList.remove('dragging');
      if(!moved){
        var hit = pick(e.clientX, e.clientY);
        if(hit){
          var i = active.indexOf(hit);
          if(i === centerIndex){ openBook(hit); }
          else goTo(i);
        }
      } else {
        goTo(Math.round(displayCenter));
      }
      idleT = 0;
    });
    canvas.addEventListener('pointermove', function(e){
      if(dragging){
        var dx = e.clientX - lastX;
        dragDX += dx;
        if(Math.abs(e.clientX - downX) > 4) moved = true;
        displayCenter = centerIndex + pxToIndex(dragDX);
        displayCenter = Math.max(-0.4, Math.min(active.length - 1 + 0.4, displayCenter));
        lastX = e.clientX;
        tooltip.classList.remove('show');
      } else {
        var hit = pick(e.clientX, e.clientY);
        hovered = hit;
        if(hit){
          var r = stage.getBoundingClientRect();
          tooltip.style.left = (e.clientX - r.left) + 'px';
          tooltip.style.top = (e.clientY - r.top) + 'px';
          tooltip.innerHTML = '<b>' + hit.data.name.replace(/-/g, ' ') + '</b>' + (hit.data.stat ? ' · ' + hit.data.stat : '');
          tooltip.classList.add('show');
        } else {
          tooltip.classList.remove('show');
        }
      }
      idleT = 0;
    });
    canvas.addEventListener('pointerleave', function(){ hovered = null; tooltip.classList.remove('show'); });

    var wheelAccum = 0;
    canvas.addEventListener('wheel', function(e){
      e.preventDefault();
      wheelAccum += e.deltaY;
      if(Math.abs(wheelAccum) > 60){ goTo(centerIndex + (wheelAccum > 0 ? 1 : -1)); wheelAccum = 0; }
      idleT = 0;
    }, { passive: false });

    if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(centerIndex - 1); idleT = 0; });
    if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(centerIndex + 1); idleT = 0; });

    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ e.preventDefault(); goTo(centerIndex - 1); }
      else if(e.key === 'ArrowRight'){ e.preventDefault(); goTo(centerIndex + 1); }
      else if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        var focused = active[centerIndex];
        if(focused) openBook(focused);
      }
      idleT = 0;
    });

    // filter buttons swap which projects are in the carousel
    var filterBar = document.getElementById('projFilter');
    if(filterBar){
      filterBar.querySelectorAll('.pf-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
          var f = btn.getAttribute('data-filter');
          active = (f === 'all') ? books.slice() : books.filter(function(b){ return b.catKey === f; });
          centerIndex = 0; displayCenter = 0;
          idleT = 0;
        });
      });
    }

    if(loading) setTimeout(function(){ loading.classList.add('hide'); }, 150);
    layout(); // stage/fallback visibility was already committed synchronously, above

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ running = e.isIntersecting; });
    }, { threshold: 0.05 });
    io.observe(stage);

    var running = false, lastT = performance.now();
    function frame(now){
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      if(!running) return;
      idleT += dt;
      animT += dt;

      if(!dragging){
        displayCenter += (centerIndex - displayCenter) * 0.14;
      }
      layout();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
})();
