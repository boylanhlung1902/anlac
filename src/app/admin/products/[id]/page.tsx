'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import ProductEditor from '@/components/admin/ProductEditor'

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) return <p>Mã sản phẩm không hợp lệ.</p>
  return (
    <>
      <div className="admin-actions" style={{ marginBottom: 14 }}>
        <Link className="admin-btn admin-btn--ghost" href={`/shop-single/${id}`} target="_blank">Xem trên cửa hàng</Link>
      </div>
      <ProductEditor productId={id} heading="Chi tiết sản phẩm" />
    </>
  )
}
