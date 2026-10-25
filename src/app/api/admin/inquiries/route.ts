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
    const kind = searchParams.get('kind')
    const status = searchParams.get('status')
    const where: Prisma.CustomerSubmissionWhereInput = {}
    if (kind === 'CONTACT' || kind === 'ORDER') where.kind = kind
    if (status === 'NEW' || status === 'CONTACTED' || status === 'DONE' || status === 'CANCELLED') where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { subject: { contains: search, mode: 'insensitive' } },
      ]
    }
    const [rows, total] = await Promise.all([
      auth.db.customerSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      auth.db.customerSubmission.count({ where }),
    ])
    return adminOk({
      inquiries: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      pagination: pageInfo(page, limit, total),
    })
  } catch (error) {
    console.error('Admin inquiries failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không tải được yêu cầu khách.')
  }
}
