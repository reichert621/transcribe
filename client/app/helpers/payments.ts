import * as request from 'superagent';

// TODO: figure out best way to handle this
// This is a public key, so it's ok if we expose it for now
export const STRIPE_PUBLIC_KEY = 'pk_test_xvX7DzC9McRTklS8RyR9xprA';

export const fetchBalance = (): Promise<any> => {
  return request.get('/api/balance').then(res => res.body);
};

export const createCharge = (token: string): Promise<any> => {
  return request
    .post('/api/charges')
    .send({ token })
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
