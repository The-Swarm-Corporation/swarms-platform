import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { Database } from '@/types_db';

export async function GET(req: Request) {
  try {
    // Get API key from headers
    const headersList = await headers();
    const apiKey = headersList.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          code: 'AUTH_001',
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
          code: 'AUTH_002',
          message: 'Invalid API key'
        }),
        { status: 401 }
      );
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Max 100 items per page
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from('ai_agent_transactions')
      .select('*', { count: 'exact' })
      .eq('agent_id', agent.id);

    // Add filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('transaction_type', type);
    }

    // Get total metrics (regardless of pagination)
    const { data: totalMetrics } = await supabase
      .from('ai_agent_transactions')
      .select('amount, transaction_type, status')
      .eq('agent_id', agent.id)
      .eq('status', 'completed');

    // Calculate metrics
    const metrics = {
      totalTransactions: totalMetrics?.length || 0,
      totalAmountSent: totalMetrics
        ?.filter(tx => tx.transaction_type === 'send' && tx.status === 'completed')
        .reduce((sum, tx) => sum + (parseFloat(tx.amount.toString()) || 0), 0) || 0,
      totalSuccessfulTransactions: totalMetrics
        ?.filter(tx => tx.status === 'completed').length || 0,
      totalFailedTransactions: totalMetrics
        ?.filter(tx => tx.status === 'failed').length || 0
    };

    // Get paginated transactions
    const { data: transactions, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return new Response(
        JSON.stringify({
          error: 'DATABASE_ERROR',
          code: 'DB_001',
          message: 'Failed to fetch transactions'
        }),
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transactions,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit,
            hasMore
          },
          metrics
        },
        code: 'SUCCESS_001'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get metrics error:', error);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        code: 'ERR_001',
        message: 'Failed to get metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 