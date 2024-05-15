import { BillingService } from '@/shared/utils/api/billing-service';
import { createClient } from '@/shared/utils/supabase/server';
import { chunk } from '@/shared/utils/helpers';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
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

    await billingService.sendInvoiceToUser(5, user as unknown as User);

    // const { data: allUsers, error: fetchError } = await supabaseAdmin
    //   .from('users')
    //   .select('*');

    // if (fetchError) {
    //   console.error('Error fetching users:', fetchError);
    //   return new Response('Internal server error', { status: 500 });
    // }

    // if (!allUsers || allUsers.length === 0) {
    //   console.log('No users found');
    //   return new Response('No users found', { status: 404 });
    // }

    // const userBatches = chunk(allUsers, BATCH_SIZE);

    // console.log('allUsers');
    // console.log('allUsers');
    // console.log('allUsers');
    // console.log('allUsers');
    // console.dir(allUsers, { depth: null });
    // console.log('userBatches');
    // console.log('userBatches');
    // console.log('userBatches');
    // console.log('userBatches');

    // await Promise.all(
    //   userBatches.map(async (batch) => {
    //     await Promise.all(
    //       batch.map(async (user) => {
    //         const billingService = new BillingService(user.id);
    //         const usage =
    //           await billingService.calculateTotalMonthlyUsageForUser(
    //             lastMonthDate,
    //           );

    //         if (usage.status !== 200) {
    //           console.error(
    //             'Error calculating total monthly usage:',
    //             usage.message,
    //           );
    //           return new Response('Internal server error', { status: 500 });
    //         }

    //         console.log({ usage });
    //         await billingService.sendInvoiceToUser(
    //           usage.totalMonthlyUsage,
    //           user as unknown as User,
    //         );
    //       }),
    //     );
    //   }),
    // );

    return new Response('Invoice generation successful', { status: 200 });
  } catch (error) {
    console.error('Error sending invoices:', error);
    return new Response('Something definitely went wrong', { status: 500 });
  }
}

export { GET };
