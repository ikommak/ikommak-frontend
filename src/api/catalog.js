import { apiRequest } from './client.js'
import { toCategory, toCollection, toDataArray, toDistrict, toShopDetail, toShopSummary } from '../domain/adapters.js'

export async function listCategories(signal) {
  return toDataArray(await apiRequest('/categories', { signal }), toCategory)
}

export async function listDistricts(signal) {
  return toDataArray(await apiRequest('/districts', { signal }), toDistrict)
}

export async function listShops(params = {}, signal) {
  const query = queryString(params, ['q', 'district', 'category', 'service', 'ids', 'sort', 'page', 'limit'])
  return toCollection(await apiRequest(`/shops${query}`, { signal }), toShopSummary)
}

export async function getShop(id, signal) {
  return toShopDetail((await apiRequest(`/shops/${idPart(id)}`, { signal })).data)
}

export function idPart(value) {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 1) throw new TypeError('Invalid resource id')
    return encodeURIComponent(String(value))
  }
  if (typeof value !== 'string' || !/^[1-9]\d*$/u.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new TypeError('Invalid resource id')
  }
  return encodeURIComponent(value)
}

export function queryString(params, allowed) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError('Invalid query')
  const search = new URLSearchParams()
  for (const key of allowed) {
    const value = params[key]
    if (value === undefined || value === null || value === '') continue
    if (key === 'ids') {
      if (!Array.isArray(value) || value.length === 0 || value.length > 50) throw new TypeError('Invalid ids')
      const ids = [...new Set(value.map(idPart))]
      if (ids.length !== value.length) throw new TypeError('Duplicate ids')
      search.set(key, ids.join(','))
    } else if (key === 'sort') {
      if (!['recommended', 'rating', 'newest', 'name'].includes(value)) throw new TypeError('Invalid sort')
      search.set(key, value)
    } else if (key === 'district' || key === 'page' || key === 'limit') {
      const number = idPart(value)
      if (key === 'limit' && Number(number) > 50) throw new TypeError('Invalid limit')
      search.set(key, number)
    } else if (key === 'category' || key === 'service') {
      if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)) throw new TypeError(`Invalid ${key}`)
      search.set(key, value)
    } else if (key === 'status') {
      if (!['pending', 'approved', 'rejected', 'contacted', 'confirmed', 'completed', 'cancelled'].includes(value)) throw new TypeError('Invalid status')
      search.set(key, value)
    } else if (typeof value === 'string') {
      const text = value.trim()
      if (text) search.set(key, text)
    } else throw new TypeError(`Invalid ${key}`)
  }
  const result = search.toString()
  return result ? `?${result}` : ''
}
