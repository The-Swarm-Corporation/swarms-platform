import { NextApiRequest } from 'next';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { createClientFromRequest } from '../supabase/server';

export interface AuthResult {
  isAuthenticated: boolean;
  userId: string | null;
  authMethod: 'api_key' | 'supabase' | 'none';
  status: number;
  message: string;
  apiKeyId?: string;
}

export interface UserInfo {
  id: string;
  email?: string;
  authMethod: 'api_key' | 'supabase';
  apiKeyId?: string;
}

/**
 * Enhanced Hybrid Authentication Guard
 * Supports both API key authentication and Supabase browser authentication
 * Provides flexible authentication for both programmatic and web access
 */
export class HybridAuthGuard {
  private apiKey: string | null = null;
  private userId: string | null = null;
  private apiKeyRecordId: string | null = null;
  private authMethod: 'api_key' | 'supabase' | 'none' = 'none';

  constructor(private req: NextApiRequest) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      this.apiKey = authHeader.split(' ')[1];
    }
  }

  private async authenticateWithApiKey(): Promise<AuthResult> {
    if (!this.apiKey) {
      return {
        isAuthenticated: false,
        userId: null,
        authMethod: 'none',
        status: 401,
        message: 'API Key is missing',
      };
    }

    try {
      // Validate API key
      const { data: apiKeyInfo, error } = await supabaseAdmin
        .from('swarms_cloud_api_keys')
        .select('id, user_id, name, is_deleted, created_at')
        .eq('key', this.apiKey)
        .neq('is_deleted', true)
        .maybeSingle();

      if (error || !apiKeyInfo?.id) {
        return {
          isAuthenticated: false,
          userId: null,
          authMethod: 'none',
          status: 401,
          message: 'Invalid or expired API Key',
        };
      }

      this.apiKeyRecordId = apiKeyInfo.id;
      this.userId = apiKeyInfo.user_id;
      this.authMethod = 'api_key';

      if (!this.userId) {
        return {
          isAuthenticated: false,
          userId: null,
          authMethod: 'none',
          status: 404,
          message: 'User associated with API key not found',
        };
      }

      return {
        isAuthenticated: true,
        userId: this.userId,
        authMethod: 'api_key',
        status: 200,
        message: 'API Key authentication successful',
        apiKeyId: this.apiKeyRecordId,
      };
    } catch (error) {
      console.error('API Key authentication error:', error);
      return {
        isAuthenticated: false,
        userId: null,
        authMethod: 'none',
        status: 500,
        message: 'API Key authentication failed',
      };
    }
  }

  private async authenticateWithSupabase(): Promise<AuthResult> {
    try {
      const supabase = createClientFromRequest(this.req);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return {
          isAuthenticated: false,
          userId: null,
          authMethod: 'none',
          status: 401,
          message: 'Supabase authentication failed',
        };
      }

      this.userId = user.id;
      this.authMethod = 'supabase';

      return {
        isAuthenticated: true,
        userId: user.id,
        authMethod: 'supabase',
        status: 200,
        message: 'Supabase authentication successful',
      };
    } catch (error) {
      console.error('Supabase authentication error:', error);
      return {
        isAuthenticated: false,
        userId: null,
        authMethod: 'none',
        status: 500,
        message: 'Supabase authentication failed',
      };
    }
  }

  async authenticate(): Promise<AuthResult> {
    if (this.apiKey) {
      const apiKeyResult = await this.authenticateWithApiKey();
      if (apiKeyResult.isAuthenticated) {
        return apiKeyResult;
      }
    }

    const supabaseResult = await this.authenticateWithSupabase();
    return supabaseResult;
  }

  async optionalAuthenticate(): Promise<AuthResult> {
    const result = await this.authenticate();

    if (!result.isAuthenticated) {
      return {
        isAuthenticated: false,
        userId: null,
        authMethod: 'none',
        status: 200,
        message: 'No authentication provided',
      };
    }

    return result;
  }

  getUserInfo(): UserInfo | null {
    if (!this.userId || this.authMethod === 'none') {
      return null;
    }

    return {
      id: this.userId,
      authMethod: this.authMethod,
      ...(this.apiKeyRecordId && { apiKeyId: this.apiKeyRecordId }),
    };
  }

  getUserId(): string | null {
    return this.userId;
  }

  getAuthMethod(): 'api_key' | 'supabase' | 'none' {
    return this.authMethod;
  }
}

export async function authenticateRequest(
  req: NextApiRequest,
): Promise<AuthResult> {
  const guard = new HybridAuthGuard(req);
  return await guard.authenticate();
}

export async function optionalAuthenticateRequest(
  req: NextApiRequest,
): Promise<AuthResult> {
  const guard = new HybridAuthGuard(req);
  return await guard.optionalAuthenticate();
}
