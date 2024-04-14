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
