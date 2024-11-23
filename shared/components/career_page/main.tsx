"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { ArrowRight, Github, Twitter, FileText, MapPin, Clock, Code, Zap, Brain, Network } from 'lucide-react'
import { Button } from '../spread_sheet_swarm/ui/button'
import { Card, CardContent } from '../spread_sheet_swarm/ui/card'

// Types
type MousePosition = {
  x: number
  y: number
}

type Role = {
  title: string
  description: string
  icon: React.ReactNode
}

// Components
const SwarmParticle: React.FC<{ index: number; mousePosition: MousePosition }> = ({ index, mousePosition }) => {
  const controls = useAnimation()
  const particleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const updatePosition = () => {
      if (particleRef.current) {
        const rect = particleRef.current.getBoundingClientRect()
        const distanceX = mousePosition.x - (rect.left + rect.width / 2)
        const distanceY = mousePosition.y - (rect.top + rect.height / 2)
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
        const maxDistance = 100
        const scale = Math.max(0, (maxDistance - distance) / maxDistance)

        controls.start({
          x: rect.left + rect.width / 2 + distanceX * scale * 0.1,
          y: rect.top + rect.height / 2 + distanceY * scale * 0.1,
          scale: 1 + scale,
          transition: { type: 'spring', stiffness: 100, damping: 10 }
        })
      }
    }

    updatePosition()
    window.addEventListener('mousemove', updatePosition)
    return () => window.removeEventListener('mousemove', updatePosition)
  }, [controls, mousePosition])

  return (
    <motion.circle
      ref={particleRef}
      r={Math.random() * 2 + 1}
      fill="#ff0000"
      initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0.3 }}
      animate={controls}
    />
  )
}

const SwarmBackground: React.FC<{ particleCount?: number }> = ({ particleCount = 100 }) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })

  const updateMousePosition = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [updateMousePosition])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      {[...Array(particleCount)].map((_, i) => (
        <SwarmParticle key={i} index={i} mousePosition={mousePosition} />
      ))}
    </svg>
  )
}

const AnimatedTitle: React.FC<{ text: string }> = ({ text }) => {
  const letters = Array.from(text)
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  }
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  }

  return (
    <motion.h1 
      className="text-5xl font-bold mb-4 flex justify-center text-white"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h1>
  )
}

const FadeInWhenVisible: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref)

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.5 }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 20 }
      }}
    >
      {children}
    </motion.div>
  )
}

const RoleCard: React.FC<{ role: Role; isActive: boolean; onClick: () => void }> = ({ role, isActive, onClick }) => (
  <Card className="cursor-pointer">
    <CardContent className="p-6">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={onClick}
      >
        {role.icon}
        <h3 className="text-xl font-semibold mb-2 text-black">{role.title}</h3>
        <AnimatePresence>
          {isActive && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm mt-2 text-black"
            >
              {role.description}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </CardContent>
  </Card>
)

const CareersPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState<number | null>(null)

  const roles: Role[] = [
    {
      title: 'Infrastructure Engineer',
      description: 'Build and maintain the systems that run our AI multi-agent infrastructure. Expertise in Skypilot, AWS, Terraform. Ensure seamless, high-availability environments for agent operations.',
      icon: <Network className="w-12 h-12 mb-4 text-red-500" />
    },
    {
      title: 'Agent Engineer',
      description: 'Design, develop, and orchestrate complex swarms of AI agents. Extensive experience with Python, multi-agent systems, and neural networks. Ability to create dynamic and efficient agent architectures from scratch.',
      icon: <Brain className="w-12 h-12 mb-4 text-red-500" />
    },
    {
      title: 'Prompt Engineer',
      description: 'Craft highly optimized prompts that drive our LLM-based agents. Specialize in instruction-based prompts, multi-shot examples, and production-grade deployment. Collaborate with agents to deliver state-of-the-art solutions.',
      icon: <FileText className="w-12 h-12 mb-4 text-red-500" />
    },
    {
      title: 'Front-End Engineer',
      description: 'Build sleek, intuitive interfaces for interacting with swarms of agents. Proficiency in Next.js, FastAPI, and modern front-end technologies. Design with the user experience in mind, integrating complex AI features into simple workflows.',
      icon: <Code className="w-12 h-12 mb-4 text-red-500" />
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SwarmBackground />
      <header className="container mx-auto px-4 py-8 relative z-10">
        <nav className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Swarms.ai
          </motion.h1>
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <a href="https://github.com/kyegomez/swarms" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 transition-colors">
              <Github className="w-6 h-6" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://twitter.com/swarms_corp" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 transition-colors">
              <Twitter className="w-6 h-6" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://medium.com/@kyeg" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 transition-colors">
              <FileText className="w-6 h-6" />
              <span className="sr-only">Blog</span>
            </a>
          </motion.div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <section className="text-center mb-16">
          <AnimatedTitle text="Join the AI Revolution" />
          <motion.p 
            className="text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Build the future of multi-agent AI systems at Swarms.ai
          </motion.p>
          <Button
            asChild
            variant="destructive"
            size="lg"
          >
            <motion.a
              href="#open-roles"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Open Roles <ArrowRight className="ml-2" />
            </motion.a>
          </Button>
        </section>

        <FadeInWhenVisible>
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">About Swarms.ai</h2>
            <p className="text-lg mb-4">
              We are the Enterprise-Grade Production-Ready Multi-Agent Orchestration Framework. Our mission is to build the future of AI by orchestrating multi-agent collaboration.
            </p>
            <p className="text-lg">
              We move fast, think ambitiously, and deliver with urgency. Join us if you want to be part of building the next generation of multi-agent systems, redefining how businesses automate operations and leverage AI.
            </p>
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Work Culture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <Clock className="w-12 h-12 mb-4 text-red-500" />
                  <h3 className="text-xl font-semibold mb-2 text-black">Intense Work Hours</h3>
                  <p className="text-black">Working hours: 9 AM to 10 PM, every day, 7 days a week. This is not for people who seek work-life balance.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Zap className="w-12 h-12 mb-4 text-red-500" />
                  <h3 className="text-xl font-semibold mb-2 text-black">Contribution-Driven</h3>
                  <p className="text-black">We do not consider applicants who have not previously submitted a PR. To be considered, a PR containing a new feature or a bug fix must be submitted.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-4">Hiring Process</h2>
            <ol className="list-decimal list-inside space-y-4">
              <li>Fill out the application form: 
                <Button
                  asChild
                  variant="link"
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  <motion.a 
                    href="https://forms.gle/Kwuw1G29PC1DWMVb9"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Swarms Career Application
                  </motion.a>
                </Button>
              </li>
              <li>Book a call with our team: 
                <Button
                  asChild
                  variant="link"
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  <motion.a 
                    href="https://cal.com/swarms/1-on-1-team-meeting"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Schedule a 1-on-1 Meeting
                  </motion.a>
                </Button>
              </li>
              <li>Join our Discord community: 
                <Button
                  asChild
                  variant="link"
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  
                  <motion.a 
                    href="https://discord.com/servers/agora-999382051935506503"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Swarms Discord Server
                  </motion.a>
                </Button>
              </li>
            </ol>
            <p className="mt-4 text-sm italic">Note: Our technical team will review your application and reach out to you for next steps.</p>
          </motion.section>
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Offices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <MapPin className="w-8 h-8 mb-2 text-red-500" />
                  <h3 className="text-xl font-semibold mb-2 text-black">Palo Alto, CA</h3>
                  <p className="text-black">Our Palo Alto office houses the majority of our core research teams including our prompting, agent design, and model training.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <MapPin className="w-8 h-8 mb-2 text-red-500" />
                  <h3 className="text-xl font-semibold mb-2 text-black">Miami, FL</h3>
                  <p className="text-black">Our Miami office holds prompt engineering, agent design, and more.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <section id="open-roles" className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Open Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {roles.map((role, index) => (
                <RoleCard
                  key={index}
                  role={role}
                  isActive={activeRole === index}
                  onClick={() => setActiveRole(activeRole === index ? null : index)}
                />
              ))}
            </div>
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
            <p className="text-lg mb-8">Submit your pull request today and be part of the AI revolution!</p>
            <Button
              asChild
              variant="destructive"
              size="lg"
            >
              <motion.a
                href="https://github.com/kyegomez/swarms"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit a PR on GitHub <Github className="ml-2" />
              </motion.a>
            </Button>
          </section>
        </FadeInWhenVisible>
      </main>

      <footer className="bg-white text-black py-8 mt-16 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Swarms.ai. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="https://swarms.xyz" target="_blank" rel="noopener noreferrer" className="text-black hover:text-red-600 transition-colors">Website</a>
            <a href="https://discord.com/servers/agora-999382051935506503" target="_blank" rel="noopener noreferrer" className="text-black hover:text-red-600 transition-colors">Discord</a>
            <a href="https://twitter.com/swarms_corp" target="_blank" rel="noopener noreferrer" className="text-black hover:text-red-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CareersPage