import { NextApiRequest, NextApiResponse } from 'next';
import { BillingService } from '@/shared/utils/api/billing-service';
import { User } from '@supabase/supabase-js';
import { checkRateLimit } from '@/shared/utils/api/rate-limit';
import {
  getBillingLimit,
  getOrganizationUsage,
  userAPICluster,
} from '@/shared/utils/api/usage';
import { currentMonth } from '@/shared/constants/date';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const currentDate = new Date();
    const month = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
      1,
    );

    if (currentDate.getDate() === month.getDate()) {
      console.log('Skipping invoice generation for current month');
      return res
        .status(200)
        .json({ message: 'Skipping invoice generation for current month' });
    }

    const user = {
      id: '',
      email: 'gilbertoaceville@gmail.com',
    };

    // const data = await checkRateLimit(user.id);
    // console.log({ data });

    const billingService = new BillingService(user.id);
    // const usage =
    //   await billingService.calculateTotalMonthlyUsage(month);

    // console.dir(usage, { depth: null });

    // const invoiceDescription = `Monthly API Usage billing ${user.email}`;

    // await billingService.sendInvoiceToUser(5, user as User, invoiceDescription);

    // const invoiceStatus = await billingService.checkInvoicePaymentStatus("");

    // const cluster = await getOrganizationUsage(user.id, month);

    // const billingLimit = await getBillingLimit(user.id, month);

    const rateLimit = await checkRateLimit(user.id, 2)

    console.dir(rateLimit, { depth: null });

    return res.status(200).json({ message: 'Invoice status successful' });
  } catch (error) {
    console.error('Error sending invoices:', error);
    return res.status(500).send('Something definitely went wrong');
  }
}
