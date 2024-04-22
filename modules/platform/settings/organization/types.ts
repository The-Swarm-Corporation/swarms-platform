export type Role = 'manager' | 'reader' | 'owner';

export type ExcludeOwner = Exclude<Role, 'owner'>;

export interface MemberProps {
  email?: string;
  name: string;
  role: Role;
  user_id: string;
}

export interface PendingInvitesProps {
  created_at: string;
  email: string | null;
  id: string;
  role: Role | null;
}

export interface OptionRoles {
  label: string;
  value: string | Role;
}

export interface DetailsProps {
  id: string;
  name: string;
}

export interface OrganizationListProps extends DetailsProps {
  role: Role;
  members: MemberProps[];
}

export interface UserOrganizationProps extends DetailsProps {
  created_at?: string;
  owner_user_id?: string;
  public_id?: string;
}

export interface UserOrganizationsProps {
  organization: UserOrganizationProps;
  role: Role;
}

export type PromiseResProps = {
  role?: ExcludeOwner;
  organization_id: string;
  user_id?: string;
};

export type FormProps = { name: string };
