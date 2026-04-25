// Type declarations for the Google IMA HTML5 SDK (ima3.js)
// Loaded via next/script — available on window.google.ima after hydration

declare global {
  interface Window {
    google?: {
      ima: IMANamespace
    }
  }

  interface IMANamespace {
    AdDisplayContainer: new (
      adContainer: HTMLElement,
      videoElement?: HTMLVideoElement | null
    ) => IMAAdDisplayContainer

    AdsLoader: new (adDisplayContainer: IMAAdDisplayContainer) => IMAdsLoader

    AdsRequest: new () => IMAdsRequest

    ViewMode: { NORMAL: string; FULLSCREEN: string }

    AdsManagerLoadedEvent: {
      Type: { ADS_MANAGER_LOADED: string }
    }

    AdErrorEvent: {
      Type: { AD_ERROR: string }
    }

    AdEvent: {
      Type: {
        LOADED: string
        STARTED: string
        COMPLETE: string
        SKIPPED: string
        ALL_ADS_COMPLETED: string
        CONTENT_PAUSE_REQUESTED: string
        CONTENT_RESUME_REQUESTED: string
      }
    }
  }

  interface IMAAdDisplayContainer {
    initialize(): void
    destroy(): void
  }

  interface IMAdsLoader {
    addEventListener(
      type: string,
      handler: (e: IMAdsManagerLoadedEvent | IMAAdErrorEvent) => void
    ): void
    requestAds(request: IMAdsRequest): void
    destroy(): void
  }

  interface IMAdsRequest {
    adTagUrl: string
    linearAdSlotWidth: number
    linearAdSlotHeight: number
    nonLinearAdSlotWidth?: number
    nonLinearAdSlotHeight?: number
  }

  interface IMAdsManagerLoadedEvent {
    getAdsManager(videoElement: HTMLVideoElement): IMAdsManager
  }

  interface IMAAdErrorEvent {
    getError(): { getMessage(): string }
  }

  interface IMAdsManager {
    addEventListener(type: string, handler: (e: IMAAdErrorEvent) => void): void
    init(width: number, height: number, viewMode: string): void
    start(): void
    destroy(): void
  }
}

export {}
