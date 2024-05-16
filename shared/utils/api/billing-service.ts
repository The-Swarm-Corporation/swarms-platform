import Decimal from 'decimal.js';
import { stripe } from '@/shared/utils/stripe/config';
import {
  createOrRetrieveStripeCustomer,
  getUserCredit,
  getUserCreditPlan,
  supabaseAdmin,
} from '../supabase/admin';
import { User } from '@supabase/supabase-js';

export class BillingService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getRemainingCredit(): Promise<{
    status: number;
    message: string;
    remainingCredit: number;
    credit_plan: string;
  }> {
    try {
      const { credit, free_credit } = await getUserCredit(this.userId);
      const credit_plan = await getUserCreditPlan(this.userId);

      const remainingCredit = credit + free_credit;
      return {
        status: 200,
        message: 'Success',
        remainingCredit,
        credit_plan,
      };
    } catch (error) {
      console.error('Error fetching remaining credit:', error);
      return {
        status: 500,
        message: 'Internal server error',
        remainingCredit: 0,
        credit_plan: 'default',
      };
    }
  }

  async calculateRemainingCredit(totalAPICost: number): Promise<{
    status: number;
    message: string;
    newCredit: number;
  }> {
    if (totalAPICost <= 0) {
      return {
        status: 400,
        message: 'Invalid total API cost',
        newCredit: 0,
      };
    }

    try {
      const { remainingCredit } = await this.getRemainingCredit();

      const decimalTotalAPICost = new Decimal(totalAPICost);
      const decimalCurrentCredit = new Decimal(remainingCredit);
      const newCredit = decimalCurrentCredit
        .minus(decimalTotalAPICost)
        .toNumber();

      await supabaseAdmin.from('swarms_cloud_users_credits').upsert(
        {
          user_id: this.userId,
          credit: newCredit,
        },
        {
          onConflict: 'user_id',
        },
      );

      return {
        status: 200,
        message: 'Remaining credit calculated successfully',
        newCredit,
      };
    } catch (error) {
      console.error('Error calculating remaining credit:', error);
      return { status: 500, message: 'Internal server error', newCredit: 0 };
    }
  }

  async calculateTotalMonthlyUsageForUser(month: Date): Promise<{
    status: number;
    message: string;
    totalMonthlyUsage: number;
  }> {
    try {
      const monthStart = new Date(
        month.getFullYear(),
        month.getMonth(),
        1,
      ).toISOString();
      const monthEnd = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
      ).toISOString();

      const { data, error } = await supabaseAdmin
        .from('swarms_cloud_api_activities')
        .select('total_cost')
        .eq('user_id', this.userId)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);

      if (error) {
        console.error('Error calculating total monthly usage:', error);
        return {
          status: 500,
          message: 'Internal server error',
          totalMonthlyUsage: 0,
        };
      }

      const totalMonthlyUsage = data
        .reduce((acc, item) => acc + (item.total_cost ?? 0), 0)
        .toFixed(2);

      return {
        status: 200,
        message: 'Success',
        totalMonthlyUsage: Number(totalMonthlyUsage),
      };
    } catch (error) {
      console.error('Error calculating total monthly usage:', error);
      return {
        status: 500,
        message: 'Internal server error',
        totalMonthlyUsage: 0,
      };
    }
  }

  async sendInvoiceToUser(totalAmount: number, user: User): Promise<void> {
    if (totalAmount <= 0) return;

    if (!user) {
      throw new Error('User session not found');
    }

    try {
      const customerId = await createOrRetrieveStripeCustomer({
        email: user.email ?? '',
        uuid: user.id,
      });

      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      const invoice = await stripe.invoices.create({
        customer: customerId,
        description: `Monthly API Usage billing for ${user.email}`,
        collection_method: 'send_invoice',
        due_date: Math.floor(Date.now() / 1000) + 72 * 60 * 60, // Due date (72 hours from now)
      });

      let invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        amount: Number(totalAmount) * 100,
        currency: 'usd',
        invoice: invoice.id,
        description: `Monthly API Usage billing for user ${user.email} with invoice ID ${invoice.id}`,
      });

      const billingTransactions = await supabaseAdmin
        .from('swarm_cloud_billing_transcations')
        .insert([
          {
            user_id: user.id,
            total_montly_cost: parseFloat(totalAmount.toFixed(2)),
            stripe_customer_id: customerId,
            invoice_id: invoice.id,
          },
        ]);

      if (billingTransactions.error) {
        console.error(
          'Error inserting billing transaction:',
          billingTransactions.error.message,
        );
        throw new Error('Could not insert billing transaction');
      }

      await stripe.invoices.sendInvoice(invoice.id);
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Could not generate invoice');
    }
  }

  async getLatestBillingTransaction(): Promise<{
    status: number;
    message: string;
    invoiceId?: string | null;
  }> {
    try {
      if (!this.userId) {
        return { status: 400, message: 'User session not found' };
      }

      const { data: latestTransaction, error } = await supabaseAdmin
        .from('billing_transactions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest billing transaction:', error);
        return {
          status: 400,
          message: 'Error fetching latest billing transaction',
        };
      }

      if (latestTransaction && latestTransaction.invoice_id)
        return {
          status: 200,
          message: 'Success',
          invoiceId: latestTransaction.invoice_id,
        };

      return {
        status: 400,
        message: 'No latest billing transaction found',
        invoiceId: null,
      };
    } catch (error) {
      console.error('Error fetching latest billing transaction:', error);
      return {
        status: 400,
        message: 'Error fetching latest billing transaction',
      };
    }
  }

  async checkLastInvoicePaymentStatus(): Promise<{
    status: number;
    message: string;
    is_paid: boolean;
    invoiceId?: string | null;
  }> {
    try {
      // Retrieve latest billing transaction
      const latestTransaction = await this.getLatestBillingTransaction();

      // If no invoiceId is found, return true (since no payment is needed)
      if (!latestTransaction.invoiceId) {
        return {
          status: 200,
          message: 'No invoiceId found',
          invoiceId: null,
          is_paid: true,
        };
      }

      // Retrieve invoice payment status using the invoiceId
      const invoices = await stripe.invoices.retrieve(
        latestTransaction.invoiceId,
      );

      // Check if the due_date has passed
      let isDueDatePassed: boolean;

      if (invoices?.due_date) {
        const dueDate = new Date(invoices.due_date * 1000); // Convert due_date to milliseconds
        const currentDate = new Date();
        isDueDatePassed = currentDate.getTime() > dueDate.getTime();
      } else {
        // If due_date is null or undefined, consider it as passed to prevent blocking user
        isDueDatePassed = true;
      }

      // If due_date has not passed, return true (since no payment is needed)
      if (!isDueDatePassed) {
        return {
          status: 200,
          message: 'Due date has not passed yet',
          is_paid: true,
          invoiceId: null,
        };
      }

      return {
        status: 200,
        message: 'Invoice payment status has been generated',
        is_paid: !!invoices.paid,
        invoiceId: null,
      };
    } catch (error) {
      console.error('Error checking invoice payment status:', error);
      return {
        status: 500,
        message: 'Internal server error',
        is_paid: false,
        invoiceId: null,
      };
    }
  }
}
