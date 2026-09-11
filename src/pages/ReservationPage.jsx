import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ReservationForm from '../components/ReservationForm.jsx'
import { dataSource } from '../data/mockApi.js'
import { useApiResource } from '../hooks/useApiResource.js'

export const reservationStorageKey = reference => `ikommak.reservation.${reference}`

export default function ReservationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const source = dataSource()
  const shop = useApiResource(signal => source.getShop(id, signal), [id])

  const complete = receipt => {
    try { sessionStorage.setItem(reservationStorageKey(receipt.reference), JSON.stringify(receipt)) } catch { /* Navigation state still carries the receipt. */ }
    navigate(`/reservations/${encodeURIComponent(receipt.reference)}/success`, { state: { receipt } })
  }

  return <main className="reservation-page"><div className="container"><Link className="back-link" to={`/shops/${id}`}>بازگشت به تعمیرگاه</Link><header className="form-page-heading"><span className="section-kicker">هماهنگی با تعمیرگاه</span><h1>درخواست رزرو</h1><p>زمان پیشنهادی خود را ثبت کنید؛ تأیید نهایی پس از تماس تعمیرگاه انجام می‌شود.</p></header>{shop.loading ? <LoadingState label="در حال دریافت اطلاعات تعمیرگاه…" /> : shop.error || !shop.data ? <ErrorState error={shop.error || { message: 'این تعمیرگاه پیدا نشد.' }} onRetry={shop.retry} /> : !shop.data.reservationEnabled ? <section className="resource-state resource-empty"><h2>رزرو برای این تعمیرگاه فعال نیست</h2><p>برای هماهنگی از اطلاعات تماس تعمیرگاه استفاده کنید.</p></section> : <section className="form-card"><h2>{shop.data.name}</h2><p>{shop.data.address || shop.data.district?.name || 'نشانی ثبت نشده است'}</p><ReservationForm shop={shop.data} submitReservation={source.submitReservation} onSuccess={complete} /></section>}</div></main>
}
