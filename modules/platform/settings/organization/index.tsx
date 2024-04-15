'use client';

import { useState } from 'react';
import OrganizationList from './components/list';
import PendingInvites from './components/pending-invite';
import OrganizationTeam from './components/team';
import { MemberProps, OrganizationListProps } from './types';

const roles = [
  { label: 'List Team roles', value: 'Team roles' },
  { label: 'Owner', value: 'owner' },
  { label: 'Manager', value: 'manager' },
  { label: 'Reader', value: 'reader' }
];

const list: OrganizationListProps[] = [
  {
    name: 'Swarms',
    role: 'owner',
    id: '0',
    members: [
      { email: 'gilbertoaceville@gmail.com', role: 'owner', id: '0' },
      { email: 'sammyfall@gmail.com', role: 'manager', id: '1' },
      { email: 'tawnytray@gmail.com', role: 'reader', id: '2' },
      { email: 'lebronguana@gmail.com', role: 'reader', id: '3' }
    ]
  },
  {
    name: 'Gemini',
    role: 'manager',
    id: '1',
    members: [
      { email: 'princeton@gmail.com', role: 'owner', id: '0' },
      { email: 'maryozoji@gmail.com', role: 'reader', id: '2' },
      { email: 'stellamaris@gmail.com', role: 'manager', id: '1' }
    ]
  }
];

export default function Organization({ user }: { user: any }) {
  const [team, setTeam] = useState<MemberProps[]>(list[0].members);

  function getTeam(listId: string) {
    if (!listId) return;
    const teamMembers = list.find((member) => member.id === listId);

    if (!teamMembers?.members) return;
    setTeam(teamMembers?.members);
  }

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList organizationList={list} getTeam={getTeam} />
      <OrganizationTeam roles={roles} team={team} />
      <PendingInvites roles={roles} />
    </article>
  );
}
