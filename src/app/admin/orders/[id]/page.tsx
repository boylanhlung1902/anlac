'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { Notice } from '@/components/admin/AdminBits'
import { adminFetch } from '@/lib/admin-client'
import { formatVndAmount, formatWhen, SUBMISSION_KIND_LABEL, SUBMISSION_STATUS_LABEL, SubmissionStatusValue } from '@/lib/admin-labels'

type Item = { productId: number; name: string; quantity: number; priceVND: number }
type Inquiry = {
  id: number
  kind: keyof typeof SUBMISSION_KIND_LABEL
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string | null
  items: Item[] | null
  totalVND: number
  status: SubmissionStatusValue
  source: string
  createdAt: string
  nextStatuses: SubmissionStatusValue[]
}

const SOURCE_LABEL: Record<string, string> = {
  homepage: 'Form trang chủ',
  contact: 'Trang liên hệ',
  cart: 'Nút mua trong giỏ hàng',
}

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>()
  const [row, setRow] = useState<Inquiry | null>(null)
  const [status, setStatus] = useState<SubmissionStatusValue | ''>('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useAdminPage(row ? row.name : 'Yêu cầu', [
    { label: 'Yêu cầu khách', href: '/admin/orders' },
    { label: row?.name || 'Chi tiết' },
  ])

  useEffect(() => {
    adminFetch<Inquiry>(`/api/admin/inquiries/${params.id}`).then((result) => {
      if (!result.ok) setError(result.message)
      else {
        setRow(result.data)
        setStatus(result.data.nextStatuses[0] || '')
      }
    })
  }, [params.id])

  async function updateStatus() {
    if (!row || !status) return
    setBusy(true)
    const result = await adminFetch<{ status: SubmissionStatusValue; nextStatuses: SubmissionStatusValue[] }>(`/api/admin/inquiries/${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    setBusy(false)
    if (!result.ok) {
      setNotice({ type: 'err', text: result.message })
      return
    }
    setRow({ ...row, status: result.data.status, nextStatuses: result.data.nextStatuses })
    setStatus(result.data.nextStatuses[0] || '')
    setNotice({ type: 'ok', text: result.message || 'Đã cập nhật.' })
  }

  if (error) return <div className="admin-note admin-note--err" role="alert">{error}</div>
  if (!row) return <p>Đang tải yêu cầu...</p>
  const items = Array.isArray(row.items) ? row.items : []

  return (
    <article className="admin-card">
      <Notice notice={notice} />
      <h2>{SUBMISSION_KIND_LABEL[row.kind]} · {row.name}</h2>
      <dl className="admin-dl">
        <dt>Nguồn</dt><dd>{SOURCE_LABEL[row.source] || row.source}</dd>
        <dt>Thời gian</dt><dd>{formatWhen(row.createdAt)}</dd>
        <dt>Email</dt><dd><a className="admin-link" href={`mailto:${row.email}`}>{row.email}</a></dd>
        <dt>Điện thoại</dt><dd>{row.phone || '—'}</dd>
        <dt>Tiêu đề</dt><dd>{row.subject || '—'}</dd>
        <dt>Trạng thái</dt><dd>{SUBMISSION_STATUS_LABEL[row.status]}</dd>
        <dt>Nội dung</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{row.message || '—'}</dd>
      </dl>
      {row.kind === 'ORDER' ? (
        <>
          <h2 style={{ marginTop: 18 }}>Sản phẩm trong giỏ</h2>
          {items.length === 0 ? <p>Không có dòng sản phẩm.</p> : (
            <table className="admin-table">
              <thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.productId}-${item.name}`}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.priceVND > 0 ? formatVndAmount(item.priceVND) : 'Liên hệ để báo giá'}</td>
                    <td>{item.priceVND > 0 ? formatVndAmount(item.priceVND * item.quantity) : 'Liên hệ để báo giá'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p>Tổng đã niêm yết: <strong>{row.totalVND > 0 ? formatVndAmount(row.totalVND) : 'Liên hệ để báo giá'}</strong></p>
        </>
      ) : null}
      {row.nextStatuses.length === 0 ? <p>Yêu cầu đã kết thúc.</p> : (
        <div className="admin-actions">
          <label className="admin-field">
            <span>Chuyển sang</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as SubmissionStatusValue)}>
              {row.nextStatuses.map((value) => <option key={value} value={value}>{SUBMISSION_STATUS_LABEL[value]}</option>)}
            </select>
          </label>
          <button className="admin-btn" type="button" disabled={busy} onClick={updateStatus}>{busy ? 'Đang lưu...' : 'Cập nhật'}</button>
        </div>
      )}
    </article>
  )
}
