import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { adminError, adminOk, pageInfo, readPage, requireAdmin } from '@/lib/admin-http'
import { singleLine } from '../../../../../lib/mail'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = readPage(searchParams)
    const search = singleLine(searchParams.get('search') || '', 80)
    const role = searchParams.get('role')
    const where: Prisma.UserWhereInput = {}
    if (role === 'ADMIN' || role === 'CUSTOMER') where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }
    const [users, total] = await Promise.all([
      auth.db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      auth.db.user.count({ where }),
    ])
    return adminOk({
      users: users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() })),
      pagination: pageInfo(page, limit, total),
      actorId: auth.user.id,
    })
  } catch (error) {
    console.error('Admin users failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được tài khoản.')
  }
}
