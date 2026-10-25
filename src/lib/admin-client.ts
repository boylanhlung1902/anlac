export type AdminResult<T> = {
  ok: true
  data: T
  message?: string
} | {
  ok: false
  status: number
  message: string
}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<AdminResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'same-origin',
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body?.success === false) {
    return {
      ok: false,
      status: response.status,
      message: typeof body?.message === 'string' ? body.message : 'Không thực hiện được.',
    }
  }
  return { ok: true, data: body.data as T, message: body.message }
}

export type PageInfo = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
