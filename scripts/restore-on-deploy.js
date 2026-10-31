const { execSync } = require('child_process')

const url = process.env.DATABASE_URL || ''
const isLocal = !url || /localhost|127\.0\.0\.1|placeholder/i.test(url)

if (isLocal) {
  console.log('Skip database restore: no hosted DATABASE_URL')
  process.exit(0)
}

function run(command) {
  console.log(`> ${command}`)
  try {
    execSync(command, {
      stdio: 'inherit',
      env: process.env,
    })
  } catch (error) {
    const status = error && typeof error.status === 'number' ? error.status : 1
    console.error(`Command failed (${status}): ${command}`)
    process.exit(status || 1)
  }
}

run('npx prisma db push --skip-generate')
run('npx tsx prisma/restore-snapshot.ts')

const adminUsername = (process.env.ADMIN_USERNAME || '').trim()
const adminPassword = process.env.ADMIN_PASSWORD || ''
if (!adminUsername || !adminPassword) {
  console.log('Skip admin account: ADMIN_USERNAME or ADMIN_PASSWORD is not set')
  process.exit(0)
}

run('npx tsx scripts/ensure-admin.ts')
