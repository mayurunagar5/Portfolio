// ============================================================
// MAYUR UNAGAR — PORTFOLIO
// Vanilla JS: mobile nav, theme toggle, scroll progress, reveals
// ============================================================

(function(){
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var burger = document.getElementById("navBurger");
  var mobileNav = document.getElementById("mobileNav");

  if (burger && mobileNav) {
    burger.addEventListener("click", function(){
      var isOpen = mobileNav.classList.toggle("open");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mobileNav.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click", function(){
        mobileNav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Theme toggle (dark default, light optional) ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("mu-theme"); } catch(e) {}

  if (stored === "light") {
    root.setAttribute("data-theme", "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function(){
      var isLight = root.getAttribute("data-theme") === "light";
      if (isLight) {
        root.removeAttribute("data-theme");
        try { localStorage.setItem("mu-theme", "dark"); } catch(e) {}
      } else {
        root.setAttribute("data-theme", "light");
        try { localStorage.setItem("mu-theme", "light"); } catch(e) {}
      }
    });
  }

  /* ---------- Scroll progress bar ---------- */
  var progressFill = document.getElementById("progressFill");
  function updateProgress(){
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressFill) progressFill.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main .section, .hero");
  var navLinks = document.querySelectorAll(".rail-nav a");

  function setActiveLink(){
    var scrollPos = window.scrollY + window.innerHeight * 0.35;
    var currentId = null;
    sections.forEach(function(sec){
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(function(link){
      var target = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", target === currentId);
    });
  }
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-line");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in-view"); });
  }

})();