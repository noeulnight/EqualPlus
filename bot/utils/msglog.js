/**
 * @param {import('../classes/Client')} client 
 * @param {import('discord.js').Message} msg 
 */
async function regist (client, msg) {
  const dbselect = await client.db.select('*').from('guilds').where('gid', msg.guild.id)
  if (dbselect.length < 1) return

  const { id: mid, createdAt } = msg
  const { id: gid } = msg.guild
  const { id: cid } = msg.channel
  const { id: uid } = msg.author
  const { length } = msg.content
  
  const isMod = msg.member.hasPermission('ADMINISTRATOR')
  const hasFile = !!msg.attachments.first()
  const hasMention = !!msg.mentions.users.first()
  
  const mentionTo = hasMention ? msg.mentions.users.first().id : null
  const fileSize = hasFile ? msg.attachments.first().size : null

  await client.db.insert({ mid, gid, cid, uid, length, isMod, hasFile, hasMention, mentionTo, createdAt, fileSize }).into('msglog')
}

module.exports = regist
