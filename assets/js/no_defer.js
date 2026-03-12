// add bootstrap classes to tables
document.addEventListener("DOMContentLoaded", function () {
  var isDark = determineComputedTheme() === "dark";
  document.querySelectorAll("table").forEach(function (table) {
    if (isDark) {
      table.classList.add("table-dark");
    } else {
      table.classList.remove("table-dark");
    }

    // only select tables that are not inside an element with "news", "card", or "archive" class, or inside <code>
    var parent = table.parentElement;
    var skip = false;
    while (parent) {
      if (parent.tagName === "CODE") { skip = true; break; }
      if (parent.className && (
        parent.className.indexOf("news") !== -1 ||
        parent.className.indexOf("card") !== -1 ||
        parent.className.indexOf("archive") !== -1
      )) { skip = true; break; }
      parent = parent.parentElement;
    }

    if (!skip) {
      table.setAttribute("data-toggle", "table");
      table.classList.add("table-hover");
    }
  });
});
