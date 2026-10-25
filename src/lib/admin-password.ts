import { randomBytes, scrypt, timingSafeEqual } from 'crypto'

export const DUMMY_PASSWORD_HASH = `scrypt$${ '00'.repeat(16) }$${ '11'.repeat(32) }`

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 32, (error, key) => {
      if (error) reject(error)
      else resolve(`scrypt$${salt}$${key.toString('hex')}`)
    })
  })
}

export function verifyPassword(password: string, stored: string) {
  return new Promise<boolean>((resolve) => {
    const [scheme, salt, encoded] = stored.split('$')
    if (scheme !== 'scrypt' || !salt || !encoded || !/^[0-9a-f]+$/i.test(salt) || !/^[0-9a-f]+$/i.test(encoded)) {
      resolve(false)
      return
    }
    const expected = Buffer.from(encoded, 'hex')
    scrypt(password, salt, expected.length, (error, key) => {
      if (error || key.length !== expected.length) {
        resolve(false)
        return
      }
      resolve(timingSafeEqual(key, expected))
    })
  })
}
