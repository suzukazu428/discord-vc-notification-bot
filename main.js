import { Client } from 'discord.js'
import server from './server.js'
import { client } from './discord/event.js'
import { commandsInitialize } from "./assets/commands.js"
const token = process.env.DISCORD_BOT_TOKEN

// 関数
// Discordトークンチェック後ログイン
const login = async () => {
  if (!token) {
    console.log("DISCORD_BOT_TOKENが設定されていません。");
    process.exit(0);
  }
  console.log('DISCORD_BOT_TOKEN認証完了')
  console.log('ログイン開始')
  try {
    if (client) {
      await client.login(token)
      .then(() => console.log('ログイン成功'))
    } else {
      console.error('Client is not initialized.');
    }
    await commandsInitialize(client.user.id)
  } catch (e) {
    console.error('ログイン失敗', e)
  }
}

// bot再起動
const restart = async () => {
  console.log('ログアウト開始')
  await client.destroy()
  .then(() => console.log('ログアウト成功'))
  await login()
}

// 初回起動
const firstStartUp = async () => {
  await login()

  // サーバー起動
  console.log('サーバー起動完了')
  await server()
}

// 最小起動
const minimumStartUp = async () => {
  await client.destroy()
    .then(() => console.log('ログアウト成功'))
  const minimumClient = new Client({
    intents: []
  })
  minimumClient.login(token)
    .then(() => console.log('最小起動ログイン成功'))
}


// 実行
await firstStartUp();

export {
  login,
  restart,
  minimumStartUp
}