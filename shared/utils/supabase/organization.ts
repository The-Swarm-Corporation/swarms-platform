import { ORG_MEMBER_INVITE_TIMEOUT } from '@/shared/constants/common';
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
    .filter('is_deleted', 'not.is', 'true')
    .limit(1);

  if (member.data?.length) {
    return member.data[0].role;
  }
  return null;
};

export const submitInviteCode = async (code: string, userId: string) => {
  const invite = await supabaseAdmin
    .from('swarms_cloud_organization_member_invites')
    .select('*')
    .eq('secret_code', code)
    .eq('status', 'waiting')
    .limit(1);

  if (
    (invite.data?.length && invite.data[0].user_id !== userId) ||
    !invite.data?.length
  ) {
    throw new Error('Invalid invite');
  }

  // check user is already member
  const orgId = invite.data?.[0].organization_id ?? '';
  const userRole = await getUserOrganizationRole(orgId, userId);

  if (userRole) {
    throw new Error('Already a member');
  }

  if (invite.data?.length) {
    const inviteData = invite.data[0];
    // check if its cancelled
    if (inviteData.status === 'canceled') {
      throw new Error('Invite cancelled');
    }

    // check its not expired

    const now = new Date().getTime();
    const inviteTime = new Date(inviteData.created_at).getTime();
    const diff = (now - inviteTime) / 1000;

    if (diff > ORG_MEMBER_INVITE_TIMEOUT) {
      await supabaseAdmin
        .from('swarms_cloud_organization_member_invites')
        .update({ status: 'expired' })
        .eq('id', inviteData.id);
      throw new Error('Invite expired');
    } else {
      // add as member
      const join_res = await supabaseAdmin
        .from('swarms_cloud_organization_members')
        .insert({
          invite_by_user_id: inviteData.invite_by_user_id,
          role: inviteData.role,
          organization_id: inviteData.organization_id,
          user_id: userId
        });
      if (join_res.error) {
        throw new Error('Failed to join organization');
      }

      // update invite record to joined
      await supabaseAdmin
        .from('swarms_cloud_organization_member_invites')
        .update({ status: 'joined' })
        .eq('id', inviteData.id);
      return true;
    }
  }
  return null;
};
