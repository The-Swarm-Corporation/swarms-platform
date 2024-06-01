'use client';
import DiscordImage from '@/public/images/discord.png';
import GitHubImage from '@/public/images/github.png';
import TwitterImage from '@/public/images/twitter.png';
import AnimatedTooltip from '@/shared/components/tool-tip';
import { motion } from 'framer-motion';
import Image from 'next/image';

const OpenSourceSection = () => {
  return (
    <div className="flex max-md:flex-col">
      <div className="flex-1 h-[40rem] w-full rounded-md flex md:items-center md:justify-center antialiased relative overflow-hidden">
        {/* <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
          /> */}
        <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-950 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400 bg-opacity-50">
            Everything Is <br /> Open Source
          </h1>
          <p className="mt-4 font-normal text-base text-neutral-700 dark:text-neutral-300 max-w-lg text-center mx-auto">
            TGSC is radically focused on transparency and open source. We
            believe that the best way to build a better future is by working
            together.
          </p>
        </div>
      </div>
      <div className="min-h-72 flex-1 flex justify-center items-center relative overflow-hidden">
        <motion.div
          transition={{ duration: 10, repeat: Infinity, ease: 'easeIn' }}
          initial="rest"
          animate={{
            x: [-50, -10, -50],
            y: [-70, 10, -70],
          }}
          className="flex flex-col items-center gap-10 cursor-pointer"
        >
          <AnimatedTooltip
            tooltip={
              <p className="text-base md:text-2xl text-secondary font-bold">
                {' '}
                Join Community{' '}
              </p>
            }
          >
            <div className="w-24 h-24 md:w-32 md:h-32">
              <a href='https://discord.gg/gr5Hf8Tt'>
                <Image
                  alt="discord"
                  fill
                  className="object-fill object-left-top absolute rounded-lg inset-0"
                  src={DiscordImage}
                />
              </a>
            </div>
          </AnimatedTooltip>
        </motion.div>
        <motion.div
          transition={{ duration: 3, repeat: Infinity, ease: 'easeIn' }}
          initial="rest"
          animate={{
            x: [10, -5, 10],
            y: [10, -5, 10],
          }}
          className="flex flex-col items-center gap-10 cursor-pointer"
        >
          <AnimatedTooltip
            tooltip={
              <p className="text-base md:text-2xl text-secondary font-bold">
                {' '}
                Join Us{' '}
              </p>
            }
          >
            <div className="w-28 h-28 md:w-60 md:h-60">
              <a href='https://github.com/kyegomez/swarms-platform'>
                <Image
                  alt="github"
                  fill
                  className="object-fill object-left-top absolute rounded-lg inset-0"
                  src={GitHubImage}
                />
              </a>
            </div>
          </AnimatedTooltip>
        </motion.div>
        <motion.div
          transition={{ duration: 7, repeat: Infinity, ease: 'easeIn' }}
          initial="rest"
          animate={{
            x: [50, 30, 50],
            y: [-10, 5, -10],
          }}
          className="flex flex-col items-center gap-10 cursor-pointer"
        >
          <AnimatedTooltip
            tooltip={
              <p className="text-base md:text-2xl text-secondary font-bold">
                {' '}
                Follow Us on X{' '}
              </p>
            }
          >
            <div className="w-24 h-24 md:w-32 md:h-32">
              <Image
                alt="twitter"
                fill
                className="object-fill object-left-top absolute rounded-lg inset-0"
                src={TwitterImage}
              />
            </div>
          </AnimatedTooltip>
        </motion.div>
      </div>
    </div>
  );
};

export default OpenSourceSection;
