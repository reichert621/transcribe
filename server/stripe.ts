import * as Stripe from 'stripe';
import { Product } from './db/models/product';

const { STRIPE_SECRET_KEY } = process.env;
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const createCharge = (token: string, product: Product) => {
  return stripe.charges.create({
    amount: product.price,
    currency: 'usd',
    description: product.description,
    source: token
  });
};

export const createCustomer = (email: string, token: string) => {
  return stripe.customers.create({
    email,
    source: token
  });
};

export default stripe;
