'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageSlider from '@/components/ImageSlider'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useState, useEffect, useCallback } from 'react'
import { productAPI, formatPriceVND } from '@/services/api'
import { watchCatalog } from '@/lib/catalog-sync'
import { shownCraft, shownHighlights, shownWarranty } from '@/lib/product-detail'

interface Product {
  id: number
  name: string
  description: string
  priceVND: number
  image: string
  images: string[]
  category: {
    name: string
  }
  rating: number
  reviewCount: number
  material?: string
  origin?: string
  dimensions?: string
  weight?: number
  craft?: string | null
  warranty?: string | null
  highlights?: string[]
}

export default function ShopSingle({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const loadProduct = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const productData = await productAPI.getProduct(parseInt(params.id, 10))
      setProduct(productData)
      setError(null)
    } catch (err) {
      if (!silent) setError('Có lỗi xảy ra khi tải sản phẩm')
      console.error('Error fetching product:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    void loadProduct()
  }, [loadProduct])

  useEffect(() => watchCatalog(() => { void loadProduct(true) }), [loadProduct])

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      name: product.name,
      price: formatPriceVND(product.priceVND),
      image: product.image,
    })

    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="pdp-taste">
        <Header />
        <div className="pdp-taste__state">
          <div className="pdp-taste__skeleton" aria-hidden="true">
            <div className="pdp-taste__skeleton-media" />
            <div className="pdp-taste__skeleton-copy">
              <div className="pdp-taste__skeleton-line is-lg" />
              <div className="pdp-taste__skeleton-line" />
              <div className="pdp-taste__skeleton-line is-sm" />
              <div className="pdp-taste__skeleton-line" />
            </div>
          </div>
          <p className="pdp-taste__state-text">Đang tải sản phẩm...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="pdp-taste">
        <Header />
        <div className="pdp-taste__state">
          <div className="pdp-taste__empty">
            <i className="fas fa-exclamation-triangle" aria-hidden="true" />
            <h1 className="pdp-taste__empty-title">Không tìm thấy sản phẩm</h1>
            <p>{error || 'Sản phẩm không tồn tại'}</p>
            <Link href="/shop" className="btn btn-success taste-btn">
              Quay lại cửa hàng
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const specs = [
    { label: 'Danh mục', value: product.category?.name },
    { label: 'Chất liệu', value: product.material || 'Đá tự nhiên cao cấp' },
    { label: 'Xuất xứ', value: product.origin || 'Việt Nam' },
    { label: 'Kích thước', value: product.dimensions },
    { label: 'Trọng lượng', value: product.weight ? `${product.weight} kg` : undefined },
  ].filter((item) => Boolean(item.value))

  const highlights = shownHighlights(product.highlights)
  const craft = shownCraft(product.craft)
  const warranty = shownWarranty(product.warranty)

  const inWishlist = isInWishlist(product.id)

  return (
    <div className="pdp-taste">
      <Header />

      <section className="pdp-taste__hero">
        <div className="pdp-taste__hero-veil" aria-hidden="true" />
        <div className="container">
          <Reveal className="pdp-taste__crumb">
            <Link href="/shop" className="pdp-taste__crumb-link">
              Cửa hàng
            </Link>
            <span aria-hidden="true">/</span>
            <span>{product.category?.name || 'Sản phẩm'}</span>
          </Reveal>
        </div>
      </section>

      <section className="pdp-taste__main">
        <div className="container">
          <div className="pdp-taste__layout">
            <Reveal className="pdp-taste__gallery">
              <div className="pdp-taste__gallery-panel">
                <ImageSlider images={product.images || [product.image]} productName={product.name} />
              </div>
            </Reveal>

            <Reveal delayMs={80} className="pdp-taste__info">
              <p className="taste-kicker">{product.category?.name || 'An Lạc Stone'}</p>
              <h1 className="pdp-taste__title">{product.name}</h1>

              <div className="pdp-taste__rating" aria-label={`Đánh giá ${product.rating} trên 5`}>
                <div className="pdp-taste__stars">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fa fa-star ${i < Math.floor(product.rating) ? 'is-on' : 'is-off'}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span>({product.reviewCount} đánh giá)</span>
              </div>

              <p className="pdp-taste__price">{formatPriceVND(product.priceVND)}</p>
              <p className="pdp-taste__desc">{product.description}</p>

              {specs.length > 0 && (
                <div className="pdp-taste__specs">
                  {specs.map((spec) => (
                    <div key={spec.label} className="pdp-taste__spec">
                      <span className="pdp-taste__spec-label">{spec.label}</span>
                      <span className="pdp-taste__spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pdp-taste__qty">
                <label className="pdp-taste__qty-label" htmlFor="pdp-qty">
                  Số lượng
                </label>
                <div className="pdp-taste__qty-group">
                  <button
                    type="button"
                    className="pdp-taste__qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>
                  <input
                    id="pdp-qty"
                    type="number"
                    className="pdp-taste__qty-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                  />
                  <button
                    type="button"
                    className="pdp-taste__qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pdp-taste__actions">
                <button
                  type="button"
                  className={`btn btn-success taste-btn pdp-taste__cart ${isAdded ? 'is-added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAdded}
                >
                  {isAdded ? (
                    <>
                      <i className="fas fa-check me-2" aria-hidden="true" />
                      Đã thêm
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shopping-cart me-2" aria-hidden="true" />
                      Thêm vào giỏ
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className={`pdp-taste__wish ${inWishlist ? 'is-active' : ''}`}
                  onClick={() => {
                    if (inWishlist) {
                      removeFromWishlist(product.id)
                    } else {
                      addToWishlist({
                        id: product.id,
                        name: product.name,
                        price: formatPriceVND(product.priceVND),
                        image: product.image,
                        description: product.description,
                      })
                    }
                  }}
                  title={inWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  aria-label={inWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  <i className="fas fa-heart" aria-hidden="true" />
                </button>
              </div>

              <Link href="/shop" className="pdp-taste__back">
                <i className="fas fa-arrow-left" aria-hidden="true" />
                Tiếp tục mua sắm
              </Link>
            </Reveal>
          </div>

          <Reveal delayMs={120}>
            <div className="pdp-taste__details">
              <div className="pdp-taste__details-copy">
                <h2 className="pdp-taste__details-title">Thông tin chi tiết</h2>
                <p className="pdp-taste__details-text">{product.description}</p>
              </div>
              <div className="pdp-taste__details-grid">
                <div className="pdp-taste__details-card">
                  <h3>Đặc điểm</h3>
                  <ul>
                    <li>Chất liệu: {product.material || 'Đá tự nhiên cao cấp'}</li>
                    <li>Xuất xứ: {product.origin || 'Việt Nam'}</li>
                    <li>Chế tác: {craft}</li>
                    <li>Bảo hành: {warranty}</li>
                  </ul>
                </div>
                <div className="pdp-taste__details-card">
                  <h3>Phù hợp không gian</h3>
                  <div className="pdp-taste__chips">
                    {highlights.map((item) => (
                      <span key={item} className="pdp-taste__chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
