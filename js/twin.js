/* 数字分身
   ------------------------------------------------------------
   · 只有三个固定问题，答案是提前写好的文本，点击即"生成"。
   · 纯前端、无依赖、不联网、不读取任何用户输入。
   · 交互：点击问题 → 先显示"正在输入…" → 约 0.6 秒后整段显示答案。
   ------------------------------------------------------------ */
(function () {
  "use strict";

  var QA = [
    {
      q: "你是谁？",
      a: "我是许铭真，一名脑机接口专业的本科生，就读于天津大学 · 香港理工大学 · 深圳未来技术学院。平时保持着跨学科自学的习惯，从数学、物理到计算机、语言都有涉猎。你也可以叫我 Emily。"
    },
    {
      q: "你的专业是什么？",
      a: "我读的是脑机接口专业（本科）。这是个交叉学科方向，把大脑、信号和计算机连在一起——既需要工科的严谨，也离不开对人和认知的理解。我很喜欢这种横跨多个领域的感觉。"
    },
    {
      q: "你的兴趣和爱好？",
      a: "我的兴趣大致有四块：写作，偏爱有博弈色彩的悲剧叙事；音乐，喜欢情感细腻、有力量感的旋律；美食与风景，用味觉和眼睛收藏世界；还有收集故事——别人的、书里的、路上的都算。"
    }
  ];

  var root = document.getElementById("twinApp");
  if (!root) return;

  var logEl = root.querySelector("[data-twin-log]");
  if (!logEl) return;

  var busy = false;

  function bubble(kind, text) {
    var wrap = document.createElement("div");
    wrap.className = "twin__msg twin__msg--" + kind;

    var b = document.createElement("p");
    b.className = "twin__bubble";
    b.textContent = text;
    wrap.appendChild(b);

    logEl.appendChild(wrap);
    logEl.scrollTop = logEl.scrollHeight;
    return b;
  }

  function answer(item) {
    if (busy) return;
    busy = true;

    bubble("user", item.q);

    var typing = bubble("bot", "");
    typing.classList.add("twin__bubble--typing");
    var dots = document.createElement("span");
    dots.className = "twin__dots";
    dots.innerHTML = "<i></i><i></i><i></i>";
    typing.appendChild(dots);

    setTimeout(function () {
      typing.classList.remove("twin__bubble--typing");
      typing.textContent = item.a;
      logEl.scrollTop = logEl.scrollHeight;
      busy = false;
    }, 600);
  }

  root.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-twin-i]");
    if (!btn) return;
    var item = QA[Number(btn.getAttribute("data-twin-i"))];
    if (item) answer(item);
  });

  bubble("bot", "你好，我是许铭真的数字分身。点下面的问题，我讲给你听。");
})();
