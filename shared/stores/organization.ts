import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { trpc } from '@/shared/utils/trpc/trpc';

type Role = 'manager' | 'reader' | 'member';

interface OrganizationStore {
  organizations: any[];
  userOrganization: any;
  userOrgId: string | null;
  isLoading: boolean;
  organizationInfo: Record<string, string> | any;
  pendingInvites: any;
  setOrganizations(): void;
  setUserOrganization(): void;
  setIsLoading(isLoading: boolean): void;
  setUserOrgId(): void;
  setOrganizationInfo(orgId: string): void;
  setPendingInvites(orgId: string): void;
}

export const useOrganizationStore = create<OrganizationStore>(
  persist<OrganizationStore>(
    (set) => ({
      organizations: [],
      isLoading: false,
      userOrgId: null,
      userOrganization: { id: '', name: '', role: 'reader' },
      organizationInfo: {},
      pendingInvites: [],
      setOrganizations() {
        const organizations = trpc.organization.getUserOrganizations.useQuery();
        set((state) => ({ ...state, organizations: organizations.data }));
      },
      setUserOrganization() {
        const userOrganization =
          trpc.organization.getUserPersonalOrganization.useQuery();
        set((state) => ({ ...state, userOrganization }));
      },
      setUserOrgId() {
        set((state) => ({
          ...state,
          userOrgId: state.userOrganization?.data?.data?.id
        }));
      },
      setIsLoading(isLoading: boolean) {
        set((state) => ({
          ...state,
          isLoading,
        }));
      },
      setOrganizationInfo(orgId: string) {
        const organizationInfo = trpc.organization.getOrganizationInfo.useQuery(
          { id: orgId }
        );
        set((state) => ({ ...state, organizationInfo }));
      },
      setPendingInvites(orgId: string) {
        const pendingInvites = trpc.organization.pendingInvites.useQuery({
          organization_id: orgId
        });
        set((state) => ({ ...state, pendingInvites }));
      },
    }),
    {
      name: 'user-org-id',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({ userOrgId: state.userOrgId || null }) as OrganizationStore
    }
  ) as StateCreator<OrganizationStore, [], []>
);
