import { Metadata } from 'next';
import AgentModule from '@/modules/agent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';


const Agent = async ({ params }: any) => {
  const resolvedParams = await params;
  return <AgentModule id={resolvedParams?.id} />;
};

export default Agent;

export const metadata: Metadata = {
  title: 'Agent Details',
  description: 'View agent details'
};
