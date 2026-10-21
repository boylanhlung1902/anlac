import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/database'
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

    if (!product) {
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
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
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
      isFeatured,
      isActive
    } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        },
        { status: 404 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        priceVND: priceVND ? parseInt(priceVND) : undefined,
        netPrice: netPrice != null && netPrice !== '' ? parseFloat(netPrice) : undefined,
        image,
        images,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        slug,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        material,
        origin,
        isFeatured,
        isActive
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    
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

export async function DELETE(
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
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