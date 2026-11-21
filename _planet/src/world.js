import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { papers, life, THEMES } from './content.js';

export const R = 12;
const D2R = Math.PI / 180;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const dirOf = (lat, lon) => V(Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(lon * D2R));
const angDeg = (a, b) => Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1)) / D2R;
const smooth = (e0, e1, x) => { const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

export const SUN = dirOf(10, 0);
const OCEAN = dirOf(0, 295);
const PEAK = dirOf(58, 5);
const RING_C = dirOf(-25, 96), RING_A = 13;

/* ---------- deterministic noise ---------- */
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const f = (t) => t * t * (3 - 2 * t);
  const u = f(x - xi), v = f(y - yi), w = f(z - zi);
  const L = THREE.MathUtils.lerp;
  return L(L(L(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), L(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
    L(L(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), L(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v), w);
}
const fbm = (p, s) => vnoise(p.x * s, p.y * s, p.z * s) * 0.6 + vnoise(p.x * s * 2.1 + 9, p.y * s * 2.1, p.z * s * 2.1) * 0.3 + vnoise(p.x * s * 4.3, p.y * s * 4.3 + 5, p.z * s * 4.3) * 0.1;

/* ---------- places ---------- */
const tangentAway = (n, from) => { const t = n.clone().sub(from); t.addScaledVector(n, -t.dot(n)); return t.normalize(); };
const south = (n) => tangentAway(n, V(0, 1, 0));
const RING_AXES = (() => { const x = tangentAway(RING_C, V(0, 1, 0)); return { x, z: RING_C.clone().cross(x) }; })();
const ringPoint = (theta, a = RING_A) => RING_C.clone().multiplyScalar(Math.cos(a * D2R))
  .addScaledVector(RING_AXES.x, Math.sin(a * D2R) * Math.cos(theta)).addScaledVector(RING_AXES.z, Math.sin(a * D2R) * Math.sin(theta)).normalize();

const P = (id, n, flat, stand, labelH, front) => ({ id, n, flat, stand, labelH, front: front || south(n), plateau: 0.28 });
export const PLACES = [
  P('home', dirOf(20, 55), 6.5, 2.1, 2.4),
  P('awards', PEAK, 2.6, 0.75, 1.5),
  P('teaching', dirOf(-18, 18), 6.5, 2.3, 2.2),
  P('journey', ringPoint(0, RING_A + 2.2), 5.5, 1.5, 2.2, tangentAway(ringPoint(0, RING_A + 2.2), RING_C)),
  P('blog', dirOf(55, 122), 6.5, 2.0, 3.6),
  P('life', dirOf(-38, 148), 7, 2.4, 2.3),
  P('research', dirOf(22, 186), 6.5, 2.4, 2.7),
  P('news', dirOf(19, 258), 5, 1.9, 3.9, tangentAway(dirOf(19, 258), OCEAN)),
  P('contact', dirOf(-22, 259), 4.5, 1.2, 2.0, tangentAway(dirOf(-22, 259), OCEAN)),
];
PLACES.forEach((p) => {
  p.standPoint = p.n.clone().multiplyScalar(Math.cos(p.stand / R)).addScaledVector(p.front, Math.sin(p.stand / R)).normalize();
});
export const placeById = Object.fromEntries(PLACES.map((p) => [p.id, p]));

export function heightAt(n) {
  let h = 0.56 + (fbm(n, 2.3) - 0.5) * 1.5;
  h = THREE.MathUtils.lerp(h, -0.85 + (fbm(n, 5) - 0.5) * 0.3, smooth(41, 30, angDeg(n, OCEAN)));
  const pa = angDeg(n, PEAK);
  h += 2.5 * Math.exp(-(pa * pa) / 110) * (0.85 + 0.3 * vnoise(n.x * 9, n.y * 9, n.z * 9));
  const ra = Math.abs(angDeg(n, RING_C) - RING_A);
  h = THREE.MathUtils.lerp(h, 0.28, smooth(3.6, 1.6, ra));
  for (const p of PLACES) {
    const a = angDeg(n, p.n);
    if (a < p.flat * 1.7) h = THREE.MathUtils.lerp(h, p.id === 'awards' ? 2.62 : p.plateau, smooth(p.flat * 1.7, p.flat * 0.75, a));
  }
  return h;
}

/* ---------- small builders ---------- */
const mats = new Map();
const mat = (color, o = {}) => {
  const k = color + JSON.stringify(o);
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...o }));
  return mats.get(k);
};
const glow = (color, i = 2.2) => mat(color, { emissive: color, emissiveIntensity: i });
const mesh = (geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const box = (w, h, d, m, ...p) => mesh(new THREE.BoxGeometry(w, h, d), m, ...p);
const cyl = (rt, rb, h, seg, m, ...p) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, ...p);
const cone = (r, h, seg, m, ...p) => mesh(new THREE.ConeGeometry(r, h, seg), m, ...p);
const ball = (r, det, m, ...p) => mesh(new THREE.IcosahedronGeometry(r, det), m, ...p);
const G = (...kids) => { const g = new THREE.Group(); kids.forEach((k) => g.add(k)); return g; };
const light = (color, intensity, dist, x, y, z) => { const l = new THREE.PointLight(color, intensity, dist, 1.6); l.position.set(x, y, z); return l; };

function basis(n, front, lift = 0) {
  const z = front.clone().addScaledVector(n, -front.dot(n)).normalize();
  const x = n.clone().cross(z);
  return new THREE.Matrix4().makeBasis(x, n, z).setPosition(n.clone().multiplyScalar(R + heightAt(n) + lift));
}
function placeOn(obj, n, front, lift = 0) { obj.matrixAutoUpdate = false; obj.matrix.copy(basis(n, front, lift)); obj.matrixWorldNeedsUpdate = true; return obj; }

const C = {
  wood: '#b98155', woodDark: '#6e4a3a', plum: '#8a3f5c', cream: '#efe6d6', stone: '#b9b3c9', stoneDark: '#77718f',
  lamp: '#ffd27a', navy: '#1c2748', skin: '#e9b78f', white: '#f6f4ef', teal: '#3fa39a', rose: '#ff9db0', orange: '#ef8d4c',
};

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function lampPost(x, z, h = 1.2) {
  return G(cyl(0.03, 0.04, h, 5, mat(C.woodDark), x, h / 2, z), ball(0.1, 0, glow(C.lamp, 3), x, h + 0.08, z));
}

/* ---------- landmark models (front is +Z) ---------- */
function buildCabin(anim) {
  const g = G(
    box(1.8, 1.0, 1.35, mat(C.wood), 0, 0.5, 0),
    box(1.86, 0.12, 1.41, mat(C.woodDark), 0, 0.06, 0),
    mesh(new THREE.ConeGeometry(1.42, 0.85, 4), mat(C.plum), 0, 1.42, 0, 0, Math.PI / 4, 0),
    box(0.24, 0.6, 0.24, mat(C.stoneDark), 0.5, 1.5, -0.2),
    box(0.34, 0.62, 0.06, mat(C.woodDark), -0.35, 0.37, 0.69),
    box(0.46, 0.36, 0.06, glow(C.lamp, 2.6), 0.42, 0.58, 0.69),
    box(0.06, 0.36, 0.46, glow(C.lamp, 2.6), 0.91, 0.58, 0),
    box(0.5, 0.05, 0.3, mat(C.stone), -0.35, 0.03, 0.9),
    lampPost(-1.25, 0.95, 1.0),
    box(0.05, 0.6, 0.05, mat(C.woodDark), 1.3, 0.3, 1.0), box(0.5, 0.26, 0.05, mat(C.cream), 1.3, 0.62, 1.0),
    light('#ffc070', 7, 7, 0.4, 0.7, 1.4),
  );
  g.children[2].scale.set(1, 1, 0.8);
  for (let i = 0; i < 5; i++) { const s = ball(0.13, 0, mat('#d9d5e6', { transparent: true, opacity: 0.7 })); g.add(s); anim.push((t) => { const k = (t * 0.22 + i / 5) % 1; s.position.set(0.5 + Math.sin(k * 5 + i) * 0.12 + k * 0.35, 1.85 + k * 1.6, -0.2); s.scale.setScalar(0.5 + k * 1.4); s.material.opacity = 0.7 * (1 - k); }); }
  return g;
}

function buildSummit(anim) {
  const g = G(ball(0.26, 0, mat(C.stone), 0, 0.14, 0), ball(0.19, 0, mat(C.stoneDark), 0.02, 0.44, 0), ball(0.12, 0, mat(C.stone), 0, 0.66, 0));
  const cols = [C.lamp, '#7fe0d0', C.rose, C.white];
  cols.forEach((c, i) => {
    const a = (i / 4) * Math.PI * 2 + 0.6, x = Math.cos(a) * 0.62, z = Math.sin(a) * 0.62, h = 1.0 + (i % 2) * 0.25;
    g.add(cyl(0.02, 0.02, h, 4, mat(C.white), x, h / 2, z));
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.42, -0.11); s.lineTo(0, -0.22);
    const f = mesh(new THREE.ShapeGeometry(s), mat(c, { side: THREE.DoubleSide, emissive: c, emissiveIntensity: 0.35 }), x, h, z);
    g.add(f); anim.push((t) => { f.rotation.y = 0.6 + Math.sin(t * 2.2 + i) * 0.35; });
  });
  return g;
}

function buildClassroom() {
  const tex = canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = '#24483f'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.fillStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.lineCap = 'round';
    c.font = 'italic 600 44px Fraunces, Georgia, serif'; c.fillText('AI agents', 28, 62);
    c.font = '400 22px "Instrument Sans", sans-serif'; c.fillStyle = 'rgba(255,255,255,.7)';
    ['plan', 'act', 'observe'].forEach((s, i) => {
      const x = 80 + i * 150; c.strokeRect(x - 52, 120, 104, 52); c.fillText(s, x - c.measureText(s).width / 2, 153);
      if (i < 2) { c.beginPath(); c.moveTo(x + 58, 146); c.lineTo(x + 92, 146); c.lineTo(x + 84, 139); c.moveTo(x + 92, 146); c.lineTo(x + 84, 153); c.stroke(); }
    });
    c.beginPath(); c.moveTo(380, 178); c.quadraticCurveTo(230, 240, 80, 178); c.lineTo(90, 190); c.moveTo(80, 178); c.lineTo(94, 174); c.stroke();
  });
  const g = G(
    box(2.1, 1.15, 0.08, mat(C.woodDark), 0, 1.15, -0.4),
    mesh(new THREE.PlaneGeometry(1.95, 1.0), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }), 0, 1.15, -0.355),
    box(0.08, 0.6, 0.08, mat(C.woodDark), -0.85, 0.3, -0.4), box(0.08, 0.6, 0.08, mat(C.woodDark), 0.85, 0.3, -0.4),
    box(1.6, 0.04, 0.1, mat(C.wood), 0, 0.56, -0.33),
    lampPost(-1.5, -0.3, 1.5), lampPost(1.5, -0.3, 1.5),
  );
  [[-0.75, 0.6], [0, 0.72], [0.75, 0.6], [-1.15, 1.35], [-0.38, 1.5], [0.38, 1.5], [1.15, 1.35]].forEach(([x, z]) => {
    g.add(box(0.55, 0.07, 0.22, mat(C.wood), x, 0.24, z, 0, -x * 0.3, 0), box(0.07, 0.2, 0.18, mat(C.woodDark), x, 0.1, z, 0, -x * 0.3, 0));
  });
  return g;
}

function buildStation() {
  const g = G(
    box(2.8, 0.2, 1.1, mat(C.stone), 0, 0.1, 0),
    box(3.0, 0.1, 1.35, mat(C.plum), 0, 1.42, 0, 0.12, 0, 0),
    box(0.9, 0.34, 0.06, mat(C.cream), 0, 1.08, 0.5),
    box(1.0, 0.07, 0.3, mat(C.wood), -0.7, 0.42, -0.1), box(0.07, 0.24, 0.26, mat(C.woodDark), -1.1, 0.3, -0.1), box(0.07, 0.24, 0.26, mat(C.woodDark), -0.3, 0.3, -0.1),
    cyl(0.17, 0.17, 0.06, 12, mat(C.white, { emissive: C.lamp, emissiveIntensity: 0.9 }), 0.9, 1.05, 0.5, Math.PI / 2, 0, 0),
    ball(0.09, 0, glow(C.lamp, 3), -1.1, 1.25, 0.45), ball(0.09, 0, glow(C.lamp, 3), 1.25, 1.25, 0.45),
    light('#ffc070', 5, 6, 0, 1.1, 0.9),
  );
  [[-1.25, 0.45], [1.25, 0.45], [-1.25, -0.45], [1.25, -0.45]].forEach(([x, z]) => g.add(cyl(0.05, 0.05, 1.25, 5, mat(C.woodDark), x, 0.8, z)));
  return g;
}

function buildTree(anim) {
  const g = G(
    cyl(0.2, 0.34, 1.9, 6, mat(C.woodDark), 0, 0.95, -0.5, 0, 0, 0.06),
    cyl(0.09, 0.14, 1.1, 5, mat(C.woodDark), 0.45, 2.0, -0.5, 0, 0, -0.9),
    cyl(0.09, 0.14, 1.1, 5, mat(C.woodDark), -0.5, 2.1, -0.45, 0, 0, 0.85),
    box(0.95, 0.06, 0.5, mat(C.wood), 0.35, 0.52, 0.55), box(0.06, 0.5, 0.06, mat(C.woodDark), -0.07, 0.25, 0.55), box(0.06, 0.5, 0.06, mat(C.woodDark), 0.77, 0.25, 0.55),
    box(0.3, 0.3, 0.3, mat(C.wood), 0.35, 0.15, 1.05),
    box(0.26, 0.02, 0.2, mat(C.white), 0.2, 0.56, 0.55, 0, 0.3, 0), box(0.22, 0.05, 0.16, mat(C.plum), 0.62, 0.575, 0.6, 0, -0.4, 0),
    box(0.1, 0.16, 0.1, glow(C.lamp, 3.2), 0.66, 0.68, 0.42),
    light('#ffcf8a', 4, 5, 0.6, 0.9, 0.6),
  );
  const cols = ['#9b7fd1', '#b79be6', '#8466c2', '#c7b0ee', '#a58ad8'];
  [[0, 3.0, -0.5, 1.05], [0.95, 2.6, -0.4, 0.8], [-1.0, 2.75, -0.45, 0.85], [0.3, 2.5, 0.25, 0.7], [-0.4, 3.4, -0.9, 0.75], [0.55, 3.45, -0.7, 0.65], [-0.5, 2.4, 0.1, 0.55]]
    .forEach(([x, y, z, r], i) => g.add(ball(r, 1, mat(cols[i % 5], { emissive: cols[i % 5], emissiveIntensity: 0.12 }), x, y, z)));
  const N = 46, pos = new Float32Array(N * 3), ph = [];
  for (let i = 0; i < N; i++) ph.push([rnd() * 3.4 - 1.7, rnd(), rnd() * 2.6 - 1.6, 0.5 + rnd() * 0.6]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#d9c4ff', size: 0.075, transparent: true, opacity: 0.95 })));
  anim.push((t) => { ph.forEach(([x, o, z, s], i) => { const k = (t * 0.12 * s + o) % 1; pos[i * 3] = x + Math.sin(k * 9 + i) * 0.25; pos[i * 3 + 1] = 2.7 * (1 - k); pos[i * 3 + 2] = z + Math.cos(k * 7 + i) * 0.2; }); geo.attributes.position.needsUpdate = true; });
  return g;
}

function buildCamp(anim) {
  const tent = mesh(new THREE.ConeGeometry(0.95, 1.05, 4), mat(C.orange), -0.95, 0.52, -0.5, 0, Math.PI / 4, 0);
  const flameA = cone(0.16, 0.5, 5, glow('#ffb347', 4), 0.55, 0.36, 0.5), flameB = cone(0.1, 0.34, 5, glow('#ffe08a', 5), 0.55, 0.3, 0.5);
  const fire = light('#ff9a4a', 12, 8, 0.55, 0.6, 0.5);
  const g = G(tent, mesh(new THREE.ConeGeometry(0.42, 0.7, 3), mat('#3a2536'), -0.62, 0.34, -0.17, 0, Math.PI / 4 + 0.52, 0),
    flameA, flameB, fire,
    cyl(0.06, 0.06, 0.5, 5, mat(C.woodDark), 0.55, 0.07, 0.5, Math.PI / 2, 0, 0.5), cyl(0.06, 0.06, 0.5, 5, mat(C.woodDark), 0.55, 0.07, 0.5, Math.PI / 2, 0, -0.6), cyl(0.06, 0.06, 0.5, 5, mat(C.woodDark), 0.55, 0.07, 0.5, Math.PI / 2, 0, 1.6),
    cyl(0.16, 0.16, 0.55, 6, mat(C.wood), 1.25, 0.16, 0.9, 0, 0, Math.PI / 2), cyl(0.16, 0.16, 0.55, 6, mat(C.wood), -0.1, 0.16, 1.15, Math.PI / 2, 0, 0.9),
    cyl(0.035, 0.035, 1.7, 5, mat(C.woodDark), -1.9, 0.85, -1.0), cyl(0.035, 0.035, 1.7, 5, mat(C.woodDark), 1.9, 0.85, -1.0),
  );
  anim.push((t) => { const f = 0.85 + Math.sin(t * 11) * 0.12 + Math.sin(t * 23.3) * 0.08; flameA.scale.set(f, 0.8 + f * 0.4, f); flameB.scale.set(1, 0.7 + f * 0.5, 1); fire.intensity = 10 + f * 5; });
  const loader = new THREE.TextureLoader();
  life.forEach((l, i) => {
    const u = (i + 0.5) / 6, x = -1.9 + u * 3.8, sag = Math.sin(u * Math.PI) * 0.22, y = 1.66 - sag;
    const tx = loader.load(l.tex); tx.colorSpace = THREE.SRGBColorSpace;
    const card = G(box(0.44, 0.52, 0.015, mat(C.white, { emissive: '#fff', emissiveIntensity: 0.12 }), 0, -0.3, 0),
      mesh(new THREE.PlaneGeometry(0.37, 0.41), new THREE.MeshStandardMaterial({ map: tx, emissive: '#fff', emissiveMap: tx, emissiveIntensity: 0.45, roughness: 1 }), 0, -0.27, 0.01),
      box(0.03, 0.07, 0.03, mat(C.wood), 0, -0.03, 0));
    card.position.set(x, y, -1.0); card.rotation.z = (i % 2 ? 1 : -1) * 0.06; g.add(card);
    anim.push((t) => { card.rotation.x = Math.sin(t * 1.3 + i * 1.7) * 0.07; });
    if (i < 5) { const u2 = (i + 1) / 6; g.add(ball(0.045, 0, glow(i % 2 ? C.lamp : '#ffb0a0', 3.5), -1.9 + u2 * 3.8, 1.68 - Math.sin(u2 * Math.PI) * 0.22, -1.0)); }
  });
  const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push(V(-1.9 + u * 3.8, 1.68 - Math.sin(u * Math.PI) * 0.22, -1.0)); }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#2a2233' })));
  return g;
}

function buildObservatory(anim) {
  const dome = G(
    mesh(new THREE.SphereGeometry(0.98, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e7e2f2', { roughness: 0.5, metalness: 0.25 })),
    box(0.34, 0.75, 1.0, mat('#1a2040'), 0, 0.42, 0.52, -0.75, 0, 0),
    cyl(0.13, 0.17, 1.25, 8, mat(C.stoneDark, { metalness: 0.4, roughness: 0.4 }), 0, 0.72, 0.62, 0.85, 0, 0),
    cyl(0.14, 0.14, 0.06, 8, glow('#9fd0ff', 2.5), 0, 1.13, 1.09, 0.85, 0, 0),
  );
  dome.position.y = 0.95; anim.push((t) => { dome.rotation.y = Math.sin(t * 0.12) * 0.5; });
  return G(
    cyl(0.95, 1.05, 0.95, 10, mat('#cfc8dc'), 0, 0.475, 0), cyl(1.03, 1.03, 0.08, 10, mat(C.stoneDark), 0, 0.95, 0), dome,
    box(0.34, 0.56, 0.08, mat(C.plum), 0, 0.3, 1.0), box(0.5, 0.06, 0.3, mat(C.stone), 0, 0.03, 1.15),
    box(0.12, 0.16, 0.05, glow('#9fd0ff', 2.2), 0.55, 0.6, 0.83, 0, 0.55, 0), box(0.12, 0.16, 0.05, glow('#9fd0ff', 2.2), -0.55, 0.6, 0.83, 0, -0.55, 0),
    cyl(0.015, 0.015, 0.8, 4, mat(C.white), -1.3, 0.4, -0.2), mesh(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.white), -1.3, 0.8, -0.2, Math.PI + 0.6, 0, 0),
    light('#8fb8ff', 5, 7, 0, 1.2, 1.8),
  );
}

function buildLighthouse(anim) {
  const g = G(ball(0.75, 0, mat(C.stoneDark), 0, 0.05, 0), ball(0.45, 0, mat(C.stone), 0.7, 0.05, 0.3), ball(0.4, 0, mat(C.stoneDark), -0.65, 0, -0.3));
  const rs = [0.6, 0.54, 0.48, 0.43, 0.38];
  for (let i = 0; i < 4; i++) g.add(cyl(rs[i + 1], rs[i], 0.66, 10, mat(i % 2 ? C.plum : C.white), 0, 0.6 + i * 0.66, 0));
  g.add(cyl(0.52, 0.52, 0.07, 10, mat(C.stoneDark), 0, 2.94, 0), cyl(0.27, 0.27, 0.4, 8, glow('#ffe6a8', 4), 0, 3.17, 0), cone(0.36, 0.34, 8, mat(C.plum), 0, 3.54, 0),
    box(0.2, 0.4, 0.06, mat(C.woodDark), 0, 0.5, 0.58), light('#ffd27a', 9, 9, 0, 3.2, 0));
  const beam = new THREE.Group(); beam.position.y = 3.17;
  const bm = new THREE.MeshBasicMaterial({ color: '#ffe6a8', transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  [1, -1].forEach((s) => { const c = mesh(new THREE.ConeGeometry(0.8, 6, 14, 1, true), bm, 0, 0, s * 3, s * -Math.PI / 2, 0, 0); beam.add(c); });
  g.add(beam); anim.push((t) => { beam.rotation.y = t * 0.5; });
  return g;
}

function buildDock(anim) {
  const g = G(box(0.8, 0.07, 3.2, mat(C.wood), 0, 0.0, -1.9), lampPost(0.5, -0.4, 1.1),
    cyl(0.04, 0.04, 0.7, 5, mat(C.woodDark), -0.75, 0.35, 0.1), box(0.34, 0.24, 0.22, mat(C.plum), -0.75, 0.78, 0.1), box(0.03, 0.2, 0.1, glow(C.lamp, 2), -0.56, 0.86, 0.1),
    light('#ffc070', 4, 5, 0.3, 1.0, -0.4));
  for (let i = 0; i < 5; i++) [-0.36, 0.36].forEach((x) => g.add(cyl(0.05, 0.05, 0.9, 5, mat(C.woodDark), x, -0.3, -0.5 - i * 0.7)));
  const sail = new THREE.Shape(); sail.moveTo(0, 0); sail.lineTo(0, 1.0); sail.lineTo(0.62, 0.08);
  const boat = G(box(0.42, 0.2, 0.95, mat(C.cream), 0, 0, 0), cone(0.21, 0.4, 4, mat(C.cream), 0, 0, 0.66, Math.PI / 2, Math.PI / 4, 0), box(0.44, 0.05, 0.97, mat(C.plum), 0, 0.1, 0),
    cyl(0.025, 0.025, 1.2, 4, mat(C.woodDark), 0, 0.65, 0.1), mesh(new THREE.ShapeGeometry(sail), mat(C.white, { side: THREE.DoubleSide, emissive: '#fff', emissiveIntensity: 0.15 }), 0, 0.2, 0.06, 0, Math.PI / 2, 0));
  boat.position.set(0.95, -0.2, -2.9); g.add(boat);
  anim.push((t) => { boat.position.y = -0.22 + Math.sin(t * 1.4) * 0.04; boat.rotation.z = Math.sin(t * 1.1) * 0.06; boat.rotation.y = 0.5 + Math.sin(t * 0.4) * 0.1; });
  return g;
}

function buildRhino(anim) {
  const m = mat('#9a94b0'), d = mat('#7d7796');
  const legs = [[-0.2, 0.28], [0.2, 0.28], [-0.2, -0.3], [0.2, -0.3]].map(([x, z]) => box(0.16, 0.34, 0.16, d, x, 0.17, z));
  const g = G(box(0.56, 0.5, 0.95, m, 0, 0.56, 0), box(0.6, 0.3, 0.4, d, 0, 0.72, -0.1), box(0.4, 0.38, 0.46, m, 0, 0.5, 0.66), box(0.3, 0.26, 0.24, d, 0, 0.42, 0.98),
    cone(0.07, 0.3, 5, mat(C.cream), 0, 0.68, 1.04, 0.35, 0, 0), cone(0.05, 0.14, 5, mat(C.cream), 0, 0.66, 0.84, 0.2, 0, 0),
    cone(0.06, 0.16, 4, d, -0.15, 0.78, 0.5), cone(0.06, 0.16, 4, d, 0.15, 0.78, 0.5), box(0.04, 0.22, 0.04, d, 0, 0.6, -0.5, 0.4, 0, 0), ...legs);
  anim.push((t) => legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 3 + (i % 3 ? 0 : Math.PI)) * 0.35; }));
  return g;
}

export function buildCharacter() {
  const legL = box(0.1, 0.3, 0.11, mat('#2a3350'), -0.075, 0.15, 0), legR = box(0.1, 0.3, 0.11, mat('#2a3350'), 0.075, 0.15, 0);
  const armL = box(0.08, 0.3, 0.09, mat(C.skin), -0.21, 0.5, 0), armR = box(0.08, 0.3, 0.09, mat(C.skin), 0.21, 0.5, 0);
  [legL, legR].forEach((l) => { l.geometry.translate(0, -0.15, 0); l.position.y = 0.3; });
  [armL, armR].forEach((a) => { a.geometry.translate(0, -0.13, 0); a.position.y = 0.64; });
  const body = G(box(0.32, 0.36, 0.2, mat('#18203c'), 0, 0.48, 0), box(0.24, 0.3, 0.1, mat('#3b466b'), 0, 0.5, -0.14),
    box(0.1, 0.1, 0.09, mat('#18203c'), -0.21, 0.61, 0), box(0.1, 0.1, 0.09, mat('#18203c'), 0.21, 0.61, 0),
    box(0.24, 0.23, 0.22, mat(C.skin), 0, 0.79, 0),
    box(0.26, 0.09, 0.24, mat(C.white), 0, 0.92, 0), box(0.24, 0.03, 0.14, mat(C.white), 0, 0.885, 0.17),
    box(0.04, 0.04, 0.02, mat('#222'), -0.06, 0.8, 0.112), box(0.04, 0.04, 0.02, mat('#222'), 0.06, 0.8, 0.112),
    legL, legR, armL, armR);
  const row = G(box(0.5, 0.16, 0.9, mat(C.wood), 0, 0.02, 0), box(0.54, 0.04, 0.94, mat(C.plum), 0, 0.1, 0), cone(0.25, 0.36, 4, mat(C.wood), 0, 0.02, 0.6, Math.PI / 2, Math.PI / 4, 0));
  row.visible = false;
  const g = G(body, row);
  g.userData = { legL, legR, armL, armR, body, row };
  return g;
}

/* ---------- the world ---------- */
export function buildWorld() {
  const world = new THREE.Group();
  const anim = [];
  const pick = [];

  // terrain
  const ico = new THREE.IcosahedronGeometry(1, 44);
  const pos = ico.attributes.position, col = new Float32Array(pos.count * 3);
  const a = V(), b = V(), c = V(), m = V(), cc = new THREE.Color();
  const grass = ['#6f9a6b', '#86a868', '#5d8b6f', '#7ba070'].map((x) => new THREE.Color(x));
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i).normalize(); b.fromBufferAttribute(pos, i + 1).normalize(); c.fromBufferAttribute(pos, i + 2).normalize();
    const ha = heightAt(a), hb = heightAt(b), hc = heightAt(c), h = (ha + hb + hc) / 3;
    m.copy(a).add(b).add(c).normalize();
    pos.setXYZ(i, ...a.multiplyScalar(R + ha).toArray()); pos.setXYZ(i + 1, ...b.multiplyScalar(R + hb).toArray()); pos.setXYZ(i + 2, ...c.multiplyScalar(R + hc).toArray());
    const n1 = vnoise(m.x * 6, m.y * 6, m.z * 6), n2 = hash(i, 3, 7);
    if (h < -0.25) cc.set('#3d5f78');
    else if (h < 0.1) cc.set('#dcc79c').lerp(new THREE.Color('#c9b48a'), n2);
    else if (h > 2.0) cc.set('#f1f2f8').lerp(new THREE.Color('#d8dcec'), n2);
    else if (h > 1.15) cc.set('#857f9c').lerp(new THREE.Color('#6d6888'), n2);
    else { cc.copy(grass[Math.floor(n1 * 3.99)]).lerp(grass[3], n2 * 0.5); if (Math.abs(angDeg(m, RING_C) - RING_A) < 0.9) cc.set('#a89f96'); }
    for (let k = 0; k < 3; k++) cc.toArray(col, (i + k) * 3);
  }
  ico.setAttribute('color', new THREE.BufferAttribute(col, 3)); ico.computeVertexNormals();
  const terrain = new THREE.Mesh(ico, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  terrain.userData.ground = true; world.add(terrain); pick.push(terrain);

  const water = new THREE.Mesh(new THREE.IcosahedronGeometry(R - 0.02, 24), new THREE.MeshStandardMaterial({ color: '#2f8f98', flatShading: true, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0.86 }));
  water.userData.ground = true; world.add(water); pick.push(water);

  // scatter: trees and rocks
  const pine = (() => {
    const paint = (g, c) => { const col = new THREE.Color(c), n = g.attributes.position.count, arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.toArray(arr, i * 3); g.setAttribute('color', new THREE.BufferAttribute(arr, 3)); return g.toNonIndexed(); };
    return {
      pine: mergeGeometries([paint(new THREE.CylinderGeometry(0.06, 0.09, 0.4, 5).translate(0, 0.2, 0), '#6e4a3a'), paint(new THREE.ConeGeometry(0.42, 0.75, 6).translate(0, 0.72, 0), '#ffffff'), paint(new THREE.ConeGeometry(0.3, 0.65, 6).translate(0, 1.18, 0), '#f0fff0')]),
      round: mergeGeometries([paint(new THREE.CylinderGeometry(0.06, 0.09, 0.5, 5).translate(0, 0.25, 0), '#6e4a3a'), paint(new THREE.IcosahedronGeometry(0.42, 0).translate(0, 0.78, 0), '#ffffff'), paint(new THREE.IcosahedronGeometry(0.28, 0).translate(0.2, 1.05, 0.05), '#f4fff0')]),
      rock: paint(new THREE.DodecahedronGeometry(0.22, 0).translate(0, 0.08, 0), '#ffffff'),
    };
  })();
  const spots = { pine: [], round: [], rock: [] };
  const clear = (n, pad) => PLACES.every((p) => angDeg(n, p.n) > p.flat * 1.05 + pad && angDeg(n, p.standPoint) > 12.5) && Math.abs(angDeg(n, RING_C) - RING_A) > 2.6;
  for (let i = 0; i < 5200 && spots.pine.length + spots.round.length < 260; i++) {
    const n = V(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1); if (n.lengthSq() > 1 || n.lengthSq() < 0.01) continue; n.normalize();
    const h = heightAt(n), f = fbm(n, 3.1);
    if (h > 0.16 && h < 1.5 && clear(n, 1.5)) { if (f > 0.5) spots[h > 0.7 || f > 0.6 ? 'pine' : 'round'].push(n); else if (rnd() < 0.09) spots.rock.push(n); }
    else if (h >= 1.5 && h < 2.3 && rnd() < 0.2) spots.rock.push(n);
  }
  const tints = { pine: ['#3f7d5f', '#4c8c62', '#35705c', '#5a9668'], round: ['#7fae62', '#93b76a', '#6aa069', '#e9a46b', '#d98a7a'], rock: ['#9a94ad', '#807a98', '#b3aec4'] };
  const tmp = new THREE.Matrix4(), q = new THREE.Quaternion(), s = V();
  for (const k of Object.keys(spots)) {
    const im = new THREE.InstancedMesh(pine[k], new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }), spots[k].length);
    spots[k].forEach((n, i) => {
      const sc = (k === 'rock' ? 0.6 : 0.75) + rnd() * 0.7;
      q.setFromUnitVectors(V(0, 1, 0), n).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), rnd() * 6.28));
      tmp.compose(n.clone().multiplyScalar(R + heightAt(n) - 0.03), q, s.set(sc, sc * (0.85 + rnd() * 0.4), sc));
      im.setMatrixAt(i, tmp); im.setColorAt(i, cc.set(tints[k][Math.floor(rnd() * tints[k].length)]));
    });
    world.add(im);
  }

  // landmarks
  const builders = { home: buildCabin, awards: buildSummit, teaching: buildClassroom, journey: buildStation, blog: buildTree, life: buildCamp, research: buildObservatory, news: buildLighthouse, contact: buildDock };
  for (const p of PLACES) {
    const g = builders[p.id](anim);
    const hit = ball(p.id === 'awards' ? 0.9 : 1.5, 1, new THREE.MeshBasicMaterial({ visible: false }), 0, p.id === 'news' ? 1.8 : 0.9, 0);
    hit.userData.place = p.id; g.add(hit); pick.push(hit);
    placeOn(g, p.n, p.front); world.add(g); p.group = g;
  }

  // railway
  const ht = 0.3, rail = new THREE.Group();
  rail.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(RING_AXES.x, RING_C, RING_AXES.z));
  [-0.5, 0.5].forEach((d) => { const aa = (RING_A + d) * D2R; const t = mesh(new THREE.TorusGeometry((R + ht) * Math.sin(aa), 0.028, 4, 140), mat('#4a4560', { metalness: 0.5, roughness: 0.4 }), 0, (R + ht) * Math.cos(aa), 0, Math.PI / 2, 0, 0); rail.add(t); });
  const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.04, 0.09), mat(C.woodDark), 110);
  const onRing = (theta, lift, out) => {
    const sa = Math.sin(RING_A * D2R), ca = Math.cos(RING_A * D2R);
    const up = V(sa * Math.cos(theta), ca, sa * Math.sin(theta)), fwd = V(-Math.sin(theta), 0, Math.cos(theta));
    return out.makeBasis(up.clone().cross(fwd), up, fwd).setPosition(up.multiplyScalar(R + ht + lift));
  };
  for (let i = 0; i < 110; i++) ties.setMatrixAt(i, onRing((i / 110) * Math.PI * 2, -0.03, tmp));
  rail.add(ties);
  const cars = [
    G(box(0.34, 0.26, 0.62, mat(C.plum), 0, 0.2, 0), cyl(0.13, 0.13, 0.4, 8, mat('#3a3550'), 0, 0.3, 0.18, Math.PI / 2, 0, 0), box(0.36, 0.34, 0.26, mat(C.plum), 0, 0.36, -0.2), box(0.4, 0.04, 0.3, mat('#3a3550'), 0, 0.55, -0.2),
      cyl(0.05, 0.035, 0.18, 6, mat('#3a3550'), 0, 0.5, 0.3), box(0.2, 0.12, 0.02, glow(C.lamp, 2.5), 0, 0.4, -0.065), ball(0.05, 0, glow('#fff1c0', 5), 0, 0.3, 0.4)),
    G(box(0.32, 0.26, 0.6, mat('#e2b55a'), 0, 0.2, 0), box(0.24, 0.08, 0.5, mat('#3a3550'), 0, 0.36, 0)),
    G(box(0.32, 0.3, 0.6, mat(C.teal), 0, 0.22, 0), box(0.34, 0.04, 0.62, mat('#3a3550'), 0, 0.39, 0), box(0.02, 0.1, 0.36, glow(C.lamp, 2), 0.165, 0.26, 0), box(0.02, 0.1, 0.36, glow(C.lamp, 2), -0.165, 0.26, 0)),
  ];
  cars.forEach((cg, i) => { cg.matrixAutoUpdate = false; rail.add(cg); cg.add(box(0.36, 0.08, 0.5, mat('#2a2640'), 0, 0.05, 0)); });
  const puffs = [0, 1, 2].map(() => ball(0.1, 0, mat('#e6e2f0', { transparent: true, opacity: 0.6 })));
  puffs.forEach((p) => rail.add(p));
  anim.push((t) => {
    const th = t * 0.22;
    cars.forEach((cg, i) => { onRing(th - i * 0.27, 0, cg.matrix); cg.matrixWorldNeedsUpdate = true; });
    puffs.forEach((p, i) => { const k = (t * 0.6 + i / 3) % 1; onRing(th - k * 0.25 + 0.1, 0.62 + k * 0.7, tmp); p.position.setFromMatrixPosition(tmp); p.scale.setScalar(0.6 + k * 1.6); p.material.opacity = 0.6 * (1 - k); });
  });
  world.add(rail);

  // the rhinoceros
  const rhino = buildRhino(anim); rhino.scale.setScalar(0.85);
  const rc = dirOf(-2, 38), rx = tangentAway(rc, V(0, 1, 0)), rz = rc.clone().cross(rx);
  const rhit = ball(0.9, 0, new THREE.MeshBasicMaterial({ visible: false }), 0, 0.5, 0.2); rhit.userData.rhino = true; rhino.add(rhit); pick.push(rhit);
  rhino.matrixAutoUpdate = false; world.add(rhino);
  anim.push((t) => {
    const th = t * 0.07, sa = Math.sin(6 * D2R), ca = Math.cos(6 * D2R);
    const n = rc.clone().multiplyScalar(ca).addScaledVector(rx, sa * Math.cos(th)).addScaledVector(rz, sa * Math.sin(th)).normalize();
    const fwd = rx.clone().multiplyScalar(-Math.sin(th)).addScaledVector(rz, Math.cos(th));
    rhino.matrix.copy(basis(n, fwd)).scale(V(0.85, 0.85, 0.85)); rhino.matrixWorldNeedsUpdate = true;
  });

  // clouds
  const clouds = [];
  for (let i = 0; i < 11; i++) {
    const pivot = new THREE.Group(); pivot.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
    const cl = new THREE.Group(), cm = new THREE.MeshStandardMaterial({ color: '#f3eefa', flatShading: true, roughness: 0.9, emissive: '#b9a8d8', emissiveIntensity: 0.25, transparent: true, opacity: 0.92 });
    cl.userData.mat = cm; clouds.push(cl);
    for (let k = 0; k < 4; k++) { const p = ball(0.5 + rnd() * 0.5, 1, cm, (k - 1.5) * 0.7 + rnd() * 0.2, rnd() * 0.25, rnd() * 0.4); p.scale.y = 0.6; cl.add(p); }
    cl.position.y = R + 3.4 + rnd() * 2.6; cl.scale.setScalar(0.55 + rnd() * 0.55); pivot.add(cl); world.add(pivot);
    const ax = V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), sp = 0.012 + rnd() * 0.02;
    anim.push((t, dt) => pivot.rotateOnWorldAxis(ax, sp * dt));
  }

  // fireflies at the campsite
  {
    const N = 26, arr = new Float32Array(N * 3), ph = Array.from({ length: N }, () => [rnd() * 6 - 3, 0.3 + rnd() * 1.6, rnd() * 5 - 2.5, rnd() * 6.28]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#f6ff9a', size: 0.09, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    placeById.life.group.add(pts);
    anim.push((t) => { ph.forEach(([x, y, z, o], i) => { arr[i * 3] = x + Math.sin(t * 0.5 + o) * 0.5; arr[i * 3 + 1] = y + Math.sin(t * 0.9 + o * 2) * 0.25; arr[i * 3 + 2] = z + Math.cos(t * 0.4 + o) * 0.5; }); geo.attributes.position.needsUpdate = true; });
  }

  // lights that travel with the planet, so walking changes the hour
  const sun = new THREE.DirectionalLight('#ffd0a0', 3.0); sun.position.copy(SUN).multiplyScalar(60); world.add(sun);
  const moon = new THREE.DirectionalLight('#7f9cff', 0.75); moon.position.copy(SUN).multiplyScalar(-60).add(V(0, 20, 0)); world.add(moon);

  // sky
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { sun: { value: SUN } },
    vertexShader: 'varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 d; uniform vec3 sun;
      void main(){ float t = dot(normalize(d), sun);
        vec3 night = vec3(0.020,0.035,0.105), deep = vec3(0.085,0.090,0.270), violet = vec3(0.330,0.250,0.560), rose = vec3(0.700,0.370,0.480), peach = vec3(0.860,0.560,0.380);
        vec3 c = mix(night, deep, smoothstep(-1.0,-0.35,t));
        c = mix(c, violet, smoothstep(-0.35,0.15,t)); c = mix(c, rose, smoothstep(0.1,0.62,t)); c = mix(c, peach, smoothstep(0.72,0.99,t));
        c += vec3(1.0,0.72,0.45) * (pow(max(t,0.0), 400.0) * 0.35 + smoothstep(0.99925,0.99945,t) * 1.2);
        gl_FragColor = vec4(c,1.0); }`,
  }));
  world.add(sky);
  const moonDir = SUN.clone().multiplyScalar(-1).add(V(0.25, 0.45, 0.1)).normalize();
  world.add(mesh(new THREE.IcosahedronGeometry(9, 2), new THREE.MeshBasicMaterial({ color: '#dfe6ff' }), ...moonDir.multiplyScalar(360).toArray()));

  // background stars
  {
    const N = 1500, p = new Float32Array(N * 3), sz = new Float32Array(N), ph = new Float32Array(N);
    for (let i = 0; i < N; i++) { const v = V(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize().multiplyScalar(380); v.toArray(p, i * 3); sz[i] = 0.8 + Math.pow(rnd(), 4) * 2.6; ph[i] = rnd() * 6.28; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setAttribute('sz', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('ph', new THREE.BufferAttribute(ph, 1));
    const sm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { sun: { value: SUN }, time: { value: 0 }, px: { value: 1 } },
      vertexShader: 'attribute float sz; attribute float ph; uniform vec3 sun; uniform float time; uniform float px; varying float a; void main(){ a = smoothstep(0.3,-0.3,dot(normalize(position),sun)) * (0.65+0.35*sin(time*1.5+ph)); gl_PointSize = sz*px; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'varying float a; void main(){ float r = length(gl_PointCoord-0.5); gl_FragColor = vec4(0.9,0.93,1.0, a*smoothstep(0.5,0.1,r)); }',
    });
    world.add(new THREE.Points(geo, sm)); anim.push((t) => { sm.uniforms.time.value = t; });
    world.userData.starMat = sm;
  }

  // paper constellations, centred in the sky north of the observatory
  const obs = placeById.research;
  const right = obs.n.clone().cross(obs.front), skyC = obs.n.clone().multiplyScalar(Math.cos(38 * D2R)).addScaledVector(obs.front, -Math.sin(38 * D2R)).normalize();
  const skyUp = right.clone().cross(skyC);
  const SKY_R = 170;
  const layout = {
    robust: [[-8, -9], [-3, -11], [2, -7], [4, -2], [0, 3], [-5, 5], [-8, 10], [-3, 14], [3, 12], [8, 8]],
    agents: [[-23, -6], [-18, 0], [-22, 6], [-16, 11]],
    clinical: [[15, -8], [21, -3], [17, 4], [23, 9]],
  };
  const glowTex = canvasTex(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,255,255,.95)'); g.addColorStop(0.3, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  const stars = [], constellations = [];
  const skyPoint = ([x, y]) => skyC.clone().addScaledVector(right, Math.tan(x * D2R)).addScaledVector(skyUp, Math.tan(y * D2R)).normalize().multiplyScalar(SKY_R);
  for (const [k, th] of Object.entries(THEMES)) {
    const list = papers.filter((p) => p.theme === k).sort((x, y) => x.t - y.t);
    const pts = list.map((p, i) => {
      const v = skyPoint(layout[k][i]);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: th.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      const sz = p.selected ? 9.5 : 6.5; sp.scale.set(sz, sz, 1); sp.position.copy(v); sp.userData = { paper: p, base: sz };
      world.add(sp); stars.push(sp); return v;
    });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: th.color, transparent: true, opacity: 0.3 }));
    world.add(line);
    const cx = layout[k].reduce((s2, p) => s2 + p[0], 0) / pts.length, cy = Math.min(...layout[k].map((p) => p[1])) - 4.5;
    constellations.push({ key: k, name: th.name, color: th.color, anchor: skyPoint([cx, cy]), line });
  }
  anim.push((t) => stars.forEach((s2, i) => { const b = s2.userData.base * (s2.userData.hot ? 1.7 : 1); s2.scale.setScalar(b * (0.92 + 0.08 * Math.sin(t * 2 + i * 1.3))); }));

  return { world, anim, pick, clouds, stars, constellations, skyCenter: skyC.clone().multiplyScalar(SKY_R), terrain };
}
