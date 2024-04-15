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
import { cn } from '@/shared/utils/cn';

interface OrganizationTeamProps {
  roles: OptionRoles[];
  team: MemberProps[];
}

export default function OrganizationTeam({
  roles,
  team
}: OrganizationTeamProps) {
  const [filterRole, setFilterRole] = useState<string>(roles[0]?.value);
  const [search, setSearch] = useState('');

  const allMemberRoles = useMemo(
    () =>
      roles
        .filter((role) => role.value !== 'Team roles')
        .map((role) => role.value),
    []
  );

  const isTeamMembers = team?.length > 1;

  function handleSearchChange(value: string) {
    if (!isTeamMembers) return;
    setSearch(value);
  }

  function changeUserRole(role: Role, id?: string) {
    if (!isTeamMembers) return;
    //check if user is owner of org, then update
    const updatedTeamMembers = [...team];
    for (const member of updatedTeamMembers) {
      if (member.id === id) {
        member.role = role;
      }
    }
    return null;
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
        <Input
          placeholder="Search..."
          onChange={handleSearchChange}
          value={search}
          disabled={!isTeamMembers}
          readOnly={!isTeamMembers}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        />

        <Select
          onValueChange={(value) => {
            setFilterRole(value);
          }}
          value={filterRole}
          disabled={!isTeamMembers}
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

      <div
        className={cn(
          'flex flex-col items-center justify-center border rounded-md px-2 py-4 sm:px-4 sm:py-8 text-card-foreground my-8 gap-3',
          !isTeamMembers && 'opacity-50 cursor-help'
        )}
      >
        {isTeamMembers ? (
          team?.map((member) => (
            <TeamMember
              key={member?.id}
              member={member}
              changeUserRole={changeUserRole}
              allMemberRoles={allMemberRoles as Role[]}
            />
          ))
        ) : (
          <div className="bg-secondary p-6 shadow-lg rounded-md">
            <h3>Create or Select Organization at to see Team members</h3>
          </div>
        )}
      </div>
    </div>
  );
}
