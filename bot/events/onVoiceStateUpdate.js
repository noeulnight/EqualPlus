const voiceCount = require('../utils/voiceCount')

/**
 * @param {import('discord.js').VoiceState} old
 * @param {import('discord.js').VoiceState} voice
 */
function onVoiceStateUpdate (client, oldMember, newMember)  {
  let newUserChannel = newMember.channel
  let oldUserChannel = oldMember.channel


  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    voiceCount(client, newMember.connection.channel.guild.id)
  }
}

module.exports = onVoiceStateUpdate
