'use client';

import React, { useState } from 'react';
import { ShieldX, CheckCheck, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface PendingInvitesProps {
  id: string;
  organizationName: string;
}

export default function PendingInvites() {
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitesProps[]
  >([]);

  return (
    <div className="mt-16">
      <h3 className="mb-2 text-xl">Pending invitations</h3>
      <span className="text-muted-foreground text-sm">
        All invitations waiting to be accepted
      </span>

      <div className="flex flex-col items-center justify-center border rounded-md px-4 py-16 text-card-foreground my-8">
        {pendingInvitations.length > 0 ? (
          pendingInvitations.map((item) => (
            <div
              key={item?.id}
              className="flex justify-between border rounded-md px-4 py-8 text-card-foreground hover:opacity-80 w-full cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 flex justify-center items-center bg-secondary text-white rounded-full uppercase">
                  {item?.organizationName.charAt(0)}
                </span>
                <p>{item?.organizationName}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button className="gap-2" variant="outline">
                  Accept <CheckCheck size={20} />
                </Button>
                <Button className="gap-2" variant="destructive">
                  Cancel <ShieldX size={20} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 opacity-80">
            <h3 className="mb-2 text-xl">Invite Team Members</h3>
            <Button className="gap-0.5" variant="secondary">
              <Plus size={20} /> Invite
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
