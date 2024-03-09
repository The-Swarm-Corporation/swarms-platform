import CustomerPortalForm from '@/shared/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/shared/components/ui/AccountForms/EmailForm';
import NameForm from '@/shared/components/ui/AccountForms/NameForm';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { createClient } from '@/shared/utils/supabase/server';

export default async function Account() {
  const supabase = createClient();

  const user = await checkUserSession();

  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.log(error);
  }

  return (
    <section className="mb-32">
      <div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Account
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl pt-4">
            We partnered with Stripe for a simplified billing.
          </p>
        </div>
      </div>
      <div className="p-4">
        <CustomerPortalForm subscription={subscription} />
        <NameForm userName={userDetails?.full_name ?? ''} />
        <EmailForm userEmail={user.email} />
      </div>
    </section>
  );
}
