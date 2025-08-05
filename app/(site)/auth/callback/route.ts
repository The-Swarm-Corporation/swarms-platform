import { createClient } from '@/shared/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/shared/utils/helpers';
import {
  afterSignin,
  checkRecentFingerprint,
  trackSignupFingerprint,
} from '@/shared/utils/auth-helpers/server';
import { getUserReferralCode } from '@/shared/utils/supabase/admin';
import { isDisposableEmail } from '@/shared/utils/auth-helpers/fingerprinting';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const referralCode = requestUrl.searchParams.get('code_ref');

  const fingerprint = request.cookies.get('sf_rsint')?.value;

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

    if (isNewUser) {
      if (data.user.email && isDisposableEmail(data.user.email)) {
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/signin`,
            'Invalid email provider',
            'Please use a non-temporary email provider for account creation.',
          ),
        );
      }

      if (fingerprint && (await checkRecentFingerprint(fingerprint))) {
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/signin`,
            'Sign-up limit reached',
            'Please wait 24 hours before creating another account.',
          ),
        );
      }

      if (fingerprint) {
        await trackSignupFingerprint(data.user.id, fingerprint);
      }

      if (referralCode) {
        await getUserReferralCode(data.user.id, referralCode);
      }
    }

    const url = await afterSignin(data.user);
    return NextResponse.redirect(`${requestUrl.origin}${url}`);
  }

  return NextResponse.redirect(
    `${requestUrl.origin}${getStatusRedirect('/', 'You have been signed in.')}`,
  );
}
