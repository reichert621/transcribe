const { Recording } = require('../index');
const { startTranscription } = require('../../aws');
const { handleError } = require('./utils');

module.exports = {
  fetch(req, res) {
    return Recording.fetch()
      .then(recordings => res.json({ recordings }))
      .catch(err => handleError(res, err));
  },

  async create(req, res) {
    try {
      const { id: userId } = req.user;
      const { fileName: name } = req.body;
      //TODO should check start transcription for status
      const recording = await Recording.create({ name, userId, status: 'IN_PROGRESS' });
      await startTranscription(name);
      res.json({ recording });
    } catch (err) {
      handleError(res, err);
    }
  }
};
