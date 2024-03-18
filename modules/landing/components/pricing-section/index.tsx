"use client";

import Meteors from "@/shared/components/meteors";
import { BackgroundGradient } from "@/shared/components/background-gradient";
import { CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

const items = [
  {
    title: 'Standard',
    description: 'For small teams with big ambitions.',
    features: [
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
    ]
  },
  {
    title: 'Pro',
    description: 'Enterprise support and features.',
    features: [
      '10GB Memory',
      '10K Tokens  0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
    ]
  },
  {
    title: 'Custom',
    description: 'Enterprise-grade support and features.',
    features: [
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
      '10GB Memory',
      '10K Tokens 0.1$',
    ]
  },
]

const PricingSection = () => {
  return (
    <div className="flex flex-col container mx-auto">
      <div className="flex flex-col justify-center items-center m-10">
        <h1 className="text-6xl font-bold">
          Pricing
        </h1>
        <p>
          description
        </p>
      </div>
      <div className="flex max-lg:flex-col gap-4 py-8 justify-center items-center">
        {items.map((item, index) => {
          return (
              <div className="flex-1 w-full flex relative max-w-sm">
                <div className="absolute inset-0 h-full w-full" />
                <BackgroundGradient key={`LANDING_PRICING_${index}`} className="relative overflow-hidden rounded-[22px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
                  <h5 className="text-xl font-extrabold">
                    {item.title}
                  </h5>
                  <p className="text-sm sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                    {item.description}
                  </p>
                  <div className="my-4">
                    {item.features.map(feat=> {
                      return(
                        <div className="flex gap-2 my-2">
                          <CheckCircle />
                          <p>{feat}</p>
                        </div>
                      )
                    })}
                  </div>
                  <Button className="w-full">
                    <span>Buy now </span>
                  </Button>
                  {
                    index === 1 && <Meteors number={20} />
                  }
                </BackgroundGradient>           
              </div>
          )
        })}
      </div>
    </div>
  )
}

export default PricingSection;