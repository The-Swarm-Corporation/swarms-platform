'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Home, 
  Github, 
  Twitter, 
  Linkedin, 
  MessageSquare,
  ExternalLink,
  Building2,
  Users,
  Shield,
  FileText,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Mail,
  Calendar,
  Code,
  Box,
  Youtube,
  BookText,
  Ticket,
  Send
} from 'lucide-react';
import { DISCORD, NAVIGATION, PLATFORM, SWARMS_GITHUB } from '@/shared/utils/constants';
import Discord from '@/shared/components/icons/Discord';
import Image from 'next/image';

export default function Footer() {
  const router = useRouter();

  const platformLinks = [
    { name: 'Dashboard', href: PLATFORM.DASHBOARD, icon: <Home className="h-4 w-4" /> },
    { name: 'Marketplace', href: PLATFORM.EXPLORER, icon: <Building2 className="h-4 w-4" /> },
    { name: 'App Store', href: PLATFORM.AUTONOMOUS_APPS, icon: <Building2 className="h-4 w-4" /> },
    { name: 'Apps', href: PLATFORM.APPS, icon: <Building2 className="h-4 w-4" /> },
    { name: 'Chat', href: PLATFORM.CHAT, icon: <MessageSquare className="h-4 w-4" /> },
    { name: 'Spreadsheet Swarm', href: PLATFORM.SPREADSHEET, icon: <FileText className="h-4 w-4" /> },
    { name: 'Drag & Drop', href: PLATFORM.DRAG_N_DROP, icon: <FileText className="h-4 w-4" /> },
    { name: 'Bookmarks', href: PLATFORM.BOOKMARKS, icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Playground', href: PLATFORM.PLAYGROUND, icon: <Lightbulb className="h-4 w-4" /> },
    { name: 'API Keys', href: PLATFORM.API_KEYS, icon: <Shield className="h-4 w-4" /> },
    { name: 'Telemetry', href: PLATFORM.TELEMETRY, icon: <Shield className="h-4 w-4" /> },
    { name: 'Leaderboard', href: PLATFORM.LEADERBOARD, icon: <Users className="h-4 w-4" /> },
    { name: 'Settings', href: PLATFORM.ACCOUNT, icon: <Shield className="h-4 w-4" /> },
  ];

  const resourceLinks = [
    { name: 'Documentation', href: NAVIGATION.DOCS, icon: <FileText className="h-4 w-4" /> },
    { name: 'Pricing', href: NAVIGATION.PRICING, icon: <Shield className="h-4 w-4" /> },
    { name: 'Get Demo', href: NAVIGATION.GET_DEMO, icon: <Calendar className="h-4 w-4" /> },
  ];

  const socialLinks = [
    { name: 'GitHub', href: SWARMS_GITHUB, icon: <Github className="h-4 w-4" /> },
    { name: 'Discord', href: 'https://discord.gg/jM3Z6M9uMq', icon: <Discord /> },
    { name: 'Twitter', href: 'https://twitter.com/kyegomez', icon: <Twitter className="h-4 w-4" /> },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/The-Swarm-Corporation', icon: <Linkedin className="h-4 w-4" /> },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UC9yXyitkbU_WSy7bd_41SqQ', icon: <Youtube className="h-4 w-4" /> },
    { name: 'Blog', href: 'https://medium.com/@kyeg', icon: <BookText className="h-4 w-4" /> },
    { name: 'Telegram', href: 'https://t.co/dSRy143zQv', icon: <Send className="h-4 w-4" /> },
    { name: 'Events', href: 'https://lu.ma/5p2jnc2v', icon: <Ticket className="h-4 w-4" /> },
  ];

  const companyLinks = [
    { name: 'About', href: 'https://swarms.ai', icon: <Building2 className="h-4 w-4" /> },
    { name: 'Contact', href: 'mailto:kye@swarms.world', icon: <Mail className="h-4 w-4" /> },
    { name: 'Support', href: 'https://discord.gg/EamjgSaEQf', icon: <HelpCircle className="h-4 w-4" /> },
    { name: 'Hiring', href: 'https://swarms.ai/hiring', icon: <Users className="h-4 w-4" /> },
  ];

  const productLinks = [
    { 
      name: 'Python Framework', 
      href: 'https://github.com/kyegomez/swarms', 
      icon: <Code className="h-4 w-4" />,
      description: 'Enterprise-grade production-ready multi-agent orchestration framework for building and deploying agents'
    },
    { 
      name: 'Swarms Rust', 
      href: 'https://github.com/The-Swarm-Corporation/swarms-rs', 
      icon: <Box className="h-4 w-4" />,
      description: 'High-performance Rust implementation of Swarms'
    },
    { 
      name: 'Python SDK', 
      href: 'https://github.com/The-Swarm-Corporation/swarms-sdk', 
      icon: <Code className="h-4 w-4" />,
      description: 'Official Python client library for seamless integration with Swarms API'
    },
    { 
      name: 'TypeScript SDK', 
      href: 'https://github.com/The-Swarm-Corporation/swarms-ts', 
      icon: <Code className="h-4 w-4" />,
      description: 'Type-safe TypeScript client for Swarms API.'
    },
  ];

  const communityLinks = [
    { name: 'Discord', href: 'https://discord.gg/jM3Z6M9uMq', icon: <Discord />, description: 'Join our community chat' },
    { name: 'X Community', href: 'https://x.com/i/communities/1875452887414804745', icon: <Twitter className="h-4 w-4" />, description: 'Join the X community' },
    { name: 'Telegram', href: 'https://t.co/dSRy143zQv', icon: <Send className="h-4 w-4" />, description: 'Join our Telegram group' },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UC9yXyitkbU_WSy7bd_41SqQ', icon: <Youtube className="h-4 w-4" />, description: 'Watch tutorials and demos' },
    { name: 'Blog', href: 'https://medium.com/@kyeg', icon: <BookText className="h-4 w-4" />, description: 'Read our latest articles' },
    { name: 'Events', href: 'https://lu.ma/5p2jnc2v', icon: <Ticket className="h-4 w-4" />, description: 'Join community events' },
    { name: 'Onboarding', href: 'https://cal.com/swarms/swarms-onboarding-session', icon: <Calendar className="h-4 w-4" />, description: 'Book a session with Kye' },
  ];

  return (
    <footer className="w-full bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-8 gap-y-12">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Image src="/swarms-logo.svg" alt="Swarms" width={32} height={32} />
                </div>
                <span className="text-white font-bold text-xl">Swarms</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                Building The Infrastructure For The Agentic Economy.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-2">
                {socialLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200"
                    title={link.name}
                  >
                    <span className="w-4 h-4">{link.icon}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Products Section */}
            <div className="col-span-1 lg:col-span-1">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Products
              </h3>
              <ul className="space-y-4">
                {productLinks.map((link) => (
                  <li key={link.name} className="group">
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {link.icon}
                          </span>
                          <span className="font-medium">{link.name}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200 ml-6">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform Links */}
            <div className="col-span-1 lg:col-span-1">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Platform
              </h3>
              <ul className="space-y-3">
                {platformLinks.slice(0, 6).map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {link.icon}
                      </span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-1 lg:col-span-1">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {link.icon}
                      </span>
                      <span>{link.name}</span>
                      {link.href.startsWith('http') && (
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Shield className="h-4 w-4" />
                    </span>
                    <span>Pricing</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-1 lg:col-span-1">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {link.icon}
                      </span>
                      <span>{link.name}</span>
                      {link.href.startsWith('http') && (
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Community
              </h3>
              <ul className="space-y-4">
                {communityLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="text-gray-400 hover:text-white transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors duration-200">
                            {link.icon}
                          </span>
                          <span className="text-sm font-medium">{link.name}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </div>
                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200 mt-0.5 ml-6">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go back
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 text-sm font-medium"
                >
                  <Home className="h-4 w-4" />
                  Home
                </button>
              </div>
              <div className="text-gray-400 text-sm">
                <span>Our Mission: </span>
                <Link href="https://swarms.ai" className="text-red-400 hover:text-red-300 transition-colors duration-200 font-medium">
                  Enabling The Agentic Economy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Swarms AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link 
                href="/pp" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/tos" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
