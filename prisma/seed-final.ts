import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting final seed with correct image names...')

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

  // Create products with correct image names
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
        '/images/davanthachtrang/anh1.jpg',
        '/images/davanthachtrang/anh2.jpg',
        '/images/davanthachtrang/anh3.jpg',
        '/images/davanthachtrang/anh4.jpg',
        '/images/davanthachtrang/anh5.jpg',
        '/images/davanthachtrang/anh6.jpg',
        '/images/davanthachtrang/anh7.jpg',
        '/images/davanthachtrang/anh8.jpg',
        '/images/davanthachtrang/anh9.jpg',
        '/images/davanthachtrang/anh10.jpg',
        '/images/davanthachtrang/anh11.jpg',
        '/images/davanthachtrang/anh12.jpg',
        '/images/davanthachtrang/anh13.jpg',
        '/images/davanthachtrang/anh14.jpg',
        '/images/davanthachtrang/anh15.jpg',
        '/images/davanthachtrang/anh16.jpg',
        '/images/davanthachtrang/anh17.jpg',
        '/images/davanthachtrang/anh18.jpg',
        '/images/davanthachtrang/anh19.jpg',
        '/images/davanthachtrang/anh20.jpg',
        '/images/davanthachtrang/anh21.jpg',
        '/images/davanthachtrang/anh22.jpg',
        '/images/davanthachtrang/anh23.jpg',
        '/images/davanthachtrang/anh24.jpg',
        '/images/davanthachtrang/anh25.jpg',
        '/images/davanthachtrang/anh26.jpg',
        '/images/davanthachtrang/anh27.jpg',
        '/images/davanthachtrang/anh29.jpg'
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
        '/images/davanthachtrang/anh6.jpg',
        '/images/davanthachtrang/anh7.jpg',
        '/images/davanthachtrang/anh8.jpg',
        '/images/davanthachtrang/anh9.jpg'
      ]
    },

    // Đá Sông Ba
    {
      name: 'Đá Sông Ba - Tự Nhiên',
      description: 'Đá sông Ba tự nhiên với vân đá độc đáo, phù hợp trang trí sân vườn',
      priceVND: 1200000,
      categoryId: categories[0].id,
      rating: 4.5,
      reviewCount: 6,
      isFeatured: false,
      images: [
        '/images/dasongba/anh1.jpg',
        '/images/dasongba/anh2.jpg',
        '/images/dasongba/anh3.jpg'
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
        '/images/dacuoitunhien/anh1.JPG',
        '/images/dacuoitunhien/anh2.JPG',
        '/images/dacuoitunhien/anh3.JPG',
        '/images/dacuoitunhien/anh4.jpg',
        '/images/dacuoitunhien/anh5.jpg',
        '/images/dacuoitunhien/anh6.jpg',
        '/images/dacuoitunhien/anh7.jpg'
      ]
    },

    // Đá Cổ Thạch
    {
      name: 'Đá Cổ Thạch - Nghệ Thuật',
      description: 'Đá cổ thạch với vân đá cổ xưa, mang giá trị nghệ thuật cao',
      priceVND: 3500000,
      categoryId: categories[0].id,
      rating: 4.9,
      reviewCount: 15,
      isFeatured: true,
      images: [
        '/images/dacothach/anh1.jpg',
        '/images/dacothach/anh2.jpg',
        '/images/dacothach/anh3.jpg',
        '/images/dacothach/anh4.jpg',
        '/images/dacothach/anh5.jpg',
        '/images/dacothach/anh6.jpg',
        '/images/dacothach/anh7.jpg',
        '/images/dacothach/anh8.jpg',
        '/images/dacothach/anh9.jpg'
      ]
    },

    // Đá Vân Thạch Cổ
    {
      name: 'Đá Vân Thạch Cổ - Độc Đáo',
      description: 'Đá vân thạch cổ với hoa văn độc đáo, phù hợp trang trí cao cấp',
      priceVND: 4200000,
      categoryId: categories[0].id,
      rating: 4.8,
      reviewCount: 12,
      isFeatured: true,
      images: [
        '/images/davanthachco/anh1.jpg',
        '/images/davanthachco/anh2.jpg',
        '/images/davanthachco/anh3.jpg',
        '/images/davanthachco/anh4.jpg',
        '/images/davanthachco/anh5.jpg',
        '/images/davanthachco/anh6.jpg',
        '/images/davanthachco/anh7.jpg',
        '/images/davanthachco/anh8.jpg',
        '/images/davanthachco/anh9.jpg',
        '/images/davanthachco/anh10.jpg',
        '/images/davanthachco/anh11.jpg',
        '/images/davanthachco/anh12.jpg',
        '/images/davanthachco/anh13.jpg',
        '/images/davanthachco/anh14.jpg'
      ]
    },

    // Cuội Vân Mây
    {
      name: 'Cuội Vân Mây - Tự Nhiên',
      description: 'Cuội vân mây tự nhiên với hoa văn như mây trời, độc đáo và hiếm',
      priceVND: 2800000,
      categoryId: categories[3].id,
      rating: 4.7,
      reviewCount: 9,
      isFeatured: false,
      images: [
        '/images/cuoivanmay/anh1.jpg',
        '/images/cuoivanmay/anh2.jpg',
        '/images/cuoivanmay/anh3.jpg',
        '/images/cuoivanmay/anh4.jpg',
        '/images/cuoivanmay/anh5.jpg',
        '/images/cuoivanmay/anh6.jpg',
        '/images/cuoivanmay/anh7.jpg',
        '/images/cuoivanmay/anh8.jpg',
        '/images/cuoivanmay/anh9.jpg',
        '/images/cuoivanmay/anh10.jpg',
        '/images/cuoivanmay/anh11.jpg',
        '/images/cuoivanmay/anh12.jpg',
        '/images/cuoivanmay/anh13.jpg',
        '/images/cuoivanmay/anh14.jpg',
        '/images/cuoivanmay/anh15.jpg'
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
        '/images/tuongchutieu/anh1.png',
        '/images/tuongchutieu/anh2.png',
        '/images/tuongchutieu/anh3.png',
        '/images/tuongchutieu/anh4.png',
        '/images/tuongchutieu/anh5.png'
      ]
    },

    // Tượng Phật Thích Ca
    {
      name: 'Tượng Phật Thích Ca - Cao Cấp',
      description: 'Tượng Phật Thích Ca được điêu khắc tinh xảo, mang lại bình an và may mắn',
      priceVND: 4500000,
      categoryId: categories[1].id,
      rating: 4.9,
      reviewCount: 18,
      isFeatured: true,
      images: [
        '/images/tuongphatthichca/anh1.png',
        '/images/tuongphatthichca/anh2.png',
        '/images/tuongphatthichca/anh3.png',
        '/images/tuongphatthichca/anh4.png',
        '/images/tuongphatthichca/anh5.png'
      ]
    },

    // Tượng Quan Âm
    {
      name: 'Tượng Quan Âm - Từ Bi',
      description: 'Tượng Quan Âm với vẻ từ bi, mang lại bình an và bảo vệ cho gia đình',
      priceVND: 3800000,
      categoryId: categories[1].id,
      rating: 4.8,
      reviewCount: 14,
      isFeatured: false,
      images: [
        '/images/tuongquanam/anh1.jpg'
      ]
    },

    // Tượng Xưởng A Hà
    {
      name: 'Tượng Xưởng A Hà - Nghệ Thuật',
      description: 'Tượng từ xưởng A Hà với kỹ thuật điêu khắc truyền thống cao cấp',
      priceVND: 5200000,
      categoryId: categories[1].id,
      rating: 4.9,
      reviewCount: 20,
      isFeatured: true,
      images: [
        '/images/tuongxuongha/anh1.jpg',
        '/images/tuongxuongha/anh2.jpg',
        '/images/tuongxuongha/anh3.jpg',
        '/images/tuongxuongha/anh4.jpg',
        '/images/tuongxuongha/anh5.jpg',
        '/images/tuongxuongha/anh6.jpg',
        '/images/tuongxuongha/anh7.jpg',
        '/images/tuongxuongha/anh8.jpg',
        '/images/tuongxuongha/anh9.jpg',
        '/images/tuongxuongha/anh10.jpg',
        '/images/tuongxuongha/anh11.jpg',
        '/images/tuongxuongha/anh12.jpg',
        '/images/tuongxuongha/anh13.jpg',
        '/images/tuongxuongha/anh14.jpg',
        '/images/tuongxuongha/anh15.jpg',
        '/images/tuongxuongha/anh16.jpg',
        '/images/tuongxuongha/anh17.jpg',
        '/images/tuongxuongha/anh18.jpg',
        '/images/tuongxuongha/anh19.jpg',
        '/images/tuongxuongha/anh20.jpg'
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
        '/images/denda/anh1.jpg',
        '/images/denda/anh2.jpg',
        '/images/denda/anh3.jpg',
        '/images/denda/anh4.jpg'
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
        '/images/daiphunnuoc/anh1.jpg',
        '/images/daiphunnuoc/anh2.jpg',
        '/images/daiphunnuoc/anh3.jpg',
        '/images/daiphunnuoc/anh4.jpg'
      ]
    },

    // SAE Đèn Đá
    {
      name: 'SAE Đèn Đá - Cao Cấp',
      description: 'Đèn đá SAE với thiết kế độc đáo và chất lượng cao cấp',
      priceVND: 1800000,
      categoryId: categories[4].id,
      rating: 4.7,
      reviewCount: 11,
      isFeatured: false,
      images: [
        '/images/saedenda/anh1.png',
        '/images/saedenda/anh2.png',
        '/images/saedenda/anh3.png',
        '/images/saedenda/anh4.png',
        '/images/saedenda/anh5.png',
        '/images/saedenda/anh6.png',
        '/images/saedenda/anh7.png'
      ]
    },

    // SAE Tượng Chú Tiểu
    {
      name: 'SAE Tượng Chú Tiểu - Nghệ Thuật',
      description: 'Tượng chú tiểu SAE với kỹ thuật điêu khắc nghệ thuật cao cấp',
      priceVND: 3500000,
      categoryId: categories[1].id,
      rating: 4.8,
      reviewCount: 13,
      isFeatured: false,
      images: [
        '/images/tuongchutieu/anh1.png',
        '/images/tuongchutieu/anh2.png',
        '/images/tuongchutieu/anh3.png',
        '/images/tuongchutieu/anh4.png',
        '/images/tuongchutieu/anh5.png',
        '/images/tuongchutieu/anh6.png',
        '/images/tuongchutieu/anh7.png',
        '/images/tuongchutieu/anh8.png',
        '/images/tuongchutieu/anh9.png'
      ]
    },

    // SAE Điêu Khắc Chân Dung
    {
      name: 'SAE Điêu Khắc Chân Dung - Nghệ Thuật',
      description: 'Tác phẩm điêu khắc chân dung nghệ thuật từ đá tự nhiên',
      priceVND: 3800000,
      categoryId: categories[5].id,
      rating: 4.9,
      reviewCount: 14,
      isFeatured: true,
      images: [
        '/images/saedieukhacchandung/anh1.png',
        '/images/saedieukhacchandung/anh2.png',
        '/images/saedieukhacchandung/anh3.png',
        '/images/saedieukhacchandung/anh4.jpg',
        '/images/saedieukhacchandung/anh5.jpg',
        '/images/saedieukhacchandung/anh6.jpg'
      ]
    },

    // SAE Đài Phun Nước
    {
      name: 'SAE Đài Phun Nước - Cao Cấp',
      description: 'Đài phun nước SAE với thiết kế độc đáo và chất lượng cao cấp',
      priceVND: 5500000,
      categoryId: categories[2].id,
      rating: 4.9,
      reviewCount: 16,
      isFeatured: true,
      images: [
        '/images/saedaiphannuoc/anh1.png',
        '/images/saedaiphannuoc/anh2.png',
        '/images/saedaiphannuoc/anh3.png',
        '/images/saedaiphannuoc/anh4.png',
        '/images/saedaiphannuoc/anh5.png',
        '/images/saedaiphannuoc/anh6.png',
        '/images/saedaiphannuoc/anh7.png',
        '/images/saedaiphannuoc/anh8.png',
        '/images/saedaiphannuoc/anh9.png'
      ]
    },

    // SAE Phật Thích Ca
    {
      name: 'SAE Phật Thích Ca - Tối Thượng',
      description: 'Tượng Phật Thích Ca SAE với kỹ thuật điêu khắc tối thượng',
      priceVND: 6800000,
      categoryId: categories[1].id,
      rating: 5.0,
      reviewCount: 25,
      isFeatured: true,
      images: [
        '/images/saephatthichca/anh1.png',
        '/images/saephatthichca/anh2.png',
        '/images/saephatthichca/anh3.png',
        '/images/saephatthichca/anh4.png',
        '/images/saephatthichca/anh5.png'
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

  console.log('🎉 Final seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
