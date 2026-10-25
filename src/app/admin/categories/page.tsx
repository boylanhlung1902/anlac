'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { ConfirmDialog, Empty, Notice, Pager } from '@/components/admin/AdminBits'
import { adminFetch, PageInfo } from '@/lib/admin-client'

type CategoryRow = {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  _count: { products: number }
}

const blank = { name: '', slug: '', description: '', image: '' }

export default function CategoriesPage() {
  useAdminPage('Danh mục', [{ label: 'Danh mục' }])
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [page, setPage] = useState<PageInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(blank)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadNote, setUploadNote] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CategoryRow | null>(null)

  function load(nextPage = currentPage, nextSearch = search) {
    const params = new URLSearchParams({ page: String(nextPage), limit: '50', search: nextSearch })
    adminFetch<{ categories: CategoryRow[]; pagination: PageInfo }>(`/api/admin/categories?${params}`).then((result) => {
      if (!result.ok) setNotice({ type: 'err', text: result.message })
      else {
        setRows(result.data.categories)
        setPage(result.data.pagination)
      }
    })
  }

  useEffect(() => { load(currentPage, search) }, [currentPage])

  function openEdit(row: CategoryRow) {
    setCreating(false)
    setEditing(row)
    setUploadNote(null)
    setForm({ name: row.name, slug: row.slug, description: row.description || '', image: row.image || '' })
  }

  function closeForm() {
    setCreating(false)
    setEditing(null)
    setUploadNote(null)
  }

  async function uploadPhoto(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const body = new FormData()
    body.append('files', file)
    setUploading(true)
    setUploadNote(null)
    const response = await fetch('/api/admin/uploads', { method: 'POST', body, credentials: 'same-origin' })
    const payload = await response.json().catch(() => null)
    setUploading(false)
    const path = payload?.data?.paths?.[0]
    if (!response.ok || !payload?.success || typeof path !== 'string') {
      setUploadNote({ type: 'err', text: payload?.message || 'Không tải được ảnh.' })
      return
    }
    setForm((current) => ({ ...current, image: path }))
    setUploadNote({ type: 'ok', text: 'Đã tải ảnh. Bấm Lưu để ghi vào danh mục.' })
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    const result = await adminFetch(editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(form),
    })
    setBusy(false)
    setNotice(result.ok ? { type: 'ok', text: result.message || 'Đã lưu danh mục.' } : { type: 'err', text: result.message })
    if (result.ok) {
      setEditing(null)
      setCreating(false)
      load()
    }
  }

  async function toggle(row: CategoryRow) {
    const result = await adminFetch(`/api/admin/categories/${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !row.isActive }),
    })
    setNotice(result.ok ? { type: 'ok', text: row.isActive ? 'Đã ẩn danh mục trên cửa hàng.' : 'Đã hiện danh mục trên cửa hàng.' } : { type: 'err', text: result.message })
    if (result.ok) setRows((current) => current.map((item) => item.id === row.id ? { ...item, isActive: !item.isActive } : item))
  }

  async function remove() {
    if (!pendingDelete) return
    setBusy(true)
    const result = await adminFetch(`/api/admin/categories/${pendingDelete.id}`, { method: 'DELETE' })
    setBusy(false)
    setNotice(result.ok ? { type: 'ok', text: result.message || 'Đã xóa.' } : { type: 'err', text: result.message })
    setPendingDelete(null)
    if (result.ok) load()
  }

  return (
    <>
      <Notice notice={notice} />
      <p className="admin-note admin-note--info">Danh mục là một cấp, không có danh mục cha. Ẩn danh mục sẽ gỡ danh mục và sản phẩm của nó khỏi cửa hàng. Xóa chỉ được khi không còn sản phẩm.</p>
      <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setCurrentPage(1); load(1, search) }}>
        <label className="admin-field"><span>Tìm</span><input value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <button className="admin-btn" type="submit">Lọc</button>
        <button className="admin-btn" type="button" onClick={() => { setEditing(null); setCreating(true); setUploadNote(null); setForm(blank) }}>Tạo danh mục</button>
      </form>
      <div className="admin-table-wrap">
        {rows.length === 0 ? <Empty text="Chưa có danh mục." /> : (
          <table className="admin-table">
            <thead><tr><th>Tên</th><th>Đường dẫn</th><th>Sản phẩm</th><th>Hiển thị</th><th></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.slug}</td>
                  <td>{row._count.products}</td>
                  <td><span className={`admin-badge ${row.isActive ? 'admin-badge--on' : 'admin-badge--off'}`}>{row.isActive ? 'Đang hiện' : 'Đang ẩn'}</span></td>
                  <td>
                    <button className="admin-link" type="button" onClick={() => toggle(row)}>{row.isActive ? 'Ẩn' : 'Hiện'}</button>
                    <button className="admin-link" type="button" onClick={() => openEdit(row)}>Sửa</button>
                    <button className="admin-link" type="button" onClick={() => setPendingDelete(row)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {page ? <Pager page={page} onPage={setCurrentPage} /> : null}
      </div>
      {creating || editing ? (
        <div className="admin-dialog" role="dialog" aria-modal="true" aria-label="Danh mục">
          <button className="admin-dialog__backdrop" type="button" aria-label="Đóng" onClick={closeForm} />
          <form className="admin-dialog__card" onSubmit={save}>
            <h2>{editing ? 'Sửa danh mục' : 'Tạo danh mục'}</h2>
            <label className="admin-field admin-field--wide"><span>Tên</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label className="admin-field admin-field--wide"><span>Đường dẫn</span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
            <label className="admin-field admin-field--wide"><span>Mô tả</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <div className="admin-field admin-field--wide">
              <span>Ảnh</span>
              <div className="admin-photos">
                {form.image ? (
                  <figure className="admin-photo">
                    <img src={form.image} alt="" />
                    <figcaption>
                      <button type="button" className="admin-link" onClick={() => setForm({ ...form, image: '' })}>Xóa ảnh</button>
                    </figcaption>
                  </figure>
                ) : <p>Chưa có ảnh.</p>}
              </div>
              <label className="admin-btn admin-btn--ghost">
                {uploading ? 'Đang tải ảnh...' : 'Tải ảnh lên'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={uploading || busy}
                  onChange={(event) => {
                    const input = event.currentTarget
                    void uploadPhoto(input.files).finally(() => { input.value = '' })
                  }}
                />
              </label>
              {uploadNote ? <p className={`admin-note admin-note--${uploadNote.type === 'ok' ? 'ok' : 'err'}`}>{uploadNote.text}</p> : null}
            </div>
            <label className="admin-field admin-field--wide"><span>Đường dẫn ảnh</span><input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="/images/..." spellCheck={false} /></label>
            <div className="admin-dialog__actions">
              <button className="admin-btn admin-btn--ghost" type="button" onClick={closeForm}>Hủy</button>
              <button className="admin-btn" type="submit" disabled={busy || uploading}>{busy ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      ) : null}
      {pendingDelete ? (
        <ConfirmDialog
          title="Xóa danh mục"
          body={`Xóa “${pendingDelete.name}”? Chỉ xóa được khi danh mục không còn sản phẩm.`}
          confirmLabel={busy ? 'Đang xóa...' : 'Xóa'}
          busy={busy}
          onConfirm={remove}
          onClose={() => setPendingDelete(null)}
        />
      ) : null}
    </>
  )
}
