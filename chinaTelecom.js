// @Date: 2025-09-19
// @LastEditTime: 2025-09-22

/*
中国联通 

包含以下功能:

首页签到, 立减金打卡,联通祝福,权益超市浇花+抽奖


首页签到默认运行, 需要关闭的设置变量 chinaUnicomSign='false'
联通祝福默认运行, 需要关闭的设置变量 chinaUnicomLtzf='false'

定时每天两三次
需要在联通APP中选择退出登录-切换账号登录, 捉下面这个包
https://m.client.10010.com/mobileService/onLine.htm
把请求体(body)里面的token_online参数填到变量 chinaUnicomCookie 里, 多账号换行或&或@隔开:
export chinaUnicomCookie="a3e4c1ff25da2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

From:yaohuo28507
cron: 0 0,7,20 * * *
const $ = new Env("中国联通");
*/
const fs = require('fs');
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
  retryCount = 3;
const version = 2.08,
  projectName = "chinaUnicom",
  validCodeUrl = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json",
  projectCodeUrl = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/" + projectName + ".json",
  retryDelay = 5,
  appVersion = "iphone_c@11.0503",
  userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:" + appVersion + "}",
  appId = "86b8be06f56ba55e9fa7dff134c6b16c62ca7f319da4a958dd0afa0bf9f36f1daa9922869a8d2313b6f2f9f3b57f2901f0021c4575e4b6949ae18b7f6761d465c12321788dcd980aa1a641789d1188bb",
  deviceCode="866265039370040",
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
let ltyp_lottery = [],
  appMonth_28_share = [],
  act_517_share = [],
  moonbox_activeId = null,
  woread_draw_id = [6640, 6641];
const expiration_time = 7,
  appMonth_28_MaxTimes = 5,
  maxDrawTimes = 5,
  _0x3484cf = {
    ttlxj: "TTLXJ20210330",
    card_618: "NZJK618CJHD"
  };
const _0x166d60 = {
  name: "星座配对",
  id: 2
};
const _0x5a4a00 = {
  name: "大转盘",
  id: 3
};
const _0x1b5ea0 = {
  name: "盲盒抽奖",
  id: 4
};
const _0x4376d8 = [_0x166d60, _0x5a4a00, _0x1b5ea0],
  _0x1c214d = {
    ZFGJBXXCY1: "空气",
    GJBNZJK19: "[6]",
    GJBNZJK20: "[1]",
    GJBNZJK21: "[8]",
    GJBNZJK22: "[狂]",
    GJBNZJK23: "[欢]"
  };
const _0x10ec87 = {
  "抽奖": "01",
  "首次进入": "02",
  "卡片合成": "03",
  "瓜分奖励": "04"
};
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
    if (this.name) {
      logPrefix += `[${this.name}]`;
    }

    appName.log(logPrefix + message, options);
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

        // Calculate delay times
        const delayFactor1 = Math.max(this.index - 2, 0);
        const delayFactor2 = Math.min(Math.max(this.index - 2, 1), 4);
        const delayFactor3 = Math.min(Math.max(this.index - 4, 1), 5);
        const delay1 = delayFactor1 * delayFactor2 * delayFactor3 * delayFactor3 * 600;
        const delay2 = delayFactor1 * delayFactor2 * delayFactor3 * delayFactor3 * 4000;
        const totalDelay = delay1 + Math.floor(Math.random() * delay2);

        const retryDelay1 = this.index * (this.index - 1) * 3000;
        const retryDelay2 = (this.index - 1) * (this.index - 1) * 5000;
        const retryTotalDelay = retryDelay1 + Math.floor(Math.random() * retryDelay2);

        const userDelayFactor1 = Math.max(appName.userCount - 2, 0);
        const userDelayFactor2 = Math.max(appName.userCount - 3, 0);
        const userDelay1 = userDelayFactor1 * 400;
        const userDelay2 = userDelayFactor2 * 1000;
        const userTotalDelay = userDelay1 + Math.floor(Math.random() * userDelay2);

        const finalDelay = totalDelay + retryTotalDelay + userTotalDelay;

        await appName.wait(0);
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
    this.cookieJar = new cookieJar();
    const defaultHeaders = {
      "User-Agent": userAgent
    };
    this.got = this.got.extend({
      cookieJar: this.cookieJar,
      headers: defaultHeaders
    });
    let deftokenParts = tokenString.split("#");
    this.token_online = deftokenParts[0];
    this.unicomTokenId = appName.randomString(32);
    this.tokenId_cookie = "chinaunicom-" + appName.randomString(32, numbers + letters).toUpperCase();
    this.rptId = "";
    this.city = [];
    this.t_flmf_task = 0;
    this.t_woread_draw = 0;
    this.need_read_rabbit = false;
    this.moonbox_task_record = {};
    this.moonbox_notified = [];
    this.set_cookie("TOKENID_COOKIE", this.tokenId_cookie);
    this.set_cookie("UNICOM_TOKENID", this.unicomTokenId);
    this.set_cookie("sdkuuid", this.unicomTokenId);
  }
  set_cookie(cookieName, cookieValue, options = {}) {
    let domain = options?.domain || "10010.com",
      currentUrl = options?.currentUrl || "https://epay.10010.com";
    super.set_cookie(cookieName, cookieValue, domain, currentUrl, options);
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
      xindunTokenId: this.sdkuuid
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
    let loginSuccess = false;
    const filePath = path.join(__dirname, 'chinaUnicom_cache.json');
  
    try {
      // 请求服务器
      let requestOptions = {
        fn: "onLine",
        method: "post",
        url: "https://m.client.10010.com/mobileService/onLine.htm",
        form: {
          token_online: this.token_online,
          reqtime: appName.time("yyyy-MM-dd hh:mm:ss"),
          appId: appId,
          version: appVersion,
          step: "bindlist",
          isFirstInstall: 0,
          deviceModel: "iPhone",
          deviceCode: deviceCode
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
      }
    } catch (error) {
      console.log(error);
      this.log("发生异常：" + error.message);
    } finally {
      return loginSuccess;
    }
  }

  async getMarketTicket(options = {}) {
    try {
      // 获取权益超市的ticket
      const targetUrl = "https://contact.bol.wo.cn/";
      const { ticket, type, loc } = await this.openPlatLineNew(targetUrl);
      
      if (ticket) {
        this.market_ticket = ticket;
        this.market_ticket_type = type;
        // this.log("获取权益超市ticket成功");
        return { ticket, type };
      } else {
        this.log("获取权益超市ticket失败");
        return null;
      }
    } catch (error) {
      console.log(error);
      this.log("获取权益超市ticket异常：" + error.message);
      return null;
    }
  }


  async marketUnicomLogin(options = {}) {
    let loginSuccess = false;
    const filePath = path.join(__dirname, 'chinaUnicom_cache.json');
    
    try {
      
      
      // 先获取ticket
      const ticketInfo = await this.getMarketTicket();
      if (!ticketInfo || !ticketInfo.ticket) {
        this.log("权益超市登录失败：无法获取ticket");
        return false;
      }
      
      const { ticket, type } = ticketInfo;
      const yGdtco4rParam = options.yGdtco4r || appName.randomString(800, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-");
      
      // 保存yGdtco4r参数供后续任务执行使用
      this.market_task_yGdtco4r = yGdtco4rParam;
      
      // 构建请求体
      const requestBody = {
        ticket: ticket
      };
      const requestOptions = {
        fn: "marketUnicomLogin",
        method: "post",
        url: `https://backward.bol.wo.cn/prod-api/auth/marketUnicomLogin?yGdtco4r=${yGdtco4rParam}`,
        headers: {
          "Host": "backward.bol.wo.cn",
          "Connection": "keep-alive",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "sec-ch-ua-platform": '"Android"',
          "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36; unicom{version:android@11.0000,desmobile:0};devicetype{deviceBrand:OnePlus,deviceModel:ONEPLUS A5000}",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Android WebView";v="138"',
          "Content-type": "application/x-www-form-urlencoded",
          "sec-ch-ua-mobile": "?1",
          "Accept": "*/*",
          "Origin": "https://contact.bol.wo.cn",
          "X-Requested-With": "com.sinovatech.unicom.ui",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://contact.bol.wo.cn/",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        },
        form: requestBody
      };
      
      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
      
      if (responseCode == 200) {
        loginSuccess = true;
        const data = responseData?.data;
        this.market_token = data?.token;
        this.market_refresh_token = data?.refreshToken;
        this.market_user_id = data?.userId;
        this.market_mobile = data?.mobile;
        
        // this.log("权益超市登录成功，用户ID: " + data?.userId);
        this.log("权益超市登录成功");
        
      } else {
        let errorMessage = responseData?.msg || "未知错误";
        this.log("权益超市登录失败[" + responseCode + "]: " + errorMessage);
      }
      
    } catch (error) {
      console.log(error);
      this.log("权益超市登录发生异常：" + error.message);
    } finally {
      return loginSuccess;
    }
  }

  async marketGetAllActivityTasks(options = {}) {
    try {
      if (!this.market_token) {
        this.log("权益超市未登录，跳过任务");
        return null;
      }

      // 使用固定的已验证yGdtco4r参数 - 从QIIFE7RpzIttP Cookie中提取的有效值
      const yGdtco4rParam = "0vvi1iqEqWlxNVw0UpScxDPE31.IXh4OYs07.5n2OLIQHTDaFdWyPtKpnbhG0B7Hp2etvkbTAtEmA5oWNT85S62sdiSZgdNk8DMeCc6PssSJP968RuDLNtzYMErmby5pRgb7z6i.8QzDVgpsHEVnMbNbeUDz.kOy8YzVUuT4IDX_nZcTztPiUxVTfIie6RtXMtcfxbmCQWRKegNtdYh4w9Qz7Gvgo7DqlPbasjMIyIJjAW.nxkcNhsc3oQoZ5q4e.vDlY2hlc8eqpGElxfFHfNftWh2TcRM_dwNUmh2KMfqMo4NYOJWPAhIq4SJp0bYttV1Nl230bPYgZQ5Lh9NevyoDzaanm98Jp3_l0bRYe8YaFt1sx0lMlzob7uGd3O3Q0Zi0fq2sPH7hXChyRKyr_qf2scE8A5mxQlKOKxMT5UnYUQPFXPt4k5Mr7xpUfvTG0eqcGHEB.gdYvlGbGHmjqX4U11_j49Z9Rrd5CJ47MQmrU6Gu4qL2tBTsm3BnxF7mzAbRUFTOf4VjM";
      
      // 保存yGdtco4r参数供后续任务执行使用
      this.market_yGdtco4r = yGdtco4rParam;
      
      const requestOptions = {
        fn: "marketGetAllActivityTasks",
        method: "get",
        url: `https://backward.bol.wo.cn/prod-api/promotion/activityTask/getAllActivityTasks?yGdtco4r=${yGdtco4rParam}`,
        headers: {
          "Host": "backward.bol.wo.cn",
          "Connection": "keep-alive",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "sec-ch-ua-platform": '"Android"',
          "Authorization": `Bearer ${this.market_token}`,
          "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36; unicom{version:android@11.0000,desmobile:0};devicetype{deviceBrand:OnePlus,deviceModel:ONEPLUS A5000}",
          "Accept": "application/json, text/plain, */*",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Android WebView";v="138"',
          "sec-ch-ua-mobile": "?1",
          "Origin": "https://contact.bol.wo.cn",
          "X-Requested-With": "com.sinovatech.unicom.ui",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://contact.bol.wo.cn/",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      };
      
      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
      
      if (responseCode == 200) {
        const data = responseData?.data;
        this.log("获取权益超市任务列表成功");
        return data;
      } else {
        let errorMessage = responseData?.msg || "未知错误";
        this.log("获取权益超市任务列表失败[" + responseCode + "]: " + errorMessage);
        return null;
      }
      
    } catch (error) {
      console.log(error);
      this.log("获取权益超市任务列表异常：" + error.message);
      return null;
    }
  }



  async marketGetRaffleCount(options = {}) {
    try {
      if (!this.market_token) {
        return 0;
      }

      // 使用从QIIFE7RpzIttP Cookie中提取的有效yGdtco4r参数
      // 注意：这个值不能生成，只能从浏览器Cookie中提取
      const yGdtco4rParam = "0QDEN3AEqWlrU036_dbyBvP8.68dggpJ9Em3UEzaRWLwzFshel7nj1kEQxCiI.B_fIDMRTiEwAgmaG93mDGPLvSObw_.EMz5QG4wZp7CfpHt4y4WwUioW5NoIaRtTpiyNJN6ncFGlF607_haxxASNFfzwkxRl9XZq9UfHhGY.UCzebcoAawBTyh62PdjF.ka.HIygQuhbb16HitF0IfX_cdZc2wVsIUfLSnSYulZaLnoSo.7..nRFnMyydrDjQE4tfOT08heVczyyR6Bpn.ZazNvmNZD1EgfxCRTcQDUdHFb_XDfPbqvX2N0dtYdKgSV_1s5u8RlyUwXr1HlqKEpKb83uWfIPLaOpm3xFnKupjRqj1UoDz.vB0iRRkkYtAd8nPoY654drckOD7GEQQs79zJyMTZV_ExNU72MAqvZRdRUZZz8oho.t6WzyX5R2pOSrPRgO84hba3Ez52DbM_08n8qRm3bW1TaviGW1VEwQVH74R_Eo0pxoZDfHTbAGC3vAAzz7R8sqLVphu972XyCB72Ba1XGElelViYqGnG3p_SZ_LzzpQMJdGSa";
      
      const requestOptions = {
        fn: "marketGetRaffleCount",
        method: "post",
        url: `https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getUserRaffleCount?yGdtco4r=${yGdtco4rParam}`,
        headers: {
          "Host": "backward.bol.wo.cn",
          "Connection": "keep-alive",
          "Content-Length": "0",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "sec-ch-ua-platform": '"Android"',
          "Authorization": `Bearer ${this.market_token}`,
          "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36; unicom{version:android@11.0000,desmobile:0};devicetype{deviceBrand:OnePlus,deviceModel:ONEPLUS A5000}",
          "Accept": "application/json, text/plain, */*",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Android WebView";v="138"',
          "sec-ch-ua-mobile": "?1",
          "Origin": "https://contact.bol.wo.cn",
          "X-Requested-With": "com.sinovatech.unicom.ui",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://contact.bol.wo.cn/",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      };

      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
      
      if (responseCode == 200) {
        const raffleCount = responseData?.data || 0;
        this.log(`权益超市可抽奖次数: ${raffleCount}`, { notify: true });
        return raffleCount;
      } else {
        let errorMessage = responseData?.msg || "未知错误";
        this.log("获取权益超市抽奖次数失败[" + responseCode + "]: " + errorMessage);
        return 0;
      }
      
    } catch (error) {
      this.log(`获取权益超市抽奖次数异常: ${error.message}`);
      return 0;
    }
  }
  
  async marketTask() {
    try {
      if (!this.market_token) {
        this.log("权益超市未登录，跳过任务");
        return;
      }
          
        // 执行浇花任务
        await this.marketWateringTask();
        
        // 执行抽奖
        await this.marketRaffleTask();

    } catch (error) {
      console.log(error);
      this.log("权益超市任务执行异常：" + error.message);
    }
  }

  async marketGetWateringRecords(options = {}) {
    try {
      if (!this.market_token) {
        return null;
      }

      // 使用从QIIFE7RpzIttP Cookie中提取的有效yGdtco4r参数 - 查询浇花记录专用
      const yGdtco4rParam = "0kJCZralqWoOyRFK5MqCRO_TUwsNq0Ppki8vaPIf5e62R0LorZOJN77zrWgTodj2QrQ3fdTC7EurWtWW79tUyudhWDdBVfTL6Dhcyz.t1D0jdvEuLZl30dKq0C.ucANSVPXjvcTTJr6G";
      
      const requestOptions = {
        fn: "marketGetWateringRecords",
        method: "get",
        url: `https://backward.bol.wo.cn/prod-api/promotion/activityTaskRecord/getRangeRecordList?yGdtco4r=${yGdtco4rParam}`,
        headers: {
          "Host": "backward.bol.wo.cn",
          "Connection": "keep-alive",
          "sec-ch-ua-platform": '"Windows"',
          "Authorization": `Bearer ${this.market_token}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
          "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Microsoft Edge";v="140"',
          "Content-type": "application/json",
          "sec-ch-ua-mobile": "?0",
          "Accept": "*/*",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://backward.bol.wo.cn/market",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6"
        }
      };

      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
      
      if (responseCode == 200) {
        const data = responseData?.data;
        if (data && Array.isArray(data)) {
          return data;
        }
      } else {
        let errorMessage = responseData?.msg || "未知错误";
        this.log("获取浇花记录失败[" + responseCode + "]: " + errorMessage);
      }
      
      return null;
    } catch (error) {
      this.log(`获取浇花记录异常: ${error.message}`);
      return null;
    }
  }

  async marketGetWateringStatus(options = {}) {
    try {
      if (!this.market_token) {
        return null;
      }

      // 使用从QIIFE7RpzIttP Cookie中提取的有效yGdtco4r参数 - 查询浇花状态专用
      const yGdtco4rParam = "0hHgWnaEqWi0546ZdRfTeDqJdMBnv_KnzWG6CMU_1bgJe_DjIYJ6DF2QyCn39IVIop_Tl2MtZLEma_cOOBnd3rwlPuPDGi1VtWWYtqBx07xlMOjYRpb2aAZiH1jlx_PLjqQGzoPj1AUFWj9PwC1ELJq3oEw7mi.Vql7wNyVD4unkqvNgLlHPAB4jQSgOYaStVs9LtDqXn3Uw.6UKM2k1gpbGxW.lj8Oz0sNFL2dqf7HoG_5qG2_3427RzOlc8BTQC41UZTOVZWFgIzUN_5ieBSJuEPSrITbbJjOBKfau06OimtckkiRVxQAdTBLmSGvN0Iqp5sZcyRhPnAxWP7rDP1uWG5WMdzfW44SEwjr55XfNLUS.c7rSClxax2RBT3wP.xuYSxawy1OgFrQgIGLIJQx6.7LScnfvwchuTaf.aPkn53J2iXVfb6WPxm1BjYeFvjy1v8HuPMixeh3GGJPj_7rPLIbTUcsPYLwpLcdIbYU5bMjlqaxzfdbuUQnqAEUrh5Fqq2WUkHPwHTrnehvEbvBsn.YZksQODgRjV5Oa9lcbo5dD6fbPbO2E";
      
      const requestOptions = {
        fn: "marketGetWateringStatus",
        method: "get",
        url: `https://backward.bol.wo.cn/prod-api/promotion/activityTask/getMultiCycleProcess?activityId=13&yGdtco4r=${yGdtco4rParam}`,
        headers: {
          "Host": "backward.bol.wo.cn",
          "Connection": "keep-alive",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "sec-ch-ua-platform": '"Android"',
          "Authorization": `Bearer ${this.market_token}`,
          "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36; unicom{version:android@11.0000,desmobile:0};devicetype{deviceBrand:OnePlus,deviceModel:ONEPLUS A5000}",
          "Accept": "application/json, text/plain, */*",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Android WebView";v="138"',
          "sec-ch-ua-mobile": "?1",
          "Origin": "https://contact.bol.wo.cn",
          "X-Requested-With": "com.sinovatech.unicom.ui",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://contact.bol.wo.cn/",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      };

      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
      
      if (responseCode == 200) {
        const data = responseData?.data;
        if (data) {
          const triggeredTime = data.triggeredTime || 0;
          const triggerTime = data.triggerTime || 0;
          this.log(`浇花状态检查: ${triggeredTime}/${triggerTime}`, { notify: true });
          return data;
        }
      } else {
        let errorMessage = responseData?.msg || "未知错误";
        this.log("获取浇花状态失败[" + responseCode + "]: " + errorMessage);
      }
      
      return null;
    } catch (error) {
      this.log(`获取浇花状态异常: ${error.message}`);
      return null;
    }
  }

  async marketWatering(options = {}) {
    try {
      if (!this.market_token) {
        return false;
      }

              const requestOptions = {
          fn: "marketWatering",
          method: "post",
          url: "https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkWatering",
          noLoading: true,
        headers: {
          "Host": "backward.bol.wo.cn",
          "Connection": "keep-alive",
          "Content-Length": "2",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "sec-ch-ua-platform": '"Android"',
          "Authorization": `Bearer ${this.market_token}`,
          "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36; unicom{version:android@11.0000,desmobile:0};devicetype{deviceBrand:OnePlus,deviceModel:ONEPLUS A5000}",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Android WebView";v="138"',
          "Content-type": "application/json",
          "sec-ch-ua-mobile": "?1",
          "Accept": "*/*",
          "Origin": "https://contact.bol.wo.cn",
          "X-Requested-With": "com.sinovatech.unicom.ui",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://contact.bol.wo.cn/",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        },
        json: {}
      };

      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
      
      if (responseCode == 200) {
        const message = responseData?.msg || "浇水成功";
        this.log(`权益超市浇花: ${message}`);
        return true;
      } else {
        let errorMessage = responseData?.msg || "未知错误";
        this.log("权益超市浇花失败[" + responseCode + "]: " + errorMessage);
        return false;
      }
      
    } catch (error) {
      this.log(`权益超市浇花异常: ${error.message}`);
      return false;
    }
  }

  async marketWateringTask() {
    try {
      if (!this.market_token) {
        return;
      }

      // 获取浇花记录列表判断今日是否已浇花
      const wateringRecords = await this.marketGetWateringRecords();
      
      if (!wateringRecords) {
        this.log("获取浇花记录失败，跳过浇花");
        return;
      }

      // 获取今天的日期字符串 (YYYY-MM-DD)
      const today = new Date();
      const todayStr = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
      
      // 查找今天的浇花记录
      const todayRecord = wateringRecords.find(record => {
        if (record.createTime) {
          const recordDate = record.createTime.split(' ')[0]; // 取日期部分
          return recordDate === todayStr;
        }
        return false;
      });

      if (!todayRecord) {
        // 今日未浇花，执行浇花
        this.log("今日尚未浇花，开始执行浇花", { notify: true });
        const success = await this.marketWatering();
        
        if (success) {
          this.log("权益超市浇花完成", { notify: true });
        } else {
          this.log("权益超市浇花失败");
        }
      } else {
        // 今日已浇花，获取正确的浇花状态信息
        const wateringStatus = await this.marketGetWateringStatus();
        
        if (wateringStatus) {
          const triggeredTime = wateringStatus.triggeredTime || 0;
          const triggerTime = wateringStatus.triggerTime || 0;
          this.log(`今日浇花已完成，已浇花 ${triggeredTime}/${triggerTime} 次，浇花时间: ${todayRecord.createTime}`, { notify: true });
        } else {
          this.log(`今日浇花已完成，浇花时间: ${todayRecord.createTime}`, { notify: true });
        }
      }
      
    } catch (error) {
      this.log(`权益超市浇花任务异常: ${error.message}`);
    }
  }

  async marketRaffle(options = {}) {
    try {
      if (!this.market_token) {
        return false;
      }

      // 使用从QIIFE7RpzIttP Cookie中提取的有效yGdtco4r参数 - 执行抽奖专用
      const yGdtco4rParam = "0QgDw1GEqWlrU036_dbyBvP8.68dggpJ9Em3UEzaRWLwzFshel7nj1kEQxCiI.B_fIDMRTiEwAgmaoqRDUcMB02lgYQPCAFCba8gFHC.tOt7HgTxZYK9RE.F97mWLrjhVnYlqoN8J3po8lAf4nuZgZxrqLz7G5RwjhP7cN6MJqMz919_MDvcHYn6NwWXQSzGz5SeQ6gXKTjWH7e169QJLUmSffMJtRvnmSI_KAoFD1KO900oYqqNE6DT3Ldqrybha.30hJjF5xcVVGKG5PjvpDN6mh_OkWCUntXfjKcpHOiq.ihFEmTnbaizklLV9QFuwD7d_64uWO.ccQ_YBp9GGcRNUyedvs7aY349tZSdJUJMs5AxGNoRN9kBfA0fs5zcrT9nHG8j7qYcaEgq4ZCXkOHtGohgHad2DFiRfkhDH0vf0XA0iAczitXuNfNIrzql7wpGW3qduE7AwzbWxKpDrohiS_aikqbAInv00OAPevfIw8v23ugpy8URgEdXFWaBUA_ZYw6MCplOhwvSiHK0Js1hcBQSehpn2xwE3a6yaDjY3NxVZ.m5A4sG";
      
      const requestOptions = {
        fn: "marketRaffle",
        method: "post",
        url: `https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/userRaffle?yGdtco4r=${yGdtco4rParam}`,
        headers: {
          "Host": "backward.bol.wo.cn",
          "Connection": "keep-alive",
          "Content-Length": "0",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "sec-ch-ua-platform": '"Android"',
          "Authorization": `Bearer ${this.market_token}`,
          "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36; unicom{version:android@11.0000,desmobile:0};devicetype{deviceBrand:OnePlus,deviceModel:ONEPLUS A5000}",
          "Accept": "application/json, text/plain, */*",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Android WebView";v="138"',
          "sec-ch-ua-mobile": "?1",
          "Origin": "https://contact.bol.wo.cn",
          "X-Requested-With": "com.sinovatech.unicom.ui",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://contact.bol.wo.cn/",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      };

      let response = await this.request(requestOptions);
      let { result: responseData, statusCode: responseStatus } = response;
      let responseCode = appName.get(responseData, "code", responseStatus);
      
      if (responseCode == 200) {
        const data = responseData?.data;
        if (data) {
          const isWinning = data.isWinning;
          const prizesName = data.prizesName || "未中奖";
          const message = data.message;
          
          if (isWinning) {
            this.log(`权益超市抽奖成功: ${prizesName}`, { notify: true });
          } else {
            this.log(`权益超市抽奖结果: ${prizesName}`, { notify: true });
          }
          
          if (message) {
            this.log(`抽奖提示: ${message}`);
          }
          
          return true;
        }
        return false;
      } else {
        let errorMessage = responseData?.msg || "未知错误";
        this.log("权益超市抽奖失败[" + responseCode + "]: " + errorMessage);
        return false;
      }
      
    } catch (error) {
      this.log(`权益超市抽奖异常: ${error.message}`);
      return false;
    }
  }

  async marketRaffleTask() {
    try {
      if (!this.market_token) {
        return;
      }

      // 查询可抽奖次数
      const raffleCount = await this.marketGetRaffleCount();
      
      if (raffleCount > 0) {
        this.log(`开始执行权益超市抽奖，可抽奖次数: ${raffleCount}`, { notify: true });
        
        // 执行抽奖
        for (let i = 0; i < raffleCount; i++) {
          this.log(`执行第 ${i + 1} 次抽奖`);
          const success = await this.marketRaffle();
          
          if (!success) {
            this.log(`第 ${i + 1} 次抽奖失败，停止抽奖`);
            break;
          }
          
          // 等待一段时间避免请求过快
          await appName.wait(3000);
        }
        
        this.log("权益超市抽奖完成", { notify: true });
      } else {
        this.log("权益超市暂无可抽奖次数", { notify: true });
      }
      
    } catch (error) {
      this.log(`权益超市抽奖异常: ${error.message}`);
    }
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

      // 发起请求并获取响应
      let {
        result: responseResult,
        statusCode: responseStatusCode
      } = await this.request(requestConfig),
        status = appName.get(responseResult, "status", responseStatusCode);

      // 检查响应状态码是否为 "0000"
      if (status == "0000") {
        // // 解析剩余的抽奖次数
        // let remainingTimes = parseInt(responseResult?.["data"]?.["allRemainTimes"] || 0),
        //   drawTimes = Math.min(maxDrawTimes, remainingTimes);

        // this.log("28日五折日可以抽奖" + remainingTimes + "次, 去抽" + drawTimes + "次");

        // let firstAttempt = false;
        // while (drawTimes-- > 0) {
        //   if (firstAttempt) {
        //     // 等待8秒再进行下一次抽奖
        //     await appName.wait(8000);
        //   }
        //   firstAttempt = true;
          await this.draw_28_lottery();
        // }
      } else {
        // 处理查询失败的情况
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
  
      const { result, statusCode } = await this.request(requestOptions);
      const status = appName.get(result, "status", statusCode);
  
      if (status === "0000") {
        const responseData = result?.["data"];
        const resultCode = appName.get(responseData, "code", -1);
  
        if (responseData?.["uuid"]) {
          await appName.wait(2000);
          await this.draw_28_winningRecord(responseData.uuid);
        } else {
          const errorMessage = responseData?.["message"] || responseData?.["msg"] || "";
          this.log(`28日五折日抽奖失败[${resultCode}]: ${errorMessage}`);
        }
      } else {
        const errorMessage = result?.["message"] || result?.["msg"] || "";
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
          this.log("28日五折日抽奖: " + responseData?.["prizeName"]?.["replace"](/\t/g, ""), logOptions);
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
      // 拼接完整的登录 URL
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
  
        this.log(`天天领现金今天${hasNotClockedIn ? "未" : "已"}打卡`, logOptions);
  
        if (hasNotClockedIn) {
          const today = new Date().getDay();
          const drawType = (today % 7 === 0) ? "C" : "B";
          await this.ttlxj_unifyDrawNew(drawType);
        }
      } else {
        const errorMessage = result?.["msg"] || "";
        this.log(`天天领现金查询失败[${responseCode}]: ${errorMessage}`);
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
        this.log("天天领现金打卡: " + awardMessage, logOptions);
      } else {
        const errorMessage = result?.["data"]?.["returnMsg"] || result?.["msg"] || "";
        this.log(`天天领现金打卡失败[${result?.["data"]?.["returnCode"] || responseCode}]: ${errorMessage}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  async ttlxj_h(_0x47d16c = {}) {
    try {
      const _0x2f3dc6 = {
        bizFrom: errorCode,
        activityId: _0x3484cf.ttlxj,
        uid: apiKey
      };
      let _0x469865 = {
        fn: "ttlxj_h",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/help",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: _0x2f3dc6
      };
      await this.request(_0x469865);
    } catch (_0x173381) {
      console.log(_0x173381);
    }
  }
  async ttlxj_queryAvailable(_0x23c9d2 = {}) {
    try {
      let _0x2f3ee4 = {
        fn: "ttlxj_queryAvailable",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/queryAvailable",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        }
      },
        {
          result: _0x351127
        } = await this.request(_0x2f3ee4),
        _0x22c4f9 = appName.get(_0x351127, "code", -1);
      if (_0x22c4f9 == "0000" && _0x351127?.["data"]?.["returnCode"] == 0) {
        let _0x11a97b = _0x351127?.["data"]?.["availableAmount"] || 0;
        const _0x3dffbb = {
          notify: true
        };
        this.log("可用立减金: " + (_0x11a97b / 100).toFixed(2) + "元", _0x3dffbb);
        let _0x3a9ca0 = [],
          _0x4a77d6 = Date.now();
        for (let _0x22c5c5 of _0x351127?.["data"]?.["prizeList"]?.["filter"](_0xac5521 => _0xac5521.status == "A")) {
          let _0xdf42c9 = _0x22c5c5.endTime,
            _0x148118 = new Date(_0xdf42c9.slice(0, 4) + "-" + _0xdf42c9.slice(4, 6) + "-" + _0xdf42c9.slice(6, 8) + " 00:00:00"),
            _0xc3cc5f = _0x148118.getTime();
          if (_0xc3cc5f - _0x4a77d6 < expiration_time * 24 * 60 * 60 * 1000) {
            let _0x24bd89 = appName.time("yyyy-MM-dd", _0xc3cc5f);
            const _0x4d3dd0 = {
              timestamp: _0xc3cc5f,
              date: _0x24bd89,
              amount: _0x22c5c5.amount
            };
            _0x3a9ca0.push(_0x4d3dd0);
          }
        }
        if (_0x3a9ca0.length) {
          const _0x4097fc = {
            timestamp: 0
          };
          let _0xb33342 = _0x4097fc,
            _0x296b80 = _0x3a9ca0.reduce(function (_0x11f322, _0x3cd209) {
              (_0xb33342.timestamp == 0 || _0x3cd209.timestamp < _0xb33342.timestamp) && (_0xb33342 = _0x3cd209);
              return _0x11f322 + parseFloat(_0x3cd209.amount);
            }, 0);
          const _0x5d32b7 = {
            notify: true
          };
          this.log(expiration_time + "天内过期立减金: " + _0x296b80.toFixed(2) + "元", _0x5d32b7);
          const _0x2dff48 = {
            notify: true
          };
          this.log("最早过期立减金: " + _0xb33342.amount + "元 -- " + _0xb33342.date + "过期", _0x2dff48);
        } else {
          const _0x437216 = {
            notify: true
          };
          this.log(expiration_time + "天内没有过期的立减金", _0x437216);
        }
      } else {
        let _0x1a23ec = _0x351127?.["data"]?.["returnMsg"] || _0x351127?.["msg"] || "";
        this.log("天天领现金打卡失败[" + (_0x351127?.["data"]?.["returnCode"] || _0x22c4f9) + "]: " + _0x1a23ec);
      }
    } catch (_0x2d80a8) {
      console.log(_0x2d80a8);
    }
  }
  async epay_28_authCheck(_0x1d0fd8 = {}) {
    try {
      let _0x35ae82 = {
        fn: "epay_28_authCheck",
        method: "post",
        url: "https://epay.10010.com/ps-pafs-auth-front/v1/auth/check",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo()
        }
      },
        {
          result: _0x1d449e
        } = await this.request(_0x35ae82),
        _0x4e8f00 = appName.get(_0x1d449e, "code", -1);
      if (_0x4e8f00 == "0000") {
        let {
          mobile: _0x4668a5,
          sessionId: _0xb2b5be,
          tokenId: _0x7c73d9,
          userId: _0x42df1c
        } = _0x1d449e?.["data"]?.["authInfo"];
        const _0x4d9ca1 = {
          sessionId: _0xb2b5be,
          tokenId: _0x7c73d9,
          userId: _0x42df1c
        };
        Object.assign(this, _0x4d9ca1);
        await this.epay_28_queryUserPage();
      } else {
        if (_0x4e8f00 == "2101000100") {
          let _0x5892fa = _0x1d449e?.["data"]?.["woauth_login_url"];
          await this.epay_28_login(_0x5892fa);
        } else {
          let _0x1fb8e2 = _0x1d449e?.["msgInside"] || _0x1d449e?.["msg"] || "";
          this.log("联通支付日获取tokenId失败[" + _0x4e8f00 + "]: " + _0x1fb8e2);
        }
      }
    } catch (_0x268652) {
      console.log(_0x268652);
    }
  }
  async epay_28_login(_0x139155, _0x3721a9 = {}) {
    try {
      let _0x236f54 = appName.time("yyyyMM") + "28ZFR";
      _0x139155 += "https://epay.10010.com/ci-mcss-party-web/rainbow/?templateName=" + _0x236f54 + "&bizFrom=225&bizChannelCode=225&channelType=WDQB";
      const _0x5d5710 = {
        fn: "epay_28_login",
        method: "get",
        url: _0x139155
      };
      let {
        headers: _0x10b4ba,
        statusCode: _0x1c60e3
      } = await this.request(_0x5d5710);
      if (_0x10b4ba?.["location"]) {
        let _0xbf5a4c = new URL(_0x10b4ba.location);
        this.rptId = _0xbf5a4c.searchParams.get("rptid");
        this.rptId ? await this.epay_28_authCheck() : this.log("联通支付日获取rptid失败");
      } else {
        this.log("联通支付日获取rptid失败[" + _0x1c60e3 + "]");
      }
    } catch (_0x24e61c) {
      console.log(_0x24e61c);
    }
  }
  async epay_28_queryUserPage(_0x593a59 = {}) {
    try {
      let _0x52a117 = appName.time("yyyyMM") + "28ZFR";
      const _0xa4a05 = {
        templateName: _0x52a117
      };
      let _0x2b8287 = {
        fn: "epay_28_queryUserPage",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/queryUserPage",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: _0xa4a05
      },
        {
          result: _0x316895
        } = await this.request(_0x2b8287),
        _0x2a5e2b = appName.get(_0x316895, "code", -1);
      if (_0x2a5e2b == "0000" && _0x316895?.["data"]?.["returnCode"] == 0) {
        for (let _0x29cca7 of _0x316895?.["data"]?.["prizeList"]?.["rainbowMouldInfos"] || []) {
          _0x29cca7?.["rainbowUnitInfos"]?.[0]?.["unitActivityId"] && (await this.epay_28_unifyDraw(_0x29cca7.rainbowUnitInfos[0]));
          if (_0x29cca7?.["day01DrawParam"]) {
            await this.epay_28_queryMiddleUnit(_0x52a117, _0x29cca7.mouldName);
            break;
          }
        }
      } else {
        let _0x253476 = _0x316895?.["message"] || _0x316895?.["msg"] || "";
        this.log("联通支付日进入主页失败[" + _0x2a5e2b + "]: " + _0x253476);
      }
    } catch (_0x4d57b5) {
      console.log(_0x4d57b5);
    }
  }
  async epay_28_queryMiddleUnit(_0x5c5db5, _0x392918, _0x5f3e9d = {}) {
    try {
      const _0x52c66e = {
        activityId: _0x5c5db5,
        mouldName: _0x392918
      };
      let _0x272e95 = {
        fn: "epay_28_queryMiddleUnit",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/queryMiddleUnit",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: _0x52c66e
      },
        {
          result: _0x3851a6
        } = await this.request(_0x272e95),
        _0x4b44ce = appName.get(_0x3851a6, "code", -1);
      if (_0x4b44ce == "0000") {
        let _0xcad9a9 = appName.time("dd");
        _0x3851a6?.["data"]?.[_0xcad9a9] == "1" ? this.log("联通支付日今日(" + _0xcad9a9 + "号)已打卡") : await this.epay_28_unifyDrawNew(_0x5c5db5, _0x392918);
      } else {
        let _0x42d4bb = _0x3851a6?.["message"] || _0x3851a6?.["msg"] || "";
        this.log("联通支付日查询打卡失败[" + _0x4b44ce + "]: " + _0x42d4bb);
      }
    } catch (_0x56f54c) {
      console.log(_0x56f54c);
    }
  }
  async epay_28_unifyDrawNew(_0x32455a, _0x3b23ed, _0x4b4480 = {}) {
    try {
      const _0x1af316 = {
        bizFrom: errorCode,
        activityId: _0x32455a,
        mouldName: _0x3b23ed
      };
      let _0x1e4109 = {
        fn: "epay_28_unifyDrawNew",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/unifyDrawNew",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: _0x1af316
      },
        {
          result: _0x39b4c5
        } = await this.request(_0x1e4109),
        _0x372dd5 = appName.get(_0x39b4c5, "code", -1);
      if (_0x372dd5 == "0000" && _0x39b4c5?.["data"]?.["returnCode"] == 0) {
        let _0xc69fe5 = _0x39b4c5?.["data"]?.["awardTipContent"]?.["replace"](/xx/, _0x39b4c5?.["data"]?.["amount"]);
        const _0x5e238f = {
          notify: true
        };
        this.log("联通支付日打卡:" + _0xc69fe5, _0x5e238f);
      } else {
        let _0x5dd5bd = _0x39b4c5?.["data"]?.["returnMsg"] || _0x39b4c5?.["msg"] || "";
        this.log("联通支付日打卡失败[" + (_0x39b4c5?.["data"]?.["returnCode"] || _0x372dd5) + "]: " + _0x5dd5bd);
      }
    } catch (_0xe6df9) {
      console.log(_0xe6df9);
    }
  }
  async epay_28_unifyDraw(_0x38a578, _0x5c8b17 = {}) {
    try {
      const _0x3bf056 = {
        activityId: _0x38a578.unitActivityId,
        isBigActivity: _0x38a578.isBigActivity,
        bigActivityId: _0x38a578.bigActivityId,
        bizFrom: errorCode
      };
      let _0x59ed9a = {
        fn: "epay_28_unifyDraw",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/rainbow/unifyDraw",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: _0x3bf056
      },
        {
          result: _0x34ea6b
        } = await this.request(_0x59ed9a),
        _0x384c09 = appName.get(_0x34ea6b, "code", -1);
      if (_0x384c09 == "0000" && _0x34ea6b?.["data"]?.["returnCode"] == 0) {
        const _0x3b6f17 = {
          notify: true
        };
        this.log("联通支付日抽奖: " + (_0x34ea6b?.["data"]?.["prizeName"] || ""), _0x3b6f17);
      } else {
        let _0x22895a = _0x34ea6b?.["data"]?.["returnMsg"] || _0x34ea6b?.["msg"] || "";
        this.log("联通支付日抽奖失败[" + (_0x34ea6b?.["data"]?.["returnCode"] || _0x384c09) + "]: " + _0x22895a);
      }
    } catch (_0x4e021a) {
      console.log(_0x4e021a);
    }
  }
  async appMonth_28_bind(_0x2ae53c, _0x28e539 = {}) {
    try {
      const _0x5e8346 = {
        shareCode: _0x2ae53c,
        cl: "WeChat"
      };
      const _0x5807b0 = {
        fn: "appMonth_28_bind",
        method: "post",
        url: "https://activity.10010.com/AppMonthly/appMonth/bind",
        form: _0x5e8346,
        valid_code: [401]
      };
      let {
        result: _0x147b99
      } = await this.request(_0x5807b0);
    } catch (_0x24f7a3) {
      console.log(_0x24f7a3);
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

  async appMonth_28_lottery(_0x32fff2 = {}) {
    try {
      const _0x13d3ae = {
        fn: "appMonth_28_lottery",
        method: "post",
        url: "https://activity.10010.com/AppMonthly/appMonth/lottery"
      };
      let {
        result: _0x360c8d
      } = await this.request(_0x13d3ae),
        _0x1faa78 = appName.get(_0x360c8d, "status", -1);
      if (_0x1faa78 == "0000") {
        let {
          code: _0x4506d5,
          uuid: _0x217783
        } = _0x360c8d?.["data"];
        _0x217783 ? await this.appMonth_28_winningRecord(_0x217783) : this.log("联通支付日开宝箱失败[" + _0x4506d5 + "]");
      } else {
        let _0x1c765a = _0x360c8d?.["msg"] || "";
        this.log("联通支付日开宝箱失败[" + _0x1faa78 + "]: " + _0x1c765a);
      }
    } catch (_0x1e578f) {
      console.log(_0x1e578f);
    }
  }
  async appMonth_28_winningRecord(_0x49f5fb, _0x539daf = {}) {
    try {
      const _0x4e44da = {
        requestId: _0x49f5fb
      };
      const _0x18e28d = {
        fn: "appMonth_28_winningRecord",
        method: "post",
        url: "https://activity.10010.com/AppMonthly/appMonth/winningRecord",
        form: _0x4e44da
      };
      let {
        result: _0x3de180
      } = await this.request(_0x18e28d),
        _0x51662d = appName.get(_0x3de180, "status", -1);
      if (_0x51662d == "0000") {
        let {
          code: _0x20040f,
          prizeName: _0x428599
        } = _0x3de180?.["data"];
        if (_0x20040f == "0000") {
          const _0x194d8b = {
            notify: true
          };
          this.log("联通支付日开宝箱: " + _0x428599, _0x194d8b);
        } else {
          let _0x4a0327 = _0x3de180?.["data"]?.["message"] || "";
          this.log("联通支付日开宝箱[" + _0x20040f + "]: " + _0x4a0327);
        }
      } else {
        let _0x507948 = _0x3de180?.["msg"] || "";
        this.log("联通支付日查询中奖奖品错误[" + _0x51662d + "]: " + _0x507948);
      }
    } catch (_0x12630e) {
      console.log(_0x12630e);
    }
  }
async sign_getContinuous(imei_val, _0x4a5ad2 = {}) {
    try {
        // 定义请求配置
        const _0x4c871f = {
            fn: "sign_getContinuous",
            method: "get", // GET请求
            url: "https://activity.10010.com/sixPalaceGridTurntableLottery/signin/getContinuous",
            params: { // 请求参数
                taskId: "",
                channel: "wode",
                imei: imei_val // 设备ID
            }
        };
        // 发送请求并获取结果
        let { result: _0x375bbc } = await this.request(_0x4c871f),
            _0x390277 = appName.get(_0x375bbc, "code", -1);

        // 处理响应
        if (_0x390277 == "0000") { // 成功
            let _0x2ddb99 = _0x375bbc?.["data"]?.["todayIsSignIn"] || 'n'; // 今日签到状态
            this.log("签到区今天" + (_0x2ddb99 == "n" ? "未" : "已") + "签到", { notify: true });
            if (_0x2ddb99 == "n") { // 未签到则执行签到
                await appName.wait(1000); // 等待1秒
                await this.sign_daySign(); // 执行每日签到
            }
        } else { // 失败
            this.log("签到区查询签到状态失败[" + _0x390277 + "]: " + (_0x375bbc?.["desc"] || ""));
        }
    } catch (_0x1e4db0) {
        console.log(_0x1e4db0);
    }
}

async sign_daySign(_0x43121e = {}) {
    try {
        // 定义请求配置
        const _0x34424b = {
            fn: "sign_daySign",
            method: "post", // POST请求
            url: "https://activity.10010.com/sixPalaceGridTurntableLottery/signin/daySign",
            form: {} // 空表单数据
        };
        // 发送请求并获取结果
        let { result: _0x45b961 } = await this.request(_0x34424b),
            _0x3dd664 = appName.get(_0x45b961, "code", -1);

        // 处理响应
        if (_0x3dd664 == "0000") { // 签到成功
            let { statusDesc: _0x3544fb, redSignMessage: _0x5016bf } = _0x45b961?.["data"];
            let logMessage = "签到区签到成功: ";
            if (_0x3544fb) logMessage += `[${_0x3544fb}]`;
            if (_0x5016bf) logMessage += `${_0x5016bf}`;
            this.log(logMessage, { notify: true });
        } else if (_0x3dd664 == "0002" && _0x45b961?.["desc"] && _0x45b961["desc"].includes('已经签到')) { // 今日已签到
            this.log("签到区签到成功: 今日已完成签到！", { notify: true });
        } else { // 失败
            this.log("签到区签到失败[" + _0x3dd664 + "]: " + (_0x45b961?.["desc"] || ""));
        }
    } catch (_0x31a630) {
        console.log(_0x31a630);
    }
}

async sign_queryBubbleTask(_0x2777e8 = {}) {
    try {
        // 定义请求配置
        const _0x49d44f = {
            fn: "sign_queryBubbleTask",
            method: "post", // POST请求
            url: "https://act.10010.com/SigninApp/bubbleTask/queryBubbleTask"
        };
        // 发送请求并获取结果
        let { result: _0xff3076 } = await this.request(_0x49d44f),
            _0x1e9efb = appName.get(_0xff3076, "status", -1);

        // 处理响应
        if (_0x1e9efb == "0000") { // 成功
            // 筛选并执行可执行任务
            for (let _0xe8b4f5 of _0xff3076?.["data"]?.["paramsList"]?.["filter"](_0xb17880 => _0xb17880.taskState == 1)) {
                let _0x411132 = await this.gettaskip(); // 获取任务所需标识
                await this.sign_doTask(_0xe8b4f5, _0x411132); // 执行任务
            }
        } else { // 失败
            this.log("签到区查询气泡任务失败[" + _0x1e9efb + "]: " + (_0xff3076?.["msg"] || ""));
        }
    } catch (_0x24c5dc) {
        console.log(_0x24c5dc);
    }
}

async sign_doTask(_0x4cf867, _0x22748d, _0x5bbfdb = {}) {
    try {
        // 定义请求表单数据
        const _0x4a9479 = {
            id: _0x4cf867.id,
            orderId: _0x22748d,
            imei: "BB97982E-3F03-46D3-B904-819D626DF478", // 设备ID (硬编码示例)
            prizeType: _0x4cf867.rewardType,
            positionFlag: 0
        };
        // 定义请求配置
        const _0x31aade = {
            fn: "sign_doTask",
            method: "post", // POST请求
            url: "https://act.10010.com/SigninApp/task/doTask",
            form: _0x4a9479 // 表单数据
        };
        // 发送请求并获取结果
        let { result: _0x329766 } = await this.request(_0x31aade),
            _0x1d5e4d = appName.get(_0x329766, "status", -1);

        // 处理响应
        if (_0x1d5e4d == "0000") { // 成功
            this.log("完成任务[" + _0x4cf867.actName + "]获得: " + _0x329766?.["data"]?.["prizeCount"] + _0x329766?.["data"]?.["prizeName"]);
        } else { // 失败
            this.log("完成任务[" + _0x4cf867.actName + "]失败[" + _0x1d5e4d + "]: " + (_0x329766?.["msg"] || ""));
        }
    } catch (_0x4ad671) {
        console.log(_0x4ad671);
    }
}
  async game_login(_0x5f500f, _0x639e7 = {}) {
    try {
      const _0x2730f4 = {
        identityType: "esToken",
        code: this.ecs_token,
        ticket: _0x5f500f,
        uuid: uuid
      };
      const _0x204877 = {
        fn: "game_login",
        method: "post",
        url: "https://game.wostore.cn/api/app//user/v2/login",
        headers: {},
        json: _0x2730f4
      };
      _0x204877.headers.channelid = "GAMELTAPP_90005";
      let {
        result: _0x206034
      } = await this.request(_0x204877),
        _0xe387fd = appName.get(_0x206034, "code", -1);
      if (_0xe387fd == 200) {
        this.game_token = _0x206034?.["data"]?.["access_token"];
        this.got = this.got.extend({
          headers: {
            Authorization: this.game_token
          }
        });
        await this.game_getMemberInfo();
        await this.game_signRecord();
        await this.game_lottery();
        await this.game_playSave();
        await this.game_taskList();
        await this.game_getMemberInfo();
        const _0x563fcb = {
          notify: true
        };
        this.log("联通畅游币: " + this.point, _0x563fcb);
      } else {
        let _0x1d6aa5 = _0x206034?.["msg"] || "";
        this.log("联通畅游登录失败[" + _0xe387fd + "]: " + _0x1d6aa5);
      }
    } catch (_0x22daa6) {
      console.log(_0x22daa6);
    }
  }
  async game_getMemberInfo(_0x1119ca = {}) {
    try {
      const _0x2d61ed = {
        fn: "game_getMemberInfo",
        method: "get",
        url: "https://game.wostore.cn/api/app/user/v2/getMemberInfo"
      };
      let {
        result: _0x25b820
      } = await this.request(_0x2d61ed),
        _0x4c45ab = appName.get(_0x25b820, "code", -1);
      if (_0x4c45ab == 200) {
        this.point = _0x25b820?.["data"]?.["userIntegral"];
      } else {
        let _0x31251d = _0x25b820?.["msg"] || "";
        this.log("联通畅游查询积分失败[" + _0x4c45ab + "]: " + _0x31251d);
      }
    } catch (_0x3a8d0c) {
      console.log(_0x3a8d0c);
    }
  }
  async game_signRecord(_0x47d803 = {}) {
    try {
      const _0xed6a1c = {
        fn: "game_signRecord",
        method: "get",
        url: "https://game.wostore.cn/api/app/user/v2/signRecord"
      };
      let {
        result: _0x3d9d1c
      } = await this.request(_0xed6a1c),
        _0x56bc7f = appName.get(_0x3d9d1c, "code", -1);
      if (_0x56bc7f == 200) {
        for (let _0x48dbac of _0x3d9d1c?.["data"]) {
          if (_0x48dbac.now == 0) {
            continue;
          }
          this.log("联通畅游今天" + (_0x48dbac.signStatus == 2 ? "未" : "已") + "签到");
          if (_0x48dbac.signStatus == 2) {
            await this.game_signIn();
          }
        }
      } else {
        let _0x4c5073 = _0x3d9d1c?.["msg"] || "";
        this.log("联通畅游查询签到失败[" + _0x56bc7f + "]: " + _0x4c5073);
      }
    } catch (_0x8f9b0b) {
      console.log(_0x8f9b0b);
    }
  }
  async game_signIn(_0x170c89 = {}) {
    try {
      const _0x3d53ee = {
        fn: "game_signIn",
        method: "get",
        url: "https://game.wostore.cn/api/app/user/v2/signIn"
      };
      let {
        result: _0x1f4677
      } = await this.request(_0x3d53ee),
        _0x478093 = appName.get(_0x1f4677, "code", -1);
      if (_0x478093 == 200) {
        this.log("联通畅游签到成功");
      } else {
        let _0x2b40f2 = _0x1f4677?.["msg"] || "";
        this.log("联通畅游签到失败[" + _0x478093 + "]: " + _0x2b40f2);
      }
    } catch (_0xfac145) {
      console.log(_0xfac145);
    }
  }
  async game_checkSlider(_0x5ca38c = {}) {
    let _0x3c3f88 = false;
    try {
      const _0x536f3f = {
        xPos: 234
      };
      const _0x54913c = {
        fn: "game_checkSlider",
        method: "post",
        url: "https://game.wostore.cn/api/app/common/slider/checkSlider",
        searchParams: _0x536f3f
      };
      let {
        result: _0x31be4b
      } = await this.request(_0x54913c),
        _0x29af87 = appName.get(_0x31be4b, "code", -1);
      if (_0x29af87 == 200) {
        this.log("联通畅游滑块验证成功");
      } else {
        let _0x661bc2 = _0x31be4b?.["msg"] || "";
        this.log("联通畅游滑块验证失败[" + _0x29af87 + "]: " + _0x661bc2);
      }
    } catch (_0x441ee4) {
      console.log(_0x441ee4);
    } finally {
      return _0x3c3f88;
    }
  }
  async game_lottery(_0x12d231 = {}) {
    try {
      let _0x597145 = {
        fn: "game_lottery",
        method: "get",
        url: "https://game.wostore.cn/api/app/user/v2/benefit/lottery",
        searchParams: {
          id: appName.get(_0x12d231, "id", 1)
        }
      },
        {
          result: _0x375b1d
        } = await this.request(_0x597145),
        _0x44ca98 = appName.get(_0x375b1d, "code", -1);
      if (_0x44ca98 == 200) {
        const _0x46c4cd = {
          notify: true
        };
        this.log("联通畅游抽奖: " + _0x375b1d?.["data"]?.["productName"], _0x46c4cd);
      } else {
        let _0x172e69 = _0x375b1d?.["msg"] || "";
        this.log("联通畅游抽奖失败[" + _0x44ca98 + "]: " + _0x172e69);
      }
    } catch (_0x5cc5c9) {
      console.log(_0x5cc5c9);
    }
  }
  async game_taskList(_0x38dc2c = {}) {
    try {
      const _0x6b3e09 = {
        fn: "game_taskList",
        method: "get",
        url: "https://game.wostore.cn/api/app/user/v2/task/list"
      };
      let {
        result: _0x24a55d
      } = await this.request(_0x6b3e09),
        _0x641976 = appName.get(_0x24a55d, "code", -1);
      if (_0x641976 == 200) {
        for (let _0x2b6e2e of _0x24a55d?.["data"]) {
          switch (_0x2b6e2e.receiveStatus) {
            case 0:
              break;
            case 1:
              await this.game_taskReceive(_0x2b6e2e);
              break;
            case 2:
              break;
            default:
              appName.log("任务[" + _0x2b6e2e.taskName + "]未知状态[" + _0x2b6e2e.receiveStatus + "]");
              break;
          }
        }
      } else {
        let _0x3e9a0f = _0x24a55d?.["msg"] || "";
        this.log("联通畅游查询任务失败[" + _0x641976 + "]: " + _0x3e9a0f);
      }
    } catch (_0x169b29) {
      console.log(_0x169b29);
    }
  }
  async game_taskReceive(_0xe2b155, _0x5671ea = {}) {
    try {
      const _0x591582 = {
        productId: _0xe2b155.productId,
        taskId: _0xe2b155.id
      };
      const _0x1eca66 = {
        fn: "game_taskReceive",
        method: "get",
        url: "https://game.wostore.cn/api/app/user/v2/task/receive",
        searchParams: _0x591582
      };
      let {
        result: _0x2f8fb3
      } = await this.request(_0x1eca66),
        _0x288264 = appName.get(_0x2f8fb3, "code", -1);
      if (_0x288264 == 200) {
        this.log("领取任务[" + _0xe2b155.taskName + "]奖励成功");
      } else {
        let _0x261128 = _0x2f8fb3?.["msg"] || "";
        this.log("领取任务[" + _0xe2b155.taskName + "]奖励失败[" + _0x288264 + "]: " + _0x261128);
      }
    } catch (_0x33f03b) {
      console.log(_0x33f03b);
    }
  }
  async game_playSave(_0x2b6d36 = {}) {
    try {
      let _0x1b839f = {
        fn: "game_playSave",
        method: "post",
        url: "https://game.wostore.cn/api/app/user/v2/play/save",
        json: {
          cpGameId: "15000199" + appName.randomString(2, "0123456789")
        }
      },
        {
          result: _0x435b34
        } = await this.request(_0x1b839f),
        _0x405dad = appName.get(_0x435b34, "code", -1);
      if (!(_0x405dad == 200)) {
        let _0x407e03 = _0x435b34?.["msg"] || "";
        this.log("联通畅游玩游戏失败[" + _0x405dad + "]: " + _0x407e03);
      }
    } catch (_0x10eb8a) {
      console.log(_0x10eb8a);
    }
  }
  async flmf_login(_0x3a709c, _0x3e346c = {}) {
    try {
      const _0x4d2274 = {
        fn: "flmf_login",
        method: "get",
        url: _0x3a709c
      };
      let {
        headers: _0x44fb4d,
        statusCode: _0x2923d9
      } = await this.request(_0x4d2274);
      if (_0x44fb4d?.["location"]) {
        let _0x366f8a = new URL(_0x44fb4d.location);
        this.flmf_sid = _0x366f8a.searchParams.get("sid");
        this.flmf_sid ? (await this.flmf_signInInit(), await this.flmf_taskList(), await this.flmf_scanTask()) : this.log("福利魔方获取sid失败");
      } else {
        this.log("福利魔方获取sid失败[" + _0x2923d9 + "]");
      }
    } catch (_0x27766a) {
      console.log(_0x27766a);
    }
  }
  async flmf_signInInit(_0x5dabbc = {}) {
    try {
      let _0x2014b6 = {
        fn: "flmf_signInInit",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/signInInit",
        form: this.get_flmf_data()
      },
        {
          result: _0x41327b
        } = await this.request(_0x2014b6),
        _0x2732b9 = appName.get(_0x41327b, "resultCode", -1);
      if (_0x2732b9 == "0000") {
        this.log("福利魔方今天" + (_0x41327b?.["data"]?.["isSigned"] ? "已" : "未") + "签到, 已连续签到" + _0x41327b?.["data"]?.["consecutiveDays"] + "天");
        if (!_0x41327b?.["data"]?.["isSigned"]) {
          await this.flmf_signIn();
        }
      } else {
        let _0x1a8187 = _0x41327b?.["resultMsg"] || "";
        this.log("福利魔方查询签到失败[" + _0x2732b9 + "]: " + _0x1a8187);
      }
    } catch (_0x517caa) {
      console.log(_0x517caa);
    }
  }
  async flmf_signIn(_0x51ae1e = {}) {
    try {
      let _0x3128b3 = {
        fn: "flmf_signIn",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/signIn",
        form: this.get_flmf_data()
      },
        {
          result: _0x4485f1
        } = await this.request(_0x3128b3),
        _0x1564ca = appName.get(_0x4485f1, "resultCode", -1);
      if (_0x1564ca == "0000") {
        this.log("福利魔方签到成功");
      } else {
        let _0xfa6532 = _0x4485f1?.["resultMsg"] || "";
        this.log("福利魔方签到失败[" + _0x1564ca + "]: " + _0xfa6532);
      }
    } catch (_0x22c453) {
      console.log(_0x22c453);
    }
  }
  async flmf_taskList(_0x47a943 = {}) {
    try {
      let _0x3b119a = {
        fn: "flmf_taskList",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/taskList",
        form: this.get_flmf_data()
      },
        {
          result: _0x1be38d
        } = await this.request(_0x3b119a),
        _0x56b419 = appName.get(_0x1be38d, "resultCode", -1);
      if (_0x56b419 == "0000") {
        for (let _0x21c855 of _0x1be38d?.["data"]?.["taskInfoList"]) {
          for (let _0x3ddbd8 of _0x21c855.taskInfoList.filter(_0x539de9 => !_0x539de9.done)) {
            for (let _0xcf0709 = _0x3ddbd8.hascount; _0xcf0709 < _0x3ddbd8.count; _0xcf0709++) {
              await this.flmf_gogLance(_0x3ddbd8.id);
            }
          }
        }
      } else {
        let _0x3affb1 = _0x1be38d?.["resultMsg"] || "";
        this.log("福利魔方查询任务失败[" + _0x56b419 + "]: " + _0x3affb1);
      }
    } catch (_0x172024) {
      console.log(_0x172024);
    }
  }
  async flmf_scanTask() {
    for (let _0xa11d9d of someArray) {
      await this.flmf_gogLance(_0xa11d9d);
    }
  }
  async flmf_gogLance(_0x3534eb, _0x4a0142 = {}) {
    try {
      let _0x1d2f2 = {
        fn: "flmf_gogLance",
        method: "post",
        url: "https://weixin.linktech.hk/lv-apiaccess/welfareCenter/gogLance",
        form: {
          taskId: _0x3534eb,
          ...this.get_flmf_data()
        }
      },
        {
          result: _0x422380
        } = await this.request(_0x1d2f2);
      await appName.wait_gap_interval(this.t_flmf_task, delayMs);
      let _0x213f2c = appName.get(_0x422380, "resultCode", -1);
      this.t_flmf_task = Date.now();
      if (_0x213f2c == "0000") {
        this.log("完成任务[" + _0x3534eb + "]成功");
      } else {
        let _0x2aacea = _0x422380?.["resultMsg"] || "";
        this.log("完成任务[" + _0x3534eb + "]失败[" + _0x213f2c + "]: " + _0x2aacea);
      }
    } catch (_0x229114) {
      console.log(_0x229114);
    }
  }
  async woread_api(_0x34880c) {
    let _0x1db761 = await this.request(appName.copy(_0x34880c)),
      _0x3e48ad = _0x1db761?.["result"]?.["message"] || "";
    _0x3e48ad?.["includes"]("登录已过期") && (await this.woread_auth()) && (await this.woread_login()) && (_0x1db761 = await this.request(appName.copy(_0x34880c)));
    return _0x1db761;
  }
  switch_woread_token(accessToken) {
    const headers = {
      accesstoken: accessToken
    };
    const options = {
      headers: headers
    };
    this.got = this.got.extend(options);
  }
  async woread_auth(options = {}) {
    let authSuccess = false;
    const filePath = path.join(__dirname, 'chinaUnicom_cache.json');
  
    try {
      // 获取当前时间戳
      let timestamp = appName.time("yyyyMMddhhmmss");
      const timestampData = { timestamp: timestamp };
      let encodedSign = this.encode_woread(timestampData);
      let currentTime = Date.now().toString();
      let md5Hash = cryptoJS.MD5(productId + secretKey + currentTime).toString();
      const signData = { sign: encodedSign };
      const requestOptions = {
        fn: "woread_auth",
        method: "post",
        url: `https://10010.woread.com.cn/ng_woread_service/rest/app/auth/${productId}/${currentTime}/${md5Hash}`,
        json: signData
      };
  
      // 发送请求并处理响应
      let { result: responseData } = await this.request(requestOptions);
      let responseCode = appName.get(responseData, "code", -1);
  
      if (responseCode == "0000") {
        authSuccess = true;
        this.woread_accesstoken = responseData?.["data"]?.["accesstoken"];
        this.switch_woread_token(this.woread_accesstoken);
  
        // 将服务器返回的数据缓存到文件
        let fileData = {};
        if (fs.existsSync(filePath)) {
          const existingData = fs.readFileSync(filePath, 'utf8');
          fileData = existingData ? JSON.parse(existingData) : {};
        }
        if (!fileData["woread_auth"]) {
          fileData["woread_auth"] = {};
        }
        fileData["woread_auth"][this.mobile] = responseData?.["data"];
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
      } else {
        let errorMessage = responseData?.["message"] || "";
        this.log("阅读专区获取accesstoken失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
      this.log("发生异常：" + error.message);
    } finally {
      return authSuccess;
    }
  }
  async woread_login(options = {}) {
    let loginSuccess = false;
    const filePath = path.join(__dirname, 'chinaUnicom_cache.json');
  
    try {
      // 如果无缓存数据，请求服务器
      let loginData = {
        // phone: this.mobile,
        phone: this.encode_woread1(this.mobile),
        timestamp: appName.time("yyyyMMddhhmmss")
      };
      let encodedSign = this.encode_woread(loginData);
      //console.log(encodedSign)
      const signData = {
        sign: encodedSign
      };
      const requestOptions = {
        fn: "woread_login",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/account/login",
        json: signData
      };
  
      let { result: responseData } = await this.request(requestOptions);
      let responseCode = appName.get(responseData, "code", -1);
  
      if (responseCode === "0000") {
        loginSuccess = true;
        let { userid, userindex, token, verifycode } = responseData?.["data"];
        this.woread_token = token;
        this.woread_verifycode = verifycode;
        const userData = {
          woread_userid: userid,
          woread_userindex: userindex,
          woread_token: token,
          woread_verifycode: verifycode
        };
        Object.assign(this, userData);
  
        // 将服务器返回的数据缓存到文件
        let fileData = {};
        if (fs.existsSync(filePath)) {
          const existingData = fs.readFileSync(filePath, 'utf8');
          fileData = existingData ? JSON.parse(existingData) : {};
        }
        if (!fileData["woread_login"]) {
          fileData["woread_login"] = {};
        }
        fileData["woread_login"][this.mobile] = responseData?.["data"];
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
      } else {
        let errorMessage = responseData?.["message"] || "";
        this.log("阅读专区获取token失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
      this.log("发生异常：" + error.message);
    } finally {
      return loginSuccess;
    }
  }
  
  async woread_m_auth(options = {}) {
    let authSuccess = false;
    try {
      let currentTime = Date.now().toString(),
        md5Hash = cryptoJS.MD5(secondProductId + secondSecretKey + currentTime).toString();
      const requestOptions = {
        fn: "woread_auth",
        method: "get",
        url: "https:///m.woread.com.cn/api/union/app/auth/" + secondProductId + "/" + currentTime + "/" + md5Hash
      };
      let {
        result: responseData
      } = await this.request(requestOptions),
        responseCode = appName.get(responseData, "code", -1);
      if (responseCode == "0000") {
        authSuccess = true;
        this.woread_m_accesstoken = responseData?.["data"]?.["accesstoken"];
        this.switch_woread_token(this.woread_m_accesstoken);
      } else {
        let errorMessage = responseData?.["message"] || "";
        this.log("阅读专区获取accesstoken失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      return authSuccess;
    }
  }
  async woread_m_login(options = {}) {
    let loginSuccess = false;
    try {
      let userData = {
        userid: this.woread_userid,
        token: this.woread_token,
        timestamp: Date.now()
      },
        encodedUserData = {
          userData: Buffer.from(JSON.stringify(userData), "utf-8").toString("base64"),
          ...this.get_woread_m_param()
        };
      delete encodedUserData.token;
      let encodedSign = this.encode_woread(encodedUserData, someConstant);
      const signData = {
        sign: encodedSign
      };
      const requestOptions = {
        fn: "woread_login",
        method: "post",
        url: "https://m.woread.com.cn/api/union/user/thirdPartyFreeLogin",
        json: signData
      };
      let {
        result: responseData
      } = await this.request(requestOptions),
        responseCode = appName.get(responseData, "code", -1);
      if (responseCode == "0000") {
        loginSuccess = true;
      } else {
        let errorMessage = responseData?.["message"] || "";
        this.log("阅读专区获取token失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      return loginSuccess;
    }
  }
  async woread_getSeeVideoAddNumber(_0x12ab92, _0x486335 = {}) {
    try {
      let _0x3140d3 = {
        activityIndex: _0x12ab92,
        ...this.get_woread_param()
      },
        _0x8e1656 = this.encode_woread(_0x3140d3);
      const _0xce314c = {
        sign: _0x8e1656
      };
      const _0x3b19e5 = {
        fn: "woread_getSeeVideoAddNumber",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity/getSeeVideoAddNumber",
        json: _0xce314c
      };
      let {
        result: _0x5028e4
      } = await this.woread_api(_0x3b19e5),
        _0x3c20dc = appName.get(_0x5028e4, "code", -1);
      if (_0x3c20dc == "0000") {
        _0x5028e4?.["data"] == -1 && (await this.woread_addUserSeeVideo(_0x12ab92));
      } else {
        let _0x366c05 = _0x5028e4?.["message"] || "";
        this.log("阅读活动[" + _0x12ab92 + "]查询抽奖视频失败[" + _0x3c20dc + "]: " + _0x366c05);
      }
    } catch (_0x3cd6e0) {
      console.log(_0x3cd6e0);
    }
  }
  async woread_addUserSeeVideo(_0x27e075, _0x5be693 = {}) {
    try {
      let _0x1b56c7 = _0x5be693.num || 5,
        _0x211340 = {
          activityIndex: _0x27e075,
          num: _0x1b56c7,
          ...this.get_woread_param()
        },
        _0x530fc3 = this.encode_woread(_0x211340);
      const _0x29270d = {
        sign: _0x530fc3
      };
      const _0x39d9cb = {
        fn: "woread_addUserSeeVideo",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity/addUserSeeVideo",
        json: _0x29270d
      };
      let {
        result: _0x4521b8
      } = await this.woread_api(_0x39d9cb),
        _0x2480f3 = appName.get(_0x4521b8, "code", -1);
      if (_0x2480f3 == "0000") {
        this.log("阅读活动[" + _0x27e075 + "]看视频增加抽奖次数成功");
      } else {
        let _0x4a4ae0 = _0x4521b8?.["message"] || "";
        this.log("阅读活动[" + _0x27e075 + "]看视频增加抽奖次数失败[" + _0x2480f3 + "]: " + _0x4a4ae0);
      }
    } catch (_0x4b1856) {
      console.log(_0x4b1856);
    }
  }
  async woread_getActivityNumber(_0x5ba90a, _0x3cdf38 = {}) {
    try {
      let _0xb90653 = {
        activeIndex: _0x5ba90a,
        ...this.get_woread_param()
      },
        _0x437404 = this.encode_woread(_0xb90653);
      const _0x4b9c36 = {
        sign: _0x437404
      };
      const _0x3446a2 = {
        fn: "woread_getActivityNumber",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity/getActivityNumber",
        json: _0x4b9c36
      };
      let {
        result: _0x4f72f1
      } = await this.woread_api(_0x3446a2),
        _0x1a6ca5 = appName.get(_0x4f72f1, "code", -1);
      if (_0x1a6ca5 == "0000") {
        let _0x8a22f5 = _0x4f72f1?.["data"] || 0;
        this.log("阅读活动[" + _0x5ba90a + "]可以抽奖" + _0x8a22f5 + "次");
        while (_0x8a22f5-- > 0) {
          await appName.wait(5000);
          await this.woread_doDraw(_0x5ba90a);
        }
      } else {
        let _0x3842fa = _0x4f72f1?.["message"] || "";
        this.log("阅读活动[" + _0x5ba90a + "]查询抽奖次数失败[" + _0x1a6ca5 + "]: " + _0x3842fa);
      }
    } catch (_0x5a0a0a) {
      console.log(_0x5a0a0a);
    }
  }
  async woread_addDrawTimes(_0x2ff3ba, _0x15efe7 = {}) {
    try {
      let _0x311995 = {
        activetyindex: _0x2ff3ba,
        ...this.get_woread_param()
      },
        _0x248190 = this.encode_woread(_0x311995);
      const _0x486c6d = {
        sign: _0x248190
      };
      const _0x31e48c = {
        fn: "woread_addDrawTimes",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/basics/addDrawTimes",
        json: _0x486c6d
      };
      await appName.wait_gap_interval(this.t_woread_draw, timeoutMs);
      let {
        result: _0x9db755
      } = await this.woread_api(_0x31e48c);
      this.t_woread_draw = Date.now();
      let _0x358f34 = appName.get(_0x9db755, "code", -1);
      if (_0x358f34 == "0000") {
        this.log("阅读活动[" + _0x2ff3ba + "]打卡增加抽奖次数成功");
      } else {
        if (_0x358f34 != "9999") {
          let _0x494cdf = _0x9db755?.["message"] || "";
          this.log("阅读活动[" + _0x2ff3ba + "]打卡增加抽奖次数失败[" + _0x358f34 + "]: " + _0x494cdf);
        }
      }
    } catch (_0x3bd142) {
      console.log(_0x3bd142);
    }
  }
  async woread_doDraw(_0x397f0b, _0x3c1c53 = {}) {
    try {
      let _0x2027d0 = {
        activeindex: _0x397f0b,
        ...this.get_woread_param()
      },
        _0x36bfe3 = this.encode_woread(_0x2027d0);
      const _0xba593a = {
        sign: _0x36bfe3
      };
      const _0x3af86a = {
        fn: "woread_doDraw",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/basics/doDraw",
        json: _0xba593a
      };
      await appName.wait_gap_interval(this.t_woread_draw, timeoutMs);
      let {
        result: _0x33f591
      } = await this.woread_api(_0x3af86a);
      this.t_woread_draw = Date.now();
      let _0x81a5cb = appName.get(_0x33f591, "code", -1);
      if (_0x81a5cb == "0000") {
        const _0x2e804e = {
          notify: true
        };
        this.log("阅读活动[" + _0x397f0b + "]抽奖: " + (_0x33f591?.["data"]?.["prizedesc"] || "空气"), _0x2e804e);
      } else {
        let _0x4d9a5c = _0x33f591?.["message"] || "";
        this.log("阅读活动[" + _0x397f0b + "]抽奖失败[" + _0x81a5cb + "]: " + _0x4d9a5c);
      }
    } catch (_0x4cbb04) {
      console.log(_0x4cbb04);
    }
  }
  async woread_queryTicketAccount(_0x23aff5 = {}) {
    try {
      let _0x4a62c4 = this.get_woread_param(),
        _0x1a7869 = this.encode_woread(_0x4a62c4);
      const _0x13787c = {
        sign: _0x1a7869
      };
      const _0x1cbb0c = {
        fn: "woread_queryTicketAccount",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/phone/vouchers/queryTicketAccount",
        json: _0x13787c
      };
      let {
        result: _0x3fd342
      } = await this.woread_api(_0x1cbb0c),
        _0x6ce29d = appName.get(_0x3fd342, "code", -1);
      if (_0x6ce29d == "0000") {
        let _0x2284a4 = (_0x3fd342?.["data"]?.["usableNum"] / 100).toFixed(2);
        const _0x45bce9 = {
          notify: true
        };
        this.log("阅读区话费红包余额: " + _0x2284a4, _0x45bce9);
      } else {
        let _0xd876d5 = _0x3fd342?.["message"] || "";
        this.log("查询阅读区话费红包余额失败[" + _0x6ce29d + "]: " + _0xd876d5);
      }
    } catch (_0x46f510) {
      console.log(_0x46f510);
    }
  }
  async woread_m_queryTicketAccount(_0x5f56cc = {}) {
    try {
      let _0x1f1089 = this.get_woread_m_param(),
        _0x599be3 = this.encode_woread(_0x1f1089, someConstant);
      const _0x5e2907 = {
        sign: _0x599be3
      };
      const _0x27cd3f = {
        fn: "woread_m_queryTicketAccount",
        method: "post",
        url: "https://m.woread.com.cn/api/union/phone/vouchers/queryTicketAccount",
        json: _0x5e2907
      };
      let {
        result: _0x5c632b
      } = await this.woread_api(_0x27cd3f),
        _0x5ec93b = appName.get(_0x5c632b, "code", -1);
      if (_0x5ec93b == "0000") {
        let _0x29f71b = (_0x5c632b?.["data"]?.["usableNum"] / 100).toFixed(2);
        const _0x45667c = {
          notify: true
        };
        this.log("阅读区话费红包余额: " + _0x29f71b, _0x45667c);
      } else {
        let _0x51a7d0 = _0x5c632b?.["message"] || "";
        this.log("查询阅读区话费红包余额失败[" + _0x5ec93b + "]: " + _0x51a7d0);
      }
    } catch (_0x1fbab2) {
      console.log(_0x1fbab2);
    }
  }
  async woread_addReadTime(_0x1f2346 = {}) {
    try {
      let {
        readTime = 2,
        cntindex = "409672",
        cntIndex = "409672",
        cnttype = "1",
        cntType = 1,
        cardid = "11891",
        catid = "118411",
        pageIndex = "10683",
        chapterseno = 1,
        channelid = "",
        chapterid = "-1",
        readtype = 1,
        isend = "0"
      } = _0x1f2346,
        _0x3f4dd2 = {
          readTime: readTime,
          cntindex: cntindex,
          cntIndex: cntIndex,
          cnttype: cnttype,
          cntType: cntType,
          catid: catid,
          cardid: cardid,
          pageIndex: pageIndex,
          chapterseno: chapterseno,
          channelid: channelid,
          chapterid: chapterid,
          readtype: readtype,
          isend: isend,
          ...this.get_woread_param()
        },
        _0x223104 = this.encode_woread(_0x3f4dd2);
      const _0x4e8958 = {
        sign: _0x223104
      };
      const _0x5e4f85 = {
        fn: "woread_addReadTime",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/history/addReadTime",
        json: _0x4e8958
      };
      let {
        result: _0x1f9eec
      } = await this.request(_0x5e4f85),
        _0x4851e5 = appName.get(_0x1f9eec, "code", -1);
      if (_0x4851e5 == "0000") {
        this.log("刷新读小说时间: " + _0x1f9eec?.["data"]?.["readtime"] / 60 / 1000 + "分钟");
        _0x1f9eec?.["data"]?.["readtime"] >= 3600000 && (this.read_stop = true);
      } else {
        let _0x797aad = _0x1f9eec?.["message"] || "";
        this.log("刷新读小说时间失败[" + _0x4851e5 + "]: " + _0x797aad);
      }
    } catch (_0x5e3330) {
      console.log(_0x5e3330);
    }
  }
  async woread_m_addReadTime(_0x513b98 = {}) {
    try {
      let {
        readTime = 2,
        cntindex = "409672",
        cntIndex = "409672",
        cnttype = "1",
        cntType = 1,
        cardid = "11891",
        catid = "118411",
        pageIndex = "10683",
        chapterseno = 1,
        channelid = "",
        chapterid = "-1",
        readtype = 1,
        isend = "0"
      } = _0x513b98,
        _0x335ecd = {
          readTime: readTime,
          cntindex: cntindex,
          cntIndex: cntIndex,
          cnttype: cnttype,
          cntType: cntType,
          catid: catid,
          cardid: cardid,
          pageIndex: pageIndex,
          chapterseno: chapterseno,
          channelid: channelid,
          chapterid: chapterid,
          readtype: readtype,
          isend: isend,
          ...this.get_woread_m_param()
        },
        _0x1eb6f5 = this.encode_woread(_0x335ecd, someConstant);
      const _0x3f838f = {
        sign: _0x1eb6f5
      };
      const _0x1eab5b = {
        fn: "woread_m_addReadTime",
        method: "post",
        url: "https:///m.woread.com.cn/api/union/history/addReadTime",
        json: _0x3f838f
      };
      let {
        result: _0xc66009
      } = await this.request(_0x1eab5b),
        _0x22bdf8 = appName.get(_0xc66009, "code", -1);
      if (_0x22bdf8 == "0000") {
        this.log("刷新读小说时间: " + _0xc66009?.["data"]?.["readtime"] / 60 / 1000 + "分钟");
        _0xc66009?.["data"]?.["readtime"] >= 3600000 && (this.read_stop = true);
      } else {
        let _0x179f91 = _0xc66009?.["message"] || "";
        this.log("刷新读小说时间失败[" + _0x22bdf8 + "]: " + _0x179f91);
      }
    } catch (_0x9c51e0) {
      console.log(_0x9c51e0);
    }
  }
  async rabblit_queryActivityData(_0x166566 = {}) {
    try {
      let _0x2faf53 = {
        activeIndex: 26,
        ...this.get_woread_param()
      },
        _0x2725ec = this.encode_woread(_0x2faf53);
      const _0x35f6cf = {
        sign: _0x2725ec
      };
      const _0x296324 = {
        fn: "rabblit_queryActivityData",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/rabbitActivity/queryActivityData",
        json: _0x35f6cf
      };
      let {
        result: _0x22129d
      } = await this.woread_api(_0x296324),
        _0x2490e0 = appName.get(_0x22129d, "code", -1);
      if (_0x2490e0 == "0000") {
        let {
          totalcharpternums: _0x22d281,
          totalreadnums: _0x3ba6a6,
          status: _0x2b7eba,
          activitystatus: _0x34b882
        } = _0x22129d?.["data"];
        if (_0x34b882 == 1) {
          this.need_read_rabbit = false;
          const _0x4e6bbb = {
            notify: true
          };
          this.log("龟兔赛跑今天已完成", _0x4e6bbb);
          return;
        }
        this.need_read_rabbit = true;
        this.log("龟兔赛跑进度: " + _0x3ba6a6 + "/" + _0x22d281 + "分钟");
        if (_0x2b7eba == 1) {
          await this.rabblit_wakeRabbit();
        }
        if (_0x3ba6a6 >= _0x22d281) {
          await this.rabblit_finishActivity();
        }
      } else {
        let _0x3bbb94 = _0x22129d?.["message"] || "";
        _0x3bbb94?.["includes"]("未参加") && !_0x166566.join_retry && (await this.rabblit_joinRuning()) ? (_0x166566.join_retry = true, await this.rabblit_queryActivityData(_0x166566)) : this.log("龟兔赛跑查询状态失败[" + _0x2490e0 + "]: " + _0x3bbb94);
      }
    } catch (_0x5a5d83) {
      console.log(_0x5a5d83);
    }
  }
  async rabblit_joinRuning(_0x22f9b4 = {}) {
    let _0x2a36d7 = false;
    try {
      let _0x5cd0b6 = {
        activeIndex: 26,
        ...this.get_woread_param()
      },
        _0x25fe34 = this.encode_woread(_0x5cd0b6);
      const _0x6d40e3 = {
        sign: _0x25fe34
      };
      const _0x18b2b1 = {
        fn: "rabblit_joinRuning",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/rabbitActivity/joinRuning",
        json: _0x6d40e3
      };
      let {
        result: _0x19cc43
      } = await this.woread_api(_0x18b2b1),
        _0x1dfb20 = appName.get(_0x19cc43, "code", -1);
      if (_0x1dfb20 == "0000") {
        _0x2a36d7 = true;
        this.log("龟兔赛跑报名成功");
      } else {
        let _0x5d645 = _0x19cc43?.["message"] || "";
        this.log("龟兔赛跑报名失败[" + _0x1dfb20 + "]: " + _0x5d645);
      }
    } catch (_0x2c4557) {
      console.log(_0x2c4557);
    } finally {
      return _0x2a36d7;
    }
  }
  async rabblit_wakeRabbit(_0x36c542 = {}) {
    try {
      let _0x1237f5 = {
        activeIndex: 26,
        sactivitIndex: 7246,
        ...this.get_woread_param()
      },
        _0xaf381f = this.encode_woread(_0x1237f5);
      const _0x162f7e = {
        sign: _0xaf381f
      };
      const _0x33fcf5 = {
        fn: "rabblit_wakeRabbit",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/rabbitActivity/wakeRabbit",
        json: _0x162f7e
      };
      await appName.wait_gap_interval(this.t_woread_draw, timeoutMs);
      let {
        result: _0x5f4ee4
      } = await this.woread_api(_0x33fcf5);
      this.t_woread_draw = Date.now();
      let _0x531c58 = appName.get(_0x5f4ee4, "code", -1);
      if (_0x531c58 == "0000") {
        const _0x19370a = {
          notify: true
        };
        this.log("龟兔赛跑唤醒兔子抽奖: " + (_0x5f4ee4?.["data"]?.["prizedesc"] || "空气"), _0x19370a);
      } else {
        let _0x59d84e = _0x5f4ee4?.["message"] || "";
        this.log("龟兔赛跑唤醒兔子失败[" + _0x531c58 + "]: " + _0x59d84e);
      }
    } catch (_0x4b75db) {
      console.log(_0x4b75db);
    }
  }
  async rabblit_finishActivity(_0x451bd0 = {}) {
    try {
      let _0x9cdff4 = {
        activeIndex: 26,
        ...this.get_woread_param()
      },
        _0x517547 = this.encode_woread(_0x9cdff4);
      const _0x5c2de6 = {
        sign: _0x517547
      };
      const _0x4a355a = {
        fn: "rabblit_finishActivity",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/rabbitActivity/finishActivity",
        json: _0x5c2de6
      };
      await appName.wait_gap_interval(this.t_woread_draw, timeoutMs);
      let {
        result: _0x254943
      } = await this.woread_api(_0x4a355a);
      this.t_woread_draw = Date.now();
      let _0x6bb8e = appName.get(_0x254943, "code", -1);
      if (_0x6bb8e == "0000") {
        this.need_read_rabbit = false;
        const _0x2f0d17 = {
          notify: true
        };
        this.log("龟兔赛跑终点抽奖: " + (_0x254943?.["data"]?.["prizedesc"] || "空气"), _0x2f0d17);
      } else {
        let _0x3e4556 = _0x254943?.["message"] || "";
        this.log("龟兔赛跑终点抽奖失败[" + _0x6bb8e + "]: " + _0x3e4556);
      }
    } catch (_0x4f0c17) {
      console.log(_0x4f0c17);
    }
  }
  async moonbox_queryActiveInfo(options = {}) {
    try {
      let woreadParams = this.get_woread_param(),
        encodedSign = this.encode_woread(woreadParams);
      const signData = {
        sign: encodedSign
      };
      const requestOptions = {
        fn: "moonbox_queryActiveInfo",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity423/queryActiveInfo",
        json: signData
      };
      let {
        result: responseData
      } = await this.woread_api(requestOptions),
        responseCode = appName.get(responseData, "code", -1);
      if (responseCode == "0000") {
        let {
          activeId: activeId,
          activeName: activeName
        } = responseData?.["data"];
        moonbox_activeId = activeId;
      } else {
        let errorMessage = responseData?.["message"] || "";
        this.log("阅光宝盒查询活动失败[" + responseCode + "]: " + errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async moonbox_queryCurTaskStatus(options = {}) {
    try {
      let requestParams = {
        activeIndex: moonbox_activeId,
        //console.log("activeIndex = "+activeIndex),
        ...this.get_woread_param()
      },
        
        encodedSign = this.encode_woread(requestParams);
        // console.log(requestParams)
        //console.log("requestParams = "+requestParams)
        // console.log("encodedSign = "+encodedSign)
      const signData = {
        sign: encodedSign
      };
      const requestOptions = {
        fn: "moonbox_queryCurTaskStatus",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity423/queryCurTaskStatus",
        json: signData
      };
      let {
        result: responseData
      } = await this.woread_api(requestOptions),
        responseCode = appName.get(responseData, "code", -1);
      if (responseCode == "0000") {
        for (let task of responseData?.["data"] || []) {
          let {
            taskName: taskName,
            currentValue: currentValue,
            taskValue: taskValue
          } = task?.["taskDetail"];
          switch (task.taskStatus) {
            case 0:
              {
                this.moonbox_task_record[taskName] = true;
                this.log("阅光宝盒[" + taskName + "]进度: " + parseInt(currentValue) + "/" + taskValue + "分钟");
                break;
              }
            case 2:
              {
                await this.moonbox_completeActiveTask(task);
              }
            case 1:
              {
                this.moonbox_task_record[taskName] = false;
                if (!this.moonbox_notified.includes(taskName)) {
                  this.moonbox_notified.push(taskName);
                  const notification = {
                    notify: true
                  };
                  this.log("阅光宝盒任务[" + taskName + "]已完成", notification);
                }
                break;
              }
          }
        }
      } else {
        let errorMessage = responseData?.["message"] || "";
        if (errorMessage?.["includes"]("未领取") && !options.activate_retry) {
          await this.moonbox_queryActiveTaskList();
          options.activate_retry = true;
          await this.moonbox_queryCurTaskStatus(options);
        } else {
          this.log("阅光宝盒查询任务状态失败[" + responseCode + "]: " + errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  async moonbox_completeActiveTask(_0x4af677, _0x3aeda0 = {}) {
    try {
      let _0x4c63e8 = {
        taskId: _0x4af677.id,
        ...this.get_woread_param()
      },
        _0xa3034 = this.encode_woread(_0x4c63e8);
      const _0x378954 = {
        sign: _0xa3034
      };
      const _0x4513b4 = {
        fn: "moonbox_completeActiveTask",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity423/completeActiveTask",
        json: _0x378954
      };
      let {
        result: _0x40efdd
      } = await this.woread_api(_0x4513b4),
        _0x37bf24 = appName.get(_0x40efdd, "code", -1);
      if (_0x37bf24 == "0000") {
        const _0x432c2b = {
          notify: true
        };
        this.log("阅光宝盒[" + _0x40efdd?.["data"]?.["taskDetail"]?.["taskName"] + "]领取奖励成功: " + _0x40efdd?.["data"]?.["exchangeResult"]?.["materialGroupInfo"]?.["groupName"], _0x432c2b);
      } else {
        let _0x355fe8 = _0x40efdd?.["message"] || "";
        this.log("阅光宝盒[" + _0x4af677?.["taskDetail"]?.["taskName"] + "]领取奖励失败[" + _0x37bf24 + "]: " + _0x355fe8);
      }
    } catch (_0x5d1580) {
      console.log(_0x5d1580);
    }
  }
  async moonbox_queryActiveTaskList(_0x5b4f5d = {}) {
    try {
      let _0x29dc0b = {
        activeIndex: moonbox_activeId,
        ...this.get_woread_param()
      },
        _0x416ead = this.encode_woread(_0x29dc0b);
      const _0x3d0c02 = {
        sign: _0x416ead
      };
      const _0x5e2bbb = {
        fn: "moonbox_queryActiveTaskList",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity423/queryActiveTaskList",
        json: _0x3d0c02
      };
      let {
        result: _0x391626
      } = await this.woread_api(_0x5e2bbb),
        _0x42ede6 = appName.get(_0x391626, "code", -1);
      if (_0x42ede6 == "0000") {
        let _0x1cff30 = _0x391626?.["data"]?.["sort"](function (_0x1792cf, _0xe10a9b) {
          let _0x3ecb2c = parseInt(_0xe10a9b.taskDetail.taskValue),
            _0x243b54 = parseInt(_0x1792cf.taskDetail.taskValue);
          return _0x3ecb2c - _0x243b54;
        }),
          _0xe49ce3 = _0x1cff30.filter(_0x5ed25d => _0x5ed25d.maxNum - _0x5ed25d.receiveNum > 0 && _0x5ed25d.taskDetail.materialGroup.groupName.includes("红包"));
        _0xe49ce3?.["length"] ? await this.moonbox_receiveActiveTask(_0xe49ce3) : this.log("没有可领取的阅光宝盒红包任务了");
      } else {
        let _0x37141c = _0x391626?.["message"] || "";
        this.log("阅光宝盒查询可领取任务失败[" + _0x42ede6 + "]: " + _0x37141c);
      }
    } catch (_0x3346d3) {
      console.log(_0x3346d3);
    }
  }
  async moonbox_receiveActiveTask(_0x17d7d6, _0x642063 = {}) {
    try {
      if (!_0x17d7d6.length) {
        return;
      }
      let _0x471744 = _0x17d7d6.shift(),
        _0x3180c7 = _0x471744?.["taskDetail"]?.["taskName"] || "",
        _0x35c4b9 = {
          activeId: moonbox_activeId,
          taskId: _0x471744.secondTaskId,
          ...this.get_woread_param()
        },
        _0x9d13eb = this.encode_woread(_0x35c4b9);
        console.log("encodedSign = "+_0x9d13eb)
      const _0x1abd0a = {
        sign: _0x9d13eb
      };
      const _0x3e1696 = {
        fn: "moonbox_queryActiveTaskList",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity423/receiveActiveTask",
        json: _0x1abd0a
      };
      let {
        result: _0x4cc772
      } = await this.woread_api(_0x3e1696),
        _0x45290e = appName.get(_0x4cc772, "code", -1);
      if (_0x45290e == "0000") {
        this.moonbox_task_record[_0x3180c7] = true;
        this.log("领取阅光宝盒任务[" + _0x3180c7 + "]成功");
      } else {
        let _0x4cc9d9 = _0x4cc772?.["message"] || "";
        this.log("领取阅光宝盒任务[" + _0x3180c7 + "]失败[" + _0x45290e + "]: " + _0x4cc9d9);
        (_0x4cc9d9?.["includes"]("今天无法完成") || _0x4cc9d9?.["includes"]("领光了")) && _0x17d7d6.length > 0 && (await appName.wait(500), await this.moonbox_receiveActiveTask(_0x17d7d6, _0x642063));
      }
    } catch (_0x2fbd0d) {
      console.log(_0x2fbd0d);
    }
  }
  async moonbox_queryReadStatus(_0x27c1b2 = {}) {
    try {
      let _0x4dd0d9 = {
        activeIndex: moonbox_activeId,
        ...this.get_woread_param()
      },
        _0x3f59e7 = this.encode_woread(_0x4dd0d9);
      const _0x2456fd = {
        sign: _0x3f59e7
      };
      const _0x4596d4 = {
        fn: "moonbox_queryReadStatus",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity423/queryReadStatus",
        json: _0x2456fd
      };
      let {
        result: _0x3fc97e
      } = await this.woread_api(_0x4596d4),
        _0x479ae3 = appName.get(_0x3fc97e, "code", -1);
      if (_0x479ae3 == "0000") {
        switch (_0x3fc97e?.["data"]) {
          case "2":
            {
              this.log("阅光宝盒去阅读两分钟抽奖");
              this.switch_woread_token(this.woread_m_accesstoken);
              const _0x4dd67c = {
                readTime: 2
              };
              await this.woread_m_addReadTime(_0x4dd67c);
              this.switch_woread_token(this.woread_accesstoken);
              await this.moonbox_drawReadActivePrize();
              break;
            }
          case "3":
            {
              this.log("阅光宝盒今天已抽奖");
              break;
            }
          case "4":
            {
              this.log("阅光宝盒今天可以抽奖");
              await this.moonbox_drawReadActivePrize();
              break;
            }
          default:
            {
              this.log("阅光宝盒抽奖状态[" + _0x3fc97e?.["data"] + "]");
              break;
            }
        }
      } else {
        let _0x9b31af = _0x3fc97e?.["message"] || "";
        this.log("查询阅光宝盒抽奖次数失败[" + _0x479ae3 + "]: " + _0x9b31af);
      }
    } catch (_0x71eb7f) {
      console.log(_0x71eb7f);
    }
  }
  async moonbox_drawReadActivePrize(_0x56938e = {}) {
    try {
      let _0x3eabf6 = {
        activeIndex: moonbox_activeId,
        ...this.get_woread_param()
      },
        _0x3ad9f4 = this.encode_woread(_0x3eabf6);
      const _0xe79885 = {
        sign: _0x3ad9f4
      };
      const _0x2ff4df = {
        fn: "moonbox_drawReadActivePrize",
        method: "post",
        url: "https://10010.woread.com.cn/ng_woread_service/rest/activity423/drawReadActivePrize",
        json: _0xe79885
      };
      let {
        result: _0x1633e7
      } = await this.woread_api(_0x2ff4df),
        _0x27c470 = appName.get(_0x1633e7, "code", -1);
      if (_0x27c470 == "0000") {
        const _0x4d8266 = {
          notify: true
        };
        this.log("阅光宝盒抽奖: " + (_0x1633e7?.["data"]?.["prizedesc"] || JSON.stringify(_0x1633e7)), _0x4d8266);
      } else {
        let _0x55fb06 = _0x1633e7?.["message"] || "";
        this.log("阅光宝盒抽奖失败[" + _0x27c470 + "]: " + _0x55fb06);
      }
    } catch (_0xf0a009) {
      console.log(_0xf0a009);
    }
  }
  async moonbox_m_queryActiveInfo(_0x2f8e7f = {}) {
    try {
      let _0x14f205 = this.get_woread_m_param(),
        _0x121f46 = this.encode_woread(_0x14f205, someConstant);
      const _0x45f3ae = {
        sign: _0x121f46
      };
      const _0x59055e = {
        fn: "moonbox_m_queryActiveInfo",
        method: "post",
        url: "https://m.woread.com.cn/api/union/activity423/queryActiveInfo",
        json: _0x45f3ae
      };
      let {
        result: _0x425b85
      } = await this.woread_api(_0x59055e),
        _0x40ba28 = appName.get(_0x425b85, "code", -1);
      if (_0x40ba28 == "0000") {
        let {
          activeId: _0x3f90b8,
          activeName: _0x2a7af0
        } = _0x425b85?.["data"];
        moonbox_activeId = _0x3f90b8;
      } else {
        let _0x2087f5 = _0x425b85?.["message"] || "";
        this.log("阅光宝盒查询活动失败[" + _0x40ba28 + "]: " + _0x2087f5);
      }
    } catch (_0xfd1d67) {
      console.log(_0xfd1d67);
    }
  }
  async moonbox_m_queryCurTaskStatus(_0xcef68f = {}) {
    try {
      let _0x5e3f1e = {
        activeIndex: moonbox_activeId,
        ...this.get_woread_m_param()
      },
        _0x7bc91f = this.encode_woread(_0x5e3f1e, someConstant);
      const _0x509ba5 = {
        sign: _0x7bc91f
      };
      const _0x439dbd = {
        fn: "moonbox_m_queryCurTaskStatus",
        method: "post",
        url: "https://m.woread.com.cn/api/union/activity423/queryCurTaskStatus",
        json: _0x509ba5
      };
      let {
        result: _0x51e7c5
      } = await this.woread_api(_0x439dbd),
        _0x3e8bcf = appName.get(_0x51e7c5, "code", -1);
      if (_0x3e8bcf == "0000") {
        for (let _0xe83310 of _0x51e7c5?.["data"] || []) {
          let {
            taskName: _0x4d3802,
            currentValue: _0x58b1af,
            taskValue: _0x54fad8
          } = _0xe83310?.["taskDetail"];
          switch (_0xe83310.taskStatus) {
            case 0:
              {
                this.moonbox_task_record[_0x4d3802] = true;
                this.log("阅光宝盒[" + _0x4d3802 + "]进度: " + parseInt(_0x58b1af) + "/" + _0x54fad8 + "分钟");
                break;
              }
            case 2:
              {
                await this.moonbox_m_completeActiveTask(_0xe83310);
              }
            case 1:
              {
                this.moonbox_task_record[_0x4d3802] = false;
                if (!this.moonbox_notified.includes(_0x4d3802)) {
                  this.moonbox_notified.push(_0x4d3802);
                  const _0x14eeaa = {
                    notify: true
                  };
                  this.log("阅光宝盒任务[" + _0x4d3802 + "]已完成", _0x14eeaa);
                }
                break;
              }
          }
        }
      } else {
        let _0x4b5302 = _0x51e7c5?.["message"] || "";
        _0x4b5302?.["includes"]("未领取") && !_0xcef68f.activate_retry && (await this.moonbox_queryActiveTaskList()) ? (_0xcef68f.activate_retry = true, await this.moonbox_m_queryCurTaskStatus(_0xcef68f)) : this.log("阅光宝盒查询任务状态失败[" + _0x3e8bcf + "]: " + _0x4b5302);
      }
    } catch (_0x2b3c91) {
      console.log(_0x2b3c91);
    }
  }
  async moonbox_m_completeActiveTask(_0x3a9ed6, _0x14d7fc = {}) {
    try {
      let _0x4feba7 = {
        taskId: _0x3a9ed6.id,
        ...this.get_woread_m_param()
      },
        _0x3be902 = this.encode_woread(_0x4feba7, someConstant);
      const _0x304a2d = {
        sign: _0x3be902
      };
      const _0x3f6790 = {
        fn: "moonbox_m_completeActiveTask",
        method: "post",
        url: "https://m.woread.com.cn/api/union/activity423/completeActiveTask",
        json: _0x304a2d
      };
      let {
        result: _0x27b401
      } = await this.woread_api(_0x3f6790),
        _0x1b57e3 = appName.get(_0x27b401, "code", -1);
      if (_0x1b57e3 == "0000") {
        const _0x1dd73a = {
          notify: true
        };
        this.log("阅光宝盒[" + _0x27b401?.["data"]?.["taskDetail"]?.["taskName"] + "]领取奖励成功: " + _0x27b401?.["data"]?.["exchangeResult"]?.["materialGroupInfo"]?.["groupName"], _0x1dd73a);
      } else {
        let _0x3a226a = _0x27b401?.["message"] || "";
        this.log("阅光宝盒[" + _0x3a9ed6?.["taskDetail"]?.["taskName"] + "]领取奖励失败[" + _0x1b57e3 + "]: " + _0x3a226a);
      }
    } catch (_0x5f2f11) {
      console.log(_0x5f2f11);
    }
  }
  async moonbox_m_queryActiveTaskList(_0x165565 = {}) {
    try {
      let _0x3779e6 = {
        activeIndex: moonbox_activeId,
        ...this.get_woread_m_param()
      },
        _0x5ec19c = this.encode_woread(_0x3779e6, someConstant);
      const _0x34cd3e = {
        sign: _0x5ec19c
      };
      const _0x3025ab = {
        fn: "moonbox_m_queryActiveTaskList",
        method: "post",
        url: "https://m.woread.com.cn/api/union/activity423/queryActiveTaskList",
        json: _0x34cd3e
      };
      let {
        result: _0x591b1d
      } = await this.woread_api(_0x3025ab),
        _0x112619 = appName.get(_0x591b1d, "code", -1);
      if (_0x112619 == "0000") {
        let _0x1a7988 = _0x591b1d?.["data"]?.["sort"](function (_0x533bfe, _0x3cbfac) {
          let _0x1619db = parseInt(_0x3cbfac.taskDetail.taskValue),
            _0x5d17d1 = parseInt(_0x533bfe.taskDetail.taskValue);
          return _0x1619db - _0x5d17d1;
        }),
          _0x590d73 = _0x1a7988.filter(_0xa65315 => _0xa65315.maxNum - _0xa65315.receiveNum > 0 && _0xa65315.taskDetail.materialGroup.groupName.includes("红包"));
        _0x590d73?.["length"] ? await this.moonbox_m_receiveActiveTask(_0x590d73) : this.log("没有可领取的阅光宝盒红包任务了");
      } else {
        let _0x51d622 = _0x591b1d?.["message"] || "";
        this.log("阅光宝盒查询可领取任务失败[" + _0x112619 + "]: " + _0x51d622);
      }
    } catch (_0x39e415) {
      console.log(_0x39e415);
    }
  }
  async moonbox_m_receiveActiveTask(_0x222667, _0x20f0f8 = {}) {
    try {
      if (!_0x222667.length) {
        return;
      }
      let _0x5013e3 = _0x222667.shift(),
        _0x5915e5 = _0x5013e3?.["taskDetail"]?.["taskName"] || "",
        _0x499f8f = {
          activeId: moonbox_activeId,
          taskId: _0x5013e3.secondTaskId,
          ...this.get_woread_m_param()
        },
        _0x5a8196 = this.encode_woread(_0x499f8f, someConstant);
      const _0x54248e = {
        sign: _0x5a8196
      };
      const _0x41777c = {
        fn: "moonbox_m_queryActiveTaskList",
        method: "post",
        url: "https://m.woread.com.cn/api/union/activity423/receiveActiveTask",
        json: _0x54248e
      };
      let {
        result: _0x5b661a
      } = await this.woread_api(_0x41777c),
        _0x12d65d = appName.get(_0x5b661a, "code", -1);
      if (_0x12d65d == "0000") {
        this.moonbox_task_record[_0x5915e5] = true;
        this.log("领取阅光宝盒任务[" + _0x5915e5 + "]成功");
      } else {
        let _0x1347e6 = _0x5b661a?.["message"] || "";
        this.log("领取阅光宝盒任务[" + _0x5915e5 + "]失败[" + _0x12d65d + "]: " + _0x1347e6);
        (_0x1347e6?.["includes"]("今天无法完成") || _0x1347e6?.["includes"]("领光了")) && _0x222667.length > 0 && (await appName.wait(500), await this.moonbox_m_receiveActiveTask(_0x222667, _0x20f0f8));
      }
    } catch (_0x26b16f) {
      console.log(_0x26b16f);
    }
  }
  async moonbox_m_queryReadStatus(_0x2089b8 = {}) {
    try {
      let _0x5361cf = {
        activeIndex: moonbox_activeId,
        ...this.get_woread_m_param()
      },
        _0x36b85a = this.encode_woread(_0x5361cf, someConstant);
      const _0x1c1d08 = {
        sign: _0x36b85a
      };
      const _0x30f8ca = {
        fn: "moonbox_m_queryReadStatus",
        method: "post",
        url: "https://m.woread.com.cn/api/union/activity423/queryReadStatus",
        json: _0x1c1d08
      };
      let {
        result: _0x3ac100
      } = await this.woread_api(_0x30f8ca),
        _0x446cf9 = appName.get(_0x3ac100, "code", -1);
      if (_0x446cf9 == "0000") {
        switch (_0x3ac100?.["message"]) {
          case "2":
            {
              this.log("阅光宝盒去阅读两分钟抽奖");
              const _0x177649 = {
                readTime: 2
              };
              await this.woread_m_addReadTime(_0x177649);
              await this.moonbox_m_drawReadActivePrize();
              break;
            }
          case "3":
            {
              this.log("阅光宝盒今天已抽奖");
              break;
            }
          case "4":
            {
              this.log("阅光宝盒今天可以抽奖");
              await this.moonbox_m_drawReadActivePrize();
              break;
            }
          default:
            {
              this.log("阅光宝盒抽奖状态[" + _0x3ac100?.["data"] + "]");
              break;
            }
        }
      } else {
        let _0x3e13a2 = _0x3ac100?.["message"] || "";
        this.log("查询阅光宝盒抽奖次数失败[" + _0x446cf9 + "]: " + _0x3e13a2);
      }
    } catch (_0x370229) {
      console.log(_0x370229);
    }
  }
  async moonbox_m_drawReadActivePrize(_0x577cf6 = {}) {
    try {
      let _0x48a5f2 = {
        activeIndex: moonbox_activeId,
        ...this.get_woread_m_param()
      },
        _0x52e161 = this.encode_woread(_0x48a5f2, someConstant);
      const _0x815396 = {
        sign: _0x52e161
      };
      const _0x14a91e = {
        fn: "moonbox_m_drawReadActivePrize",
        method: "post",
        url: "https://m.woread.com.cn/api/union/activity423/drawReadActivePrize",
        json: _0x815396
      };
      let {
        result: _0x13c8d4
      } = await this.woread_api(_0x14a91e),
        _0x3b1c56 = appName.get(_0x13c8d4, "code", -1);
      if (_0x3b1c56 == "0000") {
        const _0x75d6a5 = {
          notify: true
        };
        this.log("阅光宝盒抽奖: " + (_0x13c8d4?.["data"]?.["prizedesc"] || JSON.stringify(_0x13c8d4)), _0x75d6a5);
      } else {
        let _0x1d2f3b = _0x13c8d4?.["message"] || "";
        this.log("阅光宝盒抽奖失败[" + _0x3b1c56 + "]: " + _0x1d2f3b);
      }
    } catch (_0x2e18c9) {
      console.log(_0x2e18c9);
    }
  }
  async ltyp_login(_0x1ce474, _0x483381 = {}) {
    try {
      const _0x2b5783 = {
        "client-Id": client_Id,
        accessToken: ""
      };
      const _0x146bcb = {
        clientId: client_Id,
        ticket: _0x1ce474
      };
      let _0x4efd51 = {
        fn: "ltyp_login",
        method: "post",
        url: "https://panservice.mail.wo.cn/wohome/dispatcher",
        headers: _0x2b5783,
        json: {
          header: this.get_ltyp_sign_header("HandheldHallAutoLogin"),
          body: _0x146bcb
        }
      },
        {
          result: _0x30e605
        } = await this.request(_0x4efd51),
        _0x4d6db0 = appName.get(_0x30e605, "STATUS", -1);
      if (_0x4d6db0 == 200) {
        this.ltyp_token = _0x30e605?.["RSP"]?.["DATA"]?.["token"];
        for (let _0x27bfeb of ltyp_lottery) {
          await this.ltyp_incentiveTimes(_0x27bfeb);
          await this.ltyp_lottery(_0x27bfeb);
        }
      } else {
        let _0x13a7ba = _0x30e605?.["msg"] || "";
        this.log("联通云盘登录失败[" + _0x4d6db0 + "]: " + _0x13a7ba);
      }
    } catch (_0x505ae6) {
      console.log(_0x505ae6);
    }
  }
  async ltyp_incentiveTimes(_0x4b3a88, _0x26cec8 = {}) {
    try {
      const _0x1029d2 = {
        "client-Id": client_Id,
        "Access-Token": this.ltyp_token
      };
      const _0xc10a38 = {
        fn: "ltyp_incentiveTimes",
        method: "get",
        url: "https://panservice.mail.wo.cn/activity/v1/incentiveTimes",
        headers: _0x1029d2,
        searchParams: {}
      };
      _0xc10a38.searchParams.bizKey = "incentiveTimesPipeline";
      _0xc10a38.searchParams.activityId = _0x4b3a88;
      let {
        result: _0x117383
      } = await this.request(_0xc10a38),
        _0x334590 = appName.get(_0x117383?.["meta"], "code", -1);
      if (_0x334590 == 0) {
        let {
          isIncentiveTask = 0,
          taskType = 0,
          incentiveTimeTotal = 0,
          incentiveTimeDone = 0
        } = _0x117383?.["result"];
        if (isIncentiveTask) {
          for (let _0x1e30b1 = incentiveTimeDone; _0x1e30b1 < incentiveTimeTotal; _0x1e30b1++) {
            await this.ltyp_incentiveTask(_0x4b3a88);
          }
        }
      } else {
        let _0x17b321 = _0x117383?.["meta"]?.["message"] || "";
        this.log("联通云盘查询任务失败[" + _0x334590 + "]: " + _0x17b321);
      }
    } catch (_0x54a602) {
      console.log(_0x54a602);
    }
  }
  async ltyp_incentiveTask(_0x3ffa2a, _0x291739 = {}) {
    try {
      const _0x4423a2 = {
        "client-Id": client_Id,
        "Access-Token": this.ltyp_token
      };
      const _0x5d1e51 = {
        activityId: _0x3ffa2a
      };
      const _0x58fc09 = {
        bizKey: "incentiveTaskPipeline",
        bizObject: _0x5d1e51
      };
      const _0x959e18 = {
        fn: "ltyp_incentiveTask",
        method: "post",
        url: "https://panservice.mail.wo.cn/activity/v1/incentiveTask",
        headers: _0x4423a2,
        json: _0x58fc09
      };
      let {
        result: _0x4e3742
      } = await this.request(_0x959e18),
        _0x331ab9 = appName.get(_0x4e3742?.["meta"], "code", -1);
      if (_0x331ab9 == 0) {
        let {
          incentiveStatus = 0,
          incentiveMessage = ""
        } = _0x4e3742?.["result"];
        incentiveStatus == 1 ? this.log("联通云盘完成任务成功") : this.log("联通云盘完成任务失败[" + incentiveStatus + "]: " + incentiveMessage);
      } else {
        let _0x172131 = _0x4e3742?.["meta"]?.["message"] || "";
        this.log("联通云盘完成任务错误[" + _0x331ab9 + "]: " + _0x172131);
      }
    } catch (_0x47d039) {
      console.log(_0x47d039);
    }
  }
  async ltyp_lottery_times(_0x5644fa, _0x42508f = {}) {
    try {
      const _0xe7632d = {
        "client-Id": client_Id,
        token: this.ltyp_token
      };
      const _0x314980 = {
        activityId: _0x5644fa
      };
      const _0x8e464d = {
        fn: "ltyp_lottery_times",
        method: "get",
        url: "https://panservice.mail.wo.cn/activity/v1/times",
        headers: _0xe7632d,
        searchParams: _0x314980
      };
      let {
        result: _0x2138c5
      } = await this.request(_0x8e464d),
        _0x5ede21 = appName.get(_0x2138c5, "RSP_CODE", -1);
      if (_0x5ede21 == 0) {
        let {
          times = 0
        } = _0x2138c5?.["DATA"];
        this.log("联通云盘可以抽奖" + times + "次");
        while (times-- > 0) {
          await appName.wait(1000);
          await this.ltyp_lottery(_0x5644fa);
        }
      } else {
        let _0x54bc65 = _0x2138c5?.["RSP_DESC"] || "";
        this.log("联通云盘查询抽奖次数失败[" + _0x5ede21 + "]: " + _0x54bc65);
      }
    } catch (_0xdeafa3) {
      console.log(_0xdeafa3);
    }
  }
  async ltyp_lottery(_0x3f86e4, _0x2e2814 = {}) {
    try {
      const _0x46983d = {
        "client-Id": client_Id,
        "Access-Token": this.ltyp_token
      };
      const _0x373c74 = {
        activityId: _0x3f86e4,
        type: 3
      };
      const _0x474c24 = {
        lottery: _0x373c74
      };
      const _0x4a1127 = {
        bizKey: "newLottery",
        bizObject: _0x474c24
      };
      const _0x3a5637 = {
        fn: "ltyp_lottery",
        method: "post",
        url: "https://panservice.mail.wo.cn/wohome/v1/lottery",
        headers: _0x46983d,
        json: _0x4a1127
      };
      let {
        result: _0x3f8809
      } = await this.request(_0x3a5637),
        _0x29e0e0 = appName.get(_0x3f8809?.["meta"], "code", -1);
      if (_0x29e0e0 == 0) {
        let {
          prizeName = ""
        } = _0x3f8809?.["result"];
        if (prizeName) {
          const _0x59a8ae = {
            notify: true
          };
          this.log("联通云盘抽奖: " + prizeName, _0x59a8ae);
          await this.ltyp_lottery(_0x3f86e4, _0x2e2814);
        }
      } else {
        let _0x2fe581 = _0x3f8809?.["meta"]?.["message"] || "";
        this.log("联通云盘抽奖错误[" + _0x29e0e0 + "]: " + _0x2fe581);
      }
    } catch (_0x6e247d) {
      console.log(_0x6e247d);
    }
  }
  async act_517_userAccount(_0x5d111b = {}) {
    try {
      const _0x52d1fe = {
        fn: "act_517_userAccount",
        method: "get",
        url: "https://activity.10010.com/2024517charges/lottery/userAccount"
      };
      {
        let {
          result: _0x12e6e7,
          statusCode: _0x24ba47
        } = await this.request(appName.copy(_0x52d1fe)),
          _0x3f7586 = appName.get(_0x12e6e7, "code", _0x24ba47);
        if (_0x3f7586 == "0000") {
          await this.act_517_taskList();
        } else {
          let _0xa39ecd = _0x12e6e7?.["message"] || _0x12e6e7?.["msg"] || "";
          this.log("517活动进入主页失败[" + _0x3f7586 + "]: " + _0xa39ecd);
          return;
        }
      }
      {
        let {
          result: _0x2d9fa8,
          statusCode: _0x40643e
        } = await this.request(appName.copy(_0x52d1fe)),
          _0x5caf5e = appName.get(_0x2d9fa8, "code", _0x40643e);
        if (_0x5caf5e == "0000") {
          let {
            chances: _0xb8ead9
          } = _0x2d9fa8?.["data"];
          this.log("517活动可以抽奖" + _0xb8ead9 + "次");
          let _0x4a90fa = false;
          while (_0xb8ead9-- > 0) {
            if (_0x4a90fa) {
              await appName.wait(3000);
            }
            _0x4a90fa = true;
            await this.act_517_lottery();
          }
        } else {
          let _0x401062 = _0x2d9fa8?.["message"] || _0x2d9fa8?.["msg"] || "";
          this.log("517活动查询抽奖次数失败[" + _0x5caf5e + "]: " + _0x401062);
        }
      }
      {
        let {
          result: _0x112b84,
          statusCode: _0x3d9692
        } = await this.request(appName.copy(_0x52d1fe)),
          _0x164969 = appName.get(_0x112b84, "code", _0x3d9692);
        if (_0x164969 == "0000") {
          let {
            amount: _0x1053c0,
            targetAmount: _0x248ecd
          } = _0x112b84?.["data"];
          const _0x3dbd45 = {
            notify: true
          };
          this.log("517活动现金进度: " + _0x1053c0 + "/" + _0x248ecd, _0x3dbd45);
        } else {
          let _0x53c12d = _0x112b84?.["message"] || _0x112b84?.["msg"] || "";
          this.log("517活动查询进度失败[" + _0x164969 + "]: " + _0x53c12d);
        }
      }
    } catch (_0x55b6a1) {
      console.log(_0x55b6a1);
    }
  }
  async act_517_bind(_0x3ec228, _0x281097 = {}) {
    try {
      const _0x54d111 = {
        fn: "act_517_bind",
        method: "post",
        url: "https://activity.10010.com/2024517charges/openWindows/bind",
        json: {},
        valid_code: [401]
      };
      _0x54d111.json.shareCode = _0x3ec228;
      _0x54d111.json.channel = "countersign";
      let {
        result: _0x5b7fc4
      } = await this.request(_0x54d111);
    } catch (_0x500ea5) {
      console.log(_0x500ea5);
    }
  }
  async act_517_lottery(_0x108752 = {}) {
    try {
      const _0x3b78e1 = {
        fn: "act_517_lottery",
        method: "get",
        url: "https://activity.10010.com/2024517charges/lottery/lottery"
      };
      let {
        result: _0x4124a9,
        statusCode: _0x2962e5
      } = await this.request(_0x3b78e1),
        _0x3d0976 = appName.get(_0x4124a9, "code", _0x2962e5);
      if (_0x3d0976 == "0000") {
        _0x4124a9?.["data"]?.["uuid"] ? (await appName.wait(2000), await this.act_517_winningRecord(_0x4124a9.data.uuid)) : this.log("517活动抽奖失败, 没有返回uuid");
      } else {
        let _0x52341d = _0x4124a9?.["message"] || _0x4124a9?.["msg"] || "";
        this.log("517活动抽奖失败[" + _0x3d0976 + "]: " + _0x52341d);
      }
    } catch (_0x162e6a) {
      console.log(_0x162e6a);
    }
  }
  async act_517_winningRecord(_0x30fba9, _0x228991 = {}) {
    try {
      const _0x55e850 = {
        requestId: _0x30fba9
      };
      const _0x4c9db5 = {
        fn: "act_517_winningRecord",
        method: "get",
        url: "https://activity.10010.com/2024517charges/lottery/winningRecord",
        searchParams: _0x55e850
      };
      let {
        result: _0x171769,
        statusCode: _0x4aedd2
      } = await this.request(_0x4c9db5),
        _0x57336e = appName.get(_0x171769, "code", _0x4aedd2);
      if (_0x57336e == "0000") {
        if (_0x171769?.["data"]?.["isWin"] === "1") {
          let {
            prizeAmount: _0x11e55c,
            prizeList: _0x175f28,
            afterAmount: _0x493574,
            targetAmount: _0x2e20be,
            showAmount = "0"
          } = _0x171769?.["data"],
            _0x48f549 = (_0x175f28 || []).filter(_0x5a6286 => _0x5a6286.prizeName).map(_0x2807d7 => _0x2807d7.prizeName).join(", ") || "";
          const _0x208a94 = {
            notify: true
          };
          if (_0x48f549) {
            this.log("517活动抽奖: " + _0x48f549, _0x208a94);
          }
          if (showAmount === "1") {
            this.log("517活动抽奖现金进度: +" + _0x11e55c + " (" + _0x493574 + "/" + _0x2e20be + ")");
          }
        } else {
          this.log("517活动抽奖: 空气");
        }
      } else {
        let _0xb510ea = _0x171769?.["message"] || _0x171769?.["msg"] || "";
        this.log("查询517活动抽奖结果失败[" + _0x57336e + "]: " + _0xb510ea);
      }
    } catch (_0x128879) {
      console.log(_0x128879);
    }
  }
  async act_517_taskList(_0x4fe859 = {}) {
    try {
      const _0x1297f2 = {
        fn: "act_517_taskList",
        method: "get",
        url: "https://activity.10010.com/2024517charges/dotask/taskList"
      };
      let {
        result: _0x4ea832,
        statusCode: _0x3a5db6
      } = await this.request(_0x1297f2),
        _0x120b88 = appName.get(_0x4ea832, "code", _0x3a5db6);
      if (_0x120b88 == "0000") {
        let _0x442045 = _0x4ea832?.["data"]?.["taskList"] || [];
        for (let _0x10da9b of _0x442045) {
          let {
            completeNum = 0,
            maxNum: _0x411a82,
            isComplete: _0x3bded4,
            taskType: _0x11ea96
          } = _0x10da9b;
          if (_0x3bded4) {
            continue;
          }
          if (_0x11ea96 == "5") {
            continue;
          }
          completeNum = parseInt(completeNum);
          _0x411a82 = parseInt(_0x411a82);
          for (let _0x3fa506 = completeNum; _0x3fa506 < _0x411a82; _0x3fa506++) {
            await this.act_517_completeTask(_0x10da9b);
          }
        }
      } else {
        let _0x215aee = _0x4ea832?.["message"] || _0x4ea832?.["msg"] || "";
        this.log("查询517活动抽奖结果失败[" + _0x120b88 + "]: " + _0x215aee);
      }
    } catch (_0x45301a) {
      console.log(_0x45301a);
    }
  }
  async act_517_completeTask(_0x5c02d6, _0x33c90f = {}) {
    try {
      let _0x50635b = _0x5c02d6.title;
      const _0x20a5f8 = {
        taskId: _0x5c02d6.taskId
      };
      const _0x3c3d1a = {
        fn: "act_517_completeTask",
        method: "get",
        url: "https://activity.10010.com/2024517charges/dotask/completeTask",
        searchParams: _0x20a5f8
      };
      let {
        result: _0x2c1631,
        statusCode: _0x269980
      } = await this.request(_0x3c3d1a),
        _0x3c92b5 = appName.get(_0x2c1631, "code", _0x269980);
      if (_0x3c92b5 == "0000") {
        if (_0x2c1631?.["data"]) {
          let {
            num: _0x22c1df,
            title: _0x342214
          } = _0x2c1631.data;
          this.log("完成任务[" + _0x342214 + "]成功: " + _0x22c1df + "次抽奖机会");
        } else {
          this.log("完成任务[" + _0x50635b + "]失败没有获得抽奖机会");
        }
      } else {
        let _0x140a16 = _0x2c1631?.["message"] || _0x2c1631?.["msg"] || "";
        this.log("完成任务[" + _0x50635b + "]失败[" + _0x3c92b5 + "]: " + _0x140a16);
      }
    } catch (_0x316430) {
      console.log(_0x316430);
    }
  }
  get_wocare_body(_0x4d6de5, _0x2dbc6d = {}) {
    const _0x1771be = appName.time("yyyyMMddhhmmssS"),
      _0x1604c8 = Buffer.from(JSON.stringify(_0x2dbc6d)).toString("base64");
    let _0x40e43b = {
      version: minRetries,
      apiCode: _0x4d6de5,
      channelId: anotherApiKey,
      transactionId: _0x1771be + appName.randomString(6, numbers),
      timeStamp: _0x1771be,
      messageContent: _0x1604c8
    },
      _0x38d082 = [];
    Object.keys(_0x40e43b).sort().forEach(_0x430b5e => {
      _0x38d082.push(_0x430b5e + "=" + _0x40e43b[_0x430b5e]);
    });
    _0x38d082.push("sign=" + anotherEncryptionKey);
    _0x40e43b.sign = cryptoJS.MD5(_0x38d082.join("&")).toString();
    return _0x40e43b;
  }
  async wocare_api(_0x5c2ce0, _0x20488d = {}) {
    let _0x4c8f7b = this.get_wocare_body(_0x5c2ce0, _0x20488d);
    const _0x334f84 = {
      fn: "wocare_" + _0x5c2ce0,
      method: "post",
      url: "https://wocare.unisk.cn/api/v1/" + _0x5c2ce0,
      form: _0x4c8f7b
    };
    let _0x1c081d = await this.request(_0x334f84);
    if (_0x1c081d?.["result"]?.["messageContent"]) {
      try {
        let _0x16bed8 = JSON.parse(Buffer.from(_0x1c081d.result.messageContent, "base64").toString());
        _0x1c081d.result.data = _0x16bed8?.["data"] || _0x16bed8;
        if (_0x16bed8?.["resultMsg"]) {
          _0x1c081d.result.resultMsg = _0x16bed8.resultMsg;
        }
      } catch (_0x33899f) {
        this.log("解析联通祝福返回失败:");
        console.log(_0x33899f);
      }
    }
    return _0x1c081d;
  }
  async wocare_getToken(_0x5d6595, _0x338375 = {}) {
    let _0xe03d23 = false;
    try {
      let _0x5a4ebd = {
        fn: "wocare_getToken",
        method: "get",
        url: "https://wocare.unisk.cn/mbh/getToken",
        searchParams: {
          channelType: serviceLife,
          type: "02",
          ticket: _0x5d6595,
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
          headers: _0x4a51b5,
          statusCode: _0x571bc4
        } = await this.request(_0x5a4ebd);
      if (_0x571bc4 == 302) {
        if (_0x4a51b5?.["location"]) {
          let _0x32c3c4 = new URL(_0x4a51b5.location),
            _0x4aa2d9 = _0x32c3c4.searchParams.get("sid");
          _0x4aa2d9 ? (this.wocare_sid = _0x4aa2d9, _0xe03d23 = await this.wocare_loginmbh()) : this.log("联通祝福没有获取到sid");
        } else {
          this.log("联通祝福没有获取到location");
        }
      } else {
        this.log("联通祝福获取sid失败[" + _0x571bc4 + "]");
      }
    } catch (_0x4a16ba) {
      console.log(_0x4a16ba);
    } finally {
      return _0xe03d23;
    }
  }
  async wocare_loginmbh(_0x11ffd4 = {}) {
    let _0x4f6412 = false;
    try {
      let _0x24493a = "loginmbh";
      const _0x1aac9d = {
        sid: this.wocare_sid,
        channelType: serviceLife,
        apiCode: _0x24493a
      };
      let {
        result: _0xca14a,
        statusCode: _0x40c778
      } = await this.wocare_api(_0x24493a, _0x1aac9d),
        _0x43410e = appName.get(_0xca14a, "resultCode", _0x40c778);
      if (_0x43410e == "0000") {
        _0x4f6412 = true;
        let {
          token: _0x56ac18
        } = _0xca14a?.["data"];
        this.wocare_token = _0x56ac18;
      } else {
        let _0xffa41d = _0xca14a?.["resultMsg"] || _0xca14a?.["resultDesc"] || "";
        this.log("联通祝福登录失败[" + _0x43410e + "]: " + _0xffa41d);
      }
    } catch (_0x1eb84b) {
      console.log(_0x1eb84b);
    } finally {
      return _0x4f6412;
    }
  }
  async wocare_getSpecificityBanner(_0x596f9b = {}) {
    try {
      let _0x4a6368 = "getSpecificityBanner";
      const _0x26cd42 = {
        token: this.wocare_token,
        apiCode: _0x4a6368
      };
      let {
        result: _0x2a4fc0,
        statusCode: _0x29d087
      } = await this.wocare_api(_0x4a6368, _0x26cd42),
        _0x2c004b = appName.get(_0x2a4fc0, "resultCode", _0x29d087);
      if (_0x2c004b == "0000") {
        let _0x160328 = _0x2a4fc0?.["data"] || [];
        for (let _0x4d923c of _0x160328.filter(_0x3704ef => _0x3704ef.activityStatus === "0" && _0x3704ef.isDeleted === "0")) {
          await this.wocare_getDrawTask(_0x4d923c);
          await this.wocare_loadInit(_0x4d923c);
        }
      } else {
        let _0x5452d4 = _0x2a4fc0?.["resultMsg"] || _0x2a4fc0?.["resultDesc"] || "";
        this.log("联通祝福进入活动失败[" + _0x2c004b + "]: " + _0x5452d4);
      }
    } catch (_0x597b13) {
      console.log(_0x597b13);
    }
  }
  async wocare_loadInit(_0xa9b8ad, _0x455970 = {}) {
    try {
      let _0x43cea8 = "loadInit";
      const _0x4c47b0 = {
        token: this.wocare_token,
        channelType: serviceLife,
        type: _0xa9b8ad.id,
        apiCode: _0x43cea8
      };
      let {
        result: _0x32f59b,
        statusCode: _0x3c4540
      } = await this.wocare_api(_0x43cea8, _0x4c47b0),
        _0x5b2835 = appName.get(_0x32f59b, "resultCode", _0x3c4540);
      if (_0x5b2835 == "0000") {
        let _0x3d1fd0 = _0x32f59b?.["data"],
          _0x2870a7 = _0x3d1fd0?.["zActiveModuleGroupId"],
          _0x4acf9b = 0;
        switch (_0xa9b8ad.id) {
          case 2:
            {
              let _0x143f96 = _0x3d1fd0?.["data"]?.["isPartake"] || 0;
              !_0x143f96 && (_0x4acf9b = 1);
              break;
            }
          case 3:
            {
              _0x4acf9b = parseInt(_0x3d1fd0?.["raffleCountValue"] || 0);
              break;
            }
          case 4:
            {
              _0x4acf9b = parseInt(_0x3d1fd0?.["mhRaffleCountValue"] || 0);
              break;
            }
        }
        while (_0x4acf9b-- > 0) {
          await appName.wait(5000);
          await this.wocare_luckDraw(_0xa9b8ad, _0x2870a7);
        }
      } else {
        let _0x10d6ec = _0x32f59b?.["resultMsg"] || _0x32f59b?.["resultDesc"] || "";
        this.log("联通祝福[" + _0xa9b8ad.name + "]查询活动失败[" + _0x5b2835 + "]: " + _0x10d6ec);
      }
    } catch (_0x52030a) {
      console.log(_0x52030a);
    }
  }
  async wocare_getDrawTask(_0x1fef95, _0xeaa7bc = {}) {
    try {
      let _0x4e8c52 = "getDrawTask";
      const _0x2c3b69 = {
        token: this.wocare_token,
        channelType: serviceLife,
        type: _0x1fef95.id,
        apiCode: _0x4e8c52
      };
      let {
        result: _0x38de2a,
        statusCode: _0x628a3b
      } = await this.wocare_api(_0x4e8c52, _0x2c3b69),
        _0x425051 = appName.get(_0x38de2a, "resultCode", _0x628a3b);
      if (_0x425051 == "0000") {
        let _0x1335c7 = _0x38de2a?.["data"]?.["taskList"] || [];
        for (let _0x5019b6 of _0x1335c7.filter(_0x529e83 => _0x529e83.taskStatus == 0)) {
          await this.wocare_completeTask(_0x1fef95, _0x5019b6);
        }
      } else {
        let _0x355044 = _0x38de2a?.["resultMsg"] || _0x38de2a?.["resultDesc"] || "";
        this.log("联通祝福[" + _0x1fef95.name + "]查询任务失败[" + _0x425051 + "]: " + _0x355044);
      }
    } catch (_0x14c042) {
      console.log(_0x14c042);
    }
  }
  async wocare_completeTask(_0x3f5d92, _0x50e428, _0x360522 = "1", _0x2c48eb = {}) {
    try {
      let _0x50f9e4 = _0x50e428.title,
        _0x4facfd = _0x360522 == "1" ? "领取任务" : "完成任务",
        _0x377c39 = "completeTask";
      const _0x303bcd = {
        token: this.wocare_token,
        channelType: serviceLife,
        task: _0x50e428.id,
        taskStep: _0x360522,
        type: _0x3f5d92.id,
        apiCode: _0x377c39
      };
      let {
        result: _0x2cc63e,
        statusCode: _0x184c09
      } = await this.wocare_api(_0x377c39, _0x303bcd),
        _0xa787a0 = appName.get(_0x2cc63e, "resultCode", _0x184c09);
      if (_0xa787a0 == "0000") {
        this.log(_0x4facfd + "[" + _0x50f9e4 + "]成功");
        _0x360522 == "1" && (await this.wocare_completeTask(_0x3f5d92, _0x50e428, "4"));
      } else {
        let _0x2e4c1b = _0x2cc63e?.["resultMsg"] || _0x2cc63e?.["resultDesc"] || "";
        this.log("联通祝福[" + _0x3f5d92.name + "]" + _0x4facfd + "[" + _0x50f9e4 + "]失败[" + _0xa787a0 + "]: " + _0x2e4c1b);
      }
    } catch (_0x29872e) {
      console.log(_0x29872e);
    }
  }
  async wocare_luckDraw(_0x103614, _0x53be22, _0x51513d = {}) {
    try {
      let _0x62ee5f = "luckDraw";
      const _0x5621f1 = {
        token: this.wocare_token,
        channelType: serviceLife,
        zActiveModuleGroupId: _0x53be22,
        type: _0x103614.id,
        apiCode: _0x62ee5f
      };
      let {
        result: _0x427eea,
        statusCode: _0x26e062
      } = await this.wocare_api(_0x62ee5f, _0x5621f1),
        _0x1d084a = appName.get(_0x427eea, "resultCode", _0x26e062);
      if (_0x1d084a == "0000") {
        let _0x1a2341 = appName.get(_0x427eea?.["data"], "resultCode", -1);
        if (_0x1a2341 == "0000") {
          let {
            prizeName: _0x50e0e5,
            prizeDesc: _0x4e8140
          } = _0x427eea?.["data"]?.["data"]?.["prize"];
          this.log("联通祝福[" + _0x103614.name + "]抽奖: " + _0x50e0e5 + "[" + _0x4e8140 + "]");
        } else {
          let _0x2529ec = _0x427eea?.["resultMsg"] || _0x427eea?.["resultDesc"] || "";
          this.log("联通祝福[" + _0x103614.name + "]抽奖失败[" + _0x1a2341 + "]: " + _0x2529ec);
        }
      } else {
        let _0x575c51 = _0x427eea?.["resultMsg"] || _0x427eea?.["resultDesc"] || "";
        this.log("联通祝福[" + _0x103614.name + "]抽奖错误[" + _0x1d084a + "]: " + _0x575c51);
      }
    } catch (_0x43e414) {
      console.log(_0x43e414);
    }
  }
  async card_618_authCheck(_0xeeb2f2 = {}) {
    try {
      let _0x4aff88 = {
        fn: "card_618_authCheck",
        method: "post",
        url: "https://epay.10010.com/ps-pafs-auth-front/v1/auth/check",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo()
        }
      },
        {
          result: _0x3f5ce1
        } = await this.request(_0x4aff88),
        _0x52a304 = appName.get(_0x3f5ce1, "code", -1);
      if (_0x52a304 == "0000") {
        let {
          mobile: _0x5ece0b,
          sessionId: _0x15409b,
          tokenId: _0x5d8026,
          userId: _0x195001
        } = _0x3f5ce1?.["data"]?.["authInfo"];
        const _0x551929 = {
          sessionId: _0x15409b,
          tokenId: _0x5d8026,
          userId: _0x195001
        };
        Object.assign(this, _0x551929);
        await this.card_618_queryUserCardInfo();
      } else {
        if (_0x52a304 == "2101000100") {
          let _0x5345ac = _0x3f5ce1?.["data"]?.["woauth_login_url"];
          await this.card_618_login(_0x5345ac);
        } else {
          let _0x3f8426 = _0x3f5ce1?.["msgInside"] || _0x3f5ce1?.["msg"] || "";
          this.log("618集卡获取tokenId失败[" + _0x52a304 + "]: " + _0x3f8426);
        }
      }
    } catch (_0x120bbb) {
      console.log(_0x120bbb);
    }
  }
  async card_618_login(_0x4b5e1f, _0x52f369 = {}) {
    try {
      let _0x324c93 = appName.time("yyyyMM") + "28ZFR";
      _0x4b5e1f += "https://epay.10010.com/ci-mcss-party-web/rainbow/?templateName=" + _0x324c93 + "&bizFrom=225&bizChannelCode=225&channelType=WDQB";
      const _0x4370f0 = {
        fn: "card_618_login",
        method: "get",
        url: "https://epay.10010.com/woauth2/login",
        searchParams: {}
      };
      _0x4370f0.searchParams.response_type = "web_token";
      _0x4370f0.searchParams.source = "app_sjyyt";
      _0x4370f0.searchParams.union_session_id = "";
      _0x4370f0.searchParams.device_digest_token_id = this.tokenId_cookie;
      _0x4370f0.searchParams.target_client_id = anotherClientId;
      _0x4370f0.searchParams.position = null;
      _0x4370f0.searchParams.redirect_url = "https://epay.10010.com/ci-mcss-party-web/cardSelection/?activityId=NZJK618CJHD";
      _0x4370f0.searchParams.bizFrom = errorCode;
      _0x4370f0.searchParams.bizChannelCode = errorNumber;
      _0x4370f0.searchParams.channelType = "WDQB";
      let {
        headers: _0x3466a2,
        statusCode: _0xb0793d
      } = await this.request(_0x4370f0);
      if (_0x3466a2?.["location"]) {
        let _0x13496c = new URL(_0x3466a2.location);
        this.rptId = _0x13496c.searchParams.get("rptid");
        this.rptId ? await this.card_618_authCheck() : this.log("618集卡获取rptid失败");
      } else {
        this.log("618集卡获取rptid失败[" + _0xb0793d + "]");
      }
    } catch (_0x624f72) {
      console.log(_0x624f72);
    }
  }
  async card_618_queryUserCardInfo(_0x518cd6 = {}) {
    try {
      const _0x37da94 = {
        activityId: "NZJK618CJHD"
      };
      let _0x3e2ef2 = {
        fn: "card_618_queryUserCardInfo",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/mouldCard/queryUserCardInfo",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: _0x37da94
      },
        {
          result: _0x358e5a
        } = await this.request(_0x3e2ef2),
        _0x4802a6 = appName.get(_0x358e5a, "code", -1);
      if (_0x4802a6 == "0000" && _0x358e5a?.["data"]?.["returnCode"] == 0) {
        let {
          userRemain = 0,
          isFirst = true
        } = _0x358e5a?.["data"];
        if (isFirst) {
          await this.card_618_unifyDraw("首次进入");
        }
        this.log("618集卡可以抽奖" + userRemain + "次");
        while (userRemain-- > 0) {
          await this.card_618_unifyDraw("抽奖");
        }
      } else {
        let _0x4ff8ee = _0x358e5a?.["message"] || _0x358e5a?.["msg"] || "";
        this.log("618集卡进入主页失败[" + _0x4802a6 + "]: " + _0x4ff8ee);
      }
    } catch (_0x6371bb) {
      console.log(_0x6371bb);
    }
  }
  async card_618_unifyDraw(_0x431f14, _0x15179c = {}) {
    try {
      let _0x630a5d = {
        fn: "card_618_unifyDraw",
        method: "post",
        url: "https://epay.10010.com/ci-mcss-party-front/v1/mouldCard/unifyDraw",
        headers: {
          bizchannelinfo: this.get_bizchannelinfo(),
          authinfo: this.get_epay_authinfo()
        },
        form: {
          bigActivityId: _0x3484cf.card_618,
          activityId: _0x3484cf.card_618 + _0x10ec87[_0x431f14],
          bizFrom: errorCode
        }
      },
        {
          result: _0xbbc5a6
        } = await this.request(_0x630a5d),
        _0x2f8420 = appName.get(_0xbbc5a6, "code", -1);
      if (_0x2f8420 == "0000" && _0xbbc5a6?.["data"]?.["returnCode"] == 0) {
        let _0x46e05e = _0xbbc5a6?.["data"]?.["prizeId"] || "空气",
          _0x583237 = _0x1c214d[_0x46e05e] || _0x46e05e;
        const _0x22f8e4 = {
          notify: true
        };
        this.log("618集卡[" + _0x431f14 + "]: " + _0x583237, _0x22f8e4);
      } else {
        let _0xda184 = _0xbbc5a6?.["data"]?.["returnMsg"] || _0xbbc5a6?.["msg"] || "";
        this.log("618集卡[" + _0x431f14 + "]失败[" + (_0xbbc5a6?.["data"]?.["returnCode"] || _0x2f8420) + "]: " + _0xda184);
      }
    } catch (_0x59f330) {
      console.log(_0x59f330);
    }
  }
  async sign_task() {
    await this.sign_getContinuous();
  }
  async ltcy_task() {
    let _0xe84731 = "https://web.wostore.cn/web/flowGame/index.html?channelId=GAMELTAPP_90006&pushid=99",
      {
        ticket: _0x73ef67
      } = await this.openPlatLineNew(_0xe84731);
    if (!_0x73ef67) {
      return;
    }
    await this.game_login(_0x73ef67);
  }
  async ttlxj_task() {
    this.rptId = "";
    let _0x4b2989 = "https://epay.10010.com/ci-mps-st-web/?webViewNavIsHidden=webViewNavIsHidden",
      {
        ticket: _0xfccd3c,
        type: _0x5be8ca,
        loc: _0x33b6a9
      } = await this.openPlatLineNew(_0x4b2989);
    if (!_0xfccd3c) {
      return;
    }
    await this.ttlxj_authorize(_0xfccd3c, _0x5be8ca, _0x33b6a9);
  }
  async epay_28_task() {
    this.rptId = "";
    let _0x3904ee = new Date().getDate();
    if (_0x3904ee >= 26 && _0x3904ee <= 28) {
      await this.epay_28_authCheck();
      if (appMonth_28_share.length) {
        let _0x3c73d8 = appName.randomList(appMonth_28_share);
        await this.appMonth_28_bind(_0x3c73d8);
      }
      await this.appMonth_28_queryChance();
    }
  }
  async draw_28_task() {
    let _0x3fc66f = new Date().getDate();
    _0x3fc66f == 28 && (await this.draw_28_queryChance());
  }
  async act_517_task() {
    let _0x19e840 = new Date("2024-05-10 00:00:00"),
      _0x41d2ad = new Date("2024-06-09 00:00:00"),
      _0x2f7f5c = Date.now();
    if (_0x2f7f5c > _0x19e840.getTime() && _0x2f7f5c < _0x41d2ad.getTime()) {
      if (act_517_share.length) {
        let _0x53384d = appName.randomList(act_517_share);
        await this.act_517_bind(_0x53384d);
      }
      await this.act_517_userAccount();
    }
  }
  async card_618_task() {
    let _0x2ad5cb = new Date("2024-05-31 00:00:00"),
      _0x4ce692 = new Date("2024-06-21 00:00:00"),
      _0x1a0657 = Date.now();
    _0x1a0657 > _0x2ad5cb.getTime() && _0x1a0657 < _0x4ce692.getTime() && (this.rptId = "", await this.card_618_authCheck());
  }
  async flmf_task() {
    if (this.city.filter(_0x5d152b => _0x5d152b.proCode == "091").length == 0) {
      return;
    }
    let _0x552e7c = "https://weixin.linktech.hk/lv-web/handHall/autoLogin?actcode=welfareCenter",
      {
        loc: _0x55dcf1
      } = await this.openPlatLineNew(_0x552e7c);
    if (!_0x55dcf1) {
      return;
    }
    await this.flmf_login(_0x55dcf1);
  }
  async ltyp_task() {
    let _0x1cee90 = "https://panservice.mail.wo.cn/h5/activitymobile/lottery?activityId=WzaR7KkUJSpR+gDh7Fy6mA==&clientid=1001000003&appName=shouting",
      {
        ticket: _0x318b1b
      } = await this.openPlatLineNew(_0x1cee90);
    if (!_0x318b1b) {
      return;
    }
    await this.ltyp_login(_0x318b1b);
  }
  async ltzf_task() {
    let _0x2db4d6 = new URL("https://wocare.unisk.cn/mbh/getToken");
    _0x2db4d6.searchParams.append("channelType", serviceLife);
    _0x2db4d6.searchParams.append("homePage", "home");
    _0x2db4d6.searchParams.append("duanlianjieabc", "qAz2m");
    let _0x4acf51 = _0x2db4d6.toString(),
      {
        ticket: _0x588ef9
      } = await this.openPlatLineNew(_0x4acf51);
    if (!_0x588ef9) {
      return;
    }
    if (!(await this.wocare_getToken(_0x588ef9))) {
      return;
    }
    for (let _0x305ba1 of _0x4376d8) {
      await this.wocare_getDrawTask(_0x305ba1);
      await this.wocare_loadInit(_0x305ba1);
    }
  }
  async woread_draw_task(_0x10af6a) {
    await this.woread_getSeeVideoAddNumber(_0x10af6a);
    await this.woread_addDrawTimes(_0x10af6a);
    await this.woread_getActivityNumber(_0x10af6a);
  }
  async woread_task() {
    for (let _0x524680 of woread_draw_id) {
      await this.woread_draw_task(_0x524680);
    }
    await this.moonbox_queryReadStatus();
    await this.woread_queryTicketAccount();
  }
  async woread_reading_task() {
    this.switch_woread_token(this.woread_m_accesstoken);
  
    // 获取需要处理的任务数量
    const getPendingTasksCount = () => Object.values(this.moonbox_task_record).filter(status => status).length;
    let pendingTasksCount = getPendingTasksCount();
  
    while (this.need_read_rabbit || pendingTasksCount) {
      const readDuration = 2;
      await this.woread_m_addReadTime({ readTime: readDuration });
  
      const startTime = Date.now();
  
      if (pendingTasksCount) {
        await this.moonbox_m_queryCurTaskStatus();
      }
  
      // 更新待处理任务数量
      pendingTasksCount = getPendingTasksCount();
  
      if (this.need_read_rabbit) {
        await this.rabblit_queryActivityData();
      }
  
      const elapsedTime = Date.now() - startTime;
      const waitTime = Math.max(0, 125000 - elapsedTime);
  
      if (this.need_read_rabbit || pendingTasksCount) {
        if (waitTime > 0) {
          this.log("等待2分钟...");
          await appName.wait(waitTime);
        }
      }
    }
  
    this.switch_woread_token(this.woread_accesstoken);
  }
  
  async userLoginTask() {
    if (!(await this.onLine())) {
      return;
    }
    // 执行权益超市登录
    await this.marketUnicomLogin();
    // 只执行登录，不继续执行后面的代码
    return;
    
    /*
    if (!(await this.woread_auth())) {
      return;
    }
    if (!(await this.woread_login())) {
      return;
    }
    if (!(await this.woread_m_auth())) {
      return;
    }
    if (!(await this.woread_m_login())) {
      return;
    }
    this.switch_woread_token(this.woread_accesstoken);
    if (!moonbox_activeId) {
      await this.moonbox_queryActiveInfo();
    }
    await this.moonbox_queryCurTaskStatus();
    */
  }
  async userTask() {
    appName.log("\n------------------ 账号[" + this.index + "] ------------------");
    if (!signDisabled) {
      await this.sign_task();
    }
    await this.ttlxj_task();
    // await this.ltyp_task();
    // await this.epay_28_task();
    // await this.draw_28_task();
    // await this.card_618_task();
    if (!ltzfDisabled) {
      await this.ltzf_task();
    }
    await this.flmf_task();
    // 执行权益超市任务
    await this.marketTask();
    // await this.woread_task();
  }
  async userTestTask() {
    appName.log("\n------------------ 账号[" + this.index + "] ------------------");
    await this.ltyp_task();
  }
}
!(async () => {
  // 如果条件不满足，退出函数
  // if (!(await checkCondition())) {
  //   return;
  // }

  // 执行初始化函数
  await initialize();

  // 读取环境变量
  appName.read_env(CustomUserService);

  // 打印配置状态
  appName.log("\n------------------------------------");
  appName.log("首页签到设置为: " + (signDisabled ? "不" : "") + "运行");
  appName.log("联通祝福设置为: " + (ltzfDisabled ? "不" : "") + "运行");
  appName.log("------------------------------------\n");

  // 执行用户登录任务
  for (let user of appName.userList) {
    await user.userLoginTask();
  }

  // 执行有效用户的任务
  for (let validUser of appName.userList.filter(user => user.valid)) {
    await validUser.userTask();
  }

  // 筛选需要阅读任务的用户
  let usersWithReadingTasks = appName.userList.filter(user =>
    user.valid &&
    user.woread_verifycode &&
    (user.need_read_rabbit || Object.values(user.moonbox_task_record).filter(taskCompleted => taskCompleted).length)
  );

  if (usersWithReadingTasks.length) {
    let readingTasks = [];
    appName.log("\n============ 开始刷阅读时长 ============");

    // 执行阅读任务
    for (let user of usersWithReadingTasks) {
      readingTasks.push(user.woread_reading_task());
    }
    await Promise.all(readingTasks);
  }
})().catch(error => appName.log(error)).finally(() => appName.exitNow());
async function icheckAuthStatus(retryCount = 0) {
  let isSuccess = false;

  try {
    // 请求配置
    const requestOptions = {
      fn: "auth",
      method: "get",
      url: validCodeUrl,
      timeout: 20000
    };

    // 发起请求
    let { statusCode, result } = await userServiceInstance.request(requestOptions);

    // 如果状态码不是 200，进行重试
    if (statusCode !== 200) {
      if (retryCount < retryDelay) {
        isSuccess = await icheckAuthStatus(retryCount + 1);
      }
      return isSuccess;
    }

    // 处理成功的响应
    if (result?.code === 0) {
      result = JSON.parse(result.data.file.data);

      // 处理通用通知
      if (result?.commonNotify?.length > 0) {
        const notifyOptions = { notify: true };
        appName.log(result.commonNotify.join("\n") + "\n", notifyOptions);
      }

      // 处理通用消息
      if (result?.commonMsg?.length > 0) {
        appName.log(result.commonMsg.join("\n") + "\n");
      }

      // 处理项目相关的消息
      if (result[projectName]) {
        const projectInfo = result[projectName];
        if (projectInfo.status === 0) {
          if (version >= projectInfo.version) {
            isSuccess = true;
            appName.log(projectInfo.msg[projectInfo.status]);
            appName.log(projectInfo.updateMsg);
            appName.log(`当前脚本版本：${version}，最新版本：${projectInfo.latestVersion}`);
          } else {
            appName.log(projectInfo.versionMsg);
          }
        } else {
          appName.log(projectInfo.msg[projectInfo.status]);
        }
      } else {
        appName.log(result.errorMsg);
      }
    } else {
      if (retryCount < retryDelay) {
        isSuccess = await icheckAuthStatus(retryCount + 1);
      }
    }
  } catch (error) {
    appName.log(error);
  } finally {
    return isSuccess;
  }
}
async function initialize() {
  let isInitialized = false;
  try {
    const requestConfig = {
      fn: "getTaskUrl",
      method: "get",
      url: projectCodeUrl
    };
    let { statusCode, result } = await userServiceInstance.request(requestConfig);
    
    if (statusCode !== 200) {
      return Promise.resolve();
    }
    
    if (result?.code === 0) {
      result = JSON.parse(result.data.file.data);
      
      ltypLottery = result?.ltyp_lottery || ltypLottery;
      woreadDrawId = result?.woread_draw_id || woreadDrawId;
      appMonth28Share = result?.appMonth_28_share || appMonth28Share;
      act517Share = result?.act_517_share || act517Share;
      
      isInitialized = true;
    }
  } catch (error) {
    appName.log(error);
  } finally {
    return isInitialized;
  }
}

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
        if (this.notifyFlag && this.notifyStr.length) {
          const notify = require("./sendNotify");
          this.log("\n============== 推送 ==============");
          await notify.sendNotify(this.name, this.notifyStr.join("\n"));
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
        return this.randomPattern("xxxxxxxx-xxxx-4xxx-4xxx-xxxxxxxxxxxx");
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
      async wait_until(targetTime, options = {}) {
        const logger = options.logger || this;
        const interval = options.interval || this.default_wait_interval;
        const limit = options.limit || this.default_wait_limit;
        const ahead = options.ahead || this.default_wait_ahead;
  
        if (typeof targetTime === "string" && targetTime.includes(":")) {
          if (targetTime.includes("-")) {
            targetTime = new Date(targetTime).getTime();
          } else {
            const currentDate = this.time("yyyy-MM-dd ");
            targetTime = new Date(currentDate + targetTime).getTime();
          }
        }
  
        let targetTimestamp = this.normalize_time(targetTime) - ahead;
        const targetTimeFormatted = this.time("hh:mm:ss.S", targetTimestamp);
        let currentTime = Date.now();
        if (currentTime > targetTimestamp) {
          targetTimestamp += 86400000;
        }
  
        let remainingTime = targetTimestamp - currentTime;
        if (remainingTime > limit) {
          logger.log("离目标时间[" + targetTimeFormatted + "]大于" + limit / 1000 + "秒,不等待", { time: true });
        } else {
          logger.log("离目标时间[" + targetTimeFormatted + "]还有" + remainingTime / 1000 + "秒,开始等待", { time: true });
          while (remainingTime > 0) {
            const waitTime = Math.min(remainingTime, interval);
            await this.wait(waitTime);
            currentTime = Date.now();
            remainingTime = targetTimestamp - currentTime;
          }
          logger.log("已完成等待", { time: true });
        }
      }
      async wait_gap_interval(lastWaitTime, interval) {
        const elapsedTime = Date.now() - lastWaitTime;
        if (elapsedTime < interval) {
          await this.wait(interval - elapsedTime);
        }
      }
    }(UserClass);
  }
  
  
