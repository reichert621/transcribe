const { Recording } = require('../index');
const { handleError } = require('./utils');

module.exports = {
  fetch(req, res) {
    return Recording.fetch()
      .then(recordings => res.json({ recordings }))
      .catch(err => handleError(res, err));
  }
};
