'use client'

import { useEffect, useState } from 'react'
import highlights from '../../data/home-highlights.json'
import { formatPriceVND } from '@/services/api'
import { watchCatalog } from '@/lib/catalog-sync'

type LiveCategory = {
  name: string
  image: string | null
}

type LiveProduct = {
  name: string
  image: string
  description: string
  priceVND: number
}

export type HomeCatalog = {
  status: 'loading' | 'ready' | 'fallback'
  categorySlugs: Set<string>
  productIds: Set<number>
  categories: Map<string, LiveCategory>
  products: Map<number, LiveProduct>
}

const featuredIds = highlights.featured.map((product) => product.id).join(',')

const emptyCatalog = (): HomeCatalog => ({
  status: 'loading',
  categorySlugs: new Set(),
  productIds: new Set(),
  categories: new Map(),
  products: new Map(),
})

let request: Promise<HomeCatalog> | null = null

function loadCatalog(): Promise<HomeCatalog> {
  if (request) return request
  const current = Promise.all([
    fetch('/api/categories', { cache: 'no-store' }).then((response) => response.json()),
    fetch(`/api/products?ids=${featuredIds}&limit=48`, { cache: 'no-store' }).then((response) => response.json()),
  ]).then(([categories, products]) => {
    const categoryRows = categories?.success ? categories.data : null
    const productRows = products?.success ? products.data?.products : null
    if (!Array.isArray(categoryRows) || !Array.isArray(productRows)) {
      return { ...emptyCatalog(), status: 'fallback' as const }
    }
    const categoryMap = new Map<string, LiveCategory>()
    categoryRows.forEach((category: { slug?: string; name?: string; image?: string | null }) => {
      if (!category.slug) return
      categoryMap.set(category.slug, {
        name: typeof category.name === 'string' ? category.name : '',
        image: typeof category.image === 'string' ? category.image : null,
      })
    })
    const productMap = new Map<number, LiveProduct>()
    productRows.forEach((product: { id?: number; name?: string; image?: string; description?: string; priceVND?: number }) => {
      if (typeof product.id !== 'number') return
      productMap.set(product.id, {
        name: typeof product.name === 'string' ? product.name : '',
        image: typeof product.image === 'string' ? product.image : '',
        description: typeof product.description === 'string' ? product.description : '',
        priceVND: typeof product.priceVND === 'number' ? product.priceVND : 0,
      })
    })
    return {
      status: 'ready' as const,
      categorySlugs: new Set(categoryMap.keys()),
      productIds: new Set(productMap.keys()),
      categories: categoryMap,
      products: productMap,
    }
  }).catch(() => ({ ...emptyCatalog(), status: 'fallback' as const }))
  request = current
  current.finally(() => {
    if (request === current) request = null
  })
  return current
}

export function useHomeVisibility() {
  const [catalog, setCatalog] = useState<HomeCatalog>(emptyCatalog)

  useEffect(() => {
    let cancelled = false
    const pull = () => {
      loadCatalog().then((next) => {
        if (!cancelled) setCatalog(next)
      })
    }
    pull()
    const stop = watchCatalog(pull)
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  return catalog
}

export function visibleHighlights<T, K>(status: HomeCatalog['status'], allowed: Set<K>, items: T[], key: (item: T) => K) {
  if (status === 'loading') return []
  if (status === 'fallback') return items
  return items.filter((item) => allowed.has(key(item)))
}

export function presentHomeCategories<T extends { slug: string; name: string; image: string }>(catalog: HomeCatalog, items: T[]) {
  return visibleHighlights(catalog.status, catalog.categorySlugs, items, (item) => item.slug).map((item) => {
    const live = catalog.categories.get(item.slug)
    if (!live) return item
    return {
      ...item,
      name: live.name || item.name,
      image: live.image || item.image,
    }
  })
}

export function presentHomeProducts<T extends { id: number; name: string; image: string; description: string; price: string }>(catalog: HomeCatalog, items: T[]) {
  return visibleHighlights(catalog.status, catalog.productIds, items, (item) => item.id).map((item) => {
    const live = catalog.products.get(item.id)
    if (!live) return item
    return {
      ...item,
      name: live.name || item.name,
      image: live.image || item.image,
      description: live.description || item.description,
      price: formatPriceVND(live.priceVND),
    }
  })
}
