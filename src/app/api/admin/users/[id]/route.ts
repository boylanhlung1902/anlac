import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { adminError, adminOk, parseId, prismaCode, requireAdmin } from '@/lib/admin-http'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã tài khoản không hợp lệ.')
  const body = await request.json().catch(() => null)
  const data: Prisma.UserUpdateInput = {}
  if (body && typeof body === 'object' && 'role' in body) {
    if (body.role !== 'ADMIN' && body.role !== 'CUSTOMER') {
      return adminError(400, 'Quyền chỉ có thể là quản trị hoặc khách.')
    }
    data.role = body.role
  }
  if (body && typeof body === 'object' && 'isActive' in body) {
    data.isActive = body.isActive === true || body.isActive === 'true'
  }
  if (!('role' in data) && !('isActive' in data)) return adminError(400, 'Không có thay đổi hợp lệ.')
  if (id === auth.user.id && (data.role === 'CUSTOMER' || data.isActive === false)) {
    return adminError(409, 'Bạn không thể tự hạ quyền hoặc khóa tài khoản đang đăng nhập.')
  }

  try {
    const target = await auth.db.user.findUnique({ where: { id }, select: { role: true, isActive: true } })
    if (!target) return adminError(404, 'Không tìm thấy tài khoản.')
    const removesAdmin = target.role === 'ADMIN' && target.isActive && (data.role === 'CUSTOMER' || data.isActive === false)
    if (removesAdmin) {
      const otherAdmins = await auth.db.user.count({
        where: { role: 'ADMIN', isActive: true, id: { not: id } },
      })
      if (otherAdmins === 0) return adminError(409, 'Cần giữ ít nhất một tài khoản quản trị đang hoạt động.')
    }
    const user = await auth.db.user.update({
      where: { id },
      data,
      select: { id: true, username: true, name: true, email: true, role: true, isActive: true },
    })
    return adminOk(user, 'Đã cập nhật tài khoản.')
  } catch (error) {
    if (prismaCode(error) === 'P2025') return adminError(404, 'Không tìm thấy tài khoản.')
    console.error('Admin user update failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không cập nhật được tài khoản.')
  }
}
