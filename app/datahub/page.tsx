"use client"

import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from '@/shared/components/ui/toaster'
import OptimizedDataHubGallery from '@/shared/components/datahub/datahub'

// Create a new QueryClient instance
const queryClient = new QueryClient()


export default function DataHubPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Enterprise Data Hub
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Manage and organize all your business documents in one centralized location.
                  </p>
                </div>
              </div>
              <div className="mx-auto max-w-5xl mt-8">
                <OptimizedDataHubGallery />
              </div>
            </div>
          </section>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}