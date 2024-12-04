'use client'

import { Inter } from 'next/font/google'
import Link from 'next/link'
import { ArrowRight, Brain, Microscope, Dna, Stethoscope, HeartPulse, Syringe, PhoneCall } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/spread_sheet_swarm/ui/card'

const inter = Inter({ subsets: ['latin'] })

export default function HealthcarePage() {
  return (
    <main className={`${inter.className} bg-black text-white min-h-screen`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">Swarms Healthcare</Link>
          <div className="hidden md:flex space-x-4">
            <Link href="#use-cases" className="hover:text-red-600 transition-colors">Use Cases</Link>
            <Link href="#features" className="hover:text-red-600 transition-colors">Features</Link>
            <Link href="#about" className="hover:text-red-600 transition-colors">About</Link>
          </div>
          <Link href="https://cal.com/swarms/swarms-strategy-session" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Book a Demo
          </Link>
        </nav>
      </header>

      <section id="hero" className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Revolutionizing Healthcare with AI Swarms</h1>
          <p className="text-xl md:text-2xl mb-8 text-white max-w-3xl mx-auto">
            Harness the power of agent swarms to automate diagnosis, optimize treatment plans, and enhance patient care across the healthcare industry.
          </p>
          <Link href="https://cal.com/swarms/swarms-strategy-session" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors inline-flex items-center">
            Schedule a Demo <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      <section id="use-cases" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">Healthcare Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Automated Diagnosis", description: "Leverage AI swarms to analyze patient data and provide accurate, rapid diagnoses across a wide range of medical conditions." },
              { icon: Microscope, title: "Medical Imaging Analysis", description: "Process and interpret X-rays, MRIs, and CT scans with unprecedented speed and accuracy, assisting radiologists in detecting abnormalities." },
              { icon: HeartPulse, title: "ECG Interpretation", description: "Analyze electrocardiograms in real-time, identifying potential cardiac issues and alerting healthcare providers to urgent cases." },
              { icon: Dna, title: "Genomic Data Analysis", description: "Accelerate genetic research and personalized medicine by processing vast amounts of genomic data to identify patterns and potential treatments." },
              { icon: Stethoscope, title: "Treatment Optimization", description: "Develop personalized treatment plans by analyzing patient data, medical history, and the latest research to suggest optimal interventions." },
              { icon: Syringe, title: "Drug Discovery", description: "Expedite the drug discovery process by simulating molecular interactions and predicting potential drug candidates for various diseases." },
            ].map((useCase, index) => (
              <Card key={index} className="bg-black border border-gray-800">
                <CardHeader>
                  <useCase.icon className="w-12 h-12 mb-4 text-red-600" />
                  <CardTitle className="text-xl font-semibold">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">Swarms Framework Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Scalable Architecture", description: "Easily scale your healthcare AI solutions to handle increasing data volumes and complexity." },
              { title: "Multi-Agent Collaboration", description: "Leverage multiple AI agents working in tandem to solve complex medical problems and improve patient outcomes." },
              { title: "Real-time Processing", description: "Analyze medical data in real-time, enabling rapid response to critical situations and emergencies." },
              { title: "Interoperability", description: "Seamlessly integrate with existing healthcare systems and EHRs for streamlined workflows." },
              { title: "Privacy and Security", description: "Ensure patient data protection with robust security measures and compliance with healthcare regulations." },
              { title: "Continuous Learning", description: "Adapt and improve over time by learning from new medical research and clinical outcomes." },
            ].map((feature, index) => (
              <Card key={index} className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8 text-center">About Swarms in Healthcare</h2>
          <p className="text-xl text-center max-w-4xl mx-auto mb-12 text-white">
            Swarms is revolutionizing healthcare by harnessing the power of AI agent swarms. Our technology enables unprecedented levels of analysis, decision-making, and automation in medical diagnosis, treatment planning, and research.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Our Mission", content: "To empower healthcare providers with AI-driven swarm intelligence, enabling faster, more accurate diagnoses and personalized treatment plans." },
              { title: "Our Vision", content: "To become the global leader in AI-powered healthcare solutions, driving innovation and setting new standards for patient care and medical research." },
              { title: "Our Values", content: "Innovation, Integrity, Compassion, and Excellence. We are committed to pushing the boundaries of healthcare technology while maintaining the highest ethical standards." },
            ].map((item, index) => (
              <Card key={index} className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* <section id="testimonials" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">What Healthcare Professionals Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Dr. Emily Chen", role: "Chief of Radiology, Metro Hospital", quote: "Swarms has revolutionized our imaging analysis. We're detecting abnormalities faster and with greater accuracy than ever before." },
              { name: "Dr. Michael Okoye", role: "Oncologist, Cancer Research Institute", quote: "The Swarms framework has accelerated our drug discovery process exponentially. We're identifying potential treatments in a fraction of the time." },
              { name: "Sarah Thompson", role: "Head Nurse, Intensive Care Unit", quote: "With Swarms, we're able to monitor patient vitals and predict complications before they occur. It's like having an extra set of expert eyes on every patient." },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-black border border-gray-800">
                <CardContent className="pt-6">
                  <p className="text-white mb-4">"{testimonial.quote}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-white">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      <section id="cta" className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Transform Healthcare with AI?</h2>
          <p className="text-xl mb-12 text-white max-w-3xl mx-auto">
            Discover how Swarms can revolutionize your healthcare practice or research. Book a demo to see our AI agent swarms in action and discuss your specific needs.
          </p>
          <Link href="https://cal.com/swarms/swarms-strategy-session" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors inline-flex items-center">
            <PhoneCall className="mr-2" /> Schedule Your Demo
          </Link>
        </div>
      </section>

      <footer className="bg-black py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white">&copy; 2023 Swarms Healthcare. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

