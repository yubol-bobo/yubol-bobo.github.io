/**
 * Starfield — Astra-style interactive particle field for dark mode.
 *
 * Modeled on the OpenAI "GPT-6 Astra" hero scene:
 *  - white-dominant palette with cyan / blue / warm-orange accents
 *  - sparse, small stars; the pointer gently parts nearby stars like water,
 *    and they flow back slowly, leaving a soft wake that heals over ~2s
 *  - motion is overdamped (exponential): stars glide aside and flow back,
 *    they never bounce, jitter, or change size
 *  - stars the cursor passes stay faintly brightened for a moment (the trail)
 *  - scroll parallax: stars drift at different depths while scrolling
 *
 * Text constellations (the Astra converge/disperse effect):
 *  - at the top of the page the stars assemble into the page title
 *    ("Yubo Li"), and the real heading dissolves away beneath them;
 *    scrolling down scatters the stars back into the sky
 *  - when the "Work Experience" heading reaches mid-screen, the stars
 *    gather again and write it out, then scatter as you scroll past
 *  - letterforms are sampled from an offscreen canvas, so the shapes are
 *    real glyph outlines in the site's own font
 *  - a pool of "latent" stars (invisible while scattered) joins only during
 *    convergence, so long words stay legible while the idle sky stays sparse
 *
 * Uses a fixed-position canvas behind all content.
 * Respects prefers-reduced-motion and only runs in dark mode.
 */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // ---- Palette (from the GPT-6 Astra hero config) ----
  var PALETTE = [
    { r: 109, g: 203, b: 244, w: 0.15 }, // cyan   #6DCBF4
    { r: 122, g: 177, b: 254, w: 0.18 }, // blue   #7AB1FE
    { r: 248, g: 121, b: 21, w: 0.07 }, // orange #F87915
    { r: 250, g: 153, b: 76, w: 0.08 }, // amber  #FA994C
    { r: 245, g: 246, b: 251, w: 0.52 }, // white  #F5F6FB
  ];

  // ---- Interaction: water-like parting, no bounce ----
  var REPEL_RADIUS = 140; // px — pointer influence radius
  var REPEL_DISTANCE = 38; // px — max displacement away from pointer
  var REPEL_FALLOFF = 2; // falloff exponent inside the radius
  var PUSH_RATE = 6; // 1/s — how quickly stars glide aside
  var RETURN_RATE = 1.6; // 1/s — how slowly the wake flows back
  var PRESS_MULTIPLIER = 2.2; // extra push while mouse button is down
  var HIGHLIGHT_RADIUS = 180; // px — stars this close to the cursor light up
  var HIGHLIGHT = 0.16; // subtle brightness boost near the cursor
  var HIGHLIGHT_DECAY = 1.2; // 1/s — how fast the trail glow fades
  var TWINKLE_SPEED = 0.62;
  var SCROLL_DRIFT = 0.14; // parallax factor while scrolling

  // ---- Text constellations ----
  var SHAPE_PARTICIPATION = 0.88; // fraction of sky stars that may join
  var SHAPE_SCATTER = 2.5; // px — jitter so letters stay nebulous, not rigid
  var CONVERGE_RATE = 2.2; // 1/s — how fluidly stars flow to/from the text
  var POINTS_PER_GLYPH = 80; // sampled stars per letter (legibility)
  var MAX_TEXT_POINTS = 1200; // cap per constellation
  var CONSTELLATIONS = [
    // headings that dissolve into star-text; matched against page <h1>/<h2>s
    { match: /Work Experience/, text: "Work Experience" },
    { match: /^\s*Publications\s*$/, text: "Publications" },
  ];
  // only these page titles become star-text (Resume etc. stay untouched)
  var TOP_TITLES = /^(Yubo\s?Li|Research)$/i;

  var MIN_SIZE = 0.4;
  var MAX_SIZE = 1.8;

  var canvas, ctx, stars, raf;
  var dpr = 1;
  var vw = 0,
    vh = 0;

  var pointer = { x: -9999, y: -9999, down: false, active: false };
  var lastScrollY = window.scrollY || 0;
  var scrollDelta = 0;
  var lastFrame = 0;
  var shapes = []; // {el, text, y(doc), pts, kind, _lastOp}

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function smoothstep(a, b, x) {
    x = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return x * x * (3 - 2 * x);
  }

  function pickColorIndex() {
    var r = Math.random();
    for (var i = 0; i < PALETTE.length; i++) {
      r -= PALETTE[i].w;
      if (r <= 0) return i;
    }
    return PALETTE.length - 1;
  }

  // Pre-rendered soft glow sprites (radial gradient → transparent), drawn
  // additively to fake the WebGL bloom of the original — a smooth halo of
  // light with no visible edge, never a flat circle.
  var sprites = null; // one per palette color, plus white at the end
  function buildSprites() {
    try {
      sprites = [];
      var defs = PALETTE.concat([{ r: 245, g: 246, b: 251 }]);
      for (var i = 0; i < defs.length; i++) {
        var c = defs[i];
        var sc = document.createElement("canvas");
        sc.width = 64;
        sc.height = 64;
        var sctx = sc.getContext("2d");
        var g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        var rgb = c.r + "," + c.g + "," + c.b;
        g.addColorStop(0, "rgba(" + rgb + ",0.85)");
        g.addColorStop(0.2, "rgba(" + rgb + ",0.32)");
        g.addColorStop(0.45, "rgba(" + rgb + ",0.1)");
        g.addColorStop(1, "rgba(" + rgb + ",0)");
        sctx.fillStyle = g;
        sctx.fillRect(0, 0, 64, 64);
        sprites.push(sc);
      }
    } catch (e) {
      sprites = null;
    }
  }

  function makeStar(latent) {
    var size = MIN_SIZE + Math.pow(Math.random(), 2) * (MAX_SIZE - MIN_SIZE);
    return {
      // home position (slow ambient drift)
      hx: Math.random() * vw,
      hy: Math.random() * vh,
      // displacement from home (overdamped — follows targets smoothly)
      ox: 0,
      oy: 0,
      // per-star response speed so motion flows organically, not in sync
      flow: 0.7 + Math.random() * 0.6,
      depth: 0.3 + Math.random() * 0.7, // parallax depth
      size: size,
      opacity: 0.35 + Math.random() * 0.65,
      twinkleSpeed: (0.003 + Math.random() * 0.008) * TWINKLE_SPEED * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.06,
      driftY: (Math.random() - 0.5) * 0.04,
      excite: 0, // lingering glow after the cursor passes
      cv: 0, // per-star smoothed convergence (staggers arrival)
      slots: [], // constellation slot per shape index (doc coords)
      latent: !!latent, // latent stars only appear while converged
      ci: pickColorIndex(),
    };
  }

  function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "starfield-canvas";
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:0;transition:opacity 0.8s ease;";
    document.body.prepend(canvas);
    ctx = canvas.getContext("2d");
    resize();
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initStars() {
    // sparse field: fewer, smaller stars than a typical particle demo
    var count = Math.max(130, Math.min(800, Math.round((vw * vh) / 4800)));
    stars = [];
    for (var i = 0; i < count; i++) stars.push(makeStar(false));
    if (!sprites) buildSprites();
    buildShapes();
  }

  // Rasterize a line of text and sample star target points off its glyphs.
  // Returns points centered on (0,0), scaled to widthPx, or null on failure.
  function sampleTextPoints(text, fontFamily, targetCount, widthPx) {
    try {
      var FS = 200; // draw large, then scale — keeps sampling stable
      var off = document.createElement("canvas");
      var octx = off.getContext("2d");
      var font = "700 " + FS + "px " + (fontFamily || "sans-serif");
      octx.font = font;
      var tw = octx.measureText(text).width;
      if (!tw) return null;
      off.width = Math.ceil(tw) + 24;
      off.height = Math.ceil(FS * 1.5);
      octx = off.getContext("2d");
      octx.font = font;
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.fillText(text, 12, off.height / 2);
      var img = octx.getImageData(0, 0, off.width, off.height).data;
      var pts = [];
      for (var y = 0; y < off.height; y += 4) {
        for (var x = 0; x < off.width; x += 4) {
          if (img[(y * off.width + x) * 4 + 3] > 128) pts.push({ x: x, y: y });
        }
      }
      if (pts.length < 12) return null;
      var scale = widthPx / tw;
      for (var i = 0; i < pts.length; i++) {
        pts[i].x = (pts[i].x - off.width / 2) * scale;
        pts[i].y = (pts[i].y - off.height / 2) * scale;
      }
      if (pts.length > targetCount) {
        // decimate evenly so coverage stays uniform across all letters
        var out = [];
        var stride = pts.length / targetCount;
        for (var k = 0; k < targetCount; k++) {
          out.push(pts[Math.floor(k * stride)]);
        }
        pts = out;
      }
      return pts;
    } catch (e) {
      return null;
    }
  }

  // Find the headings that become constellations and assign every
  // participating star a slot on their letterforms.
  function buildShapes() {
    shapes = [];
    if (!stars || !document.querySelectorAll) return;
    try {
      // page title: the stars assemble into it while you are at the top
      var h1 = document.querySelector("h1.post-title");
      if (h1) {
        var name = (h1.textContent || "").replace(/\s+/g, " ").trim();
        if (TOP_TITLES.test(name)) {
          shapes.push({ el: h1, text: name, kind: "top" });
        }
      }
      // section headings: form when the heading reaches mid-screen
      var h2s = document.querySelectorAll("h2");
      for (var i = 0; i < h2s.length; i++) {
        for (var c = 0; c < CONSTELLATIONS.length; c++) {
          if (CONSTELLATIONS[c].match.test(h2s[i].textContent || "")) {
            shapes.push({ el: h2s[i], text: CONSTELLATIONS[c].text, kind: "mid" });
            break;
          }
        }
      }

      // sample glyph points for each shape
      var maxNeed = 0;
      for (var si = 0; si < shapes.length; si++) {
        var sh = shapes[si];
        var rect = sh.el.getBoundingClientRect();
        sh.y = rect.top + lastScrollY + rect.height / 2; // doc coords
        var family = "sans-serif";
        try {
          family = getComputedStyle(sh.el).fontFamily || family;
        } catch (e) {}
        var glyphs = sh.text.replace(/\s/g, "").length;
        var want = Math.min(MAX_TEXT_POINTS, glyphs * POINTS_PER_GLYPH);
        var widthPx = Math.min(vw * (sh.kind === "top" ? 0.72 : 0.86), glyphs * 64);
        sh.pts = sampleTextPoints(sh.text, family, want, widthPx);
        if (!sh.pts) {
          shapes.splice(si, 1);
          si--;
          continue;
        }
        sh._lastOp = "";
        if (sh.pts.length > maxNeed) maxNeed = sh.pts.length;
      }
      if (!shapes.length) return;

      // participating sky stars, topped up with latent stars for long words
      stars = stars.filter(function (s) {
        return !s.latent;
      });
      var parts = [];
      for (var p = 0; p < stars.length; p++) {
        stars[p].slots = [];
        if (p / stars.length < SHAPE_PARTICIPATION) parts.push(stars[p]);
      }
      for (var e = parts.length; e < maxNeed; e++) {
        var latent = makeStar(true);
        stars.push(latent);
        parts.push(latent);
      }

      // pair stars ↔ glyph points in the same spatial order, so the sky
      // collapses locally into the letters instead of criss-crossing
      var byPos = function (a, b) {
        return a.hx + a.hy * 0.25 - (b.hx + b.hy * 0.25);
      };
      for (var s2 = 0; s2 < shapes.length; s2++) {
        var shape = shapes[s2];
        var n = shape.pts.length;
        shape.pts.sort(function (a, b) {
          return a.x + a.y * 0.25 - (b.x + b.y * 0.25);
        });
        var pool = parts.slice(0, n).sort(byPos);
        for (var k2 = 0; k2 < n; k2++) {
          pool[k2].slots[s2] = {
            x: vw / 2 + shape.pts[k2].x + (Math.random() - 0.5) * SHAPE_SCATTER * 2,
            y: shape.y + shape.pts[k2].y + (Math.random() - 0.5) * SHAPE_SCATTER * 2,
          };
        }
      }
    } catch (e) {
      shapes = [];
    }
  }

  // How converged a shape should be right now (0 scattered … 1 formed)
  function shapeConverge(sh) {
    if (sh.kind === "top") {
      // formed while at the top of the page, scattered by half a screen down
      return 1 - smoothstep(0.18, 0.6, lastScrollY / vh);
    }
    // formed while its heading sits in the middle band of the viewport
    var vy = sh.y - lastScrollY;
    return 1 - smoothstep(0.12, 0.4, Math.abs(vy - vh * 0.38) / vh);
  }

  function restoreHeadings() {
    for (var i = 0; i < shapes.length; i++) {
      if (shapes[i].el) shapes[i].el.style.opacity = "";
      shapes[i]._lastOp = "";
    }
  }

  function draw(time) {
    raf = requestAnimationFrame(draw);
    if (!isDark()) {
      canvas.style.opacity = "0";
      return;
    }
    canvas.style.opacity = "1";

    var dt = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0.016;
    lastFrame = time;

    // Scroll parallax: consume the scroll delta accumulated since last frame
    var sd = scrollDelta;
    scrollDelta = 0;

    var push = pointer.down ? PRESS_MULTIPLIER : 1;

    // The most-converged shape drives the field this frame
    var active = -1;
    var activeC = 0;
    for (var j = 0; j < shapes.length; j++) {
      var cj = shapeConverge(shapes[j]);
      if (cj > activeC) {
        activeC = cj;
        active = j;
      }
      shapes[j]._sum = 0;
      shapes[j]._n = 0;
    }

    ctx.clearRect(0, 0, vw, vh);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // Ambient drift of the home position
      s.hx += s.driftX;
      s.hy += s.driftY - sd * SCROLL_DRIFT * s.depth;

      // Wrap around
      if (s.hx < -8) s.hx = vw + 8;
      if (s.hx > vw + 8) s.hx = -8;
      if (s.hy < -8) s.hy = vh + 8;
      if (s.hy > vh + 8) s.hy = -8;

      // Flow toward / away from the constellation slot (overdamped, so the
      // gathering and the scattering are both fluid, never springy)
      var slot = active >= 0 ? s.slots[active] : null;
      var cT = slot ? activeC : 0;
      s.cv += (cT - s.cv) * (1 - Math.exp(-CONVERGE_RATE * s.flow * dt));
      if (slot && active >= 0) {
        shapes[active]._sum += s.cv;
        shapes[active]._n++;
      }

      var bx = s.hx;
      var by = s.hy;
      if (slot) {
        bx += (slot.x - s.hx) * s.cv;
        by += (slot.y - lastScrollY - s.hy) * s.cv; // slot is in doc coords
      }

      var x = bx + s.ox;
      var y = by + s.oy;

      // ---- Pointer: water-like parting ----
      var tx = 0,
        ty = 0;
      if (pointer.active) {
        var dx = x - pointer.x;
        var dy = y - pointer.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;

        if (d < REPEL_RADIUS) {
          var fall = 1 - d / REPEL_RADIUS;
          fall = Math.pow(fall, REPEL_FALLOFF);
          tx = (dx / d) * REPEL_DISTANCE * fall * push;
          ty = (dy / d) * REPEL_DISTANCE * fall * push;
        }
        if (d < HIGHLIGHT_RADIUS) {
          var hFall = 1 - d / HIGHLIGHT_RADIUS;
          var target = HIGHLIGHT * 1.5 * hFall;
          if (target > s.excite) s.excite = target;
        }
      }

      // Overdamped motion: glide toward the pushed-aside target quickly,
      // flow back home slowly. Exponential approach — never overshoots.
      var rate = (tx || ty ? PUSH_RATE : RETURN_RATE) * s.flow;
      var k = 1 - Math.exp(-rate * dt);
      s.ox += (tx - s.ox) * k;
      s.oy += (ty - s.oy) * k;

      // Lingering trail glow decays slowly
      s.excite *= Math.max(0, 1 - HIGHLIGHT_DECAY * dt);

      x = bx + s.ox;
      y = by + s.oy;

      // ---- Render (constant size — the cursor never inflates stars) ----
      var flicker = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      var alpha = s.opacity * (0.4 + 0.6 * flicker);
      // converged stars burn near full brightness (only a faint shimmer
      // remains), so the letterforms read clearly against the dark sky
      var lit = 0.85 + 0.15 * flicker;
      alpha = alpha + (lit - alpha) * s.cv;
      alpha = Math.min(1, alpha + s.excite);
      // latent stars exist only while converged
      if (s.latent) alpha *= Math.min(1, s.cv * 1.4);
      if (alpha < 0.01) continue;

      // Converged constellations are silvery white like the Astra spiral —
      // colors desaturate toward white as stars gather (a ~15% tint of the
      // idle cyan/blue/orange survives), and return when they scatter.
      var c = PALETTE[s.ci];
      var wf = s.cv * 0.85;
      var cr = Math.round(c.r + (245 - c.r) * wf);
      var cg = Math.round(c.g + (246 - c.g) * wf);
      var cb = Math.round(c.b + (251 - c.b) * wf);

      // sharp core dot
      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + alpha + ")";
      ctx.fill();

      // bloom: an additive radial-gradient sprite — light falls off smoothly
      // to nothing, so overlapping glows fuse into nebula, never circles
      if (sprites && (s.size > 1.3 || s.cv > 0.05 || s.excite > 0.04)) {
        var sprite = sprites[s.cv > 0.4 ? sprites.length - 1 : s.ci];
        var gr = s.size * (3 + s.cv * 2.5);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.min(
          0.75,
          alpha * (0.28 + s.cv * 0.22) + s.excite * 0.15
        );
        ctx.drawImage(sprite, x - gr, y - gr, gr * 2, gr * 2);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    }

    // The real heading dissolves as its star-text assembles, and returns
    // as the stars scatter (tracks the stars' actual mean convergence)
    for (var m = 0; m < shapes.length; m++) {
      var sh = shapes[m];
      if (!sh.el) continue;
      var mean = m === active && sh._n ? sh._sum / sh._n : 0;
      var op = mean > 0.02 ? String(Math.max(0, 1 - mean * 1.2)) : "";
      if (op !== sh._lastOp) {
        sh.el.style.opacity = op;
        sh._lastOp = op;
      }
    }
  }

  function start() {
    if (!canvas) createCanvas();
    if (!stars) initStars();
    if (!raf) raf = requestAnimationFrame(draw);
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    if (canvas) canvas.style.opacity = "0";
    restoreHeadings();
  }

  // ---- Pointer tracking (canvas is pointer-events:none, so listen on window)
  window.addEventListener(
    "pointermove",
    function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerdown",
    function () {
      pointer.down = true;
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerup",
    function () {
      pointer.down = false;
    },
    { passive: true }
  );
  document.addEventListener("mouseleave", function () {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
  });

  // ---- Scroll parallax
  window.addEventListener(
    "scroll",
    function () {
      var yNow = window.scrollY || 0;
      scrollDelta += yNow - lastScrollY;
      lastScrollY = yNow;
    },
    { passive: true }
  );

  // Start on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // Re-anchor the constellations once images/fonts have settled the layout.
  // Only shift the existing slots — a full rebuild would re-randomize the
  // star↔glyph pairing and make an already-formed word scatter and re-form.
  function reanchorShapes() {
    try {
      for (var i = 0; i < shapes.length; i++) {
        var sh = shapes[i];
        if (!sh.el || !sh.el.getBoundingClientRect) continue;
        var rect = sh.el.getBoundingClientRect();
        var newY = rect.top + lastScrollY + rect.height / 2;
        var dy = newY - sh.y;
        if (!dy) continue;
        sh.y = newY;
        for (var j = 0; j < stars.length; j++) {
          var slot = stars[j].slots[i];
          if (slot) slot.y += dy;
        }
      }
    } catch (e) {}
  }
  window.addEventListener("load", function () {
    if (!stars) return;
    if (shapes.length) {
      reanchorShapes();
    } else {
      buildShapes(); // shapes never built (e.g. fonts were not ready)
    }
  });

  // Handle resize
  window.addEventListener("resize", function () {
    resize();
    if (stars) initStars(); // re-scatter stars on resize
  });

  // Watch for theme changes
  var observer = new MutationObserver(function () {
    if (isDark()) {
      start();
    } else {
      stop();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
