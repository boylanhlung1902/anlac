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

const INTERVAL_MS = 4500
const TRANSITION_MS = 700

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentRef = useRef(0)
  const transitioningRef = useRef(false)
  const unlockTimerRef = useRef<number | undefined>(undefined)

  const goToSlide = useCallback((index: number) => {
    if (transitioningRef.current || index === currentRef.current) return

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
    <div id="template-mo-zay-hero-carousel" className="hero-carousel-react position-relative">
      <div className="hero-carousel-react__stage">
        {carouselData.map((slide, index) => {
          const active = currentSlide === index
          return (
            <div
              key={slide.id}
              className={`hero-carousel-react__slide${active ? ' is-active' : ''}`}
              aria-hidden={!active}
            >
              <div className="container">
                <div className="row p-5 align-items-center">
                  <div className="mx-auto col-md-8 col-lg-6 order-lg-last">
                    <div className="hero-carousel-react__media">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 991px) 100vw, 40vw"
                        className="hero-carousel-react__img"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 mb-0 d-flex align-items-center">
                    <div className="hero-carousel-copy hero-carousel-react__anim hero-carousel-react__anim--copy">
                      <div className="hero-carousel-copy__media" aria-hidden="true">
                        <Image
                          src={slide.image}
                          alt=""
                          fill
                          sizes="(max-width: 991px) 100vw, 50vw"
                          className="hero-carousel-copy__img"
                        />
                        <div className="hero-carousel-copy__veil" />
                      </div>
                      <div className="hero-carousel-copy__content text-align-left">
                        <h1 className="h1 text-success hero-carousel-react__anim hero-carousel-react__anim--title">
                          <b>{slide.title}</b>
                        </h1>
                        <h3 className="h2 hero-carousel-react__anim hero-carousel-react__anim--subtitle">
                          {slide.subtitle}
                        </h3>
                        <p className="hero-carousel-react__anim hero-carousel-react__anim--desc">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
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
