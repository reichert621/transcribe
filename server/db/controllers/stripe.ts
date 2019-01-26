import { Request, Response } from 'express';
import { createCharge } from '../../stripe';
import { handleError } from './utils';
import { getProduct, PRODUCTS } from '../models/product';
import { User } from '../index';

// TODO: rename file to 'payments'?
export default {
  fetchProducts(req: Request, res: Response) {
    return res.json({ products: PRODUCTS });
  },

  async charge(req: Request, res: Response) {
    try {
      const { token, productName } = req.body;
      const userId = req.user.id;

      if (!productName) {
        return res.status(400).end('Missing ProductName');
      }

      const product = getProduct(productName);
      if (!product) {
        return res.status(400).end('Invalid product request');
      }

      await createCharge(token, product);
      await User.addCredit(userId, product.credits);

      return res.json({ success: true });
    } catch (err) {
      console.log('Stripe charge error!', err);
      return handleError(res, err);
    }
  }
};
