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
import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { DetailsProps, UserOrganizationsProps } from '../../types';
import { useOrganizationStore } from '@/shared/stores/organization';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { trpc } from '@/shared/utils/trpc/trpc';
import OrganizationListItem from './components/item';
import { debounce } from '@/shared/utils/helpers';

interface ListProps {
  organizationList: UserOrganizationsProps[];
  handleActiveOrgId: (name: string, id: string) => void;
  activeOrgId: string;
}

export default function OrganizationList({
  organizationList,
  activeOrgId,
  handleActiveOrgId
}: ListProps) {
  const userOrganization =
    trpc.organization.getUserPersonalOrganization.useQuery();
  const userOrganizations = trpc.organization.getUserOrganizations.useQuery();
  const createOrgMutation = trpc.organization.createOrganization.useMutation();

  const isLoading = useOrganizationStore((state) => state.isLoading);
  const setisLoading = useOrganizationStore((state) => state.setIsLoading);

  const userOrgId = userOrganization?.data?.data?.id;

  const toast = useToast();
  const [organizationName, setOrganizationName] = useState('');
  const [searchOrg, setSearchOrg] = useState('');

  const debouncedSearch = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      setSearchOrg(value);
    }, 100);
    return debouncedFn;
  }, []);

  const isOrgList = organizationList?.length >= 1;

  const organizationsToDisplay = useMemo(() => {
    if (!organizationList) return [];
    return organizationList.filter(
      (org) =>
        !searchOrg ||
        org?.organization?.name?.toLowerCase().includes(searchOrg.toLowerCase())
    );
  }, [organizationList, searchOrg]);

  const handleSearchChange = useCallback(
    (value: string) => {
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  async function handleCreateOrg(e: FormEvent) {
    e.preventDefault();

    const name = organizationName.trim();
    if (name && name.length < 3) {
      toast.toast({
        description: 'Organization name must be at least 3 characters long'
      });
      return;
    }

    setisLoading(true);

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
      userOrganizations.refetch();
    } catch (error) {
      console.log(error);
      if ((error as any)?.message) {
        toast.toast({ description: (error as any)?.message });
      }
    } finally {
      setisLoading(false);
    }
  }

  return (
    <section className="mt-9">
      <div className="flex justify-between flex-col sm:flex-row">
        <div>
          <h3 className="mb-2 text-xl">All Organizations</h3>
          <span className="text-sm text-muted-foreground">
            Aggregate of organizations involved in
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 mt-2 sm:mt-0">
          <Input
            value={searchOrg}
            disabled={!isOrgList}
            readOnly={!isOrgList}
            placeholder="Search orgs..."
            onChange={handleSearchChange}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="gap-0.5"
                variant="secondary"
                aria-label="Create organization"
                title={
                  !!userOrgId
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

      <div className="flex flex-col items-center justify-center border rounded-md px-2 sm:px-4 py-4 sm:py-8 text-card-foreground my-8 gap-2">
        {userOrganizations.isLoading ? (
          <LoadingSpinner />
        ) : organizationsToDisplay.length > 0 &&
          !userOrganizations.isLoading ? (
          organizationsToDisplay?.map((org) => {
            const isActive = activeOrgId === org.organization.id;
            return (
              <OrganizationListItem
                key={org.organization.id}
                name={org.organization.name}
                id={org.organization.id}
                role={org.role}
                isActive={isActive}
                handleActiveOrgId={handleActiveOrgId}
              />
            );
          })
        ) : (
          <h3 className="opacity-70">No organizations are listed</h3>
        )}
      </div>
    </section>
  );
}
