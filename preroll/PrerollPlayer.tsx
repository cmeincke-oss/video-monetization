'use client'

/**
 * PrerollPlayer
 *
 * Drop-in pre-roll ad component using the Google IMA HTML5 SDK.
 *
 * Requirements:
 * - Load ima3.js via next/script in your root layout (see README)
 * - Copy useIMAReady.ts to src/hooks/
 * - Copy ima.d.ts to src/types/
 */

import { useEffect, useRef, useState } from 'react'
import { useIMAReady } from '@/hooks/useIMAReady'

interface PrerollPlayerProps {
  /** VAST ad tag URL from Google Ad Manager */
  adTagUrl: string
  /** URL of the content video to play after the ad */
  videoSrc: string
  /** Width of the player in px (default: 640) */
  width?: number
  /** Height of the player in px (default: 360) */
  height?: number
  className?: string
}

export function PrerollPlayer({
  adTagUrl,
  videoSrc,
  width = 640,
  height = 360,
  className = '',
}: PrerollPlayerProps) {
  const videoRef        = useRef<HTMLVideoElement>(null)
  const adContainerRef  = useRef<HTMLDivElement>(null)
  const adsManagerRef   = useRef<IMAdsManager | null>(null)

  const [showPlay, setShowPlay]     = useState(true)
  const [imaStarted, setImaStarted] = useState(false)
  const imaReady = useIMAReady()

  // Cleanup ads manager on unmount
  useEffect(() => {
    return () => { adsManagerRef.current?.destroy() }
  }, [])

  function handlePlay() {
    setShowPlay(false)

    // IMA SDK not available yet — play content directly
    if (!imaReady || !videoRef.current || !adContainerRef.current) {
      videoRef.current?.play()
      return
    }

    // Only initialise IMA once per mount
    if (imaStarted) return
    setImaStarted(true)

    const ima = window.google!.ima

    // AdDisplayContainer.initialize() MUST be called inside a user gesture.
    // Browsers will block IMA if called outside of a click/tap handler.
    const adDisplayContainer = new ima.AdDisplayContainer(
      adContainerRef.current,
      videoRef.current
    )
    const adsLoader = new ima.AdsLoader(adDisplayContainer)

    adsLoader.addEventListener(
      ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      (e: IMAdsManagerLoadedEvent) => {
        const mgr = e.getAdsManager(videoRef.current!)
        adsManagerRef.current = mgr

        mgr.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, fallback)

        mgr.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
          adContainerRef.current!.style.pointerEvents = 'auto'
          videoRef.current?.pause()
        })

        mgr.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
          adContainerRef.current!.style.pointerEvents = 'none'
          videoRef.current?.play()
        })

        mgr.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
          adContainerRef.current!.style.display = 'none'
          videoRef.current?.play()
        })

        try {
          mgr.init(width, height, ima.ViewMode.NORMAL)
          mgr.start()
        } catch {
          fallback()
        }
      }
    )

    adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, fallback)

    adDisplayContainer.initialize()

    const req = new ima.AdsRequest()
    req.adTagUrl = adTagUrl
    req.linearAdSlotWidth  = width
    req.linearAdSlotHeight = height
    adsLoader.requestAds(req)
  }

  // On any ad error — hide the ad container and play content
  function fallback() {
    adsManagerRef.current?.destroy()
    if (adContainerRef.current) {
      adContainerRef.current.style.pointerEvents = 'none'
      adContainerRef.current.style.display = 'none'
    }
    videoRef.current?.play()
  }

  return (
    <div
      className={`relative overflow-hidden bg-black ${className}`}
      style={{ width, height }}
    >
      {/* IMA renders the ad UI (skip button, countdown, click-through) into this div */}
      <div
        ref={adContainerRef}
        className="absolute inset-0 z-10"
        style={{ pointerEvents: 'none' }}
      />

      {/* Play button — shown until first interaction */}
      {showPlay && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/30 transition-colors hover:bg-black/50"
          aria-label="Play"
        >
          <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <polygon points="32,22 62,40 32,58" fill="white" />
          </svg>
        </button>
      )}

      <video
        ref={videoRef}
        src={videoSrc}
        preload="auto"
        playsInline
        controls
        className="h-full w-full"
      />
    </div>
  )
}
