'use client'

import { Inter } from 'next/font/google'
import Link from 'next/link'
import { ArrowRight, Github, Cpu, BarChart3, FileText, Zap, Users, PhoneCall, Sun, Moon, Star, GitFork, Eye, Badge } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../spread_sheet_swarm/ui/card'

const inter = Inter({ subsets: ['latin'] })


export interface Repository {
    name: string;
    description: string;
    url: string;
}
  
export const repositories: Repository[] = [
    {
      name: "eth-agent",
      description: "Ethereum agent for automated trading and analysis",
      url: "https://github.com/The-Swarm-Corporation/eth-agent"
    },
    {
      name: "BackTesterAgent",
      description: "Backtesting framework for financial models",
      url: "https://github.com/The-Swarm-Corporation/BackTesterAgent"
    },
    {
      name: "Open-Aladdin",
      description: "Open-source portfolio management system",
      url: "https://github.com/The-Swarm-Corporation/Open-Aladdin"
    },
    {
      name: "TickrAgent",
      description: "Real-time market data processing agent",
      url: "https://github.com/The-Swarm-Corporation/TickrAgent"
    },
    {
      name: "ATLAS",
      description: "Advanced Trading and Learning Automated System",
      url: "https://github.com/The-Swarm-Corporation/ATLAS"
    },
    {
      name: "Cookbook",
      description: "Collection of financial algorithms and strategies",
      url: "https://github.com/The-Swarm-Corporation/Cookbook"
    }
];
  

export default function FintechPage() {
    return (
      <main className={`${inter.className} bg-black text-white min-h-screen`}>
  
        <section id="hero" className="pt-32 pb-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Revolutionizing Finance with Swarms</h1>
            <p className="text-xl md:text-2xl mb-8 text-white max-w-3xl mx-auto">
              Revolutionize financial services with agent-driven swarms for quant trading, document analysis, and high-frequency trading.
            </p>
            <Link href="https://cal.com/swarms/swarms-strategy-session?date=2024-12-03&month=2024-12" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors inline-flex items-center">
              Get Started <ArrowRight className="ml-2" />
            </Link>
          </div>
        </section>
  
        <section id="use-cases" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: BarChart3, title: "Quant Trading", description: "Leverage AI swarms for advanced quantitative trading strategies and market analysis." },
                { icon: FileText, title: "Financial Document Analysis", description: "Automate the processing and analysis of complex financial documents with unparalleled accuracy." },
                { icon: Zap, title: "High-Frequency Trading", description: "Execute trades at lightning speed with real-time decision making powered by LLM agent swarms." },
                { icon: Users, title: "Risk Management", description: "Enhance risk assessment and mitigation strategies with AI-driven insights." },
                { icon: Cpu, title: "Algorithmic Trading", description: "Develop and optimize sophisticated trading algorithms using swarm intelligence." },
                { icon: BarChart3, title: "Market Sentiment Analysis", description: "Analyze vast amounts of market data and news to gauge sentiment and predict trends." },
              ].map((useCase, index) => (
                <div key={index} className="bg-black p-6 rounded-lg shadow-md">
                  <useCase.icon className="w-12 h-12 mb-4 text-red-600" />
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-white">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        <section id="features" className="py-20 bg-black">
          <div className="container mx-auto px-6 bg-black">
            <h2 className="text-4xl font-bold mb-12 text-center">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Scalable Architecture", description: "Easily scale your LLM agent swarms to handle increasing workloads and complexity." },
                { title: "Real-time Processing", description: "Process and analyze data in real-time for immediate insights and decision-making." },
                { title: "Advanced AI Models", description: "Utilize state-of-the-art language models for unparalleled understanding and generation capabilities." },
                { title: "Customizable Workflows", description: "Tailor the swarm behavior to your specific use case and requirements." },
                { title: "Robust Security", description: "Enterprise-grade security measures to protect your sensitive financial data." },
                { title: "Seamless Integration", description: "Easily integrate with existing systems and workflows in your organization." },
              ].map((feature, index) => (
                <div key={index} className="bg-gray-900 p-6 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        <section id="github" className="py-20 bg-black">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-8">Explore Our Open Source Project</h2>
            <p className="text-xl mb-12 text-white max-w-3xl mx-auto">
              Dive into our codebase, contribute to the project, and join our community of developers pushing the boundaries of AI in finance.
            </p>
            <Link href="https://github.com/kyegomez/swarms" target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors inline-flex items-center">
              <Github className="mr-2" /> Visit Our GitHub Repository
            </Link>
          </div>
        </section>
  
        <section id="repository-gallery" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center text-white">Our GitHub Repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {repositories.map((repo) => (
                <Card key={repo.name} className="bg-black">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{repo.name}</CardTitle>
                    <CardDescription className="text-white">{repo.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center"
                    >
                      <Github className="mr-2" /> View on GitHub
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        <section id="about" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-8 text-center">About Swarms</h2>
            <p className="text-xl text-center max-w-4xl mx-auto mb-12 text-white">
              Swarms is a cutting-edge platform that harnesses the power of Large Language Model (LLM) agent swarms to revolutionize financial services. Our technology enables unprecedented levels of analysis, decision-making, and automation in quant trading, document processing, and high-frequency trading.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Our Mission", content: "To empower financial institutions with AI-driven swarm intelligence, enabling them to make faster, more accurate decisions in an increasingly complex market landscape." },
                { title: "Our Vision", content: "To become the global leader in AI-powered financial services, driving innovation and setting new standards for efficiency and performance in the industry." },
                { title: "Our Values", content: "Innovation, Integrity, Collaboration, and Excellence. We are committed to pushing the boundaries of what's possible while maintaining the highest ethical standards." },
              ].map((item, index) => (
                <div key={index} className="bg-black p-6 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-white">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        <section id="testimonials" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">What Our Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Anonymous", role: "Quant Trader, JPMorgan", quote: "Swarms has rapidly accelerated the implementation of our trading strategies. The speed and accuracy of their LLM agent swarms are unmatched." },
                { name: "Anonymous", role: "Portfolio Manager, BlackRock", quote: "Implementing Swarms for our document analysis has increased our efficiency by 300%. It's a game-changer." },
                { name: "Anonymous", role: "Head of Trading, Fidelity", quote: "The real-time capabilities of Swarms have given us a significant edge in high-frequency trading. Highly recommended." },
              ].map((testimonial, index) => (
                <div key={index} className="bg-black p-6 rounded-lg shadow-md">
                  <p className="text-white mb-4">"{testimonial.quote}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-white">{testimonial.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        <section id="contact" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-8 text-center">Book a Call</h2>
            <p className="text-xl text-center mb-12 text-white max-w-3xl mx-auto">
              Interested in learning more about how Swarms can transform your financial services? Schedule a call with our experts to discuss your specific needs and use cases.
            </p>
            <div className="flex justify-center">
              <Link href="https://cal.com/swarms/swarms-strategy-session?date=2024-12-03&month=2024-12" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors inline-flex items-center">
                <PhoneCall className="mr-2" /> Schedule a Call
              </Link>
            </div>
          </div>
        </section>
  
      </main>
    )
  }
  