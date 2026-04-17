// 3D Coverflow carousel for the Selected Publications section.
(function () {
  "use strict";

  function init() {
    var root = document.querySelector(".publications-coverflow");
    if (!root) return;

    var track = root.querySelector(".coverflow-track");
    var ol = root.querySelector("ol.bibliography");
    if (!track || !ol) return;

    var cards = Array.prototype.slice.call(ol.querySelectorAll(":scope > li"));
    if (cards.length === 0) return;

    var dotsWrap = root.querySelector(".coverflow-dots");
    var prevBtn = root.querySelector(".coverflow-arrow--prev");
    var nextBtn = root.querySelector(".coverflow-arrow--next");
    var ghost = root.querySelector(".coverflow-ghost");
    var info = root.querySelector(".coverflow-info");

    var prefersReduced = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var N = cards.length;
    var active = 0;
    var timer = null;
    var paused = false;
    var infoOpen = false;
    var currentInfoType = null;
    var currentInfoCardIdx = -1;
    var activeInfoBtn = null;
    var INTERVAL = 4500;
    var INFO_LABELS = { abstract: "Abstract", award: "Award", bibtex: "BibTeX" };

    // --- Build dot controls --------------------------------------------------
    var dots = [];
    if (dotsWrap && !prefersReduced) {
      for (var i = 0; i < N; i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Go to publication " + (i + 1));
        (function (idx) {
          b.addEventListener("click", function () {
            goTo(idx);
          });
        })(i);
        dotsWrap.appendChild(b);
        dots.push(b);
      }
    }

    // --- Colour helpers ------------------------------------------------------
    function parseRgb(str) {
      if (!str) return null;
      var m = str.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      var parts = m[1].split(",").map(function (s) { return parseFloat(s.trim()); });
      if (parts.length < 3 || isNaN(parts[0])) return null;
      return { r: parts[0], g: parts[1], b: parts[2] };
    }

    function getGlowColor(card) {
      var badge = card.querySelector(".abbr abbr");
      if (badge) {
        var inline = badge.style && badge.style.backgroundColor;
        var bg = inline || getComputedStyle(badge).backgroundColor;
        var rgb = parseRgb(bg);
        if (rgb && !(rgb.r === 0 && rgb.g === 0 && rgb.b === 0 && bg.indexOf("rgba") === 0)) {
          return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.55)";
        }
      }
      return "";
    }

    // --- Card positioning ----------------------------------------------------
    function setActive(i) {
      active = ((i % N) + N) % N;

      cards.forEach(function (card, idx) {
        var diff = idx - active;
        if (N > 1) {
          if (diff > N / 2) diff -= N;
          if (diff < -N / 2) diff += N;
        }

        var pos;
        if (diff === 0) pos = "active";
        else if (diff === 1) pos = "next";
        else if (diff === -1) pos = "prev";
        else if (diff === 2) pos = "next-2";
        else if (diff === -2) pos = "prev-2";
        else pos = "hidden";

        card.setAttribute("data-pos", pos);
        card.setAttribute("aria-hidden", pos === "active" ? "false" : "true");
        card.setAttribute("tabindex", pos === "active" ? "0" : "-1");
      });

      dots.forEach(function (d, idx) {
        d.setAttribute("aria-selected", idx === active ? "true" : "false");
      });

      var glowColor = getGlowColor(cards[active]);
      if (glowColor) root.style.setProperty("--cf-glow", glowColor);
    }

    // Navigate + close any open info panel (for arrows, dots, keyboard, tick).
    function goTo(i) {
      setActive(i);
      closeInfo();
      restartTimer();
    }

    function step(dir) {
      setActive(active + dir);
    }

    // --- Info panel ----------------------------------------------------------
    function openInfo(card, type) {
      if (!info) return;
      var blocks = card.querySelectorAll("." + type + ".hidden");
      if (!blocks.length) return;

      var html = "";
      blocks.forEach(function (b) { html += b.innerHTML; });

      info.innerHTML =
        '<button type="button" class="coverflow-info__close" aria-label="Close">&times;</button>' +
        '<div class="coverflow-info__title">' + (INFO_LABELS[type] || "") + '</div>' +
        '<div class="coverflow-info__body">' + html + '</div>';

      info.querySelector(".coverflow-info__close").addEventListener("click", function () {
        closeInfo();
      });

      // Force reflow so the max-height/opacity transition runs.
      void info.offsetWidth;
      info.classList.add("is-open");

      clearBtnHighlight();
      var btn = card.querySelector("a.btn." + type);
      if (btn) {
        btn.classList.add("is-info-open");
        activeInfoBtn = btn;
      }

      infoOpen = true;
      currentInfoType = type;
      currentInfoCardIdx = cards.indexOf(card);
    }

    function closeInfo() {
      if (!info || !infoOpen) return;
      info.classList.remove("is-open");
      clearBtnHighlight();
      infoOpen = false;
      currentInfoType = null;
      currentInfoCardIdx = -1;
      // Clear content once the collapse transition finishes so tall content
      // doesn't flash in mid-close.
      setTimeout(function () {
        if (!info.classList.contains("is-open")) info.innerHTML = "";
      }, 550);
    }

    function clearBtnHighlight() {
      if (activeInfoBtn) {
        activeInfoBtn.classList.remove("is-info-open");
        activeInfoBtn = null;
      }
    }

    // --- Auto-rotate ---------------------------------------------------------
    function tick() {
      if (!paused && !infoOpen && !document.hidden) step(1);
    }

    function restartTimer() {
      if (prefersReduced) return;
      if (timer) clearInterval(timer);
      timer = setInterval(tick, INTERVAL);
    }

    // --- Arrow / keyboard ---------------------------------------------------
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(active - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(active + 1); });

    root.tabIndex = 0;
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { goTo(active - 1); e.preventDefault(); }
      else if (e.key === "ArrowRight") { goTo(active + 1); e.preventDefault(); }
      else if (e.key === "Escape" && infoOpen) { closeInfo(); }
    });

    // --- Unified click handler (capture phase so we preempt link navigation
    //     and the global abstract/award/bibtex toggles in common.js) --------
    root.addEventListener(
      "click",
      function (e) {
        var card = e.target.closest && e.target.closest("ol.bibliography > li");
        if (!card) return;
        var idx = cards.indexOf(card);
        if (idx === -1) return;

        var btn = e.target.closest("a.btn");
        var type = null;
        if (btn) {
          if (btn.classList.contains("abstract")) type = "abstract";
          else if (btn.classList.contains("award")) type = "award";
          else if (btn.classList.contains("bibtex")) type = "bibtex";
        }

        // Abs / Award / BibTeX → route to the info panel instead of the
        // inline collapse that Jekyll ships with.
        if (type) {
          e.preventDefault();
          e.stopPropagation();
          if (idx !== active) setActive(idx);
          if (infoOpen && currentInfoType === type && currentInfoCardIdx === active) {
            closeInfo();
          } else {
            if (infoOpen) {
              info.classList.remove("is-open");
              clearBtnHighlight();
              info.innerHTML = "";
              infoOpen = false;
            }
            openInfo(cards[active], type);
          }
          restartTimer();
          return;
        }

        // Click on a non-active card (outside a real link/btn) → rotate it
        // into center.
        if (idx !== active) {
          e.preventDefault();
          e.stopPropagation();
          goTo(idx);
        }
      },
      true
    );

    // Pause on hover / focus.
    root.addEventListener("mouseenter", function () { paused = true; });
    root.addEventListener("mouseleave", function () { paused = false; });
    root.addEventListener("focusin", function () { paused = true; });
    root.addEventListener("focusout", function () { paused = false; });

    // --- Initial state -------------------------------------------------------
    if (prefersReduced) {
      cards.forEach(function (card) {
        card.removeAttribute("data-pos");
        card.setAttribute("aria-hidden", "false");
      });
      if (ghost) ghost.style.display = "none";
      return;
    }

    setActive(0);
    restartTimer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
