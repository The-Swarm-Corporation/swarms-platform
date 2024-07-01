import React, { memo } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { UserOrganizationProps, UserOrganizationsProps } from '../../types';
import { useOrganizationStore } from '@/shared/stores/organization';
import LoadingSpinner from '@/shared/components/loading-spinner';
import OrganizationListItem from './components/item';
import { isEmpty } from '@/shared/utils/helpers';
import { useOrganizationList } from '../../hooks/list';
import { useQueryMutation } from '../../hooks/organizations';

interface ListProps {
  userOrgData: UserOrganizationProps | null;
  userOrgsData: UserOrganizationsProps[];
}

function OrganizationList({ userOrgData, userOrgsData }: ListProps) {
  const {
    createOrganization,
    updateOrganization,
    handleFilterOrg,
    setOpenDialog,
    listOfOrgs,
    filteredOrg,
    filterOrg,
    openDialog,
  } = useOrganizationList({ userOrgsData });

  const { query } = useQueryMutation();

  const userOrgId = useOrganizationStore((state) => state.userOrgId);
  const isLoading = useOrganizationStore((state) => state.isLoading);
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);
  const setCurrentOrgId = useOrganizationStore(
    (state) => state.setCurrentOrgId,
  );

  return (
    <section className="mt-9">
      <div className="flex items-center justify-between flex-col sm:flex-row">
        <h3 className="text-xl">All Organizations</h3>

        <div className="flex items-center justify-center gap-3 mt-2 sm:mt-0">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button
                className="gap-0.5"
                variant="secondary"
                aria-label="Create organization"
                title={
                  userOrgId
                    ? 'User already has an organization'
                    : 'Create organization'
                }
                disabled={!!userOrgId}
              >
                <Plus size={20} /> Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[320px] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a new organization</DialogTitle>
              </DialogHeader>
              <form onSubmit={createOrganization} className="mt-2">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  aria-label="Name"
                  className="my-2 w-full"
                />
                <DialogFooter className="mt-3 sm:justify-center">
                  <Button
                    type="submit"
                    className="w-2/4"
                    aria-label="Create organization"
                  >
                    {isLoading ? <LoadingSpinner /> : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-10 mb-14">
        <h4 className="mb-3 text-muted-foreground">Personal organization</h4>

        <div className="flex flex-col items-center justify-center w-full">
          {query?.organization?.isLoading ? (
            <LoadingSpinner />
          ) : userOrgData?.owner_user_id && !query?.organization?.isLoading ? (
            <div className="w-full">
              <OrganizationListItem
                {...userOrgData}
                role="owner"
                updateOrganization={updateOrganization}
                handleCurrentOrgId={() => setCurrentOrgId(userOrgData.id)}
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border rounded-md px-2 sm:px-4 py-4 sm:py-8 text-card-foreground mb-8 gap-2 w-full">
              <h3 className="opacity-60">No Personal Organization Created</h3>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-muted-foreground">List of Organizations</h4>

          <Select value={filterOrg} onValueChange={handleFilterOrg}>
            <SelectTrigger className="w-2/4 md:w-2/4">
              <SelectValue placeholder={filterOrg} />
            </SelectTrigger>
            <SelectContent>
              {listOfOrgs?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center justify-center border rounded-md px-2 sm:px-4 py-4 text-card-foreground mb-8 gap-2">
          {query?.organizations?.isLoading ? (
            <LoadingSpinner />
          ) : !isEmpty(filteredOrg) && !query?.organizations?.isLoading ? (
            <OrganizationListItem
              role={filteredOrg?.role}
              name={filteredOrg?.organization?.name}
              handleCurrentOrgId={() =>
                setCurrentOrgId(filteredOrg?.organization?.id)
              }
            />
          ) : (
            <h3 className="opacity-60 py-5">
              Select from organizations listed
            </h3>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(OrganizationList);
