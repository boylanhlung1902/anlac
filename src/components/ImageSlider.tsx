'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface ImageSliderProps {
  images: string[]
  productName: string
}

export default function ImageSlider({ images, productName }: ImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }, [images.length])

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const toggleZoom = () => {
    setIsZoomed((prev) => {
      if (!prev) setZoomLevel(1)
      return !prev
    })
  }

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.4, 3))
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.4, 0.6))

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isZoomed) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prevImage()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        nextImage()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        setIsZoomed(false)
      }
    }

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isZoomed, prevImage, nextImage])

  if (!images.length) return null

  return (
    <div className="pdp-slider">
      {isZoomed && (
        <div className="pdp-slider__zoom" onClick={toggleZoom} role="dialog" aria-modal="true">
          <div className="pdp-slider__zoom-stage" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[currentImageIndex]}
              alt={`${productName} - Ảnh ${currentImageIndex + 1}`}
              width={1200}
              height={1200}
              className="pdp-slider__zoom-img"
              style={{ transform: `scale(${zoomLevel})` }}
              sizes="100vw"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="pdp-slider__zoom-nav pdp-slider__zoom-nav--prev"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                aria-label="Ảnh trước"
              >
                <i className="fas fa-chevron-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pdp-slider__zoom-nav pdp-slider__zoom-nav--next"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                aria-label="Ảnh sau"
              >
                <i className="fas fa-chevron-right" aria-hidden="true" />
              </button>
              <div className="pdp-slider__zoom-count">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          <div className="pdp-slider__zoom-tools" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={zoomOut} disabled={zoomLevel <= 0.6} aria-label="Thu nhỏ">
              <i className="fas fa-minus" aria-hidden="true" />
            </button>
            <button type="button" onClick={zoomIn} disabled={zoomLevel >= 3} aria-label="Phóng to">
              <i className="fas fa-plus" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className="pdp-slider__zoom-close"
            onClick={toggleZoom}
            aria-label="Đóng"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="pdp-slider__main">
        <Image
          src={images[currentImageIndex]}
          alt={`${productName} - Ảnh ${currentImageIndex + 1}`}
          fill
          priority
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 560px"
          className="pdp-slider__img"
          onClick={toggleZoom}
        />

        <button
          type="button"
          className="pdp-slider__zoom-btn"
          onClick={toggleZoom}
          title="Phóng to"
          aria-label="Phóng to ảnh"
        >
          <i className="fas fa-expand" aria-hidden="true" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="pdp-slider__nav pdp-slider__nav--prev"
              onClick={prevImage}
              aria-label="Ảnh trước"
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="pdp-slider__nav pdp-slider__nav--next"
              onClick={nextImage}
              aria-label="Ảnh sau"
            >
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
            <div className="pdp-slider__count">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="pdp-slider__thumbs" role="tablist" aria-label="Ảnh sản phẩm">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === currentImageIndex}
              className={`pdp-slider__thumb${index === currentImageIndex ? ' is-active' : ''}`}
              onClick={() => goToImage(index)}
            >
              <Image
                src={image}
                alt=""
                width={72}
                height={72}
                sizes="72px"
                className="pdp-slider__thumb-img"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
