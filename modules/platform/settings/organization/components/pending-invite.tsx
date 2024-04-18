import React from 'react';
import { ShieldX } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import InviteModal from './team/components/invite-modal';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { trpc } from '@/shared/utils/trpc/trpc';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useOrganizationStore } from '@/shared/stores/organization';
import { PendingInvitesProps, UserOrganizationsProps } from '../types';

export default function PendingInvites({
  userOrgId,
  currentOrganization
}: {
  userOrgId: string;
  currentOrganization: UserOrganizationsProps;
}) {
  const pendingInvites = trpc.organization.pendingInvites.useQuery({
    organization_id: userOrgId
  });
  const cancelledInvitesMutation = trpc.organization.cancelInvite.useMutation();

  const isLoading = useOrganizationStore((state) => state.isLoading);
  const setisLoading = useOrganizationStore((state) => state.setIsLoading);

  const toast = useToast();

  const pendingInvitations = pendingInvites.data;

  async function handleCancelInvite(email: string) {
    setisLoading(true);
    try {
      const response = await cancelledInvitesMutation.mutateAsync({
        email,
        organization_id: userOrgId
      });
      if (response) {
        toast.toast({ description: `Invite has been cancelled for ${email}` });
        pendingInvites.refetch();
      }
    } catch (error) {
      if ((error as any)?.message) {
        console.error(error);
        toast.toast({ description: (error as any)?.message });
      }
    } finally {
      setisLoading(false);
    }
  }

  function renderItem({ id, email }: PendingInvitesProps) {
    return (
      <div
        key={id}
        className="flex justify-between border rounded-md px-4 py-8 text-card-foreground hover:opacity-80 w-full cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 flex justify-center items-center bg-secondary text-white rounded-full uppercase">
            {email?.charAt(0)}
          </span>
          <p>{email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                aria-label="Cancel invite"
                // onClick={() => handleCancelInvite(email as string)}
              >
                Cancel <ShieldX size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[320px] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  Do you wish to cancel invite for {email}?
                </DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <DialogFooter className="mt-3 flex items-center justify-center gap-4">
                  <Button
                    className="w-2/4"
                    aria-label="Yes"
                    onClick={() => null}
                  >
                    No
                  </Button>
                  <Button
                    className="w-2/4"
                    aria-label="Yes"
                    onClick={() => handleCancelInvite(email as string)}
                  >
                    Yes
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            onClick={() => handleCancelInvite(email as string)}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <span className="flex gap-2">
                Cancel <ShieldX size={20} />
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (
    currentOrganization?.role !== 'owner' &&
    currentOrganization?.role !== 'manager'
  ) {
    return null;
  }

  return (
    <div className="mt-16 mb-20">
      <h3 className="mb-2 text-xl">Pending invitations</h3>
      <span className="text-muted-foreground text-sm">
        All invitations waiting to be accepted
      </span>

      <div className="flex flex-col items-center justify-center border rounded-md px-4 py-8 text-card-foreground my-8">
        {pendingInvites.isLoading ? (
          <LoadingSpinner />
        ) : pendingInvitations && pendingInvitations?.length > 0 ? (
          pendingInvitations?.map(renderItem)
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 opacity-80">
            <h3 className="mb-2 text-xl">Invite Team Members</h3>
            <InviteModal
              userOrgId={userOrgId}
              currentOrganization={currentOrganization}
            />
          </div>
        )}
      </div>
    </div>
  );
}
