import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'da-phong-thuy' },
      update: {},
      create: {
        name: 'Đá Phong Thủy',
        description: 'Các loại đá phong thủy mang lại may mắn và bình an cho gia chủ',
        slug: 'da-phong-thuy',
        image: '/images/anh1.jpg'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'tuong-da-nghe-thuat' },
      update: {},
      create: {
        name: 'Tượng Đá Nghệ Thuật',
        description: 'Tượng đá nghệ thuật được điêu khắc tinh xảo, mang giá trị thẩm mỹ cao',
        slug: 'tuong-da-nghe-thuat',
        image: '/images/anh2.jpg'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'da-canh-trang-tri' },
      update: {},
      create: {
        name: 'Đá Cảnh Trang Trí',
        description: 'Đá cảnh trang trí cho không gian sống, văn phòng và sân vườn',
        slug: 'da-canh-trang-tri',
        image: '/images/anh3.jpg'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'vong-tay-da-quy' },
      update: {},
      create: {
        name: 'Vòng Tay Đá Quý',
        description: 'Vòng tay được chế tác từ các loại đá quý tự nhiên',
        slug: 'vong-tay-da-quy',
        image: '/images/anh4.jpg'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mat-day-chuyen-da' },
      update: {},
      create: {
        name: 'Mặt Dây Chuyền Đá',
        description: 'Mặt dây chuyền đá quý với thiết kế độc đáo',
        slug: 'mat-day-chuyen-da',
        image: '/images/anh5.jpg'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'ban-da-trang-tri' },
      update: {},
      create: {
        name: 'Bàn Đá Trang Trí',
        description: 'Bàn đá trang trí cho phòng khách và văn phòng',
        slug: 'ban-da-trang-tri',
        image: '/images/anh6.jpg'
      }
    })
  ])

  console.log('✅ Categories created')

  // Create products
  const products = await Promise.all([
    // Đá Phong Thủy
    prisma.product.upsert({
      where: { slug: 'da-thach-anh-tim' },
      update: {},
      create: {
        name: 'Đá Thạch Anh Tím',
        description: 'Đá thạch anh tím tự nhiên, có tác dụng tăng cường trí tuệ và sự tập trung. Phù hợp cho học sinh, sinh viên và người làm việc trí óc.',
        price: 75.00,
        priceVND: 1800000,
        netPrice: 1636363.64,
        tax: 10,
        image: '/images/anh1.jpg',
        images: ['/images/anh1.jpg', '/images/anh2.jpg'],
        categoryId: categories[0].id,
        stock: 15,
        rating: 5.0,
        reviewCount: 48,
        isFeatured: true,
        slug: 'da-thach-anh-tim',
        weight: 1.8,
        dimensions: '15 x 10 x 20 cm',
        material: 'Thạch Anh Tím Tự Nhiên',
        origin: 'Brazil'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'da-ma-nao-do' },
      update: {},
      create: {
        name: 'Đá Mã Não Đỏ',
        description: 'Đá mã não đỏ tự nhiên, mang lại năng lượng tích cực và bảo vệ. Giúp tăng cường sức khỏe và sự dũng cảm.',
        price: 39.58,
        priceVND: 950000,
        netPrice: 863636.36,
        tax: 10,
        image: '/images/anh2.jpg',
        images: ['/images/anh2.jpg'],
        categoryId: categories[0].id,
        stock: 20,
        rating: 4.5,
        reviewCount: 28,
        isFeatured: false,
        slug: 'da-ma-nao-do',
        weight: 0.8,
        dimensions: '10 x 8 x 12 cm',
        material: 'Mã Não Đỏ Tự Nhiên',
        origin: 'Ấn Độ'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'da-ngoc-bich' },
      update: {},
      create: {
        name: 'Đá Ngọc Bích',
        description: 'Đá ngọc bích tự nhiên, biểu tượng của sự may mắn và thịnh vượng. Mang lại sự bình an và hài hòa trong cuộc sống.',
        price: 62.50,
        priceVND: 1500000,
        netPrice: 1363636.36,
        tax: 10,
        image: '/images/anh3.jpg',
        images: ['/images/anh3.jpg'],
        categoryId: categories[0].id,
        stock: 12,
        rating: 5.0,
        reviewCount: 32,
        isFeatured: true,
        slug: 'da-ngoc-bich',
        weight: 1.5,
        dimensions: '12 x 10 x 18 cm',
        material: 'Ngọc Bích Tự Nhiên',
        origin: 'Myanmar'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'da-thach-anh-trang' },
      update: {},
      create: {
        name: 'Đá Thạch Anh Trắng',
        description: 'Đá thạch anh trắng tinh khiết, mang lại năng lượng tích cực và thanh lọc không gian. Phù hợp cho phòng ngủ và phòng thiền.',
        price: 50.00,
        priceVND: 1200000,
        netPrice: 1090909.09,
        tax: 10,
        image: '/images/anh4.jpg',
        images: ['/images/anh4.jpg'],
        categoryId: categories[0].id,
        stock: 25,
        rating: 4.0,
        reviewCount: 16,
        isFeatured: false,
        slug: 'da-thach-anh-trang',
        weight: 1.0,
        dimensions: '8 x 6 x 15 cm',
        material: 'Thạch Anh Trắng Tự Nhiên',
        origin: 'Brazil'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'da-ho-phach' },
      update: {},
      create: {
        name: 'Đá Hổ Phách',
        description: 'Đá hổ phách tự nhiên, mang lại sự bảo vệ và may mắn cho người sở hữu. Có tác dụng chữa bệnh và tăng cường sức khỏe.',
        price: 87.50,
        priceVND: 2100000,
        netPrice: 1909090.91,
        tax: 10,
        image: '/images/anh5.jpg',
        images: ['/images/anh5.jpg'],
        categoryId: categories[0].id,
        stock: 10,
        rating: 5.0,
        reviewCount: 28,
        isFeatured: false,
        slug: 'da-ho-phach',
        weight: 1.2,
        dimensions: '10 x 8 x 16 cm',
        material: 'Hổ Phách Tự Nhiên',
        origin: 'Baltic'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'da-thach-anh-hong' },
      update: {},
      create: {
        name: 'Đá Thạch Anh Hồng',
        description: 'Đá thạch anh hồng tự nhiên, biểu tượng của tình yêu và hạnh phúc. Giúp cân bằng cảm xúc và tăng cường mối quan hệ.',
        price: 66.67,
        priceVND: 1600000,
        netPrice: 1454545.45,
        tax: 10,
        image: '/images/anh6.jpg',
        images: ['/images/anh6.jpg'],
        categoryId: categories[0].id,
        stock: 18,
        rating: 4.8,
        reviewCount: 35,
        isFeatured: true,
        slug: 'da-thach-anh-hong',
        weight: 1.3,
        dimensions: '12 x 9 x 18 cm',
        material: 'Thạch Anh Hồng Tự Nhiên',
        origin: 'Brazil'
      }
    }),

    // Tượng Đá Nghệ Thuật
    prisma.product.upsert({
      where: { slug: 'tuong-phat-da-thach-anh' },
      update: {},
      create: {
        name: 'Tượng Phật Đá Thạch Anh',
        description: 'Tượng Phật được chế tác từ đá thạch anh tự nhiên, mang lại sự bình an và may mắn cho gia chủ. Điêu khắc tinh xảo, chi tiết hoàn hảo.',
        price: 100.00,
        priceVND: 2400000,
        netPrice: 2181818.18,
        tax: 10,
        image: '/images/anh7.jpg',
        images: ['/images/anh7.jpg', '/images/anh8.jpg'],
        categoryId: categories[1].id,
        stock: 10,
        rating: 4.5,
        reviewCount: 24,
        isFeatured: true,
        slug: 'tuong-phat-da-thach-anh',
        weight: 2.5,
        dimensions: '20 x 15 x 30 cm',
        material: 'Thạch Anh Tự Nhiên',
        origin: 'Việt Nam'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'tuong-rong-da-ngoc' },
      update: {},
      create: {
        name: 'Tượng Rồng Đá Ngọc',
        description: 'Tượng rồng được điêu khắc tinh xảo từ đá ngọc, tượng trưng cho quyền lực và thịnh vượng. Phù hợp cho văn phòng và phòng khách.',
        price: 133.33,
        priceVND: 3200000,
        netPrice: 2909090.91,
        tax: 10,
        image: '/images/anh8.jpg',
        images: ['/images/anh8.jpg'],
        categoryId: categories[1].id,
        stock: 5,
        rating: 4.0,
        reviewCount: 12,
        isFeatured: true,
        slug: 'tuong-rong-da-ngoc',
        weight: 3.2,
        dimensions: '25 x 20 x 35 cm',
        material: 'Đá Ngọc Tự Nhiên',
        origin: 'Myanmar'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'tuong-quan-am-da-trang' },
      update: {},
      create: {
        name: 'Tượng Quan Âm Đá Trắng',
        description: 'Tượng Quan Âm được điêu khắc từ đá trắng tinh khiết, mang lại sự bình an và từ bi. Tác phẩm nghệ thuật độc đáo.',
        price: 116.67,
        priceVND: 2800000,
        netPrice: 2545454.55,
        tax: 10,
        image: '/images/anh9.jpg',
        images: ['/images/anh9.jpg'],
        categoryId: categories[1].id,
        stock: 8,
        rating: 4.0,
        reviewCount: 16,
        isFeatured: false,
        slug: 'tuong-quan-am-da-trang',
        weight: 2.8,
        dimensions: '22 x 18 x 32 cm',
        material: 'Đá Trắng Tự Nhiên',
        origin: 'Việt Nam'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'tuong-ty-huu-da-den' },
      update: {},
      create: {
        name: 'Tượng Tỳ Hưu Đá Đen',
        description: 'Tượng Tỳ Hưu được chế tác từ đá đen, biểu tượng của tài lộc và bảo vệ. Giúp thu hút tiền tài và xua đuổi tà khí.',
        price: 108.33,
        priceVND: 2600000,
        netPrice: 2363636.36,
        tax: 10,
        image: '/images/anh10.jpg',
        images: ['/images/anh10.jpg'],
        categoryId: categories[1].id,
        stock: 6,
        rating: 4.0,
        reviewCount: 18,
        isFeatured: false,
        slug: 'tuong-ty-huu-da-den',
        weight: 2.2,
        dimensions: '18 x 15 x 25 cm',
        material: 'Đá Đen Tự Nhiên',
        origin: 'Việt Nam'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'tuong-phat-di-lac' },
      update: {},
      create: {
        name: 'Tượng Phật Di Lặc',
        description: 'Tượng Phật Di Lặc được điêu khắc tinh xảo, biểu tượng của hạnh phúc và may mắn. Mang lại tiếng cười và niềm vui.',
        price: 145.83,
        priceVND: 3500000,
        netPrice: 3181818.18,
        tax: 10,
        image: '/images/anh11.jpg',
        images: ['/images/anh11.jpg'],
        categoryId: categories[1].id,
        stock: 4,
        rating: 4.0,
        reviewCount: 22,
        isFeatured: false,
        slug: 'tuong-phat-di-lac',
        weight: 3.5,
        dimensions: '28 x 22 x 38 cm',
        material: 'Đá Quý Tự Nhiên',
        origin: 'Thái Lan'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'tuong-ngu-long-da-xanh' },
      update: {},
      create: {
        name: 'Tượng Ngũ Long Đá Xanh',
        description: 'Tượng năm con rồng được điêu khắc từ đá xanh, biểu tượng của quyền lực và thịnh vượng. Tác phẩm nghệ thuật độc đáo.',
        price: 166.67,
        priceVND: 4000000,
        netPrice: 3636363.64,
        tax: 10,
        image: '/images/anh12.jpg',
        images: ['/images/anh12.jpg'],
        categoryId: categories[1].id,
        stock: 3,
        rating: 4.5,
        reviewCount: 8,
        isFeatured: true,
        slug: 'tuong-ngu-long-da-xanh',
        weight: 4.0,
        dimensions: '30 x 25 x 40 cm',
        material: 'Đá Xanh Tự Nhiên',
        origin: 'Việt Nam'
      }
    }),

    // Đá Cảnh Trang Trí
    prisma.product.upsert({
      where: { slug: 'non-bo-da-canh' },
      update: {},
      create: {
        name: 'Non Bộ Đá Cảnh',
        description: 'Non bộ đá cảnh trang trí cho sân vườn, tạo không gian thiên nhiên thu nhỏ. Kết hợp đá và cây cảnh hài hòa.',
        price: 83.33,
        priceVND: 2000000,
        netPrice: 1818181.82,
        tax: 10,
        image: '/images/anh13.jpg',
        images: ['/images/anh13.jpg'],
        categoryId: categories[2].id,
        stock: 12,
        rating: 4.2,
        reviewCount: 15,
        isFeatured: true,
        slug: 'non-bo-da-canh',
        weight: 5.0,
        dimensions: '40 x 30 x 25 cm',
        material: 'Đá Tự Nhiên + Cây Cảnh',
        origin: 'Việt Nam'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'da-canh-trang-tri-ban' },
      update: {},
      create: {
        name: 'Đá Cảnh Trang Trí Bàn',
        description: 'Đá cảnh trang trí bàn làm việc, tạo không gian xanh mát và thư giãn. Phù hợp cho văn phòng và nhà ở.',
        price: 25.00,
        priceVND: 600000,
        netPrice: 545454.55,
        tax: 10,
        image: '/images/anh14.jpg',
        images: ['/images/anh14.jpg'],
        categoryId: categories[2].id,
        stock: 30,
        rating: 4.0,
        reviewCount: 42,
        isFeatured: false,
        slug: 'da-canh-trang-tri-ban',
        weight: 0.5,
        dimensions: '15 x 10 x 8 cm',
        material: 'Đá Tự Nhiên',
        origin: 'Việt Nam'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'da-canh-suc-vat' },
      update: {},
      create: {
        name: 'Đá Cảnh Súc Vật',
        description: 'Đá cảnh hình các con vật được điêu khắc tinh xảo, trang trí cho sân vườn và không gian ngoài trời.',
        price: 41.67,
        priceVND: 1000000,
        netPrice: 909090.91,
        tax: 10,
        image: '/images/anh15.jpg',
        images: ['/images/anh15.jpg'],
        categoryId: categories[2].id,
        stock: 20,
        rating: 4.3,
        reviewCount: 25,
        isFeatured: false,
        slug: 'da-canh-suc-vat',
        weight: 2.0,
        dimensions: '20 x 15 x 12 cm',
        material: 'Đá Tự Nhiên',
        origin: 'Việt Nam'
      }
    }),

    // Vòng Tay Đá Quý
    prisma.product.upsert({
      where: { slug: 'vong-tay-thach-anh-tim' },
      update: {},
      create: {
        name: 'Vòng Tay Thạch Anh Tím',
        description: 'Vòng tay được chế tác từ đá thạch anh tím tự nhiên, mang lại may mắn và bảo vệ cho người đeo.',
        price: 20.83,
        priceVND: 500000,
        netPrice: 454545.45,
        tax: 10,
        image: '/images/anh16.jpg',
        images: ['/images/anh16.jpg'],
        categoryId: categories[3].id,
        stock: 50,
        rating: 4.7,
        reviewCount: 68,
        isFeatured: true,
        slug: 'vong-tay-thach-anh-tim',
        weight: 0.1,
        dimensions: 'Đường kính 6.5 cm',
        material: 'Thạch Anh Tím Tự Nhiên',
        origin: 'Brazil'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'vong-tay-ngoc-bich' },
      update: {},
      create: {
        name: 'Vòng Tay Ngọc Bích',
        description: 'Vòng tay ngọc bích tự nhiên, biểu tượng của sự may mắn và thịnh vượng. Thiết kế thanh lịch, phù hợp mọi lứa tuổi.',
        price: 33.33,
        priceVND: 800000,
        netPrice: 727272.73,
        tax: 10,
        image: '/images/anh17.jpg',
        images: ['/images/anh17.jpg'],
        categoryId: categories[3].id,
        stock: 35,
        rating: 4.8,
        reviewCount: 45,
        isFeatured: true,
        slug: 'vong-tay-ngoc-bich',
        weight: 0.15,
        dimensions: 'Đường kính 6.8 cm',
        material: 'Ngọc Bích Tự Nhiên',
        origin: 'Myanmar'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'vong-tay-ma-nao-do' },
      update: {},
      create: {
        name: 'Vòng Tay Mã Não Đỏ',
        description: 'Vòng tay mã não đỏ tự nhiên, mang lại năng lượng tích cực và bảo vệ. Màu sắc đẹp mắt, phù hợp trang phục.',
        price: 16.67,
        priceVND: 400000,
        netPrice: 363636.36,
        tax: 10,
        image: '/images/anh1.jpg',
        images: ['/images/anh1.jpg'],
        categoryId: categories[3].id,
        stock: 60,
        rating: 4.5,
        reviewCount: 38,
        isFeatured: false,
        slug: 'vong-tay-ma-nao-do',
        weight: 0.08,
        dimensions: 'Đường kính 6.2 cm',
        material: 'Mã Não Đỏ Tự Nhiên',
        origin: 'Ấn Độ'
      }
    }),

    // Mặt Dây Chuyền Đá
    prisma.product.upsert({
      where: { slug: 'mat-day-chuyen-thach-anh-tim' },
      update: {},
      create: {
        name: 'Mặt Dây Chuyền Thạch Anh Tím',
        description: 'Mặt dây chuyền thạch anh tím tự nhiên, thiết kế độc đáo và thanh lịch. Phù hợp cho cả nam và nữ.',
        price: 25.00,
        priceVND: 600000,
        netPrice: 545454.55,
        tax: 10,
        image: '/images/anh2.jpg',
        images: ['/images/anh2.jpg'],
        categoryId: categories[4].id,
        stock: 40,
        rating: 4.6,
        reviewCount: 52,
        isFeatured: true,
        slug: 'mat-day-chuyen-thach-anh-tim',
        weight: 0.05,
        dimensions: '2.5 x 2.5 cm',
        material: 'Thạch Anh Tím Tự Nhiên',
        origin: 'Brazil'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'mat-day-chuyen-ngoc-bich' },
      update: {},
      create: {
        name: 'Mặt Dây Chuyền Ngọc Bích',
        description: 'Mặt dây chuyền ngọc bích tự nhiên, biểu tượng của sự may mắn và thịnh vượng. Thiết kế cổ điển, giá trị cao.',
        price: 41.67,
        priceVND: 1000000,
        netPrice: 909090.91,
        tax: 10,
        image: '/images/anh3.jpg',
        images: ['/images/anh3.jpg'],
        categoryId: categories[4].id,
        stock: 25,
        rating: 4.9,
        reviewCount: 33,
        isFeatured: true,
        slug: 'mat-day-chuyen-ngoc-bich',
        weight: 0.08,
        dimensions: '3 x 3 cm',
        material: 'Ngọc Bích Tự Nhiên',
        origin: 'Myanmar'
      }
    }),

    // Bàn Đá Trang Trí
    prisma.product.upsert({
      where: { slug: 'ban-da-trang-tri-phong-khach' },
      update: {},
      create: {
        name: 'Bàn Đá Trang Trí Phòng Khách',
        description: 'Bàn đá trang trí cho phòng khách, thiết kế hiện đại và sang trọng. Phù hợp cho không gian nội thất cao cấp.',
        price: 208.33,
        priceVND: 5000000,
        netPrice: 4545454.55,
        tax: 10,
        image: '/images/anh4.jpg',
        images: ['/images/anh4.jpg', '/images/anh5.jpg'],
        categoryId: categories[5].id,
        stock: 8,
        rating: 4.4,
        reviewCount: 12,
        isFeatured: true,
        slug: 'ban-da-trang-tri-phong-khach',
        weight: 25.0,
        dimensions: '120 x 60 x 45 cm',
        material: 'Đá Tự Nhiên + Gỗ',
        origin: 'Việt Nam'
      }
    }),
    prisma.product.upsert({
      where: { slug: 'ban-da-trang-tri-van-phong' },
      update: {},
      create: {
        name: 'Bàn Đá Trang Trí Văn Phòng',
        description: 'Bàn đá trang trí cho văn phòng, thiết kế chuyên nghiệp và hiện đại. Tạo không gian làm việc sang trọng.',
        price: 166.67,
        priceVND: 4000000,
        netPrice: 3636363.64,
        tax: 10,
        image: '/images/anh6.jpg',
        images: ['/images/anh6.jpg'],
        categoryId: categories[5].id,
        stock: 10,
        rating: 4.3,
        reviewCount: 18,
        isFeatured: false,
        slug: 'ban-da-trang-tri-van-phong',
        weight: 20.0,
        dimensions: '100 x 50 x 40 cm',
        material: 'Đá Tự Nhiên + Kim Loại',
        origin: 'Việt Nam'
      }
    })
  ])

  console.log('✅ Products created')

  // Create test users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Nguyễn Văn Test',
        phone: '087-770-5979',
        address: '123 Đường Test, Quận 1, TP.HCM',
        role: 'CUSTOMER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin@stoneart.com' },
      update: {},
      create: {
        email: 'anlacstone@gmail.com',
        name: 'Admin An Lac Stone',
        phone: '090-987-6543',
        address: '44 Huỳnh Thị Một, Ngũ Hành Sơn, Đà Nẵng',
        role: 'ADMIN'
      }
    }),
    prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        name: 'Trần Thị Khách Hàng',
        phone: '090-555-1234',
        address: '789 Đường Khách, Quận 7, TP.HCM',
        role: 'CUSTOMER'
      }
    })
  ])

  console.log('✅ Test users created')

  console.log('🎉 Database seeding completed!')
  console.log(`📊 Created ${categories.length} categories`)
  console.log(`📦 Created ${products.length} products`)
  console.log(`👤 Created ${users.length} test users`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 