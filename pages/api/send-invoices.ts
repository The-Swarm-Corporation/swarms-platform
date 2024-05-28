import { NextApiRequest, NextApiResponse } from 'next';
import { BillingService } from '@/shared/utils/api/billing-service';
import { User } from '@supabase/supabase-js';
import { checkRateLimit } from '@/shared/utils/api/rate-limit';
import { userAPICluster } from '@/shared/utils/api/usage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const currentDate = new Date();
    const lastMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );

    if (currentDate.getDate() === lastMonthDate.getDate()) {
      console.log('Skipping invoice generation for current month');
      return res
        .status(200)
        .json({ message: 'Skipping invoice generation for current month' });
    }

    const user = {
      id: '16203c2a-9001-4b58-85b6-db2de7fb4383',
      email: 'gilbertoaceville@gmail.com',
    };

    // const data = await checkRateLimit(user.id);
    // console.log({ data });

    const billingService = new BillingService(user.id);
    // const usage =
    //   await billingService.calculateTotalMonthlyUsage(lastMonthDate);

    // console.dir(usage, { depth: null });

    // const invoiceDescription = `Monthly API Usage billing ${user.email}`;

    // await billingService.sendInvoiceToUser(5, user as User, invoiceDescription);

    // const invoiceStatus = await billingService.checkInvoicePaymentStatus("");

    const cluster = await userAPICluster(user.id, lastMonthDate);

    console.dir(cluster, { depth: null });

    return res.status(200).json({ message: 'Invoice status successful' });
  } catch (error) {
    console.error('Error sending invoices:', error);
    return res.status(500).send('Something definitely went wrong');
  }
}
