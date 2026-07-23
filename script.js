// ============================================================
// MAYUR UNAGAR — PORTFOLIO
// Vanilla JS: mobile nav, theme toggle, scroll progress, reveals
// ============================================================

(function(){
  "use strict";

  /* ---------- Birthday loading screen + dashboard celebration ---------- */
  function isMayursBirthday() {
    var today = new Date();
    // Months are zero-based: 6 is July. This is 23 July in the visitor's local time.
    return today.getMonth() === 6 && today.getDate() === 23;
  }

  function addConfetti(container, amount, startDelay) {
    if (!container) return;

    for (var i = 0; i < amount; i += 1) {
      var piece = document.createElement("span");
      piece.className = "birthday-confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.animationDelay = startDelay + Math.random() * 1.4 + "s";
      piece.style.animationDuration = 2.8 + Math.random() * 1.8 + "s";
      piece.style.setProperty("--birthday-drift", Math.random() * 26 - 13 + "vw");
      piece.style.setProperty("--birthday-rotation", Math.random() * 720 - 360 + "deg");
      container.appendChild(piece);
    }
  }

  function startBirthdayExperience() {
    if (!isMayursBirthday()) return;

    var experience = document.getElementById("birthdayExperience");
    var loadingScreen = document.getElementById("birthdayLoadingScreen");
    var loadingConfetti = document.getElementById("birthdayLoadingConfetti");
    var dashboardConfetti = document.getElementById("birthdayDashboardConfetti");
    if (!experience || !loadingScreen) return;

    experience.hidden = false;
    addConfetti(loadingConfetti, 54, 0);
    addConfetti(dashboardConfetti, 42, 2.1);

    window.setTimeout(function () {
      loadingScreen.classList.add("is-finished");
    }, 2400);
    window.setTimeout(function () {
      loadingScreen.remove();
    }, 3000);
    window.setTimeout(function () {
      experience.remove();
    }, 8500);
  }

  startBirthdayExperience();

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
