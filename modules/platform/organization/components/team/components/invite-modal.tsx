import React, { useState } from 'react';
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
import { OptionRoles } from '../../../types';

interface InviteModalProps {
  roles: OptionRoles[];
}

export default function InviteModal({ roles }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>(
    roles[roles.length - 1]?.value
  );
  const [invites, setInvites] = useState([{ role: 'reader' }]);

  const inviteRoles = roles.slice(1);
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

  return (
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
  );
}
