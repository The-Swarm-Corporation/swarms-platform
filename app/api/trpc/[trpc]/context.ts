import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { cookies } from 'next/headers';
import { Database } from '@/types_db';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { createServerClient } from '@supabase/ssr';

const createContext = async (opts: FetchCreateContextFnOptions) => {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
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

  const session = await supabase.auth.getUser();

  return {
    session,
    supabase: supabaseAdmin,
    ...opts,
  };
};

export default createContext;
export type Context = Awaited<ReturnType<typeof createContext>>;
