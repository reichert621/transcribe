const express = require('express');

const { Router } = express;
const { recordings } = require('./db/controllers');
const { sign, listTranscriptionJobs } = require('./aws');

const api = Router();

// For testing
api.get('/ping', (req, res) => res.json({ message: 'pong' }));

api.get('/recordings', recordings.fetch);
api.get('/signed-url', (req, res) => {
  const { fileName, contentType } = req.query;

  return sign(fileName, contentType)
    .then(signedUrl => {
      res.json({ signedUrl });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});

api.get('/transcription-statuses', (req, res) => {
  // A fileName can be optionally included in the query params to filter jobs
  const { fileName } = req.query;

  return listTranscriptionJobs(fileName)
    .then(results => {
      // TODO: do we need the `NextToken` field for anything?
      const { NextToken: nextToken, TranscriptionJobSummaries: jobs } = results;

      res.json({
        jobs: jobs.map(job => {
          // Rename some of AWS's weird fields
          const {
            TranscriptionJobName: name,
            CreationTime: createdAt,
            TranscriptionJobStatus: status
          } = job;

          return { name, createdAt, status };
        })
      });
    })
    .catch(err => {
      // TODO: better error handling
      res.status(500).json({ error: err.message });
    });
});

module.exports = api;
