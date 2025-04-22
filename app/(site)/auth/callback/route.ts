import { createClient } from '@/shared/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/shared/utils/helpers';
import { afterSignin } from '@/shared/utils/auth-helpers/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const referralCode = requestUrl.searchParams.get('code_ref');

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again.",
        ),
      );
    }

    const isNewUser =
      data.user.app_metadata.provider &&
      !data.user.app_metadata.is_returning_oauth_user;

    if (isNewUser && referralCode) {
      const { data: referrerData } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrerData?.id) {
        await supabase.from('swarms_cloud_users_referral').insert({
          referrer_id: referrerData.id,
          referred_id: data.user.id,
          status: 'Pending',
        });

        await supabase
          .from('users')
          .update({ referred_by: referralCode })
          .eq('id', data.user.id);
      }
    }

    const url = await afterSignin(data.user);
    return NextResponse.redirect(`${requestUrl.origin}${url}`);
  }
  return NextResponse.redirect(
    getStatusRedirect('/', 'You have been signed in.'),
  );
}
