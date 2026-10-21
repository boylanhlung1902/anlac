import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

const CATEGORY_IMAGES: Record<string, string> = {
  'da-phong-thuy': '/images/hathienbao/da-phong-thuy/anh1.webp',
  'tuong-da-nghe-thuat': '/images/san-pham-my-nghe/tuong-da/anh1.webp',
  'da-canh-trang-tri': '/images/hathienbao/da-lua-da-sac/anh1.webp',
  'vong-tay-da-quy': '/images/hathienbao/soi-thach-anh/anh1.webp',
  'mat-day-chuyen-da': '/images/hathienbao/da-van-thach/anh1.webp',
  'ban-da-trang-tri': '/images/san-pham-my-nghe/ban-ghe-da/anh1.webp',
  'ban-ghe-da': '/images/san-pham-my-nghe/ban-ghe-da/anh1.webp',
  'dai-phun-nuoc': '/images/san-pham-my-nghe/dai-phun-nuoc/anh1.webp',
  'bang-hieu-da': '/images/san-pham-my-nghe/bang-hieu-da/anh1.jpg',
  'bon-tam-da': '/images/san-pham-my-nghe/bon-tam-da/anh1.webp',
  'den-da': '/images/san-pham-my-nghe/den-da/anh1.webp',
  'lavabo-da': '/images/san-pham-my-nghe/lavabo-da/anh1.webp',
  'tuong-da': '/images/san-pham-my-nghe/tuong-da/anh1.webp',
  'thach-my-nghe': '/images/san-pham-my-nghe/thach-my-nghe/anh1.webp',
}

function exists(webPath: string) {
  return existsSync(join(process.cwd(), 'public', webPath.replace(/^\//, '')))
}

async function main() {
  console.log('🔄 Updating category/product images from hathienbao.com downloads...')

  for (const [slug, image] of Object.entries(CATEGORY_IMAGES)) {
    if (!exists(image)) {
      console.warn('Missing file for', slug, image)
      continue
    }
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) continue
    await prisma.category.update({
      where: { id: cat.id },
      data: { image },
    })
    console.log(`CAT ${slug} -> ${image}`)
  }

  // Fix products still pointing at weak /images/anh*.jpg placeholders
  const products = await prisma.product.findMany({ include: { category: true } })
  let fixed = 0
  for (const product of products) {
    const isPlaceholder =
      !product.image ||
      /^\/images\/anh\d+\.jpg$/i.test(product.image) ||
      /^\/images\/shop_\d+\.jpg$/i.test(product.image) ||
      /^\/images\/feature_prod_/i.test(product.image) ||
      /^\/images\/product_single_/i.test(product.image)

    if (!isPlaceholder) continue

    const catSlug = product.category?.slug || ''
    const fallback =
      CATEGORY_IMAGES[catSlug] ||
      '/images/hathienbao/home/bg1.webp'

    const gallery = [fallback]
    // attach a few related category images if available
    const relatedDir = fallback.replace(/\/anh\d+\.webp$/, '').replace(/\/bg\d+\.webp$/, '')
    for (let i = 1; i <= 4; i++) {
      const candidate = `${relatedDir}/anh${i}.webp`
      if (exists(candidate) && !gallery.includes(candidate)) gallery.push(candidate)
      const candidateBg = `${relatedDir}/bg${i}.webp`
      if (exists(candidateBg) && !gallery.includes(candidateBg)) gallery.push(candidateBg)
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        image: fallback,
        images: gallery.slice(0, 6),
      },
    })
    console.log(`PROD ${product.slug} -> ${fallback}`)
    fixed++
  }

  console.log(`✅ Updated products with placeholder images: ${fixed}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
