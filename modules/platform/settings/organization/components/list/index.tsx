import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { Role, UserOrganizationProps } from '../../types';
import { useOrganizationStore } from '@/shared/stores/organization';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { trpc } from '@/shared/utils/trpc/trpc';
import OrganizationListItem from './components/item';
import { isEmpty } from '@/shared/utils/helpers';

interface ListProps {
  userOrganization: UserOrganizationProps | null;
}

export default function OrganizationList({ userOrganization }: ListProps) {
  const userOrganizationsQuery =
    trpc.organization.getUserOrganizations.useQuery();
  const userOrganizationQuery =
    trpc.organization.getUserPersonalOrganization.useQuery();
  const createOrgMutation = trpc.organization.createOrganization.useMutation();

  const isLoading = useOrganizationStore((state) => state.isLoading);
  const userOrgId = useOrganizationStore((state) => state.userOrgId);
  const currentOrgId = useOrganizationStore((state) => state.currentOrgId);
  const organizationList = useOrganizationStore(
    (state) => state.organizationList
  );
  const setCurrentOrgId = useOrganizationStore(
    (state) => state.setCurrentOrgId
  );

  const toast = useToast();
  const [organizationName, setOrganizationName] = useState('');

  const [filterOrg, setFilterOrg] = useState('select-org');
  const activeOrgId = useMemo(
    () =>
      organizationList.find((org) => org?.organization?.id === currentOrgId)
        ?.organization?.id,
    [organizationList, currentOrgId]
  );

  console.log({ currentOrgId });

  function handleFilterOrg(value: string) {
    if (value !== 'select-org') {
      setFilterOrg(value);
      setCurrentOrgId(value);
    } else {
      setFilterOrg(activeOrgId ?? '');
      setCurrentOrgId(activeOrgId ?? '');
    }
  }

  const orgToDisplay = useMemo(() => {
    if (!organizationList) return {};
    return organizationList.find((org) => org?.organization?.id === filterOrg);
  }, [organizationList, filterOrg]) as {
    organization: UserOrganizationProps;
    role: Role;
  };

  const ListOfOrgs = useMemo(() => {
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

  async function handleCreateOrg(e: FormEvent) {
    e.preventDefault();

    const name = organizationName.trim();
    if (name && name.length < 3) {
      toast.toast({
        description: 'Organization name must be at least 3 characters long',
        style: { color: 'red' }
      });
      return;
    }

    useOrganizationStore.getState().setIsLoading(true);

    try {
      const response = await createOrgMutation.mutateAsync({
        name: organizationName
      });
      console.log(response);
      toast.toast({
        description: `${organizationName} organization created.`
      });
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      userOrganizationQuery.refetch();
      userOrganizationsQuery.refetch();
      setOrganizationName("");
    } catch (error) {
      console.log(error);
      if ((error as any)?.message) {
        toast.toast({
          description: (error as any)?.message,
          style: { color: 'red' }
        });
      }
    } finally {
      useOrganizationStore.getState().setIsLoading(false);
    }
  }

  useEffect(() => {
    if (activeOrgId) {
      setFilterOrg(activeOrgId);
    }
  }, [activeOrgId]);

  return (
    <section className="mt-9">
      <div className="flex items-center justify-between flex-col sm:flex-row">
        <h3 className="text-xl">All Organizations</h3>

        <div className="flex items-center justify-center gap-3 mt-2 sm:mt-0">
          <Dialog>
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
              <div className="mt-2">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={organizationName}
                  className="my-2 w-full"
                  onChange={(value) => {
                    setOrganizationName(value);
                  }}
                />
                <DialogFooter className="mt-3 sm:justify-center">
                  <Button
                    className="w-2/4"
                    aria-label="Create organization"
                    onClick={handleCreateOrg}
                  >
                    {isLoading ? <LoadingSpinner /> : 'Create'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-10 mb-14">
        <h4 className="mb-3 text-muted-foreground">Personal organization</h4>

        <div className="flex flex-col items-center justify-center w-full">
          {userOrganizationsQuery.isLoading ? (
            <LoadingSpinner />
          ) : userOrganization?.owner_user_id &&
            !userOrganizationsQuery.isLoading ? (
            <div className="w-full">
              <OrganizationListItem
                {...userOrganization}
                role="owner"
                isActive={currentOrgId === userOrganization.id}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border rounded-md px-2 sm:px-4 py-4 sm:py-8 text-card-foreground mb-8 gap-2 w-full">
              <h3 className="opacity-60">No Organization Created</h3>
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
              {ListOfOrgs?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center justify-center border rounded-md px-2 sm:px-4 py-4 sm:py-8 text-card-foreground mb-8 gap-2">
          {userOrganizationsQuery.isLoading ? (
            <LoadingSpinner />
          ) : !isEmpty(orgToDisplay) && !userOrganizationsQuery.isLoading ? (
            <OrganizationListItem
              isActive={currentOrgId === orgToDisplay?.organization?.id}
              role={orgToDisplay?.role}
              name={orgToDisplay?.organization?.name}
              handleCurrentOrgId={() =>
                setCurrentOrgId(orgToDisplay?.organization?.id)
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
