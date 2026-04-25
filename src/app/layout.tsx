import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Providers } from '@/components/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Video Monetization · Ad Examples',
  description:
    'Live demos and implementation reference for pre-roll and overlay ad formats across Web, iOS, and Android.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-[#e8e8e8] min-h-screen`}>
        {/*
          Load Google IMA SDK after hydration.

          Why "afterInteractive" (not "beforeInteractive"):
          - IMA only needs to be available when a user clicks Play — it doesn't
            need to block the initial page render.
          - "beforeInteractive" would delay Time-to-Interactive for all users,
            even those who never play a video.

          In client components, use the useIMAReady() hook to wait for
          window.google.ima to be available before calling any IMA APIs.
        */}
        <Script
          src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"
          strategy="afterInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
