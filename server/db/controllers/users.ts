import { Request, Response } from 'express';
import { User } from '../index';
import { handleError } from './utils';

export default {
  isAuthenticated(req: Request, res: Response) {
    const isLoggedIn = Boolean(req.user && req.user.id);

    return res.json({
      isAuthenticated: isLoggedIn,
      currentUser: req.user
    });
  },

  me(req: Request, res: Response) {
    const { user } = req;

    if (!user || !user.id) {
      return handleError(res, new Error('Not authenticated!'));
    }

    return res.json({ user: User.formatted(user) });
  },

  login(req: Request, res: Response) {
    const credentials = req.body;

    return User.authenticate(credentials)
      .then(user => res.json({ user }))
      .catch(err => handleError(res, err));
  },

  register(req: Request, res: Response) {
    const credentials = req.body;

    return User.register(credentials)
      .then(user => res.json({ user }))
      .catch(err => handleError(res, err));
  },

  logout(req: Request, res: Response) {
    req.logout();

    return res.status(200).send({ status: 200 });
  }
};
