export const DEFAULT_CRAFT = 'Thủ công tinh xảo'
export const DEFAULT_WARRANTY = '12 tháng'
export const DEFAULT_HIGHLIGHTS = [
  'Chế tác thủ công tinh xảo',
  'Bảo hành 12 tháng',
  'Tư vấn phong thủy theo không gian',
  'Giao hàng toàn quốc',
]

export function shownCraft(value?: string | null) {
  const text = (value || '').trim()
  return text || DEFAULT_CRAFT
}

export function shownWarranty(value?: string | null) {
  const text = (value || '').trim()
  return text || DEFAULT_WARRANTY
}

export function shownHighlights(value?: string[] | null) {
  const lines = (value || []).map((item) => item.trim()).filter(Boolean)
  return lines.length > 0 ? lines : DEFAULT_HIGHLIGHTS
}
