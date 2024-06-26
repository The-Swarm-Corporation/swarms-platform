import React, { FormEvent, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import Input from '@/shared/components/ui/Input';
import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';

const emailRegExp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default function NewsLetter() {
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const toast = useToast();

  const subscribeMutation = trpc.main.subscribeNewsletter.useMutation();
  const subscribed = trpc.main.getSubscribedNewsletter.useQuery();
  const isSubscribed = subscribed.data;

  function handleEmailChange(value: string) {
    setEmail(value);
    setIsValidEmail(emailRegExp.test(value));
  }

  async function subscribe(e: FormEvent) {
    e.preventDefault();

    const _email = email.trim();
    if (_email.length < 3 && !isValidEmail) {
      toast.toast({
        description: 'Enter a valid email address',
        style: { color: 'red' },
      });
      return;
    }

    subscribeMutation
      .mutateAsync({ email })
      .then(() => {
        toast.toast({
          description: 'You have successfully subscribed to our newsletter',
          style: { color: 'green' },
        });
        setOpenModal(false);
      })
      .catch((err) => {
        toast.toast({
          description: err.message,
          style: { color: 'red' },
        });
      });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSubscribed && !subscribed.isLoading) {
        setOpenModal(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isSubscribed]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'hidden',
            !isSubscribed && !subscribed.isLoading && 'block',
          )}
        >
          Subscribe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogClose />

        <small className="text-gray-400 text-sm">
          Automation Magic in your inbox
        </small>

        <h2 className="mt-2 mb-7 w-3/4 text-lg md:text-xl">
          Sign up to get the best daily or weekly updates on the best best
          multi-modal agents and prompts that automates tasks in lesser time and
          more efficiently.
        </h2>

        <form onSubmit={subscribe} className="w-full">
          <label htmlFor="email" className="text-right hidden">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            className={cn(
              'w-full outline-none border-b-2 dark:border-white',
              !isValidEmail && ' !border-red-600',
            )}
            placeholder="swarms@example.com"
            onChange={handleEmailChange}
          />
          <small
            className={cn(
              'text-red-500 text-xs invisible mb-4',
              !isValidEmail && 'visible',
            )}
          >
            Enter a valid email address
          </small>

          <Button
            type="submit"
            disabled={!isValidEmail || subscribeMutation.isPending}
            className={cn('w-full', !isValidEmail ? 'mt-2' : '')}
          >
            I'm in
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
