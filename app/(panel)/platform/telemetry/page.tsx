import { PLATFORM } from '@/shared/utils/constants';
import { redirect } from 'next/navigation';

export default function Page() {
  return redirect(PLATFORM.TELEMETRY_DASHBOARD);
}
