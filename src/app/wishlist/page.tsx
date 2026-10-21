'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    })
    
    // Show visual feedback
    setAddedItems(prev => new Set(prev).add(item.id))
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }, 2000)
  }

  const handleRemoveFromWishlist = (id: number) => {
    removeFromWishlist(id)
  }

  const handleClearWishlist = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm yêu thích?')) {
      clearWishlist()
    }
  }

  return (
    <>
      <Header />

      {/* Start Banner */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-8 m-auto">
              <h1 className="h1">Sản Phẩm Yêu Thích</h1>
              <p>
                Danh sách những sản phẩm đá cảnh và mỹ nghệ mà bạn đã thêm vào yêu thích.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* End Banner */}

      {/* Start Content */}
      <section className="py-5">
        <div className="container">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-heart fa-4x text-muted mb-4"></i>
              <h3 className="text-muted mb-3">Danh sách yêu thích trống</h3>
              <p className="text-muted mb-4">
                Bạn chưa có sản phẩm nào trong danh sách yêu thích.
              </p>
              <Link href="/shop" className="btn btn-success">
                <i className="fas fa-shopping-bag me-2"></i>
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Sản phẩm yêu thích ({wishlistItems.length})</h4>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClearWishlist}
                >
                  <i className="fas fa-trash me-2"></i>
                  Xóa tất cả
                </button>
              </div>
              
              <div className="row">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="col-12 col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 wishlist-card">
                      <div className="position-relative">
                        <Link href={`/shop-single/${item.id}`}>
                          <Image
                            src={item.image}
                            className="card-img-top"
                            alt={item.name}
                            width={300}
                            height={300}
                            style={{ objectFit: 'cover', height: '250px' }}
                          />
                        </Link>
                        <button
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          title="Xóa khỏi yêu thích"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">
                          <Link href={`/shop-single/${item.id}`} className="text-decoration-none text-dark">
                            {item.name}
                          </Link>
                        </h5>
                        <p className="card-text text-muted flex-grow-1">
                          {item.description}
                        </p>
                        <div className="mt-auto">
                          <p className="text-success fw-bold mb-3">{item.price}</p>
                          <div className="d-grid gap-2">
                            <button 
                              className={`btn ${addedItems.has(item.id) ? 'btn-outline-success' : 'btn-success'}`}
                              onClick={() => handleAddToCart(item)}
                              disabled={addedItems.has(item.id)}
                            >
                              {addedItems.has(item.id) ? (
                                <>
                                  <i className="fas fa-check me-2"></i>
                                  Đã thêm!
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-cart-plus me-2"></i>
                                  Thêm vào giỏ hàng
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      {/* End Content */}

      <Footer />
    </>
  )
}
