export const ADMIN_COOKIE = 'anlac_admin'
export const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 12

export type AdminToken = { sub: number; exp: number }

export function readSessionSecret() {
  const secret = (process.env.ADMIN_SESSION_SECRET || '').trim()
  if (secret.length < 32) return null
  return secret
}

function encodeB64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeB64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new TextDecoder().decode(bytes)
}

function safeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(left)
  const b = new TextEncoder().encode(right)
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index]
  return diff === 0
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const bytes = new Uint8Array(signature)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export async function createAdminToken(userId: number) {
  const secret = readSessionSecret()
  if (!secret) return null
  const payload = encodeB64Url(JSON.stringify({
    sub: userId,
    exp: Date.now() + ADMIN_MAX_AGE_SECONDS * 1000,
  }))
  return `${payload}.${await sign(payload, secret)}`
}

export async function readAdminToken(token: string | undefined | null): Promise<AdminToken | null> {
  const secret = readSessionSecret()
  if (!secret || !token) return null
  const dot = token.indexOf('.')
  if (dot <= 0) return null
  const payload = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  if (!safeEqual(await sign(payload, secret), signature)) return null
  try {
    const data = JSON.parse(decodeB64Url(payload)) as { sub?: unknown; exp?: unknown }
    if (typeof data.sub !== 'number' || !Number.isInteger(data.sub) || data.sub <= 0) return null
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return { sub: data.sub, exp: data.exp }
  } catch {
    return null
  }
}
