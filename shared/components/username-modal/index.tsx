'use client';

import * as React from "react"
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useToast } from '../ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import Modal from '../modal';
// import { Input } from '@/shared/components/ui/Input';
import { Button } from '../ui/button';
import LoadingSpinner from '../loading-spinner';
import { cn } from "@/shared/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"


export default function UsernameModal() {
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const userQuery = trpc.main.getUser.useQuery();
  const updateUserMutation = trpc.main.updateUsername.useMutation();

  useEffect(() => {
    const userName = userQuery.data?.username;
    if (!userName) {
      setShowModal(true);
    } else {
      setUsername(userName);
    }
  }, [userQuery.data?.username]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value; // Extract value from event
    const trimmedValue = value.replace(/\s+/g, ''); // Remove spaces
    setUsername(trimmedValue);
  
    if (trimmedValue.length < 3 || trimmedValue.length > 16) {
      setError('Username must be between 3 and 16 characters.');
    } else {
      setError('');
    }
  };
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateUserMutation.mutateAsync({ username });
      toast.toast({
        description: 'Username updated successfully',
      });
      setShowModal(false);
    } catch (err: any) {
      console.log('Failed to update username', err);
      toast.toast({
        description: err?.message || 'Failed to update username',
        variant: 'destructive',
      });
    }
  };

  return (
    <Modal
      title="Add your username"
      className="py-4"
      isOpen={showModal}
      onClose={() => null}
    >
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            placeholder="e.g kyeswarmz"
            aria-label="Username"
            aria-required={true}
            value={username}
            onChange={handleInputChange}
            required
            minLength={3}
            maxLength={16}
            className="mt-1"
          />
          <small
            className={cn('text-primary invisible mt-0.5', error && 'visible')}
          >
            {error}
          </small>
        </div>
        <Button
          disabled={updateUserMutation.isPending}
          type="submit"
          className="mt-4 w-[200px]"
        >
          {updateUserMutation.isPending ? <LoadingSpinner /> : 'Submit'}
        </Button>
      </form>
    </Modal>
  );
}
