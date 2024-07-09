import { supabaseAdmin } from '../supabase/admin';

type Options = {
  apiKey: string | null;
};

export class AuthApiGuard {
  apiKey: string | null;
  apiKeyRecordId: string | null = null;
  userId: string | null = null;

  constructor({ apiKey }: Options) {
    this.apiKey = apiKey;
  }
  async isAuthenticated(): Promise<{
    status: number;
    message: string;
  }> {
    if (!this.apiKey) {
      return { status: 401, message: 'API Key is missing' };
    }

    // api key validation
    const apiKeyInfo = await supabaseAdmin
      .from('swarms_cloud_api_keys')
      .select('*')
      .eq('key', this.apiKey)
      .neq('is_deleted', true)
      .maybeSingle();

    if (!apiKeyInfo.data?.id) {
      return { status: 401, message: 'Invalid API Key' };
    }
    this.apiKeyRecordId = apiKeyInfo.data.id;
    this.userId = apiKeyInfo.data.user_id;

    if (!this.userId) {
      return { status: 404, message: 'User is missing' };
    }

    return { status: 200, message: 'Success' };
  }

  getUserId(): string | null {
    return this.userId;
  }
}
