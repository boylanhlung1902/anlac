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

const FALLBACK_MS = 5600
const CROSSFADE_MS = 1000
const HANDOFF_LEAD_S = 1.35

type Slot = 0 | 1

function otherSlot(slot: Slot): Slot {
  return slot === 0 ? 1 : 0
}

function prepareVideo(video: HTMLVideoElement) {
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.loop = true
}

function whenFirstFrame(video: HTMLVideoElement, done: () => void) {
  const withFrame = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number
  }
  if (typeof withFrame.requestVideoFrameCallback === 'function') {
    withFrame.requestVideoFrameCallback(() => done())
    return
  }
  if (video.readyState >= 2) {
    done()
    return
  }
  video.addEventListener('loadeddata', () => done(), { once: true })
}

function holdFirstFrame(video: HTMLVideoElement) {
  if (video.readyState < 2 || !video.paused) return
  try {
    if (video.currentTime < 0.02 || video.currentTime > 0.2) video.currentTime = 0.04
  } catch {
    /* metadata can still be settling */
  }
}

const clipCache = new Map<string, string>()
const clipTasks = new Map<string, Promise<string>>()

function rememberClip(path: string) {
  const ready = clipCache.get(path)
  if (ready) return Promise.resolve(ready)
  let task = clipTasks.get(path)
  if (!task) {
    task = fetch(path, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('miss')
        return response.blob()
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        clipCache.set(path, url)
        return url
      })
      .catch(() => path)
    clipTasks.set(path, task)
  }
  return task
}

function clipSrc(path: string) {
  return clipCache.get(path) || path
}

function elementHasClip(video: HTMLVideoElement, path: string) {
  const cached = clipCache.get(path)
  const current = video.currentSrc || video.src
  if (cached && current === cached) return true
  return current.indexOf(path) !== -1
}

export default function WelcomeVisual() {
  const [index, setIndex] = useState(0)
  const [front, setFront] = useState<Slot>(0)
  const [sources, setSources] = useState<[string, string]>([
    WELCOME_SLIDES[0].video,
    WELCOME_SLIDES[1].video,
  ])
  const [media, setMedia] = useState<[string, string]>([
    WELCOME_SLIDES[0].video,
    clipSrc(WELCOME_SLIDES[1].video) === WELCOME_SLIDES[1].video ? '' : clipSrc(WELCOME_SLIDES[1].video),
  ])

  const indexRef = useRef(0)
  const frontRef = useRef<Slot>(0)
  const sourcesRef = useRef(sources)
  const mediaRef = useRef(media)
  const busyRef = useRef(false)
  const pendingRef = useRef<number | null>(null)
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null])
  const beginFadeRef = useRef<(safe: number) => void>(() => {})

  sourcesRef.current = sources
  mediaRef.current = media

  const setSlotSource = useCallback((slot: Slot, path: string) => {
    const url = clipSrc(path)
    if (sourcesRef.current[slot] === path && mediaRef.current[slot] === url) return
    const nextPaths: [string, string] = [sourcesRef.current[0], sourcesRef.current[1]]
    const nextMedia: [string, string] = [mediaRef.current[0], mediaRef.current[1]]
    nextPaths[slot] = path
    nextMedia[slot] = url
    sourcesRef.current = nextPaths
    mediaRef.current = nextMedia
    setSources(nextPaths)
    setMedia(nextMedia)
  }, [])

  const useCachedClip = useCallback((path: string, url: string) => {
    if (!url.startsWith('blob:')) return
    const nextMedia: [string, string] = [mediaRef.current[0], mediaRef.current[1]]
    let changed = false
    ;([0, 1] as const).forEach((slot) => {
      if (sourcesRef.current[slot] !== path || nextMedia[slot] === url) return
      if (slot === frontRef.current && nextMedia[slot]) return
      const video = videoRefs.current[slot]
      if (video && nextMedia[slot] && video.readyState >= 3) return
      nextMedia[slot] = url
      changed = true
    })
    if (!changed) return
    mediaRef.current = nextMedia
    setMedia(nextMedia)
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
      }, CROSSFADE_MS + 120)
    }

    const failSafe = window.setTimeout(() => {
      if (revealed) return
      if (video.readyState >= 2 && !video.paused) reveal()
      else busyRef.current = false
    }, 700)

    const attempt = video.play()
    const started = () => whenFirstFrame(video, () => {
      window.clearTimeout(failSafe)
      reveal()
    })
    if (attempt) {
      void attempt.then(started).catch(() => {
        window.clearTimeout(failSafe)
        busyRef.current = false
      })
    } else started()
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

    if (sourcesRef.current[incoming] === target && video && video.readyState >= 3) {
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
      if (pendingRef.current !== safe || video.readyState < 3) return
      video.removeEventListener('loadeddata', fire)
      video.removeEventListener('canplay', fire)
      pendingRef.current = null
      holdFirstFrame(video)
      beginFadeRef.current(safe)
    }
    video.addEventListener('loadeddata', fire)
    video.addEventListener('canplay', fire)
    window.setTimeout(() => {
      if (pendingRef.current !== safe) return
      video.removeEventListener('loadeddata', fire)
      video.removeEventListener('canplay', fire)
      if (video.readyState < 2) {
        pendingRef.current = null
        busyRef.current = false
        return
      }
      pendingRef.current = null
      beginFadeRef.current(safe)
    }, 1800)
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
      if (cancelled || pendingRef.current !== pending || video.readyState < 3 || !elementHasClip(video, wanted)) return
      pendingRef.current = null
      beginFadeRef.current(pending)
    }

    video.addEventListener('loadeddata', fire)
    video.addEventListener('canplay', fire)
    fire()
    const stall = window.setTimeout(() => {
      if (cancelled || pendingRef.current !== pending) return
      if (video.readyState < 2) {
        pendingRef.current = null
        busyRef.current = false
        return
      }
      pendingRef.current = null
      beginFadeRef.current(pending)
    }, 1800)

    return () => {
      cancelled = true
      video.removeEventListener('loadeddata', fire)
      video.removeEventListener('canplay', fire)
      window.clearTimeout(stall)
    }
  }, [sources, media])

  useEffect(() => {
    let cancelled = false
    const order = [1, 2, 3, 4, 0].map((item) => WELCOME_SLIDES[item].video)
    const warmCache = async () => {
      for (const path of order) {
        if (cancelled) return
        const url = await rememberClip(path)
        if (cancelled) return
        useCachedClip(path, url)
      }
    }
    void warmCache()
    const fallback = window.setTimeout(() => {
      const nextPath = WELCOME_SLIDES[1].video
      if (clipCache.has(nextPath) || mediaRef.current[1]) return
      if (sourcesRef.current[1] !== nextPath || frontRef.current === 1) return
      const nextMedia: [string, string] = [mediaRef.current[0], nextPath]
      mediaRef.current = nextMedia
      setMedia(nextMedia)
    }, 2200)
    return () => {
      cancelled = true
      window.clearTimeout(fallback)
    }
  }, [useCachedClip])

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
          window.setTimeout(() => {
            if (cancelled) return
            if (!queued.currentSrc && !queued.src) return
            prepareVideo(queued)
            const warm = queued.play()
            if (!warm) return
            void warm
              .then(() => whenFirstFrame(queued, () => {
                if (frontRef.current !== 0) return
                queued.pause()
                holdFirstFrame(queued)
              }))
              .catch(() => {})
          }, 900)
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
      if (frontRef.current === incoming || busyRef.current) return
      if (!video.currentSrc && !video.src) return
      prepareVideo(video)
      if (video.paused && video.currentTime >= 0.02 && video.currentTime <= 0.2) return
      if (video.readyState < 2 || !video.paused || video.currentTime > 0.2) {
        holdFirstFrame(video)
        return
      }
      const attempt = video.play()
      if (!attempt) {
        holdFirstFrame(video)
        return
      }
      void attempt.then(() => whenFirstFrame(video, () => {
        if (frontRef.current === incoming || busyRef.current) return
        video.pause()
        holdFirstFrame(video)
      })).catch(() => {})
    }

    video.addEventListener('loadeddata', warm)
    warm()
    return () => video.removeEventListener('loadeddata', warm)
  }, [sources, media, front])

  useEffect(() => {
    const video = videoRefs.current[front]
    if (!video) return

    const onTime = () => {
      if (busyRef.current || document.visibilityState === 'hidden') return
      if (!Number.isFinite(video.duration) || video.duration <= HANDOFF_LEAD_S) return
      if (video.currentTime < video.duration - HANDOFF_LEAD_S) return
      goTo(indexRef.current + 1)
    }

    const withFrame = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (callback: () => void) => number
      cancelVideoFrameCallback?: (handle: number) => void
    }
    let frame = 0
    const watch = () => {
      onTime()
      if (typeof withFrame.requestVideoFrameCallback === 'function') {
        frame = withFrame.requestVideoFrameCallback(watch)
      }
    }

    video.addEventListener('timeupdate', onTime)
    watch()
    return () => {
      video.removeEventListener('timeupdate', onTime)
      if (frame && typeof withFrame.cancelVideoFrameCallback === 'function') {
        withFrame.cancelVideoFrameCallback(frame)
      }
    }
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
              src={media[slot] || undefined}
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
