const DEFAULT_API_BASE = '/api/v1'

export class ApiClientError extends Error {
  constructor({ status = 0, code, message, fields = {} }) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function normalizeApiBase(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return DEFAULT_API_BASE
  if (raw.startsWith('/')) return `/${raw.replace(/^\/+|\/+$/g, '')}` || DEFAULT_API_BASE
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return DEFAULT_API_BASE
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/u, '')
  } catch {
    return DEFAULT_API_BASE
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, signal, timeoutMs = 15_000, credentialMode = 'public', headers = {} } = options
  if (typeof path !== 'string' || !path.trim()) throw new TypeError('API path is required')
  const base = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
  const url = `${base}/${path.replace(/^\/+/, '')}`
  const controller = new AbortController()
  let timedOut = false
  const abortCaller = () => controller.abort()
  if (signal?.aborted) controller.abort()
  else if (signal) signal.addEventListener('abort', abortCaller, { once: true })
  const timeout = Number.isFinite(timeoutMs) && timeoutMs > 0
    ? setTimeout(() => { timedOut = true; controller.abort() }, timeoutMs)
    : null
  const requestHeaders = { Accept: 'application/json', ...headers }
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      credentials: credentialMode === 'admin' ? 'include' : 'omit',
      headers: requestHeaders,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const payload = await readJson(response)
    if (response.ok) {
      if (!isPlainObject(payload) || !Object.hasOwn(payload, 'data')) throw malformed()
      return payload
    }
    if (!isPlainObject(payload) || !isPlainObject(payload.error) ||
        !ownString(payload.error, 'code') || !ownString(payload.error, 'message')) throw malformed()
    throw new ApiClientError({
      status: response.status,
      code: payload.error.code,
      message: payload.error.message,
      fields: safeFields(payload.error.fields),
    })
  } catch (error) {
    if (error instanceof ApiClientError) throw error
    if (timedOut) throw new ApiClientError({ status: 0, code: 'TIMEOUT', message: 'زمان پاسخ‌گویی سرور تمام شد' })
    if (signal?.aborted || error?.name === 'AbortError') throw new DOMException('Request aborted', 'AbortError')
    throw new ApiClientError({ status: 0, code: 'NETWORK_ERROR', message: 'خطا در ارتباط با سرور' })
  } finally {
    if (timeout) clearTimeout(timeout)
    if (signal) signal.removeEventListener('abort', abortCaller)
  }
}

async function readJson(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!/application\/json/i.test(contentType)) throw malformed()
  try { return JSON.parse(await response.text()) } catch { throw malformed() }
}

function malformed() {
  return new ApiClientError({ status: 0, code: 'MALFORMED_RESPONSE', message: 'پاسخ سرور معتبر نیست' })
}

function ownString(value, key) {
  return Object.hasOwn(value, key) && typeof value[key] === 'string' && value[key].trim() !== ''
}

function safeFields(value) {
  if (!isPlainObject(value)) return {}
  return Object.fromEntries(Object.entries(value).filter(([, message]) => typeof message === 'string'))
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
}
