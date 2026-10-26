'use client'

import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { ConfirmDialog, Empty, Notice, Pager } from '@/components/admin/AdminBits'
import { adminFetch, PageInfo } from '@/lib/admin-client'
import { formatWhen } from '@/lib/admin-labels'
import { markCatalogUpdated, watchCatalog } from '@/lib/catalog-sync'
import { formatPriceVND } from '@/services/api'

type Row = {
  id: number
  name: string
  image: string
  priceVND: number
  stock: number
  isActive: boolean
  createdAt: string
  category: { name: string } | null
}
type CategoryOption = { id: number; name: string }

export default function ProductsPage() {
  useAdminPage('Sản phẩm', [{ label: 'Sản phẩm' }])
  const [rows, setRows] = useState<Row[]>([])
  const [page, setPage] = useState<PageInfo | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminFetch<{ categories: CategoryOption[] }>('/api/admin/categories?limit=100').then((result) => {
      if (result.ok) setCategories(result.data.categories)
    })
  }, [])

  const requestRef = useRef(0)
  const load = useCallback((silent = false) => {
    const params = new URLSearchParams({
      page: String(currentPage),
      sort,
      order,
      search,
      categoryId,
      status: status === 'low' ? 'all' : status,
    })
    if (status === 'low') params.set('lowStock', '1')
    const requestId = ++requestRef.current
    if (!silent) setLoading(true)
    adminFetch<{ products: Row[]; pagination: PageInfo }>(`/api/admin/products?${params}`).then((result) => {
      if (requestId !== requestRef.current) return
      setLoading(false)
      if (!result.ok) {
        setNotice({ type: 'err', text: result.message })
        return
      }
      setRows(result.data.products)
      setPage(result.data.pagination)
    })
  }, [currentPage, sort, order, status, search, categoryId])

  useEffect(() => { load() }, [load])

  const loadRef = useRef(load)
  loadRef.current = load
  useEffect(() => watchCatalog(() => loadRef.current(true)), [])

  function onFilter(event: FormEvent) {
    event.preventDefault()
    setCurrentPage(1)
  }

  async function saveStock(row: Row, value: string) {
    const stock = Number(value)
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
      setNotice({ type: 'err', text: 'Tồn kho phải là số nguyên từ 0 đến 100000.' })
      return
    }
    if (stock === row.stock) return
    const result = await adminFetch(`/api/admin/products/${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    })
    setNotice(result.ok ? { type: 'ok', text: 'Đã cập nhật tồn kho.' } : { type: 'err', text: result.message })
    if (result.ok) {
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, stock } : item))
      markCatalogUpdated()
    }
  }

  async function toggle(row: Row) {
    const result = await adminFetch(`/api/admin/products/${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !row.isActive }),
    })
    setNotice(result.ok ? { type: 'ok', text: result.message || 'Đã cập nhật.' } : { type: 'err', text: result.message })
    if (result.ok) {
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, isActive: !item.isActive } : item))
      markCatalogUpdated()
    }
  }

  async function remove() {
    if (!pendingDelete) return
    setBusy(true)
    const result = await adminFetch(`/api/admin/products/${pendingDelete.id}`, { method: 'DELETE' })
    setBusy(false)
    setNotice(result.ok ? { type: 'ok', text: result.message || 'Đã xóa.' } : { type: 'err', text: result.message })
    if (result.ok) {
      setRows((current) => current.filter((item) => item.id !== pendingDelete.id))
      markCatalogUpdated()
    }
    setPendingDelete(null)
  }

  return (
    <>
      <Notice notice={notice} />
      <form className="admin-toolbar" onSubmit={onFilter}>
        <label className="admin-field"><span>Tìm</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, đường dẫn, chất liệu" /></label>
        <label className="admin-field"><span>Danh mục</span>
          <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setCurrentPage(1) }}>
            <option value="">Tất cả</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="admin-field"><span>Trạng thái</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setCurrentPage(1) }}>
            <option value="all">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
            <option value="low">Sắp hết hàng</option>
          </select>
        </label>
        <label className="admin-field"><span>Sắp xếp</span>
          <select value={`${sort}:${order}`} onChange={(event) => {
            const [nextSort, nextOrder] = event.target.value.split(':')
            setSort(nextSort)
            setOrder(nextOrder)
            setCurrentPage(1)
          }}>
            <option value="createdAt:desc">Mới nhất</option>
            <option value="createdAt:asc">Cũ nhất</option>
            <option value="name:asc">Tên A-Z</option>
            <option value="priceVND:desc">Giá cao</option>
            <option value="priceVND:asc">Giá thấp</option>
            <option value="stock:asc">Tồn kho thấp</option>
          </select>
        </label>
        <button className="admin-btn" type="submit">Lọc</button>
        <Link className="admin-btn" href="/admin/products/create">Tạo sản phẩm</Link>
      </form>
      <div className="admin-table-wrap">
        {loading ? <p style={{ padding: 16 }}>Đang tải...</p> : rows.length === 0 ? <Empty text="Không có sản phẩm phù hợp." /> : (
          <table className="admin-table">
            <thead>
              <tr><th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Tạo lúc</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><img className="admin-thumb" src={row.image} alt="" /></td>
                  <td>{row.name}</td>
                  <td>{row.category?.name || '—'}</td>
                  <td>{formatPriceVND(row.priceVND)}</td>
                  <td>
                    <input
                      key={`${row.id}-${row.stock}`}
                      style={{ width: 88 }}
                      inputMode="numeric"
                      defaultValue={row.stock}
                      aria-label={`Tồn kho ${row.name}`}
                      onBlur={(event) => saveStock(row, event.target.value)}
                    />
                  </td>
                  <td><span className={`admin-badge ${row.isActive ? 'admin-badge--on' : 'admin-badge--off'}`}>{row.isActive ? 'Đang bán' : 'Ngừng bán'}</span></td>
                  <td>{formatWhen(row.createdAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link className="admin-chip" href={`/admin/products/${row.id}`}>Xem</Link>
                      <Link className="admin-chip" href={`/admin/products/${row.id}/edit`}>Sửa</Link>
                      <button className="admin-chip" type="button" onClick={() => toggle(row)}>{row.isActive ? 'Ngừng bán' : 'Mở bán'}</button>
                      <button className="admin-chip admin-chip--danger" type="button" onClick={() => setPendingDelete(row)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {page ? <Pager page={page} onPage={setCurrentPage} /> : null}
      </div>
      {pendingDelete ? (
        <ConfirmDialog
          title="Xóa sản phẩm"
          body={`Xóa “${pendingDelete.name}”? Sản phẩm đã nằm trong đơn hàng sẽ không xóa được.`}
          confirmLabel={busy ? 'Đang xóa...' : 'Xóa'}
          busy={busy}
          onConfirm={remove}
          onClose={() => setPendingDelete(null)}
        />
      ) : null}
    </>
  )
}
