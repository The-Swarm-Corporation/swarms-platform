import OrganizationList from './components/list';
import OrganizationTeam from './components/team';

export default function Organization({ user }: { user: any }) {
  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Organization</h2>

      <OrganizationList />

      <OrganizationTeam />
    </article>
  );
}
