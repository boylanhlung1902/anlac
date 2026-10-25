export const LOW_STOCK_AT = 5

export const ORDER_STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
} as const

export const PAYMENT_STATUS_LABEL = {
  PENDING: 'Chưa thanh toán',
  COMPLETED: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn',
} as const

export const PAYMENT_METHOD_LABEL = {
  PAYPAL: 'PayPal',
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
} as const

export type OrderStatusValue = keyof typeof ORDER_STATUS_LABEL
export type PaymentStatusValue = keyof typeof PAYMENT_STATUS_LABEL

export const ORDER_NEXT: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function isOrderStatus(value: string): value is OrderStatusValue {
  return value in ORDER_STATUS_LABEL
}

export const SUBMISSION_KIND_LABEL = {
  CONTACT: 'Liên hệ',
  ORDER: 'Đơn giỏ hàng',
} as const

export const SUBMISSION_STATUS_LABEL = {
  NEW: 'Mới',
  CONTACTED: 'Đã liên hệ',
  DONE: 'Đã xong',
  CANCELLED: 'Đã hủy',
} as const

export type SubmissionStatusValue = keyof typeof SUBMISSION_STATUS_LABEL

export const SUBMISSION_NEXT: Record<SubmissionStatusValue, SubmissionStatusValue[]> = {
  NEW: ['CONTACTED', 'CANCELLED'],
  CONTACTED: ['DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
}

export function isSubmissionStatus(value: string): value is SubmissionStatusValue {
  return value in SUBMISSION_STATUS_LABEL
}

export function formatVndAmount(value: number) {
  return `${Math.round(value || 0).toLocaleString('vi-VN')} VNĐ`
}

export function formatWhen(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', { hour12: false })
}
