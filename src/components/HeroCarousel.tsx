'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

const carouselData = [
  {
    id: 1,
    image: '/images/anlac/dai-phun-nuoc/001.jpg',
    title: 'Đài phun nước',
    subtitle: 'Điểm nhấn đá cho sân vườn',
    description:
      'Đài phun nước đá nhiều tầng, bố cục rõ và đặt trọn giữa không gian ngoài trời.',
  },
  {
    id: 2,
    image: '/images/anlac/tuong-phat-thich-ca/012.jpg',
    title: 'Tượng Phật',
    subtitle: 'Điêu khắc đá đường nét rõ',
    description:
      'Tượng Phật đá được đặt nổi bật, ánh sáng tự nhiên và phông xanh giúp hình tượng dễ nhìn.',
  },
  {
    id: 3,
    image: '/images/anlac/phu-dieu/001.jpg',
    title: 'Phù điêu',
    subtitle: 'Hoa sen trong một khung tròn',
    description:
      'Phù điêu đá hoa sen, bố cục khép kín, dễ nhìn từ xa.',
  },
]

const INTERVAL_MS = 5600
const TRANSITION_MS = 900

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentRef = useRef(0)
  const transitioningRef = useRef(false)
  const unlockTimerRef = useRef<number | undefined>(undefined)

  const goToSlide = useCallback((index: number) => {
    if (transitioningRef.current || index === currentRef.current) return

    const len = carouselData.length
    const steps = (index - currentRef.current + len) % len
    setDirection(steps <= len / 2 ? 1 : -1)

    transitioningRef.current = true
    setIsTransitioning(true)
    currentRef.current = index
    setCurrentSlide(index)

    if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current)
    unlockTimerRef.current = window.setTimeout(() => {
      transitioningRef.current = false
      setIsTransitioning(false)
    }, TRANSITION_MS)
  }, [])

  const goToPrevSlide = useCallback(() => {
    const next = (currentRef.current - 1 + carouselData.length) % carouselData.length
    goToSlide(next)
  }, [goToSlide])

  const goToNextSlide = useCallback(() => {
    const next = (currentRef.current + 1) % carouselData.length
    goToSlide(next)
  }, [goToSlide])

  useEffect(() => {
    let timer: number | undefined
    let cancelled = false

    const schedule = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return
        if (document.visibilityState !== 'hidden' && !transitioningRef.current) {
          const next = (currentRef.current + 1) % carouselData.length
          goToSlide(next)
        }
        schedule()
      }, INTERVAL_MS)
    }

    schedule()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current)
    }
  }, [goToSlide])

  return (
    <div
      id="template-mo-zay-hero-carousel"
      className="hero-carousel-react position-relative"
      style={{ ['--hero-dir' as string]: direction }}
    >
      <div className="hero-carousel-react__stage">
        {carouselData.map((slide, index) => {
          const active = currentSlide === index
          return (
            <div
              key={slide.id}
              className={`hero-carousel-react__slide${active ? ' is-active' : ''}`}
              aria-hidden={!active}
            >
              <div className="hero-carousel-react__media">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="hero-carousel-react__img"
                />
              </div>
              <div className="hero-carousel-react__veil" aria-hidden="true" />
              <div className="hero-carousel-react__copy">
                <p className="hero-carousel-react__kicker">An Lạc Stone</p>
                <h2 className="hero-carousel-react__title">{slide.title}</h2>
                <p className="hero-carousel-react__subtitle">{slide.subtitle}</p>
                <p className="hero-carousel-react__desc">{slide.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hero-carousel-react__dots" role="tablist" aria-label="Chọn slide">
        {carouselData.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            className={currentSlide === index ? 'is-active' : ''}
            aria-selected={currentSlide === index}
            aria-label={slide.title}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        onClick={goToPrevSlide}
        disabled={isTransitioning}
        aria-label="Previous"
      >
        <i className="fas fa-chevron-left"></i>
        <span className="visually-hidden">Previous</span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        onClick={goToNextSlide}
        disabled={isTransitioning}
        aria-label="Next"
      >
        <i className="fas fa-chevron-right"></i>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  )
}
