'use client';

import React, { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import Input from '@/shared/components/ui/Input';
import TeamMember from './components/member';
import { MemberProps, OptionRoles, Role } from '../../types';
import InviteModal from './components/invite-modal';

interface OrganizationTeamProps {
  roles: OptionRoles[];
}

export const team: MemberProps[] = [
  { email: 'gilbertoaceville@gmail.com', role: 'owner', id: '0' },
  { email: 'sammyfall@gmail.com', role: 'manager', id: '1' },
  { email: 'tawnytray@gmail.com', role: 'reader', id: '2' },
  { email: 'lebronguana@gmail.com', role: 'reader', id: '3' }
];

export default function OrganizationTeam({ roles }: OrganizationTeamProps) {
  const [filterRole, setFilterRole] = useState<string>(roles[0]?.value);
  const [teamMembers, setTeamMembers] = useState(team);

  const allMemberRoles = useMemo(
    () =>
      roles
        .filter((role) => role.value !== 'Team roles')
        .map((role) => role.value),
    []
  );

  function changeUserRole(role: Role, id?: string) {
    //check if user is owner of org, then update
    const updatedTeamMembers = [...teamMembers];
    for (const member of updatedTeamMembers) {
      if (member.id === id) {
        member.role = role;
      }
    }
    setTeamMembers(updatedTeamMembers);
  }

  return (
    <div className="mt-16">
      <div className="flex justify-between">
        <div>
          <h3 className="mb-2 text-xl">Team</h3>
          <span className="text-muted-foreground text-sm">
            Manage team members and invitation
          </span>
        </div>

        <InviteModal roles={roles} />
      </div>

      <div className="flex items-center gap-3 mt-8 mb-4">
        <Input placeholder="Search..." />

        <Select
          onValueChange={(value) => {
            setFilterRole(value);
          }}
          value={filterRole}
        >
          <SelectTrigger className="xl:w-2/4">
            <SelectValue placeholder={filterRole} />
          </SelectTrigger>
          <SelectContent>
            {roles?.map((role) => (
              <SelectItem key={role.label} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-center justify-center border rounded-md px-2 py-4 sm:px-4 sm:py-8 text-card-foreground my-8 gap-3">
        {teamMembers.map((member) => (
          <TeamMember
            key={member.id}
            member={member}
            changeUserRole={changeUserRole}
            allMemberRoles={allMemberRoles as Role[]}
          />
        ))}
      </div>
    </div>
  );
}
