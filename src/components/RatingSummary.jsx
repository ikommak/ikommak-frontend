import { formatPersianNumber } from '../domain/format.js'

export default function RatingSummary({ title, summary }) {
  const rating = summary?.rating
  const count = summary?.reviewCount
  return <div className="rating-summary">
    <strong>{title}</strong>
    <span>{typeof rating === 'number' ? `${formatPersianNumber(rating)} از ۵` : 'امتیاز ثبت نشده'}</span>
    <small>{typeof count === 'number' ? `${formatPersianNumber(count)} نظر` : 'تعداد نظر ثبت نشده'}</small>
  </div>
}
