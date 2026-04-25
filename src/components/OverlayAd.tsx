'use client'

import { useWatchlist } from '@/hooks/useWatchlist'

interface AdData {
  ticker: string
  company: string
  price: string
  change: string
  positive: boolean
  gradient: string
}

interface OverlayAdProps {
  ad: AdData
  onDismiss: () => void
}

/**
 * Native overlay ad card — appears over playing video without pausing it.
 * Contains ticker badge, price data, and an Add to Watchlist CTA.
 *
 * Positioning (bottom-left for 16:9 and 1:1, bottom full-width for 9:16)
 * is handled by the parent OverlayPlayer component.
 */
export function OverlayAd({ ad, onDismiss }: OverlayAdProps) {
  const { mutate, isLoading, isSuccess } = useWatchlist()

  return (
    <div className="relative flex items-center gap-2.5 rounded-xl border border-white/[0.09] bg-black/90 p-2.5 pr-7 backdrop-blur-md animate-slide-up">
      {/* Ticker badge */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
        style={{ background: ad.gradient }}
      >
        {ad.ticker}
      </div>

      {/* Ad body */}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[9px] uppercase tracking-[0.7px] text-white/50">
          Sponsored
        </p>
        <p className="truncate text-xs font-bold text-white">{ad.company}</p>
        <p className="mb-1.5 text-[11px] text-white/60">
          {ad.price}{' '}
          <span className={ad.positive ? 'text-[#00b87c]' : 'text-[#e84b4b]'}>
            {ad.change}
          </span>
        </p>

        {/* Add to Watchlist — wired to useWatchlist React Query mutation */}
        {isSuccess ? (
          <span className="inline-flex items-center gap-1 rounded border border-[#00b87c] px-2 py-1 text-[10px] font-bold text-[#00b87c]">
            ✓ Added
          </span>
        ) : (
          <button
            onClick={() => mutate(ad.ticker)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-[5px] bg-[#00b87c] px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#00d690] disabled:opacity-60"
          >
            {isLoading ? 'Adding…' : '+ Add to Watchlist'}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onDismiss}
        className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/10 text-[10px] text-white/60 transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Dismiss ad"
      >
        ✕
      </button>
    </div>
  )
}
