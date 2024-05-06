import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OrganizationStore {
  userOrgId: string | null;
  isLoading: boolean;
  currentOrgId: string;
  setUserOrgId(id: string): void;
  setIsLoading(isLoading: boolean): void;
  setCurrentOrgId(userOrgId: string): void;
}

export const useOrganizationStore = create<OrganizationStore>(
  persist<OrganizationStore>(
    (set) => ({
      isLoading: false,
      userOrgId: null,
      currentOrgId: '',
      setUserOrgId(userOrgId: string) {
        set((state) => ({
          ...state,
          userOrgId,
        }));
      },
      setIsLoading(isLoading: boolean) {
        set((state) => ({
          ...state,
          isLoading,
        }));
      },
      setCurrentOrgId(currentOrgId: string) {
        set((state) => ({
          ...state,
          currentOrgId,
        }));
      },
    }),
    {
      name: 'current-org-id',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          currentOrgId: state.currentOrgId,
          userOrgId: state.userOrgId,
        }) as OrganizationStore,
    },
  ) as StateCreator<OrganizationStore, [], []>,
);
