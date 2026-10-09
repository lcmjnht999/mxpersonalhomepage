/* =========================================================
   反馈表单：把访客填写的反馈写入 Supabase 的 feedback 表
   ---------------------------------------------------------
   前置条件：
     1. 已在 Supabase 执行 sql/feedback.sql 建表并开启 RLS 策略
     2. js/supabase-config.js 已填入 Project URL 与 publishable key
   成功后可在 Supabase → Table Editor → feedback 看到记录。

   本版增强：
     - 输入长度校验（最少 5 字 / 最多 1000 字）+ 实时字数
     - 防重复提交（提交中锁定按钮）
     - 失败时保留内容并给出更友好的提示
   ========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("feedbackForm");
  if (!form) return;

  var nameEl = document.getElementById("fbName");
  var relationEl = document.getElementById("fbRelation");
  var deviceEl = document.getElementById("fbDevice");
  var messageEl = document.getElementById("fbMessage");
  var statusEl = document.getElementById("fbStatus");
  var submitBtn = document.getElementById("fbSubmit");
  var counterEl = document.getElementById("fbCounter");

  var MIN_LEN = 5;
  var MAX_LEN = 1000;
  var submitting = false;

  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.className = "form__status" + (type ? " is-" + type : "");
  }

  function markInvalid(el, invalid) {
    if (!el) return;
    el.classList.toggle("is-invalid", !!invalid);
  }

  function updateCounter() {
    if (!counterEl || !messageEl) return;
    var len = messageEl.value.length;
    counterEl.textContent = len + " / " + MAX_LEN;
    counterEl.classList.toggle("is-warn", len > MAX_LEN * 0.9);
  }

  if (messageEl) {
    messageEl.addEventListener("input", function () {
      updateCounter();
      if (messageEl.value.trim().length >= MIN_LEN) markInvalid(messageEl, false);
    });
    updateCounter();
  }

  /* -------- 初始化 Supabase 客户端 -------- */
  var url = window.SUPABASE_URL || "";
  var key = window.SUPABASE_PUBLISHABLE_KEY || "";
  var isConfigured =
    url.indexOf("supabase.co") !== -1 && key.length > 20;

  var client = null;
  if (isConfigured && window.supabase && typeof window.supabase.createClient === "function") {
    try {
      client = window.supabase.createClient(url, key);
    } catch (err) {
      if (window.console && console.error) console.error("[feedback] 初始化失败：", err);
    }
  }

  /* -------- 提交处理 -------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitting) return;

    var message = (messageEl && messageEl.value ? messageEl.value : "").trim();

    if (message.length < MIN_LEN) {
      markInvalid(messageEl, true);
      setStatus("请填写至少 " + MIN_LEN + " 个字，说明具体位置和问题。", "error");
      if (messageEl) messageEl.focus();
      return;
    }

    if (message.length > MAX_LEN) {
      markInvalid(messageEl, true);
      setStatus("反馈内容太长了，请精简到 " + MAX_LEN + " 字以内。", "error");
      return;
    }

    markInvalid(messageEl, false);

    if (!client) {
      setStatus("反馈通道尚未就绪（可能是网络或配置问题），请稍后再试。", "error");
      return;
    }

    submitting = true;
    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = "提交中…";
    setStatus("正在提交，请稍候…");

    var payload = {
      name: (nameEl && nameEl.value ? nameEl.value.trim() : "") || null,
      relation: relationEl ? relationEl.value : "其他",
      device: deviceEl ? deviceEl.value : "其他",
      message: message,
      version: window.SITE_VERSION || "unknown"
    };

    client
      .from("feedback")
      .insert(payload)
      .then(function (res) {
        if (res && res.error) throw res.error;
        setStatus("提交成功，谢谢你的反馈！", "success");
        form.reset();
        updateCounter();
        window.setTimeout(function () {
          if (typeof window.__closeFeedbackModal === "function") {
            window.__closeFeedbackModal();
          }
          setStatus("");
        }, 1600);
      })
      .catch(function (err) {
        if (window.console && console.error) console.error("[feedback] 提交失败：", err);
        setStatus("提交失败，可能是网络波动。你的内容已保留，请稍后重试。", "error");
      })
      .then(function () {
        submitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });
})();
