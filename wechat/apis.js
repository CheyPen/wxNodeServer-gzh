import { resolve, join } from 'path';
import { writeFile } from 'fs';
import { format } from 'util';
import got from 'got';
import stringRandom from 'string-random'; // 随机字符串
import crypto from 'crypto'; // 加密模块
import { XMLParser } from 'fast-xml-parser';

import { wxConfig } from './config.js';
import { txtMsg, graphicMsg } from './msg.js';
import accessToken from './access_token.json' assert { type: 'json' };
import menus from './menus.json' assert { type: 'json' };

const { appID, appScrect, wxApiURLs } = wxConfig;
const { access_token, expires_time } = accessToken;
const {
  button: [{ url: testPageUrl }],
} = menus;

/**
 * @description 获取微信公众号access_token
 * @returns {Promise<string>}
 */
async function getAccessToken() {
  try {
    const currentTime = new Date().getTime();
    if (access_token === '' || expires_time < currentTime) {
      const url = format(wxApiURLs.accessTokenURL, appID, appScrect);
      const { body } = await got(url, {
        responseType: 'json',
      });
      const { access_token: newAccessToken, expires_in } = body;
      if (newAccessToken) {
        writeFile(
          join(resolve(), 'wechat', 'access_token.json'),
          JSON.stringify({
            access_token: newAccessToken,
            expires_time: currentTime + expires_in * 1000,
          }),
          (err) => {
            throw new Error(err);
          }
        );
        return newAccessToken;
      } else {
        return Promise.reject(body);
      }
    }
    return access_token;
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * @description 创建菜单
 * @returns {Promise<any>}
 */
async function createMenus() {
  try {
    const access_token = await getAccessToken();
    const url = format(wxApiURLs.createMenuURL, access_token);
    const { body } = await got.post(url, {
      json: menus,
    });
    return body;
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * @description 处理微信公众号的消息 微信返回的数据为二进制的数据流，因此需要通过监听数据响应的方式获取完整的数据，利用数组做数据缓存
 */
async function handleMsg(req, res) {
  const data = [];
  req.on('data', (binaryData) => {
    data.push(binaryData);
  });
  req.on('end', () => {
    const msgXml = Buffer.concat(data).toString('utf-8');
    const parser = new XMLParser();
    const { xml } = parser.parse(msgXml);
    const { ToUserName, FromUserName, MsgType, Event, Content, EventKey } = xml;
    let reportMsg = null;

    if (MsgType.toLowerCase() === 'event') {
      switch (Event.toLowerCase()) {
        case 'subscribe':
          const content = '很荣幸被你关注';
          reportMsg = txtMsg(FromUserName, ToUserName, content);
          break;
        case 'click':
          const contentArr = [
            {
              Title: 'Vue3 新特性 Teleport Suspense实现原理',
              Description:
                'vue3更新了两个全新的内置组件，Teleport和Suspense。让我们在实现某些效果的时候，如拟态框、异步加载等，变得十分方便，我就很好奇，其内部是如何实现的。在我研究了两天之后，发现其内部的实现非常巧妙。',
              PicUrl:
                'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38b3b365983342539cc704962cc9a676~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?',
              Url: 'https://juejin.cn/post/7044880716793905183',
            },
            {
              Title: 'js一张图搞定arrayBuffer/Blob/File/fileReader/canvas/base64的各种转换操作，以及文件上传',
              Description: 'Blob 转换 base64或者image',
              PicUrl:
                'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f4dfaf5a9bb43abbbb1a7ff7c47471c~tplv-k3u1fbpfcp-zoom-crop-mark:1304:1304:1304:734.awebp',
              Url: 'https://juejin.cn/post/6990980826452197407',
            },
            {
              Title: '你不知道的 Blob',
              Description:
                'Blob (Binary Large Object) 对象表示一个不可变、原始数据的类文件对象（二进制类型的大对象）。它的数据可以按文本或二进制的格式进行读取，也可以转换成 ReadableStream 来用于数据操作。',
              PicUrl:
                'https://img.zhouzh.tech/thumbnail/aaf4630d49b89990c42675f825120b3b53d10478-1621348992207.jpg?x-oss-process=image/format,webp',
              Url: 'https://www.zhouzh.tech/posts/4812c7b0-b63e-11eb-9938-e36f3791eca3',
            },
          ];
          reportMsg = graphicMsg(FromUserName, ToUserName, contentArr);
          break;
      }
    } else {
      if (MsgType.toLowerCase() === 'text') {
        switch (Content) {
          case 1:
            reportMsg = txtMsg(FromUserName, ToUserName, 'Hello ！我的英文名字叫 F-QIP');
            break;
          case 2:
            reportMsg = txtMsg(FromUserName, ToUserName, '这是一个使用node开发的公众号后台');
            break;
          case '怎么开发微信公众号':
            const contentArr = [
              {
                Title: 'Vue3 新特性 Teleport Suspense实现原理',
                Description:
                  'vue3更新了两个全新的内置组件，Teleport和Suspense。让我们在实现某些效果的时候，如拟态框、异步加载等，变得十分方便，我就很好奇，其内部是如何实现的。在我研究了两天之后，发现其内部的实现非常巧妙。',
                PicUrl:
                  'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38b3b365983342539cc704962cc9a676~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?',
                Url: 'https://juejin.cn/post/7044880716793905183',
              },
            ];
            reportMsg = graphicMsg(FromUserName, ToUserName, contentArr);
            break;
          default:
            reportMsg = txtMsg(FromUserName, ToUserName, '别乱发，没有这个选项哦');
            break;
        }
      }
    }
    res.send(reportMsg);
  });
}

/**
 * @description 获取微信js-sdk配置参数
 * 获得jsapi_ticket之后，就可以生成 JS-SDK 权限验证的签名了。
    签名算法
      签名生成规则如下：参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分）。
      对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用 URL 键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。
      这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义。即signature=sha1(string1)。
 * @link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html
 * @returns {Promise<{ appId: string, timestamp: string, nonceStr: string, signature: string }>}
 */
async function getJsSDKConfig() {
  try {
    const access_token = await getAccessToken();
    const url = format(wxApiURLs.jsApiTicketURL, access_token);
    const { body } = await got(url, {
      responseType: 'json',
    });
    const timestamp = new Date().getTime();
    const nonceStr = stringRandom(16);
    const ticket = body.ticket;
    const cryptoInst = crypto.createHash('sha1'); // 设置加密类型
    const string1 = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${testPageUrl}`;
    const signature = cryptoInst.update(string1, 'utf8').digest('hex'); // 对传入的字符串进行加密
    return { appId: appID, timestamp, nonceStr, signature };
  } catch (e) {
    throw new Error(e);
  }
}

export { getAccessToken, createMenus, handleMsg, getJsSDKConfig };
