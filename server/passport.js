const passport = require('passport');
const { Strategy } = require('passport-local');
const { User } = require('./db');

const DEFAULT_REDIRECT = '/';

const strategy = new Strategy(
  { usernameField: 'email' },
  (email, password, cb) => {
    return User.findByEmail(email)
      .then(user => {
        if (!user) return cb(null, false);
        if (!User.verifyUser(user, password)) {
          return cb(null, false);
        }

        return cb(null, user);
      })
      .catch(err => cb(err));
  }
);

const serialize = (user, done) => {
  return done(null, user.id);
};

const deserialize = (id, done) => {
  return User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
};

const authenticate = (type = 'local') => {
  return passport.authenticate(type, {
    failureRedirect: DEFAULT_REDIRECT
  });
};

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).send();
};

module.exports = {
  strategy,
  serialize,
  deserialize,
  isAuthenticated,
  authenticate,
  auth: authenticate()
};
