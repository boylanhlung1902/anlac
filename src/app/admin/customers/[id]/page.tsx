'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAdminPage } from '@/components/admin/AdminFrame'
import { adminFetch } from '@/lib/admin-client'
import { formatVndAmount, formatWhen, ORDER_STATUS_LABEL, OrderStatusValue, PAYMENT_STATUS_LABEL, PaymentStatusValue } from '@/lib/admin-labels'

type CustomerDetail = {
  id: number
  name: string | null
  email: string
  phone: string | null
  address: string | null
  isActive: boolean
  createdAt: string
  totalSpending: number
  missing: string[]
  orders: {
    id: number
    orderNumber: string
    status: OrderStatusValue
    paymentStatus: PaymentStatusValue
    totalAmountVND: number
    shippingAddress: string
    createdAt: string
  }[]
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [error, setError] = useState('')
  useAdminPage(customer?.name || 'Khách hàng', [
    { label: 'Khách hàng', href: '/admin/customers' },
    { label: customer?.name || customer?.email || 'Chi tiết' },
  ])

  useEffect(() => {
    adminFetch<CustomerDetail>(`/api/admin/customers/${params.id}`).then((result) => {
      if (!result.ok) setError(result.message)
      else setCustomer(result.data)
    })
  }, [params.id])

  if (error) return <div className="admin-note admin-note--err" role="alert">{error}</div>
  if (!customer) return <p>Đang tải khách hàng...</p>

  return (
    <div className="admin-split">
      <article className="admin-card">
        <h2>Thông tin</h2>
        <dl className="admin-dl">
          <dt>Tên</dt><dd>{customer.name || '—'}</dd>
          <dt>Email</dt><dd>{customer.email}</dd>
          <dt>Điện thoại</dt><dd>{customer.phone || '—'}</dd>
          <dt>Địa chỉ</dt><dd>{customer.address || '—'}</dd>
          <dt>Trạng thái</dt><dd>{customer.isActive ? 'Đang dùng' : 'Đã khóa'}</dd>
          <dt>Tạo lúc</dt><dd>{formatWhen(customer.createdAt)}</dd>
          <dt>Chi tiêu</dt><dd>{formatVndAmount(customer.totalSpending)}</dd>
        </dl>
        {customer.missing.map((item) => <p key={item}>{item}</p>)}
      </article>
      <article className="admin-table-wrap">
        <h2 style={{ padding: '16px 16px 0' }}>Đơn hàng</h2>
        {customer.orders.length === 0 ? <p style={{ padding: 16 }}>Chưa có đơn.</p> : (
          <table className="admin-table">
            <thead><tr><th>Mã</th><th>Tổng</th><th>Thanh toán</th><th>Trạng thái</th><th>Địa chỉ giao</th></tr></thead>
            <tbody>
              {customer.orders.map((order) => (
                <tr key={order.id}>
                  <td><Link className="admin-link" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td>
                  <td>{formatVndAmount(order.totalAmountVND)}</td>
                  <td>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</td>
                  <td>{ORDER_STATUS_LABEL[order.status]}</td>
                  <td>{order.shippingAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </div>
  )
}
