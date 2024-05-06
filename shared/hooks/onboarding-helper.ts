import { trpc } from '@/shared/utils/trpc/trpc';

const useOnboardingHelper = () => {
  const getOnboarding = trpc.panel.getOnboarding.useQuery();
  const updateOnboarding = trpc.panel.updateOnboarding.useMutation();
  return {
    getOnboarding,
    updateOnboarding,
  };
};

export default useOnboardingHelper;
