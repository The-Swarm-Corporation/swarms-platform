import { createClient } from '@/shared/utils/supabase/server';
import Organization from '@/modules/platform/organization';

export default async function OrganizationPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return <Organization {...{ user }} />;
}
