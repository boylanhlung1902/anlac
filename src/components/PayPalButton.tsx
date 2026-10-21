'use client'

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useState } from 'react'

interface PayPalButtonProps {
  amount: number
  onSuccess: (details: any) => void
  onError: (error: any) => void
  onCancel: () => void
  disabled?: boolean
}

export default function PayPalButton({ 
  amount, 
  onSuccess, 
  onError, 
  onCancel, 
  disabled = false 
}: PayPalButtonProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const [isProcessing, setIsProcessing] = useState(false)

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toString(),
            currency_code: 'USD'
          },
          description: 'Thanh toán cho đá cảnh và mỹ nghệ'
        }
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      }
    })
  }

  const onApprove = async (data: any, actions: any) => {
    setIsProcessing(true)
    try {
      const details = await actions.order.capture()
      onSuccess(details)
    } catch (error) {
      console.error('Payment capture error:', error)
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isPending) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang tải PayPal...</p>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="text-center p-3">
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Không thể tải PayPal. Vui lòng thử lại sau.
        </div>
        <button 
          className="btn btn-outline-secondary mt-2"
          onClick={() => window.location.reload()}
        >
          Tải Lại Trang
        </button>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Processing...</span>
        </div>
        <p className="mt-2">Đang xử lý thanh toán...</p>
      </div>
    )
  }

  if (amount <= 0) {
    return (
      <div className="text-center p-3">
        <div className="alert alert-info" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          Tổng tiền phải lớn hơn 0 để thanh toán.
        </div>
      </div>
    )
  }

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err) => {
        console.error('PayPal error:', err)
        onError(err)
      }}
      onCancel={onCancel}
      disabled={disabled}
      style={{
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      }}
    />
  )
} 