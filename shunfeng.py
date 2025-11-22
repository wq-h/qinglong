#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# cron: 00 08,20 * * *
# const $ = new Env("顺丰积分活动");
"""
顺丰速运自动签到与任务脚本
版本: v2025.10.08
修改作者: Jichun29
资源下载: dw.jichun29.cn
功能说明: 自动完成顺丰会员日常签到、积分任务及会员日活动
适用环境: Python 3.6+，需安装requests库
使用说明: 需配置sfsyUrl环境变量，包含有效的登录URL
注意事项: 脚本仅用于学习交流，使用时请遵守平台规定
"""

import hashlib
import json
import os
import random
import time
from datetime import datetime, timedelta
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from urllib.parse import unquote

# 禁用安全请求警告
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
PROXY_API_URL = os.getenv('SF_PROXY_API_URL', '')  # 从环境变量获取代理API地址

def get_proxy():
    """获取代理（通用功能）"""
    try:
        if not PROXY_API_URL:
            print('⚠️ 未配置代理API地址，将不使用代理')
            return None
            
        response = requests.get(PROXY_API_URL, timeout=10)
        if response.status_code == 200:
            proxy_text = response.text.strip()
            if ':' in proxy_text:
                proxy = f'http://{proxy_text}'
                return {
                    'http': proxy,
                    'https': proxy
                }
        print(f'❌ 获取代理失败: {response.text}')
        return None
    except Exception as e:
        print(f'❌ 获取代理异常: {str(e)}')
        return None

send_msg = ''
one_msg = ''

def Log(cont=''):
    """日志输出函数（通用功能）"""
    global send_msg, one_msg
    print(cont)
    if cont:
        one_msg += f'{cont}\n'
        send_msg += f'{cont}\n'

inviteId = ['']

class RUN:
    def __init__(self, info, index):
        """初始化账号信息和会话"""
        global one_msg
        one_msg = ''
        split_info = info.split('@')
        url = split_info[0]
        len_split_info = len(split_info)
        last_info = split_info[len_split_info - 1] if len_split_info > 0 else ''
        self.send_UID = last_info if "UID_" in last_info else None
        self.index = index + 1

        self.proxy = get_proxy()
        if self.proxy:
            print(f"✅ 成功获取代理: {self.proxy['http']}")
        
        self.s = requests.session()
        self.s.verify = False
        if self.proxy:
            self.s.proxies = self.proxy
            
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
        
        self.login_res = self.login(url)
        self.all_logs = [] 
        self.today = datetime.now().strftime('%Y-%m-%d')
        self.member_day_black = False
        self.member_day_red_packet_drew_today = False
        self.member_day_red_packet_map = {}
        self.max_level = 8
        self.packet_threshold = 1 << (self.max_level - 1)
        self.totalPoint = 0

    def get_deviceId(self, characters='abcdef0123456789'):
        """生成随机设备ID"""
        result = ''
        for char in 'xxxxxxxx-xxxx-xxxx':
            if char == 'x':
                result += random.choice(characters)
            elif char == 'X':
                result += random.choice(characters).upper()
            else:
                result += char
        return result

    def login(self, sfurl):
        """账号登录（核心功能）"""
        try:
            decoded_url = unquote(sfurl)
            ress = self.s.get(decoded_url, headers=self.headers)
            self.user_id = self.s.cookies.get_dict().get('_login_user_id_', '')
            self.phone = self.s.cookies.get_dict().get('_login_mobile_', '')
            self.mobile = self.phone[:3] + "*" * 4 + self.phone[7:] if self.phone else ''
            
            if self.phone:
                Log(f'👤 账号{self.index}:【{self.mobile}】登陆成功')
                return True
            else:
                Log(f'❌ 账号{self.index}获取用户信息失败')
                return False
        except Exception as e:
            Log(f'❌ 登录异常: {str(e)}')
            return False

    def getSign(self):
        """生成接口签名（核心功能）"""
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

    def do_request(self, url, data={}, req_type='post', max_retries=3):
        """通用请求处理函数"""
        self.getSign()
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                if req_type.lower() == 'get':
                    response = self.s.get(url, headers=self.headers, timeout=30)
                elif req_type.lower() == 'post':
                    response = self.s.post(url, headers=self.headers, json=data, timeout=30)
                else:
                    raise ValueError('Invalid req_type: %s' % req_type)
                    
                response.raise_for_status()
                
                try:
                    res = response.json()
                    return res
                except json.JSONDecodeError as e:
                    print(f'JSON解析失败: {str(e)}, 响应内容: {response.text[:200]}')
                    retry_count += 1
                    if retry_count < max_retries:
                        print(f'正在进行第{retry_count + 1}次重试...')
                        time.sleep(2)
                        continue
                    return None
                    
            except requests.exceptions.RequestException as e:
                retry_count += 1
                if retry_count < max_retries:
                    print(f'请求失败，正在切换代理重试 ({retry_count}/{max_retries}): {str(e)}')
                    self.proxy = get_proxy()
                    if self.proxy:
                        print(f"✅ 成功获取新代理: {self.proxy['http']}")
                        self.s.proxies = self.proxy
                    time.sleep(2)
                else:
                    print('请求最终失败:', e)
                    return None
                
        return None

    def sign(self):
        """常规签到（长期有效活动）"""
        print(f'🎯 开始执行签到')
        json_data = {"comeFrom": "vioin", "channelFrom": "WEIXIN"}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskSignPlusService~automaticSignFetchPackage'
        response = self.do_request(url, data=json_data)
        if response and response.get('success') == True:
            count_day = response.get('obj', {}).get('countDay', 0)
            if response.get('obj') and response['obj'].get('integralTaskSignPackageVOList'):
                packet_name = response["obj"]["integralTaskSignPackageVOList"][0]["packetName"]
                Log(f'✨ 签到成功，获得【{packet_name}】，本周累计签到【{count_day + 1}】天')
            else:
                Log(f'📝 今日已签到，本周累计签到【{count_day + 1}】天')
        else:
            error_msg = response.get('errorMessage', '未知错误') if response else '无响应'
            print(f'❌ 签到失败！原因：{error_msg}')

    def superWelfare_receiveRedPacket(self):
        """超值福利签到（已下线活动）"""
        print(f'🎁 超值福利签到')
        json_data = {'channel': 'czflqdlhbxcx'}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberActLengthy~redPacketActivityService~superWelfare~receiveRedPacket'
        response = self.do_request(url, data=json_data)
        if response and response.get('success') == True:
            gift_list = response.get('obj', {}).get('giftList', [])
            if response.get('obj', {}).get('extraGiftList', []):
                gift_list.extend(response['obj']['extraGiftList'])
            gift_names = ', '.join([gift['giftName'] for gift in gift_list]) if gift_list else '无'
            receive_status = response.get('obj', {}).get('receiveStatus')
            status_msg = '领取成功' if receive_status == 1 else '已领取过'
            Log(f'🎉 超值福利签到[{status_msg}]: {gift_names}')
        else:
            error_msg = response.get('errorMessage', '未知错误') if response else '无响应'
            print(f'❌ 超值福利签到失败: {error_msg}')

    def get_SignTaskList(self, END=False):
        """积分任务列表处理（长期有效活动）"""
        if not END:
            print(f'🎯 开始获取签到任务列表')
        json_data = {
            'channelType': '1',
            'deviceId': self.get_deviceId(),
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~queryPointTaskAndSignFromES'
        response = self.do_request(url, data=json_data)
        if response and response.get('success') == True and response.get('obj') != []:
            self.totalPoint = response["obj"]["totalPoint"]
            if END:
                Log(f'💰 当前积分：【{self.totalPoint}】')
                return
            Log(f'💰 执行前积分：【{self.totalPoint}】')
            for task in response["obj"]["taskTitleLevels"]:
                self.taskId = task["taskId"]
                self.taskCode = task["taskCode"]
                self.strategyId = task["strategyId"]
                self.title = task["title"]
                status = task["status"]
                skip_title = ['用行业模板寄件下单', '去新增一个收件偏好', '参与积分活动']
                if status == 3:
                    print(f'✨ {self.title}-已完成')
                    continue
                if self.title in skip_title:
                    print(f'⏭️ {self.title}-跳过')
                    continue
                else:
                    self.doTask()
                    time.sleep(3)
                self.receiveTask()

    def doTask(self):
        """完成任务（辅助功能）"""
        print(f'🎯 开始去完成【{self.title}】任务')
        json_data = {'taskCode': self.taskCode}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonRoutePost/memberEs/taskRecord/finishTask'
        response = self.do_request(url, data=json_data)
        if response and response.get('success') == True:
            print(f'✨ 【{self.title}】任务-已完成')
        else:
            error_msg = response.get('errorMessage', '未知错误') if response else '无响应'
            print(f'❌ 【{self.title}】任务-{error_msg}')

    def receiveTask(self):
        """领取任务奖励（辅助功能）"""
        print(f'🎁 开始领取【{self.title}】任务奖励')
        json_data = {
            "strategyId": self.strategyId,
            "taskId": self.taskId,
            "taskCode": self.taskCode,
            "deviceId": self.get_deviceId()
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~fetchIntegral'
        response = self.do_request(url, data=json_data)
        if response and response.get('success') == True:
            print(f'✨ 【{self.title}】任务奖励领取成功！')
        else:
            error_msg = response.get('errorMessage', '未知错误') if response else '无响应'
            print(f'❌ 【{self.title}】任务-{error_msg}')

    def EAR_END_2023_TaskList(self):
        """年终集卡任务（已下线活动）"""
        print('\n🎭 开始年终集卡任务')
        json_data = {
            "activityCode": "YEAREND_2024",
            "channelType": "MINI_PROGRAM"
        }
        self.headers['channel'] = '24nzdb'
        self.headers['platform'] = 'MINI_PROGRAM'
        self.headers['syscode'] = 'MCS-MIMP-CORE'

        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~activityTaskService~taskList'

        response = self.do_request(url, data=json_data)
        if response and response.get('success') == True:
            for item in response["obj"]:
                self.title = item["taskName"]
                self.taskType = item["taskType"]
                status = item["status"]
                if status == 3:
                    print(f'✨ 【{self.taskType}】-已完成')
                    continue
                if self.taskType == 'INTEGRAL_EXCHANGE':
                    print(f'⚠️ 积分兑换任务暂不支持')
                elif self.taskType == 'CLICK_MY_SETTING':
                    self.taskCode = item["taskCode"]
                    self.addDeliverPrefer()
                if "taskCode" in item:
                    self.taskCode = item["taskCode"]
                    self.doTask()
                    time.sleep(3)
                    self.receiveTask()
                else:
                    print(f'⚠️ 暂时不支持【{self.title}】任务')

    def addDeliverPrefer(self):
        """添加收件偏好（辅助功能，用于特定任务）"""
        print(f'>>>开始【{self.title}】任务')
        json_data = {
            "country": "中国",
            "countryCode": "A000086000",
            "province": "北京市",
            "provinceCode": "A110000000",
            "city": "北京市",
            "cityCode": "A111000000",
            "county": "东城区",
            "countyCode": "A110101000",
            "address": "1号楼1单元101",
            "latitude": "",
            "longitude": "",
            "memberId": "",
            "locationCode": "010",
            "zoneCode": "CN",
            "postCode": "",
            "takeWay": "7",
            "callBeforeDelivery": 'false',
            "deliverTag": "2,3,4,1",
            "deliverTagContent": "",
            "startDeliverTime": "",
            "selectCollection": 'false',
            "serviceName": "",
            "serviceCode": "",
            "serviceType": "",
            "serviceAddress": "",
            "serviceDistance": "",
            "serviceTime": "",
            "serviceTelephone": "",
            "channelCode": "RW11111",
            "taskId": self.taskId,
            "extJson": "{\"noDeliverDetail\":[]}"
        }
        url = 'https://ucmp.sf-express.com/cx-wechat-member/member/deliveryPreference/addDeliverPrefer'
        response = self.do_request(url, data=json_data)
        if response and response.get('success') == True:
            print('新增一个收件偏好，成功')
        else:
            error_msg = response.get('errorMessage', '未知错误') if response else '无响应'
            print(f'>【{self.title}】任务-{error_msg}')

    def member_day_index(self):
        """会员日活动主入口（每月26-28日有效）"""
        print('🎭 会员日活动')
        try:
            invite_user_id = random.choice([invite for invite in inviteId if invite != self.user_id])
            payload = {'inviteUserId': invite_user_id}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~memberDayIndexService~index'

            response = self.do_request(url, data=payload)
            if response and response.get('success'):
                lottery_num = response.get('obj', {}).get('lotteryNum', 0)
                can_receive_invite_award = response.get('obj', {}).get('canReceiveInviteAward', False)
                if can_receive_invite_award:
                    self.member_day_receive_invite_award(invite_user_id)
                self.member_day_red_packet_status()
                Log(f'🎁 会员日可以抽奖{lottery_num}次')
                for _ in range(lottery_num):
                    self.member_day_lottery()
                if self.member_day_black:
                    return
                self.member_day_task_list()
                if self.member_day_black:
                    return
                self.member_day_red_packet_status()
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log(f'📝 查询会员日失败: {error_message}')
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_receive_invite_award(self, invite_user_id):
        """领取会员日邀请奖励"""
        try:
            payload = {'inviteUserId': invite_user_id}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~memberDayIndexService~receiveInviteAward'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                product_name = response.get('obj', {}).get('productName', '空气')
                Log(f'🎁 会员日奖励: {product_name}')
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log(f'📝 领取会员日奖励失败: {error_message}')
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_lottery(self):
        """会员日抽奖"""
        try:
            payload = {}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~memberDayLotteryService~lottery'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                product_name = response.get('obj', {}).get('productName', '空气')
                Log(f'🎁 会员日抽奖: {product_name}')
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log(f'📝 会员日抽奖失败: {error_message}')
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_task_list(self):
        """会员日任务列表"""
        try:
            payload = {'activityCode': 'MEMBER_DAY', 'channelType': 'MINI_PROGRAM'}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~activityTaskService~taskList'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                task_list = response.get('obj', [])
                for task in task_list:
                    if task['status'] == 1:
                        if self.member_day_black:
                            return
                        self.member_day_fetch_mix_task_reward(task)
                for task in task_list:
                    if task['status'] == 2:
                        if self.member_day_black:
                            return
                        if task['taskType'] in ['SEND_SUCCESS', 'INVITEFRIENDS_PARTAKE_ACTIVITY', 'OPEN_SVIP',
                                                'OPEN_NEW_EXPRESS_CARD', 'OPEN_FAMILY_CARD', 'CHARGE_NEW_EXPRESS_CARD',
                                                'INTEGRAL_EXCHANGE']:
                            pass
                        else:
                            for _ in range(task['restFinishTime']):
                                if self.member_day_black:
                                    return
                                self.member_day_finish_task(task)
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log('📝 查询会员日任务失败: ' + error_message)
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_finish_task(self, task):
        """完成会员日任务"""
        try:
            payload = {'taskCode': task['taskCode']}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberEs~taskRecord~finishTask'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                Log('📝 完成会员日任务[' + task['taskName'] + ']成功')
                self.member_day_fetch_mix_task_reward(task)
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log('📝 完成会员日任务[' + task['taskName'] + ']失败: ' + error_message)
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_fetch_mix_task_reward(self, task):
        """领取会员日任务奖励"""
        try:
            payload = {'taskType': task['taskType'], 'activityCode': 'MEMBER_DAY', 'channelType': 'MINI_PROGRAM'}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~activityTaskService~fetchMixTaskReward'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                Log('🎁 领取会员日任务[' + task['taskName'] + ']奖励成功')
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log('📝 领取会员日任务[' + task['taskName'] + ']奖励失败: ' + error_message)
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_receive_red_packet(self, hour):
        """领取会员日特定时段红包"""
        try:
            payload = {'receiveHour': hour}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~memberDayTaskService~receiveRedPacket'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                print(f'🎁 会员日领取{hour}点红包成功')
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                print(f'📝 会员日领取{hour}点红包失败: {error_message}')
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_red_packet_status(self):
        """会员日红包状态查询与合成"""
        try:
            payload = {}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~memberDayPacketService~redPacketStatus'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                packet_list = response.get('obj', {}).get('packetList', [])
                for packet in packet_list:
                    self.member_day_red_packet_map[packet['level']] = packet['count']

                for level in range(1, self.max_level):
                    count = self.member_day_red_packet_map.get(level, 0)
                    while count >= 2:
                        self.member_day_red_packet_merge(level)
                        count -= 2
                packet_summary = []
                remaining_needed = 0

                for level, count in self.member_day_red_packet_map.items():
                    if count == 0:
                        continue
                    packet_summary.append(f"[{level}级]X{count}")
                    int_level = int(level)
                    if int_level < self.max_level:
                        remaining_needed += 1 << (int_level - 1)

                Log("📝 会员日合成列表: " + ", ".join(packet_summary))

                if self.member_day_red_packet_map.get(self.max_level):
                    Log(f"🎁 会员日已拥有[{self.max_level}级]红包X{self.member_day_red_packet_map[self.max_level]}")
                    self.member_day_red_packet_draw(self.max_level)
                else:
                    remaining = self.packet_threshold - remaining_needed
                    Log(f"📝 会员日距离[{self.max_level}级]红包还差: [1级]红包X{remaining}")

            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log(f'📝 查询会员日合成失败: {error_message}')
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_red_packet_merge(self, level):
        """会员日红包合成"""
        try:
            payload = {'level': level, 'num': 2}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~memberDayPacketService~redPacketMerge'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                Log(f'🎁 会员日合成: [{level}级]红包X2 -> [{level + 1}级]红包')
                self.member_day_red_packet_map[level] -= 2
                if not self.member_day_red_packet_map.get(level + 1):
                    self.member_day_red_packet_map[level + 1] = 0
                self.member_day_red_packet_map[level + 1] += 1
            else:
                error_message = response.get('errorMessage', '无返回') if response else '无响应'
                Log(f'📝 会员日合成两个[{level}级]红包失败: {error_message}')
                if '没有资格参与活动' in error_message:
                    self.member_day_black = True
                    Log('📝 会员日任务风控')
        except Exception as e:
            print(e)

    def member_day_red_packet_draw(self, level):
        """提取会员日红包奖励"""
        try:
            payload = {'level': str(level)}
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~memberDayPacketService~redPacketDraw'
            response = self.do_request(url, payload)
            if response and response.get('success'):
                coupon_names = [item['couponName'] for item in response.get('obj', [])] or []
                Log(f"🎁 会员日提取[{level}级]红包: {', '.join(coupon_names) or '空气'}")
            else:
                error_message = response.get('errorMessage') if response else "无返回"
                Log(f"📝 会员日提取[{level}级]红包失败: {error_message}")
                if "没有资格参与活动" in error_message:
                    self.memberDay_black = True
                    print("📝 会员日任务风控")
        except Exception as e:
            print(e)

    def main(self):
        """主执行函数"""
        global one_msg
        # 输出开始执行时间
        start_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"## 开始执行... {start_time}")
        
        wait_time = random.randint(1000, 3000) / 1000.0  
        time.sleep(wait_time)  
        one_msg = ''
        if not self.login_res:
            return False

        # 执行核心功能
        self.sign()  # 常规签到（长期有效）
        # self.superWelfare_receiveRedPacket()  # 超值福利签到（已下线，建议注释）
        self.get_SignTaskList()  # 积分任务处理（长期有效）
        self.get_SignTaskList(True)  # 查询当前积分

        # 会员日活动（每月26-28日执行）
        current_date = datetime.now().day
        if 26 <= current_date <= 28:
            self.member_day_index()
        else:
            print('⏰ 未到指定时间不执行会员日任务\n==================================\n')

        return True

def main():
    """程序入口"""
    ENV_NAME = 'sfsyUrl'
    local_version = '2025.10.08'
    token = os.getenv(ENV_NAME)
    if not token:
        print(f"❌ 未找到环境变量 {ENV_NAME}，请检查配置")
        return
    tokens = token.split('&')
    tokens = [t.strip() for t in tokens if t.strip()]
    if len(tokens) == 0:
        print(f"❌ 环境变量 {ENV_NAME} 为空或格式错误")
        return
        
    print(f"==================================")
    print(f"🎉 更多资源下载：dw.jichun29.cn")
    print(f"🚚 顺丰速运脚本 v{local_version}")
    print(f"📱 共获取到{len(tokens)}个账号")
    print(f"😣 修改By:Jichun29")
    print(f"==================================")
    
    for index, infos in enumerate(tokens):
        run_result = RUN(infos, index).main()
        if not run_result:
            continue

if __name__ == '__main__':
    main()

