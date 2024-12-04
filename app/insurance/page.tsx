'use client'

import { Inter } from 'next/font/google'
import Link from 'next/link'
import { ArrowRight, Shield, FileText, Clock, DollarSign, BarChart, Users, PhoneCall, Zap, Brain, Lock, Globe, Briefcase, Car, Home, Umbrella, HeartPulse, Plane } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/spread_sheet_swarm/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion'

const inter = Inter({ subsets: ['latin'] })

export default function InsurancePage() {
    return (
      <main className={`${inter.className} bg-black text-white min-h-screen`}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">Swarms Insurance</Link>
            <div className="hidden md:flex space-x-4">
              <Link href="#use-cases" className="hover:text-red-600 transition-colors">Use Cases</Link>
              <Link href="#applications" className="hover:text-red-600 transition-colors">Applications</Link>
              <Link href="#industry-solutions" className="hover:text-red-600 transition-colors">Industry Solutions</Link>
              <Link href="#technology" className="hover:text-red-600 transition-colors">Technology</Link>
              <Link href="#case-studies" className="hover:text-red-600 transition-colors">Case Studies</Link>
            </div>
            <Link href="https://cal.com/swarms/swarms-strategy-session" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Book a Demo
            </Link>
          </nav>
        </header>
  
        <section id="hero" className="pt-32 pb-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Revolutionize Insurance with AI Swarms</h1>
            <p className="text-xl md:text-2xl mb-8 text-white max-w-3xl mx-auto">
              Harness the power of agent swarms to automate underwriting, streamline claims processing, and optimize risk assessment across your entire insurance operations.
            </p>
            <Link href="https://cal.com/swarms/swarms-strategy-session" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors inline-flex items-center">
              Transform Your Insurance Business <ArrowRight className="ml-2" />
            </Link>
          </div>
        </section>
  
        <section id="use-cases" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">Comprehensive Insurance Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Automated Underwriting", description: "Leverage AI swarms to analyze complex risk factors and make accurate underwriting decisions in a fraction of the time." },
                { icon: FileText, title: "Claims Processing", description: "Streamline claims handling with intelligent document analysis and fraud detection, reducing processing time by up to 80%." },
                { icon: Clock, title: "Real-time Risk Assessment", description: "Continuously monitor and assess risks using real-time data, enabling dynamic pricing and proactive risk management." },
                { icon: DollarSign, title: "Premium Optimization", description: "Utilize advanced algorithms to optimize premium pricing, balancing competitiveness with profitability." },
                { icon: BarChart, title: "Predictive Analytics", description: "Forecast trends, identify emerging risks, and make data-driven decisions to stay ahead of the market." },
                { icon: Users, title: "Customer Segmentation", description: "Develop highly targeted insurance products and marketing strategies based on sophisticated customer segmentation." },
                { icon: Zap, title: "Fraud Detection", description: "Employ AI swarms to analyze patterns and detect fraudulent claims with unprecedented accuracy." },
                { icon: Brain, title: "Policy Recommendation", description: "Provide personalized policy recommendations based on individual customer profiles and needs." },
                { icon: Lock, title: "Cybersecurity Risk Assessment", description: "Evaluate and quantify cybersecurity risks for businesses, offering tailored cyber insurance solutions." },
                { icon: Globe, title: "Catastrophe Modeling", description: "Simulate and assess the potential impact of natural disasters to improve risk management and pricing strategies." },
                { icon: Briefcase, title: "Business Interruption Analysis", description: "Analyze complex business operations to accurately assess and price business interruption insurance." },
                { icon: Users, title: "Customer Lifetime Value Prediction", description: "Forecast customer lifetime value to optimize acquisition and retention strategies." },
              ].map((useCase, index) => (
                <Card key={index} className="bg-black border border-gray-800">
                  <CardHeader>
                    <useCase.icon className="w-12 h-12 mb-4 text-red-600" />
                    <CardTitle className="text-xl font-semibold text-white">{useCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{useCase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        <section id="applications" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center text-white">Advanced Applications of Swarms in Insurance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Intelligent Document Processing", description: "Swarms can process and extract information from various document types, including policies, claims forms, and medical records, with high accuracy and speed." },
                { title: "Natural Language Processing for Customer Service", description: "Implement advanced chatbots and virtual assistants that can handle complex customer queries and provide personalized support." },
                { title: "IoT Data Integration", description: "Analyze data from IoT devices to offer usage-based insurance products and improve risk assessment in real-time." },
                { title: "Automated Compliance Checking", description: "Ensure all policies and processes comply with the latest regulations across different jurisdictions." },
                { title: "Sentiment Analysis", description: "Monitor social media and customer interactions to gauge sentiment and identify potential issues before they escalate." },
                { title: "Claims Triage", description: "Automatically categorize and prioritize claims based on severity, complexity, and potential fraud risk." },
                { title: "Personalized Customer Journey Mapping", description: "Create dynamic, personalized customer journeys that adapt in real-time based on customer behavior and preferences." },
                { title: "Risk Scenario Simulation", description: "Run complex simulations to stress-test insurance portfolios against various risk scenarios." },
              ].map((application, index) => (
                <Card key={index} className="bg-black border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold">{application.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{application.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        <section id="industry-solutions" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center text-white">Industry-Specific Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Car, title: "Auto Insurance", description: "Implement usage-based insurance, real-time risk assessment, and automated claims processing for vehicles." },
                { icon: Home, title: "Property Insurance", description: "Utilize satellite imagery and IoT data for accurate property valuation and risk assessment." },
                { icon: Briefcase, title: "Commercial Insurance", description: "Offer tailored risk management solutions for businesses of all sizes, leveraging industry-specific data." },
                { icon: HeartPulse, title: "Health Insurance", description: "Provide personalized health plans and automate claims processing for medical treatments." },
                { icon: Umbrella, title: "Life Insurance", description: "Streamline underwriting with AI-powered health assessments and offer dynamic policy adjustments." },
                { icon: Plane, title: "Travel Insurance", description: "Deliver instant, personalized travel insurance quotes based on real-time global risk data." },
              ].map((solution, index) => (
                <Card key={index} className="bg-black border border-gray-800">
                  <CardHeader>
                    <solution.icon className="w-12 h-12 mb-4 text-red-600" />
                    <CardTitle className="text-xl font-semibold">{solution.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{solution.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        <section id="technology" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center text-white">The Technology Behind Swarms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Multi-Agent Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Swarms utilizes a network of intelligent agents that collaborate to solve complex insurance problems. Each agent specializes in specific tasks, allowing for parallel processing and enhanced decision-making capabilities.</p>
                </CardContent>
              </Card>
              <Card className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Advanced Machine Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Our system employs state-of-the-art machine learning algorithms, including deep learning and reinforcement learning, to continuously improve its performance and adapt to new patterns in insurance data.</p>
                </CardContent>
              </Card>
              <Card className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Natural Language Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Swarms incorporates advanced NLP capabilities to understand and process unstructured data from various sources, including policy documents, customer communications, and industry reports.</p>
                </CardContent>
              </Card>
              <Card className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Distributed Computing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Our platform leverages distributed computing architecture to handle massive amounts of data and complex calculations in real-time, ensuring scalability and high performance.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
  
        <section id="value-proposition" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">The Swarms Value Equation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Quantifiable Impact</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <ArrowRight className="mr-2 mt-1 text-red-600" />
                    <span>Reduce underwriting time by 95%, from 5 days to 6 hours per complex case</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="mr-2 mt-1 text-red-600" />
                    <span>Process 10,000 claims per day, up from 1,000, with the same team size</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="mr-2 mt-1 text-red-600" />
                    <span>Improve fraud detection by 75%, saving $10 million annually on false claims</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="mr-2 mt-1 text-red-600" />
                    <span>Increase customer retention by 25% through faster processing and personalized service</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="mr-2 mt-1 text-red-600" />
                    <span>Reduce operational costs by 40% through automation and improved efficiency</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="mr-2 mt-1 text-red-600" />
                    <span>Increase new business acquisition by 30% with AI-driven lead scoring and targeting</span>
                  </li>
                </ul>
              </div>
              <Card className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Annual Value Delivered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-red-600 mb-4">$100 Million+</p>
                  <p className="text-white">Through increased efficiency, reduced losses, improved customer retention, and new business growth</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
  
        <section id="implementation" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">Implementation and Integration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Seamless Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Swarms integrates seamlessly with your existing insurance systems and workflows. Our flexible API allows for easy connection to your core insurance platforms, CRM systems, and data warehouses, ensuring a smooth transition and minimal disruption to your operations.</p>
                </CardContent>
              </Card>
              <Card className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Rapid Deployment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Our experienced team of insurance technology experts can deploy Swarms in your environment within weeks, not months. We offer a phased implementation approach, allowing you to see immediate benefits while gradually expanding the systems capabilities.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
  
        <section id="case-studies" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Global Insurer Transforms Underwriting", description: "A leading global insurer implemented Swarms for commercial underwriting, reducing processing time by 80% and improving accuracy by 35%." },
                { title: "Regional Health Insurer Streamlines Claims", description: "A regional health insurance provider used Swarms to automate 70% of claims processing, reducing costs by $15 million annually." },
                { title: "Auto Insurer Revolutionizes Customer Experience", description: "A major auto insurance company leveraged Swarms to offer real-time, usage-based insurance, increasing customer satisfaction by 40%." },
              ].map((study, index) => (
                <Card key={index} className="bg-black border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">{study.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{study.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        <section id="faq" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { question: "How does Swarms ensure data security and privacy?", answer: "Swarms employs state-of-the-art encryption, access controls, and compliance measures to ensure the highest level of data security and privacy. We adhere to all relevant industry standards and regulations, including GDPR and HIPAA." },
                { question: "Can Swarms integrate with our existing legacy systems?", answer: "Yes, Swarms is designed to integrate seamlessly with a wide range of legacy systems. Our flexible API and experienced integration team ensure smooth connectivity with your existing infrastructure." },
                { question: "How long does it take to implement Swarms in our organization?", answer: "The implementation timeline varies depending on the scope and complexity of your needs. Typically, we can deploy initial functionalities within 4-6 weeks, with full implementation completed in 3-6 months." },
                { question: "How does Swarms handle regulatory compliance across different jurisdictions?", answer: "Swarms is built with regulatory compliance in mind. Our system is regularly updated to reflect the latest regulatory changes across various jurisdictions, and can be customized to meet specific regional requirements." },
                { question: "What kind of support and training do you offer?", answer: "We provide comprehensive support and training throughout the implementation process and beyond. This includes on-site training, webinars, documentation, and 24/7 technical support to ensure your team can maximize the benefits of Swarms." },
              ].map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-white hover:text-red-600">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
  
        <section id="cta" className="py-20 bg-black">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-8">Ready to Revolutionize Your Insurance Operations?</h2>
            <p className="text-xl mb-12 text-white max-w-3xl mx-auto">
              Discover how Swarms can transform your insurance business. Book a demo to see our AI agent swarms in action and discuss your specific needs.
            </p>
            <Link href="https://cal.com/swarms/swarms-strategy-session" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors inline-flex items-center">
              <PhoneCall className="mr-2" /> Schedule Your Personalized Demo
            </Link>
          </div>
        </section>
  
        <footer className="bg-black py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-white">&copy; 2023 Swarms Insurance Solutions. All rights reserved.</p>
          </div>
        </footer>
      </main>
    )
  }