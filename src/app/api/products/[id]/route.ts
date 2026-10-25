import { NextRequest, NextResponse } from 'next/server'
import { findCatalogProduct, readFromDatabase } from '../../../../../lib/catalog'

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
          error: 'Invalid product ID',
          message: 'Product ID must be a valid number'
        },
        { status: 400 }
      )
    }

    const loaded = await readFromDatabase((db) =>
      db.product.findUnique({
        where: { id },
        include: {
          category: true
        }
      })
    )
    const product = loaded.ok ? loaded.value : findCatalogProduct(id)

    const category = product?.category
    const categoryHidden = Boolean(category && 'isActive' in category && category.isActive === false)
    if (!product || product.isActive === false || categoryHidden) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Không thể tải sản phẩm.'
      },
      { status: 500 }
    )
  }
}
