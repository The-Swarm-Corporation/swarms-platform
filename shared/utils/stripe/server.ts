'use server';

import Stripe from 'stripe';
import { stripe } from '@/shared/utils/stripe/config';
import { createClient } from '@/shared/utils/supabase/server';
import {
  retrieveUserStripeCustomerId,
  supabaseAdmin,
} from '@/shared/utils/supabase/admin';
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp,
} from '@/shared/utils/helpers';
import { PLATFORM } from '@/shared/utils/constants';
import { ProductPrice } from '@/shared/models/db-types';
import { User } from '@supabase/supabase-js';
import { SubscriptionWithPriceAndProduct } from '@/shared/models/supscription';

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

export async function getSubscriptionStatus(user: User) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .eq('user_id', user.id)
    .in('status', ['trialing', 'active'])
    .maybeSingle();
  const subscription: SubscriptionWithPriceAndProduct | null = data;
  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency!,
      minimumFractionDigits: 0,
    }).format((subscription?.prices?.unit_amount || 0) / 100);
  return {
    status: subscription?.status,
    interval: subscription?.interval,
    subscriptionPrice,
    isCanceled: subscription?.cancel_at_period_end,
    renewAt: subscription?.current_period_end,
  };
}
export async function getUserStripeCustomerId(user: User) {
  // Retrieve the customer in Stripe
  try {
    return await retrieveUserStripeCustomerId(user.id);
  } catch (err) {
    console.error(err);
    throw new Error('Unable to access customer record.');
  }
}
export async function checkoutWithStripe(
  price: ProductPrice,
  redirectPath: string = PLATFORM.ACCOUNT,
  cancelPath?: string,
): Promise<CheckoutResponse> {
  try {
    // Get the user from Supabase auth
    const supabase = await createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      throw new Error('Could not get user session.');
    }

    // Retrieve or create the customer in Stripe
    const customer = await getUserStripeCustomerId(user);

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer,
      customer_update: {
        address: 'auto',
      },
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      cancel_url: getURL(cancelPath),
      success_url: getURL(redirectPath),
    };

    const TRIAL_PRICE_IDS = [process.env.STRIPE_YEARLY_SUBSCRIPTION_PRODUCT_ID];
    const TRIAL_PERIOD_DAYS = 10;

    const shouldApplyTrial = TRIAL_PRICE_IDS.includes(price.id);
    const trialPeriodDays = shouldApplyTrial ? TRIAL_PERIOD_DAYS : 0;

    if (price.type === 'recurring') {
      const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
        {};

      if (trialPeriodDays > 0) {
        console.log(
          `Applying ${trialPeriodDays}-day trial for price: ${price.id}`,
        );
        subscriptionData.trial_end =
          calculateTrialEndUnixTimestamp(trialPeriodDays);
      }

      params = {
        ...params,
        mode: 'subscription',
        subscription_data: subscriptionData,
      };
    } else if (price.type === 'one_time') {
      params = {
        ...params,
        mode: 'payment',
      };
    }

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error(err);
      throw new Error('Unable to create checkout session.');
    }

    // Instead of returning a Response, just return the data or error.
    if (session) {
      return { sessionId: session.id };
    } else {
      throw new Error('Unable to create checkout session.');
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          'Please try again later or contact a system administrator.',
        ),
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.',
        ),
      };
    }
  }
}

export async function createStripePortal(user: User, currentPath: string) {
  try {
    if (!user) {
      throw new Error('Could not get user session.');
    }
    const customer = await getUserStripeCustomerId(user);

    if (!customer) {
      throw new Error('Could not get customer.');
    }

    try {
      const { url, ...rest } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL(PLATFORM.ACCOUNT),
      });
      if (!url) {
        throw new Error('Could not create billing portal');
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error('Could not create billing portal');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        'Please try again later or contact a system administrator.',
      );
    } else {
      return getErrorRedirect(
        currentPath,
        'An unknown error occurred.',
        'Please try again later or contact a system administrator.',
      );
    }
  }
}

export async function addPaymentMethodIfNotExists(
  stripeCustomerId: string,
  paymentMethodId: string,
  redirectPath = PLATFORM.ACCOUNT,
) {
  // Check for duplicate payment methods using fingerprint
  const paymentMethods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: 'card',
  });
  const paymentMethod = (await stripe.paymentMethods.retrieve(
    paymentMethodId,
  )) as Stripe.PaymentMethod;

  if (!paymentMethod) {
    return;
  }
  const existingPaymentMethod = paymentMethods.data.find(
    (method) => method.card?.fingerprint === paymentMethod.card?.fingerprint,
  );

  if (existingPaymentMethod) {
    throw new Error('Payment method already exists');
  }

  try {
    // SetupIntent for card validation
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      confirm: true,
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      return_url: getURL(redirectPath),
    });

    if (setupIntent.status === 'succeeded') {
      console.log('Card validated successfully');
      const attachedPaymentMethod = await stripe.paymentMethods.attach(
        paymentMethod.id,
        { customer: stripeCustomerId },
      );
      return attachedPaymentMethod;
    } else {
      console.error(
        'Error validating card:',
        setupIntent.last_setup_error?.message,
      );
      throw new Error(
        'Invalid card details or could not be confirmed. Please try again.',
      );
    }
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    throw new Error(
      error?.message || 'An error occurred while adding the payment method',
    );
  }
}
