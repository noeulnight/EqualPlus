/**
 * @param {import('../classes/Client')} client 
 * @param {string} id guild id
 */
async function regist (client, id) {
  const dbselect = await client.db.select('*').from('guilds').where('gid', msg.guild.id)
  if (dbselect.length < 1) return

  await client.db.update({ voiceCount: dbselect[0].voiceCount + 1 }).into('guilds')
}

module.exports = regist
