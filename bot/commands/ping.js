function run (client, msg) {
  msg.channel.send(
    'pong!\n' +
    client.ws.ping + 'ms'
  )
}

module.exports = run
module.exports.aliases = ['ping', '핑', 'pong']
