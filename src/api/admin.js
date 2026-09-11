import { apiRequest } from './client.js'
import { idPart, queryString } from './catalog.js'
import { toAdminReservation, toAdminReview, toAdminSession, toCollection } from '../domain/adapters.js'

const admin = options => ({ ...options, credentialMode: 'admin' })

export async function getAdminSession(signal) {
  return toAdminSession((await apiRequest('/admin/session', admin({ signal }))).data)
}
export async function loginAdmin(credentials) {
  return toAdminSession((await apiRequest('/admin/login', admin({ method: 'POST', body: credentials }))).data)
}
export async function logoutAdmin() {
  return toAdminSession((await apiRequest('/admin/logout', admin({ method: 'POST' }))).data)
}
export async function listAdminReviews(params = {}, signal) {
  validateStatus(params.status, ['pending', 'approved', 'rejected'])
  const query = queryString(params, ['status', 'page', 'limit'])
  return toCollection(await apiRequest(`/admin/reviews${query}`, admin({ signal })), toAdminReview)
}
export async function moderateReview(id, input) {
  return toAdminReview((await apiRequest(`/admin/reviews/${idPart(id)}`, admin({ method: 'PATCH', body: input }))).data)
}
export async function listAdminReservations(params = {}, signal) {
  validateStatus(params.status, ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'])
  const query = queryString(params, ['status', 'page', 'limit'])
  return toCollection(await apiRequest(`/admin/reservations${query}`, admin({ signal })), toAdminReservation)
}
export async function updateReservation(id, input) {
  return toAdminReservation((await apiRequest(`/admin/reservations/${idPart(id)}`, admin({ method: 'PATCH', body: input }))).data)
}

function validateStatus(status, allowed) {
  if (status !== undefined && !allowed.includes(status)) throw new TypeError('Invalid status')
}
