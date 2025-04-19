# cron: 10 */2 * * *
# new Env('更新IP代理白名单');

import requests
import hashlib
import urllib.parse
import os

from sendNotify import send  # 添加通知发送模块

# JULIANG_KEY = ''  # 填入巨量的API密钥，点击设置授权信息按钮查看，获取地址 https://www.juliangip.com/users/product/time
# JULIANG_TRADE_NO = ''  # 填入巨量的业务编号
# XK_APIKEY = ''  # 填入星空的 API Key
# XK_SIGN = ''  # 填入星空的 Sign
# XIEQU_UID = ''  # 填入携趣的 UID，获取地址 https://www.xiequ.cn/redirect.aspx?act=MyIpWhiteList.aspx
# XIEQU_UKEY = ''  # 填入携趣的 UKEY
# YYY_UID = ''  # 填入优亦云的用户套餐ID
# YYY_TOKEN = ''  # 填入优亦云的TOKEN
# 巨量
JULIANG_KEY = ''
JULIANG_TRADE_NO = '' 
# 星空
XK_APIKEY = ''
XK_SIGN = ''
# 携趣
XIEQU_UID = ''
XIEQU_UKEY = ''
# 优亦云
YYY_UID = ''
YYY_TOKEN = ''

# 青龙环境变量（若上面不填写，则读取青龙环境变量）
JULIANG_KEY = JULIANG_KEY if JULIANG_KEY else os.getenv("JULIANG_KEY")
JULIANG_TRADE_NO = JULIANG_TRADE_NO if JULIANG_TRADE_NO else os.getenv("JULIANG_TRADE_NO")
XK_APIKEY = XK_APIKEY if XK_APIKEY else os.getenv("XK_APIKEY")
XK_SIGN = XK_SIGN if XK_SIGN else os.getenv("XK_SIGN")
XIEQU_UID = XIEQU_UID if XIEQU_UID else os.getenv("XIEQU_UID")
XIEQU_UKEY = XIEQU_UKEY if XIEQU_UKEY else os.getenv("XIEQU_UKEY")
YYY_UID = YYY_UID if YYY_UID else os.getenv("YYY_UID")
YYY_TOKEN = YYY_TOKEN if YYY_TOKEN else os.getenv("YYY_TOKEN")




class SignKit:

    @staticmethod
    def md5_sign(params, secret):
        sign_content = SignKit.get_sign_content(params)
        return hashlib.md5((sign_content + '&key=' + secret).encode('utf-8')).hexdigest()

    @staticmethod
    def get_sign_content(params):
        params.pop('sign', None)  # 删除 sign
        sorted_params = sorted(params.items())
        sign_content = '&'.join([f"{k}={str(v)}" for k, v in sorted_params if str(v) is not None and not str(v).startswith('@')])
        return sign_content

def get_current_ip():
    response = requests.get('https://myip.ipip.net/json')
    data = response.json()
    return data['data']['ip']

def update_juliang_white_list(ip, JULIANG_KEY, JULIANG_TRADE_NO):
    if JULIANG_KEY and JULIANG_TRADE_NO:
        params = {
            'new_ip': ip,
            'reset': '1',
            'trade_no': JULIANG_TRADE_NO
        }
        sign = SignKit.md5_sign(params, JULIANG_KEY)
        query_string = urllib.parse.urlencode(params) + "&sign=" + sign

        url = f'http://v2.api.juliangip.com/dynamic/replaceWhiteIp?{query_string}'
        response = requests.get(url)
        return response.text

def update_xk_white_list(ip, XK_APIKEY, XK_SIGN):
    if XK_APIKEY and XK_SIGN:
        url = f'http://api2.xkdaili.com/tools/XApi.ashx?apikey={XK_APIKEY}&type=addwhiteip&sign={XK_SIGN}&flag=8&ip={ip}'
        response = requests.get(url)
        return response.text

def update_xiequ_white_list(ip, XIEQU_UID, XIEQU_UKEY):
    if XIEQU_UID and XIEQU_UKEY:
        url = f'http://op.xiequ.cn/IpWhiteList.aspx?uid={XIEQU_UID}&ukey={XIEQU_UKEY}&act=get'
        response = requests.get(url)
        data = response.text
        arr = data.split(',')
        if ip not in arr:
            requests.get(f'http://op.xiequ.cn/IpWhiteList.aspx?uid={XIEQU_UID}&ukey={XIEQU_UKEY}&act=del&ip=all')
            response = requests.get(f'http://op.xiequ.cn/IpWhiteList.aspx?uid={XIEQU_UID}&ukey={XIEQU_UKEY}&act=add&ip={ip}')
            return '更新xiequ白名单成功' if response.status_code == 200 else '更新xiequ白名单出错'
        else:
            return '携趣白名单ip未变化'

def update_yyy_white_list(ip, YYY_UID, YYY_TOKEN):
    if YYY_UID and YYY_TOKEN:
        url = f'http://data.yyyip.cn:88/whiteip_api?method=list&token={YYY_TOKEN}'
        response = requests.get(url)
        data = response.json()
        arr = [d["ip"] for d in data['data']]
        ipstr = ','.join(map(str, arr))
        if ip not in arr:
            requests.get(f'http://data.yyyip.cn:88/whiteip_api?method=del&token={YYY_TOKEN}&ip={ipstr}')
            response = requests.get(f'http://data.yyyip.cn:88/whiteip_api?method=add&token={YYY_TOKEN}&upackid={YYY_UID}&ip={ip}')
            return response.json()['msg']
            # return '更新优亦云白名单成功' if response.status_code == 200 else '更新优亦云白名单出错'
        else:
            return '优亦云白名单ip未变化'


def main():
    ip = get_current_ip()
    print('当前ip地址：', ip)

    res1 = update_juliang_white_list(ip, JULIANG_KEY, JULIANG_TRADE_NO)
    res2 = update_xk_white_list(ip, XK_APIKEY, XK_SIGN)
    res3 = update_xiequ_white_list(ip, XIEQU_UID, XIEQU_UKEY)
    res4 = update_yyy_white_list(ip, YYY_UID, YYY_TOKEN)

    print('更新巨量白名单结果：', res1)
    print('更新星空白名单结果：', res2)
    print('更新携趣白名单结果：', res3)
    print('更新优亦云白名单结果：', res4)

    # 判断是否有实际变更（不是 None 且不是“未变化”）
    meaningful_results = []
    if res1 and '未变化' not in res1:
        meaningful_results.append(f"巨量：{res1}")
    if res2 and '未变化' not in res2:
        meaningful_results.append(f"星空：{res2}")
    if res3 and '未变化' not in res3:
        meaningful_results.append(f"携趣：{res3}")
    if res4 and '未变化' not in res4:
        meaningful_results.append(f"优亦云：{res4}")

    if meaningful_results:
        msg = f"""📝 当前IP地址：{ip}
🔄 有效更新结果：
""" + "\n".join(meaningful_results)
        send("IP白名单更新通知", msg)
    else:
        print("无有效更新，无需发送通知。")


if __name__ == "__main__":
    main()