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
  const [zoomLevel, setZoomLevel] = useState(0.6)

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }, [images.length])

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
    if (!isZoomed) {
      setZoomLevel(0.6) // Set zoom level to 60% when opening
    }
  }

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3)) // Max zoom 3x
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5)) // Min zoom 0.5x
  }

  // Keyboard navigation for zoom mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isZoomed) return
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          prevImage()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextImage()
          break
        case 'Escape':
          event.preventDefault()
          setIsZoomed(false)
          break
      }
    }

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Prevent scrolling when zoomed
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [isZoomed, prevImage, nextImage])

  return (
    <div className="image-slider">
                   {/* Zoom Overlay */}
             {isZoomed && (
               <div 
                 className="zoom-overlay"
                 onClick={toggleZoom}
               >
                 {/* Zoomed Image */}
                 <div className="zoomed-image-container">
                   <Image
                     src={images[currentImageIndex]}
                     alt={`${productName} - Ảnh ${currentImageIndex + 1}`}
                     width={1200}
                     height={1200}
                     className="zoomed-image"
                     style={{ 
                       transform: `scale(${zoomLevel})`,
                       transition: 'transform 0.3s ease-in-out'
                     }}
                     onClick={(e) => e.stopPropagation()}
                   />
                 </div>
                 
                 {/* Zoom Navigation Buttons */}
                 {images.length > 1 && (
                   <>
                     <button
                       className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-4 zoom-nav-btn"
                       onClick={(e) => {
                         e.stopPropagation()
                         prevImage()
                       }}
                       style={{ zIndex: 10000 }}
                     >
                       <i className="fas fa-arrow-circle-left"></i>
                     </button>
                     <button
                       className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-4 zoom-nav-btn"
                       onClick={(e) => {
                         e.stopPropagation()
                         nextImage()
                       }}
                       style={{ zIndex: 10000 }}
                     >
                       <i className="fas fa-arrow-circle-right"></i>
                     </button>
                   </>
                 )}
                 
                 {/* Zoom Image Counter */}
                 {images.length > 1 && (
                   <div className="position-absolute top-0 start-50 translate-middle-x mt-4">
                     <span className="badge bg-dark bg-opacity-75 zoom-counter">
                       {currentImageIndex + 1} / {images.length}
                     </span>
                   </div>
                 )}
                 
                 {/* Zoom Controls */}
                 <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 zoom-controls">
                   <div className="d-flex gap-2">
                     <button
                       className="btn btn-light zoom-control-btn"
                       onClick={(e) => {
                         e.stopPropagation()
                         zoomOut()
                       }}
                       disabled={zoomLevel <= 0.5}
                       title="Thu nhỏ"
                     >
                       <i className="fas fa-compress-arrows-alt"></i>
                     </button>
                     <button
                       className="btn btn-light zoom-control-btn"
                       onClick={(e) => {
                         e.stopPropagation()
                         zoomIn()
                       }}
                       disabled={zoomLevel >= 3}
                       title="Phóng to"
                     >
                       <i className="fas fa-expand-arrows-alt"></i>
                     </button>
                   </div>
                 </div>
                 
                 {/* Zoom Close Button */}
                 <button
                   className="btn btn-light position-absolute top-0 end-0 m-4 zoom-close-btn"
                   onClick={toggleZoom}
                   style={{ zIndex: 10000 }}
                 >
                   <i className="fas fa-times-circle"></i>
                 </button>
               </div>
             )}
      
      {/* Main Image */}
      <div className="main-image-container position-relative">
                       <Image
                 src={images[currentImageIndex]}
                 alt={`${productName} - Ảnh ${currentImageIndex + 1}`}
                 width={800}
                 height={800}
                 className="main-image img-fluid rounded"
                 style={{ 
                   objectFit: 'contain', 
                   maxHeight: '600px', 
                   width: '100%',
                   cursor: 'pointer'
                 }}
                 onClick={toggleZoom}
               />
        
        {/* Zoom indicator */}
        <div className="position-absolute top-0 end-0 m-2">
          <button
            className="btn btn-light btn-sm"
            onClick={toggleZoom}
            title={isZoomed ? 'Thu nhỏ' : 'Phóng to'}
          >
            <i className={`fas fa-${isZoomed ? 'compress' : 'expand'}`}></i>
          </button>
        </div>
        
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2"
              onClick={prevImage}
              style={{ zIndex: 10 }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={nextImage}
              style={{ zIndex: 10 }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="position-absolute bottom-0 end-0 m-3">
            <span className="badge bg-dark bg-opacity-75">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="thumbnails-container mt-3">
          <div className="d-flex gap-2 overflow-auto">
            {images.map((image, index) => (
              <div
                key={index}
                className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
                style={{ cursor: 'pointer', minWidth: '80px' }}
              >
                <Image
                  src={image}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className={`img-thumbnail ${index === currentImageIndex ? 'border-primary' : ''}`}
                  style={{ 
                    objectFit: 'cover',
                    opacity: index === currentImageIndex ? 1 : 0.7,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .image-slider {
          max-width: 100%;
        }
        
        .main-image-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .main-image {
          transition: transform 0.3s ease;
          max-width: 100%;
          height: auto;
        }
        
        .main-image:hover {
          transform: scale(1.05);
        }
        
        .zoomed-image-container {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 9999 !important;
          max-width: 90vw !important;
          max-height: 90vh !important;
          background: rgba(0, 0, 0, 0.9) !important;
          padding: 20px !important;
          border-radius: 8px !important;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.8) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .zoomed-image {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          border-radius: 4px !important;
          transition: transform 0.3s ease-in-out !important;
        }
        
        .zoomed-image-container {
          animation: fadeInZoom 0.3s ease-in-out !important;
        }
        
        @keyframes fadeInZoom {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .zoom-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.8) !important;
          z-index: 9998 !important;
          cursor: pointer !important;
          animation: fadeInOverlay 0.3s ease-in-out !important;
        }
        
        @keyframes fadeInOverlay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .zoom-nav-btn {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 50px !important;
          height: 50px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          animation: slideInNav 0.4s ease-out !important;
        }
        
        .zoom-nav-btn:hover {
          background-color: rgba(255, 255, 255, 1) !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
        
        @keyframes slideInNav {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .zoom-close-btn {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }
        
        .zoom-close-btn:hover {
          background-color: rgba(255, 255, 255, 1) !important;
          transform: scale(1.1) !important;
        }
        
        .zoom-counter {
          font-size: 14px !important;
          padding: 8px 16px !important;
          background-color: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border-radius: 20px !important;
        }
        
        .zoom-controls {
          z-index: 10000 !important;
        }
        
        .zoom-control-btn {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 45px !important;
          height: 45px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          font-size: 14px !important;
          animation: slideInControl 0.5s ease-out !important;
        }
        
        .zoom-control-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 1) !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
        
        @keyframes slideInControl {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .zoom-control-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
        
        .thumbnails-container {
          max-width: 100%;
        }
        
        .thumbnail-item {
          transition: all 0.3s ease;
        }
        
        .thumbnail-item:hover {
          transform: translateY(-2px);
        }
        
        .thumbnail-item.active img {
          border: 2px solid #041434 !important;
        }
        
        @media (max-width: 768px) {
          .main-image {
            max-height: 400px !important;
            width: 100% !important;
          }
          
          .zoomed-image-container {
            max-width: 95vw !important;
            max-height: 95vh !important;
            padding: 10px !important;
          }
          
          .zoom-nav-btn {
            width: 40px !important;
            height: 40px !important;
            font-size: 12px !important;
          }
          
          .zoom-close-btn {
            width: 35px !important;
            height: 35px !important;
            font-size: 12px !important;
          }
          
          .zoom-counter {
            font-size: 12px !important;
            padding: 6px 12px !important;
          }
          
          .zoom-control-btn {
            width: 40px !important;
            height: 40px !important;
            font-size: 12px !important;
          }
          
          .thumbnails-container {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
