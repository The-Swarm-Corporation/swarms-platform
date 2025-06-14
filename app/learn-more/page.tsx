'use client';

import { ArrowRight, Bot, Code, Coins, Globe, Lightbulb, Share2, Sparkles, Zap, Rocket, Trophy, Star, Crown, Target, Flame, Heart, Brain, Plus, Users, Shield, BarChart, Cpu, Layers, Workflow } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const features = [
  {
    title: 'Framework Agnostic',
    description: 'Share and discover agents built with any framework - Swarms, LangChain, AutoGen, and more. Our platform embraces diversity in AI development.',
    icon: <Code className="w-6 h-6" />,
    stats: '100+ Frameworks',
    color: 'from-red-500 to-red-700',
    glow: 'shadow-red-500/20',
  },
  {
    title: 'Prompt Marketplace',
    description: 'Access and share high-quality prompts for any AI agent. Build upon others\' work and contribute to the community.',
    icon: <Lightbulb className="w-6 h-6" />,
    stats: '10K+ Prompts',
    color: 'from-orange-500 to-red-600',
    glow: 'shadow-orange-500/20',
  },
  {
    title: 'Tool Integration',
    description: 'Share and discover custom tools that enhance your agents\' capabilities. From simple utilities to complex integrations.',
    icon: <Bot className="w-6 h-6" />,
    stats: '5K+ Tools',
    color: 'from-pink-500 to-red-600',
    glow: 'shadow-pink-500/20',
  },
  {
    title: 'Global Community',
    description: 'Connect with AI developers worldwide. Share knowledge, collaborate, and grow together in the AI revolution.',
    icon: <Globe className="w-6 h-6" />,
    stats: '50K+ Users',
    color: 'from-purple-500 to-red-600',
    glow: 'shadow-purple-500/20',
  },
];

const upcomingFeatures = [
  {
    title: 'Monetization',
    description: 'Sell your agents, prompts, and tools. Set your own prices and earn from your AI innovations.',
    icon: <Coins className="w-6 h-6" />,
    stats: 'Coming Soon',
    color: 'from-yellow-500 to-red-600',
    glow: 'shadow-yellow-500/20',
  },
  {
    title: 'Agent Labor Marketplace',
    description: 'Create an Upwork-like marketplace for AI agents. Hire agents for specific tasks or offer your agents\' services.',
    icon: <Share2 className="w-6 h-6" />,
    stats: 'Coming Soon',
    color: 'from-green-500 to-red-600',
    glow: 'shadow-green-500/20',
  },
  {
    title: 'Advanced Analytics',
    description: 'Track your agents\' performance, usage, and earnings. Make data-driven decisions to improve your offerings.',
    icon: <Sparkles className="w-6 h-6" />,
    stats: 'Coming Soon',
    color: 'from-cyan-500 to-red-600',
    glow: 'shadow-cyan-500/20',
  },
];

const achievements = [
  {
    title: 'Early Adopter',
    description: 'Joined during the first month of launch',
    icon: <Flame className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500',
  },
  {
    title: 'Innovator',
    description: 'Created unique and innovative works',
    icon: <Target className="w-6 h-6" />,
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Community Builder',
    description: 'Active contributor to the community',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-red-500 to-purple-500',
  },
];

const marketplaceInfo = [
  {
    title: 'Share Your AI Creations',
    description: 'Upload and share your AI agents, prompts, and tools with the community. Get feedback, recognition, and build your reputation in the AI space.',
    icon: <Share2 className="w-6 h-6" />,
    color: 'from-red-500 to-red-700',
    stats: '10K+ Active Contributors',
  },
  {
    title: 'Discover & Collaborate',
    description: 'Find and use AI solutions created by others. Collaborate with developers, share knowledge, and build upon existing work.',
    icon: <Globe className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
    stats: '50K+ Monthly Users',
  },
  {
    title: 'Monetize Your Work',
    description: 'Set your own prices for your AI creations. Earn from your innovations and build a sustainable AI development business.',
    icon: <Coins className="w-6 h-6" />,
    color: 'from-pink-500 to-red-600',
    stats: '$1M+ Paid to Creators',
  },
];

const enterpriseFeatures = [
  {
    title: 'Enterprise Security',
    description: 'Bank-grade security with end-to-end encryption, role-based access control, and comprehensive audit logs.',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-red-500 to-red-700',
  },
  {
    title: 'Advanced Analytics',
    description: 'Detailed insights into agent performance, usage patterns, and revenue metrics with customizable dashboards.',
    icon: <BarChart className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
  },
  {
    title: 'Team Collaboration',
    description: 'Built-in tools for team management, version control, and collaborative development of AI solutions.',
    icon: <Users className="w-6 h-6" />,
    color: 'from-pink-500 to-red-600',
  },
];

const callToActions = [
  {
    title: 'Add Your Prompt',
    description: 'Share your AI prompts with the community',
    icon: <Lightbulb className="w-6 h-6" />,
    link: '/',
    color: 'from-red-500 to-orange-500',
  },
  {
    title: 'Create an Agent',
    description: 'Build and deploy your AI agent',
    icon: <Bot className="w-6 h-6" />,
    link: '/',
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Share a Tool',
    description: 'Contribute your AI tools and utilities',
    icon: <Code className="w-6 h-6" />,
    link: '/',
    color: 'from-red-500 to-purple-500',
  },
];

const workflowSteps = [
  {
    title: 'Create',
    description: 'Develop your AI solutions using any framework',
    icon: <Cpu className="w-6 h-6" />,
    color: 'from-red-500 to-red-700',
  },
  {
    title: 'Deploy',
    description: 'Seamlessly deploy to our secure infrastructure',
    icon: <Layers className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
  },
  {
    title: 'Monetize',
    description: 'Set your pricing and start earning',
    icon: <Workflow className="w-6 h-6" />,
    color: 'from-pink-500 to-red-600',
  },
];

const keyMetrics = [
  {
    label: 'AI Agents',
    value: '12K+',
    icon: <Bot className="w-6 h-6" />,
    color: 'from-red-500 to-red-700',
  },
  {
    label: 'Prompts Shared',
    value: '120K+',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
  },
  {
    label: 'Tools Integrated',
    value: '8K+',
    icon: <Code className="w-6 h-6" />,
    color: 'from-pink-500 to-red-600',
  },
  {
    label: 'Global Developers',
    value: '65K+',
    icon: <Globe className="w-6 h-6" />,
    color: 'from-purple-500 to-red-600',
  },
];

export default function LearnMorePage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Static gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)]" />
        {/* Animated swirling gradient for Arasaka feel */}
        <motion.div
          aria-hidden="true"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 80, ease: 'linear' }}
          className="pointer-events-none absolute -top-1/4 -left-1/4 w-[120vw] h-[120vw] rounded-full bg-gradient-to-tr from-red-700/10 via-red-500/10 to-transparent blur-3xl"
        />
        <motion.div 
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.h1 
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                Swarms Marketplace
              </span>
            </motion.h1>
            <motion.p 
              className="mt-8 text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              The world's first agent labor marketplace – where AI agents, prompts, and tools converge to build tomorrow's intelligent applications.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.03)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-white"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/30 p-8 rounded-xl border border-red-500/10 hover:border-red-500/20 transition-all duration-300 shadow-lg hover:shadow-red-500/5 transform-gpu group-hover:-translate-y-1 backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Information */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.03)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-white"
          >
            About the Marketplace
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {marketplaceInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/30 p-8 rounded-xl border border-red-500/10 hover:border-red-500/20 transition-all duration-300 shadow-lg hover:shadow-red-500/5 transform-gpu group-hover:-translate-y-1 backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {info.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">{info.title}</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">{info.description}</p>
                  <div className={`text-sm font-medium bg-gradient-to-r ${info.color} bg-clip-text text-transparent`}>
                    {info.stats}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.03)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-white"
          >
            Enterprise Ready
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/30 p-8 rounded-xl border border-red-500/10 hover:border-red-500/20 transition-all duration-300 shadow-lg hover:shadow-red-500/5 transform-gpu group-hover:-translate-y-1 backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
        <div className="max-w-5xl mx-auto relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-white"
          >
            Roadmap
          </motion.h2>
          <div className="relative border-l border-red-600/40 ml-4">
            {upcomingFeatures.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-12 pl-8 relative"
              >
                {/* Timeline Dot */}
                <span className="absolute -left-5 top-2 w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 shadow-md" />
                {/* Content */}
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  {item.icon}
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-400 leading-relaxed">
                  {item.description}
                </p>
                <span className={`mt-2 inline-block text-sm font-medium bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.stats}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-white"
          >
            By the Numbers
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {keyMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center justify-center bg-gray-900/30 p-8 rounded-xl border border-white/5 backdrop-blur-xl shadow-md"
              >
                <div className={`text-4xl font-extrabold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>{metric.value}</div>
                <p className="mt-2 text-sm text-gray-400 tracking-wide uppercase">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.03)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-white"
          >
            Start Contributing
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {callToActions.map((cta, index) => (
              <motion.div
                key={cta.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/30 p-8 rounded-xl border border-red-500/10 hover:border-red-500/20 transition-all duration-300 shadow-lg hover:shadow-red-500/5 transform-gpu group-hover:-translate-y-1 backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {cta.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">{cta.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{cta.description}</p>
                  <Link
                    href={cta.link}
                    className="inline-flex items-center px-6 py-3 border border-red-500 text-sm font-medium rounded-xl text-white bg-red-500/10 hover:bg-red-500/20 transition-colors duration-300 group"
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl sm:text-6xl font-bold mb-8 text-white">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              We're building the world's first agent labor marketplace - a platform where AI agents can be hired, shared, and monetized, similar to how Upwork revolutionized human freelancing. Join us in shaping the future of AI development and collaboration.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 border border-red-500 text-base font-medium rounded-xl text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Join the Revolution</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 