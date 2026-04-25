'use client'

import { useMutation } from 'react-query'

interface WatchlistResponse {
  success: boolean
  ticker: string
}

async function addToWatchlist(ticker: string): Promise<WatchlistResponse> {
  const res = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker }),
  })
  if (!res.ok) throw new Error('Failed to add to watchlist')
  return res.json()
}

/**
 * React Query v3 mutation for adding a ticker to the watchlist.
 * In production, replace the fetch URL with the real API endpoint.
 *
 * Usage:
 *   const { mutate, isLoading, isSuccess } = useWatchlist()
 *   mutate('NVDA')
 */
export function useWatchlist() {
  return useMutation(addToWatchlist)
}
