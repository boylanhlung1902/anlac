'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-client'

type Crumb = { label: string; href?: string }
type Meta = { title: string; crumbs: Crumb[] }
type Me = { id: number; username: string | null; name: string | null; email: string; role: string }

const AdminMetaContext = createContext<((meta: Meta) => void) | null>(null)

const NAV = [
  { href: '/admin/dashboard', label: 'Tổng quan', icon: 'fa-gauge' },
  { href: '/admin/products', label: 'Sản phẩm', icon: 'fa-box' },
  { href: '/admin/categories', label: 'Danh mục', icon: 'fa-tags' },
  { href: '/admin/orders', label: 'Yêu cầu khách', icon: 'fa-inbox' },
  { href: '/admin/customers', label: 'Khách hàng', icon: 'fa-users' },
  { href: '/admin/users', label: 'Tài khoản', icon: 'fa-user-shield' },
  { href: '/admin/settings', label: 'Cài đặt', icon: 'fa-gear' },
]

export function useAdminPage(title: string, crumbs: Crumb[]) {
  const setMeta = useContext(AdminMetaContext)
  const key = `${title}|${crumbs.map((crumb) => `${crumb.href || ''}:${crumb.label}`).join('|')}`
  useEffect(() => {
    document.title = `${title} · Quản trị An Lạc Stone`
    setMeta?.({ title, crumbs })
  }, [key, setMeta])
}

export default function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [meta, setMeta] = useState<Meta>({ title: 'Quản trị', crumbs: [] })
  const [me, setMe] = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    setMenuOpen(false)
    if (pathname === '/admin/login') return
    let cancelled = false
    adminFetch<Me>('/api/admin/auth/me').then(async (result) => {
      if (cancelled) return
      if (!result.ok) {
        await fetch('/api/admin/auth/logout', { method: 'POST' })
        const next = pathname && pathname.startsWith('/admin') ? pathname : '/admin/dashboard'
        window.location.href = `/admin/login?next=${encodeURIComponent(next)}`
        return
      }
      setMe(result.data)
    })
    return () => {
      cancelled = true
    }
  }, [pathname])

  if (pathname === '/admin/login') {
    return <div className="admin-app admin-app--login">{children}</div>
  }

  async function logout() {
    await adminFetch('/api/admin/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <AdminMetaContext.Provider value={setMeta}>
      <div className={`admin-app${open ? ' is-nav-open' : ''}`}>
        <aside className="admin-sidebar">
          <Link href="/admin/dashboard" className="admin-brand">An Lạc Stone</Link>
          <p className="admin-brand__sub">Quản trị cửa hàng</p>
          <nav className="admin-nav">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link key={item.href} href={item.href} className={active ? 'is-active' : ''}>
                  <i className={`fas ${item.icon}`} aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        {open ? <button className="admin-backdrop" type="button" aria-label="Đóng menu" onClick={() => setOpen(false)} /> : null}
        <div className="admin-main">
          <header className="admin-header">
            <button className="admin-icon-btn admin-menu-btn" type="button" aria-label="Mở menu" onClick={() => setOpen(true)}>
              <i className="fas fa-bars" aria-hidden="true" />
            </button>
            <div className="admin-header__titles">
              <nav className="admin-crumbs" aria-label="Breadcrumb">
                <Link href="/admin/dashboard">Quản trị</Link>
                {meta.crumbs.map((crumb) => (
                  <span key={`${crumb.href || ''}-${crumb.label}`}>
                    <span aria-hidden="true"> / </span>
                    {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                  </span>
                ))}
              </nav>
              <h1>{meta.title}</h1>
            </div>
            <div className="admin-user">
              <button className="admin-user__trigger" type="button" onClick={() => setMenuOpen((value) => !value)}>
                <span>{me?.name || me?.username || 'Quản trị'}</span>
                <small>ADMIN</small>
              </button>
              {menuOpen ? (
                <div className="admin-user__menu">
                  <Link href="/" target="_blank" rel="noreferrer">Xem cửa hàng</Link>
                  <button type="button" onClick={logout}>Thoát</button>
                </div>
              ) : null}
            </div>
          </header>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </AdminMetaContext.Provider>
  )
}
