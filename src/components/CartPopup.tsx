'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import CheckoutModal from './CheckoutModal'

interface CartItem {
  id: number
  name: string
  price: string
  image: string
  quantity: number
}

interface CartPopupProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemoveItem: (id: number) => void
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function unitPrice(price: string) {
  const digits = price.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

function formatVND(value: number) {
  return value > 0 ? `${value.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ để báo giá'
}

export default function CartPopup({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }: CartPopupProps) {
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    const items = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const price = cartItems.reduce((sum, item) => sum + unitPrice(item.price) * item.quantity, 0)
    setTotalItems(items)
    setTotalPrice(price)
  }, [cartItems])

  const handleExportPDF = async () => {
    if (!cartItems.length) return
    try {
      const { jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      const now = new Date()
      const dateLabel = now.toLocaleDateString('vi-VN')
      const invoiceNo = `HD${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
      const hasQuote = cartItems.some((item) => unitPrice(item.price) <= 0)
      const rows = cartItems.map((item, index) => {
        const unit = unitPrice(item.price)
        const line = unit > 0 ? unit * item.quantity : 0
        return `
          <tr>
            <td style="padding:8px;border:1px solid #c5ceda;text-align:center;">${index + 1}</td>
            <td style="padding:8px;border:1px solid #c5ceda;">${escapeHtml(item.name)}</td>
            <td style="padding:8px;border:1px solid #c5ceda;text-align:right;">${escapeHtml(unit > 0 ? formatVND(unit) : 'Liên hệ')}</td>
            <td style="padding:8px;border:1px solid #c5ceda;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #c5ceda;text-align:right;">${escapeHtml(line > 0 ? formatVND(line) : 'Liên hệ')}</td>
          </tr>`
      }).join('')

      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-99999px'
      container.style.top = '0'
      container.style.width = '794px'
      container.style.padding = '32px'
      container.style.background = '#fff'
      container.style.color = '#041434'
      container.style.fontFamily = "Roboto, 'Segoe UI', Arial, sans-serif"
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;">
          <div>
            <div style="font-size:22px;font-weight:700;letter-spacing:0.04em;">AN LẠC STONE</div>
            <div style="margin-top:4px;">Đá cảnh và mỹ nghệ</div>
            <div>Điện thoại: 087-770-5979</div>
            <div>Email: hoangminhtrung1902@gmail.com</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px;font-weight:700;">HÓA ĐƠN BÁN HÀNG</div>
            <div style="margin-top:8px;">Số: ${escapeHtml(invoiceNo)}</div>
            <div>Ngày: ${escapeHtml(dateLabel)}</div>
          </div>
        </div>
        <div style="height:2px;background:#041434;margin:16px 0;"></div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#041434;color:#fff;">
              <th style="padding:8px;border:1px solid #041434;">STT</th>
              <th style="padding:8px;border:1px solid #041434;text-align:left;">Sản phẩm</th>
              <th style="padding:8px;border:1px solid #041434;text-align:right;">Đơn giá</th>
              <th style="padding:8px;border:1px solid #041434;">Số lượng</th>
              <th style="padding:8px;border:1px solid #041434;text-align:right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:16px;text-align:right;font-size:16px;font-weight:700;">
          Tổng đã niêm yết: ${escapeHtml(totalPrice > 0 ? formatVND(totalPrice) : 'Liên hệ để báo giá')}
        </div>
        <p style="margin-top:18px;font-size:12px;line-height:1.5;">
          Hóa đơn này ghi nhận sản phẩm khách đã chọn trên website An Lạc Stone.
          ${hasQuote ? 'Sản phẩm ghi Liên hệ chưa có giá niêm yết và sẽ được báo khi xác nhận đơn.' : ''}
        </p>
        <div style="display:flex;justify-content:space-between;margin-top:36px;font-size:13px;">
          <div style="text-align:center;width:40%;">Người mua<br><br><br>Ký và ghi rõ họ tên</div>
          <div style="text-align:center;width:40%;">Người bán<br><br><br>An Lạc Stone</div>
        </div>
      `

      document.body.appendChild(container)
      await new Promise((resolve) => setTimeout(resolve, 50))
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })
      document.body.removeChild(container)

      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const imgData = canvas.toDataURL('image/png')

      if (imgHeight <= pageHeight - 40) {
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight)
      } else {
        let offset = 0
        const sliceHeight = Math.round(((pageHeight - 40) * canvas.width) / imgWidth)
        while (offset < canvas.height) {
          const slice = document.createElement('canvas')
          const height = Math.min(sliceHeight, canvas.height - offset)
          slice.width = canvas.width
          slice.height = height
          slice.getContext('2d')?.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height)
          pdf.addImage(slice.toDataURL('image/png'), 'PNG', 20, 20, imgWidth, (height * imgWidth) / canvas.width)
          offset += height
          if (offset < canvas.height) pdf.addPage()
        }
      }

      pdf.save(`hoa-don-an-lac-stone-${invoiceNo}.pdf`)
    } catch (error) {
      console.error('Export PDF failed:', error)
      alert('Không thể xuất hóa đơn. Vui lòng thử lại.')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
        style={{ opacity: 0.5, zIndex: 1040 }}
        onClick={onClose}
      />

      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg cart-popup"
        style={{ zIndex: 1050, transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out' }}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">
            <i className="fas fa-shopping-cart me-2"></i>
            Giỏ Hàng ({totalItems})
          </h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Đóng" />
        </div>

        <div className="flex-grow-1" style={{ height: 'calc(100vh - 240px)', overflowY: 'auto' }}>
          {cartItems.length === 0 ? (
            <div className="text-center p-5">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <p className="text-muted">Giỏ hàng trống</p>
              <button className="btn btn-success" onClick={onClose}>Tiếp tục mua sắm</button>
            </div>
          ) : (
            <div className="p-3">
              {cartItems.map((item) => (
                <div key={item.id} className="card mb-3">
                  <div className="card-body p-3">
                    <div className="row align-items-center">
                      <div className="col-3">
                        <Image src={item.image} alt={item.name} width={60} height={60} className="img-fluid rounded" />
                      </div>
                      <div className="col-6">
                        <h6 className="mb-1">{item.name}</h6>
                        <p className="text-success mb-0">{item.price}</p>
                      </div>
                      <div className="col-3">
                        <div className="d-flex flex-column align-items-end">
                          <div className="input-group input-group-sm cart-qty-group mb-2">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}><i className="fas fa-minus"></i></button>
                            <input type="number" className="form-control text-center cart-qty-input" value={item.quantity} onChange={(e) => onUpdateQuantity(item.id, Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))} min="1" max="99" />
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}><i className="fas fa-plus"></i></button>
                          </div>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onRemoveItem(item.id)}><i className="fas fa-trash"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-top p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Tổng cộng:</h6>
              <h5 className="text-success mb-0">{formatVND(totalPrice)}</h5>
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-success" onClick={() => setIsCheckoutOpen(true)}>
                <i className="fas fa-paper-plane me-2"></i>
                Gửi đơn hàng
              </button>
              <button className="btn btn-outline-primary" onClick={handleExportPDF} title="Xuất hóa đơn PDF">
                <i className="fas fa-file-pdf me-2"></i>
                Xuất hóa đơn PDF
              </button>
              <button className="btn btn-outline-secondary" onClick={onClose}>Tiếp tục mua sắm</button>
            </div>
          </div>
        )}
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
