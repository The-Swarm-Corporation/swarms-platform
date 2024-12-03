'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '../spread_sheet_swarm/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../spread_sheet_swarm/ui/card"
import { Award, Calendar, ChevronDown, DollarSign, Zap } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function EvangelistProgram() {
  const [scrollY, setScrollY] = useState(0)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Swarms Evangelist Program
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the forefront of AI innovation and help shape the future of swarm intelligence
          </p>
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg font-semibold">
            <Link href="https://cal.com/swarms/swarms-evangelist-program">
              <Calendar className="mr-2 h-5 w-5" /> Apply Now
            </Link>
          </Button>
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown size={32} className="text-muted-foreground" />
        </motion.div>
      </section>

{/* Key Benefits */}
    <section id="benefits" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Key Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Financial Incentives", description: "Earn competitive rates for your in-depth technical content", icon: DollarSign },
              { title: "Industry Recognition", description: "Establish yourself as a thought leader in swarm intelligence and AI", icon: Award },
              { title: "Early Access", description: "Get exclusive access to new Swarms features and developments", icon: Zap },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <benefit.icon className="w-12 h-12 mb-4 text-primary" />
                    <CardTitle className="text-2xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Content We're Looking For */}
      <section id="content" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Content We're Looking For</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "In-depth tutorials on implementing Swarms in various AI applications",
              "Case studies showcasing real-world Swarms implementations",
              "Technical deep dives into Swarms' architecture and performance",
              "Comparative analyses of Swarms vs. traditional AI approaches",
              "Explorations of cutting-edge use cases for swarm intelligence",
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">{index + 1}</span>
                    </div>
                    <p className="text-lg">{item}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section id="apply" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">How to Apply</h2>
          <div className="max-w-3xl mx-auto">
            <ol className="space-y-8">
              {[
                { text: "Review our technical documentation", link: "https://docs.swarms.world" },
                { text: "Prepare a sample outline or draft of a technical article about Swarms" },
                { text: "Book a call with us to showcase the article", link: "https://cal.com/swarms/swarms-evangelist-program" },
                { text: "Our team will review your application and contact you for next steps" },
                { text: "Once published, we encourage you to share your article on all socials: linkedin, twitter, etc and also share it in the swarms discord", link: "https://swarms.ai" },
              ].map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-medium">{step.text}</p>
                    {step.link && (
                      <Link href={step.link} className="text-primary hover:underline">
                        Learn more
                      </Link>
                    )}
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Become a Swarms Evangelist?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join our community of tech experts and shape the future of AI with Swarms</p>
          <Button size="lg" asChild className="rounded-full px-8 py-6 text-lg font-semibold bg-background text-foreground hover:bg-muted transition-colors">
            <Link href="https://cal.com/swarms/swarms-evangelist-program">
              <Calendar className="mr-2 h-5 w-5" /> Schedule Your Interview
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="https://swarms.ai" className="hover:text-foreground transition-colors">Website</Link>
            <Link href="https://github.com/kyegomez/swarms" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Swarms.ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

















