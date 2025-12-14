#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
联通账号密码登录脚本 - 青龙 2.19.2 版
通过账号密码登录，生成 UNICOM_ACCOUNTS=手机号#token_online#appid
"""

import os
import json
import time
import random
import base64
import requests
import sqlite3
import hashlib
from uuid import uuid4
from datetime import datetime
from urllib.parse import quote
from sys import stdout
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5

def print_now(msg):
    print(msg)
    stdout.flush()

#-----------------------------------------
# 数据库操作
#-----------------------------------------
def get_ql_envs_from_db():
    """直接从青龙数据库读取环境变量"""
    envs = []
    
    db_paths = [
        "/ql/data/db/env.db",
        "/ql/db/env.db",
    ]
    
    db_path = None
    for path in db_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        return envs
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT name, value, remarks, id FROM environments 
            WHERE status = 0
            ORDER BY name
        """)
        
        rows = cursor.fetchall()
        for row in rows:
            envs.append({
                "name": row[0],
                "value": row[1],
                "remarks": row[2] if row[2] else "",
                "id": row[3]
            })
        
        conn.close()
        return envs
        
    except Exception as e:
        print_now(f"⚠ 读取数据库失败: {e}")
        return envs

def update_env_in_db(name, value, remarks=""):
    """更新数据库中的环境变量"""
    db_paths = [
        "/ql/data/db/env.db",
        "/ql/db/env.db",
    ]
    
    for db_path in db_paths:
        if os.path.exists(db_path):
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                
                cursor.execute("SELECT id FROM environments WHERE name = ?", (name,))
                row = cursor.fetchone()
                
                if row:
                    cursor.execute("""
                        UPDATE environments 
                        SET value = ?, remarks = ?, updatedAt = datetime('now')
                        WHERE name = ?
                    """, (value, remarks, name))
                    print_now(f"🔄 更新变量: {name}")
                else:
                    cursor.execute("""
                        INSERT INTO environments (name, value, remarks, status, createdAt, updatedAt)
                        VALUES (?, ?, ?, 0, datetime('now'), datetime('now'))
                    """, (name, value, remarks))
                    print_now(f"🆕 新增变量: {name}")
                
                conn.commit()
                conn.close()
                return True
                
            except Exception as e:
                print_now(f"⚠ 更新数据库失败 {db_path}: {e}")
    
    return False

#-----------------------------------------
# 变量获取
#-----------------------------------------
def get_env_value(name):
    """获取环境变量值"""
    
    # 系统环境变量
    value = os.environ.get(name)
    if value:
        return value
    
    # 数据库
    envs = get_ql_envs_from_db()
    for env in envs:
        if env["name"] == name:
            return env["value"]
    
    return None

#-----------------------------------------
# 管理 UNICOM_ACCOUNTS 变量
#-----------------------------------------
def get_existing_accounts():
    """获取现有的 UNICOM_ACCOUNTS 配置"""
    accounts_str = get_env_value("UNICOM_ACCOUNTS")
    if not accounts_str:
        return {}
    
    accounts = {}
    lines = accounts_str.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if line and '#' in line:
            parts = line.split('#')
            if len(parts) >= 3:  # 需要手机号#token#appid
                phone = parts[0]
                token = parts[1]
                appid = parts[2]
                accounts[phone] = {
                    "token": token,
                    "appid": appid,
                    "status": "有效"
                }
    
    return accounts

def update_unicom_accounts(phone, token_online, appid):
    """更新 UNICOM_ACCOUNTS 环境变量"""
    print_now(f"📝 更新账户信息: {phone}")
    
    existing_accounts = get_existing_accounts()
    
    existing_accounts[phone] = {
        "token": token_online,
        "appid": appid,
        "status": "有效",
        "updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    accounts_lines = []
    for acc_phone, acc_info in existing_accounts.items():
        if acc_info["token"]:
            line = f"{acc_phone}#{acc_info['token']}#{acc_info['appid']}"
            accounts_lines.append(line)
    
    accounts_lines.sort()
    new_value = "\n".join(accounts_lines)
    
    success = update_env_in_db("UNICOM_ACCOUNTS", new_value, "联通账户Token列表")
    
    if success:
        print_now(f"✅ UNICOM_ACCOUNTS 已更新，包含 {len(accounts_lines)} 个账户")
        return True
    else:
        print_now(f"❌ 更新UNICOM_ACCOUNTS失败")
        return False

# =====================================================================
# RSA 加密类（适配账号密码登录）
# =====================================================================
class RSAEncrypt:
    def __init__(self):
        self.public_key = """-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDc+CZK9bBA9IU+gZUOc6FUGu7y
O9WpTNB0PzmgFBh96Mg1WrovD1oqZ+eIF4LjvxKXGOdI79JRdve9NPhQo07+uqGQ
gE4imwNnRx7PFtCRryiIEcUoavuNtuRVoBAm6qdB0SrctgaqGfLgKvZHOnwTjyNq
jBUxzMeQlEC2czEMSwIDAQAB
-----END PUBLIC KEY-----"""
        
        self.max_block_size = 117
    
    def encrypt(self, plaintext, is_password=False):
        """RSA加密"""
        try:
            # 如果是密码，需要添加随机字符串
            if is_password:
                plaintext = plaintext + "000000"
            
            raw = plaintext.encode('utf-8')
            pubkey = RSA.import_key(self.public_key)
            cipher = PKCS1_v1_5.new(pubkey)
            
            # 分块加密
            result = []
            for i in range(0, len(raw), self.max_block_size):
                block = raw[i:i + self.max_block_size]
                encrypted_block = cipher.encrypt(block)
                result.append(encrypted_block)
            
            encrypted = b"".join(result)
            return base64.b64encode(encrypted).decode('utf-8')
            
        except Exception as e:
            print_now(f"❌ RSA 加密失败：{e}")
            return ""

# =====================================================================
# 联通账号密码登录类
# =====================================================================
class UnicomPwdLogin:
    def __init__(self, phone, password):
        self.phone = phone
        self.password = password
        self.token_online = ""
        self.ecs_token = ""
        self.appid = ""
        self.device_id = ""
        
        self.init_device_info()
        self.rsa = RSAEncrypt()
    
    def init_device_info(self):
        """初始化设备信息"""
        # 生成 appid（按第一个脚本规则）
        self.appid = (
            f"{random.randint(0,9)}f{random.randint(0,9)}af"
            f"{random.randint(0,9)}{random.randint(0,9)}ad"
            f"{random.randint(0,9)}912d306b5053abf90c7ebbb695887bc"
            "870ae0706d573c348539c26c5c0a878641fcc0d3e90acb9be1e6ef858a"
            "59af546f3c826988332376b7d18c8ea2398ee3a9c3db947e2471d32a49612"
        )
        
        # 生成 device_id（使用手机号MD5）
        self.device_id = hashlib.md5(self.phone.encode()).hexdigest()
    
    def build_headers(self):
        """构建请求头"""
        app_version = "iphone_c@12.0200"
        device_os = "15.8.3"
        
        return {
            "Host": "m.client.10010.com",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            "Connection": "keep-alive",
            "Accept": "*/*",
            "User-Agent": f"ChinaUnicom4.x/12.2 (com.chinaunicom.mobilebusiness; build:44; iOS {device_os}) Alamofire/4.7.3 unicom{{version:{app_version}}}",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        }
    
    def build_payload(self):
        """构建请求参数"""
        encrypted_mobile = self.rsa.encrypt(self.phone, is_password=False)
        encrypted_password = self.rsa.encrypt(self.password, is_password=True)
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        return {
            "voipToken": "citc-default-token-do-not-push",
            "deviceBrand": "iPhone",
            "simOperator": "--,%E4%B8%AD%E5%9B%BD%E7%A7%BB%E5%8A%A8,--,--,--",
            "deviceId": self.device_id,
            "netWay": "wifi",
            "deviceCode": self.device_id,
            "deviceOS": "15.8.3",
            "uniqueIdentifier": self.device_id,
            "latitude": "",
            "version": "iphone_c@12.0200",
            "pip": "192.168.5.14",
            "isFirstInstall": "1",
            "remark4": "",
            "keyVersion": "2",
            "longitude": "",
            "simCount": "1",
            "mobile": encrypted_mobile,
            "isRemberPwd": "false",
            "appId": self.appid,  # 使用生成的appid
            "reqtime": timestamp,
            "deviceModel": "iPhone8,2",
            "password": encrypted_password
        }
    
    def login(self):
        """执行登录"""
        print_now(f"🔐 使用账号密码登录 {self.phone} ...")
        
        url = "https://m.client.10010.com/mobileService/login.htm"
        headers = self.build_headers()
        payload = self.build_payload()
        
        try:
            response = requests.post(
                url,
                data=payload,
                headers=headers,
                timeout=15
            )
            
            result = response.json()
            print_now(f"📊 登录返回: {result}")
            
            code = str(result.get("code", ""))
            
            if code in ["0", "0000"]:
                self.token_online = result.get("token_online", "")
                self.ecs_token = result.get("ecs_token", "")
                
                if self.token_online:
                    print_now(f"🎉 登录成功！")
                    print_now(f"   Token: {self.token_online[:30]}...")
                    print_now(f"   AppID: {self.appid[:30]}...")
                    return True
                else:
                    print_now(f"⚠ 登录成功但未获取到token_online")
                    return False
            
            elif code == "2":
                print_now("❌ 密码错误！请检查您的登录专用密码。")
                return False
            
            elif code == "11":
                print_now("❌ 未设置登录专用密码！")
                print_now("💡 建议：请前往联通APP设置或重置登录专用密码。")
                return False
            
            elif code == "ECS99999":
                print_now("🛡️ 触发安全风控 (ECS99999)")
                print_now("💡 建议：请手动打开联通APP登录一次以解除风控。")
                return False
            
            else:
                desc = result.get("desc", "未知错误")
                print_now(f"❌ 登录失败: {desc} (Code: {code})")
                return False
                
        except Exception as e:
            print_now(f"❌ 登录请求失败：{e}")
            return False
    
    def save_account_info(self):
        """保存账户信息到UNICOM_ACCOUNTS"""
        if not self.token_online:
            print_now("❌ 没有有效的Token，无法保存")
            return False
        
        success = update_unicom_accounts(self.phone, self.token_online, self.appid)
        return success

# =====================================================================
# 主程序
# =====================================================================
def parse_accounts():
    """解析账号密码配置"""
    accounts = []
    
    # 旧格式：手机号#密码@手机号#密码
    accounts_str = get_env_value("UNICOM_ACCOUNTS_OLD")
    if not accounts_str:
        # 尝试新格式：手机号#密码
        accounts_str = get_env_value("UNICOM_ACCOUNTS_PWD")
    
    if not accounts_str:
        print_now("❌ 未找到账号密码配置")
        print_now("💡 请在青龙环境变量中设置:")
        print_now("   UNICOM_ACCOUNTS_OLD = 手机号#密码@手机号#密码")
        print_now("   或")
        print_now("   UNICOM_ACCOUNTS_PWD = 手机号#密码")
        return accounts
    
    # 解析多个账号
    account_list = accounts_str.split('@')
    
    for item in account_list:
        item = item.strip()
        if not item:
            continue
        
        if '#' in item:
            parts = item.split('#')
            if len(parts) >= 2:
                phone = parts[0].strip()
                password = parts[1].strip()
                
                if phone and phone.isdigit() and len(phone) == 11:
                    accounts.append({
                        "phone": phone,
                        "password": password
                    })
                    print_now(f"✅ 添加账号: {phone}")
                else:
                    print_now(f"⚠ 跳过无效手机号: {phone}")
            else:
                print_now(f"⚠ 格式错误忽略: {item}")
        else:
            print_now(f"⚠ 格式错误忽略 (缺少#): {item}")
    
    return accounts

def show_current_accounts():
    """显示当前已保存的账户"""
    accounts = get_existing_accounts()
    if accounts:
        print_now("\n📋 当前已保存的账户:")
        print_now("-" * 60)
        for phone, info in accounts.items():
            token_preview = info['token'][:20] + "..." if len(info['token']) > 20 else info['token']
            appid_preview = info['appid'][:20] + "..." if info['appid'] and len(info['appid']) > 20 else info['appid']
            status = info.get('status', '未知')
            updated = info.get('updated', '')
            
            print_now(f"   📱 {phone}")
            print_now(f"      状态: {status}")
            print_now(f"      Token: {token_preview}")
            if updated:
                print_now(f"      更新: {updated}")
        print_now("-" * 60)
        print_now(f"总计: {len(accounts)} 个账户\n")
    else:
        print_now("ℹ 暂无已保存的账户\n")

def check_dependencies():
    """检查依赖"""
    try:
        from Crypto.PublicKey import RSA
        from Crypto.Cipher import PKCS1_v1_5
        print_now("✅ 依赖检查通过")
        return True
    except ImportError:
        print_now("❌ 缺少依赖：pycryptodome")
        print_now("📦 安装命令: pip3 install pycryptodome")
        return False

def main():
    print_now("🚀 联通账号密码登录脚本启动")
    print_now(f"📅 当前时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_now("=" * 60)
    
    # 检查依赖
    if not check_dependencies():
        return
    
    # 显示当前已保存的账户
    show_current_accounts()
    
    # 解析账号密码
    accounts = parse_accounts()
    if not accounts:
        return
    
    print_now(f"📱 本次需处理 {len(accounts)} 个账号")
    
    # 处理每个账号
    success_count = 0
    skip_count = 0
    for idx, account in enumerate(accounts):
        phone = account["phone"]
        password = account["password"]
        
        print_now("\n" + "="*60)
        print_now(f"▶ 处理账号 {idx+1}/{len(accounts)}: {phone}")
        print_now("="*60)
        
        try:
            # 检查是否已有Token
            existing_accounts = get_existing_accounts()
            if phone in existing_accounts and existing_accounts[phone]["token"]:
                token = existing_accounts[phone]["token"]
                if len(token) > 20:
                    skip_count += 1
                    print_now(f"⏭️  已有Token，跳过")
                    continue
            
            # 执行登录
            login = UnicomPwdLogin(phone, password)
            if login.login():
                if login.save_account_info():
                    success_count += 1
                    print_now(f"✅ 账号 {phone} 信息已保存")
            else:
                print_now(f"❌ 账号 {phone} 登录失败")
                
        except Exception as e:
            print_now(f"❌ 账号 {phone} 执行异常: {e}")
        
        # 等待
        if idx < len(accounts) - 1:
            wait_time = random.randint(3, 7)
            print_now(f"⏳ 等待 {wait_time} 秒后处理下一个账号...")
            time.sleep(wait_time)
    
    # 最终显示
    print_now("\n" + "="*60)
    print_now("📊 执行结果汇总")
    print_now("="*60)
    print_now(f"📱 总账号数: {len(accounts)}")
    print_now(f"✅ 成功登录: {success_count}")
    print_now(f"⏭️  跳过已有: {skip_count}")
    print_now(f"❌ 登录失败: {len(accounts) - success_count - skip_count}")
    
    # 显示更新后的账户列表
    if success_count > 0:
        print_now("\n📋 更新后的账户列表:")
        show_current_accounts()
        
        print_now("\n💡 UNICOM_ACCOUNTS 变量说明:")
        print_now("   格式: 手机号#token_online#appid")
        print_now("   每行一个账户")
        print_now("   已自动保存到青龙环境变量")
        
        print_now("\n🔧 其他脚本使用示例:")
        print_now("   ```python")
        print_now("   # 读取UNICOM_ACCOUNTS")
        print_now("   import os")
        print_now("   accounts = os.environ.get('UNICOM_ACCOUNTS', '')")
        print_now("   for line in accounts.strip().split('\\n'):")
        print_now('       if line and "#" in line:')
        print_now('           phone, token, appid = line.split("#", 2)')
        print_now('           print(f"手机号: {phone}")')
        print_now('           print(f"Token: {token[:20]}...")')
        print_now('           print(f"AppID: {appid[:20]}...")')
        print_now("   ```")
    
    print_now("\n🎉 脚本执行完成")

if __name__ == "__main__":
    main()