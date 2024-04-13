import { supabaseAdmin } from './admin';

type UserAccessType = 'owner' | 'reader' | 'manager';
export const getUserOrganizationRole = async (
  organizationId: string,
  userId: string
): Promise<UserAccessType | null> => {
  const org = await supabaseAdmin
    .from('swarms_cloud_organizations')
    .select('*')
    .eq('id', organizationId)
    .limit(1);

  if (!org.data?.length) {
    return null;
  }

  if (org.data?.[0].owner_user_id === userId) {
    return 'owner';
  }
  const member = await supabaseAdmin
    .from('swarms_cloud_organization_members')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .neq('is_deleted', true)
    .limit(1);

  if (member.data?.length) {
    return member.data[0].role;
  }
  return null;
};
