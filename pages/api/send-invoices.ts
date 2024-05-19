import { NextApiRequest, NextApiResponse } from 'next';
import { BillingService } from '@/shared/utils/api/billing-service';

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
      return res
        .status(200)
        .json({ message: 'Skipping invoice generation for current month' });
    }

    const user = {
      id: '34ea9ab4-b402-445d-9e16-1f630bb83b28',
      email: 'gilbertoaceville@gmail.com',
    };

    const billingService = new BillingService(user.id);
    const usage =
      await billingService.calculateTotalMonthlyUsage(lastMonthDate);

    console.dir(usage, { depth: null });

    // await billingService.sendInvoiceToUser(5, user as User);

    return res.status(200).json({ message: 'Invoice generation successful' });
  } catch (error) {
    console.error('Error sending invoices:', error);
    return res.status(500).send('Something definitely went wrong');
  }
}
