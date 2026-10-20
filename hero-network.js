(async function(){
  "use strict";
  var canvas = document.getElementById('heroCanvas');
  var stage = document.getElementById('heroStage');
  if(!canvas || !stage) return;

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer:coarse)').matches;
  function hasWebGL(){
    try{
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    }catch(e){ return false; }
  }
  if(RM || coarse || !hasWebGL()) return;

  var THREE;
  try{ THREE = await import('./assets/vendor/three/three.module.min.js'); }
  catch(e){ return; }

  try{ initNetwork(THREE); }
  catch(e){ console.warn('Hero network failed, keeping the plain gradient background.', e); }

  function initNetwork(THREE){
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    var N = 70;
    var positions = new Float32Array(N * 3);
    var speeds = [];
    for(var i = 0; i < N; i++){
      // bias the field to the right/back half so it doesn't sit under the headline text
      var x = (Math.random() * 2 - 0.3) * 7.5;
      var y = (Math.random() * 2 - 1) * 4.5;
      var z = (Math.random() - 0.5) * 6 - 2;
      positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
      speeds.push(0.04 + Math.random() * 0.08);
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var pMat = new THREE.PointsMaterial({ color: 0x046A38, size: 0.09, transparent: true, opacity: 0.55, sizeAttenuation: true });
    var points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // connecting lines between nearby nodes, rebuilt each frame (cheap at N=70)
    var maxLines = N * 6;
    var linePositions = new Float32Array(maxLines * 2 * 3);
    var lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lGeo.setDrawRange(0, 0);
    var lMat = new THREE.LineBasicMaterial({ color: 0xE34222, transparent: true, opacity: 0.16 });
    var lines = new THREE.LineSegments(lGeo, lMat);
    scene.add(lines);

    var LINK_DIST = 3.1, LINK_DIST_SQ = LINK_DIST * LINK_DIST;

    function rebuildLinks(){
      var arr = pGeo.attributes.position.array;
      var idx = 0;
      for(var i = 0; i < N && idx < maxLines; i++){
        for(var j = i + 1; j < N && idx < maxLines; j++){
          var dx = arr[i*3]-arr[j*3], dy = arr[i*3+1]-arr[j*3+1], dz = arr[i*3+2]-arr[j*3+2];
          var d2 = dx*dx+dy*dy+dz*dz;
          if(d2 < LINK_DIST_SQ){
            linePositions[idx*6]   = arr[i*3];   linePositions[idx*6+1] = arr[i*3+1]; linePositions[idx*6+2] = arr[i*3+2];
            linePositions[idx*6+3] = arr[j*3];   linePositions[idx*6+4] = arr[j*3+1]; linePositions[idx*6+5] = arr[j*3+2];
            idx++;
          }
        }
      }
      lGeo.attributes.position.needsUpdate = true;
      lGeo.setDrawRange(0, idx * 2);
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

    // gentle parallax toward the pointer, subtle — this is ambient decoration, not a toy
    var targetRotY = 0, targetRotX = 0, rotY = 0, rotX = 0;
    window.addEventListener('pointermove', function(e){
      var r = stage.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      targetRotY = nx * 0.12;
      targetRotX = -ny * 0.06;
    }, { passive: true });

    var running = true;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ running = e.isIntersecting; });
    }, { threshold: 0.05 });
    io.observe(stage);

    var t = 0, lastT = performance.now();
    function frame(now){
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      if(!running) return;
      t += dt;

      var arr = pGeo.attributes.position.array;
      for(var i = 0; i < N; i++){
        arr[i*3+1] += Math.sin(t * speeds[i] + i) * 0.0018;
        arr[i*3]   += Math.cos(t * speeds[i] * 0.7 + i) * 0.0012;
      }
      pGeo.attributes.position.needsUpdate = true;
      rebuildLinks();

      rotY += (targetRotY - rotY) * 0.04;
      rotX += (targetRotX - rotX) * 0.04;
      points.rotation.y = rotY + t * 0.015;
      points.rotation.x = rotX;
      lines.rotation.y = points.rotation.y;
      lines.rotation.x = points.rotation.x;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
})();
