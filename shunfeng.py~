"""
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# cron: 00 08,20 * * *
# const $ = new Env("顺丰积分活动");
"""
#    🚀✨ 顺丰速运积分任务脚本 ✨🚀
#    --------------------------
#    ⚠️ 免责声明：
#    1. 本脚本仅用于学习和交流目的
#    2. 请勿用于商业用途或非法用途
#    3. 使用脚本产生的一切后果由使用者自行承担
#    4. 如遇到问题，请及时停止使用
#    --------------------------
#    🔵 📝 使用说明：
#    1️⃣ 点击"积分"，获取以下几种url之一：
#       - 🌐 https://mcs-mimp-web.sf-express.com/mcs-mimp/share/weChat/shareGiftReceiveRedirect
#       - 🌐 https://mcs-mimp-web.sf-express.com/mcs-mimp/share/app/shareRedirect
#    2️⃣ 多账号请换行
#    3️⃣ 变量名：sfsyUrl
#    --------------------------
import os
import sys
import time
import json
import random
import hashlib
import requests
from datetime import datetime, timedelta
from requests.packages.urllib3.exceptions import InsecureRequestWarning

# 禁用安全请求警告
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

IS_DEV = False
if os.path.isfile('DEV_ENV.py'):
    import DEV_ENV
    IS_DEV = True

send_msg = ''
one_msg = ''
all_accounts_msg = []  # 存储所有账号的消息

def Log(cont=''):
    global send_msg, one_msg
    print(cont)
    if cont:
        one_msg += f'{cont}\n'
        send_msg += f'{cont}\n'

class RUN:
    def __init__(self, info, index):
        global one_msg
        one_msg = ''
        split_info = info.split('@')
        url = split_info[0]
        len_split_info = len(split_info)
        last_info = split_info[len_split_info - 1]
        self.send_UID = None
        if len_split_info > 0 and "UID_" in last_info:
            self.send_UID = last_info
        self.index = index + 1
        Log(f"\n🎯 开始执行第 {self.index} 个账号")
        self.s = requests.session()
        self.s.verify = False
        self.headers = {
            'Host': 'mcs-mimp-web.sf-express.com',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63090551) XWEB/6945 Flue',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'none',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            'accept-language': 'zh-CN,zh',
            'platform': 'MINI_PROGRAM',
        }
        self.today = datetime.now().strftime('%Y-%m-%d')
        self.login_res = self.login(url)
        self.totalPoint = 0

    def get_deviceId(self, characters='abcdef0123456789'):
        result = ''
        for char in 'xxxxxxxx-xxxx-xxxx':
            if char == 'x':
                result += random.choice(characters)
            elif char == 'X':
                result += random.choice(characters).upper()
            else:
                result += char
        return result

    def login(self, sfsyUrl):
        ress = self.s.get(sfsyUrl, headers=self.headers)
        self.user_id = self.s.cookies.get_dict().get('_login_user_id_', '')
        self.phone = self.s.cookies.get_dict().get('_login_mobile_', '')
        self.mobile = self.phone[:3] + "*" * 4 + self.phone[7:]
        if self.phone != '':
            Log(f'✅ 登录成功: {self.mobile}')
            return True
        else:
            Log(f'❌ 获取用户信息失败，请检查URL是否正确')
            return False

    def getSign(self):
        timestamp = str(int(round(time.time() * 1000)))
        token = 'wwesldfs29aniversaryvdld29'
        sysCode = 'MCS-MIMP-CORE'
        data = f'token={token}&timestamp={timestamp}&sysCode={sysCode}'
        signature = hashlib.md5(data.encode()).hexdigest()
        data = {
            'sysCode': sysCode,
            'timestamp': timestamp,
            'signature': signature
        }
        self.headers.update(data)
        return data

    def do_request(self, url, data={}, req_type='post'):
        self.getSign()
        try:
            if req_type.lower() == 'get':
                response = self.s.get(url, headers=self.headers)
            elif req_type.lower() == 'post':
                response = self.s.post(url, headers=self.headers, json=data)
            else:
                raise ValueError('Invalid req_type: %s' % req_type)
            res = response.json()
            return res
        except requests.exceptions.RequestException as e:
            print('⚠️ 请求失败:', e)
            return None
        except json.JSONDecodeError as e:
            print('⚠️ JSON解析失败:', e)
            return None

    def sign(self):
        print(f'📅 执行签到任务...')
        json_data = {"comeFrom": "vioin", "channelFrom": "WEIXIN"}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskSignPlusService~automaticSignFetchPackage'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            count_day = response.get('obj', {}).get('countDay', 0)
            if response.get('obj') and response['obj'].get('integralTaskSignPackageVOList'):
                packet_name = response["obj"]["integralTaskSignPackageVOList"][0]["packetName"]
                Log(f'🎉 签到成功！获得 {packet_name}，本周累计签到 {count_day + 1} 天')
            else:
                Log(f'ℹ️ 今日已签到，本周累计签到 {count_day + 1} 天')
        else:
            print(f'❌ 签到失败: {response.get("errorMessage")}')

    def get_SignTaskList(self, END=False):
        if not END: print(f'📋 获取任务列表...')
        json_data = {
            'channelType': '1',
            'deviceId': self.get_deviceId(),
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~queryPointTaskAndSignFromES'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True and response.get('obj') != []:
            self.totalPoint = response["obj"]["totalPoint"]
            if END:
                Log(f'💰 积分总计: {self.totalPoint}')
                return
            Log(f'📊 当前积分: {self.totalPoint}')
            for task in response["obj"]["taskTitleLevels"]:
                self.taskId = task["taskId"]
                self.taskCode = task["taskCode"]
                self.strategyId = task["strategyId"]
                self.title = task["title"]
                status = task["status"]
                skip_title = ['用行业模板寄件下单', '去新增一个收件偏好', '参与积分活动']
                if status == 3:
                    print(f'✔️ {self.title} - 已完成')
                    continue
                if self.title in skip_title:
                    print(f'⏩ {self.title} - 跳过')
                    continue
                else:
                    self.doTask()
                    time.sleep(3)
                self.receiveTask()

    def doTask(self):
        print(f'🚀 执行任务: {self.title}')
        json_data = {
            'taskCode': self.taskCode,
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonRoutePost/memberEs/taskRecord/finishTask'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            print(f'✅ {self.title} - 完成')
        else:
            print(f'❌ {self.title} - 失败: {response.get("errorMessage")}')

    def receiveTask(self):
        print(f'🎁 领取任务奖励: {self.title}')
        json_data = {
            "strategyId": self.strategyId,
            "taskId": self.taskId,
            "taskCode": self.taskCode,
            "deviceId": self.get_deviceId()
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~fetchIntegral'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            print(f'🎊 {self.title} - 奖励领取成功')
        else:
            print(f'❌ {self.title} - 奖励领取失败: {response.get("errorMessage")}')

    def main(self):
        global one_msg, all_accounts_msg
        wait_time = random.randint(1000, 3000) / 1000.0
        time.sleep(wait_time)
        one_msg = ''
        if not self.login_res: return False
        
        self.sign()
        self.get_SignTaskList()
        self.get_SignTaskList(True)
        
        # 添加账号信息到汇总消息
        account_msg = f"👤 账号: {self.mobile}\n📊 积分: {self.totalPoint}"
        all_accounts_msg.append(account_msg)
        
        return True

def send_notification():
    global all_accounts_msg
    if not all_accounts_msg:
        return
    
    # 构建通知内容
    notification_content = "\n--------------------\n".join(all_accounts_msg)
    notification_title = "📦 顺丰速运任务完成"
    
    # 尝试导入上级目录的notify.py
    try:
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from notify import send
        send(notification_title, notification_content)
        print("📢 通知发送成功")
    except Exception as e:
        print(f"⚠️ 通知发送失败: {str(e)}")

if __name__ == '__main__':
    APP_NAME = '顺丰速运'
    ENV_NAME = 'sfsyUrl'
    CK_NAME = 'url'
    print(f"🚀 顺丰速运积分任务脚本")
    
    local_script_name = os.path.basename(__file__)
    local_version = '2024.06.02'
    token = os.getenv(ENV_NAME)
    if token:
        tokens = token.split('\n')
    else:
        print(f"❌ 未找到环境变量 {ENV_NAME}")
        tokens = []
    
    if len(tokens) > 0:
        print(f"\n🎪 共获取到 {len(tokens)} 个账号")
        for index, infos in enumerate(tokens):
            run_result = RUN(infos, index).main()
            if not run_result: continue
    
    # 发送通知
    send_notification()

