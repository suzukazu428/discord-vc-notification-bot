import server from './server.js'
import { client } from './discord/event.js'

// 関数
// Discordトークンチェック後ログイン
const login = async () => {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    console.log("DISCORD_BOT_TOKENが設定されていません。");
    process.exit(0);
  } else {
    console.log('DISCORD_BOT_TOKEN認証完了')
  }
  try {
    console.log('ログイン開始')
    await client.login(token)
  } catch (e) {
    console.error('ログイン失敗', e)
  }
}

// 実行
// サーバー起動
await server()
console.log('サーバー起動完了')

await login()