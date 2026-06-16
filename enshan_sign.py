# -*- coding: utf-8 -*-
"""
# cron: 00 09 * * *
# const $ = new Env("恩山论坛签到");
作者: FunSeason (v3.3) | 青龙适配: Hermes
Python3 依赖: requests DrissionPage
Linux   依赖: ChromiumPage ChromiumOptions

携趣代理: RS_PROXY_API (青龙面板环境变量自动注入)  https://www.xiequ.cn/index.html?fb97ebf3
Cookie 登录 www.right.com.cn -> F12 -> Application -> Cookies -> 复制全部 Cookie,Uid 通过个人空间 URL 中获取,保存在 enshan_config,json 配置中
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
# ============================================

# 青龙内置通知函数
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
    except:
        pass

USER_AGENT = "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"

def random_wait():
    """随机延迟 (0-10秒)"""
    delay = random.randint(0, 10)
    print(f"🎲 随机延迟: {delay} 秒")
    time.sleep(delay)

def force_kill_chrome():
    """清理残留浏览器进程"""
    try:
        os.system("pkill -f chromium")
        os.system("pkill -f chrome")
        time.sleep(2) 
    except:
        pass

def get_proxy():
    """获取代理"""
    if not RS_PROXY_API:
        print("⚠️ 未配置 RS_PROXY_API")
        return ""
    try:
        r = requests.get(RS_PROXY_API, timeout=10)
        proxy = r.text.strip().split('\n')[0].strip('\r\n ')
        print(f"🌐 代理: {proxy}")
        return proxy
    except Exception as e:
        print(f"❌ 代理获取失败: {e}")
        return ""

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
        print(f"⚠️ 配置文件不存在，自动创建默认配置...")
        return init_config()
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_regex(pattern, text, default="0"):
    try:
        match = re.search(pattern, text)
        return match.group(1).strip() if match else default
    except:
        return default

def save_cookie_to_config(new_cookie_str):
    try:
        data = load_config()
        if not data: return
        if "rHEX_2132_auth" not in new_cookie_str: return
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

    proxy = get_proxy()

    # 初始化浏览器
    co = ChromiumOptions()
    rand_port = random.randint(9300, 19000)
    co.set_local_port(rand_port)
    rand_dir = f"/tmp/drissionpage_enshan_{rand_port}"
    co.set_user_data_path(rand_dir)
    co.set_argument('--headless=new')
    co.set_argument('--no-sandbox')
    co.set_argument('--disable-gpu')
    co.set_argument('--disable-dev-shm-usage')
    co.set_argument('--disable-software-rasterizer')
    co.set_argument('--disable-features=VizDisplayCompositor')
    co.set_argument('--disable-extensions')
    co.set_argument('--disable-popup-blocking')
    co.set_argument('--window-size=375,812')
    co.set_user_agent(user_agent=USER_AGENT)
    
    browser_path = ""
    if os.path.exists("/usr/bin/chromium-browser"):
        browser_path = "/usr/bin/chromium-browser"
    elif os.path.exists("/usr/bin/chromium"):
        browser_path = "/usr/bin/chromium"
    
    if browser_path:
        co.set_paths(browser_path=browser_path)
    else:
        notify("恩山签到", "❌ 未找到 chromium")
        return
    
    if proxy:
        co.set_proxy(f"http://{proxy}")
        
    page = None
    for attempt in range(3):
        try:
            force_kill_chrome()
            page = ChromiumPage(co)
            if page: break
        except Exception as e:
            print(f"⚠️ 浏览器启动失败 ({attempt+1}/3): {e}")
            time.sleep(5)
    
    if not page:
        notify("恩山签到", "❌ 浏览器启动失败")
        shutil.rmtree(rand_dir, ignore_errors=True)
        return

    try:
        print("=== 开始恩山签到 ===")
        
        # 访问主页
        page.get('https://www.right.com.cn/forum/forum.php?mobile=2', timeout=30, retry=2)
        try: page.set.cookies(raw_cookie)
        except: pass
        page.refresh()
        time.sleep(5)
            
        title = page.title
        if "安全" in title or "验证" in title:
            print("🛡️ 检测到防火墙，等待...")
            time.sleep(15)

        # 获取签到页
        check_url = "https://www.right.com.cn/forum/erling_qd-sign_in_m.html"
        page.get(check_url, timeout=30, retry=2)
        time.sleep(3) 
        
        is_signed = False
        html = page.html
        
        # 提取 formhash
        formhash = extract_regex(r"var FORMHASH = '([0-9a-zA-Z]+)'", html, "")
        if not formhash:
            formhash = extract_regex(r'name="formhash" value="([0-9a-zA-Z]+)"', html, "")
        if not formhash:
            formhash = extract_regex(r'formhash=([0-9a-zA-Z]+)', html, "")
            
        # 登录检测
        if not formhash:
            try:
                if "登录" in page.ele('tag:body').text:
                    notify("恩山签到", "❌ Cookie 已失效")
                    return
            except: pass
        
        # 签到状态检测
        try:
            body_text = page.ele('tag:body').text
            if "连续签到" in body_text and "立即签到" not in body_text:
                is_signed = True
                print("ℹ️ 今日已签到")
        except: pass
                
        if not formhash and not is_signed:
            notify("恩山签到", "❌ 无法获取 Formhash")
            return
        
        if formhash:
            print(f"🔑 Formhash: {formhash}")

        # 执行签到
        sign_success = False
        sign_msg = "已签到"
        
        if not is_signed:
            sign_api = "https://www.right.com.cn/forum/plugin.php?id=erling_qd:action&action=sign"
            print("🚀 签到请求中...")
            js_code = f"""
            return fetch("{sign_api}", {{
                method: "POST",
                headers: {{
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                }},
                body: "formhash={formhash}"
            }}).then(response => response.json());
            """
            try:
                result = page.run_js(js_code)
                print(f"📥 返回: {result}")
                if result and (result.get('success') or "已经签到" in str(result)):
                    sign_success = True
                    sign_msg = result.get('message', '签到成功')
                else:
                    sign_msg = result.get('message', '未知错误') if result else "接口无响应"
            except Exception as js_err:
                print(f"❌ JS异常: {js_err}")
                sign_success = False
                sign_msg = "JS执行失败"
        else:
            sign_success = True

        # 获取签到统计
        page.get(check_url)
        time.sleep(2)
        sign_html = page.html
        
        today_points = extract_regex(r'erqd-current-point[^>]*>(\d+)', sign_html, "未知")
        if today_points == "未知": today_points = extract_regex(r'今日积分.*?(\d+)', sign_html, "未知")
        continuous_days = extract_regex(r'erqd-continuous-days[^>]*>(\d+)', sign_html, "未知")
        if continuous_days == "未知": continuous_days = extract_regex(r'连续签到.*?(\d+)', sign_html, "未知")
        total_days = extract_regex(r'erqd-total-days[^>]*>(\d+)', sign_html, "未知")
        if total_days == "未知": total_days = extract_regex(r'总签到天数.*?(\d+)', sign_html, "未知")

        # 保存Cookie
        final_cookies = get_cookies_safe(page)
        save_cookie_to_config(final_cookies)

        # 简化通知
        if sign_success:
            if is_signed:
                status_text = "今日已签到"
            else:
                status_text = "签到成功"
            
            notify_body = f"""✅ {status_text}

📊 今日积分: {today_points}
📅 连续签到: {continuous_days} 天
📆 总签到天数: {total_days} 天"""
            
            notify("恩山签到", notify_body)
        else:
            notify("恩山签到", f"❌ 签到失败: {sign_msg}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        notify("恩山签到", f"❌ 运行出错: {str(e)}")
        
    finally:
        try:
            if page: page.quit()
        except:
            pass
        force_kill_chrome()
        try:
            shutil.rmtree(rand_dir, ignore_errors=True)
        except:
            pass

if __name__ == "__main__":
    run_sign_in()

