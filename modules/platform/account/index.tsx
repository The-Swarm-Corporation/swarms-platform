import { Button } from '@/shared/components/ui/Button';
import CardManager from './components/card-manager';
import Credit from './components/credit';
import SubscriptionStatus from './components/subscription-status';
import Link from 'next/link';
import { AUTH } from '@/shared/constants/links';
import ThemeToggle from '@/shared/components/theme-toggle';
import { createClient } from '@/shared/utils/supabase/server';
import CryptoWallet from './components/crypto-wallet';

export default async function Account() {
  //TODO: SWITCH TO AUTH MODALS INSTEAD
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="w-full mb-32">
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Account</h1>
          <div className="min-w-[320px] w-full my-8 flex flex-col gap-4 md:w-2/3 xl:w-2/6">
            <Credit user={user} />
            {user && (
              <>
                <CardManager />
                <SubscriptionStatus />
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Password</h2>
                  <Link href={AUTH.CHANGE_PASSWORD}>
                    <Button variant={'outline'}>Change password</Button>
                  </Link>
                </div>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
        <CryptoWallet user={user} />
      </div>
    </section>
  );
}
