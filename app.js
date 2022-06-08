import express from 'express';
import { wxAuthToken, createMenus, handleMsg, getJsSDKConfig, cacheImageByMediaId } from './wechat/apis.js';

const app = express();

app.use(express.static('./public'))

app.post('/wx', async (req, res) => {
  await createMenus();
  handleMsg(req, res);
});

app.get('/wx', async (req, res) => {
  const result = wxAuthToken(req.query);
  res.send(result);
});

app.get('/wx/signature', async (req, res) => {
  const { url: pageUrl } = req.query;
  const data = await getJsSDKConfig(pageUrl);
  res.send({
    code: 200,
    data
  });
});

app.get('/wx/fetchMediaUrl', async (req, res) => {
  try {
    const { serverId } = req.query;
    const imgSrc = await cacheImageByMediaId(serverId);
    res.send({
      code: 200,
      msg: '图片缓存成功',
      imgSrc
    });
  } catch (err) {
    res.send(err);
    throw new Error(err);
  }
});

app.listen(3000, () => {
  console.log("启动成功，端口号：3000");
});