import Icon from './Icon.jsx'
import { Link } from 'react-router-dom'

const formatNumber = value => new Intl.NumberFormat('fa-IR').format(value)

export default function RepairCard({ shop }) {
  const rating = shop.googleRating
  const reviewCount = shop.googleReviewCount
  const price = shop.minPriceToman
  const services = shop.serviceNames || []
  return (
    <article className="repair-card">
      <div className="repair-card-top">
        <div className="shop-avatar">{shop.initials}</div>
        <div className="shop-title">
          <div className="shop-name-line">
            <h3>{shop.name}</h3>
          </div>
          <div className="rating-row">
            {rating === null ? <span>امتیاز ثبت نشده</span> : <><span className="rating"><Icon name="star" size={14} filled /> {formatNumber(rating)}</span><span>({formatNumber(reviewCount || 0)} نظر)</span></>}
            {shop.district && <><span className="dot-sep">•</span><span>{shop.district.name}</span></>}
          </div>
        </div>
      </div>

      <div className="service-tags">
        {services.length ? services.map(service => <span key={service}>{service}</span>) : <span>خدمت ثبت‌شده‌ای موجود نیست</span>}
      </div>

      <div className="repair-meta">
        <div className="price-block"><small>شروع قیمت از</small><strong>{price === null ? 'ثبت نشده' : <>{formatNumber(price)} <b>تومان</b></>}</strong></div>
        <div className="response-block"><Icon name="location" size={16} /><span>{shop.location?.googleMapsUrl ? 'موقعیت ثبت شده' : 'موقعیت ثبت نشده'}</span></div>
      </div>

      <div className="repair-actions">
        {shop.phone ? <a className="btn btn-outline" href={`tel:${shop.phone}`}><Icon name="phone" size={16} /> تماس</a> : <Link className="btn btn-outline" to={`/shops/${shop.id}`}>جزئیات</Link>}
        <Link className="btn btn-primary" to={shop.reservationEnabled ? `/shops/${shop.id}/reserve` : `/shops/${shop.id}`}>{shop.reservationEnabled ? 'درخواست رزرو' : 'مشاهده تعمیرگاه'} <Icon name="arrow" size={16} /></Link>
      </div>
    </article>
  )
}
