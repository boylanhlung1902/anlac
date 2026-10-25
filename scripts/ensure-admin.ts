import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/admin-password'

const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || ''
const email = (process.env.ADMIN_EMAIL || `${username}@anlacstone.local`).trim().toLowerCase()
const name = (process.env.ADMIN_NAME || 'Quản trị An Lạc Stone').trim()

async function main() {
  if (!/^[a-z0-9._-]{3,40}$/.test(username) || password.length < 8 || password.length > 100) {
    console.error('Cần ADMIN_USERNAME và ADMIN_PASSWORD (8-100 ký tự).')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.upsert({
    where: { email },
    update: { username, passwordHash, role: 'ADMIN', isActive: true, name },
    create: { email, username, passwordHash, role: 'ADMIN', isActive: true, name },
  })
  console.log(`Admin ready: id=${user.id} username=${user.username}`)
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : 'Không tạo được tài khoản quản trị.')
  process.exit(1)
})
