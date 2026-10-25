import { NextRequest } from 'next/server'
import { clientKey, singleLine } from '../../../../../../lib/mail'
import { rateLimit } from '../../../../../../lib/rate-limit'
import { adminError, adminOk } from '@/lib/admin-http'
import { DUMMY_PASSWORD_HASH, verifyPassword } from '@/lib/admin-password'
import { ADMIN_COOKIE, ADMIN_MAX_AGE_SECONDS, createAdminToken } from '@/lib/admin-token'
import { getPrisma } from '../../../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`admin-login:${clientKey(request)}`, 8, 15 * 60 * 1000)) {
      return adminError(429, 'Bạn thử đăng nhập quá nhiều lần. Vui lòng đợi rồi thử lại.')
    }

    const body = await request.json().catch(() => null)
    const login = singleLine(String(body?.username || ''), 80).toLowerCase()
    const password = String(body?.password || '')
    if (!login || password.length < 8 || password.length > 100) {
      return adminError(400, 'Nhập tên đăng nhập và mật khẩu.')
    }

    const db = getPrisma()
    if (!db) return adminError(503, 'Chưa kết nối được cơ sở dữ liệu.')

    const user = await db.user.findFirst({
      where: { OR: [{ username: login }, { email: login }] },
      select: { id: true, passwordHash: true, role: true, isActive: true },
    })
    const valid = await verifyPassword(password, user?.passwordHash || DUMMY_PASSWORD_HASH)
    if (!user?.passwordHash || !valid) {
      return adminError(401, 'Sai tên đăng nhập hoặc mật khẩu.')
    }
    if (!user.isActive) return adminError(403, 'Tài khoản đã bị khóa.')
    if (user.role !== 'ADMIN') return adminError(403, 'Tài khoản không có quyền quản trị.')

    const token = await createAdminToken(user.id)
    if (!token) return adminError(500, 'Máy chủ chưa có khóa phiên quản trị.')

    const response = adminOk({ id: user.id }, 'Đăng nhập thành công.')
    response.cookies.set({
      name: ADMIN_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ADMIN_MAX_AGE_SECONDS,
    })
    return response
  } catch (error) {
    console.error('Admin login failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không đăng nhập được.')
  }
}
