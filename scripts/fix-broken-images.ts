import { PrismaClient } from '@prisma/client'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()
const publicDir = join(process.cwd(), 'public')

const FALLBACK_POOL = [
  '/images/san-pham-my-nghe/tuong-da/anh1.webp',
  '/images/san-pham-my-nghe/den-da/anh1.webp',
  '/images/san-pham-my-nghe/dai-phun-nuoc/anh1.webp',
  '/images/san-pham-my-nghe/ban-ghe-da/anh1.webp',
  '/images/san-pham-my-nghe/lavabo-da/anh1.webp',
  '/images/san-pham-my-nghe/bang-hieu-da/anh1.jpg',
  '/images/san-pham-my-nghe/bon-tam-da/anh1.webp',
  '/images/san-pham-my-nghe/thach-my-nghe/anh1.webp',
  '/images/anh4.jpg',
  '/images/anh8.jpg',
  '/images/anh9.jpg',
  '/images/anh10.jpg',
]

const CATEGORY_FALLBACK: Record<string, string> = {
  'da-phong-thuy': '/images/san-pham-my-nghe/thach-my-nghe/anh1.webp',
  'tuong-da-nghe-thuat': '/images/san-pham-my-nghe/tuong-da/anh1.webp',
  'da-canh-trang-tri': '/images/san-pham-my-nghe/dai-phun-nuoc/anh1.webp',
  'vong-tay-da-quy': '/images/anh4.jpg',
  'mat-day-chuyen-da': '/images/anh8.jpg',
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

function isValidImage(path: string | null | undefined): boolean {
  if (!path) return false
  const full = join(publicDir, path.replace(/^\//, ''))
  if (!existsSync(full)) return false
  try {
    if (statSync(full).size < 1000) return false
    const head = readFileSync(full).subarray(0, 64).toString('utf8').toLowerCase()
    if (head.includes('<!doctype') || head.includes('<html')) return false
    return true
  } catch {
    return false
  }
}

function firstExistingInFolder(folderPath: string): string | null {
  const full = join(publicDir, folderPath.replace(/^\//, ''))
  if (!existsSync(full)) return null
  try {
    const files = readdirSync(full)
      .filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
      .sort()
    for (const f of files) {
      const webPath = `${folderPath.replace(/\/$/, '')}/${f}`
      if (isValidImage(webPath.startsWith('/') ? webPath : `/${webPath}`)) {
        return webPath.startsWith('/') ? webPath : `/${webPath}`
      }
    }
  } catch {
    return null
  }
  return null
}

function resolveReplacement(brokenPath: string | null | undefined, hintSlug?: string, index = 0): string {
  if (hintSlug && CATEGORY_FALLBACK[hintSlug] && isValidImage(CATEGORY_FALLBACK[hintSlug])) {
    return CATEGORY_FALLBACK[hintSlug]
  }

  if (brokenPath) {
    const parts = brokenPath.split('/').filter(Boolean)
    // /images/folder/file -> try folder
    if (parts.length >= 2 && parts[0] === 'images') {
      const folder = `/images/${parts[1]}`
      const found = firstExistingInFolder(folder)
      if (found) return found

      // craft mapping heuristics
      const folderName = parts[1].toLowerCase()
      if (folderName.includes('den')) return CATEGORY_FALLBACK['den-da']
      if (folderName.includes('phun') || folderName.includes('dai')) return CATEGORY_FALLBACK['dai-phun-nuoc']
      if (folderName.includes('tuong') || folderName.includes('phat')) return CATEGORY_FALLBACK['tuong-da']
      if (folderName.includes('ghe') || folderName.includes('ban')) return CATEGORY_FALLBACK['ban-ghe-da']
      if (folderName.includes('lavabo')) return CATEGORY_FALLBACK['lavabo-da']
      if (folderName.includes('tam')) return CATEGORY_FALLBACK['bon-tam-da']
      if (folderName.includes('hieu') || folderName.includes('bien')) return CATEGORY_FALLBACK['bang-hieu-da']
      if (folderName.includes('thach') || folderName.includes('van')) return CATEGORY_FALLBACK['thach-my-nghe']
    }
  }

  return FALLBACK_POOL[index % FALLBACK_POOL.length]
}

async function main() {
  console.log('🔧 Fixing broken image paths in database...')

  const categories = await prisma.category.findMany()
  let catFixed = 0
  for (const cat of categories) {
    if (!isValidImage(cat.image)) {
      const next = resolveReplacement(cat.image, cat.slug)
      await prisma.category.update({
        where: { id: cat.id },
        data: { image: next },
      })
      console.log(`CAT ${cat.slug}: ${cat.image} -> ${next}`)
      catFixed++
    }
  }

  const products = await prisma.product.findMany({ include: { category: true } })
  let prodFixed = 0
  for (const product of products) {
    let image = product.image
    let images = [...(product.images || [])]
    let changed = false

    if (!isValidImage(image)) {
      image = resolveReplacement(product.image, product.category?.slug, product.id)
      changed = true
    }

    images = images.map((img, i) => {
      if (isValidImage(img)) return img
      changed = true
      return resolveReplacement(img, product.category?.slug, product.id + i)
    })

    // Ensure at least one gallery image
    if (images.length === 0) {
      images = [image]
      changed = true
    }

    // If main still somehow bad
    if (!isValidImage(image)) {
      image = images.find(isValidImage) || FALLBACK_POOL[0]
      changed = true
    }

    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data: { image, images },
      })
      console.log(`PROD ${product.slug}: fixed`)
      prodFixed++
    }
  }

  console.log(`✅ Done. Categories fixed: ${catFixed}, Products fixed: ${prodFixed}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
