'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { Empty, Notice, Pager } from '@/components/admin/AdminBits'
import { adminFetch, PageInfo } from '@/lib/admin-client'
import { formatVndAmount, formatWhen } from '@/lib/admin-labels'

type CustomerRow = {
  id: number
  name: string | null
  email: string
  phone: string | null
  totalOrders: number
  totalSpending: number
  createdAt: string
  isActive: boolean
}

export default function CustomersPage() {
  useAdminPage('Khách hàng', [{ label: 'Khách hàng' }])
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [page, setPage] = useState<PageInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminFetch<{ customers: CustomerRow[]; pagination: PageInfo }>(`/api/admin/customers?page=${currentPage}&search=${encodeURIComponent(applied)}`).then((result) => {
      setLoading(false)
      if (!result.ok) setNotice({ type: 'err', text: result.message })
      else {
        setRows(result.data.customers)
        setPage(result.data.pagination)
      }
    })
  }, [currentPage, applied])

  return (
    <>
      <Notice notice={notice} />
      <p className="admin-note admin-note--info">Khách ở đây là tài khoản có quyền khách. Đơn gửi bằng form mà không tạo tài khoản sẽ không xuất hiện.</p>
      <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setCurrentPage(1); setApplied(search) }}>
        <label className="admin-field"><span>Tìm</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, email, điện thoại" /></label>
        <button className="admin-btn" type="submit">Lọc</button>
      </form>
      <div className="admin-table-wrap">
        {loading ? <p style={{ padding: 16 }}>Đang tải...</p> : rows.length === 0 ? <Empty text="Chưa có khách hàng." /> : (
          <table className="admin-table">
            <thead><tr><th>Khách</th><th>Email</th><th>Điện thoại</th><th>Đơn</th><th>Chi tiêu</th><th>Tạo lúc</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><Link className="admin-link" href={`/admin/customers/${row.id}`}>{row.name || 'Khách chưa đặt tên'}</Link></td>
                  <td>{row.email}</td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.totalOrders}</td>
                  <td>{formatVndAmount(row.totalSpending)}</td>
                  <td>{formatWhen(row.createdAt)}</td>
                  <td>{row.isActive ? 'Đang dùng' : 'Đã khóa'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {page ? <Pager page={page} onPage={setCurrentPage} /> : null}
      </div>
    </>
  )
}
