import { NextRequest } from 'next/server'
import { adminError, adminOk, parseId, prismaCode, requireAdmin } from '@/lib/admin-http'
import { isSubmissionStatus, SUBMISSION_NEXT } from '@/lib/admin-labels'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã yêu cầu không hợp lệ.')
  const row = await auth.db.customerSubmission.findUnique({ where: { id } })
  if (!row) return adminError(404, 'Không tìm thấy yêu cầu.')
  const status = isSubmissionStatus(row.status) ? row.status : 'NEW'
  return adminOk({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    nextStatuses: SUBMISSION_NEXT[status],
  })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  const id = parseId(params.id)
  if (!id) return adminError(400, 'Mã yêu cầu không hợp lệ.')
  const body = await request.json().catch(() => null)
  const status = String(body?.status || '')
  if (!isSubmissionStatus(status)) return adminError(400, 'Trạng thái không hợp lệ.')
  try {
    const current = await auth.db.customerSubmission.findUnique({ where: { id }, select: { status: true } })
    if (!current) return adminError(404, 'Không tìm thấy yêu cầu.')
    const currentStatus = isSubmissionStatus(current.status) ? current.status : 'NEW'
    if (currentStatus !== status && !SUBMISSION_NEXT[currentStatus].includes(status)) {
      return adminError(409, 'Chỉ chuyển từ mới sang đã liên hệ hoặc hủy, rồi sang đã xong.')
    }
    const row = await auth.db.customerSubmission.update({ where: { id }, data: { status }, select: { id: true, status: true } })
    const next = isSubmissionStatus(row.status) ? SUBMISSION_NEXT[row.status] : []
    return adminOk({ ...row, nextStatuses: next }, 'Đã cập nhật yêu cầu.')
  } catch (error) {
    if (prismaCode(error) === 'P2025') return adminError(404, 'Không tìm thấy yêu cầu.')
    console.error('Admin inquiry update failed', error instanceof Error ? error.name : 'error')
    return adminError(500, 'Không cập nhật được yêu cầu.')
  }
}
