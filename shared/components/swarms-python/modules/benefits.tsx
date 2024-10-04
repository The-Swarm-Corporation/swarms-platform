import React from 'react';
import { BenefitCard } from '../cards/cards';

export default function SwarmsBenefits() {
  return (
    <section id="benefits" className="py-20">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold mb-8 text-center">
          Benefits of Swarms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BenefitCard
            title="Enhanced Problem-Solving"
            description="Leverage the collective intelligence of multiple agents to solve complex problems more effectively than single-agent systems."
          />
          <BenefitCard
            title="Scalability and Flexibility"
            description="Easily scale your AI solutions from simple tasks to complex workflows, adapting to your evolving business needs."
          />
          <BenefitCard
            title="Improved Efficiency"
            description="Automate and parallelize tasks across multiple agents, significantly reducing processing time and resource usage."
          />
          <BenefitCard
            title="Specialized Expertise"
            description="Combine agents with different areas of expertise to create a more comprehensive and knowledgeable system."
          />
          <BenefitCard
            title="Robust and Fault-Tolerant"
            description="Distribute tasks across multiple agents to create systems that are more resilient to failures and can continue operating even if some agents fail."
          />
          <BenefitCard
            title="Continuous Learning and Improvement"
            description="Implement agents that learn from each other and from their interactions, constantly improving their performance over time."
          />
        </div>
      </div>
    </section>
  );
}
