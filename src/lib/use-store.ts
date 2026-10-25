'use client'

import { useEffect, useState } from 'react'
import { STORE_DEFAULTS, StoreProfile } from './store-defaults'

export function useStoreInfo() {
  const [info, setInfo] = useState<StoreProfile>(STORE_DEFAULTS)

  useEffect(() => {
    let cancelled = false
    fetch('/api/store')
      .then((response) => response.json())
      .then((body) => {
        if (!cancelled && body?.success && body.data) setInfo(body.data)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  return info
}
