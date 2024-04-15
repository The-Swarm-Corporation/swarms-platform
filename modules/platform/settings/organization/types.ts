export type Role = 'owner' | 'reader' | 'manager';

export interface MemberProps {
  email: string;
  role: Role;
  id: string;
}

export interface OptionRoles {
  label: string;
  value: string | Role;
}

export interface OrganizationListProps {
  id: string;
  name: string;
  role: Role;
  members: MemberProps[];
}
