'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Plus, PlusCircle, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import useToggle from '@/shared/hooks/toggle';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { cn } from '@/shared/utils/cn';

const roles = [
  { label: 'List Team roles', value: 'Team roles' },
  { label: 'Owner', value: 'owner' },
  { label: 'Manager', value: 'manager' },
  { label: 'Reader', value: 'reader' }
] as const;
const inviteRoles = roles.slice(1);
export const team = [
  { email: 'gilbertoaceville@gmail.com', role: 'owner', id: '0' },
  { email: 'sammyfall@gmail.com', role: 'manager', id: '1' },
  { email: 'tawnytray@gmail.com', role: 'reader', id: '2' },
  { email: 'lebronguana@gmail.com', role: 'reader', id: '3' },
];

export default function OrganizationTeam() {
  const memberRef = useRef(null);

  const [email, setEmail] = useState('');
  const [filterRole, setFilterRole] = useState<string>(roles[0]?.value);
  const [inviteRole, setInviteRole] = useState<string>(
    roles[roles.length - 1]?.value
  );
  const [invites, setInvites] = useState([{ role: 'reader' }]);
  const [teamMembers, setTeamMembers] = useState(team);
  const { isOn, setOff, setOn } = useToggle();

  useOnClickOutside(memberRef, setOff);

  const allMemberRoles = useMemo(
    () =>
      roles
        .filter((role) => role.value !== 'Team roles')
        .map((role) => role.value),
    []
  );

  const isMoreInvites = invites.length > 1;
  const inviteButtonText = isMoreInvites ? 'Invite All' : 'Invite';

  function addMoreInvites() {
    setInvites((prevState) => [...prevState, { role: 'reader' }]);
  }

  function removeInvites(index: number) {
    setInvites((prevState) => {
      return prevState.filter((_, i) => i !== index);
    });
  }

  function changeUserRole(role: string) {
    const updatedTeamMembers = [...teamMembers];
    for (const member of updatedTeamMembers) {
      if (member.role.toLowerCase() !== 'owner') {
        member.role = role;
      }
    }
    setTeamMembers(updatedTeamMembers);
    setOff();
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

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-0.5" variant="secondary">
              <Plus size={20} /> Invite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Invite members by email address</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-2 items-center mt-3 w-full">
                <p className="w-full">Email</p>
                <p className="w-2/4">Role</p>
              </div>
              {invites.map((invite, index) => (
                <div
                  key={`${invite.role}-${index}`}
                  className="flex items-center gap-2 w-full"
                >
                  <div className="w-full">
                    <label htmlFor="email" className="text-right hidden">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      className="my-2 w-full"
                      placeholder="swarms@example.com"
                      onChange={(value) => {
                        setEmail(value);
                      }}
                    />
                  </div>
                  <div className="w-2/4">
                    <Select
                      onValueChange={(value) => {
                        setInviteRole(value);
                      }}
                      value={inviteRole}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={invite.role} />
                      </SelectTrigger>
                      <SelectContent>
                        {inviteRoles?.map((role) => (
                          <SelectItem key={role.label} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isMoreInvites && (
                    <X
                      size={20}
                      className="text-primary cursor-pointer"
                      onClick={() => removeInvites(index)}
                    />
                  )}
                </div>
              ))}
              <DialogFooter className="sm:justify-between mt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={addMoreInvites}
                >
                  <PlusCircle size={15} /> Add more
                </Button>
                <Button type="submit" className="w-1/3">
                  {inviteButtonText}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
        {teamMembers.map((member) => {
          return (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between border rounded-md px-2 py-4 sm:px-4 sm:py-8 text-card-foreground cursor-pointer hover:opacity-80 w-full max-sm:gap-2"
            >
              <div className="flex items-center gap-2 basis-1/2">
                <span className="h-7 w-7 sm:w-10 sm:h-10 text-sm sm:text-base flex justify-center items-center bg-slate-500 text-white rounded-full uppercase">
                  {member.email.charAt(0)}
                </span>
                <p>{member.email}</p>
              </div>
              <div className="relative basis-1/3">
                <div
                  className="border w-28 py-1 text-center rounded-md capitalize"
                  onClick={setOn}
                >
                  {member.role}
                </div>
                <ul
                  ref={memberRef}
                  className={cn(
                    'absolute list-none border bg-secondary w-32 flex flex-col items-center rounded-md bottom-8 -right-14 transition-all invisible',
                    isOn && 'visible'
                  )}
                >
                  {allMemberRoles.map((role) => (
                    <li
                      onClick={() => changeUserRole(role)}
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
        })}
      </div>
    </div>
  );
}
