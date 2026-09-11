import { apiRequest } from './client.js'
import { idPart, queryString } from './catalog.js'
import { toCollection, toReview, toReviewSubmissionAcknowledgement } from '../domain/adapters.js'

export async function listReviews(id, source = 'google', page = undefined, signal) {
  if (!['google', 'user'].includes(source)) throw new TypeError('Invalid review source')
  const query = queryString({ source, page }, ['source', 'page'])
  return toCollection(await apiRequest(`/shops/${idPart(id)}/reviews${query}`, { signal }), toReview)
}

export async function submitReview(id, input) {
  return toReviewSubmissionAcknowledgement((await apiRequest(`/shops/${idPart(id)}/reviews`, { method: 'POST', body: input })).data)
}
