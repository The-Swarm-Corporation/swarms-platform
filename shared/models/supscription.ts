import { Product, ProductPrice, Subscription } from './db-types';

export type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (ProductPrice & {
        products: Product | null;
      })
    | null;
};
