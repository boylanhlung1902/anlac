import { NextRequest } from 'next/server'
import { adminError, adminOk, pageInfo, prismaCode, readPage, requireAdmin } from '@/lib/admin-http'
import { parseCategoryWrite } from '@/lib/admin-product'
import { singleLine } from '../../../../../lib/mail'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = readPage(searchParams, 50)
    const search = singleLine(searchParams.get('search') || '', 80)
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}
    const [categories, total] = await Promise.all([
      auth.db.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: { _count: { select: { products: true } } },
      }),
      auth.db.category.count({ where }),
    ])
    return adminOk({
      categories: categories.map((category) => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
      pagination: pageInfo(page, limit, total),
    })
  } catch (error) {
    console.error('Admin categories failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được danh mục.')
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const parsed = parseCategoryWrite(await request.json().catch(() => null))
  if (!parsed.ok) return adminError(400, parsed.message)
  try {
    const category = await auth.db.category.create({ data: parsed.data })
    return adminOk({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }, 'Đã tạo danh mục.')
  } catch (error) {
    if (prismaCode(error) === 'P2002') return adminError(409, 'Tên hoặc đường dẫn danh mục đã tồn tại.')
    console.error('Admin category create failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tạo được danh mục.')
  }
}
