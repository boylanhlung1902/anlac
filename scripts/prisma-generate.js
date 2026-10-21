const { execSync } = require('child_process')

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder'
}

execSync('prisma generate', {
  stdio: 'inherit',
  env: process.env,
})
