import { NextRequest, NextResponse } from 'next/server'
import { findCatalogCategory, readFromDatabase } from '../../../../../lib/catalog'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid category ID',
          message: 'Category ID must be a valid number'
        },
        { status: 400 }
      )
    }

    const loaded = await readFromDatabase((db) =>
      db.category.findUnique({
        where: { id },
        include: {
          products: {
            where: { isActive: true },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
    )
    const category = loaded.ok ? loaded.value : findCatalogCategory(id)

    if (!category) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category not found',
          message: 'Category with this ID does not exist'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Không thể tải danh mục.'
      },
      { status: 500 }
    )
  }
}
