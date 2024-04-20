import { FormEvent } from 'react';
import { useOrganizationStore } from '@/shared/stores/organization';
import { FormProps } from '../types';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import confetti from 'canvas-confetti';

type FormMutationType<T> = {
  mutateAsync: (data: T) => Promise<null | boolean>;
};

type QueryType = {
  refetch: () => void;
};

interface FormMutationProps<T> {
  e?: FormEvent<HTMLFormElement>;
  query?: QueryType;
  data?: T;
  mutationFunction: FormMutationType<T>;
  toastMessage?: string;
}

export function useOrganizationMutation() {
  const toast = useToast();
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);

  async function handleFormMutation<T extends FormProps>({
    e,
    query,
    mutationFunction,
    toastMessage
  }: FormMutationProps<T>) {
    e?.preventDefault();

    let data = Object.fromEntries(new FormData(e?.currentTarget));

    for (const [key, value] of Object.entries(data)) {
      if (!value || value.toString().trim().length < 3) {
        toast.toast({
          description: `${key} must be at least 3 characters long`,
          style: { color: 'red' }
        });
        return;
      }
    }
    useOrganizationStore.getState().setIsLoading(true);

    try {
      const response = await mutationFunction.mutateAsync(data as T);
      console.log(response);
      toast.toast({
        description: toastMessage || 'Request is successful',
        style: { color: 'green' }
      });
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      query?.refetch();

      e?.currentTarget?.reset();
    } catch (error: any) {
      if (error?.message) {
        toast.toast({
          description: error?.message,
          style: { color: 'red' }
        });
      }
    } finally {
      useOrganizationStore.getState().setIsLoading(false);
    }
  }

  async function withOrganizationMutation<T>({
    data,
    query,
    mutationFunction,
    toastMessage
  }: FormMutationProps<T>) {
    if (!currentOrgId) {
      toast.toast({
        description: 'Organization not found',
        style: { color: 'red' }
      });
      return;
    }

    useOrganizationStore.getState().setIsLoading(true);

    try {
      const response = await mutationFunction.mutateAsync(data as T);
      if (response) {
        toast.toast({ description: toastMessage, style: { color: 'green' } });
        query?.refetch();
      }
    } catch (error) {
      if ((error as any)?.message) {
        toast.toast({ description: (error as any)?.message });
      }
    } finally {
      useOrganizationStore.getState().setIsLoading(false);
    }
  }

  return { handleFormMutation, withOrganizationMutation };
}
