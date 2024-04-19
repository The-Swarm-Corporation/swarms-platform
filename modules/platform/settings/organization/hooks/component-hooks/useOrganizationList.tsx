import { useOrganizationStore } from '@/shared/stores/organization';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Role,
  UserOrganizationProps,
  UserOrganizationsProps
} from '../../types';
import { useQueryMutaion } from '../useQueryMutation';
import { useFormMutation } from '../useFormMutation';

export function useOrganizationList() {
  const { query, mutation } = useQueryMutaion({});
  const userQuery = query.organization;
  const createMutation = mutation.create;
  const updateMutation = mutation.update;

  const { handleFormMutation } = useFormMutation();

  const organizationList = useOrganizationStore(
    (state) => state.organizationList
  );
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);
  const setCurrentOrgId = useOrganizationStore(
    (state) => state.setCurrentOrgId
  );
  const [filterOrg, setFilterOrg] = useState('select-org');

  const createOrganization = (event: FormEvent<HTMLFormElement>) =>
    handleFormMutation({
      e: event,
      query: userQuery,
      mutationFunction: createMutation,
      successMessage: 'Organization has been created'
    });

  const updateOrganization = (event: FormEvent<HTMLFormElement>) =>
    handleFormMutation({
      e: event,
      query: userQuery,
      mutationFunction: updateMutation,
      successMessage: 'Organization has been updated'
    });

  const activeOrgId =
    useMemo(
      () =>
        organizationList.find((org) => org?.organization?.id === currentOrgId)
          ?.organization?.id,
      [organizationList, currentOrgId]
    ) ?? '';

  // selects current organization or returns
  function handleFilterOrg(value: string) {
    if (value !== 'select-org') {
      setFilterOrg(value);
      setCurrentOrgId(value);
    } else {
      setFilterOrg(activeOrgId);
      setCurrentOrgId(activeOrgId);
    }
  }

  const filteredOrg = useMemo(() => {
    if (!organizationList) return {};
    return organizationList.find((org) => org?.organization?.id === filterOrg);
  }, [organizationList, filterOrg]) as {
    organization: UserOrganizationProps;
    role: Role;
  };

  // returns list of organizations to select from
  // e.g [{ name: 'Select an organization', id: 'select-org' }, { name: 'Swarms', id: 'select-id' }]
  const listOfOrgs = useMemo(() => {
    return organizationList.reduce(
      (acc, curr) => {
        acc.push({
          name: curr?.organization?.name,
          id: curr?.organization?.id
        });
        return acc;
      },
      [{ name: 'Select an organization', id: 'select-org' }]
    );
  }, [organizationList]);

  useEffect(() => {
    if (activeOrgId) {
      setFilterOrg(activeOrgId);
    }
  }, [activeOrgId]);

  return {
    createOrganization,
    updateOrganization,
    handleFilterOrg,
    listOfOrgs,
    filteredOrg,
    filterOrg
  };
}
