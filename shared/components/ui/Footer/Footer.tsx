import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="w-full bg-black border-t border-red-500/20">
      <div className="max-w-[1920px] mx-auto px-6 py-12">
        <div className="flex flex-col items-start">
          {/* Main content */}
          <div className="w-full">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              SWARMS MARKETPLACE
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl">
              Share and discover agents, prompts, and tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Go back</span>
              </button>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Home</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-red-500/20">
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} Swarms.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
