import { useOrganizationStore } from '@/shared/stores/organization';
import { isEmpty } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useEffect, useMemo } from 'react';
import { UserOrganizationsProps } from '../types';
import { useQueryMutaion } from './useQueryMutation';

export const useOrganizations = () => {
  const { query } = useQueryMutaion({});

  const userOrgData = query.organization.data;
  const usersOrgData = query.organizations.data;

  const organizationList = useOrganizationStore(
    (state) => state.organizationList
  );
  const setOrganizationList = useOrganizationStore(
    (state) => state.setOrganizationList
  );
  const setCurrentOrgId = useOrganizationStore(
    (state) => state.setCurrentOrgId
  );
  const setCurrentOrganization = useOrganizationStore(
    (state) => state.setCurrentOrganization
  );
  const setUserOrgId = useOrganizationStore((state) => state.setUserOrgId);
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);

  // filter userOrganizations data to remove user's personal organization if among the organization list
  const filteredOrganizations = useMemo(() => {
    if (!isEmpty(usersOrgData) && userOrgData?.data?.id) {
      return usersOrgData?.filter(
        (org) => org.organization.id !== userOrgData.data.id
      );
    } else {
      return usersOrgData;
    }
  }, [usersOrgData, userOrgData?.data?.id]);

  // user's current selected organization from userOrganizations query
  const currentOrganization = useMemo(
    () => usersOrgData?.find((org) => org.organization.id === currentOrgId),
    [usersOrgData, currentOrgId]
  );

  useEffect(() => {
    const userOrgId = userOrgData?.data?.id; //user's personal organization (if created)
    const currentId = userOrgId || organizationList?.[0]?.organization?.id;

    setCurrentOrgId(currentId);

    if (!isEmpty(filteredOrganizations)) {
      setOrganizationList(filteredOrganizations as UserOrganizationsProps[]);
    }

    if (!isEmpty(currentOrganization)) {
      setCurrentOrganization(currentOrganization as UserOrganizationsProps);
    }

    if (!isEmpty(userOrgId)) {
      setUserOrgId(userOrgId ?? '');
    }
  }, [
    userOrgData?.data?.id,
    organizationList?.[0]?.organization?.id,
  ]);

  return {
    userOrgData
  };
};
