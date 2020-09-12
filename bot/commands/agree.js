const moment = require('moment')
const regist = require('../utils/regist')

async function run (client, msg) {
  if (msg.guild.ownerID !== msg.author.id) return
  const dbselect = await client.db.select('*').from('guilds').where('gid', msg.guild.id)
  if (dbselect.length > 0) return msg.channel.send(moment(dbselect[0].agreeAt).format('YYYY[년] M[월] D[일] HH:MM') + '에 이미 등록된 서버입니다')

  regist(client, msg.guild)
  msg.channel.send(moment().format('YYYY[년] M[월] D[일] HH:MM') + ', 개인정보 수집동의에 동의 하셨습니다.')
}

module.exports = run
module.exports.aliases = ['동의']
