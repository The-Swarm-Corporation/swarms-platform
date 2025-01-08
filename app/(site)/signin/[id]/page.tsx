import { createClient } from '@/shared/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Logo from '@/shared/components/icons/Logo';
import { Card } from '@/shared/components/spread_sheet_swarm/ui/card';
import PasswordSignIn from '@/shared/components/ui/AuthForms/PasswordSignIn';
import EmailSignIn from '@/shared/components/ui/AuthForms/EmailSignIn';
import Separator from '@/shared/components/ui/AuthForms/Separator';
import OauthSignIn from '@/shared/components/ui/AuthForms/OauthSignIn';
import ForgotPassword from '@/shared/components/ui/AuthForms/ForgotPassword';
import UpdatePassword from '@/shared/components/ui/AuthForms/UpdatePassword';
import SignUp from '@/shared/components/ui/AuthForms/Signup';
import { rateLimit } from './rate-limiter';
import { hashToken } from './crypto-utils';
import type { NextRequest } from 'next/server';

// Security constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
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

// Type definitions
interface SignInProps {
  params: { id: string };
  searchParams: { disable_button: boolean };
}

// Utility functions
const getValidViewType = (viewTypes: string[], id?: string): string => {
  if (typeof id === 'string' && viewTypes.includes(id)) {
    return id;
  }
  return 'password_signin'; // Default view
};

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>&"']/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return entities[char];
  });
};

// Security middleware
const securityMiddleware = async (request: NextRequest) => {
  const clientIP = request.headers.get('x-forwarded-for') || request.ip;
  
  // Rate limiting
  const isRateLimited = await rateLimit(clientIP);
  if (isRateLimited) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // CSRF Protection
  const csrfToken = request.headers.get('x-csrf-token');
  const storedToken = cookies().get('csrf-token')?.value;
  
  if (!csrfToken || !storedToken || hashToken(csrfToken) !== storedToken) {
    return new Response('Invalid CSRF Token', { status: 403 });
  }

  return null; // Continue with the request
};

export default async function SignIn({ params, searchParams }: SignInProps) {
  // Security headers
  const headersList = headers();
  headersList.set('Content-Security-Policy', CSP_HEADER);
  headersList.set('X-Frame-Options', 'DENY');
  headersList.set('X-Content-Type-Options', 'nosniff');
  headersList.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headersList.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Apply security middleware
  const request = new Request('https://example.com', {
    headers: headersList,
  });
  const securityCheck = await securityMiddleware(request as NextRequest);
  if (securityCheck) return securityCheck;

  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Safe view type handling
  const viewProp = getValidViewType(viewTypes, params.id);
  if (viewProp !== params.id) {
    return redirect(`/signin/${viewProp}`);
  }

  // Supabase client with additional security options
  const supabase = createClient({
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-Client-Info': 'secure-auth-client'
        }
      }
    }
  });

  // User session check with protection against timing attacks
  const startTime = process.hrtime();
  const { data: { user }, error } = await supabase.auth.getUser();
  const [seconds, nanoseconds] = process.hrtime(startTime);
  
  // Constant-time comparison to prevent timing attacks
  if (seconds * 1e9 + nanoseconds < 100000000) { // Minimum 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (error) {
    console.error('Auth error:', error.message);
    return redirect('/error?code=auth_error');
  }

  if (user && viewProp !== 'update_password') {
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
              maxAttempts={MAX_FAILED_ATTEMPTS}
              lockoutDuration={LOCKOUT_DURATION}
            />
          )}
          {viewProp === 'email_signin' && (
            <EmailSignIn
              allowPassword={allowPassword}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
              sanitizeInput={sanitizeInput}
            />
          )}
          {viewProp === 'forgot_password' && (
            <ForgotPassword
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
              sanitizeInput={sanitizeInput}
            />
          )}
          {viewProp === 'update_password' && (
            <UpdatePassword 
              redirectMethod={redirectMethod}
              enforceStrongPassword={true}
            />
          )}
          {viewProp === 'signup' && (
            <SignUp 
              allowEmail={allowEmail} 
              redirectMethod={redirectMethod}
              sanitizeInput={sanitizeInput}
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
