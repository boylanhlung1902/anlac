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

const INTERVAL_MS = 6500

export default function WelcomeVisual() {
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])

  const goTo = useCallback((next: number) => {
    const safe = ((next % WELCOME_SLIDES.length) + WELCOME_SLIDES.length) % WELCOME_SLIDES.length
    indexRef.current = safe
    setIndex(safe)
  }, [])

  useEffect(() => {
    let cancelled = false
    const cleanups: Array<() => void> = []

    videoRefs.current.forEach((video, i) => {
      if (!video) return
      video.muted = true
      video.playsInline = true
      if (i !== index) {
        video.pause()
        return
      }

      let retries = 0
      let retryTimer: number | undefined
      const start = () => {
        if (cancelled) return
        video.muted = true
        const attempt = video.play()
        if (!attempt) return
        void attempt.catch(() => {
          if (cancelled || retries >= 8) return
          retries += 1
          retryTimer = window.setTimeout(start, 300)
        })
      }

      if (video.currentTime > 0.05) {
        const onSeeked = () => start()
        video.addEventListener('seeked', onSeeked, { once: true })
        video.currentTime = 0
        cleanups.push(() => {
          video.removeEventListener('seeked', onSeeked)
          if (retryTimer) window.clearTimeout(retryTimer)
        })
        return
      }

      if (video.readyState >= 2) start()
      else {
        video.addEventListener('canplay', start, { once: true })
        cleanups.push(() => video.removeEventListener('canplay', start))
      }
      cleanups.push(() => {
        if (retryTimer) window.clearTimeout(retryTimer)
      })
    })

    return () => {
      cancelled = true
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [index])

  useEffect(() => {
    let timer: number | undefined
    let cancelled = false

    const tick = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return
        if (document.visibilityState === 'hidden') {
          tick()
          return
        }
        goTo(indexRef.current + 1)
      }, INTERVAL_MS)
    }

    tick()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
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
              <video
                ref={(node) => {
                  videoRefs.current[i] = node
                  if (!node) return
                  node.muted = true
                  node.defaultMuted = true
                  node.playsInline = true
                }}
                className="taste-welcome__video"
                src={slide.video}
                poster={slide.accent}
                autoPlay={i === 0}
                muted
                playsInline
                preload={active || i === (index + 1) % WELCOME_SLIDES.length ? 'auto' : 'metadata'}
                aria-label={slide.alt}
              />
            </div>
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
