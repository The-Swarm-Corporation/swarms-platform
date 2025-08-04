import { Metadata } from 'next';
import '@/shared/styles/main.css';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Swarms Platform - AI-powered marketplace and platform for creating, sharing, and deploying autonomous agents.',
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {children}
    </div>
  );
} 