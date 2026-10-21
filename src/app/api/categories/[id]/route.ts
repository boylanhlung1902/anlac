import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/database'

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

    const category = await prisma.category.findUnique({
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
          error: 'Invalid category ID',
          message: 'Category ID must be a valid number'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, image, slug } = body

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category not found',
          message: 'Category with this ID does not exist'
        },
        { status: 404 }
      )
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        image,
        slug
      }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    })
  } catch (error) {
    console.error('Error updating category:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Duplicate entry',
          message: 'Category with this name or slug already exists'
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
          error: 'Invalid category ID',
          message: 'Category ID must be a valid number'
        },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category not found',
          message: 'Category with this ID does not exist'
        },
        { status: 404 }
      )
    }

    // Check if category has products
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot delete category',
          message: 'Category has associated products. Please remove all products first.'
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
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