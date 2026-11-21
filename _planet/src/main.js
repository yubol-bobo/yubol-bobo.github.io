import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { R, PLACES, placeById, heightAt, buildWorld, buildCharacter, ringPoint, RING_AXES, STONE, STONE_FRONT, STONE_STAND, BOTTLE_STAND } from './world.js';
import { PANELS, papers, venueOf, drawCityMap, SITE, CLASSIC } from './content.js';

const $ = (s) => document.querySelector(s);
const UP = new THREE.Vector3(0, 1, 0);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NAV = ['home', 'research', 'news', 'journey', 'awards', 'teaching', 'blog', 'life', 'contact'];

/* ---------- reader view and static UI: works even without WebGL ---------- */
$('#reader-body').innerHTML = NAV.map((id) => `<section id="r-${id}"><h2>${PANELS[id].title}</h2>${PANELS[id].html()}</section>`).join('');
$('#places-list').innerHTML = NAV.map((id) => `<li><button data-go="${id}"><b>${PANELS[id].title}</b><span>${PANELS[id].place}</span></button></li>`).join('');
const openReader = () => { $('#reader').hidden = false; document.body.classList.add('reading'); wireFilters($('#reader-body')); const c = $('#reader-body #citymap'); if (c && !c.dataset.on) { c.dataset.on = 1; drawCityMap(c, $('#reader-body #cityname')); } $('#reader-close').focus(); };
const closeReader = () => { $('#reader').hidden = true; document.body.classList.remove('reading'); };
document.querySelectorAll('[data-reader]').forEach((b) => b.addEventListener('click', openReader));
$('#reader-close').addEventListener('click', closeReader);

function wireFilters(root) {
  root.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    root.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === chip));
    root.querySelectorAll('.paper').forEach((li) => { const p = papers.find((x) => x.key === li.dataset.key); li.hidden = !(f === 'all' || f === p.theme || (f === 'selected' && p.selected)); });
    root.querySelectorAll('section.theme').forEach((s) => { s.hidden = !s.querySelector('.paper:not([hidden])'); });
  }));
}

let game = null;
try { document.fonts.load('600 20px Fraunces'); document.fonts.load('400 20px "Instrument Sans"'); } catch (e) { /* older browsers */ }
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  try { game = start(); } catch (err) { console.error(err); document.body.classList.add('nogl'); $('#intro-note').textContent = 'This browser could not start the 3D planet. The classic site has everything.'; $('#begin').hidden = true; }
});

function start() {
  const canvas = $('#stage');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1200);
  scene.add(new THREE.HemisphereLight('#aab6ff', '#3a2f55', 0.55));

  const { world, anim, pick, clouds, stoneFace, stars, constellations, skyCenter } = buildWorld();
  scene.add(world);
  const hero = buildCharacter(); hero.position.y = R; hero.scale.setScalar(1.2); scene.add(hero);
  const heroLight = new THREE.PointLight('#ffe2b8', 2.2, 5, 1.5); heroLight.position.set(0, R + 1.6, 1.2); scene.add(heroLight);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.7, 0.9); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---- state ---- */
  const S = {
    mode: 'intro', open: null, travel: null, heading: 0, walk: 0, hs: 0.28, vel: new THREE.Vector2(), drag: null, inertia: new THREE.Vector2(),
    keys: new Set(), near: null, shift: 0, camPos: new THREE.Vector3(0, R + 16, 60), camLook: new THREE.Vector3(0, 3, 0), fov: 42, moved: false, hotStar: null,
  };
  const CAM = {
    intro: { pos: new THREE.Vector3(0, R + 16, 60), look: new THREE.Vector3(0, 3, 0), fov: 42 },
    ride: { pos: new THREE.Vector3(0, R + 5.4, 13.2), look: new THREE.Vector3(0, R + 1.5, 0), fov: 42 },
    play: { pos: new THREE.Vector3(0, R + 5.4, 13.2), look: new THREE.Vector3(0, R + 1.5, 0), fov: 42 },
    sky: { pos: new THREE.Vector3(0, R + 1.3, 7.5), look: new THREE.Vector3(), fov: 58 },
  };
  const playerLocal = () => UP.clone().applyQuaternion(world.quaternion.clone().invert());
  const bringToTop = (local) => { const w = local.clone().applyQuaternion(world.quaternion); world.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(w, UP)); };

  // start at the cabin, facing the camera
  { const h = placeById.home; world.quaternion.copy(targetQuat(h.standPoint, h.front)); }

  function targetQuat(s, front) {
    const q0 = world.quaternion;
    const q1 = new THREE.Quaternion().setFromUnitVectors(s.clone().applyQuaternion(q0), UP).multiply(q0);
    if (front) { const f = front.clone().applyQuaternion(q1); q1.premultiply(new THREE.Quaternion().setFromAxisAngle(UP, -Math.atan2(f.x, f.z))); }
    return q1;
  }
  function travelTo(s, front, onArrive) {
    const q0 = world.quaternion.clone(), q1 = targetQuat(s, front), angle = q0.angleTo(q1);
    if (angle < 0.01) { onArrive && onArrive(); return; }
    if (reduced) { world.quaternion.copy(q1); S.hs = Math.max(heightAt(playerLocal()), -0.02); onArrive && onArrive(); return; }
    S.travel = { q0, q1, t: 0, dur: THREE.MathUtils.clamp((angle * R) / 8.5, 0.7, 3.4), onArrive, s };
    S.inertia.set(0, 0);
  }
  function goTo(id, open = true) {
    const p = placeById[id]; closePanel(true); $('#places').hidden = true;
    if (S.mode === 'intro') begin(true);
    if (S.near && S.near.id === id && !S.travel && open) return visit(id);
    travelTo(p.standPoint, p.front, null);
  }

  /* ---- panel ---- */
  const panel = $('#panel');
  const remember = (id) => { try { history.replaceState(null, '', '#' + id); } catch (e) { /* sandboxed preview */ } };
  function visit(id) {
    const url = SITE + CLASSIC[id]; remember(id);
    if (__TARGET__ === '_self') location.href = url; else if (!window.open(url, '_blank', 'noopener')) toast('Your browser blocked the new tab. Use the Open page button.');
  }
  function openPanel(id) {
    const d = PANELS[id]; S.open = id;
    $('#panel-place').textContent = d.place; $('#panel-title').textContent = d.title; { const f = $('#panel-full'); f.href = SITE + CLASSIC[id]; f.target = __TARGET__; f.rel = 'noopener'; f.textContent = `Open the full ${d.title} page`; } $('#panel-body').innerHTML = d.html(); $('#panel-body').scrollTop = 0;
    panel.hidden = false; requestAnimationFrame(() => panel.classList.add('on'));
    document.body.classList.add('panel-open'); $('#near').hidden = true;
    if (id === 'research') { S.mode = 'sky'; document.body.classList.add('sky'); wireFilters(panel); wirePaperHover(); }
    if (id === 'life') drawCityMap($('#panel-body #citymap'), $('#panel-body #cityname'));
    $('#panel-close').focus({ preventScroll: true });
  }
  function closePanel(silent) {
    if (!S.open) return; S.open = null; panel.classList.remove('on'); document.body.classList.remove('panel-open', 'sky');
    setTimeout(() => { if (!S.open) panel.hidden = true; }, 380);
    if (S.mode === 'sky') S.mode = 'play'; setHot(null); starTip.hidden = true; canvas.style.cursor = ''; if (!silent) canvas.focus({ preventScroll: true });
  }
  $('#panel-close').addEventListener('click', () => closePanel());
  function wirePaperHover() {
    panel.querySelectorAll('.paper').forEach((li) => {
      li.addEventListener('pointerenter', () => setHot(li.dataset.key, false)); li.addEventListener('pointerleave', () => setHot(null));
    });
  }
  function setHot(key, scroll) {
    if (S.hotStar === key) return; S.hotStar = key;
    stars.forEach((s) => { s.userData.hot = s.userData.paper.key === key; });
    panel.querySelectorAll('.paper').forEach((li) => li.classList.toggle('hot', li.dataset.key === key));
    if (key && scroll) { const li = panel.querySelector(`.paper[data-key="${key}"]`); if (li) { if (li.hidden) panel.querySelector('.chip[data-filter="all"]').click(); li.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); } }
  }

  /* ---- labels ---- */
  const labelBox = $('#labels');
  const labels = PLACES.map((p) => {
    const el = document.createElement('button'); el.className = 'label'; el.innerHTML = `<b>${PANELS[p.id].title}</b><span>${PANELS[p.id].place}</span>`;
    el.addEventListener('click', () => goTo(p.id)); labelBox.appendChild(el);
    return { el, p, anchor: p.n.clone().multiplyScalar(R + (p.id === 'awards' ? 2.62 : p.plateau) + p.labelH) };
  });
  const conLabels = constellations.map((c) => { const el = document.createElement('div'); el.className = 'conlabel'; el.textContent = c.name; el.style.setProperty('--c', c.color); labelBox.appendChild(el); return { el, c }; });
  const starTip = $('#startip');
  const v3 = new THREE.Vector3();
  function project(local) {
    v3.copy(local).applyMatrix4(world.matrixWorld).project(camera);
    return { x: (v3.x * 0.5 + 0.5) * innerWidth, y: (-v3.y * 0.5 + 0.5) * innerHeight, front: v3.z < 1 };
  }

  /* ---- input ---- */
  const KEYMAP = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'Escape') { if (!$('#reader').hidden) closeReader(); else if (!$('#places').hidden) $('#places').hidden = true; else closePanel(); return; }
    if (!$('#reader').hidden) return;
    if (S.mode === 'intro') { if (e.key === 'Enter' && document.activeElement === document.body) begin(); return; }
    if (KEYMAP[e.code] && !e.metaKey && !e.ctrlKey) {
      if (e.code.startsWith('Arrow') && S.open && panel.contains(document.activeElement) && document.activeElement !== $('#panel-close')) return;
      if (S.mode === 'ride') hopOff();
      S.keys.add(e.code); e.preventDefault(); if (S.open) closePanel(true); S.travel = null;
    }
    if ((e.key === 'Enter' || e.key === 'e') && S.near && !S.open && (document.activeElement === document.body || document.activeElement === canvas)) visit(S.near.id);
  });
  addEventListener('keyup', (e) => S.keys.delete(e.code));
  addEventListener('blur', () => S.keys.clear());

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hitAt = (e, list) => { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); if (camera.view) { /* view offset handled by camera projection */ } ray.setFromCamera(ndc, camera); return ray.intersectObjects(list, false)[0]; };
  canvas.addEventListener('pointerdown', (e) => { if (S.mode === 'intro') return; canvas.setPointerCapture(e.pointerId); S.drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false }; S.inertia.set(0, 0); });
  canvas.addEventListener('pointermove', (e) => {
    if (S.drag) {
      const dx = e.clientX - S.drag.x, dy = e.clientY - S.drag.y; S.drag.x = e.clientX; S.drag.y = e.clientY;
      if (Math.hypot(e.clientX - S.drag.sx, e.clientY - S.drag.sy) > 6) S.drag.moved = true;
      if (S.drag.moved && S.mode === 'play') { if (S.open) closePanel(true); S.travel = null; S.inertia.set(-dx, -dy); stepBy(-dx * 0.0042, -dy * 0.0042); }
      return;
    }
    if (S.mode === 'sky') {
      const h = hitAt(e, stars);
      if (h) { const p = h.object.userData.paper; setHot(p.key, false); starTip.hidden = false; starTip.innerHTML = `<b>${p.title}</b><span>${venueOf(p)}, ${p.year}</span>`; starTip.style.transform = `translate(${Math.min(e.clientX + 16, innerWidth - 340)}px, ${e.clientY + 18}px)`; canvas.style.cursor = 'pointer'; }
      else { starTip.hidden = true; setHot(null); canvas.style.cursor = ''; }
    } else if (S.mode === 'play') { const h = hitAt(e, pick); canvas.style.cursor = h && (h.object.userData.place || h.object.userData.rhino || h.object.userData.egg) ? 'pointer' : 'grab'; }
  });
  const endDrag = (e) => {
    const d = S.drag; S.drag = null; if (!d || d.moved) return;
    if (S.mode === 'sky') { const h = hitAt(e, stars); if (h) setHot(null), setHot(h.object.userData.paper.key, true); return; }
    if (S.mode === 'ride') return hopOff();
    if (S.mode !== 'play') return;
    const h = hitAt(e, pick); if (!h) return;
    const egg = h.object.userData.egg;
    if (egg === 'train') return boardTrain();
    if (egg === 'stone') return travelTo(STONE_STAND, STONE_FRONT, pokeStone);
    if (egg === 'bottle') { const say = () => toast('You rowed all the way out here. Say hi: <a href="mailto:yubol@andrew.cmu.edu">yubol@andrew.cmu.edu</a>'); if (playerLocal().angleTo(BOTTLE_STAND) < 0.02) say(); else travelTo(BOTTLE_STAND, null, say); return; }
    if (h.object.userData.place) return goTo(h.object.userData.place);
    if (h.object.userData.rhino) return toast('Dürer drew this rhinoceros in 1515 without ever seeing one. Europe believed the drawing for two centuries. I study the modern version of that problem.');
    const local = h.point.clone().sub(world.position).applyQuaternion(world.quaternion.clone().invert()).normalize();
    closePanel(true); travelTo(local, null, null);
  };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', () => { S.drag = null; });

  function stepBy(ax, az) { // move the walker by (ax, az) radians along screen x / z
    const len = Math.hypot(ax, az); if (len < 1e-6) return;
    world.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(-az / len, 0, ax / len), len)).normalize();
    S.heading = Math.atan2(ax, az); S.walk = 1; S.lastStep = performance.now();
    if (!S.moved) { S.moved = true; $('#hint').classList.add('gone'); }
  }

  /* ---- intro ---- */
  function begin(fast) {
    if (S.mode !== 'intro') return; S.mode = 'play'; document.body.classList.remove('intro'); $('#intro').classList.add('gone');
    setTimeout(() => { $('#intro').hidden = true; }, 900);
    if (reduced || fast) { S.camPos.copy(CAM.play.pos); S.camLook.copy(CAM.play.look); }
    canvas.focus({ preventScroll: true });
  }
  $('#begin').addEventListener('click', () => begin());
  $('#places-btn').addEventListener('click', () => { $('#places').hidden = !$('#places').hidden; });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) { closeReader(); goTo(b.dataset.go); } else if (!e.target.closest('#places,#places-btn')) $('#places').hidden = true; });
  $('#near').addEventListener('click', () => S.near && remember(S.near.id));
  let toastT; function toast(msg) { const t = $('#toast'); t.innerHTML = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 12000); }

  /* ---- easter eggs ---- */
  const oracle = $('#oracle'), ORACLE = ['2 + 2 = 4.', 'Yes. 2 + 2 = 4.', 'I… believe it is 4.', 'You may have a point. Let me reconsider.', 'You are right, I apologize. 2 + 2 = 5.'];
  const FICKLE = 'https://aclanthology.org/2025.findings-acl.347/', WALK = (papers.find((p) => /Model Says Walk/.test(p.title)) || {}).link;
  const stoneAnchor = STONE.clone().multiplyScalar(R + heightAt(STONE) + 2.55), calm = new THREE.Color('#7fe0d0'), flipped = new THREE.Color('#ff7d95');
  let oi = -1;
  function pokeStone() {
    oi = oi >= ORACLE.length - 1 ? 0 : oi + 1; const last = oi === ORACLE.length - 1;
    oracle.querySelector('p').innerHTML = ORACLE[oi] + (last ? `<small>Nothing changed except that you kept asking. I measure how often real models give in like this: <a href="${FICKLE}" target="_blank" rel="noopener">Firm or Fickle? (ACL 2025)</a></small>` : '');
    oracle.querySelector('button').textContent = last ? 'Start over' : 'Are you sure?';
    stoneFace.emissive.copy(calm).lerp(flipped, oi / (ORACLE.length - 1)); oracle.hidden = false;
  }
  oracle.querySelector('button').addEventListener('click', pokeStone);
  function boardTrain() { closePanel(true); S.travel = null; S.inertia.set(0, 0); S.mode = 'ride'; S.rideT = 0; oracle.hidden = true; toast('All aboard. Click or press any arrow key to hop off.'); }
  function hopOff() { if (S.mode !== 'ride') return; S.mode = 'play'; $('#toast').hidden = true; }

  /* ---- resize ---- */
  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w, h);
    camera.aspect = w / h; world.userData.starMat.uniforms.px.value = renderer.getPixelRatio();
  }
  addEventListener('resize', resize); resize();

  /* ---- loop ---- */
  const clock = new THREE.Clock(); let T = 0;
  const { legL, legR, armL, armR, body, row } = hero.userData;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05); T += dt;
    S.walk = Math.max(0, S.walk - dt * 6);

    if (S.mode === 'ride') {
      const th = T * 0.22 - 0.27, n = ringPoint(th), w = n.clone().applyQuaternion(world.quaternion);
      world.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(w, UP).multiply(world.quaternion), Math.min(1, dt * 5)).normalize();
      const f = RING_AXES.x.clone().multiplyScalar(-Math.sin(th)).addScaledVector(RING_AXES.z, Math.cos(th)).applyQuaternion(world.quaternion); S.heading = Math.atan2(f.x, f.z);
      S.rideT += dt; if (S.rideT > (Math.PI * 2) / 0.22) { hopOff(); goTo('journey', false); }
    } else if (S.travel) {
      const tr = S.travel; tr.t = Math.min(1, tr.t + dt / tr.dur);
      world.quaternion.slerpQuaternions(tr.q0, tr.q1, ease(tr.t));
      const sw = tr.s.clone().applyQuaternion(world.quaternion); if (Math.hypot(sw.x, sw.z) > 0.03) S.heading = Math.atan2(sw.x, sw.z);
      S.walk = 1;
      if (tr.t >= 1) { S.travel = null; S.heading = Math.PI; tr.onArrive && tr.onArrive(); }
    } else if (S.mode === 'play') {
      let kx = 0, kz = 0; S.keys.forEach((k) => { kx += KEYMAP[k][0]; kz += KEYMAP[k][1]; });
      const kl = Math.hypot(kx, kz); if (kl) { kx /= kl; kz /= kl; }
      S.vel.x += (kx - S.vel.x) * Math.min(1, dt * 9); S.vel.y += (kz - S.vel.y) * Math.min(1, dt * 9);
      if (S.vel.lengthSq() > 0.002) stepBy((S.vel.x * 5.2 * dt) / R, (S.vel.y * 5.2 * dt) / R);
      if (!S.drag && S.inertia.lengthSq() > 0.3) { S.inertia.multiplyScalar(Math.pow(0.0025, dt)); stepBy(S.inertia.x * 0.0042, S.inertia.y * 0.0042); }
      // keep the walker out of buildings
      const pl = playerLocal();
      for (const p of PLACES) { const block = p.id === 'awards' ? 0.02 : p.id === 'contact' ? 0 : 0.085; const a = Math.acos(Math.min(1, pl.dot(p.n))); if (a < block) { const out = pl.clone().addScaledVector(p.n, -pl.dot(p.n)).normalize(); bringToTop(p.n.clone().multiplyScalar(Math.cos(block)).addScaledVector(out.lengthSq() ? out : p.front, Math.sin(block)).normalize()); } }
    } else if (S.mode === 'intro' && !reduced) {
      world.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(UP, dt * 0.05));
    }

    // ground follow and walker animation
    const pl = playerLocal(), gh = S.mode === 'ride' ? 0.72 : heightAt(pl), afloat = gh < -0.03;
    if (S.mode !== 'intro' && !S.lapDone) { if (!S.lap0) S.lap0 = pl.clone(); const a = pl.angleTo(S.lap0), onFoot = performance.now() - (S.lastStep || 0) < 600; if (a > 2.6 && onFoot) S.lapFar = true; else if (S.lapFar && a < 0.3 && onFoot) { S.lapDone = true; toast(`You walked all the way around the planet. <a href="${WALK}" target="_blank" rel="noopener">The Model Says Walk.</a>`); } }
    if (!oracle.hidden) { const up = v3.copy(STONE).applyQuaternion(world.quaternion).y; if (pl.angleTo(STONE) > 0.45 || up < 0.3 || S.mode !== 'play') oracle.hidden = true; }
    S.hs += (Math.max(gh, -0.02) - S.hs) * Math.min(1, dt * 9);
    world.position.y = S.mode === 'intro' ? 0 : -S.hs;
    hero.visible = S.mode !== 'intro';
    let dh = S.heading - hero.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); hero.rotation.y += dh * Math.min(1, dt * 10);
    const sw = Math.sin(T * 11) * 0.7 * S.walk;
    legL.rotation.x = afloat ? 0 : sw; legR.rotation.x = afloat ? 0 : -sw; armL.rotation.x = afloat ? -0.6 + sw * 0.5 : -sw; armR.rotation.x = afloat ? -0.6 - sw * 0.5 : sw;
    row.visible = afloat; body.position.y = afloat ? -0.12 + Math.sin(T * 2) * 0.02 : Math.abs(Math.sin(T * 11)) * 0.035 * S.walk;
    row.position.y = Math.sin(T * 2) * 0.02; legL.visible = legR.visible = !afloat;

    anim.forEach((f) => f(T, dt));
    world.updateMatrixWorld(true);

    // camera
    const c = CAM[S.mode];
    if (S.mode === 'sky') c.look.copy(skyCenter).applyMatrix4(world.matrixWorld);
    const k = reduced ? 1 : Math.min(1, dt * (S.mode === 'play' ? 1.9 : 2.4));
    S.camPos.lerp(c.pos, k); S.camLook.lerp(c.look, k); S.fov += (c.fov - S.fov) * k;
    camera.position.copy(S.camPos); camera.lookAt(S.camLook); camera.fov = S.fov;
    const wide = innerWidth > 900, target = S.open && wide ? 1 : 0; S.shift += (target - S.shift) * (reduced ? 1 : Math.min(1, dt * 5));
    if (S.shift > 0.002) camera.setViewOffset(innerWidth, innerHeight, S.shift * Math.min(520, innerWidth * 0.4) * 0.5, 0, innerWidth, innerHeight); else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    for (const cl of clouds) { const d = cl.getWorldPosition(v3).distanceTo(camera.position); cl.userData.mat.opacity = 0.92 * THREE.MathUtils.smoothstep(d, 7, 15); cl.visible = d > 7; }

    // labels
    const showPlaces = S.mode === 'play' || S.mode === 'ride';
    if (!oracle.hidden) { const s = project(stoneAnchor); oracle.style.transform = `translate(-50%,-100%) translate(${s.x.toFixed(1)}px, ${(s.y - 10).toFixed(1)}px)`; }
    for (const L of labels) {
      const up = v3.copy(L.p.n).applyQuaternion(world.quaternion).y; const vis = showPlaces && up > 0.3 && !(S.open === L.p.id);
      if (vis) { const s = project(L.anchor); L.el.style.transform = `translate(-50%,-100%) translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`; L.el.style.opacity = Math.min(1, (up - 0.3) * 4).toFixed(2); }
      if (L.vis !== vis) { L.vis = vis; L.el.classList.toggle('off', !vis); }
    }
    for (const L of conLabels) { const vis = S.mode === 'sky'; if (vis) { const s = project(L.c.anchor); L.el.style.transform = `translate(-50%,0) translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`; } if (L.vis !== vis) { L.vis = vis; L.el.classList.toggle('off', !vis); } L.c.line.material.opacity = THREE.MathUtils.lerp(L.c.line.material.opacity, vis ? 0.6 : 0.22, 0.05); }

    // what is nearby
    let near = null, best = 0.105;
    if (S.mode === 'play' && !S.travel) for (const p of PLACES) { const a = Math.acos(Math.min(1, pl.dot(p.standPoint))); if (a < best) { best = a; near = p; } }
    if (near !== S.near) { S.near = near; const n = $('#near'); if (near) { n.querySelector('b').textContent = PANELS[near.id].title; n.querySelector('span').textContent = PANELS[near.id].place; n.href = SITE + CLASSIC[near.id]; n.target = __TARGET__; n.rel = 'noopener'; } n.hidden = !near || !!S.open; }

    S.frames = (S.frames || 0) + 1;
    composer.render(dt);
    requestAnimationFrame(frame);
  }
  { const id = location.hash.slice(1); if (placeById[id]) { const p = placeById[id]; world.quaternion.copy(targetQuat(p.standPoint, p.front)); S.heading = Math.PI; S.hs = p.id === 'awards' ? 2.62 : 0.28; begin(true); } }
  frame();
  document.body.classList.add('ready');
  return { goTo, begin, S, openPanel, travelTo, visit, boardTrain, pokeStone, pts: { STONE_STAND, STONE_FRONT, BOTTLE_STAND } };
}
window.__world = () => game;
