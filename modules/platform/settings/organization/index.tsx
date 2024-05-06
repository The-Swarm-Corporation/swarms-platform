'use client';

import { User } from '@supabase/supabase-js';
import OrganizationList from './components/list';
import { useOrganizations } from './hooks/organizations';
import { UserOrganizationProps, UserOrganizationsProps } from './types';
import dynamic from 'next/dynamic';
import { trpc } from '@/shared/utils/trpc/trpc';

const PendingInvites = dynamic(() => import('./components/pending-invite'), {
  ssr: false,
});
const OrganizationTeam = dynamic(() => import('./components/team'), {
  ssr: false,
});
export default function Organization() {
  const user_res = trpc.main.getUser.useQuery();
  const user = user_res.data as unknown as User;
  const { currentOrganization, userOrgData, usersOrgData } = useOrganizations();

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList
        userOrgData={userOrgData?.data as UserOrganizationProps}
        userOrgsData={usersOrgData as UserOrganizationsProps[]}
      />
      <OrganizationTeam
        user={user}
        currentOrganization={currentOrganization as UserOrganizationsProps}
      />
      <PendingInvites
        currentOrganization={currentOrganization as UserOrganizationsProps}
      />
    </article>
  );
}
