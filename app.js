import express from 'express';
import { createMenus, handleMsg, getJsSDKConfig } from './wechat/apis.js';

const app = express();

// app.use(express.static('./public'))

app.post('/', async (req, res) => {
  await createMenus();
  handleMsg(req, res);
})

app.get('/wxConfig', async (req, res) => {
  const config = await getJsSDKConfig();
  res.send(config);
});

app.listen(3000, () => {
  console.log("启动成功，端口号：3000");
});