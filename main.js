import dotenv from 'dotenv'
dotenv.config()

import { Client, Intents, MessageSelectMenu, MessageActionRow } from 'discord.js'
import server from './server.js'
import { createTCList, createEmbed } from './function.js'
server.listen(3000)

const token = process.env.DISCORD_BOT_TOKEN
if (token == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

const client = new Client({
  // intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
  intents: Object.values(Intents.FLAGS).reduce((a, b) => a | b)
});

const guildTCList = []
client.on('guildCreate', async guild => {
  // サーバー参加時に、デフォルトで出力するテキストチャンネルを設定
  const textChannel = guild.channels.cache.find(c => c.type === 'GUILD_TEXT')
  guildTCList.push({
    guildID: guild.id,
    textChannelID: textChannel.id
  })
  const commands = [{
    name: 'change',
    description: '入室を通知するテキストチャンネルを変更します。'
  }]
  await client.application.commands.set(commands, guild.id)
})

client.on("ready", async () => {
  console.log(`${client.user.tag}がサーバーにログインしました。`)
  client.user.setActivity('テスト')
})
client.login(token);

client.on("voiceStateUpdate", async (oldState, newState) => {
  let textChannel = null
  const findGuild = guildTCList.find(object => object.guildID === oldState.guild.id)
  if (!findGuild) {
    // 入室時にguildTCListに登録されていない場合メッセージ送信する
    if (!oldState.channelId) {
      newState.channel.send('入室を通知するテキストチャンネルが設定されていません。\n「/change」で入室を通知するテキストチャンネルを設定して下さい。')
    }
    return
  }
  textChannel = oldState.guild.channels.cache.get(findGuild.textChannelID)
  const oldChannelId = oldState.channelId
  const newChannelId = newState.channelId

  // let firstEnterName = oldState.member.nickname
  // if (firstEnterName === null) firstEnterName = oldState.member.user.displayName
  // ↑の省略記法
  const firstEnterName = oldState.member.nickname ?? oldState.member.user.displayName
  const lastExitName = newState.member.nickname ?? newState.member.user.displayName

  // 入室時
  if (oldChannelId === null && newChannelId !== null) {
  const memberCount = client.channels.cache.get(newChannelId).members.size
    // 最初の1人以外はメッセージを送信しない
    if (memberCount > 1) return
    await textChannel.send(
      `一人目に**${firstEnterName}**さんが<#${newChannelId}>へ入室しました。<t:${Math.floor(Date.now() / 1000)}:T>`
    )
  }
  // 退出時
  else if (oldChannelId !== null && newChannelId === null) {
    // textChannel.send(
    //   `${lastExitName}さんが退室しました。`
    // )
  }
  // VC移動時
  else if (oldChannelId !== null && newChannelId !== null) {
    if (oldChannelId !== newChannelId) {
      return textChannel.send(
        `**${lastExitName}**さんが<#${oldChannelId}>から<#${newChannelId}>へ移動しました。<t:${Math.floor(Date.now() / 1000)}:T>`
      );
    }
  }
  else {
    return;
  }
})

client.on('interactionCreate', async (interaction) => {
  const findGuild = guildTCList.find(obj => obj.guildID === interaction.guild.id)
  // SelectMenuに反応する処理
  if(interaction.isSelectMenu()) {
    if(interaction.customId === 'textChannel') {
      const selectTextChannelID = interaction.values[0]
      if (!findGuild) {
        guildTCList.push({
          guildID: interaction.guild.id,
          textChannelID: selectTextChannelID
        })
      } else {
        const index = guildTCList.findIndex(obj => obj.guildID === interaction.guild.id)
        guildTCList[index].textChannelID = selectTextChannelID
      }
      const embed = await createEmbed(interaction, selectTextChannelID)
      await interaction.update({
        content: 'テキストチャンネルを設定しました。',
        embeds: [embed],
        components: []
      })
    }
  }

  // スラッシュコマンドに反応する処理
  if (!interaction.isCommand()) return

  // 通知するテキストチャンネル変更コマンド
  if (interaction.commandName === 'change') {
    const selectMenuValueList = await createTCList(interaction.guild.channels.cache)
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('textChannel')
        .setPlaceholder('テキストチャンネル')
        .addOptions(selectMenuValueList)
    )
    // 設定済のテキストチャンネルがない場合はembed非表示
    if (!findGuild) {
      await interaction.reply({
        content: '入室を通知するテキストチャンネルを選択してください。',
        components: [row]
      })
      return
    }
    const embed = await createEmbed(interaction, findGuild.textChannelID)
    await interaction.reply({
      content: '入室を通知するテキストチャンネルを選択してください。',
      embeds: [embed],
      components: [row]
    })
  }
})