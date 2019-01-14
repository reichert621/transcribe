const { sign } = require('../../aws');
const { handleError } = require('./utils');

module.exports = {
  getSignedUrl(req, res) {
    const { fileName, contentType } = req.query;

    return sign(fileName, contentType)
      .then(signedUrl => res.json({ signedUrl }))
      .catch(err => handleError(res, err));
  }
};
