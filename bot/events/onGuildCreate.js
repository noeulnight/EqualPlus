const channelCheck = (client, channel) => channel.permissionsFor(client.user).has('SEND_MESSAGES') && channel.permissionsFor(client.user).has('VIEW_CHANNEL')
const yesno = ['751631048428748931', '751631056376954920']
const moment = require('moment')
const regist = require('../utils/regist')

/**
 * @param {import('../classes/Client')} client
 * @param {import('discord.js').Guild} guild
 */
async function onGuildCreate (client, guild) {
  const dbselect = await client.db.select('*').from('guilds').where('gid', guild.id)
  if (dbselect.length > 0) return

  const sendable = guild.systemChannel ? channelCheck(client, guild.systemChannel) : false
  const channel = sendable ? guild.systemChannel : findChannel(client, guild)
  if (!channel) guild.leave()

  channel.send('<@' + guild.ownerID + '>\n' + '**EqualPlus는 아래의 목적으로 개인정보를 수집 및 이용하며**\n**서버 사용자의 개인정보를 안전하게 저장하는데 최선을 다합니다.**\n> 아래 개인정보 수집에 대한 동의를 거부할 권리가 있으며, 동의 거부 시에는 사용이 제한될 수 있습니다.\n\n' + '**개인정보 수집 및 이용에 대한 안내**\n> 1. 목적 : 사용자 정보 식별, 서버 블랙리스트, EqualPlus 편의성 향상\n> 2. 항목 : 유저 ID, 유저이름, 메세지\n> 3. 보유기간: 회원 탈퇴 후 1년간 보관 후 파기')
    .then(async (msg) => {
      if (!msg) return

      // 이러헤 하는게 아니였나
      await msg.react(':__eq_yes:751631056376954920')
      await msg.react(':__eq_no:751631048428748931')

      const reactions = await msg.awaitReactions((r, u) => u.id === guild.ownerID && yesno.includes(r.emoji.id), { max: 1, time: 60000 })
      if (msg.channel.permissionsFor(client.user).has('MANAGE_MESSAGES')) msg.reactions.removeAll()

      if (reactions.length < 1) return msg.edit('등록 시간이 만료되었습니다, `eq동의`로 다시 동의하실 수 있습니다.')

      if (yesno.indexOf(reactions.first().emoji.id)) {
        regist(client, guild)
        msg.edit(moment().format('YYYY[년] M[월] D[일] HH:MM') + ', 개인정보 수집동의에 동의 하셨습니다.')
      } else msg.edit(moment().format('YYYY[년] M[월] D[일] HH:MM') + ', 개인정보 수집동의에 거부 하셨습니다.\n일부 기능이 제한 될 수 있습니다, `eq동의`로 다시 동의하실 수 있습니다.')
    })
    .catch((err) => console.log(err) && guild.leave())
}

/**
 * @param {import('discord.js').Guild} guild
 */
function findChannel (client, guild) {
  const channels = guild.channels.cache.array()
  for (const channel of channels) {
    if (channel.type === 'category') continue

    const sendable = channelCheck(client, channel)
    if (sendable) return channel
  }

  return guild.owner
}

module.exports = onGuildCreate
