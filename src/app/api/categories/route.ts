import { NextRequest } from 'next/server'
import { queryCatalogCategories, readFromDatabase } from '../../../../lib/catalog'
import { noStoreJson } from '@/lib/no-store-json'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const loaded = await readFromDatabase((db) =>
      db.category.findMany({
        where: { isActive: true, products: { some: { isActive: true, category: { isActive: true } } } },
        include: includeProducts ? {
          products: {
            where: { isActive: true },
            take: 6,
            orderBy: {
              createdAt: 'desc'
            }
          }
        } : undefined,
        orderBy: {
          name: 'asc'
        }
      })
    )
    const categories = loaded.ok ? loaded.value : queryCatalogCategories(includeProducts)

    return noStoreJson({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
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
