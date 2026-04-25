'use client'

import { useState } from 'react'
import { OverlayAd } from './OverlayAd'

export type AspectRatio = '16x9' | '1x1' | '9x16'

const VIDEO_SRC =
  'https://videos.stocktwits-cdn.com/hls/2026/03/26/69ee8298-8c28-42e1-b686-43e84dc29610/fq6gh7vs9vzzy7rkkx2fll5vlsu3_download.mp4'

const AD_DATA = {
  '16x9': {
    ticker: 'NVDA',
    company: 'NVIDIA Corporation',
    price: '$875.40',
    change: '+2.4%',
    positive: true,
    gradient: 'linear-gradient(135deg,#0a3d20,#0d6e38)',
  },
  '1x1': {
    ticker: 'TSLA',
    company: 'Tesla, Inc.',
    price: '$248.50',
    change: '-1.1%',
    positive: false,
    gradient: 'linear-gradient(135deg,#1a1a3e,#0d1b6e)',
  },
  '9x16': {
    ticker: 'AAPL',
    company: 'Apple Inc.',
    price: '$187.20',
    change: '+0.8%',
    positive: true,
    gradient: 'linear-gradient(135deg,#3a1a1a,#6e1d0d)',
  },
} as const

// Shell dimensions per aspect ratio
const SHELL_CLASSES: Record<AspectRatio, string> = {
  '16x9': 'w-[480px] h-[270px]',
  '1x1':  'w-[300px] h-[300px]',
  '9x16': 'w-[240px] h-[427px]',
}

interface OverlayPlayerProps {
  aspectRatio: AspectRatio
}

/**
 * Overlay ad player — video plays uninterrupted while a native ad card
 * appears over the content. No IMA SDK required for overlay ads.
 *
 * Overlay positioning per aspect ratio:
 * - 16:9 / 1:1 → bottom-left card (absolute bottom + left)
 * - 9:16       → bottom full-width card (absolute bottom, left+right inset)
 *
 * The ad card is dismissed by the user (close button) or auto-dismissed
 * after AUTO_DISMISS_MS milliseconds.
 */

const AUTO_DISMISS_MS = 12_000

export function OverlayPlayer({ aspectRatio }: OverlayPlayerProps) {
  const [playing, setPlaying]     = useState(false)
  const [showAd, setShowAd]       = useState(false)

  function handlePlay() {
    setPlaying(true)
    // Show overlay shortly after playback starts
    setTimeout(() => setShowAd(true), 800)
    setTimeout(() => setShowAd(false), 800 + AUTO_DISMISS_MS)
  }

  const is9x16 = aspectRatio === '9x16'

  // Overlay position classes
  const overlayPositionClass = is9x16
    ? 'bottom-2.5 left-2.5 right-2.5'          // full-width, bottom
    : 'bottom-9 left-2.5 w-[260px]'            // bottom-left card

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-black ${SHELL_CLASSES[aspectRatio]}`}>

      {/* Play button */}
      {!playing && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/35 transition-colors hover:bg-black/50"
          aria-label="Play"
        >
          <PlayIcon />
        </button>
      )}

      {/* Video */}
      <video
        src={VIDEO_SRC}
        preload="auto"
        playsInline
        loop
        autoPlay={playing}
        className="h-full w-full object-cover"
      />

      {/* Side action buttons — 9:16 only, positioned so overlay doesn't cover them */}
      {is9x16 && (
        <div className="absolute bottom-[130px] right-2 z-10 flex flex-col items-center gap-4">
          {[['👍', '4.2K'], ['💬', '182'], ['↗️', 'Share']].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-base">
                {icon}
              </div>
              <span className="text-[10px] font-semibold text-white/80">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Overlay ad */}
      {showAd && (
        <div className={`absolute z-20 ${overlayPositionClass}`}>
          <OverlayAd
            ad={AD_DATA[aspectRatio]}
            onDismiss={() => setShowAd(false)}
          />
        </div>
      )}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <polygon points="32,22 62,40 32,58" fill="white" />
    </svg>
  )
}
