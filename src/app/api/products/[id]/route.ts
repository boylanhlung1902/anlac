import { NextRequest } from 'next/server'
import { findCatalogProduct, readFromDatabase } from '../../../../../lib/catalog'
import { noStoreJson } from '@/lib/no-store-json'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return noStoreJson(
        { 
          success: false,
          error: 'Invalid product ID',
          message: 'Product ID must be a valid number'
        },
        400
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
      return noStoreJson(
        { 
          success: false,
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        },
        404
      )
    }

    return noStoreJson({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return noStoreJson(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Không thể tải sản phẩm.'
      },
      500
    )
  }
}
