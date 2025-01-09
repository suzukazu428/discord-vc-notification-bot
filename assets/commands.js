// import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, REST, Routes } from 'discord.js'

// const change = {
//   data: new SlashCommandBuilder()
//     .setName('change')
//     .setDescription('入室を通知するテキストチャンネルを変更します。'),

//   async execute(interaction) {
//     const selectMenuValueList = await createTCList(interaction.guild.channels.cache)
//     const row = new ActionRowBuilder().setComponents(
//       new StringSelectMenuBuilder()
//         .setCustomId('textChannel')
//         .setPlaceholder('テキストチャンネル')
//         .setOptions(selectMenuValueList)
//     )
//     // 設定済のテキストチャンネルがない場合はembed非表示
//     if (!outputTextChannelId) {
//       await interaction.reply({
//         content: '入室を通知するテキストチャンネルを選択してください。',
//         components: [row]
//       })
//       return
//     }
//     const embed = await createEmbed(interaction, outputTextChannelId)
//     await interaction.reply({
//       content: '入室を通知するテキストチャンネルを選択してください。',
//       embeds: [embed],
//       components: [row]
//     })
//   }
// }
// const commands = [
//   change.data
// ]
// try {
//   const rest = new REST({ version: '10' }).setToken(token)
//   await rest.put(Routes.applicationCommands(bot.user.id),{ body: commands })
//   console.log('コマンド追加完了!')
// } catch(e) {
//   console.error('コマンド追加失敗', e)
// }
// if (interaction.commandName === 'change') {}

// export {
//   change
// }