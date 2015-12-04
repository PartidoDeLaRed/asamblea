/**
 * Module dependencies.
 */

var express = require('express');
var api = require('lib/db-api');
var accepts = require('lib/accepts');
var utils = require('lib/utils');
var restrict = utils.restrict;
var staff = utils.staff;
var expose = utils.expose;
var log = require('debug')('democracyos:tag');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

app.get('/tag/all', function (req, res) {
  log('Request /tag/all');
  api.tag.all(function (err, tags) {
    if (err) return _handleError(err, req, res);

    log('Serving all tags');
    res.json(tags.map(expose('id hash name color image createdAt')));
  });
});

app.get('/tag/search', function (req, res) {
  log('Request /tag/search %j', req.query);
  api.tag.search(req.query.q, function(err, tags) {
    if (err) return _handleError(err, req, res);

    log('Serving tags %j', tags);
    res.json(tags.map(expose('id hash name color image createdAt')));
  });
});

app.get('/tag/:id', function (req, res) {
  log('Request GET /tag/%s', req.params.id);

  api.tag.get(req.params.id, function (err, tagDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving tag %s', tagDoc.id);
    var keys = [
      'id hash name color image createdAt'
    ].join(' ');

    res.json(expose(keys)(tagDoc.toJSON()));
  });
});

app.post('/tag/create', staff, function (req, res, next) {
  log('Request /tag/create %j', req.body.tag);

  api.tag.create(req.body, function (err, tagDoc) {
    if (err) return next(err);
    var keys = [
      'id hash name color image createdAt'
    ].join(' ');
    res.json(expose(keys)(tagDoc));
  });
});

app.post('/tag/:id', staff, function (req, res) {
  log('Request POST /tag/%s', req.params.id);

  api.tag.update(req.params.id, req.body, function (err, tagDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving tag %s', tagDoc.id);
    var keys = [
      'id hash name color image createdAt'
    ].join(' ');

    res.json(expose(keys)(tagDoc.toJSON()));
  });
});

function _handleError (err, req, res) {
  log("Error found: %j", err);
  res.json({ error: err });
}