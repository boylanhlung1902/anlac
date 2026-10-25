import { adminOk } from '@/lib/admin-http'
import { ADMIN_COOKIE } from '@/lib/admin-token'

export async function POST() {
  const response = adminOk({ ok: true }, 'Đã thoát.')
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
