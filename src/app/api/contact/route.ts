import { NextRequest, NextResponse } from 'next/server'
import { clientKey, escapeHtml, readGmailAuth, sendGmail, singleLine } from '../../../../lib/mail'
import { rateLimit } from '../../../../lib/rate-limit'
import { saveSubmission } from '@/lib/submissions'
import { getStoreSettings } from '@/lib/store-settings'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`contact:${clientKey(request)}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const name = singleLine(String(body?.name || ''), 80)
    const email = singleLine(String(body?.email || ''), 120).toLowerCase()
    const phone = singleLine(String(body?.phone || ''), 20)
    const message = String(body?.message || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 2000)
    const subject = singleLine(String(body?.subject || ''), 120)
    const source = body?.source === 'homepage' ? 'homepage' : 'contact'

    if (!name || !email || !message || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ họ tên, email hợp lệ và nội dung.' },
        { status: 400 }
      )
    }

    const saved = await saveSubmission({
      kind: 'CONTACT',
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      source,
    })
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Chưa lưu được thông tin. Vui lòng gọi hotline.' },
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
      subject: subject ? `[Liên hệ] ${subject} - ${name}` : `Liên hệ từ khách hàng: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #041434;">${subject ? `Liên hệ: ${escapeHtml(subject)}` : 'Liên hệ từ khách hàng'}</h2>
          <p><strong>Họ và tên:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${phone ? `<p><strong>Điện thoại:</strong> ${escapeHtml(phone)}</p>` : ''}
          <p><strong>Nội dung:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          <p style="color: #666; font-size: 12px;">Thời gian: ${escapeHtml(new Date().toLocaleString('vi-VN'))}</p>
        </div>
      `,
      })
      } catch (error) {
        console.error('Contact mail failed after save', error instanceof Error ? error.name : 'error')
      }
    }

    return NextResponse.json({ success: true, message: 'Đã ghi nhận thông tin. An Lạc Stone sẽ liên hệ lại.' })
  } catch (error) {
    console.error('Error saving contact', error instanceof Error ? error.name : 'error')
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
