// app/documents/page.tsx
"use client"

import { Suspense } from 'react'
import { QueryClientProvider, QueryClient } from 'react-query'
import { Toaster } from '@/shared/components/ui/toaster'
import EnterpriseDataHub from '@/shared/components/datahub/datahub'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2 } from 'lucide-react'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)

const ErrorBoundary = ({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertDescription>
      Error loading document hub: {error.message}
    </AlertDescription>
  </Alert>
)

export default function DocumentHubPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <div className="min-h-screen bg-background">
          <EnterpriseDataHub />
          <Toaster />
        </div>
      </Suspense>
    </QueryClientProvider>
  )
}