import Decimal from 'decimal.js';
import { stripe } from '@/shared/utils/stripe/config';
import { getUserCredit, supabaseAdmin } from '../supabase/admin';
import { User } from '@supabase/supabase-js';
import { getUserStripeCustomerId } from '../stripe/server';
import { getErrorRedirect } from '../helpers';

export class BillingService {
  userId: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getRemainingCredit(): Promise<number> {
    const { credit, free_credit } = await getUserCredit(this.userId ?? '');
    return credit + free_credit;
  }

  async calculateRemainingCredit(totalAPICost: number) {
    const { credit, free_credit } = await getUserCredit(this.userId ?? '');
    const currentCredit = credit + free_credit;

    // Convert totalAPICost and currentCredit to Decimal instances
    const decimalTotalAPICost = new Decimal(totalAPICost);
    const decimalCurrentCredit = new Decimal(currentCredit);

    // Subtract totalAPICost from currentCredit
    const newCredit = decimalCurrentCredit.minus(decimalTotalAPICost);

    // Perform upsert operation
    const response = await supabaseAdmin
      .from('swarms_cloud_users_credits')
      .upsert(
        {
          user_id: this.userId ?? '',
          credit: newCredit.toNumber(), // Convert Decimal back to number
        },
        {
          onConflict: 'user_id',
        },
      );

    if (response.error) {
      throw new Error(response.error.message);
    } else {
      console.log('Upsert operation successful');
      // Return the remaining credit balance
      return newCredit.toNumber();
    }
  }

  async calculateTotalMonthlyUsageForUser(month: Date): Promise<number> {
    try {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const { data, error } = await supabaseAdmin
        .from('swarms_cloud_api_activities')
        .select('total_cost')
        .eq('user_id', this.userId ?? '')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);

      if (error) {
        console.error('Error calculating total monthly usage:', error.message);
        return 0;
      }

      const totalMonthlyUsage = data.reduce(
        (acc, item) => acc + (item.total_cost ?? 0),
        0,
      );

      return totalMonthlyUsage;
    } catch (error) {
      console.error('Error calculating total monthly usage:', error);
      return 0;
    }
  }

  async sendInvoiceToUser(totalAmount: number, user: User, currentPath = '/') {
    if (totalAmount <= 0) return;

    try {
      if (!user) {
        throw new Error('Could not get user session.');
      }
      const customerId = await getUserStripeCustomerId(user);

      if (!customerId) {
        throw new Error('Could not get customer.');
      }

      try {
        let invoiceItem = await stripe.invoiceItems.create({
          customer: customerId,
          amount: totalAmount * 100,
          currency: 'usd',
          description: `Monthly billing for user ID ${user.id}`,
        });

        const invoice = await stripe.invoices.create({
          customer: customerId,
          auto_advance: true,
          due_date: Math.floor(Date.now() / 1000) + 72 * 60 * 60, // Due date (72 hours from now)
        });

        const billingTransactions = await supabaseAdmin
          .from('billing_transactions')
          .insert([
            {
              user_id: user.id,
              total_montly_cost: totalAmount,
              stripe_customer_id: customerId,
              invoice_id: invoice.id,
              transaction_id: invoiceItem.id,
            },
          ]);

        if (billingTransactions.error) {
          console.log('error', billingTransactions.error);

          return {
            status: 500,
            message: 'Internal Server Error',
          };
        }

        await stripe.invoices.sendInvoice(invoice.id);
      } catch (err) {
        console.error(err);
        throw new Error('Could not generate invoice.');
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

  async checkInvoicePaymentStatus(invoiceId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .select('is_paid, period_end')
        .eq('user_id', this.userId ?? '')
        .eq('id', invoiceId)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error.message);
        return false;
      }

      if (!data || data.is_paid === null) {
        return false;
      }

      if (data.is_paid) {
        return true;
      }

      // Check if the due date has passed
      if (data.period_end) {
        const dueDate = new Date(data.period_end);
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - dueDate.getTime();
        const daysDifference = Math.ceil(
          timeDifference / (1000 * 60 * 60 * 24),
        );
        return daysDifference > 2 ? false : true;
      } else {
        return false; // If period_end is null, we can assume invoice is overdue
      }
    } catch (error) {
      console.error('Error checking invoice payment status:', error);
      return false;
    }
  }
}
