import React, { FormEvent, SyntheticEvent, useState } from 'react';
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
import { ExcludeOwner } from '../../../types';
import { emailRegExp } from './const';
import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useOrganizationStore } from '@/shared/stores/organization';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { ROLES } from '@/shared/constants/organization';

export default function InviteModal() {
  const userOrgId = useOrganizationStore((state) => state.userOrgId);
  const currentOrganization = useOrganizationStore(
    (state) => state.currentOrganization
  );

  const inviteEmailMutation =
    trpc.organization.inviteMemberByEmail.useMutation();
  const pendingInvitesQuery = trpc.organization.pendingInvites.useQuery({
    organization_id: userOrgId ?? ''
  });

  const toast = useToast();
  const isLoading = useOrganizationStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  const [inviteRole, setInviteRole] = useState<ExcludeOwner | string>(
    ROLES[ROLES.length - 1]?.value
  );
  const [invites, setInvites] = useState([{ role: 'reader' }]);

  const inviteRoles = ROLES.slice(2);
  const isMoreInvites = invites.length > 1;
  const inviteButtonText = isMoreInvites ? 'Invite All' : 'Invite';

  function handleEmailChange(value: string) {
    setEmail(value);
    setIsValidEmail(emailRegExp.test(value));
  }

  function addMoreInvites() {
    setInvites((prevState) => [...prevState, { role: 'reader' }]);
  }

  function removeInvites(index: number) {
    setInvites((prevState) => {
      return prevState.filter((_, i) => i !== index);
    });
  }

  async function handleInvites(e: FormEvent) {
    e.preventDefault();

    const _email = email.trim();
    if (_email.length < 3 && !isValidEmail) {
      toast.toast({
        description: 'Enter a valid email address',
        style: { color: 'red' }
      });
      return;
    }

    if (!inviteRole || !userOrgId) {
      toast.toast({
        description: 'Missing required values',
        style: { color: 'red' }
      });

      return;
    }

    useOrganizationStore.getState().setIsLoading(true);

    try {
      const response = await inviteEmailMutation.mutateAsync({
        email,
        role: inviteRole as ExcludeOwner,
        id: userOrgId
      });
      if (response) {
        toast.toast({
          description: `${email} has been invited to join your organization.`,
          style: { color: 'green' }
        });
        pendingInvitesQuery.refetch();
      }
    } catch (error) {
      console.log(error);
      if ((error as any)?.message) {
        toast.toast({
          description: (error as any)?.message,
          style: { color: 'red' }
        });
      }
    } finally {
      useOrganizationStore.getState().setIsLoading(false);
    }
  }

  function handleOpenModal(e: SyntheticEvent) {
    if (currentOrganization && currentOrganization?.role === 'reader') {
      e.preventDefault();
      toast.toast({
        description: `Required permissions not found`,
        style: { color: 'red' }
      });
      return;
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="gap-0.5"
          variant="secondary"
          onClick={handleOpenModal}
        >
          <Plus size={20} /> Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Invite members by email address</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvites}>
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
                  className={cn(
                    'my-2 w-full',
                    !isValidEmail && ' border-red-600'
                  )}
                  placeholder="swarms@example.com"
                  onChange={handleEmailChange}
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
          <small
            className={cn(
              'text-red-500 text-sm invisible',
              !isValidEmail && 'visible'
            )}
          >
            Please enter a valid email address
          </small>
          <DialogFooter className="sm:justify-between mt-3">
            {/* <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={addMoreInvites}
            >
              <PlusCircle size={15} /> Add more
            </Button> */}
            <Button type="submit" className="w-1/3" disabled={!isValidEmail}>
              {isLoading ? <LoadingSpinner /> : inviteButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
