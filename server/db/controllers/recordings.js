const { first } = require('lodash');
const { Recording } = require('../index');
const {
  startTranscription,
  listTranscriptionJobs,
  getTranscription,
  isValidTranscription,
  parseTranscription
} = require('../../aws');
const { handleError } = require('./utils');

const getInProgressJobs = recordings => {
  const promises = recordings
    .filter(({ status }) => status === 'IN_PROGRESS')
    .map(({ name }) => listTranscriptionJobs(name));

  return Promise.all(promises).then(results => {
    return results.reduce((acc, jobs) => {
      const job = first(jobs);

      return job ? acc.concat(job) : acc;
    }, []);
  });
};

const getCompletedTranscriptions = jobs => {
  const promises = jobs.reduce((acc, job) => {
    const { TranscriptionJobName: name, TranscriptionJobStatus: status } = job;

    if (status === 'COMPLETED') {
      return acc.concat(getTranscription(name));
    } else {
      return acc;
    }
  }, []);

  return Promise.all(promises);
};

const updateRecordingTranscriptions = transcriptions => {
  const promises = transcriptions
    .filter(transcription => isValidTranscription(transcription))
    .map(transcription => {
      const parsed = parseTranscription(transcription);
      const { jobName: name } = parsed;

      return Recording.updateByName(name, {
        transcription: parsed,
        status: 'COMPLETED'
      });
    });

  return Promise.all(promises);
};

module.exports = {
  async fetch(req, res) {
    try {
      // const { fileName, status } = req.query;
      const { id: userId } = req.user;
      const currentRecordings = await Recording.fetch({ userId });
      console.log({ currentRecordings });
      const jobs = await getInProgressJobs(currentRecordings);
      console.log({ jobs });
      const completed = await getCompletedTranscriptions(jobs);
      console.log({ completed });
      const updates = await updateRecordingTranscriptions(completed);
      console.log({ updates });

      const recordings = await Recording.fetch({ userId });

      return res.json({ recordings });
    } catch (err) {
      return handleError(res, err);
    }
  },

  findById(req, res) {
    const { id } = req.params;

    return Recording.findById(id)
      .then(recording => res.json({ recording }))
      .catch(err => handleError(res, err));
  },

  async create(req, res) {
    try {
      const { id: userId } = req.user;
      const { fileName: name } = req.body;
      // TODO should check start transcription for status
      const recording = await Recording.create({
        name,
        userId,
        status: 'IN_PROGRESS'
      });
      await startTranscription(name);
      res.json({ recording });
    } catch (err) {
      handleError(res, err);
    }
  }
};
