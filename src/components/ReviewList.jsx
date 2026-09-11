import EmptyState from './EmptyState.jsx'
import ErrorState from './ErrorState.jsx'
import LoadingState from './LoadingState.jsx'
import Pagination from './Pagination.jsx'
import { formatPersianNumber } from '../domain/format.js'

export default function ReviewList({ id, title, resource, summary, onPage }) {
  const reviews = resource.data?.data || []
  return <section className="review-section" aria-labelledby={id}>
    <div className="review-heading"><div><h2 id={id}>{title}</h2><p>{reviewCount(summary, resource.data?.pagination)}</p></div></div>
    {resource.loading ? <LoadingState label="در حال دریافت نظرها…" /> : resource.error ? <ErrorState error={resource.error} onRetry={resource.retry} /> : reviews.length === 0 ? <EmptyState title="نظری ثبت نشده است" description="پس از انتشار، نظرها در این بخش نمایش داده می‌شوند." /> : <ul className="review-list">{reviews.map(review => <li key={review.id} className="review-card"><div><strong>{review.authorName || 'کاربر ناشناس'}</strong><span>{typeof review.rating === 'number' ? `${formatPersianNumber(review.rating)} از ۵` : 'امتیاز ثبت نشده'}</span></div>{review.comment ? <p>{review.comment}</p> : <p>متن نظر ثبت نشده است.</p>}</li>)}</ul>}
    <Pagination pagination={resource.data?.pagination} onPage={onPage} ariaLabel={`صفحه‌بندی ${title}`} />
  </section>
}

function reviewCount(summary, pagination) {
  const value = typeof summary?.reviewCount === 'number' ? summary.reviewCount : pagination?.total
  return typeof value === 'number' ? `${formatPersianNumber(value)} نظر` : 'تعداد نظر ثبت نشده'
}
