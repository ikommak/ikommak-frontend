import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { presentShop } from '../data/catalogPresentation.js'

const number = value => new Intl.NumberFormat('fa-IR').format(value)

export default function ShopCard({ shop, favorite, onToggleFavorite }) {
  const item = presentShop(shop)
  return <article className="shop-card"><div className="shop-card-heading"><span className="shop-avatar">{item.initials}</span><div><Link to={`/shops/${item.id}`}><h2>{item.name}</h2></Link><p>{item.district?.name || 'منطقه ثبت نشده'}</p></div><button aria-label={favorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'} className="favorite-button" onClick={() => onToggleFavorite(item.id)}>{favorite ? '★' : '☆'}</button></div><p>{item.address || 'نشانی ثبت نشده'}</p><p>{item.googleRating === null ? 'امتیاز گوگل ثبت نشده' : <><Icon name="star" size={14} filled /> {number(item.googleRating)} ({number(item.googleReviewCount || 0)} نظر گوگل)</>}</p><div className="service-tags">{item.serviceNames.length ? item.serviceNames.map(name => <span key={name}>{name}</span>) : <span>{item.categoryNote || 'خدمت ثبت نشده'}</span>}</div><div className="shop-card-actions">{item.phone ? <a className="btn btn-outline" href={`tel:${item.phone}`}>تماس</a> : <span title="شماره تماس ثبت نشده"><button className="btn btn-outline" disabled>تماس</button></span>}{item.location.googleMapsUrl ? <a className="btn btn-outline" href={item.location.googleMapsUrl} target="_blank" rel="noreferrer">نقشه</a> : <span title="موقعیت ثبت نشده"><button className="btn btn-outline" disabled>نقشه</button></span>}<Link className="btn btn-primary" to={`/shops/${item.id}`}>جزئیات</Link></div></article>
}
