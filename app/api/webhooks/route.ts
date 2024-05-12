import Stripe from 'stripe';
import { stripe } from '@/shared/utils/stripe/config';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord,
  increaseUserCredit,
  upsertInvoiceRecord,
} from '@/shared/utils/supabase/admin';
import { addPaymentMethodIfNotExists } from '@/shared/utils/stripe/server';

const relevantEvents = new Set([
  'invoice.created',
  'invoice.updated',
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'payment_intent.succeeded',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'invoice.created':
        case 'invoice.updated':
          const ok = await upsertInvoiceRecord(
            event.data.object as Stripe.Invoice,
          );
          if (ok) new Response(JSON.stringify({ received: true }));
          break;

        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created',
          );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;

          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true,
            );
          } else if (
            checkoutSession.mode === 'payment' &&
            checkoutSession.status === 'complete'
          ) {
            const amount = checkoutSession?.amount_total
              ? Number(checkoutSession?.amount_total) / 100
              : 0;
            const userId = checkoutSession?.client_reference_id;
            if (userId && amount) {
              try {
                const ok = await increaseUserCredit(userId, amount);
                if (ok) {
                  // return success to stripe
                  return new Response(JSON.stringify({ received: true }));
                }
              } catch (error) {
                console.error(error);
              }
            }
          }
          if (checkoutSession.status === 'complete') {
            // Access payment method through payment intent
            const paymentIntent = await stripe.paymentIntents.retrieve(
              checkoutSession.payment_intent as string,
            );
            const paymentMethodId = paymentIntent.payment_method;
            if (paymentMethodId) {
              await addPaymentMethodIfNotExists(
                checkoutSession.customer as string,
                paymentMethodId as string,
              );
            }
          }
          break;
        default:
          console.log('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400,
        },
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
