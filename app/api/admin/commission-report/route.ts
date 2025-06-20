import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { formatSOLAmount } from '@/shared/utils/marketplace/commission';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // days
    const format = searchParams.get('format') || 'json';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get commission data
    const { data: transactions, error } = await supabase
      .from('marketplace_transactions')
      .select(`
        *,
        buyer:users!marketplace_transactions_buyer_id_fkey(full_name, email),
        seller:users!marketplace_transactions_seller_id_fkey(full_name, email)
      `)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate totals
    const totalCommissions = transactions?.reduce((sum, tx) => sum + tx.platform_fee, 0) || 0;
    const totalVolume = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const transactionCount = transactions?.length || 0;

    // Group by item type
    const byItemType = transactions?.reduce((acc, tx) => {
      const type = tx.item_type;
      if (!acc[type]) {
        acc[type] = { count: 0, volume: 0, commission: 0 };
      }
      acc[type].count++;
      acc[type].volume += tx.amount;
      acc[type].commission += tx.platform_fee;
      return acc;
    }, {} as Record<string, { count: number; volume: number; commission: number }>);

    // Daily breakdown
    const dailyBreakdown = transactions?.reduce((acc, tx) => {
      const date = new Date(tx.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, volume: 0, commission: 0 };
      }
      acc[date].count++;
      acc[date].volume += tx.amount;
      acc[date].commission += tx.platform_fee;
      return acc;
    }, {} as Record<string, { count: number; volume: number; commission: number }>);

    const report = {
      period: `${period} days`,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        totalCommissions,
        totalVolume,
        transactionCount,
        averageCommissionPerTransaction: transactionCount > 0 ? totalCommissions / transactionCount : 0,
        commissionRate: totalVolume > 0 ? (totalCommissions / totalVolume) * 100 : 0
      },
      breakdown: {
        byItemType,
        daily: dailyBreakdown
      },
      recentTransactions: transactions?.slice(0, 10).map(tx => ({
        id: tx.id,
        date: tx.created_at,
        itemType: tx.item_type,
        amount: tx.amount,
        commission: tx.platform_fee,
        buyer: tx.buyer?.full_name || 'Unknown',
        seller: tx.seller?.full_name || 'Unknown',
        signature: tx.transaction_signature
      }))
    };

    if (format === 'html') {
      const html = generateHTMLReport(report);
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error('Commission report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate commission report' },
      { status: 500 }
    );
  }
}

function generateHTMLReport(report: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Commission Report - Swarms Platform</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        .card .value { font-size: 24px; font-weight: bold; color: #10B981; }
        .section { margin-bottom: 30px; }
        .section h2 { border-bottom: 2px solid #10B981; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-completed { color: #10B981; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Commission Report</h1>
          <p>Period: ${report.period} (${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()})</p>
        </div>

        <div class="summary">
          <div class="card">
            <h3>Total Commissions</h3>
            <div class="value">${formatSOLAmount(report.summary.totalCommissions)}</div>
          </div>
          <div class="card">
            <h3>Total Volume</h3>
            <div class="value">${formatSOLAmount(report.summary.totalVolume)}</div>
          </div>
          <div class="card">
            <h3>Transactions</h3>
            <div class="value">${report.summary.transactionCount}</div>
          </div>
          <div class="card">
            <h3>Avg Commission</h3>
            <div class="value">${formatSOLAmount(report.summary.averageCommissionPerTransaction)}</div>
          </div>
        </div>

        <div class="section">
          <h2>📊 Breakdown by Item Type</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Transactions</th>
                <th>Volume</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(report.breakdown.byItemType || {}).map(([type, data]: [string, any]) => `
                <tr>
                  <td style="text-transform: capitalize;">${type}</td>
                  <td>${data.count}</td>
                  <td>${formatSOLAmount(data.volume)}</td>
                  <td>${formatSOLAmount(data.commission)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>📅 Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Buyer</th>
                <th>Seller</th>
              </tr>
            </thead>
            <tbody>
              ${(report.recentTransactions || []).map((tx: any) => `
                <tr>
                  <td>${new Date(tx.date).toLocaleDateString()}</td>
                  <td style="text-transform: capitalize;">${tx.itemType}</td>
                  <td>${formatSOLAmount(tx.amount)}</td>
                  <td>${formatSOLAmount(tx.commission)}</td>
                  <td>${tx.buyer}</td>
                  <td>${tx.seller}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>🔗 Platform Wallet: ${process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS || 'Not configured'}</p>
          <p>📧 Commission Notifications: ${process.env.COMMISSION_NOTIFICATION_EMAIL || 'gilbertoaceville@gmail.com'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
