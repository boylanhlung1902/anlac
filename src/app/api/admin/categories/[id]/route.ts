import { NextRequest } from 'next/server'
import { adminError, adminOk, parseId, prismaCode, requireAdmin } from '@/lib/admin-http'
import { parseCategoryWrite } from '@/lib/admin-product'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã danh mục không hợp lệ.')
  const body = await request.json().catch(() => null)
  const keys = body && typeof body === 'object' ? Object.keys(body as object) : []
  const onlyVisibility = keys.length === 1 && keys[0] === 'isActive'
  const parsed = onlyVisibility
    ? { ok: true as const, data: { isActive: (body as { isActive?: unknown }).isActive === true || (body as { isActive?: unknown }).isActive === 'true' } }
    : parseCategoryWrite(body)
  if (!parsed.ok) return adminError(400, parsed.message)
  try {
    const category = await auth.db.category.update({ where: { id }, data: parsed.data })
    return adminOk({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }, 'Đã cập nhật danh mục.')
  } catch (error) {
    if (prismaCode(error) === 'P2025') return adminError(404, 'Không tìm thấy danh mục.')
    if (prismaCode(error) === 'P2002') return adminError(409, 'Tên hoặc đường dẫn danh mục đã tồn tại.')
    console.error('Admin category update failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không cập nhật được danh mục.')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã danh mục không hợp lệ.')
  try {
    const products = await auth.db.product.count({ where: { categoryId: id } })
    if (products > 0) return adminError(409, 'Danh mục còn sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.')
    await auth.db.category.delete({ where: { id } })
    return adminOk({ id }, 'Đã xóa danh mục.')
  } catch (error) {
    if (prismaCode(error) === 'P2025') return adminError(404, 'Không tìm thấy danh mục.')
    console.error('Admin category delete failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không xóa được danh mục.')
  }
}
