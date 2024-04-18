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
import {
  ExcludeOwner,
  MemberProps,
  Role,
  UserOrganizationsProps
} from '../../types';
import InviteModal from './components/invite-modal';
import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';
import { debounce } from '@/shared/utils/helpers';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { ROLES } from '@/shared/constants/organization';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useOrganizationStore } from '@/shared/stores/organization';

interface OrganizationTeamProps {
  user: any;
}

export default function OrganizationTeam({ user }: OrganizationTeamProps) {
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);
  const currentOrganization = useOrganizationStore(
    (state) => state.currentOrganization
  );

  const organizationMembersQuery = trpc.organization.members.useQuery({
    id: currentOrgId
  });

  const changeRoleMutation = trpc.organization.changeMemberRole.useMutation();
  const leaveOrgMutation = trpc.organization.leaveOrganization.useMutation();
  const deleteMemberMutation = trpc.organization.deleteMember.useMutation();

  const toast = useToast();
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

  async function withOrganizationMutation<T>(
    mutationFunction: any,
    data: any,
    toastMessage: string
  ) {
    if (!currentOrgId) {
      toast.toast({
        description: 'Organization not found',
        style: { color: 'red' }
      });
      return;
    }

    useOrganizationStore.getState().setIsLoading(true);

    try {
      const response = await mutationFunction.mutateAsync(data);

      if (response) {
        toast.toast({ description: toastMessage });
        organizationMembersQuery.refetch();
      }
    } catch (error) {
      console.log(error);
      if ((error as any)?.message) {
        toast.toast({ description: (error as any)?.message });
      }
    } finally {
      useOrganizationStore.getState().setIsLoading(false);
    }
  }

  async function handleRoleChange(user_id: string, role: ExcludeOwner) {
    if (!user_id || !role) {
      toast.toast({
        description: 'Something went wrong; Missing values',
        style: { color: 'red' }
      });
      return;
    }
    await withOrganizationMutation(
      changeRoleMutation,
      { user_id, role, organization_id: currentOrgId },
      'Member role updated'
    );
  }

  async function handleLeaveOrg() {
    await withOrganizationMutation(
      leaveOrgMutation,
      { organization_id: currentOrgId },
      "You've successfully left the organization"
    );
  }

  async function handleDeleteMember(user_id: string) {
    if (!user_id) {
      toast.toast({
        description: 'Something went wrong; Missing values',
        style: { color: 'red' }
      });
      return;
    }
    await withOrganizationMutation(
      deleteMemberMutation,
      { user_id, organization_id: currentOrgId },
      'User has been successfully removed'
    );
  }

  useEffect(() => {
    if (
      organizationMembersQuery.data &&
      organizationMembersQuery?.data?.length > 0
    ) {
      setTeamMembers(organizationMembersQuery.data);
    }
  }, [organizationMembersQuery.data]);
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
            <span>Manage team members and invitations for</span>{' '}
            {currentOrganization?.organization?.name && (
              <span className="text-primary translate-y-1">
                {currentOrganization?.organization?.name}
              </span>
            )}
          </span>
        </div>

        <InviteModal />
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
          !teamMembersToDisplay.length && 'opacity-50 cursor-help'
        )}
      >
        {organizationMembersQuery.isLoading ? (
          <LoadingSpinner />
        ) : teamMembersToDisplay.length > 0 &&
          !organizationMembersQuery.isLoading ? (
          teamMembersToDisplay?.map((member) => (
            <TeamMember
              key={member?.user_id}
              member={member}
              handleRoleChange={handleRoleChange}
              handleLeaveOrg={handleLeaveOrg}
              handleDeleteMember={handleDeleteMember}
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
