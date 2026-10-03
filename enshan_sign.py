# -*- coding: utf-8 -*-
"""
# cron: 20 13,23 * * *
# const $ = new Env("恩山论坛签到");
作者: FunSeason (v3.3) | 青龙适配: Hermes (v4.0 稳定性修复)

v4.0 变更（针对「有时成功有时失败」「连续签到天数不正确」）:
  1. 直连优先进攻三次，全部失败才换「新 IP」走代理，再试两次（每次重取 IP，不复用死 IP）。
  2. 每次尝试先用 requests 校验代理连通性，避免把死 IP 喂给浏览器。
  3. 首页/签到页 timeout 提升到 45s、retry=3；检测到防火墙/验证页自动等待重试。
  4. POST 后用带缓存参数重新加载并「轮询等待」签到后的页面，再读统计 —— 修复读到签到前
     旧页面导致「连续签到: 0 天 / 今日积分: 未知」的问题。
  5. 统计优先取 sign 接口返回的 continuous_days/credit，其次用 HTML 的 erqd-* 类名
     （与页面语言无关），最后退回中英双语文本正则。
  6. 清理浏览器只杀本脚本自己的 user-data-dir 进程，不再 pkill 全容器 chromium。

Python3 依赖: requests DrissionPage
Linux   依赖: ChromiumPage ChromiumOptions

携趣代理: RS_PROXY_API (青龙面板环境变量自动注入)  https://www.xiequ.cn/index.html?fb97ebf3
Cookie 登录 www.right.com.cn -> F12 -> Application -> Cookies -> 复制全部 Cookie,Uid 通过个人空间 URL 中获取,保存在 enshan_config.json 配置中

可选环境变量:
  ENSHAN_DELAY_MAX   随机延迟上限秒数（默认 900，调试时可设 0）
  ENSHAN_ATTEMPTS    直连尝试次数（默认 3）
  ENSHAN_PROXY_TRIES 代理兜底次数（默认 2，0 = 完全不走代理）
"""

import json
import time
import os
import re
import random
import requests
import shutil

from DrissionPage import ChromiumPage, ChromiumOptions

RS_PROXY_API = os.environ.get('RS_PROXY_API', '')

# ================= 配置区域 =================
CONFIG_FILE = "/ql/data/scripts/enshan_config.json"

HOME_URL = 'https://www.right.com.cn/forum/forum.php?mobile=2'
SIGN_PAGE = "https://www.right.com.cn/forum/erling_qd-sign_in_m.html"
SIGN_API = "https://www.right.com.cn/forum/plugin.php?id=erling_qd:action&action=sign"

DELAY_MAX = int(os.environ.get('ENSHAN_DELAY_MAX', '900') or 0)
DIRECT_ATTEMPTS = int(os.environ.get('ENSHAN_ATTEMPTS', '3') or 1)
PROXY_TRIES = int(os.environ.get('ENSHAN_PROXY_TRIES', '2') or 0)

PAGE_TIMEOUT = 45
PAGE_RETRY = 3
# ============================================

USER_AGENT = "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"


# ---------------- 通知 ----------------
def notify(title, content):
    """使用青龙2.x内置通知模块发送通知"""
    print(f"\n{'='*60}")
    print(f"【{title}】")
    print(f"{'='*60}")
    print(content)
    print(f"{'='*60}\n")

    try:
        import sys
        ql_base = os.environ.get('QL_DIR', '/ql')
        for p in [f'{ql_base}/data/scripts', f'{ql_base}/scripts', f'{ql_base}/src']:
            if p not in sys.path:
                sys.path.insert(0, p)
        from notify import send
        send(title, content)
        print("✅ 通知发送成功")
    except Exception:
        pass


# ---------------- 基础工具 ----------------
def random_wait():
    """随机延迟 (0 ~ DELAY_MAX 秒)"""
    if DELAY_MAX <= 0:
        print("🎲 随机延迟: 已跳过")
        return
    delay = random.randint(0, DELAY_MAX)
    print(f"🎲 随机延迟: {delay} 秒")
    time.sleep(delay)


def kill_chrome(profile_dir=""):
    """只清理本脚本自己的浏览器进程（避免误杀容器内其它任务）"""
    try:
        if profile_dir:
            os.system(f"pkill -f '{profile_dir}' 2>/dev/null")
        time.sleep(1)
    except Exception:
        pass


def find_browser_path():
    for p in ("/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/google-chrome"):
        if os.path.exists(p):
            return p
    return ""


def get_proxy(probe=True):
    """从携趣 API 取一个新 IP，并校验它能否连上恩山（避免把死 IP 喂给浏览器）"""
    if not RS_PROXY_API:
        print("⚠️ 未配置 RS_PROXY_API")
        return ""
    try:
        r = requests.get(RS_PROXY_API, timeout=10)
        ips = [x.strip() for x in r.text.strip().split('\n') if x.strip()]
    except Exception as e:
        print(f"❌ 代理获取失败: {e}")
        return ""

    if not ips:
        print("❌ 代理 API 返回为空")
        return ""

    if not probe:
        print(f"🌐 代理: {ips[0]}")
        return ips[0]

    # 短效 IP 池随时会死，逐个探测（最多取前 5 个），只用能连通的
    for ip in ips[:5]:
        try:
            t0 = time.time()
            rr = requests.get(SIGN_PAGE, timeout=12,
                              headers={"User-Agent": USER_AGENT},
                              proxies={"http": f"http://{ip}", "https": f"http://{ip}"})
            if rr.status_code == 200 and len(rr.text) > 2000:
                print(f"🌐 代理可用: {ip}（探测 {round(time.time()-t0,1)}s）")
                return ip
            print(f"⚠️ 代理无有效内容: {ip} HTTP {rr.status_code} len={len(rr.text)}")
        except Exception as e:
            print(f"⚠️ 代理不通: {ip} {type(e).__name__}")
    print("❌ 前 5 个代理全部不可用")
    return ""


# ---------------- 配置 ----------------
if not os.path.exists("/ql"):
    CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "enshan_config.json")


def init_config():
    default = {"cookie": "您的初始 Cookie 字符串", "USER_UID": "您的恩山论坛 UID"}
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(default, f, indent=2, ensure_ascii=False)
    print(f"已创建配置文件: {CONFIG_FILE}")
    return default


def load_config():
    if not os.path.exists(CONFIG_FILE):
        print("⚠️ 配置文件不存在，自动创建默认配置...")
        return init_config()
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_cookie_to_config(new_cookie_str):
    try:
        data = load_config()
        if not data:
            return
        if "rHEX_2132_auth" not in new_cookie_str:
            return
        print("💾 更新 Cookie...")
        data['cookie'] = new_cookie_str
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print("✅ Cookie 更新成功")
    except Exception as e:
        print(f"❌ 保存 Cookie 失败: {e}")


def get_cookies_safe(page):
    try:
        ret = page.run_cdp('Network.getCookies')
        cookies_list = ret.get('cookies', [])
        return "; ".join([f"{item['name']}={item['value']}" for item in cookies_list])
    except Exception as e:
        print(f"❌ 获取 Cookie 异常: {e}")
        return ""


# ---------------- 页面解析 ----------------
def extract(regex, text, default=""):
    try:
        m = re.search(regex, text)
        return m.group(1).strip() if m else default
    except Exception:
        return default


def parse_stats(html, live_text, api_result):
    """解析今日积分 / 连续签到 / 总签到天数。

    优先级: sign 接口返回值 > HTML 的 erqd-* class（语言无关） > 中英双语文本
    """
    # 今日积分
    points = extract(r'erqd-current-point[^>]*>\s*(\d+)', html)
    if not points:
        points = extract(r"今日积分[：:]\s*(\d+)", live_text)
    if not points:
        points = extract(r"Today'?s points[：:]\s*(\d+)", live_text, "未知")

    # 连续签到
    cont = ""
    if isinstance(api_result, dict):
        v = api_result.get('continuous_days')
        if v not in (None, '', '0') or (v == '0' and api_result.get('success')):
            cont = str(v)
    if not cont:
        cont = extract(r'erqd-continuous-days[^>]*>\s*(\d+)', html)
    if not cont:
        cont = extract(r"连续签到[：:]\s*(\d+)", live_text)
    if not cont:
        cont = extract(r"Consecutive sign-?ins?[：:]\s*(\d+)", live_text, "未知")

    # 总签到天数
    total = extract(r'erqd-total-days[^>]*>\s*(\d+)', html)
    if not total:
        total = extract(r"总签到天数[：:]\s*(\d+)", live_text)
    if not total:
        total = extract(r"Total check-?in days[：:]\s*(\d+)", live_text, "未知")

    return points or "未知", cont or "未知", total or "未知"


def is_logged_out(html, live_text):
    if "立即登录" in html or "立即登录" in live_text:
        return True
    if re.search(r'erqd-quick-login|请先登录|Please log in', html + live_text):
        return True
    # 有 formhash / 有积分元素 说明已登录
    if re.search(r"FORMHASH|erqd-current-point", html):
        return False
    return False


def already_signed(html, live_text):
    """判断今日是否已签到（页面语言可能是中文或英文）"""
    if "立即签到" in html or "Sign in now" in html or "Check in now" in html:
        return False
    if "已签到" in live_text or "Checked in" in live_text or "已签到" in html:
        return True
    # 有今日积分区块 = 已签到
    return bool(re.search(r'erqd-current-point', html))


# ---------------- 核心：一次签到尝试 ----------------
def attempt_sign(proxy, cookie):
    """返回 dict: status = ok / already / fail / cookie_invalid"""
    co = ChromiumOptions()
    port = random.randint(9300, 19000)
    profile_dir = f"/tmp/drissionpage_enshan_{port}"
    co.set_local_port(port)
    co.set_user_data_path(profile_dir)
    for arg in ('--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
                '--disable-software-rasterizer', '--disable-features=VizDisplayCompositor',
                '--disable-extensions', '--disable-popup-blocking', '--window-size=375,812'):
        co.set_argument(arg)
    co.set_user_agent(user_agent=USER_AGENT)
    # 固定中文语言，避免页面出现英文文案导致解析不一致
    co.set_argument('--lang=zh-CN')
    co.set_pref('intl.accept_languages', 'zh-CN,zh;q=0.9')

    browser_path = find_browser_path()
    if browser_path:
        co.set_paths(browser_path=browser_path)
    if proxy:
        co.set_proxy(f"http://{proxy}")

    page = None
    result = {"status": "fail", "msg": "未知", "points": "未知",
              "continuous": "未知", "total": "未知", "cookies": ""}
    try:
        kill_chrome(profile_dir)
        page = ChromiumPage(co)

        # 1) 主页建立作用域并过盾
        page.get(HOME_URL, timeout=PAGE_TIMEOUT, retry=PAGE_RETRY)
        try:
            page.set.cookies(cookie)
        except Exception:
            pass
        page.refresh()
        time.sleep(3)

        title = page.title or ""
        if any(k in title for k in ("安全", "验证", "Just a moment", "Attention Required")):
            print(f"🛡️ 检测到防火墙/验证页({title[:20]})，等待...")
            time.sleep(12)
            page.refresh()
            time.sleep(3)
            title = page.title or ""

        # 2) 签到页
        page.get(SIGN_PAGE, timeout=PAGE_TIMEOUT, retry=PAGE_RETRY)
        time.sleep(3)

        html = page.html
        formhash = extract(r"var FORMHASH = '([0-9a-zA-Z]+)'", html)
        if not formhash:
            formhash = extract(r'name="formhash" value="([0-9a-zA-Z]+)"', html)
        if not formhash:
            formhash = extract(r'formhash=([0-9a-zA-Z]+)', html)

        live = page.run_js("return document.body.innerText") or ""

        if is_logged_out(html, live):
            result.update(status="cookie_invalid", msg="Cookie 已失效")
            return result

        signed_flag = already_signed(html, live)
        pre_signed = signed_flag

        if not formhash and not signed_flag:
            result.update(status="fail", msg="无法获取 Formhash")
            return result

        # 3) 执行签到
        api_result = None
        if not signed_flag:
            print(f"🔑 Formhash: {formhash}")
            print("🚀 签到请求中...")
            js_code = """
            return fetch("%s", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: "formhash=%s"
            }).then(response => response.json());
            """ % (SIGN_API, formhash)
            try:
                api_result = page.run_js(js_code)
                print(f"📥 返回: {api_result}")
            except Exception as js_err:
                print(f"❌ JS异常: {str(js_err)[:200]}")

            msg = ""
            if isinstance(api_result, dict):
                msg = str(api_result.get('message', ''))
                if api_result.get('success') or any(k in msg for k in ("已经签到", "已签到", "签到成功", "Checked in")):
                    signed_flag = True
                else:
                    result.update(status="fail", msg=msg or "接口返回失败")
                    return result
            else:
                result.update(status="fail", msg="JS执行失败/接口无响应")
                return result
        else:
            print("ℹ️ 今日已签到")

        # 4) 重新加载签到页并等待「签到后」的页面，再读统计
        #    （修复：旧脚本直接读 page.html，可能拿到签到前旧页面 → 连续签到显示 0）
        stats_html, stats_live = "", ""
        for i in range(6):
            page.get(f"{SIGN_PAGE}?_t={int(time.time())}", timeout=PAGE_TIMEOUT, retry=2)
            time.sleep(2)
            stats_html = page.html or ""
            stats_live = page.run_js("return document.body.innerText") or ""
            if re.search(r'erqd-current-point', stats_html) or "已签到" in stats_html or "Checked in" in stats_live:
                print(f"📄 统计页已刷新（第 {i+1} 次）")
                break
        else:
            print("⚠️ 统计页未检测到签到后状态，使用当前内容解析")

        points, cont, total = parse_stats(stats_html, stats_live, api_result)
        result.update(status="ok", msg=("今日已签到" if pre_signed else "签到成功"),
                      points=points, continuous=cont, total=total, cookies=get_cookies_safe(page))
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        result.update(status="fail", msg=f"{type(e).__name__}: {str(e)[:120]}")
        return result
    finally:
        try:
            if page:
                page.quit()
        except Exception:
            pass
        kill_chrome(profile_dir)
        shutil.rmtree(profile_dir, ignore_errors=True)


# ---------------- 主流程 ----------------
def run_sign_in():
    random_wait()

    config = load_config()
    if not config:
        notify("恩山签到", "❌ 无法加载 config.json")
        return

    raw_cookie = config.get('cookie', '')
    if not raw_cookie:
        notify("恩山签到", "❌ config.json 中缺少 cookie")
        return

    if not find_browser_path():
        notify("恩山签到", "❌ 未找到 chromium")
        return

    print("=== 开始恩山签到 (v4.0) ===")

    strategies = [("直连", "")] * max(1, DIRECT_ATTEMPTS)
    result = None
    tried = 0

    def describe(channel):
        return channel

    # 阶段 1：直连
    for i in range(max(1, DIRECT_ATTEMPTS)):
        tried += 1
        print(f"--- 尝试 {tried}: 直连 ---")
        result = attempt_sign("", raw_cookie)
        print(f"    结果: {result['status']} ({result['msg']})")
        if result['status'] in ("ok", "cookie_invalid"):
            break
        time.sleep(3)

    # 阶段 2：换新 IP 走代理兜底
    if result and result['status'] == 'fail' and PROXY_TRIES > 0:
        for i in range(PROXY_TRIES):
            tried += 1
            print(f"--- 尝试 {tried}: 代理兜底 ---")
            proxy = get_proxy()
            if not proxy:
                print("    ⚠️ 无可用代理，跳过")
                continue
            result = attempt_sign(proxy, raw_cookie)
            print(f"    结果: {result['status']} ({result['msg']}) via {proxy}")
            if result['status'] in ("ok", "cookie_invalid"):
                break
            time.sleep(3)

    if not result:
        notify("恩山签到", "❌ 未执行任何尝试")
        return

    if result['status'] == 'cookie_invalid':
        notify("恩山签到", "❌ Cookie 已失效，请更新 enshan_config.json")
        return

    if result['status'] == 'ok':
        if result.get('cookies'):
            save_cookie_to_config(result['cookies'])
        notify("恩山签到", f"""✅ {result['msg']}（尝试 {tried} 次）

📊 今日积分: {result['points']}
📅 连续签到: {result['continuous']} 天
📆 总签到天数: {result['total']} 天""")
        return

    notify("恩山签到", f"❌ 签到失败（尝试 {tried} 次）\n原因: {result['msg']}")


if __name__ == "__main__":
    run_sign_in()
