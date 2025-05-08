import { redirect } from 'next/navigation';

export async function GET() {
  redirect('/telemetry/dashboard');
}