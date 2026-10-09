/* =========================================================
   前端公开配置
   ---------------------------------------------------------
   这两个值「可以公开」，放进网页/公开仓库是安全的：
     - Supabase 项目地址（Project URL）
     - publishable key（旧称 anon key）
   真正的安全来自数据库的 RLS 策略，而不是隐藏这些值。

   ⚠️ 绝对不要在这里放：
     - service_role key / secret key
     - 数据库密码
   这两个是最高权限，只用于服务端，永远不进前端、公开仓库或截图。

   用法：把下面两个占位值换成你在
   Supabase → Project Settings → API 里复制到的真实值。
   ========================================================= */

window.SUPABASE_URL = "https://incjohmumdgnigyusecu.supabase.co";
window.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Hmum1CymN2A9hD2wfJHXYQ_3pnywARX";

/* 当前网站版本号：提交反馈时会自动附带，方便按版本分析反馈。
   每次发布新版本时改这里即可，例如 "V1" → "V2" → "V3" → "V4" → "V5"。
   V4 = 真实个人信息 + 最终视觉风格（深蓝商务 · 中英双语）。
   V5 = 在 V4 之上新增「数字分身」（三个固定问题的问答）。 */
window.SITE_VERSION = "V5";
