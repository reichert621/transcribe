const { User } = require('../index');
const { handleError } = require('./utils');

module.exports = {
  isAuthenticated(req, res) {
    const isLoggedIn = Boolean(req.user && req.user.id);

    return res.json({
      isAuthenticated: isLoggedIn,
      currentUser: req.user
    });
  },

  login(req, res) {
    return User.authenticate(req.body)
      .then(user => res.json({ user }))
      .catch(err => handleError(res, err));
  },

  register(req, res) {
    return User.register(req.body)
      .then(user => res.json({ user }))
      .catch(err => handleError(res, err));
  },

  logout(req, res) {
    req.logout();

    return res.status(200).send({ status: 200 });
  }
};
