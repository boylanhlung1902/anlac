export type StoreProfile = {
  storeName: string
  phone: string
  email: string
  address: string
  hoursWeekday: string
  hoursSaturday: string
  hoursSunday: string
}

export const STORE_DEFAULTS: StoreProfile = {
  storeName: 'An Lạc Stone',
  phone: '087-770-5979',
  email: 'hoangminhtrung1902@gmail.com',
  address: 'Lô B5-4 Hoàng Minh Thắng, Ngũ Hành Sơn, Đà Nẵng.',
  hoursWeekday: 'Thứ 2 - Thứ 6: 8:00 - 18:00',
  hoursSaturday: 'Thứ 7: 8:00 - 16:00',
  hoursSunday: 'Chủ Nhật: 9:00 - 15:00',
}

export function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : 'tel:'
}
