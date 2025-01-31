'use server';

import { createClient } from '@/shared/utils/supabase/server';

export const getUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
