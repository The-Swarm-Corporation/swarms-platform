import { createClient } from '@/shared/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/shared/utils/helpers';
import { afterSignin } from '@/shared/utils/auth-helpers/server';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

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
    const url = await afterSignin(data.user);
    return NextResponse.redirect(`${requestUrl.origin}${url}`);
  }
  NextResponse.redirect(getStatusRedirect('/', 'You have been signed in.'));
}
