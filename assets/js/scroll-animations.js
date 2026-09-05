document.addEventListener("DOMContentLoaded", function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var observer = new IntersectionObserver(
    function (entries) {
      // Stagger elements that enter the viewport in the same batch,
      // so grouped sections cascade in instead of popping at once.
      var order = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.setProperty("--stagger-delay", order * 0.12 + "s");
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
          order++;
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
  );

  document.querySelectorAll(".animate-on-scroll").forEach(function (el) {
    observer.observe(el);
  });
});
