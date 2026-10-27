'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroCarousel from '@/components/HeroCarousel'
import HomeSection from '@/components/HomeSection'
import Reveal from '@/components/Reveal'
import WelcomeVisual from '@/components/WelcomeVisual'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useState } from 'react'
import highlights from '../../data/home-highlights.json'
import { presentHomeCategories, presentHomeProducts, useHomeVisibility } from '@/lib/home-visibility'

export default function Home() {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())
  const [showContact, setShowContact] = useState(false)
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddToCart = (product: (typeof featuredProducts)[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })

    setAddedItems((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 2000)
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContact({ ...contact, [e.target.name]: e.target.value })
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contact, source: 'homepage' }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        setContact({ name: '', email: '', phone: '', message: '' })
        setTimeout(() => setShowContact(false), 2000)
        setTimeout(() => setSubmitted(false), 2500)
      } else {
        alert('Có lỗi xảy ra: ' + data.message)
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      alert('Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibility = useHomeVisibility()
  const craftCategories = presentHomeCategories(visibility, highlights.categories)
  const featuredProducts = presentHomeProducts(visibility, highlights.featured)
  const featuredMore = featuredProducts.slice(3)

  const stats = [
    { value: '500+', label: 'Sản phẩm đá quý', icon: 'fa-gem' },
    { value: '1000+', label: 'Khách hàng hài lòng', icon: 'fa-users' },
    { value: '50+', label: 'Năm kinh nghiệm', icon: 'fa-award' },
    { value: '24/7', label: 'Hỗ trợ khách hàng', icon: 'fa-shipping-fast' },
  ]

  return (
    <div className="home-taste">
      <Header />

      {/* Welcome - asymmetric split */}
      <HomeSection image="/images/home/welcome-bg.jpg" className="home-welcome" tone="dark">
        <div className="container">
          <div className="taste-welcome-grid">
            <Reveal className="taste-welcome">
              <p className="taste-kicker">An Lạc Stone</p>
              <h1 className="taste-welcome__title">
                Đá cảnh &amp; mỹ nghệ
                <br />
                cho không gian sống
              </h1>
              <p className="taste-welcome__lead">
                Bộ sưu tập đá tự nhiên và chế tác tinh xảo từ nghệ nhân lành nghề.
              </p>
              <div className="taste-welcome__actions">
                <Link href="/shop" className="btn btn-success btn-lg taste-btn">
                  Xem cửa hàng
                </Link>
                <Link href="/about" className="btn btn-outline-success btn-lg taste-btn taste-btn--ghost">
                  Về chúng tôi
                </Link>
              </div>
            </Reveal>

            <WelcomeVisual />
          </div>
        </div>
      </HomeSection>

      <div className="taste-carousel-wrap">
        <HeroCarousel />
      </div>

      {/* Categories - bento rhythm */}
      <HomeSection image="/images/anlac/tuong-ky-lan/001.jpg" tone="soft">
        <div className="container">
          <Reveal>
            <div className="taste-section-head">
              <h2 className="taste-section-title home-section__heading">Danh mục nổi bật</h2>
              <p className="taste-section-lead home-section__lead">
                Đủ các danh mục đá cảnh và mỹ nghệ. Ảnh bìa dùng tấm rõ sản phẩm nhất trong từng danh mục.
              </p>
            </div>
          </Reveal>

          <div className="taste-bento">
            {craftCategories.map((category, index) => (
              <Reveal key={category.slug} delayMs={index * 40} className={`taste-bento__cell${index === 0 ? ' taste-bento__cell--hero' : ''}`}>
                <Link href={`/shop?category=${category.slug}`} className="taste-bento__card">
                  <div className="taste-bento__media">
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes={index === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                      className="taste-bento__img taste-bento__img--fill"
                      aria-hidden
                    />
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes={index === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                      className="taste-bento__img"
                    />
                  </div>
                  <div className="taste-bento__meta">
                    <h3 className="taste-bento__name">{category.name}</h3>
                    <span className="taste-bento__cta">
                      <i className={`fas ${category.icon}`} aria-hidden="true" />
                      Xem sản phẩm
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </HomeSection>

      {/* Featured - 1 featured + 2 stacked (not three equal cards) */}
      <HomeSection image="/images/anlac/tuong-phat-thich-ca/012.jpg" tone="dark">
        <div className="container">
          <Reveal>
            <div className="taste-section-head taste-section-head--row">
              <h2 className="taste-section-title home-section__heading">Sản phẩm nổi bật</h2>
              <Link href="/shop" className="taste-text-link">
                Xem tất cả
              </Link>
            </div>
          </Reveal>

          {featuredProducts[0] ? <div className="taste-featured">
            <Reveal className="taste-featured__primary">
              <article className="taste-featured-card taste-featured-card--large">
                <Link href={`/shop-single/${featuredProducts[0].id}`} className="taste-featured-card__media">
                  <Image
                    src={featuredProducts[0].image}
                    alt=""
                    fill
                    sizes="(max-width: 991px) 100vw, 58vw"
                    className="taste-featured-card__img taste-featured-card__img--fill"
                    aria-hidden
                  />
                  <Image
                    src={featuredProducts[0].image}
                    alt={featuredProducts[0].name}
                    fill
                    sizes="(max-width: 991px) 100vw, 58vw"
                    className="taste-featured-card__img"
                    priority
                  />
                </Link>
                <div className="taste-featured-card__body">
                  <h3 className="taste-featured-card__title">
                    <Link href={`/shop-single/${featuredProducts[0].id}`}>{featuredProducts[0].name}</Link>
                  </h3>
                  <p className="taste-featured-card__desc">{featuredProducts[0].description}</p>
                  <p className="taste-featured-card__price">{featuredProducts[0].price}</p>
                  <div className="taste-featured-card__actions">
                    <button
                      type="button"
                      className={`btn btn-success taste-btn ${addedItems.has(featuredProducts[0].id) ? 'is-added' : ''}`}
                      onClick={() => handleAddToCart(featuredProducts[0])}
                    >
                      {addedItems.has(featuredProducts[0].id) ? 'Đã thêm' : 'Thêm vào giỏ'}
                    </button>
                    <button
                      type="button"
                      className={`btn taste-wish ${isInWishlist(featuredProducts[0].id) ? 'is-active' : ''}`}
                      onClick={() => {
                        if (isInWishlist(featuredProducts[0].id)) removeFromWishlist(featuredProducts[0].id)
                        else addToWishlist(featuredProducts[0])
                      }}
                      aria-label={isInWishlist(featuredProducts[0].id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                    >
                      <i className="fas fa-heart" />
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>

            <div className="taste-featured__stack">
              {featuredProducts.slice(1, 3).map((product, index) => (
                <Reveal key={product.id} delayMs={(index + 1) * 80}>
                  <article className="taste-featured-card taste-featured-card--compact">
                    <Link href={`/shop-single/${product.id}`} className="taste-featured-card__media">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="(max-width: 991px) 100vw, 40vw"
                        className="taste-featured-card__img taste-featured-card__img--fill"
                        aria-hidden
                      />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 991px) 100vw, 40vw"
                        className="taste-featured-card__img"
                      />
                    </Link>
                    <div className="taste-featured-card__body">
                      <h3 className="taste-featured-card__title">
                        <Link href={`/shop-single/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="taste-featured-card__price">{product.price}</p>
                      <div className="taste-featured-card__actions">
                        <button
                          type="button"
                          className={`btn btn-success btn-sm taste-btn ${addedItems.has(product.id) ? 'is-added' : ''}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {addedItems.has(product.id) ? 'Đã thêm' : 'Thêm vào giỏ'}
                        </button>
                        <button
                          type="button"
                          className={`btn taste-wish ${isInWishlist(product.id) ? 'is-active' : ''}`}
                          onClick={() => {
                            if (isInWishlist(product.id)) removeFromWishlist(product.id)
                            else addToWishlist(product)
                          }}
                          aria-label={isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div> : null}

          {featuredMore.length > 0 && (
            <div className="taste-featured-more">
              {featuredMore.map((product, index) => (
                <Reveal key={product.id} delayMs={(index % 3) * 60}>
                  <article className="taste-featured-card taste-featured-card--tile">
                    <Link href={`/shop-single/${product.id}`} className="taste-featured-card__media">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw"
                        className="taste-featured-card__img taste-featured-card__img--fill"
                        aria-hidden
                      />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw"
                        className="taste-featured-card__img"
                      />
                    </Link>
                    <div className="taste-featured-card__body">
                      <h3 className="taste-featured-card__title">
                        <Link href={`/shop-single/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="taste-featured-card__price">{product.price}</p>
                      <div className="taste-featured-card__actions">
                        <button
                          type="button"
                          className={`btn btn-success btn-sm taste-btn ${addedItems.has(product.id) ? 'is-added' : ''}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {addedItems.has(product.id) ? 'Đã thêm' : 'Thêm vào giỏ'}
                        </button>
                        <button
                          type="button"
                          className={`btn taste-wish ${isInWishlist(product.id) ? 'is-active' : ''}`}
                          onClick={() => {
                            if (isInWishlist(product.id)) removeFromWishlist(product.id)
                            else addToWishlist(product)
                          }}
                          aria-label={isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        >
                          <i className="fas fa-heart" />
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </HomeSection>

      {/* Stats - strip, no infinite icon loops */}
      <HomeSection image="/images/anlac/phu-dieu/001.jpg" tone="soft">
        <div className="container">
          <Reveal>
            <div className="taste-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="taste-stats__item">
                  <i className={`fas ${stat.icon} taste-stats__icon`} aria-hidden="true" />
                  <p className="taste-stats__value">{stat.value}</p>
                  <p className="taste-stats__label">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </HomeSection>

      <button
        className="float-contact-btn"
        onClick={() => setShowContact(true)}
        aria-label="Liên hệ admin"
      >
        <i className="fas fa-comments" />
      </button>

      {showContact && (
        <div className="contact-modal-overlay" onClick={() => setShowContact(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="contact-modal-close" onClick={() => setShowContact(false)} aria-label="Đóng">
              <i className="fas fa-times" />
            </button>
            <h4 className="mb-3">Liên hệ với Shop</h4>
            {submitted ? (
              <div className="alert alert-success text-center">
                <i className="fas fa-check-circle me-2" />
                Đã gửi thông tin thành công! Email đã được gửi đến admin.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="taste-contact-form">
                <div className="mb-2">
                  <label className="form-label" htmlFor="contact-name">
                    Họ và tên
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className="form-control"
                    name="name"
                    value={contact.name}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="form-control"
                    name="email"
                    value={contact.email}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label" htmlFor="contact-phone">
                    Số điện thoại
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={contact.phone}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label" htmlFor="contact-message">
                    Nội dung liên hệ
                  </label>
                  <textarea
                    id="contact-message"
                    className="form-control"
                    name="message"
                    rows={3}
                    value={contact.message}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100 mt-2 taste-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi liên hệ'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
