'use client'

import { useParams } from 'next/navigation'
import ProductEditor from '@/components/admin/ProductEditor'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) return <p>Mã sản phẩm không hợp lệ.</p>
  return <ProductEditor productId={id} />
}
