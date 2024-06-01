'use client';
import { Button } from '@/shared/components/ui/Button';
import { PLATFORM, SWARMS_GITHUB } from '@/shared/constants/links';
import { cn } from '@/shared/utils/cn';
import Rive from '@rive-app/react-canvas';
import { Github } from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <div className="mx-auto container w-full flex flex-col xl:flex-row xl:h-screen justify-center items-center gap-8 xl:gap-0">
      <div className="md:flex-1 flex flex-col items-center text-center md:text-left md:items-start md:px-4 gap-6 ">
        <h1 className="text-6xl md:text-7xl font-bold text-primary">Swarms</h1>
        <h2 className="text-4xl md:text-5xl font-bold">Orchestrate Agents</h2>
        <span className="text-2xl font-medium">
          The Multi-Agent Collaboration Platform
        </span>
        <div className="flex flex-col bg-background rounded-xl overflow-hidden border-2 border-primary">
          <span className="w-full bg-primary text-white p-1">Terminal</span>
          <span className="p-3">pip3 install -U swarms</span>
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
                'rounded-md',
              )}
            >
              Swarms Cloud
            </Button>
          </Link>
          <Link href={SWARMS_GITHUB} target="_blank">
            <Button
              className={cn(
                'text-base flex gap-2 font-normal',
                'px-10 py-6',
                'rounded-md',
              )}
              variant="foreground"
            >
              <Github size={18} />
              Github
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex w-full md:h-full flex-col items-start md:flex-1 md:px-4 gap-6 text-left">
        <Rive src={'/animation-hero.riv'} stateMachines="Branchs" />
      </div>
    </div>
  );
};

export default HeroSection;
