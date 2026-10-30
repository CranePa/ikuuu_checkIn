/**
 * Cloudflare Worker: iKuuu 登录与 Cookie 自动更新网关
 * 专为 iOS「添加到主屏幕」优化的 PWA Web App
 */

// 渲染移动端 Web App 界面 (完美适配 iOS 刘海/灵动岛全屏 PWA)
function renderWebAppHtml(targetRepo = "995william/ikuuu_checkIn") {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>iKuuu 登录助手</title>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="iKuuu助手">
  <meta name="theme-color" content="#0f172a">
  <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230284c7'/><text x='50' y='65' font-size='50' text-anchor='middle' fill='white'>✈️</text></svg>">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", Roboto, sans-serif; }
    body {
      background-color: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      padding-top: max(68px, calc(env(safe-area-inset-top, 44px) + 24px));
      padding-bottom: max(32px, calc(env(safe-area-inset-bottom, 20px) + 20px));
      padding-left: max(16px, env(safe-area-inset-left));
      padding-right: max(16px, env(safe-area-inset-right));
    }
    .card {
      background: #1e293b;
      border-radius: 20px;
      width: 100%;
      max-width: 420px;
      padding: 24px 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
      border: 1px solid #334155;
    }
    .title-box { text-align: center; margin-bottom: 22px; }
    .title-box h1 {
      font-size: 22px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .title-box p { font-size: 13px; color: #94a3b8; margin-top: 6px; }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .form-group { margin-bottom: 14px; }
    .form-group label {
      display: block;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 6px;
      font-weight: 500;
    }
    input[type="email"], input[type="password"], textarea {
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      color: #f8fafc;
      padding: 13px 14px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus, textarea:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    .captcha-wrap {
      margin: 16px 0;
      min-height: 44px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .geetest-placeholder {
      font-size: 13px;
      color: #64748b;
      padding: 10px;
    }
    .btn-main {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: white;
      border: none;
      border-radius: 14px;
      width: 100%;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
      transition: transform 0.1s, opacity 0.2s;
    }
    .btn-main:active { transform: scale(0.98); opacity: 0.9; }
    .btn-main:disabled {
      background: #334155;
      color: #64748b;
      box-shadow: none;
      cursor: not-allowed;
    }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 22px 0 16px;
      color: #64748b;
      font-size: 12px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #334155;
    }
    .divider span { padding: 0 10px; }
    .btn-secondary {
      background: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 12px;
      width: 100%;
      padding: 13px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn-secondary:active { background: rgba(56, 189, 248, 0.22); }
    .status-msg {
      margin-top: 18px;
      padding: 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.6;
      display: none;
    }
    .status-loading {
      display: block;
      background: rgba(56, 189, 248, 0.1);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      text-align: center;
    }
    .status-success {
      display: block;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .status-error {
      display: block;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .badge-highlight {
      display: inline-block;
      background: #0284c7;
      color: white;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 4px;
    }
    .footer-box { margin-top: 24px; text-align: center; max-width: 420px; }
    .pwa-tip { font-size: 12px; color: #64748b; line-height: 1.6; }
    .pwa-tip b { color: #94a3b8; }
  </style>
  <!-- 引入 Geetest 官方验证组件 -->
  <script src="https://static.geetest.com/v4/gt4.js"></script>
</head>
<body>
  <div class="card">
    <div class="title-box">
      <h1>✈️ iKuuu 登录同步助手</h1>
      <p>一键自动更新 GitHub Actions Cookie 凭据</p>
    </div>

    <div class="section-title">
      <span>🔐</span> <span>极速登录并自动同步</span>
    </div>

    <div class="form-group">
      <label for="email">iKuuu 账号邮箱</label>
      <input type="email" id="email" placeholder="输入注册邮箱" autocomplete="username">
    </div>

    <div class="form-group">
      <label for="password">登录密码</label>
      <input type="password" id="password" placeholder="输入登录密码" autocomplete="current-password">
    </div>

    <div class="captcha-wrap">
      <div id="captcha-box" class="embed-captcha">
        <div class="geetest-placeholder">⏳ 正在加载极验验证码...</div>
      </div>
    </div>

    <button class="btn-main" id="btn-login" onclick="handleLoginSubmit()">
      🚀 立即登录并同步 GitHub Actions
    </button>

    <div class="divider"><span>或使用已有凭据同步</span></div>

    <button class="btn-secondary" onclick="readClipboardAndSync()">
      📋 读取剪贴板 Cookie 并同步
    </button>

    <div id="status-box" class="status-msg"></div>
  </div>

  <div class="footer-box">
    <p class="pwa-tip">
      💡 <b>推荐使用方式</b>：点击 Safari 底部 <b>分享</b> 按钮<br>
      选择 <b>「添加到主屏幕」</b>，随时在手机桌面点一下即可更新！<br>
      更新完成后企业微信将自动推送最新剩余有效期通知。
    </p>
  </div>

  <script>
    let geetestInstance = null;
    let captchaResult = null;

    // 自动回填本地记住的账号
    try {
      const savedEmail = localStorage.getItem('ikuuu_saved_email');
      if (savedEmail) {
        document.getElementById('email').value = savedEmail;
      }
    } catch(e) {}

    // 初始化 Geetest v4
    function initCaptcha() {
      if (typeof initGeetest4 !== 'function') {
        setTimeout(initCaptcha, 500);
        return;
      }
      initGeetest4({
        captchaId: 'cc96d05ba8b60f9112f76e18526fcb73',
        product: 'float',
        nativeButton: { width: '100%' }
      }, function(captcha) {
        geetestInstance = captcha;
        document.getElementById('captcha-box').innerHTML = '';
        captcha.appendTo('#captcha-box');
        captcha.onSuccess(function() {
          captchaResult = captcha.getValidate();
        });
        captcha.onFail(function() {
          captchaResult = null;
        });
        captcha.onError(function() {
          captchaResult = null;
        });
      });
    }
    initCaptcha();

    // 提交登录并自动同步
    async function handleLoginSubmit() {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const statusBox = document.getElementById('status-box');

      if (!email || !password) {
        alert('请输入完整的邮箱账号和密码！');
        return;
      }

      if (!captchaResult || !captchaResult.lot_number) {
        alert('请先点击并完成上方的图形验证码！');
        return;
      }

      try {
        localStorage.setItem('ikuuu_saved_email', email);
      } catch(e) {}

      statusBox.style.display = 'block';
      statusBox.className = 'status-msg status-loading';
      statusBox.innerHTML = '⏳ <b>正在向 iKuuu 验证登录...</b><br>验证通过后将自动抓取 Cookie 并同步至云端';

      const btn = document.getElementById('btn-login');
      btn.disabled = true;

      try {
        const resp = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            passwd: password,
            captcha_result: captchaResult
          })
        });

        const data = await resp.json();
        if (resp.ok && data.success) {
          statusBox.className = 'status-msg status-success';
          statusBox.innerHTML = '🎉 <b>登录与同步成功！</b><br>' +
            '👤 账号：' + data.email + '<br>' +
            '⏳ 凭据有效期：<span class="badge-highlight">' + data.expire_desc + '</span><br>' +
            '🚀 GitHub Actions：已自动写入最新 Cookie！<br>' +
            '📲 <b>已自动触发云端签到，企业微信将立即收到最新战报！</b>';
          if (geetestInstance) geetestInstance.reset();
          captchaResult = null;
        } else {
          statusBox.className = 'status-msg status-error';
          statusBox.innerHTML = '❌ <b>登录失败：</b> ' + (data.error || data.msg || '未知错误');
          if (geetestInstance) geetestInstance.reset();
          captchaResult = null;
        }
      } catch(err) {
        statusBox.className = 'status-msg status-error';
        statusBox.innerHTML = '❌ <b>网络请求异常：</b> ' + err.message;
        if (geetestInstance) geetestInstance.reset();
        captchaResult = null;
      } finally {
        btn.disabled = false;
      }
    }

    // 剪贴板读取同步
    async function readClipboardAndSync() {
      const statusBox = document.getElementById('status-box');
      try {
        const text = await navigator.clipboard.readText();
        if (!text || (!text.includes('uid=') && !text.includes('key='))) {
          alert('剪贴板中未检测到有效的 iKuuu Cookie（需包含 uid 或 key）！\\n请确认已复制 Cookie。');
          return;
        }

        statusBox.style.display = 'block';
        statusBox.className = 'status-msg status-loading';
        statusBox.innerHTML = '⏳ 正在将剪贴板 Cookie 同步至 GitHub Actions...';

        const resp = await fetch('/api/sync-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookie: text.trim() })
        });

        const data = await resp.json();
        if (resp.ok && data.success) {
          statusBox.className = 'status-msg status-success';
          statusBox.innerHTML = '🎉 <b>Cookie 同步成功！</b><br>' +
            '⏳ 凭据有效期：<span class="badge-highlight">' + data.expire_desc + '</span><br>' +
            '🚀 GitHub Actions：已更新 Secret 并触发云端签到！';
        } else {
          statusBox.className = 'status-msg status-error';
          statusBox.innerHTML = '❌ 同步失败：' + (data.error || '未知错误');
        }
      } catch(e) {
        alert('无法直接读取剪贴板，请检查系统权限或直接使用上方的账号密码直接登录！');
      }
    }
  </script>
</body>
</html>`;
}

// 辅助计算 Cookie 有效期剩余描述
function parseCookieExpireDesc(cookieStr) {
  const m = cookieStr.match(/expire_in=(\d+)/);
  if (!m) return "有效期未知";
  const expTs = parseInt(m[1], 10);
  const nowTs = Math.floor(Date.now() / 1000);
  const diffSec = expTs - nowTs;
  if (diffSec <= 0) return "⚠️ 已过期";
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const d = new Date(expTs * 1000);
  const dateStr = (d.getMonth() + 1) + "-" + d.getDate() + " " + String(d.getHours()).padStart(2, '0') + ":" + String(d.getMinutes()).padStart(2, '0');
  return `剩余 ${days} 天 ${hours} 小时 (至 ${dateStr})`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. GET 路由：返回移动端 Web App 交互页面
    if (request.method === "GET") {
      const targetRepo = env.GITHUB_REPO || "995william/ikuuu_checkIn";
      return new Response(renderWebAppHtml(targetRepo), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 2. POST /api/login：代理 iKuuu 真实登录并自动抓取 Cookie 同步到 GitHub
    if (request.method === "POST" && url.pathname === "/api/login") {
      try {
        const body = await request.json();
        const email = (body.email || "").trim();
        const passwd = body.passwd || "";
        const captchaResult = body.captcha_result || {};

        if (!email || !passwd) {
          return new Response(JSON.stringify({ error: "邮箱和密码不能为空" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        // 构造向 iKuuu 发起的真实登录表单
        const targetHost = env.IKUUU_HOST || "ikuuu.top";
        const loginUrl = `https://${targetHost}/auth/login`;

        const formParams = new URLSearchParams();
        formParams.set("email", email);
        formParams.set("passwd", passwd);
        formParams.set("remember_me", "week");
        formParams.set("phase", "password");
        formParams.set("host", targetHost);
        formParams.set("pageLoadedAt", String(Date.now()));
        formParams.set("captcha_result[lot_number]", captchaResult.lot_number || "");
        formParams.set("captcha_result[captcha_output]", captchaResult.captcha_output || "");
        formParams.set("captcha_result[pass_token]", captchaResult.pass_token || "");
        formParams.set("captcha_result[gen_time]", captchaResult.gen_time || "");

        const ikuuuResp = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Host": targetHost,
            "Origin": `https://${targetHost}`,
            "Referer": `https://${targetHost}/auth/login`,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: formParams.toString()
        });

        // 提取响应中的所有 Cookie
        let setCookieHeaders = [];
        if (typeof ikuuuResp.headers.getSetCookie === "function") {
          setCookieHeaders = ikuuuResp.headers.getSetCookie();
        } else {
          const raw = ikuuuResp.headers.get("set-cookie") || "";
          setCookieHeaders = raw.split(/,(?=[^;]+=[^;]+)/g);
        }

        const cookieMap = {};
        for (const h of setCookieHeaders) {
          const part = h.split(";")[0].trim();
          if (part && part.includes("=")) {
            const [k, v] = part.split("=", 2);
            cookieMap[k.trim()] = v.trim();
          }
        }

        let loginResult = {};
        try {
          loginResult = await ikuuuResp.json();
        } catch(e) {
          loginResult = { ret: 0, msg: "解析响应 JSON 失败: " + ikuuuResp.status };
        }

        const isSuccess = loginResult.ret === 1 || loginResult.phase === "authenticated" || cookieMap["uid"] || cookieMap["key"];

        if (!isSuccess) {
          return new Response(JSON.stringify({
            success: false,
            error: loginResult.msg || "登录验证失败，请检查账号密码或验证码"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        // 拼接完整的规范 Cookie 字符串
        const cookieParts = [];
        for (const [k, v] of Object.entries(cookieMap)) {
          cookieParts.push(`${k}=${v}`);
        }
        const fullCookie = cookieParts.join("; ");
        const expireDesc = parseCookieExpireDesc(fullCookie);

        // 异步分发至 GitHub Actions 触发更新与每日签到
        const ghRepo = env.GITHUB_REPO || "995william/ikuuu_checkIn";
        const ghToken = env.GITHUB_TOKEN;

        if (ghToken) {
          ctx.waitUntil((async () => {
            try {
              const dispatchUrl = `https://api.github.com/repos/${ghRepo}/dispatches`;
              await fetch(dispatchUrl, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${ghToken}`,
                  "Accept": "application/vnd.github.v3+json",
                  "User-Agent": "iKuuu-Worker-Sync"
                },
                body: JSON.stringify({
                  event_type: "update_cookie",
                  client_payload: { cookie: fullCookie, email: email }
                })
              });
            } catch(e) {
              console.error("Dispatch to GitHub Actions failed:", e);
            }
          })());
        }

        return new Response(JSON.stringify({
          success: true,
          email: email,
          expire_desc: expireDesc,
          message: "登录成功并已同步至 GitHub Actions！"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch(err) {
        return new Response(JSON.stringify({ error: "服务器内部异常: " + err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 3. POST /api/sync-cookie：接收外部或剪贴板直接传入的 Cookie
    if (request.method === "POST" && url.pathname === "/api/sync-cookie") {
      try {
        const body = await request.json();
        const cookie = (body.cookie || "").trim();

        if (!cookie || (!cookie.includes("uid=") && !cookie.includes("key="))) {
          return new Response(JSON.stringify({ error: "Cookie 格式不正确，缺少 uid 或 key 字段" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const expireDesc = parseCookieExpireDesc(cookie);
        const ghRepo = env.GITHUB_REPO || "995william/ikuuu_checkIn";
        const ghToken = env.GITHUB_TOKEN;

        if (ghToken) {
          ctx.waitUntil((async () => {
            try {
              const dispatchUrl = `https://api.github.com/repos/${ghRepo}/dispatches`;
              await fetch(dispatchUrl, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${ghToken}`,
                  "Accept": "application/vnd.github.v3+json",
                  "User-Agent": "iKuuu-Worker-Sync"
                },
                body: JSON.stringify({
                  event_type: "update_cookie",
                  client_payload: { cookie: cookie }
                })
              });
            } catch(e) {
              console.error("Dispatch to GitHub Actions failed:", e);
            }
          })());
        }

        return new Response(JSON.stringify({
          success: true,
          expire_desc: expireDesc,
          message: "Cookie 已成功同步至 GitHub Actions！"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch(err) {
        return new Response(JSON.stringify({ error: "同步异常: " + err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }
};
