'use client'

import { useEffect, useState } from 'react'

/**
 * Polls for window.google.ima after the next/script IMA SDK tag loads.
 * Returns true once the SDK is available.
 *
 * Why polling:
 * next/script's onLoad fires on the layout (a Server Component) so it can't
 * set React state in a child client component directly. Polling is the
 * simplest solution without adding a Context provider.
 */
export function useIMAReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.google?.ima) {
      setReady(true)
      return
    }

    const id = setInterval(() => {
      if (window.google?.ima) {
        setReady(true)
        clearInterval(id)
      }
    }, 100)

    return () => clearInterval(id)
  }, [])

  return ready
}
