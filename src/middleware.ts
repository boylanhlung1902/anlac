import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, readAdminToken } from './lib/admin-token'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/admin') || value.startsWith('//') || value.startsWith('/admin/login')) {
    return '/admin/dashboard'
  }
  return value
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'
  const isLoginApi = pathname === '/api/admin/auth/login'
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  if (!isAdminPage && !isAdminApi) return NextResponse.next()

  const session = await readAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)

  if (isLoginPage || isLoginApi) {
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get('next')), request.url))
    }
    return NextResponse.next()
  }

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Cần đăng nhập quản trị.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
}
