import { SlashCommandBuilder, REST, Routes } from 'discord.js'
import { changeNotificationChannel } from './functions.js'

const change = {
  data: new SlashCommandBuilder()
    .setName('change')
    .setDescription('入室を通知するテキストチャンネルを変更します。'),
  async execute(interaction, textChannelId) {
    changeNotificationChannel(interaction, textChannelId)
  }
}

const commands = {
  change
}
const commandDataList = [
  change.data
]

const commandsInitialize = async (botID) => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN)
    await rest.put(Routes.applicationCommands(botID),{ body: commandDataList })
    console.log('コマンド追加完了!')
  } catch(e) {
    console.error('コマンド追加失敗', e)
  }
}

export {
  commandsInitialize,
  commands
}