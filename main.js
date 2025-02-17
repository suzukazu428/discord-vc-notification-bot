import { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, REST, Routes } from 'discord.js'
import server from './server.js'
server()
import { createTCList, createEmbed } from './assets/functions.js'

const token = process.env.DISCORD_BOT_TOKEN
if (token == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
})

let outputTextChannelId = null // 現在の設定テキストチャンネルID
client.on('guildCreate', guild => {
  // サーバー参加時に、デフォルトで出力するテキストチャンネルを設定
//   const textChannel = guild.channels.cache.find(c => c.type === 'GUILD_TEXT')
//   outputTextChannelId = textChannel.id
})

client.on("ready", async (bot) => {
  // --- 新バージョン
  const change = new SlashCommandBuilder()
    .setName('change')
    .setDescription('入室を通知するテキストチャンネルを変更します。')
  const commands = [change]
  const rest = new REST({ version: '10' }).setToken(token)
  await rest.put(Routes.applicationCommands(bot.user.id),{ body: commands })
  console.log('コマンド追加完了!')
  // ---
  console.log(`${client.user.tag}がサーバーにログインしました。`)
})
client.login(token)

client.on("voiceStateUpdate", async (oldState, newState) => {
  let textChannel = null
  // --- 前バージョン
  if (newState.guild.name === 'ポケモンSV') {
    textChannel = oldState.member.guild.channels.cache.get(process.env.TC_ID_sub)
  } else if (newState.guild.name === 'スプラ組') {
    textChannel = oldState.member.guild.channels.cache.get(process.env.TC_ID)
  }
  // textChannel = oldState.member.guild.channels.cache.get(process.env.TC_ID)
  if (!textChannel) {
    console.log('テキストチャンネルが見つからない')
    return
  }
  // --- 新バージョン
  // let textChannel = null
  // if (!outputTextChannelId) {
  //   if (!oldState.channelId) {
  //     newState.channel.send('入室を通知するテキストチャンネルが設定されていません。\n「/change」で入室を通知するテキストチャンネルを設定して下さい。')
  //   }
  //   return
  // }
  // textChannel = oldState.guild.channels.cache.get(outputTextChannelId)
  // ---
  const oldChannelId = oldState.channelId
  const newChannelId = newState.channelId

  const firstEnterName = oldState.member.nickname ?? oldState.member.user.displayName
  const lastExitName = newState.member.nickname ?? newState.member.user.displayName

  // 入室時
  if (oldChannelId === null && newChannelId !== null) {
  const memberCount = client.channels.cache.get(newChannelId).members.size
    // 最初の1人以外はメッセージを送信しない
    if (memberCount > 1) return
    await textChannel.send(
      `一人目に${firstEnterName}さんが<#${newChannelId}>へ入室しました。<t:${Math.floor(Date.now() / 1000)}:T>`
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
    // if (oldChannelId !== newChannelId) {
    //   return textChannel.send(
    //     `**${lastExitName}**さんが<#${oldChannelId}>から<#${newChannelId}>へ移動しました。<t:${Math.floor(Date.now() / 1000)}:T>`
    //   );
    // }
  }
  else {
    return;
  }
})

client.on('interactionCreate', async (interaction) => {
  // SelectMenuに反応する処理
  if(interaction.isStringSelectMenu()) {
    if(interaction.customId === 'textChannel') {
      outputTextChannelId = interaction.values[0]
      const embed = await createEmbed(interaction, outputTextChannelId)
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
  if (interaction.commandName === 'change') {
    const selectMenuValueList = await createTCList(interaction.guild.channels.cache)
    const row = new ActionRowBuilder().setComponents(
      new StringSelectMenuBuilder()
        .setCustomId('textChannel')
        .setPlaceholder('テキストチャンネル')
        .setOptions(selectMenuValueList)
    )
    // 設定済のテキストチャンネルがない場合はembed非表示
    if (!outputTextChannelId) {
      await interaction.reply({
        content: '入室を通知するテキストチャンネルを選択してください。',
        components: [row]
      })
      return
    }
    const embed = await createEmbed(interaction, outputTextChannelId)
    await interaction.reply({
      content: '入室を通知するテキストチャンネルを選択してください。',
      embeds: [embed],
      components: [row]
    })
  }
})
