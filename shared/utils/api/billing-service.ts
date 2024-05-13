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
  }> {
    try {
      const { credit, free_credit } = await getUserCredit(this.userId);
      const remainingCredit = credit + free_credit;
      return { status: 200, message: 'Success', remainingCredit };
    } catch (error) {
      console.error('Error fetching remaining credit:', error);
      return {
        status: 500,
        message: 'Internal server error',
        remainingCredit: 0,
      };
    }
  }

  async calculateRemainingCredit(totalAPICost: number): Promise<{
    status: number;
    message: string;
    newCredit: number;
  }> {
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

  async checkInvoicePaymentStatus(invoiceId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .select('is_paid, period_end')
        .eq('user_id', this.userId)
        .eq('id', invoiceId)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        return false;
      }

      if (!data || data.is_paid === null) {
        return false;
      }

      if (data.is_paid) {
        return true;
      }

      if (data.period_end) {
        const dueDate = new Date(data.period_end);
        const currentDate = new Date();
        const daysDifference = Math.ceil(
          (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return daysDifference <= 2;
      }

      return false;
    } catch (error) {
      console.error('Error checking invoice payment status:', error);
      return false;
    }
  }
}
