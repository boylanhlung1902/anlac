import { NextRequest } from 'next/server'
import { adminOk, requireAdmin } from '@/lib/admin-http'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  return adminOk(auth.user)
}
