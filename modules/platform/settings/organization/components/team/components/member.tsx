import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import useToggle from '@/shared/hooks/toggle';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { cn } from '@/shared/utils/cn';
import { ExcludeOwner, MemberProps } from '../../../types';
import { useOrganizationStore } from '@/shared/stores/organization';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import ModalPrompt from '../../prompt';
import { ROLES } from '@/shared/constants/organization';
import { useOrganizationTeam } from '../../../hooks/team';

interface TeamMemberProps {
  member: MemberProps;
  user: any;
}

export default function TeamMember({ member, user }: TeamMemberProps) {
  const currentOrganization = useOrganizationStore(
    (state) => state.currentOrganization
  );
  const { openDialog, handleRoleChange, handleLeaveOrg, handleDeleteMember, setOpenDialog } =
    useOrganizationTeam();

  const memberRef = useRef(null);
  const toast = useToast();
  const { isOn, setOff, setOn } = useToggle();
  const [memberRole, setMemberRole] = useState<ExcludeOwner>('reader');
  const isLoading = useOrganizationStore((state) => state.isLoading);

  useOnClickOutside(memberRef, setOff);

  const ownerRole = member.role === 'owner';
  const isCurrentUser = member.user_id === user?.id;
  const isOrgOwner = currentOrganization.role === 'owner';

  const allMemberRoles = useMemo(() => {
    const excludedRoles = ['Team roles', 'owner'];
    return ROLES.filter((role) => !excludedRoles.includes(role.value)).map(
      (role) => role.value
    );
  }, [member.role]);

  async function handleUserRole(role: ExcludeOwner) {
    if (role === memberRole)
      return toast.toast({
        description: 'Role already exists',
        style: { color: 'red' }
      });
    await handleRoleChange?.(member.user_id, role as ExcludeOwner);
    setMemberRole(role);
    setOff();
  }

  function handleModal() {
    if (ownerRole) return;
    setOn();
  }

  useEffect(() => {
    if (member?.role) {
      setMemberRole(member.role as ExcludeOwner);
    }
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between border rounded-md px-2 py-4 sm:p-4 text-card-foreground hover:opacity-80 w-full max-sm:gap-2">
      <div className="flex items-center gap-2 basis-1/2">
        <span className="h-7 w-7 sm:w-10 sm:h-10 text-sm sm:text-base flex justify-center items-center bg-slate-500 text-white rounded-full uppercase">
          {member?.name.charAt(0)}
        </span>
        <p>{member?.name}</p>
      </div>
      <div className="relative basis-1/3">
        <div
          className={cn(
            'border w-28 p-2 cursor-pointer text-center rounded-md capitalize flex justify-between items-center',
            !(!ownerRole && isOrgOwner) && 'justify-center cursor-not-allowed'
          )}
          onClick={handleModal}
        >
          <span>{member.role}</span>
          {!ownerRole && isOrgOwner && <ChevronDown size={20} />}
        </div>
        {isOrgOwner && (
          <ul
            ref={memberRef}
            className={cn(
              'absolute list-none border bg-secondary w-32 flex flex-col items-center rounded-md bottom-8 left-14 transition-all invisible',
              isOn && 'visible'
            )}
          >
            {allMemberRoles?.map((role) => (
              <li className="hover:text-secondary hover:bg-foreground capitalize w-full py-2 text-center">
                <ModalPrompt
                  content={`Do you wish to change the role for ${member.name || ''}?`}
                  isLoading={isLoading}
                  handleClick={() => handleUserRole(role as ExcludeOwner)}
                >
                  <Button
                    variant="ghost"
                    className="capitalize hover:bg-transparent hover:text-secondary transition-none"
                    aria-label={role}
                  >
                    {role}
                  </Button>
                </ModalPrompt>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="w-full sm:max-w-[86px] flex justify-center mt-2 md:mt-0">
        {(isCurrentUser && currentOrganization.role === 'reader') ||
        (isCurrentUser && currentOrganization.role === 'manager') ? (
          <ModalPrompt
            content={`Can you confirm you're leaving?`}
            isLoading={isLoading}
            handleClick={handleLeaveOrg as () => void}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
          >
            <Button className={cn('h-7 sm:h-10 sm:w-full')}>Leave</Button>
          </ModalPrompt>
        ) : !isCurrentUser &&
          ((currentOrganization.role === 'manager' &&
            member.role !== 'manager') ||
            currentOrganization.role === 'owner') &&
          member.role !== 'owner' ? (
          <ModalPrompt
            content={`Would you like to remove ${member.name || ''} from this organization?`}
            isLoading={isLoading}
            handleClick={() => handleDeleteMember?.(member.user_id)}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
          >
            <Button className={cn('h-7 sm:h-10 sm:w-full')}>Remove</Button>
          </ModalPrompt>
        ) : null}
      </div>
    </div>
  );
}
