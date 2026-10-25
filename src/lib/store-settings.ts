import { getPrisma } from '../../lib/database'
import { STORE_DEFAULTS, StoreProfile } from './store-defaults'

export async function getStoreSettings(): Promise<StoreProfile> {
  const db = getPrisma()
  if (!db) return STORE_DEFAULTS
  const row = await db.storeSetting.findUnique({ where: { id: 1 } })
  if (!row) return STORE_DEFAULTS
  return {
    storeName: row.storeName,
    phone: row.phone,
    email: row.email,
    address: row.address,
    hoursWeekday: row.hoursWeekday,
    hoursSaturday: row.hoursSaturday,
    hoursSunday: row.hoursSunday,
  }
}
