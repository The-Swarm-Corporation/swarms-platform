'use client';

import OrganizationList from './components/list';
import PendingInvites from './components/pending-invite';
import OrganizationTeam from './components/team';
import { useOrganizations } from '@/shared/stores/organization';
import { UserOrganizationProps } from './types';

export default function Organization({ user }: { user: any }) {
  const { userOrganization } = useOrganizations();

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList
        userOrganization={userOrganization?.data as UserOrganizationProps}
      />
      <OrganizationTeam user={user} />
      <PendingInvites />
    </article>
  );
}
