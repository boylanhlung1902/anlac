import { NextRequest } from 'next/server'
import { adminError, adminOk, parseId, requireAdmin } from '@/lib/admin-http'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã khách hàng không hợp lệ.')
  const [customer, spent] = await Promise.all([
    auth.db.user.findFirst({
    where: { id, role: 'CUSTOMER' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      isActive: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmountVND: true,
          shippingAddress: true,
          createdAt: true,
        },
      },
    },
  }),
    auth.db.order.aggregate({
      where: { userId: id, status: { not: 'CANCELLED' } },
      _sum: { totalAmountVND: true },
    }),
  ])
  if (!customer) return adminError(404, 'Không tìm thấy khách hàng.')
  const spending = spent._sum.totalAmountVND || 0
  return adminOk({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    isActive: customer.isActive,
    createdAt: customer.createdAt.toISOString(),
    totalSpending: spending,
    orders: customer.orders.map((order) => ({ ...order, createdAt: order.createdAt.toISOString() })),
    missing: ['Chưa có bảng địa chỉ riêng. Chỉ có một địa chỉ lưu trên tài khoản, cộng địa chỉ giao của từng đơn.'],
  })
}
