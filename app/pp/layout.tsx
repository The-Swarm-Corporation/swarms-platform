import { Metadata } from 'next';
import '@/shared/styles/main.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Swarms Platform - Learn how we collect, use, and protect your information.',
};

export default function PrivacyPolicyLayout({
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