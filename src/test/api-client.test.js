import { describe, expect, it, vi } from 'vitest'
import { jsonResponse, textResponse } from './helpers.jsx'
import { ApiClientError, apiRequest } from '../api/client.js'
import { idPart, listCategories, listDistricts, listShops } from '../api/catalog.js'
import * as catalogApi from '../api/catalog.js'
import { submitReview } from '../api/reviews.js'
import { getAdminSession, listAdminReviews, loginAdmin } from '../api/admin.js'

describe('apiRequest', () => {
  it('uses the normalized configured base, JSON headers, and public credentials', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/api/v1/')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('shops', { credentialMode: 'public' })

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/v1/shops', expect.objectContaining({
      credentials: 'omit', headers: { Accept: 'application/json' },
    }))
  })

  it('serializes JSON only for an explicit body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/shops/9/reviews', { method: 'POST', body: { rating: 5 }, credentialMode: 'public' })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/shops/9/reviews', expect.objectContaining({
      body: '{"rating":5}', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }))
  })

  it('keeps a caller abort as AbortError', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('stopped', 'AbortError')))

    await expect(apiRequest('/shops', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('passes an already-aborted caller signal through to fetch', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', vi.fn((_, options) => options.signal.aborted
      ? Promise.reject(new DOMException('stopped', 'AbortError'))
      : Promise.resolve(jsonResponse({ data: { wrong: true } }))))

    await expect(apiRequest('/shops', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('reports internal timeouts without leaking fetch details', async () => {
    vi.stubGlobal('fetch', vi.fn((_, options) => new Promise((_, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('timed out', 'AbortError')))
    })))

    await expect(apiRequest('/shops', { timeoutMs: 1 })).rejects.toMatchObject({ code: 'TIMEOUT', status: 0 })
  })

  it('maps fetch failures to a safe network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('secret network detail')))

    await expect(apiRequest('/shops')).rejects.toMatchObject({ code: 'NETWORK_ERROR', message: 'خطا در ارتباط با سرور' })
  })

  it('rejects malformed success, error JSON, and error envelopes', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(textResponse('<html>bad</html>'))
      .mockResolvedValueOnce(textResponse('not-json', 500))
      .mockResolvedValueOnce(jsonResponse({ nope: true }, 422)))

    await expect(apiRequest('/one')).rejects.toMatchObject({ code: 'MALFORMED_RESPONSE' })
    await expect(apiRequest('/two')).rejects.toMatchObject({ code: 'MALFORMED_RESPONSE' })
    await expect(apiRequest('/three')).rejects.toMatchObject({ code: 'MALFORMED_RESPONSE' })
  })

  it('preserves backend status/code/message and safe own-string field messages', async () => {
    const inherited = { unsafe: 'nope' }
    const fields = Object.create(inherited)
    fields.phone = 'شماره نامعتبر است'
    fields.count = 4
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      error: { code: 'VALIDATION_ERROR', message: 'نامعتبر', fields },
    }, 422)))

    await expect(apiRequest('/shops')).rejects.toEqual(expect.objectContaining({
      status: 422, code: 'VALIDATION_ERROR', message: 'نامعتبر', fields: { phone: 'شماره نامعتبر است' },
    }))
  })
})

describe('feature API modules', () => {
  it('exposes public review reads only from the strict review feature module', () => {
    expect(catalogApi).not.toHaveProperty('listReviews')
  })

  it('encodes only canonical positive safe resource IDs', () => {
    expect(idPart(42)).toBe('42')
    expect(idPart('42')).toBe('42')
    for (const value of [0, -1, '01', ' 1', Number.MAX_SAFE_INTEGER + 1, {}]) {
      expect(() => idPart(value)).toThrow('Invalid resource id')
    }
  })

  it('encodes only approved public list parameters and omits credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }))
    vi.stubGlobal('fetch', fetchMock)

    await listShops({ q: 'ی ساعت ', district: 3, category: 'watch', ids: [2, '9'], sort: 'rating', page: 2, limit: 20, ignored: 'x' })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/shops?q=%DB%8C+%D8%B3%D8%A7%D8%B9%D8%AA&district=3&category=watch&ids=2%2C9&sort=rating&page=2&limit=20')
    expect(fetchMock.mock.calls[0][1].credentials).toBe('omit')
  })

  it('sends public writes with omitted credentials and exact bodies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { status: 'pending', message: 'ثبت شد' } }, 202))
    vi.stubGlobal('fetch', fetchMock)

    await submitReview('7', { authorName: 'ندا', rating: 5, comment: 'کار خوب و دقیق بود.' })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/shops/7/reviews', expect.objectContaining({ credentials: 'omit', method: 'POST', body: '{"authorName":"ندا","rating":5,"comment":"کار خوب و دقیق بود."}' }))
  })

  it('uses included credentials only for admin requests', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ data: { authenticated: false } }))
      .mockResolvedValueOnce(jsonResponse({ data: { authenticated: true, username: 'admin' } }))
    vi.stubGlobal('fetch', fetchMock)

    await getAdminSession()
    await loginAdmin({ username: 'admin', password: 'secret' })

    expect(fetchMock.mock.calls.map(call => call[1].credentials)).toEqual(['include', 'include'])
  })

  it('rejects invalid approved query fields before sending a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(listShops({ category: '../watch' })).rejects.toThrow('Invalid category')
    await expect(listShops({ limit: 51 })).rejects.toThrow('Invalid limit')
    await expect(listAdminReviews({ status: 'all' })).rejects.toThrow('Invalid status')
    await expect(listAdminReviews({ status: 'contacted' })).rejects.toThrow('Invalid status')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('turns malformed catalog collection envelopes into a stable adapter error', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse({ data: {} }))
      .mockResolvedValueOnce(jsonResponse({ data: {} })))

    await expect(listCategories()).rejects.toMatchObject({ code: 'MALFORMED_RESPONSE' })
    await expect(listDistricts()).rejects.toMatchObject({ code: 'MALFORMED_RESPONSE' })
  })
})
