/**
 * Starfield — subtle animated stars for dark mode
 * Uses a fixed-position canvas behind all content.
 * Respects prefers-reduced-motion and only runs in dark mode.
 */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas, ctx, stars, raf;
  var STAR_COUNT = 120;
  var MAX_SIZE = 2.5;
  var MIN_SIZE = 0.5;

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
        opacity: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.003 + Math.random() * 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.08,
        driftY: (Math.random() - 0.5) * 0.05,
      });
    }
  }

  function draw(time) {
    if (!isDark()) {
      canvas.style.opacity = "0";
      raf = requestAnimationFrame(draw);
      return;
    }
    canvas.style.opacity = "1";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // Twinkle
      var flicker =
        0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      var alpha = s.opacity * (0.4 + 0.6 * flicker);

      // Slow drift
      s.x += s.driftX;
      s.y += s.driftY;

      // Wrap around
      if (s.x < -5) s.x = canvas.width + 5;
      if (s.x > canvas.width + 5) s.x = -5;
      if (s.y < -5) s.y = canvas.height + 5;
      if (s.y > canvas.height + 5) s.y = -5;

      // Draw star with glow
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
      ctx.fill();

      // Glow for larger stars
      if (s.size > 1.5) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200, 220, 255, " + alpha * 0.15 + ")";
        ctx.fill();
      }
    }

    raf = requestAnimationFrame(draw);
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
  }

  // Start on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

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
