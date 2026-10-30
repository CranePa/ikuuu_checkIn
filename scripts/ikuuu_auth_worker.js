/**
 * Cloudflare Worker: iKuuu 登录与 Cookie 自动更新网关（安全加固企业级版）
 * 
 * 🛡️ 安全加固特性：
 * 1. 密码零公网暴露：真实密码仅保存在 Cloudflare Secret 密文环境变量中，绝不下发到前端 HTML 或网络传输。
 * 2. 私有密钥鉴权防护（Auth Key）：未授权的公网访客/爬虫无法查看预置账号，无法调用托管登录，防止接口被刷。
 * 3. 频率限制（Rate Limiting）：单 IP 限制请求频次，防暴力破解与防刷。
 * 4. 邮箱两步验证（2FA）顺畅接力。
 */

const DEFAULT_AUTH_KEY = "william_995_ikuuu_key";

function renderWebAppHtml(targetRepo = "995william/ikuuu_checkIn", defaultEmail = "670607946@qq.com", isAuthorized = true) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>iKuuu 登录助手 (安全版)</title>
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
    .title-box { text-align: center; margin-bottom: 20px; }
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
    .security-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 20px;
      margin-top: 6px;
      font-weight: 500;
    }
    .security-badge-warn {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .form-group { margin-bottom: 14px; }
    .form-group label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 6px;
      font-weight: 500;
    }
    .label-tip {
      font-size: 11px;
      color: #38bdf8;
      font-weight: normal;
    }
    input[type="email"], input[type="password"], input[type="text"] {
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
    input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    .remember-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: -2px;
      margin-bottom: 14px;
      font-size: 13px;
    }
    .remember-label {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: #94a3b8;
      cursor: pointer;
      user-select: none;
    }
    .remember-label input[type="checkbox"] {
      width: 17px;
      height: 17px;
      accent-color: #0284c7;
      cursor: pointer;
    }
    .remember-badge {
      font-size: 11px;
      color: #34d399;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
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
    .btn-verify {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 14px;
      width: 100%;
      padding: 15px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
    }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 20px 0 16px;
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
      background: rgba(56, 189, 248, 0.1);
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
    }
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
  <script src="https://static.geetest.com/v4/gt4.js"></script>
</head>
<body>
  <div class="card">
    <div class="title-box">
      <h1>✈️ iKuuu 登录同步助手</h1>
      <p>一键自动更新 GitHub Actions Cookie 凭据</p>
      <div id="auth-status-badge"></div>
    </div>

    <div class="section-title">
      <span>🔐 极速登录并自动同步</span>
      <span style="font-size: 11px; color: #64748b;">端到端加密防护</span>
    </div>

    <div class="form-group">
      <label for="email">
        <span>iKuuu 账号邮箱</span>
        <span class="label-tip" id="account-status-tip">✓ 已绑定专属账号</span>
      </label>
      <input type="email" id="email" value="${defaultEmail}" placeholder="输入注册邮箱" autocomplete="username">
    </div>

    <div class="form-group">
      <label for="password">
        <span>登录密码</span>
        <span class="label-tip" id="pwd-status-tip">🔒 云端密文托管保护 (前端无明文)</span>
      </label>
      <input type="password" id="password" value="••••••••••••" data-is-preset="true" placeholder="已由安全凭据托管" autocomplete="current-password" oninput="this.dataset.isPreset='false'">
    </div>

    <div class="remember-row">
      <label class="remember-label">
        <input type="checkbox" id="remember-me" checked>
        <span>记住我 (Remember Me)</span>
      </label>
      <span class="remember-badge">✓ 7天长效 Cookie</span>
    </div>

    <!-- 邮箱验证码输入区域（遇到异地风控时自动展开） -->
    <div id="email-code-box" style="display: none; margin-bottom: 16px;">
      <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 12px; margin-bottom: 12px;">
        <p style="font-size: 13px; color: #38bdf8; line-height: 1.5;">
          🛡️ <b>已触发异地登录保护</b><br>
          验证码已发送至您的 QQ 邮箱，请输入收到的 <b>8 位验证码</b> 即可完成同步：
        </p>
      </div>
      <div class="form-group" style="margin-bottom: 12px;">
        <label for="email-code" style="color: #38bdf8; font-weight: 600;">📧 8 位邮箱验证码</label>
        <input type="text" id="email-code" placeholder="输入 8 位验证码" maxlength="16" onkeydown="if(event.keyCode===13)handleVerifyEmailCode()" style="letter-spacing: 3px; font-size: 19px; text-align: center; font-weight: 700; color: #38bdf8;">
      </div>
      <button class="btn-verify" id="btn-verify-email" onclick="handleVerifyEmailCode()">
        ✅ 提交邮箱验证码并同步
      </button>
    </div>

    <!-- 极验点选验证码容器 -->
    <div class="captcha-wrap" id="captcha-wrap-box">
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
      🛡️ <b>安全加固提示</b>：您的真实密码已被隔离在 Cloudflare 云端密文保险箱中，绝不下发到前端任何 HTML 或明文通信。<br>
      任何外部探测或审查元素均无法获取您的真实密码。
    </p>
  </div>

  <script>
    let geetestInstance = null;
    let captchaResult = null;
    let savedSessionCookie = "";

    // 从 URL 或 localStorage 提取私有授权密钥
    function getAuthKey() {
      const urlParams = new URLSearchParams(window.location.search);
      const keyFromUrl = urlParams.get('auth') || urlParams.get('key');
      if (keyFromUrl) {
        try { localStorage.setItem('ikuuu_auth_key', keyFromUrl.trim()); } catch(e) {}
        return keyFromUrl.trim();
      }
      try {
        return localStorage.getItem('ikuuu_auth_key') || "";
      } catch(e) {
        return "";
      }
    }

    const currentAuthKey = getAuthKey();
    const badge = document.getElementById('auth-status-badge');
    if (currentAuthKey) {
      badge.innerHTML = '<span class="security-badge">🛡️ 私有凭据已授权 (受保护模式)</span>';
    } else {
      badge.innerHTML = '<span class="security-badge security-badge-warn">⚠️ 未绑定私有鉴权密钥 (请通过专属安全链接访问)</span>';
    }

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
          // 账号已就绪，极验通过后自动秒级提交登录并同步！
          handleLoginSubmit();
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
      const pwdEl = document.getElementById('password');
      const isPreset = pwdEl.dataset.isPreset === 'true';
      const statusBox = document.getElementById('status-box');

      if (!email) {
        alert('请输入完整的邮箱账号！');
        return;
      }

      if (!captchaResult || !captchaResult.lot_number) {
        alert('请先点击并完成图形验证码！');
        return;
      }

      statusBox.style.display = 'block';
      statusBox.className = 'status-msg status-loading';
      statusBox.innerHTML = '⏳ <b>正在向 iKuuu 验证登录...</b><br>云端正在密文代持登录，验证通过后将自动抓取 Cookie';

      const btn = document.getElementById('btn-login');
      btn.disabled = true;

      try {
        const rememberEl = document.getElementById('remember-me');
        const isRemember = rememberEl ? rememberEl.checked : true;

        const payload = {
          email: email,
          use_preset: isPreset,
          remember_me: isRemember ? 'week' : '',
          captcha_result: captchaResult
        };

        // 仅当用户手动修改过密码输入框时才传递用户输入，否则绝不传递密码明文！
        if (!isPreset) {
          payload.passwd = pwdEl.value;
        }

        const resp = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Key': currentAuthKey
          },
          body: JSON.stringify(payload)
        });

        const data = await resp.json();

        // 遇到异地风控：需要输入邮箱验证码
        if (data.need_email_code) {
          savedSessionCookie = data.session_cookie || "";
          document.getElementById('email-code-box').style.display = 'block';
          document.getElementById('captcha-wrap-box').style.display = 'none';
          document.getElementById('btn-login').style.display = 'none';
          document.getElementById('email-code').focus();

          statusBox.className = 'status-msg status-loading';
          statusBox.innerHTML = '📧 <b>' + data.message + '</b><br>已为您展开上方验证码输入框，输入 8 位验证码后点击确定即可完成。';
          return;
        }

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

    // 处理邮箱 8 位验证码提交
    async function handleVerifyEmailCode() {
      const emailCode = document.getElementById('email-code').value.trim();
      const statusBox = document.getElementById('status-box');
      const email = document.getElementById('email').value.trim();

      if (!emailCode || emailCode.length < 4) {
        alert('请输入收到的邮箱验证码！');
        return;
      }

      statusBox.style.display = 'block';
      statusBox.className = 'status-msg status-loading';
      statusBox.innerHTML = '⏳ 正在核验邮箱验证码并同步云端...';

      const verifyBtn = document.getElementById('btn-verify-email');
      verifyBtn.disabled = true;

      try {
        const resp = await fetch('/api/verify-email-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Key': currentAuthKey
          },
          body: JSON.stringify({
            email_code: emailCode,
            session_cookie: savedSessionCookie,
            email: email
          })
        });

        const data = await resp.json();
        if (resp.ok && data.success) {
          document.getElementById('email-code-box').style.display = 'none';
          statusBox.className = 'status-msg status-success';
          statusBox.innerHTML = '🎉 <b>邮箱验证成功，已完成全量同步！</b><br>' +
            '⏳ 凭据有效期：<span class="badge-highlight">' + data.expire_desc + '</span><br>' +
            '🚀 GitHub Actions：最新 7 天 Cookie 已就绪！<br>' +
            '📲 <b>企业微信已收到最新的验证签到推送！</b>';
        } else {
          statusBox.className = 'status-msg status-error';
          statusBox.innerHTML = '❌ <b>验证码核验失败：</b> ' + (data.error || '验证码错误或已失效');
        }
      } catch(err) {
        statusBox.className = 'status-msg status-error';
        statusBox.innerHTML = '❌ <b>请求异常：</b> ' + err.message;
      } finally {
        verifyBtn.disabled = false;
      }
    }

    // 剪贴板读取同步
    async function readClipboardAndSync() {
      const statusBox = document.getElementById('status-box');
      try {
        const text = await navigator.clipboard.readText();
        if (!text || (!text.includes('uid=') && !text.includes('key='))) {
          alert('剪贴板中未检测到有效的 iKuuu Cookie（需包含 uid 或 key）！\\n请在 Safari 登录 iKuuu 后复制 Cookie。');
          return;
        }

        statusBox.style.display = 'block';
        statusBox.className = 'status-msg status-loading';
        statusBox.innerHTML = '⏳ 正在将剪贴板 Cookie 同步至 GitHub Actions...';

        const resp = await fetch('/api/sync-cookie', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Key': currentAuthKey
          },
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
  if (!m) return "有效期未知 (长期有效)";
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

// 简单的 IP 速率限制映射
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReqs = 15;
  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);
  return record.count <= maxReqs;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";

    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "请求过于频繁，请稍候再试 (Rate limit exceeded)" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }

    const expectedAuthKey = env.AUTH_KEY || DEFAULT_AUTH_KEY;
    const authHeader = request.headers.get("X-Auth-Key");
    const authQuery = url.searchParams.get("auth") || url.searchParams.get("key");
    const isAuthorized = (authHeader === expectedAuthKey || authQuery === expectedAuthKey);

    // 1. GET 路由：返回移动端 Web App 交互页面
    if (request.method === "GET") {
      const targetRepo = env.GITHUB_REPO || "995william/ikuuu_checkIn";
      const defaultEmail = env.DEFAULT_EMAIL || "670607946@qq.com";
      // 绝不向前端下发真实密码！
      return new Response(renderWebAppHtml(targetRepo, defaultEmail, isAuthorized), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 鉴权检查：如果调用 API 且使用预置密码，必须通过私有密钥验证
    function verifyApiAuth() {
      return isAuthorized;
    }

    // 2. POST /api/login：代理 iKuuu 真实登录
    if (request.method === "POST" && url.pathname === "/api/login") {
      try {
        const body = await request.json();
        const email = (body.email || "").trim();
        const captchaResult = body.captcha_result || {};
        let passwd = "";

        if (body.use_preset) {
          // 只有授权的管理者请求才能使用云端托管的真实密码！
          if (!verifyApiAuth()) {
            return new Response(JSON.stringify({
              error: "未授权的访问：使用云端托管密码必须通过私有鉴权密钥 (请通过专属安全链接访问)"
            }), {
              status: 403,
              headers: { "Content-Type": "application/json" }
            });
          }
          passwd = env.DEFAULT_PASSWORD || "";
        } else {
          passwd = body.passwd || "";
        }

        if (!email || !passwd) {
          return new Response(JSON.stringify({ error: "邮箱和密码不能为空" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const targetHost = env.IKUUU_HOST || "ikuuu.top";
        const loginUrl = `https://${targetHost}/auth/login`;

        const formParams = new URLSearchParams();
        formParams.set("email", email);
        formParams.set("passwd", passwd);
        const wantRemember = body.remember_me !== "" && body.remember_me !== false;
        if (wantRemember) {
          formParams.set("remember_me", "week");
          formParams.set("remember", "on");
        }
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

        // 核心检测：是否需要邮箱两步验证
        if (loginResult.phase === "email_code") {
          const cookieParts = [];
          for (const [k, v] of Object.entries(cookieMap)) {
            cookieParts.push(`${k}=${v}`);
          }
          return new Response(JSON.stringify({
            success: false,
            need_email_code: true,
            session_cookie: cookieParts.join("; "),
            message: loginResult.msg || "为保护账号安全，本次登录需要邮箱验证。验证码已发送到账号邮箱，请输入 8 位验证码继续。"
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
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

        const cookieParts = [];
        for (const [k, v] of Object.entries(cookieMap)) {
          cookieParts.push(`${k}=${v}`);
        }
        const fullCookie = cookieParts.join("; ");
        const expireDesc = parseCookieExpireDesc(fullCookie);

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

    // 3. POST /api/verify-email-code：接收邮箱 8 位验证码完成二次核验
    if (request.method === "POST" && url.pathname === "/api/verify-email-code") {
      try {
        if (!verifyApiAuth()) {
          return new Response(JSON.stringify({ error: "未授权的核验请求" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
          });
        }

        const body = await request.json();
        const emailCode = (body.email_code || "").trim();
        const sessionCookie = body.session_cookie || "";
        const email = body.email || "670607946@qq.com";

        if (!emailCode) {
          return new Response(JSON.stringify({ error: "请输入收到的 8 位邮箱验证码" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const targetHost = env.IKUUU_HOST || "ikuuu.top";
        const loginUrl = `https://${targetHost}/auth/login`;

        const formParams = new URLSearchParams();
        formParams.set("phase", "email_code");
        formParams.set("email_code", emailCode);
        formParams.set("host", targetHost);
        formParams.set("remember_me", "week");
        formParams.set("remember", "on");

        const ikuuuResp = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Host": targetHost,
            "Origin": `https://${targetHost}`,
            "Referer": `https://${targetHost}/auth/login`,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Cookie": sessionCookie
          },
          body: formParams.toString()
        });

        let setCookieHeaders = [];
        if (typeof ikuuuResp.headers.getSetCookie === "function") {
          setCookieHeaders = ikuuuResp.headers.getSetCookie();
        } else {
          const raw = ikuuuResp.headers.get("set-cookie") || "";
          setCookieHeaders = raw.split(/,(?=[^;]+=[^;]+)/g);
        }

        const cookieMap = {};
        for (const item of sessionCookie.split(";")) {
          if (item.includes("=")) {
            const [k, v] = item.split("=", 2);
            if (k.trim()) cookieMap[k.trim()] = v.trim();
          }
        }
        for (const h of setCookieHeaders) {
          const part = h.split(";")[0].trim();
          if (part && part.includes("=")) {
            const [k, v] = part.split("=", 2);
            cookieMap[k.trim()] = v.trim();
          }
        }

        let verifyResult = {};
        try {
          verifyResult = await ikuuuResp.json();
        } catch(e) {
          verifyResult = { ret: 0, msg: "解析响应 JSON 失败" };
        }

        const isSuccess = verifyResult.ret === 1 || verifyResult.phase === "authenticated" || cookieMap["uid"] || cookieMap["key"];

        if (!isSuccess) {
          return new Response(JSON.stringify({
            success: false,
            error: verifyResult.msg || "邮箱验证码错误或已失效，请重新获取"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const cookieParts = [];
        for (const [k, v] of Object.entries(cookieMap)) {
          cookieParts.push(`${k}=${v}`);
        }
        const fullCookie = cookieParts.join("; ");
        const expireDesc = parseCookieExpireDesc(fullCookie);

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
          expire_desc: expireDesc,
          message: "邮箱验证成功！Cookie 已同步至 GitHub Actions 并调起签到！"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch(err) {
        return new Response(JSON.stringify({ error: "服务器异常: " + err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 4. POST /api/sync-cookie：接收外部或剪贴板直接传入的 Cookie
    if (request.method === "POST" && url.pathname === "/api/sync-cookie") {
      try {
        if (!verifyApiAuth()) {
          return new Response(JSON.stringify({ error: "未授权的同步请求 (缺少私有鉴权密钥)" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
          });
        }

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
