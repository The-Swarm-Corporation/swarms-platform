'use client';

import { User } from '@supabase/supabase-js';
import OrganizationList from './components/list';
import { useOrganizations } from './hooks/organizations';
import { UserOrganizationProps, UserOrganizationsProps } from './types';
import dynamic from 'next/dynamic';

const PendingInvites = dynamic(() => import('./components/pending-invite'), {
  ssr: false
});
const OrganizationTeam = dynamic(() => import('./components/team'), {
  ssr: false
});
export default function Organization({ user }: { user: User | null }) {
  const { userOrgData, filteredUserOrgs } = useOrganizations();

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList
        userOrgData={userOrgData?.data as UserOrganizationProps}
        userOrgsData={filteredUserOrgs as UserOrganizationsProps[]}
      />
      <OrganizationTeam user={user} />
      <PendingInvites />
    </article>
  );
}
