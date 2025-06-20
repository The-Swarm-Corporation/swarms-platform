import mailer from '@/shared/utils/mailer';
import { formatSOLAmount } from '@/shared/utils/marketplace/commission';

interface TransactionNotificationData {
  transactionId: string;
  buyerEmail: string;
  sellerEmail: string;
  itemName: string;
  itemType: 'prompt' | 'agent';
  totalAmount: number;
  platformFee: number;
  sellerAmount: number;
  transactionSignature: string;
  buyerWalletAddress: string;
  sellerWalletAddress: string;
}

const COMMISSION_EMAIL = process.env.COMMISSION_NOTIFICATION_EMAIL || 'gilbertoaceville@gmail.com';
const PLATFORM_NAME = 'Swarms Platform';

export async function sendTransactionNotifications(data: TransactionNotificationData) {
  const mail = mailer();
  
  try {
    // Send notification to buyer
    await sendBuyerNotification(mail, data);
    
    // Send notification to seller
    await sendSellerNotification(mail, data);
    
    // Send commission notification to platform
    await sendCommissionNotification(mail, data);
    
    console.log('All transaction notifications sent successfully');
  } catch (error) {
    console.error('Failed to send transaction notifications:', error);
    throw error;
  }
}

async function sendBuyerNotification(mail: any, data: TransactionNotificationData) {
  const subject = `Purchase Confirmation - ${data.itemName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Purchase Successful! 🎉</h2>
      
      <p>Thank you for your purchase on ${PLATFORM_NAME}!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Purchase Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Item:</strong> ${data.itemName} (${data.itemType})</li>
          <li><strong>Amount Paid:</strong> ${formatSOLAmount(data.totalAmount)}</li>
          <li><strong>Transaction ID:</strong> ${data.transactionSignature}</li>
        </ul>
      </div>
      
      <p>You can now access your purchased ${data.itemType} in your account.</p>
      
      <p style="color: #666; font-size: 14px;">
        Transaction verified on Solana blockchain: 
        <a href="https://solscan.io/tx/${data.transactionSignature}" target="_blank">View on Solscan</a>
      </p>
    </div>
  `;

  await mail.sendMail({
    from: 'noreply@swarms.world',
    to: data.buyerEmail,
    subject,
    html,
  });
}

async function sendSellerNotification(mail: any, data: TransactionNotificationData) {
  const subject = `Sale Notification - ${data.itemName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Congratulations on your sale! 💰</h2>
      
      <p>Your ${data.itemType} has been purchased on ${PLATFORM_NAME}!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Sale Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Item:</strong> ${data.itemName} (${data.itemType})</li>
          <li><strong>Sale Price:</strong> ${formatSOLAmount(data.totalAmount)}</li>
          <li><strong>Your Earnings:</strong> ${formatSOLAmount(data.sellerAmount)} (90%)</li>
          <li><strong>Platform Fee:</strong> ${formatSOLAmount(data.platformFee)} (10%)</li>
          <li><strong>Transaction ID:</strong> ${data.transactionSignature}</li>
        </ul>
      </div>
      
      <p>The payment has been sent directly to your wallet: <code>${data.sellerWalletAddress}</code></p>
      
      <p style="color: #666; font-size: 14px;">
        Transaction verified on Solana blockchain: 
        <a href="https://solscan.io/tx/${data.transactionSignature}" target="_blank">View on Solscan</a>
      </p>
    </div>
  `;

  await mail.sendMail({
    from: 'noreply@swarms.world',
    to: data.sellerEmail,
    subject,
    html,
  });
}

async function sendCommissionNotification(mail: any, data: TransactionNotificationData) {
  const subject = `Commission Received - ${formatSOLAmount(data.platformFee)}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Platform Commission Received 💎</h2>
      
      <p>A new commission payment has been received on ${PLATFORM_NAME}!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Commission Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Item Sold:</strong> ${data.itemName} (${data.itemType})</li>
          <li><strong>Total Sale:</strong> ${formatSOLAmount(data.totalAmount)}</li>
          <li><strong>Commission (10%):</strong> ${formatSOLAmount(data.platformFee)}</li>
          <li><strong>Seller Earnings:</strong> ${formatSOLAmount(data.sellerAmount)}</li>
          <li><strong>Transaction ID:</strong> ${data.transactionSignature}</li>
        </ul>
      </div>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>Wallet Addresses:</h4>
        <p><strong>Buyer:</strong> <code>${data.buyerWalletAddress}</code></p>
        <p><strong>Seller:</strong> <code>${data.sellerWalletAddress}</code></p>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Transaction verified on Solana blockchain: 
        <a href="https://solscan.io/tx/${data.transactionSignature}" target="_blank">View on Solscan</a>
      </p>
    </div>
  `;

  await mail.sendMail({
    from: 'noreply@swarms.world',
    to: COMMISSION_EMAIL,
    subject,
    html,
  });
}

export async function sendCommissionSummary(period: 'daily' | 'weekly' | 'monthly', stats: {
  totalCommissions: number;
  transactionCount: number;
  topItems: Array<{ name: string; type: string; commission: number }>;
}) {
  const mail = mailer();
  
  const subject = `${period.charAt(0).toUpperCase() + period.slice(1)} Commission Summary - ${formatSOLAmount(stats.totalCommissions)}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">${period.charAt(0).toUpperCase() + period.slice(1)} Commission Summary 📊</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Summary:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Total Commissions:</strong> ${formatSOLAmount(stats.totalCommissions)}</li>
          <li><strong>Transactions:</strong> ${stats.transactionCount}</li>
          <li><strong>Average per Transaction:</strong> ${formatSOLAmount(stats.totalCommissions / stats.transactionCount)}</li>
        </ul>
      </div>
      
      ${stats.topItems.length > 0 ? `
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Top Performing Items:</h3>
          <ol>
            ${stats.topItems.map(item => `
              <li>${item.name} (${item.type}) - ${formatSOLAmount(item.commission)}</li>
            `).join('')}
          </ol>
        </div>
      ` : ''}
      
      <p style="color: #666; font-size: 14px;">
        Generated automatically by ${PLATFORM_NAME} marketplace system.
      </p>
    </div>
  `;

  await mail.sendMail({
    from: 'noreply@swarms.world',
    to: COMMISSION_EMAIL,
    subject,
    html,
  });
}
