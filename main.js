import { Client, GatewayIntentBits } from 'discord.js'
import server from './server.js'
server()
import { commandsInitialize, commands } from "./assets/commands.js"
import { createEmbed } from './assets/functions.js'
import firebase from './assets/firebase.js'

const token = process.env.DISCORD_BOT_TOKEN
if (token == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
})

client.on('guildCreate', async guild => {
  try {
    // firestoreにサーバーIDの存在チェック
    const serverData = await firebase.findVoiceChannel(guild.id)
    if (serverData.length) return
    // 存在していない場合は追加
    const textChannel = guild.channels.cache.find(c => c.type === 0)
    await firebase.createVoiceChannel({
      serverId: guild.id,
      serverName: guild.name,
      textChannelId: textChannel.id
    })
  } catch(e) {
    console.error(e)
  }
})

client.on("ready", async (bot) => {
  await commandsInitialize(bot.user.id)
  console.log(`${client.user.tag}がサーバーにログインしました。`)
})

let status = 'ready'
client.on("voiceStateUpdate", async (oldState, newState) => {
  if(status === 'working') return
  status = 'working'
  // 入退室IDとユーザー名設定
  const oldChannelId = oldState.channelId
  const newChannelId = newState.channelId
  const firstEnterName = oldState.member.nickname ?? oldState.member.user.displayName
  const lastExitName = newState.member.nickname ?? newState.member.user.displayName

  try {
    // 入室時
    if (oldChannelId === null && newChannelId !== null) {
      const memberCount = client.channels.cache.get(newChannelId).members.size
        // 最初の1人以外は処理しない
      if (memberCount === 1) {
        // firestoreからテキストチャンネルIDを持ってきて設定
        const serverData = await firebase.findVoiceChannel(newState.guild.id)
        const textChannel = oldState.member.guild.channels.cache.get(serverData[0].textChannelId)
        await textChannel.send(
          `一人目に${firstEnterName}さんが<#${newChannelId}>へ入室しました。<t:${Math.floor(Date.now() / 1000)}:T>`
        )
      }
    }
    // 退出時
    else if (oldChannelId !== null && newChannelId === null) {
      // textChannel.send(
      //   `${lastExitName}さんが退室しました。`
      // )
    }
    // VC移動時
    else if (oldChannelId !== null && newChannelId !== null) {
      // if (oldChannelId !== newChannelId) {
      //   textChannel.send(
      //     `**${lastExitName}**さんが<#${oldChannelId}>から<#${newChannelId}>へ移動しました。<t:${Math.floor(Date.now() / 1000)}:T>`
      //   );
      // }
    }
  } catch(e) {
    console.error(e)
  } finally {
    status = 'ready'
  }
})

client.on('interactionCreate', async (interaction) => {
  if(interaction.isStringSelectMenu()) {
    // SelectMenuに反応する処理
    if(interaction.customId === 'textChannel') {
      const selectTextChannelId = interaction.values[0]
      await firebase.changeTextChannelId(interaction.guildId, selectTextChannelId)
      const embed = await createEmbed(interaction, selectTextChannelId)
      await interaction.update({
        content: 'テキストチャンネルを設定しました。',
        embeds: [embed],
        components: []
      })
    }
  }

  // スラッシュコマンド以外はここでreturn
  if (!interaction.isChatInputCommand()) return

  // 通知するテキストチャンネル変更コマンド
  try {
    const serverData = await firebase.findVoiceChannel(interaction.guild.id)
    const textChannelId = serverData[0].textChannelId
    commands[interaction.commandName].execute(interaction, textChannelId)
  } catch(e) {
    console.error(`存在しないコマンドを入力されました。
コマンド: ${interaction.commandName}
エラー内容: ${e}`)
    return
  }
})

client.login(token)
