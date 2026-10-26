import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { adminError, adminOk, parseId, prismaCode, requireAdmin } from '@/lib/admin-http'
import { parseProductFlags, parseProductWrite } from '@/lib/admin-product'

const productSelect = {
  id: true,
  name: true,
  description: true,
  priceVND: true,
  price: true,
  netPrice: true,
  tax: true,
  image: true,
  images: true,
  categoryId: true,
  stock: true,
  isFeatured: true,
  isActive: true,
  slug: true,
  weight: true,
  dimensions: true,
  material: true,
  origin: true,
  craft: true,
  warranty: true,
  highlights: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductSelect

function serialize(product: {
  price: Prisma.Decimal
  netPrice: Prisma.Decimal
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...product,
    price: Number(product.price),
    netPrice: Number(product.netPrice),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã sản phẩm không hợp lệ.')
  try {
    const product = await auth.db.product.findUnique({ where: { id }, select: productSelect })
    if (!product) return adminError(404, 'Không tìm thấy sản phẩm.')
    return adminOk(serialize(product))
  } catch (error) {
    console.error('Admin product read failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được sản phẩm.')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã sản phẩm không hợp lệ.')
  const body = await request.json().catch(() => null)
  const keys = body && typeof body === 'object' ? Object.keys(body as object) : []
  const flagOnly = keys.length > 0 && keys.every((key) => key === 'isActive' || key === 'isFeatured' || key === 'stock')

  try {
    if (flagOnly) {
      const flags = parseProductFlags(body)
      if (!flags.ok) return adminError(400, flags.message)
      const product = await auth.db.product.update({ where: { id }, data: flags.data, select: productSelect })
      return adminOk(serialize(product), 'Đã cập nhật sản phẩm.')
    }
    const parsed = parseProductWrite(body)
    if (!parsed.ok) return adminError(400, parsed.message)
    const category = await auth.db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } })
    if (!category) return adminError(400, 'Danh mục không tồn tại.')
    const product = await auth.db.product.update({ where: { id }, data: parsed.data, select: productSelect })
    return adminOk(serialize(product), 'Đã cập nhật sản phẩm.')
  } catch (error) {
    if (prismaCode(error) === 'P2025') return adminError(404, 'Không tìm thấy sản phẩm.')
    if (prismaCode(error) === 'P2002') return adminError(409, 'Đường dẫn sản phẩm đã tồn tại.')
    console.error('Admin product update failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không cập nhật được sản phẩm.')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã sản phẩm không hợp lệ.')
  try {
    const linked = await auth.db.orderItem.count({ where: { productId: id } })
    if (linked > 0) return adminError(409, 'Sản phẩm đã có trong đơn hàng. Hãy ngừng bán thay vì xóa.')
    await auth.db.cartItem.deleteMany({ where: { productId: id } })
    await auth.db.product.delete({ where: { id } })
    return adminOk({ id }, 'Đã xóa sản phẩm.')
  } catch (error) {
    if (prismaCode(error) === 'P2025') return adminError(404, 'Không tìm thấy sản phẩm.')
    console.error('Admin product delete failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không xóa được sản phẩm.')
  }
}
