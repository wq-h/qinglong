# -*- coding: utf8 -*-
import os
import time
from requests import session
from hashlib import md5

try:
    from sendNotify import send
except ImportError:
    print("加载通知服务失败")

class Tieba():
    Tieba_BDUSS = os.getenv("Tieba_BDUSS")

    def __init__(self, STOKEN):
        self.BDUSS = Tieba.Tieba_BDUSS
        self.STOKEN = STOKEN
        self.success_list = []
        self.result = {}
        self.sign_list = []
        self.fail_list = []
        self.session = session()
        self.session.headers.update(
            {'Accept': 'text/html, */*; q=0.01',
             'Accept-Encoding': 'gzip, deflate',
             'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
             'Connection': 'keep-alive',
             'Host': 'tieba.baidu.com',
             'Referer': 'http://tieba.baidu.com/i/i/forum',
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                           'Chrome/71.0.3578.98 Safari/537.36',
             'X-Requested-With': 'XMLHttpRequest'}
        )

    def set_cookie(self):
        self.session.cookies.update({'BDUSS': self.BDUSS, 'STOKEN': self.STOKEN})

    def fetch_tbs(self):
        r = self.session.get('http://tieba.baidu.com/dc/common/tbs').json()
        if r['is_login'] == 1:
            self.tbs = r['tbs']
        else:
            raise Exception('获取tbs错误！以下为返回数据：' + str(r))

    def fetch_likes(self):
        self.rest = set()
        self.already = set()
        r = self.session.get('https://tieba.baidu.com/mo/q/newmoindex?').json()
        if r['no'] == 0:
            for forum in r['data']['like_forum']:
                if forum['is_sign'] == 1:
                    self.already.add(forum['forum_name'])
                else:
                    self.rest.add(forum['forum_name'])
        else:
            raise Exception('获取关注贴吧错误！以下为返回数据：' + str(r))

    def sign(self, forum_name):
        data = {
            'kw': forum_name,
            'tbs': self.tbs,
            'sign': md5(f'kw={forum_name}tbs={self.tbs}tiebaclient!!!'.encode('utf8')).hexdigest()
        }
        r = self.session.post('http://c.tieba.baidu.com/c/c/forum/sign', data).json()
        if r['error_code'] == '160002':
            print(f'"{forum_name}"已签到')
            self.sign_list.append(forum_name)
            return True
        elif r['error_code'] == '0':
            print(f'"{forum_name}">>>>>>>签到成功，您是第{r["user_info"]["user_sign_rank"]}个签到的用户！')
            self.result[forum_name] = r
            self.success_list.append(forum_name)
            return True
        else:
            print(f'"{forum_name}"签到失败！以下为返回数据：{str(r)}')
            self.fail_list.append(forum_name)
            return False

    def loop(self, n):
        print(f'* 开始第{n}轮签到 *')
        rest = set()
        self.fetch_tbs()
        for forum_name in self.rest:
            flag = self.sign(forum_name)
            if not flag:
                rest.add(forum_name)
        self.rest = rest
        if n >= 10:  # 最大重试次数
            self.rest = set()

    def main(self, max):
        self.set_cookie()
        self.fetch_likes()
        n = 0
        if self.already:
            print('---------- 已经签到的贴吧 ---------')
            for forum_name in self.already:
                print(f'"{forum_name}"已签到')
                self.sign_list.append(forum_name)
        while n < max and self.rest:
            n += 1
            self.loop(n)

        if self.rest:
            print('--------- 签到失败列表 ----------')
            for forum_name in self.rest:
                print(f'"{forum_name}"签到失败！')

        # 在签到结束后调用 send 函数发送通知
        self.send_notification_message()

    def send_notification_message(self):
        msg = "贴吧签到结果：\n"

        if self.success_list:
            msg += "- **签到成功贴吧**：\n"
            for forum in self.success_list:
                sign_rank = self.result[forum]['user_info']['user_sign_rank']
                msg += f"    {forum}  （签到成功，第{sign_rank}个签到）\n"

        if self.sign_list:
            msg += "- **已经签到的贴吧**：\n"
            msg += "    " + "\n    ".join(self.sign_list) + "\n"

        msg += f"\n共关注了{len(self.already) + len(self.success_list)}个贴吧，"
        msg += f"本次成功签到了{len(self.success_list)}个，"
        msg += f"失败了{len(self.fail_list)}个，"
        msg += f"有{len(self.sign_list)}个贴吧已经签到。"

        # 发送通知
        send('Tieba_Sign', msg)

        # Add a 10-second delay before exiting
        time.sleep(10)

if __name__ == "__main__":
    BDUSS_values = os.getenv("Tieba_BDUSS")
    STOKEN = ''
    task = Tieba(STOKEN)
    print("\n========================\n")
    task.main(3)
    print("----------贴吧签到执行完毕----------")
