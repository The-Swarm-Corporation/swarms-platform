'use client';

import { User } from '@supabase/supabase-js';
import OrganizationList from './components/list';
import PendingInvites from './components/pending-invite';
import OrganizationTeam from './components/team';
import { useOrganizations } from './hooks/useOrganizations';
import { UserOrganizationProps } from './types';

export default function Organization({ user }: { user: User }) {
  const { userOrgData } = useOrganizations();

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList
        userOrgData={userOrgData?.data as UserOrganizationProps}
      />
      <OrganizationTeam user={user} />
      <PendingInvites />
    </article>
  );
}
