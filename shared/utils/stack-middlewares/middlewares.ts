import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { MiddlewareFactory } from './types';
import { createClient } from '@/shared/utils/supabase/server';
import { updateSession } from '@/shared/utils/supabase/middleware';

const withAuthentication: MiddlewareFactory = (next) => {
  // Variable used to prevent multiple redirects
  let redirected = false;

  return async (req: NextRequest, _next: NextFetchEvent) => {
    // Get the previous URL from the headers
    const previousUrl = req.headers.get('referer');

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && req.nextUrl.pathname === '/') {
      if (!redirected) {
        redirected = true;
        return NextResponse.redirect(
          new URL('/platform/explorer', req.nextUrl),
        );
      }

      return NextResponse.redirect(
        new URL(previousUrl || '/platform/explorer', req.nextUrl),
      );
    }

    return next(req, _next);
  };
};

const withUpdateSession: MiddlewareFactory = (next) => {
  return async (req: NextRequest, _next: NextFetchEvent) => {
    await updateSession(req);
    return next(req, _next);
  };
};

export const middlewares = [withUpdateSession, withAuthentication];
