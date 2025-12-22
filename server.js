
import express from "express"
const app = express()
const port = process.env.PORT || 3001
import { login, restart, minimumStartUp } from './main.js'

app.get('/', (req, res) => {
  const data = {
      "message": "I am alive.",
      port
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
})

app.get('/reLogin', async (req, res) => {
  await login();
  const data = {
      "message": "再ログインを実行しました。",
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
})

app.get('/reStart', async (req, res) => {
  await restart();
  const data = {
      "message": "bot再起動を実行しました。",
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
})

app.get('/minimumStart', async (req, res) => {
  await minimumStartUp();
  const data = {
      "message": "bot最小起動を実行しました。",
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
})

const connect = async () => {
  console.log('サーバー起動処理開始')
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
  })
  server.keepAliveTimeout = 0
}

export default connect