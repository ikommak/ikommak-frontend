import { describe, expect, it } from 'vitest'
import {
  toAdminReservation, toAdminReview, toCategory, toCollection, toDistrict,
  toPagination, toReservationReceipt, toReview, toReviewSubmissionAcknowledgement,
  toShopDetail, toShopSummary, toAdminSession, toSingle,
} from '../domain/adapters.js'
import { normalizePersian } from '../domain/format.js'

const category = { id: 4, slug: 'watch', name: 'ساعت' }
const district = { id: 3, name: 'منطقه ۳', city: 'تهران', slug: 'tehran-3' }
const shopDistrict = { id: 3, name: 'منطقه ۳' }
const shop = {
  id: 4, name: ' ساعت‌سازی ایران ', district: shopDistrict, categories: [category],
  services: [{ id: 8, slug: 'battery', name: 'باتری', minPriceToman: '0' }],
  location: { latitude: '35.7', longitude: '51.4', googleMapsUrl: 'https://maps.google.com/?q=1' },
  googleRating: '4.6', googleReviewCount: 0, reservationEnabled: true, createdAt: '2026-01-01T00:00:00.000Z',
}

describe('strict domain adapters', () => {
  it('maps valid catalog DTOs, finite zero values, and derived service minimums', () => {
    expect(toCategory(category)).toEqual({ id: '4', slug: 'watch', name: 'ساعت', iconKey: null, description: null })
    expect(toDistrict(district)).toEqual({ ...district, id: '3' })
    expect(toShopSummary(shop)).toMatchObject({ id: '4', name: 'ساعت سازی ایران', initials: 'سا', googleRating: 4.6, googleReviewCount: 0, minPriceToman: 0 })
  })

  it('always exposes a shop price and uses null when no stored service price exists', () => {
    const adapted = toShopSummary({ ...shop, phone: null, address: null, services: [], location: { googleMapsUrl: 'javascript:alert(1)' }, googleRating: null, googleReviewCount: null })
    expect(adapted).toMatchObject({ phone: null, address: null, googleRating: null, googleReviewCount: null })
    expect(adapted).toHaveProperty('minPriceToman', null)
    expect(adapted.location).toEqual({ latitude: null, longitude: null, googleMapsUrl: null })
  })

  it('rejects missing identity, malformed categories, nonfinite facts, and malformed map locations', () => {
    expect(() => toShopSummary({ ...shop, id: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, categories: [{ id: 1, slug: '', name: 'ساعت' }] })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, googleRating: 'NaN' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, location: 'wrong' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('accepts only positive safe catalog IDs and bounded opaque review IDs', () => {
    expect(toCategory({ ...category, id: '42' }).id).toBe('42')
    expect(toShopSummary({ ...shop, id: 42 }).id).toBe('42')
    expect(toReview({
      id: 'google:place:abc', source: 'google', authorName: null, rating: 4.5,
      comment: null, originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null,
    }).id).toBe('google:place:abc')

    expect(() => toCategory({ ...category, id: {} })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, id: 'abc' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, id: Number.MAX_SAFE_INTEGER + 1 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toReview({ id: {}, source: 'google', rating: 4, authorName: null, comment: null, originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toReview({ id: '0', source: 'google', rating: 4, authorName: null, comment: null, originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('enforces catalog, review, price, count, and coordinate number ranges', () => {
    const bounded = toShopSummary({
      ...shop, googleRating: '0', googleReviewCount: '0',
      services: [{ id: '8', slug: 'battery', name: 'باتری', minPriceToman: '0' }],
      location: { latitude: '-90', longitude: '180', googleMapsUrl: null },
    })
    expect(bounded).toMatchObject({ googleRating: 0, googleReviewCount: 0, minPriceToman: 0, location: { latitude: -90, longitude: 180 } })
    expect(toReview({ id: 'google:zero', source: 'google', authorName: null, rating: '0', comment: null, originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null }).rating).toBe(0)

    expect(() => toShopSummary({ ...shop, googleRating: 5.1 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, googleReviewCount: -1 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, services: [{ ...shop.services[0], minPriceToman: -1 }] })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, location: { latitude: 91, longitude: 0, googleMapsUrl: null } })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, location: { latitude: 0, longitude: -181, googleMapsUrl: null } })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopDetail({ ...shop, googleReviewsSummary: { rating: 6, reviewCount: 1 }, userReviewsSummary: { rating: 1, reviewCount: -1 } })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toReview({ id: 'native:invalid', source: 'user', authorName: null, rating: 1.5, comment: null, originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toReview({ id: 'native:zero', source: 'user', authorName: null, rating: 0, comment: null, originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('requires string identity text, public district metadata, and boolean reservation availability', () => {
    expect(toShopSummary({ ...shop, district: { id: 3, name: 'منطقه ۳' }, reservationEnabled: false }).district).toEqual({ id: '3', name: 'منطقه ۳' })
    expect(toDistrict(district)).toEqual({ id: '3', city: 'تهران', name: 'منطقه ۳', slug: 'tehran-3' })

    expect(() => toDistrict({ ...district, city: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toCategory({ ...category, slug: 'Watch' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toCategory({ ...category, name: {} })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, managerName: {} })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, reservationEnabled: 1 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('accepts only pending public receipts, nested admin DTOs, and credential-free external maps', () => {
    const adminReservation = {
      id: 5, reference: 'IK-ABC123', customer: { name: 'مینا', phone: '0912', phoneDisplay: null },
      shop: { id: 4, name: 'ایران', phone: null, address: null }, preferredAt: '2026-01-01T00:00:00.000Z',
      problemDescription: 'باتری ساعت خراب است', category: null, service: null, status: 'confirmed', adminNote: null,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    }
    expect(toAdminReservation(adminReservation).status).toBe('confirmed')
    expect(toShopSummary({ ...shop, location: { latitude: 35.7, longitude: 51.4, googleMapsUrl: 'https://user:secret@maps.example.test/place' } }).location.googleMapsUrl).toBeNull()

    expect(() => toReservationReceipt({ reference: 'IK-ABC123', status: 'contacted', preferredAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z', shop: { id: 4, name: 'ایران', phone: null, address: null } })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toAdminReservation({ id: 5, reference: 'IK-ABC123', shopId: 4, shopName: 'ایران', customerName: 'مینا', phone: '0912', preferredAt: '2026-01-01T00:00:00.000Z', problemDescription: 'باتری ساعت خراب است', status: 'pending' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('requires the nested current admin-review DTO shape', () => {
    const current = {
      id: 5, source: 'user', authorName: 'مینا', rating: 5, comment: 'خوب بود', originalDate: null,
      relativeTime: null, reviewedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z',
      status: 'pending', adminNote: null, moderatedAt: null, updatedAt: '2026-01-01T00:00:00.000Z',
      shop: { id: 4, name: 'ایران' },
    }
    expect(toAdminReview(current).shop).toEqual({ id: '4', name: 'ایران' })
    expect(() => toAdminReview({ ...current, source: 'google' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toAdminReview({ ...current, shop: undefined, shopId: 4, shopName: 'ایران' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('validates envelopes and pagination rather than accepting DTO lookalikes', () => {
    expect(toPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })).toEqual({ page: 1, limit: 20, total: 0, totalPages: 0 })
    expect(toCollection({ data: [shop], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }, toShopSummary).data[0].id).toBe('4')
    expect(toSingle({ data: shop }, toShopSummary).id).toBe('4')
    expect(() => toPagination({ page: 0, limit: 20, total: 0, totalPages: 0 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toPagination({ page: true, limit: 20, total: 0, totalPages: 0 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toPagination({ page: 1, limit: 20, total: null, totalPages: 0 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toCollection({ data: {}, pagination: {} }, toShopSummary)).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toSingle(shop, toShopSummary)).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('requires both full current catalog-detail review summaries', () => {
    const detail = {
      ...shop, createdAt: '2026-01-01T00:00:00.000Z',
      googleReviewsSummary: { rating: 4.6, reviewCount: 0 },
      userReviewsSummary: { rating: null, reviewCount: 0 },
    }
    expect(toShopDetail(detail)).toMatchObject({
      id: '4', googleReviewsSummary: { rating: 4.6, reviewCount: 0 }, userReviewsSummary: { rating: null, reviewCount: 0 },
    })
    expect(() => toShopDetail({ ...detail, userReviewsSummary: undefined })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('accepts a fractional average for approved native reviews', () => {
    const detail = {
      ...shop,
      googleReviewsSummary: { rating: 4.6, reviewCount: 2 },
      userReviewsSummary: { rating: 4.5, reviewCount: 2 },
    }

    expect(toShopDetail(detail).userReviewsSummary).toEqual({ rating: 4.5, reviewCount: 2 })
  })

  it('adapts reviews, receipt acknowledgements, and admin data without raw aliases', () => {
    expect(toReview({ id: 'provider:abc', source: 'google', authorName: 'مینا', rating: 0, comment: null, reviewedAt: '2026-01-01T00:00:00.000Z' })).toMatchObject({ id: 'provider:abc', rating: 0, comment: null })
    expect(toReviewSubmissionAcknowledgement({ status: 'pending', message: 'پس از بررسی' })).toEqual({ status: 'pending', message: 'پس از بررسی' })
    expect(toReservationReceipt({ reference: 'IK-ABC123', status: 'pending', preferredAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z', shop: { id: 4, name: 'ایران', phone: null, address: null } })).toMatchObject({ reference: 'IK-ABC123', shop: { id: '4', name: 'ایران' } })
    expect(toAdminSession({ authenticated: true, username: 'admin' })).toEqual({ authenticated: true, username: 'admin' })
    expect(toAdminReview({ id: 5, source: 'user', authorName: 'مینا', rating: 5, comment: 'خوب بود', originalDate: null, relativeTime: null, reviewedAt: '2026-01-01T00:00:00.000Z', status: 'pending', adminNote: null, moderatedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', shop: { id: 4, name: 'ایران' } })).toMatchObject({ id: '5', shop: { id: '4' } })
    expect(toAdminReservation({ id: 5, reference: 'IK-ABC123', customer: { name: 'مینا', phone: '0912', phoneDisplay: null }, shop: { id: 4, name: 'ایران', phone: null, address: null }, preferredAt: '2026-01-01T00:00:00.000Z', problemDescription: 'باتری ساعت خراب است', category: null, service: null, status: 'pending', adminNote: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' })).toMatchObject({ id: '5', shop: { id: '4' } })
  })

  it('preserves an unknown Google review rating as null', () => {
    expect(toReview({
      id: 'google:unrated', source: 'google', authorName: null, rating: null,
      comment: null, originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null,
    }).rating).toBeNull()
  })

  it('rejects non-decimal numeric strings and non-string dates', () => {
    expect(() => toShopSummary({ ...shop, googleRating: '  ' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toShopSummary({ ...shop, googleRating: '0x4' })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toReview({ id: 'google:date', source: 'google', authorName: null, rating: 4, comment: null, originalDate: null, relativeTime: null, reviewedAt: 1704067200000, createdAt: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })

  it('rejects critical invalid review, receipt, and admin fields', () => {
    expect(() => toReview({ id: null, rating: 5 })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toReservationReceipt({ reference: '', status: 'pending', preferredAt: null, shop: null })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toAdminSession({ authenticated: true })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
    expect(() => toAdminReview({ id: 1, source: 'user', authorName: 'مینا', rating: 5, comment: 'خوب بود', originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null, status: 'pending', shop: { id: null, name: 'x' } })).toThrow(expect.objectContaining({ code: 'MALFORMED_RESPONSE' }))
  })
})

it('normalizes Persian and Arabic text exactly for search/display comparison', () => {
  expect(normalizePersian('  كتاب\u200c ي  ')).toBe('کتاب ی')
})
