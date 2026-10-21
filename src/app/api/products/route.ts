import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (search) {
      const term = search.trim()
      const searchOr: any[] = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { material: { contains: term, mode: 'insensitive' } },
      ]

      // When not already filtering by a category slug, also match category name/slug
      if (!category) {
        searchOr.push({
          category: {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { slug: { contains: term, mode: 'insensitive' } },
            ],
          },
        })
      }

      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { OR: searchOr },
      ]
    }

    if (featured) {
      where.isFeatured = true
    }

    // Build orderBy clause
    let orderBy: any = {}
    
    // Map frontend sort fields to database fields
    const sortFieldMap: { [key: string]: string } = {
      'name': 'name',
      'price': 'price',
      'priceVND': 'priceVND',
      'rating': 'rating',
      'createdAt': 'createdAt',
      'newest': 'createdAt',
      'oldest': 'createdAt',
      'priceAsc': 'priceVND',
      'priceDesc': 'priceVND',
      'nameAsc': 'name',
      'nameDesc': 'name',
      'ratingDesc': 'rating'
    }

    const dbField = sortFieldMap[sortBy] || 'createdAt'
    orderBy[dbField] = sortOrder

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      priceVND,
      netPrice,
      image,
      images,
      categoryId,
      stock,
      slug,
      weight,
      dimensions,
      material,
      origin,
      isFeatured = false
    } = body

    // Validate required fields
    if (!name || !description || !price || !priceVND || !image || !categoryId || !slug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Name, description, price, priceVND, image, categoryId, and slug are required'
        },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        priceVND: parseInt(priceVND),
        netPrice: netPrice != null && netPrice !== ''
          ? parseFloat(netPrice)
          : Math.round((parseFloat(price) / 1.1) * 100) / 100,
        image,
        images: images || [],
        categoryId: parseInt(categoryId),
        stock: parseInt(stock) || 0,
        slug,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        material,
        origin,
        isFeatured
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Duplicate entry',
          message: 'Product with this slug already exists'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 