import { Link, useLocation, useParams } from 'react-router-dom'
import { reservationStorageKey } from './ReservationPage.jsx'

export default function ReservationSuccessPage() {
  const { reference } = useParams()
  const location = useLocation()
  const receipt = location.state?.receipt || readReceipt(reference)
  const matchingReceipt = receipt?.reference === reference ? receipt : null

  return <main className="reservation-page"><div className="container"><section className="reservation-success"><span className="success-mark" aria-hidden="true">✓</span><span className="section-kicker">درخواست ثبت شد</span><h1>ثبت درخواست</h1><p className="reservation-warning">رزرو هنوز قطعی نیست؛ تعمیرگاه برای هماهنگی نهایی با شما تماس می‌گیرد.</p><div className="reference-card"><span>کد پیگیری</span><strong dir="ltr">{reference}</strong></div>{matchingReceipt ? <div className="receipt-summary"><p><strong>تعمیرگاه:</strong> {matchingReceipt.shop.name}</p><p><strong>وضعیت:</strong> در انتظار بررسی</p></div> : <p>این کد را نگه دارید. جزئیات موقت این درخواست در مرورگر موجود نیست.</p>}<div className="success-actions"><Link className="btn btn-primary" to="/shops">مشاهده تعمیرکارها</Link>{matchingReceipt?.shop?.id ? <Link className="btn btn-secondary" to={`/shops/${matchingReceipt.shop.id}`}>بازگشت به تعمیرگاه</Link> : null}</div></section></div></main>
}

function readReceipt(reference) {
  try { return JSON.parse(sessionStorage.getItem(reservationStorageKey(reference)) || 'null') } catch { return null }
}
