import { describe, expect, it } from 'vitest'
import { presentShop } from '../data/catalogPresentation.js'
import { dataSource } from '../data/mockApi.js'

describe('presentation and data modes', () => {
  it('adds only generic category presentation to a real shop', () => {
    const shop = presentShop({ id: '3', name: 'ساعت‌سازی نمونه', categories: [{ slug: 'watch-jewelry', name: 'ساعت و زیورآلات' }], services: [] })

    expect(shop.categoryIcon).toBe('⌚')
    expect(shop.serviceNames).toEqual([])
    expect(shop.distanceKm).toBeNull()
    expect(shop.googleRating).toBeNull()
    expect(shop.minPriceToman).toBeNull()
  })

  it('selects mock data only when it is explicitly requested', () => {
    expect(dataSource('mock').isDemo).toBe(true)
    expect(dataSource('api').isDemo).toBe(false)
    expect(() => dataSource('unknown')).toThrow('VITE_DATA_MODE')
  })
})
