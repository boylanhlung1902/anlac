'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

const carouselData = [
  {
    id: 1,
    image: '/images/clean/hero/slide-1.jpg',
    title: 'An Lạc Stone',
    subtitle: 'Đá Cảnh & Mỹ Nghệ Chất Lượng Cao',
    description:
      'Chuyên cung cấp đá cảnh, đồ chế tác từ đá mỹ nghệ chất lượng cao. Từ đá phong thủy đến tượng đá nghệ thuật, chúng tôi mang đến những sản phẩm độc đáo và tinh tế.',
  },
  {
    id: 2,
    image: '/images/clean/hero/slide-2.jpg',
    title: 'Đá Tự Nhiên',
    subtitle: 'Từng Mảnh Ký Ức Của Thiên Nhiên',
    description:
      'Mỗi đường vân, mỗi sắc màu đều là dấu ấn thời gian không thể lặp lại. Đá thiên nhiên kể câu chuyện về sự trường tồn và kết nối với đất mẹ.',
  },
  {
    id: 3,
    image: '/images/clean/hero/slide-3.jpg',
    title: 'Sản Phẩm Mỹ Nghệ',
    subtitle: 'Nghệ Thuật Từ Đá Tự Nhiên',
    description:
      'Từ tượng đá, đài phun nước đến đèn đá và lavabo. Mỗi tác phẩm là sự kết hợp giữa bàn tay nghệ nhân và vẻ đẹp nguyên bản của thiên nhiên.',
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
