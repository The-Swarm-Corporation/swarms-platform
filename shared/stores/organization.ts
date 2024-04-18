import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { trpc } from '../utils/trpc/trpc';
import { useEffect, useMemo } from 'react';
import { UserOrganizationsProps } from '@/modules/platform/settings/organization/types';
import { isEmpty } from '../utils/helpers';

interface OrganizationStore {
  currentOrganization: UserOrganizationsProps;
  organizationList: UserOrganizationsProps[];
  userOrgId: string | null;
  isLoading: boolean;
  currentOrgId: string;
  setUserOrgId(id: string): void;
  setIsLoading(isLoading: boolean): void;
  setCurrentOrgId(userOrgId: string): void;
  setOrganizationList(organizationList: UserOrganizationsProps[]): void;
  setCurrentOrganization(currentOrganization: UserOrganizationsProps): void;
}

export const useOrganizationStore = create<OrganizationStore>(
  persist<OrganizationStore>(
    (set) => ({
      isLoading: false,
      userOrgId: null,
      currentOrgId: '',
      organizationList: [],
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
      setOrganizationList(organizationList: UserOrganizationsProps[]) {
        set((state) => ({
          ...state,
          organizationList
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

export const useOrganizations = () => {
  const userOrganizationQuery =
    trpc.organization.getUserPersonalOrganization.useQuery().data;
  const userOrganizationsQuery =
    trpc.organization.getUserOrganizations.useQuery().data;
  const organizationList = useOrganizationStore(
    (state) => state.organizationList
  );
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);

  const filteredOrganizations = useMemo(() => {
    if (!isEmpty(userOrganizationsQuery) && userOrganizationQuery?.data?.id) {
      return userOrganizationsQuery?.filter(
        (org) => org.organization.id !== userOrganizationQuery.data.id
      );
    } else {
      return userOrganizationsQuery;
    }
  }, [userOrganizationsQuery, userOrganizationQuery?.data?.id]);

  const currentOrganization = useMemo(
    () =>
      userOrganizationsQuery?.find(
        (org) => org.organization.id === currentOrgId
      ),
    [userOrganizationsQuery, currentOrgId]
  );

  const currentId = userOrganizationQuery?.data?.id
    ? userOrganizationQuery?.data?.id
    : organizationList?.[0]?.organization?.id;

  useEffect(() => {
    if (currentId) {
      useOrganizationStore.getState().setCurrentOrgId(currentId);
    }
  }, [currentId]);

  useEffect(() => {
    if (userOrganizationQuery?.data?.id) {
      useOrganizationStore
        .getState()
        .setUserOrgId(userOrganizationQuery?.data?.id);
    }

    if (!isEmpty(filteredOrganizations)) {
      useOrganizationStore
        .getState()
        .setOrganizationList(filteredOrganizations as UserOrganizationsProps[]);
    }

    if (!isEmpty(currentOrganization)) {
      useOrganizationStore
        .getState()
        .setCurrentOrganization(currentOrganization as UserOrganizationsProps);
    }
  }, [
    userOrganizationQuery?.data?.id,
    organizationList?.[0]?.organization?.id,
    filteredOrganizations,
    currentOrganization
  ]);

  return {
    userOrganization: userOrganizationQuery
  };
};
