'use client';
import React from 'react';
import { Button } from '@/shared/components/ui/Button';
import { PLATFORM, SWARMS_GITHUB } from '@/shared/constants/links';
import { cn } from '@/shared/utils/cn';
import { Github } from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <div className="mx-auto md:pb-40 w-full">
      <div className="flex flex-col items-center px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8 gap-6 text-center">
        <h1 className="text-6xl md:text-7xl font-bold ">
          Orchestrate Agents with
        </h1>
        <h1 className="text-6xl md:text-7xl font-bold text-primary">Swarms</h1>
        <span className="text-2xl font-medium">
          Production-Grade Agents Through Multi-Agent Collaboration
        </span>
        <div className="flex flex-col bg-background rounded-xl overflow-hidden">
          <span className="w-full bg-primary text-white p-1">Terminal</span>
          <span className="p-3 text-white">pip3 install -U swarms</span>
        </div>
        <div className="flex gap-4 mt-8">
          <Link href={PLATFORM.DASHBOARD} target="_blank">
            <Button
              className={cn(
                'text-base flex gap-2 font-normal',
                'bg-primary',
                'hover:bg-primary/90',
                'text-white',
                'px-10 py-6',
                'rounded-md'
              )}
            >
              Swarms Cloud
            </Button>
          </Link>
          <Link href={SWARMS_GITHUB} target="_blank">
            <Button
              className={cn(
                'text-base flex gap-2 font-normal',
                'bg-white',
                'hover:bg-white/90',
                'text-background',
                'px-10 py-6',
                'rounded-md'
              )}
            >
              <Github size={18} />
              Github
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
