import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';
import { Strategy } from 'passport-local';
import { M, User } from './db';

const DEFAULT_REDIRECT = '/';

export const strategy = new Strategy(
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

export const serialize = (user: M.User, done: (err: any, id?: any) => void) => {
  return done(null, user.id);
};

export const deserialize = (
  id: number,
  done: (err: any, user?: M.User) => void
) => {
  return User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
};

export const authenticate = (type = 'local') => {
  return passport.authenticate(type, {
    failureRedirect: DEFAULT_REDIRECT
  });
};

export const auth = authenticate();

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).send();
};

export default {
  strategy,
  serialize,
  deserialize,
  isAuthenticated,
  authenticate,
  auth: authenticate()
};
