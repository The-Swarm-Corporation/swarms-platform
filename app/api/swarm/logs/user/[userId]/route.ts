import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { createClient } from '@/shared/utils/supabase/client';

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;
    return user.id;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get authenticated user ID
    const authenticatedUserId = await getUserIdFromRequest(request);
    
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = params;

    // Verify the authenticated user is requesting their own logs
    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to user logs' },
        { status: 403 }
      );
    }

    // Get all API keys for this user
    const { data: apiKeys, error: apiKeysError } = await supabaseAdmin
      .from('swarms_cloud_api_keys')
      .select('key')
      .eq('user_id', userId)
      .neq('is_deleted', true);

    if (apiKeysError) {
      console.error('Error fetching API keys:', apiKeysError);
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      );
    }

    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json({
        status: 'success',
        count: 0,
        logs: []
      });
    }

    // Get all logs for all API keys belonging to this user
    const apiKeyValues = apiKeys.map(ak => ak.key);
    
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('swarms_api_logs')
      .select('*')
      .in('api_key', apiKeyValues)
      .order('created_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Transform the logs to match the expected format
    const transformedLogs = (logs || []).map(log => ({
      id: log.id,
      created_at: log.created_at,
      api_key: log.api_key,
      category: log.category,
      data: log.data
    }));

    return NextResponse.json({
      status: 'success',
      count: transformedLogs.length,
      logs: transformedLogs
    });

  } catch (error) {
    console.error('Error in user logs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
