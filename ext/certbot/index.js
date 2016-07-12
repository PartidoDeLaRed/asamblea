var express = require('express')

var app = module.exports = express()

var certbotKey = process.env.HTTPS_CERTBOT_KEY
var certbotToken = process.env.HTTPS_CERTBOT_TOKEN

if (certbotKey) {
  app.param('key', function certbotParamKey (req, res, next, key) {
    if (key === certbotKey) return next()
    res.status(400).send()
  })

  app.get('/.well-known/acme-challenge/:key', function certbot (req, res) {
    res.status(200).send(certbotKey + '.' + certbotToken)
  })
}
