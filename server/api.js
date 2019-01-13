const express = require('express');

const { Router } = express;
const { recordings } = require('./db/controllers');
const { sign } = require('./aws');

const api = Router();

// For testing
api.get('/ping', (req, res) => res.json({ message: 'pong' }));

api.get('/recordings', recordings.fetch);
api.get('/get-signed-url', (req, res) => {
  const { fileName } = req.query;
  return sign(fileName)
    .then((signedUrl) => {
      res.json({ signedUrl });
    })
    .catch((error) => {
      res.json({ error });
    });
});
module.exports = api;
