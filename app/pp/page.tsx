"use client";

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Swarms Platform (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered marketplace and platform services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            2. Information We Collect
          </h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            2.1 Personal Information
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We may collect personal information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Name and email address when you create an account</li>
            <li>Profile information and preferences</li>
            <li>Payment information for premium features</li>
            <li>Communications with our support team</li>
            <li>Content you create, upload, or share on the platform</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            2.2 Usage Information
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We automatically collect certain information about your use of our services:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Log data (IP address, browser type, access times)</li>
            <li>Device information and identifiers</li>
            <li>Usage patterns and interactions with our platform</li>
            <li>Performance data and error reports</li>
            <li>Telemetry data for service optimization</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            2.3 AI and Machine Learning Data
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            As an AI platform, we may collect and process:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Agent interactions and conversations</li>
            <li>Training data for improving AI models</li>
            <li>Usage analytics for platform optimization</li>
            <li>Feedback and ratings on AI agents</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            3. How We Use Your Information
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and manage your account</li>
            <li>Send you important updates and notifications</li>
            <li>Respond to your questions and support requests</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Train and improve our AI models</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            4. Information Sharing and Disclosure
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
            <li><strong>Public Content:</strong> Content you choose to make public on our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            5. Data Security
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            6. Data Retention
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. We may retain certain information for longer periods to comply with legal obligations or resolve disputes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            7. Your Rights and Choices
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Objection:</strong> Object to certain processing activities</li>
            <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            8. Cookies and Tracking Technologies
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We use cookies and similar tracking technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            9. International Data Transfers
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this policy and applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            10. Children&apos;s Privacy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            11. Changes to This Policy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the &ldquo;Last updated&rdquo; date. Your continued use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            12. Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              Email: privacy@swarms.ai<br />
              Website: https://swarms.ai<br />
              Data Protection Officer: dpo@swarms.ai
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            13. GDPR Compliance (EU Users)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            For users in the European Union, we process your personal data in accordance with the General Data Protection Regulation (GDPR). You have the right to lodge a complaint with your local data protection authority if you believe we have not addressed your concerns adequately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            14. CCPA Compliance (California Users)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            California residents have additional rights under the California Consumer Privacy Act (CCPA). You may request information about the personal information we collect, use, and disclose about you, and request deletion of your personal information.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Swarms Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link 
              href="/pp" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/tos" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 