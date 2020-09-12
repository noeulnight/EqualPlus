const Query = require('../classes/Query')
const msglog = require('../utils/msglog')

/**
 * @param {import('../classes/Client')} client
 * @param {import('discord.js').Message} msg
 */
function onMessage (client, msg) {
  const { prefix } = client.settings
  const { author, content } = msg

  if (!msg.guild) return
  if (author.bot) return
  msglog(client, msg)

  if (!content.startsWith(prefix)) return

  const query = new Query(prefix, content)
  const target = client.commands.find(
    (command = { aliases: [] }) =>
      typeof command === 'function' &&
      command.aliases.includes(query.cmd)
  )

  if (!target) return
  target(client, msg)
}

module.exports = onMessage
