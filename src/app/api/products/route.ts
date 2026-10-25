import { NextRequest, NextResponse } from 'next/server'
import { queryCatalogProducts, readFromDatabase } from '../../../../lib/catalog'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.min(500, Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1))
    const limit = Math.min(48, Math.max(1, Number.parseInt(searchParams.get('limit') || '12', 10) || 12))
    const category = searchParams.get('category')?.slice(0, 80) || null
    const search = searchParams.get('search')?.slice(0, 80) || null
    const featured = searchParams.get('featured') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
      category: { isActive: true },
    }

    if (category) {
      where.category = {
        slug: category,
        isActive: true,
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

    const loaded = await readFromDatabase(async (db) => {
      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          include: {
            category: true
          },
          orderBy,
          skip,
          take: limit
        }),
        db.product.count({ where })
      ])
      return { products, total }
    })

    if (loaded.ok) {
      const { products, total } = loaded.value
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
    }

    return NextResponse.json({
      success: true,
      data: queryCatalogProducts({
        page,
        limit,
        category,
        search,
        featured,
        sortBy,
        sortOrder,
      })
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Không thể tải danh sách sản phẩm.'
      },
      { status: 500 }
    )
  }
} 