'use client'

import { useEffect, useState } from 'react'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { ConfirmDialog, Empty, Notice, Pager } from '@/components/admin/AdminBits'
import { adminFetch, PageInfo } from '@/lib/admin-client'
import { formatWhen } from '@/lib/admin-labels'

type UserRow = {
  id: number
  username: string | null
  name: string | null
  email: string
  phone: string | null
  role: 'ADMIN' | 'CUSTOMER'
  isActive: boolean
  createdAt: string
  _count: { orders: number }
}

type Pending = { user: UserRow; role?: 'ADMIN' | 'CUSTOMER'; isActive?: boolean; label: string }

export default function UsersPage() {
  useAdminPage('Tài khoản', [{ label: 'Tài khoản' }])
  const [rows, setRows] = useState<UserRow[]>([])
  const [page, setPage] = useState<PageInfo | null>(null)
  const [actorId, setActorId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const [role, setRole] = useState('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)

  function load() {
    const params = new URLSearchParams({ page: String(currentPage), search: applied, role })
    adminFetch<{ users: UserRow[]; pagination: PageInfo; actorId: number }>(`/api/admin/users?${params}`).then((result) => {
      if (!result.ok) setNotice({ type: 'err', text: result.message })
      else {
        setRows(result.data.users)
        setPage(result.data.pagination)
        setActorId(result.data.actorId)
      }
    })
  }

  useEffect(() => { load() }, [currentPage, applied, role])

  async function apply() {
    if (!pending) return
    setBusy(true)
    const result = await adminFetch(`/api/admin/users/${pending.user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(pending.role ? { role: pending.role } : {}),
        ...(pending.isActive != null ? { isActive: pending.isActive } : {}),
      }),
    })
    setBusy(false)
    setNotice(result.ok ? { type: 'ok', text: result.message || 'Đã cập nhật.' } : { type: 'err', text: result.message })
    setPending(null)
    if (result.ok) load()
  }

  return (
    <>
      <Notice notice={notice} />
      <p className="admin-note admin-note--info">Hệ thống có hai quyền: ADMIN và CUSTOMER. Chưa có SUPER_ADMIN. Mật khẩu không hiển thị. Bạn không thể tự khóa hoặc tự bỏ quyền quản trị.</p>
      <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setCurrentPage(1); setApplied(search) }}>
        <label className="admin-field"><span>Tìm</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, email, username" /></label>
        <label className="admin-field"><span>Quyền</span>
          <select value={role} onChange={(event) => { setRole(event.target.value); setCurrentPage(1) }}>
            <option value="">Tất cả</option>
            <option value="ADMIN">Quản trị</option>
            <option value="CUSTOMER">Khách</option>
          </select>
        </label>
        <button className="admin-btn" type="submit">Lọc</button>
      </form>
      <div className="admin-table-wrap">
        {rows.length === 0 ? <Empty text="Không có tài khoản." /> : (
          <table className="admin-table">
            <thead><tr><th>Tài khoản</th><th>Email</th><th>Điện thoại</th><th>Quyền</th><th>Đơn</th><th>Tạo lúc</th><th></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name || '—'}{row.username ? ` · ${row.username}` : ''}{row.id === actorId ? ' (bạn)' : ''}</td>
                  <td>{row.email}</td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.role === 'ADMIN' ? 'Quản trị' : 'Khách'}</td>
                  <td>{row._count.orders}</td>
                  <td>{formatWhen(row.createdAt)}</td>
                  <td>
                    {row.role === 'ADMIN' ? (
                      <button className="admin-link" type="button" onClick={() => setPending({ user: row, role: 'CUSTOMER', label: `Đổi ${row.email} thành khách?` })}>Cho làm khách</button>
                    ) : (
                      <button className="admin-link" type="button" onClick={() => setPending({ user: row, role: 'ADMIN', label: `Cấp quyền quản trị cho ${row.email}?` })}>Cho làm quản trị</button>
                    )}
                    <button className="admin-link" type="button" onClick={() => setPending({ user: row, isActive: !row.isActive, label: row.isActive ? `Khóa ${row.email}?` : `Mở lại ${row.email}?` })}>
                      {row.isActive ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {page ? <Pager page={page} onPage={setCurrentPage} /> : null}
      </div>
      {pending ? (
        <ConfirmDialog
          title="Xác nhận"
          body={pending.label}
          confirmLabel={busy ? 'Đang lưu...' : 'Xác nhận'}
          busy={busy}
          onConfirm={apply}
          onClose={() => setPending(null)}
        />
      ) : null}
    </>
  )
}
