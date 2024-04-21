import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserOrganizationsProps } from '@/modules/platform/settings/organization/types';

interface OrganizationStore {
  currentOrganization: UserOrganizationsProps;
  userOrgId: string | null;
  isLoading: boolean;
  currentOrgId: string;
  setUserOrgId(id: string): void;
  setIsLoading(isLoading: boolean): void;
  setCurrentOrgId(userOrgId: string): void;
  setCurrentOrganization(currentOrganization: UserOrganizationsProps): void;
}

export const useOrganizationStore = create<OrganizationStore>(
  persist<OrganizationStore>(
    (set) => ({
      isLoading: false,
      userOrgId: null,
      currentOrgId: '',
      currentOrganization: {
        role: 'reader',
        organization: { id: '', name: '' }
      },
      setUserOrgId(userOrgId: string) {
        set((state) => ({
          ...state,
          userOrgId
        }));
      },
      setIsLoading(isLoading: boolean) {
        set((state) => ({
          ...state,
          isLoading
        }));
      },
      setCurrentOrgId(currentOrgId: string) {
        set((state) => ({
          ...state,
          currentOrgId
        }));
      },
      setCurrentOrganization(currentOrganization: UserOrganizationsProps) {
        set((state) => ({
          ...state,
          currentOrganization
        }));
      }
    }),
    {
      name: 'user-org-id',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({ userOrgId: state.userOrgId }) as OrganizationStore
    }
  ) as StateCreator<OrganizationStore, [], []>
);
