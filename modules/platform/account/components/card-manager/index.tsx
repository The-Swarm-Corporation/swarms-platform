'use client';

import { Button } from '@/shared/components/ui/button';
import { getStripe } from '@/shared/utils/stripe/client';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import useCardManager from './hooks/hook';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import Modal from '@/shared/components/modal';
import React, { useEffect, useState } from 'react';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { Trash } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useSearchParams } from 'next/navigation';
import { isEmpty } from '@/shared/utils/helpers';
import { useTheme } from 'next-themes';

const CardManagerInside = () => {
  const manager = useCardManager();
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const theme = useTheme();

  const searchParams = useSearchParams();
  const cardAvailable = searchParams?.get('card_available');

  useEffect(() => {
    if (
      isEmpty(manager.methods.data) &&
      cardAvailable &&
      cardAvailable === 'false'
    ) {
      setIsAddCardModalOpen(true);
    } else {
      setIsAddCardModalOpen(false);
    }
  }, [manager.methods.data, cardAvailable]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    const element = elements.getElement(CardElement);
    if (!element) {
      return;
    }
    const result = await stripe.createPaymentMethod({
      element,
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      manager.attach
        .mutateAsync({
          payment_method_id: result.paymentMethod.id,
        })
        .then((res) => {
          manager.methods.refetch();
          toast.toast({
            title: 'Card Added',
          });
          setIsAddCardModalOpen(false);
        });
    }
  };

  const detachCard = (id: string) => {
    if (manager.detach.isPending) return;
    manager.detach
      .mutateAsync({
        payment_method_id: id,
      })
      .then(() => {
        manager.methods.refetch();
        toast.toast({
          title: 'Card Removed',
        });
      });
  };
  const currentDetachingPaymentMethod =
    manager.detach.variables?.payment_method_id;

  const setPaymentMethodAsDefault = (id: string) => {
    if (manager.setAsDefault.isPending) return;
    // if its already default, dont do anything
    if (manager.getDefaultMethod.data === id) return;
    manager.setAsDefault
      .mutateAsync({
        payment_method_id: id,
      })
      .then(() => {
        manager.getDefaultMethod.refetch();
        toast.toast({
          title: 'Default Card Updated',
        });
      });
  };
  const currentSettingDefaultPaymentMethod =
    manager.setAsDefault.isPending &&
    manager.setAsDefault.variables?.payment_method_id;
  return (
    <>
      <Modal
        title="Add Card"
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: theme.theme === 'dark' ? '#ffffff' : '#000000',
                  '::placeholder': {
                    color: theme.theme === 'dark' ? '#aab7c4' : '#767676',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
          <Button
            disabled={!stripe || !elements || manager.attach.isPending}
            className="mt-4"
            type="submit"
          >
            Add
          </Button>
        </form>
      </Modal>
      <div className="flex flex-col gap-4 w-full border rounded-md p-4 text-card-foreground">
        <h1 className="text-base font-bold">Manage Cards</h1>
        <div className="flex flex-col items-center justify-center p-1 gap-2">
          {manager.methods.isLoading && <LoadingSpinner />}
          {!manager.methods.data?.length && !manager.methods.isLoading && (
            <div className="text-muted-foreground">No cards added yet</div>
          )}
          {manager.methods.data?.map(({ card, id }) => {
            return (
              <div
                key={id}
                className={cn(
                  'flex flex-col gap-2 items-center justify-between w-full p-2 bg-card-background rounded-md text-muted-foreground',
                  manager.getDefaultMethod.data === id
                    ? 'border border-red-500'
                    : 'border cursor-pointer',
                  currentSettingDefaultPaymentMethod === id &&
                    'opacity-50 cursor-not-allowed',
                )}
                onClick={() => setPaymentMethodAsDefault(id)}
              >
                <div className="w-full flex justify-between items-center gap-1">
                  <span className="flex gap-1 text-sm">
                    <span className="uppercase">{card?.brand}</span>
                    ending in {card?.last4}
                  </span>
                  <Trash
                    onClick={() => detachCard(id)}
                    className={cn(
                      'cursor-pointer text-gray-500 hover:text-white rounded-md ',
                      currentDetachingPaymentMethod === id &&
                        'opacity-50 cursor-not-allowed',
                    )}
                    size={16}
                  />
                </div>
                <div className="w-full flex gap-2 justify-between items-center">
                  <div>
                    {manager.getDefaultMethod.data === id && (
                      <span className="text-sm">Default</span>
                    )}
                  </div>
                  <span className="text-sm">
                    {card?.exp_year}/{card?.exp_month}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <Button onClick={() => setIsAddCardModalOpen(true)}>Add Card</Button>
        </div>
      </div>
    </>
  );
};
const CardManager = () => {
  const stripePromise = getStripe();
  return (
    <Elements stripe={stripePromise}>
      <CardManagerInside />
    </Elements>
  );
};

export default CardManager;
