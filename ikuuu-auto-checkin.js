/*
  iKuuu 签到 + 流量查询 + 通知
  青龙面板脚本
  
  环境变量:
  - IKUuu_HOST: iKuuu 域名，默认 ikuuu.win
  - IKUuu_ACCOUNTS: 账号 JSON 数组
    示例: [{"name":"账号1","cookie":"xxx"},{"name":"账号2","cookie":"yyy"}]

cron: 33 08 * * *
const $ = new Env("ikuuu 机场签到");
*/

// ============ 环境变量 ============
const HOST = process.env.IKUuu_HOST || "ikuuu.win";
const ACCOUNTS_JSON = process.env.IKUuu_ACCOUNTS || "[]";

const CHECKIN_URL = `https://${HOST}/user/checkin`;
const USER_URL = `https://${HOST}/user`;

// ============ 工具函数 ============
function decodeBase64(str) {
  try {
    const text = atob(str);
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return decodeURIComponent(atob(str).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
  }
}

// ============ 签到 ============
async function checkIn(account) {
  try {
    const response = await fetch(CHECKIN_URL, {
      method: "POST",
      headers: {
        "Cookie": account.cookie,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
    const data = await response.json();
    
    let bonus = null;
    if (data.msg) {
      const match = data.msg.match(/(\d+\.?\d*)\s*([KMGT]?B)/i);
      if (match) bonus = `${match[1]} ${match[2].toUpperCase()}`;
    }
    
    if (data.ret === 1) {
      console.log(`✅ ${account.name} 签到成功`);
      if (bonus) console.log(`   +${bonus}`);
      return { success: true, bonus, msg: data.msg };
    } else {
      console.log(`❌ ${account.name}: ${data.msg}`);
      return { success: false, bonus: null, msg: data.msg };
    }
  } catch (error) {
    console.error(`[ERROR] ${account.name}: ${error.message}`);
    return { success: false, bonus: null, msg: error.message };
  }
}

// ============ 查询剩余流量 ============
async function getTraffic(account) {
  try {
    const data = await fetch(USER_URL, {
      headers: { Cookie: account.cookie }
    }).then(r => r.text());
    
    const originBodyMatch = data.match(/var originBody = "([^"]+)"/);
    let rest = "N/A";
    
    if (originBodyMatch && originBodyMatch[1]) {
      const decodeData = decodeBase64(originBodyMatch[1]);
      const match = decodeData.match(/<h4>剩余流量<\/h4>[\s\S]*?<span class="counter">([\d.]+)<\/span>\s*([A-Za-z]+)/);
      if (match) rest = `${match[1]} ${match[2]}`;
    }
    
    console.log(`📊 ${account.name} 剩余流量: ${rest}`);
    return rest;
  } catch (error) {
    console.log(`[ERROR] ${account.name} 流量查询: ${error.message}`);
    return "Error";
  }
}

// ============ 主函数 ============
async function main() {
  console.log("======== iKuuu 签到 + 流量查询 ========\n");
  console.log(`HOST: ${HOST}\n`);
  
  let accounts;
  try {
    accounts = JSON.parse(ACCOUNTS_JSON);
  } catch (e) {
    console.log("[ERROR] IKUuu_ACCOUNTS 格式错误，请检查 JSON 格式!");
    return;
  }
  
  if (!accounts.length) {
    console.log("[ERROR] 未配置账号! 请设置 IKUuu_ACCOUNTS 环境变量");
    return;
  }
  
  console.log(`检测到 ${accounts.length} 个账号\n`);
  
  const results = [];
  
  for (const account of accounts) {
    console.log(`\n--- ${account.name} ---`);
    
    const checkin = await checkIn(account);
    const traffic = await getTraffic(account);
    
    results.push({ name: account.name, checkin, traffic });
  }
  
  console.log("\n======== 签到完成 ========");
  
  // ============ 发送通知 ============
  const { sendNotify } = require("./sendNotify");
  
  let msg = `iKuuu 签到 + 流量查询\n\n`;
  
  for (const r of results) {
    const status = r.checkin.success ? "✅" : "❌";
    const bonus = r.checkin.bonus ? `\n   签到获得: ${r.checkin.bonus}` : "";
    msg += `${status} ${r.name}\n`;
    msg += `   签到: ${r.checkin.success ? "成功" : r.checkin.msg}${bonus}\n`;
    msg += `   剩余: ${r.traffic}\n\n`;
  }
  
  await sendNotify("iKuuu 签到", msg);
}

main().catch(error => {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
});
