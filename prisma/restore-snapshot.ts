import { PrismaClient } from '@prisma/client'
import catalog from '../data/catalog.json'

const prisma = new PrismaClient()

async function main() {
  for (const category of catalog.categories) {
    const data = {
      name: category.name,
      description: category.description,
      image: category.image,
      slug: category.slug,
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
