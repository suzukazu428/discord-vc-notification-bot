import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js'
const createTCList = async (channels) => {
  const TC_list = channels.filter(c => c.type === 0)
  const selectMenuValueList = TC_list.map(channel => ({
    label: channel.name,
    value: channel.id
  }))
  return selectMenuValueList
}
const createEmbed = async (interaction, TC_ID) => {
  const findTextChannel = interaction.guild.channels.cache.find(c => c.id === TC_ID)
  const textChannelName = findTextChannel.name
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`現在の通知するテキストチャンネル: ${textChannelName}`)
  return embed
}
const changeNotificationChannel = async (interaction, outputTextChannelId) => {
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

export {
  createTCList,
  createEmbed,
  changeNotificationChannel
}