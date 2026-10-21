'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
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

  // Sync from URL (back/forward, homepage category links)
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

  // Reset to page 1 when filters change from URL/user
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

  // Debounce text search → update filters + URL
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
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-success" onClick={loadData}>
          Thử Lại
        </button>
      </div>
    )
  }

  return (
    <>
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-8 m-auto">
              <h1 className="h1">Sản Phẩm Đá Cảnh & Mỹ Nghệ</h1>
              <p>
                Khám phá bộ sưu tập đá cảnh và mỹ nghệ độc đáo, được chế tác tinh xảo và mang ý nghĩa
                phong thủy sâu sắc cho không gian của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 mt-3">
              <div className="card shop-sidebar">
                <article className="card-group-item">
                  <header className="card-header">
                    <h6 className="title mb-0">Danh Mục</h6>
                  </header>
                  <div className="filter-content">
                    <div className="card-body shop-category-list">
                      <label className="form-check shop-category-item">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="category"
                          value=""
                          checked={filters.category === ''}
                          onChange={() => handleCategoryChange('')}
                        />
                        <span className="form-check-label">Tất Cả</span>
                      </label>
                      {categories.map((category) => (
                        <label key={category.id} className="form-check shop-category-item">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="category"
                            value={category.slug}
                            checked={filters.category === category.slug}
                            onChange={() => handleCategoryChange(category.slug)}
                          />
                          <span className="form-check-label">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </article>
                <article className="card-group-item">
                  <header className="card-header">
                    <h6 className="title mb-0">Sắp Xếp</h6>
                  </header>
                  <div className="filter-content">
                    <div className="card-body">
                      <select
                        className="form-select"
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => handleSortChange(e.target.value)}
                      >
                        <option value="createdAt-desc">Mới Nhất</option>
                        <option value="priceVND-asc">Giá Tăng Dần</option>
                        <option value="priceVND-desc">Giá Giảm Dần</option>
                        <option value="name-asc">Tên A-Z</option>
                        <option value="name-desc">Tên Z-A</option>
                        <option value="rating-desc">Đánh Giá Cao Nhất</option>
                      </select>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div className="col-lg-9">
              <header className="d-sm-flex align-items-center border-bottom pb-3 mb-3 gap-3 flex-wrap">
                <form className="d-flex align-items-center flex-grow-1" onSubmit={handleSearchSubmit}>
                  <input
                    type="search"
                    placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
                    className="form-control"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-success ms-2 shop-search-btn" aria-label="Tìm kiếm">
                    <i className="fa fa-search"></i>
                  </button>
                </form>
                <div className="ms-sm-auto text-muted small">
                  {loading ? 'Đang lọc...' : `${products.length} sản phẩm`}
                  {filters.category ? ` · ${activeCategoryName}` : ''}
                  {filters.search ? ` · “${filters.search}”` : ''}
                </div>
              </header>

              <div className={`shop-product-grid ${loading ? 'is-loading' : ''}`}>
                {products.length === 0 ? (
                  <div className="text-center py-5 w-100">
                    <i className="fas fa-search fa-2x text-muted mb-3"></i>
                    <p className="text-muted mb-3">Không tìm thấy sản phẩm phù hợp.</p>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => {
                        setSearchInput('')
                        handleCategoryChange('')
                        setFilters((prev) => ({ ...prev, search: '', category: '' }))
                        syncUrl({ category: '', search: '' })
                      }}
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <div className="row">
                    {products.map((product) => (
                      <div key={product.id} className="col-lg-4 col-md-6 col-sm-6 d-flex">
                        <div className="card w-100 my-2 shop-product-card">
                          <Link href={`/shop-single/${product.id}`} className="shop-product-card__media">
                            <Image
                              src={product.image}
                              className="card-img-top"
                              alt={product.name}
                              width={300}
                              height={300}
                            />
                          </Link>
                          <div className="card-body d-flex flex-column">
                            <Link
                              href={`/shop-single/${product.id}`}
                              className="shop-product-card__title"
                            >
                              <h5 className="card-title">{product.name}</h5>
                            </Link>
                            <p className="card-text text-success mb-1">
                              {formatPriceVND(product.priceVND)}
                            </p>
                            <div className="d-flex align-items-center mb-3">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fa fa-star ${
                                    i < Math.floor(product.rating) ? 'text-warning' : 'text-muted'
                                  }`}
                                ></i>
                              ))}
                              <small className="text-muted ms-2">({product.reviewCount})</small>
                            </div>

                            <div className="shop-product-actions mt-auto">
                              <Link
                                href={`/shop-single/${product.id}`}
                                className="shop-action-btn shop-action-btn--view"
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                                <span>Chi tiết</span>
                              </Link>
                              <button
                                type="button"
                                className={`shop-action-btn shop-action-btn--cart ${
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
                                ></i>
                                <span>{addedItems.has(product.id) ? 'Đã thêm' : 'Giỏ hàng'}</span>
                              </button>
                              <button
                                type="button"
                                className={`shop-action-btn shop-action-btn--wish ${
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
                                  isInWishlist(product.id)
                                    ? 'Xóa khỏi yêu thích'
                                    : 'Thêm vào yêu thích'
                                }
                              >
                                <i className="fas fa-heart"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pagination.totalPages > 1 && (
                <div className="row mt-3">
                  <div className="col-12">
                    <nav aria-label="Page navigation">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrev}
                          >
                            Trước
                          </button>
                        </li>
                        {[...Array(pagination.totalPages)].map((_, i) => (
                          <li
                            key={i}
                            className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}
                          >
                            <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={!pagination.hasNext}
                          >
                            Sau
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
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
    <>
      <Header />
      <Suspense
        fallback={
          <div className="container py-5 text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      >
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  )
}
