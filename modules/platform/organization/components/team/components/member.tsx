import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import useToggle from '@/shared/hooks/toggle';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { cn } from '@/shared/utils/cn';
import { MemberProps, Role } from '../../../types';

interface TeamMemberProps {
  member: MemberProps;
  changeUserRole?: (role: Role, id?: string) => void;
  allMemberRoles?: MemberProps['role'][];
}

export default function TeamMember({
  member,
  changeUserRole,
  allMemberRoles
}: TeamMemberProps) {
  const memberRef = useRef(null);
  const { isOn, setOff, setOn } = useToggle();

  useOnClickOutside(memberRef, setOff);

  function handleUserRole(role: Role) {
    changeUserRole?.(role, member.id);
    setOff()
  }

  function handleModal() {
    if(member.role === "owner") return;
    setOn();
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between border rounded-md px-2 py-4 sm:px-4 sm:py-8 text-card-foreground hover:opacity-80 w-full max-sm:gap-2"
    >
      <div className="flex items-center gap-2 basis-1/2">
        <span className="h-7 w-7 sm:w-10 sm:h-10 text-sm sm:text-base flex justify-center items-center bg-slate-500 text-white rounded-full uppercase">
          {member.email.charAt(0)}
        </span>
        <p>{member.email}</p>
      </div>
      <div className="relative basis-1/3">
        <div
          className="border w-28 p-2 text-center rounded-md capitalize flex justify-between items-center"
          onClick={handleModal}
        >
          <span>{member.role}</span> <ChevronDown size={20} />
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
      <Button className="h-7 sm:h-10">Leave</Button>
    </div>
  );
}
