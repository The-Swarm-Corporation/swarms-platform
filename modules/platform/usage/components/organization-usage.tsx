import { OrganizationUsage as OrgUsage } from '@/shared/utils/api/usage';
import { isEmpty } from '@/shared/utils/helpers';
import React from 'react';

export default function OrganizationUsage({
  organizationUsage,
}: {
  organizationUsage: OrgUsage | null;
}) {
  if (!organizationUsage) return null;

  function OrganizationCard({ name, totalReqCount, models }: OrgUsage) {
    return (
      <div className="mb-4">
        <div className="flex p-2 transition-custom mb-2 text-sm overflow-hidden shadow-4xl rounded-md hover:shadow-5xl bg-secondary text-white justify-between items-center hover:scale-[1.02]">
          <h3 className="font-bold drop-shadow-sm text-xs">{name}</h3>
          <span>{totalReqCount?.toLocaleString()} requests</span>
        </div>
        <ul className="p-0">
          {Object.entries(models || {}).map(([model, count]) => {
            return (
              <li
                key={model}
                className="flex p-2 transition-custom mb-2 text-xs shadow-2xl rounded-md hover:shadow-5xl bg-teal-900 justify-between items-center"
              >
                <p className="font-medium">{model}</p>
                <span>{count?.toLocaleString()} requests</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">User Organization</h2>
      <OrganizationCard
        name={organizationUsage?.name ?? ''}
        totalReqCount={organizationUsage?.totalReqCount}
        models={organizationUsage?.models ?? {}}
      />

      {!isEmpty(organizationUsage?.users) && (
        <h2 className="my-6"> Primary Users</h2>
      )}
      {organizationUsage?.users?.map((user) => (
        <OrganizationCard
          key={user.email}
          name={user.email}
          models={user.modelsUsed}
          totalReqCount={user?.totalRequests}
        />
      ))}
    </div>
  );
}
