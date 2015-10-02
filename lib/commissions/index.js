/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express();

app.get('/comisiones', require('lib/layout'));
app.get('/comisiones/comunicacion', require('lib/layout'));
app.get('/comisiones/organizacion', require('lib/layout'));
app.get('/comisiones/plataformas', require('lib/layout'));
app.get('/comisiones/territorio', require('lib/layout'));
app.get('/comisiones/financiamiento', require('lib/layout'));
app.get('/comisiones/partidos-en-red', require('lib/layout'));
app.get('/comisiones/afiliaciones', require('lib/layout'));
