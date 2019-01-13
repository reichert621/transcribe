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
      const name = req.body.fileName;
      const recording = await Recording.create({ name });
      await startTranscription(name);
      res.json({ recording });
    } catch (err) {
      console.log(err);
      handleError(res, err);
    }
  }
};
