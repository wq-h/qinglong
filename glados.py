# !/usr/bin/python3
# -- coding: utf-8 --
# cron: 05 08 * * *
# const $ = new Env("glados 机场签到");
import datetime
import requests
import os
import json

try:
    from sendNotify import send
except ImportError:
    print("加载通知服务失败")
    send = lambda title, message: print(f"Title: {title}\nMessage: {message}")

if __name__ == '__main__':
    # GLaDOS cookie
    cookies = os.environ.get('GLADOS_COOKIES', []).split('&')
    if cookies[0] == '':
        print('未获取到GLADOS_COOKIES环境变量')
        cookies = []
        exit(0)
    checkin_url = 'https://glados.rocks/api/user/checkin' 
    status_url = 'https://glados.rocks/api/user/status' 
    referrer = 'https://glados.rocks/console/checkin' 
    origin = 'https://glados.rocks' 
    useragent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    payload = {
        'token': 'glados.one'
    }
    
    msg = "glados 机场签到结果：\n"
    for cookie in cookies:
        checkin = requests.post(checkin_url,
                                headers={'cookie': cookie, 'referrer': referrer, 'origin': origin, 'user-agent': useragent, 'content-type': 'application/json; charset=utf-8'},
                                data=json.dumps(payload))
        status = requests.get(status_url, headers={'cookie': cookie, 'referrer': referrer, 'origin': origin, 'user-agent': useragent})
        
        days = str(status.json()['data']['leftDays']).split('.')[0]
        email = status.json()['data']['email']

        balance = str(checkin.json()['list'][0]['balance']).split('.')[0] 
        change = str(checkin.json()['list'][0]['change']).split('.')[0] 

        if 'message' in checkin.text:
            msg += f"{email}|剩余：{days}天|积分：{balance}|变化：{change}\n"
        else:
            msg += f"{email} 签到失败，请更新 cookies\n"

    send('Glados_Sign', msg.strip())
