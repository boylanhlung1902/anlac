'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import PayPalButton from './PayPalButton'
import PayPalFallback from './PayPalFallback'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error' | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [useFallback, setUseFallback] = useState(false)

  const totalPrice = getTotalPrice()
  const totalPriceUSD = Math.round(totalPrice / 24000) // Convert VND to USD (approximate)

  const handlePaymentSuccess = (details: any) => {
    setPaymentStatus('success')
    setPaymentDetails(details)
    clearCart()
    
    // Auto close after 3 seconds
    setTimeout(() => {
      onClose()
      setPaymentStatus(null)
      setPaymentDetails(null)
    }, 3000)
  }

  const handlePaymentError = (error: any) => {
    setPaymentStatus('error')
    console.error('Payment error:', error)
  }

  const handlePaymentCancel = () => {
    setPaymentStatus('pending')
  }

  const handleFallbackToggle = () => {
    setUseFallback(!useFallback)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
        style={{ 
          opacity: 0.5, 
          zIndex: 1040 
        }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div 
        className="position-fixed top-50 start-50 translate-middle bg-white rounded-3 shadow-lg"
        style={{ 
          width: '90%',
          maxWidth: '600px',
          zIndex: 1050,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
          <h4 className="mb-0">
            <i className="fas fa-credit-card me-2 text-success"></i>
            Thanh Toán
          </h4>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Content */}
        <div className="p-4">
          {paymentStatus === 'success' ? (
            <div className="text-center">
              <div className="mb-4">
                <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="text-success mb-3">Thanh Toán Thành Công!</h4>
              <p className="text-muted mb-3">
                Cảm ơn bạn đã mua sắm tại An Lạc Stone. Đơn hàng của bạn đã được xác nhận.
              </p>
              {paymentDetails && (
                <div className="bg-light p-3 rounded mb-3">
                  <small className="text-muted">
                    <strong>Mã giao dịch:</strong> {paymentDetails.id}
                  </small>
                </div>
              )}
              <button className="btn btn-success" onClick={onClose}>
                Hoàn Tất
              </button>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="text-center">
              <div className="mb-4">
                <i className="fas fa-exclamation-circle text-danger" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="text-danger mb-3">Thanh Toán Thất Bại</h4>
              <p className="text-muted mb-3">
                Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
              </p>
              <button 
                className="btn btn-outline-secondary me-2" 
                onClick={() => setPaymentStatus(null)}
              >
                Thử Lại
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="mb-4">
                <h5 className="mb-3">Tóm Tắt Đơn Hàng</h5>
                <div className="bg-light p-3 rounded">
                  {cartItems.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <small className="text-muted">Số lượng: {item.quantity}</small>
                      </div>
                      <span className="text-success">{item.price}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Tổng cộng:</strong>
                    <strong className="text-success">{totalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Tương đương:</small>
                    <small className="text-muted">~${totalPriceUSD} USD</small>
                  </div>
                </div>
              </div>

              {/* Development Mode Toggle */}
              <div className="mb-4">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="fallbackToggle"
                    checked={useFallback}
                    onChange={handleFallbackToggle}
                  />
                  <label className="form-check-label" htmlFor="fallbackToggle">
                    <i className="fas fa-code me-2"></i>
                    Chế độ Development (Mô phỏng thanh toán)
                  </label>
                </div>
                <small className="text-muted">
                  Bật chế độ này để test thanh toán mà không cần PayPal thực.
                </small>
              </div>

              {/* Payment Methods */}
              <div className="mb-4">
                <h5 className="mb-3">Phương Thức Thanh Toán</h5>
                <div className="border rounded p-3">
                  {useFallback ? (
                    <PayPalFallback
                      amount={totalPriceUSD}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  ) : (
                    <>
                      <div className="d-flex align-items-center mb-3">
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                          alt="PayPal" 
                          className="me-3"
                          style={{ height: '23px' }}
                        />
                        <span className="fw-bold">PayPal</span>
                      </div>
                      <p className="text-muted small mb-3">
                        Thanh toán an toàn và nhanh chóng với PayPal. Bạn có thể sử dụng thẻ tín dụng, 
                        thẻ ghi nợ hoặc tài khoản PayPal của mình.
                      </p>
                      
                      <PayPalButton
                        amount={totalPriceUSD}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onCancel={handlePaymentCancel}
                        disabled={cartItems.length === 0}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-light p-3 rounded">
                <h6 className="mb-2">
                  <i className="fas fa-info-circle text-info me-2"></i>
                  Thông Tin Bổ Sung
                </h6>
                <ul className="list-unstyled small text-muted mb-0">
                  <li>• Thanh toán được xử lý an toàn bởi PayPal</li>
                  <li>• Không lưu trữ thông tin thẻ tín dụng</li>
                  <li>• Hỗ trợ nhiều loại tiền tệ</li>
                  <li>• Giao hàng miễn phí cho đơn hàng trên 500,000 VNĐ</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
} 