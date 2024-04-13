import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { getURL } from '@/shared/utils/helpers';
import mailer from '@/shared/utils/mailer';
import { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getUserOrganizationRole } from '@/shared/utils/supabase/organization';
import { Enums, Tables } from '@/types_db';

const organizationRouter = router({
  // get user organization info

  getUserPersonalOrganization: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;

    const org = await ctx.supabase
      .from('swarms_cloud_organizations')
      .select('*')
      .eq('owner_user_id', user.id)
      .single();
    return org;
  }),

  getUserOrganizations: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;

    const allOrgs: {
      role: Enums<'organization_member_role'> | 'owner';
      organization: Partial<Tables<'swarms_cloud_organizations'>>;
    }[] = [];

    // personal
    const personalOrg = await ctx.supabase
      .from('swarms_cloud_organizations')
      .select('*')
      .eq('owner_user_id', user.id)
      .limit(1);

    if (personalOrg.data?.length) {
      allOrgs.push({
        role: 'owner',
        organization: personalOrg.data[0]
      });
    }

    // other
    const members = await ctx.supabase
      .from('swarms_cloud_organization_members')
      .select('*')
      .eq('user_id', user.id)
      .neq('is_deleted', true);

    if (members.data) {
      for (const member of members.data) {
        if (!member.organization_id) {
          continue;
        }
        const org = await ctx.supabase
          .from('swarms_cloud_organizations')
          .select('id,name,public_id')
          .eq('id', member.organization_id)
          .limit(1);
        if (org.data?.length && member.role) {
          allOrgs.push({
            role: member.role,
            organization: org.data[0]
          });
        }
      }
    }
    return allOrgs;
  }),

  getOrganizationInfo: userProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const user = ctx.session.data.session?.user as User;

      const role = await getUserOrganizationRole(id, user.id);
      if (!role) {
        throw new Error('Access denied');
      }
      const org = await ctx.supabase
        .from('swarms_cloud_organizations')
        .select('id,name,public_id')
        .eq('id', id)
        .limit(1);
      return org.data?.[0];
    }),

  // create new organization
  createOrganization: userProcedure
    .input(
      z.object({
        name: z.string().min(3)
      })
    )
    .mutation(async ({ ctx, input: { name } }) => {
      const user = ctx.session.data.session?.user as User;

      // check user already have organization
      const userOrg = await ctx.supabase
        .from('swarms_cloud_organizations')
        .select('*')
        .eq('owner_user_id', user.id)
        .limit(1);

      if (userOrg.data?.length) {
        throw new Error('User already have organization');
      }

      const org = await ctx.supabase
        .from('swarms_cloud_organizations')
        .insert({ name, owner_user_id: user.id });

      if (org.error) {
        throw new Error(org.error.message);
      }
      return org.data;
    }),
  // update name
  updateOrganizationName: userProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3)
      })
    )
    .mutation(async ({ ctx, input: { id, name } }) => {
      const user = ctx.session.data.session?.user as User;

      const userRole = await getUserOrganizationRole(id, user.id);

      if (!userRole || userRole == 'reader') {
        throw new Error('Access denied');
      }
      const org = await ctx.supabase
        .from('swarms_cloud_organizations')
        .update({ name })
        .eq('id', id)
        .select('*');

      if (!org.data?.length) {
        throw new Error('Organization not found');
      }
      return true;
    }),

  // members
  // list
  members: userProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const user = ctx.session.data.session?.user as User;

      // check access: user should be owner or member
      const userRole = await getUserOrganizationRole(id, user.id);

      if (!userRole) {
        throw new Error('Access denied');
      }

      const members: {
        user_id: string;
        role: Enums<'organization_member_role'> | 'owner';
      }[] = [];

      const orgOwner = await ctx.supabase
        .from('swarms_cloud_organizations')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (orgOwner.data?.[0]) {
        members.push({
          user_id: orgOwner.data[0].owner_user_id as string,
          role: 'owner'
        });
      }
      // members
      const orgMembers = await ctx.supabase
        .from('swarms_cloud_organization_members')
        .select('*')
        .eq('organization_id', id)
        .neq('is_deleted', true);

      if (orgMembers.data) {
        for (const member of orgMembers.data) {
          if (!member.user_id || !member.role) {
            continue;
          }
          members.push({
            user_id: member.user_id,
            role: member.role
          });
        }
      }

      return members;
    }),
  // , invite by email
  inviteMemberByEmail: userProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email()
      })
    )
    .mutation(async ({ ctx, input: { id, email } }) => {
      // check access: user should be owner or member with manager role

      const user = ctx.session.data.session?.user as User;
      const userRole = await getUserOrganizationRole(id, user.id);

      if (!userRole || userRole == 'reader') {
        throw new Error('Access denied');
      }
      const orgRes = await ctx.supabase
        .from('swarms_cloud_organizations')
        .select('id,name,public_id')
        .eq('id', id)
        .limit(1);
      const org = orgRes.data?.[0];

      if (!org) {
        throw new Error('Organization not found');
        return;
      }

      // check email already have account
      const { data: userByEmail } = await ctx.supabase
        .from('auth.users')
        .select('*')
        .eq('email', email)
        .limit(1);

      // check last invite record
      const { data: lastInvites } = await ctx.supabase
        .from('swarms_cloud_organization_member_invites')
        .select('*')
        .eq('organization_id', id)
        .eq('email', email)
        .eq('status', 'waiting')
        .limit(1);

      const lastInvite = lastInvites?.[0];
      if (lastInvite) {
        const expireTimeout = 60 * 60 * 24 * 1; // 1 days
        // check if its not  expired
        if (
          new Date().getTime() - new Date(lastInvite.created_at).getTime() <
          expireTimeout
        ) {
          throw new Error('Invite already sent');
        } else {
          // update status to expired
          await ctx.supabase
            .from('swarms_cloud_organization_member_invites')
            .update({ status: 'expired' })
            .eq('id', lastInvite.id);
        }
      }
      // make new invite

      const host_url = getURL();
      const mail = mailer();

      const secret_code = uuidv4();
      const html = `You have been invited to join ${org?.name} Organization. Click here to accept: ${host_url}api/organization/accept-invite?code=${secret_code}`;
      console.log(`to`, email, html);

      try {
        const sendEmail = await mail.sendMail({
          from: `kye@apac.ai`,
          to: email,
          subject: 'Invitation to join organization',
          html
        });
        if (!sendEmail) {
          throw new Error('Failed to send email');
        }

        const res = await ctx.supabase
          .from('swarms_cloud_organization_member_invites')
          .insert({
            organization_id: id,
            email,
            secret_code,
            user_id: userByEmail?.[0].id,
            invite_by_user_id: user.id,
            status: 'waiting'
          });

        return true;
      } catch (error) {
        console.log(error);
        throw new Error('Failed to send email');
      }
    })
  // , remove, change role : soon
});

export { organizationRouter };
