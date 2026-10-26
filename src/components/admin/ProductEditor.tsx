'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminFetch } from '@/lib/admin-client'
import { markCatalogUpdated } from '@/lib/catalog-sync'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { Notice } from '@/components/admin/AdminBits'
import { DEFAULT_CRAFT, DEFAULT_HIGHLIGHTS, DEFAULT_WARRANTY } from '@/lib/product-detail'

type CategoryOption = { id: number; name: string }
type ProductDetail = {
  id: number
  name: string
  description: string
  categoryId: number
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
  craft: string | null
  warranty: string | null
  highlights: string[]
  slug: string
}

const empty = {
  name: '',
  description: '',
  categoryId: '',
  priceVND: '0',
  stock: '0',
  image: '',
  images: '',
  isActive: true,
  isFeatured: false,
  material: '',
  origin: '',
  dimensions: '',
  weight: '',
  craft: '',
  warranty: '',
  highlights: '',
  slug: '',
}

export default function ProductEditor({ productId, heading }: { productId?: number; heading?: string }) {
  const router = useRouter()
  const editing = Number.isInteger(productId)
  useAdminPage(heading || (editing ? 'Sửa sản phẩm' : 'Tạo sản phẩm'), [
    { label: 'Sản phẩm', href: '/admin/products' },
    { label: heading || (editing ? 'Sửa' : 'Tạo') },
  ])
  const [form, setForm] = useState(empty)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(editing)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const photoList = [form.image, ...form.images.split(/\r?\n/)].map((item) => item.trim()).filter((item, index, all) => item && all.indexOf(item) === index)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const categoryResult = await adminFetch<{ categories: CategoryOption[] }>('/api/admin/categories?limit=100')
      if (!cancelled && categoryResult.ok) setCategories(categoryResult.data.categories)
      if (!editing || !productId) {
        if (!cancelled) setLoading(false)
        return
      }
      const productResult = await adminFetch<ProductDetail>(`/api/admin/products/${productId}`)
      if (cancelled) return
      if (!productResult.ok) {
        setNotice({ type: 'err', text: productResult.message })
        setLoading(false)
        return
      }
      const product = productResult.data
      setForm({
        name: product.name,
        description: product.description,
        categoryId: String(product.categoryId),
        priceVND: String(product.priceVND),
        stock: String(product.stock),
        image: product.image,
        images: product.images.filter((image) => image !== product.image).join('\n'),
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        material: product.material || '',
        origin: product.origin || '',
        dimensions: product.dimensions || '',
        weight: product.weight == null ? '' : String(product.weight),
        craft: product.craft || '',
        warranty: product.warranty || '',
        highlights: Array.isArray(product.highlights) ? product.highlights.join('\n') : '',
        slug: product.slug,
      })
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [editing, productId])

  function update(field: keyof typeof empty, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function removePhoto(photo: string) {
    const rest = photoList.filter((item) => item !== photo)
    setForm((current) => ({
      ...current,
      image: current.image === photo ? rest[0] || '' : current.image,
      images: rest.filter((item) => item !== (current.image === photo ? rest[0] : current.image)).join('\n'),
    }))
  }

  function makeMain(photo: string) {
    setForm((current) => ({
      ...current,
      image: photo,
      images: photoList.filter((item) => item !== photo).join('\n'),
    }))
  }

  async function uploadPhotos(files: FileList | null) {
    if (!files || files.length === 0) return
    const body = new FormData()
    Array.from(files).slice(0, 8).forEach((file) => body.append('files', file))
    setUploading(true)
    setNotice(null)
    const response = await fetch('/api/admin/uploads', { method: 'POST', body, credentials: 'same-origin' })
    const payload = await response.json().catch(() => null)
    setUploading(false)
    if (!response.ok || !payload?.success || !Array.isArray(payload.data?.paths)) {
      setNotice({ type: 'err', text: payload?.message || 'Không tải được ảnh.' })
      return
    }
    const paths = payload.data.paths as string[]
    setForm((current) => {
      const main = current.image || paths[0] || ''
      const extras = [...current.images.split(/\r?\n/), ...paths]
        .map((item) => item.trim())
        .filter((item, index, all) => item && item !== main && all.indexOf(item) === index)
      return { ...current, image: main, images: extras.join('\n') }
    })
    setNotice({ type: 'ok', text: 'Đã thêm ảnh. Bấm Lưu sản phẩm để ghi vào cửa hàng.' })
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    const payload = { ...form, categoryId: Number(form.categoryId), priceVND: Number(form.priceVND), stock: Number(form.stock) }
    const result = await adminFetch<ProductDetail>(editing ? `/api/admin/products/${productId}` : '/api/admin/products', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    })
    setBusy(false)
    if (!result.ok) {
      setNotice({ type: 'err', text: result.message })
      return
    }
    markCatalogUpdated()
    if (!editing) {
      router.replace(`/admin/products/${result.data.id}/edit`)
      return
    }
    const savedImages = Array.isArray(result.data.images) ? result.data.images : []
    setForm({
      name: result.data.name,
      description: result.data.description,
      categoryId: String(result.data.categoryId),
      priceVND: String(result.data.priceVND),
      stock: String(result.data.stock),
      image: result.data.image,
      images: savedImages.filter((image) => image !== result.data.image).join('\n'),
      isActive: result.data.isActive,
      isFeatured: result.data.isFeatured,
      material: result.data.material || '',
      origin: result.data.origin || '',
      dimensions: result.data.dimensions || '',
      weight: result.data.weight == null ? '' : String(result.data.weight),
      craft: result.data.craft || '',
      warranty: result.data.warranty || '',
      highlights: Array.isArray(result.data.highlights) ? result.data.highlights.join('\n') : '',
      slug: result.data.slug,
    })
    setNotice({ type: 'ok', text: result.message || 'Đã lưu sản phẩm.' })
  }

  if (loading) return <p>Đang tải sản phẩm...</p>

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <Notice notice={notice} />
      <p className="admin-note admin-note--info">Tên sản phẩm là tiêu đề trên danh sách và trang chi tiết. Tên danh mục chỉ hiện ở dòng nhỏ phía trên, ví dụ “Tượng chú tiểu nằm”. Giá 0 hiển thị “Liên hệ để báo giá”.</p>
      <h2>Tiêu đề trang chi tiết</h2>
      <div className="admin-form__row">
        <label className="admin-field"><span>Tên sản phẩm</span><input value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
        <label className="admin-field"><span>Đường dẫn</span><input value={form.slug} onChange={(event) => update('slug', event.target.value)} placeholder="để trống sẽ tạo từ tên" /></label>
      </div>
      <label className="admin-field admin-field--wide"><span>Mô tả</span><textarea value={form.description} onChange={(event) => update('description', event.target.value)} required /></label>
      <div className="admin-form__row">
        <label className="admin-field">
          <span>Danh mục</span>
          <select value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)} required>
            <option value="">Chọn danh mục</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="admin-field"><span>Giá VNĐ</span><input inputMode="numeric" value={form.priceVND} onChange={(event) => update('priceVND', event.target.value)} required /></label>
        <label className="admin-field"><span>Tồn kho</span><input inputMode="numeric" value={form.stock} onChange={(event) => update('stock', event.target.value)} required /></label>
      </div>
      <h2>Ảnh trên trang chi tiết</h2>
      <div className="admin-field admin-field--wide">
        <span>Ảnh sản phẩm</span>
        <div className="admin-photos">
          {photoList.length === 0 ? <p>Chưa có ảnh.</p> : photoList.map((photo) => (
            <figure key={photo} className="admin-photo">
              <img src={photo} alt="" />
              <figcaption>
                {photo === form.image ? <strong>Ảnh chính</strong> : <button type="button" className="admin-link" onClick={() => makeMain(photo)}>Đặt làm ảnh chính</button>}
                <button type="button" className="admin-link" onClick={() => removePhoto(photo)}>Xóa ảnh</button>
              </figcaption>
            </figure>
          ))}
        </div>
        <label className="admin-btn admin-btn--ghost">
          {uploading ? 'Đang tải ảnh...' : 'Bổ sung ảnh'}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={uploading} onChange={(event) => uploadPhotos(event.target.files)} />
        </label>
      </div>
      <label className="admin-field admin-field--wide"><span>Đường dẫn ảnh chính</span><input value={form.image} onChange={(event) => update('image', event.target.value)} placeholder="/images/..." required /></label>
      <label className="admin-field admin-field--wide"><span>Ảnh thêm, mỗi dòng một đường dẫn</span><textarea value={form.images} onChange={(event) => update('images', event.target.value)} /></label>
      <h2>Thông số</h2>
      <div className="admin-form__row">
        <label className="admin-field"><span>Chất liệu</span><input value={form.material} onChange={(event) => update('material', event.target.value)} placeholder="Đá tự nhiên cao cấp" /></label>
        <label className="admin-field"><span>Xuất xứ</span><input value={form.origin} onChange={(event) => update('origin', event.target.value)} placeholder="Việt Nam" /></label>
        <label className="admin-field"><span>Kích thước</span><input value={form.dimensions} onChange={(event) => update('dimensions', event.target.value)} /></label>
        <label className="admin-field"><span>Khối lượng (kg)</span><input value={form.weight} onChange={(event) => update('weight', event.target.value)} /></label>
      </div>
      <h2>Đặc điểm</h2>
      <div className="admin-form__row">
        <label className="admin-field"><span>Chế tác</span><input value={form.craft} onChange={(event) => update('craft', event.target.value)} placeholder={DEFAULT_CRAFT} /></label>
        <label className="admin-field"><span>Bảo hành</span><input value={form.warranty} onChange={(event) => update('warranty', event.target.value)} placeholder={DEFAULT_WARRANTY} /></label>
      </div>
      <h2>Phù hợp không gian</h2>
      <label className="admin-field admin-field--wide">
        <span>Mỗi dòng một ý. Để trống sẽ dùng nội dung mặc định.</span>
        <textarea value={form.highlights} onChange={(event) => update('highlights', event.target.value)} placeholder={DEFAULT_HIGHLIGHTS.join('\n')} />
      </label>
      <div className="admin-form__row">
        <label className="admin-check"><input type="checkbox" checked={form.isActive} onChange={(event) => update('isActive', event.target.checked)} /> Đang bán</label>
        <label className="admin-check"><input type="checkbox" checked={form.isFeatured} onChange={(event) => update('isFeatured', event.target.checked)} /> Nổi bật</label>
      </div>
      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu sản phẩm'}</button>
        <button className="admin-btn admin-btn--ghost" type="button" onClick={() => router.push('/admin/products')}>Quay lại</button>
      </div>
    </form>
  )
}
