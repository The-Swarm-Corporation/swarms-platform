import Link from 'next/link';

import Logo from '@/shared/components/icons/Logo';
import GitHub from '@/shared/components/icons/GitHub';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-900 text-foreground">
      <div className="grid grid-cols-1 gap-8 py-12 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
        <div className="col-span-1 lg:col-span-2">
          <span className="mr-2 flex border-zinc-700 gap-2 items-center ">
            <Logo />
            <span>TGSC</span>
          </span>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Home
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                About
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Careers
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://docs.swarms.world/en/latest/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Blog
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://docs.swarms.world/en/latest/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Documentation
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://github.com/kyegomez/swarms"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Github
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://github.com/kyegomez/swarm-ecosystem"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Swarms Ecosystem
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://discord.gg/gRXy5mpFHz"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Swarms Community
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-white transition duration-150 ease-in-out hover:text-zinc-200">
                Use-Cases
              </p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://swarms.world/fintech"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Swarms for Finance
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://swarms.world/healthcare"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Swarms for Healthcare
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://swarms.world/insurance"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Swarms for Insurance
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-start col-span-1 text-white lg:col-span-6 lg:justify-end">
          <div className="flex items-center h-10 space-x-6">
            <a
              aria-label="Github Repository"
              href="https://github.com/kyegomez/swarms"
            >
              <GitHub />
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between py-12 space-y-4 text-white md:flex-row bg-zinc-900">
        <div className="w-full text-center">
          <span>
            &copy; {new Date().getFullYear()} TGSC, Inc. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
