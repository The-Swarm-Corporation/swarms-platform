import { trpc } from '@/shared/utils/trpc/trpc';

const useCardManager = () => {
  const methods = trpc.getUserPaymentMethods.useQuery();
  const attach = trpc.attachPaymentMethod.useMutation();
  const detach = trpc.detachPaymentMethod.useMutation();
  const getDefaultMethod = trpc.getDefaultPaymentMethod.useQuery();
  const setAsDefault = trpc.setDefaultPaymentMethod.useMutation();

  return {
    methods,
    attach,
    detach,
    setAsDefault,
    getDefaultMethod
  };
};

export default useCardManager;
