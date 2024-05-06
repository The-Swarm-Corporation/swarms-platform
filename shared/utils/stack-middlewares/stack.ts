import { NextMiddleware, NextResponse } from 'next/server';
import { MiddlewareFactory } from './types';

/**
 * @param functions refers to middleware functions to be chained together
 * @param index current index of the middleware
 * @returns the next middleware function after the current middleware
 */
export function stackMiddlewares(
  functions: MiddlewareFactory[] = [],
  index = 0,
): NextMiddleware {
  const current = functions[index];
  if (current) {
    const next = stackMiddlewares(functions, index + 1);
    return current(next);
  }
  return () => NextResponse.next();
}
