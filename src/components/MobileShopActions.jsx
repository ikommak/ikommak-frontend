import { Link } from 'react-router-dom'

export default function MobileShopActions({ shop, mapUrl }) {
  return <div className="mobile-shop-actions" role="group" aria-label="راه‌های ارتباط سریع">
    {shop.phone ? <a className="btn btn-primary" href={`tel:${shop.phone}`}>تماس</a> : <button className="btn btn-primary" type="button" disabled>تماس</button>}
    {mapUrl ? <a className="btn btn-secondary" href={mapUrl} target="_blank" rel="noreferrer">نقشه</a> : <button className="btn btn-secondary" type="button" disabled>نقشه</button>}
    {shop.reservationEnabled ? <Link className="btn btn-secondary" to={`/shops/${shop.id}/reserve`}>درخواست رزرو</Link> : null}
  </div>
}
