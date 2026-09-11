import { ApiClientError } from '../api/client.js'
import { normalizePersian } from './format.js'

const reviewStatuses = new Set(['pending', 'approved', 'rejected'])
const reservationStatuses = new Set(['pending', 'contacted', 'confirmed', 'completed', 'cancelled'])

export function toCategory(value) {
  assertObject(value)
  return { id: requiredId(value.id), slug: requiredSlug(value.slug), name: requiredText(value.name), iconKey: optionalText(value.iconKey), description: optionalText(value.description) }
}

export function toDistrict(value) {
  assertObject(value)
  return { id: requiredId(value.id), city: requiredText(value.city), name: requiredText(value.name), slug: requiredSlug(value.slug) }
}

export function toShopSummary(value) {
  assertObject(value)
  const name = requiredText(value.name)
  const services = array(value.services).map(toService)
  const prices = services.map(service => service.minPriceToman).filter(price => price !== null)
  return {
    id: requiredId(value.id), name, initials: initials(name), managerName: optionalText(value.managerName),
    phone: optionalText(value.phone), address: optionalText(value.address),
    district: value.district == null ? null : toShopDistrict(value.district), categories: array(value.categories).map(toCategory), services,
    location: toLocation(value.location), googleRating: optionalAggregateRating(value.googleRating),
    googleReviewCount: optionalCount(value.googleReviewCount), reservationEnabled: requiredBoolean(value.reservationEnabled),
    createdAt: optionalIso(value.createdAt), minPriceToman: prices.length ? Math.min(...prices) : null,
  }
}

export function toShopDetail(value) {
  const shop = toShopSummary(value)
  return {
    ...shop,
    googleReviewsSummary: toGoogleReviewSummary(value.googleReviewsSummary),
    userReviewsSummary: toUserReviewSummary(value.userReviewsSummary),
  }
}

export function toReview(value) {
  assertObject(value)
  const source = value.source === 'user' ? 'user' : value.source === 'google' ? 'google' : fail()
  return {
    id: requiredReviewId(value.id), source,
    authorName: optionalText(value.authorName), rating: source === 'user' ? requiredNativeRating(value.rating) : optionalAggregateRating(value.rating), comment: optionalText(value.comment),
    originalDate: optionalText(value.originalDate), relativeTime: optionalText(value.relativeTime),
    reviewedAt: optionalIso(value.reviewedAt), createdAt: optionalIso(value.createdAt),
  }
}

export function toPagination(value) {
  assertObject(value)
  const page = positiveInteger(value.page); const limit = positiveInteger(value.limit)
  const total = nonnegativeInteger(value.total); const totalPages = nonnegativeInteger(value.totalPages)
  return { page, limit, total, totalPages }
}

export function toCollection(value, adapter) {
  assertObject(value)
  if (!Array.isArray(value.data) || typeof adapter !== 'function') fail()
  return { data: value.data.map(adapter), pagination: toPagination(value.pagination) }
}

export function toSingle(value, adapter) {
  assertObject(value)
  if (!Object.hasOwn(value, 'data') || typeof adapter !== 'function') fail()
  return adapter(value.data)
}

export function toDataArray(value, adapter) {
  assertObject(value)
  if (!Array.isArray(value.data) || typeof adapter !== 'function') fail()
  return value.data.map(adapter)
}

export function toReviewSubmissionAcknowledgement(value) {
  assertObject(value)
  if (value.status !== 'pending') fail()
  return { status: 'pending', message: requiredText(value.message) }
}

export function toReservationReceipt(value) {
  assertObject(value); assertObject(value.shop)
  if (value.status !== 'pending') fail()
  return {
    reference: requiredText(value.reference), status: value.status, preferredAt: requiredIso(value.preferredAt), createdAt: optionalIso(value.createdAt),
    shop: { id: requiredId(value.shop.id), name: requiredText(value.shop.name), phone: optionalText(value.shop.phone), address: optionalText(value.shop.address) },
  }
}

export function toAdminSession(value) {
  assertObject(value)
  if (typeof value.authenticated !== 'boolean') fail()
  return { authenticated: value.authenticated, username: value.authenticated ? requiredText(value.username) : null }
}

export function toAdminReview(value) {
  assertObject(value)
  const { shop } = value
  assertObject(shop)
  if (value.source !== 'user' || !reviewStatuses.has(value.status)) fail()
  return {
    ...toReview(value), status: value.status, adminNote: optionalText(value.adminNote),
    moderatedAt: optionalIso(value.moderatedAt), updatedAt: optionalIso(value.updatedAt),
    shop: { id: requiredId(shop.id), name: requiredText(shop.name) },
  }
}

export function toAdminReservation(value) {
  assertObject(value)
  const { shop, customer } = value
  assertObject(shop); assertObject(customer)
  if (!reservationStatuses.has(value.status)) fail()
  return {
    id: requiredId(value.id), reference: requiredText(value.reference), status: value.status, preferredAt: requiredIso(value.preferredAt),
    problemDescription: requiredText(value.problemDescription), adminNote: optionalText(value.adminNote), createdAt: optionalIso(value.createdAt), updatedAt: optionalIso(value.updatedAt),
    customer: { name: requiredText(customer.name), phone: requiredText(customer.phone), phoneDisplay: optionalText(customer.phoneDisplay) },
    shop: { id: requiredId(shop.id), name: requiredText(shop.name), phone: optionalText(shop.phone), address: optionalText(shop.address) },
    category: optionalNamed(value.category), service: optionalNamed(value.service),
  }
}

function toService(value) {
  assertObject(value)
  return { id: requiredId(value.id), slug: requiredSlug(value.slug), name: requiredText(value.name), minPriceToman: optionalNonnegativeSafeInteger(value.minPriceToman) }
}
function toShopDistrict(value) {
  assertObject(value)
  return { id: requiredId(value.id), name: requiredText(value.name) }
}
function toLocation(value) {
  if (value == null) return { latitude: null, longitude: null, googleMapsUrl: null }
  assertObject(value)
  const url = optionalText(value.googleMapsUrl)
  return { latitude: optionalLatitude(value.latitude), longitude: optionalLongitude(value.longitude), googleMapsUrl: validExternalUrl(url) ? url : null }
}
function toGoogleReviewSummary(value) {
  assertObject(value)
  return { rating: optionalAggregateRating(value.rating), reviewCount: optionalCount(value.reviewCount) }
}
function toUserReviewSummary(value) {
  assertObject(value)
  const count = optionalCount(value.reviewCount)
  const nextRating = value.rating == null ? null : requiredNativeAggregateRating(value.rating)
  if ((count === 0 && nextRating !== null) || (count !== null && count > 0 && nextRating === null)) fail()
  return { rating: nextRating, reviewCount: count }
}
function optionalNamed(value) {
  if (value == null) return null
  assertObject(value); return { id: requiredId(value.id), name: requiredText(value.name) }
}
function optionalText(value) {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') fail()
  const text = normalizePersian(value)
  return text || null
}
function requiredText(value) { const text = optionalText(value); return text || fail() }
function requiredSlug(value) {
  const slug = requiredText(value)
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug) ? slug : fail()
}
function requiredId(value) {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value > 0 ? String(value) : fail()
  if (typeof value !== 'string' || !/^[1-9]\d*$/u.test(value)) fail()
  return Number.isSafeInteger(Number(value)) ? value : fail()
}
function requiredReviewId(value) {
  if (typeof value === 'number') return requiredId(value)
  if (typeof value !== 'string' || value.length === 0 || value.length > 255 || value !== value.trim()) fail()
  if (/^[+-]?\d+$/u.test(value)) return requiredId(value)
  return value
}
function optionalNumber(value) {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : fail()
  if (typeof value !== 'string' || !/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u.test(value)) fail()
  const number = Number(value)
  return Number.isFinite(number) ? number : fail()
}
function optionalAggregateRating(value) {
  const number = optionalNumber(value)
  return number === null || (number >= 0 && number <= 5) ? number : fail()
}
function requiredAggregateRating(value) { return optionalAggregateRating(value) ?? fail() }
function requiredNativeRating(value) {
  const number = optionalNumber(value)
  return Number.isInteger(number) && number >= 1 && number <= 5 ? number : fail()
}
function requiredNativeAggregateRating(value) {
  const number = optionalNumber(value)
  return number !== null && number >= 1 && number <= 5 ? number : fail()
}
function optionalCount(value) { return optionalNonnegativeSafeInteger(value) }
function optionalNonnegativeSafeInteger(value) {
  const number = optionalNumber(value)
  return number === null || (Number.isSafeInteger(number) && number >= 0) ? number : fail()
}
function optionalLatitude(value) { return optionalBoundedNumber(value, -90, 90) }
function optionalLongitude(value) { return optionalBoundedNumber(value, -180, 180) }
function optionalBoundedNumber(value, minimum, maximum) {
  const number = optionalNumber(value)
  return number === null || (number >= minimum && number <= maximum) ? number : fail()
}
function requiredBoolean(value) { return typeof value === 'boolean' ? value : fail() }
function positiveInteger(value) {
  const number = optionalNumber(value)
  return Number.isSafeInteger(number) && number > 0 ? number : fail()
}
function nonnegativeInteger(value) {
  const number = optionalNumber(value)
  return Number.isSafeInteger(number) && number >= 0 ? number : fail()
}
function optionalIso(value) {
  if (value == null || value === '') return null
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/u.test(value)) fail()
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : fail()
}
function requiredIso(value) { return optionalIso(value) || fail() }
function array(value) { return value == null ? [] : Array.isArray(value) ? value : fail() }
function initials(name) { return name.replace(/\s+/gu, '').slice(0, 2) }
function validExternalUrl(value) {
  try {
    const url = new URL(value)
    return value !== null && ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
  } catch { return false }
}
function assertObject(value) { if (!value || typeof value !== 'object' || Array.isArray(value)) fail() }
function fail() { throw new ApiClientError({ status: 0, code: 'MALFORMED_RESPONSE', message: 'پاسخ سرور معتبر نیست' }) }
