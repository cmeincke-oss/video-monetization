'use client'

import { useEffect, useRef, useState } from 'react'
import { useIMAReady } from '@/hooks/useIMAReady'

const AD_TAG =
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250,728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator='

const VIDEO_SRC =
  'https://videos.stocktwits-cdn.com/hls/2026/03/26/69ee8298-8c28-42e1-b686-43e84dc29610/fq6gh7vs9vzzy7rkkx2fll5vlsu3_download.mp4'

/**
 * Pre-roll ad player using Google IMA HTML5 SDK.
 *
 * Key Next.js / React patterns used here:
 * - "use client" — required because we use useRef, useEffect, and window.google.ima
 * - useIMAReady() — polls for window.google.ima after the next/script tag loads
 * - useRef for DOM elements — never use getElementById in React components
 * - IMA initialization only fires inside a user gesture (the Play button click)
 *   because browsers block AdDisplayContainer.initialize() outside gestures
 */
export function PrerollPlayer() {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const adsManagerRef  = useRef<IMAdsManager | null>(null)

  const [showPlay, setShowPlay]     = useState(true)
  const [imaStarted, setImaStarted] = useState(false)
  const imaReady = useIMAReady()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      adsManagerRef.current?.destroy()
    }
  }, [])

  function handlePlay() {
    if (!imaReady || !videoRef.current || !adContainerRef.current) {
      // IMA not ready yet — just play content
      videoRef.current?.play()
      setShowPlay(false)
      return
    }

    setShowPlay(false)

    if (imaStarted) return
    setImaStarted(true)

    const ima = window.google!.ima

    // AdDisplayContainer must be created inside a user gesture
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
          mgr.init(480, 270, ima.ViewMode.NORMAL)
          mgr.start()
        } catch {
          fallback()
        }
      }
    )

    adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, fallback)

    adDisplayContainer.initialize()

    const req = new ima.AdsRequest()
    req.adTagUrl = AD_TAG + Math.random()
    req.linearAdSlotWidth  = 480
    req.linearAdSlotHeight = 270
    adsLoader.requestAds(req)
  }

  function fallback() {
    adsManagerRef.current?.destroy()
    if (adContainerRef.current) {
      adContainerRef.current.style.pointerEvents = 'none'
      adContainerRef.current.style.display = 'none'
    }
    videoRef.current?.play()
  }

  return (
    <div className="relative h-[270px] w-[480px] shrink-0 overflow-hidden rounded-xl bg-black">
      {/* IMA renders the ad UI into this div */}
      <div
        ref={adContainerRef}
        className="absolute inset-0 z-10"
        style={{ pointerEvents: 'none' }}
      />

      {/* Play button */}
      {showPlay && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/35 transition-colors hover:bg-black/50"
          aria-label="Play"
        >
          <PlayIcon />
        </button>
      )}

      <video
        ref={videoRef}
        src={VIDEO_SRC}
        preload="auto"
        playsInline
        controls
        className="h-full w-full"
      />
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
