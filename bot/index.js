const Client = require('./classes/Client')
const client = new Client()

const onReady = require('./events/onReady')
const onMessage = require('./events/onMessage')
const onGuildCreate = require('./events/onGuildCreate')
const onVoiceStateUpdate = require('./events/onVoiceStateUpdate')

client.start()
client.regist('ready', onReady)
client.regist('message', onMessage)
client.regist('guildCreate', onGuildCreate)
client.regist('voiceStateUpdate', onVoiceStateUpdate)

module.exports = client
