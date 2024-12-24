'use client'

import { useState, useEffect } from 'react'

import { motion } from "framer-motion"
import { Button } from "@/shared/components/spread_sheet_swarm/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/spread_sheet_swarm/ui/card"
import { Bot, Coins, Network, Lock, Zap, Users, Brain, Rocket, Award } from 'lucide-react'
import { Copy, ExternalLink, Twitter, DiscIcon as Discord } from 'lucide-react'
import Link from "next/link"
import { toast } from "sonner"
import { Progress } from '@/shared/components/ui/progress'
import { Badge } from '@/shared/components/ui/badge'

const roadmapItems = [
  {
    phase: "Phase 1",
    title: "Foundation",
    items: [
      "Launch $Swarms token",
      "Deploy initial agent creation tools",
      "Establish community governance"
    ]
  },
  {
    phase: "Phase 2",
    title: "Expansion",
    items: [
      "Launch agent marketplace",
      "Implement cross-agent communication",
      "Deploy automated market making"
    ]
  },
  {
    phase: "Phase 3",
    title: "Integration",
    items: [
      "Partner with AI platforms",
      "Launch developer incentives",
      "Scale agent ecosystem"
    ]
  },
  {
    phase: "Phase 4",
    title: "Evolution",
    items: [
      "Advanced agent capabilities",
      "Cross-chain integration",
      "Global AI marketplace"
    ]
  }
]

function Roadmap() {
  return (
    <section className="py-20 px-4 md:px-8 relative" id="roadmap">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }}
        className="max-w-6xl mx-auto"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
          }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-red-500 uppercase tracking-tight">
            Roadmap
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Our journey to revolutionize the AI economy
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.phase}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="bg-black/50 border-red-950">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-red-500 font-bold uppercase">{item.phase}</span>
                      <div className="h-px flex-1 bg-red-950" />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <ul className="space-y-2">
                      {item.items.map((listItem, i) => (
                        <li key={i} className="text-gray-400 flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {listItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}



function Community() {
  return (
    <section className="py-20 px-4 md:px-8 relative" id="community">
      <div className="absolute inset-0 bg-gradient-to-b from-black to-red-950/20" />
      
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { duration: 0.5 } }
        }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-red-500 uppercase tracking-tight">
            Join The Community
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Participate In The Agentic Economy!
          </p>
        </div>

        <Card className="bg-black/50 border-red-950">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <a 
                href="https://twitter.com/swarms_corp"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-red-950/20 rounded-lg text-center hover:bg-red-950/30 transition-colors"
                >
                  <Twitter className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold uppercase mb-2">Twitter</h3>
                  <p className="text-gray-400">Follow for updates</p>
                </motion.div>
              </a>

              <a 
                href="https://discord.gg/jM3Z6M9uMq"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-red-950/20 rounded-lg text-center hover:bg-red-950/30 transition-colors"
                >
                  <Discord className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold uppercase mb-2">Discord</h3>
                  <p className="text-gray-400">Join the discussion</p>
                </motion.div>
              </a>

              <a 
                href="https://swarms.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-red-950/20 rounded-lg text-center hover:bg-red-950/30 transition-colors"
                >
                  <ExternalLink className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold uppercase mb-2">Website</h3>
                  <p className="text-gray-400">Learn more</p>
                </motion.div>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}



function TokenMetrics() {
  const allocations = [
    { name: "Liquidity Pool", percentage: 35, color: "bg-red-600" },
    { name: "Agent Rewards & Community", percentage: 25, color: "bg-red-500" },
    { name: "Founder", percentage: 20, color: "bg-red-400" },
    { name: "Team", percentage: 15, color: "bg-red-300" },
    { name: "Investors & Advisors", percentage: 5, color: "bg-red-200" },
  ]

  return (
    <section className="py-20 px-4 md:px-8 bg-black relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-950/20 to-black" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 border border-red-500/10 rotate-45" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border border-red-500/10 -rotate-45" />
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <motion.div variants={item} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-red-500 uppercase tracking-tight">Token Metrics</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            A balanced distribution ensuring sustainable growth and community rewards
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div variants={item}>
            <Card className="bg-black/50 border-red-950">
              <CardHeader>
                <CardTitle className="uppercase tracking-wide">Token Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allocations.map((allocation) => (
                    <div key={allocation.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">{allocation.name}</span>
                        <span className="text-sm text-gray-400">{allocation.percentage}%</span>
                      </div>
                      <Progress value={allocation.percentage} className={allocation.color} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-black/50 border-red-950">
              <CardHeader>
                <CardTitle className="uppercase tracking-wide">Supply & Utility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide">Total Supply</h3>
                  <p className="text-3xl font-bold text-red-500">1,000,000,000,000</p>
                  <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider">$Swarms Tokens</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide">Key Features</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center gap-2">
                      • Base currency for all agent transactions
                    </li>
                    <li className="flex items-center gap-2">
                      • Required for agent token creation
                    </li>
                    <li className="flex items-center gap-2">
                      • Governance rights in the ecosystem
                    </li>
                    <li className="flex items-center gap-2">
                      • Staking rewards and incentives
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}




const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function WhySwarms() {
  return (
    <section className="py-20 px-4 md:px-8 relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/30 to-black" />
        {/* Decorative lines */}
        <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-red-500/20 to-transparent" />
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <motion.div variants={item} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-red-500 uppercase tracking-tight">Why $Swarms?</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            The foundation for the next generation of AI-powered economies
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            variants={item}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-black/50 border-red-950 h-full">
              <CardHeader>
                <Bot className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="uppercase tracking-wide">Agent-Centric Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Each agent gets its own token, powered by $Swarms as the base currency,
                  enabling autonomous value creation and exchange.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-black/50 border-red-950 h-full">
              <CardHeader>
                <Coins className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="uppercase tracking-wide">Universal Currency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  A unified medium of exchange for all agent interactions, simplifying
                  transactions and reducing friction in the ecosystem.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-black/50 border-red-950 h-full">
              <CardHeader>
                <Network className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="uppercase tracking-wide">Network Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  As more agents join the ecosystem, the value and utility of $Swarms
                  increases, creating a powerful network effect.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}



function VisionCards() {
  const visionPoints = [
    {
      icon: <Award className="h-8 w-8 text-red-500" />,
      title: "Reward Excellence",
      description: "Incentivize developers building high-performing and widely-used agents"
    },
    {
      icon: <Zap className="h-8 w-8 text-red-500" />,
      title: "Seamless Transactions",
      description: "Enable frictionless payments for agentic services across the ecosystem"
    },
    {
      icon: <Users className="h-8 w-8 text-red-500" />,
      title: "Foster Innovation",
      description: "Create an environment that encourages collaboration and creativity"
    },
    {
      icon: <Lock className="h-8 w-8 text-red-500" />,
      title: "Sustainable Framework",
      description: "Build a scalable system for incentivizing AI development and usage"
    },
    {
      icon: <Brain className="h-8 w-8 text-red-500" />,
      title: "Democratize AI",
      description: "Reduce entry barriers for users and developers in the AI economy"
    }
  ]

  return (
    <motion.div
      variants={container}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {visionPoints.map((point, index) => (
        <motion.div
          key={point.title}
          variants={item}
          className="group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-black/50 border-red-950 h-full hover:bg-red-950/20 transition-all duration-300">
            <CardHeader>
              <div className="mb-2">{point.icon}</div>
              <CardTitle className="text-xl group-hover:text-red-500 transition-colors uppercase tracking-wide">
                {point.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">{point.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}



function Navigation() {
  const [activeSection, setActiveSection] = useState("hero")
  
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section')
      sections.forEach(section => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section.id)
        }
      })
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const copyAddress = () => {
    navigator.clipboard.writeText("74SBV4zDXxTRgv1pEMoECskKBkZHc2yGPnc7GYVepump")
    toast.success("Contract address copied!")
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="hidden lg:block w-64 p-8 border-l border-red-950 sticky top-0 h-screen bg-black/80 backdrop-blur-sm"
    >
      <nav className="space-y-8">
        <div>
          <h3 className="font-medium mb-4 uppercase tracking-wider text-red-500">Navigation</h3>
          <div className="space-y-2">
            {[
              { id: "hero", label: "Home" },
              { id: "vision", label: "Vision" },
              { id: "why", label: "Why $Swarms" },
              { id: "metrics", label: "Token Metrics" },
              { id: "future", label: "Future of AI" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-sm transition-colors uppercase tracking-wider ${
                  activeSection === item.id 
                    ? "text-red-500 font-medium" 
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4 uppercase tracking-wider text-red-500">Contract</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-xs text-gray-400 break-all">
                74SBV4...pump
              </code>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyAddress}
                className="hover:text-red-500"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4 uppercase tracking-wider text-red-500">Links</h3>
          <div className="space-y-2">
            <Link
              href="https://swarms.ai"
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              <ExternalLink className="h-4 w-4" />
              Website
            </Link>
            <Link
              href="https://twitter.com/swarms_corp"
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Link>
            <Link
              href="https://discord.gg/jM3Z6M9uMq"
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              <Discord className="h-4 w-4" />
              Discord
            </Link>
            <Link
              href="https://pump.fun/coin/74SBV4zDXxTRgv1pEMoECskKBkZHc2yGPnc7GYVepump"
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              <Discord className="h-4 w-4" />
              Buy Now
            </Link>
          </div>
        </div>
      </nav>
    </motion.div>
  )
}



export default function SwarmsEconomy() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 to-black" />
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-32 h-32 border border-red-500/20 rotate-45" />
            <div className="absolute bottom-20 right-10 w-32 h-32 border border-red-500/20 -rotate-45" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 border border-red-500/10 rotate-45 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 text-center space-y-8 max-w-4xl px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-4 bg-red-950/50 text-red-500 hover:bg-red-950/70 uppercase tracking-wider">
                Fueling The Agentic Economy
              </Badge>
              <h1 className="text-5xl sm:text-7xl font-bold text-red-500 mb-6 tracking-tighter">
                $swarms
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 font-light">
                Empowering the Agentic Revolution
              </p>
              <p className="text-sm sm:text-md text-gray-300 mb-8 font-light">
                CA: 74SBV4zDXxTRgv1pEMoECskKBkZHc2yGPnc7GYVepump
              </p>
            </motion.div>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wide"
                onClick={() => {
                  toast.success("Redirecting...");
                  setTimeout(() => {
                    window.location.href = "https://pump.fun/coin/74SBV4zDXxTRgv1pEMoECskKBkZHc2yGPnc7GYVepump";
                  }, 2000); // Adjust delay as needed
                }}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-red-600 text-red-500 hover:bg-red-950/50 uppercase tracking-wide"
                onClick={() => toast.success("Coming soon!")}
              >
                Read Whitepaper
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Vision Section */}
        <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-black to-red-950/20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-6xl mx-auto space-y-16"
          >
            <motion.div variants={item} className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6 text-red-500 uppercase tracking-tight">Our Vision</h2>
              <p className="text-gray-300 text-lg">
                Revolutionizing the AI economy through decentralized agent interactions and 
                seamless value exchange.
              </p>
            </motion.div>

            <VisionCards />
          </motion.div>
        </section>

        {/* Why Swarms Section */}
        <WhySwarms />

        <Roadmap />

        {/* Token Metrics */}
        {/* <TokenMetrics /> */}

        {/* Ecosystem Benefits */}
        <section className="py-20 px-4 md:px-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 to-black" />
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-6xl mx-auto relative z-10"
          >
            <motion.div variants={item} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-red-500 uppercase tracking-tight">
                Ecosystem Benefits
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                $Swarms creates a thriving ecosystem where AI agents and developers can 
                collaborate, innovate, and generate value.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Bot className="h-8 w-8 text-red-500" />,
                  title: "Agent Creation",
                  description: "Easily create and deploy AI agents with built-in tokenomics"
                },
                {
                  icon: <Coins className="h-8 w-8 text-red-500" />,
                  title: "Universal Currency",
                  description: "One token to power all agent interactions and trades"
                },
                {
                  icon: <Network className="h-8 w-8 text-red-500" />,
                  title: "Network Effects",
                  description: "Benefit from a growing ecosystem of interconnected agents"
                },
                {
                  icon: <Lock className="h-8 w-8 text-red-500" />,
                  title: "Secure Trading",
                  description: "Built on Solana for fast, secure transactions"
                },
                {
                  icon: <Zap className="h-8 w-8 text-red-500" />,
                  title: "Instant Settlement",
                  description: "Lightning-fast transactions with minimal fees"
                },
                {
                  icon: <Users className="h-8 w-8 text-red-500" />,
                  title: "Community Driven",
                  description: "Governed by and for the agent ecosystem"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  variants={item}
                  className="group"
                >
                  <Card className="bg-black/50 border-red-950 hover:bg-red-950/20 transition-all duration-300">
                    <CardHeader>
                      <div className="mb-2">{benefit.icon}</div>
                      <CardTitle className="text-xl group-hover:text-red-500 transition-colors uppercase">
                        {benefit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Future of AI Section */}
        <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-red-950/20 to-black relative">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-6xl mx-auto relative z-10"
          >
            <motion.div variants={item} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-red-500 uppercase tracking-tight">
                The Future of AI
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Join us in building a future where AI agents collaborate seamlessly, 
                creating value for everyone.
              </p>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-black/50 border-red-950">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Brain className="h-8 w-8 text-red-500 mt-1" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 uppercase">Autonomous Agents</h3>
                          <p className="text-gray-400">
                            AI agents that can learn, adapt, and create value independently
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Rocket className="h-8 w-8 text-red-500 mt-1" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 uppercase">Scalable Growth</h3>
                          <p className="text-gray-400">
                            Exponential growth potential as more agents join the ecosystem
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Network className="h-8 w-8 text-red-500 mt-1" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 uppercase">Interconnected Economy</h3>
                          <p className="text-gray-400">
                            A thriving marketplace of AI services and capabilities
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Users className="h-8 w-8 text-red-500 mt-1" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 uppercase">Community Governance</h3>
                          <p className="text-gray-400">
                            Democratic decision-making for ecosystem development
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>
        <Community />

      </main>
      <Navigation />
    </div>
  )
}