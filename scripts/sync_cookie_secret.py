# -*- coding: utf-8 -*-
"""
同步 Cookie 凭据至 GitHub Actions Secret 并执行验证签到推送
"""
import os
import sys
import base64
import requests
from datetime import datetime

# 保证能正确加载项目根目录模块
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    from nacl import encoding, public
    HAS_NACL = True
except ImportError:
    HAS_NACL = False

import sign_ikuuu

def update_github_secret(repo, token, secret_name, secret_value):
    """使用公钥加密自动更新 GitHub Actions Secret"""
    if not HAS_NACL:
        print("[!] 未安装 PyNaCl，尝试通过 gh CLI 更新...")
        try:
            import subprocess
            cmd = f'echo "{secret_value}" | gh secret set {secret_name} --repo {repo}'
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if res.returncode == 0:
                print(f"🎉 成功使用 gh CLI 更新 Secret [{secret_name}]！")
                return True
        except Exception as e:
            print(f"gh CLI 更新异常: {e}")
        return False

    try:
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        # 1. 获取仓库公钥
        pk_url = f"https://api.github.com/repos/{repo}/actions/secrets/public-key"
        r = requests.get(pk_url, headers=headers, timeout=10)
        r.raise_for_status()
        pk_info = r.json()

        # 2. 加密
        public_key = public.PublicKey(pk_info["key"].encode("utf-8"), encoding.Base64Encoder())
        sealed_box = public.SealedBox(public_key)
        encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
        encrypted_b64 = base64.b64encode(encrypted).decode("utf-8")

        # 3. 写入 Secret
        set_url = f"https://api.github.com/repos/{repo}/actions/secrets/{secret_name}"
        payload = {
            "encrypted_value": encrypted_b64,
            "key_id": pk_info["key_id"]
        }
        r_put = requests.put(set_url, json=payload, headers=headers, timeout=10)
        r_put.raise_for_status()
        print(f"🎉 成功更新 Secret [{secret_name}] 至 GitHub 仓库 {repo}！")
        return True
    except Exception as e:
        print(f"⚠️ 更新 GitHub Secret [{secret_name}] 失败: {e}")
        return False

def main():
    new_cookie = os.environ.get('NEW_COOKIE') or os.environ.get('IKUUU_COOKIE') or ''
    new_cookie = new_cookie.strip()
    if not new_cookie:
        print("❌ 未获取到 NEW_COOKIE，请检查请求参数！")
        sys.exit(1)

    print("=" * 60)
    print("🚀 开始处理 iKuuu 最新 Cookie 凭据同步与签到验证")
    print("=" * 60)

    # 1. 计算过期时间
    exp_info = sign_ikuuu.get_cookie_expire_info(new_cookie)
    print(f"📋 Cookie 有效期计算结果: {exp_info.get('desc')}")

    # 2. 更新本地缓存文件（如果有）
    try:
        local_path = os.path.join(os.path.dirname(__file__), 'local_cookie.txt')
        with open(local_path, 'w', encoding='utf-8') as f:
            f.write(new_cookie)
        print(f"✅ 已写入本地缓存文件: {local_path}")
    except Exception as e:
        print(f"写入本地文件提示: {e}")

    # 3. 更新 GitHub Actions Secret
    gh_token = os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_PAT')
    gh_repo = os.environ.get('GH_REPO') or os.environ.get('GITHUB_REPOSITORY') or '995william/ikuuu_checkIn'
    if gh_token:
        print(f"🔐 正在将最新 Cookie 同步至 GitHub 仓库 [{gh_repo}] Actions Secrets...")
        update_github_secret(gh_repo, gh_token, "IKUUU_COOKIE", new_cookie)
    else:
        print("⚠️ 未提供 GITHUB_TOKEN，跳过更新 Actions Secret（仅执行本次签到）")

    # 4. 设置环境变量并直接执行一次签到与推送验证
    os.environ['IKUUU_COOKIE'] = new_cookie
    print("\n🚀 正在使用最新凭据执行签到与消息推送...")
    sign_ikuuu.handler()

if __name__ == '__main__':
    main()
