/**
 * @param {import('../bot/classes/Client')} client
 */
module.exports = (client) => {
  const settings = require('../settings.json')
  const PORT = process.env.port || settings.port || 8080
  
  const path = require('path').resolve()
  const cookieParser = require('cookie-parser')
  const { renderFile } = require('ejs')
  const express = require('express')
  const moment = require('moment')
  const oauth = new (require('discord-oauth2'))()
  const uuid = require('uuid').v4
  const db = require('knex')({ client: 'mysql', connection: { user: 'equalplus', host: 'localhost', database: 'equalplus' } })
  const app = express()
  
  const sessions = []
  app.use('/assets', express.static(path + '/web/src/assets'))
  app.use('/debug', express.static(path + '/web/src'))
  app.use(cookieParser())
  
  app.get('/', (req, res) => {
    const { sid } = (req.cookies || {})
    if (!sessions.find((s) => s.sid === sid)) {
      renderFile(path + '/web/src/auth-signin.ejs', { url: settings.url }, (err, str) => {
        if (err) return console.log(err)
        res.send(str)
      })
    } else res.redirect('/select')
  })
  
  app.get('/select', async (req, res) => {
    const { sid } = (req.cookies || {})
    if (sessions.find((s) => s.sid === sid)) {
      const guilds = await db.select('*').from('guilds')
      const servers = []
      for (const guild of guilds) {
        if (guild.mods.split(',').includes(sessions.find((s) => s.sid === sid).uid)) servers.push(guild)
      }
      
      renderFile(path + '/web/src/server-select.ejs', { servers }, (err, str) => {
        if (err) return
        res.send(str)
      })
    } else res.redirect('/')
  })
  
  app.get('/auth', (req, res) => {
    const { code } = (req.query || {})
    if (!code) return res.redirect('/')
    
    oauth
      .tokenRequest({ code, scope: 'identify', clientId: '751612891697774662', clientSecret: 'RKXDsg1rOyCSqXI9zETEiwsOORfji6Ki', redirectUri: 'http://localhost:8080/auth', grantType: 'authorization_code' })
      .catch(() => {})
      .then((v)=> {
        oauth
          .getUser(v.access_token)
          .catch(() => {})
          .then((r) => {
            if (!r) return res.send('error')
            const sid = uuid()
            sessions.push({ sid, uid: r.id, username: r.username, avatar: r.avatar })
            res.cookie('sid', sid).redirect('/select')
          })
      })
  })
  
  // /api/kick?guild=뭐시&user=뭐시기 dzzddzdz
  app.get('/api/kick', async (req, res) => {
    const { sid } = (req.cookies || {})
    const { guild, user } = req.query
    if (!sessions.find((s) => s.sid === sid)) return res.redirect('/')
    if (!guild || !user) return res.redirect('/')

    const guildres = client.guilds.resolve(guild)
    if (!guildres) return res.redirect('/select')

    const [ guilddb ] = await db.select('*').from('guilds').where('gid', guildres.id)
    if (!guilddb.mods.split(',').includes(sessions.find((s) => s.sid === sid).uid)) return res.redirect('/select')

    const target = guildres.members.resolve(user)
    if (target.kickable) target.kick()
    else return res.send('<script>alert("이 사용자를 Kick할 권한이 부족합니다");window.location.replace("/dashboard?guild=' + guild + '")</script>')
    res.send('<script>alert("사용자 ' + target.user.username + '을 Kick하였습니다");window.location.replace("/dashboard?guild=' + guild + '")</script>')
  })

  app.get('/api/ban', async (req, res) => {
    const { sid } = (req.cookies || {})
    const { guild, user } = req.query
    if (!sessions.find((s) => s.sid === sid)) return res.redirect('/')
    if (!guild || !user) return res.redirect('/')

    const guildres = client.guilds.resolve(guild)
    if (!guildres) return res.redirect('/select')

    const [ guilddb ] = await db.select('*').from('guilds').where('gid', guildres.id)
    if (!guilddb.mods.split(',').includes(sessions.find((s) => s.sid === sid).uid)) return res.redirect('/select')

    const target = guildres.members.resolve(user)
    if (target.bannable) target.ban()
    else return res.send('<script>alert("이 사용자를 Ban할 권한이 부족합니다");window.location.replace("/dashboard?guild=' + guild + '")</script>')
    res.send('<script>alert("사용자 ' + target.user.username + '을 Ban하였습니다");window.location.replace("/dashboard?guild=' + guild + '")</script>')
  })

  app.get('/dashboard', async (req, res) => {
    const { sid } = (req.cookies || {})
    if (sessions.find((s) => s.sid === sid)) {
      const guildres = client.guilds.resolve(req.query.guild || 0)
      if (!guildres) return res.redirect('/select')

      const [ guilddb ] = await db.select('*').from('guilds').where('gid', guildres.id)
      if (!guilddb.mods.split(',').includes(sessions.find((s) => s.sid === sid).uid)) return res.redirect('/select')

      const totalMsg = (await db.select('createdAt').from('msglog').where('gid', req.query.guild || 0)).filter((m) => moment(m.createdAt).month === moment().month).length
      const memberinfo = client.guilds.resolve(req.query.guild).members.cache.array()

      renderFile(path + '/web/src/index.ejs', { session: sessions.find((s) => s.sid === sid), totalMsg, memberinfo }, (err, str) => {
        if (err) return console.log(err)
        res.send(str)
      })
    } else res.redirect('/')
  })
  
  app.get('/logout', (req, res) => {
    const { sid } = (req.cookies || {})
    const found = sessions.findIndex((s) => s.sid === sid)
    if (found > -1) {
      sessions.splice(found, 1)
      res.cookie('sid', '')
    }
    
    res.redirect('/')
  })
  
  app.listen(PORT, () => console.log('Web at http://localhost:' + PORT))
}
