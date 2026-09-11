import { useOutletContext } from 'react-router-dom'
import AdminReservationQueue from '../components/AdminReservationQueue.jsx'
import AdminReviewQueue from '../components/AdminReviewQueue.jsx'

export default function AdminDashboardPage() {
  const { source, onUnauthorized } = useOutletContext()
  return <main className="admin-page"><header className="admin-page-heading"><span className="section-kicker">پنل مدیر</span><h1>مدیریت آیکمک</h1><p>صف‌های عملیاتی را بررسی کنید و هر تغییر را پس از انجام واقعی آن ثبت کنید.</p></header><div className="admin-grid"><AdminReviewQueue source={source} onUnauthorized={onUnauthorized} /><AdminReservationQueue source={source} onUnauthorized={onUnauthorized} /></div></main>
}
