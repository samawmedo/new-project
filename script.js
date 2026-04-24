(function () {
  "use strict";

  var THEME_KEY = "mh-wedding-theme";
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var loader = document.getElementById("loader");
  var intro = document.getElementById("intro");
  var openBtn = document.getElementById("open-invitation");
  var main = document.getElementById("main-content");
  var siteHeader = document.getElementById("site-header");
  var themeToggle = document.getElementById("theme-toggle");
  var musicToggle = document.getElementById("music-toggle");
  var headerMusic = document.getElementById("header-music");
  var bgMusic = document.getElementById("bg-music");
  var cursorGlow = document.getElementById("cursor-glow");
  var canvas = document.getElementById("particles-canvas");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var rsvpForm = document.getElementById("rsvp-form");
  var rsvpSubmit = document.getElementById("rsvp-submit");

  var cdDays = document.getElementById("cd-days");
  var cdHours = document.getElementById("cd-hours");
  var cdMins = document.getElementById("cd-mins");
  var cdSecs = document.getElementById("cd-secs");

  var weddingDate = new Date(2027, 9, 17, 17, 0, 0);

  function initTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
      return;
    }
    if (!document.documentElement.getAttribute("data-theme")) {
      document.documentElement.setAttribute(
        "data-theme",
        window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
      );
    }
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }

  initTheme();
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  function hideLoader() {
    if (!loader) return;
    loader.classList.add("loader--done");
    setTimeout(function () {
      if (loader.parentNode) loader.setAttribute("aria-hidden", "true");
    }, 900);
  }

  if (prefersReducedMotion) {
    hideLoader();
  } else {
    window.setTimeout(hideLoader, 1400);
  }

  function setMusicUi(on) {
    if (musicToggle) {
      musicToggle.setAttribute("aria-pressed", on ? "true" : "false");
      var label = musicToggle.querySelector(".btn-audio__label");
      if (label) label.textContent = on ? "الموسيقى تعمل" : "الموسيقى متوقفة";
    }
    if (headerMusic) headerMusic.setAttribute("aria-pressed", on ? "true" : "false");
  }

  var musicRampId = null;
  function rampVolume(target, durationMs) {
    if (!bgMusic) return;
    if (musicRampId) cancelAnimationFrame(musicRampId);
    var start = bgMusic.volume;
    var t0 = performance.now();
    function step(now) {
      var t = Math.min(1, (now - t0) / durationMs);
      var eased = t * t * (3 - 2 * t);
      bgMusic.volume = start + (target - start) * eased;
      if (t < 1) musicRampId = requestAnimationFrame(step);
    }
    musicRampId = requestAnimationFrame(step);
  }

  function playMusicWithFade() {
    if (!bgMusic) return;
    bgMusic.volume = 0;
    var p = bgMusic.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
    rampVolume(0.35, 1200);
  }

  function pauseMusicWithFade() {
    if (!bgMusic) return;
    var startVol = bgMusic.volume;
    if (musicRampId) cancelAnimationFrame(musicRampId);
    var t0 = performance.now();
    function step(now) {
      var t = Math.min(1, (now - t0) / 800);
      bgMusic.volume = startVol * (1 - t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        bgMusic.pause();
        bgMusic.volume = 0.35;
      }
    }
    requestAnimationFrame(step);
  }

  var musicOn = false;
  function toggleMusic() {
    musicOn = !musicOn;
    setMusicUi(musicOn);
    if (musicOn) playMusicWithFade();
    else pauseMusicWithFade();
  }

  if (bgMusic) {
    bgMusic.volume = 0;
  }
  setMusicUi(false);

  if (musicToggle) {
    musicToggle.addEventListener("click", function () {
      toggleMusic();
    });
  }
  if (headerMusic) {
    headerMusic.addEventListener("click", function () {
      toggleMusic();
    });
  }

  function openInvitation() {
    document.body.classList.add("invitation-open");
    if (main) main.classList.add("main--revealing");
    window.setTimeout(function () {
      if (main) main.classList.remove("main--revealing");
    }, 1600);

    window.setTimeout(function () {
      initReveal();
    }, prefersReducedMotion ? 0 : 400);

    if (intro) {
      intro.classList.remove("intro--visible");
      intro.classList.add("intro--exit");
    }

    window.setTimeout(function () {
      if (intro) {
        intro.setAttribute("aria-hidden", "true");
        intro.style.display = "none";
      }
      if (siteHeader) siteHeader.classList.add("site-header--visible");
      if (main) {
        main.focus({ preventScroll: true });
      }
    }, prefersReducedMotion ? 0 : 1100);
  }

  if (openBtn) {
    openBtn.addEventListener("click", function () {
      openInvitation();
    });
  }

  function initParticles() {
    if (!canvas || prefersReducedMotion) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var particles = [];
    var n = Math.min(55, Math.floor((window.innerWidth / 40) * 8));

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.15,
        a: Math.random() * 0.35 + 0.15,
      };
    }

    resize();
    for (var i = 0; i < n; i++) particles.push(makeParticle());

    var running = true;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.y > window.innerHeight + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        var warm = i % 2 === 0 ? "217, 166, 174" : "201, 169, 98";
        ctx.fillStyle = "rgba(" + warm + ", " + p.a + ")";
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    window.addEventListener(
      "resize",
      function () {
        resize();
      },
      { passive: true }
    );
  }

  initParticles();

  if (cursorGlow && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    var glowTicking = false;
    window.addEventListener(
      "mousemove",
      function (e) {
        if (glowTicking) return;
        glowTicking = true;
        requestAnimationFrame(function () {
          cursorGlow.style.left = e.clientX + "px";
          cursorGlow.style.top = e.clientY + "px";
          glowTicking = false;
        });
      },
      { passive: true }
    );
  }

  var prevVals = { days: null, hours: null, minutes: null, seconds: null };

  function tickCountdown() {
    var now = new Date().getTime();
    var end = weddingDate.getTime();
    var diff = Math.max(0, end - now);

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    function setVal(el, val, key) {
      if (!el) return;
      var str = String(val).padStart(2, "0");
      if (prevVals[key] !== str) {
        prevVals[key] = str;
        el.textContent = str;
        el.classList.remove("countdown__value--tick");
        void el.offsetWidth;
        el.classList.add("countdown__value--tick");
      }
    }

    setVal(cdDays, days, "days");
    setVal(cdHours, hours, "hours");
    setVal(cdMins, minutes, "minutes");
    setVal(cdSecs, seconds, "seconds");
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);

  var revealStarted = false;
  function initReveal() {
    if (revealStarted) return;
    revealStarted = true;
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || "صورة من المعرض";
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    window.setTimeout(function () {
      lightbox.hidden = true;
      if (lightboxImg) lightboxImg.src = "";
      document.body.style.overflow = "";
    }, 320);
  }

  document.querySelectorAll(".gallery__item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-src");
      var cap = btn.getAttribute("data-caption");
      if (src) openLightbox(src, cap);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  if (rsvpForm && rsvpSubmit) {
    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!rsvpForm.checkValidity()) {
        rsvpForm.reportValidity();
        return;
      }
      rsvpSubmit.disabled = true;
      rsvpSubmit.classList.add("is-loading");
      window.setTimeout(function () {
        rsvpSubmit.classList.remove("is-loading");
        rsvpSubmit.disabled = false;
        var success = document.getElementById("rsvp-success");
        if (success) success.hidden = false;
        rsvpForm.reset();
      }, 1800);
    });
  }
})();
