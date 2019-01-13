const express = require('express');

const { Router } = express;
const { recordings } = require('./db/controllers');
const { sign } = require('./aws');

const api = Router();

// For testing
api.get('/ping', (req, res) => res.json({ message: 'pong' }));

api.get('/recordings', recordings.fetch);
api.post('/recordings', recordings.create);

api.get('/signed-url', (req, res) => {
  const { fileName, contentType } = req.query;

  return sign(fileName, contentType)
    .then(signedUrl => {
      res.json({ signedUrl });
    })
    .catch(error => {
      res.json({ error });
    });
});
module.exports = api;
