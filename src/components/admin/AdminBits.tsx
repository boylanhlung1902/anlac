'use client'

import { PageInfo } from '@/lib/admin-client'

export function Notice({ notice }: { notice: { type: 'ok' | 'err'; text: string } | null }) {
  if (!notice) return null
  return <div className={`admin-note admin-note--${notice.type}`} role={notice.type === 'err' ? 'alert' : 'status'}>{notice.text}</div>
}

export function Pager({ page, onPage }: { page: PageInfo; onPage: (next: number) => void }) {
  if (page.totalPages <= 1) return null
  return (
    <div className="admin-pager">
      <button type="button" disabled={!page.hasPrev} onClick={() => onPage(page.page - 1)}>Trước</button>
      <span>Trang {page.page} / {page.totalPages}</span>
      <button type="button" disabled={!page.hasNext} onClick={() => onPage(page.page + 1)}>Sau</button>
    </div>
  )
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onClose,
}: {
  title: string
  body: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="admin-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <button className="admin-dialog__backdrop" type="button" aria-label="Đóng" onClick={onClose} />
      <div className="admin-dialog__card">
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="admin-dialog__actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose} disabled={busy}>Hủy</button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={busy}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <div className="admin-empty">{text}</div>
}
