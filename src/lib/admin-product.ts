import { singleLine } from '../../lib/mail'
import { slugify } from './slug'

export type ProductWrite = {
  name: string
  description: string
  categoryId: number
  priceVND: number
  price: number
  netPrice: number
  tax: number
  stock: number
  image: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  material: string | null
  origin: string | null
  dimensions: string | null
  weight: number | null
  craft: string | null
  warranty: string | null
  highlights: string[]
  slug: string
}

function cleanImage(value: unknown) {
  const image = singleLine(String(value || ''), 300)
  if (!image) return null
  if (image.startsWith('/') && !image.startsWith('//') && !image.includes('\\')) return image
  try {
    const url = new URL(image)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString().slice(0, 300)
  } catch {
    return null
  }
  return null
}

function moneyFromVnd(priceVND: number) {
  return Math.round((priceVND / 24000) * 100) / 100
}

export function parseProductWrite(body: unknown): { ok: true; data: ProductWrite } | { ok: false; message: string } {
  if (!body || typeof body !== 'object') return { ok: false, message: 'Dữ liệu sản phẩm không hợp lệ.' }
  const source = body as Record<string, unknown>
  const name = singleLine(String(source.name || ''), 180)
  const description = String(source.description || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 8000)
  const categoryId = Number(source.categoryId)
  const priceVND = Number(source.priceVND)
  const stock = Number(source.stock)
  const tax = source.tax == null || source.tax === '' ? 10 : Number(source.tax)
  const image = cleanImage(source.image)
  const slugInput = singleLine(String(source.slug || ''), 80)
  const slug = slugify(slugInput || name)
  const material = singleLine(String(source.material || ''), 120) || null
  const origin = singleLine(String(source.origin || ''), 120) || null
  const dimensions = singleLine(String(source.dimensions || ''), 120) || null
  const craft = singleLine(String(source.craft || ''), 160) || null
  const warranty = singleLine(String(source.warranty || ''), 160) || null
  const highlightLines = Array.isArray(source.highlights)
    ? source.highlights
    : String(source.highlights || '').split(/\r?\n/)
  const highlights: string[] = []
  for (const item of highlightLines) {
    const line = singleLine(String(item || ''), 80)
    if (!line || highlights.includes(line)) continue
    highlights.push(line)
    if (highlights.length > 8) return { ok: false, message: 'Phù hợp không gian tối đa 8 dòng.' }
  }
  const weightRaw = String(source.weight ?? '').trim()
  const weight = weightRaw === '' ? null : Number(weightRaw)

  if (name.length < 2) return { ok: false, message: 'Tên sản phẩm cần ít nhất 2 ký tự.' }
  if (!description) return { ok: false, message: 'Cần nhập mô tả sản phẩm.' }
  if (!Number.isInteger(categoryId) || categoryId <= 0) return { ok: false, message: 'Chọn danh mục hợp lệ.' }
  if (!Number.isInteger(priceVND) || priceVND < 0 || priceVND > 2_000_000_000) {
    return { ok: false, message: 'Giá phải là số nguyên từ 0 đến 2 tỷ. Nhập 0 nếu liên hệ báo giá.' }
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return { ok: false, message: 'Tồn kho phải từ 0 đến 100000.' }
  if (!Number.isInteger(tax) || tax < 0 || tax > 100) return { ok: false, message: 'Thuế phải từ 0 đến 100.' }
  if (!image) return { ok: false, message: 'Ảnh chính phải là đường dẫn /images/... hoặc http(s).' }
  if (!slug) return { ok: false, message: 'Không tạo được đường dẫn sản phẩm.' }
  if (weight != null && (!Number.isFinite(weight) || weight < 0 || weight > 100000)) {
    return { ok: false, message: 'Khối lượng không hợp lệ.' }
  }

  const extra = Array.isArray(source.images)
    ? source.images
    : String(source.images || '').split(/\r?\n/)
  const images: string[] = []
  for (const item of extra) {
    const cleaned = cleanImage(item)
    if (String(item || '').trim() && !cleaned) return { ok: false, message: 'Có đường dẫn ảnh phụ không hợp lệ.' }
    if (cleaned && !images.includes(cleaned)) images.push(cleaned)
    if (images.length > 12) return { ok: false, message: 'Tối đa 12 ảnh.' }
  }
  if (!images.includes(image)) images.unshift(image)

  const price = moneyFromVnd(priceVND)
  return {
    ok: true,
    data: {
      name,
      description,
      categoryId,
      priceVND,
      price,
      netPrice: price,
      tax,
      stock,
      image,
      images,
      isActive: source.isActive !== false && source.isActive !== 'false',
      isFeatured: source.isFeatured === true || source.isFeatured === 'true',
      material,
      origin,
      dimensions,
      weight,
      craft,
      warranty,
      highlights,
      slug,
    },
  }
}

export function parseProductFlags(body: unknown) {
  if (!body || typeof body !== 'object') return { ok: false as const, message: 'Dữ liệu không hợp lệ.' }
  const source = body as Record<string, unknown>
  const keys = Object.keys(source)
  if (keys.length === 0 || keys.some((key) => key !== 'isActive' && key !== 'isFeatured' && key !== 'stock')) {
    return { ok: false as const, message: 'Chỉ cập nhật trạng thái, nổi bật hoặc tồn kho.' }
  }
  const data: { isActive?: boolean; isFeatured?: boolean; stock?: number } = {}
  if ('isActive' in source) data.isActive = source.isActive === true || source.isActive === 'true'
  if ('isFeatured' in source) data.isFeatured = source.isFeatured === true || source.isFeatured === 'true'
  if ('stock' in source) {
    const stock = Number(source.stock)
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
      return { ok: false as const, message: 'Tồn kho phải từ 0 đến 100000.' }
    }
    data.stock = stock
  }
  return { ok: true as const, data }
}

export function parseCategoryWrite(body: unknown) {
  if (!body || typeof body !== 'object') return { ok: false as const, message: 'Dữ liệu danh mục không hợp lệ.' }
  const source = body as Record<string, unknown>
  const name = singleLine(String(source.name || ''), 120)
  const description = String(source.description || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 2000)
  const image = source.image ? cleanImage(source.image) : null
  if (source.image && String(source.image).trim() && !image) {
    return { ok: false as const, message: 'Ảnh danh mục phải là đường dẫn /images/... hoặc http(s).' }
  }
  const slug = slugify(singleLine(String(source.slug || ''), 80) || name)
  if (name.length < 2) return { ok: false as const, message: 'Tên danh mục cần ít nhất 2 ký tự.' }
  if (!slug) return { ok: false as const, message: 'Không tạo được đường dẫn danh mục.' }
  return { ok: true as const, data: { name, description: description || null, image, slug } }
}
