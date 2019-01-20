import * as Stripe from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const fetchBalance = () => {
  return stripe.balance.retrieve();
};

export const createCharge = (token: string, amount?: number) => {
  return stripe.charges.create({
    amount: amount || 499,
    currency: 'usd',
    description: 'My Test Charge',
    source: token
  });
};

export const createServiceProduct = (name?: string) => {
  return stripe.products.create({
    name: name || 'My SaaS Product',
    type: 'service'
  });
};

export const createPlan = (product: string, nickname?: string) => {
  return stripe.plans.create({
    product,
    nickname: nickname || 'My SaaS Plan',
    currency: 'usd',
    interval: 'month',
    amount: 1999
  });
};

export const createCustomer = (email: string, token: string) => {
  return stripe.customers.create({
    email,
    source: token
  });
};

export const subscribeCustomer = (customer: string, plan: string) => {
  return stripe.subscriptions.create({
    customer,
    items: [{ plan }]
  });
};

export const generateNewTestSubscription = async (
  email: string,
  token: string
) => {
  const { id: productId } = await createServiceProduct('My Test Product');
  const { id: planId } = await createPlan(productId, 'My Test Plan');
  const { id: customerId } = await createCustomer(email, token);
  const subscription = await subscribeCustomer(customerId, planId);

  return subscription;
};

export const generateExistingTestSubscription = async (
  email: string,
  token: string,
  plan: string
) => {
  // Hardcoded from Stripe dashboard
  // TODO: store required Stripe ids in db
  const planId = plan || 'plan_ENWF4ti7eal9sp';

  const { id: customerId } = await createCustomer(email, token);
  const subscription = await subscribeCustomer(customerId, planId);

  return subscription;
};

export default stripe;
