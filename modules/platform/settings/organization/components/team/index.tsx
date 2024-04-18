'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import Input from '@/shared/components/ui/Input';
import TeamMember from './components/member';
import { MemberProps, Role, UserOrganizationsProps } from '../../types';
import InviteModal from './components/invite-modal';
import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';
import { debounce } from '@/shared/utils/helpers';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { ROLES } from '@/shared/constants/organization';

interface OrganizationTeamProps {
  currentOrgId: string;
  userOrgId: string;
  user: any;
  currentOrganization: UserOrganizationsProps;
}

export default function OrganizationTeam({
  currentOrgId,
  userOrgId,
  user,
  currentOrganization,
}: OrganizationTeamProps) {
  const organizationMembers = trpc.organization.members.useQuery({
    id: currentOrgId
  });

  console.log({ orgMembers: organizationMembers.data, currentOrgId });
  const [filterRole, setFilterRole] = useState<string>(ROLES[0].value);
  const [search, setSearch] = useState('');
  const [teamMembers, setTeamMembersInternal] = useState<MemberProps[]>([]);
  const setTeamMembers = useCallback((members: MemberProps[]) => {
    setTeamMembersInternal(members);
  }, []);

  const debouncedSearch = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      setSearch(value);
    }, 100);
    return debouncedFn;
  }, []);

  const isTeamMembers = teamMembers && teamMembers?.length >= 1;

  const allMemberRoles = useMemo(
    () =>
      ROLES.filter(
        (role) => role.value !== 'Team roles' && role.value !== 'owner'
      ).map((role) => role.value),
    []
  );

  const teamMembersToDisplay = useMemo(() => {
    if (!teamMembers) return [];
    return teamMembers
      .filter((member) =>
        filterRole === 'Team roles' ? true : member.role === filterRole
      )
      .filter(
        (member) =>
          !search || member.name?.toLowerCase().includes(search.toLowerCase())
      );
  }, [teamMembers, filterRole, search]);

  const handleSearchChange = useCallback(
    (value: string) => {
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const changeUserRole = useCallback(
    (role: Role, id?: string) => {
      if (!teamMembers) return;
      setTeamMembersInternal((prevMembers) =>
        prevMembers.map((member) =>
          member.user_id === id ? { ...member, role } : member
        )
      );
    },
    [teamMembers]
  );

  useEffect(() => {
    if (organizationMembers.data && organizationMembers?.data?.length > 0) {
      setTeamMembers(organizationMembers.data);
    }
  }, [organizationMembers.data]);
  return (
    <div className="mt-16">
      <div className="flex justify-between">
        <div>
          <h3 className="mb-2 text-xl items-end flex gap-1.5">
            <span>Team:</span>
            {currentOrganization?.organization?.name && (
              <span className="text-primary leading-6">
                {currentOrganization?.organization?.name}
              </span>
            )}
          </h3>
          <span className="text-muted-foreground text-sm gap-1.5">
            <span>Manage team members and invitations for</span> {" "}
            {currentOrganization?.organization?.name && (
              <span className="text-primary translate-y-1">
                {currentOrganization?.organization?.name}
              </span>
            )}
          </span>
        </div>

        <InviteModal userOrgId={userOrgId} currentOrganization={currentOrganization} />
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
            {ROLES?.map((role) => (
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
          !teamMembersToDisplay.length && 'opacity-50 cursor-help'
        )}
      >
        {organizationMembers.isLoading ? (
          <LoadingSpinner />
        ) : teamMembersToDisplay.length > 0 &&
          !organizationMembers.isLoading ? (
          teamMembersToDisplay?.map((member) => (
            <TeamMember
              key={member?.user_id}
              member={member}
              changeUserRole={changeUserRole}
              allMemberRoles={allMemberRoles as Role[]}
              user={user}
            />
          ))
        ) : (
          <div className="bg-secondary p-6 shadow-lg rounded-md">
            <h3>No team found. Select attributes to see members</h3>
          </div>
        )}
      </div>
    </div>
  );
}
