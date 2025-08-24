import Logo from '@/shared/components/icons/Logo';
import { createClient } from '@/shared/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from '@/shared/utils/auth-helpers/settings';
import { Card } from '@/shared/components/ui/card';
import PasswordSignIn from '@/shared/components/ui/AuthForms/PasswordSignIn';
import EmailSignIn from '@/shared/components/ui/AuthForms/EmailSignIn';
import Separator from '@/shared/components/ui/AuthForms/Separator';
import OauthSignIn from '@/shared/components/ui/AuthForms/OauthSignIn';
import ForgotPassword from '@/shared/components/ui/AuthForms/ForgotPassword';
import UpdatePassword from '@/shared/components/ui/AuthForms/UpdatePassword';
import SignUp from '@/shared/components/ui/AuthForms/Signup';
import { Suspense } from 'react';

export default async function SignIn({
  params,
  searchParams,
}: any) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Assign url id to 'viewProp' if it's a valid string and ViewTypes includes it
  if (typeof resolvedParams.id === 'string' && viewTypes.includes(resolvedParams.id)) {
    viewProp = resolvedParams.id;
  } else {
    const preferredSignInView =
      (await cookies()).get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect('/');
  } else if (!user && viewProp === 'update_password') {
    return redirect('/signin');
  }

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto min-w-[320px] w-80">
        <div className="flex justify-center pb-12 ">
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
          <Suspense fallback={<div>Loading...</div>}>
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
                disableButton={Boolean(resolvedSearchParams.disable_button)}
              />
            )}
            {viewProp === 'forgot_password' && (
              <ForgotPassword
                allowEmail={allowEmail}
                redirectMethod={redirectMethod}
                disableButton={Boolean(resolvedSearchParams.disable_button)}
              />
            )}
            {viewProp === 'update_password' && (
              <UpdatePassword redirectMethod={redirectMethod} />
            )}
            {viewProp === 'signup' && (
              <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
            )}
            {viewProp !== 'update_password' &&
              viewProp !== 'signup' &&
              allowOauth && (
                <>
                  <Separator text="Third-party sign-in" />
                  <OauthSignIn />
                </>
              )}
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
