import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { Database } from '@/types_db';

// Move function declaration outside
async function getAgentTransactions(
  agentId: string,
  supabase: SupabaseClient<Database>,
  startDate?: string,
  endDate?: string,
  status?: string,
  type?: string,
  page: number = 1,
  pageSize: number = 10
) {
  let baseQuery = supabase
    .from('ai_agent_transactions')
    .select(`
      id,
      transaction_hash,
      amount,
      recipient,
      status,
      created_at,
      agent_id
    `)
    .or(`agent_id.eq.${agentId},recipient.in.(${
      supabase
        .from('ai_agent_wallets')
        .select('public_key')
        .eq('agent_id', agentId)
        .eq('status', 'active')
    })`);

  // Add filters if provided
  if (startDate) {
    baseQuery = baseQuery.gte('created_at', startDate);
  }
  if (endDate) {
    baseQuery = baseQuery.lte('created_at', endDate);
  }
  if (status) {
    baseQuery = baseQuery.eq('status', status);
  }

  // Add pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  baseQuery = baseQuery
    .order('created_at', { ascending: false })
    .range(from, to);
  const { data: transactions, count } = await baseQuery;

  if (!transactions) {
    throw new Error('No transactions found');
  }

  // Transform the results to include the correct transaction type
  const transformedTransactions = transactions.map((tx: any) => ({
    ...tx,
    transaction_type: tx.agent_id === agentId ? 'send' : 'received'
  }));

  // Apply type filter after transformation if needed
  const filteredTransactions = type 
    ? transformedTransactions.filter((tx:any) => tx.transaction_type === type)
    : transformedTransactions;

  return {
    transactions: filteredTransactions,
    pagination: {
      total: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    }
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const headersList = await headers();
    const apiKey = headersList.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          message: 'Missing API key'
        }),
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Validate API key and get agent
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('id')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .single();

    if (!agent) {
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          message: 'Invalid API key'
        }),
        { status: 401 }
      );
    }

    const { transactions, pagination } = await getAgentTransactions(
      agent.id, 
      supabase, 
      startDate, 
      endDate, 
      status, 
      type,
      page,
      pageSize
    );

    // Calculate metrics from the filtered transactions
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const sentTransactions = transactions.filter(tx => tx.transaction_type === 'send');
    const receivedTransactions = transactions.filter(tx => tx.transaction_type === 'received');
    const totalSent = sentTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalReceived = receivedTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transactions,
          pagination,
          metrics: {
            totalTransactions,
            totalAmount,
            sentTransactions: sentTransactions.length,
            receivedTransactions: receivedTransactions.length,
            totalSent,
            totalReceived
          }
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get metrics error:', error);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: 'Failed to get metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}

