/*
填写注册的邮箱和密码,多账号使用;隔开
export Ikuuu_EMAIL="xxx@.com;xxx@com"
export Ikuuu_PASSWD="A123;A123"
export Ikuuu_HOST="ikuuu.one"
由于 ikuuu 经常更换域名，添加 HOST 环境变量，默认为ikuuu.one。若域名更改，修改 HOST 的值为对应域名即可

cron: 33 08 * * *
const $ = new Env("ikuuu 机场签到");
*/
const { sendNotify } = require("./sendNotify");
const fs = require('fs');
const path = require('path');

// 配置类
class Config {
    static get HOST() {
        return process.env.Ikuuu_HOST || "ikuuu.one";
    }

    static get PROTOCOL_PREFIX() {
        return "https://";
    }

    static get LOGIN_URL() {
        return `${Config.PROTOCOL_PREFIX}${Config.HOST}/auth/login`;
    }

    static get CHECKIN_URL() {
        return `${Config.PROTOCOL_PREFIX}${Config.HOST}/user/checkin`;
    }
}

// 日志配置
const logStream = fs.createWriteStream(path.join(__dirname, 'ikuuu.log'), { flags: 'a' });

function log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    logStream.write(logMessage);
    console.log(logMessage);
}

// Cookie 工具类
class CookieUtil {
    static parseCookie(rawCookie) {
        let cookieSets = rawCookie.split("path=/,");
        const cookies = {};

        cookieSets.forEach((cookie) => {
            const match = cookie.match(/^([^=]+)=(.*?);/);
            if (match) {
                const fieldName = match[1].trim();
                let fieldValue = match[2].trim();
                fieldValue = decodeURIComponent(fieldValue);

                if (!cookies[fieldName]) {
                    cookies[fieldName] = fieldValue;
                }
            }
        });

        return cookies;
    }

    static generateCookieStr(cookieObject) {
        return Object.entries(cookieObject)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("; ");
    }
}

// Ikuuu 客户端类
class IkuuuClient {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

    async login() {
        log('INFO', `Logging in with email: ${this.email}...`);

        let formData = new FormData();
        formData.append("host", Config.HOST);
        formData.append("email", this.email);
        formData.append("passwd", this.password);
        formData.append("code", "");
        formData.append("remember_me", "off");

        try {
            let response = await fetch(Config.LOGIN_URL, {
                method: "POST",
                body: formData,
            });

            let rawCookie = response.headers.get("set-cookie");
            let responseJson = await response.json();

            if (responseJson) {
                log('INFO', responseJson.msg);
            }

            return CookieUtil.parseCookie(rawCookie);
        } catch (error) {
            log('ERROR', `Login failed for ${this.email}: ${error.message}`);
            throw error;
        }
    }

    async checkIn(cookie) {
        try {
            let response = await fetch(Config.CHECKIN_URL, {
                method: "POST",
                headers: {
                    Cookie: CookieUtil.generateCookieStr(cookie),
                },
            });

            let responseJson = await response.json();
            if (responseJson) {
                log('INFO', responseJson.msg);
            }
        } catch (error) {
            log('ERROR', `Check-in failed for ${this.email}: ${error.message}`);
            throw error;
        }
    }
}

// 延迟函数，单位为毫秒
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    let emails = process.env.Ikuuu_EMAIL;
    let passwords = process.env.Ikuuu_PASSWD;

    if (!emails || !passwords) {
        log('ERROR', "ENV ERROR: Please set both Ikuuu_EMAIL and Ikuuu_PASSWD.");
        process.exit(1);
    }

    let emailList = emails.split(";");
    let passwdList = passwords.split(";");

    if (emailList.length !== passwdList.length) {
        log('ERROR', "Error: The number of emails does not match the number of passwords.");
        process.exit(1);
    }

    let notifications = [];

    for (let i = 0; i < emailList.length; i++) {
        let email = emailList[i];
        let passwd = passwdList[i];
        let client = new IkuuuClient(email, passwd);

        try {
            let cookie = await client.login();
            await client.checkIn(cookie);
            notifications.push(`账号 ${email} 登录成功，签到完成`);
        } catch (error) {
            notifications.push(`账号 ${email} 操作失败: ${error.message}`);
        }

        await delay(2000);  // 延迟 2 秒
    }

    // 过滤掉 undefined 值
    const notificationMessage = notifications
        .filter(msg => msg !== undefined)
        .join("\n");

    // 调试：打印通知数组
    console.log("通知数组内容:", notifications);

    sendNotify(`多个账号操作完成：\n${notificationMessage}`);
}

main().catch(error => {
    log('ERROR', `Main function failed: ${error.message}`);
    process.exit(1);
});
