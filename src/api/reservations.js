import { apiRequest } from './client.js'
import { idPart } from './catalog.js'
import { toReservationReceipt } from '../domain/adapters.js'

export async function submitReservation(id, input) {
  return toReservationReceipt((await apiRequest(`/shops/${idPart(id)}/reservations`, { method: 'POST', body: input })).data)
}
