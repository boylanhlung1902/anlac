import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

type ManifestEntry = {
  name: string
  description: string
  images: string[]
  cover: string | null
}

const productTemplates: Record<
  string,
  { priceVND: number; material: string; items: { name: string; slug: string; priceVND?: number }[] }
> = {
  'ban-ghe-da': {
    priceVND: 12500000,
    material: 'Đá tự nhiên nguyên khối',
    items: [
      { name: 'Bàn Ghế Đá Tự Nhiên', slug: 'ban-ghe-da-tu-nhien' },
      { name: 'Bộ Bàn Ghế Đá Sân Vườn', slug: 'bo-ban-ghe-da-san-vuon', priceVND: 18500000 },
    ],
  },
  'dai-phun-nuoc': {
    priceVND: 9800000,
    material: 'Đá tự nhiên',
    items: [
      { name: 'Đài Phun Nước Đá', slug: 'dai-phun-nuoc-da' },
      { name: 'Đài Phun Nước Đá Sân Vườn', slug: 'dai-phun-nuoc-san-vuon', priceVND: 11200000 },
    ],
  },
  'bang-hieu-da': {
    priceVND: 4500000,
    material: 'Đá tự nhiên khắc chữ',
    items: [
      { name: 'Bảng Hiệu Đá', slug: 'bang-hieu-da' },
      { name: 'Biển Hiệu Đá Công Ty', slug: 'bien-hieu-da-cong-ty', priceVND: 6200000 },
    ],
  },
  'bon-tam-da': {
    priceVND: 28000000,
    material: 'Đá nguyên khối',
    items: [
      { name: 'Bồn Tắm Đá Nguyên Khối', slug: 'bon-tam-da-nguyen-khoi' },
      { name: 'Bồn Tắm Đá Spa', slug: 'bon-tam-da-spa', priceVND: 32000000 },
    ],
  },
  'den-da': {
    priceVND: 3200000,
    material: 'Đá lava / đá sông',
    items: [
      { name: 'Đèn Đá Sân Vườn', slug: 'den-da-san-vuon' },
      { name: 'Đèn Đá Phong Cách Nhật', slug: 'den-da-phong-cach-nhat', priceVND: 4800000 },
    ],
  },
  'lavabo-da': {
    priceVND: 7500000,
    material: 'Đá tuyết sơn / đá tự nhiên',
    items: [
      { name: 'Lavabo Đá Tuyết Sơn', slug: 'lavabo-da-tuyet-son' },
      { name: 'Lavabo Đá Vân Thạch', slug: 'lavabo-da-van-thach', priceVND: 8200000 },
    ],
  },
  'tuong-da': {
    priceVND: 6500000,
    material: 'Đá tự nhiên điêu khắc',
    items: [
      { name: 'Tượng Đá Nghệ Thuật', slug: 'tuong-da-nghe-thuat-my-nghe' },
      { name: 'Tượng Đá Phong Thủy', slug: 'tuong-da-phong-thuy-my-nghe', priceVND: 8900000 },
    ],
  },
  'thach-my-nghe': {
    priceVND: 5500000,
    material: 'Thạch / đá quý chế tác',
    items: [
      { name: 'Thạch Mỹ Nghệ', slug: 'thach-my-nghe' },
      { name: 'Thạch Mỹ Nghệ Trang Trí', slug: 'thach-my-nghe-trang-tri', priceVND: 7100000 },
    ],
  },
}

function vndToUsd(priceVND: number) {
  const price = Math.round((priceVND / 24000) * 100) / 100
  const netPrice = Math.round((price / 1.1) * 100) / 100
  return { price, netPrice }
}

async function main() {
  console.log('🌱 Seeding Sản Phẩm Mỹ Nghệ categories from hathienbao.com...')

  const manifestPath = join(process.cwd(), 'prisma/craft-manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Record<string, ManifestEntry>

  const categoryOrder = [
    'ban-ghe-da',
    'dai-phun-nuoc',
    'bang-hieu-da',
    'bon-tam-da',
    'den-da',
    'lavabo-da',
    'tuong-da',
    'thach-my-nghe',
  ]

  for (const slug of categoryOrder) {
    const entry = manifest[slug]
    if (!entry?.cover) {
      console.warn(`⚠️ Skip ${slug}: no images`)
      continue
    }

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: entry.name,
        description: entry.description,
        image: entry.cover,
      },
      create: {
        name: entry.name,
        description: entry.description,
        image: entry.cover,
        slug,
      },
    })
    console.log(`📂 Category: ${category.name}`)

    const template = productTemplates[slug]
    const images = entry.images

    for (let i = 0; i < template.items.length; i++) {
      const item = template.items[i]
      const priceVND = item.priceVND ?? template.priceVND
      const { price, netPrice } = vndToUsd(priceVND)
      // rotate gallery: first product uses all, second starts mid-way
      const start = i === 0 ? 0 : Math.min(Math.floor(images.length / 2), images.length - 1)
      const gallery = [...images.slice(start), ...images.slice(0, start)].slice(0, Math.max(3, images.length))
      const mainImage = gallery[0]

      await prisma.product.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          description: `${entry.description} Sản phẩm thuộc danh mục ${entry.name} của An Lạc Stone.`,
          price,
          priceVND,
          netPrice,
          tax: 10,
          image: mainImage,
          images: gallery,
          categoryId: category.id,
          stock: 5 + i * 2,
          rating: 4.6 + i * 0.2,
          reviewCount: 8 + i * 5,
          isFeatured: i === 0,
          isActive: true,
          material: template.material,
          origin: 'Việt Nam',
        },
        create: {
          name: item.name,
          description: `${entry.description} Sản phẩm thuộc danh mục ${entry.name} của An Lạc Stone.`,
          price,
          priceVND,
          netPrice,
          tax: 10,
          image: mainImage,
          images: gallery,
          categoryId: category.id,
          stock: 5 + i * 2,
          rating: 4.6 + i * 0.2,
          reviewCount: 8 + i * 5,
          isFeatured: i === 0,
          isActive: true,
          slug: item.slug,
          material: template.material,
          origin: 'Việt Nam',
        },
      })
      console.log(`  ✅ Product: ${item.name}`)
    }
  }

  console.log('🎉 Craft categories seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
