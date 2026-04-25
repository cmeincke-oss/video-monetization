'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

/**
 * Client-side wrapper for React Query v3 QueryClientProvider.
 * Must be a "use client" component — QueryClientProvider uses React context
 * which is not compatible with React Server Components.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
