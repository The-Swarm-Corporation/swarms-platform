import { useOrganizationStore } from '@/shared/stores/organization';
import { trpc } from '@/shared/utils/trpc/trpc';

export function useQueryMutation() {
  const userOrgId = useOrganizationStore((state) => state.userOrgId);
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);

  // queries
  const userOrganizationsQuery =
    trpc.organization.getUserOrganizations.useQuery();
  const userOrganizationQuery =
    trpc.organization.getUserPersonalOrganization.useQuery();
  const organizationMembersQuery = trpc.organization.members.useQuery({
    id: currentOrgId ?? ''
  });
  const pendingInvitesQuery = trpc.organization.pendingInvites.useQuery({
    organization_id: userOrgId ?? ''
  });

  // mutations
  const createOrgMutation = trpc.organization.createOrganization.useMutation();
  const updateOrgNameMutation =
    trpc.organization.updateOrganizationName.useMutation();
  const inviteEmailMutation =
    trpc.organization.inviteMemberByEmail.useMutation();
  const changeRoleMutation = trpc.organization.changeMemberRole.useMutation();
  const leaveOrganizationMutation =
    trpc.organization.leaveOrganization.useMutation();
  const deleteMemberMutation = trpc.organization.deleteMember.useMutation();
  const cancelledInvitesMutation = trpc.organization.cancelInvite.useMutation();

  const query = {
    organization: userOrganizationQuery,
    organizations: userOrganizationsQuery,
    members: organizationMembersQuery,
    invites: pendingInvitesQuery
  };

  const mutation = {
    create: createOrgMutation,
    update: updateOrgNameMutation,
    invite: inviteEmailMutation,
    changeRole: changeRoleMutation,
    leave: leaveOrganizationMutation,
    delete: deleteMemberMutation,
    cancel: cancelledInvitesMutation,
  };

  return { query, mutation };
}
