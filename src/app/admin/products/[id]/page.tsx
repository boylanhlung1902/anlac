'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { adminFetch } from '@/lib/admin-client'
import { formatWhen } from '@/lib/admin-labels'
import { formatPriceVND } from '@/services/api'

type ProductDetail = {
  id: number
  name: string
  description: string
  priceVND: number
  stock: number
  image: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  material: string | null
  origin: string | null
  dimensions: string | null
  weight: number | null
  slug: string
  createdAt: string
  category: { name: string } | null
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [error, setError] = useState('')
  useAdminPage(product?.name || 'Sản phẩm', [
    { label: 'Sản phẩm', href: '/admin/products' },
    { label: product?.name || 'Chi tiết' },
  ])

  useEffect(() => {
    adminFetch<ProductDetail>(`/api/admin/products/${params.id}`).then((result) => {
      if (!result.ok) setError(result.message)
      else setProduct(result.data)
    })
  }, [params.id])

  if (error) return <div className="admin-note admin-note--err" role="alert">{error}</div>
  if (!product) return <p>Đang tải sản phẩm...</p>

  return (
    <article className="admin-card">
      <div className="admin-actions" style={{ marginBottom: 16 }}>
        <Link className="admin-btn" href={`/admin/products/${product.id}/edit`}>Sửa</Link>
        <Link className="admin-btn admin-btn--ghost" href={`/shop-single/${product.id}`} target="_blank">Xem trên cửa hàng</Link>
      </div>
      <img src={product.image} alt="" style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 12 }} />
      <dl className="admin-dl" style={{ marginTop: 16 }}>
        <dt>Tên</dt><dd>{product.name}</dd>
        <dt>Danh mục</dt><dd>{product.category?.name || '—'}</dd>
        <dt>Giá</dt><dd>{formatPriceVND(product.priceVND)}</dd>
        <dt>Tồn kho</dt><dd>{product.stock}</dd>
        <dt>Trạng thái</dt><dd>{product.isActive ? 'Đang bán' : 'Ngừng bán'}{product.isFeatured ? ' · Nổi bật' : ''}</dd>
        <dt>Chất liệu</dt><dd>{product.material || '—'}</dd>
        <dt>Xuất xứ</dt><dd>{product.origin || '—'}</dd>
        <dt>Kích thước</dt><dd>{product.dimensions || '—'}</dd>
        <dt>Khối lượng</dt><dd>{product.weight == null ? '—' : `${product.weight} kg`}</dd>
        <dt>Đường dẫn</dt><dd>{product.slug}</dd>
        <dt>Tạo lúc</dt><dd>{formatWhen(product.createdAt)}</dd>
        <dt>Mô tả</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{product.description}</dd>
      </dl>
    </article>
  )
}
