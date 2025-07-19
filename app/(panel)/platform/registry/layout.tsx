import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Registry - Swarms Platform',
  description: 'Discover and explore AI agents from the Swarms community',
};

export default function RegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
} 