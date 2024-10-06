import React from 'react';
import { FeatureCard } from '../cards/cards';

export default function SwarmsFeatures() {
  return (
    <section id="features" className="py-20">
      <h3 className="text-3xl font-bold mb-8 text-center">Key Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          title="Multi-Agent Collaboration"
          description="Enable seamless cooperation between multiple AI agents to tackle complex tasks."
        />
        <FeatureCard
          title="Bleeding-Edge Performance"
          description="Leverage cutting-edge optimizations for unparalleled speed and efficiency."
        />
        <FeatureCard
          title="External Agents Integration"
          description="Seamlessly integrate with external AI services and APIs to expand capabilities."
        />
        <FeatureCard
          title="Long-Term Memory"
          description="Equip agents with quasi-infinite long-term memory for enhanced context understanding."
        />
        <FeatureCard
          title="Customizable Workflows"
          description="Design and implement custom agent workflows tailored to your specific needs."
        />
        <FeatureCard
          title="Production-Ready"
          description="Built for enterprise-grade reliability and scalability out of the box."
        />
        <FeatureCard
          title="Flexible Agent Structures"
          description="Implement various multi-agent structures like Sequential, Hierarchical, and Forest Swarms."
        />
        <FeatureCard
          title="Advanced RAG Capabilities"
          description="Utilize Retrieval-Augmented Generation for improved context and knowledge retrieval."
        />
        <FeatureCard
          title="Dynamic Temperature Control"
          description="Automatically adjust language model temperature for optimal performance."
        />
      </div>
    </section>
  );
}
