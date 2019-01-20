import { Request, Response } from 'express';
import {
  fetchBalance,
  createCharge,
  generateExistingTestSubscription
} from '../../stripe';
import { handleError } from './utils';

// TODO: rename file to 'payments'?
export default {
  balance(req: Request, res: Response) {
    return fetchBalance()
      .then(result => {
        console.log('Stripe balance success!', result);
        return res.json({ result });
      })
      .catch(err => {
        console.log('Stripe balance error!', err);
        return handleError(res, err);
      });
  },

  charge(req: Request, res: Response) {
    const { token } = req.body;

    return createCharge(token)
      .then(result => {
        console.log('Stripe charge success!', result);
        return res.json({ result });
      })
      .catch(err => {
        console.log('Stripe charge error!', err);
        return handleError(res, err);
      });
  },

  subscription(req: Request, res: Response) {
    const { email, token, planId } = req.body;

    return generateExistingTestSubscription(email, token, planId)
      .then(result => {
        console.log('Stripe subscription success!', result);
        return res.json({ result });
      })
      .catch(err => {
        console.log('Stripe subscription error!', err);
        return handleError(res, err);
      });
  }
};
