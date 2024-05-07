// import type { NextApiRequest, NextApiResponse } from 'next';
// import Stripe from 'stripe';
// import cron from 'node-cron';
// import {
//   createAndSendInvoice,
//   ApiResponse,
//   RequestBody,
// } from '@/modules/platform/account/components/credit/create_invoice';

// /**
//  * Handles the API request to charge a customer.
//  *
//  * @param req - The NextApiRequest object representing the incoming request.
//  * @param res - The NextApiResponse object representing the outgoing response.
//  * @returns A Promise that resolves to the response JSON object.
//  */
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<ApiResponse>,
// ) {
//   try {
//     if (req.method != 'POST') {
//       return res.status(405).json({
//         message: 'Method not allowed',
//         success: false,
//       });
//     }

//     const { amount, customerId, userId } = req.body as RequestBody;

//     // Schedule invoice created
//     cron.schedule('0 0 1 * *', () => {
//       createAndSendInvoice(amount, customerId, userId);
//       console.log('Invoice created and sent');
//     });

//     res.status(200).json({
//       message: 'Invoice scheduled',
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: 'Internal server error',
//       success: false,
//     });
//   }
// }
