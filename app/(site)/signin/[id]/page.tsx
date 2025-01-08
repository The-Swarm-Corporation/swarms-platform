import Logo from '@/shared/components/icons/Logo';
import { createClient } from '@/shared/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
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
import crypto from 'crypto';

// Security constants
const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim();

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window

  const current = rateLimitMap.get(ip) || { count: 0, timestamp: now };
  
  if (now - current.timestamp > windowMs) {
    current.count = 1;
    current.timestamp = now;
  } else {
    current.count++;
  }
  
  rateLimitMap.set(ip, current);
  return current.count <= maxRequests;
};

// CSRF Protection
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export default async function SignIn({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
}) {
  // Set security headers
  const headersList = headers();
  headersList.set('Content-Security-Policy', CSP_HEADER);
  headersList.set('X-Frame-Options', 'DENY');
  headersList.set('X-Content-Type-Options', 'nosniff');
  headersList.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headersList.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headersList.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Rate limiting
  const clientIP = headers().get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return new Response('Too Many Requests', { status: 429 });
  }

  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Secure view handling
  let viewProp: string;
  if (typeof params.id === 'string' && viewTypes.includes(params.id)) {
    viewProp = params.id;
  } else {
    const preferredSignInView = cookies().get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  // Initialize Supabase client
  const supabase = createClient();

  // Protected user session check
  const startTime = process.hrtime();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Add minimum processing time to prevent timing attacks
  const [seconds, nanoseconds] = process.hrtime(startTime);
  if (seconds * 1e9 + nanoseconds < 100000000) { // Minimum 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (userError) {
    console.error('Auth error occurred');
    return redirect('/error?code=auth_error');
  }

  // Session checks with CSRF protection
  if (user && viewProp !== 'update_password') {
    const csrfToken = generateCSRFToken();
    cookies().set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return redirect('/');
  } else if (!user && viewProp === 'update_password') {
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
            />
          )}
          {viewProp === 'email_signin' && (
            <EmailSignIn
              allowPassword={allowPassword}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
            />
          )}
          {viewProp === 'forgot_password' && (
            <ForgotPassword
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
            />
          )}
          {viewProp === 'update_password' && (
            <UpdatePassword 
              redirectMethod={redirectMethod}
            />
          )}
          {viewProp === 'signup' && (
            <SignUp 
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
            />
          )}
          {viewProp !== 'update_password' &&
            viewProp !== 'signup' &&
            allowOauth && (
              <>
                <Separator text="Third-party sign-in" />
                <OauthSignIn />
              </>
            )}
        </Card>
      </div>
    </div>
  );
}
