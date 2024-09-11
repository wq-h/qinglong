# Tieba
一个python脚本，可以实现百度贴吧签到，支持青龙面板运行只需要百度账号的BDUSS即可
引用项目: https://github.com/fanfan142/Tieba_Sgin.git
## 修改后的功能：
1. 修改成变量方式
   export Tieba_BDUSS=""
2. 修改通知方式，去除只Server酱通知
## 青龙面板使用
1. 青龙面板使用需要再python3中添加 pretty_errors 和 requests 依赖
2. 抓取百度贴吧Application中的Cookies BDUSS的value值
   ![image-20240302121449165](https://github.com/wq-h/pictures/blob/main/tieba_network.png?raw=true)
# glados 机场
引用项目: https://github.com/komori-flag/glados_automation.git

我的邀请码:DU5MD-3NWHA-GP3DK-IESMU 注册地址: https://glados.space/landing/DU5MD-3NWHA-GP3DK-IESMU

## 修改后的功能：  
1. 修改通知方式，去除只PUSHPLUS通知
## 青龙面板使用
1. 抓取glados 控制台中的Cookies 值
2. 配置变量 GLADOS_COOKIES 如果有多个账号需使用 '&' 隔开 示例：cookie&cookie&cookie
   ![image-20240302121449165](https://github.com/wq-h/pictures/blob/main/glados_network.jpg?raw=true)

# 拉取命令
```shell
ql repo https://github.com/wq-h/qinglong.git "tieba.py|glados.py" "README.md" "sendNotify.py" "main"
```
