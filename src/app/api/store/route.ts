import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/store-settings'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json(
      { success: true, data: settings },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Store settings read failed', error instanceof Error ? error.name : 'error')
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: 'Không tải được thông tin cửa hàng.' },
      { status: 500 }
    )
  }
}
