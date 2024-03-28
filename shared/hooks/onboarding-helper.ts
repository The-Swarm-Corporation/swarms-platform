import { trpc } from '@/shared/utils/trpc/trpc';

const useOnboardingHelper = () => {
  const getOnboarding = trpc.getOnboarding.useQuery();
  const updateOnboarding = trpc.updateOnboarding.useMutation();
  return {
    getOnboarding,
    updateOnboarding
  };
};

export default useOnboardingHelper;
