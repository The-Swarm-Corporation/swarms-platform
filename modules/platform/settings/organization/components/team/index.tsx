'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import Input from '@/shared/components/ui/Input';
import TeamMember from './components/member';
import InviteModal from './components/invite-modal';
import { cn } from '@/shared/utils/cn';
import { isEmpty } from '@/shared/utils/helpers';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { ROLES } from '@/shared/constants/organization';
import { useOrganizationTeam } from '../../hooks/team';
import { User } from '@supabase/supabase-js';
import { UserOrganizationsProps } from '../../types';
import { memo } from 'react';

interface OrganizationTeamProps {
  user: User | null;
  currentOrganization: UserOrganizationsProps | null;
}

function OrganizationTeam({
  user,
  currentOrganization,
}: OrganizationTeamProps) {
  const {
    search,
    filterRole,
    isTeamMembers,
    teamMembersToDisplay,
    isLoading,
    setFilterRole,
    handleSearchChange,
  } = useOrganizationTeam();

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
          <span className="text-muted-foreground text-xs md:text-sm gap-1.5">
            <span>Manage team members and invitations for</span>{' '}
            {currentOrganization?.organization?.name && (
              <span className="text-primary translate-y-1">
                {currentOrganization?.organization?.name}
              </span>
            )}
          </span>
        </div>

        <InviteModal
          currentOrganization={currentOrganization as UserOrganizationsProps}
        />
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
          <SelectTrigger className="xl:w-2/4 cursor-pointer">
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
          !teamMembersToDisplay.length && 'opacity-50 cursor-help',
        )}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : !isEmpty(teamMembersToDisplay) && !isLoading ? (
          teamMembersToDisplay?.map((member) => (
            <TeamMember
              key={member?.user_id}
              member={member}
              user={user}
              currentOrganization={
                currentOrganization as UserOrganizationsProps
              }
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

export default memo(OrganizationTeam);
