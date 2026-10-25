import { NextRequest } from 'next/server'
import { adminError, adminOk, requireAdmin } from '@/lib/admin-http'
import { LOW_STOCK_AT } from '@/lib/admin-labels'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const since = new Date()
    since.setMonth(since.getMonth() - 5)
    since.setDate(1)
    since.setHours(0, 0, 0, 0)

    const [revenue, orderCount, productCount, customerCount, pendingCount, lowStockCount, recent, lowStock, chartOrders, grouped] = await Promise.all([
      auth.db.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmountVND: true },
      }),
      auth.db.order.count(),
      auth.db.product.count(),
      auth.db.user.count({ where: { role: 'CUSTOMER' } }),
      auth.db.order.count({ where: { status: 'PENDING' } }),
      auth.db.product.count({ where: { isActive: true, stock: { lte: LOW_STOCK_AT } } }),
      auth.db.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmountVND: true,
          shippingName: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      auth.db.product.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_AT } },
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
        take: 8,
        select: { id: true, name: true, stock: true, image: true, priceVND: true },
      }),
      auth.db.order.findMany({
        where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
        select: { createdAt: true, totalAmountVND: true },
      }),
      auth.db.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    const topIds = grouped.map((row) => row.productId)
    const topProducts = topIds.length
      ? await auth.db.product.findMany({
          where: { id: { in: topIds } },
          select: { id: true, name: true, image: true, priceVND: true },
        })
      : []
    const topById = new Map(topProducts.map((product) => [product.id, product]))

    const months: { key: string; label: string; revenue: number; orders: number }[] = []
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date()
      date.setDate(1)
      date.setMonth(date.getMonth() - offset)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      months.push({
        key,
        label: date.toLocaleDateString('vi-VN', { month: 'short' }),
        revenue: 0,
        orders: 0,
      })
    }
    for (const order of chartOrders) {
      const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`
      const bucket = months.find((month) => month.key === key)
      if (!bucket) continue
      bucket.revenue += order.totalAmountVND
      bucket.orders += 1
    }

    const [newInquiries, recentInquiries] = await Promise.all([
      auth.db.customerSubmission.count({ where: { status: 'NEW' } }),
      auth.db.customerSubmission.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { id: true, kind: true, name: true, email: true, phone: true, status: true, totalVND: true, createdAt: true },
      }),
    ])

    return adminOk({
      totalRevenue: revenue._sum.totalAmountVND || 0,
      totalOrders: orderCount,
      totalProducts: productCount,
      totalCustomers: customerCount,
      pendingOrders: pendingCount,
      lowStockProducts: lowStockCount,
      lowStockAt: LOW_STOCK_AT,
      recentOrders: recent.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
      })),
      lowStock,
      topSelling: grouped.map((row) => ({
        productId: row.productId,
        quantity: row._sum.quantity || 0,
        product: topById.get(row.productId) || null,
      })),
      months,
      newInquiries,
      recentInquiries: recentInquiries.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      unavailable: [
        'Doanh thu và biểu đồ đơn vẫn tính bảng đơn nội bộ. Đơn bấm mua trong giỏ hàng và form liên hệ nằm ở mục Yêu cầu khách.',
        'Chưa có giá khuyến mãi, SKU, biến thể, phí vận chuyển hay giảm giá để tính riêng.',
      ],
    })
  } catch (error) {
    console.error('Admin dashboard failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được tổng quan.')
  }
}
