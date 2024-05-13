import Decimal from 'decimal.js';
import { stripe } from '@/shared/utils/stripe/config';
import { getUserCredit, supabaseAdmin } from '../supabase/admin';
import { User } from '@supabase/supabase-js';
import { getUserStripeCustomerId } from '../stripe/server';

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
      const { credit, free_credit, credit_plan } = await getUserCredit(
        this.userId,
      );
      const remainingCredit = credit + free_credit;
      return {
        status: 200,
        message: 'Success',
        remainingCredit,
        credit_plan: credit_plan ?? 'default',
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
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

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

      const totalMonthlyUsage = data.reduce(
        (acc, item) => acc + (item.total_cost ?? 0),
        0,
      );
      return { status: 200, message: 'Success', totalMonthlyUsage };
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
    if (!user) {
      throw new Error('User session not found');
    }

    const customerId = await getUserStripeCustomerId(user);

    if (!customerId) {
      throw new Error('Customer ID not found');
    }

    try {
      const invoiceItem = await stripe.invoiceItems.create({
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

      await supabaseAdmin.from('billing_transactions').insert({
        user_id: user.id,
        total_monthly_cost: totalAmount,
        stripe_customer_id: customerId,
        invoice_id: invoice.id,
        transaction_id: invoiceItem.id,
      });

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
          message: 'Success',
          invoiceId: null,
          is_paid: true,
        };
      }

      // Retrieve invoice payment status using the invoiceId
      const { data: invoiceData, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .select('is_paid')
        .eq('id', latestTransaction.invoiceId)
        .single();

      if (invoiceError) {
        console.error('Error fetching invoice:', invoiceError);
        return {
          status: 500,
          message: 'Error fetching invoice',
          is_paid: false,
          invoiceId: latestTransaction.invoiceId,
        };
      }

      return {
        status: 200,
        message: 'Success',
        is_paid: !!invoiceData.is_paid,
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
