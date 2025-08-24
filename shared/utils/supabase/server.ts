import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextApiRequest } from 'next';
import { Database } from '@/types_db';

// For Pages Router API routes
export function createClientFromRequest(req: NextApiRequest) {
  const cookieHeader = req.headers.cookie || '';
  const cookieMap = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  const cookieStore = {
    getAll() {
      return Object.entries(cookieMap).map(([name, value]) => ({ name, value }));
    },
    set(name: string, value: string, options?: any) {
      // In API routes, we can't set cookies directly, so we'll just store them
      cookieMap[name] = value;
    },
  };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            console.log(error);
          }
        },
      },
    },
  );
}

// For App Router server components and route handlers
export async function createClient() {
  try {
    const cookieStore = await cookies();
    
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch (error) {
              console.log(error);
            }
          },
        },
      },
    );
  } catch (error) {
    // Fallback for when cookies() is not available
    const cookieStore = {
      getAll() {
        return [];
      },
      set(name: string, value: string, options?: any) {
        // No-op for fallback
      },
    };

    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch (error) {
              console.log(error);
            }
          },
        },
      },
    );
  }
}
