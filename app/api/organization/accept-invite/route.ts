import { PLATFORM } from '@/shared/constants/links';
import { submitInviteCode } from '@/shared/utils/api/organization';
import { Database } from '@/types_db';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function GET(req: Request) {
  const params = new URLSearchParams(req.url.split('?')[1]);

  const code = params.get('code');

  if (!code) {
    return new Response('Invalid code', { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
  const session = await supabase.auth.getSession();

  const user = session.data.session?.user.id;
  if (!user) {
    return new Response('Invalid user', { status: 400 });
  }

  try {
    const res = await submitInviteCode(code, user);

    if (!res) {
      return new Response('Invalid code', { status: 400 });
    }
  } catch (e) {
    // @ts-ignore
    return new Response(e.message, { status: 400 });
  }

  const requestUrl = new URL(req.url);
  return NextResponse.redirect(`${requestUrl.origin}${PLATFORM.DASHBOARD}`);
}

export { GET };
