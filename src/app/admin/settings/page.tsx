'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { Notice } from '@/components/admin/AdminBits'
import { adminFetch } from '@/lib/admin-client'
import { STORE_DEFAULTS, StoreProfile } from '@/lib/store-defaults'

export default function SettingsPage() {
  useAdminPage('Cài đặt', [{ label: 'Cài đặt' }])
  const [form, setForm] = useState<StoreProfile>(STORE_DEFAULTS)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminFetch<StoreProfile>('/api/admin/settings').then((result) => {
      if (result.ok) setForm(result.data)
      else setNotice({ type: 'err', text: result.message })
    })
  }, [])

  function update(field: keyof StoreProfile, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    const result = await adminFetch<StoreProfile>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(form),
    })
    setBusy(false)
    setNotice(result.ok
      ? { type: 'ok', text: result.message || 'Đã lưu. Trang chủ, chân trang và trang liên hệ dùng thông tin này.' }
      : { type: 'err', text: result.message })
    if (result.ok) setForm(result.data)
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <Notice notice={notice} />
      <p className="admin-note admin-note--info">Tên cửa hàng, điện thoại, email, địa chỉ và giờ làm việc chỉ sửa tại đây. Email này cũng là hộp thư nhận liên hệ và đơn hàng. Tài khoản quản trị đăng nhập bằng mật khẩu đã băm, không hiển thị lại.</p>
      <div className="admin-form__row">
        <label className="admin-field"><span>Tên cửa hàng</span><input value={form.storeName} onChange={(event) => update('storeName', event.target.value)} required /></label>
        <label className="admin-field"><span>Điện thoại</span><input value={form.phone} onChange={(event) => update('phone', event.target.value)} required /></label>
        <label className="admin-field"><span>Email</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label>
      </div>
      <label className="admin-field admin-field--wide"><span>Địa chỉ</span><textarea value={form.address} onChange={(event) => update('address', event.target.value)} required /></label>
      <div className="admin-form__row">
        <label className="admin-field"><span>Thứ 2 - thứ 6</span><input value={form.hoursWeekday} onChange={(event) => update('hoursWeekday', event.target.value)} required /></label>
        <label className="admin-field"><span>Thứ 7</span><input value={form.hoursSaturday} onChange={(event) => update('hoursSaturday', event.target.value)} required /></label>
        <label className="admin-field"><span>Chủ nhật</span><input value={form.hoursSunday} onChange={(event) => update('hoursSunday', event.target.value)} required /></label>
      </div>
      <button className="admin-btn" type="submit" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu thông tin cửa hàng'}</button>
    </form>
  )
}
