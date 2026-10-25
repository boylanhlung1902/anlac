import { randomBytes } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest } from 'next/server'
import { adminError, adminOk, requireAdmin } from '@/lib/admin-http'
import { clientKey } from '../../../../../lib/mail'
import { rateLimit } from '../../../../../lib/rate-limit'

const MAX_BYTES = 4 * 1024 * 1024
const MAX_FILES = 8

function imageKind(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp'
  return null
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  if (!rateLimit(`admin-upload:${clientKey(request)}`, 30, 15 * 60 * 1000)) {
    return adminError(429, 'Bạn tải ảnh quá nhiều lần. Vui lòng thử lại sau.')
  }
  try {
    const form = await request.formData()
    const files = form.getAll('files').filter((item): item is File => item instanceof File)
    if (files.length === 0 || files.length > MAX_FILES) return adminError(400, 'Chọn từ 1 đến 8 ảnh.')
    const directory = path.join(process.cwd(), 'public', 'images', 'uploads')
    await mkdir(directory, { recursive: true })
    const paths: string[] = []
    for (const file of files) {
      if (file.size <= 0 || file.size > MAX_BYTES) return adminError(400, 'Mỗi ảnh phải nhỏ hơn 4 MB.')
      const bytes = Buffer.from(await file.arrayBuffer())
      const kind = imageKind(bytes)
      if (!kind) return adminError(400, 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.')
      const filename = `${Date.now()}-${randomBytes(8).toString('hex')}.${kind}`
      await writeFile(path.join(directory, filename), bytes)
      paths.push(`/images/uploads/${filename}`)
    }
    return adminOk({ paths }, 'Đã tải ảnh.')
  } catch (error) {
    console.error('Admin upload failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được ảnh.')
  }
}
