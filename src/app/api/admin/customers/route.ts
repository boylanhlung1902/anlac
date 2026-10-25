import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { adminError, adminOk, pageInfo, readPage, requireAdmin } from '@/lib/admin-http'
import { singleLine } from '../../../../../lib/mail'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = readPage(searchParams)
    const search = singleLine(searchParams.get('search') || '', 80)
    const where: Prisma.UserWhereInput = { role: 'CUSTOMER' }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }
    const [customers, total] = await Promise.all([
      auth.db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { totalAmountVND: true },
          },
          _count: { select: { orders: true } },
        },
      }),
      auth.db.user.count({ where }),
    ])
    return adminOk({
      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
        createdAt: customer.createdAt.toISOString(),
        totalOrders: customer._count.orders,
        totalSpending: customer.orders.reduce((sum, order) => sum + order.totalAmountVND, 0),
      })),
      pagination: pageInfo(page, limit, total),
    })
  } catch (error) {
    console.error('Admin customers failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được khách hàng.')
  }
}
