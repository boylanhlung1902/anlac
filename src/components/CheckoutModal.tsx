'use client'

import { FormEvent, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { QUOTE_PRICE_LABEL, formatPriceVND } from '@/services/api'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const totalPrice = getTotalPrice()
  const hasUnpricedItem = cartItems.some((item) => !item.price.replace(/[^\d]/g, ''))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (cartItems.length === 0 || status === 'sending') return
    setStatus('sending')
    setMessage('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          note,
          items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.success) {
        setStatus('error')
        setMessage(data?.message || 'Không gửi được đơn hàng. Vui lòng thử lại.')
        return
      }
      clearCart()
      setStatus('success')
      setMessage(data.message)
    } catch {
      setStatus('error')
      setMessage('Không gửi được đơn hàng. Vui lòng thử lại.')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
        style={{ opacity: 0.5, zIndex: 1060 }}
        onClick={onClose}
      />
      <div
        className="position-fixed top-50 start-50 translate-middle bg-white rounded-3 shadow-lg"
        style={{ width: '90%', maxWidth: '640px', zIndex: 1070, maxHeight: '90vh', overflowY: 'auto' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-dialog-title"
      >
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
          <h4 className="mb-0" id="order-dialog-title">Gửi đơn hàng</h4>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Đóng" />
        </div>

        <div className="p-4">
          {status === 'success' ? (
            <div className="text-center">
              <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }} />
              <h4 className="mt-3">Đã gửi đơn hàng</h4>
              <p className="text-muted">{message}</p>
              <button type="button" className="btn btn-success" onClick={onClose}>Đóng</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bg-light p-3 rounded mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between gap-3 mb-2">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="small text-muted">Số lượng: {item.quantity}</div>
                    </div>
                    <span>{item.price}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Tổng đã niêm yết</strong>
                  <strong>{totalPrice > 0 ? formatPriceVND(totalPrice) : QUOTE_PRICE_LABEL}</strong>
                </div>
                {hasUnpricedItem && (
                  <p className="small text-muted mb-0 mt-2">Sản phẩm chưa có giá sẽ được báo khi xác nhận đơn.</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="order-name">Họ và tên</label>
                <input id="order-name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="order-phone">Số điện thoại</label>
                <input id="order-phone" className="form-control" value={phone} onChange={(event) => setPhone(event.target.value)} required maxLength={20} inputMode="tel" />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="order-email">Email</label>
                <input id="order-email" type="email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={120} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="order-note">Ghi chú</label>
                <textarea id="order-note" className="form-control" rows={3} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
              </div>

              {status === 'error' && <p className="text-danger">{message}</p>}

              <button type="submit" className="btn btn-success w-100" disabled={status === 'sending' || cartItems.length === 0}>
                {status === 'sending' ? 'Đang gửi...' : 'Gửi nội dung đơn hàng'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
