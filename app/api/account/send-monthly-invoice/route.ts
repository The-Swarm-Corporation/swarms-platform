import { NextResponse } from 'next/server';
import { BillingService } from '@/shared/utils/api/billing-service';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { chunk } from '@/shared/utils/helpers';
import { User } from '@supabase/supabase-js';

const BATCH_SIZE = 50;

export async function GET() {
  try {
    const currentDate = new Date();
    const lastMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );

    if (currentDate.getDate() === lastMonthDate.getDate()) {
      console.log('Skipping invoice generation for current month');
      return NextResponse.json({
        message: 'Invoice generation skipped',
        status: 200,
      });
    }

    const { data: allUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 },
      );
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('No users found');
      return NextResponse.json({ message: 'No users found' }, { status: 404 });
    }

    const userBatches = chunk(allUsers, BATCH_SIZE);

    await Promise.all(
      userBatches.map(async (batch) => {
        await Promise.all(
          batch.map(async (user) => {
            const billingService = new BillingService(user.id);
            const usage =
              await billingService.calculateTotalMonthlyUsageForUser(
                lastMonthDate,
              );

            if (usage.status !== 200) {
              console.error(
                'Error calculating total monthly usage:',
                usage.message,
              );
              return new Response('Internal server error', { status: 500 });
            }

            await billingService.sendInvoiceToUser(
              usage.totalMonthlyUsage,
              user as unknown as User,
            );
          }),
        );
      }),
    );

    return NextResponse.json({
      message: 'Invoice generation successful',
      status: 200,
    });
  } catch (error) {
    console.error('Error sending invoices:', error);
    NextResponse.error();
  }
}
