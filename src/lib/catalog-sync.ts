'use client'

const STORAGE_KEY = 'anlac-catalog-updated'
const EVENT_NAME = 'anlac-catalog-updated'

export function markCatalogUpdated() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    /* private mode can block storage; the same-tab event still runs */
  }
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function watchCatalog(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange()
  }
  const onCustom = () => onChange()
  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange()
  }
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) onChange()
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT_NAME, onCustom)
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('pageshow', onPageShow)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT_NAME, onCustom)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('pageshow', onPageShow)
  }
}
