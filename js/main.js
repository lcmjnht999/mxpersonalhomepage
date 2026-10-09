/* =========================================================
   通用交互：页脚年份 / 移动端导航 / 反馈弹窗开关
   ========================================================= */
(function () {
  "use strict";

  /* -------- 页脚年份自动更新 -------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -------- 移动端导航展开 / 收起 -------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* -------- 反馈弹窗 -------- */
  var modal = document.getElementById("feedbackModal");
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var firstField = modal.querySelector("input, select, textarea, button");
    if (firstField) firstField.focus();
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
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });

  /* 供 feedback.js 在提交成功后调用 */
  window.__closeFeedbackModal = closeModal;
})();
