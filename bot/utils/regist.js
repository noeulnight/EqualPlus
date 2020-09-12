/**
 * @param {import('../classes/Client')} client 
 * @param {import('discord.js').Guild} guild 
 */
async function regist (client, guild) {
  const mods = guild.members.cache.array().filter((m) => m.hasPermission('ADMINISTRATOR'))
  for (const mod of mods) {
    mods[mods.indexOf(mod)] = mod.id
  }

  await client.db.insert({ gid: guild.id, mods: mods.join(','), name: guild.name, icon: (guild.iconURL({ dynamic: true })) }).into('guilds')
}

module.exports = regist
