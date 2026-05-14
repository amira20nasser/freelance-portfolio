/**
 * Scroll-linked motion: smooth anchor offset, reveals, nav spy, skill meters.
 */
(function () {
  "use strict";

  var SECTION_IDS = ["hero", "about", "skills", "projects", "services", "contact"];

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getHeaderOffset() {
    var header = document.querySelector("header");
    return header ? header.offsetHeight : 0;
  }

  function initSmoothNav() {
    $$('a[href^="#"]').forEach(function (anchor) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;

      anchor.addEventListener("click", function (e) {
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var extra = id === "#main-content" ? 0 : 10;
        var top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          getHeaderOffset() -
          extra;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      });
    });
  }

  function setActiveNav(id) {
    $$(".nav-link").forEach(function (link) {
      var href = link.getAttribute("href");
      var match = href === "#" + id;
      link.classList.toggle("nav-link--active", match);
    });
  }

  function getCurrentSectionId() {
    var marker = getHeaderOffset() + 24;
    var i;
    var el;
    var r;

    for (i = 0; i < SECTION_IDS.length; i++) {
      el = document.getElementById(SECTION_IDS[i]);
      if (!el) continue;
      r = el.getBoundingClientRect();
      if (r.top <= marker && r.bottom > marker) {
        return SECTION_IDS[i];
      }
    }

    var fallback = SECTION_IDS[0];
    for (i = SECTION_IDS.length - 1; i >= 0; i--) {
      el = document.getElementById(SECTION_IDS[i]);
      if (!el) continue;
      r = el.getBoundingClientRect();
      if (r.top <= marker) {
        fallback = SECTION_IDS[i];
        break;
      }
    }
    return fallback;
  }

  function initNavSpy() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        setActiveNav(getCurrentSectionId());
      });
    }

    setActiveNav(getCurrentSectionId());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function animateSkillBars() {
    var bars = $$(".progress-bar-fill");
    bars.forEach(function (bar, i) {
      var w = bar.getAttribute("data-width");
      if (!w) return;
      bar.style.setProperty("--target-width", w + "%");
      bar.style.setProperty("--bar-delay", prefersReducedMotion() ? "0ms" : i * 95 + "ms");
      window.requestAnimationFrame(function () {
        bar.classList.add("is-filled");
      });
    });
  }

  function initScrollAnimations() {
    if (prefersReducedMotion()) {
      $$(".reveal-on-scroll").forEach(function (el) {
        el.classList.add("is-visible");
      });
      $$(".reveal-stagger").forEach(function (el) {
        el.classList.add("is-visible");
      });
      $$(".reveal-stagger-group").forEach(function (el) {
        el.classList.add("is-visible");
      });
      animateSkillBars();
      return;
    }

    var revealSelectors = [".reveal-on-scroll", ".reveal-stagger", ".reveal-stagger-group"];
    var revealables = [];
    revealSelectors.forEach(function (sel) {
      $$(sel).forEach(function (el) {
        if (revealables.indexOf(el) === -1) revealables.push(el);
      });
    });

    if (!("IntersectionObserver" in window)) {
      revealables.forEach(function (el) {
        el.classList.add("is-visible");
      });
      animateSkillBars();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    revealables.forEach(function (el) {
      io.observe(el);
    });

    var skillsSection = $("#skills");
    var skillBarsDone = false;

    function tryAnimateSkillBars() {
      if (skillBarsDone) return;
      skillBarsDone = true;
      animateSkillBars();
    }

    function skillsLikelyVisible() {
      if (!skillsSection) return false;
      var r = skillsSection.getBoundingClientRect();
      return r.top < window.innerHeight * 0.88 && r.bottom > 0;
    }

    if (skillsSection && "IntersectionObserver" in window) {
      var sk = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            tryAnimateSkillBars();
            sk.disconnect();
          });
        },
        { threshold: 0.12 }
      );
      sk.observe(skillsSection);
      if (skillsLikelyVisible()) {
        tryAnimateSkillBars();
        sk.disconnect();
      }
    } else {
      tryAnimateSkillBars();
    }
  }

  function init() {
    initSmoothNav();
    initScrollAnimations();
    initNavSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
