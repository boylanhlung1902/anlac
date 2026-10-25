import { NextRequest, NextResponse } from 'next/server'
import { findCatalogProduct, readFromDatabase } from '../../../../lib/catalog'
import { clientKey, escapeHtml, readGmailAuth, sendGmail, singleLine } from '../../../../lib/mail'
import { saveSubmission } from '@/lib/submissions'
import { getStoreSettings } from '@/lib/store-settings'
import { rateLimit } from '../../../../lib/rate-limit'
import { formatPriceVND } from '../../../../src/services/api'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+\s().-]{8,20}$/

type OrderLine = {
  id: number
  name: string
  quantity: number
  unit: number
}

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`order:${clientKey(request)}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: 'Bạn gửi quá nhiều đơn. Vui lòng thử lại sau.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const name = singleLine(String(body?.name || ''), 80)
    const email = singleLine(String(body?.email || ''), 120).toLowerCase()
    const phone = singleLine(String(body?.phone || ''), 20)
    const note = String(body?.note || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 500)
    const rawItems = Array.isArray(body?.items) ? body.items.slice(0, 30) : []

    if (!name || !EMAIL_PATTERN.test(email) || !PHONE_PATTERN.test(phone) || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập họ tên, email, số điện thoại và ít nhất một sản phẩm.' },
        { status: 400 }
      )
    }

    const requested = new Map<number, number>()
    for (const item of rawItems) {
      const id = Number(item?.id)
      const quantity = Number(item?.quantity)
      if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json(
          { success: false, message: 'Đơn hàng có sản phẩm không hợp lệ.' },
          { status: 400 }
        )
      }
      requested.set(id, Math.min(99, (requested.get(id) || 0) + quantity))
    }

    const ids = Array.from(requested.keys())
    const loaded = await readFromDatabase((db) =>
      db.product.findMany({
        where: { id: { in: ids }, isActive: true },
        select: { id: true, name: true, priceVND: true },
      })
    )
    const fromDb = new Map((loaded.ok ? loaded.value : []).map((product) => [product.id, product]))

    const lines: OrderLine[] = []
    for (const [id, quantity] of Array.from(requested.entries())) {
      const product = fromDb.get(id) || findCatalogProduct(id)
      if (!product) {
        return NextResponse.json(
          { success: false, message: 'Một sản phẩm trong giỏ không còn được bán.' },
          { status: 400 }
        )
      }
      lines.push({
        id,
        name: product.name,
        quantity,
        unit: product.priceVND > 0 ? product.priceVND : 0,
      })
    }

    const priced = lines.reduce((sum, line) => sum + line.unit * line.quantity, 0)
    const hasQuote = lines.some((line) => line.unit <= 0)
    const rows = lines.map((line, index) => {
      const lineTotal = line.unit > 0 ? formatPriceVND(line.unit * line.quantity) : 'Liên hệ để báo giá'
      return `<tr>
        <td style="padding:8px;border:1px solid #d7deea;">${index + 1}</td>
        <td style="padding:8px;border:1px solid #d7deea;">${escapeHtml(line.name)}</td>
        <td style="padding:8px;border:1px solid #d7deea;text-align:right;">${escapeHtml(line.unit > 0 ? formatPriceVND(line.unit) : 'Liên hệ để báo giá')}</td>
        <td style="padding:8px;border:1px solid #d7deea;text-align:center;">${line.quantity}</td>
        <td style="padding:8px;border:1px solid #d7deea;text-align:right;">${escapeHtml(lineTotal)}</td>
      </tr>`
    }).join('')

    const saved = await saveSubmission({
      kind: 'ORDER',
      name,
      email,
      phone,
      message: note || null,
      totalVND: priced,
      source: 'cart',
      items: lines.map((line) => ({
        productId: line.id,
        name: line.name,
        quantity: line.quantity,
        priceVND: line.unit,
      })),
    })
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Chưa lưu được đơn hàng. Vui lòng gọi hotline.' },
        { status: 503 }
      )
    }

    const settings = await getStoreSettings()
    const { user, pass } = readGmailAuth()
    if (user && pass.length === 16) {
    try {
    await sendGmail({
      to: settings.email,
      replyTo: email,
      subject: `Đơn hàng mới từ ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #041434;">
          <h2 style="margin-bottom: 4px;">Đơn hàng mới</h2>
          <p style="margin-top: 0; color: #555;">An Lạc Stone nhận được yêu cầu xác nhận đơn từ website.</p>
          <p><strong>Họ và tên:</strong> ${escapeHtml(name)}</p>
          <p><strong>Điện thoại:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${note ? `<p><strong>Ghi chú:</strong></p><p style="white-space: pre-wrap;">${escapeHtml(note)}</p>` : ''}
          <table style="width:100%; border-collapse:collapse; margin-top:16px;">
            <thead>
              <tr style="background:#041434; color:#fff;">
                <th style="padding:8px; text-align:left;">STT</th>
                <th style="padding:8px; text-align:left;">Sản phẩm</th>
                <th style="padding:8px; text-align:right;">Đơn giá</th>
                <th style="padding:8px; text-align:center;">SL</th>
                <th style="padding:8px; text-align:right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin-top:16px;"><strong>Tổng giá đã niêm yết:</strong> ${escapeHtml(priced > 0 ? formatPriceVND(priced) : 'Liên hệ để báo giá')}</p>
          ${hasQuote ? '<p>Đơn có sản phẩm chưa niêm yết giá. Cần báo giá khi xác nhận.</p>' : ''}
          <p style="color:#666; font-size:12px;">Thời gian: ${escapeHtml(new Date().toLocaleString('vi-VN'))}</p>
        </div>
      `,
    })
    } catch (error) {
      console.error('Order mail failed after save', error instanceof Error ? error.name : 'error')
    }
    }

    return NextResponse.json({
      success: true,
      message: 'Đơn hàng đã được ghi nhận. An Lạc Stone sẽ liên hệ để xác nhận.',
    })
  } catch (error) {
    console.error('Error saving order', error instanceof Error ? error.name : 'error')
    return NextResponse.json(
      { success: false, message: 'Không gửi được đơn hàng. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
