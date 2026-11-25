import * as THREE from 'three';

/*
 * The arrival: the first few seconds on the planet.
 * Stardust streams past and slows, the camera drifts in from deep space while dawn comes up,
 * the forest and the landmarks pop up outward from the cabin, the lamps catch one by one,
 * and the paper constellations connect star by star. Text timing lives in style.css (body.arrive).
 * Plays once per browser session; skipped for reduced motion, deep links and any click or key.
 */
const DUR = 3.8;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const outQuint = (x) => 1 - Math.pow(1 - clamp01(x), 5);
const outBack = (x) => { const t = clamp01(x), c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const hash = (n) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };

export function makeArrival({ scene, camera, renderer, world, PLACES, home, forest, stars, constellations }, play) {
  const A = { t: play ? 0 : 1, playing: play };
  if (!play) return { A, update() {}, finish() {}, camera() { return false; }, cloud: () => 1 };

  const baseExposure = renderer.toneMappingExposure;
  const homeN = home.n;
  const along = (n) => Math.acos(THREE.MathUtils.clamp(n.dot(homeN), -1, 1)) / Math.PI; // 0 at the cabin, 1 on the far side

  /* stardust: short warm streaks flying past the camera, slowing to a stop */
  const N = 200, pos = new Float32Array(N * 6), end = new Float32Array(N * 2), spd = new Float32Array(N * 2), hue = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const a = hash(i) * Math.PI * 2, r = 3 + Math.pow(hash(i + 0.5), 0.7) * 28, z = hash(i + 0.25), s = 0.5 + hash(i + 0.75) * 0.8, h = hash(i + 0.9);
    for (let k = 0; k < 2; k++) { pos.set([Math.cos(a) * r, Math.sin(a) * r * 0.75, z], i * 6 + k * 3); end[i * 2 + k] = k; spd[i * 2 + k] = s; hue[i * 2 + k] = h; }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(spd, 1)); geo.setAttribute('aHue', new THREE.BufferAttribute(hue, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uWarp: { value: 1 } },
    vertexShader: `attribute float aEnd; attribute float aSpeed; attribute float aHue; uniform float uTime; uniform float uWarp; varying float vA; varying float vHue;
      void main(){
        float travel = uTime * aSpeed * 60.0 * (0.25 + 0.75 * uWarp);
        float z = -90.0 + mod(position.z * 90.0 + travel, 90.0);
        z -= aEnd * (0.3 + 5.5 * uWarp) * aSpeed;
        vA = uWarp * smoothstep(-90.0, -55.0, z) * smoothstep(-0.5, -6.0, z) * (1.0 - aEnd * 0.9);
        vHue = aHue;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, z, 1.0);
      }`,
    fragmentShader: `varying float vA; varying float vHue;
      void main(){
        vec3 lamp = vec3(1.0, 0.82, 0.48), sea = vec3(0.50, 0.88, 0.82), dusk = vec3(0.78, 0.80, 1.0);
        vec3 c = vHue < 0.45 ? lamp : (vHue < 0.7 ? sea : dusk);
        gl_FragColor = vec4(c * 1.4, vA * 0.75);
      }`,
  });
  const dust = new THREE.LineSegments(geo, dustMat); dust.frustumCulled = false; dust.renderOrder = 10;
  scene.add(camera); camera.add(dust);

  /* the lamps: every glowing material and point light on the planet, each with its own moment to catch */
  const lamps = [], seen = new Set();
  world.traverse((o) => {
    if (o.isPointLight) lamps.push({ o, key: 'intensity', base: o.intensity, d: hash(lamps.length + 3.3) });
    const m = o.isMesh && !o.isInstancedMesh ? o.material : null;
    if (m && m.emissiveIntensity > 0 && m.emissive && m.emissive.getHex() && !seen.has(m)) { seen.add(m); lamps.push({ o: m, key: 'emissiveIntensity', base: m.emissiveIntensity, d: hash(lamps.length + 7.1) }); }
  });

  /* the pop-up: landmarks and the forest grow from the ground outward from the cabin */
  const sites = PLACES.map((p) => ({ g: p.group, base: p.group.matrix.clone(), d: along(p.n) }));
  const trees = forest.map((f) => ({ ...f, d: f.spots.map(along), j: f.spots.map((_, i) => hash(i * 1.7 + f.spots.length)) }));
  const m4 = new THREE.Matrix4(), sc = new THREE.Matrix4();

  /* the constellations connect star by star */
  const cons = constellations.map((c, ci) => ({ line: c.line, n: c.line.geometry.attributes.position.count, ci }));
  const starsOf = cons.map((c) => stars.filter((s) => c.line && s.userData.paper && s.userData.paper.theme === constellations[c.ci].key));

  const camFar = new THREE.Vector3();
  function apply(u, T) {
    dustMat.uniforms.uWarp.value = 1 - smooth(u / 0.5);
    dustMat.uniforms.uTime.value = T;
    dust.visible = u < 0.55;
    renderer.toneMappingExposure = baseExposure * (0.32 + 0.68 * smooth((u - 0.04) / 0.5));

    for (const L of lamps) {
      const r = clamp01((u - (0.3 + L.d * 0.32)) / 0.1);
      const flick = r > 0 && r < 1 ? (hash(Math.floor(T * 26) + L.d * 50) > 0.45 ? 1 : 0.25) : 1;
      L.o[L.key] = L.base * r * flick;
    }
    for (const s of sites) {
      const k = outBack((u - 0.26 - s.d * 0.34) / 0.2);
      s.g.matrix.copy(s.base).multiply(sc.makeScale(Math.max(k, 0.001), Math.max(k, 0.001), Math.max(k, 0.001))); s.g.matrixWorldNeedsUpdate = true;
    }
    for (const f of trees) {
      for (let i = 0; i < f.base.length; i++) {
        const k = Math.max(0.001, outBack((u - 0.2 - f.d[i] * 0.4 - f.j[i] * 0.06) / 0.16));
        f.im.setMatrixAt(i, m4.copy(f.base[i]).multiply(sc.makeScale(k, k, k)));
      }
      f.im.instanceMatrix.needsUpdate = true;
    }
    cons.forEach((c, ci) => {
      const lit = (u - 0.56 - ci * 0.05) / 0.3;
      c.line.geometry.setDrawRange(0, Math.max(0, Math.min(c.n, Math.floor(lit * c.n) + 1)));
      if (lit <= 0) c.line.geometry.setDrawRange(0, 0);
      starsOf[ci].forEach((s, i) => { s.scale.multiplyScalar(Math.max(0.001, outBack((lit - i / c.n) * 3.2))); });
    });
  }

  function finish() {
    if (A.t >= 1 && !A.playing) return;
    A.t = 1; A.playing = false;
    apply(1, 0);
    for (const L of lamps) L.o[L.key] = L.base;
    for (const s of sites) { s.g.matrix.copy(s.base); s.g.matrixWorldNeedsUpdate = true; }
    for (const f of trees) { f.base.forEach((b, i) => f.im.setMatrixAt(i, b)); f.im.instanceMatrix.needsUpdate = true; }
    for (const c of cons) c.line.geometry.setDrawRange(0, Infinity);
    renderer.toneMappingExposure = baseExposure;
    camera.remove(dust); geo.dispose(); dustMat.dispose();
  }

  return {
    A,
    finish,
    update(dt, T) {
      if (!A.playing) return;
      if (!A.started) { A.started = true; document.body.classList.add('live'); }
      A.t = Math.min(1, A.t + dt / DUR);
      apply(A.t, T);
      if (A.t >= 1) finish();
    },
    // the fly-in: from far out and a quarter turn round, so the terminator sweeps past like a sunrise
    camera(S, intro) {
      if (!A.playing) return false;
      const k = outQuint(A.t / 0.82);
      const f = 1 + 3.4 * (1 - k), az = -0.95 * (1 - k);
      camFar.copy(intro.pos).sub(intro.look).multiplyScalar(f).applyAxisAngle(THREE.Object3D.DEFAULT_UP, az);
      camFar.y += 14 * (1 - k);
      S.camPos.copy(intro.look).add(camFar); S.camLook.copy(intro.look); S.fov = intro.fov + 20 * (1 - k);
      return true;
    },
    cloud: () => (A.playing ? smooth((A.t - 0.45) / 0.35) : 1),
  };
}
