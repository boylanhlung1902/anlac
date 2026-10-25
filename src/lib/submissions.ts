import { Prisma } from '@prisma/client'
import { getPrisma } from '../../lib/database'

export type SubmissionItem = {
  productId: number
  name: string
  quantity: number
  priceVND: number
}

export async function saveSubmission(input: {
  kind: 'CONTACT' | 'ORDER'
  name: string
  email: string
  phone?: string | null
  subject?: string | null
  message?: string | null
  items?: SubmissionItem[] | null
  totalVND?: number
  source: string
}) {
  const db = getPrisma()
  if (!db) return null
  return db.customerSubmission.create({
    data: {
      kind: input.kind,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject || null,
      message: input.message || null,
      items: input.items && input.items.length > 0 ? input.items : Prisma.JsonNull,
      totalVND: input.totalVND || 0,
      source: input.source,
      status: 'NEW',
    },
  })
}
