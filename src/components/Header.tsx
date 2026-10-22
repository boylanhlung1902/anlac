'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import CartPopup from './CartPopup'

export default function Header() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartItems, getTotalItems, updateQuantity, removeFromCart } = useCart()
  const { getWishlistCount } = useWishlist()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  return (
    <>
      {/* Start Top Nav */}
      <nav className="navbar navbar-expand-lg bg-dark navbar-light d-none d-lg-block" id="templatemo_nav_top">
        <div className="container text-light">
          <div className="w-100 d-flex justify-content-between">
            <div>
              <i className="fa fa-envelope mx-2"></i>
              <a className="navbar-sm-brand text-light text-decoration-none" href="mailto:hoangminhtrung1902@gmail.com">hoangminhtrung1902@gmail.com</a>
              <i className="fa fa-phone mx-2"></i>
              <a className="navbar-sm-brand text-light text-decoration-none" href="tel:087-770-5979">087-770-5979</a>
            </div>
            <div>
              <a className="text-light" href="https://fb.com/stoneart" target="_blank" rel="sponsored"><i className="fab fa-facebook-f fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://www.instagram.com/stoneart" target="_blank"><i className="fab fa-instagram fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://twitter.com/stoneart" target="_blank"><i className="fab fa-twitter fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://www.youtube.com/stoneart" target="_blank"><i className="fab fa-youtube fa-sm fa-fw"></i></a>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light shadow site-header">
        <div className="container d-flex justify-content-between align-items-center">
          <Link className="navbar-brand text-success logo h1 align-self-center" href="/">
            An Lạc Stone
          </Link>

          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={toggleMobileMenu}
            aria-controls="templatemo_main_nav" 
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`align-self-center navbar-collapse ${isMobileMenuOpen ? 'show' : 'collapse'}`} id="templatemo_main_nav">
              <ul className="nav navbar-nav site-header__menu">
                <li className="nav-item">
                  <Link className="nav-link" href="/" onClick={() => setIsMobileMenuOpen(false)}>Trang Chủ</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/about" onClick={() => setIsMobileMenuOpen(false)}>Giới Thiệu</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/shop" onClick={() => setIsMobileMenuOpen(false)}>Sản Phẩm</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Liên Hệ</Link>
                </li>
              </ul>
            <div className="navbar align-self-center d-flex site-header__tools">
              <div className="d-lg-none flex-sm-fill mt-3 mb-4 col-7 col-sm-auto pr-3">
                <div className="input-group">
                  <input type="text" className="form-control" id="inputMobileSearch" placeholder="Tìm kiếm..." />
                  <div className="input-group-text">
                    <i className="fa fa-fw fa-search"></i>
                  </div>
                </div>
              </div>
              <a className="nav-icon d-none d-lg-inline" href="#" onClick={() => setIsSearchModalOpen(true)}>
                <i className="fa fa-fw fa-search text-dark mr-2"></i>
              </a>
              <Link 
                className="nav-icon position-relative text-decoration-none"
                href="/wishlist"
                style={{ cursor: 'pointer' }}
              >
                <i className="fa fa-fw fa-heart text-dark mr-1"></i>
                <span className="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-danger text-white">
                  {getWishlistCount()}
                </span>
              </Link>
              <button 
                className="nav-icon position-relative text-decoration-none border-0 bg-transparent"
                onClick={toggleCart}
                style={{ cursor: 'pointer' }}
              >
                <i className="fa fa-fw fa-cart-arrow-down text-dark mr-1"></i>
                <span className="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-success text-white">
                  {getTotalItems()}
                </span>
              </button>
              <a className="nav-icon position-relative text-decoration-none" href="#">
                <i className="fa fa-fw fa-heart text-dark mr-3"></i>
                <span className="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-light text-dark">5</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="modal fade bg-white show" id="templatemo_search" style={{ display: 'block' }} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-lg" role="document">
            <div className="w-100 pt-1 mb-5 text-right">
              <button type="button" className="btn-close" onClick={() => setIsSearchModalOpen(false)} aria-label="Close"></button>
            </div>
            <form action="" method="get" className="modal-content modal-body border-0 p-0">
              <div className="input-group mb-2">
                <input type="text" className="form-control" id="inputModalSearch" name="q" placeholder="Tìm kiếm đá cảnh, mỹ nghệ..." />
                <button type="submit" className="input-group-text bg-success text-light">
                  <i className="fa fa-fw fa-search text-white"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cart Popup */}
      <CartPopup
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </>
  )
} 