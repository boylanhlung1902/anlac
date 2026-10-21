import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed with fixed image paths...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Đá Vân Thạch',
        description: 'Các loại đá vân thạch tự nhiên với vân đá đẹp mắt',
        image: '/images/anh1.jpg',
        slug: 'da-van-thach'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Tượng Phật',
        description: 'Tượng Phật được điêu khắc tinh xảo từ đá tự nhiên',
        image: '/images/anh2.jpg',
        slug: 'tuong-phat'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Đài Phun Nước',
        description: 'Đài phun nước đá tự nhiên trang trí sân vườn',
        image: '/images/anh3.jpg',
        slug: 'dai-phun-nuoc'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Đá Cuội Tự Nhiên',
        description: 'Đá cuội tự nhiên với nhiều kích thước và màu sắc',
        image: '/images/anh4.jpg',
        slug: 'da-cuoi-tu-nhien'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Đèn Đá',
        description: 'Đèn đá trang trí với ánh sáng ấm áp',
        image: '/images/anh5.jpg',
        slug: 'den-da'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Điêu Khắc Chân Dung',
        description: 'Tác phẩm điêu khắc chân dung từ đá tự nhiên',
        image: '/images/anh6.jpg',
        slug: 'dieu-khac-chan-dung'
      }
    })
  ])

  console.log('📂 Created categories')

  // Create products with multiple images using anh1-anh17
  const products = [
    // Đá Vân Thạch Trắng
    {
      name: 'Đá Vân Thạch Trắng - Tấm Lớn',
      description: 'Tấm đá vân thạch trắng tự nhiên, kích thước lớn, phù hợp ốp tường hoặc làm mặt bàn',
      priceVND: 2500000,
      categoryId: categories[0].id,
      rating: 4.8,
      reviewCount: 12,
      isFeatured: true,
      images: [
        '/images/anh1.jpg',
        '/images/anh2.jpg',
        '/images/anh3.jpg',
        '/images/anh4.jpg',
        '/images/anh5.jpg'
      ]
    },
    {
      name: 'Đá Vân Thạch Trắng - Tấm Vừa',
      description: 'Tấm đá vân thạch trắng kích thước vừa, thích hợp trang trí nội thất',
      priceVND: 1800000,
      categoryId: categories[0].id,
      rating: 4.6,
      reviewCount: 8,
      isFeatured: false,
      images: [
        '/images/anh6.jpg',
        '/images/anh7.jpg',
        '/images/anh8.jpg',
        '/images/anh9.jpg'
      ]
    },

    // Tượng Chú Tiểu
    {
      name: 'Tượng Chú Tiểu Đứng',
      description: 'Tượng chú tiểu đứng được điêu khắc tinh xảo từ đá tự nhiên, mang ý nghĩa phong thủy',
      priceVND: 3200000,
      categoryId: categories[1].id,
      rating: 4.9,
      reviewCount: 15,
      isFeatured: true,
      images: [
        '/images/anh10.jpg',
        '/images/anh11.jpg',
        '/images/anh12.jpg',
        '/images/anh13.jpg',
        '/images/anh14.jpg'
      ]
    },
    {
      name: 'Tượng Chú Tiểu Ngồi Thiền',
      description: 'Tượng chú tiểu ngồi thiền với tư thế thanh thản, phù hợp trang trí phòng thờ',
      priceVND: 2800000,
      categoryId: categories[1].id,
      rating: 4.7,
      reviewCount: 10,
      isFeatured: false,
      images: [
        '/images/anh15.jpg',
        '/images/anh16.jpg',
        '/images/anh17.jpg',
        '/images/shop_01.jpg'
      ]
    },

    // Đài Phun Nước
    {
      name: 'Đài Phun Nước Đá Tự Nhiên',
      description: 'Đài phun nước được chế tác từ đá tự nhiên, tạo không gian thư thái cho sân vườn',
      priceVND: 4500000,
      categoryId: categories[2].id,
      rating: 4.8,
      reviewCount: 18,
      isFeatured: true,
      images: [
        '/images/shop_02.jpg',
        '/images/shop_03.jpg',
        '/images/shop_04.jpg',
        '/images/shop_05.jpg'
      ]
    },

    // Đá Cuội Tự Nhiên
    {
      name: 'Đá Cuội Tự Nhiên - Bộ Nhỏ',
      description: 'Bộ đá cuội tự nhiên kích thước nhỏ, phù hợp trang trí tiểu cảnh',
      priceVND: 800000,
      categoryId: categories[3].id,
      rating: 4.5,
      reviewCount: 6,
      isFeatured: false,
      images: [
        '/images/shop_06.jpg',
        '/images/shop_07.jpg',
        '/images/shop_08.jpg'
      ]
    },

    // Đèn Đá
    {
      name: 'Đèn Đá Trang Trí',
      description: 'Đèn đá trang trí với ánh sáng ấm áp, tạo không gian lãng mạn',
      priceVND: 1200000,
      categoryId: categories[4].id,
      rating: 4.6,
      reviewCount: 9,
      isFeatured: false,
      images: [
        '/images/shop_09.jpg',
        '/images/shop_10.jpg',
        '/images/shop_11.jpg'
      ]
    },

    // Điêu Khắc Chân Dung
    {
      name: 'Tượng Chân Dung Nghệ Thuật',
      description: 'Tác phẩm điêu khắc chân dung nghệ thuật từ đá tự nhiên',
      priceVND: 3800000,
      categoryId: categories[5].id,
      rating: 4.9,
      reviewCount: 14,
      isFeatured: true,
      images: [
        '/images/product_single_01.jpg',
        '/images/product_single_02.jpg',
        '/images/product_single_03.jpg',
        '/images/product_single_04.jpg'
      ]
    }
  ]

  // Create products
  for (const productData of products) {
    const { images, ...productInfo } = productData
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        image: images[0], // Main image
        images: images, // Store all images as array
        price: productInfo.priceVND / 100, // Convert to decimal
        netPrice: Math.round((productInfo.priceVND / 100 / 1.1) * 100) / 100,
        slug: productInfo.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        stock: 10,
        weight: 5.0,
        dimensions: '30x20x10 cm',
        material: 'Đá tự nhiên',
        origin: 'Việt Nam'
      }
    })
    console.log(`✅ Created product: ${product.name}`)
  }

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@stoneart.com',
        name: 'Admin Stone Art',
        role: 'ADMIN',
        address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        phone: '087-770-5979'
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer@example.com',
        name: 'Khách Hàng Test',
        role: 'CUSTOMER',
        address: '456 Đường Lê Lợi, Quận 3, TP.HCM',
        phone: '0123456789'
      }
    })
  ])

  console.log('👥 Created test users')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
