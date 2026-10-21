import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = getPrisma() ?? undefined
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma()
    if (!client) {
      throw new Error('DATABASE_URL is not set')
    }
    const value = client[prop as keyof PrismaClient]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value
  },
})
