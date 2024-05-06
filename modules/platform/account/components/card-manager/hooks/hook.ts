import { trpc } from '@/shared/utils/trpc/trpc';

const useCardManager = () => {
  const methods = trpc.payment.getUserPaymentMethods.useQuery();
  const attach = trpc.payment.attachPaymentMethod.useMutation();
  const detach = trpc.payment.detachPaymentMethod.useMutation();
  const getDefaultMethod = trpc.payment.getDefaultPaymentMethod.useQuery();
  const setAsDefault = trpc.payment.setDefaultPaymentMethod.useMutation();

  return {
    methods,
    attach,
    detach,
    setAsDefault,
    getDefaultMethod,
  };
};

export default useCardManager;
