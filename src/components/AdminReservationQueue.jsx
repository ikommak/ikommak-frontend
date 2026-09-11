import { useEffect, useState } from 'react'
import EmptyState from './EmptyState.jsx'
import ErrorState from './ErrorState.jsx'
import LoadingState from './LoadingState.jsx'
import Pagination from './Pagination.jsx'
import { useApiResource } from '../hooks/useApiResource.js'
import { persianErrorMessage } from '../domain/errors.js'

const statusLabels = { pending: 'در انتظار تماس', contacted: 'تماس انجام شده', confirmed: 'تأیید شده', completed: 'تکمیل شده', cancelled: 'لغو شده' }
const actions = {
  pending: [['contacted', 'تماس انجام شد'], ['cancelled', 'لغو درخواست']],
  contacted: [['confirmed', 'تأیید رزرو'], ['cancelled', 'لغو درخواست']],
  confirmed: [['completed', 'تکمیل درخواست'], ['cancelled', 'لغو درخواست']],
  completed: [], cancelled: [],
}

export default function AdminReservationQueue({ source, onUnauthorized }) {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [removed, setRemoved] = useState([])
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState({})
  const resource = useApiResource(signal => source.listAdminReservations({ status, page, limit: 20 }, signal), [status, page])
  useEffect(() => { setRemoved([]) }, [status, page, resource.data])
  const rows = (resource.data?.data || []).filter(item => !removed.includes(item.id))

  const transition = async (reservation, nextStatus) => {
    if (nextStatus === 'cancelled' && !window.confirm('این درخواست لغو شود؟')) return
    setBusy(reservation.id); setError('')
    try {
      await source.updateReservation(reservation.id, { status: nextStatus, ...(notes[reservation.id]?.trim() ? { adminNote: notes[reservation.id].trim() } : {}) })
      setRemoved(previous => [...previous, reservation.id])
    } catch (requestError) {
      if (!onUnauthorized(requestError)) setError(persianErrorMessage(requestError, 'به‌روزرسانی درخواست ممکن نشد.'))
    } finally { setBusy(null) }
  }

  return <section className="admin-panel" aria-labelledby="reservation-queue-title"><div className="admin-panel-heading"><div><h2 id="reservation-queue-title">درخواست‌های رزرو</h2><p>رزروها درخواست هستند و وضعیت آن‌ها باید پس از تماس ثبت شود.</p></div><label>وضعیت درخواست<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>{error ? <p role="alert" className="form-error">{error}</p> : null}{resource.loading ? <LoadingState /> : resource.error ? <ErrorState error={resource.error} onRetry={resource.retry} /> : rows.length === 0 ? <EmptyState title="درخواستی در این وضعیت نیست" /> : <div className="admin-list">{rows.map(reservation => <article className="admin-card" key={reservation.id}><div className="admin-card-title"><strong dir="ltr">{reservation.reference}</strong><span>{statusLabels[reservation.status]}</span></div><p>{reservation.problemDescription}</p><p><strong>{reservation.customer.name}</strong> · <a dir="ltr" href={`tel:${reservation.customer.phone}`}>{reservation.customer.phoneDisplay || reservation.customer.phone}</a></p><small>تعمیرگاه: {reservation.shop.name}</small>{actions[reservation.status]?.length ? <><label>یادداشت مدیر (اختیاری)<input value={notes[reservation.id] || ''} onChange={event => setNotes(previous => ({ ...previous, [reservation.id]: event.target.value }))} /></label><div className="admin-actions">{actions[reservation.status].map(([next, label]) => <button key={next} className={next === 'cancelled' ? 'btn btn-danger' : 'btn btn-primary'} disabled={busy === reservation.id} onClick={() => transition(reservation, next)}>{label}</button>)}</div></> : null}</article>)}</div>}<Pagination pagination={resource.data?.pagination} onPage={setPage} /></section>
}
