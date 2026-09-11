import { useRef, useState } from 'react'
import { persianErrorMessage } from '../domain/errors.js'

const initialValues = { customerName: '', phone: '', preferredAt: '', problemDescription: '', categoryId: '', serviceId: '' }

export default function ReservationForm({ shop, submitReservation, onSuccess }) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const idempotencyKey = useRef(createIdempotencyKey())
  const change = event => setValues(previous => ({ ...previous, [event.target.name]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    const payload = toPayload(values, idempotencyKey.current)
    const validationError = validateReservation(payload)
    if (validationError) { setError(validationError); return }
    setSubmitting(true); setError('')
    try {
      const receipt = await submitReservation(shop.id, payload)
      onSuccess(receipt)
    } catch (requestError) {
      setError(persianErrorMessage(requestError, 'ثبت درخواست ممکن نشد. لطفاً دوباره تلاش کنید.'))
    } finally { setSubmitting(false) }
  }

  return <form className="reservation-form" onSubmit={submit} noValidate>
    <label>نام و نام خانوادگی<input name="customerName" value={values.customerName} onChange={change} autoComplete="name" disabled={submitting} /></label>
    <label>شماره تماس<input name="phone" value={values.phone} onChange={change} inputMode="tel" autoComplete="tel" dir="ltr" disabled={submitting} /></label>
    <label>تاریخ و ساعت پیشنهادی<input name="preferredAt" type="datetime-local" value={values.preferredAt} onChange={change} disabled={submitting} /></label>
    {shop.categories?.length ? <label>دسته‌بندی (اختیاری)<select name="categoryId" value={values.categoryId} onChange={change} disabled={submitting}><option value="">انتخاب نشده</option>{shop.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label> : null}
    {shop.services?.length ? <label>خدمت (اختیاری)<select name="serviceId" value={values.serviceId} onChange={change} disabled={submitting}><option value="">انتخاب نشده</option>{shop.services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label> : null}
    <label className="full-field">شرح مشکل<textarea name="problemDescription" value={values.problemDescription} onChange={change} rows="5" disabled={submitting} /></label>
    <p className="reservation-note full-field">این فقط درخواست رزرو است. تعمیرگاه برای هماهنگی و تأیید نهایی با شما تماس می‌گیرد.</p>
    {error ? <p className="form-error full-field" role="alert">{error}</p> : null}
    <button className="btn btn-primary full-field" disabled={submitting}>{submitting ? 'در حال ثبت…' : 'ثبت درخواست رزرو'}</button>
  </form>
}

function toPayload(values, idempotencyKey) {
  return {
    customerName: values.customerName.trim(), phone: values.phone.trim(), preferredAt: values.preferredAt,
    problemDescription: values.problemDescription.trim(),
    ...(values.categoryId ? { categoryId: Number(values.categoryId) } : {}),
    ...(values.serviceId ? { serviceId: Number(values.serviceId) } : {}),
    idempotencyKey,
  }
}

function validateReservation(value) {
  if (value.customerName.length < 2 || value.customerName.length > 80) return 'نام باید بین ۲ تا ۸۰ کاراکتر باشد.'
  const phone = toEnglishDigits(value.phone).replace(/[\s()-]/gu, '')
  if (!/^(?:\+98|0098|98|0)(?:9\d{9}|[1-8]\d{9})$/u.test(phone)) return 'یک شماره موبایل یا تلفن ثابت معتبر ایران وارد کنید.'
  const preferred = new Date(value.preferredAt)
  if (!value.preferredAt || !Number.isFinite(preferred.getTime()) || preferred.getTime() <= Date.now()) return 'یک تاریخ و ساعت آینده انتخاب کنید.'
  if (value.problemDescription.length < 10 || value.problemDescription.length > 2000) return 'شرح مشکل باید بین ۱۰ تا ۲۰۰۰ کاراکتر باشد.'
  return ''
}

function toEnglishDigits(value) {
  return value.replace(/[۰-۹]/gu, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/gu, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
