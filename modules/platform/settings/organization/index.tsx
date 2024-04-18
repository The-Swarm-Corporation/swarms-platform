'use client';

import OrganizationList from './components/list';
import PendingInvites from './components/pending-invite';
import OrganizationTeam from './components/team';
import {
  useOrganizations,
  useOrganizationStore
} from '@/shared/stores/organization';
import { UserOrganizationProps, UserOrganizationsProps } from './types';

export default function Organization({ user }: { user: any }) {
  const {
    currentOrgId,
    userOrganization,
    currentOrganization,
    organizationList,
    handleCurrentOrgId
  } = useOrganizations();
  const userOrgId = useOrganizationStore((state) => state.userOrgId);

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList
        organizationList={organizationList}
        currentOrgId={currentOrgId}
        userOrgId={userOrgId ?? ''}
        userOrganization={userOrganization?.data as UserOrganizationProps}
        handleCurrentOrgId={handleCurrentOrgId}
      />
      <OrganizationTeam
        currentOrgId={currentOrgId}
        userOrgId={userOrgId ?? ''}
        user={user}
        currentOrganization={currentOrganization as UserOrganizationsProps}
      />
      <PendingInvites
        userOrgId={userOrgId ?? ''}
        currentOrganization={currentOrganization as UserOrganizationsProps}
      />
    </article>
  );
}
