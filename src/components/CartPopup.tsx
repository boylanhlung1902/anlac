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

export default function CartPopup({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }: CartPopupProps) {
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    const items = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const price = cartItems.reduce((sum, item) => {
      const digits = item.price.replace(/[^\d]/g, '')
      const priceValue = digits ? parseInt(digits, 10) : 0
      return sum + priceValue * item.quantity
    }, 0)
    
    setTotalItems(items)
    setTotalPrice(price)
  }, [cartItems])

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
  }

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false)
    onClose()
  }

  const formatJPY = (value: number) => `${value.toLocaleString('ja-JP')}円`

  const ensureNotoSansJP = async () => {
    // Inject Google Font once
    const id = 'noto-sans-jp-font'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap'
      document.head.appendChild(link)
      // Wait for fonts to be ready
      if ((document as any).fonts?.ready) {
        try { await (document as any).fonts.ready } catch {}
      }
    }
  }

  const handleExportPDF = async () => {
    if (!cartItems.length) return
    try {
      await ensureNotoSansJP()
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      const now = new Date()
      const y = String(now.getFullYear())
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      const jpDate = `${y}年${m}月${d}日`
      const invoiceNo = `${Date.now()}`

      // Simple tax breakdown (10%)
      const taxRate = 0.1
      const taxAmount = Math.round(totalPrice * taxRate)
      const productAmount = totalPrice // treating as tax-included base for display

      // Build a temporary printable invoice node
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-99999px'
      container.style.top = '0'
      container.style.width = '794px' // A4 width at 96dpi approx
      container.style.padding = '24px 32px'
      container.style.background = '#fff'
      container.style.color = '#111'
      container.style.fontFamily = "'Noto Sans JP', 'Segoe UI', Arial, sans-serif"

      const itemsRows = cartItems.map((item) => {
        const unit = parseInt(item.price.replace(/[^\d]/g, '')) || 0
        const lineTotal = unit * item.quantity
        return `
          <tr>
            <td style="padding:8px 10px;border:1px solid #333;">${escapeHtml(item.name)}</td>
            <td style="padding:8px 10px;border:1px solid #333;text-align:right;">${formatJPY(unit)}</td>
            <td style="padding:8px 10px;border:1px solid #333;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 10px;border:1px solid #333;text-align:right;">${formatJPY(lineTotal)}</td>
            <td style="padding:8px 10px;border:1px solid #333;">10％</td>
          </tr>
        `
      }).join('')

      container.innerHTML = `
        <div style="text-align:center;font-weight:700;font-size:20px;letter-spacing:1px;">領収書</div>
        <div style="height:1px;background:#e5e5e5;margin:8px 0 16px 0;"></div>

        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:8px;white-space:nowrap;overflow:hidden;">
          <span style="flex-shrink:0;">伝票番号：${invoiceNo}</span>
          <span style="flex-shrink:0;">${jpDate}</span>
        </div>
        <div class="row small" style="display:flex;justify-content:space-between;align-items:flex-start;font-size:12px;">
          <div>ミヤグニ テスト 様</div>
          <div style="flex:1; text-align:left; margin-left:450px">
            <div>株式会社アイザック</div>
            <div>〒370-0044 群馬県高崎市岩押町12-13</div>
            <div>登録番号：T4070002006183</div>
            <div>電話：027-365-0221</div>
            <div>FAX：027-395-0021</div>
          </div>
        </div>
        <div class="small" style="font-size:12px;margin-top:10px;">このたびは、輸出プラットフォームをご利用いただき誠にありがとうございます。</div>
        <div class="small" style="font-size:12px;margin-bottom:14px;">以下の通り領収いたしました。</div>

        <!-- 税区分内訳 -->
        <div style="margin-top:12px;">
          <div>
            <table style="width:50%; border-collapse:collapse; font-size:12px; border:1px solid #333;">
              <thead>
                <tr style="background:transparent;">
                  <th style="text-align:left;padding:8px 10px;border:1px solid #333;">金額（税込</th>
                  <th style="text-align:right;padding:8px 10px;border:1px solid #333;">${formatJPY(totalPrice)}</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        <!-- 税区分内訳 -->
        <div style="margin-top:12px;">
          <h3 style="margin:0 0 6px 0;font-size:14px;">支払方法：クレジットカード</h3>
          <div>
            <table style="width:66.67%; border-collapse:collapse; font-size:12px; border:1px solid #333;">
              <thead>
                <tr style="background:transparent;">
                  <th style="text-align:left;padding:8px 10px;border:1px solid #333;">区分</th>
                  <th style="text-align:right;padding:8px 10px;border:1px solid #333;">商品金額</th>
                  <th style="text-align:right;padding:8px 10px;border:1px solid #333;">消費税等</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:8px 10px;border:1px solid #333;">10％対象</td>
                  <td style="padding:8px 10px;border:1px solid #333;text-align:right;">${formatJPY(productAmount)}</td>
                  <td style="padding:8px 10px;border:1px solid #333;text-align:right;">${formatJPY(taxAmount)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 10px;border:1px solid #333;">小計</td>
                  <td style="padding:8px 10px;border:1px solid #333;text-align:right;">${formatJPY(productAmount)}</td>
                  <td style="padding:8px 10px;border:1px solid #333;text-align:right;">${formatJPY(taxAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 注文内容 -->
        <div style="margin-top:14px;">
          <h3 style="margin:0 0 6px 0;font-size:14px;">注文内容</h3>
          <div>
            <table style="width:50%; border-collapse:collapse; font-size:12px; border:1px solid #333;">
              <thead>
                <tr style="background:transparent;">
                  <th style="text-align:left;padding:8px 10px;border:1px solid #333;">受付日</th>
                  <th style="text-align:left;padding:8px 10px;border:1px solid #333;font-weight:normal;">${jpDate}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:8px 10px;border:1px solid #333;font-weight:bold;">受取日</td>
                  <td style="padding:8px 10px;border:1px solid #333;">${jpDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 10px;border:1px solid #333;font-weight:bold;">受取店舗名</td>
                  <td style="padding:8px 10px;border:1px solid #333;">石垣シティ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 明細 -->
        <div style="margin-top:14px;">
          <h3 style="margin:0 0 6px 0;font-size:14px;">明細</h3>
          <div>
            <table style="width:100%; border-collapse:collapse; font-size:12px; border:1px solid #333;">
              <thead>
                <tr style="background:transparent;">
                  <th style="text-align:left;padding:8px 10px;border:1px solid #333;">商品名 (コード)</th>
                  <th style="text-align:right;padding:8px 10px;border:1px solid #333;">単価</th>
                  <th style="text-align:center;padding:8px 10px;border:1px solid #333;">数量</th>
                  <th style="text-align:right;padding:8px 10px;border:1px solid #333;">金額（税抜）</th>
                  <th style="text-align:left;padding:8px 10px;border:1px solid #333;">税率</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>
        </div>
      `

      document.body.appendChild(container)

      // Wait a frame to ensure styles are applied
      await new Promise((r) => setTimeout(r, 50))

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff'
      })
      const imgData = canvas.toDataURL('image/png')

      // Create PDF
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pageWidth - 40 * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let yPos = 40
      if (imgHeight <= pageHeight - 80) {
        pdf.addImage(imgData, 'PNG', 40, yPos, imgWidth, imgHeight)
      } else {
        // Split across pages
        let sY = 0
        const pageContentHeight = pageHeight - 80
        while (sY < canvas.height) {
          const sliceCanvas = document.createElement('canvas')
          const sliceHeight = Math.min(canvas.height - sY, Math.round((pageContentHeight * canvas.width) / imgWidth))
          sliceCanvas.width = canvas.width
          sliceCanvas.height = sliceHeight
          const ctx = sliceCanvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(canvas, 0, sY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)
          }
          const sliceImg = sliceCanvas.toDataURL('image/png')
          pdf.addImage(sliceImg, 'PNG', 40, yPos, imgWidth, pageContentHeight)
          sY += sliceHeight
          if (sY < canvas.height) pdf.addPage()
        }
      }

      pdf.save(`hoa-don-AnLacStone-${Date.now()}.pdf`)

      // Cleanup
      document.body.removeChild(container)
    } catch (e) {
      console.error('Export PDF failed:', e)
      alert('Không thể xuất PDF. Vui lòng cài đặt: npm i jspdf html2canvas rồi thử lại.')
    }
  }

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
        style={{ opacity: 0.5, zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Cart Popup */}
      <div 
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg cart-popup"
        style={{ zIndex: 1050, transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out' }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">
            <i className="fas fa-shopping-cart me-2"></i>
            Giỏ Hàng ({totalItems})
          </h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>

        {/* Cart Items */}
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
                            <input type="number" className="form-control text-center cart-qty-input" value={item.quantity} onChange={(e) => onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))} min="1" />
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

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-top p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Tổng cộng:</h6>
              <h5 className="text-success mb-0">{formatJPY(totalPrice)}</h5>
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-success" onClick={handleCheckout}>
                <i className="fas fa-credit-card me-2"></i>
                Thanh Toán với PayPal
              </button>
              <button className="btn btn-outline-primary" onClick={handleExportPDF} title="Xuất hóa đơn PDF">
                <i className="fas fa-file-pdf me-2"></i>
                Xuất hóa đơn PDF
              </button>
              <button className="btn btn-outline-secondary" onClick={onClose}>Tiếp Tục Mua Sắm</button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={handleCheckoutClose} />
    </>
  )
} 