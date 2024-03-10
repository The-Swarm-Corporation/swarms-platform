'use client';

import { Button } from '@/shared/components/ui/Button';
import { PANEL, SWARMS_GITHUB } from '@/shared/constants/links';
import { cn } from '@/shared/utils/cn';
import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Landing() {
  return (
    <>
      <header>
        <div className="flex flex-col items-center max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8 gap-6">
          <h1 className="text-7xl font-bold ">Orchestrate Agents with</h1>
          <h1 className="text-7xl font-bold text-primary ">Swarms</h1>
          <span className="text-2xl font-medium">
            Production-Grade Agents Through Multi-Agent Collaboration
          </span>
          <div className="flex gap-4 mt-8">
            <Link href={PANEL.DASHBOARD}>
              <Button
                className={cn(
                  'text-base flex gap-2 font-normal w-[200px]',
                  'bg-primary',
                  'hover:bg-primary/90',
                  'text-white',
                  'px-10 py-6',
                  'rounded-full'
                )}
              >
                Swarms Cloud
              </Button>
            </Link>
            <Link href={SWARMS_GITHUB}>
              <Button
                className={cn(
                  'text-base flex gap-2 font-normal w-[200px]',
                  'bg-white',
                  'hover:bg-white/90',
                  'text-background',
                  'px-10 py-6',
                  'rounded-full'
                )}
              >
                <Github size={18} />
                Github
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className=""></section>
    </>
  );
}
