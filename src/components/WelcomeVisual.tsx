'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

type WelcomeSlide = {
  alt: string
  accent: string
  video: string
}

const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    video: '/videos/home/1.mp4',
    accent: '/images/home/1.jpg',
    alt: 'Cặp tượng nghê đá',
  },
  {
    video: '/videos/home/2.mp4',
    accent: '/images/home/2.jpg',
    alt: 'Tượng Phật ngồi thiền',
  },
  {
    video: '/videos/home/3.mp4',
    accent: '/images/home/3.jpg',
    alt: 'Tượng Phật giữa vườn',
  },
  {
    video: '/videos/home/4.mp4',
    accent: '/images/home/4.jpg',
    alt: 'Tượng Phật và Di Lặc',
  },
  {
    video: '/videos/home/5.mp4',
    accent: '/images/home/5.jpg',
    alt: 'Bộ tượng chú tiểu',
  },
]

const FALLBACK_MS = 7000
const CROSSFADE_MS = 800
const HANDOFF_LEAD_S = 0.9

type Slot = 0 | 1

function otherSlot(slot: Slot): Slot {
  return slot === 0 ? 1 : 0
}

function prepareVideo(video: HTMLVideoElement) {
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
}

function whenFirstFrame(video: HTMLVideoElement, done: () => void) {
  const withFrame = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number
  }
  if (typeof withFrame.requestVideoFrameCallback === 'function') {
    withFrame.requestVideoFrameCallback(() => done())
    return
  }
  done()
}

export default function WelcomeVisual() {
  const [index, setIndex] = useState(0)
  const [front, setFront] = useState<Slot>(0)
  const [sources, setSources] = useState<[string, string]>([
    WELCOME_SLIDES[0].video,
    WELCOME_SLIDES[1].video,
  ])

  const indexRef = useRef(0)
  const frontRef = useRef<Slot>(0)
  const sourcesRef = useRef(sources)
  const busyRef = useRef(false)
  const pendingRef = useRef<number | null>(null)
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null])
  const beginFadeRef = useRef<(safe: number) => void>(() => {})

  sourcesRef.current = sources

  const setSlotSource = useCallback((slot: Slot, src: string) => {
    if (sourcesRef.current[slot] === src) return
    const next: [string, string] = [sourcesRef.current[0], sourcesRef.current[1]]
    next[slot] = src
    sourcesRef.current = next
    setSources(next)
  }, [])

  beginFadeRef.current = (safe: number) => {
    const incoming = otherSlot(frontRef.current)
    const video = videoRefs.current[incoming]
    if (!video) {
      busyRef.current = false
      return
    }

    prepareVideo(video)
    let revealed = false
    const reveal = () => {
      if (revealed) return
      revealed = true
      frontRef.current = incoming
      indexRef.current = safe
      setFront(incoming)
      setIndex(safe)
      window.setTimeout(() => {
        const retired = otherSlot(incoming)
        const old = videoRefs.current[retired]
        if (old) old.pause()
        const follow = (safe + 1) % WELCOME_SLIDES.length
        setSlotSource(retired, WELCOME_SLIDES[follow].video)
        busyRef.current = false
        pendingRef.current = null
      }, CROSSFADE_MS)
    }

    const attempt = video.play()
    if (attempt) {
      void attempt.then(() => whenFirstFrame(video, reveal)).catch(() => reveal())
    } else {
      reveal()
    }
    window.setTimeout(reveal, 450)
  }

  const goTo = useCallback((nextIndex: number) => {
    if (busyRef.current) return
    const length = WELCOME_SLIDES.length
    const safe = ((nextIndex % length) + length) % length
    if (safe === indexRef.current) return

    const incoming = otherSlot(frontRef.current)
    const target = WELCOME_SLIDES[safe].video
    const video = videoRefs.current[incoming]
    busyRef.current = true

    if (sourcesRef.current[incoming] === target && video && video.readyState >= 2) {
      beginFadeRef.current(safe)
      return
    }

    pendingRef.current = safe
    if (!video) {
      busyRef.current = false
      pendingRef.current = null
      return
    }
    if (sourcesRef.current[incoming] !== target) {
      setSlotSource(incoming, target)
      return
    }

    const fire = () => {
      if (pendingRef.current !== safe || video.readyState < 2) return
      video.removeEventListener('loadeddata', fire)
      video.removeEventListener('canplay', fire)
      pendingRef.current = null
      beginFadeRef.current(safe)
    }
    video.addEventListener('loadeddata', fire)
    video.addEventListener('canplay', fire)
    window.setTimeout(() => {
      if (pendingRef.current !== safe) return
      video.removeEventListener('loadeddata', fire)
      video.removeEventListener('canplay', fire)
      pendingRef.current = null
      beginFadeRef.current(safe)
    }, 2500)
  }, [setSlotSource])

  useEffect(() => {
    const pending = pendingRef.current
    if (pending == null) return
    const incoming = otherSlot(frontRef.current)
    const video = videoRefs.current[incoming]
    if (!video || sources[incoming] !== WELCOME_SLIDES[pending].video) return

    let cancelled = false
    const wanted = WELCOME_SLIDES[pending].video
    const fire = () => {
      const loaded = video.currentSrc.indexOf(wanted) !== -1
      if (cancelled || pendingRef.current !== pending || video.readyState < 2 || !loaded) return
      pendingRef.current = null
      beginFadeRef.current(pending)
    }

    video.addEventListener('loadeddata', fire)
    video.addEventListener('canplay', fire)
    fire()
    const stall = window.setTimeout(() => {
      if (cancelled || pendingRef.current !== pending) return
      pendingRef.current = null
      beginFadeRef.current(pending)
    }, 2500)

    return () => {
      cancelled = true
      video.removeEventListener('loadeddata', fire)
      video.removeEventListener('canplay', fire)
      window.clearTimeout(stall)
    }
  }, [sources])

  useEffect(() => {
    const active = videoRefs.current[0]
    const queued = videoRefs.current[1]
    if (!active) return

    let cancelled = false
    let retries = 0
    let retryTimer: number | undefined

    const boot = () => {
      if (cancelled) return
      prepareVideo(active)
      const attempt = active.play()
      if (!attempt) return
      void attempt
        .then(() => {
          if (cancelled || !queued) return
          prepareVideo(queued)
          const warm = queued.play()
          if (!warm) return
          void warm
            .then(() => {
              queued.pause()
              if (queued.currentTime > 0.05) queued.currentTime = 0.001
            })
            .catch(() => {})
        })
        .catch(() => {
          if (cancelled || retries >= 8) return
          retries += 1
          retryTimer = window.setTimeout(boot, 350)
        })
    }

    prepareVideo(active)
    if (active.readyState >= 2) boot()
    else {
      active.addEventListener('loadeddata', boot)
      active.addEventListener('canplay', boot)
    }

    return () => {
      cancelled = true
      active.removeEventListener('loadeddata', boot)
      active.removeEventListener('canplay', boot)
      if (retryTimer) window.clearTimeout(retryTimer)
    }
  }, [])

  useEffect(() => {
    const incoming = otherSlot(frontRef.current)
    const video = videoRefs.current[incoming]
    if (!video || pendingRef.current != null) return

    const warm = () => {
      if (frontRef.current === incoming) return
      prepareVideo(video)
      if (video.readyState >= 2 && video.paused && video.currentTime < 0.05) {
        try {
          video.currentTime = 0.001
        } catch {
          /* metadata may still be settling */
        }
      }
    }

    video.addEventListener('loadeddata', warm)
    warm()
    return () => video.removeEventListener('loadeddata', warm)
  }, [sources, front])

  useEffect(() => {
    const video = videoRefs.current[front]
    if (!video) return

    const onTime = () => {
      if (busyRef.current || document.visibilityState === 'hidden') return
      if (!Number.isFinite(video.duration) || video.duration <= HANDOFF_LEAD_S) return
      if (video.currentTime < video.duration - HANDOFF_LEAD_S) return
      goTo(indexRef.current + 1)
    }

    video.addEventListener('timeupdate', onTime)
    return () => video.removeEventListener('timeupdate', onTime)
  }, [front, index, goTo])

  useEffect(() => {
    let cancelled = false
    let timer = 0

    const arm = (delay: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return
        if (document.visibilityState === 'hidden' || busyRef.current) {
          arm(500)
          return
        }
        goTo(indexRef.current + 1)
      }, delay)
    }

    arm(FALLBACK_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [index, goTo])

  return (
    <div className="taste-welcome__visual">
      <div className="taste-welcome__frame">
        {WELCOME_SLIDES.map((slide, i) => {
          const active = i === index
          return (
            <div
              key={slide.video}
              className={`taste-welcome__slide${active ? ' is-active' : ''}`}
              aria-hidden={!active}
              style={{
                opacity: active ? 1 : 0,
                zIndex: active ? 1 : 0,
                pointerEvents: active ? 'auto' : 'none',
              }}
            >
              <Image
                src={slide.accent}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 42vw"
                className="taste-welcome__img taste-welcome__img--fill"
                aria-hidden
              />
            </div>
          )
        })}
        {([0, 1] as const).map((slot) => {
          const slide = WELCOME_SLIDES.find((item) => item.video === sources[slot]) ?? WELCOME_SLIDES[0]
          const active = front === slot
          return (
            <video
              key={slot}
              ref={(node) => {
                videoRefs.current[slot] = node
              }}
              className={`taste-welcome__video${active ? ' is-front' : ''}`}
              src={sources[slot]}
              poster={slide.accent}
              muted
              playsInline
              preload="auto"
              aria-hidden={!active}
              aria-label={active ? WELCOME_SLIDES[index].alt : undefined}
            />
          )
        })}
        <div className="taste-welcome__scrim" aria-hidden="true" />
      </div>

      <div className="taste-welcome__accent" aria-hidden="true">
        {WELCOME_SLIDES.map((slide, i) => {
          const active = i === index
          return (
            <div
              key={`accent-${slide.accent}-${i}`}
              className={`taste-welcome__accent-slide${active ? ' is-active' : ''}`}
              style={{ opacity: active ? 1 : 0 }}
            >
              <Image
                src={slide.accent}
                alt=""
                fill
                sizes="(max-width: 767px) 40vw, 18vw"
                className="taste-welcome__accent-img taste-welcome__accent-img--fill"
                aria-hidden
              />
              <Image
                src={slide.accent}
                alt=""
                fill
                sizes="(max-width: 767px) 40vw, 18vw"
                className="taste-welcome__accent-img"
              />
            </div>
          )
        })}
      </div>

      <div className="taste-welcome__dots" role="tablist" aria-label="Ảnh giới thiệu">
        {WELCOME_SLIDES.map((slide, i) => (
          <button
            key={`dot-${slide.video}`}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={slide.alt}
            className={`taste-welcome__dot${i === index ? ' is-active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
