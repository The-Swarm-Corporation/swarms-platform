import { SwarmManagement } from '@/shared/components/spreadsheetswarm/main';

export default async function OrganizationPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <SwarmManagement />
    </div>
  );
}
