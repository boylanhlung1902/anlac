import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed with folder images...')

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

  // Create products with images from folders
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
        '/images/davanthachtrang/z6935966168958_91abdb6dc6fa7d9128a11032102f56a3.jpg',
        '/images/davanthachtrang/z6935966238424_6342b0f960fd9579f872b68fa644ea4c.jpg',
        '/images/davanthachtrang/z6935966256954_87638bb74e1c9e9ecdc32a6dcbbe940c.jpg',
        '/images/davanthachtrang/z6935966268772_42a5e7509185587e9bc0e5ccc2829567.jpg',
        '/images/davanthachtrang/z6935966283031_834ed52f9000281344eda7664974f7ca.jpg'
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
        '/images/davanthachtrang/z6935966303951_1675174c61e4134385b742d84ec5036b.jpg',
        '/images/davanthachtrang/z6935966318741_57d5e6f4fb7e04c2a7760abe5b4c871d.jpg',
        '/images/davanthachtrang/z6935966397542_eae1c5141ce717da54585327135f8fbb.jpg',
        '/images/davanthachtrang/z6935966433977_940f9fb4678c5707354852ec856ed54b.jpg'
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
        '/images/dasongba/z6935966486097_abef2308bca90db4aa1fe20f645f496f.jpg',
        '/images/dasongba/z6935966060308_9b8ae45fc0d95c6014c18912b55aeee9.jpg',
        '/images/dasongba/z6935995821579_31fd3540b89447867861d97765bbba64.jpg'
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
        '/images/dacuoitunhien/z6935995907553_9b19aabb2abf9a58afdd09acd3b9f280.jpg',
        '/images/dacuoitunhien/z6935995939690_284641f12b3d912648be9463c3ce9d3a.jpg',
        '/images/dacuoitunhien/z6935995998022_3dd46a5177357be12250516bf2064bec.jpg'
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
        '/images/dacothach/z6935996029046_81151dec5c5c2aa790230b57161bd6c4.jpg',
        '/images/dacothach/z6935996073969_f1ba01ee405fb91fa2b6ec31bffbea19.jpg',
        '/images/dacothach/z6935996121020_96ca37aea5a6bc45478018ca96d4b8ee.jpg'
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
        '/images/davanthachco/z6935996169314_540c7a22a536effc7f9f0793af04bc7f.jpg',
        '/images/davanthachco/z6935996214903_85c80a1268eb444f9114fcce675803f6.jpg',
        '/images/davanthachco/z6935996270251_f8253f86d13baca22969ca76cecf7772.jpg',
        '/images/davanthachco/z6935996318350_b0a04c7639066f73d482d2b132ab6925.jpg'
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
        '/images/cuoivanmay/z6935996370448_f7ffee6c8706de524a5c716b419d6866.jpg',
        '/images/cuoivanmay/z6935996402177_349207060bc7dcfa551012c115ccfadb.jpg',
        '/images/cuoivanmay/z6935996438963_ae3aa59c637014da803bdd775e21a616.jpg'
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
        '/images/tuongquanam/z6935996438963_ae3aa59c637014da803bdd775e21a616.jpg',
        '/images/tuongquanam/z6935996465357_45a9215eb615186818db3f0de2c7c99c.jpg',
        '/images/tuongquanam/z6935996515479_4c898db0c4be210ed3c29dcac237890d.jpg'
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
        '/images/tuongxuongha/z6935996169314_540c7a22a536effc7f9f0793af04bc7f.jpg',
        '/images/tuongxuongha/z6935996214903_85c80a1268eb444f9114fcce675803f6.jpg',
        '/images/tuongxuongha/z6935996270251_f8253f86d13baca22969ca76cecf7772.jpg'
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
        '/images/denda/z5263480249653_c9623d7f0b44f38bd43eea61eed1b802.jpg',
        '/images/denda/z5263480255048_0f431ad8e9c0fdf5aa466c2b7d283430.jpg',
        '/images/denda/z5263480259719_e5363223830ac0bb91f2b946ea09382e.jpg',
        '/images/denda/z5263480281375_a12a3eb42da38fb9f730727ace8856e4.jpg'
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
        '/images/daiphunnuoc/z6935966486097_abef2308bca90db4aa1fe20f645f496f.jpg',
        '/images/daiphunnuoc/z6935966060308_9b8ae45fc0d95c6014c18912b55aeee9.jpg',
        '/images/daiphunnuoc/z6935995821579_31fd3540b89447867861d97765bbba64.jpg',
        '/images/daiphunnuoc/z6935995878489_6bb5faa08046d4d50c3e921491c8083c.jpg'
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
        '/images/saedenda/z5263480282221_35f49d97e81d37c17368da989862c4b7.jpg',
        '/images/saedenda/z5263480284647_4367ea8e0f4f5d4bcbb78e5783816452.jpg',
        '/images/saedenda/z5263480292587_09b32acac4c50235cddeb85c15e3e2df.jpg'
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
        '/images/saetongchutieu/anh1.png',
        '/images/saetongchutieu/anh2.png',
        '/images/saetongchutieu/anh3.png',
        '/images/saetongchutieu/anh4.png'
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
        '/images/saedieukhacchandung/z6935996169314_540c7a22a536effc7f9f0793af04bc7f.jpg',
        '/images/saedieukhacchandung/z6935996214903_85c80a1268eb444f9114fcce675803f6.jpg',
        '/images/saedieukhacchandung/z6935996270251_f8253f86d13baca22969ca76cecf7772.jpg',
        '/images/saedieukhacchandung/z6935996318350_b0a04c7639066f73d482d2b132ab6925.jpg'
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
