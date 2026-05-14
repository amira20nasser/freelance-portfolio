/**
 * Accessible project detail modal (focus return, Escape, backdrop close).
 */
(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initProjectModal() {
    var modal = $("#project-modal");
    if (!modal) return;

    var dialog = $(".project-modal-dialog", modal);
    var titleEl = $("#project-modal-title", modal);
    var bodyEl = $("#project-modal-body", modal);
    var tagsEl = $("#project-modal-tags", modal);
    var lastFocus = null;

    function getFocusable() {
      if (!dialog) return [];
      return $$(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        dialog
      ).filter(function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
    }

    function trapFocus(e) {
      if (e.key !== "Tab" || !modal.classList.contains("is-open")) return;
      var focusable = getFocusable();
      if (!focusable.length) return;
      if (focusable.length === 1) {
        e.preventDefault();
        focusable[0].focus();
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function open(data) {
      lastFocus = document.activeElement;
      if (titleEl) titleEl.textContent = data.title || "";
      if (bodyEl) bodyEl.textContent = data.description || "";
      if (tagsEl) {
        tagsEl.innerHTML = "";
        var tags = (data.tags || "").split(",").map(function (t) {
          return t.trim();
        }).filter(Boolean);
        tags.forEach(function (tag) {
          var span = document.createElement("span");
          span.className =
            "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300";
          span.textContent = tag;
          tagsEl.appendChild(span);
        });
      }

      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("overflow-hidden");

      window.requestAnimationFrame(function () {
        modal.classList.add("is-open");
        var closeBtn = $("#project-modal-close", modal);
        if (closeBtn) closeBtn.focus();
      });
    }

    function close() {
      modal.classList.remove("is-open");
      document.body.classList.remove("overflow-hidden");
      var ms = prefersReducedMotion() ? 0 : 320;
      window.setTimeout(function () {
        modal.setAttribute("hidden", "");
        modal.setAttribute("aria-hidden", "true");
        if (lastFocus && typeof lastFocus.focus === "function") {
          lastFocus.focus();
        }
      }, ms);
    }

    $$("[data-project-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        open({
          title: btn.getAttribute("data-project-title") || "",
          description: btn.getAttribute("data-project-description") || "",
          tags: btn.getAttribute("data-project-tags") || "",
        });
      });
    });

    $$("[data-project-modal-close]", modal).forEach(function (el) {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        close();
        return;
      }
      trapFocus(e);
    });
  }

  function init() {
    initProjectModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
