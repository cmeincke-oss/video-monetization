'use client'

import { useEffect, useState } from 'react'

/**
 * Polls for window.google.ima after the next/script IMA SDK tag loads.
 * Returns true once the SDK is available on the window object.
 *
 * Why polling instead of onLoad callback:
 * next/script onLoad fires on the layout (server component) so it can't
 * directly set React state in a client component. Polling is the simplest
 * cross-component solution without a Context provider.
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
