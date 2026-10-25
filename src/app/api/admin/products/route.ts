import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { adminError, adminOk, pageInfo, prismaCode, readPage, requireAdmin } from '@/lib/admin-http'
import { parseProductWrite } from '@/lib/admin-product'
import { singleLine } from '../../../../../lib/mail'

const SORTS = ['createdAt', 'name', 'priceVND', 'stock'] as const

function serialize(product: {
  price: Prisma.Decimal
  netPrice: Prisma.Decimal
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...product,
    price: Number(product.price),
    netPrice: Number(product.netPrice),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

const productSelect = {
  id: true,
  name: true,
  description: true,
  priceVND: true,
  price: true,
  netPrice: true,
  tax: true,
  image: true,
  images: true,
  categoryId: true,
  stock: true,
  isFeatured: true,
  isActive: true,
  slug: true,
  weight: true,
  dimensions: true,
  material: true,
  origin: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductSelect

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = readPage(searchParams)
    const search = singleLine(searchParams.get('search') || '', 80)
    const status = searchParams.get('status')
    const sort = SORTS.includes(searchParams.get('sort') as typeof SORTS[number])
      ? searchParams.get('sort') as typeof SORTS[number]
      : 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    const categoryId = Number(searchParams.get('categoryId') || '')
    const where: Prisma.ProductWhereInput = {}
    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (searchParams.get('lowStock') === '1') where.stock = { lte: 5 }
    if (Number.isInteger(categoryId) && categoryId > 0) where.categoryId = categoryId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { material: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      auth.db.product.findMany({
        where,
        select: productSelect,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      auth.db.product.count({ where }),
    ])
    return adminOk({ products: products.map(serialize), pagination: pageInfo(page, limit, total) })
  } catch (error) {
    console.error('Admin products list failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được sản phẩm.')
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const parsed = parseProductWrite(await request.json().catch(() => null))
  if (!parsed.ok) return adminError(400, parsed.message)
  try {
    const category = await auth.db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } })
    if (!category) return adminError(400, 'Danh mục không tồn tại.')
    const product = await auth.db.product.create({ data: parsed.data, select: productSelect })
    return adminOk(serialize(product), 'Đã tạo sản phẩm.')
  } catch (error) {
    if (prismaCode(error) === 'P2002') return adminError(409, 'Đường dẫn sản phẩm đã tồn tại.')
    console.error('Admin product create failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tạo được sản phẩm.')
  }
}
