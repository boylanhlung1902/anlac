'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

const WELCOME_SLIDES = [
  {
    main: '/images/clean/hero/slide-3.jpg',
    accent: '/images/san-pham-my-nghe/tuong-da/anh1.webp',
    alt: 'Đài phun nước đá An Lạc Stone',
  },
  {
    main: '/images/clean/hero/slide-1.jpg',
    accent: '/images/san-pham-my-nghe/den-da/anh1.webp',
    alt: 'Đá tự nhiên vân thạch An Lạc Stone',
  },
  {
    main: '/images/clean/hero/slide-2.jpg',
    accent: '/images/san-pham-my-nghe/dai-phun-nuoc/anh1.webp',
    alt: 'Đá cảnh thiên nhiên An Lạc Stone',
  },
  {
    main: '/images/san-pham-my-nghe/ban-ghe-da/anh1.webp',
    accent: '/images/san-pham-my-nghe/lavabo-da/anh1.webp',
    alt: 'Bàn ghế đá An Lạc Stone',
  },
  {
    main: '/images/clean/hero/slide-statue.jpg',
    accent: '/images/san-pham-my-nghe/thach-my-nghe/anh1.webp',
    alt: 'Tượng đá An Lạc Stone',
  },
]

const INTERVAL_MS = 2800

export default function WelcomeVisual() {
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)

  const goTo = useCallback((next: number) => {
    const safe = ((next % WELCOME_SLIDES.length) + WELCOME_SLIDES.length) % WELCOME_SLIDES.length
    indexRef.current = safe
    setIndex(safe)
  }, [])

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
        const next = (indexRef.current + 1) % WELCOME_SLIDES.length
        indexRef.current = next
        setIndex(next)
        tick()
      }, INTERVAL_MS)
    }

    tick()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="taste-welcome__visual">
      <div className="taste-welcome__frame">
        {WELCOME_SLIDES.map((slide, i) => {
          const active = i === index
          return (
            <div
              key={slide.main}
              className={`taste-welcome__slide${active ? ' is-active' : ''}`}
              aria-hidden={!active}
              style={{
                opacity: active ? 1 : 0,
                zIndex: active ? 1 : 0,
                pointerEvents: active ? 'auto' : 'none',
              }}
            >
              <Image
                src={slide.main}
                alt={slide.alt}
                fill
                priority={i < 2}
                sizes="(max-width: 767px) 100vw, 42vw"
                className="taste-welcome__img"
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
              key={`accent-${slide.accent}`}
              className={`taste-welcome__accent-slide${active ? ' is-active' : ''}`}
              style={{ opacity: active ? 1 : 0 }}
            >
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
            key={`dot-${slide.main}`}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Ảnh ${i + 1}`}
            className={`taste-welcome__dot${i === index ? ' is-active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
