/*
cron:  58 9,19 * * *
const $ = new Env("中国联通");
中国联通 v1.19 + 自动提取Token整合版

包含以下功能:
1. 首页签到 (话费红包/积分)
2. 联通祝福 (各类抽奖)
3. 天天领现金 (每日打卡/立减金)
4. 权益超市 (任务/抽奖/浇水/领奖)
5. 安全管家 (日常任务/积分领取)
6. 联通云盘 (签到/抽奖/AI互动)
7. 联通阅读 (新版重构: 自动获取书籍/心跳阅读/8051抽奖/查红包)
8. [新增] 抢50话费券 (每日10点/18点秒杀，智能极速模式)

更新说明:

### 20251226
v1.19:
- 🛠️ 修复日常模式代理过期：针对多账号串行执行日常任务时，后排账号因等待时间过长导致代理IP失效(ECONNRESET)的问题。
- 🔄 动态刷新机制：在日常模式（非抢购时间）下，轮到每个账号执行任务前，**强制重新提取新代理IP并登录**，确保任务执行全程连接畅通。
- ⚡ 抢购模式保持：极速抢购模式（10点/18点）继续维持“统一预登录+并发”逻辑，最大化利用IP有效期争取毫秒级响应。

### 20251225
v1.18:
- 🚀 核心重构：抢购模式由“单号串行”升级为“全账号并发(Concurrent)”。
- ⚡ 双场次适配：全面支持 **10:00** 和 **18:00** 两个秒杀窗口，脚本自动识别时间触发极速模式。
- 🔄 流程优化：新增“统一预登录”阶段，在抢购开始前集中完成Token刷新，确保秒杀时无登录耗时，大幅提升多账号抢购成功率。

v1.17:
- 🚀 新增“智能极速抢购模式”：脚本自动检测系统时间。
- ⚡ 逻辑优化：若在 **09:55 - 10:10** 期间运行，将自动屏蔽签到、阅读、云盘等所有普通任务，**全力执行抢50话费券**，确保不因其他任务耗时而错过秒杀窗口。
- 🕒 日常模式：非抢购时间段（如 19:58）运行，则正常执行全套日常任务。

v1.16:
- 新增功能：集成“抢50话费券”模块，自动检测库存与限流状态。
- 建议配置：请务必添加 9:58 的定时任务以保证命中抢购窗口。

v1.15:
- 代理底层重构：全面支持 HTTP/Socks5 协议切换，自动识别白名单/账号密码模式。
- 修复认证问题：新增账号密码 URL 编码处理，彻底解决因密码含特殊字符导致的 HTTP 407 认证失败。
- 增强稳定性：新增代理连通性测试（访问百度），支持5次重试，失败自动回退本地IP。
- ⚠️ 依赖变更：如需使用 Socks5 模式，必须在青龙面板安装 `socks-proxy-agent` 依赖。

### 20251224
v1.13:
- 修复代理机制：新增代理连通性测试，若代理IP连接失败或超时，自动回退至本地IP执行任务，防止任务全部报错。
- 修复阅读专区：解决模拟阅读(woread_read_process)和抽奖时因变量名错误导致的 `res is not defined` 崩溃问题。
- 优化通知体验：修复权益超市抽奖、阅读专区抽奖成功后未推送通知的问题。
- 流程优化：调整执行逻辑为“本地IP登录 -> 获取代理 -> 执行任务”，提高登录成功率。

### 20251222
v1.12:
- 逻辑重构：将多账号执行模式从“批量登录->批量任务”改为“单账号串行（获取IP->登录->任务）”。
- 修复问题：彻底解决多账号运行时，排在后面的账号因等待时间过长导致代理IP提前过期的问题。

### 20251221
v1.11:
- 新增代理功能：接入品赞代理API，支持多账号独立IP (需配置变量 UNICOM_PROXY_API)。
- 全模式兼容：底层代理实现，完美支持“Token模式”和“账号密码模式”，均可使用独立IP。

v1.10:
- 修复权益超市：修正查库存与抽奖接口(getUserRaffleCountExt)，解决瑞数参数校验问题，恢复自动抽奖。
- 代码瘦身：移除已失效的联通畅游(网页游戏)模块及冗余代码。

### 20251220
v1.09: 
- 移除过时的龟兔赛跑、阅光宝盒等冗余代码。
- 移植Python版阅读逻辑，采用Token加密登录，流程更简洁稳定。

配置说明:
变量名: chinaUnicomCookie
赋值方式有两种:
1. 直接填Token (旧方式):
   export chinaUnicomCookie="a3e4c1ff25da2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
2. 填账号密码 (新方式 - 推荐):
   export chinaUnicomCookie="18600000000#123456"
   (多账号用 & 或 换行 隔开)

代理设置(可选):
export UNICOM_PROXY_API="你的品赞JSON提取链接" (⚠️ 必须含 &format=json)
export UNICOM_PROXY_TYPE="http" (可选 http 或 socks5，默认 http)

⚠️ 依赖安装:
在青龙面板 -> 依赖管理 -> NodeJs 中添加安装:
hpagent
socks-proxy-agent

定时规则建议 (Cron):
58 9,17 * * * 
(说明: 9:58 和 17:58 触发极速抢购模式，19:58 触发全套日常任务)

const $ = new Env("中国联通");
From：yaohuo28507 (Integration by AI, Woread Refactored)
*/
const fs = require('fs');
// const { HttpsProxyAgent } = require('hpagent');
const { HttpsProxyAgent } = require('hpagent');
const { SocksProxyAgent } = require('socks-proxy-agent'); // 新增 Socks5 支持
const crypto = require("crypto"); // 新增：用于账号密码登录的RSA加密
const appName = createLogger("中国联通"),
  got = require("got"),
  path = require("path"),
  {
    exec: execCommand
  } = require("child_process"),
  cryptoJS = require("crypto-js"),
  {
    CookieJar: cookieJar
  } = require("tough-cookie"),
  chinaUnicom = "chinaUnicom",
  delimiters = ["\n", "&", "@"],
  cookieVars = [chinaUnicom + "Cookie"],
  signDisabled = process.env[chinaUnicom + "Sign"] === "false",
  ltzfDisabled = process.env[chinaUnicom + "Ltzf"] === "false",
  requestTimeout = 50000,
  retryCount = 3,
  projectName = "chinaUnicom",
  retryDelay = 5,
  appVersion = "iphone_c@11.0503",
  userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:" + appVersion + "}",  
  productId = "10000002",
  secretKey = "7k1HcDL8RKvc",
  defaultPassword = "woreadst^&*12345",
  secondProductId = "10000006",
  secondSecretKey = "yQsp9gUqv7qX",
  someConstant = "QzUzOUM2QTQ2MTc4",
  ivString = "16-Bytes--String",
  errorCode = "225",
  errorNumber = "225",
  partyName = "party",
  apiKey = "6-WfVldfFrt3zhjHhe6kzwI-XfG5aMCzRTLI_4K7_a0",
  clientId = "73b138fd-250c-4126-94e2-48cbcc8b9cbe",
  anotherClientId = "7cb46449-3b11-4414-bb49-cbd15525fb88",
  maxRetries = "9",
  minRetries = "1",
  serviceLife = "wocareMBHServiceLife1",
  anotherApiKey = "beea1c7edf7c4989b2d3621c4255132f",
  anotherEncryptionKey = "f4cd4ffeb5554586acf65ba7110534f5",
  numbers = "0123456789",
  letters = "qwertyuiopasdfghjklzxcvbnm",
  uuid = process.env[chinaUnicom + "Uuid"] || appName.randomUuid(),
  someArray = [9, 10, 11, 12, 13],
  delayMs = 1000,
  timeoutMs = 5000,
  client_Id = "1001000003",
  ProductId2 = "100002",
  emptyString = "";

// 已清理旧变量
const maskStr = (str) => {
  try {
    let s = String(str);
    if (s.length === 11) {
      return s.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return s;
  } catch (e) {
    return str;
  }
};
const expiration_time = 7,
  appMonth_28_MaxTimes = 5,
  maxDrawTimes = 5;
const activityIds = {
    ttlxj: "TTLXJ20210330",
    card_618: "NZJK618CJHD"
};
// --- 新增下面这行 ---
const GRAB_50_TASK_ID = "42e1f82aaf1b4fd4946070db81e658e6"; 
const constellationMatchingActivity = {
  name: "星座配对",
  id: 2
};
const turntableActivity = {
  name: "大转盘",
  id: 3
};
const blindBoxActivity = {
  name: "盲盒抽奖",
  id: 4
};
const wocareActivities = [constellationMatchingActivity, turntableActivity, blindBoxActivity];
const card618PrizeMap = {
    ZFGJBXXCY1: "空气",
    GJBNZJK19: "[6]",
    GJBNZJK20: "[1]",
    GJBNZJK21: "[8]",
    GJBNZJK22: "[狂]",
    GJBNZJK23: "[欢]"
};
const card618DrawTypeSuffix = {
  "抽奖": "01",
  "首次进入": "02",
  "卡片合成": "03",
  "瓜分奖励": "04"
};

// RSA 公钥，用于密码登录
const LOGIN_PUB_KEY = `-----BEGIN PUBLIC KEY-----\n${"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDc+CZK9bBA9IU+gZUOc6FUGu7yO9WpTNB0PzmgFBh96Mg1WrovD1oqZ+eIF4LjvxKXGOdI79JRdve9NPhQo07+uqGQgE4imwNnRx7PFtCRryiIEcUoavuNtuRVoBAm6qdB0SrctgaqGfLgKvZHOnwTjyNqjBUxzMeQlEC2czEMSwIDAQAB".match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

function UencryptWithCryptoJS(algorithm, mode, padding, plaintext, key, iv) {
  return cryptoJS[algorithm].encrypt(
    cryptoJS.enc.Utf8.parse(plaintext),
    cryptoJS.enc.Utf8.parse(key),
    {
      mode: cryptoJS.mode[mode],
      padding: cryptoJS.pad[padding],
      iv: cryptoJS.enc.Utf8.parse(iv)
    }
  ).ciphertext.toString(cryptoJS.enc.Hex);
}

function decrypt(cipherMethod, mode, padding, ciphertextHex, key, iv) {
  return cryptoJS[cipherMethod].decrypt({
    ciphertext: cryptoJS.enc.Hex.parse(ciphertextHex)
  }, cryptoJS.enc.Utf8.parse(key), {
    mode: cryptoJS.mode[mode],
    padding: cryptoJS.pad[padding],
    iv: cryptoJS.enc.Utf8.parse(iv)
  }).toString(cryptoJS.enc.Utf8);
}

let processCount = 0;
let processState = 0;

/**
 * Initializes process monitoring and sets up termination handling.
 */
function initializeProcessMonitoring() {
  processState = 1;
  process.on("SIGTERM", () => {
    processState = 2;
    process.exit(0);
  });

  const scriptName = path.basename(process.argv[1]);
  const excludedCommands = ["bash", "timeout", "grep"];
  let commandList = ["ps afx"];
  commandList.push(`grep ${scriptName}`);
  commandList = commandList.concat(excludedCommands.map(cmd => `grep -v "${cmd} "`));
  commandList.push("wc -l");

  const commandString = commandList.join("|");

  const checkProcessCount = () => {
    execCommand(commandString, (error, stdout, stderr) => {
      if (error || stderr) {
        return;
      }
      processCount = parseInt(stdout.trim(), 10);
    });

    if (processState === 1) {
      setTimeout(checkProcessCount, 2000);
    }
  };

  checkProcessCount();
}

/**
 * Class for managing user services with HTTP request handling and logging.
 */
class UserService {
  constructor() {
    this.index = appName.userIdx++;
    this.name = "";
    this.valid = false;

    const retryOptions = {
      limit: 0
    };
    const defaultHeaders = {
      Connection: "keep-alive"
    };
    const httpClientOptions = {
      retry: retryOptions,
      timeout: requestTimeout,
      followRedirect: false,
      ignoreInvalidCookies: true,
      headers: defaultHeaders
    };

    this.got = got.extend(httpClientOptions);

    if (processState === 0) {
      initializeProcessMonitoring();
    }
  }

  /**
   * Logs messages with an optional prefix based on user index and name.
   * @param {string} message - The log message.
   * @param {object} options - Additional logging options.
   */
  log(message, options = {}) {
    let logPrefix = "";    
    const userCountLength = appName.userCount.toString().length;
  
    if (this.index) {
      logPrefix += `账号[${appName.padStr(this.index, userCountLength)}]`;
    }
    // 新增一个参数来控制是否显示手机号
    if (this.name && !options.hideName) {
      logPrefix += `[${maskStr(this.name)}]`; // 使用 maskStr 包裹 this.name
    }
  
    appName.log(logPrefix + message, options);
    // 如果需要通知，将日志添加到用户自己的通知数组中
    if (options.notify) {
      this.notifyLogs.push(logPrefix + message);
    }
  }  

  /**
   * Sets a cookie in the cookie jar.
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value of the cookie.
   * @param {string} domain - The domain for the cookie.
   * @param {string} url - The URL for the cookie.
   * @param {object} options - Additional options.
   */
  set_cookie(name, value, domain, url, options = {}) {
    this.cookieJar.setCookieSync(`${name}=${value}; Domain=${domain};`, url);
  }

  /**
   * Makes an HTTP request with retry logic.
   * @param {object} requestOptions - The options for the HTTP request.
   * @returns {Promise<object>} - The result of the HTTP request.
   */
  async request(requestOptions) {
    const networkErrors = ["ECONNRESET", "EADDRINUSE", "ENOTFOUND", "EAI_AGAIN"];
    const timeoutErrors = ["TimeoutError"];
    const protocolErrors = ["EPROTO"];
    const validCodes = [];

    let response = null;
    let attemptCount = 0;
    const requestName = requestOptions.fn || requestOptions.url;

    let validCode = appName.get(requestOptions, "valid_code", validCodes);
    requestOptions.method = requestOptions.method?.toUpperCase() || "GET";

    while (attemptCount < retryCount) {
      try {
        attemptCount++;
        let errorCode = "";
        let errorName = "";
        let error = null;
        const timeout = requestOptions.timeout || this.got.defaults.options.timeout.request || requestTimeout;
        let timeoutOccurred = false;

        await new Promise((resolve) => {
          setTimeout(() => {
            timeoutOccurred = true;
            resolve();
          }, timeout);
          this.got(requestOptions).then(
            (res) => {
              response = res;
            },
            (err) => {
              error = err;
              response = err.response;
              errorCode = error?.code || "";
              errorName = error?.name || "";
            }
          ).finally(() => resolve());
        });

        if (timeoutOccurred) {
          this.log(`[${requestName}] 请求超时(${timeout / 1000}秒)，重试第${attemptCount}次`);
        } else if (protocolErrors.includes(errorCode)) {
          this.log(`[${requestName}] 请求错误[${errorCode}][${errorName}]`);
          if (error?.message) {
            console.log(error.message);
          }
          break;
        } else if (timeoutErrors.includes(errorName)) {
          this.log(`[${requestName}] 请求错误[${errorCode}][${errorName}]，重试第${attemptCount}次`);
        } else if (networkErrors.includes(errorCode)) {
          this.log(`[${requestName}] 请求错误[${errorCode}][${errorName}]，重试第${attemptCount}次`);
        } else {
          const statusCode = response?.statusCode || "";
          const statusCategory = Math.floor(statusCode / 100);

          if (statusCode) {
            if (statusCategory > 3 && !validCode.includes(statusCode)) {
              this.log(`请求[${requestName}] 返回[${statusCode}]`);
            }
            if (statusCategory <= 4) {
              break;
            }
          } else {
            this.log(`请求[${requestName}] 错误[${errorCode}][${errorName}]`);
          }
        }
      } catch (err) {
        if (err.name === "TimeoutError") {
          this.log(`[${requestName}] 请求超时，重试第${attemptCount}次`);
        } else {
          this.log(`[${requestName}] 请求错误(${err.message})，重试第${attemptCount}次`);
        }
      }
    }

    if (response == null) {
      return Promise.resolve({
        statusCode: errorCode || -1,
        headers: null,
        result: null
      });
    }

    let { statusCode, headers, body } = response;
    if (body) {
      try {
        body = JSON.parse(body);
      } catch { }
    }

    const result = {
      statusCode,
      headers,
      result: body
    };

    return Promise.resolve(result);
  }
}

let UserServiceClass = UserService;
try {
  let LocalBasicService = require("./LocalBasic");
  UserServiceClass = LocalBasicService;
} catch { }
let userServiceInstance = new UserServiceClass(appName);
class CustomUserService extends UserServiceClass {
  constructor(tokenString) {
    super(appName);
    this.cookieString = "";
    this.uuid = process.env[chinaUnicom + "Uuid"] || appName.randomUuid();
    
    // 初始化登录信息变量
    this.account_mobile = "";
    this.account_password = "";
    this.token_online = "";

    // 自动判断是 Token 还是 账号#密码
    // Token 通常较长，账号密码相对较短。这里简单通过 # 判断
    if (tokenString.includes("#") && tokenString.length < 64 && !tokenString.startsWith("a3")) {
        const parts = tokenString.split("#");
        this.account_mobile = parts[0];
        this.account_password = parts[1];
        this.name = this.account_mobile; // 初始显示手机号
        this.log(`识别到账号密码模式，准备自动提取Token: ${maskStr(this.account_mobile)}`);
    } else {
        let deftokenParts = tokenString.split("#");
        this.token_online = deftokenParts[0];
    }

    const defaultHeaders = {
      "User-Agent": userAgent
    };
    this.got = this.got.extend({
      headers: defaultHeaders,
      hooks: {
        beforeRequest: [
          (options) => {
            if (this.cookieString) {
              options.headers.cookie = this.cookieString;
            }
          },
        ],
        afterResponse: [
          (response) => {
            const newCookies = response.headers["set-cookie"];
            if (newCookies && Array.isArray(newCookies)) {
              let cookieObj = {};
              if (this.cookieString) {
                this.cookieString.split(";").forEach((pair) => {
                  const parts = pair.split("=");
                  if (parts.length >= 2)
                    cookieObj[parts[0].trim()] = parts.slice(1).join("=").trim();
                });
              }
              newCookies.forEach((str) => {
                const pair = str.split(";")[0];
                const parts = pair.split("=");
                if (parts.length >= 2) {
                  const key = parts[0].trim();
                  const value = parts.slice(1).join("=").trim();
                  cookieObj[key] = value;
                }
              });
              this.cookieString = Object.entries(cookieObj)
                .map(([k, v]) => `${k}=${v}`)
                .join("; ");
            }
            return response;
          },
        ],
      },
    });
    
    this.unicomTokenId = appName.randomString(32);
    this.tokenId_cookie = "chinaunicom-" + appName.randomString(32, numbers + letters).toUpperCase();
    this.rptId = "";
    this.city = [];
    this.t_flmf_task = 0;
    this.t_woread_draw = 0;
    // 尽管新版阅读已移除这些逻辑，但保留变量初始化以防调用旧代码报错
    this.need_read_rabbit = false; 
    this.moonbox_task_record = {};
    
    this.initialTelephoneAmount = null;
    this.notifyLogs = []; // 为每个用户实例添加独立的通知日志数组
    this.moonbox_notified = [];

    // for security butler
    this.sec_ticket1 = "";
    this.sec_token = "";
    this.sec_ticket = "";
    this.sec_jeaId = "";
    this.sec_oldJFPoints = null;

    this.ttxc_token = "";
    this.ttxc_userId = "";

    // for new woread logic
    this.wr_catid = null;
    this.wr_cardid = null;
    this.wr_cntindex = null;
    this.wr_chapterallindex = null;
    this.wr_chapterid = null;

    this.cookieString = `TOKENID_COOKIE=${this.tokenId_cookie}; UNICOM_TOKENID=${this.unicomTokenId}; sdkuuid=${this.unicomTokenId}`;
  }
// === 这里的代码逻辑改为了读取环境变量 ===
// === 修改版：支持 JSON 格式 + 账号密码自动认证 ===
// === 修正版：适配 data.list 结构 ===
async set_proxy_ip() {
    const maxRetries = 5; 
    let currentTry = 0;
    
    // 默认 http，如果环境变量设置了 UNICOM_PROXY_TYPE="socks5" 则切换
    const proxyType = (process.env.UNICOM_PROXY_TYPE || "http").toLowerCase();

    while (currentTry < maxRetries) {
        currentTry++;
        try {
            const apiUrl = process.env.UNICOM_PROXY_API;
            if (!apiUrl) return false;

            if (currentTry > 1) {
                this.log(`🔄 [第${currentTry}次] 重试获取代理IP (${proxyType})...`);
            } else {
                this.log(`正在获取代理IP (模式: ${proxyType})...`);
            }

            // 请求代理API
            const response = await this.got.get(apiUrl, {
                agent: false,
                timeout: 5000,
                responseType: 'json'
            });

            const body = response.body;
            let proxyData = null;

            // 智能识别提取到的数据格式
            if (body.data && body.data.list && body.data.list.length > 0) {
                proxyData = body.data.list[0];
            } else if (body.data && Array.isArray(body.data) && body.data.length > 0) {
                proxyData = body.data[0];
            } else if (Array.isArray(body)) {
                proxyData = body[0];
            }

            if (proxyData && proxyData.ip && proxyData.port) {
                const { ip, port } = proxyData;
                // 兼容不同字段名：user/account, pass/password
                const rawUser = proxyData.account || proxyData.user || ""; 
                const rawPass = proxyData.password || proxyData.pass || "";

                // 【关键优化】对账号密码进行编码，防止特殊字符导致连接失败
                const safeUser = encodeURIComponent(rawUser);
                const safePass = encodeURIComponent(rawPass);

                let proxyUrl = "";
                let newAgent = {};
                let logMsg = "";

                // 根据类型构建代理URL
                if (proxyType === "socks5") {
                    if (rawUser && rawPass) {
                        proxyUrl = `socks5://${safeUser}:${safePass}@${ip}:${port}`;
                        logMsg = `socks5://***:***@${ip}:${port}`;
                    } else {
                        proxyUrl = `socks5://${ip}:${port}`;
                        logMsg = `socks5://${ip}:${port}`;
                    }
                    // Socks5 代理对象
                    // 显式设置超时，防止死等
                    const socksAgent = new SocksProxyAgent(proxyUrl, {
                         timeout: 5000 
                    });
                    newAgent = { http: socksAgent, https: socksAgent };

                } else {
                    // HTTP 代理
                    if (rawUser && rawPass) {
                        proxyUrl = `http://${safeUser}:${safePass}@${ip}:${port}`;
                        logMsg = `http://***:***@${ip}:${port}`;
                    } else {
                        proxyUrl = `http://${ip}:${port}`;
                        logMsg = `http://${ip}:${port}`;
                    }
                    // HTTP 代理对象
                    newAgent = {
                        https: new HttpsProxyAgent({
                            keepAlive: false,
                            proxy: proxyUrl,
                            rejectUnauthorized: false
                        })
                    };
                }

                this.log(`🔍 提取成功: ${logMsg}`);
                
                // 连通性测试 (访问百度，3秒超时)
                try {
                    await this.got.get('https://www.baidu.com', {
                        agent: newAgent,
                        timeout: 3000,
                        retry: 0
                    });

                    // 测试通过，应用代理
                    this.got = this.got.extend({ agent: newAgent });
                    this.log(`✅ 代理连通性测试通过`);
                    return true;

                } catch (testErr) {
                    // 如果白名单没加好，这里通常会报 407 或 socket hang up
                    this.log(`⚠️ 代理测试失败: ${testErr.message} (可能是白名单未生效或IP质量差)`);
                }

            } else {
                const errorMsg = typeof body === 'object' ? JSON.stringify(body) : body;
                this.log(`❌ 提取数据异常: ${errorMsg}`);
            }
        } catch (e) {
            this.log(`❌ 请求代理API异常: ${e.message}`);
        }

        // 失败间隔
        if (currentTry < maxRetries) await appName.wait(2000);
    }

    this.log(`🚫 重试${maxRetries}次均失败，回退至本地IP`);
    return false;
  }

// --- RSA 加密辅助函数 (对应原脚本2的功能) ---
  rsa_encrypt(val) {
    const randomStr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 9)).join('');
    const buffer = Buffer.from(String(val) + randomStr);
    return crypto.publicEncrypt({
        key: LOGIN_PUB_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING
    }, buffer).toString("base64");
  }

  // --- 使用账号密码登录获取 token_online ---
  async unicom_login() {
    this.log(`正在使用账号 ${maskStr(this.account_mobile)} 进行登录...`);
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const reqtime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    try {
        const payload = {
            "version": "iphone_c@12.0100",
            "mobile": this.rsa_encrypt(this.account_mobile),
            "reqtime": reqtime,
            "deviceModel": "iPhone17,2",
            "password": this.rsa_encrypt(this.account_password)
        };

        const requestOptions = {
            fn: "unicom_login",
            method: "post",
            url: "https://m.client.10010.com/mobileService/login.htm",
            headers: {
                "User-Agent": `ChinaUnicom4.x/12.0.1 (com.chinaunicom.mobilebusiness; build:120001; iOS 19.2.0) Alamofire/5.9.1 unicom{version:"iphone_c@12.0100"}`
            },
            form: payload
        };

        let response = await this.request(requestOptions);
        let { result: data, statusCode } = response;

        if (data && (data.code === "0" || data.code === "0000")) {
            if (data.token_online) {
                this.token_online = data.token_online;
                this.log(`✅ 登录成功，获取到 token_online`);
                return true;
            } else {
                this.log(`❌ 登录响应中未找到 token_online`);
                return false;
            }
        } else {
            this.log(`❌ 登录失败: ${data ? data.desc : '无响应'} (Code: ${data ? data.code : statusCode})`);
            return false;
        }

    } catch (e) {
        this.log(`❌ 登录过程异常: ${e.message}`);
        return false;
    }
  }

  get_bizchannelinfo() {
    const bizChannelInfo = {
      bizChannelCode: errorNumber,
      disriBiz: partyName,
      unionSessionId: "",
      stType: "",
      stDesmobile: "",
      source: "",
      rptId: this.rptId,
      ticket: "",
      tongdunTokenId: this.tokenId_cookie,
      xindunTokenId: this.unicomTokenId
    };
    let bizChannelInfoString = JSON.stringify(bizChannelInfo);
    return bizChannelInfoString;
  }

  get_epay_authinfo() {
    const authInfo = {
      mobile: "",
      sessionId: this.sessionId,
      tokenId: this.tokenId,
      userId: ""
    };
    return JSON.stringify(authInfo);
  }

  get_flmf_data(actCode = "welfareCenter") {
    const flmfData = {
      sid: this.flmf_sid,
      actcode: actCode
    };
    return flmfData;
  }

  encode_woread(data, password = defaultPassword) {
    let encryptedData = UencryptWithCryptoJS("AES", "CBC", "Pkcs7", JSON.stringify(data), password, ivString);
    return Buffer.from(encryptedData, "utf-8").toString("base64");
  }
  encode_woread1(data, password = defaultPassword) {
    let encryptedData = UencryptWithCryptoJS("AES", "CBC", "Pkcs7", data, password, ivString);
    return Buffer.from(encryptedData, "utf-8").toString("base64");
  }
  
  // 新增：单字符串加密，用于模拟Python脚本中的参数加密
  encode_woread_str(text, password = defaultPassword) {
    let encryptedData = UencryptWithCryptoJS("AES", "CBC", "Pkcs7", text, password, ivString);
    return Buffer.from(encryptedData, "utf-8").toString("base64");
  }

  get_woread_param() {
    return {
      timestamp: appName.time("yyyyMMddhhmmss"),
      token: this.woread_token,
      userid: this.woread_userid,
      userId: this.woread_userid,
      userIndex: this.woread_userIndex,
      userAccount: this.mobile,
      verifyCode: this.woread_verifycode
    };
  }
  get_woread_m_param() {
    return {
      timestamp: appName.time("yyyyMMddhhmmss"),
      signtimestamp: Date.now(),
      source: maxRetries,
      token: this.woread_token
    };
  }
  get_ltyp_sign_header(secretKey) {
    const currentTime = Date.now();
    const randomSequence = Math.floor(89999 * Math.random()) + 100000;
    const productId = ProductId2;
    const version = emptyString;
    const signature = cryptoJS.MD5(secretKey + currentTime + randomSequence + productId + version).toString();
  
    const header = {
      key: secretKey,
      resTime: currentTime,
      reqSeq: randomSequence,
      channel: productId,
      version: version,
      sign: signature
    };
  
    return header;
  }  
  async onLine(options = {}) {
    // 检查是否需要先登录获取Token
    if (!this.token_online && this.account_mobile && this.account_password) {
        let loginSuccess = await this.unicom_login();
        if (!loginSuccess) {
            this.log("⚠️ 账号密码登录失败，无法继续执行 onLine");
            return false;
        }
    }

    let loginSuccess = false;
    // const filePath = path.join(__dirname, 'chinaUnicom_cache.json');
  
    try {
      const androidVersion = "android@11.0000";
      const deviceId = this.uuid ;

      let requestOptions = {
        fn: "onLine",
        method: "post",
        url: "https://m.client.10010.com/mobileService/onLine.htm",
        headers: {
          'User-Agent': `Dalvik/2.1.0 (Linux; U; Android 9; ALN-AL10 Build/PQ3A.190705.11211540);unicom{version:${androidVersion}}`
        },
        form: {
          isFirstInstall: '1',
          netWay: 'Wifi',
          version: androidVersion,
       // deviceId: deviceId,
          token_online: this.token_online,
          provinceChanel: 'general',          
          deviceModel: 'ALN-AL10',
          step: 'dingshi',
          androidId: '291a7deb1d716b5a',
          reqtime: Date.now(),
        }
      };
  
      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
  
      if (responseCode == 0) {
        loginSuccess = true;
        this.valid = true;
        this.mobile = responseData?.["desmobile"];
        this.name = responseData?.["desmobile"];
        this.ecs_token = responseData?.["ecs_token"];
        this.city = responseData?.["list"];
        this.log("登录成功");
  
      } else {
        this.valid = false;
        this.log("登录失败[" + responseCode + "]");
        // 如果是因为Token失效且配置了密码，尝试重新登录（可选优化）
      }
    } catch (error) {
      console.log(error);
      this.log("发生异常：" + error.message);
    } finally {
      return loginSuccess;
    }
  }

// ============================================
  // 权益超市 NEW LOGIC
  // ============================================

  async get_ticket(ecs_token) {
    this.log("权益超市: 正在获取 ticket...");
    try {
      const requestOptions = {
        fn: "get_ticket",
        method: "get",
        url: "https://m.client.10010.com/mobileService/openPlatform/openPlatLineNew.htm?to_url=https://contact.bol.wo.cn/market",
        headers: {
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
            'Cookie': `ecs_token=${ecs_token}`
        },
        followRedirect: false // Important: we need to capture the 302 redirect
      };
      const { headers, statusCode } = await this.request(requestOptions);
      if (statusCode === 302 && headers?.location) {
        const locationUrl = new URL(headers.location);
        const ticket = locationUrl.searchParams.get("ticket");
        if (ticket) {
          this.log("权益超市: 获取ticket成功");
          return ticket;
        }
      }
      this.log(`权益超市: 获取ticket失败, status: ${statusCode}`);
      return null;
    } catch (e) {
      this.log(`权益超市: 获取ticket异常: ${e.message}`);
      return null;
    }
  }

  async get_userToken(ticket) {
    this.log("权益超市: 正在获取 userToken...");
    try {
      const requestOptions = {
        fn: "get_userToken",
        method: "post",
        url: `https://backward.bol.wo.cn/prod-api/auth/marketUnicomLogin?ticket=${ticket}`,
        headers: {
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
          'Connection': "Keep-Alive",
          'Accept-Encoding': "gzip",
        }
      };
      const { result, statusCode } = await this.request(requestOptions);
      if (result?.code === 200) {
        const userToken = result?.data?.token;
        if (userToken) {
          this.log("权益超市: 获取userToken成功");
          return userToken;
        }
      }
      this.log(`权益超市: 获取userToken失败: ${result?.msg || '返回数据异常'}`);
      return null;
    } catch (e) {
      this.log(`权益超市: 获取userToken异常: ${e.message}`);
      return null;
    }
  }

  async get_AllActivityTasks(ecs_token, userToken) {
    this.log("权益超市: 正在获取任务列表...");
    try {
        const requestOptions = {
            fn: "getAllActivityTasks",
            method: "get",
            url: "https://backward.bol.wo.cn/prod-api/promotion/activityTask/getAllActivityTasks?activityId=12",
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Authorization': `Bearer ${userToken}`,
                'Cookie': `ecs_token=${ecs_token}`
            }
        };
        const { result } = await this.request(requestOptions);
        if (result?.code === 200) {
            const tasks = result?.data?.activityTaskUserDetailVOList || [];
            this.log(`权益超市: 成功获取到 ${tasks.length} 个任务`);
            return tasks;
        }
        this.log(`权益超市: 查询任务列表失败: ${result?.msg || '未知错误'}`);
        return [];
    } catch (e) {
        this.log(`权益超市: 查询任务列表异常: ${e.message}`);
        return [];
    }
  }

  async do_ShareList(shareList, userToken) {
    this.log("权益超市: 开始执行任务...");
    for (const task of shareList) {
        const { name, param1: param, triggerTime, triggeredTime } = task;
        if (name.includes("购买") || name.includes("秒杀")) {
            this.log(`权益超市: 🚫 ${name} [跳过]`);
            continue;
        }
        if (triggeredTime >= triggerTime) {
            this.log(`权益超市: ✅ ${name} [已完成]`);
            continue;
        }

        let url = "";
        if (name.includes("浏览") || name.includes("查看")) {
            url = `https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkView?checkKey=${param}`;
        } else if (name.includes("分享")) {
            url = `https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkShare?checkKey=${param}`;
        }

        if (url) {
            try {
                const requestOptions = {
                    fn: `do_task_${name}`,
                    method: "post",
                    url: url,
                    headers: {
                        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                        'Authorization': `Bearer ${userToken}`,
                    }
                };
                const { result } = await this.request(requestOptions);
                if (result?.code === 200) {
                    this.log(`权益超市: ✅ ${name} [执行成功]`);
                } else {
                    this.log(`权益超市: ❌ ${name} [执行失败]: ${result?.msg}`);
                }
            } catch (e) {
                this.log(`权益超市: ❌ ${name} [执行异常]: ${e.message}`);
            }
        }
        await appName.wait(2000 + Math.random() * 2000);
    }
  }

// ============================================
  // 权益超市 修复版 (By AI)
  // 修复说明：
  // 1. 修正查次数接口为 getUserRaffleCountExt
  // 2. 移除无效的AES/瑞数参数，直接使用明文 ?id=12
  // ============================================

  async get_Raffle(userToken) {
    this.log("权益超市: 正在查询奖品池...");
    try {
        const requestOptions = {
            fn: "get_Raffle",
            method: "post",
            // 保持原样，强制带上 id=12
            url: "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/prizeList?id=12",
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Authorization': `Bearer ${userToken}`
            }
        };
        const { result } = await this.request(requestOptions);
        if (result?.code === 200 && Array.isArray(result.data)) {
            const keywords = ['月卡', '月会员', '月度', 'VIP月', '一个月'];
            const livePrizes = result.data.filter(prize => 
                keywords.some(kw => prize.name.includes(kw)) &&
                parseInt(prize.dailyPrizeLimit, 10) > 0 &&
                parseInt(prize.quantity, 10) > 0
            );

            if (livePrizes.length > 0) {
                this.log("权益超市: 📢 当前已放水！可抽有库存奖品👇👇👇");
                livePrizes.forEach(item => {
                    this.log(`    - ${item.name} (日库存:${item.dailyPrizeLimit}, 总库存:${item.quantity}, 概率:${(item.probability * 100).toFixed(1)}%)`);
                });
                return true;
            }
        }
        this.log("权益超市: 📢 当前未放水或查询失败！终止抽奖");
        return false; // 如果你想强制抽奖，可以把这里改为 true
    } catch (e) {
        this.log(`权益超市: 查询奖品池异常: ${e.message}`);
        return false;
    }
  }

async get_raffle_count(userToken) {
    this.log("权益超市: 正在查询抽奖次数...");
    try {
        const requestOptions = {
            fn: "get_raffle_count",
            method: "post",
            url: "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getUserRaffleCountExt?id=12",
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Authorization': `Bearer ${userToken}`
            }
        };
        const { result } = await this.request(requestOptions);
        
        let count = 0;
        if (result?.code === 200) {
            // 【关键修复】兼容对象格式，提取 raffleCount
            if (typeof result.data === 'object' && result.data !== null && result.data.raffleCount !== undefined) {
                count = parseInt(result.data.raffleCount) || 0;
            } else {
                // 兼容旧格式直接返回数字
                count = parseInt(result.data) || 0;
            }
        }

        if (count > 0) {
            this.log(`权益超市: ✅ 当前抽奖次数: ${count}`);
            for (let i = 0; i < count; i++) {
                this.log(`权益超市: 🎯 第 ${i + 1} 次抽奖...`);
                const success = await this.get_userRaffle(userToken);
                if (!success) {
                    this.log("权益超市: 抽奖失败或遇到验证, 停止后续抽奖");
                    break;
                }
                await appName.wait(3000 + Math.random() * 2000);
            }
        } else {
            // 只有当 count 真的为 0 时才打印这个，避免日志刷屏
            this.log(`权益超市: 当前无抽奖次数`);
        }
    } catch (e) {
        this.log(`权益超市: 查询抽奖次数异常: ${e.message}`);
    }
  }

  async get_userRaffle(userToken) {
    try {
        const requestOptions = {
            fn: "get_userRaffle",
            method: "post",
            // 保持 id=12
            url: "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/userRaffle?id=12&channel=",
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Authorization': `Bearer ${userToken}`
            }
        };
        const { result } = await this.request(requestOptions);
        if (result?.code === 200 && result?.data) {
            const { lotteryRecordId, prizesName, message } = result.data;
            if (prizesName) {
                // 【修复】添加 notify: true 以推送到通知
                this.log(`权益超市: ✅ 抽奖成功: ${prizesName}`, { notify: true });
            } else {
                this.log(`权益超市: ⚠️ 抽奖成功, 但: ${message}`);
            }
            if (lotteryRecordId) { 
                this.log(`权益超市:  尝试领取：${prizesName}`);
                await this.get_grantPrize(userToken, lotteryRecordId, prizesName || '未知奖品');
            }
            return true;
        } else if (result?.code === 500) {
            // 有时候 500 可能是因为没传参数，但也可能是人机验证，保留原有逻辑
            this.log(`权益超市: 抽奖请求失败 (Code 500): ${result?.msg}`);
            if (result?.msg?.includes("验证")) {
                 return await this.get_validateCaptcha(userToken);
            }
            return false;
        } else {
            this.log(`权益超市: 抽奖失败: ${result?.msg || '未知错误'}`);
            return false;
        }
    } catch (e) {
        this.log(`权益超市: 抽奖异常: ${e.message}`);
        return false;
    }
  }

  async get_validateCaptcha(userToken) {
    try {
        const requestOptions = {
            fn: "get_validateCaptcha",
            method: "post",
            url: "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/validateCaptcha?id=12",
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Authorization': `Bearer ${userToken}`
            }
        };
        const { result } = await this.request(requestOptions);
        if (result?.code === 200) {
            this.log("权益超市: 人机验证成功, 重新抽奖...");
            return await this.get_userRaffle(userToken);
        }
        this.log(`权益超市: 人机验证失败: ${result?.msg}`);
        return false;
    } catch (e) {
        this.log(`权益超市: 人机验证异常: ${e.message}`);
        return false;
    }
  }

async queryGeneralPrizes(userToken) {
    this.log("权益超市: 正在查询待领取奖品...");
    if (!userToken) {
        this.log("权益超市-查通用奖品: userToken not found, skipping.");
        return;
    }
    // 'this.mobile' is available after a successful onLine.htm call.
    if (!this.mobile) {
        this.log("权益超市-查待领取奖品: 手机号未找到, 跳过.");
        return;
    }

    try {
        const requestBody = {
            "isReceive": "0",
            "receiveStatus": "0",
            "limit": 20,
            "page": 1,
            "mobile": this.mobile,
            "businessSources": ["3", "4", "5", "6", "99"],
            "isPromotion": 1,
            "returnFormatType": 1
        };

        const requestOptions = {
            fn: "queryGeneralPrizes",
            method: "post",
            url: `https://backward.bol.wo.cn/prod-api/market/contactReceive/queryReceiveRecord`,
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Content-Type': 'application/json'
            },
            json: requestBody
        };

        const { result } = await this.request(requestOptions);

        if (result?.code !== 200) {
            this.log(`权益超市-查待领取奖品: 查询失败: ${result?.msg || '未知错误'}`);
            return;
        }

        const prizes = result.data?.recordObjs || [];
        const now = new Date();
        
        const claimablePrizes = prizes.filter(prize => {
            if (!prize.receiveEndTime) return false;
            const endTime = new Date(prize.receiveEndTime.replace(/-/g, "/"));
            return endTime > now;
        });

        if (claimablePrizes.length > 0) {
            this.log(`权益超市: 查询到 ${claimablePrizes.length} 个可领取奖品:`, { notify: true });
            for (const prize of claimablePrizes) {
                this.log(`    - ${prize.recordName} (截止: ${prize.receiveEndTime})`);
                if (prize.businessId) {
                    await this.grantGeneralPrize(userToken, prize);
                    await appName.wait(1500 + Math.random() * 1000);
                } else {
                    this.log(`    └─ 缺少 businessId, 无法自动领取.`);
                }
            }
        } else {
            this.log("权益超市: 未发现可领取的奖品。");
        }

    } catch (e) {
        this.log(`权益超市-查待领取奖品: 任务异常: ${e.message}`);
    }
  }

  async grantGeneralPrize(userToken, prize) {
    this.log(`权益超市: └─ 尝试领取: ${prize.recordName}`);
    try {
        const requestOptions = {
            fn: "grantGeneralPrize",
            method: "post",
            url: "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/grantPrize",
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Content-Type': 'application/json'
            },
            json: { "recordId": prize.businessId } // Using businessId as recordId
        };
        const { result } = await this.request(requestOptions);
        if (result?.code === 200) {
            // 【修复】把奖品名字传进来或者简单通知，这里简单加上通知标记
            this.log(`权益超市:    └─ ✅ [领取成功]: ${prize.recordName}`, { notify: true });
        } else {
            this.log(`权益超市:    └─ ❌ [领取失败]: ${result?.msg}`);
        }
    } catch (e) {
        this.log(`权益超市:    └─ 领取通用奖品 ${prize.recordName} 异常: ${e.message}`);
    }
  }
  
  async get_grantPrize(userToken, lotteryRecordId, prizesName) {
    try {
        const requestOptions = {
            fn: "get_grantPrize",
            method: "post",
            url: "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/grantPrize?activityId=12",
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            },
            json: { "recordId": lotteryRecordId }
        };
        const { result } = await this.request(requestOptions);
        if (result?.code === 200) {
            this.log(`权益超市: ✅ ${prizesName} [领取成功]`);
        } else {
            this.log(`权益超市: ❌ ${prizesName} [领取失败]: ${result?.msg}`);
        }
    } catch (e) {
        this.log(`权益超市: 领取奖品异常: ${e.message}`);
    }
  }

  async marketWateringTask(userToken) {
    this.log("权益超市: 浇花任务开始...");
    if (!userToken) {
        this.log("权益超市-浇花: userToken not found, skipping.");
        return;
    }

    try {
        // 1. Get watering status
        const statusOptions = {
            fn: "marketGetWateringStatus",
            method: "get",
            url: `https://backward.bol.wo.cn/prod-api/promotion/activityTask/getMultiCycleProcess?activityId=13`,
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
            }
        };
        const { result: statusResult } = await this.request(statusOptions);

        if (statusResult?.code !== 200) {
            this.log(`权益超市-浇花: 获取状态失败: ${statusResult?.msg || '未知错误'}`);
            return;
        }

        const { triggeredTime, triggerTime, createDate } = statusResult.data;
        this.log(`权益超市-浇花: 当前进度 ${triggeredTime}/${triggerTime}`, { notify: true });

        // 2. Conditional logic
        if (triggeredTime >= triggerTime) {
            this.log("权益超市-浇花: 🌟 您有鲜花权益待领取! (连续浇花已满) 🌟", { notify: true });
            return;
        }

        // Check if watered today
        const todayStr = new Date(new Date().getTime() + 8 * 3600 * 1000).toISOString().split('T')[0];
        const lastWateredDateStr = createDate ? createDate.split(' ')[0] : '';
        
        if (todayStr === lastWateredDateStr) {
            this.log(`权益超市-浇花: 今日已浇水 (最后浇水时间: ${createDate})`, { notify: true });
            return;
        }

        this.log("权益超市-浇花: 今日未浇水，执行浇水操作...");

        // 3. Perform watering
        const waterOptions = {
            fn: "marketWatering",
            method: "post",
            url: "https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkWatering",
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}',
                'Content-Type': 'application/json'
            },
            json: {}
        };
        const { result: waterResult } = await this.request(waterOptions);

        if (waterResult?.code === 200) {
            this.log("权益超市-浇花: ✅ 浇水成功!");
        } else {
            this.log(`权益超市-浇花: ❌ 浇水失败: ${waterResult?.msg || '未知错误'}`);
        }

    } catch (e) {
        this.log(`权益超市-浇花: 任务异常: ${e.message}`);
    }
  }

  async marketTask() {
    this.log("============= 权益超市 =============");

    // The main `task` function already calls `await user.onLine()`.
    // So when `marketTask` is called, `this.ecs_token` should be available.
    const ecs_token = this.ecs_token;
    
    if (!ecs_token) {
        this.log("权益超市: ❌ 未获取到 ecs_token, 跳过任务");
        this.log("============= 权益超市执行完毕 =============");
        return;
    }
    
    // 1. Get ticket
    const ticket = await this.get_ticket(ecs_token);
    if (!ticket) {
        this.log("============= 权益超市执行完毕 =============");
        return;
    }
    
    // 2. Get userToken
    const userToken = await this.get_userToken(ticket);
    if (!userToken) {
        this.log("============= 权益超市执行完毕 =============");
        return;
    }

    // New: Execute watering task
    await this.marketWateringTask(userToken);
    await appName.wait(2000);
    
    // 3. Get and do tasks
    const shareList = await this.get_AllActivityTasks(ecs_token, userToken);
    if (shareList && shareList.length > 0) {
        await this.do_ShareList(shareList, userToken);
    }
    
    // 4. Check raffle and draw
    const canRaffle = await this.get_Raffle(userToken);
    if (canRaffle) {
        await this.get_raffle_count(userToken);
    }
    
    // 5. Query and claim prizes
    // await this.get_MyPrize(userToken); // For raffle prizes
    await this.queryGeneralPrizes(userToken); // For general prizes
    
    this.log("============= 权益超市执行完毕 =============");
  }

  
  async openPlatLineNew(url, options = {}) {
    const defaultResult = {
      ticket: "",
      type: "",
      loc: ""
    };
  
    let result = defaultResult;
  
    try {
      const queryParams = {
        to_url: url
      };
      const requestOptions = {
        fn: "openPlatLineNew",
        method: "get",
        url: "https://m.client.10010.com/mobileService/openPlatform/openPlatLineNew.htm",
        searchParams: queryParams
      };
  
      const { headers, statusCode } = await this.request(requestOptions);
  
      if (headers?.["location"]) {
        const locationUrl = new URL(headers.location);
        const type = locationUrl.searchParams.get("type") || "02";
        const ticket = locationUrl.searchParams.get("ticket");
  
        if (!ticket) {
          this.log("获取ticket失败");
        }
  
        result = {
          loc: headers.location,
          ticket: ticket,
          type: type
        };
      } else {
        this.log(`获取ticket失败[${statusCode}]`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      return result;
    }
  }  
  async gettaskip(options = {}) {
    const orderId = appName.randomString(32).toUpperCase();
  
    try {
      const requestBody = {
        mobile: this.mobile,
        orderId: orderId
      };
  
      const requestOptions = {
        fn: "gettaskip",
        method: "post",
        url: "https://m.client.10010.com/taskcallback/topstories/gettaskip",
        form: requestBody
      };
  
      await this.request(requestOptions);
    } catch (error) {
      console.log(error);
    } finally {
      return orderId;
    }
  }  
  async draw_28_queryChance(options = {}) {
    try {
      const requestConfig = {
        fn: "draw_28_queryChance",
        method: "post",
        url: "https://m.client.10010.com/AppMonthly/appMonth/queryChance"
      };

      let {
        result: responseResult,
        statusCode: responseStatusCode
      } = await this.request(requestConfig),
        status = appName.get(responseResult, "status", responseStatusCode);

      if (status == "0000") {
        let remainingTimes = parseInt(responseResult?.["data"]?.["allRemainTimes"] || 0),
          drawTimes = Math.min(maxDrawTimes, remainingTimes);

        this.log("28日五折日可以抽奖" + remainingTimes + "次, 去抽" + drawTimes + "次");

        let isFirstAttempt = false;
        while (drawTimes-- > 0) {
          if (isFirstAttempt) {
            await appName.wait(8000);
          }
          isFirstAttempt = true;
          await this.draw_28_lottery();
        }
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("28日五折日查询抽奖次数失败[" + status + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async draw_28_lottery(options = {}) {
    try {
      const requestOptions = {
        fn: "draw_28_lottery",
        method: "post",
        url: "https://m.client.10010.com/AppMonthly/appMonth/lottery"
      };
  
      const { result: responseResult, statusCode: responseStatusCode } = await this.request(requestOptions);
      const status = appName.get(responseResult, "status", responseStatusCode);
  
      if (status === "0000") {
        const data = responseResult?.["data"];
        const code = appName.get(data, "code", -1);
  
        if (data?.["uuid"]) {
          await appName.wait(2000);
          await this.draw_28_winningRecord(data.uuid);
        } else {
          const errorMessage = data?.["message"] || data?.["msg"] || "";
          this.log(`28日五折日抽奖失败[${code}]: ${errorMessage}`);
        }
      } else {
        const errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log(`28日五折日抽奖失败[${status}]: ${errorMessage}`);
      }
    } catch (error) {
      console.log(error);
    }
  }  
  async draw_28_winningRecord(requestId, options = {}) {
    try {
      const requestPayload = {
        requestId: requestId
      };
  
      const requestOptions = {
        fn: "draw_28_winningRecord",
        method: "post",
        url: "https://m.client.10010.com/AppMonthly/appMonth/winningRecord",
        form: requestPayload
      };
  
      const { result, statusCode } = await this.request(requestOptions);
      const status = appName.get(result, "status", statusCode);
  
      if (status === "0000") {
        const responseData = result?.["data"];
        const resultCode = appName.get(responseData, "code", -1);
  
        if (resultCode === "0000") {
          const logOptions = {
            notify: true
          };
          this.log("28日五折日抽奖: " + responseData?.["prizeName"]?.replace(/\t/g, ""), logOptions);
        } else {
          const errorMessage = responseData?.["message"] || responseData?.["msg"] || "";
          this.log(`查询28日五折日抽奖结果失败[${resultCode}]: ${errorMessage}`);
        }
      } else {
        const errorMessage = result?.["message"] || result?.["msg"] || "";
        this.log(`查询28日五折日抽奖结果失败[${status}]: ${errorMessage}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async ttlxj_authorize(ticket, type, refererUrl, options = {}) {
    try {
      const requestConfig = {
        fn: "ttlxj_authorize",
        method: "post",
        url: "https://epay.10010.com/woauth2/v2/authorize",
        headers: {
          Origin: "https://epay.10010.com",
          Referer: refererUrl
        },
        json: {
          response_type: "rptid",
          client_id: clientId,
          redirect_uri: "https://epay.10010.com/ci-mps-st-web/",
          login_hint: {
            credential_type: "st_ticket",
            credential: ticket,
            st_type: type,
            force_logout: true,
            source: "app_sjyyt"
          },
          device_info: {
            token_id: "chinaunicom-pro-" + Date.now() + "-" + appName.randomString(13),
            trace_id: appName.randomString(32)
          }
        }
      };
  
      const { result } = await this.request(requestConfig);
      const statusCode = appName.get(result, "status", -1);
  
      if (statusCode === 200) {
        await this.ttlxj_authCheck();
      } else {
        const errorMessage = result?.["message"] || result?.["msg"] || "";
        this.log(`天天领现金获取SESSION失败[${statusCode}]: ${errorMessage}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async ttlxj_authCheck(options = {}) {
    try {
      const requestConfig = {
        fn: "ttlxj_authCheck",
        method: "post",
        url: "https://epay.10010.com/ps-pafs-auth-front/v1/auth/check",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo()
        }
      };
  
      const { result } = await this.request(requestConfig);
      const responseCode = appName.get(result, "code", -1);
  
      if (responseCode === "0000") {
        const { mobile, sessionId, tokenId, userId } = result?.["data"]?.["authInfo"];
        const authInfo = {
          sessionId,
          tokenId,
          userId
        };
        Object.assign(this, authInfo);
  
        await this.ttlxj_userDrawInfo();
        await this.ttlxj_queryAvailable();
      } else {
        if (responseCode === "2101000100") {
          const loginUrl = result?.["data"]?.["woauth_login_url"];
          await this.ttlxj_login(loginUrl);
        } else {
          const errorMessage = result?.["msgInside"] || result?.["msg"] || "";
          this.log(`天天领现金获取tokenId失败[${responseCode}]: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async ttlxj_login(loginUrl, options = {}) {
    try {
      const fullUrl = `${loginUrl}https://epay.10010.com/ci-mcss-party-web/clockIn/?bizFrom=${errorCode}&bizChannelCode=${errorNumber}`;
  
      const requestConfig = {
        fn: "ttlxj_login",
        method: "get",
        url: fullUrl
      };
  
      const { headers, statusCode } = await this.request(requestConfig);
  
      if (headers?.["location"]) {
        const locationUrl = new URL(headers.location);
        this.rptId = locationUrl.searchParams.get("rptid");
        if (this.rptId) {
          await this.ttlxj_authCheck();
        } else {
          this.log("天天领现金获取rptid失败");
        }
      } else {
        this.log(`天天领现金获取rptid失败[${statusCode}]`);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async ttlxj_userDrawInfo(options = {}) {
    try {
      const requestConfig = {
        fn: "ttlxj_userDrawInfo",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/userDrawInfo",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        }
      };
  
      const { result } = await this.request(requestConfig);
      const responseCode = appName.get(result, "code", -1);
  
      if (responseCode === "0000") {
        const dayOfWeek = result?.["data"]?.["dayOfWeek"];
        const drawKey = `day${dayOfWeek}`;
        const hasNotClockedIn = result?.["data"]?.[drawKey] === "1";
  
        const logOptions = {
          notify: true
        };
  
        this.log(`天天领现金: 今天${hasNotClockedIn ? "未" : "已"}打卡`, logOptions);
  
        if (hasNotClockedIn) {
          const today = new Date().getDay();
          const drawType = (today % 7 === 0) ? "C" : "B";
          await this.ttlxj_unifyDrawNew(drawType);
        }
      } else {
        const errorMessage = result?.["msg"] || "";
        this.log(`天天领现金: 查询失败[${responseCode}]: ${errorMessage}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async ttlxj_unifyDrawNew(drawType, options = {}) {
    try {
      const requestData = {
        drawType: drawType,
        bizFrom: errorCode,
        activityId: "TTLXJ20210330"
      };
  
      const requestConfig = {
        fn: "ttlxj_unifyDrawNew",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/unifyDrawNew",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: requestData
      };
  
      const { result } = await this.request(requestConfig);
      const responseCode = appName.get(result, "code", -1);
  
      if (responseCode === "0000" && result?.["data"]?.["returnCode"] === 0) {
        const awardMessage = result?.["data"]?.["awardTipContent"]?.replace(/xx/, result?.["data"]?.["amount"]);
        const logOptions = {
          notify: true
        };
        this.log("天天领现金: 打卡 " + awardMessage, logOptions);
      } else {
        const errorMessage = result?.["data"]?.["returnMsg"] || result?.["msg"] || "";
        this.log(`天天领现金: 打卡失败[${result?.["data"]?.["returnCode"] || responseCode}]: ${errorMessage}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async ttlxj_help(options = {}) {
    try {
      const requestBody = {
        bizFrom: errorCode,
        activityId: activityIds.ttlxj,
        uid: apiKey
      };
      let requestConfig = {
        fn: "ttlxj_h",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/help",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: requestBody
      };
      await this.request(requestConfig);
    } catch (error) {
      console.log(error);
    }
  }
  async ttlxj_queryAvailable(options = {}) {
    try {
      let requestConfig = {
        fn: "ttlxj_queryAvailable",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/queryAvailable",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        }
      };
      let {
        result: responseResult
      } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000" && responseResult?.["data"]?.["returnCode"] == 0) {
        let availableAmount = responseResult?.["data"]?.["availableAmount"] || 0;
        let logMessage = `天天领现金: 可用立减金: ${(availableAmount / 100).toFixed(2)}元`;
        let expiringPrizes = [];
        let currentTime = Date.now();
        for (let prize of responseResult?.["data"]?.["prizeList"]?.filter(p => p.status == "A")) {
          let endTimeStr = prize.endTime;
          let endTimeDate = new Date(endTimeStr.slice(0, 4) + "-" + endTimeStr.slice(4, 6) + "-" + endTimeStr.slice(6, 8) + " 00:00:00");
          let endTimeMs = endTimeDate.getTime();
          if (endTimeMs - currentTime < expiration_time * 24 * 60 * 60 * 1000) {
            let formattedDate = appName.time("yyyy-MM-dd", endTimeMs);
            const expiringPrize = {
              timestamp: endTimeMs,
              date: formattedDate,
              amount: prize.amount
            };
            expiringPrizes.push(expiringPrize);
          }
        }
        if (expiringPrizes.length) {
          const defaultPrize = {
            timestamp: 0,
            amount: 0
          };
          let earliestExpiringPrize = defaultPrize;
          let totalExpiringAmount = expiringPrizes.reduce(function (total, currentPrize) {
            if (earliestExpiringPrize.timestamp == 0 || currentPrize.timestamp < earliestExpiringPrize.timestamp) {
                earliestExpiringPrize = currentPrize;
            }
            return total + parseFloat(currentPrize.amount);
            }, 0);
          logMessage += `, ${expiration_time}天内过期立减金: ${totalExpiringAmount.toFixed(2)}元`;
          logMessage += `, 最早过期立减金: ${earliestExpiringPrize.amount}元 -- ${earliestExpiringPrize.date}过期`;
        } else {
            logMessage += `, ${expiration_time}天内没有过期的立减金`;
        }
        this.log(logMessage, { notify: true });
      } else {
        let errorMessage = responseResult?.["data"]?.["returnMsg"] || responseResult?.["msg"] || "";
        this.log("天天领现金: 查询可用立减金失败[" + (responseResult?.["data"]?.["returnCode"] || responseCode) + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }

async epay_28_authCheck(options = {}) {
    try {
      let requestConfig = {
        fn: "epay_28_authCheck",
        method: "post",
        url: "https://epay.10010.com/ps-pafs-auth-front/v1/auth/check",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo()
        }
      };
      let {
        result: responseResult
      } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000") {
        let {
          mobile: mobile,
          sessionId: sessionId,
          tokenId: tokenId,
          userId: userId
        } = responseResult?.["data"]?.["authInfo"];
        const authInfo = {
          sessionId: sessionId,
          tokenId: tokenId,
          userId: userId
        };
        Object.assign(this, authInfo);
        await this.epay_28_queryUserPage();
      } else {
        if (responseCode == "2101000100") {
          let loginUrl = responseResult?.["data"]?.["woauth_login_url"];
          await this.epay_28_login(loginUrl);
        } else {
          let errorMessage = responseResult?.["msgInside"] || responseResult?.["msg"] || "";
          this.log("联通支付日获取tokenId失败[" + responseCode + "]: " + errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  async epay_28_login(loginUrl, options = {}) {
    try {
      let templateName = appName.time("yyyyMM") + "28ZFR";
      loginUrl += "https://epay.10010.com/ci-mcss-party-web/rainbow/?templateName=" + templateName + "&bizFrom=225&bizChannelCode=225&channelType=WDQB";
      const requestConfig = {
        fn: "epay_28_login",
        method: "get",
        url: loginUrl
      };
      let {
        headers: headers,
        statusCode: statusCode
      } = await this.request(requestConfig);
      if (headers?.["location"]) {
        let locationUrl = new URL(headers.location);
        this.rptId = locationUrl.searchParams.get("rptid");
        this.rptId ? await this.epay_28_authCheck() : this.log("联通支付日获取rptid失败");
      } else {
        this.log("联通支付日获取rptid失败[" + statusCode + "]");
      }
    } catch (error) {
      console.log(error);
    }
  }
  async epay_28_queryUserPage(options = {}) {
    try {
      let templateName = appName.time("yyyyMM") + "28ZFR";
      const requestBody = {
        templateName: templateName
      };
      let requestConfig = {
        fn: "epay_28_queryUserPage",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/queryUserPage",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: requestBody
      };
      let {
        result: responseResult
      } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000" && responseResult?.["data"]?.["returnCode"] == 0) {
        for (let prizeInfo of responseResult?.["data"]?.["prizeList"]?.["rainbowMouldInfos"] || []) {
          prizeInfo?.["rainbowUnitInfos"]?.[0]?.["unitActivityId"] && (await this.epay_28_unifyDraw(prizeInfo.rainbowUnitInfos[0]));
          if (prizeInfo?.["day01DrawParam"]) {
            await this.epay_28_queryMiddleUnit(templateName, prizeInfo.mouldName);
            break;
          }
        }
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("联通支付日进入主页失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async epay_28_queryMiddleUnit(activityId, mouldName, options = {}) {
    try {
      const requestBody = {
        activityId: activityId,
        mouldName: mouldName
      };
      let requestConfig = {
        fn: "epay_28_queryMiddleUnit",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/queryMiddleUnit",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: requestBody
      };
      let {
        result: responseResult
      } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000") {
        let currentDay = appName.time("dd");
        responseResult?.["data"]?.[currentDay] == "1" ? this.log("联通支付日今日(" + currentDay + "号)已打卡") : await this.epay_28_unifyDrawNew(activityId, mouldName);
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("联通支付日查询打卡失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async epay_28_unifyDrawNew(activityId, mouldName, options = {}) {
    try {
      const requestBody = {
        bizFrom: errorCode,
        activityId: activityId,
        mouldName: mouldName
      };
      let requestConfig = {
        fn: "epay_28_unifyDrawNew",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/unifyDrawNew",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: requestBody
      };
      let {
        result: responseResult
      } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000" && responseResult?.["data"]?.["returnCode"] == 0) {
        let awardMessage = responseResult?.["data"]?.["awardTipContent"]?.replace(/xx/, responseResult?.["data"]?.["amount"]);
        const notifyOptions = {
          notify: true
        };
        this.log("联通支付日打卡:" + awardMessage, notifyOptions);
      } else {
        let errorMessage = responseResult?.["data"]?.["returnMsg"] || responseResult?.["msg"] || "";
        this.log("联通支付日打卡失败[" + (responseResult?.["data"]?.["returnCode"] || responseCode) + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async epay_28_unifyDraw(unitInfo, options = {}) {
    try {
      const requestBody = {
        activityId: unitInfo.unitActivityId,
        isBigActivity: unitInfo.isBigActivity,
        bigActivityId: unitInfo.bigActivityId,
        bizFrom: errorCode
      };
      let requestConfig = {
        fn: "epay_28_unifyDraw",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/unifyDraw",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: requestBody
      };
      let {
        result: responseResult
      } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000" && responseResult?.["data"]?.["returnCode"] == 0) {
        const notifyOptions = {
          notify: true
        };
        this.log("联通支付日抽奖: " + (responseResult?.["data"]?.["prizeName"] || ""), notifyOptions);
      } else {
        let errorMessage = responseResult?.["data"]?.["returnMsg"] || responseResult?.["msg"] || "";
        this.log("联通支付日抽奖失败[" + (responseResult?.["data"]?.["returnCode"] || responseCode) + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async appMonth_28_bind(shareCode, options = {}) {
    try {
      const requestBody = {
        shareCode: shareCode,
        cl: "WeChat"
      };
      const requestConfig = {
        fn: "appMonth_28_bind",
        method: "post",
        url: "https://activity.10010.com/AppMonthly/appMonth/bind",
        form: requestBody,
        valid_code: [401]
      };
      let {
        result: responseResult
      } = await this.request(requestConfig);
    } catch (error) {
      console.log(error);
    }
  }
  async appMonth_28_queryChance(params = {}) {
    try {
      const requestConfig = {
        fn: "appMonth_28_queryChance",
        method: "post",
        url: "https://activity.10010.com/AppMonthly/appMonth/queryChance"
      };

      let {
        result: response
      } = await this.request(requestConfig),
        status = appName.get(response, "status", -1);

      if (status == "0000") {
        let {
          allRemainTimes: remainingTimes,
          isUnicom: isUnicomUser
        } = response?.["data"];

        if (isUnicomUser) {
          let drawTimes = Math.min(appMonth_28_MaxTimes, remainingTimes);
          this.log("联通支付日可以开宝箱" + remainingTimes + "次, 去抽" + drawTimes + "次");

          while (drawTimes-- > 0) {
            await this.appMonth_28_lottery();
          }
        }
      } else {
        let errorMsg = response?.["msg"] || "";
        this.log("联通支付日查询开宝箱次数失败[" + status + "]: " + errorMsg);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async appMonth_28_lottery(options = {}) {
    try {
      const requestConfig = {
        fn: "appMonth_28_lottery",
        method: "post",
        url: "https://activity.10010.com/AppMonthly/appMonth/lottery"
      };
      let {
        result: responseResult
      } = await this.request(requestConfig),
        status = appName.get(responseResult, "status", -1);
      if (status == "0000") {
        let {
          code: resultCode,
          uuid: uuid
        } = responseResult?.["data"];
        uuid ? await this.appMonth_28_winningRecord(uuid) : this.log("联通支付日开宝箱失败[" + resultCode + "]");
      } else {
        let errorMessage = responseResult?.["msg"] || "";
        this.log("联通支付日开宝箱失败[" + status + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async appMonth_28_winningRecord(requestId, options = {}) {
    try {
      const requestBody = {
        requestId: requestId
      };
      const requestConfig = {
        fn: "appMonth_28_winningRecord",
        method: "post",
        url: "https://activity.10010.com/AppMonthly/appMonth/winningRecord",
        form: requestBody
      };
      let {
        result: responseResult
      } = await this.request(requestConfig),
        status = appName.get(responseResult, "status", -1);
      if (status == "0000") {
        let {
          code: resultCode,
          prizeName: prizeName
        } = responseResult?.["data"];
        if (resultCode == "0000") {
          const notifyOptions = {
            notify: true
          };
          this.log("联通支付日开宝箱: " + prizeName, notifyOptions);
        } else {
          let errorMessage = responseResult?.["data"]?.["message"] || "";
          this.log("联通支付日开宝箱[" + resultCode + "]: " + errorMessage);
        }
      } else {
        let errorMessage = responseResult?.["msg"] || "";
        this.log("联通支付日查询中奖奖品错误[" + status + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
// 签到区相关方法
async sign_getContinuous(imei, options = {}) {
    try {
        const requestConfig = {
            fn: "sign_getContinuous",
            method: "get", 
            url: "https://activity.10010.com/sixPalaceGridTurntableLottery/signin/getContinuous",
            params: { 
                taskId: "",
                channel: "wode",
                imei: imei 
            }
        };
        let { result: responseResult } = await this.request(requestConfig),
            responseCode = appName.get(responseResult, "code", -1);

        if (responseCode == "0000") { 
            let todayIsSignIn = responseResult?.["data"]?.["todayIsSignIn"] || 'n'; 
            this.log("签到区今天" + (todayIsSignIn == "n" ? "未" : "已") + "签到", { notify: true });
            if (todayIsSignIn == "n") { 
                await appName.wait(1000); 
                await this.sign_daySign(); 
            }
        } else { 
            this.log("签到区查询签到状态失败[" + responseCode + "]: " + (responseResult?.["desc"] || ""));
        }
    } catch (error) {
        console.log(error);
    }
}

async sign_daySign(options = {}) {
    try {
        const requestConfig = {
            fn: "sign_daySign",
            method: "post", 
            url: "https://activity.10010.com/sixPalaceGridTurntableLottery/signin/daySign",
            form: {} 
        };
        let { result: responseResult } = await this.request(requestConfig),
            responseCode = appName.get(responseResult, "code", -1);

        if (responseCode == "0000") { 
            let { statusDesc: statusDesc, redSignMessage: redSignMessage } = responseResult?.["data"];
            let logMessage = "签到区签到成功: ";
            if (statusDesc) logMessage += `[${statusDesc}]`;
            if (redSignMessage) logMessage += `${redSignMessage}`;
            this.log(logMessage);
        } else if (responseCode == "0002" && responseResult?.["desc"] && responseResult["desc"].includes('已经签到')) { // 今日已签到
            this.log("签到区签到成功: 今日已完成签到！");
        } else { 
            this.log("签到区签到失败[" + responseCode + "]: " + (responseResult?.["desc"] || ""));
        }
    } catch (error) {
        console.log(error);
    }
}

async sign_getTaskReward(taskId, options = {}) {
    try {
        const requestConfig = {
            fn: "sign_getTaskReward",
            method: "get",
            url: "https://activity.10010.com/sixPalaceGridTurntableLottery/task/getTaskReward",
            searchParams: {
                taskId: taskId
            }
        };
        let { result: responseResult } = await this.request(requestConfig);
        let responseCode = appName.get(responseResult, "code", -1);

        if (responseCode == "0000") {
            let data = responseResult?.["data"];
            if (data?.code == '0000') {
                let prizeName = data?.prizeName || '';
                let prizeNameRed = data?.prizeNameRed || '';
                this.log(`签到区-领取奖励: [${prizeName}] ${prizeNameRed}`);
            } else {
                this.log("签到区-领取奖励失败[" + data?.code + "]: " + (responseResult?.["desc"] || data?.desc || ""));
            }
        } else {
            this.log("签到区-领取奖励失败[" + responseCode + "]: " + (responseResult?.["desc"] || ""));
        }
    } catch (error) {
        console.log(error);
    }
}

async sign_getTelephone(options = {}) {
    try {
        const requestConfig = {
            fn: "sign_getTelephone",
            method: "post",
            url: "https://act.10010.com/SigninApp/convert/getTelephone",
            form: {}
        };
        let { result: responseResult } = await this.request(requestConfig);
        let status = appName.get(responseResult, "status", -1);

        if (status == "0000" && responseResult.data) {
            const currentAmount = parseFloat(responseResult.data.telephone) || 0;

            if (options.isInitial) {
                this.initialTelephoneAmount = currentAmount;
                this.log(`签到区-话费红包: 运行前总额 ${this.initialTelephoneAmount.toFixed(2)}元`);
                return;
            }

            if (this.initialTelephoneAmount !== null) {
                const increase = currentAmount - this.initialTelephoneAmount;
                this.log(`签到区-话费红包: 本次运行增加 ${increase.toFixed(2)}元`, { notify: true });
            }

            let totalMessage = `签到区-话费红包: 总额 ${currentAmount.toFixed(2)}元`;
            if (parseFloat(responseResult.data.needexpNumber) > 0) {
                totalMessage += `，其中 ${responseResult.data.needexpNumber}元 将于 ${responseResult.data.month}月底到期`;
            }
            this.log(totalMessage, { notify: true });

        } else {
            this.log(`签到区查询话费红包失败[${status}]: ${responseResult?.msg || ""}`);
        }
    } catch (error) {
        this.log(`签到区查询话费红包异常: ${error.message}`);
    }
}

async sign_getTaskList(options = {}) {
    try {
        const requestConfig = {
            fn: "sign_getTaskList",
            method: "get",
            url: "https://activity.10010.com/sixPalaceGridTurntableLottery/task/taskList",
            searchParams: { type: 2 },
            headers: { "Referer": "https://img.client.10010.com/" }
        };

        // Use a loop to handle tasks dynamically, similar to how bubble tasks are handled.
        // This allows us to claim rewards for tasks we've just completed in the same run.
        for (let i = 0; i < 30; i++) { // Loop with a max limit to prevent infinite loops.
            let { result: responseResult } = await this.request(requestConfig);
            let responseCode = appName.get(responseResult, "code", -1);

            if (responseCode != "0000") {
                this.log("签到区-任务中心: 获取任务列表失败[" + responseCode + "]: " + (responseResult?.desc || ""));
                return;
            }

            if (i === 0) {
                 this.log("签到区-任务中心: 获取任务列表成功");
            }

            const allTasks = [
                ...(responseResult.data.tagList || []).flatMap(tag => tag.taskDTOList || []),
                ...(responseResult.data.taskList || [])
            ].filter(Boolean);

            if (allTasks.length === 0) {
                if (i === 0) this.log("签到区-任务中心: 当前无任何任务。");
                break; // Exit loop if no tasks
            }

            // Priority 1: Execute actionable tasks (taskState: 1 and taskType: 5).
            const doTask = allTasks.find(task => task.taskState === "1" && task.taskType === "5");
            if (doTask) {
                this.log(`签到区-任务中心: 开始执行任务 [${doTask.taskName}]`);
                await this.sign_doTaskFromList(doTask);
                await appName.wait(3000);
                continue; // Re-fetch task list, as the completed task might now be claimable.
            }
 
            // Priority 2: Claim rewards for completed tasks (taskState: 0).
            const claimTask = allTasks.find(task => task.taskState === "0");
            if (claimTask) {
                this.log(`签到区-任务中心: 发现可领取奖励的任务 [${claimTask.taskName}]`);
                await this.sign_getTaskReward(claimTask.id);
                await appName.wait(2000);
                continue; // Re-fetch task list to get the next state.
            }
			
            // If we are here, no claimable or actionable tasks were found in this iteration.
            if (i === 0) {
                this.log("签到区-任务中心: 没有可执行或可领取的任务。");
            } else {
                this.log("签到区-任务中心: 所有任务处理完毕。");
            }
            break; // Exit the loop
        }

    } catch (error) {
        console.log(error);
        this.log("签到区-任务中心: 获取任务列表时发生异常: " + error.message);
    }
}

async sign_doTaskFromList(task, options = {}) {
    try {
        // this.log(`签到区-任务中心: 开始执行任务 [${task.taskName}]`);
        
        if (task.url && task.url !== "1" && task.url.startsWith("http")) {
             await this.request({
                fn: "sign_doTaskFromList_visit",
                method: "get",
                url: task.url,
                headers: {
                    "Referer": "https://img.client.10010.com/"
                }
            });
            this.log(`签到区-任务中心: 浏览页面 [${task.taskName}]`);
            await appName.wait(5000 + Math.random() * 2000);
        }

        const orderId = await this.gettaskip();

        const requestConfig = {
            fn: "sign_doTaskFromList_complete",
            method: "get", 
            url: "https://activity.10010.com/sixPalaceGridTurntableLottery/task/completeTask",
            searchParams: {
                taskId: task.id,
                orderId: orderId,
                systemCode: "QDQD"
            }
        };

        let { result: responseResult } = await this.request(requestConfig);
        let responseCode = appName.get(responseResult, "code", -1);
        
        if (responseCode == "0000") {
            this.log(`签到区-任务中心: ✅ 任务 [${task.taskName}] 已完成`);
        } else {
            this.log(`签到区-任务中心: ❌ 任务 [${task.taskName}] 完成失败[${responseCode}]: ${responseResult.desc || '未知错误'}`);
        }

    } catch (error) {
        console.log(error);
        this.log(`签到区-任务中心: 执行任务 [${task.taskName}] 时发生异常: ${error.message}`);
    }
}

async flmf_login(loginUrl, options = {}) {
    try {
      const requestConfig = {
        fn: "flmf_login",
        method: "get",
        url: loginUrl
      };
      let {
        headers: headers,
        statusCode: statusCode
      } = await this.request(requestConfig);
      if (headers?.["location"]) {
        let locationUrl = new URL(headers.location);
        this.flmf_sid = locationUrl.searchParams.get("sid");
        this.flmf_sid ? (await this.flmf_signInInit(), await this.flmf_taskList(), await this.flmf_scanTask()) : this.log("福利魔方获取sid失败");
      } else {
        this.log("福利魔方获取sid失败[" + statusCode + "]");
      }
    } catch (error) {
      console.log(error);
    }
  }
  async flmf_signInInit(options = {}) {
    try {
      let requestConfig = {
        fn: "flmf_signInInit",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/signInInit",
        form: this.get_flmf_data()
      };
      let {
          result: responseResult
        } = await this.request(requestConfig);
      let resultCode = appName.get(responseResult, "resultCode", -1);
      if (resultCode == "0000") {
        this.log("福利魔方今天" + (responseResult?.["data"]?.["isSigned"] ? "已" : "未") + "签到, 已连续签到" + responseResult?.["data"]?.["consecutiveDays"] + "天");
        if (!responseResult?.["data"]?.["isSigned"]) {
          await this.flmf_signIn();
        }
      } else {
        let errorMessage = responseResult?.["resultMsg"] || "";
        this.log("福利魔方查询签到失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async flmf_signIn(options = {}) {
    try {
      let requestConfig = {
        fn: "flmf_signIn",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/signIn",
        form: this.get_flmf_data()
      };
      let {
          result: responseResult
        } = await this.request(requestConfig);
      let resultCode = appName.get(responseResult, "resultCode", -1);
      if (resultCode == "0000") {
        this.log("福利魔方签到成功");
      } else {
        let errorMessage = responseResult?.["resultMsg"] || "";
        this.log("福利魔方签到失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async flmf_taskList(options = {}) {
    try {
      let requestConfig = {
        fn: "flmf_taskList",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/taskList",
        form: this.get_flmf_data()
      };
      let {
          result: responseResult
        } = await this.request(requestConfig);
      let resultCode = appName.get(responseResult, "resultCode", -1);
      if (resultCode == "0000") {
        for (let taskGroup of responseResult?.["data"]?.["taskInfoList"]) {
          for (let task of taskGroup.taskInfoList.filter(t => !t.done)) {
            for (let i = task.hascount; i < task.count; i++) {
              await this.flmf_gogLance(task.id);
            }
          }
        }
      } else {
        let errorMessage = responseResult?.["resultMsg"] || "";
        this.log("福利魔方查询任务失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async flmf_scanTask() {
    for (let taskId of someArray) {
      await this.flmf_gogLance(taskId);
    }
  }
  async flmf_gogLance(taskId, options = {}) {
    try {
      let requestConfig = {
        fn: "flmf_gogLance",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/gogLance",
        form: {
          taskId: taskId,
          ...this.get_flmf_data()
        }
      };
      let {
          result: responseResult
        } = await this.request(requestConfig);
      await appName.wait_gap_interval(this.t_flmf_task, delayMs);
      let resultCode = appName.get(responseResult, "resultCode", -1);
      this.t_flmf_task = Date.now();
      if (resultCode == "0000") {
        this.log("完成任务[" + taskId + "]成功");
      } else {
        let errorMessage = responseResult?.["resultMsg"] || "";
        this.log("完成任务[" + taskId + "]失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ============================================
  // 联通阅读 NEW LOGIC START (移植自Python脚本)
  // ============================================

  // 1. 设备预登录 (获取accesstoken)
  async woread_auth(options = {}) {
    let authSuccess = false;
    try {
      // Python: timestamp = round(time() * 1000)
      let timestamp = Date.now();
      // Python: md5(f'100000027k1HcDL8RKvc{timestamp}')
      let signStr = productId + secretKey + timestamp;
      let md5Hash = cryptoJS.MD5(signStr).toString();
      
      // Python: crypt_text = f'{{"timestamp":"{self.date}"}}'
      // self.date format: %Y%m%d%H%M%S
      let dateStr = appName.time("yyyyMMddhhmmss");
      let cryptTextObj = { timestamp: dateStr };
      
      // encrypt using AES (key="woreadst^&*12345")
      let encodedSign = this.encode_woread(cryptTextObj);
      
      const requestOptions = {
        fn: "woread_auth",
        method: "post",
        url: `https://10010.woread.com.cn/ng_woread_service/rest/app/auth/${productId}/${timestamp}/${md5Hash}`,
        json: { sign: encodedSign }
      };

      let { result: responseData } = await this.request(requestOptions);
      let responseCode = appName.get(responseData, "code", -1);

      if (responseCode == "0000") {
        authSuccess = true;
        this.woread_accesstoken = responseData?.["data"]?.["accesstoken"];
        // 设置Header中的accesstoken
        this.got = this.got.extend({ headers: { accesstoken: this.woread_accesstoken } });
        // this.log("阅读专区: 设备认证成功");
      } else {
        let errorMessage = responseData?.["message"] || "";
        this.log("阅读专区: 设备认证失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
      this.log("阅读专区: 设备认证异常：" + error.message);
    } finally {
      return authSuccess;
    }
  }

  // 2. 账号登录 (使用token_online)
  async woread_login(options = {}) {
    let loginSuccess = false;
    try {
      // 1. 确保设备认证已完成
      if (!this.woread_accesstoken) {
          if(!await this.woread_auth()) return false;
      }

      // 2. 构造加密参数
      if (!this.token_online) {
          this.log("阅读专区: 缺少 token_online，无法进行新版登录");
          return false;
      }
      
      let token_enc = this.encode_woread_str(this.token_online);
      // 使用当前手机号，如果没获取到则用默认占位符
      let phone_str = this.mobile || "13800000000"; 
      let phone_enc = this.encode_woread_str(phone_str);
      let timestamp = appName.time("yyyyMMddhhmmss");

      // 构造内层JSON字符串: crypt_text
      let innerJson = JSON.stringify({
          tokenOnline: token_enc,
          phone: phone_enc,
          timestamp: timestamp
      });

      // 3. 对内层JSON再次加密生成sign
      let encodedSign = this.encode_woread_str(innerJson);
      
      const requestOptions = {
        fn: "woread_login",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/account/login",
        json: { sign: encodedSign }
      };

      let { result: responseData } = await this.request(requestOptions);
      let responseCode = appName.get(responseData, "code", -1);

      if (responseCode === "0000") {
        loginSuccess = true;
        let { userid, userindex, token, verifycode, phone } = responseData?.["data"];
        this.woread_token = token;
        this.woread_verifycode = verifycode;
        this.woread_userid = userid;
        this.woread_userindex = userindex;
        
        // 如果返回了真实手机号，更新它
        if (phone) {
            this.mobile = phone;
            this.name = phone; // Update display name
        }
        
        this.log(`阅读专区: 登录成功`);
      } else {
        let errorMessage = responseData?.["message"] || responseData?.["msg"] || "未知错误";
        this.log(`阅读专区: 登录失败[${responseCode}]: ${errorMessage}`);
      }
    } catch (error) {
      console.log(error);
      this.log("阅读专区: 登录异常：" + error.message);
    } finally {
      return loginSuccess;
    }
  }

  // 3. 获取书籍信息
  async woread_get_book_info() {
    try {
        // 1. 获取推荐位信息得到 cntindex
        let url1 = "https://10010.woread.com.cn/ng_woread_service/rest/basics/recommposdetail/14856";
        let { result: res1 } = await this.request({ fn: "woread_book", method: "get", url: url1 });
        
        if (res1?.code === '0000') {
            this.wr_catid = res1.data.booklist.message[0].catindex;
            this.wr_cardid = res1.data.bindinfo[0].recommposiindex;
            this.wr_cntindex = res1.data.booklist.message[0].cntindex;
        } else {
            this.log("阅读专区: 获取书籍列表失败");
            return false;
        }

        // 2. 获取章节信息得到 chapterallindex
        if (!this.wr_cntindex) return false;
        
        let param = {
            curPage: 1, limit: 30, index: this.wr_cntindex, sort: 0, finishFlag: 1,
            ...this.get_woread_param()
        };
        let sign = this.encode_woread(param);
        
        let url2 = "https://10010.woread.com.cn/ng_woread_service/rest/cnt/chalist";
        let { result: res2 } = await this.request({ 
            fn: "woread_chap", method: "post", url: url2, json: { sign } 
        });

        if (res2?.list && res2.list.length > 0) {
            this.wr_chapterallindex = res2.list[0].charptercontent[0].chapterallindex;
            this.wr_chapterid = res2.list[0].charptercontent[0].chapterid;
            return true;
        }
        return false;

    } catch (e) {
        this.log("阅读专区: 获取书籍信息异常");
        return false;
    }
  }

// 4. 阅读模拟 (心跳 + 增加时长)
  async woread_read_process() {
     if (!await this.woread_get_book_info()) {
         this.log("阅读专区: 无法获取书籍信息，跳过阅读");
         return;
     }

     // Python脚本循环1次
     let loopCount = 1; 

     for (let i = 0; i < loopCount; i++) {
         try {
             // 4.1 发送阅读心跳 wordsDetail
             let param = {
                 chapterAllIndex: this.wr_chapterallindex,
                 cntIndex: this.wr_cntindex,
                 cntTypeFlag: "1",
                 ...this.get_woread_param()
             };
             let sign = this.encode_woread(param);
             
             // 接收心跳接口结果
             let { result: beatRes } = await this.request({
                 fn: "woread_heartbeat",
                 method: "post",
                 url: `https://10010.woread.com.cn/ng_woread_service/rest/cnt/wordsDetail?catid=${this.wr_catid}&cardid=${this.wr_cardid}&cntindex=${this.wr_cntindex}&chapterallindex=${this.wr_chapterallindex}&chapterseno=1`,
                 json: { sign }
             });

             // 尝试解析心跳结果（兼容字符串情况）
             let beatResObj = beatRes;
             if (typeof beatRes === 'string') {
                 try { beatResObj = JSON.parse(beatRes); } catch (e) {}
             }

             // 如果心跳失败，跳过后续
             if (beatResObj?.code !== '0000') {
                 this.log(`阅读专区: 阅读心跳失败 (${beatResObj?.message || '未知错误'})，跳过时长累积`);
                 continue; 
             }

             // 4.2 增加阅读时长 addReadTime
             let addParam = {
                 readTime: "2",
                 cntIndex: this.wr_cntindex,
                 cntType: "1",
                 catid: "0", pageIndex: "", 
                 cardid: this.wr_cardid,
                 cntindex: this.wr_cntindex,
                 cnttype: "1",
                 chapterallindex: this.wr_chapterallindex,
                 chapterseno: "1",
                 channelid: "",
                 chapterid: this.wr_chapterid,
                 readtype: 1, isend: "0",
                 ...this.get_woread_param()
             };
             let addSign = this.encode_woread(addParam);
             
             let { result: addRes } = await this.request({
                 fn: "woread_addTime",
                 method: "post",
                 url: "https://10010.woread.com.cn/ng_woread_service/rest/history/addReadTime",
                 json: { sign: addSign }
             });
             
             // 尝试解析时长结果（兼容字符串情况）
             let addResObj = addRes;
             if (typeof addRes === 'string') {
                 try { addResObj = JSON.parse(addRes); } catch (e) {}
             }
             
             // 逻辑判断区
             if (addResObj?.code === '0000') {
                 this.log(`阅读专区: 模拟阅读成功`);
             } else if (addResObj?.code === '9999') {
                 // === 这里就是你要的逻辑 ===
                 this.log(`阅读专区: 模拟阅读失败 (需手动在APP打开一本书以初始化记录)`);
             } else {
                 let errMsg = addResObj?.msg || addResObj?.message || JSON.stringify(addRes);
                 this.log(`阅读专区: 模拟阅读失败: ${errMsg}`);
             }
             
             await appName.wait(2000); 

         } catch (e) {
             console.log(e);
             this.log(`阅读专区: 阅读过程异常: ${e.message}`);
         }
     }
  }

// 5. 新版抽奖
  async woread_draw_new() {
      try {
          let param = {
              activeindex: "8051", 
              ...this.get_woread_param()
          };
          let sign = this.encode_woread(param);
          
          let { result: res } = await this.request({
              fn: "woread_draw",
              method: "post",
              url: "https://10010.woread.com.cn/ng_woread_service/rest/basics/doDraw",
              json: { sign }
          });

          if (res?.code === '0000') {
              // 【优化】优先读取 prizedesc，没有则读取 prizeName
              let prize = res.data?.prizedesc || res.data?.prizeName || "未知奖品";
              this.log(`阅读专区: 抽奖成功: ${prize}`, { notify: true });
          } else {
              // 【优化】处理错误消息
              let errMsg = res?.msg || res?.message || JSON.stringify(res);
              this.log(`阅读专区: 抽奖失败: ${errMsg}`);
          }
      } catch (e) {
          this.log(`阅读专区: 抽奖异常: ${e.message}`);
      }
  }

  async woread_queryTicketAccount(options = {}) {
    try {
      let requestParams = this.get_woread_param(),
        encodedSign = this.encode_woread(requestParams);
      const signData = {
        sign: encodedSign
      };
      const requestOptions = {
        fn: "woread_queryTicketAccount",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/phone/vouchers/queryTicketAccount",
        json: signData
      };
      let {
        result: responseData
      } = await this.request(requestOptions),
        responseCode = appName.get(responseData, "code", -1);
      if (responseCode == "0000") {
        let balance = (responseData?.["data"]?.["usableNum"] / 100).toFixed(2);
        const notifyOptions = {
          notify: true
        };
        this.log("阅读区话费红包余额: " + balance, notifyOptions);
      } else {
        let errorMessage = responseData?.["message"] || "";
        this.log("查询阅读区话费红包余额失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ============================================
  // 联通阅读 NEW LOGIC END
  // ============================================

  async act_517_userAccount(options = {}) {
    try {
      const requestOptions = {
        fn: "act_517_userAccount",
        method: "get",
        url: "https://activity.10010.com/2024517charges/lottery/userAccount"
      };
      {
        let {
          result: responseResult,
          statusCode: responseStatus
        } = await this.request(appName.copy(requestOptions));
        let responseCode = appName.get(responseResult, "code", responseStatus);
        if (responseCode == "0000") {
          await this.act_517_taskList();
        } else {
          let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
          this.log("517活动进入主页失败[" + responseCode + "]: " + errorMessage);
          return;
        }
      }
      {
        let {
          result: responseResult,
          statusCode: responseStatus
        } = await this.request(appName.copy(requestOptions));
        let responseCode = appName.get(responseResult, "code", responseStatus);
        if (responseCode == "0000") {
          let {
            chances: chances
          } = responseResult?.["data"];
          this.log("517活动可以抽奖" + chances + "次");
          let isFirstDraw = false;
          while (chances-- > 0) {
            if (isFirstDraw) {
              await appName.wait(3000);
            }
            isFirstDraw = true;
            await this.act_517_lottery();
          }
        } else {
          let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
          this.log("517活动查询抽奖次数失败[" + responseCode + "]: " + errorMessage);
        }
      }
      {
        let {
          result: responseResult,
          statusCode: responseStatus
        } = await this.request(appName.copy(requestOptions));
        let responseCode = appName.get(responseResult, "code", responseStatus);
        if (responseCode == "0000") {
          let {
            amount: amount,
            targetAmount: targetAmount
          } = responseResult?.["data"];
          const notifyOptions = {
            notify: true
          };
          this.log("517活动现金进度: " + amount + "/" + targetAmount, notifyOptions);
        } else {
          let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
          this.log("517活动查询进度失败[" + responseCode + "]: " + errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  async act_517_bind(shareCode, options = {}) {
    try {
      const requestOptions = {
        fn: "act_517_bind",
        method: "post",
        url: "https://activity.10010.com/2024517charges/openWindows/bind",
        json: {},
        valid_code: [401]
      };
      requestOptions.json.shareCode = shareCode;
      requestOptions.json.channel = "countersign";
      let {
        result: responseResult
      } = await this.request(requestOptions);
    } catch (error) {
      console.log(error);
    }
  }
  async act_517_lottery(options = {}) {
    try {
      const requestOptions = {
        fn: "act_517_lottery",
        method: "get",
        url: "https://activity.10010.com/2024517charges/lottery/lottery"
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.request(requestOptions);
      let responseCode = appName.get(responseResult, "code", responseStatus);
      if (responseCode == "0000") {
        responseResult?.["data"]?.["uuid"] ? (await appName.wait(2000), await this.act_517_winningRecord(responseResult.data.uuid)) : this.log("517活动抽奖失败, 没有返回uuid");
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("517活动抽奖失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async act_517_winningRecord(requestId, options = {}) {
    try {
      const searchParams = {
        requestId: requestId
      };
      const requestOptions = {
        fn: "act_517_winningRecord",
        method: "get",
        url: "https://activity.10010.com/2024517charges/lottery/winningRecord",
        searchParams: searchParams
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.request(requestOptions);
      let responseCode = appName.get(responseResult, "code", responseStatus);
      if (responseCode == "0000") {
        if (responseResult?.["data"]?.["isWin"] === "1") {
          let {
            prizeAmount: prizeAmount,
            prizeList: prizeList,
            afterAmount: afterAmount,
            targetAmount: targetAmount,
            showAmount = "0"
          } = responseResult?.["data"],
            prizeNames = (prizeList || []).filter(p => p.prizeName).map(p => p.prizeName).join(", ") || "";
          const notifyOptions = {
            notify: true
          };
          if (prizeNames) {
            this.log("517活动抽奖: " + prizeNames, notifyOptions);
          }
          if (showAmount === "1") {
            this.log("517活动抽奖现金进度: +" + prizeAmount + " (" + afterAmount + "/" + targetAmount + ")");
          }
        } else {
          this.log("517活动抽奖: 空气");
        }
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("查询517活动抽奖结果失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async act_517_taskList(options = {}) {
    try {
      const requestOptions = {
        fn: "act_517_taskList",
        method: "get",
        url: "https://activity.10010.com/2024517charges/dotask/taskList"
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.request(requestOptions);
      let responseCode = appName.get(responseResult, "code", responseStatus);
      if (responseCode == "0000") {
        let taskList = responseResult?.["data"]?.["taskList"] || [];
        for (let task of taskList) {
          let {
            completeNum = 0,
            maxNum: maxNum,
            isComplete: isComplete,
            taskType: taskType
          } = task;
          if (isComplete) {
            continue;
          }
          if (taskType == "5") {
            continue;
          }
          completeNum = parseInt(completeNum);
          maxNum = parseInt(maxNum);
          for (let i = completeNum; i < maxNum; i++) {
            await this.act_517_completeTask(task);
          }
        }
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("查询517活动抽奖结果失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async act_517_completeTask(task, options = {}) {
    try {
      let taskTitle = task.title;
      const searchParams = {
        taskId: task.taskId
      };
      const requestOptions = {
        fn: "act_517_completeTask",
        method: "get",
        url: "https://activity.10010.com/2024517charges/dotask/completeTask",
        searchParams: searchParams
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.request(requestOptions);
      let responseCode = appName.get(responseResult, "code", responseStatus);
      if (responseCode == "0000") {
        if (responseResult?.["data"]) {
          let {
            num: num,
            title: title
          } = responseResult.data;
          this.log("完成任务[" + title + "]成功: " + num + "次抽奖机会");
        } else {
          this.log("完成任务[" + taskTitle + "]失败没有获得抽奖机会");
        }
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("完成任务[" + taskTitle + "]失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }

get_wocare_body(apiCode, requestData = {}) {
    const timestamp = appName.time("yyyyMMddhhmmssS"),
      encodedContent = Buffer.from(JSON.stringify(requestData)).toString("base64");
    let body = {
      version: minRetries,
      apiCode: apiCode,
      channelId: anotherApiKey,
      transactionId: timestamp + appName.randomString(6, numbers),
      timeStamp: timestamp,
      messageContent: encodedContent
    },
      paramsArray = [];
    Object.keys(body).sort().forEach(key => {
      paramsArray.push(key + "=" + body[key]);
    });
    paramsArray.push("sign=" + anotherEncryptionKey);
    body.sign = cryptoJS.MD5(paramsArray.join("&")).toString();
    return body;
  }
  async wocare_api(apiCode, requestData = {}) {
    let body = this.get_wocare_body(apiCode, requestData);
    const requestOptions = {
      fn: "wocare_" + apiCode,
      method: "post",
      url: "https://wocare.unisk.cn/api/v1/" + apiCode,
      form: body
    };
    let response = await this.request(requestOptions);
    if (response?.["result"]?.["messageContent"]) {
      try {
        let decodedContent = JSON.parse(Buffer.from(response.result.messageContent, "base64").toString());
        response.result.data = decodedContent?.["data"] || decodedContent;
        if (decodedContent?.["resultMsg"]) {
          response.result.resultMsg = decodedContent.resultMsg;
        }
      } catch (error) {
        this.log("联通祝福: 解析返回失败:");
        console.log(error);
      }
    }
    return response;
  }
  async wocare_getToken(ticket, options = {}) {
    let isSuccess = false;
    try {
      let requestOptions = {
        fn: "wocare_getToken",
        method: "get",
        url: "https://wocare.unisk.cn/mbh/getToken",
        searchParams: {
          channelType: serviceLife,
          type: "02",
          ticket: ticket,
          version: appVersion,
          timestamp: appName.time("yyyyMMddhhmmssS"),
          desmobile: this.mobile,
          num: 0,
          postage: appName.randomString(32),
          homePage: "home",
          duanlianjieabc: "qAz2m",
          userNumber: this.mobile
        }
      },
        {
          headers: headers,
          statusCode: statusCode
        } = await this.request(requestOptions);
      if (statusCode == 302) {
        if (headers?.["location"]) {
          let locationUrl = new URL(headers.location),
            sid = locationUrl.searchParams.get("sid");
          sid ? (this.wocare_sid = sid, isSuccess = await this.wocare_loginmbh()) : this.log("联通祝福: 没有获取到sid");
        } else {
          this.log("联通祝福: 没有获取到location");
        }
      } else {
        this.log("联通祝福: 获取sid失败[" + statusCode + "]");
      }
    } catch (error) {
      console.log(error);
    } finally {
      return isSuccess;
    }
  }
  async wocare_loginmbh(options = {}) {
    let isSuccess = false;
    try {
      let apiCode = "loginmbh";
      const requestData = {
        sid: this.wocare_sid,
        channelType: serviceLife,
        apiCode: apiCode
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.wocare_api(apiCode, requestData);
      let resultCode = appName.get(responseResult, "resultCode", responseStatus);
      if (resultCode == "0000") {
        isSuccess = true;
        let {
          token: token
        } = responseResult?.["data"];
        this.wocare_token = token;
      } else {
        let errorMessage = responseResult?.["resultMsg"] || responseResult?.["resultDesc"] || "";
        this.log("联通祝福: 登录失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      return isSuccess;
    }
  }
  async wocare_getSpecificityBanner(options = {}) {
    try {
      let apiCode = "getSpecificityBanner";
      const requestData = {
        token: this.wocare_token,
        apiCode: apiCode
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.wocare_api(apiCode, requestData);
      let resultCode = appName.get(responseResult, "resultCode", responseStatus);
      if (resultCode == "0000") {
        let bannerList = responseResult?.["data"] || [];
        for (let banner of bannerList.filter(b => b.activityStatus === "0" && b.isDeleted === "0")) {
          await this.wocare_getDrawTask(banner);
          await this.wocare_loadInit(banner);
        }
      } else {
        let errorMessage = responseResult?.["resultMsg"] || responseResult?.["resultDesc"] || "";
        this.log("联通祝福: 进入活动失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async wocare_loadInit(activity, options = {}) {
    try {
      let apiCode = "loadInit";
      const requestData = {
        token: this.wocare_token,
        channelType: serviceLife,
        type: activity.id,
        apiCode: apiCode
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.wocare_api(apiCode, requestData);
      let resultCode = appName.get(responseResult, "resultCode", responseStatus);
      if (resultCode == "0000") {
        let responseData = responseResult?.["data"],
          activeModuleGroupId = responseData?.["zActiveModuleGroupId"],
          drawCount = 0;
        switch (activity.id) {
          case 2:
            {
              let isPartake = responseData?.["data"]?.["isPartake"] || 0;
              !isPartake && (drawCount = 1);
              break;
            }
          case 3:
            {
              drawCount = parseInt(responseData?.["raffleCountValue"] || 0);
              break;
            }
          case 4:
            {
              drawCount = parseInt(responseData?.["mhRaffleCountValue"] || 0);
              break;
            }
        }
        while (drawCount-- > 0) {
          await appName.wait(5000);
          await this.wocare_luckDraw(activity, activeModuleGroupId);
        }
      } else {
        let errorMessage = responseResult?.["resultMsg"] || responseResult?.["resultDesc"] || "";
        this.log("联通祝福: [" + activity.name + "]查询活动失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async wocare_getDrawTask(activity, options = {}) {
    try {
      let apiCode = "getDrawTask";
      const requestData = {
        token: this.wocare_token,
        channelType: serviceLife,
        type: activity.id,
        apiCode: apiCode
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.wocare_api(apiCode, requestData);
      let resultCode = appName.get(responseResult, "resultCode", responseStatus);
      if (resultCode == "0000") {
        let taskList = responseResult?.["data"]?.["taskList"] || [];
        for (let task of taskList.filter(t => t.taskStatus == 0)) {
          await this.wocare_completeTask(activity, task);
        }
      } else {
        let errorMessage = responseResult?.["resultMsg"] || responseResult?.["resultDesc"] || "";
        this.log("联通祝福: [" + activity.name + "]查询任务失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async wocare_completeTask(activity, task, taskStep = "1", options = {}) {
    try {
      let taskTitle = task.title,
        action = taskStep == "1" ? "领取任务" : "完成任务",
        apiCode = "completeTask";
      const requestData = {
        token: this.wocare_token,
        channelType: serviceLife,
        task: task.id,
        taskStep: taskStep,
        type: activity.id,
        apiCode: apiCode
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.wocare_api(apiCode, requestData);
      let resultCode = appName.get(responseResult, "resultCode", responseStatus);
      if (resultCode == "0000") {
        this.log("联通祝福: " + action + "[" + taskTitle + "]成功");
        taskStep == "1" && (await this.wocare_completeTask(activity, task, "4"));
      } else {
        let errorMessage = responseResult?.["resultMsg"] || responseResult?.["resultDesc"] || "";
        this.log("联通祝福: [" + activity.name + "]" + action + "[" + taskTitle + "]失败[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async wocare_luckDraw(activity, activeModuleGroupId, options = {}) {
    try {
      let apiCode = "luckDraw";
      const requestData = {
        token: this.wocare_token,
        channelType: serviceLife,
        zActiveModuleGroupId: activeModuleGroupId,
        type: activity.id,
        apiCode: apiCode
      };
      let {
        result: responseResult,
        statusCode: responseStatus
      } = await this.wocare_api(apiCode, requestData);
      let resultCode = appName.get(responseResult, "resultCode", responseStatus);
      if (resultCode == "0000") {
        let drawResultCode = appName.get(responseResult?.["data"], "resultCode", -1);
        if (drawResultCode == "0000") {
          let {
            prizeName: prizeName,
            prizeDesc: prizeDesc
          } = responseResult?.["data"]?.["data"]?.["prize"];
          this.log("联通祝福: [" + activity.name + "]抽奖: " + prizeName + "[" + prizeDesc + "]");
        } else {
          let errorMessage = responseResult?.["resultMsg"] || responseResult?.["resultDesc"] || "";
          this.log("联通祝福: [" + activity.name + "]抽奖失败[" + drawResultCode + "]: " + errorMessage);
        }
      } else {
        let errorMessage = responseResult?.["resultMsg"] || responseResult?.["resultDesc"] || "";
        this.log("联通祝福: [" + activity.name + "]抽奖错误[" + resultCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async card_618_authCheck(options = {}) {
    try {
      let requestConfig = {
        fn: "card_618_authCheck",
        method: "post",
        url: "https://epay.10010.com/ps-pafs-auth-front/v1/auth/check",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo()
        }
      };
      let {
          result: responseResult
        } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000") {
        let {
          mobile: mobile,
          sessionId: sessionId,
          tokenId: tokenId,
          userId: userId
        } = responseResult?.["data"]?.["authInfo"];
        const authInfo = {
          sessionId: sessionId,
          tokenId: tokenId,
          userId: userId
        };
        Object.assign(this, authInfo);
        await this.card_618_queryUserCardInfo();
      } else {
        if (responseCode == "2101000100") {
          let loginUrl = responseResult?.["data"]?.["woauth_login_url"];
          await this.card_618_login(loginUrl);
        } else {
          let errorMessage = responseResult?.["msgInside"] || responseResult?.["msg"] || "";
          this.log("618集卡获取tokenId失败[" + responseCode + "]: " + errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  async card_618_login(loginUrl, options = {}) {
    try {
      let templateName = appName.time("yyyyMM") + "28ZFR";
      loginUrl += "https://epay.10010.com/ci-mcss-party-web/rainbow/?templateName=" + templateName + "&bizFrom=225&bizChannelCode=225&channelType=WDQB";
      const requestOptions = {
        fn: "card_618_login",
        method: "get",
        url: "https://epay.10010.com/woauth2/login",
        searchParams: {}
      };
      requestOptions.searchParams.response_type = "web_token";
      requestOptions.searchParams.source = "app_sjyyt";
      requestOptions.searchParams.union_session_id = "";
      requestOptions.searchParams.device_digest_token_id = this.tokenId_cookie;
      requestOptions.searchParams.target_client_id = anotherClientId;
      requestOptions.searchParams.position = null;
      requestOptions.searchParams.redirect_url = "https://epay.10010.com/ci-mcss-party-web/cardSelection/?activityId=NZJK618CJHD";
      requestOptions.searchParams.bizFrom = errorCode;
      requestOptions.searchParams.bizChannelCode = errorNumber;
      requestOptions.searchParams.channelType = "WDQB";
      let {
        headers: headers,
        statusCode: statusCode
      } = await this.request(requestOptions);
      if (headers?.["location"]) {
        let locationUrl = new URL(headers.location);
        this.rptId = locationUrl.searchParams.get("rptid");
        this.rptId ? await this.card_618_authCheck() : this.log("618集卡获取rptid失败");
      } else {
        this.log("618集卡获取rptid失败[" + statusCode + "]");
      }
    } catch (error) {
      console.log(error);
    }
  }
  async card_618_queryUserCardInfo(options = {}) {
    try {
      const requestBody = {
        activityId: "NZJK618CJHD"
      };
      let requestConfig = {
        fn: "card_618_queryUserCardInfo",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/mouldCard/queryUserCardInfo",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: requestBody
      };
      let {
          result: responseResult
        } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000" && responseResult?.["data"]?.["returnCode"] == 0) {
        let {
          userRemain = 0,
          isFirst = true
        } = responseResult?.["data"];
        if (isFirst) {
          await this.card_618_unifyDraw("首次进入");
        }
        this.log("618集卡可以抽奖" + userRemain + "次");
        while (userRemain-- > 0) {
          await this.card_618_unifyDraw("抽奖");
        }
      } else {
        let errorMessage = responseResult?.["message"] || responseResult?.["msg"] || "";
        this.log("618集卡进入主页失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async card_618_unifyDraw(drawType, options = {}) {
    try {
      let requestConfig = {
        fn: "card_618_unifyDraw",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/mouldCard/unifyDraw",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: {
          bigActivityId: activityIds.card_618,
          activityId: activityIds.card_618 + card618DrawTypeSuffix[drawType],
          bizFrom: errorCode
        }
      };
      let {
          result: responseResult
        } = await this.request(requestConfig);
      let responseCode = appName.get(responseResult, "code", -1);
      if (responseCode == "0000" && responseResult?.["data"]?.["returnCode"] == 0) {
        let prizeId = responseResult?.["data"]?.["prizeId"] || "空气",
          prizeName = card618PrizeMap[prizeId] || prizeId;
        const notifyOptions = {
          notify: true
        };
        this.log("618集卡[" + drawType + "]: " + prizeName, notifyOptions);
      } else {
        let errorMessage = responseResult?.["data"]?.["returnMsg"] || responseResult?.["msg"] || "";
        this.log("618集卡[" + drawType + "]失败[" + (responseResult?.["data"]?.["returnCode"] || responseCode) + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  //联通安全管家
  async securityButlerTask() {
      try {
          this.log("============= 联通安全管家 =============");
  
          // This replaces getOnlineStatus from the original script, as data is already available.
          if (!this.ecs_token || !this.mobile) {
              this.log("安全管家任务缺少 ecs_token 或 mobile，跳过。");
              return;
          }
          
          // Initialize points tracking
          this.sec_oldJFPoints = null;
  
          // Get all necessary tickets and tokens
          await this.getTicketByNative_sec();
          await this.getAuthToken_sec();
          await this.getTicketForJF_sec();
  
          if (!this.sec_ticket || !this.sec_token) {
              this.log("安全管家获取票据失败，跳过任务。");
              return;
          }
  
          // this.log("安全管家CK获取完毕，等待5秒...");
          await appName.wait(5000);
  
          await this.getUserInfo_sec(); // Get initial points
          await this.executeAllTasks_sec();
          await appName.wait(15000);
          await this.getUserInfo_sec(); // Get final points and log the difference
  
      } catch (e) {
          this.log(`联通安全管家任务出现错误: ${e.message}`);
          console.log(e);
      }
  }
  
  async getTicketByNative_sec() {
      let requestOptions = {
          "fn": "getTicketByNative_sec",
          "url": `https://m.client.10010.com/edop_ng/getTicketByNative?token=${this.ecs_token}&appId=edop_unicom_3a6cc75a`,
          "headers": {
              "Cookie": `PvSessionId=${appName.time("yyyyMMddhhmmss")}${this.unicomTokenId};c_mobile=${this.mobile}; c_version=iphone_c@11.0800; city=036|${this.city?.[0]?.cityCode || ''}|90063345|-99;devicedId=${this.unicomTokenId}; ecs_token=${this.ecs_token};t3_token=`,
              "Accept": "*",
              "Connection": "keep-alive",
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept-Encoding": "gzip;q=1.0, compress;q=0.5",
              "Host": "m.client.10010.com",
              "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
              "Accept-Language": "zh-Hans-CN;q=1.0"
          }
      };
      let { result } = await this.request(requestOptions);
      this.sec_ticket1 = result ? result.ticket : null;
  }
  
  async getAuthToken_sec() {
      if (!this.sec_ticket1) {
          this.log("安全管家 getAuthToken_sec 缺少 ticket1，跳过");
          return;
      }
      let requestOptions = {
          "fn": "getAuthToken_sec",
          "url": "https://uca.wo116114.com/api/v1/auth/ticket?product_line=uasp&entry_point=h5&entry_point_id=edop_unicom_3a6cc75a",
          "method": "post",
          "headers": {
              "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
              "Accept": "*",
              "Accept-Encoding": "gzip;q=1.0, compress;q=0.5",
              "Content-Type": "application/json",
              "Accept-Language": "zh-Hans-CN;q=1.0",
              "clientType": "uasp_unicom_applet"
          },
          "json": { "productId": "", "type": 1, "ticket": this.sec_ticket1 }
      };
      let { result } = await this.request(requestOptions);
      if (result && result.data) {
          this.sec_token = result.data.access_token;
      }
  }
  
  async getTicketForJF_sec() {
      if (!this.sec_token) {
          this.log("安全管家 getTicketForJF_sec 缺少 token，跳过");
          return;
      }
      let requestOptions = {
          "fn": "getTicketForJF_sec_1",
          "method": "post",
          "url": "https://uca.wo116114.com/api/v1/auth/getTicket?product_line=uasp&entry_point=h5&entry_point_id=edop_unicom_3a6cc75a",
          "headers": {
              "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
              "Content-Type": "application/json",
              "auth-sa-token": this.sec_token,
              "clientType": "uasp_unicom_applet"
          },
          "json": { "productId": "91311616", "phone": this.mobile }
      };
  
      let { result } = await this.request(requestOptions);
      if (result && result.data) {
          this.sec_ticket = result.data.ticket;
      } else {
          this.log("安全管家获取积分票据失败");
          return;
      }
  
      let queryOptions = {
          "fn": "getTicketForJF_sec_2",
          "method": "post",
          "url": "https://m.jf.10010.com/jf-external-application/page/query",
          "headers": {
              "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
              "partnersid": "1702",
              "ticket": decodeURIComponent(this.sec_ticket),
              "Cookie": `_jea_id=${this.sec_jeaId}`,
              "clienttype": "uasp_unicom_applet",
          },
          "json": { "activityId": "s747395186896173056", "partnersId": "1702" }
      };
      
      let { headers } = await this.request(queryOptions);
      const setCookieHeader = headers?.["set-cookie"];
      if (setCookieHeader) {
          const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
          const jeaCookie = cookies.find(cookie => cookie && cookie.startsWith("_jea_id="));
          if (jeaCookie) {
              const newJeaId = jeaCookie.split(";")[0].split("=")[1];
              if (newJeaId) {
                  this.sec_jeaId = newJeaId;
                   this.log("安全管家: 更新 jeaId: " + this.sec_jeaId);
              }
          }
      }
  }
  
  async operateBlacklist_sec(phoneNumber, type) {
      const typeName = type === 0 ? "添加" : "删除";
      this.log(`安全管家: 正在执行${typeName}黑名单号码: ${phoneNumber}`);
  
      let requestOptions = {
          "fn": `operateBlacklist_sec_${typeName}`,
          "method": "post",
          "url": "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6",
          "headers": {
              "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
              "auth-sa-token": this.sec_token,
              "clientType": "uasp_unicom_applet",
              "token": this.sec_token,
              "Cookie": `devicedId=${this.unicomTokenId}`
          },
          "json": {
              "productId": "91015539",
              "type": 1,
              "operationType": type,
              ...(type === 0 ? { "blacklistSource": 0 } : {}),
              "contents": [{ "content": phoneNumber, "contentTag": "", "nickname": null, "configTime": null }]
          }
      };
  
      let { result } = await this.request(requestOptions);
      return result;
  }
  
  async addToBlacklist_sec() {
      const phoneNumberToOperate = "13088888888"; 
      let response = await this.operateBlacklist_sec(phoneNumberToOperate, 0);
  
      // 检查多种成功条件: code 为 '0000' 或 0, 或者 msg 为 '成功'
      if (response && (response.code === '0000' || response.code === 0 || response.msg === '成功')) {
          this.log(`安全管家: ✅ 添加黑名单成功。`);
          return;
      }
  
      const isDuplicateError = response && response.msg && response.msg.includes("号码已存在");
  
      if (isDuplicateError) {
          this.log(`安全管家: ⚠️ 检测到号码 ${phoneNumberToOperate} 已存在，执行先删除后添加流程。`);
          let delResponse = await this.operateBlacklist_sec(phoneNumberToOperate, 1);
          
          // 检查删除操作的多种成功/可接受条件
          const isDelSuccess = delResponse && (delResponse.code === '0000' || delResponse.code === 0 || (delResponse.msg && (delResponse.msg.includes("成功") || delResponse.msg.includes("不在黑名单"))));
  
          if (isDelSuccess) {
              this.log(`安全管家: ✅ 删除旧记录成功，等待 2 秒后重新添加...`);
              await appName.wait(2000);
              let retryResponse = await this.operateBlacklist_sec(phoneNumberToOperate, 0);
              
              // 重新检查添加操作的多种成功条件
              if (retryResponse && (retryResponse.code === '0000' || retryResponse.code === 0 || retryResponse.msg === '成功')) {
                  this.log(`安全管家: ✅ 重新添加黑名单成功。`);
              } else {
                  this.log(`安全管家: ❌ 重新添加失败: ${retryResponse ? retryResponse.msg : '无响应'}`);
              }
          } else {
              this.log(`安全管家: ❌ 删除旧记录失败，无法继续添加。`);
          }
      } else {
          // 其他未知的失败情况
          this.log(`安全管家: ❌ 添加黑名单失败: ${response ? response.msg : '无响应'}`);
      }
  }
  
  async markPhoneNumber_sec() {
      let requestOptions = {
          "fn": "markPhoneNumber_sec",
          "method": "post",
          "url": "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/addressBook/saveTagPhone?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6",
          "headers": {
              "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
              "auth-sa-token": this.sec_token,
              "clientType": "uasp_unicom_applet"
          },
          "json": { "tagPhoneNo": "13088330789", "tagIds": [26], "status": 0, "productId": "91311616" }
      };
      await this.request(requestOptions);
      this.log("安全管家: 执行号码标记。");
  }
  
  async syncAddressBook_sec() {
      let requestOptions = {
          "fn": "syncAddressBook_sec",
          "method": "post",
          "url": "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/addressBookBatchConfig?product_line=uasp&entry_point=h5&entry_point_id=edop_unicom_3a6cc75a",
          "headers": {
              "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
              "auth-sa-token": this.sec_token,
              "clientType": "uasp_unicom_applet"
          },
          "json": { "addressBookDTOList": [{ "addressBookPhoneNo": "13088888888", "addressBookName": "水水" }], "productId": "91311616", "opType": "1" }
      };
      await this.request(requestOptions);
      this.log("安全管家: 执行同步通讯录。");
  }
  
  async setInterceptionRules_sec() {
      let requestOptions = {
          "fn": "setInterceptionRules_sec",
          "method": "post",
          "url": "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6",
          "headers": {
              "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
              "auth-sa-token": this.sec_token,
              "clientType": "uasp_unicom_applet"
          },
          "json": { "contents": [{ "name": "rings-once", "contentTag": "8", "contentName": "响一声", "content": "0", "icon": "alerting" }], "operationType": 0, "type": 3, "productId": "91311616" }
      };
      await this.request(requestOptions);
      this.log("安全管家: 执行设置拦截规则。");
  }
  
  async viewWeeklyStatus_sec() {
      let requestOptions = {
          "fn": "viewWeeklyStatus_sec",
          "method": "post",
          "url": "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/weeklySwitchStatus?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6",
          "headers": { "auth-sa-token": this.sec_token, "clientType": "uasp_unicom_applet" },
          "json": { "productId": "91311616" }
      };
      await this.request(requestOptions);
  }
  
  async queryKeyData_sec() {
      let requestOptions = {
          "fn": "queryKeyData_sec",
          "method": "post",
          "url": "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/report/v1/queryKeyData?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6",
          "headers": { "auth-sa-token": this.sec_token, "clientType": "uasp_unicom_applet" },
          "json": { "productId": "91311616" }
      };
      await this.request(requestOptions);
  }
  
  async viewWeeklySummary_sec() {
      let requestOptions = {
          "fn": "viewWeeklySummary_sec",
          "method": "post",
          "url": "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/report/v1/weeklySummary?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6",
          "headers": { "auth-sa-token": this.sec_token, "clientType": "uasp_unicom_applet" },
          "json": { "productId": "91311616" }
      };
      await this.request(requestOptions);
      this.log("安全管家: 执行查看周报。");
  }
  
  async receivePoints_sec(taskCode) {
      let requestOptions = {
          "fn": "receivePoints_sec",
          "method": "post",
          "url": "https://m.jf.10010.com/jf-external-application/jftask/receive",
          "headers": {
              "ticket": decodeURIComponent(this.sec_ticket),
              "Cookie": `_jea_id=${this.sec_jeaId}`,
              "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
              "partnersid": "1702",
              "clienttype": "uasp_unicom_applet",
          },
          "json": { "taskCode": taskCode }
      };
      let { result } = await this.request(requestOptions);
      if (result && result.data && result.data.score) {
          this.log(`安全管家: ✅ 领取积分成功: +${result.data.score} (${result.msg})`);
      } else if (result) {
          this.log(`安全管家: ❌ 领取积分失败: ${result.msg}`);
      } else {
          this.log("安全管家: ❌ 领取积分API无响应");
      }
  }

  async finishTask_sec(taskCode, taskName) {
      let requestOptions = {
          "fn": `finishTask_sec_${taskName}`,
          "method": "post",
          "url": "https://m.jf.10010.com/jf-external-application/jftask/toFinish",
          "headers": {
              "ticket": decodeURIComponent(this.sec_ticket),
              "Cookie": `_jea_id=${this.sec_jeaId}`,
              "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
              "partnersid": "1702",
              "clienttype": "uasp_unicom_applet",
          },
          "json": { "taskCode": taskCode }
      };
      await this.request(requestOptions);
      this.log(`安全管家: 开启任务 [${taskName}]`);
  
      switch (taskName) {
          case "联通助理-添加黑名单":
              await this.addToBlacklist_sec();
              break;
          case "联通助理-号码标记":
              await this.markPhoneNumber_sec();
              break;
          case "联通助理-同步通讯录":
              await this.syncAddressBook_sec();
              break;
          case "联通助理-骚扰拦截设置":
              await this.setInterceptionRules_sec();
              break;
          case "联通助理-查看周报":
              await this.viewWeeklyStatus_sec();
              await this.queryKeyData_sec();
              await this.viewWeeklySummary_sec();
              break;
          default:
              // No action needed as filtering is done upstream
              break;
      }
  }
  
  async signIn_sec(taskCode) {
      let requestOptions = {
          "fn": "signIn_sec",
          "method": "post",
          "url": "https://m.jf.10010.com/jf-external-application/jftask/sign",
          "headers": {
              "ticket": decodeURIComponent(this.sec_ticket),
              "Cookie": `_jea_id=${this.sec_jeaId}`,
              "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
              "partnersid": "1702",
              "clienttype": "uasp_unicom_applet",
          },
          "json": { "taskCode": taskCode }
      };
      let { result } = await this.request(requestOptions);
      this.log(`安全管家: 完成签到: ${result?.msg || '状态未知'}`);
  }
  
  async executeAllTasks_sec() {
      let requestOptions = {
          "fn": "executeAllTasks_sec",
          "method": "post",
          "url": "https://m.jf.10010.com/jf-external-application/jftask/taskDetail",
          "headers": {
              "ticket": decodeURIComponent(this.sec_ticket),
              "Cookie": `_jea_id=${this.sec_jeaId}`,
              "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
              "partnersid": "1702",
              "clienttype": "uasp_unicom_applet",
          },
          "json": {}
      };
  
      let { result } = await this.request(requestOptions);
      if (!result || !result.data || !result.data.taskDetail) {
          this.log("安全管家: 查询任务列表失败或响应格式错误。");
          return;
      }
  
      const taskList = result.data.taskDetail.taskList;
      const executableTaskNames = [
          "联通助理-添加黑名单",
          "联通助理-号码标记",
          "联通助理-同步通讯录",
          "联通助理-骚扰拦截设置",
          "联通助理-查看周报"
      ];
  
      const executableTasks = [];
      const skippedTasks = [];
  
      for (const task of taskList) {
          const isKnownExecutable = executableTaskNames.includes(task.taskName) || task.taskName.includes("签到");
          if (isKnownExecutable) {
              executableTasks.push(task);
          } else {
              skippedTasks.push(task);
          }
      }
  
      const unfinishedSkipped = skippedTasks.filter(t => t.finishCount !== t.needCount);
      if (unfinishedSkipped.length > 0) {
          const skippedTaskNames = unfinishedSkipped.map(t => `[${t.taskName}]`).join(', ');
          this.log(`安全管家: 跳过: ${skippedTaskNames}`);
      }
  
      for (const task of executableTasks) {
        const { taskCode, taskName, finishCount, needCount, finishText } = task;
        this.log(`安全管家: [${taskName}]: ${finishCount}/${needCount} - ${finishText}`);

        if (finishCount !== needCount) {
            const remainingCount = needCount - finishCount;
            this.log(`安全管家: 任务未完成，需要再执行 ${remainingCount} 次`);

            for (let i = 0; i < remainingCount; i++) {
                await appName.wait(3000);
                try {
                    if (taskName.includes("签到")) {
                        await this.signIn_sec(taskCode);
                    } else {
                        await this.finishTask_sec(taskCode, taskName);
                    }

                    if (!taskName.includes("签到")) {
                        await appName.wait(10000);
                        await this.receivePoints_sec(taskCode);
                    } else {
                        await this.receivePoints_sec(taskCode);
                        break;
                    }
                } catch (error) {
                    this.log(`安全管家: 执行 ${taskCode} 时出错: ${error.message}`);
                    break;
                }
            }
        } else if (finishText === "待领取") {
            try {
                await appName.wait(3000);
                await this.receivePoints_sec(taskCode);
            } catch (error) {
                this.log(`安全管家: 领取 ${taskCode} 奖励时出错: ${error.message}`);
            }
        } else {
            this.log(`安全管家: [${taskName}] 任务已完成且奖励已领取`);
        }
        this.log("安全管家: ---------------------");
    }
  }
  
  async getUserInfo_sec() {
      let requestOptions = {
          "fn": "getUserInfo_sec",
          "method": "post",
          "url": "https://m.jf.10010.com/jf-external-application/jftask/userInfo",
          "headers": {
              "ticket": decodeURIComponent(this.sec_ticket),
              "Cookie": `_jea_id=${this.sec_jeaId}`,
              "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36; unicom{version:android@11.0000,desmobile:0};devicetype{deviceBrand:OnePlus,deviceModel:ONEPLUS A5000}",
              "partnersid": "1702",
              "clienttype": "uasp_unicom_applet",
          },
          "json": {}
      };
  
      let { result } = await this.request(requestOptions);
      if (!result || result.code !== '0000' || !result.data || result.data.availableScore === undefined) {
          this.log(`安全管家: 查询积分失败或响应格式错误。错误信息: ${result ? result.msg : '无响应'}`);
          return;
      }
  
      const currentPoints = parseInt(result.data.availableScore, 10);
      const todayPoints = result.data.todayEarnScore;
  
      if (this.sec_oldJFPoints === null) {
          this.sec_oldJFPoints = currentPoints;
          this.log(`安全管家: 运行前积分：${currentPoints} (今日已赚 ${todayPoints})`);
      } else {
          if (isNaN(currentPoints) || isNaN(this.sec_oldJFPoints)) {
              this.log(`安全管家: 警告：积分值无法转换为数字进行计算。`);
              this.log(`安全管家: 运行后可用积分: ${result.data.availableScore}`, { notify: true });
          } else {
              const pointsGained = currentPoints - this.sec_oldJFPoints;
              this.log(`安全管家: 运行后积分${currentPoints}，本次运行获得${pointsGained}`, { notify: true });
          }
      }
  }

  // 联通云盘任务
  async ltyp_task() {
      try {
          this.log("============= 联通云盘任务 =============");
          this.cloudDisk = {}; // Reset state for this run
          this.cloudDiskUrls = {
              'onLine': "https://m.client.10010.com/mobileService/onLine.htm",
              'getTicketByNative': "https://m.client.10010.com/edop_ng/getTicketByNative",
              'userticket': "https://panservice.mail.wo.cn/api-user/api/user/ticket",
              'ltypDispatcher': "https://panservice.mail.wo.cn/wohome/dispatcher",
              'query': "https://m.jf.10010.com/jf-external-application/page/query",
              'taskDetail': "https://m.jf.10010.com/jf-external-application/jftask/taskDetail",
              'dosign': "https://m.jf.10010.com/jf-external-application/jftask/sign",
              'doUpload': "https://b.smartont.net/openapi/transfer/quickTransfer",
              'doPopUp': "https://m.jf.10010.com/jf-external-application/jftask/popUp",
              'toFinish': "https://m.jf.10010.com/jf-external-application/jftask/toFinish",
              'lottery': "https://panservice.mail.wo.cn/activity/lottery",
              'activityList': "https://panservice.mail.wo.cn/activity/v1/activityList",
              'userInfo': "https://m.jf.10010.com/jf-external-application/jftask/userInfo",
              'ai_query': "https://panservice.mail.wo.cn/wohome/ai/assistant/query",
              'lottery_times': "https://panservice.mail.wo.cn/activity/lottery/lottery-times",
          };

          if (!this.ecs_token || !this.mobile) {
              this.log("云盘任务: 缺少 ecs_token 或 mobile，跳过。");
              return;
          }

          const ticket = await this.getTicketByNative_cloud();
          if (!ticket) {
              this.log("云盘任务: 获取ticket失败，跳过。");
              return;
          }

          const token = await this.get_ltypDispatcher_cloud(ticket);
          if (!token) {
              this.log("云盘任务: 获取token失败，跳过。");
              return;
          }

          await appName.wait(500);
          await this.get_userInfo_cloud(); // Initial points
          await appName.wait(500);
          await this.get_taskDetail_cloud();

          const got_chance = await this.do_ai_query_for_lottery_cloud();
          if (got_chance) {
              await appName.wait(5000);
              let times = await this.check_lottery_times_cloud();
              if (times > 0) {
                for (let i = 0; i < times; i++) {
                    this.log(`云盘第 ${i + 1}/${times} 次执行抽奖...`);
                    await this.get_ltyplottery_cloud('MjI=');
                    await appName.wait(5000);
                }
              }
          }

          await appName.wait(500);
          await this.get_userInfo_cloud(); // Final points

      } catch (e) {
          this.log(`云盘任务: 出现错误: ${e.message}`);
          console.log(e);
      }
  }

  encrypt_data_cloud(data, key, iv = "wNSOYIB1k1DjY5lA") {
      if (typeof data === 'object') {
          data = JSON.stringify(data);
      }
      const keyHex = cryptoJS.enc.Utf8.parse(key.slice(0, 16));
      const ivHex = cryptoJS.enc.Utf8.parse(iv);
      const encrypted = cryptoJS.AES.encrypt(data, keyHex, {
          iv: ivHex,
          mode: cryptoJS.mode.CBC,
          padding: cryptoJS.pad.Pkcs7
      });
      return encrypted.toString();
  }

  async getTicketByNative_cloud() {
      let requestOptions = {
          fn: "getTicketByNative_cloud",
          method: 'get',
          url: `${this.cloudDiskUrls.getTicketByNative}?appId=edop_unicom_d67b3e30&token=${this.ecs_token}`,
          headers: {
              'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}",
              'Connection': "Keep-Alive",
              'Accept-Encoding': "gzip",
          }
      };
      let { result } = await this.request(requestOptions);
      if (result?.ticket) {
          this.cloudDisk.ticket = result.ticket;
          return result.ticket;
      }
      return null;
  }

  async get_ltypDispatcher_cloud(ticket) {
      const timestamp = Date.now().toString();
      const result = Math.floor(Math.random() * (199999 - 123456 + 1)) + 123456;
      const string_to_hash = "HandheldHallAutoLoginV2" + timestamp + result + "wohome";
      const md5Hash = cryptoJS.MD5(string_to_hash).toString();

      const payload = {
          "header": {
              "key": "HandheldHallAutoLoginV2",
              "resTime": timestamp,
              "reqSeq": result,
              "channel": "wohome",
              "version": "",
              "sign": md5Hash
          },
          "body": {
              "clientId": "1001000003",
              "ticket": ticket
          }
      };

      let requestOptions = {
          fn: "get_ltypDispatcher_cloud",
          method: 'post',
          url: this.cloudDiskUrls.ltypDispatcher,
          json: payload,
          headers: {
             'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}"
          }
      };

      let { result: res } = await this.request(requestOptions);
      const token = res?.RSP?.DATA?.token;
      if (token) {
          this.cloudDisk.userToken = token;
          return token;
      }
      this.log(`云盘任务: 获取token失败: ${JSON.stringify(res)}`);
      return null;
  }

  async get_userticket_cloud(is_changer = false) {
      if (!this.cloudDisk.userToken) {
          this.log("云盘任务: 获取userticket失败, userToken未获取");
          return null;
      }

      let headers = {};
       if (is_changer) {
          headers = {
            'User-Agent': "LianTongYunPan/4.0.4 (Android 12)",
            'app-type': "liantongyunpanapp",
            'Client-Id': "1001000035",
            'App-Version': "yp-app/4.0.4",
            'Sys-Version': "Android/12",
            'X-YP-Client-Id': "1001000035",
            'X-YP-Access-Token': this.cloudDisk.userToken,
          };
      } else {
          headers = {
            'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}",
            'Content-Type': 'application/json',
            'X-YP-Access-Token': this.cloudDisk.userToken,
            'accesstoken': this.cloudDisk.userToken,
            'token': this.cloudDisk.userToken,
            'clientId': "1001000003",
            'X-YP-Client-Id': "1001000003",
            'source-type': "woapi",
            'app-type': "unicom"
          };
      }

      let requestOptions = {
          fn: "get_userticket_cloud",
          method: 'post',
          url: this.cloudDiskUrls.userticket,
          json: {},
          headers: headers
      };

      let { result: res } = await this.request(requestOptions);
      const ticket = res?.result?.ticket;
      if (ticket) {
          this.cloudDisk.userticket = ticket;
          await appName.wait(1000);
          return ticket;
      }
      this.log(`云盘任务: 获取userticket失败: ${JSON.stringify(res)}`);
      return null;
  }
  
  async get_userInfo_cloud() {
      if (!await this.get_userticket_cloud(false)) return;

      let { result: res, headers } = await this.cloudRequest('userInfo', {}, false, 'post');
      
      const setCookieHeader = headers?.["set-cookie"];
      if (setCookieHeader) {
          const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
          const jeaCookie = cookies.find(cookie => cookie && cookie.startsWith("_jea_id="));
          if (jeaCookie) {
              this.cloudDisk.jeaId = jeaCookie.split(";")[0].split("=")[1];
          }
      }

      if (res?.data?.availableScore) {
          const availableScore = res.data.availableScore;
          const allEarnScore = res.data.allEarnScore;
          if (this.cloudDisk.initial_score === undefined) {
              this.cloudDisk.initial_score = parseInt(allEarnScore, 10);
              this.log(`云盘任务: 运行前 - 已赚积分: ${allEarnScore}, 可用积分: ${availableScore}`);
          } else {
              const earned_this_run = parseInt(allEarnScore, 10) - this.cloudDisk.initial_score;
              this.log(`云盘任务: 运行后 - 已赚: ${allEarnScore}, 可用: ${availableScore}, 本次获得: ${earned_this_run}积分`, { notify: true });
          }
      } else {
          this.log(`云盘任务: 获取用户信息失败: ${JSON.stringify(res)}`);
      }
  }

  async get_taskDetail_cloud() {
      if (!await this.get_userticket_cloud(false)) return;

      let { result: res } = await this.cloudRequest('taskDetail', {}, false, 'post');
      if (res?.data?.taskDetail?.taskList) {
          const taskList = res.data.taskDetail.taskList;
          const taskNameList = ["浏览活动中心", "分享文件", "签到", "与AI通通互动", "打开相册自动备份"];
          for (const task of taskList) {
              await appName.wait(500);
              if (task.finishText === "未完成" && taskNameList.some(name => task.taskName.includes(name))) {
                  this.log(`云盘任务: 开始执行 [${task.taskName}]`);
                  if (task.taskName.includes("浏览活动中心")) {
                      await this.toFinish_cloud(task.taskCode, task.taskName, true);
                      await this.activityList_cloud(task.taskCode, task.taskName);
                  } else if (task.taskName.includes("分享文件")) {
                      await this.toFinish_cloud(task.taskCode, task.taskName, false);
                      await this.get_ShareFileDispatcher_cloud(task.taskCode, task.taskName);
                  } else if (task.taskName.includes("签到")) {
                      await this.toFinish_cloud(task.taskCode, task.taskName, false);
                      await this.dosign_cloud(task.taskCode, task.taskName);
                  } else if (task.taskName.includes("与AI通通互动")) {
                      await this.toFinish_cloud(task.taskCode, task.taskName, false);
                      await this.do_ai_interaction_cloud(task.taskCode, task.taskName);
                  } else if (task.taskName.includes("打开相册自动备份")) {
                      await this.toFinish_cloud(task.taskCode, task.taskName, false);
                      
                      // Action to simulate opening the album backup page
                      if (!await this.get_userticket_cloud(true)) return;
                      const payload = { "bizKey": "activityCenterPipeline", "bizObject": { "pageNo": 1 } };
                      let { result: res } = await this.cloudRequest('activityList', payload, true);
                      if (res?.meta?.code === 0 || res?.meta?.code === "0") {
                          this.log(`云盘任务: ✅ [${task.taskName}] 打开成功`);
                          await appName.wait(2000);
                      } else {
                          this.log(`云盘任务: ❌ [${task.taskName}] 打开失败: ${JSON.stringify(res)}`);
                      }
                  }
              }
              if (task.finishText === "未完成" && task.taskNameSubtitle && task.taskName.includes("手动上传文件")) {
                   this.log(`云盘任务: 开始执行 [${task.taskName}]`);
                   await this.toFinish_cloud(task.taskCode, task.taskName, false);
                   const subtitle = task.taskNameSubtitle;
                   const [current_count_str, target_count_str] = subtitle.replace(/[（）]/g, "").split("/");
                   let current_count = parseInt(current_count_str, 10);
                   let target_count = parseInt(target_count_str, 10);
                   if (current_count < target_count) {
                        const remaining_times = target_count - current_count;
                        this.log(`云盘任务: [${task.taskName}] 需 ${remaining_times} 次`);
                        for (let i = 0; i < remaining_times; i++) {
                            if(await this.doUpload_cloud(task.taskCode, task.taskName)) {
                                this.log(`云盘任务: [${task.taskName}] 第 ${current_count + i + 1} 次上传完成`);
                                await appName.wait(500);
                            } else {
                                break;
                            }
                        }
                   }
              }
          }
      } else {
          this.log(`云盘任务: 获取任务列表失败: ${JSON.stringify(res)}`);
      }
  }

    async cloudRequest(url_name, payload, is_changer = false, method = 'post') {
        const url = this.cloudDiskUrls[url_name];
        if (!url) {
            this.log(`云盘无效的URL名称: ${url_name}`);
            return { result: null, headers: null };
        }

        let headers = {
            'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}",
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
        };

        if (['dosign', 'userInfo', 'doPopUp', 'toFinish', 'taskDetail'].includes(url_name)) {
            if (!this.cloudDisk.userticket) {
                this.log(`云盘 [${url_name}] userticket 未获取`);
                return { result: null, headers: null };
            }
            headers['ticket'] = this.cloudDisk.userticket;
            headers['content-type'] = "application/json;charset=UTF-8";
            headers['partnersid'] = "1649";
            headers['origin'] = "https://m.jf.10010.com";
            if (this.cloudDisk.jeaId) headers['Cookie'] = `_jea_id=${this.cloudDisk.jeaId}`;

            if (is_changer) {
                 headers['clienttype'] = "yunpan_unicom_applet";
                 headers['x-requested-with'] = "com.sinovatech.unicom.ui";
                 if (url_name === 'toFinish') {
                    headers['User-Agent'] = "Mozilla/5.0 (Linux; Android 12; Redmi K30 Pro Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.39 Mobile Safari/537.36/woapp LianTongYunPan/4.0.4 (Android 12)";
                    headers['clienttype'] = "yunpan_android";
                    headers['x-requested-with'] = "com.chinaunicom.bol.cloudapp";
                }
            } else {
                headers['clienttype'] = "yunpan_android";
                headers['x-requested-with'] = "com.sinovatech.unicom.ui";
            }
        } else if (url_name === 'activityList') {
            headers = {
                'User-Agent': "Mozilla/5.0 (Linux; Android 12; Redmi K30 Pro Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.39 Mobile Safari/537.36/woapp LianTongYunPan/4.0.4 (Android 12)",
                'Accept': "application/json, text/plain, */*",
                'Accept-Encoding': "gzip, deflate, br, zstd",
                'Content-Type': "application/json",
                'credentials': "include",
                'sec-ch-ua-platform': '"Android"',
                'sec-ch-ua': '"Android WebView";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': "?1",
                'Client-Id': "1001000035",
                'App-Version': "yp-app/4.0.4",
                'Access-Token': this.cloudDisk.userToken,
                'Sys-Version': "android/12",
                'Origin': "https://panservice.mail.wo.cn",
                'X-Requested-With': "com.chinaunicom.bol.cloudapp",
                'Sec-Fetch-Site': "same-origin",
                'Sec-Fetch-Mode': "cors",
                'Sec-Fetch-Dest': "empty",
                'Referer': "https://panservice.mail.wo.cn/h5/mobile/wocloud/activityCenter/home",
                'Accept-Language': "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            };
        } else if (url_name === 'doUpload') {
            headers = {
                'User-Agent': "okhttp-okgo/jeasonlzy LianTongYunPan/4.0.4 (Android 12)", 'client-Id': "1001000035",
                'app-version': "yp-app/4.0.4", 'access-token': this.cloudDisk.userToken, 'Content-Type': "application/json;charset=utf-8"
            };
        } else if (url_name === 'ai_query') {
            const model_id = payload.modelId || 1;
            headers = {
                'accept': 'text/event-stream',
                'X-YP-Access-Token': this.cloudDisk.userToken,
                'X-YP-App-Version': '5.0.12',
                'X-YP-Client-Id': '1001000035',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-N9810 Build/PQ3A.190705.11211540; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36/woapp LianTongYunPan/5.0.12 (Android 9)',
                'Content-Type': 'application/json',
                'Origin': 'https://panservice.mail.wo.cn',
                'X-Requested-With': 'com.chinaunicom.bol.cloudapp',
                'Referer': `https://panservice.mail.wo.cn/h5/wocloud_ai/?modelType=${model_id}&clientId=1001000035&touchpoint=300300010001&token=${this.cloudDisk.userToken}`,
            };
        } else if (url_name === 'lottery_times') {
             method = 'get';
             payload = { activityId: 'MjI=' };
             headers = {
                'X-YP-Access-Token': this.cloudDisk.userToken, 'source-type': 'woapi', 'clientId': '1001000165',
                'token': this.cloudDisk.userToken, 'X-YP-Client-Id': '1001000165',
            };
        } else if (url_name === 'lottery') {
            const activity_id_b64 = payload.activityId || '';
            const activity_id_b64_encoded = encodeURIComponent(activity_id_b64);
            headers = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-N9810 Build/PQ3A.190705.11211540; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36/woapp LianTongYunPan/5.0.12 (Android 9)',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'X-Requested-With': 'com.chinaunicom.bol.cloudapp',
                'requesttime': Date.now().toString(),
                'clientid': '1001000165',
                'x-yp-client-id': '1001000165',
                'source-type': 'woapi',
                'x-yp-access-token': this.cloudDisk.userToken,
                'token': this.cloudDisk.userToken,
                'origin': 'https://panservice.mail.wo.cn',
                'Referer': `https://panservice.mail.wo.cn/h5/activitymobile/blindBox?activityId=${activity_id_b64_encoded}&touchpoint=300300010001&clientId=1001000035&token=${this.cloudDisk.userToken}`,
            };
        }

        let requestOptions = {
            fn: `cloud_${url_name}`, method: method,
            url: method === 'get' ? `${url}?${new URLSearchParams(payload)}` : url,
            headers: headers,
        };

        if (method === 'post') {
            requestOptions.json = payload;
        }

        if (url_name === 'ai_query') {
            const { result, headers } = await this.request(requestOptions);
            // The raw body is in `result` for text/event-stream. Return it as `body`.
            return { result: null, body: result, headers: headers };
        }

        let { result, headers: resHeaders } = await this.request(requestOptions);
        return { result, headers: resHeaders };
    }

  async dosign_cloud(taskcode, taskName) {
      if (!await this.get_userticket_cloud(false)) return;
      const payload = { "taskCode": taskcode };
      
      let { result: res } = await this.cloudRequest('dosign', payload, false);

      if (res?.code?.includes('0000') && res?.data?.score) {
          this.log(`云盘任务: ✅ [${taskName}] 完成, 获得积分: ${res.data.score}`);
      } else {
          this.log(`云盘任务: ❌ [${taskName}] 失败: ${JSON.stringify(res)}`);
      }
  }

  async toFinish_cloud(taskcode, taskName, is_changer) {
      if (!await this.get_userticket_cloud(is_changer)) return null;
      const payload = { "taskCode": taskcode };
      
      let { result: res } = await this.cloudRequest('toFinish', payload, is_changer);

      if (res?.code === "0000") return true;
      this.log(`云盘任务: ❌ [${taskName}] toFinish失败: ${JSON.stringify(res)}`);
      return false;
  }

  async doUpload_cloud(taskcode, taskName) {
      if (!await this.get_userticket_cloud(false)) return;
      const payload = {
          "batchNo": "D94628B6C8593D2C6A4B52D0A5F009F4", "deviceId": "", "directoryId": "0", "familyId": 0,
          "fileModificationTime": 1736861613000, "fileName": "mmexport1736861613242.jpg", "fileSize": "280800",
          "fileType": "1", "height": "1174", "lat": "", "lng": "", "psToken": "",
          "sha256": "9c75f5be16bbb4e17788180dfdf4b1d53ba590cb8f4c629e4b337f5f54565949",
          "spaceType": "0", "width": "986"
      };
      
      let { result: res } = await this.cloudRequest('doUpload', payload, false);

      if (res?.meta?.code === "0000") {
          await appName.wait(1000);
          return await this.doPopUp_cloud(taskcode, taskName, false);
      }
      this.log(`云盘任务: ❌ [${taskName}] 上传失败: ${JSON.stringify(res)}`);
      return false;
  }
  
  async activityList_cloud(taskcode, taskName) {
      if (!await this.get_userticket_cloud(true)) return;
      const payload = { "bizKey": "activityCenterPipeline", "bizObject": { "pageNo": 1 } };
      
      let { result: res } = await this.cloudRequest('activityList', payload, true);

      if (res?.meta?.code === 0 || res?.meta?.code === "0") {
          await appName.wait(2000);
          return await this.doPopUp_cloud(taskcode, taskName, true);
      }
      this.log(`云盘任务: ❌ [${taskName}] 浏览活动失败: ${JSON.stringify(res)}`);
      return false;
  }
  
  async doPopUp_cloud(taskcode, taskName, is_changer) {
      if (!await this.get_userticket_cloud(is_changer)) return;
      const payload = {};
      await appName.wait(5500);

      let { result: res } = await this.cloudRequest('doPopUp', payload, is_changer);

      if ((res?.meta?.code === "0000" || res?.meta?.code === 0) || (res?.code === "0000" || res?.code === 0)) {
          const score = parseInt(res?.data?.score || "0", 10);
          this.log(`云盘任务: ✅ [${taskName}] 完成, ${score > 0 ? `获得积分: ${score}` : '未获得积分'}`);
          return true;
      }
      this.log(`云盘任务: ❌ [${taskName}] 领取奖励失败: ${JSON.stringify(res)}`);
      return false;
  }
  
  async get_ShareFileDispatcher_cloud(taskCode, taskName) {
      const timestamp = Date.now().toString();
      const randomSeq = Math.floor(Math.random() * (199999 - 123456 + 1)) + 123456;
      const string_to_hash = "ShareFile" + timestamp + randomSeq + "wohome";
      const md5Hash = cryptoJS.MD5(string_to_hash).toString();

      const data = { "fileIds": "f89417024f2642a399fd33f2beebd7c2", "fileFolderIds": "", "days": 7, "clientId": "1001000003" };
      const encrypted = this.encrypt_data_cloud(data, this.cloudDisk.userToken);
      
      const payload = {
          "header": { "key": "ShareFile", "resTime": timestamp, "reqSeq": randomSeq, "channel": "wohome", "version": "", "sign": md5Hash },
          "body": { "clientId": "1001000003", "param": JSON.stringify(encrypted), "secret": true }
      };

      const headers = { 'client-id': "1001000174", 'x-yp-client-id': "1001000174" };

      let { result: res } = await this.cloudRequest('ltypDispatcher', payload, false, 'post', headers);

      if (res?.STATUS === "200" || res?.STATUS === 200) {
          await this.doPopUp_cloud(taskCode, taskName, false);
      } else {
          this.log(`云盘任务: ❌ [${taskName}] 分享失败: ${JSON.stringify(res)}`);
      }
  }

  async do_ai_interaction_cloud(taskCode, taskName) {
      this.log("云盘任务: 执行AI通通查询请求...");
      const payload = { "input": "Hi", "platform": 1, "modelId": 0, "tag": 0, "conversationId": "", "knowledgeId": "", "referFileInfo": [] };
      
      let { body } = await this.cloudRequest('ai_query', payload, false, 'post');
      
      if (body && body.includes('"finish":1')) {
          this.log("云盘任务: AI通通查询请求成功");
          return await this.doPopUp_cloud(taskCode, taskName, false);
      }
      this.log(`云盘任务: ❌ AI通通查询请求失败: ${body}`);
      return false;
  }

  async do_ai_query_for_lottery_cloud() {
      this.log("云盘任务: DeepSeek对话请求, 以获取抽奖资格...");
      const payload = { "input": "Hi", "platform": 1, "modelId": 1, "tag": 0, "conversationId": "", "knowledgeId": "", "referFileInfo": [] };

      let { body } = await this.cloudRequest('ai_query', payload, false, 'post');

      if (body && body.includes('"finish":1')) {
          this.log("云盘任务: DeepSeek对话请求成功");
          return true;
      } else {
          this.log(`云盘任务: ❌ DeepSeek对话请求失败: ${body}`);
          return false;
      }
  }

  async check_lottery_times_cloud() {
      this.log("云盘任务: 正在查询抽奖次数...");
      let { result: res } = await this.cloudRequest('lottery_times', {}, false, 'get');
      if (res?.meta?.code === "200") {
          const times = parseInt(res.result || "0", 10);
          this.log(`云盘任务: 查询成功，剩余抽奖次数: ${times}`);
          return times;
      }
      this.log(`云盘任务: ❌ 查询抽奖次数失败: ${JSON.stringify(res)}`);
      return 0;
  }

  async get_ltyplottery_cloud(activityId_b64) {
      const payload = {
          "bizKey": "newLottery",
          "activityId": activityId_b64,
          "bizObject": { "lottery": { "activityId": activityId_b64, "type": 3 } }
      };

      let { result: res } = await this.cloudRequest('lottery', payload, false, 'post');
      if (res?.meta?.code === '200' && res?.result?.prizeName) {
          this.log(`云盘任务: ✅ 抽奖获得: ${res.result.prizeName}`);
          return true;
      }
      this.log(`云盘任务: ❌ 抽奖失败: ${JSON.stringify(res)}`);
      return false;
  }


  async sign_task() {
    await this.sign_getTelephone({ isInitial: true });
    await this.sign_getContinuous();
    await this.sign_getTaskList();
    await this.sign_getTelephone();
  }
  async ttlxj_task() {
    this.rptId = "";
    let targetUrl = "https://epay.10010.com/ci-mps-st-web/?webViewNavIsHidden=webViewNavIsHidden",
      {
        ticket: ticket,
        type: type,
        loc: location
      } = await this.openPlatLineNew(targetUrl);
    if (!ticket) {
      return;
    }
    await this.ttlxj_authorize(ticket, type, location);
  }
  async epay_28_task() {
    this.rptId = "";
    let currentDay = new Date().getDate();
    if (currentDay >= 26 && currentDay <= 28) {
      await this.epay_28_authCheck();
      if (appMonth_28_share.length) {
        let randomShareCode = appName.randomList(appMonth_28_share);
        await this.appMonth_28_bind(randomShareCode);
      }
      await this.appMonth_28_queryChance();
    }
  }
  async draw_28_task() {
    let currentDay = new Date().getDate();
    currentDay == 28 && (await this.draw_28_queryChance());
  }
  async act_517_task() {
    let startTime = new Date("2024-05-10 00:00:00"),
      endTime = new Date("2024-06-09 00:00:00"),
      currentTime = Date.now();
    if (currentTime > startTime.getTime() && currentTime < endTime.getTime()) {
      if (act_517_share.length) {
        let randomShareCode = appName.randomList(act_517_share);
        await this.act_517_bind(randomShareCode);
      }
      await this.act_517_userAccount();
    }
  }
  async card_618_task() {
    let startTime = new Date("2024-05-31 00:00:00"),
      endTime = new Date("2024-06-21 00:00:00"),
      currentTime = Date.now();
    currentTime > startTime.getTime() && currentTime < endTime.getTime() && (this.rptId = "", await this.card_618_authCheck());
  }
  async flmf_task() {
    if (this.city.filter(cityInfo => cityInfo.proCode == "091").length == 0) {
      return;
    }
    let targetUrl = "https://weixin.linktech.hk/lv-web/handHall/autoLogin?actcode=welfareCenter",
      {
        loc: location
      } = await this.openPlatLineNew(targetUrl);
    if (!location) {
      return;
    }
    await this.flmf_login(location);
  }

  async ltzf_task() {
    let targetUrl = new URL("https://wocare.unisk.cn/mbh/getToken");
    targetUrl.searchParams.append("channelType", serviceLife);
    targetUrl.searchParams.append("homePage", "home");
    targetUrl.searchParams.append("duanlianjieabc", "qAz2m");
    let urlString = targetUrl.toString(),
      {
        ticket: ticket
      } = await this.openPlatLineNew(urlString);
    if (!ticket) {
      return;
    }
    if (!(await this.wocare_getToken(ticket))) {
      return;
    }
    for (let activity of wocareActivities) {
      await this.wocare_getDrawTask(activity);
      await this.wocare_loadInit(activity);
    }
  }

  // 重写后的联通阅读任务入口
  async woread_task() {
    this.log("============= 联通阅读 =============");
    
    // 1. 登录 (woread_login 内部已经包含了 woread_auth)
    if (!await this.woread_login()) {
        this.log("阅读专区: 登录失败，跳过任务");
        return;
    }

    // 2. 执行阅读 (对应 Python 的 read_novel)
    await this.woread_read_process();
    await appName.wait(3000);

    // 3. 抽奖 (对应 Python 的 cj)
    await this.woread_draw_new();
    await appName.wait(3000);

    // 4. 查询红包余额 (对应 query_red)
    await this.woread_queryTicketAccount();
    
    this.log("============= 联通阅读执行完毕 =============");
  }

  // 旧的挂机任务，已废弃
  async woread_reading_task() { }
  
async userLoginTask() {
    // 1. 【改回】先尝试设置代理
    // set_proxy_ip 内部已经包含了“连通性测试”和“失败自动回退本地”的逻辑
    // 所以直接调用即可，不用担心代理挂了导致无法登录
    await this.set_proxy_ip();

    // 2. 然后再执行登录，此时使用的就是代理IP（如果获取成功的话）
    if (!(await this.onLine())) {
      return;
    }
    
    return;
  }
// ============================================
  // 抢50话费券 整合逻辑 START
  // ============================================

  // 1. 获取动态活动URL
  async grab50_getTaskUrl() {
    try {
      const requestOptions = {
        fn: "grab50_getTaskUrl",
        method: "get",
        url: "https://activity.10010.com/activityRecharge/task/flowManagement",
        headers: {
          "Cookie": `ecs_token=${this.ecs_token}`,
          "Origin": "https://activity.10010.com",
          "Referer": "https://activity.10010.com/"
        }
      };
      const { result } = await this.request(requestOptions);
      // 查找目标任务的跳转链接
      const task = result?.data?.urlList?.find(v => v.taskId === GRAB_50_TASK_ID);
      return task?.url || null;
    } catch (e) {
      this.log(`抢50话费: 获取活动链接失败: ${e.message}`);
      return null;
    }
  }

  // 2. 执行抢购请求
  async grab50_doRequest(url) {
    try {
      const requestOptions = {
        fn: "grab50_doRequest",
        method: "get",
        url: url,
        searchParams: { taskId: GRAB_50_TASK_ID },
        headers: {
          "Cookie": `ecs_token=${this.ecs_token}`,
          "Origin": "https://activity.10010.com",
          "Referer": "https://activity.10010.com/"
        },
        // 抢购接口速度优先，设置较短超时
        timeout: 5000 
      };
      
      const { result } = await this.request(requestOptions);
      
      // 映射返回状态
      if (result?.code === "0108") return "NO_STOCK"; // 库存不足
      if (result?.code === "0109") return "LIMITING"; // 接口限流
      if (result?.code === "0000" && result?.data?.uuid) return { status: "SUCCESS", uuid: result.data.uuid };
      
      return { status: "ERROR", msg: result?.desc || result?.message };
    } catch (e) {
      return { status: "ERROR", msg: e.message };
    }
  }

  // 3. 查询中奖结果
  async grab50_queryWin(uuid) {
    try {
      const requestOptions = {
        fn: "grab50_queryWin",
        method: "get",
        url: "https://activity.10010.com/activityRecharge/task/winningRecord",
        searchParams: { uuid: uuid },
        headers: { "Cookie": `ecs_token=${this.ecs_token}` }
      };
      const { result } = await this.request(requestOptions);
      return result;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

// 4. 任务主入口
  async grab50_task() {
    // 这里加个时间判断，避免全天运行浪费资源
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    
    // 定义早场时间 (9:58 - 10:10)
    const isMorning = (hour === 9 && minutes >= 58) || (hour === 10 && minutes <= 10);
    // 定义晚场时间 (17:58 - 18:10)
    const isEvening = (hour === 17 && minutes >= 58) || (hour === 18 && minutes <= 10);

    // 如果既不是早场也不是晚场，则跳过
    if (!isMorning && !isEvening) {
        this.log("抢50话费: 当前不在抢购时间段(10点/18点)，跳过");
        return;
    }

    this.log("============= 抢50话费券 =============");
    if (!this.ecs_token) {
        this.log("抢50话费: 缺少 ecs_token，跳过");
        return;
    }

    const taskUrl = await this.grab50_getTaskUrl();
    if (!taskUrl) {
        this.log("抢50话费: 未获取到活动URL，可能活动未开始或已结束");
        return;
    }

    this.log(`抢50话费: 获取链接成功，开始循环抢购...`);
    
    let stopped = false;
    let count = 0;
    // 设置最大循环次数防止死循环，比如抢500次或者直到库存没了
    const max_loops = 500; 

    while (!stopped && count < max_loops) {
        count++;
        // 调用抢购
        const res = await this.grab50_doRequest(taskUrl);
        
        if (res === "NO_STOCK") {
            this.log(`抢50话费: ❌ 库存不足(0108)，停止抢购`);
            stopped = true;
        } else if (res === "LIMITING") {
            this.log(`抢50话费: ⚠️ 接口限流(0109)，继续重试...`);
            // 限流时稍微等待一下
            await appName.wait(500); 
        } else if (typeof res === 'object' && res.status === "SUCCESS") {
            this.log(`抢50话费: 🎉 抢购成功！UUID: ${res.uuid}`, { notify: true });
            const winInfo = await this.grab50_queryWin(res.uuid);
            if (winInfo) {
                this.log(`抢50话费: 奖品详情: ${JSON.stringify(winInfo.data)}`, { notify: true });
            }
            stopped = true; // 抢到后停止
        } else if (typeof res === 'object' && res.status === "ERROR") {
            // 只是普通错误，打印一下继续
            // console.log(`抢购第${count}次: ${res.msg}`);
        }

        // 适当的间隔，防止IP被封太快，根据需要调整
        await appName.wait(200); 
    }
    this.log(`抢50话费: 任务结束，共执行 ${count} 次请求`);
  }
  
  // ============================================
  // 抢50话费券 整合逻辑 END
  // ============================================
async userTask() {
    // 修改日志标题，包含手机号
    appName.log(`\n------------------ 账号[${this.index}][${maskStr(this.name)}] ------------------`);
    this.log = (message, options = {}) => super.log(message, { ...options, hideName: true });

    // ==========================================
    // 🕒 智能时间判断逻辑 (极速模式)
    // ==========================================
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 判断是否处于抢券高峰期 (09:55 - 10:10)
    const isRushHour = (hour === 9 && minute >= 55) || (hour === 10 && minute <= 10);

    if (isRushHour) {
        this.log(`🚨 [极速模式] 检测到临近10点抢购时间 (${hour}:${minute < 10 ? '0' + minute : minute})`);
        this.log(`🚀 已自动屏蔽签到、阅读、云盘等普通任务，全力抢50话费券！`);
        
        // 核心：只运行抢券
        await this.grab50_task();
        
        this.log(`🏁 [极速模式] 抢购流程结束，脚本退出。`);
        return; // <--- 关键：直接返回，不再执行下方任何代码
    }

    // ==========================================
    // 🍵 下面是日常任务模式 (非抢购时间运行)
    // ==========================================
    this.log(`🍵 当前非抢购高峰期，开始执行全套日常任务...`);

    // 依然调用一下，防止万一想测试（grab50_task 内部还有一道时间锁，不用担心）
    await this.grab50_task(); 

    if (!signDisabled) {
      await this.sign_task();
    }
    await this.ttlxj_task();
    if (!ltzfDisabled) {
      await this.ltzf_task();
    }
    await this.marketTask();
    await this.woread_task();
    await this.securityButlerTask();
    await this.ltyp_task();
  }
  async userTestTask() {
    appName.log("\n------------------ 账号[" + this.index + "] ------------------");
  }
}
!(async () => {
  // 读取环境变量
  appName.read_env(CustomUserService);

  appName.log("\n------------------------------------");
  appName.log("首页签到设置为: " + (signDisabled ? "不" : "") + "运行");
  appName.log("联通祝福设置为: " + (ltzfDisabled ? "不" : "") + "运行");
  appName.log("------------------------------------\n");

  // ==========================================
  // 第一步：统一预登录
  // 目的：1. 过滤无效账号 2. 为抢购模式做好准备
  // ==========================================
  appName.log("🚀 [准备阶段] 正在依次预登录所有账号...");
  
  for (let user of appName.userList) {
    await user.userLoginTask(); // 获取IP并登录
    await appName.wait(1000); 
  }

  // 筛选出初次登录成功的账号
  const validUsers = appName.userList.filter(u => u.valid);
  appName.log(`✅ 预登录完成，有效账号数：${validUsers.length}/${appName.userList.length}`);

  if (validUsers.length === 0) {
    appName.log("❌ 无有效账号，脚本退出");
    return;
  }

  // ==========================================
  // 第二步：判断时间，决定执行模式
  // ==========================================
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // 早场：09:55 - 10:10
  const isMorningRush = (hour === 9 && minute >= 55) || (hour === 10 && minute <= 10);
  // 晚场：17:55 - 18:10
  const isEveningRush = (hour === 17 && minute >= 55) || (hour === 18 && minute <= 10);

  if (isMorningRush || isEveningRush) {
    // ==========================================
    // 场景A：极速抢购模式 (并发)
    // ==========================================
    appName.log(`\n🚨🚨🚨 [极速并发抢购模式] 🚨🚨🚨`);
    appName.log(`检测到临近抢购时间 (10点或18点)，启动并发抢券！`);
    appName.log(`所有账号使用预登录状态同时请求...`);
    
    // 这里的 grab50_task 内部有时间锁，这里再次调用也没问题
    await Promise.all(validUsers.map(user => user.grab50_task()));
    
    appName.log(`\n🏁 [极速模式] 所有账号抢购结束`);

  } else {
    // ==========================================
    // 场景B：日常任务模式 (串行 + 刷新代理)
    // ==========================================
    appName.log(`\n🍵 [日常模式] 非抢购时间，转为串行执行日常任务`);
    appName.log(`💡 提示：为防止代理过期，执行每个账号前将重新获取IP`);
    
    for (let user of validUsers) {
      // ------------------------------------------------------
      // 【关键修改】在日常模式下，轮到该账号时，强制刷新代理和登录态
      // ------------------------------------------------------
      // 只有第一个账号且刚预登录不久，其实可以跳过刷新，但为了逻辑统一和稳妥，建议全部刷新
      appName.log(`\n🔄 正在刷新账号[${user.index}]的代理与登录状态...`);
      await user.userLoginTask(); 

      // 再次检查登录是否成功（防止刷新代理失败）
      if (user.valid) {
          await user.userTask();
      } else {
          appName.log(`⚠️ 账号[${user.index}] 刷新登录失败，跳过任务`);
      }
      
      // 账号间休息，避免并发过高
      await appName.wait(2000);
    }
  }

})().catch(error => appName.log(error)).finally(() => appName.exitNow());


function createLogger(UserClass) {
    return new class {
      constructor(name) {
        this.name = name;
        this.startTime = Date.now();
        this.log("[" + this.name + "]开始运行\n", { time: true });
        this.notifyStr = [];
        this.notifyFlag = true;
        this.userIdx = 0;
        this.userList = [];
        this.userCount = 0;
        this.default_timestamp_len = 13;
        this.default_wait_interval = 1000;
        this.default_wait_limit = 3600000;
        this.default_wait_ahead = 0;
      }
      log(message, options = {}) {
        const defaultOptions = { console: true, ...options };
        if (defaultOptions.time) {
          let format = defaultOptions.fmt || "hh:mm:ss";
          message = "[" + this.time(format) + "]" + message;
        }
        if (defaultOptions.notify) {
          this.notifyStr.push(message);
        }
        if (defaultOptions.console) {
          console.log(message);
        }
      }
      get(object, key, defaultValue = "") {
        return object?.hasOwnProperty(key) ? object[key] : defaultValue;
      }
      pop(object, key, defaultValue = "") {
        if (object?.hasOwnProperty(key)) {
          const value = object[key];
          delete object[key];
          return value;
        }
        return defaultValue;
      }
      copy(source) {
        return { ...source };
      }
      read_env(UserClass) {
        const envValues = cookieVars.map(varName => process.env[varName]);
        for (const envValue of envValues.filter(value => !!value)) {
          const delimitersFound = delimiters.filter(delimiter => envValue.includes(delimiter));
          const delimiter = delimitersFound.length > 0 ? delimitersFound[0] : delimiters[0];
          for (const userInfo of envValue.split(delimiter).filter(value => !!value)) {
            this.userList.push(new UserClass(userInfo));
          }
        }
        this.userCount = this.userList.length;
        if (!this.userCount) {
          this.log("未找到变量，请检查变量" + cookieVars.map(varName => "[" + varName + "]").join("或"), { notify: true });
          return false;
        }
        this.log("共找到" + this.userCount + "个账号");
        return true;
      }
      async threads(methodName, context, options = {}) {
        while (context.idx < appName.userList.length) {
          const user = appName.userList[context.idx++];
          if (user.valid) {
            await user[methodName](options);
          }
        }
      }
      async threadTask(methodName, count) {
        const tasks = [];
        const context = { idx: 0 };
        while (count--) {
          tasks.push(this.threads(methodName, context));
        }
        await Promise.all(tasks);
      }
      time(format, date = null) {
        const currentDate = date ? new Date(date) : new Date();
        const timeElements = {
          "M+": currentDate.getMonth() + 1,
          "d+": currentDate.getDate(),
          "h+": currentDate.getHours(),
          "m+": currentDate.getMinutes(),
          "s+": currentDate.getSeconds(),
          "q+": Math.floor((currentDate.getMonth() + 3) / 3),
          S: this.padStr(currentDate.getMilliseconds(), 3)
        };
        if (/(y+)/.test(format)) {
          format = format.replace(RegExp.$1, (currentDate.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (const key in timeElements) {
          if (new RegExp("(" + key + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? timeElements[key] : ("00" + timeElements[key]).substr(("" + timeElements[key]).length));
          }
        }
        return format;
      }
      async showmsg() {
        let notifyBody = "";
        // 遍历所有用户，聚合他们的通知日志
        for (const user of this.userList) {
          if (user.notifyLogs.length > 0) {
            const userHeader = `------------------ 账号[${user.index}][${maskStr(user.name)}] ------------------`;
            // 移除每条日志中的手机号前缀，因为标题中已经包含了
            const userLogs = user.notifyLogs.map(log => log.replace(`[${user.name}]`, '')).join("\n");
            notifyBody += `${userHeader}\n${userLogs}\n`;
          }
        }

        if (this.notifyFlag && notifyBody) {
          const notify = require("./sendNotify");
          this.log("\n============== 推送 ==============");
          await notify.sendNotify(this.name, notifyBody);
        }
      }
      padStr(value, length, options = {}) {
        const padding = options.padding || "0";
        const mode = options.mode || "l";
        let strValue = String(value);
        const paddingLength = length > strValue.length ? length - strValue.length : 0;
        const paddingStr = padding.repeat(paddingLength);
        return mode === "r" ? strValue + paddingStr : paddingStr + strValue;
      }
      json2str(json, delimiter, encode = false) {
        return Object.keys(json)
          .sort()
          .map(key => {
            let value = json[key];
            return `${key}=${encode && value ? encodeURIComponent(value) : value}`;
          })
          .join(delimiter);
      }
      str2json(str, decode = false) {
        const json = {};
        str.split("&").forEach(pair => {
          if (pair) {
            const [key, value] = pair.split("=");
            json[key] = decode ? decodeURIComponent(value) : value;
          }
        });
        return json;
      }
      randomPattern(pattern, charset = "abcdef0123456789") {
        return pattern.split("").map(char => {
          if (char === "x") {
            return charset.charAt(Math.floor(Math.random() * charset.length));
          } else if (char === "X") {
            return charset.charAt(Math.floor(Math.random() * charset.length)).toUpperCase();
          }
          return char;
        }).join("");
      }
      randomUuid() {
        return appName.randomPattern("xxxxxxxx-xxxx-4xxx-4xxx-xxxxxxxxxxxx");
      }
      randomString(length, charset = "abcdef0123456789") {
        return Array.from({ length }, () => charset.charAt(Math.floor(Math.random() * charset.length))).join("");
      }
      randomList(list) {
        return list[Math.floor(Math.random() * list.length)];
      }
      wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      async exitNow() {
        await this.showmsg();
        const endTime = Date.now();
        const duration = (endTime - this.startTime) / 1000;
        this.log("");
        this.log("[" + this.name + "]运行结束，共运行了" + duration + "秒", { time: true });
        process.exit(0);
      }
      normalize_time(time, options = {}) {
        const length = options.len || this.default_timestamp_len;
        time = time.toString();
        while (time.length < length) {
          time += "0";
        }
        return parseInt(time.slice(0, 13));
      }

      async wait_gap_interval(lastWaitTime, interval) {
        const elapsedTime = Date.now() - lastWaitTime;
        if (elapsedTime < interval) {
          await this.wait(interval - elapsedTime);
        }
      }
    }(UserClass);
  }
