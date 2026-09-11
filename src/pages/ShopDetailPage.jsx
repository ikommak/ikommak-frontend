import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import RatingSummary from '../components/RatingSummary.jsx'
import ReviewForm from '../components/ReviewForm.jsx'
import ReviewList from '../components/ReviewList.jsx'
import ShopContactCard, { getShopMapUrl } from '../components/ShopContactCard.jsx'
import MobileShopActions from '../components/MobileShopActions.jsx'
import { dataSource } from '../data/mockApi.js'
import { useApiResource } from '../hooks/useApiResource.js'
import { useFavorites } from '../hooks/useFavorites.js'

export default function ShopDetailPage() {
  const { id } = useParams()
  const source = dataSource()
  const [googlePage, setGooglePage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const { has, toggle } = useFavorites()
  const shop = useApiResource(signal => source.getShop(id, signal), [id])
  const googleReviews = useApiResource(signal => source.listReviews(id, 'google', googlePage, signal), [id, googlePage])
  const userReviews = useApiResource(signal => source.listReviews(id, 'user', userPage, signal), [id, userPage])

  if (shop.loading) return <DetailShell><LoadingState label="در حال دریافت اطلاعات تعمیرگاه…" /></DetailShell>
  if (shop.error || !shop.data) return <DetailShell><ErrorState error={shop.error || { message: 'این تعمیرگاه پیدا نشد.' }} onRetry={shop.retry} /></DetailShell>

  const detail = shop.data
  const favorite = has(detail.id)
  const mapUrl = getShopMapUrl(detail)
  return <main className="shop-detail-page"><div className="container"><Link className="back-link" to="/shops">بازگشت به فهرست تعمیرکارها</Link><section className="shop-detail-hero"><div><span className="section-kicker">تعمیرگاه</span><h1>جزئیات تعمیرکار</h1><div className="shop-title-row"><p className="shop-name">{detail.name}</p><button type="button" className="favorite-button" aria-label={favorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'} onClick={() => toggle(detail.id)}>{favorite ? '★' : '☆'}</button></div><p>{detail.district?.name || 'منطقه ثبت نشده'}{detail.categories?.length ? ` · ${detail.categories.map(category => category.name).join('، ')}` : ''}</p></div><div className="rating-summaries"><RatingSummary title="امتیاز گوگل" summary={detail.googleReviewsSummary || { rating: detail.googleRating, reviewCount: detail.googleReviewCount }} /><RatingSummary title="امتیاز کاربران" summary={detail.userReviewsSummary} /></div></section><div className="shop-detail-grid"><section className="shop-information"><h2>خدمات و اطلاعات</h2>{detail.services?.length ? <ul className="service-list">{detail.services.map(service => <li key={service.id || service.name}>{service.name}</li>)}</ul> : <p>خدمات این تعمیرگاه هنوز تکمیل نشده است.</p>}<ReviewList id="google-reviews-heading" title="نظرات گوگل" resource={googleReviews} summary={detail.googleReviewsSummary || { reviewCount: detail.googleReviewCount }} onPage={setGooglePage} /><ReviewList id="user-reviews-heading" title="نظرات کاربران آیکمک" resource={userReviews} summary={detail.userReviewsSummary} onPage={setUserPage} /><ReviewForm shopId={id} submitReview={source.submitReview} /></section><ShopContactCard shop={detail} mapUrl={mapUrl} /></div></div><MobileShopActions shop={detail} mapUrl={mapUrl} /></main>
}

function DetailShell({ children }) {
  return <main className="shop-detail-page"><div className="container"><h1 className="visually-hidden">جزئیات تعمیرکار</h1>{children}</div></main>
}
