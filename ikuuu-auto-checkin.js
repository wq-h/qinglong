/*
填写注册的邮箱和密码,多账号使用;隔开
export Ikuuu_EMAIL="xxx@.com;xxx@com"
export Ikuuu_PASSWD="A123;A123"
export Ikuuu_HOST="ikuuu.one"
由于 ikuuu 经常更换域名，添加 HOST 环境变量，默认为ikuuu.one。若域名更改，修改 HOST 的值为对应域名即可

cron: 33 08 * * *
const $ = new Env("ikuuu 机场签到");
*/
const { sendNotify } = require("./sendNotify");  // 引入 sendNotify.js 模块

const host = process.env.Ikuuu_HOST || "ikuuu.one";

const protocolPrefix = "https://";
const logInUrl = `${protocolPrefix}${host}/auth/login`;
const checkInUrl = `${protocolPrefix}${host}/user/checkin`;

function parseCookie(rawCookie) {
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

function generateCookieStr(cookieObject) {
  return Object.entries(cookieObject)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("; ");
}

async function logIn(email, passwd) {
  console.log(`Logging in with email: ${email}...`);

  let formData = new FormData();
  formData.append("host", host);
  formData.append("email", email);
  formData.append("passwd", passwd);
  formData.append("code", "");
  formData.append("remember_me", "off");

  let response = await fetch(logInUrl, {
    method: "POST",
    body: formData,
  });

  let rawCookie = response.headers.get("set-cookie");

  let responseJson = await response.json();

  if (responseJson) {
    console.log(responseJson.msg);
  }

  return parseCookie(rawCookie);
}

function checkIn(cookie) {
  return fetch(checkInUrl, {
    method: "POST",
    headers: {
      Cookie: generateCookieStr(cookie),
    },
  })
    .then((res) => res.json())
    .then((resJson) => {
      if (resJson) {
        console.log(resJson.msg);
      }
    });
}

// 延迟函数，单位为毫秒
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  let emails = process.env.Ikuuu_EMAIL;
  let passwords = process.env.Ikuuu_PASSWD;

  if (!emails || !passwords) {
    console.log("ENV ERROR: Please set both Ikuuu_EMAIL and Ikuuu_PASSWD.");
    process.exit(1);
  }

  let emailList = emails.split(";");
  let passwdList = passwords.split(";");

  if (emailList.length !== passwdList.length) {
    console.log("Error: The number of emails does not match the number of passwords.");
    process.exit(1);
  }

  // 创建一个通知数组，避免多次发送相同的消息
  let notifications = [];

  // 遍历每个账号执行登录并签到
  for (let i = 0; i < emailList.length; i++) {
    let email = emailList[i];
    let passwd = passwdList[i];
    let cookie = await logIn(email, passwd);
    await checkIn(cookie);

    // 每个账号的操作只添加一条通知
    notifications.push(`账号 ${email} 登录成功，签到完成`);

    // 每次登录后延迟 2 秒
    await delay(2000);  // 延迟 2 秒
  }

  // 合并所有通知为一条消息，避免多次发送
  const notificationMessage = notifications.join("\n");

  // 发送合并后的消息通知
  sendNotify(`多个账号操作完成：\n${notificationMessage}`);
}

main();
