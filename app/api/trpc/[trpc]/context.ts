import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types_db';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
const createContext = async function (opts: FetchCreateContextFnOptions) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
  const session = await supabase.auth.getSession();

  return {
    session,
    supabase: supabaseAdmin,
    ...opts,
  };
};
export default createContext;
export type Context = Awaited<ReturnType<typeof createContext>>;
