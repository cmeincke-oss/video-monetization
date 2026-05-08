# Pre-Roll Ad — Implementation Reference

Skippable pre-roll using Google IMA HTML5 SDK. The IMA SDK manages all ad
playback — the React player is not involved.

---

## Files in this folder

| File | What it does |
|------|-------------|
| `PrerollPlayer.tsx` | Drop-in React component — handles IMA init, play button, fallback |
| `useIMAReady.ts` | Hook that waits for `window.google.ima` to be available |
| `ima.d.ts` | TypeScript types for `window.google.ima` — copy to `src/types/` |

---

## Setup

### 1. Load the IMA SDK script

In your root `app/layout.tsx`, add the script tag via `next/script`.
Use `strategy="afterInteractive"` — the SDK only needs to be available
when a user clicks Play, not at page load.

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  )
}
```

### 2. Copy the type declarations

```bash
cp ima.d.ts src/types/ima.d.ts
```

### 3. Drop in the hook and component

```bash
cp useIMAReady.ts src/hooks/useIMAReady.ts
cp PrerollPlayer.tsx src/components/PrerollPlayer.tsx
```

### 4. Use it

```tsx
import { PrerollPlayer } from '@/components/PrerollPlayer'

const AD_TAG = 'https://pubads.g.doubleclick.net/gampad/ads?...'
const VIDEO_SRC = 'https://your-cdn.com/video.mp4'

export default function ArticlePage() {
  return (
    <PrerollPlayer adTagUrl={AD_TAG} videoSrc={VIDEO_SRC} />
  )
}
```

---

## How it works

1. Page loads — IMA SDK script loads in the background via `next/script`
2. User clicks **Play** — `AdDisplayContainer.initialize()` is called inside
   the user gesture (browsers require this)
3. IMA requests the VAST ad tag and plays the pre-roll
4. On completion or error — IMA hands off to the content video automatically

## Mobile (iOS & Android WebView)

No changes needed — the IMA HTML5 SDK runs inside the in-app WebView as-is.

**iOS WKWebView** — add to your `WKWebViewConfiguration`:
```swift
configuration.allowsInlineMediaPlayback = true
configuration.mediaTypesRequiringUserActionForPlayback = []
```

**Android WebView**:
```kotlin
webView.settings.javaScriptEnabled = true
webView.settings.mediaPlaybackRequiresUserGesture = false
```
