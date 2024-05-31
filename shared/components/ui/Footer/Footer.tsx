import Link from 'next/link';

import Logo from '@/shared/components/icons/Logo';

export default function Footer() {
  return (
    <footer className="mx-auto w-full px-6 bg-zinc-900 text-foreground">
      <div className="flex px-32 justify-between py-12 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
        <div className=" py-12">
          <span className="mr-2 flex border-zinc-700 gap-2 items-center">
            <Logo width={60} height={60}/>
            <span>TGSC</span>
          </span>
        </div>
        <div className='flex gap-[100px]'>
        <div >
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
                href="https://swarms.apac.ai/en/latest/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Blog
              </Link>
            </li>
           
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://swarms.apac.ai/en/latest/"
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
                LEGAL
              </p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Privacy Policy
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between py-6 space-y-4 text-white md:flex-row bg-zinc-900">
        <div className="w-full text-center">
          <span>
            &copy; {new Date().getFullYear()} TGSC, Inc. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
