import { supabaseAdmin } from '../supabase/admin';

// we use this method as patch , we added trigger for new users so their auth email will sync with postgres to users table.
export const syncUserEmail = async (id: string, email: string) => {
  if (!email || !id) return;
  try {
    const user = await supabaseAdmin
      .from('users')
      .select('id,email')
      .eq('id', id)
      .single();
    if (user.data?.id && !user.data?.email) {
      await supabaseAdmin.from('users').update({ email }).eq('id', id);
    }
  } catch (error) {
    console.error('syncUserEmail',id, error);
  }
};
