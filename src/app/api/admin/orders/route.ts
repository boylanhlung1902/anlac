import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { adminError, adminOk, pageInfo, readPage, requireAdmin } from '@/lib/admin-http'
import { isOrderStatus } from '@/lib/admin-labels'
import { singleLine } from '../../../../../lib/mail'

const orderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  totalAmountVND: true,
  shippingName: true,
  shippingPhone: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.OrderSelect

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = readPage(searchParams)
    const search = singleLine(searchParams.get('search') || '', 80)
    const status = searchParams.get('status') || ''
    const sort = searchParams.get('sort') === 'total' ? 'totalAmountVND' : 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    const where: Prisma.OrderWhereInput = {}
    if (isOrderStatus(status)) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingName: { contains: search, mode: 'insensitive' } },
        { shippingPhone: { contains: search } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }
    const [orders, total] = await Promise.all([
      auth.db.order.findMany({ where, select: orderSelect, orderBy: { [sort]: order }, skip, take: limit }),
      auth.db.order.count({ where }),
    ])
    return adminOk({
      orders: orders.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
      pagination: pageInfo(page, limit, total),
    })
  } catch (error) {
    console.error('Admin orders failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được đơn hàng.')
  }
}
