import { NextRequest } from 'next/server'
import { singleLine } from '../../../../../lib/mail'
import { adminError, adminOk, requireAdmin } from '@/lib/admin-http'
import { getStoreSettings } from '@/lib/store-settings'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  return adminOk(await getStoreSettings())
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return adminError(400, 'Dữ liệu không hợp lệ.')
  const source = body as Record<string, unknown>
  const storeName = singleLine(String(source.storeName || ''), 80)
  const phone = singleLine(String(source.phone || ''), 30)
  const email = singleLine(String(source.email || ''), 120).toLowerCase()
  const address = String(source.address || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 300)
  const hoursWeekday = singleLine(String(source.hoursWeekday || ''), 80)
  const hoursSaturday = singleLine(String(source.hoursSaturday || ''), 80)
  const hoursSunday = singleLine(String(source.hoursSunday || ''), 80)
  if (storeName.length < 2 || phone.length < 8 || !EMAIL_PATTERN.test(email) || address.length < 5) {
    return adminError(400, 'Cần tên cửa hàng, số điện thoại, email hợp lệ và địa chỉ.')
  }
  if (!hoursWeekday || !hoursSaturday || !hoursSunday) {
    return adminError(400, 'Cần đủ giờ làm việc trong tuần, thứ 7 và chủ nhật.')
  }
  try {
    const saved = await auth.db.storeSetting.upsert({
      where: { id: 1 },
      update: { storeName, phone, email, address, hoursWeekday, hoursSaturday, hoursSunday },
      create: { id: 1, storeName, phone, email, address, hoursWeekday, hoursSaturday, hoursSunday },
    })
    return adminOk({
      storeName: saved.storeName,
      phone: saved.phone,
      email: saved.email,
      address: saved.address,
      hoursWeekday: saved.hoursWeekday,
      hoursSaturday: saved.hoursSaturday,
      hoursSunday: saved.hoursSunday,
    }, 'Đã cập nhật thông tin cửa hàng.')
  } catch (error) {
    console.error('Store settings update failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không lưu được thông tin cửa hàng.')
  }
}
