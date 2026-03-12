document.addEventListener("DOMContentLoaded", function () {
  // add toggle functionality to abstract, award and bibtex buttons
  function setupBibToggle(selector, showClass, hideClasses) {
    document.querySelectorAll(selector).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var container = this.closest("li") || this.parentElement.parentElement;
        var target = container.querySelector("." + showClass + ".hidden");
        if (target) target.classList.toggle("open");
        hideClasses.forEach(function (cls) {
          var el = container.querySelector("." + cls + ".hidden.open");
          if (el) el.classList.remove("open");
        });
      });
    });
  }

  setupBibToggle("a.abstract", "abstract", ["award", "bibtex"]);
  setupBibToggle("a.award", "award", ["abstract", "bibtex"]);
  setupBibToggle("a.bibtex", "bibtex", ["abstract", "award"]);

  // Remove MDB waves effect
  document.querySelectorAll("a").forEach(function (a) {
    a.classList.remove("waves-effect", "waves-light");
  });

  // bootstrap-toc
  var tocSidebar = document.getElementById("toc-sidebar");
  if (tocSidebar && typeof Toc !== "undefined") {
    // remove related publications years from the TOC
    document.querySelectorAll(".publications h2").forEach(function (h2) {
      h2.setAttribute("data-toc-skip", "");
    });
    Toc.init($(tocSidebar));
    $("body").scrollspy({ target: "#toc-sidebar" });
  }

  // add css to jupyter notebooks
  var cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  var jupyterTheme = determineComputedTheme();

  document.querySelectorAll(".jupyter-notebook-iframe-container iframe").forEach(function (iframe) {
    try {
      iframe.contentDocument.head.appendChild(cssLink.cloneNode());
      if (jupyterTheme === "dark") {
        iframe.addEventListener("load", function () {
          iframe.contentDocument.body.setAttribute("data-jp-theme-light", "false");
          iframe.contentDocument.body.setAttribute("data-jp-theme-name", "JupyterLab Dark");
        });
      }
    } catch (e) {
      // cross-origin iframe, skip
    }
  });

  // trigger popovers (requires jQuery + Bootstrap)
  if (typeof $ !== "undefined" && $.fn.popover) {
    $('[data-toggle="popover"]').popover({ trigger: "hover" });
  }
});
