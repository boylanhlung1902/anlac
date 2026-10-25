'use client'

import { useEffect, useState } from 'react'
import highlights from '../../data/home-highlights.json'

type Visibility = {
  status: 'loading' | 'ready' | 'fallback'
  categorySlugs: Set<string>
  productIds: Set<number>
}

const featuredIds = highlights.featured.map((product) => product.id).join(',')

let request: Promise<Visibility> | null = null

function loadVisibility(): Promise<Visibility> {
  if (request) return request
  const current = Promise.all([
    fetch('/api/categories', { cache: 'no-store' }).then((response) => response.json()),
    fetch(`/api/products?ids=${featuredIds}&limit=48`, { cache: 'no-store' }).then((response) => response.json()),
  ]).then(([categories, products]) => {
    const categoryRows = categories?.success ? categories.data : null
    const productRows = products?.success ? products.data?.products : null
    if (!Array.isArray(categoryRows) || !Array.isArray(productRows)) {
      return { status: 'fallback' as const, categorySlugs: new Set<string>(), productIds: new Set<number>() }
    }
    return {
      status: 'ready' as const,
      categorySlugs: new Set(categoryRows.map((category: { slug?: string }) => category.slug).filter((slug): slug is string => Boolean(slug))),
      productIds: new Set(productRows.map((product: { id?: number }) => product.id).filter((id): id is number => typeof id === 'number')),
    }
  }).catch(() => ({ status: 'fallback' as const, categorySlugs: new Set<string>(), productIds: new Set<number>() }))
  request = current
  current.finally(() => {
    if (request === current) request = null
  })
  return current
}

export function useHomeVisibility() {
  const [visibility, setVisibility] = useState<Visibility>({
    status: 'loading',
    categorySlugs: new Set(),
    productIds: new Set(),
  })

  useEffect(() => {
    let cancelled = false
    loadVisibility().then((next) => {
      if (!cancelled) setVisibility(next)
    })
    return () => { cancelled = true }
  }, [])

  return visibility
}

export function visibleHighlights<T, K>(status: Visibility['status'], allowed: Set<K>, items: T[], key: (item: T) => K) {
  if (status === 'loading') return []
  if (status === 'fallback') return items
  return items.filter((item) => allowed.has(key(item)))
}
