/* =========================================================
   通用交互
   ---------------------------------------------------------
   页脚年份 / 移动端导航 / 反馈弹窗（含焦点陷阱）
   / 顶栏滚动阴影 / 滚动显现 / 导航高亮 / Hero 打字动画
   保持原生 JS，无第三方依赖，直接双击打开也能用。
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------- 页脚年份自动更新 -------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -------- 移动端导航展开 / 收起 -------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var navLinks = navMenu ? navMenu.querySelectorAll("a") : [];

  function closeNav() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.tagName === "A") closeNav();
    });

    /* 视口变宽回到桌面布局时，收起移动菜单 */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeNav();
    });

    /* 点击菜单外部时收起 */
    document.addEventListener("click", function (event) {
      if (!navMenu.classList.contains("is-open")) return;
      if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });
  }

  /* -------- 顶栏滚动阴影 -------- */
  var header = document.getElementById("siteHeader");
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* -------- 滚动显现 -------- */
  var revealTargets = document.querySelectorAll(
    ".hero__inner, .section__head, .card, .placeholder, .cta"
  );

  if (!reduceMotion && "IntersectionObserver" in window && revealTargets.length) {
    document.documentElement.classList.add("js-reveal");

    var revealNow = function (el) { el.classList.add("is-visible"); };
    var ioFired = false;

    var io = new IntersectionObserver(
      function (entries) {
        ioFired = true;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealNow(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    Array.prototype.forEach.call(revealTargets, function (el, i) {
      el.classList.add("reveal");
      var step = i % 3;
      if (step) el.style.transitionDelay = step * 70 + "ms";

      /* 首屏内元素立即显示，避免首帧空白 */
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) revealNow(el);
      else io.observe(el);
    });

    /* 兜底：极少数环境下 IO 回调不触发时，保证内容最终可见 */
    window.setTimeout(function () {
      if (ioFired) return;
      Array.prototype.forEach.call(revealTargets, revealNow);
    }, 2500);
  }

  /* -------- 导航高亮（scrollspy） -------- */
  var spyIds = ["about", "projects", "skills", "contact"];
  var spySections = spyIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (spySections.length && navLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Array.prototype.forEach.call(navLinks, function (a) {
            a.classList.toggle(
              "is-active",
              a.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spySections.forEach(function (section) { spy.observe(section); });
  }

  /* -------- Hero 打字动画（循环显示关键词） -------- */
  var typedEl = document.getElementById("heroTyped");
  if (typedEl && !reduceMotion) {
    var words = [];
    Array.prototype.forEach.call(document.querySelectorAll(".chips .chip"), function (chip) {
      var text = (chip.textContent || "").trim();
      if (text) words.push(text);
    });

    if (words.length) {
      var wordIndex = 0;
      var charIndex = 0;
      var deleting = false;

      var tick = function () {
        var word = words[wordIndex];

        if (!deleting) {
          charIndex++;
          typedEl.textContent = word.slice(0, charIndex);
          if (charIndex === word.length) {
            deleting = true;
            return window.setTimeout(tick, 1400);
          }
          return window.setTimeout(tick, 90);
        }

        charIndex--;
        typedEl.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          return window.setTimeout(tick, 320);
        }
        return window.setTimeout(tick, 45);
      };

      tick();
    }
  }

  /* -------- 反馈弹窗 -------- */
  var modal = document.getElementById("feedbackModal");
  var lastFocused = null;
  var focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var firstField = modal.querySelector("input, select, textarea, button");
    if (firstField) {
      window.setTimeout(function () { firstField.focus(); }, 30);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-open-feedback]"),
    function (el) { el.addEventListener("click", openModal); }
  );

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-close-feedback]"),
    function (el) { el.addEventListener("click", closeModal); }
  );

  document.addEventListener("keydown", function (event) {
    if (!modal || modal.hidden) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    var items = Array.prototype.filter.call(
      modal.querySelectorAll(focusableSelector),
      function (el) { return el.offsetParent !== null; }
    );
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* 供 feedback.js 在提交成功后调用 */
  window.__closeFeedbackModal = closeModal;
})();
