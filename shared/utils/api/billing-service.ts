import { stripe } from '@/shared/utils/stripe/config';
import {
  createOrRetrieveStripeCustomer,
  supabaseAdmin,
} from '../supabase/admin';
import { User } from '@supabase/supabase-js';

export class BillingService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async calculateTotalMonthlyUsage(month: Date): Promise<{
    status: number;
    message: string;
    user: { totalCost: number; id: string };
    organizations: {
      name?: string;
      organizationId: string;
      totalCost: number;
      ownerId: string;
    }[];
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

      // Get user activities (excluding organization activities)
      const { data: userActivities, error: userError } = await supabaseAdmin
        .from('swarms_cloud_api_activities')
        .select('invoice_total_cost')
        .eq('user_id', this.userId)
        .is('organization_id', null)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);

      if (userError) {
        console.error('Error fetching user activities:', userError);
        return {
          status: 500,
          message: 'Internal server error',
          user: { totalCost: 0, id: this.userId },
          organizations: [],
        };
      }

      const userTotal = userActivities.reduce(
        (acc, item) => acc + (item.invoice_total_cost ?? 0),
        0,
      );

      // Get organization activities
      const { data: organizationActivities, error: orgError } =
        await supabaseAdmin
          .from('swarms_cloud_api_activities')
          .select('invoice_total_cost, organization_id')
          .not('organization_id', 'is', null)
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);

      if (orgError) {
        console.error('Error fetching organization activities:', orgError);
        return {
          status: 500,
          message: 'Internal server error',
          user: { totalCost: Number(userTotal), id: this.userId },
          organizations: [],
        };
      }

      const organizations: {
        organizationId: string;
        totalCost: number;
        ownerId: string;
        name?: string;
      }[] = [];

      // Accumulate organization data
      for (const activity of organizationActivities) {
        const organizationId = activity.organization_id;
        let existingOrg = organizations.find(
          (org) => org.organizationId === organizationId,
        );

        if (existingOrg) {
          existingOrg.totalCost += activity.invoice_total_cost || 0;
        } else {
          // Fetch owner ID for the organization
          const { data: ownerData, error: ownerError } = await supabaseAdmin
            .from('swarms_cloud_organizations')
            .select('owner_user_id, name')
            .eq('id', organizationId ?? '')
            .single();

          if (ownerError) {
            console.error('Error fetching owner ID:', ownerError);
            continue;
          }

          if (ownerData) {
            organizations.push({
              organizationId: organizationId ?? '',
              name: ownerData.name ?? '',
              totalCost: activity.invoice_total_cost || 0,
              ownerId: ownerData.owner_user_id ?? '',
            });
          } else {
            console.error('Organization not found for ID:', organizationId);
          }
        }
      }

      return {
        status: 200,
        message: 'Success',
        user: { totalCost: Number(userTotal), id: this.userId },
        organizations,
      };
    } catch (error) {
      console.error('Error calculating total monthly usage:', error);
      return {
        status: 500,
        message: 'Internal server error',
        user: { totalCost: 0, id: this.userId },
        organizations: [],
      };
    }
  }

  async sendInvoiceToUser(
    totalAmount: number,
    user: User,
    message = 'Monthly API Usage billing',
  ): Promise<void> {
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
        description: message,
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
            total_montly_cost: parseFloat(totalAmount.toFixed(5)),
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

  async getAllBillingTransactions(): Promise<{
    status: number;
    message: string;
    transactions?: any[] | null;
  }> {
    try {
      if (!this.userId) {
        return { status: 400, message: 'User session not found' };
      }

      const { data: transactions, error } = await supabaseAdmin
        .from('swarm_cloud_billing_transcations')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching billing transactions:', error);
        return {
          status: 400,
          message: 'Error fetching billing transactions',
        };
      }

      if (transactions && transactions.length > 0) {
        return {
          status: 200,
          message: 'Success',
          transactions,
        };
      }

      return {
        status: 404,
        message: 'No billing transactions found',
        transactions: null,
      };
    } catch (error) {
      console.error('Error fetching billing transactions:', error);
      return {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  async checkInvoicePaymentStatus(): Promise<{
    status: number;
    message: string;
    is_paid: boolean;
    unpaidInvoiceId?: string | null;
  }> {
    try {
      // Retrieve all billing transactions
      const { status, message, transactions } = await this.getAllBillingTransactions();

      if (status !== 200 || !transactions) {
        return {
          status,
          message,
          is_paid: false,
        };
      }

      // Check each transaction's invoice status
      for (const transaction of transactions) {
        const { invoice_id } = transaction;
        if (!invoice_id) continue;

        const invoice = await stripe.invoices.retrieve(invoice_id);

        if (invoice?.due_date) {
          const dueDate = new Date(invoice.due_date * 1000); // Convert due_date to milliseconds
          const currentDate = new Date();

          if (currentDate.getTime() > dueDate.getTime() && !invoice.paid) {
            return {
              status: 200,
              message: `Found unpaid invoice with passed due date. Invoice ID: ${invoice_id}.`,
              is_paid: false,
              unpaidInvoiceId: invoice_id,
            };
          }
        }
      }

      // If no unpaid invoices with passed due dates were found
      return {
        status: 200,
        message: 'All invoices are paid or due dates have not passed',
        is_paid: true,
        unpaidInvoiceId: null,
      };
    } catch (error) {
      console.error('Error checking invoice payment status:', error);
      return {
        status: 500,
        message: 'Internal server error',
        is_paid: false,
        unpaidInvoiceId: null,
      };
    }
  }
}
