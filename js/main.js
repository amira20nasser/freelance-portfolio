/**
 * Portfolio template — vanilla JS entry.
 * Theme toggle, mobile navigation, form validation. Scroll and motion live in motion.js.
 */

(function () {
  "use strict";

  var THEME_KEY = "portfolio-theme";
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  // ---------- Utilities ----------
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ---------- Theme (dark / light) ----------
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
    } else {
      applyTheme(prefersDark.matches ? "dark" : "light");
    }

    prefersDark.addEventListener("change", function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });

    var toggle = $("#theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var next = document.documentElement.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
      setStoredTheme(next);
    });
  }

  // ---------- Mobile navigation ----------
  function initMobileMenu() {
    var btn = $("#menu-toggle");
    var panel = $("#mobile-menu");
    if (!btn || !panel) return;

    var openIcon = $(".menu-open-icon", btn);
    var closeIcon = $(".menu-close-icon", btn);

    function setOpen(isOpen) {
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      btn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      if (openIcon) openIcon.classList.toggle("hidden", isOpen);
      if (closeIcon) closeIcon.classList.toggle("hidden", !isOpen);

      if (isOpen) {
        panel.classList.remove("mobile-menu--collapsed");
        panel.setAttribute("aria-hidden", "false");
        document.body.classList.add("overflow-hidden");
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            panel.classList.add("mobile-menu--open");
          });
        });
      } else {
        panel.classList.remove("mobile-menu--open");
        document.body.classList.remove("overflow-hidden");
        var delay = prefersReducedMotion() ? 0 : 420;
        window.setTimeout(function () {
          panel.classList.add("mobile-menu--collapsed");
          panel.setAttribute("aria-hidden", "true");
        }, delay);
      }
    }

    btn.addEventListener("click", function () {
      var willOpen = panel.classList.contains("mobile-menu--collapsed");
      setOpen(willOpen);
    });

    $$("#mobile-menu a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 767px)").matches) {
          setOpen(false);
        }
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    });
  }

  // ---------- Contact form validation ----------
  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;

    var fields = {
      name: { input: $("#name", form), error: $("#name-error", form) },
      email: { input: $("#email", form), error: $("#email-error", form) },
      message: { input: $("#message", form), error: $("#message-error", form) },
    };

    var success = $("#form-success", form);

    function clearErrors() {
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        if (f.error) {
          f.error.textContent = "";
          f.error.classList.add("hidden");
        }
        if (f.input) {
          f.input.setAttribute("aria-invalid", "false");
        }
      });
      if (success) success.classList.add("hidden");
    }

    function showError(key, message) {
      var f = fields[key];
      if (!f || !f.input || !f.error) return;
      f.error.textContent = message;
      f.error.classList.remove("hidden");
      f.input.setAttribute("aria-invalid", "true");
    }

    function validate() {
      clearErrors();
      var ok = true;
      var nameVal = fields.name.input ? fields.name.input.value.trim() : "";
      var emailVal = fields.email.input ? fields.email.input.value.trim() : "";
      var messageVal = fields.message.input ? fields.message.input.value.trim() : "";

      if (!nameVal) {
        showError("name", "Please enter your name.");
        ok = false;
      }

      if (!emailVal) {
        showError("email", "Please enter your email.");
        ok = false;
      } else if (!isValidEmail(emailVal)) {
        showError("email", "Please enter a valid email address.");
        ok = false;
      }

      if (!messageVal) {
        showError("message", "Please enter a message.");
        ok = false;
      }

      return ok;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      form.reset();
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        if (f.error) {
          f.error.textContent = "";
          f.error.classList.add("hidden");
        }
        if (f.input) {
          f.input.setAttribute("aria-invalid", "false");
        }
      });
      if (success) {
        success.classList.remove("hidden");
      }
    });

    ["input", "blur"].forEach(function (evt) {
      Object.keys(fields).forEach(function (key) {
        var input = fields[key].input;
        if (!input) return;
        input.addEventListener(evt, function () {
          if (input.getAttribute("aria-invalid") === "true") {
            validate();
          }
        });
      });
    });
  }

  // ---------- Footer year ----------
  function initYear() {
    var el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // ---------- Boot ----------
  function init() {
    initTheme();
    initMobileMenu();
    initContactForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
