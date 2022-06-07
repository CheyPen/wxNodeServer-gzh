import express from 'express';
import { createMenus, handleMsg, getJsSDKConfig, cacheImageByMediaId } from './wechat/apis.js';

const app = express();

app.use(express.static('./public'))

app.post('/', async (req, res) => {
  await createMenus();
  handleMsg(req, res);
})

app.get('/wx/signature', async (req, res) => {
  const data = await getJsSDKConfig();
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