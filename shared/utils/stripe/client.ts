import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        '',
    );
  }

  return stripePromise;
};

export async function createPaymentSession(userId: string) {
  const productId = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_PRODUCT_ID;
  return {
    url: `https://buy.stripe.com/${productId}?client_reference_id=${userId}`,
  };
}
