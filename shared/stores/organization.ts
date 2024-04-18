import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { trpc } from '../utils/trpc/trpc';
import { useEffect, useMemo, useState } from 'react';
import { UserOrganizationsProps } from '@/modules/platform/settings/organization/types';
import { isEmpty } from '../utils/helpers';

interface OrganizationStore {
  userOrgId: string | null;
  isLoading: boolean;
  setIsLoading(isLoading: boolean): void;
  setUserOrgId(id: string): void;
}

export const useOrganizationStore = create<OrganizationStore>(
  persist<OrganizationStore>(
    (set) => ({
      isLoading: false,
      userOrgId: null,
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
  const [currentOrgId, setCurrentOrgId] = useState('');
  const [organizationList, setOrganizationList] = useState<
    UserOrganizationsProps[]
  >([]);

  const userOrganization =
    trpc.organization.getUserPersonalOrganization.useQuery().data;
  const userOrganizations =
    trpc.organization.getUserOrganizations.useQuery().data;

  const filteredOrganizations = useMemo(() => {
    if (!isEmpty(userOrganizations) && userOrganization?.data?.id) {
      return userOrganizations?.filter(
        (org) => org.organization.id !== userOrganization.data.id
      );
    } else {
      return userOrganizations;
    }
  }, [userOrganizations, userOrganization?.data?.id]);

  const currentOrganization = useMemo(
    () =>
      userOrganizations?.find((org) => org.organization.id === currentOrgId),
    [userOrganizations, currentOrgId]
  );

  const handleCurrentOrgId = (id: string) => {
    setCurrentOrgId(id);
  };

  useEffect(() => {
    const currentId = userOrganization?.data?.id
      ? userOrganization?.data?.id
      : organizationList?.[0]?.organization?.id;

    if (userOrganization?.data?.id) {
      useOrganizationStore.getState().setUserOrgId(userOrganization?.data?.id);
    }

    if (currentId) {
      setCurrentOrgId(currentId);
    }

    if (filteredOrganizations && filteredOrganizations.length > 0) {
      setOrganizationList(filteredOrganizations as UserOrganizationsProps[]);
    }
  }, [
    userOrganization?.data?.id,
    organizationList?.[0]?.organization?.id,
    filteredOrganizations,
  ]);

  return {
    organizationList,
    currentOrgId,
    currentOrganization,
    userOrganization,
    handleCurrentOrgId
  };
};
