const express = require('express');
const { users, recordings } = require('./db/controllers');
const { auth, isAuthenticated } = require('./passport');
const { flatMap } = require('lodash');
const Recording = require('./db/models/recording');
const {
  sign,
  listTranscriptionJobs,
  getTranscription,
  parseTranscription
} = require('./aws');

const { Router } = express;
const api = Router();

// For testing
api.get('/ping', (req, res) => res.json({ message: 'pong' }));

api.post('/register', users.register);
api.post('/login', auth, users.login);
api.delete('/logout', users.logout);

api.post('/recordings', isAuthenticated, recordings.create);

api.get('/signed-url', isAuthenticated, (req, res) => {
  const { fileName, contentType } = req.query;

  return sign(fileName, contentType)
    .then(signedUrl => {
      res.json({ signedUrl });
    })
    .catch(error => {
      res.status(500)
        .json({ error });
    });
});

api.get('/recordings', isAuthenticated, async (req, res) => {
  // A fileName can be optionally included in the query params to filter jobs
  const { fileName } = req.query;
  const userId = req.user.id;
  const currentRecordings = await Recording.fetch({ userId });

  const inProgressJobs = currentRecordings
    .filter(recording => recording.status === 'IN_PROGRESS')
    .map(recording => listTranscriptionJobs(recording.name));

  const transcriptionJobs = await Promise.all(inProgressJobs);
  const completed = flatMap(transcriptionJobs, jobDetails => {
    const job = jobDetails.TranscriptionJobSummaries[0];
    const name = job.TranscriptionJobName;
    if (job.TranscriptionJobStatus === 'COMPLETED') {
      return getTranscription(name);
    } else {
      return null;
    }
  });

  const transcriptions = await Promise.all(completed);
  const rowsToUpdate = flatMap(transcriptions, (trans => {
    const parsed = parseTranscription(trans);
    if (!parsed) {
      return null;
    }
    const name = parsed.jobName;
    console.log(name);
    return Recording.updateByName(name, {
      transcription: parsed,
      status: 'COMPLETED'
    });
  }));

  await Promise.all(rowsToUpdate);

  const recordings = await Recording.fetch({ userId });
  res.json({ recordings });
});

module.exports = api;
