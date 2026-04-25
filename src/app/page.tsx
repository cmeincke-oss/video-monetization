'use client'

import { useState } from 'react'
import { PrerollPlayer } from '@/components/PrerollPlayer'
import { OverlayPlayer, type AspectRatio } from '@/components/OverlayPlayer'

const PREROLL_TABS = ['Web / React', 'iOS', 'Android'] as const
const OVERLAY_TABS = ['Web / React', 'iOS', 'Android'] as const
const AR_OPTIONS: { label: string; value: AspectRatio }[] = [
  { label: '16:9', value: '16x9' },
  { label: '1:1',  value: '1x1'  },
  { label: '9:16', value: '9x16' },
]

const PREROLL_CODE: Record<string, string> = {
  'Web / React': `// "use client" required — uses useRef, useEffect, window.google.ima
// IMA SDK loaded via next/script in app/layout.tsx

function PrerollPlayer() {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const imaReady      = useIMAReady() // polls window.google.ima

  function handlePlay() {
    const ima = window.google!.ima

    // Must be called inside a user gesture
    const adc = new ima.AdDisplayContainer(
      adContainerRef.current!, videoRef.current!
    )
    const loader = new ima.AdsLoader(adc)
    loader.addEventListener('adsManagerLoaded', (e) => {
      const mgr = e.getAdsManager(videoRef.current!)
      mgr.addEventListener('contentPauseRequested',
        () => videoRef.current?.pause())
      mgr.addEventListener('contentResumeRequested',
        () => videoRef.current?.play())
      mgr.addEventListener('allAdsCompleted',
        () => videoRef.current?.play())
      mgr.init(480, 270, ima.ViewMode.NORMAL)
      mgr.start()
    })
    adc.initialize()
    const req = new ima.AdsRequest()
    req.adTagUrl = AD_TAG_URL
    req.linearAdSlotWidth  = 480
    req.linearAdSlotHeight = 270
    loader.requestAds(req)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={adContainerRef} />
      <video ref={videoRef} src={VIDEO_SRC} controls />
      <button onClick={handlePlay}>Play</button>
    </div>
  )
}`,
  iOS: `// iOS — WKWebView config only.
// IMA HTML5 SDK runs inside the WebView.
// No native IMA SDK required for WebView-based apps.

let config = WKWebViewConfiguration()

// Allows video to play inline (not forced fullscreen)
config.allowsInlineMediaPlayback = true

// Allows video + ads to play without an extra user tap
config.mediaTypesRequiringUserActionForPlayback = []

let webView = WKWebView(
  frame: view.bounds,
  configuration: config
)
webView.load(URLRequest(url: articleURL))`,
  Android: `// Android — WebView config only.
// IMA HTML5 SDK runs inside the WebView.
// No native IMA SDK required for WebView-based apps.

webView.settings.javaScriptEnabled = true

// Allows video + ads to play without an extra user tap
webView.settings.mediaPlaybackRequiresUserGesture = false

webView.loadUrl(articleUrl)`,
}

const OVERLAY_CODE: Record<AspectRatio, Record<string, string>> = {
  '16x9': {
    'Web / React': `// "use client" — no IMA SDK needed for overlay ads

function OverlayPlayer() {
  const [showAd, setShowAd] = useState(false)

  return (
    // position: relative wrapper
    <div className="relative w-[480px] h-[270px]">
      <video src={VIDEO_SRC} />

      {showAd && (
        // bottom-left positioning for 16:9
        <div className="absolute bottom-9 left-2.5 w-[260px]">
          <OverlayAd onDismiss={() => setShowAd(false)} />
        </div>
      )}
    </div>
  )
}`,
    iOS: `// UIView overlay above AVPlayerLayer — no IMA needed

let overlay = AdOverlayView(ticker: "NVDA")
let w: CGFloat = 240, h: CGFloat = 72

// Bottom-left for 16:9
overlay.frame = CGRect(
  x: 10,
  y: view.bounds.height - h - 40,
  width: w, height: h
)
// Add above playerLayer, not to the layer itself
view.addSubview(overlay)

overlay.onAddToWatchlist = { ticker in
  WatchlistService.shared.add(ticker)
}
overlay.onDismiss = { overlay.removeFromSuperview() }`,
    Android: `// FrameLayout sibling of PlayerView — no IMA needed

// XML layout_gravity="bottom|start"
//      layout_marginBottom="44dp"
//      layout_marginStart="10dp"
//      layout_width="240dp"

val overlay = findViewById<View>(R.id.ad_overlay)
overlay.visibility = View.VISIBLE
overlay.animate().alpha(1f).setDuration(300).start()

findViewById<Button>(R.id.watchlist_btn)
  .setOnClickListener {
    WatchlistRepository.add("NVDA")
  }
findViewById<ImageButton>(R.id.close_btn)
  .setOnClickListener { dismissOverlay() }`,
  },
  '1x1': {
    'Web / React': `// 1:1 — same bottom-left as 16:9, slightly narrower

{showAd && (
  <div className="absolute bottom-8 left-2.5 w-[240px]">
    <OverlayAd onDismiss={() => setShowAd(false)} />
  </div>
)}`,
    iOS: `// 1:1 — same bottom-left, slightly narrower

let w: CGFloat = 220, h: CGFloat = 72
overlay.frame = CGRect(
  x: 10,
  y: view.bounds.height - h - 36,
  width: w, height: h
)`,
    Android: `// 1:1 — same bottom|start, narrower width
// XML layout_gravity="bottom|start"
//      layout_marginBottom="36dp"
//      layout_marginStart="10dp"
//      layout_width="220dp"`,
  },
  '9x16': {
    'Web / React': `// 9:16 — full-width bottom card, clears right-side action buttons

{showAd && (
  // left+right inset so it doesn't reach the action buttons
  <div className="absolute bottom-2.5 left-2.5 right-2.5">
    <OverlayAd onDismiss={() => setShowAd(false)} />
  </div>
)}

// Action buttons sit at z-index: 10, bottom-right
// positioned above the overlay — not covered by it`,
    iOS: `// 9:16 — full-width bottom card

let h: CGFloat = 72, margin: CGFloat = 10
overlay.frame = CGRect(
  x: margin,
  y: view.bounds.height - h - margin,
  width: view.bounds.width - (margin * 2),
  height: h
)
// Action buttons in a separate UIView
// positioned above overlay on the right side`,
    Android: `// 9:16 — full-width bottom card
// XML layout_gravity="bottom|center_horizontal"
//      layout_width="match_parent"
//      layout_margin="10dp"

// Action buttons in a separate View
// gravity="end|bottom", marginBottom="90dp"
// so they sit above the overlay`,
  },
}

export default function Page() {
  const [prerollTab, setPrerollTab]   = useState<string>('Web / React')
  const [overlayTab, setOverlayTab]   = useState<string>('Web / React')
  const [ar, setAr]                   = useState<AspectRatio>('16x9')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#0a0a0a]/90 px-8 py-4 backdrop-blur">
        <span className="text-sm font-bold tracking-tight">Video Monetization · Ad Examples</span>
        <nav className="flex gap-6">
          <a href="#preroll" className="text-xs text-white/40 transition-colors hover:text-white">Pre-Roll</a>
          <a href="#overlay" className="text-xs text-white/40 transition-colors hover:text-white">Overlay</a>
        </nav>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-[900px] px-8 pb-12 pt-16">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Video Ad Examples</h1>
        <p className="text-base text-white/40">
          Live demos and implementation reference for pre-roll and overlay ad formats
          across Web, iOS, and Android.
        </p>
      </div>

      <hr className="border-white/[0.08]" />

      {/* ── Pre-Roll ── */}
      <section id="preroll" className="mx-auto max-w-[900px] px-8 pb-20 pt-14">
        <div className="mb-6 flex items-baseline gap-3 border-b border-white/[0.08] pb-4">
          <h2 className="text-xl font-bold tracking-tight">Pre-Roll Ad</h2>
          <span className="rounded-full border border-[#00b87c]/25 bg-[#00b87c]/10 px-2 py-0.5 text-[11px] font-semibold text-[#00b87c]">
            Google IMA SDK
          </span>
        </div>
        <p className="mb-7 max-w-lg text-sm text-white/40">
          A skippable pre-roll fires before video content. The Google IMA SDK manages ad
          playback entirely — React does not touch it. On mobile, this runs inside a
          WebView with no native SDK required.
        </p>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]">
          <div className="flex gap-8 p-7">
            <PrerollPlayer />

            <div className="min-w-0 flex-1">
              {/* Tabs */}
              <div className="mb-0 flex gap-0.5 border-b border-white/[0.08] px-4">
                {PREROLL_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPrerollTab(tab)}
                    className={`mb-[-1px] border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
                      prerollTab === tab
                        ? 'border-[#00b87c] text-white'
                        : 'border-transparent text-white/40 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <pre className="overflow-x-auto rounded-b-xl bg-[#0d0d0d] p-4 text-[11.5px] leading-relaxed text-[#c9d1d9] whitespace-pre">
                {PREROLL_CODE[prerollTab]}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-white/[0.08]" />

      {/* ── Overlay ── */}
      <section id="overlay" className="mx-auto max-w-[900px] px-8 pb-20 pt-14">
        <div className="mb-6 flex items-baseline gap-3 border-b border-white/[0.08] pb-4">
          <h2 className="text-xl font-bold tracking-tight">Overlay Ad</h2>
          <span className="rounded-full border border-[#00b87c]/25 bg-[#00b87c]/10 px-2 py-0.5 text-[11px] font-semibold text-[#00b87c]">
            Non-Linear · Native
          </span>
        </div>
        <p className="mb-7 max-w-lg text-sm text-white/40">
          A non-linear overlay appears over playing content without interrupting playback.
          No IMA SDK required — the ad card is a native React component with a watchlist CTA.
        </p>

        {/* AR selector */}
        <div className="mb-6 flex gap-2">
          {AR_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setAr(value)}
              className={`rounded-md border px-4 py-1.5 text-xs font-semibold transition-all ${
                ar === value
                  ? 'border-[#00b87c]/35 bg-[#00b87c]/10 text-[#00b87c]'
                  : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]">
          <div className="flex gap-8 p-7">
            <OverlayPlayer aspectRatio={ar} />

            <div className="min-w-0 flex-1">
              {/* Tabs */}
              <div className="mb-0 flex gap-0.5 border-b border-white/[0.08] px-4">
                {OVERLAY_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOverlayTab(tab)}
                    className={`mb-[-1px] border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
                      overlayTab === tab
                        ? 'border-[#00b87c] text-white'
                        : 'border-transparent text-white/40 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <pre className="overflow-x-auto rounded-b-xl bg-[#0d0d0d] p-4 text-[11.5px] leading-relaxed text-[#c9d1d9] whitespace-pre">
                {OVERLAY_CODE[ar][overlayTab]}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-white/30">
        Video Monetization · Ad Implementation Reference
      </footer>
    </div>
  )
}
