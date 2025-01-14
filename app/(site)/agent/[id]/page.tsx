import { Metadata } from 'next';
import AgentModule from '@/modules/agent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Correctly type the page component with Next.js types
interface PageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const Agent = async ({ params, searchParams }: PageProps) => {
  return <AgentModule id={params.id} />;
};

export default Agent;

export const metadata: Metadata = {
  title: 'Agent Details',
  description: 'View agent details'
};
