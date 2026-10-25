import nodemailer from 'nodemailer'
import { NextRequest } from 'next/server'

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function singleLine(value: string, max: number) {
  return value.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

export function clientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown'
  return ip.slice(0, 64)
}

function unwrapEnv(value: string) {
  const trimmed = value.trim().replace(/[\u200B-\u200D\uFEFF]/g, '')
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

export function readGmailAuth() {
  const user = unwrapEnv(process.env.EMAIL_USER || '').toLowerCase()
  const pass = unwrapEnv(process.env.EMAIL_PASS || '').replace(/[^a-z]/gi, '').toLowerCase()
  return { user, pass }
}

export async function sendGmail(mail: nodemailer.SendMailOptions) {
  const { user, pass } = readGmailAuth()
  if (!user || pass.length !== 16) {
    const error = new Error('MAIL_NOT_CONFIGURED')
    throw error
  }

  const attempts = [
    { host: 'smtp.gmail.com', port: 465, secure: true },
    { host: 'smtp.gmail.com', port: 587, secure: false },
  ]
  let lastError: unknown

  for (const attempt of attempts) {
    const transporter = nodemailer.createTransport({
      host: attempt.host,
      port: attempt.port,
      secure: attempt.secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
    try {
      await transporter.sendMail({ ...mail, from: user })
      return
    } catch (error) {
      lastError = error
      const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : ''
      if (code !== 'EAUTH') throw error
    }
  }

  throw lastError
}

export function mailFailureStatus(error: unknown) {
  if (error instanceof Error && error.message === 'MAIL_NOT_CONFIGURED') return 503
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : ''
  return code === 'EAUTH' ? 502 : 500
}
