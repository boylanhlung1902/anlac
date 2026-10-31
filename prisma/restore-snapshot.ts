import { PrismaClient } from '@prisma/client'
import catalog from '../data/catalog.json'

const prisma = new PrismaClient()

async function releaseTakenSlug(
  table: 'categories' | 'products',
  slug: string,
  id: number
) {
  await prisma.$executeRawUnsafe(
    `UPDATE ${table} SET slug = slug || '-retired-' || id::text WHERE slug = $1 AND id <> $2`,
    slug,
    id
  )
}

/** Category.name is @unique — free the name on other rows before upserting remapped ids. */
async function releaseTakenCategoryName(name: string, id: number) {
  await prisma.$executeRawUnsafe(
    `UPDATE categories SET name = name || '-retired-' || id::text WHERE name = $1 AND id <> $2`,
    name,
    id
  )
}

function productDetailFields(product: (typeof catalog.products)[number]) {
  const snapshot = product as typeof product & {
    craft?: string | null
    warranty?: string | null
    highlights?: string[]
  }
  return {
    craft: snapshot.craft ?? null,
    warranty: snapshot.warranty ?? null,
    highlights: Array.isArray(snapshot.highlights) ? snapshot.highlights : [],
  }
}

async function main() {
  for (const category of catalog.categories) {
    await releaseTakenSlug('categories', category.slug, category.id)
    await releaseTakenCategoryName(category.name, category.id)
  }
  for (const product of catalog.products) {
    await releaseTakenSlug('products', product.slug, product.id)
  }

  for (const category of catalog.categories) {
    const data = {
      name: category.name,
      description: category.description,
      image: category.image,
      slug: category.slug,
      isActive: true,
    }
    await prisma.category.upsert({
      where: { id: category.id },
      update: data,
      create: {
        id: category.id,
        ...data,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      },
    })
  }

  for (const product of catalog.products) {
    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      priceVND: product.priceVND,
      netPrice: product.netPrice,
      tax: product.tax,
      image: product.image,
      images: product.images,
      categoryId: product.categoryId,
      stock: product.stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      slug: product.slug,
      weight: product.weight,
      dimensions: product.dimensions,
      material: product.material,
      origin: product.origin,
      ...productDetailFields(product),
    }
    await prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: {
        id: product.id,
        ...data,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
    })
  }

  const categoryIds = catalog.categories.map((category) => category.id)
  const productIds = catalog.products.map((product) => product.id)

  const staleProducts = await prisma.product.findMany({
    where: { id: { notIn: productIds } },
    select: { id: true, _count: { select: { orderItems: true } } },
  })
  const removableIds = staleProducts
    .filter((product) => product._count.orderItems === 0)
    .map((product) => product.id)
  const archivedIds = staleProducts
    .filter((product) => product._count.orderItems > 0)
    .map((product) => product.id)

  if (removableIds.length > 0) {
    await prisma.cartItem.deleteMany({ where: { productId: { in: removableIds } } })
    await prisma.product.deleteMany({ where: { id: { in: removableIds } } })
  }
  if (archivedIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: archivedIds } },
      data: { isActive: false },
    })
  }

  await prisma.category.updateMany({
    where: { id: { notIn: categoryIds } },
    data: { isActive: false },
  })

  await prisma.category.deleteMany({
    where: {
      id: { notIn: categoryIds },
      products: { none: {} },
    },
  })

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1))`
  )
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1))`
  )

  console.log(`Restored ${catalog.categories.length} categories and ${catalog.products.length} products`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
