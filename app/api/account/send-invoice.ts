import { BillingService } from '@/shared/utils/api/billing-service';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/shared/utils/supabase/server';
import { chunk } from '@/shared/utils/helpers';
import { User } from '@supabase/supabase-js';

const BATCH_SIZE = 50;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const currentDate = new Date();
    const lastMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );

    if (currentDate.getDate() === lastMonthDate.getDate()) {
      console.log('Skipping invoice generation for current month');
      return res.status(200).json({ message: 'Invoice generation skipped' });
    }

    const supabase = createClient();
    const { data: allUsers, error: fetchError } = await supabase
      .from('users')
      .select('*');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('No users found');
      return res.status(200).json({ message: 'No users found' });
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
            await billingService.sendInvoiceToUser(
              usage.totalMonthlyUsage,
              user as unknown as User,
            );
          }),
        );
      }),
    );

    res.status(200).json({ message: 'Invoice generation successful' });
  } catch (error) {
    console.error('Error sending invoices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
