'use client';
import { Button } from '@/shared/components/ui/Button';
import { trpc } from '@/shared/utils/trpc/trpc';

const Test = () => {
  // get
  const org = trpc.organization.getUserPersonalOrganization.useQuery();

  const orgId = org.data?.data?.id || '';

  const orgInfo = trpc.organization.getOrganizationInfo.useQuery({
    id: orgId
  });
  console.log(`orgInfo`, orgInfo.data);

  // add
  const addOrg = trpc.organization.createOrganization.useMutation();

  const add = () => {
    addOrg.mutate({
      name: `Organization ${Math.random()}`
    });
  };
  const upName = trpc.organization.updateOrganizationName.useMutation();
  const updateName = () => {
    upName.mutate({
      id: orgId,
      name: `Organization ${Math.random()}`
    });
  };

  const members = trpc.organization.members.useQuery({
    id: orgId
  });
  console.log(`members`, members.data);

  const getUserAllOrgs = trpc.organization.getUserOrganizations.useQuery();

  console.log(`getUserAllOrgs`, getUserAllOrgs.data);

  const invite = trpc.organization.inviteMemberByEmail.useMutation();

  const inviteByEmail = () => {
    invite
      .mutateAsync({
        id: orgId,
        email: 'amir0friday@gmail.com'
      })
      .then((res) => {
        console.log(`res`, res);
      });
  };
  return (
    <div>
      <h1>Test</h1>
      <Button onClick={add}>Create Organization</Button>
      <Button onClick={updateName}>Update Organization</Button>
      <Button onClick={inviteByEmail}>Invite Email</Button>
    </div>
  );
};

export default Test;
