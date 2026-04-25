import { NextResponse } from 'next/server'

interface WatchlistBody {
  ticker: string
}

/**
 * Mock watchlist endpoint — replace with real implementation.
 * Called by useWatchlist() hook via React Query useMutation.
 */
export async function POST(request: Request) {
  const body: WatchlistBody = await request.json()

  if (!body.ticker) {
    return NextResponse.json({ error: 'ticker is required' }, { status: 400 })
  }

  // TODO: persist to real watchlist service
  return NextResponse.json({ success: true, ticker: body.ticker })
}
