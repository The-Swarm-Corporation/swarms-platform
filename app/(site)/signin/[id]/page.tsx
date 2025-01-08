import { NextRequest } from 'next/server';
import Logo from '@/shared/components/icons/Logo';
import { createClient } from '@/shared/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { rateLimit } from '@/shared/utils/rate-limit';
import { validateCSRF } from '@/shared/utils/csrf';
import { sanitizeInput } from '@/shared/utils/security';
import { 
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from '@/shared/utils/auth-helpers/settings';
import { Card } from '@/shared/components/spread_sheet_swarm/ui/card';
import PasswordSignIn from '@/shared/components/ui/AuthForms/PasswordSignIn';
import EmailSignIn from '@/shared/components/ui/AuthForms/EmailSignIn';
import Separator from '@/shared/components/ui/AuthForms/Separator';
import OauthSignIn from '@/shared/components/ui/AuthForms/OauthSignIn';
import ForgotPassword from '@/shared/components/ui/AuthForms/ForgotPassword';
import UpdatePassword from '@/shared/components/ui/AuthForms/UpdatePassword';
import SignUp from '@/shared/components/ui/AuthForms/Signup';

// @/shared/constants.ts

export const AUTH_VIEWS = {
  PASSWORD_SIGNIN: 'password_signin',
  EMAIL_SIGNIN: 'email_signin',
  FORGOT_PASSWORD: 'forgot_password',
  UPDATE_PASSWORD: 'update_password',
  SIGNUP: 'signup'
} as const;

// Rate limiting settings
export const MAX_ATTEMPTS = 5; // Maximum number of signin attempts before timeout
export const TIMEOUT_MINUTES = 15; // Lockout period in minutes after max attempts reached

// Session settings
export const SESSION_EXPIRY_HOURS = 24;
export const REFRESH_TOKEN_ROTATION_DAYS = 7;

// Password requirements
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_REQUIRES_LOWERCASE = true;
export const PASSWORD_REQUIRES_UPPERCASE = true;
export const PASSWORD_REQUIRES_NUMBER = true;
export const PASSWORD_REQUIRES_SPECIAL = true;

// OAuth settings
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  MICROSOFT: 'microsoft'
} as const;

// CSRF settings
export const CSRF_TOKEN_EXPIRY_MINUTES = 30;

// Cookie settings
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
} as const;

// Custom error for authentication failures
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Security headers configuration
const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "frame-src 'none'; " +
    "object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Input validation function
const validateAuthInput = (input: string): boolean => {
  // Implement strict input validation
  const sanitized = sanitizeInput(input);
  return typeof sanitized === 'string' && 
         sanitized.length > 0 && 
         sanitized.length <= 256 &&
         /^[a-zA-Z0-9-_/.@]+$/.test(sanitized);
};

export default async function SignIn({
  params,
  searchParams,
  req
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
  req: NextRequest;
}) {
  try {
    // Apply security headers
    const headersList = headers();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      headersList.append(key, value);
    });

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.ip;
    const rateLimitResult = await rateLimit(ip, 'signin', MAX_ATTEMPTS, TIMEOUT_MINUTES);
    if (!rateLimitResult.success) {
      throw new AuthError('Too many attempts. Please try again later.');
    }

    // CSRF protection
    const csrfToken = headersList.get('x-csrf-token');
    if (!await validateCSRF(csrfToken)) {
      throw new AuthError('Invalid CSRF token');
    }

    // Validate and sanitize inputs
    if (params.id && !validateAuthInput(params.id)) {
      throw new AuthError('Invalid input parameters');
    }

    const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
    const viewTypes = getViewTypes();
    const redirectMethod = getRedirectMethod();

    // Strict view type validation
    let viewProp: string;
    if (
      typeof params.id === 'string' && 
      viewTypes.includes(params.id) && 
      Object.values(AUTH_VIEWS).includes(params.id)
    ) {
      viewProp = params.id;
    } else {
      const cookieStore = cookies();
      const preferredSignInView = cookieStore.get('preferredSignInView')?.value || null;
      
      // Validate cookie value
      if (preferredSignInView && !validateAuthInput(preferredSignInView)) {
        throw new AuthError('Invalid preferred sign-in view');
      }
      
      viewProp = getDefaultSignInView(preferredSignInView);
      return redirect(`/signin/${viewProp}`);
    }

    // Secure session handling
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new AuthError('Session validation failed');
    }

    // Strict authentication flow control
    if (user && viewProp !== 'update_password') {
      return redirect('/');
    } else if (!user && viewProp === 'update_password') {
      return redirect('/signin');
    }

    // Implement secure session timeout
    const session = await supabase.auth.getSession();
    if (session?.expires_at && Date.now() >= session.expires_at) {
      await supabase.auth.signOut();
      return redirect('/signin');
    }

    return (
      <div className="flex justify-center height-screen-helper">
        <div className="flex flex-col justify-between max-w-lg p-3 m-auto min-w-[320px] w-80">
          <div className="flex justify-center pb-12">
            <Logo width={64} height={64} />
          </div>
          <Card
            title={
              viewProp === 'forgot_password'
                ? 'Reset Password'
                : viewProp === 'update_password'
                  ? 'Update Password'
                  : viewProp === 'signup'
                    ? 'Sign Up'
                    : 'Sign In'
            }
            className="p-4"
          >
            {viewProp === 'password_signin' && (
              <PasswordSignIn
                allowEmail={allowEmail}
                redirectMethod={redirectMethod}
                csrfToken={csrfToken}
              />
            )}
            {viewProp === 'email_signin' && (
              <EmailSignIn
                allowPassword={allowPassword}
                redirectMethod={redirectMethod}
                disableButton={searchParams.disable_button}
                csrfToken={csrfToken}
              />
            )}
            {viewProp === 'forgot_password' && (
              <ForgotPassword
                allowEmail={allowEmail}
                redirectMethod={redirectMethod}
                disableButton={searchParams.disable_button}
                csrfToken={csrfToken}
              />
            )}
            {viewProp === 'update_password' && (
              <UpdatePassword 
                redirectMethod={redirectMethod}
                csrfToken={csrfToken} 
              />
            )}
            {viewProp === 'signup' && (
              <SignUp 
                allowEmail={allowEmail} 
                redirectMethod={redirectMethod}
                csrfToken={csrfToken}
              />
            )}
            {viewProp !== 'update_password' &&
              viewProp !== 'signup' &&
              allowOauth && (
                <>
                  <Separator text="Third-party sign-in" />
                  <OauthSignIn csrfToken={csrfToken} />
                </>
              )}
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    // Secure error handling
    console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
    return redirect('/error?code=auth_error');
  }
}
