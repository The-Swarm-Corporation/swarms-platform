import React from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Github, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { DISCORD, SWARMS_GITHUB } from '@/shared/constants/links';

export default function SwarmsHero() {
  return (
    <section className="text-center py-20">
      <h2 className="text-5xl font-bold mb-4">
        The Enterprise-Grade Production-Ready Multi-Agent Orchestration
        Framework
      </h2>
      <p className="text-xl mb-8">
        Orchestrate many agents to work collaboratively at scale to automate
        real-world activities.
      </p>
      <div className="flex justify-center space-x-4">
        <Link href={SWARMS_GITHUB}>
          <Button>
            <Github className="mr-2 h-4 w-4" /> Star on GitHub
          </Button>
        </Link>
        <Link href={DISCORD}>
          <Button variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" /> Join Discord
          </Button>
        </Link>
      </div>
    </section>
  );
}
