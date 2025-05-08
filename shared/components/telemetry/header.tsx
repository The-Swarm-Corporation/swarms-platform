import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { ThemeToggle } from '@/shared/components/telemetry/theme-toggle';
import { DollarSign, Settings } from 'lucide-react';
import Logo from '../icons/Logo';

export function Header() {
  return (
    <header className="h-14 fixed w-full z-[10000] border-b border-zinc-800 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 lg:px-6">
      <Logo className="md:hidden" />

      <Link href="/" className="flex items-center space-x-4">
        <h1 className="hidden md:block text-lg font-semibold text-red-600">
          Swarms Console
        </h1>
      </Link>

      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          className="hidden lg:flex border-red-500 hover:border-red-600 bg-white hover:bg-red-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-red-500"
          asChild
        >
          <Link href="/telemetry/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden lg:flex border-red-500 hover:border-red-600 bg-white hover:bg-red-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-red-500"
          asChild
        >
          <Link href="/telemetry/pricing">
            <DollarSign className="mr-2 h-4 w-4" />
            Pricing
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex border-red-500 hover:border-red-600 bg-white hover:bg-red-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-red-500"
          asChild
        >
          <Link
            href="https://swarms.world/platform/api-keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get API Key
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex border-red-500 hover:border-red-600 bg-white hover:bg-red-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-red-500"
          asChild
        >
          <Link
            href="https://docs.swarms.world/en/latest/swarms_cloud/swarms_api/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex border-red-500 hover:border-red-600 bg-white hover:bg-red-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-red-500"
          asChild
        >
          <Link
            href="https://github.com/kyegomez/swarms"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
