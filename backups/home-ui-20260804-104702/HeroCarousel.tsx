'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const carouselData = [
  {
    id: 1,
    image: '/images/clean/hero/slide-1.jpg',
    title: 'An Lạc Stone',
    subtitle: 'Đá Cảnh & Mỹ Nghệ Chất Lượng Cao',
    description: 'Chuyên cung cấp đá cảnh, đồ chế tác từ đá mỹ nghệ chất lượng cao. Từ đá phong thủy đến tượng đá nghệ thuật, chúng tôi mang đến những sản phẩm độc đáo và tinh tế.'
  },
  {
    id: 2,
    image: '/images/clean/hero/slide-2.jpg',
    title: 'Đá Tự Nhiên',
    subtitle: 'Từng Mảnh Ký Ức Của Thiên Nhiên',
    description: 'Mỗi đường vân, mỗi sắc màu đều là dấu ấn thời gian không thể lặp lại — đá thiên nhiên kể câu chuyện về sự trường tồn và kết nối với đất mẹ.'
  },
  {
    id: 3,
    image: '/images/clean/hero/slide-3.jpg',
    title: 'Sản Phẩm Mỹ Nghệ',
    subtitle: 'Nghệ Thuật Từ Đá Tự Nhiên',
    description: 'Từ tượng đá, đài phun nước đến đèn đá và lavabo — mỗi tác phẩm là sự kết hợp giữa bàn tay nghệ nhân và vẻ đẹp nguyên bản của thiên nhiên.'
  }
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return
    
    setIsTransitioning(true)
    setCurrentSlide(index)
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }, [currentSlide, isTransitioning])

  const goToPrevSlide = useCallback(() => {
    if (isTransitioning) return
    
    const newIndex = (currentSlide - 1 + carouselData.length) % carouselData.length
    goToSlide(newIndex)
  }, [currentSlide, isTransitioning, goToSlide])

  const goToNextSlide = useCallback(() => {
    if (isTransitioning) return
    
    const newIndex = (currentSlide + 1) % carouselData.length
    goToSlide(newIndex)
  }, [currentSlide, isTransitioning, goToSlide])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        goToNextSlide()
      }
    }, 6000) // Increased interval for better user experience

    return () => clearInterval(interval)
  }, [goToNextSlide, isTransitioning])

  return (
    <div 
      id="template-mo-zay-hero-carousel" 
      className="carousel slide position-relative" 
      data-bs-ride="carousel"
      style={{ 
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Removed carousel indicators */}
      
      <div className="carousel-inner">
        {carouselData.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item ${currentSlide === index ? 'active' : ''}`}
            style={{
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: currentSlide === index ? 'translateX(0)' : 'translateX(100%)',
              opacity: currentSlide === index ? 1 : 0
            }}
          >
            <div className="container">
              <div className="row p-5">
                <div className="mx-auto col-md-8 col-lg-6 order-lg-last">
                  <div style={{ 
                    overflow: 'hidden', 
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    width: '100%',
                    height: '400px',
                    position: 'relative'
                  }}>
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="img-fluid"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.6s ease-in-out',
                        transform: currentSlide === index ? 'scale(1)' : 'scale(1.05)'
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-6 mb-0 d-flex align-items-center">
                  <div
                    className="hero-carousel-copy"
                    style={{
                      opacity: currentSlide === index ? 1 : 0,
                      transform: currentSlide === index ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'all 0.8s ease-out 0.3s',
                    }}
                  >
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
                      <h1
                        className="h1 text-success"
                        style={{
                          opacity: currentSlide === index ? 1 : 0,
                          transform: currentSlide === index ? 'translateX(0)' : 'translateX(-30px)',
                          transition: 'all 0.8s ease-out 0.5s',
                        }}
                      >
                        <b>{slide.title}</b>
                      </h1>
                      <h3
                        className="h2"
                        style={{
                          opacity: currentSlide === index ? 1 : 0,
                          transform: currentSlide === index ? 'translateX(0)' : 'translateX(-30px)',
                          transition: 'all 0.8s ease-out 0.7s',
                        }}
                      >
                        {slide.subtitle}
                      </h3>
                      <p
                        style={{
                          opacity: currentSlide === index ? 1 : 0,
                          transform: currentSlide === index ? 'translateX(0)' : 'translateX(-30px)',
                          transition: 'all 0.8s ease-out 0.9s',
                        }}
                      >
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        className="carousel-control-prev"
        type="button"
        onClick={goToPrevSlide}
        disabled={isTransitioning}
        style={{ 
          cursor: isTransitioning ? 'not-allowed' : 'pointer', 
          border: 'none', 
          outline: 'none',
          opacity: isTransitioning ? 0.5 : 0.7
        }}
      >
        <i className="fas fa-chevron-left"></i>
        <span className="visually-hidden">Previous</span>
      </button>
      
      <button
        className="carousel-control-next"
        type="button"
        onClick={goToNextSlide}
        disabled={isTransitioning}
        style={{ 
          cursor: isTransitioning ? 'not-allowed' : 'pointer', 
          border: 'none', 
          outline: 'none',
          opacity: isTransitioning ? 0.5 : 0.7
        }}
      >
        <i className="fas fa-chevron-right"></i>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  )
}
