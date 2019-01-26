import * as request from 'superagent';

// TODO: figure out best way to handle this
// This is a public key, so it's ok if we expose it for now
export const STRIPE_PUBLIC_KEY = 'pk_test_xvX7DzC9McRTklS8RyR9xprA';

export type Product = {
  id?: number | string;
  name: string;
  credits: number;
  price: number;
  description?: string;
};

// NB: make sure these are consistent with the server
export const PRODUCTS: Product[] = [
  {
    name: 'CREDIT_BUNDLE_10',
    credits: 10,
    price: 4.99,
    description: '10 Credit bundle'
  },
  {
    name: 'CREDIT_BUNDLE_60',
    credits: 60,
    price: 24.99,
    description: '60 Credit bundle'
  },
  {
    name: 'CREDIT_BUNDLE_120',
    credits: 120,
    price: 39.99,
    description: '120 Credit bundle'
  }
];

export const fetchBalance = (): Promise<any> => {
  return request.get('/api/balance').then(res => res.body);
};

export const createCharge = (
  token: string,
  productName?: string
): Promise<any> => {
  return request
    .post('/api/charges')
    .send({ token, productName })
    .then(res => res.body);
};

export const createSubscription = (
  email: string,
  token: string
): Promise<any> => {
  return request
    .post('/api/subscriptions')
    .send({ email, token })
    .then(res => res.body);
};
