'use client';

import { useEffect, useState } from 'react';
import OrganizationList from './components/list';
import PendingInvites from './components/pending-invite';
import OrganizationTeam from './components/team';
import {
  MemberProps,
  OrganizationListProps,
  Role,
  UserOrganizationsProps
} from './types';
import { useOrganizationStore } from '@/shared/stores/organization';
import { trpc } from '@/shared/utils/trpc/trpc';

const roles: { label: string; value: Role | string }[] = [
  { label: 'List Team roles', value: 'Team roles' },
  { label: 'Owner', value: 'owner' },
  { label: 'Manager', value: 'manager' },
  { label: 'Reader', value: 'reader' },
  { label: 'Member', value: 'member' },
];

export default function Organization({ user }: { user: any }) {
  const [activeOrgId, setActiveOrgId] = useState('');
  const [organizationList, setOrganizationList] = useState<
    UserOrganizationsProps[]
  >([]);

  const userOrganization =
    trpc.organization.getUserPersonalOrganization.useQuery().data;
  const userOrganizations =
    trpc.organization.getUserOrganizations.useQuery().data;

  function handleActiveOrgId(id: string) {
    setActiveOrgId(id);
  }

  useEffect(() => {
    if (userOrganizations && userOrganizations.length > 0) {
      setOrganizationList(userOrganizations as UserOrganizationsProps[]);
    }

    const orgId =
      userOrganization?.data?.id || organizationList?.[0]?.organization?.id;
    if (orgId) {
      setActiveOrgId(orgId);
    }
  }, [
    userOrganizations,
    userOrganization?.data?.id,
    organizationList?.[0]?.organization?.id
  ]);

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList
        organizationList={organizationList}
        activeOrgId={activeOrgId}
        handleActiveOrgId={handleActiveOrgId}
      />
      <OrganizationTeam roles={roles} activeOrgId={activeOrgId} />
      <PendingInvites roles={roles} />
    </article>
  );
}
