'use client'

interface PayPalFallbackProps {
  amount: number
  onSuccess: (details: any) => void
  onError: (error: any) => void
  onCancel: () => void
}

export default function PayPalFallback({ 
  amount, 
  onSuccess, 
  onError, 
  onCancel 
}: PayPalFallbackProps) {
  const handleMockPayment = () => {
    // Simulate successful payment for development
    const mockDetails = {
      id: `PAY-${Date.now()}`,
      status: 'COMPLETED',
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
      intent: 'CAPTURE',
      payment_source: {
        paypal: {
          account_id: 'test@example.com',
          account_type: 'PERSONAL',
          name: {
            given_name: 'Test',
            surname: 'User'
          }
        }
      },
      purchase_units: [
        {
          reference_id: `REF-${Date.now()}`,
          amount: {
            currency_code: 'USD',
            value: amount.toString()
          },
          payee: {
            email_address: 'seller@example.com'
          },
          shipping: {
            name: {
              full_name: 'Test User'
            }
          },
          payments: {
            captures: [
              {
                id: `CAPTURE-${Date.now()}`,
                status: 'COMPLETED',
                amount: {
                  currency_code: 'USD',
                  value: amount.toString()
                },
                final_capture: true,
                seller_protection: {
                  status: 'ELIGIBLE',
                  dispute_categories: ['ITEM_NOT_RECEIVED', 'UNAUTHORIZED_TRANSACTION']
                },
                create_time: new Date().toISOString(),
                update_time: new Date().toISOString()
              }
            ]
          }
        }
      ]
    }
    
    onSuccess(mockDetails)
  }

  return (
    <div className="text-center p-4">
      <div className="alert alert-info mb-3" role="alert">
        <i className="fas fa-info-circle me-2"></i>
        <strong>Chế độ Development</strong>
        <br />
        PayPal đang trong chế độ test. Sử dụng nút bên dưới để mô phỏng thanh toán thành công.
      </div>
      
      <div className="d-grid gap-2">
        <button 
          className="btn btn-success btn-lg"
          onClick={handleMockPayment}
        >
          <i className="fas fa-credit-card me-2"></i>
          Mô Phỏng Thanh Toán Thành Công
        </button>
        
        <button 
          className="btn btn-outline-secondary"
          onClick={onCancel}
        >
          <i className="fas fa-times me-2"></i>
          Hủy Thanh Toán
        </button>
      </div>
      
      <div className="mt-3">
        <small className="text-muted">
          <strong>Thông tin test:</strong>
          <br />
          • Số tiền: ${amount} USD
          <br />
          • Trạng thái: Mô phỏng thành công
          <br />
          • Mã giao dịch: PAY-{Date.now()}
        </small>
      </div>
    </div>
  )
} 