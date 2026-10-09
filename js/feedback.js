/* =========================================================
   反馈表单：把访客填写的反馈写入 Supabase 的 feedback 表
   ---------------------------------------------------------
   前置条件：
     1. 已在 Supabase 执行 sql/feedback.sql 建表并开启 RLS 策略
     2. js/supabase-config.js 已填入 Project URL 与 publishable key
   成功后可在 Supabase → Table Editor → feedback 看到记录。
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

  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.className = "form__status" + (type ? " is-" + type : "");
  }

  /* -------- 初始化 Supabase 客户端 -------- */
  var url = window.SUPABASE_URL || "";
  var key = window.SUPABASE_PUBLISHABLE_KEY || "";
  var isConfigured =
    url.indexOf("YOUR-") === -1 &&
    key.indexOf("YOUR-") === -1 &&
    url.indexOf("supabase.co") !== -1;

  var client = null;
  if (isConfigured && window.supabase && typeof window.supabase.createClient === "function") {
    client = window.supabase.createClient(url, key);
  }

  /* -------- 提交处理 -------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var message = (messageEl && messageEl.value ? messageEl.value : "").trim();
    if (!message) {
      setStatus("请先填写反馈内容。", "error");
      if (messageEl) messageEl.focus();
      return;
    }

    if (!client) {
      setStatus("反馈通道尚未配置完成：请先在 js/supabase-config.js 填入 Supabase 配置。", "error");
      return;
    }

    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = "提交中…";
    setStatus("");

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
        window.setTimeout(function () {
          if (typeof window.__closeFeedbackModal === "function") {
            window.__closeFeedbackModal();
          }
          setStatus("");
        }, 1500);
      })
      .catch(function (err) {
        if (window.console && console.error) console.error("[feedback] 提交失败：", err);
        setStatus("提交失败，请稍后重试（内容已保留）。", "error");
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });
})();
