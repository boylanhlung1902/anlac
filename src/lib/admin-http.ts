import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../lib/database'
import { ADMIN_COOKIE, readAdminToken } from './admin-token'

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
}

export function adminError(status: number, message: string) {
  return NextResponse.json(
    { success: false, error: STATUS_TEXT[status] || 'Error', message },
    { status, headers: { 'Cache-Control': 'no-store' } }
  )
}

export function adminOk<T>(data: T, message?: string) {
  return NextResponse.json(
    { success: true, data, message },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export function parseId(value: string) {
  if (!/^\d+$/.test(value)) return null
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) return null
  return id
}

export function readPage(searchParams: URLSearchParams, fallbackLimit = 20) {
  const page = Math.min(500, Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1))
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || String(fallbackLimit), 10) || fallbackLimit))
  return { page, limit, skip: (page - 1) * limit }
}

export function pageInfo(page: number, limit: number, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function prismaCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) return String((error as { code: string }).code)
  return ''
}

export async function requireAdmin(request: NextRequest) {
  const session = await readAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)
  if (!session) return { ok: false as const, response: adminError(401, 'Cần đăng nhập quản trị.') }

  const db = getPrisma()
  if (!db) return { ok: false as const, response: adminError(503, 'Chưa kết nối được cơ sở dữ liệu.') }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, username: true, role: true, isActive: true },
  })
  if (!user || !user.isActive) {
    return { ok: false as const, response: adminError(401, 'Phiên đăng nhập không còn hiệu lực.') }
  }
  if (user.role !== 'ADMIN') {
    return { ok: false as const, response: adminError(403, 'Tài khoản không có quyền quản trị.') }
  }
  return { ok: true as const, user, db }
}
