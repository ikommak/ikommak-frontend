import { useState } from 'react'
import { persianErrorMessage } from '../domain/errors.js'

const initial = { authorName: '', rating: '', comment: '' }

export default function ReviewForm({ shopId, submitReview }) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const change = event => setValues(previous => ({ ...previous, [event.target.name]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    const payload = { authorName: values.authorName.trim(), rating: Number(values.rating), comment: values.comment.trim() }
    const validation = validate(payload)
    if (validation) { setMessage(''); setError(validation); return }
    setSubmitting(true); setError(''); setMessage('')
    try {
      const result = await submitReview(shopId, payload)
      setMessage(result?.message || 'نظر شما پس از بررسی منتشر می‌شود.')
      setValues(initial)
    } catch (requestError) {
      setError(persianErrorMessage(requestError, 'ارسال نظر ممکن نشد. لطفاً دوباره تلاش کنید.'))
    } finally { setSubmitting(false) }
  }

  return <section className="review-form-section" aria-labelledby="review-form-heading"><h2 id="review-form-heading">ثبت نظر</h2><p>نظرها پس از بررسی منتشر می‌شوند.</p><form className="review-form" onSubmit={submit} noValidate><label>نام شما<input name="authorName" value={values.authorName} onChange={change} autoComplete="name" disabled={submitting} /></label><label>امتیاز<select name="rating" value={values.rating} onChange={change} disabled={submitting}><option value="">انتخاب کنید</option>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}</option>)}</select></label><label>نظر شما<textarea name="comment" value={values.comment} onChange={change} rows="5" disabled={submitting} /></label><button className="btn btn-primary" disabled={submitting}>{submitting ? 'در حال ارسال…' : 'ارسال نظر'}</button></form><p className="form-message" aria-live="polite">{message || error}</p></section>
}

function validate({ authorName, rating, comment }) {
  if (authorName.length < 2 || authorName.length > 80) return 'نام باید بین ۲ تا ۸۰ کاراکتر باشد.'
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return 'امتیاز را از ۱ تا ۵ انتخاب کنید.'
  if (comment.length < 10 || comment.length > 2000) return 'نظر باید بین ۱۰ تا ۲۰۰۰ کاراکتر باشد.'
  return ''
}
