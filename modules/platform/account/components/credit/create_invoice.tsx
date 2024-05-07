import Stripe from 'stripe';
import cron from 'node-cron';
import fetchStripeCustomerId from './user_id_to_stripe_id';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export type RequestBody = {
  amount: number;
  customerId: string;
  userId: string;
};

export type ApiResponse = {
  message: string;
  success: boolean;
};

// Schedule invoice created
export async function createAndSendInvoice(amount: number, userId: string) {
  try {
    // Fetch customer ID
    let customerId: string = (await fetchStripeCustomerId(userId)) as string;

    // Create invoice
    await stripe.invoiceItems.create({
      customer: customerId,
      amount,
      currency: 'usd',
      description: `Monthly billing for user ID ${userId}`,
    });

    // Create and send the invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
    });

    await stripe.invoices.sendInvoice(invoice.id);

    return {
      message: 'Invoice created and sent',
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Internal server error',
      success: false,
    };
  }
}
