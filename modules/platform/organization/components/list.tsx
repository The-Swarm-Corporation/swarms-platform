'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { getTruncatedString } from '@/shared/utils/helpers';

export default function OrganizationList() {
  const [organizationName, setOrganizationName] = useState('');
  const [organizationList, setOrganizationList] = useState([
    { name: 'Swarms', role: 'Owner', id: '0' },
  ]);

  return (
    <section className="mt-9">
      <div className="flex justify-between flex-col sm:flex-row">
        <div>
          <h3 className="mb-2 text-xl">All Organizations</h3>
          <span className="text-sm text-muted-foreground">
            Aggregate of organizations involved in
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 mt-2 sm:mt-0">
          <Input onChange={() => null} placeholder="Search orgs..." />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="gap-0.5"
                variant="secondary"
                aria-label="Create organization"
              >
                <Plus size={20} /> Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[320px] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a new organization</DialogTitle>
              </DialogHeader>
              <form className="mt-2">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={organizationName}
                  className="my-2 w-full"
                  onChange={(value) => {
                    setOrganizationName(value);
                  }}
                />
                <DialogFooter className="mt-3 sm:justify-center">
                  <Button
                    type="button"
                    className="w-2/4"
                    aria-label="Create organization"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center border rounded-md px-2 sm:px-4 py-4 sm:py-8 text-card-foreground my-8">
        {organizationList.map((org) => {
          const orgName = getTruncatedString(org.name, 20);
          return (
            <div
              key={org.id}
              className="flex justify-between border rounded-md p-2 sm:p-4 text-card-foreground hover:opacity-80 w-full cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 sm:w-10 sm:h-10 text-sm sm:text-base flex justify-center items-center bg-secondary text-white rounded-full uppercase">
                  {org.name.charAt(0)}
                </span>
                <p className="text-xs sm:text-base">{orgName}</p>
              </div>
              <div className="flex items-center gap-4 sm:justify-between sm:max-w-48 sm:w-full">
                <p className="capitalize text-xs sm:text-base">{org.role}</p>
                <Button
                  aria-label="Remove"
                  className="gap-2 py-0 h-8 px-2 sm:px-4 sm:h-9"
                >
                  <span className="hidden sm:inline">Remove</span>{' '}
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
