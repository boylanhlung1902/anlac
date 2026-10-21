'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { productAPI, categoryAPI, Product, Category, formatPriceVND } from '@/services/api'

function ShopContent() {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('q') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })
  const requestIdRef = useRef(0)

  const syncUrl = useCallback(
    (next: { category?: string; search?: string; sortBy?: string; sortOrder?: string }) => {
      const params = new URLSearchParams()
      const category = next.category ?? filters.category
      const search = next.search ?? filters.search
      const sortBy = next.sortBy ?? filters.sortBy
      const sortOrder = next.sortOrder ?? filters.sortOrder

      if (category) params.set('category', category)
      if (search) params.set('q', search)
      if (sortBy && sortBy !== 'createdAt') params.set('sortBy', sortBy)
      if (sortOrder && sortOrder !== 'desc') params.set('sortOrder', sortOrder)

      const query = params.toString()
      router.replace(query ? `/shop?${query}` : '/shop', { scroll: false })
    },
    [filters, router]
  )

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || ''
    const searchFromUrl = searchParams.get('q') || ''
    const sortByFromUrl = searchParams.get('sortBy') || 'createdAt'
    const sortOrderFromUrl = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    setSearchInput(searchFromUrl)
    setFilters((prev) => {
      if (
        prev.category === categoryFromUrl &&
        prev.search === searchFromUrl &&
        prev.sortBy === sortByFromUrl &&
        prev.sortOrder === sortOrderFromUrl
      ) {
        return prev
      }
      return {
        category: categoryFromUrl,
        search: searchFromUrl,
        sortBy: sortByFromUrl,
        sortOrder: sortOrderFromUrl,
      }
    })
  }, [searchParams])

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }))
  }, [filters.category, filters.search, filters.sortBy, filters.sortOrder])

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current
    try {
      setLoading(true)
      setError(null)

      const [productsResponse, categoriesResponse] = await Promise.all([
        productAPI.getProducts({
          page: pagination.page,
          limit: 12,
          category: filters.category || undefined,
          search: filters.search || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }),
        categoryAPI.getCategories(),
      ])

      if (requestId !== requestIdRef.current) return

      setProducts(productsResponse.products)
      setCategories(categoriesResponse)
      setPagination({
        page: productsResponse.pagination.page,
        totalPages: productsResponse.pagination.totalPages,
        hasNext: productsResponse.pagination.hasNext,
        hasPrev: productsResponse.pagination.hasPrev,
      })
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError('Không thể tải dữ liệu sản phẩm')
      console.error('Error loading data:', err)
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
        setInitialLoading(false)
      }
    }
  }, [filters, pagination.page])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = searchInput.trim()
      if (nextSearch === filters.search) return
      setFilters((prev) => ({ ...prev, search: nextSearch }))
      setPagination((prev) => ({ ...prev, page: 1 }))
      syncUrl({ search: nextSearch })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.search, syncUrl])

  const handleCategoryChange = (slug: string) => {
    setFilters((prev) => ({ ...prev, category: slug }))
    setPagination((prev) => ({ ...prev, page: 1 }))
    syncUrl({ category: slug })
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-')
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
    syncUrl({ sortBy, sortOrder })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextSearch = searchInput.trim()
    setFilters((prev) => ({ ...prev, search: nextSearch }))
    setPagination((prev) => ({ ...prev, page: 1 }))
    syncUrl({ search: nextSearch })
  }

  const clearFilters = () => {
    setSearchInput('')
    setFilters((prev) => ({ ...prev, search: '', category: '' }))
    setPagination((prev) => ({ ...prev, page: 1 }))
    syncUrl({ category: '', search: '' })
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: formatPriceVND(product.priceVND),
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

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const activeCategoryName =
    categories.find((c) => c.slug === filters.category)?.name || 'Tất cả danh mục'

  if (initialLoading) {
    return (
      <div className="shop-taste__state">
        <div className="shop-taste__skeleton-grid" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shop-taste__skeleton-card" />
          ))}
        </div>
        <p className="shop-taste__state-text">Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="shop-taste__state">
        <div className="shop-taste__alert shop-taste__alert--err" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <span>{error}</span>
        </div>
        <button type="button" className="btn btn-success taste-btn" onClick={loadData}>
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <>
      <section className="shop-taste__hero">
        <div className="shop-taste__hero-veil" aria-hidden="true" />
        <div className="container">
          <Reveal className="shop-taste__hero-copy">
            <p className="taste-kicker">An Lạc Stone</p>
            <h1 className="shop-taste__title">Cửa hàng</h1>
            <p className="shop-taste__lead">
              Đá cảnh và mỹ nghệ chế tác tinh xảo cho không gian của bạn.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shop-taste__main">
        <div className="container">
          <div className="shop-taste__layout">
            <Reveal className="shop-taste__filters">
              <aside className="shop-taste__panel">
                <div className="shop-taste__panel-block">
                  <h2 className="shop-taste__panel-title">Danh mục</h2>
                  <div className="shop-taste__chips" role="radiogroup" aria-label="Danh mục sản phẩm">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={filters.category === ''}
                      className={`shop-taste__chip ${filters.category === '' ? 'is-active' : ''}`}
                      onClick={() => handleCategoryChange('')}
                    >
                      Tất cả
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        role="radio"
                        aria-checked={filters.category === category.slug}
                        className={`shop-taste__chip ${
                          filters.category === category.slug ? 'is-active' : ''
                        }`}
                        onClick={() => handleCategoryChange(category.slug)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="shop-taste__panel-block">
                  <label className="shop-taste__panel-title" htmlFor="shop-sort">
                    Sắp xếp
                  </label>
                  <select
                    id="shop-sort"
                    className="form-select shop-taste__select"
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="createdAt-desc">Mới nhất</option>
                    <option value="priceVND-asc">Giá tăng dần</option>
                    <option value="priceVND-desc">Giá giảm dần</option>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                    <option value="rating-desc">Đánh giá cao nhất</option>
                  </select>
                </div>
              </aside>
            </Reveal>

            <div className="shop-taste__content">
              <Reveal>
                <header className="shop-taste__toolbar">
                  <form className="shop-taste__search" onSubmit={handleSearchSubmit}>
                    <label className="visually-hidden" htmlFor="shop-search">
                      Tìm sản phẩm
                    </label>
                    <input
                      id="shop-search"
                      type="search"
                      placeholder="Tìm theo tên hoặc danh mục..."
                      className="form-control shop-taste__search-input"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-success shop-taste__search-btn" aria-label="Tìm kiếm">
                      <i className="fa fa-search" aria-hidden="true" />
                    </button>
                  </form>
                  <p className="shop-taste__meta">
                    {loading ? 'Đang lọc...' : `${products.length} sản phẩm`}
                    {filters.category ? ` · ${activeCategoryName}` : ''}
                    {filters.search ? ` · “${filters.search}”` : ''}
                  </p>
                </header>
              </Reveal>

              <div className={`shop-taste__grid-wrap ${loading ? 'is-loading' : ''}`}>
                {products.length === 0 ? (
                  <div className="shop-taste__empty">
                    <i className="fas fa-search" aria-hidden="true" />
                    <p>Không tìm thấy sản phẩm phù hợp.</p>
                    <button type="button" className="btn btn-outline-success taste-btn" onClick={clearFilters}>
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <div className="shop-taste__grid">
                    {products.map((product, index) => (
                      <Reveal key={product.id} delayMs={(index % 6) * 40} className="shop-taste__cell">
                        <article className="shop-taste__card">
                          <Link href={`/shop-single/${product.id}`} className="shop-taste__media">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
                              className="shop-taste__img"
                            />
                          </Link>
                          <div className="shop-taste__body">
                            <Link href={`/shop-single/${product.id}`} className="shop-taste__name">
                              {product.name}
                            </Link>
                            <p className="shop-taste__price">{formatPriceVND(product.priceVND)}</p>
                            <div className="shop-taste__rating" aria-label={`Đánh giá ${product.rating} trên 5`}>
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fa fa-star ${
                                    i < Math.floor(product.rating) ? 'is-on' : 'is-off'
                                  }`}
                                  aria-hidden="true"
                                />
                              ))}
                              <span>({product.reviewCount})</span>
                            </div>
                            <div className="shop-taste__actions">
                              <Link
                                href={`/shop-single/${product.id}`}
                                className="shop-taste__action shop-taste__action--view"
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye" aria-hidden="true" />
                                <span>Chi tiết</span>
                              </Link>
                              <button
                                type="button"
                                className={`shop-taste__action shop-taste__action--cart ${
                                  addedItems.has(product.id) ? 'is-added' : ''
                                }`}
                                onClick={() => handleAddToCart(product)}
                                disabled={addedItems.has(product.id)}
                                title={addedItems.has(product.id) ? 'Đã thêm' : 'Thêm vào giỏ'}
                              >
                                <i
                                  className={`fas ${
                                    addedItems.has(product.id) ? 'fa-check' : 'fa-cart-plus'
                                  }`}
                                  aria-hidden="true"
                                />
                                <span>{addedItems.has(product.id) ? 'Đã thêm' : 'Giỏ hàng'}</span>
                              </button>
                              <button
                                type="button"
                                className={`shop-taste__action shop-taste__action--wish ${
                                  isInWishlist(product.id) ? 'is-active' : ''
                                }`}
                                onClick={() => {
                                  if (isInWishlist(product.id)) {
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
                                title={
                                  isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'
                                }
                                aria-label={
                                  isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'
                                }
                              >
                                <i className="fas fa-heart" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </article>
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>

              {pagination.totalPages > 1 && (
                <nav className="shop-taste__pager" aria-label="Phân trang sản phẩm">
                  <button
                    type="button"
                    className="shop-taste__page-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Trước
                  </button>
                  <div className="shop-taste__page-list">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`shop-taste__page-btn ${
                          pagination.page === i + 1 ? 'is-active' : ''
                        }`}
                        onClick={() => handlePageChange(i + 1)}
                        aria-current={pagination.page === i + 1 ? 'page' : undefined}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="shop-taste__page-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Sau
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function Shop() {
  return (
    <div className="shop-taste">
      <Header />
      <Suspense
        fallback={
          <div className="shop-taste__state">
            <div className="shop-taste__skeleton-grid" aria-hidden="true">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shop-taste__skeleton-card" />
              ))}
            </div>
            <p className="shop-taste__state-text">Đang tải...</p>
          </div>
        }
      >
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  )
}
