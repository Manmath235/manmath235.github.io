(async function(){
  "use strict";
  var radial = document.getElementById('radial');
  var canvas = document.getElementById('radialCanvas');
  var svg = document.getElementById('radialSvg');
  if(!radial || !canvas || !svg) return;

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer:coarse)').matches;
  function hasWebGL(){
    try{
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    }catch(e){ return false; }
  }
  if(RM || coarse || !hasWebGL()) return; // keep the flat SVG radial

  var skillsSection = document.getElementById('skills');
  var lazyIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      lazyIO.disconnect();
      load();
    });
  }, { rootMargin: '600px 0px' });
  lazyIO.observe(skillsSection || radial);

  async function load(){
    var THREE;
    try{ THREE = await import('./assets/vendor/three/three.module.min.js'); }
    catch(e){ return; }
    try{ initRadial3D(THREE); }
    catch(e){ console.warn('3D skills radial failed, keeping the flat version.', e); }
  }

  function initRadial3D(THREE){
    var nodeEls = Array.prototype.slice.call(radial.querySelectorAll('.snode'));
    if(!nodeEls.length) return;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 1.3, 8.2);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0x046A38, 0x14171d, 1.1));
    var key = new THREE.DirectionalLight(0xf9ebd7, 1.0); key.position.set(3, 4, 5); scene.add(key);
    var rim = new THREE.PointLight(0xE34222, 7, 16); rim.position.set(0, 0, 3); scene.add(rim);

    var ringGroup = new THREE.Group();
    ringGroup.rotation.x = -0.32; // default tilt so the ring reads as 3D, not a flat coin
    scene.add(ringGroup);

    var R = 2.7;
    var markerGeo = new THREE.SphereGeometry(0.13, 20, 20);
    var markerMat = new THREE.MeshStandardMaterial({ color: 0x046A38, emissive: 0x046A38, emissiveIntensity: 0.5, roughness: 0.4 });
    var linePositions = new Float32Array(nodeEls.length * 2 * 3);
    var markers = nodeEls.map(function(el, i){
      var a = parseFloat(el.getAttribute('data-a')) * Math.PI / 180;
      var x = Math.cos(a) * R, y = Math.sin(a) * R;
      var mesh = new THREE.Mesh(markerGeo, markerMat.clone());
      mesh.position.set(x, y, 0);
      mesh.visible = false; // the HTML pill IS the node; this mesh only supplies its 3D position
      ringGroup.add(mesh);
      linePositions[i*6]   = 0; linePositions[i*6+1] = 0; linePositions[i*6+2] = 0;
      linePositions[i*6+3] = x; linePositions[i*6+4] = y; linePositions[i*6+5] = 0;
      el.style.transition = 'none'; // JS drives position every frame now — CSS transition would fight it
      return { el: el, mesh: mesh };
    });
    var lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    var lMat = new THREE.LineBasicMaterial({ color: 0xE34222, transparent: true, opacity: 0.4 });
    ringGroup.add(new THREE.LineSegments(lGeo, lMat));

    // a faint outer ring so the 3D circle still reads clearly at rest
    var ringGeo = new THREE.RingGeometry(R - 0.012, R + 0.012, 64);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x141824, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
    ringGroup.add(new THREE.Mesh(ringGeo, ringMat));

    function resize(){
      var r = radial.getBoundingClientRect();
      if(r.width < 2 || r.height < 2) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    }
    var ro = new ResizeObserver(resize);
    ro.observe(radial);
    resize();

    // drag to rotate, same interaction language as the project carousel
    var dragging = false, lastX = 0, lastY = 0;
    var targetRotY = 0, targetRotX = ringGroup.rotation.x;
    canvas.addEventListener('pointerdown', function(e){
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      canvas.classList.add('dragging');
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointerup', function(){ dragging = false; canvas.classList.remove('dragging'); });
    canvas.addEventListener('pointermove', function(e){
      if(!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.008;
      targetRotX = Math.max(-1.1, Math.min(0.1, targetRotX - (e.clientY - lastY) * 0.006));
      lastX = e.clientX; lastY = e.clientY;
    });

    svg.setAttribute('hidden', '');
    canvas.hidden = false;

    var running = false;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ running = e.isIntersecting; });
    }, { threshold: 0.05 });
    io.observe(radial);

    var tmp = new THREE.Vector3();
    var t = 0, lastT = performance.now();
    function frame(now){
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      if(!running) return;
      t += dt;

      if(!dragging) targetRotY += dt * 0.12; // gentle auto-rotate when idle
      ringGroup.rotation.y += (targetRotY - ringGroup.rotation.y) * 0.09;
      ringGroup.rotation.x += (targetRotX - ringGroup.rotation.x) * 0.09;

      var rect = radial.getBoundingClientRect();
      markers.forEach(function(m){
        m.mesh.getWorldPosition(tmp);
        var depth = tmp.z; // roughly -R..R after rotation; used for depth cueing
        tmp.project(camera);
        var px = (tmp.x * 0.5 + 0.5) * rect.width;
        var py = (1 - (tmp.y * 0.5 + 0.5)) * rect.height;
        m.el.style.left = px + 'px';
        m.el.style.top = py + 'px';
        var scale = Math.max(0.72, 1 - Math.max(0, -depth) * 0.09);
        m.el.style.opacity = String(Math.max(0.45, 1 - Math.max(0, -depth) * 0.16));
        m.el.style.transform = 'translate(-50%,-50%) scale(' + scale.toFixed(3) + ')';
        m.el.style.zIndex = String(Math.round(100 + depth * 10));
      });

      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
})();
