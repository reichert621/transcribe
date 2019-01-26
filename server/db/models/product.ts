export type Product = {
  name: string;
  credits: number;
  price: number;
  description?: string;
};

// Price is in cents
export const PRODUCTS: Product[] = [
  {
    name: 'CREDIT_BUNDLE_10',
    credits: 10,
    price: 499,
    description: '10 Credit bundle'
  },
  {
    name: 'CREDIT_BUNDLE_60',
    credits: 60,
    price: 2499,
    description: '60 Credit bundle'
  },
  {
    name: 'CREDIT_BUNDLE_120',
    credits: 120,
    price: 3999,
    description: '120 Credit bundle'
  }
];

export const getProduct = (productName: string) => {
  return PRODUCTS.find(product => product.name === productName);
};
