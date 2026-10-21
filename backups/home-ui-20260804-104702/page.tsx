'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroCarousel from '@/components/HeroCarousel'
import HomeSection from '@/components/HomeSection'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useState, useEffect } from 'react'

export default function Home() {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const [showContact, setShowContact] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
    
    // Show visual feedback
    setAddedItems(prev => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 2000)
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setContact({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setShowContact(false), 2000);
        setTimeout(() => setSubmitted(false), 2500);
      } else {
        alert('Có lỗi xảy ra: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const craftCategories = [
    {
      name: 'Bàn Ghế Đá',
      slug: 'ban-ghe-da',
      image: '/images/san-pham-my-nghe/ban-ghe-da/anh1.webp',
      icon: 'fa-chair',
    },
    {
      name: 'Đài Phun Nước',
      slug: 'dai-phun-nuoc',
      image: '/images/san-pham-my-nghe/dai-phun-nuoc/anh1.webp',
      icon: 'fa-water',
    },
    {
      name: 'Bảng Hiệu Đá',
      slug: 'bang-hieu-da',
      image: '/images/san-pham-my-nghe/bang-hieu-da/anh1.jpg',
      icon: 'fa-sign',
    },
    {
      name: 'Bồn Tắm Đá',
      slug: 'bon-tam-da',
      image: '/images/san-pham-my-nghe/bon-tam-da/anh1.webp',
      icon: 'fa-bath',
    },
    {
      name: 'Đèn Đá',
      slug: 'den-da',
      image: '/images/san-pham-my-nghe/den-da/anh1.webp',
      icon: 'fa-lightbulb',
    },
    {
      name: 'Lavabo Đá',
      slug: 'lavabo-da',
      image: '/images/san-pham-my-nghe/lavabo-da/anh1.webp',
      icon: 'fa-sink',
    },
    {
      name: 'Tượng Đá',
      slug: 'tuong-da',
      image: '/images/san-pham-my-nghe/tuong-da/anh1.webp',
      icon: 'fa-sculpture',
    },
    {
      name: 'Thạch Mỹ Nghệ',
      slug: 'thach-my-nghe',
      image: '/images/san-pham-my-nghe/thach-my-nghe/anh1.webp',
      icon: 'fa-gem',
    },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: "Tượng Đá Nghệ Thuật",
      price: "6,500,000 VNĐ",
      image: "/images/san-pham-my-nghe/tuong-da/anh1.webp",
      description: "Tượng đá được chế tác từ đá tự nhiên, mang lại sự bình an và điểm nhấn nghệ thuật cho không gian sống."
    },
    {
      id: 2,
      name: "Đèn Đá Sân Vườn",
      price: "3,200,000 VNĐ",
      image: "/images/san-pham-my-nghe/den-da/anh1.webp",
      description: "Đèn đá tự nhiên với ánh sáng ấm áp, phù hợp sân vườn và không gian thiền."
    },
    {
      id: 3,
      name: "Đài Phun Nước Đá",
      price: "9,800,000 VNĐ",
      image: "/images/san-pham-my-nghe/dai-phun-nuoc/anh1.webp",
      description: "Đài phun nước đá tự nhiên, mang âm thanh nước và vẻ đẹp phong thủy cho sân vườn."
    }
  ]

  return (
    <>
      <Header />
      
      {/* Particle Background */}
      <div className="particle-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: 'linear-gradient(135deg, #041434, #0c2d6b, #1a56b0)',
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `particleFloat ${Math.random() * 20 + 10}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.1
            }}
          />
        ))}
      </div>

      {/* Animated Welcome Section */}
      <HomeSection image="/images/clean/sections/welcome.jpg" className="home-welcome" tone="dark">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <h1
                className="welcome-title fw-bold mb-4"
                style={{
                  opacity: 1,
                  transform: 'translateY(0px)',
                  transition: '1s ease-out',
                  animation: '2s ease-in-out 0s infinite alternate none running glow',
                }}
              >
                Chào Mừng Đến Với An Lạc Stone
              </h1>
              <p
                className="lead mb-4 home-section__lead"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 1s ease-out 0.3s',
                }}
              >
                Khám phá bộ sưu tập đá cảnh và mỹ nghệ độc đáo,
                được chế tác tinh xảo từ những nghệ nhân lành nghề.
              </p>
              <div
                className="welcome-buttons"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 1s ease-out 0.6s',
                }}
              >
                <Link
                  href="/shop"
                  className="btn btn-success btn-lg"
                  style={{ animation: 'pulse 2s ease-in-out infinite' }}
                >
                  <i className="fas fa-gem me-2"></i>
                  Khám Phá Ngay
                </Link>
                <Link href="/about" className="btn btn-outline-success btn-lg">
                  <i className="fas fa-info-circle me-2"></i>
                  Tìm Hiểu Thêm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </HomeSection>

      <HeroCarousel />

      {/* Start Categories of The Month */}
      <HomeSection image="/images/clean/sections/categories.jpg" tone="soft">
        <div
          className="container"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s ease-out 0.9s',
          }}
        >
          <div className="row text-center pt-3">
            <div className="col-lg-8 m-auto">
              <h1 className="h1 mb-4 home-section__heading">Danh Mục Sản Phẩm Nổi Bật</h1>
              <p className="lead home-section__lead">
                Bộ sưu tập sản phẩm mỹ nghệ từ đá tự nhiên — bàn ghế, đài phun nước, đèn đá,
                lavabo, tượng đá và nhiều hơn nữa.
              </p>
            </div>
          </div>
          <div className="row">
            {craftCategories.map((category, index) => (
              <div key={category.slug} className="col-6 col-md-4 col-lg-3 p-3 mt-3">
                <div
                  className="category-card"
                  style={{
                    background: '#D0D9E1',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(4, 20, 52, 0.12)',
                    boxShadow: '0 15px 35px rgba(4, 20, 52, 0.18)',
                    animation: `slideInFromBottom 0.8s ease-out ${1.1 + index * 0.08}s both`,
                    height: '100%',
                    padding: '1.25rem 0.75rem',
                  }}
                >
                  <Link href={`/shop?category=${category.slug}`} style={{ textDecoration: 'none' }}>
                    <Image
                      src={category.image}
                      className="rounded-circle img-fluid border"
                      alt={category.name}
                      width={220}
                      height={220}
                      style={{
                        objectFit: 'cover',
                        aspectRatio: '1 / 1',
                        margin: '0 auto',
                        display: 'block',
                      }}
                    />
                  </Link>
                  <h5 className="text-center mt-3 mb-3 category-card__title">
                    {category.name}
                  </h5>
                  <p className="text-center mb-0">
                    <Link
                      className="btn btn-success btn-sm"
                      href={`/shop?category=${category.slug}`}
                      style={{
                        background: 'linear-gradient(135deg, #041434, #0c2d6b, #1a56b0)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(4, 20, 52, 0.35)',
                        color: '#ffffff',
                      }}
                    >
                      <i className={`fas ${category.icon} me-2`}></i>
                      Xem Sản Phẩm
                    </Link>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </HomeSection>
      {/* End Categories of The Month */}

      {/* Start Featured Product */}
      <HomeSection image="/images/clean/sections/featured.jpg" tone="dark">
        <div
          className="container"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s ease-out 1.8s',
          }}
        >
          <div className="row text-center py-3">
            <div className="col-lg-8 m-auto">
              <h1 className="h1 home-section__heading">Sản Phẩm Nổi Bật</h1>
              <p className="lead home-section__lead">
                Những sản phẩm được yêu thích nhất, được chọn lọc từ bộ sưu tập đá cảnh và mỹ nghệ
                chất lượng cao.
              </p>
            </div>
          </div>
          <div className="row">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="col-12 col-md-4 mb-4">
                <div
                  className="card h-100 product-card"
                  style={{
                    animation: `slideInFromBottom 0.8s ease-out ${2.1 + index * 0.2}s both`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Link href="/shop">
                    <Image
                      src={product.image}
                      className="card-img-top"
                      alt={product.name}
                      width={300}
                      height={300}
                    />
                  </Link>
                  <div className="card-body">
                    <ul className="list-unstyled d-flex justify-content-center">
                      {[...Array(5)].map((_, i) => (
                        <li key={i}>
                          <i className={`fa fa-star ${i < 4 ? 'text-warning' : 'text-muted'}`}></i>
                        </li>
                      ))}
                    </ul>
                    <Link className="h2 text-decoration-none text-dark" href="/shop">
                      {product.name}
                    </Link>
                    <p className="card-text">{product.description}</p>
                    <p className="text-muted">{product.price}</p>
                    <div className="d-flex gap-2">
                      <button
                        className={`btn btn-success flex-grow-1 ${
                          addedItems.has(product.id) ? 'btn-outline-success' : ''
                        }`}
                        onClick={() => handleAddToCart(product)}
                        style={{
                          transition: 'all 0.3s ease',
                          transform: addedItems.has(product.id) ? 'scale(0.95)' : 'scale(1)',
                        }}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>
                        {addedItems.has(product.id) ? 'Đã Thêm!' : 'Thêm Vào Giỏ Hàng'}
                      </button>
                      <button
                        className={`btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => {
                          if (isInWishlist(product.id)) {
                            removeFromWishlist(product.id)
                          } else {
                            addToWishlist(product)
                          }
                        }}
                        title={
                          isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'
                        }
                      >
                        <i className={`fas fa-heart ${isInWishlist(product.id) ? 'text-white' : ''}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </HomeSection>
      {/* End Featured Product */}

      {/* Animated Stats Section */}
      <HomeSection image="/images/clean/sections/stats.jpg" tone="soft">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <div className="stat-item" style={{ animation: 'fadeInUp 1s ease-out 2.4s both' }}>
                <i
                  className="fas fa-gem fa-3x mb-3"
                  style={{ animation: 'rotate 3s linear infinite' }}
                ></i>
                <h3 className="counter">500+</h3>
                <p>Sản Phẩm Đá Quý</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item" style={{ animation: 'fadeInUp 1s ease-out 2.6s both' }}>
                <i
                  className="fas fa-users fa-3x mb-3"
                  style={{ animation: 'bounce 2s ease-in-out infinite' }}
                ></i>
                <h3 className="counter">1000+</h3>
                <p>Khách Hàng Hài Lòng</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item" style={{ animation: 'fadeInUp 1s ease-out 2.8s both' }}>
                <i
                  className="fas fa-award fa-3x mb-3"
                  style={{ animation: 'pulse 2.5s ease-in-out infinite' }}
                ></i>
                <h3 className="counter">50+</h3>
                <p>Năm Kinh Nghiệm</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item" style={{ animation: 'fadeInUp 1s ease-out 3.0s both' }}>
                <i
                  className="fas fa-shipping-fast fa-3x mb-3"
                  style={{ animation: 'slideInRight 1.5s ease-in-out infinite' }}
                ></i>
                <h3 className="counter">24/7</h3>
                <p>Hỗ Trợ Khách Hàng</p>
              </div>
            </div>
          </div>
        </div>
      </HomeSection>
      {/* End Stats Section */}

      {/* Float Contact Button */}
      <button
        className="float-contact-btn"
        onClick={() => setShowContact(true)}
        aria-label="Liên hệ admin"
      >
        <i className="fas fa-comments"></i>
      </button>
      {/* Contact Popup Modal */}
      {showContact && (
        <div className="contact-modal-overlay" onClick={() => setShowContact(false)}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <button className="contact-modal-close" onClick={() => setShowContact(false)} aria-label="Đóng">
              <i className="fas fa-times"></i>
            </button>
            <h4 className="mb-3">Liên hệ với Shop</h4>
            {submitted ? (
              <div className="alert alert-success text-center">
                <i className="fas fa-check-circle me-2"></i>
                Đã gửi thông tin thành công! Email đã được gửi đến admin.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Họ và tên"
                    value={contact.name}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={contact.phone}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="mb-2">
                  <textarea
                    className="form-control"
                    name="message"
                    placeholder="Nội dung liên hệ"
                    rows={3}
                    value={contact.message}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-success w-100 mt-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
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
    </>
  )
} 