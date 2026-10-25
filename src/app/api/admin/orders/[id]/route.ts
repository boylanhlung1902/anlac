import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { adminError, adminOk, parseId, prismaCode, requireAdmin } from '@/lib/admin-http'
import { isOrderStatus, ORDER_NEXT } from '@/lib/admin-labels'

function decimal(value: Prisma.Decimal | number) {
  return Number(value.toString())
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã đơn không hợp lệ.')
  const order = await auth.db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, address: true, role: true } },
      orderItems: {
        select: {
          id: true,
          quantity: true,
          priceVND: true,
          product: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })
  if (!order) return adminError(404, 'Không tìm thấy đơn hàng.')
  const subtotal = order.orderItems.reduce((sum, item) => sum + item.priceVND * item.quantity, 0)
  return adminOk({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmountVND: order.totalAmountVND,
    totalAmount: decimal(order.totalAmount),
    shippingAddress: order.shippingAddress,
    shippingPhone: order.shippingPhone,
    shippingName: order.shippingName,
    notes: order.notes,
    paypalOrderId: order.paypalOrderId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: order.user,
    items: order.orderItems,
    subtotal,
    nextStatuses: ORDER_NEXT[order.status],
    missing: ['Đơn không có trường giảm giá và phí vận chuyển.'],
  })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã đơn không hợp lệ.')
  const body = await request.json().catch(() => null)
  const status = String(body?.status || '')
  if (!isOrderStatus(status)) return adminError(400, 'Trạng thái đơn không hợp lệ.')
  try {
    const current = await auth.db.order.findUnique({ where: { id }, select: { status: true } })
    if (!current) return adminError(404, 'Không tìm thấy đơn hàng.')
    if (current.status !== status && !ORDER_NEXT[current.status].includes(status)) {
      return adminError(409, 'Không chuyển trạng thái theo chiều này. Đơn đi từ chờ xác nhận, đã xác nhận, đang giao rồi đã giao. Hủy chỉ khi đơn chưa giao.')
    }
    const order = await auth.db.order.update({ where: { id }, data: { status }, select: { id: true, status: true } })
    return adminOk({ ...order, nextStatuses: ORDER_NEXT[order.status] }, 'Đã cập nhật trạng thái đơn.')
  } catch (error) {
    if (prismaCode(error) === 'P2025') return adminError(404, 'Không tìm thấy đơn hàng.')
    console.error('Admin order update failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không cập nhật được đơn.')
  }
}
