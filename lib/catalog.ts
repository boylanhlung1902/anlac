import catalogJson from '../data/catalog.json'
import type { PrismaClient } from '@prisma/client'
import { getPrisma } from './database'

export type CatalogCategory = (typeof catalogJson.categories)[number]
export type CatalogProduct = (typeof catalogJson.products)[number]

const catalog = catalogJson

const sortFieldMap: Record<string, keyof CatalogProduct> = {
  name: 'name',
  price: 'price',
  priceVND: 'priceVND',
  rating: 'rating',
  createdAt: 'createdAt',
  newest: 'createdAt',
  oldest: 'createdAt',
  priceAsc: 'priceVND',
  priceDesc: 'priceVND',
  nameAsc: 'name',
  nameDesc: 'name',
  ratingDesc: 'rating',
}

function includes(value: string | null | undefined, term: string) {
  return (value || '').toLowerCase().includes(term)
}

function categoryIsHidden(category: unknown) {
  return Boolean(category && typeof category === 'object' && 'isActive' in category && (category as { isActive?: boolean }).isActive === false)
}

export function queryCatalogProducts(params: {
  page: number
  limit: number
  category?: string | null
  search?: string | null
  featured?: boolean
  ids?: number[]
  sortBy?: string
  sortOrder?: string
}) {
  const page = params.page > 0 ? params.page : 1
  const limit = params.limit > 0 ? params.limit : 12
  const idSet = params.ids?.length ? new Set(params.ids) : null
  let items = catalog.products.filter((product) => product.isActive && !categoryIsHidden(product.category))
  if (idSet) items = items.filter((product) => idSet.has(product.id))

  if (params.category) {
    items = items.filter((product) => product.category?.slug === params.category)
  }

  if (params.featured) {
    items = items.filter((product) => product.isFeatured)
  }

  if (params.search?.trim()) {
    const term = params.search.trim().toLowerCase()
    items = items.filter((product) => {
      const productMatch =
        includes(product.name, term) ||
        includes(product.description, term) ||
        includes(product.material, term)
      const categoryMatch =
        !params.category &&
        (includes(product.category?.name, term) || includes(product.category?.slug, term))
      return productMatch || categoryMatch
    })
  }

  const field = sortFieldMap[params.sortBy || 'createdAt'] || 'createdAt'
  const direction = params.sortOrder === 'asc' ? 1 : -1
  items = [...items].sort((a, b) => {
    const left = a[field]
    const right = b[field]
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction
    return String(left ?? '').localeCompare(String(right ?? '')) * direction
  })

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const products = idSet ? items : items.slice(start, start + limit)

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export function findCatalogProduct(id: number) {
  return catalog.products.find((product) => product.id === id && product.isActive) || null
}

export function queryCatalogCategories(includeProducts: boolean) {
  return [...catalog.categories]
    .filter((category) => !categoryIsHidden(category))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((category) => {
      if (!includeProducts) return category
      const products = catalog.products
        .filter((product) => product.isActive && product.categoryId === category.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6)
      return { ...category, products }
    })
}

export function findCatalogCategory(id: number) {
  const category = catalog.categories.find((item) => item.id === id)
  if (!category) return null
  const products = catalog.products
    .filter((product) => product.isActive && product.categoryId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return { ...category, products }
}

export async function readFromDatabase<T>(
  read: (db: PrismaClient) => Promise<T>
): Promise<{ ok: true; value: T } | { ok: false }> {
  const db = getPrisma()
  if (!db) return { ok: false }
  try {
    return { ok: true, value: await read(db) }
  } catch (error) {
    console.error('Database read failed, using catalog snapshot', error)
    return { ok: false }
  }
}
