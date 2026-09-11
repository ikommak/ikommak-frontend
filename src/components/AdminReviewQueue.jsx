import { useEffect, useState } from 'react'
import EmptyState from './EmptyState.jsx'
import ErrorState from './ErrorState.jsx'
import LoadingState from './LoadingState.jsx'
import Pagination from './Pagination.jsx'
import { useApiResource } from '../hooks/useApiResource.js'
import { persianErrorMessage } from '../domain/errors.js'

export default function AdminReviewQueue({ source, onUnauthorized }) {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [removed, setRemoved] = useState([])
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState({})
  const resource = useApiResource(signal => source.listAdminReviews({ status, page, limit: 20 }, signal), [status, page])
  useEffect(() => { setRemoved([]) }, [status, page, resource.data])
  const rows = (resource.data?.data || []).filter(review => !removed.includes(review.id))

  const moderate = async (review, action) => {
    if (action === 'reject' && !window.confirm('این نظر رد شود؟')) return
    setBusy(review.id); setError('')
    try {
      await source.moderateReview(review.id, { action, ...(notes[review.id]?.trim() ? { note: notes[review.id].trim() } : {}) })
      setRemoved(previous => [...previous, review.id])
    } catch (requestError) {
      if (!onUnauthorized(requestError)) setError(persianErrorMessage(requestError, 'به‌روزرسانی نظر ممکن نشد.'))
    } finally { setBusy(null) }
  }

  return <section className="admin-panel" aria-labelledby="review-queue-title"><div className="admin-panel-heading"><div><h2 id="review-queue-title">مدیریت نظرها</h2><p>نظرهای کاربران پیش از انتشار بررسی می‌شوند.</p></div><label>وضعیت نظر<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="pending">در انتظار بررسی</option><option value="approved">تأییدشده</option><option value="rejected">ردشده</option></select></label></div>{error ? <p role="alert" className="form-error">{error}</p> : null}{resource.loading ? <LoadingState /> : resource.error ? <ErrorState error={resource.error} onRetry={resource.retry} /> : rows.length === 0 ? <EmptyState title="نظری در این وضعیت نیست" /> : <div className="admin-list">{rows.map(review => <article className="admin-card" key={review.id}><div className="admin-card-title"><strong>{review.authorName || 'کاربر ناشناس'}</strong><span>{review.rating} از ۵</span></div><p>{review.comment}</p><small>تعمیرگاه: {review.shop.name}</small>{status === 'pending' ? <><label>یادداشت مدیر (اختیاری)<input value={notes[review.id] || ''} onChange={event => setNotes(previous => ({ ...previous, [review.id]: event.target.value }))} /></label><div className="admin-actions"><button className="btn btn-primary" disabled={busy === review.id} onClick={() => moderate(review, 'approve')}>تأیید نظر</button><button className="btn btn-danger" disabled={busy === review.id} onClick={() => moderate(review, 'reject')}>رد نظر</button></div></> : null}</article>)}</div>}<Pagination pagination={resource.data?.pagination} onPage={setPage} /></section>
}
