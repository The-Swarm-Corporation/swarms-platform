import { BillingService } from '@/shared/utils/api/billing-service';
import { User } from '@supabase/supabase-js';

const BATCH_SIZE = 50;

async function GET(req: Request) {
  try {
    const currentDate = new Date();
    const lastMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );

    if (currentDate.getDate() === lastMonthDate.getDate()) {
      console.log('Skipping invoice generation for current month');
      return new Response('Skipping invoice generation for current month', {
        status: 200,
      });
    }

    const user = { id: '16203c2a-9001-4b58-85b6-db2de7fb4383', email: "gilbertoaceville@gmail.com" };

    const billingService = new BillingService(user.id);

    // await billingService.sendInvoiceToUser(5, user as unknown as User);

    return new Response('Invoice generation successful', { status: 200 });
  } catch (error) {
    console.error('Error sending invoices:', error);
    return new Response('Something definitely went wrong', { status: 500 });
  }
}

export { GET };
