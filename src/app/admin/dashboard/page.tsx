'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { Empty } from '@/components/admin/AdminBits'
import { adminFetch } from '@/lib/admin-client'
import { formatVndAmount, formatWhen, ORDER_STATUS_LABEL, OrderStatusValue, SUBMISSION_KIND_LABEL, SUBMISSION_STATUS_LABEL } from '@/lib/admin-labels'
import { formatPriceVND } from '@/services/api'

type DashboardData = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  lowStockProducts: number
  lowStockAt: number
  newInquiries: number
  recentInquiries: {
    id: number
    kind: 'CONTACT' | 'ORDER'
    name: string
    email: string
    phone: string | null
    status: keyof typeof SUBMISSION_STATUS_LABEL
    totalVND: number
    createdAt: string
  }[]
  recentOrders: {
    id: number
    orderNumber: string
    status: OrderStatusValue
    totalAmountVND: number
    shippingName: string
    createdAt: string
    user: { name: string | null; email: string }
  }[]
  lowStock: { id: number; name: string; stock: number; priceVND: number }[]
  topSelling: { productId: number; quantity: number; product: { name: string } | null }[]
  months: { key: string; label: string; revenue: number; orders: number }[]
  unavailable: string[]
}

export default function DashboardPage() {
  useAdminPage('Tổng quan', [{ label: 'Tổng quan' }])
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminFetch<DashboardData>('/api/admin/dashboard').then((result) => {
      if (!result.ok) setError(result.message)
      else setData(result.data)
    })
  }, [])

  if (error) return <div className="admin-note admin-note--err" role="alert">{error}</div>
  if (!data) return <p>Đang tải tổng quan...</p>

  const maxRevenue = Math.max(...data.months.map((month) => month.revenue), 1)
  const maxOrders = Math.max(...data.months.map((month) => month.orders), 1)
  const stats = [
    ['Doanh thu đã lưu', formatVndAmount(data.totalRevenue)],
    ['Đơn hàng', String(data.totalOrders)],
    ['Sản phẩm', String(data.totalProducts)],
    ['Khách hàng', String(data.totalCustomers)],
    ['Yêu cầu mới', String(data.newInquiries)],
    ['Đơn chờ xác nhận', String(data.pendingOrders)],
    [`Tồn kho ≤ ${data.lowStockAt}`, String(data.lowStockProducts)],
  ]

  return (
    <>
      <div className="admin-note admin-note--info">
        <strong>Những số liệu chưa lấy được từ đơn trên website</strong>
        <ul>{data.unavailable.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <section className="admin-stats">
        {stats.map(([label, value]) => (
          <article key={label} className="admin-card admin-stat">
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className="admin-split">
        <article className="admin-card">
          <h2>Doanh thu 6 tháng</h2>
          {data.totalOrders === 0 ? <Empty text="Chưa có đơn trong database để vẽ biểu đồ." /> : (
            <div className="admin-bars" aria-label="Biểu đồ doanh thu">
              {data.months.map((month) => (
                <div key={month.key} className="admin-bar">
                  <div className="admin-bar__fill" style={{ height: `${Math.max(4, (month.revenue / maxRevenue) * 100)}%` }} title={formatVndAmount(month.revenue)} />
                  <span>{month.label}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="admin-card">
          <h2>Số đơn 6 tháng</h2>
          {data.totalOrders === 0 ? <Empty text="Chưa có đơn trong database." /> : (
            <div className="admin-bars" aria-label="Biểu đồ số đơn">
              {data.months.map((month) => (
                <div key={month.key} className="admin-bar">
                  <div className="admin-bar__fill" style={{ height: `${Math.max(4, (month.orders / maxOrders) * 100)}%` }} title={`${month.orders} đơn`} />
                  <span>{month.label}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
      <section className="admin-card" style={{ marginTop: 14 }}>
        <h2>Yêu cầu khách mới</h2>
        {data.recentInquiries.length === 0 ? <Empty text="Chưa có liên hệ hoặc đơn từ giỏ hàng." /> : (
          <table className="admin-table">
            <thead><tr><th>Loại</th><th>Khách</th><th>Liên hệ</th><th>Trạng thái</th><th>Lúc</th></tr></thead>
            <tbody>
              {data.recentInquiries.map((item) => (
                <tr key={item.id}>
                  <td><Link className="admin-link" href={`/admin/orders/${item.id}`}>{SUBMISSION_KIND_LABEL[item.kind]}</Link></td>
                  <td>{item.name}</td>
                  <td>{item.email}{item.phone ? ` · ${item.phone}` : ''}</td>
                  <td>{SUBMISSION_STATUS_LABEL[item.status]}</td>
                  <td>{formatWhen(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="admin-split" style={{ marginTop: 14 }}>
        <article className="admin-table-wrap">
          <h2 style={{ padding: '16px 16px 0' }}>Đơn gần đây</h2>
          {data.recentOrders.length === 0 ? <Empty text="Chưa có đơn đã lưu." /> : (
            <table className="admin-table">
              <thead><tr><th>Mã</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th><th>Lúc</th></tr></thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><Link className="admin-link" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td>
                    <td>{order.shippingName || order.user.name || order.user.email}</td>
                    <td>{formatVndAmount(order.totalAmountVND)}</td>
                    <td>{ORDER_STATUS_LABEL[order.status]}</td>
                    <td>{formatWhen(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
        <div style={{ display: 'grid', gap: 14 }}>
          <article className="admin-card">
            <h2>Bán chạy</h2>
            {data.topSelling.length === 0 ? <Empty text="Chưa có sản phẩm nào bán qua đơn đã lưu." /> : (
              <ul>{data.topSelling.map((item) => <li key={item.productId}>{item.product?.name || `Sản phẩm #${item.productId}`} · {item.quantity}</li>)}</ul>
            )}
          </article>
          <article className="admin-card">
            <h2>Sắp hết hàng</h2>
            {data.lowStock.length === 0 ? <Empty text="Không có sản phẩm đang bán dưới ngưỡng tồn kho." /> : (
              <ul>{data.lowStock.map((item) => <li key={item.id}><Link className="admin-link" href={`/admin/products/${item.id}/edit`}>{item.name}</Link> · còn {item.stock} · {formatPriceVND(item.priceVND)}</li>)}</ul>
            )}
          </article>
        </div>
      </section>
    </>
  )
}
