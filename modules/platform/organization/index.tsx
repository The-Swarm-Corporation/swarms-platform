'use client';

import React, { useState } from 'react';
import { Plus, PlusCircle } from 'lucide-react';
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

export const roles = [
  { label: 'List Team roles', value: 'Team roles' },
  { label: 'Owner', value: 'owner' },
  { label: 'Manager', value: 'manager' },
  { label: 'Reader', value: 'reader' }
] as const;
export const inviteRoles = roles.slice(1);
export default function Organization() {
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [filterRole, setFilterRole] = useState<string>(roles[0]?.value);
  const [inviteRole, setInviteRole] = useState<string>(
    roles[roles.length - 1]?.value
  );

  return (
    <section className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <div className="mt-9">
        <div className="flex justify-between">
          <div>
            <h3 className="mb-2 text-xl">All Organizations</h3>
            <span className="text-sm text-muted-foreground">
              Aggregate of organizations involved in
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Input onChange={() => null} placeholder="Search orgs..." />

            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-0.5" variant="secondary">
                  <Plus size={20} /> Create
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
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
                    <Button type="button" className="w-2/4">
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border rounded-md px-4 py-8 text-card-foreground my-8 cursor-pointer hover:opacity-80"></div>
      </div>

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
              <form>
                <div className="flex items-center gap-2 w-full my-3">
                  <div className="w-full">
                    <label htmlFor="email" className="text-right">
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
                    <label className="text-right">Role</label>

                    <Select
                      onValueChange={(value) => {
                        setInviteRole(value);
                      }}
                      value={inviteRole}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={inviteRole} />
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
                </div>
                <DialogFooter className="sm:justify-between">
                  <Button type="submit" variant="outline" className="gap-2">
                    <PlusCircle size={15} /> Add more
                  </Button>
                  <Button type="submit" className="w-1/3">Invite</Button>
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

        <div className="flex flex-col items-center justify-center border rounded-md px-4 py-8 text-card-foreground cursor-pointer hover:opacity-80"></div>
      </div>
    </section>
  );
}
