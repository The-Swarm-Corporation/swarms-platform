import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { MiddlewareFactory } from './types';
import { updateSession } from '@/shared/utils/supabase/middleware';

const withUpdateSession: MiddlewareFactory = (next) => {
  return async (req: NextRequest, _next: NextFetchEvent) => {
    await updateSession(req);
    return next(req, _next);
  };
};

export const middlewares = [withUpdateSession];
