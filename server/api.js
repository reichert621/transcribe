const express = require('express');

const { Router } = express;
const { recordings } = require('./db/controllers');

const api = Router();

// For testing
api.get('/ping', (req, res) => res.json({ message: 'pong' }));

api.get('/recordings', recordings.fetch);
api.post('/upload', (req, res) => {
  const { body, files } = req;
  console.log({ body, files });

  return res.json({ done: true });
});

module.exports = api;
