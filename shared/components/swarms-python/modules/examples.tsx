'use client';

import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import { CodePrismCard } from '../cards/cards';
import { codeSample } from '../const';
import MermaidDiagram from '@/shared/components/mermaid';
import { useTheme } from 'next-themes';

export default function SwarmsExamples() {
  const theme = useTheme();

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <section id="examples" className="py-20">
      <h3 className="text-3xl font-bold mb-8 text-center">
        Multi-Agent Structures
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CodePrismCard
          title="Sequential Workflow"
          code={codeSample['sequential_workflow'].code}
        >
          <div className="mt-10">
            <h3>Here&apos;s a sample diagram:</h3>
            <MermaidDiagram
              chart={codeSample['sequential_workflow'].chart}
              theme={theme.resolvedTheme}
            />
          </div>
        </CodePrismCard>
        <CodePrismCard
          title="Agent Rearrange"
          code={codeSample['agent_rearrange'].code}
        />
        <CodePrismCard
          title="Mixture of Agents"
          code={codeSample['mixture_of_agents'].code}
        >
          <div className="mt-10">
            <h3>Here&apos;s a sample diagram:</h3>
            <MermaidDiagram
              chart={codeSample['mixture_of_agents'].chart}
              theme={theme.resolvedTheme}
            />
          </div>
        </CodePrismCard>
        <CodePrismCard
          title="Forest Swarm"
          code={codeSample['forest_swarm'].code}
        />
      </div>
    </section>
  );
}
