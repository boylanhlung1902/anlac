import { NextRequest } from 'next/server'
import { findCatalogCategory, readFromDatabase } from '../../../../../lib/catalog'
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
          error: 'Invalid category ID',
          message: 'Category ID must be a valid number'
        },
        400
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
      return noStoreJson(
        { 
          success: false,
          error: 'Category not found',
          message: 'Category with this ID does not exist'
        },
        404
      )
    }

    return noStoreJson({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return noStoreJson(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Không thể tải danh mục.'
      },
      500
    )
  }
}
