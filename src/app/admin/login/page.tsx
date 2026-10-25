'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { adminFetch } from '@/lib/admin-client'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const result = await adminFetch('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    const next = params.get('next')
    router.replace(next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin/dashboard')
    router.refresh()
  }

  return (
    <form className="admin-login" onSubmit={onSubmit}>
      <div className="admin-kicker">An Lạc Stone</div>
      <h1>Đăng nhập quản trị</h1>
      <p>Chỉ tài khoản quản trị mới vào được khu vực này.</p>
      {error ? <div className="admin-note admin-note--err" role="alert">{error}</div> : null}
      <label className="admin-field admin-field--wide">
        <span>Tên đăng nhập</span>
        <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
      </label>
      <label className="admin-field admin-field--wide">
        <span>Mật khẩu</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
      </label>
      <button className="admin-btn" type="submit" disabled={busy}>{busy ? 'Đang kiểm tra...' : 'Vào trang quản trị'}</button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-login">Đang mở trang đăng nhập...</div>}>
      <LoginForm />
    </Suspense>
  )
}
