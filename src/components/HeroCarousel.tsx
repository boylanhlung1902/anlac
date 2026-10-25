'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

type HeroSlide = {
  id: number
  image: string
  title: string
  subtitle: string
  description: string
}

const carouselData: HeroSlide[] = [
  {
    id: 1,
    image: '/images/hero2/phat-sau.jpg',
    title: 'Tượng Phật ngồi thiền',
    subtitle: 'Sáu pho đá trắng xếp hai hàng',
    description:
      'Sáu tượng Phật ngồi xếp bằng, áo khoác buông theo vai và tay đặt trên lòng. Đá trắng mịn, búi tóc và nếp áo còn rõ, xếp thành hai hàng trước xưởng.',
  },
  {
    id: 2,
    image: '/images/hero2/chu-tieu-hang.jpg',
    title: 'Tượng chú tiểu',
    subtitle: 'Dãy đứng trước tường xưởng',
    description:
      'Hàng chú tiểu đá trắng đứng trên bệ, người cầm gậy và bát, người giơ tay, người ôm chuỗi và mở sách. Nụ cười và nếp áo đọc được dưới nắng.',
  },
  {
    id: 3,
    image: '/images/hero2/chu-tieu-thuyen.jpg',
    title: 'Bộ chú tiểu đủ dáng',
    subtitle: 'Thuyền, lá sen và nón',
    description:
      'Bộ chú tiểu đủ tư thế: nằm trên lá sen, chèo thuyền, đội nón và chắp tay. Phía sau còn pho Di Lặc cười, đá trắng mài nhẵn từng ngón tay.',
  },
  {
    id: 4,
    image: '/images/hero2/chu-tieu-nam-2.jpg',
    title: 'Chú tiểu nằm nghiêng',
    subtitle: 'Hai pho dài trước sân',
    description:
      'Hai tượng chú tiểu nằm sấp, một pho đội mũ nhọn và đeo chuỗi, pho kia chống cằm và thắt bím. Thân đá nằm trọn theo chiều ngang, mặt và tay không bị cắt.',
  },
  {
    id: 5,
    image: '/images/hero2/chu-tieu-san.jpg',
    title: 'Chú tiểu mang lộc',
    subtitle: 'Thỏi vàng, sách và quạt',
    description:
      'Nhóm chú tiểu đá trắng dưới hiên gỗ, người nâng thỏi vàng, người bê sách, người cầm quạt và đóa sen. Chuỗi hạt và nụ cười được chạm đủ.',
  },
]

const INTERVAL_MS = 6500
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
