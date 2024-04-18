import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import useToggle from '@/shared/hooks/toggle';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { cn } from '@/shared/utils/cn';
import { MemberProps, Role } from '../../../types';
import { useOrganizationStore } from '@/shared/stores/organization';
import { trpc } from '@/shared/utils/trpc/trpc';

interface TeamMemberProps {
  member: MemberProps;
  changeUserRole?: (role: Role, id?: string) => void;
  allMemberRoles?: MemberProps['role'][];
  user: any;
}

export default function TeamMember({
  member,
  changeUserRole,
  allMemberRoles,
  user
}: TeamMemberProps) {
  const memberRef = useRef(null);
  const { isOn, setOff, setOn } = useToggle();
  const [canRemove, setCanRemove] = useState(false);
  const userOrg = trpc.organization.getUserPersonalOrganization.useQuery().data;

  console.log(userOrg);

  useOnClickOutside(memberRef, setOff);

  const ownerRole = member.role === 'owner';
  const isCurrentUser = member.user_id === user.id;

  useEffect(() => {
    if (user.id === member.user_id) {
      setCanRemove(ownerRole && member.role !== 'owner');
    } else {
      setCanRemove(member.role !== 'owner' && member.role !== 'manager');
    }
  }, [user.id, ownerRole, member.role]);

  function handleUserRole(role: Role) {
    changeUserRole?.(role, member?.user_id);
    setOff();
  }

  function handleModal() {
    if (ownerRole) return;
    setOn();
  }

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
          className="border w-28 p-2 text-center rounded-md capitalize flex justify-between items-center"
          onClick={handleModal}
        >
          <span>{member.role}</span>
          {!ownerRole && <ChevronDown size={20} />}
        </div>
        <ul
          ref={memberRef}
          className={cn(
            'absolute list-none border bg-secondary w-32 flex flex-col items-center rounded-md bottom-8 left-14 transition-all invisible',
            isOn && 'visible'
          )}
        >
          {allMemberRoles?.map((role) => (
            <li
              onClick={() => handleUserRole(role)}
              className="hover:text-secondary hover:bg-foreground capitalize w-full py-2 text-center"
            >
              {role}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full sm:max-w-[86px] flex justify-center mt-2 md:mt-0">
        {isCurrentUser ? (
          <>
            {ownerRole && canRemove ? (
              <Button className={cn('h-7 sm:h-10 sm:w-full')}>Remove</Button>
            ) : (
              !ownerRole && (
                <Button className={cn('h-7 sm:h-10 sm:w-full')}>Leave</Button>
              )
            )}
          </>
        ) : (
          canRemove && (
            <Button className={cn('h-7 sm:h-10 sm:w-full')}>Remove</Button>
          )
        )}
      </div>
    </div>
  );
}
