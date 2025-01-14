import { redirect } from 'next/navigation';
import { getDefaultSignInView } from '@/shared/utils/auth-helpers/settings';
import { cookies } from 'next/headers';

export default async function SignIn() {
  const preferredSignInView =
    (await cookies()).get('preferredSignInView')?.value || null;
  const defaultView = getDefaultSignInView(preferredSignInView);

  return redirect(`/signin/${defaultView}`);
}
