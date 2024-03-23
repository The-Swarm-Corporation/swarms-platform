'use client';

import Meteors from '@/shared/components/meteors';
import { BackgroundGradient } from '@/shared/components/background-gradient';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';
import { PLATFORM } from '@/shared/constants/links';

const items = [
  {
    title: 'Premium',
    description: 'For small teams with big ambitions.',
    features: [
      'Access to the best Multi-Modal models',
      '100% Uptime with 24/7 Support'
    ]
  },
  {
    title: 'Enterprise',
    description: 'Enterprise-grade support and features.',
    features: []
  }
];

const PricingSection = () => {
  return (
    <div className="flex flex-col container mx-auto">
      <div className="flex flex-col justify-center items-center m-10 ">
        <h1 className="text-6xl font-bold">Pricing</h1>
        <p>description</p>
      </div>
      <div className="flex max-lg:flex-col gap-4 py-8 justify-center items-center h-[600px]">
        {items.map((item, index) => {
          return (
            <div className="flex-1 w-full flex relative max-w-sm h-full">
              <div className="absolute inset-0 h-full w-full" />
              <BackgroundGradient
                key={`LANDING_PRICING_${index}`}
                className="relative overflow-hidden rounded-[22px] p-4 sm:p-10 bg-white dark:bg-zinc-900 w-full h-full"
              >
                <div className="flex flex-col justify-between h-[max-content]">
                  <div>
                    <h5 className="text-xl font-extrabold">{item.title}</h5>
                    <p className="text-sm sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                      {item.description}
                    </p>
                    <div className="my-4">
                      {item.features.map((feat) => {
                        return (
                          <div className="flex gap-2 my-2">
                            <CheckCircle />
                            <p>{feat}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link href={PLATFORM.ACCOUNT}>
                    <Button className="w-full">
                      <span>
                        {item.title == 'Enterprise'
                          ? 'Contact us'
                          : 'Subscribe'}
                      </span>
                    </Button>
                  </Link>
                </div>
                {index === 1 && <Meteors number={20} />}
              </BackgroundGradient>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingSection;
