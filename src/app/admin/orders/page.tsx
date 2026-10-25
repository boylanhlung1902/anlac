'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { Empty, Notice, Pager } from '@/components/admin/AdminBits'
import { adminFetch, PageInfo } from '@/lib/admin-client'
import { formatVndAmount, formatWhen, SUBMISSION_KIND_LABEL, SUBMISSION_STATUS_LABEL } from '@/lib/admin-labels'

type Inquiry = {
  id: number
  kind: keyof typeof SUBMISSION_KIND_LABEL
  name: string
  email: string
  phone: string | null
  subject: string | null
  totalVND: number
  status: keyof typeof SUBMISSION_STATUS_LABEL
  source: string
  createdAt: string
}

const SOURCE_LABEL: Record<string, string> = {
  homepage: 'Trang chủ',
  contact: 'Trang liên hệ',
  cart: 'Giỏ hàng',
}

export default function InquiriesPage() {
  useAdminPage('Yêu cầu khách', [{ label: 'Yêu cầu khách' }])
  const [rows, setRows] = useState<Inquiry[]>([])
  const [page, setPage] = useState<PageInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const [kind, setKind] = useState('')
  const [status, setStatus] = useState('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ page: String(currentPage), search: applied, kind, status })
    setLoading(true)
    adminFetch<{ inquiries: Inquiry[]; pagination: PageInfo }>(`/api/admin/inquiries?${params}`).then((result) => {
      setLoading(false)
      if (!result.ok) setNotice({ type: 'err', text: result.message })
      else {
        setRows(result.data.inquiries)
        setPage(result.data.pagination)
      }
    })
  }, [currentPage, applied, kind, status])

  return (
    <>
      <Notice notice={notice} />
      <p className="admin-note admin-note--info">Mọi form liên hệ và đơn bấm mua trong giỏ hàng được lưu tại đây, kể cả khi gửi email bị lỗi.</p>
      <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setCurrentPage(1); setApplied(search) }}>
        <label className="admin-field"><span>Tìm</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, email, điện thoại" /></label>
        <label className="admin-field"><span>Loại</span>
          <select value={kind} onChange={(event) => { setKind(event.target.value); setCurrentPage(1) }}>
            <option value="">Tất cả</option>
            <option value="ORDER">Đơn giỏ hàng</option>
            <option value="CONTACT">Liên hệ</option>
          </select>
        </label>
        <label className="admin-field"><span>Trạng thái</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setCurrentPage(1) }}>
            <option value="">Tất cả</option>
            {Object.entries(SUBMISSION_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="admin-btn" type="submit">Lọc</button>
      </form>
      <div className="admin-table-wrap">
        {loading ? <p style={{ padding: 16 }}>Đang tải...</p> : rows.length === 0 ? <Empty text="Chưa có yêu cầu nào." /> : (
          <table className="admin-table">
            <thead><tr><th>Lúc</th><th>Loại</th><th>Khách</th><th>Email</th><th>Điện thoại</th><th>Nguồn</th><th>Giá trị</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatWhen(row.createdAt)}</td>
                  <td>{SUBMISSION_KIND_LABEL[row.kind]}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone || '—'}</td>
                  <td>{SOURCE_LABEL[row.source] || row.source}</td>
                  <td>{row.kind === 'ORDER' ? formatVndAmount(row.totalVND) : '—'}</td>
                  <td>{SUBMISSION_STATUS_LABEL[row.status]}</td>
                  <td><Link className="admin-link" href={`/admin/orders/${row.id}`}>Xem</Link></td>
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
