const { execSync } = require('child_process')

const url = process.env.DATABASE_URL || ''
const isLocal = !url || /localhost|127\.0\.0\.1|placeholder/i.test(url)

if (isLocal) {
  console.log('Skip database restore: no hosted DATABASE_URL')
  process.exit(0)
}

execSync('npx prisma db push --skip-generate', {
  stdio: 'inherit',
  env: process.env,
})

execSync('npx tsx prisma/restore-snapshot.ts', {
  stdio: 'inherit',
  env: process.env,
})
