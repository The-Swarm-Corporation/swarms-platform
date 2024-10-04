import React from 'react';

export default function SwarmsHowItWorks() {
  return (
    <section className="py-20">
      <h3 className="text-3xl font-bold mb-8 text-center">How Swarms Works</h3>
      <div className="max-w-3xl mx-auto">
        <ol className="list-decimal space-y-6 pl-6">
          <li className="text-lg">
            <strong>Agent Creation:</strong> Define individual AI agents with
            specific roles, capabilities, and knowledge bases using various
            language models.
          </li>
          <li className="text-lg">
            <strong>Swarm Structure:</strong> Organize agents into swarm
            structures (e.g., Sequential, Hierarchical, Forest) based on your
            task requirements.
          </li>
          <li className="text-lg">
            <strong>Task Distribution:</strong> Break down complex tasks and
            distribute them among agents in the swarm based on their
            specializations.
          </li>
          <li className="text-lg">
            <strong>Collaborative Processing:</strong> Agents work together,
            sharing information and intermediate results to solve problems
            collectively.
          </li>
          <li className="text-lg">
            <strong>Memory and Context Management:</strong> Utilize long-term
            memory and RAG capabilities to maintain context across multiple
            interactions.
          </li>
          <li className="text-lg">
            <strong>Dynamic Optimization:</strong> Automatically adjust
            parameters like temperature to optimize agent performance in
            real-time.
          </li>
          <li className="text-lg">
            <strong>Result Aggregation:</strong> Combine outputs from multiple
            agents to produce comprehensive and refined final results.
          </li>
        </ol>
      </div>
    </section>
  );
}
