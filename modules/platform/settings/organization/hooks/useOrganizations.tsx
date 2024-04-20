import { useOrganizationStore } from '@/shared/stores/organization';
import { isEmpty } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useEffect, useMemo } from 'react';
import { UserOrganizationsProps } from '../types';
import { useQueryMutation } from './useQueryMutation';

export const useOrganizations = () => {
  const { query } = useQueryMutation();

  const userOrgData = query.organization.data;
  const usersOrgData = query.organizations.data;

  const organizationList = useOrganizationStore(
    (state) => state.organizationList
  );
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);

  const filteredOrganizations = useMemo(() => {
    if (!isEmpty(usersOrgData) && userOrgData?.data?.id) {
      return usersOrgData?.filter(
        (org) => org.organization.id !== userOrgData.data.id
      );
    } else {
      return usersOrgData;
    }
  }, [usersOrgData, userOrgData?.data?.id]);

  const currentOrganization = useMemo(
    () =>
      usersOrgData?.find(
        (org) => org.organization.id === currentOrgId
      ),
    [usersOrgData, currentOrgId]
  );

  const currentId = userOrgData?.data?.id
    ? userOrgData?.data?.id
    : organizationList?.[0]?.organization?.id;

  useEffect(() => {
    if (currentId) {
      useOrganizationStore.getState().setCurrentOrgId(currentId);
    }
  }, [currentId]);

  useEffect(() => {
    if (userOrgData?.data?.id) {
      useOrganizationStore.getState().setUserOrgId(userOrgData?.data?.id);
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
    userOrgData?.data?.id,
    organizationList?.[0]?.organization?.id,
    filteredOrganizations,
    currentOrganization
  ]);

  return {
    userOrgData: userOrgData
  };
};
