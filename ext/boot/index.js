var express = require('express')

var app = module.exports = express()

app.use(require('../certbot'))
