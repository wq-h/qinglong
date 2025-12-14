#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# cron: 05 10 * * *
# const $ = new Env("联通权益超市");
"""
专业优化版 — 联通权益超市自动任务脚本
Version: 3.0-Pro
"""

import os
import sys
import time
import json
import logging
import requests
from urllib.parse import urlparse, parse_qs
from datetime import datetime
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


# ======================
# 日志格式（带毫秒）
# ======================
class MsFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        dt = datetime.fromtimestamp(record.created)
        s = dt.strftime("%Y-%m-%d %H:%M:%S.%f")
        return s[:-3]


logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')
for h in logging.getLogger().handlers:
    h.setFormatter(MsFormatter('[%(asctime)s] %(message)s'))


# ======================
# 共享 Session
# ======================
sess = requests.Session()
adapter = HTTPAdapter(max_retries=Retry(total=3, backoff_factor=0.3))
sess.mount("http://", adapter)
sess.mount("https://", adapter)


# ======================
# 统一 UA
# ======================
def ua():
    return {
        "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; Redmi K30 Pro Build/QKQ1.191117.002; wv) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.58 "
            "Mobile Safari/537.36 unicom{version:android@11.0500}",
        "Accept": "*/*",
    }


# ======================
# 主类
# ======================
class CUAPI:
    def __init__(self, accounts):
        self.accounts = accounts
        self.GrantPrize = True


    # ======================
    # ✨ 重构 do_send（专业版 3.0）
    # 支持：
    # - raw 模式
    # - 自动 JSON 解析
    # - 自动错误处理
    # ======================
    def do_send(self, url, method="GET", headers=None,
                params=None, data=None, timeout=10,
                raw=False, allow_redirects=True):

        try:
            resp = sess.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                json=None if (data and "token_online" in str(data)) else data,
                data=data if (data and "token_online" in str(data)) else None,
                timeout=timeout,
                allow_redirects=allow_redirects
            )
        except Exception as e:
            logging.error(f"请求失败: {e}")
            return None

        # raw 直接返回响应对象
        if raw:
            return resp

        if resp.status_code == 302:
            return resp

        try:
            return resp.json()
        except:
            logging.error("响应非 JSON 格式")
            return None


    # ======================
    # 登录 — token_online
    # ======================
    def login_with_token_online(self, phone, tok, appid):
        url = "https://m.client.10010.com/mobileService/onLine.htm"

        data = {
            "reqtime": str(int(time.time() * 1000)),
            "netWay": "Wifi",
            "version": "android@11.0000",
            "token_online": tok,
            "appId": appid,
            "deviceModel": "Mi10",
            "step": "welcome",
            "androidId": "e1d2c3b4a5f6"
        }

        resp = self.do_send(url, method="POST", headers=ua(), data=data)
        if resp and resp.get("ecs_token"):
            logging.info(f"{phone} token 登录成功")
            return resp["ecs_token"]

        logging.error(f"{phone} token 登录失败")
        return None


    # ======================
    # 获取 ticket（核心修复点）
    # ======================
    def get_ticket(self, ecs_token):
        """
        使用联通官方 H5 openPlatLine 跳转链路强制获取 ticket
        此链路比 openPlatLineNew 更稳定，token_online 登录也可使用
        """

        url = (
            "https://m.client.10010.com/mobileService/openPlatform/"
            "openPlatLine.htm"
        )

        headers = {
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; MI 10) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 "
                "Chrome/108.0.5359.128 Mobile Safari/537.36 "
                "unicom{version:android@11.0500}",
            "X-Requested-With": "com.sinovatech.unicom.ui",
            "Origin": "https://img.client.10010.com",
            "Referer": "https://img.client.10010.com/",
            "Cookie": f"ecs_token={ecs_token}",
        }

        params = {
            "to_url": "https://contact.bol.wo.cn/market",
            "reqtime": str(int(time.time() * 1000)),
            "version": "android@11.0500"
        }

        # 强制获取响应，不自动解析
        resp = self.do_send(
            url, method="GET",
            headers=headers,
            params=params,
            raw=True,
            allow_redirects=False
        )

        if not resp:
            logging.error("❌ ticket 请求失败")
            return None

        # 必须要带 Location 才行
        loc = resp.headers.get("Location")
        if not loc:
            logging.error("❌ 联通拒绝跳转（无 Location）")
            return None

        qs = parse_qs(urlparse(loc).query)
        ticket = qs.get("ticket", [None])[0]

        return ticket
    # ======================
    # 获取 userToken
    # ======================
    def get_userToken(self, ticket):
        url = f"https://backward.bol.wo.cn/prod-api/auth/marketUnicomLogin?ticket={ticket}"
        resp = self.do_send(url, method="POST", headers=ua())
        return resp.get("data", {}).get("token") if resp else None
# ======================
    # 获取任务列表
    # ======================
    def get_tasks(self, ecs_token, userToken):
        url = (
            "https://backward.bol.wo.cn/prod-api/promotion/activityTask/"
            "getAllActivityTasks?activityId=12"
        )

        headers = ua()
        headers["Authorization"] = f"Bearer {userToken}"
        headers["Cookie"] = f"ecs_token={ecs_token}"

        resp = self.do_send(url, headers=headers)
        if not resp:
            return []

        return resp.get("data", {}).get("activityTaskUserDetailVOList", [])


    # ======================
    # 执行单个任务
    # ======================
    def run_task(self, task, userToken):
        name = task.get("name", "")
        param = task.get("param1")
        target = int(task.get("triggerTime", 1))
        done = int(task.get("triggeredTime", 0))

        # 跳过购买 / 秒杀任务
        if "购买" in name or "秒杀" in name:
            logging.info(f"[跳过复杂任务] {name}")
            return

        if done >= target:
            logging.info(f"任务已完成：{name}")
            return

        # 任务类型判断
        if "浏览" in name or "查看" in name:
            api = "checkView"
        elif "分享" in name:
            api = "checkShare"
        else:
            logging.info(f"无法识别任务类型：{name}")
            return

        url = f"https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/{api}?checkKey={param}"
        headers = ua()
        headers["Authorization"] = f"Bearer {userToken}"

        resp = self.do_send(url, method="POST", headers=headers)
        if resp and resp.get("code") == 200:
            logging.info(f"任务完成：{name}")
        else:
            logging.error(f"任务失败：{name}")


    # ======================
    # 检查抽奖池是否放水
    # ======================
    def check_raffle(self, userToken):
        url = (
            "https://backward.bol.wo.cn/prod-api/promotion/home/"
            "raffleActivity/prizeList?id=12"
        )

        headers = ua()
        headers["Authorization"] = f"Bearer {userToken}"

        resp = self.do_send(url, method="POST", headers=headers)
        if not resp:
            return False

        # 判断是否有“月卡”、“月会员”等奖品
        prize_list = resp.get("data", [])
        has_live = any(("月" in p.get("name", "")) for p in prize_list)

        return has_live


    # ======================
    # 抽奖次数获取 + 循环抽奖
    # ======================
    def raffle(self, userToken):
        url = (
            "https://backward.bol.wo.cn/prod-api/promotion/home/"
            "raffleActivity/getUserRaffleCount?id=12"
        )

        headers = ua()
        headers["Authorization"] = f"Bearer {userToken}"

        resp = self.do_send(url, method="POST", headers=headers)
        if not resp:
            return

        count = resp.get("data", 0)
        logging.info(f"当前剩余抽奖次数：{count}")

        for _ in range(count):
            self.raffle_once(userToken)
            time.sleep(1)  # 给接口缓冲时间


    # ======================
    # 执行一次抽奖
    # ======================
    def raffle_once(self, userToken):
        url = (
            "https://backward.bol.wo.cn/prod-api/promotion/home/"
            "raffleActivity/userRaffle?id=12&channel="
        )

        headers = ua()
        headers["Authorization"] = f"Bearer {userToken}"

        resp = self.do_send(url, method="POST", headers=headers)
        if not resp:
            logging.error("抽奖请求失败")
            return

        if resp.get("code") != 200:
            logging.error("抽奖失败")
            return

        data = resp.get("data", {})
        prize = data.get("prizesName")
        msg = data.get("message", "")

        logging.info(f"🎁 抽奖结果：{prize or msg}")
# ======================
    # 查询待领奖品
    # ======================
    def get_pending_prizes(self, userToken):
        url = "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getMyPrize"

        headers = ua()
        headers["Authorization"] = f"Bearer {userToken}"

        data = {
            "id": 12,
            "type": 0,
            "page": 1,
            "limit": 100
        }

        resp = self.do_send(url, method="POST", headers=headers, data=data)
        if not resp:
            return []

        return resp.get("data", {}).get("list", [])


    # ======================
    # 自动领奖
    # ======================
    def grant_prize(self, userToken, recordId, prizeName):
        url = (
            "https://backward.bol.wo.cn/prod-api/promotion/home/"
            "raffleActivity/grantPrize?activityId=12"
        )

        headers = ua()
        headers["Authorization"] = f"Bearer {userToken}"
        headers["Content-Type"] = "application/json"

        resp = self.do_send(url, method="POST", headers=headers, data={"recordId": recordId})
        if resp and resp.get("code") == 200:
            logging.info(f"🎉 奖品领取成功：{prizeName}")
        else:
            logging.error(f"领奖失败：{prizeName}")


    # ======================
    # 单账号完整流程
    # ======================
    def run_account(self, phone, ecs_token=None, token_online=None, appid=None):
        logging.info(f"\n===== 开始处理账号：{phone} =====")

        # 登录
        if ecs_token:
            final_token = ecs_token
        else:
            final_token = self.login_with_token_online(phone, token_online, appid)
            if not final_token:
                return

        # Ticket
        ticket = self.get_ticket(final_token)
        if not ticket:
            logging.error("❌ 获取 ticket 失败")
            return
        logging.info("✔ ticket 获取成功")

        # userToken
        userToken = self.get_userToken(ticket)
        if not userToken:
            logging.error("❌ 获取 userToken 失败")
            return
        logging.info("✔ userToken 获取成功")

        # 任务列表
        tasks = self.get_tasks(final_token, userToken)
        for t in tasks:
            self.run_task(t, userToken)

        # 抽奖池检查
        logging.info("检查抽奖池放水情况...")
        if self.check_raffle(userToken):
            logging.info("✔ 抽奖池已放水，开始抽奖")
            self.raffle(userToken)
        else:
            logging.info("❌ 今日未放水，跳过抽奖")

        # 查询待领奖品
        pending = self.get_pending_prizes(userToken)
        if pending:
            logging.info(f"发现 {len(pending)} 个待领取奖品，开始领取...")
            for item in pending:
                recordId = item.get("id")
                prizeName = item.get("prizesName")
                self.grant_prize(userToken, recordId, prizeName)
        else:
            logging.info("暂无待领取奖品")

        logging.info(f"===== 账号 {phone} 处理完成 =====\n")


    # ======================
    # 主程序入口
    # ======================
    def run(self):
        for acc in self.accounts:
            parts = acc.split("#")
            phone = parts[0]

            if len(parts) == 2:
                self.run_account(phone, ecs_token=parts[1])
            elif len(parts) >= 3:
                self.run_account(phone, token_online=parts[1], appid=parts[2])
            
            time.sleep(3)


# ======================
# 入口
# ======================
if __name__ == "__main__":
    raw = os.getenv("UNICOM_ACCOUNTS", "").strip()

    if not raw:
        print("❌ 未设置环境变量 UNICOM_ACCOUNTS")
        print("示例：")
        print("  手机号#ecs_token")
        print("  手机号#token_online#appid")
        sys.exit(1)

    accounts = [line for line in raw.splitlines() if line.strip()]
    CUAPI(accounts).run()
